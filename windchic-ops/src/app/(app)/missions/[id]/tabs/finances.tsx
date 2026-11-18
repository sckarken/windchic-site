import { LEDGER_TYPES, label } from "@/lib/constants";
import { d, eur, isoDate } from "@/lib/format";
import { Empty } from "@/components/ui";
import { addLedger, deleteLedger } from "../../../../actions";
import type { TabProps } from "./types";

export function Finances({ m, fin, cash, canEditMoney }: TabProps) {
  const dir = (t: string) => LEDGER_TYPES.find((x) => x.key === t)?.dir;
  let running = 0;
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <div className="grid gap-3 sm:grid-cols-4">
          <Box k="Le client doit (HT)" v={eur(fin.clientTotalHT)} />
          <Box k="Client a versé" v={eur(cash.clientPaid)} sub={fin.clientTotalHT ? `${Math.round((cash.clientPaid / fin.clientTotalHT) * 100)} %` : undefined} />
          <Box k="Fournisseurs payés" v={eur(cash.supplierPaid)} sub={`sur ${eur(fin.costHT)} retenus`} />
          <Box k="Solde de trésorerie" v={eur(cash.balance)} dark />
        </div>
        {m.billingModel === "HONORAIRES" && (
          <div className="card p-5">
            <h3 className="font-semibold">Rapprochement de la provision</h3>
            <p className="mb-3 text-xs text-muted">Les deux flux (honoraires WINDCHIC et avances pour le client) sont suivis séparément. Le trop-perçu est restitué, jamais conservé au titre des débours.</p>
            <div className="grid gap-3 text-sm sm:grid-cols-4">
              <Box k="Provision reçue" v={eur(cash.provisionReceived, 2)} /><Box k="Dépenses réelles" v={eur(cash.supplierPaid, 2)} />
              <Box k="Déjà restitué" v={eur(cash.refunded, 2)} /><Box k="Reste à restituer" v={eur(cash.provisionToRefund, 2)} dark={cash.provisionToRefund !== 0} />
            </div>
          </div>
        )}
        <div className="card overflow-hidden">
          <div className="p-5 pb-2"><h3 className="font-semibold">Journal de trésorerie</h3></div>
          {m.ledger.length === 0 ? <div className="p-5 pt-0"><Empty>Aucun mouvement enregistré.</Empty></div> : (
            <table className="w-full">
              <thead className="bg-cream/60"><tr><th className="th">Date</th><th className="th">Flux</th><th className="th">Contrepartie / réf.</th><th className="th text-right">Entrée</th><th className="th text-right">Sortie</th><th className="th text-right">Solde</th><th className="th" /></tr></thead>
              <tbody className="divide-y divide-black/5">
                {m.ledger.map((l) => {
                  const inn = dir(l.type) === "IN";
                  if (!l.simulated) running += inn ? l.amount : -l.amount;
                  return (
                    <tr key={l.id} className={l.simulated ? "italic text-muted" : ""}>
                      <td className="td text-xs">{d(l.date)}</td>
                      <td className="td">{label(LEDGER_TYPES, l.type)}{l.simulated && " (simulation)"}{l.note && <div className="text-xs text-muted">{l.note}</div>}</td>
                      <td className="td text-xs">{l.counterparty}{l.reference && <div className="text-muted">{l.reference}</div>}{l.docUrl && <a href={l.docUrl} target="_blank" className="text-gold underline">pièce</a>}</td>
                      <td className="td text-right tabular-nums text-emerald-700">{inn ? eur(l.amount, 2) : ""}</td>
                      <td className="td text-right tabular-nums text-rose-700">{!inn ? eur(l.amount, 2) : ""}</td>
                      <td className="td text-right font-medium tabular-nums">{eur(running, 2)}</td>
                      <td className="td">{canEditMoney && <form action={deleteLedger}><input type="hidden" name="id" value={l.id} /><button className="text-xs text-muted hover:text-rose-600">✕</button></form>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {canEditMoney ? (
        <form action={addLedger} className="card h-fit space-y-3 p-5">
          <input type="hidden" name="missionId" value={m.id} />
          <h3 className="font-semibold">Enregistrer un mouvement</h3>
          <label className="block"><span className="label">Type</span><select name="type" className="input">{LEDGER_TYPES.map((t) => <option key={t.key} value={t.key}>{t.dir === "IN" ? "↓" : "↑"} {t.fr}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3">
            <label><span className="label">Montant €</span><input name="amount" required className="input" /></label>
            <label><span className="label">Date</span><input type="date" name="date" defaultValue={isoDate(new Date())} className="input" /></label>
          </div>
          <label className="block"><span className="label">Contrepartie</span><input name="counterparty" className="input" /></label>
          <label className="block"><span className="label">Référence (facture, virement)</span><input name="reference" className="input" /></label>
          <label className="block"><span className="label">Pièce (lien Drive)</span><input name="docUrl" className="input" /></label>
          <label className="block"><span className="label">Note</span><input name="note" className="input" /></label>
          <button className="btn-primary w-full justify-center">Ajouter</button>
        </form>
      ) : <div className="card h-fit p-5 text-sm text-muted">La saisie de trésorerie est réservée à la Direction.</div>}
    </div>
  );
}
function Box({ k, v, sub, dark }: { k: string; v: string; sub?: string; dark?: boolean }) {
  return <div className={`rounded-xl p-3 ${dark ? "bg-navy text-cream" : "bg-white ring-1 ring-black/5"}`}><div className={`text-[10px] font-semibold uppercase tracking-wider ${dark ? "text-gold2/70" : "text-muted"}`}>{k}</div><div className="mt-1 text-lg font-semibold tabular-nums">{v}</div>{sub && <div className="text-[11px] text-muted">{sub}</div>}</div>;
}
