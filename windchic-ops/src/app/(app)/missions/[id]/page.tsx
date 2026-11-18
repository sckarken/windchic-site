import Link from "next/link";
import { notFound } from "next/navigation";
import { getMission } from "./data";
import { can, requireSession } from "@/lib/auth";
import { computeCash, computeFinancials } from "@/lib/finance";
import { gateReasons } from "@/lib/rules";
import { MISSION_STATUSES, MISSION_TYPES, label } from "@/lib/constants";
import { d, daysUntil, eur, jLabel } from "@/lib/format";
import { ModelBadge, StatusChip, UrgencyDot } from "@/components/ui";
import { setStatus } from "../../../actions";
import { Overview } from "./tabs/overview";
import { Brief } from "./tabs/brief";
import { Pricing } from "./tabs/pricing";
import { Proposals } from "./tabs/proposals";
import { Planning } from "./tabs/planning";
import { Finances } from "./tabs/finances";
import { Compliance } from "./tabs/compliance";
import { Documents } from "./tabs/documents";
import { Journal } from "./tabs/journal";

export const dynamic = "force-dynamic";

const TABS = [
  ["apercu", "Aperçu"], ["brief", "Brief"], ["chiffrage", "Lots & devis"], ["proposition", "Proposition"],
  ["planning", "Planning"], ["finances", "Finances"], ["conformite", "Conformité"], ["documents", "Documents"], ["journal", "Journal"],
] as const;

export default async function MissionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; err?: string }> }) {
  const s = await requireSession();
  const { id } = await params;
  const sp = await searchParams;
  const m = await getMission(id);
  if (!m) notFound();
  const tab = sp.tab ?? "apercu";
  const fin = computeFinancials(m, m.lots, m.ledger);
  const cash = computeCash(m.ledger);
  const j = daysUntil(m.startDate);
  const order = MISSION_STATUSES.map((x) => x.key as string);
  const next = order[order.indexOf(m.status) + 1];
  const nextReasons = next && next !== "PERDUE" ? gateReasons(m, next) : [];
  const ctx = { m, fin, cash, s, canMoney: can(s, "finance:view"), canEditMoney: can(s, "finance:edit"), canIdentity: can(s, "suppliers:identity") };
  const open = m.briefItems.filter((b) => b.status === "A_DEMANDER" || b.status === "A_CLARIFIER").length;
  const blocking = m.checks.filter((c) => c.status === "BLOQUANT").length;
  const lateTasks = m.tasks.filter((t) => t.dueDate && t.dueDate < new Date() && !["FAIT", "SANS_OBJET"].includes(t.status)).length;
  const badge: Record<string, number> = { brief: open, conformite: blocking, planning: lateTasks };

  return (
    <>
      <div className="mb-1 text-xs text-muted"><Link href="/missions" className="hover:underline">Missions</Link> / {m.code}</div>
      <div className="card mb-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted">{m.code}</span><UrgencyDot urgency={m.urgency} />
              <StatusChip status={m.status} /><ModelBadge model={m.billingModel} />
              <span className="chip bg-slate-100 text-slate-600">{label(MISSION_TYPES, m.type)}</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{m.title}</h1>
            <div className="mt-1 text-sm text-muted">
              {m.client ? <Link href={`/clients/${m.client.id}`} className="hover:underline">{m.client.name}</Link> : "Client à préciser"}
              {" · "}{[m.eventName, m.city, m.country].filter(Boolean).join(", ") || "Lieu à préciser"}
              {" · "}{d(m.startDate)}{m.endDate && m.endDate.getTime() !== m.startDate?.getTime() ? ` → ${d(m.endDate)}` : ""}
            </div>
            <div className="mt-1 text-xs text-muted">Relation : {m.relationOwner?.name ?? "—"} · Opérations : {m.opsOwner?.name ?? "—"}</div>
          </div>
          <div className="flex items-stretch gap-3">
            {j != null && <div className={`rounded-xl px-4 py-2 text-center ${j <= 7 && j >= 0 ? "bg-rose-50 text-rose-700" : "bg-cream"}`}><div className="text-[10px] uppercase tracking-wider text-muted">Compte à rebours</div><div className="text-xl font-semibold tabular-nums">{jLabel(j)}</div></div>}
            {ctx.canMoney && <div className="rounded-xl bg-navy px-4 py-2 text-cream"><div className="text-[10px] uppercase tracking-wider text-gold2/70">Marge nette</div><div className="text-xl font-semibold tabular-nums">{eur(fin.netMargin)}</div></div>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/5 pt-4">
          {next && next !== "PERDUE" && (
            <form action={setStatus} className="flex items-center gap-2">
              <input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value={next} /><input type="hidden" name="tab" value={tab} />
              <button className={nextReasons.length ? "btn-ghost ring-1 ring-black/10" : "btn-gold"} title={nextReasons.join("\n")}>
                {nextReasons.length ? "🔒" : "→"} Passer à « {label(MISSION_STATUSES, next)} »
              </button>
            </form>
          )}
          <details className="relative">
            <summary className="btn-ghost btn-sm cursor-pointer list-none">Autre statut ▾</summary>
            <form action={setStatus} className="card absolute z-10 mt-2 w-72 space-y-2 p-3">
              <input type="hidden" name="id" value={m.id} /><input type="hidden" name="tab" value={tab} />
              <select name="status" defaultValue={m.status} className="input">{MISSION_STATUSES.map((x) => <option key={x.key} value={x.key}>{x.fr}</option>)}</select>
              <input name="lostReason" placeholder="Raison si perdue" className="input" />
              {can(s, "margin:validate") && <label className="flex items-center gap-2 text-xs text-muted"><input type="checkbox" name="force" /> Forcer (Direction) — ignore les verrous</label>}
              <button className="btn-primary btn-sm w-full justify-center">Appliquer</button>
            </form>
          </details>
          {nextReasons.length > 0 && <div className="text-xs text-amber-800">🔒 {nextReasons.length} condition(s) : {nextReasons[0]}{nextReasons.length > 1 && " …"}</div>}
          {m.driveFolderUrl && <a href={m.driveFolderUrl} target="_blank" className="btn-ghost btn-sm ml-auto">📁 Dossier Drive ↗</a>}
        </div>
        {sp.err && <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-200">{sp.err}</div>}
      </div>

      <div className="no-print mb-5 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 ring-1 ring-black/5">
        {TABS.filter(([k]) => k !== "finances" || ctx.canMoney).map(([k, l]) => (
          <Link key={k} href={`?tab=${k}`} className={`relative whitespace-nowrap rounded-xl px-3.5 py-2 text-sm transition ${tab === k ? "bg-navy text-cream" : "text-muted hover:bg-cream"}`}>
            {l}{badge[k] ? <span className={`ml-1.5 rounded-full px-1.5 text-[10px] ${k === "conformite" ? "bg-rose-500 text-white" : "bg-gold text-navy"}`}>{badge[k]}</span> : null}
          </Link>
        ))}
      </div>

      {tab === "apercu" && <Overview {...ctx} />}
      {tab === "brief" && <Brief {...ctx} />}
      {tab === "chiffrage" && <Pricing {...ctx} />}
      {tab === "proposition" && <Proposals {...ctx} />}
      {tab === "planning" && <Planning {...ctx} />}
      {tab === "finances" && ctx.canMoney && <Finances {...ctx} />}
      {tab === "conformite" && <Compliance {...ctx} />}
      {tab === "documents" && <Documents {...ctx} />}
      {tab === "journal" && <Journal {...ctx} />}
    </>
  );
}
