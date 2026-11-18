import Link from "next/link";
import { can, requireSession } from "@/lib/auth";
import { missionsWithFinancials } from "@/lib/queries";
import { MISSION_STATUSES, MISSION_TYPES, label } from "@/lib/constants";
import { d, daysUntil, eur, jLabel } from "@/lib/format";
import { ModelBadge, PageHeader, StatusChip, UrgencyDot, Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Missions({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; f?: string; view?: string }> }) {
  const s = await requireSession();
  const sp = await searchParams;
  const where: Record<string, unknown> = {};
  if (sp.status) where.status = sp.status;
  else if (sp.f !== "all") where.status = { notIn: ["TERMINEE", "PERDUE"] };
  if (sp.f === "urgent") where.urgency = { in: ["CRITIQUE", "HAUTE"] };
  if (sp.q) where.OR = [{ title: { contains: sp.q } }, { code: { contains: sp.q } }, { city: { contains: sp.q } }, { eventName: { contains: sp.q } }];
  const ms = await missionsWithFinancials(where);
  const money = can(s, "finance:view");
  const view = sp.view ?? "liste";
  const qs = (o: Record<string, string | undefined>) => "?" + new URLSearchParams(Object.entries({ ...sp, ...o }).filter(([, v]) => v) as [string, string][]).toString();
  return (
    <>
      <PageHeader kicker="Demandes & projets" title="Missions" actions={<Link href="/missions/new" className="btn-primary">+ Nouvelle demande</Link>} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form className="flex-1 min-w-60"><input name="q" defaultValue={sp.q} placeholder="Rechercher : code, titre, ville, salon…" className="input" /></form>
        <div className="flex rounded-xl bg-white p-1 ring-1 ring-black/5">
          {["liste", "kanban"].map((v) => <Link key={v} href={qs({ view: v })} className={`rounded-lg px-3 py-1.5 text-sm capitalize ${view === v ? "bg-navy text-cream" : "text-muted"}`}>{v}</Link>)}
        </div>
      </div>
      <div className="mb-5 flex flex-wrap gap-1.5">
        <Link href="/missions" className={`chip px-3 py-1 ${!sp.status && !sp.f ? "bg-navy text-cream" : "bg-white ring-1 ring-black/10"}`}>Actives</Link>
        {MISSION_STATUSES.map((st) => <Link key={st.key} href={qs({ status: st.key, f: undefined })} className={`chip px-3 py-1 ${sp.status === st.key ? "bg-navy text-cream" : "bg-white ring-1 ring-black/10"}`}>{st.fr}</Link>)}
        <Link href="/missions?f=all" className={`chip px-3 py-1 ${sp.f === "all" ? "bg-navy text-cream" : "bg-white ring-1 ring-black/10"}`}>Toutes</Link>
      </div>

      {ms.length === 0 ? <Empty>Aucune mission. <Link href="/missions/new" className="underline">Créer la première demande</Link>.</Empty> : view === "kanban" ? (
        <div className="grid gap-3 overflow-x-auto pb-4 md:grid-cols-4 xl:grid-cols-8">
          {MISSION_STATUSES.map((col) => (
            <div key={col.key} className="min-w-52 rounded-2xl bg-white/60 p-2 ring-1 ring-black/5">
              <div className="mb-2 px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{col.fr} <span className="text-ink/40">· {ms.filter((m) => m.status === col.key).length}</span></div>
              <div className="space-y-2">
                {ms.filter((m) => m.status === col.key).map((m) => (
                  <Link key={m.id} href={`/missions/${m.id}`} className="card block p-3 text-sm hover:ring-1 hover:ring-gold">
                    <div className="flex items-center gap-1.5"><UrgencyDot urgency={m.urgency} /><span className="font-medium">{m.title}</span></div>
                    <div className="mt-1 text-xs text-muted">{m.code} · {m.client?.name ?? "—"}</div>
                    <div className="mt-2 flex justify-between text-xs"><span>{jLabel(daysUntil(m.startDate))}</span>{money && <span className="tabular-nums">{eur(m.fin.netMargin)}</span>}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-cream/60"><tr><th className="th">Mission</th><th className="th">Type</th><th className="th">Modèle</th><th className="th">Date J</th><th className="th">Statut</th><th className="th">Prochaine action</th>{money && <th className="th text-right">Marge nette</th>}</tr></thead>
            <tbody className="divide-y divide-black/5">
              {ms.map((m) => (
                <tr key={m.id} className="hover:bg-cream/40">
                  <td className="td"><Link href={`/missions/${m.id}`} className="flex items-center gap-2 font-medium hover:underline"><UrgencyDot urgency={m.urgency} />{m.title}</Link><div className="text-xs text-muted">{m.code} · {m.client?.name ?? "Client ?"} · {[m.city, m.country].filter(Boolean).join(", ")}</div></td>
                  <td className="td text-xs">{label(MISSION_TYPES, m.type)}</td>
                  <td className="td"><ModelBadge model={m.billingModel} /></td>
                  <td className="td text-xs">{d(m.startDate)}<div className="text-muted">{jLabel(daysUntil(m.startDate))}</div></td>
                  <td className="td"><StatusChip status={m.status} /></td>
                  <td className="td text-xs">{m.nextAction ?? "—"}</td>
                  {money && <td className="td text-right font-semibold tabular-nums">{eur(m.fin.netMargin)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
