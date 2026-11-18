"use server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { COOKIE, sign } from "@/lib/session";
import { can, requireRight, requireSession } from "@/lib/auth";
import { gateReasons } from "@/lib/rules";
import { computeFinancials } from "@/lib/finance";
import { BRIEF_TEMPLATE, COMPLIANCE_TEMPLATE, DEFAULT_STREAMS_BY_TYPE, TASK_STREAMS, computeDue } from "@/lib/templates";
import { MISSION_STATUSES, label } from "@/lib/constants";

const str = (f: FormData, k: string) => { const v = f.get(k); return typeof v === "string" && v.trim() !== "" ? v.trim() : null; };
const num = (f: FormData, k: string) => { const v = str(f, k); if (v == null) return null; const n = Number(v.replace(/\s/g, "").replace(",", ".")); return Number.isFinite(n) ? n : null; };
const date = (f: FormData, k: string) => { const v = str(f, k); return v ? new Date(v) : null; };
const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";
const back = (missionId: string, tab?: string, err?: string) =>
  `/missions/${missionId}?tab=${tab ?? "apercu"}${err ? `&err=${encodeURIComponent(err)}` : ""}`;

async function log(missionId: string, content: string, kind = "STATUT") {
  const s = await requireSession();
  await db.activity.create({ data: { missionId, content, kind, userId: s.uid } });
}

// ───────── Auth
export async function login(_: unknown, f: FormData) {
  const email = (str(f, "email") ?? "").toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(str(f, "password") ?? "", user.passwordHash))) return { error: "Identifiants incorrects" };
  const token = await sign({ uid: user.id, name: user.name, role: user.role as "ADMIN", exp: Date.now() + 1000 * 3600 * 24 * 14 });
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 3600 * 24 * 14 });
  redirect("/");
}
export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/login");
}

