/* Seed WINDCHIC Ops
 * - crée les utilisateurs (mot de passe : SEED_PASSWORD, sinon "windchic-demo")
 * - importe data/import.local.json s'il existe (données réelles, JAMAIS commitées), sinon data/demo.json (fictif)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { BRIEF_TEMPLATE, COMPLIANCE_TEMPLATE } from "../src/lib/templates";

const db = new PrismaClient();
type Quote = { supplier: string; status?: string; amountHT?: number; vatAmount?: number; includes?: string; availability?: string; cancellation?: string; selected?: boolean; sellPriceHT?: number; notes?: string; conform?: boolean; daysAgo?: number };
type Data = {
  clients: { key: string; name: string; legalName?: string; country?: string; city?: string; vatNumber?: string; billingAddress?: string; source?: string; notes?: string }[];
  suppliers: { key: string; name: string; legalName?: string; country?: string; city?: string; categories: string[]; email?: string; phone?: string; website?: string; status?: string; notes?: string; scores?: [number, number, number, number]; insuranceVerified?: boolean }[];
  missions: {
    title: string; summary?: string; client?: string; type: string; billingModel: string; status: string; urgency?: string; eventName?: string; city?: string; country?: string;
    startDate?: string; endDate?: string; receivedAt?: string; budgetCeiling?: number; feeAmount?: number; markupRate?: number; commissionRate?: number; partnerRate?: number;
    relation?: string; ops?: string; nextAction?: string; nextActionDate?: string; driveFolderUrl?: string;
    brief?: Record<string, string>; lots?: { category: string; title: string; spec?: string; quantity?: number; quotes?: Quote[] }[];
    ledger?: { type: string; amount: number; date?: string; counterparty?: string; reference?: string; note?: string; simulated?: boolean }[];
    tasks?: { title: string; dueDate?: string; status?: string; owner?: string; priority?: string }[];
    notes?: { kind?: string; content: string }[];
    checks?: Record<string, string>;
    proposals?: { status: string; lang?: string }[];
  }[];
  internalTasks?: { title: string; dueDate?: string; status?: string; owner?: string }[];
};

async function main() {
  const local = path.join(__dirname, "../data/import.local.json");
  const file = fs.existsSync(local) ? local : path.join(__dirname, "../data/demo.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8")) as Data;
  console.log(`→ Import depuis ${path.basename(file)}`);

  await db.$transaction([db.activity.deleteMany(), db.document.deleteMany(), db.complianceCheck.deleteMany(), db.ledgerEntry.deleteMany(), db.task.deleteMany(), db.proposal.deleteMany(), db.supplierQuote.deleteMany(), db.lot.deleteMany(), db.briefItem.deleteMany(), db.mission.deleteMany(), db.contact.deleteMany(), db.supplier.deleteMany(), db.client.deleteMany(), db.user.deleteMany()]);

  const pw = await bcrypt.hash(process.env.SEED_PASSWORD ?? "windchic-demo", 10);
  const theo = await db.user.create({ data: { name: "Théo", email: "theo@windchic.com", passwordHash: pw, role: "ADMIN" } });
  const wenjing = await db.user.create({ data: { name: "Wenjing", email: "wenjing@windchic.com", passwordHash: pw, role: "PARTNER", lang: "zh" } });
  const users: Record<string, string> = { theo: theo.id, wenjing: wenjing.id };

  const clients: Record<string, string> = {};
  for (const c of data.clients) { const { key, ...rest } = c; clients[key] = (await db.client.create({ data: rest })).id; }
  const suppliers: Record<string, string> = {};
  let n = 1;
  for (const s of data.suppliers) {
    const { key, categories, scores, ...rest } = s;
    suppliers[key] = (await db.supplier.create({ data: { ...rest, code: `SUP-${String(n++).padStart(3, "0")}`, categories: categories.join(","),
      scoreConformity: scores?.[0], scoreReactivity: scores?.[1], scorePrice: scores?.[2], scoreReliability: scores?.[3] } })).id;
  }

  const counters: Record<number, number> = {};
  const dt = (s?: string) => (s ? new Date(s) : null);
  for (const m of data.missions) {
    const year = (dt(m.receivedAt) ?? dt(m.startDate) ?? new Date()).getFullYear();
    counters[year] = (counters[year] ?? 0) + 1;
    const mission = await db.mission.create({ data: {
      code: `WC-${year}-${String(counters[year]).padStart(3, "0")}`, title: m.title, summary: m.summary, type: m.type, billingModel: m.billingModel, status: m.status,
      urgency: m.urgency ?? "NORMALE", eventName: m.eventName, city: m.city, country: m.country, startDate: dt(m.startDate), endDate: dt(m.endDate ?? m.startDate),
      receivedAt: dt(m.receivedAt) ?? new Date(), budgetCeiling: m.budgetCeiling, feeAmount: m.feeAmount, markupRate: m.markupRate ?? 0.25,
      commissionRate: m.commissionRate ?? 0.15, partnerRate: m.partnerRate ?? 0, clientId: m.client ? clients[m.client] : null,
      relationOwnerId: users[m.relation ?? "wenjing"], opsOwnerId: users[m.ops ?? "theo"], nextAction: m.nextAction, nextActionDate: dt(m.nextActionDate), driveFolderUrl: m.driveFolderUrl,
      briefItems: { create: BRIEF_TEMPLATE.map((b, i) => ({ ...b, order: i + 1, answer: m.brief?.[String(i + 1)] ?? null, status: m.brief?.[String(i + 1)] ? "CONFIRME" : "A_DEMANDER" })) },
      checks: { create: COMPLIANCE_TEMPLATE.filter((c) => (!c.models || c.models.includes(m.billingModel)) && (!c.types || c.types.includes(m.type)))
        .map((c, i) => ({ label: c.label, owner: c.owner, order: i, status: m.checks?.[c.label] ?? (c.blocking ? "BLOQUANT" : ["TERMINEE"].includes(m.status) ? "VALIDE" : "A_FAIRE") })) },
    }});
    for (const [i, l] of (m.lots ?? []).entries()) {
      const lot = await db.lot.create({ data: { missionId: mission.id, order: i, category: l.category, title: l.title, spec: l.spec, quantity: l.quantity ?? 1 } });
      for (const q of l.quotes ?? []) {
        const { supplier, daysAgo, ...rest } = q;
        await db.supplierQuote.create({ data: { ...rest, lotId: lot.id, supplierId: suppliers[supplier], status: q.status ?? (q.selected ? "RETENU" : q.amountHT != null ? "RECU" : "DEMANDE"),
          requestedAt: new Date(Date.now() - (daysAgo ?? 3) * 86400000), receivedAt: q.amountHT != null ? new Date() : null } });
      }
    }
    for (const e of m.ledger ?? []) await db.ledgerEntry.create({ data: { ...e, missionId: mission.id, date: dt(e.date) ?? new Date(), simulated: e.simulated ?? false } });
    for (const t of m.tasks ?? []) await db.task.create({ data: { missionId: mission.id, title: t.title, dueDate: dt(t.dueDate), status: t.status ?? "A_FAIRE", assigneeUserId: users[t.owner ?? "theo"], priority: t.priority ?? "MOYENNE", stream: "Coordination" } });
    for (const p of m.proposals ?? []) await db.proposal.create({ data: { missionId: mission.id, version: 1, status: p.status, lang: p.lang ?? "fr", snapshot: JSON.stringify({ model: m.billingModel, fee: m.feeAmount, lots: [], totals: { clientTotalHT: 0, windchicRevenueHT: 0, provisionHT: 0 } }) } });
    await db.activity.create({ data: { missionId: mission.id, kind: "STATUT", content: "Mission importée depuis les tableurs Drive", userId: theo.id } });
    for (const nt of m.notes ?? []) await db.activity.create({ data: { missionId: mission.id, kind: nt.kind ?? "NOTE", content: nt.content, userId: theo.id } });
  }
  for (const t of data.internalTasks ?? []) await db.task.create({ data: { title: t.title, dueDate: dt(t.dueDate), status: t.status ?? "A_FAIRE", assigneeUserId: users[t.owner ?? "theo"] } });
  console.log(`✓ ${data.missions.length} missions, ${data.suppliers.length} prestataires, ${data.clients.length} clients`);
  console.log(`✓ Connexion : theo@windchic.com / wenjing@windchic.com — mot de passe : ${process.env.SEED_PASSWORD ? "(SEED_PASSWORD)" : "windchic-demo"}`);
}
main().finally(() => db.$disconnect());
