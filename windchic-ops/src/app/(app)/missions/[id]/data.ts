import { db } from "@/lib/db";

export const getMission = (id: string) => db.mission.findUnique({
  where: { id },
  include: {
    client: true, opsOwner: true, relationOwner: true,
    briefItems: { orderBy: { order: "asc" } },
    lots: { orderBy: { order: "asc" }, include: { quotes: { include: { supplier: true }, orderBy: { amountHT: "asc" } } } },
    proposals: { orderBy: { version: "desc" } },
    tasks: { orderBy: [{ dueDate: "asc" }], include: { assigneeUser: true, assigneeSupplier: true } },
    ledger: { orderBy: { date: "asc" } }, checks: { orderBy: { order: "asc" } },
    documents: { orderBy: { createdAt: "desc" } }, activities: { orderBy: { createdAt: "desc" }, include: { user: true }, take: 100 },
  },
});
export type FullMission = NonNullable<Awaited<ReturnType<typeof getMission>>>;

