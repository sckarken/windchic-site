import Link from "next/link";
import { d, eur } from "@/lib/format";
import { Empty, Pill } from "@/components/ui";
import { createProposal, setProposalStatus } from "../../../../actions";
import type { TabProps } from "./types";

const LBL: Record<string, string> = { BROUILLON: "Brouillon", ENVOYEE: "Envoyée", ACCEPTEE: "Acceptée", REFUSEE: "Refusée" };

export function Proposals({ m, fin }: TabProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="card p-5 xl:col-span-2">
        <h3 className="mb-3 font-semibold">Versions envoyées au client</h3>
        {m.proposals.length === 0 ? <Empty>Aucune proposition. Générez-la depuis le chiffrage : options A/B/C triées par prix, sans nom de fournisseur.</Empty> : (
          <ul className="divide-y divide-black/5">
            {m.proposals.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="font-mono text-sm">v{p.version}</span>
                <Pill k={p.status}>{LBL[p.status]}</Pill>
                <span className="text-sm tabular-nums">{eur(p.totalHT)} HT</span>
                <span className="text-xs uppercase text-muted">{p.lang}</span>
                <span className="text-xs text-muted">créée {d(p.createdAt)}{p.sentAt && ` · envoyée ${d(p.sentAt)}`}</span>
                <div className="ml-auto flex gap-1.5">
                  <Link href={`/propositions/${p.id}`} className="btn-ghost btn-sm ring-1 ring-black/10">Voir / PDF</Link>
                  {["ENVOYEE", "ACCEPTEE", "REFUSEE"].filter((s) => s !== p.status).map((s) => (
                    <form key={s} action={setProposalStatus}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="status" value={s} />
                      <button className={`btn-sm btn ${s === "ACCEPTEE" ? "bg-emerald-600 text-white" : "ring-1 ring-black/10"}`}>{s === "ENVOYEE" ? "Marquer envoyée" : s === "ACCEPTEE" ? "✓ Acceptée" : "Refusée"}</button>
                    </form>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <form action={createProposal} className="card space-y-4 p-5">
        <input type="hidden" name="missionId" value={m.id} />
        <h3 className="font-semibold">Nouvelle version</h3>
        <p className="text-sm text-muted">Le document reprend chaque lot avec ses options conformes (A, B, C…), l'option recommandée et le total. Montant actuel : <b className="text-ink">{eur(fin.clientTotalHT)} HT</b>.</p>
        {fin.lotsWithoutSelection > 0 && <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{fin.lotsWithoutSelection} lot(s) sans option recommandée.</p>}
        <label className="block"><span className="label">Langue</span><select name="lang" className="input"><option value="fr">Français</option><option value="en">English</option><option value="zh">中文</option></select></label>
        <button className="btn-gold w-full justify-center">Générer la proposition</button>
      </form>
    </div>
  );
}