// ───────── Missions
async function nextCode() {
  const year = new Date().getFullYear();
  const count = await db.mission.count({ where: { code: { startsWith: `WC-${year}-` } } });
  return `WC-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function createMission(f: FormData) {
  const s = await requireSession();
  const type = str(f, "type") ?? "EVENEMENT";
  const billingModel = str(f, "billingModel") ?? "REFACTURATION";
  let clientId = str(f, "clientId");
  const newClient = str(f, "newClient");
  if (!clientId && newClient) clientId = (await db.client.create({ data: { name: newClient, source: str(f, "source") } })).id;
  const startDate = date(f, "startDate"), endDate = date(f, "endDate") ?? startDate;
  const m = await db.mission.create({
    data: {
      code: await nextCode(), title: str(f, "title") ?? "Nouvelle demande", summary: str(f, "summary"),
      type, billingModel, urgency: str(f, "urgency") ?? "NORMALE",
      eventName: str(f, "eventName"), city: str(f, "city"), country: str(f, "country"),
      startDate, endDate, budgetCeiling: num(f, "budgetCeiling"), clientId,
      relationOwnerId: str(f, "relationOwnerId"), opsOwnerId: str(f, "opsOwnerId") ?? s.uid,
      nextAction: "Compléter le brief", nextActionDate: new Date(Date.now() + 86400000),
      briefItems: { create: BRIEF_TEMPLATE.map((b, i) => ({ ...b, order: i + 1 })) },
      checks: { create: COMPLIANCE_TEMPLATE
        .filter((c) => (!c.models || c.models.includes(billingModel)) && (!c.types || c.types.includes(type)))
        .map((c, i) => ({ label: c.label, owner: c.owner, order: i, status: c.blocking ? "BLOQUANT" : "A_FAIRE" })) },
    },
  });
  const firstSummary = str(f, "summary");
  if (firstSummary) await db.briefItem.updateMany({ where: { missionId: m.id, order: 1 }, data: { answer: firstSummary, status: "A_CLARIFIER", source: "Demande initiale" } });
  await log(m.id, "Mission créée");
  redirect(`/missions/${m.id}?tab=brief`);
}

export async function updateMission(f: FormData) {
  await requireSession();
  const id = str(f, "id")!;
  await db.mission.update({ where: { id }, data: {
    title: str(f, "title") ?? undefined, summary: str(f, "summary"), type: str(f, "type") ?? undefined,
    billingModel: str(f, "billingModel") ?? undefined, urgency: str(f, "urgency") ?? undefined,
    eventName: str(f, "eventName"), city: str(f, "city"), country: str(f, "country"),
    startDate: date(f, "startDate"), endDate: date(f, "endDate"), deliveryDate: date(f, "deliveryDate"),
    budgetCeiling: num(f, "budgetCeiling"), feeAmount: num(f, "feeAmount"),
    markupRate: (num(f, "markupPct") ?? 25) / 100, commissionRate: (num(f, "commissionPct") ?? 15) / 100,
    partnerRate: (num(f, "partnerPct") ?? 0) / 100,
    clientId: str(f, "clientId"), relationOwnerId: str(f, "relationOwnerId"), opsOwnerId: str(f, "opsOwnerId"),
    nextAction: str(f, "nextAction"), nextActionDate: date(f, "nextActionDate"), driveFolderUrl: str(f, "driveFolderUrl"),
  }});
  revalidatePath(`/missions/${id}`);
  redirect(back(id, str(f, "tab") ?? "apercu"));
}

export async function setStatus(f: FormData) {
  await requireSession();
  const id = str(f, "id")!, target = str(f, "status")!;
  const m = await db.mission.findUniqueOrThrow({ where: { id }, include: { lots: { include: { quotes: true } }, ledger: true, checks: true, briefItems: true, proposals: true } });
  const reasons = bool(f, "force") ? [] : gateReasons(m, target);
  if (reasons.length) redirect(back(id, str(f, "tab") ?? "apercu", "Passage bloqué — " + reasons.join(" · ")));
  await db.mission.update({ where: { id }, data: { status: target, lostReason: target === "PERDUE" ? str(f, "lostReason") : undefined } });
  await log(id, `Statut → ${label(MISSION_STATUSES, target)}${bool(f, "force") ? " (forcé)" : ""}`);
  revalidatePath("/");
  redirect(back(id, str(f, "tab") ?? "apercu"));
}

// ───────── Brief
export async function saveBrief(f: FormData) {
  await requireSession();
  const id = str(f, "missionId")!;
  const items = await db.briefItem.findMany({ where: { missionId: id } });
  for (const it of items) {
    const answer = str(f, `a_${it.id}`), status = str(f, `s_${it.id}`), note = str(f, `n_${it.id}`);
    if (answer !== it.answer || status !== it.status || note !== it.note)
      await db.briefItem.update({ where: { id: it.id }, data: { answer, note, status: status ?? it.status, source: answer !== it.answer ? `MAJ ${new Date().toLocaleDateString("fr-FR")}` : it.source } });
  }
  const q = str(f, "newQuestion");
  if (q) await db.briefItem.create({ data: { missionId: id, order: items.length + 1, category: str(f, "newCategory") ?? "Autre", question: q } });
  redirect(back(id, "brief"));
}

// ───────── Lots & devis
export async function addLot(f: FormData) {
  await requireSession();
  const missionId = str(f, "missionId")!;
  const count = await db.lot.count({ where: { missionId } });
  await db.lot.create({ data: { missionId, order: count, category: str(f, "category") ?? "Autre", title: str(f, "title") ?? "Lot", spec: str(f, "spec"), quantity: num(f, "quantity") ?? 1 } });
  redirect(back(missionId, "chiffrage"));
}
export async function deleteLot(f: FormData) {
  await requireSession();
  const lot = await db.lot.delete({ where: { id: str(f, "id")! } });
  redirect(back(lot.missionId, "chiffrage"));
}
export async function requestQuotes(f: FormData) {
  await requireSession();
  const lotId = str(f, "lotId")!;
  const lot = await db.lot.findUniqueOrThrow({ where: { id: lotId } });
  const ids = f.getAll("supplierIds").filter((x): x is string => typeof x === "string" && !!x);
  for (const supplierId of ids) {
    const exists = await db.supplierQuote.findFirst({ where: { lotId, supplierId } });
    if (!exists) await db.supplierQuote.create({ data: { lotId, supplierId, status: "DEMANDE" } });
  }
  if (ids.length) await log(lot.missionId, `Demande de devis « ${lot.title} » → ${ids.length} fournisseur(s)`, "EMAIL");
  redirect(back(lot.missionId, "chiffrage"));
}
export async function updateQuote(f: FormData) {
  await requireSession();
  const id = str(f, "id")!;
  const amountHT = num(f, "amountHT");
  const status = str(f, "status") ?? undefined;
  const q = await db.supplierQuote.update({ where: { id }, include: { lot: true }, data: {
    amountHT, vatAmount: num(f, "vatAmount"), status: status ?? (amountHT != null ? "RECU" : undefined),
    receivedAt: amountHT != null ? new Date() : undefined, validUntil: date(f, "validUntil"),
    includes: str(f, "includes"), cancellation: str(f, "cancellation"), availability: str(f, "availability"),
    fileUrl: str(f, "fileUrl"), notes: str(f, "notes"), sellPriceHT: num(f, "sellPriceHT"),
    conform: f.get("conform") == null ? undefined : f.get("conform") === "oui" ? true : f.get("conform") === "non" ? false : null,
  }});
  redirect(back(q.lot.missionId, "chiffrage"));
}
export async function toggleSelect(f: FormData) {
  await requireSession();
  const q = await db.supplierQuote.findUniqueOrThrow({ where: { id: str(f, "id")! }, include: { lot: true } });
  await db.supplierQuote.update({ where: { id: q.id }, data: { selected: !q.selected, status: !q.selected ? "RETENU" : "RECU" } });
  redirect(back(q.lot.missionId, "chiffrage"));
}

// ───────── Propositions (A/B/C anonymisées)
export async function createProposal(f: FormData) {
  await requireSession();
  const missionId = str(f, "missionId")!;
  const m = await db.mission.findUniqueOrThrow({ where: { id: missionId }, include: { lots: { orderBy: { order: "asc" }, include: { quotes: { include: { supplier: true } } } }, ledger: true } });
  const fin = computeFinancials(m, m.lots, m.ledger);
  const letters = "ABCDEF";
  const snapshot = {
    model: m.billingModel, fee: m.feeAmount,
    lots: m.lots.map((l) => ({
      title: l.title, category: l.category, spec: l.spec, quantity: l.quantity,
      options: l.quotes.filter((q) => q.amountHT != null && q.status !== "REFUS" && q.conform !== false)
        .sort((a, b) => (a.amountHT ?? 0) - (b.amountHT ?? 0))
        .map((q, i) => ({
          option: `Option ${letters[i] ?? i + 1}`, // identité fournisseur jamais exposée au client
          price: m.billingModel === "REFACTURATION" ? (q.sellPriceHT ?? Math.round((q.amountHT ?? 0) * (1 + m.markupRate) * 100) / 100) : q.amountHT,
          includes: q.includes, availability: q.availability, cancellation: q.cancellation, recommended: q.selected,
        })),
    })),
    totals: { clientTotalHT: fin.clientTotalHT, windchicRevenueHT: fin.windchicRevenueHT, provisionHT: fin.provisionHT },
  };
  const version = (await db.proposal.count({ where: { missionId } })) + 1;
  const p = await db.proposal.create({ data: { missionId, version, lang: str(f, "lang") ?? "fr", totalHT: fin.clientTotalHT, snapshot: JSON.stringify(snapshot) } });
  await log(missionId, `Proposition v${version} générée (${fin.clientTotalHT.toFixed(0)} € HT)`);
  redirect(`/propositions/${p.id}`);
}
export async function setProposalStatus(f: FormData) {
  await requireSession();
  const p = await db.proposal.update({ where: { id: str(f, "id")! }, data: { status: str(f, "status")!, sentAt: str(f, "status") === "ENVOYEE" ? new Date() : undefined } });
  await log(p.missionId, `Proposition v${p.version} → ${p.status}`);
  if (p.status === "ENVOYEE") await db.mission.updateMany({ where: { id: p.missionId, status: { in: ["A_QUALIFIER", "CHIFFRAGE"] } }, data: { status: "DEVIS_ENVOYE" } });
  redirect(back(p.missionId, "proposition"));
}

// ───────── Planning
export async function generateTasks(f: FormData) {
  await requireSession();
  const missionId = str(f, "missionId")!;
  const m = await db.mission.findUniqueOrThrow({ where: { id: missionId } });
  const streams = f.getAll("streams").filter((x): x is string => typeof x === "string");
  const chosen = streams.length ? streams : DEFAULT_STREAMS_BY_TYPE[m.type] ?? ["COORDINATION"];
  for (const key of chosen) {
    const st = TASK_STREAMS[key];
    if (!st) continue;
    for (const t of st.tasks) {
      const dup = await db.task.findFirst({ where: { missionId, title: t.title } });
      if (dup) continue;
      await db.task.create({ data: {
        missionId, title: t.title, phase: t.phase, stream: st.label, assigneeLabel: t.who,
        assigneeUserId: t.who.startsWith("Windchic") ? m.opsOwnerId : null,
        dueDate: computeDue(t, { J: m.startDate, Fin: m.endDate, L: m.deliveryDate }), deliverable: t.deliverable, vigilance: t.vigilance,
      }});
    }
  }
  await log(missionId, `Rétroplanning généré : ${chosen.map((c) => TASK_STREAMS[c]?.label).join(", ")}`);
  redirect(back(missionId, "planning"));
}
export async function addTask(f: FormData) {
  const s = await requireSession();
  const missionId = str(f, "missionId");
  await db.task.create({ data: { missionId, title: str(f, "title") ?? "Tâche", dueDate: date(f, "dueDate"), assigneeUserId: str(f, "assigneeUserId") ?? s.uid, priority: str(f, "priority") ?? "MOYENNE", phase: str(f, "phase") } });
  redirect(missionId ? back(missionId, "planning") : str(f, "redirect") ?? "/taches");
}
export async function setTaskStatus(f: FormData) {
  await requireSession();
  const t = await db.task.update({ where: { id: str(f, "id")! }, data: { status: str(f, "status")! } });
  const to = str(f, "redirect");
  redirect(to ?? (t.missionId ? back(t.missionId, "planning") : "/taches"));
}

// ───────── Finances
export async function addLedger(f: FormData) {
  await requireRight("finance:edit");
  const missionId = str(f, "missionId")!;
  await db.ledgerEntry.create({ data: { missionId, type: str(f, "type")!, amount: Math.abs(num(f, "amount") ?? 0), date: date(f, "date") ?? new Date(), counterparty: str(f, "counterparty"), reference: str(f, "reference"), docUrl: str(f, "docUrl"), note: str(f, "note") } });
  redirect(back(missionId, "finances"));
}
export async function deleteLedger(f: FormData) {
  await requireRight("finance:edit");
  const e = await db.ledgerEntry.delete({ where: { id: str(f, "id")! } });
  redirect(back(e.missionId, "finances"));
}

// ───────── Conformité, documents, journal
export async function updateCheck(f: FormData) {
  await requireSession();
  const c = await db.complianceCheck.update({ where: { id: str(f, "id")! }, data: { status: str(f, "status")!, proofUrl: str(f, "proofUrl"), note: str(f, "note") } });
  redirect(back(c.missionId, "conformite"));
}
export async function addDocument(f: FormData) {
  await requireSession();
  const missionId = str(f, "missionId")!;
  await db.document.create({ data: { missionId, type: str(f, "type") ?? "AUTRE", title: str(f, "title") ?? "Document", url: str(f, "url") ?? "#" } });
  redirect(back(missionId, "documents"));
}
export async function addNote(f: FormData) {
  await requireSession();
  const missionId = str(f, "missionId")!;
  const content = str(f, "content");
  if (content) await log(missionId, content, str(f, "kind") ?? "NOTE");
  redirect(back(missionId, "journal"));
}

// ───────── Prestataires & clients
export async function saveSupplier(f: FormData) {
  const s = await requireSession();
  if (!can(s, "suppliers:identity")) throw new Error("Accès refusé");
  const id = str(f, "id");
  const data = {
    name: str(f, "name") ?? "Sans nom", legalName: str(f, "legalName"), country: str(f, "country"), city: str(f, "city"),
    categories: f.getAll("categories").filter((x) => typeof x === "string").join(","), website: str(f, "website"),
    email: str(f, "email"), phone: str(f, "phone"), insuranceVerified: bool(f, "insuranceVerified"),
    nonCircumventionSigned: bool(f, "nonCircumventionSigned"), status: str(f, "status") ?? "A_CONTACTER", notes: str(f, "notes"),
    scoreConformity: num(f, "scoreConformity"), scoreReactivity: num(f, "scoreReactivity"), scorePrice: num(f, "scorePrice"), scoreReliability: num(f, "scoreReliability"),
  };
  if (id) { await db.supplier.update({ where: { id }, data }); redirect(`/prestataires/${id}`); }
  const count = await db.supplier.count();
  const sup = await db.supplier.create({ data: { ...data, code: `SUP-${String(count + 1).padStart(3, "0")}` } });
  redirect(`/prestataires/${sup.id}`);
}
export async function saveClient(f: FormData) {
  await requireSession();
  const id = str(f, "id");
  const data = { name: str(f, "name") ?? "Client", legalName: str(f, "legalName"), country: str(f, "country"), city: str(f, "city"), vatNumber: str(f, "vatNumber"), billingAddress: str(f, "billingAddress"), source: str(f, "source"), notes: str(f, "notes") };
  const c = id ? await db.client.update({ where: { id }, data }) : await db.client.create({ data });
  redirect(`/clients/${c.id}`);
}
