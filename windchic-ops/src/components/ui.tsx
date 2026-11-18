import Link from "next/link";
import { BILLING_MODELS, MISSION_STATUSES, label } from "@/lib/constants";

const STATUS_TONE: Record<string, string> = {
  A_QUALIFIER: "bg-slate-100 text-slate-700", CHIFFRAGE: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  DEVIS_ENVOYE: "bg-sky-50 text-sky-800 ring-1 ring-sky-200", VALIDEE: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  EN_COURS: "bg-navy text-gold2", CLOTURE: "bg-violet-50 text-violet-800 ring-1 ring-violet-200",
  TERMINEE: "bg-emerald-600 text-white", PERDUE: "bg-rose-50 text-rose-700 line-through",
};
export function StatusChip({ status }: { status: string }) {
  return <span className={`chip ${STATUS_TONE[status] ?? "bg-slate-100"}`}>{label(MISSION_STATUSES, status)}</span>;
}
export function ModelBadge({ model }: { model: string }) {
  const m = BILLING_MODELS.find((b) => b.key === model);
  return <span title={m?.hint} className="chip bg-gold/15 text-[#7a5a2a]">{m?.short ?? model}</span>;
}
export function UrgencyDot({ urgency }: { urgency: string }) {
  const c = urgency === "CRITIQUE" ? "bg-rose-500 animate-pulse" : urgency === "HAUTE" ? "bg-amber-400" : "bg-emerald-400";
  return <span title={`Urgence ${urgency.toLowerCase()}`} className={`inline-block size-2 rounded-full ${c}`} />;
}
const TONE: Record<string, string> = {
  A_FAIRE: "bg-slate-100 text-slate-700", EN_COURS: "bg-sky-50 text-sky-800", FAIT: "bg-emerald-50 text-emerald-700",
  BLOQUE: "bg-rose-50 text-rose-700", SANS_OBJET: "bg-slate-50 text-slate-400", BLOQUANT: "bg-rose-600 text-white",
  A_VERIFIER: "bg-amber-50 text-amber-800", VALIDE: "bg-emerald-50 text-emerald-700",
  DEMANDE: "bg-slate-100 text-slate-700", RECU: "bg-sky-50 text-sky-800", RETENU: "bg-emerald-600 text-white",
  SANS_REPONSE: "bg-amber-50 text-amber-800", REFUS: "bg-rose-50 text-rose-700",
  BROUILLON: "bg-slate-100 text-slate-700", ENVOYEE: "bg-sky-50 text-sky-800", ACCEPTEE: "bg-emerald-600 text-white", REFUSEE: "bg-rose-50 text-rose-700",
  A_DEMANDER: "bg-slate-100 text-slate-600", A_CLARIFIER: "bg-amber-50 text-amber-800", CONFIRME: "bg-emerald-50 text-emerald-700",
  ACTIF: "bg-emerald-50 text-emerald-700", A_CONTACTER: "bg-slate-100 text-slate-700", A_EVITER: "bg-rose-50 text-rose-700",
};
export function Pill({ k, children }: { k: string; children: React.ReactNode }) {
  return <span className={`chip ${TONE[k] ?? "bg-slate-100 text-slate-700"}`}>{children}</span>;
}
export function Kpi({ label, value, sub, tone = "default", href }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: "default" | "alert" | "gold" | "dark"; href?: string }) {
  const t = tone === "alert" ? "ring-1 ring-rose-200 bg-rose-50/60" : tone === "gold" ? "bg-gradient-to-br from-gold/25 to-gold2/30" : tone === "dark" ? "bg-navy text-cream" : "";
  const inner = (
    <div className={`card p-4 h-full ${t}`}>
      <div className={`text-[11px] font-semibold uppercase tracking-wider ${tone === "dark" ? "text-gold2/80" : "text-muted"}`}>{label}</div>
      <div className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
      {sub && <div className={`mt-1 text-xs ${tone === "dark" ? "text-cream/60" : "text-muted"}`}>{sub}</div>}
    </div>
  );
  return href ? <Link href={href} className="block transition hover:-translate-y-0.5">{inner}</Link> : inner;
}
export function PageHeader({ title, kicker, actions }: { title: React.ReactNode; kicker?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && <div className="text-xs font-semibold uppercase tracking-[.18em] text-gold">{kicker}</div>}
        <h1 className="mt-1 text-[28px] leading-tight font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
  );
}
export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-black/10 p-6 text-center text-sm text-muted">{children}</div>;
}
export function Field({ label: l, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="label">{l}</span>{children}</label>;
}
export function Select({ name, options, defaultValue, className = "" }: { name: string; options: readonly { key: string; fr: string }[]; defaultValue?: string | null; className?: string }) {
  return (
    <select name={name} defaultValue={defaultValue ?? undefined} className={`input ${className}`}>
      {options.map((o) => <option key={o.key} value={o.key}>{o.fr}</option>)}
    </select>
  );
}
