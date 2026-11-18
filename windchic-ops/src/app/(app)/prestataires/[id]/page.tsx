import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { can, requireSession } from "@/lib/auth";
import { QUOTE_STATUSES, label } from "@/lib/constants";
import { d, eur } from "@/lib/format";
import { PageHeader, Pill, Empty } from "@/components/ui";
import { SupplierForm } from "@/components/supplier-form";

export default async function SupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  const sup = await db.supplier.findUnique({ where: { id: (await params).id }, include: { quotes: { include: { lot: { include: { mission: true } } }, orderBy: { requestedAt: "desc" } } } });
  if (!sup) notFound();
  const money = can(s, "costs:view");
  return (
    <>
      <PageHeader kicker={sup.code} title={can(s, "suppliers:identity") ? sup.name : sup.code} />
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">{can(s, "suppliers:identity") ? <SupplierForm s={sup} /> : <Empty>Identité réservée à l'équipe opérations.</Empty>}</div>
        <div className="card h-fit p-5 xl:col-span-2">
          <h3 className="mb-3 font-semibold">Historique des devis & tarifs négociés</h3>
          {sup.quotes.length === 0 ? <Empty>Pas encore consulté.</Empty> : (
            <ul className="divide-y divide-black/5">
              {sup.quotes.map((q) => (
                <li key={q.id} className="py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2"><Link href={`/missions/${q.lot.mission.id}?tab=chiffrage`} className="font-medium hover:underline">{q.lot.mission.code} · {q.lot.title}</Link>{money && <span className="tabular-nums">{eur(q.amountHT)}</span>}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted"><Pill k={q.status}>{label(QUOTE_STATUSES, q.status)}</Pill>{d(q.requestedAt)}{q.notes && ` · ${q.notes}`}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
