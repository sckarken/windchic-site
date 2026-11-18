import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { d } from "@/lib/format";
import { PageHeader, StatusChip } from "@/components/ui";
import { ClientForm } from "@/components/client-form";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const c = await db.client.findUnique({ where: { id: (await params).id }, include: { missions: { orderBy: { createdAt: "desc" } } } });
  if (!c) notFound();
  return (
    <>
      <PageHeader kicker="Client" title={c.name} actions={<Link href="/missions/new" className="btn-primary">+ Nouvelle demande</Link>} />
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3"><ClientForm c={c} /></div>
        <div className="card h-fit p-5 xl:col-span-2">
          <h3 className="mb-3 font-semibold">Missions</h3>
          <ul className="divide-y divide-black/5">{c.missions.map((m) => <li key={m.id} className="flex items-center justify-between gap-2 py-2.5 text-sm"><Link href={`/missions/${m.id}`} className="hover:underline">{m.code} · {m.title}</Link><span className="flex items-center gap-2 text-xs text-muted">{d(m.startDate)}<StatusChip status={m.status} /></span></li>)}</ul>
        </div>
      </div>
    </>
  );
}
