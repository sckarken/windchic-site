import Link from "next/link";
import { can, requireSession } from "@/lib/auth";
import { cockpitData } from "@/lib/queries";
import { MISSION_STATUSES } from "@/lib/constants";
import { eur, pct, dShort, daysUntil, jLabel } from "@/lib/format";
import { Kpi, ModelBadge, PageHeader, StatusChip, UrgencyDot, Empty, Pill } from "@/components/ui";
import { setTaskStatus } from "../actions";

export const dynamic = "force-dynamic";

export default async function Cockpit() {
  const s = await requireSession();
  const c = await cockpitData(s.uid);
  const showMoney = can(s, "finance:view");
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const cols = MISSION_STATUSES.filter((x) => ["A_QUALIFIER", "CHIFFRAGE", "DEVIS_ENVOYE", "VALIDEE", "EN_COURS", "CLOTURE"].includes(x.key));
  return (
    <>
      <PageHeader kicker={today} title={<>Bonjour {s.name.split(" ")[0]}, <span className="h-serif text-gold">voici votre journée.</span></>}
        actions={<Link href="/missions/new" className="btn-primary">+ Nouvelle demande</Link>} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Urgences" value={c.urgent.length} sub="critiques, J-3 ou action en retard" tone={c.urgent.length ? "alert" : "default"} href="/missions?f=urgent" />
        <Kpi label="À qualifier" value={c.toQualify} sub="demandes entrantes" href="/missions?status=A_QUALIFIER" />
        <Kpi label="Devis fournisseurs" value={c.pendingQuotes.length} sub="sans réponse > 48 h" tone={c.pendingQuotes.length ? "alert" : "default"} />
        <Kpi label="Missions actives" value={c.active.length} sub={`${c.signedCount} signée(s) au total`} />
        {showMoney ? <>
          <Kpi label="CA signé WINDCHIC" value={eur(c.signedRevenue)} sub={`+ ${eur(c.weightedPipeline)} pipeline pondéré`} tone="gold" />
          <Kpi label="Marge nette signée" value={eur(c.signedNet)} sub={`Conversion devis : ${pct(c.conversion)}`} tone="dark" />
        </> : <>
          <Kpi label="Conversion devis" value={pct(c.conversion)} sub={`${c.signedCount}/${c.sentCount} propositions`} />
          <Kpi label="Tâches 7 jours" value={c.myTasks.length} tone="dark" />
        </>}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Pipeline</h2>
            <Link href="/missions" className="text-xs text-muted hover:text-ink">Tout voir →</Link>
          </div>
          <div className="grid gap-3 overflow-x-auto md:grid-cols-3 2xl:grid-cols-6">
            {cols.map((col) => {
              const items = c.active.filter((m) => m.status === col.key);
              return (
                <div key={col.key} className="min-w-44 rounded-xl bg-cream/70 p-2">
                  <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    <span>{col.fr}</span><span className="rounded-full bg-white px-1.5">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((m) => {
                      const j = daysUntil(m.startDate);
                      return (
                        <Link key={m.id} href={`/missions/${m.id}`} className="block rounded-lg border border-black/5 bg-white p-2.5 text-sm shadow-sm transition hover:border-gold/60">
                          <div className="flex items-center gap-1.5"><UrgencyDot urgency={m.urgency} /><span className="truncate font-medium">{m.title}</span></div>
                          <div className="mt-1 truncate text-xs text-muted">{m.client?.name ?? "Client à préciser"}</div>
                          <div className="mt-2 flex items-center justify-between text-[11px]">
                            <span className={j != null && j <= 7 && j >= 0 ? "font-semibold text-rose-600" : "text-muted"}>{jLabel(j) || "date ?"}</span>
                            {showMoney && <span className="tabular-nums text-ink/70">{eur(m.fin.windchicRevenueHT)}</span>}
                          </div>
                        </Link>
                      );
                    })}
                    {items.length === 0 && <div className="px-1 py-3 text-center text-xs text-muted/70">—</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Mes actions · 7 jours</h2>
            <Link href="/taches" className="text-xs text-muted hover:text-ink">Toutes →</Link>
          </div>
          {c.myTasks.length === 0 ? <Empty>Rien d'urgent. Profitez-en pour prospecter.</Empty> : (
            <ul className="divide-y divide-black/5">
              {c.myTasks.map((t) => {
                const late = t.dueDate && t.dueDate < new Date(new Date().toDateString());
                return (
                  <li key={t.id} className="flex items-start gap-3 py-2.5">
                    <form action={setTaskStatus}>
                      <input type="hidden" name="id" value={t.id} /><input type="hidden" name="status" value="FAIT" /><input type="hidden" name="redirect" value="/" />
                      <button title="Marquer fait" className="mt-0.5 size-4 rounded border border-black/20 hover:border-gold hover:bg-gold/20" />
                    </form>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm leading-snug">{t.title}</div>
                      <div className="mt-0.5 text-xs text-muted">{t.mission ? <Link className="hover:underline" href={`/missions/${t.mission.id}?tab=planning`}>{t.mission.code}</Link> : "Interne"} · <span className={late ? "font-semibold text-rose-600" : ""}>{dShort(t.dueDate)}</span>{t.status === "BLOQUE" && <> · <Pill k="BLOQUE">bloqué</Pill></>}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Urgences & alertes</h2>
          {c.urgent.length === 0 ? <Empty>Aucune urgence.</Empty> : (
            <ul className="space-y-2">
              {c.urgent.map((m) => (
                <li key={m.id}>
                  <Link href={`/missions/${m.id}`} className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/40 p-3 hover:border-rose-300">
                    <UrgencyDot urgency={m.urgency} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{m.code} · {m.title}</div>
                      <div className="truncate text-xs text-muted">{m.nextAction ?? "Prochaine action à définir"} {m.nextActionDate && `(${dShort(m.nextActionDate)})`}</div>
                    </div>
                    <StatusChip status={m.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Fournisseurs à relancer</h2>
          {c.pendingQuotes.length === 0 ? <Empty>Toutes les demandes de devis ont une réponse.</Empty> : (
            <table className="w-full"><tbody className="divide-y divide-black/5">
              {c.pendingQuotes.map((q) => (
                <tr key={q.id}>
                  <td className="td"><Link href={`/prestataires/${q.supplier.id}`} className="font-medium hover:underline">{q.supplier.name}</Link><div className="text-xs text-muted">{q.supplier.email ?? q.supplier.phone}</div></td>
                  <td className="td text-xs"><Link href={`/missions/${q.lot.mission.id}?tab=chiffrage`} className="hover:underline">{q.lot.mission.code}</Link><div className="text-muted">{q.lot.title}</div></td>
                  <td className="td text-right text-xs text-rose-600">demandé {dShort(q.requestedAt)}</td>
                </tr>
              ))}
            </tbody></table>
          )}
        </section>
      </div>

      {showMoney && (
        <section className="card mt-6 overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3"><h2 className="font-semibold">Rentabilité par mission</h2><span className="text-xs text-muted">montants HT · marge nette = brute − partenaire − frais</span></div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-cream/60"><tr><th className="th">Mission</th><th className="th">Modèle</th><th className="th">Statut</th><th className="th text-right">Client paie</th><th className="th text-right">CA WINDCHIC</th><th className="th text-right">Coûts</th><th className="th text-right">Marge nette</th></tr></thead>
            <tbody className="divide-y divide-black/5">
              {c.missions.map((m) => (
                <tr key={m.id} className="hover:bg-cream/40">
                  <td className="td"><Link href={`/missions/${m.id}`} className="font-medium hover:underline">{m.title}</Link><div className="text-xs text-muted">{m.code} · {m.client?.name ?? "—"}</div></td>
                  <td className="td"><ModelBadge model={m.billingModel} /></td>
                  <td className="td"><StatusChip status={m.status} /></td>
                  <td className="td text-right tabular-nums">{eur(m.fin.clientTotalHT)}</td>
                  <td className="td text-right tabular-nums">{eur(m.fin.windchicRevenueHT)}</td>
                  <td className="td text-right tabular-nums text-muted">{eur(m.fin.costHT)}</td>
                  <td className={`td text-right font-semibold tabular-nums ${m.fin.netMargin < 0 ? "text-rose-600" : ""}`}>{eur(m.fin.netMargin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      )}
    </>
  );
}
