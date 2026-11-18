import type { Session } from "@/lib/session";
import type { Cash, Financials } from "@/lib/finance";
import type { FullMission } from "../data";
export type TabProps = { m: FullMission; fin: Financials; cash: Cash; s: Session; canMoney: boolean; canEditMoney: boolean; canIdentity: boolean };
