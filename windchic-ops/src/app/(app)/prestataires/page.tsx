import Link from "next/link";
import { db } from "@/lib/db";
import { can, requireSession } from "@/lib/auth";
import { SUPPLIER_CATEGORIES, SUPPLIER_STATUSES, label } from "@/lib/constants";
import { Empty, PageHeader, Pill } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Suppliers({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const s = await requireSession();
  const sp = await searchParams;
  const where: Record<string, unknown> = {};
  if (sp.cat) where.categories = { contains: sp.cat };
  if (sp.q) where.OR = [{ name: { contains: sp.q } }, { city: { contains: sp.q } }, { country: { contains: sp.q } }, { code: { contains: sp.q } }];
  const list = await db.supplier.findMany({ where, orderBy: { name: "asc" }, include: { quotes: { select: { status: true, selected: true, amountHT: true } } } });
  const id = can(s, "suppliers:identity");
  const avg = (x: (number | null)[]) => { const v = x.filter((n): n is number => n != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  return (
    <>
      <PageHeader kicker="SRM · Supplier master (interne)" title="Prestataires" actions={id && <Link href="/prestataires/new" className="btn-primary">+ Prestataire</Link>} />
      <form className="mb-3"><input name="q" defaultValue={sp.q} placeholder="Nom, ville, pays, code…" className="input" /></form>
      <div className="mb-5 flex flex-wrap gap-1.5">
        <Link href="/prestataires" className={`chip px-3 py-1 ${!sp.cat ? "bg-navy text-cream" : "bg-white ring-1 ring-black/10"}`}>Toutes</Link>
        {SUPPLIER_CATEGORIES.map((c) => <Link key={c} href={`?cat=${encodeURIComponent(c)}`} className={`chip px-3 py-1 ${sp.cat === c ? "bg-navy text-cream" : "bg-white ring-1 ring-black/10"}`}>{c}</Link>)}
      </div>
      {list.length === 0 ? <Empty>Aucun prestataire.</Empty> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-cream/60"><tr><th className="th">Prestataire</th><th className="th">Catégories</th><th className="th">Zone</th><th className="th">Score /5</th><th className="th">Taux réponse</th><th className="th">Missions</th><th className="th">Statut</th></tr></thead>
            <tbody className="divide-y divide-black/5">
              {list.map((x) => {
                const sc = avg([x.scoreConformity, x.scoreReactivity, x.scorePrice, x.scoreReliability]);
                const asked = x.quotes.length, answered = x.quotes.filter((q) => q.status !== "DEMANDE" && q.status !== "SANS_REPONSE").length;
                return (
                  <tr key={x.id} className="hover:bg-cream/40">
                    <td className="td"><Link href={`/prestataires/${x.id}`} className="font-medium hover:underline">{id ? x.name : x.code}</Link><div className="font-mono text-[11px] text-muted">{x.code}{x.insuranceVerified && " · assuré ✓"}{x.nonCircumventionSigned && " · NC ✓"}</div></td>
                    <td className="td text-xs">{x.categories.split(",").filter(Boolean).join(" · ")}</td>
                    <td className="td text-xs">{[x.city, x.country].filter(Boolean).join(", ")}</td>
                    <td className="td">{sc != null ? <span className="font-semibold text-gold">{"★".repeat(Math.round(sc))}<span className="text-black/15">{"★".repeat(5 - Math.round(sc))}</span></span> : <span className="text-xs text-muted">non noté</span>}</td>
                    <td className="td text-xs">{asked ? `${Math.round((answered / asked) * 100)} % (${answered}/${asked})` : "—"}</td>
                    <td className="td text-xs">{x.quotes.filter((q) => q.selected).length} retenue(s)</td>
                    <td className="td"><Pill k={x.status}>{label(SUPPLIER_STATUSES, x.status)}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
