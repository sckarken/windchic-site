import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { TASK_STATUSES } from "@/lib/constants";
import { dShort, isoDate } from "@/lib/format";
import { Empty, PageHeader } from "@/components/ui";
import { addTask, setTaskStatus } from "../../actions";

export const dynamic = "force-dynamic";
export default async function Tasks({ searchParams }: { searchParams: Promise<{ who?: string }> }) {
  const s = await requireSession();
  const sp = await searchParams;
  const users = await db.user.findMany();
  const where: Record<string, unknown> = { status: { in: ["A_FAIRE", "EN_COURS", "BLOQUE"] } };
  if (sp.who !== "all") where.assigneeUserId = sp.who ?? s.uid;
  const tasks = await db.task.findMany({ where, include: { mission: true, assigneeUser: true }, orderBy: { dueDate: "asc" } });
  const today = new Date(new Date().toDateString());
  const week = new Date(today.getTime() + 7 * 86400000);
  const groups = [
    { k: "En retard", f: (t: (typeof tasks)[number]) => !!t.dueDate && t.dueDate < today, tone: "text-rose-600" },
    { k: "Aujourd'hui", f: (t: (typeof tasks)[number]) => !!t.dueDate && t.dueDate.toDateString() === today.toDateString(), tone: "text-gold" },
    { k: "7 prochains jours", f: (t: (typeof tasks)[number]) => !!t.dueDate && t.dueDate > today && t.dueDate <= week && t.dueDate.toDateString() !== today.toDateString(), tone: "" },
    { k: "Plus tard / sans date", f: (t: (typeof tasks)[number]) => !t.dueDate || t.dueDate > week, tone: "text-muted" },
  ];
  return (
    <>
      <PageHeader kicker="Rituel du lundi : retards d'abord, puis la semaine" title="Tâches" />
      <div className="mb-5 flex flex-wrap gap-1.5">
        {users.map((u) => <Link key={u.id} href={`?who=${u.id}`} className={`chip px-3 py-1 ${(sp.who ?? s.uid) === u.id ? "bg-navy text-cream" : "bg-white ring-1 ring-black/10"}`}>{u.name}</Link>)}
        <Link href="?who=all" className={`chip px-3 py-1 ${sp.who === "all" ? "bg-navy text-cream" : "bg-white ring-1 ring-black/10"}`}>Tout le monde</Link>
      </div>
      <form action={addTask} className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <input type="hidden" name="redirect" value="/taches" />
        <label className="min-w-60 flex-1"><span className="label">Tâche interne (hors mission)</span><input name="title" required className="input" placeholder="ex. RDV expert-comptable SASU" /></label>
        <label><span className="label">Échéance</span><input type="date" name="dueDate" defaultValue={isoDate(new Date())} className="input" /></label>
        <label><span className="label">Pour</span><select name="assigneeUserId" defaultValue={s.uid} className="input">{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
        <button className="btn-primary">Ajouter</button>
      </form>
      {tasks.length === 0 ? <Empty>Aucune tâche ouverte.</Empty> : groups.map((g) => {
        const items = tasks.filter(g.f);
        if (!items.length) return null;
        return (
          <section key={g.k} className="mb-6">
            <h2 className={`mb-2 text-sm font-semibold uppercase tracking-wider ${g.tone}`}>{g.k} · {items.length}</h2>
            <div className="card divide-y divide-black/5">
              {items.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center gap-3 p-3">
                  <div className="min-w-0 flex-1"><div className="text-sm font-medium">{t.title}</div>
                    <div className="text-xs text-muted">{t.mission ? <Link href={`/missions/${t.mission.id}?tab=planning`} className="hover:underline">{t.mission.code} · {t.mission.title}</Link> : "Interne"} · {dShort(t.dueDate)} · {t.assigneeUser?.name ?? t.assigneeLabel}</div></div>
                  <form action={setTaskStatus} className="flex gap-1"><input type="hidden" name="id" value={t.id} /><input type="hidden" name="redirect" value={`/taches${sp.who ? `?who=${sp.who}` : ""}`} />
                    {TASK_STATUSES.slice(0, 4).map((st) => <button key={st.key} name="status" value={st.key} className={`rounded-md px-2 py-1 text-[11px] ${t.status === st.key ? "bg-navy text-cream" : "bg-black/[.04] text-muted hover:bg-black/10"}`}>{st.fr}</button>)}
                  </form>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
