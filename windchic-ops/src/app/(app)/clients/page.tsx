import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Empty, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export default async function Clients() {
  await requireSession();
  const list = await db.client.findMany({ orderBy: { name: "asc" }, include: { missions: { select: { status: true } } } });
  return (
    <>
      <PageHeader kicker="CRM" title="Clients" actions={<Link href="/clients/new" className="btn-primary">+ Client</Link>} />
      {list.length === 0 ? <Empty>Aucun client.</Empty> : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => (
            <Link key={c.id} href={`/clients/${c.id}`} className="card block p-5 transition hover:ring-1 hover:ring-gold">
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-muted">{[c.city, c.country].filter(Boolean).join(", ") || "—"} · source {c.source?.toLowerCase() ?? "?"}</div>
              <div className="mt-3 text-sm">{c.missions.length} mission(s) · {c.missions.filter((m) => ["TERMINEE", "EN_COURS", "VALIDEE", "CLOTURE"].includes(m.status)).length} gagnée(s)</div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
