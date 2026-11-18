import { db } from "@/lib/db";
import { BILLING_MODELS, MISSION_TYPES, URGENCIES } from "@/lib/constants";
import { eur, isoDate, pct } from "@/lib/format";
import { Field, Select } from "@/components/ui";
import { updateMission } from "../../../../actions";
import type { TabProps } from "./types";

export async function Overview({ m, fin, cash, canMoney }: TabProps) {
  const [clients, users] = await Promise.all([db.client.findMany({ orderBy: { name: "asc" } }), db.user.findMany()]);
  const userOpts = [{ key: "", fr: "—" }, ...users.map((u) => ({ key: u.id, fr: u.name }))];
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <form action={updateMission} className="card space-y-4 p-6 xl:col-span-2">
        <input type="hidden" name="id" value={m.id} /><input type="hidden" name="tab" value="apercu" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Titre" className="sm:col-span-2"><input name="title" defaultValue={m.title} className="input" /></Field>
          <Field label="Urgence"><Select name="urgency" options={URGENCIES} defaultValue={m.urgency} /></Field>
        </div>
        <Field label="La demande en une phrase"><textarea name="summary" rows={2} defaultValue={m.summary ?? ""} className="input" /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Client"><select name="clientId" defaultValue={m.clientId ?? ""} className="input"><option value="">—</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Type"><Select name="type" options={MISSION_TYPES} defaultValue={m.type} /></Field>
          <Field label="Modèle de facturation"><Select name="billingModel" options={BILLING_MODELS} defaultValue={m.billingModel} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Salon / événement" className="sm:col-span-2"><input name="eventName" defaultValue={m.eventName ?? ""} className="input" /></Field>
          <Field label="Ville"><input name="city" defaultValue={m.city ?? ""} className="input" /></Field>
          <Field label="Pays"><input name="country" defaultValue={m.country ?? ""} className="input" /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date J"><input type="date" name="startDate" defaultValue={isoDate(m.startDate)} className="input" /></Field>
          <Field label="Fin"><input type="date" name="endDate" defaultValue={isoDate(m.endDate)} className="input" /></Field>
          <Field label="Livraison L (sourcing)"><input type="date" name="deliveryDate" defaultValue={isoDate(m.deliveryDate)} className="input" /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Responsable relation"><Select name="relationOwnerId" options={userOpts} defaultValue={m.relationOwnerId ?? ""} /></Field>
          <Field label="Responsable opérations"><Select name="opsOwnerId" options={userOpts} defaultValue={m.opsOwnerId ?? ""} /></Field>
        </div>
        <div className="rounded-xl bg-cream/70 p-4">
          <div className="label mb-3">Paramètres financiers</div>
          <div className="grid gap-4 sm:grid-cols-5">
            <Field label="Budget plafond (interne)"><input name="budgetCeiling" defaultValue={m.budgetCeiling ?? ""} className="input" /></Field>
            <Field label="Honoraires (modèle A)"><input name="feeAmount" defaultValue={m.feeAmount ?? ""} className="input" /></Field>
            <Field label="Coef. sur coût %"><input name="markupPct" defaultValue={Math.round(m.markupRate * 1000) / 10} className="input" /></Field>
            <Field label="Commission apporteur %"><input name="commissionPct" defaultValue={Math.round(m.commissionRate * 1000) / 10} className="input" /></Field>
            <Field label="Part partenaire %"><input name="partnerPct" defaultValue={Math.round(m.partnerRate * 1000) / 10} className="input" /></Field>
          </div>
          <p className="mt-2 text-xs text-muted">Coefficient 25 % sur le coût = taux de marque 20 % (marge / prix de vente). Plancher de verrou : 15 % de taux de marque.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Prochaine action" className="sm:col-span-2"><input name="nextAction" defaultValue={m.nextAction ?? ""} className="input" /></Field>
          <Field label="Pour le"><input type="date" name="nextActionDate" defaultValue={isoDate(m.nextActionDate)} className="input" /></Field>
        </div>
        <Field label="Dossier Drive (URL)"><input name="driveFolderUrl" defaultValue={m.driveFolderUrl ?? ""} className="input" placeholder="https://drive.google.com/drive/folders/…" /></Field>
        <div className="flex justify-end"><button className="btn-primary">Enregistrer</button></div>
      </form>

      <div className="space-y-6">
        {canMoney && (
          <div className="card p-5">
            <div className="label">Économie de la mission</div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row k="Le client paie (HT)" v={eur(fin.clientTotalHT)} strong />
              {fin.model === "HONORAIRES" && <Row k="dont provision frais tiers" v={eur(fin.provisionHT)} />}
              <Row k="CA WINDCHIC" v={eur(fin.windchicRevenueHT)} />
              <Row k="Coûts fournisseurs retenus" v={eur(fin.costHT)} />
              <Row k="Marge brute" v={eur(fin.grossMargin)} />
              {fin.marginRate != null && <Row k="Taux de marque / coef." v={`${pct(fin.marginRate)} · ${pct(fin.markupOnCost)}`} />}
              <Row k="− Part partenaire" v={eur(fin.partnerCommission)} />
              <Row k="− Frais directs" v={eur(fin.directCosts)} />
              <div className="border-t border-black/10 pt-2"><Row k="Marge nette" v={eur(fin.netMargin)} strong /></div>
              {m.budgetCeiling != null && <Row k="Budget plafond client" v={<span className={fin.clientTotalHT > m.budgetCeiling ? "text-rose-600" : "text-emerald-700"}>{eur(m.budgetCeiling)}</span>} />}
            </dl>
            {fin.lotsWithoutSelection > 0 && <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{fin.lotsWithoutSelection} lot(s) sans option retenue : les montants sont partiels.</p>}
          </div>
        )}
        {canMoney && (
          <div className="card p-5">
            <div className="label">Trésorerie de la mission</div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row k="Encaissé" v={eur(cash.in)} /><Row k="Décaissé" v={eur(cash.out)} />
              <Row k="Solde" v={eur(cash.balance)} strong />
              {m.billingModel === "HONORAIRES" && <Row k="Provision à restituer / justifier" v={<span className={cash.provisionToRefund ? "text-amber-700" : ""}>{eur(cash.provisionToRefund, 2)}</span>} />}
            </dl>
          </div>
        )}
        <div className="card p-5 text-sm">
          <div className="label">Règles de la maison</div>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-muted">
            <li>Aucun prestataire contacté tant que le brief n'est pas exploitable.</li>
            <li>Honoraires convenus avant la recherche approfondie.</li>
            <li>Options A/B/C anonymisées pour le client ; identité fournisseur à la commande.</li>
            <li>Aucun engagement fournisseur avant l'acompte.</li>
            <li>100 % encaissé au plus tard J-30.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
function Row({ k, v, strong }: { k: string; v: React.ReactNode; strong?: boolean }) {
  return <div className="flex justify-between gap-3"><dt className="text-muted">{k}</dt><dd className={`tabular-nums ${strong ? "font-semibold" : ""}`}>{v}</dd></div>;
}
