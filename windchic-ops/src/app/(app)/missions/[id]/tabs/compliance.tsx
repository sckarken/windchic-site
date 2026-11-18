import { CHECK_STATUSES } from "@/lib/constants";
import { Pill } from "@/components/ui";
import { updateCheck } from "../../../../actions";
import type { TabProps } from "./types";

export function Compliance({ m }: TabProps) {
  return (
    <div className="card overflow-hidden">
      <div className="p-5 pb-3">
        <h3 className="font-semibold">Check-list de conformité</h3>
        <p className="text-xs text-muted">Un point « BLOQUANT » empêche de passer la mission « En cours ». Cette liste ne remplace pas un avis de votre comptable ou d'un juriste.</p>
      </div>
      <div className="divide-y divide-black/5">
        {m.checks.map((c) => (
          <form key={c.id} action={updateCheck} className={`grid items-center gap-3 p-4 md:grid-cols-12 ${c.status === "BLOQUANT" ? "bg-rose-50/60" : ""}`}>
            <input type="hidden" name="id" value={c.id} />
            <div className="md:col-span-4"><div className="text-sm font-medium">{c.label}</div><div className="text-xs text-muted">Pilote : {c.owner ?? "—"}</div></div>
            <div className="md:col-span-2"><Pill k={c.status}>{CHECK_STATUSES.find((s) => s.key === c.status)?.fr}</Pill></div>
            <select name="status" defaultValue={c.status} className="input md:col-span-2">{CHECK_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.fr}</option>)}</select>
            <input name="proofUrl" defaultValue={c.proofUrl ?? ""} placeholder="Preuve (lien)" className="input md:col-span-2" />
            <input name="note" defaultValue={c.note ?? ""} placeholder="Note" className="input md:col-span-1" />
            <button className="btn-ghost btn-sm ring-1 ring-black/10 md:col-span-1">OK</button>
          </form>
        ))}
      </div>
    </div>
  );
}
