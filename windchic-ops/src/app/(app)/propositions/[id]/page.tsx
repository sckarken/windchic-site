import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { PrintButton } from "@/components/print-button";

const T = {
  fr: { title: "Proposition", for: "Pour", date: "Date", lot: "Poste", qty: "Qté", option: "Option", price: "Prix HT", inc: "Inclus", avail: "Disponibilité", cancel: "Annulation", reco: "Recommandée", total: "Total HT (options recommandées)", fees: "Honoraires WINDCHIC (recherche, négociation, coordination)", prov: "Provision pour achats tiers (rapprochée et justifiée, trop-perçu restitué)", terms: "Conditions : 50 % à la signature, solde au plus tard 30 jours avant l'événement. Aucun prestataire n'est réservé avant l'acompte. Les prestataires sont identifiés à la commande. Offre valable 15 jours.", ver: "Version" },
  en: { title: "Proposal", for: "For", date: "Date", lot: "Item", qty: "Qty", option: "Option", price: "Price excl. VAT", inc: "Included", avail: "Availability", cancel: "Cancellation", reco: "Recommended", total: "Total excl. VAT (recommended options)", fees: "WINDCHIC fees (sourcing, negotiation, coordination)", prov: "Third-party purchase provision (reconciled, any surplus refunded)", terms: "Terms: 50% on signature, balance no later than 30 days before the event. No supplier is booked before the deposit. Suppliers are disclosed at order. Offer valid 15 days.", ver: "Version" },
  zh: { title: "报价方案", for: "客户", date: "日期", lot: "项目", qty: "数量", option: "方案", price: "不含税价格", inc: "包含内容", avail: "档期", cancel: "取消条款", reco: "推荐", total: "合计（推荐方案，不含税）", fees: "WINDCHIC 服务费（寻源、谈判、协调）", prov: "第三方采购预付款（据实结算，多余部分退还）", terms: "付款条件：签约时支付50%，活动前30天内付清余款。收到定金前不预订任何供应商。下单时披露供应商信息。报价有效期15天。", ver: "版本" },
};
type Snap = { model: string; fee: number | null; lots: { title: string; category: string; spec: string | null; quantity: number; options: { option: string; price: number | null; includes: string | null; availability: string | null; cancellation: string | null; recommended: boolean }[] }[]; totals: { clientTotalHT: number; windchicRevenueHT: number; provisionHT: number } };

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const p = await db.proposal.findUnique({ where: { id: (await params).id }, include: { mission: { include: { client: true } } } });
  if (!p) notFound();
  const t = T[(p.lang as keyof typeof T) ?? "fr"] ?? T.fr;
  const snap = JSON.parse(p.snapshot) as Snap;
  const money = (n: number | null) => n == null ? "—" : new Intl.NumberFormat(p.lang === "zh" ? "zh-CN" : p.lang === "en" ? "en-GB" : "fr-FR", { style: "currency", currency: "EUR" }).format(n);
  const m = p.mission;
  return (
    <>
      <div className="no-print mb-4 flex items-center gap-2">
        <Link href={`/missions/${m.id}?tab=proposition`} className="btn-ghost">← Retour mission</Link>
        <PrintButton />
        <span className="text-xs text-muted">Astuce : « Enregistrer en PDF » dans la fenêtre d'impression.</span>
      </div>
      <article className="mx-auto max-w-[860px] bg-white p-10 shadow-xl print:shadow-none">
        <header className="flex items-start justify-between border-b-2 border-gold pb-6">
          <div className="flex items-center gap-3"><Image src="/mark.png" alt="" width={44} height={44} /><div><div className="text-lg font-semibold tracking-[.3em]">WINDCHIC</div><div className="h-serif text-gold">Tailored by nature.</div></div></div>
          <div className="text-right text-sm"><div className="text-2xl font-semibold">{t.title}</div><div className="text-muted">{m.code} · {t.ver} {p.version}</div><div className="text-muted">{t.date} : {new Date(p.createdAt).toLocaleDateString(p.lang === "fr" ? "fr-FR" : p.lang === "zh" ? "zh-CN" : "en-GB")}</div></div>
        </header>
        <section className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div><div className="label">{t.for}</div><div className="font-medium">{m.client?.legalName ?? m.client?.name ?? "—"}</div><div className="text-muted">{m.client?.billingAddress}</div></div>
          <div><div className="label">{m.eventName ?? m.title}</div><div>{[m.city, m.country].filter(Boolean).join(", ")}</div><div className="text-muted">{m.startDate?.toLocaleDateString("fr-FR")}{m.endDate ? ` → ${m.endDate.toLocaleDateString("fr-FR")}` : ""}</div></div>
        </section>
        {snap.lots.map((l, i) => (
          <section key={i} className="mt-8 break-inside-avoid">
            <h2 className="text-base font-semibold">{i + 1}. {l.title} <span className="font-normal text-muted">· {t.qty} {l.quantity}</span></h2>
            {l.spec && <p className="mt-1 whitespace-pre-line text-xs text-muted">{l.spec}</p>}
            <table className="mt-3 w-full text-sm">
              <thead><tr className="border-b border-black/10 text-left text-[11px] uppercase tracking-wider text-muted"><th className="py-1.5">{t.option}</th><th>{t.inc}</th><th>{t.avail}</th><th>{t.cancel}</th><th className="text-right">{t.price}</th></tr></thead>
              <tbody>{l.options.map((o) => (
                <tr key={o.option} className={`border-b border-black/5 ${o.recommended ? "bg-gold/10 font-medium" : ""}`}>
                  <td className="py-2">{o.option}{o.recommended && <span className="ml-2 rounded bg-gold px-1.5 py-0.5 text-[10px] text-navy">{t.reco}</span>}</td>
                  <td className="text-xs">{o.includes ?? "—"}</td><td className="text-xs">{o.availability ?? "—"}</td><td className="text-xs">{o.cancellation ?? "—"}</td>
                  <td className="text-right tabular-nums">{money(o.price)}</td>
                </tr>))}
              </tbody>
            </table>
          </section>
        ))}
        <section className="mt-10 ml-auto max-w-md space-y-1.5 text-sm">
          {snap.model === "HONORAIRES" ? <>
            <div className="flex justify-between"><span>{t.fees}</span><span className="tabular-nums">{money(snap.totals.windchicRevenueHT)}</span></div>
            <div className="flex justify-between"><span>{t.prov}</span><span className="tabular-nums">{money(snap.totals.provisionHT)}</span></div>
          </> : null}
          <div className="flex justify-between border-t-2 border-navy pt-2 text-base font-semibold"><span>{t.total}</span><span className="tabular-nums">{money(snap.totals.clientTotalHT)}</span></div>
        </section>
        <footer className="mt-10 border-t border-black/10 pt-4 text-[11px] leading-relaxed text-muted">{t.terms}<div className="mt-2">WINDCHIC · windchic.com · WhatsApp +33 7 82 65 40 82 · WeChat Contact-Windchic</div></footer>
      </article>
    </>
  );
}
