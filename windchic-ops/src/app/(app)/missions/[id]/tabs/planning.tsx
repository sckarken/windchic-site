import { db } from "@/lib/db";
import { TASK_STATUSES } from "@/lib/constants";
import { TASK_STREAMS, DEFAULT_STREAMS_BY_TYPE } from "@/lib/templates";
import { dShort, daysUntil, jLabel } from "@/lib/format";
import { Empty } from "@/components/ui";
import { addTask, generateTasks, setTaskStatus } from "../../../../actions";
import type { TabProps } from "./types";

export async function Planning({ m }: TabProps) {
  const users = await db.user.findMany();
  const defaults = DEFAULT_STREAMS_BY_TYPE[m.type] ?? ["COORDINATION"];
  const today = new Date(new Date().toDateString());
  const total = m.tasks.length, done = m.tasks.filter((t) => t.status === "FAIT" || t.status === "SANS_OBJET").length;
  // Timeline : position relative entre première et dernière échéance
  const dated = m.tasks.filter((t) => t.dueDate);
  const min = dated.length ? Math.min(...dated.map((t) => t.dueDate!.getTime())) : 0;
  const max = dated.length ? Math.max(...dated.map((t) => t.dueDate!.getTime())) : 1;
  const pos = (x: Date) => (max === min ? 50 : ((x.getTime() - min) / (max - min)) * 100);
  return (
    <div className="grid gap-6 xl:grid-cols-4">
      <div className="space-y-5 xl:col-span-3">
        {dated.length > 1 && (
          <div className="card p-5">
            <div className="mb-2 flex justify-between text-xs text-muted"><span>{dShort(new Date(min))}</span><span>Timeline · {done}/{total} faites</span><span>{dShort(new Date(max))}</span></div>
            <div className="relative h-10 rounded-full bg-cream">
              {today.getTime() >= min && today.getTime() <= max && <div className="absolute inset-y-0 w-0.5 bg-rose-500" style={{ left: `${pos(today)}%` }} title="Aujourd'hui" />}
              {m.startDate && m.startDate.getTime() >= min && m.startDate.getTime() <= max && <div className="absolute -top-1 -bottom-1 w-1 rounded bg-gold" style={{ left: `${pos(m.startDate)}%` }} title="Jour J" />}
              {dated.map((t) => <div key={t.id} title={`${t.title} — ${dShort(t.dueDate)}`} className={`absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white ${t.status === "FAIT" ? "bg-emerald-500" : t.dueDate! < today ? "bg-rose-500" : "bg-navy"}`} style={{ left: `${pos(t.dueDate!)}%` }} />)}
            </div>
          </div>
        )}
        <div className="card overflow-hidden">
          {m.tasks.length === 0 ? <div className="p-5"><Empty>Pas encore de tâches. Générez le rétroplanning depuis la date J →</Empty></div> : (
            <table className="w-full">
              <thead className="bg-cream/60"><tr><th className="th">Tâche</th><th className="th">Qui</th><th className="th">Échéance</th><th className="th">Statut</th></tr></thead>
              <tbody className="divide-y divide-black/5">
                {m.tasks.map((t) => {
                  const late = t.dueDate && t.dueDate < today && !["FAIT", "SANS_OBJET"].includes(t.status);
                  return (
                    <tr key={t.id} className={t.status === "FAIT" ? "opacity-50" : ""}>
                      <td className="td"><div className={t.status === "FAIT" ? "line-through" : "font-medium"}>{t.title}</div>
                        <div className="text-xs text-muted">{[t.stream, t.phase, t.deliverable && `→ ${t.deliverable}`].filter(Boolean).join(" · ")}</div>
                        {t.vigilance && <div className="mt-0.5 text-xs text-amber-700">⚠ {t.vigilance}</div>}</td>
                      <td className="td text-xs">{t.assigneeUser?.name ?? t.assigneeSupplier?.name ?? t.assigneeLabel ?? "—"}</td>
                      <td className={`td whitespace-nowrap text-xs ${late ? "font-semibold text-rose-600" : ""}`}>{dShort(t.dueDate)}<div className="text-muted">{jLabel(daysUntil(t.dueDate))}</div></td>
                      <td className="td">
                        <form action={setTaskStatus} className="flex gap-1">
                          <input type="hidden" name="id" value={t.id} />
                          {TASK_STATUSES.map((s) => <button key={s.key} name="status" value={s.key} title={s.fr} className={`rounded-md px-1.5 py-0.5 text-[10px] ${t.status === s.key ? "bg-navy text-cream" : "bg-black/[.04] text-muted hover:bg-black/10"}`}>{s.fr}</button>)}
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <form action={addTask} className="card flex flex-wrap items-end gap-3 p-4">
          <input type="hidden" name="missionId" value={m.id} />
          <label className="min-w-60 flex-1"><span className="label">Nouvelle tâche</span><input name="title" required className="input" /></label>
          <label><span className="label">Échéance</span><input type="date" name="dueDate" className="input" /></label>
          <label><span className="label">Responsable</span><select name="assigneeUserId" className="input">{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
          <button className="btn-primary">Ajouter</button>
        </form>
      </div>
      <form action={generateTasks} className="card h-fit space-y-3 p-5">
        <input type="hidden" name="missionId" value={m.id} />
        <h3 className="font-semibold">Générer le rétroplanning</h3>
        <p className="text-xs text-muted">Modèles issus de « Gestion de projet par offre » : les échéances sont calculées depuis J, Fin ou L. {!m.startDate && <b className="text-rose-600">Renseignez la date J d'abord.</b>}</p>
        {Object.entries(TASK_STREAMS).map(([k, v]) => (
          <label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" name="streams" value={k} defaultChecked={defaults.includes(k)} className="accent-[#c6a16b]" />{v.label} <span className="text-xs text-muted">({v.tasks.length})</span></label>
        ))}
        <button className="btn-gold w-full justify-center">Générer (sans doublons)</button>
      </form>
    </div>
  );
}
