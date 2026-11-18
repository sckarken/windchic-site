import { db } from "@/lib/db";
import { QUOTE_STATUSES, SUPPLIER_CATEGORIES, label } from "@/lib/constants";
import { lineSellPrice } from "@/lib/finance";
import { d, eur, pct } from "@/lib/format";
import { Empty, Pill } from "@/components/ui";
import { addLot, deleteLot, requestQuotes, toggleSelect, updateQuote } from "../../../../actions";
import type { TabProps } from "./types";

function rfqMailto(m: TabProps["m"], lot: TabProps["m"]["lots"][number], emails: string[]) {
  const subject = `Demande de devis — ${lot.title} — ${[m.eventName, m.city].filter(Boolean).join(", ")}`;
  const body = [
    "Bonjour,", "",
    `Nous préparons une prestation pour un client et souhaitons recevoir votre meilleure offre pour :`, "",
    `• Objet : ${lot.title} (${lot.category})`, `• Quantité : ${lot.quantity}`,
    `• Lieu : ${[m.eventName, m.city, m.country].filter(Boolean).join(", ") || "à préciser"}`,
    `• Dates : ${d(m.startDate)}${m.endDate ? ` → ${d(m.endDate)}` : ""}`, "",
    "Cahier des charges :", lot.spec ?? "(voir pièce jointe)", "",
    "Merci d'indiquer : prix HT, TVA, ce qui est inclus (livraison, installation, technicien, démontage), disponibilité, conditions d'annulation et durée de validité de l'offre.", "",
    "Bien cordialement,", "WINDCHIC",
  ].join("\n");
  return `mailto:?bcc=${encodeURIComponent(emails.join(","))}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function Pricing({ m, fin, canIdentity, canMoney }: TabProps) {
  const suppliers = await db.supplier.findMany({ where: { status: { not: "A_EVITER" } }, orderBy: { name: "asc" } });
  const score = (s: (typeof suppliers)[number]) => {
    const v = [s.scoreConformity, s.scoreReactivity, s.scorePrice, s.scoreReliability].filter((x): x is number => x != null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  return (
    <div className="grid gap-6 xl:grid-cols-4">
      <div className="space-y-5 xl:col-span-3">
        {m.lots.length === 0 && <Empty>Découpez la demande en lots (un lot = une catégorie de prestataire). Ex. « Hôtel 5 nuits × 3 », « 10 écrans tactiles ».</Empty>}
        {m.lots.map((lot) => {
          const known = new Set(lot.quotes.map((q) => q.supplierId));
          const suggested = suppliers.filter((s) => !known.has(s.id)).sort((a, b) => Number(b.categories.includes(lot.category)) - Number(a.categories.includes(lot.category)) || (score(b) ?? 0) - (score(a) ?? 0));
          const requested = lot.quotes.filter((q) => q.status === "DEMANDE" && q.supplier.email).map((q) => q.supplier.email!);
          const received = lot.quotes.filter((q) => q.amountHT != null);
          const best = received.length ? Math.min(...received.map((q) => q.amountHT!)) : null;
          return (
            <section key={lot.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/5 p-5">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gold">{lot.category}</div>
                  <h3 className="text-lg font-semibold">{lot.title} <span className="text-sm font-normal text-muted">× {lot.quantity}</span></h3>
                  {lot.spec && <p className="mt-1 max-w-3xl whitespace-pre-line text-sm text-muted">{lot.spec}</p>}
                </div>
                <div className="flex gap-2">
                  {requested.length > 0 && <a href={rfqMailto(m, lot, requested)} className="btn-gold btn-sm">✉ Email RFQ ({requested.length})</a>}
                  <form action={deleteLot}><input type="hidden" name="id" value={lot.id} /><button className="btn-ghost btn-sm text-rose-600">Supprimer</button></form>
                </div>
              </div>

              <div className="divide-y divide-black/5">
                {lot.quotes.length === 0 && <div className="p-5 text-sm text-muted">Aucun fournisseur consulté. Objectif : 2 devis minimum (3 à 5 demandes).</div>}
                {[...lot.quotes].sort((a, b) => (a.amountHT ?? Infinity) - (b.amountHT ?? Infinity)).map((q, i) => {
                  const sell = lineSellPrice(q, m.markupRate);
                  const margin = q.amountHT != null ? sell - q.amountHT : null;
                  return (
                    <div key={q.id} className={`p-4 ${q.selected ? "bg-emerald-50/50" : ""}`}>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="grid size-6 place-items-center rounded-md bg-navy text-[11px] font-semibold text-gold2">{"ABCDEFGH"[i]}</span>
                        <span className="font-medium">{canIdentity ? q.supplier.name : q.supplier.code}</span>
                        <span className="font-mono text-[11px] text-muted">{q.supplier.code}</span>
                        <Pill k={q.status}>{label(QUOTE_STATUSES, q.status)}</Pill>
                        {q.amountHT != null && q.amountHT === best && received.length > 1 && <span className="chip bg-gold/20 text-[#7a5a2a]">moins cher</span>}
                        {q.conform === false && <span className="chip bg-rose-50 text-rose-700">non conforme</span>}
                        <span className="text-xs text-muted">demandé {d(q.requestedAt)}</span>
                        <form action={toggleSelect} className="ml-auto"><input type="hidden" name="id" value={q.id} />
                          <button disabled={!q.selected && q.amountHT == null} title={q.amountHT == null ? "Saisir le prix du devis avant de le retenir" : undefined} className={q.selected ? "btn-primary btn-sm" : "btn-ghost btn-sm ring-1 ring-black/10"}>{q.selected ? "✓ Option retenue" : q.amountHT == null ? "Prix à saisir" : "Retenir cette option"}</button>
                        </form>
                      </div>
                      <form action={updateQuote} className="grid gap-2 md:grid-cols-12">
                        <input type="hidden" name="id" value={q.id} />
                        {canMoney && <label className="md:col-span-2"><span className="label">Coût HT €</span><input name="amountHT" defaultValue={q.amountHT ?? ""} className="input" /></label>}
                        {canMoney && <label className="md:col-span-1"><span className="label">TVA €</span><input name="vatAmount" defaultValue={q.vatAmount ?? ""} className="input" /></label>}
                        <label className="md:col-span-3"><span className="label">Inclus / exclu</span><input name="includes" defaultValue={q.includes ?? ""} className="input" /></label>
                        <label className="md:col-span-2"><span className="label">Disponibilité</span><input name="availability" defaultValue={q.availability ?? ""} className="input" /></label>
                        <label className="md:col-span-2"><span className="label">Annulation</span><input name="cancellation" defaultValue={q.cancellation ?? ""} className="input" /></label>
                        <label className="md:col-span-2"><span className="label">Statut</span><select name="status" defaultValue={q.status} className="input">{QUOTE_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.fr}</option>)}</select></label>
                        <label className="md:col-span-2"><span className="label">Conforme ?</span><select name="conform" defaultValue={q.conform == null ? "" : q.conform ? "oui" : "non"} className="input"><option value="">?</option><option value="oui">Oui</option><option value="non">Non</option></select></label>
                        <label className="md:col-span-4"><span className="label">Lien devis (Drive)</span><input name="fileUrl" defaultValue={q.fileUrl ?? ""} className="input" /></label>
                        <label className="md:col-span-4"><span className="label">Observations</span><input name="notes" defaultValue={q.notes ?? ""} className="input" /></label>
                        {canMoney && m.billingModel === "REFACTURATION" && <label className="md:col-span-2"><span className="label">Prix vente forcé</span><input name="sellPriceHT" defaultValue={q.sellPriceHT ?? ""} placeholder={String(sell)} className="input" /></label>}
                        <div className="flex items-end md:col-span-12">
                          {canMoney && q.amountHT != null && m.billingModel === "REFACTURATION" && (
                            <div className="text-xs text-muted">Vente <b className="text-ink">{eur(sell)}</b> · marge <b className={margin! < 0 ? "text-rose-600" : "text-ink"}>{eur(margin)}</b> · taux de marque {pct(sell ? margin! / sell : null)}</div>
                          )}
                          <button className="btn-ghost btn-sm ml-auto ring-1 ring-black/10">Enregistrer</button>
                        </div>
                      </form>
                    </div>
                  );
                })}
              </div>

              <details className="border-t border-black/5 bg-cream/40">
                <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-ink/80">+ Consulter des fournisseurs ({suggested.filter((s) => s.categories.includes(lot.category)).length} suggérés pour « {lot.category} »)</summary>
                <form action={requestQuotes} className="px-5 pb-5">
                  <input type="hidden" name="lotId" value={lot.id} />
                  <div className="grid max-h-72 gap-1.5 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                    {suggested.map((s) => (
                      <label key={s.id} className="flex cursor-pointer items-start gap-2 rounded-lg bg-white p-2 text-sm ring-1 ring-black/5 has-[:checked]:ring-gold">
                        <input type="checkbox" name="supplierIds" value={s.id} defaultChecked={false} className="mt-1 accent-[#c6a16b]" />
                        <span className="min-w-0"><span className="block truncate font-medium">{canIdentity ? s.name : s.code}{s.categories.includes(lot.category) && " ★"}</span>
                          <span className="block truncate text-[11px] text-muted">{[s.city, s.country].filter(Boolean).join(", ")} · {score(s)?.toFixed(1) ?? "non noté"}/5{s.email ? "" : " · pas d'email"}</span></span>
                      </label>
                    ))}
                  </div>
                  <button className="btn-primary btn-sm mt-3">Enregistrer les demandes</button>
                  <span className="ml-3 text-xs text-muted">Puis « Email RFQ » prépare un mail en copie cachée avec le cahier des charges.</span>
                </form>
              </details>
            </section>
          );
        })}

        <form action={addLot} className="card grid gap-3 p-5 md:grid-cols-12">
          <input type="hidden" name="missionId" value={m.id} />
          <div className="label md:col-span-12">Ajouter un lot</div>
          <label className="md:col-span-3"><span className="label">Catégorie</span><select name="category" className="input">{SUPPLIER_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="md:col-span-6"><span className="label">Intitulé</span><input name="title" required placeholder="ex. 10 écrans tactiles 32'' sur kiosque" className="input" /></label>
          <label className="md:col-span-3"><span className="label">Quantité</span><input name="quantity" defaultValue="1" className="input" /></label>
          <label className="md:col-span-12"><span className="label">Cahier des charges (envoyé à l'identique à tous les fournisseurs)</span><textarea name="spec" rows={3} className="input" placeholder="Specs obligatoires, horaires de livraison, installation, normes…" /></label>
          <div className="md:col-span-12"><button className="btn-primary">Ajouter le lot</button></div>
        </form>
      </div>

      {canMoney && (
        <aside>
          <div className="card sticky top-6 space-y-3 p-5 text-sm">
            <div className="label">Chiffrage global</div>
            <div className="flex justify-between"><span className="text-muted">Coût retenu</span><span className="tabular-nums">{eur(fin.costHT)}</span></div>
            <div className="flex justify-between"><span className="text-muted">CA WINDCHIC</span><span className="tabular-nums">{eur(fin.windchicRevenueHT)}</span></div>
            {fin.model === "HONORAIRES" && <div className="flex justify-between"><span className="text-muted">Provision tiers</span><span className="tabular-nums">{eur(fin.provisionHT)}</span></div>}
            <div className="flex justify-between border-t border-black/10 pt-2 font-semibold"><span>Total client HT</span><span className="tabular-nums">{eur(fin.clientTotalHT)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Marge brute</span><span className="tabular-nums">{eur(fin.grossMargin)}</span></div>
            {fin.marginRate != null && <div className={`rounded-lg p-2 text-xs ${fin.marginRate < 0.15 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-800"}`}>Taux de marque {pct(fin.marginRate)} {fin.marginRate < 0.15 ? "— sous le plancher de 15 %" : "— OK"}</div>}
            {m.budgetCeiling != null && <div className={`rounded-lg p-2 text-xs ${fin.clientTotalHT > m.budgetCeiling ? "bg-rose-50 text-rose-700" : "bg-cream"}`}>Budget plafond {eur(m.budgetCeiling)} · {fin.clientTotalHT > m.budgetCeiling ? "dépassé" : `reste ${eur(m.budgetCeiling - fin.clientTotalHT)}`}</div>}
            <a href={`?tab=proposition`} className="btn-gold w-full justify-center">Préparer la proposition →</a>
          </div>
        </aside>
      )}
    </div>
  );
}
