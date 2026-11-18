import { db } from "./db";
import { computeFinancials, statusProbability } from "./finance";
import { ACTIVE_STATUSES, SIGNED_STATUSES } from "./constants";

export const missionInclude = { client: true, opsOwner: true, relationOwner: true, lots: { include: { quotes: true } }, ledger: true } as const;

export async function missionsWithFinancials(where: object = {}) {
  const ms = await db.mission.findMany({ where, include: missionInclude, orderBy: [{ startDate: "asc" }, { createdAt: "desc" }] });
  return ms.map((m) => ({ ...m, fin: computeFinancials(m, m.lots, m.ledger) }));
}

export async function cockpitData(userId: string) {
  const now = new Date();
  const in7 = new Date(Date.now() + 7 * 86400000);
  const ago48h = new Date(Date.now() - 2 * 86400000);
  const [missions, myTasks, pendingQuotes] = await Promise.all([
    missionsWithFinancials({ status: { notIn: ["PERDUE"] } }),
    db.task.findMany({
      where: { status: { in: ["A_FAIRE", "EN_COURS", "BLOQUE"] }, OR: [{ assigneeUserId: userId }, { assigneeUserId: null, assigneeLabel: { startsWith: "Windchic" } }], dueDate: { lte: in7 } },
      include: { mission: true }, orderBy: { dueDate: "asc" }, take: 12,
    }),
    db.supplierQuote.findMany({ where: { status: "DEMANDE", requestedAt: { lte: ago48h } }, include: { supplier: true, lot: { include: { mission: true } } }, orderBy: { requestedAt: "asc" } }),
  ]);
  const active = missions.filter((m) => (ACTIVE_STATUSES as string[]).includes(m.status));
  const signed = missions.filter((m) => (SIGNED_STATUSES as string[]).includes(m.status));
  const urgent = active.filter((m) => {
    const soon = m.startDate && m.startDate.getTime() - now.getTime() < 3 * 86400000 && m.startDate >= new Date(now.toDateString());
    return m.urgency === "CRITIQUE" || soon || (m.nextActionDate && m.nextActionDate < now);
  });
  const weightedPipeline = active.filter((m) => !(SIGNED_STATUSES as string[]).includes(m.status))
    .reduce((s, m) => s + m.fin.windchicRevenueHT * statusProbability(m.status), 0);
  const signedRevenue = signed.reduce((s, m) => s + m.fin.windchicRevenueHT, 0);
  const signedNet = signed.reduce((s, m) => s + m.fin.netMargin, 0);
  const sent = missions.filter((m) => ["DEVIS_ENVOYE", ...SIGNED_STATUSES].includes(m.status)).length;
  const lost = await db.mission.count({ where: { status: "PERDUE" } });
  return {
    missions, active, urgent, myTasks, pendingQuotes,
    toQualify: active.filter((m) => m.status === "A_QUALIFIER").length,
    weightedPipeline, signedRevenue, signedNet,
    conversion: sent + lost > 0 ? signed.length / (sent + lost) : null, signedCount: signed.length, sentCount: sent + lost,
  };
}
