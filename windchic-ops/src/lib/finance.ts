// Moteur financier — fonctions pures, testées (finance.test.ts)
import { LEDGER_TYPES, MISSION_STATUSES, type BillingModel } from "./constants";

export type QuoteLike = { amountHT: number | null; selected: boolean; sellPriceHT: number | null };
export type LotLike = { quantity?: number; quotes: QuoteLike[] };
export type LedgerLike = { type: string; amount: number; simulated?: boolean };
export type MissionLike = {
  billingModel: string;
  status: string;
  feeAmount: number | null;
  markupRate: number;
  commissionRate: number;
  partnerRate: number;
};

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Prix de vente HT d'une ligne en refacturation : forcé, sinon coût × (1 + coefficient). */
export function lineSellPrice(q: QuoteLike, markupRate: number) {
  if (q.sellPriceHT != null) return q.sellPriceHT;
  return round2((q.amountHT ?? 0) * (1 + markupRate));
}

export type Financials = {
  model: BillingModel;
  costHT: number;          // coût fournisseurs retenus
  windchicRevenueHT: number; // CA WINDCHIC (ce qui est facturé par WINDCHIC hors provision)
  clientTotalHT: number;   // ce que le client paie au total (tous bénéficiaires)
  provisionHT: number;     // part "frais tiers" (modèle honoraires)
  grossMargin: number;     // marge brute WINDCHIC
  marginRate: number | null; // taux de marque = marge / CA WINDCHIC
  markupOnCost: number | null; // marge / coût
  partnerCommission: number;
  directCosts: number;
  netMargin: number;
  lotsWithoutSelection: number;
};

export function computeFinancials(m: MissionLike, lots: LotLike[], ledger: LedgerLike[] = []): Financials {
  const model = m.billingModel as BillingModel;
  let costHT = 0;
  let sellHT = 0;
  let lotsWithoutSelection = 0;
  for (const lot of lots) {
    const sel = lot.quotes.filter((q) => q.selected);
    if (sel.length === 0) lotsWithoutSelection++;
    for (const q of sel) {
      costHT += q.amountHT ?? 0;
      sellHT += lineSellPrice(q, m.markupRate);
    }
  }
  costHT = round2(costHT);
  sellHT = round2(sellHT);

  let windchicRevenueHT = 0, clientTotalHT = 0, provisionHT = 0, grossMargin = 0;
  if (model === "REFACTURATION") {
    windchicRevenueHT = sellHT;
    clientTotalHT = sellHT;
    grossMargin = sellHT - costHT;
  } else if (model === "HONORAIRES") {
    windchicRevenueHT = m.feeAmount ?? 0;
    provisionHT = costHT;
    clientTotalHT = windchicRevenueHT + provisionHT;
    grossMargin = windchicRevenueHT;
  } else {
    // APPORTEUR : le prestataire facture directement, WINDCHIC touche une commission
    grossMargin = costHT * m.commissionRate;
    windchicRevenueHT = grossMargin;
    clientTotalHT = costHT;
  }
  grossMargin = round2(grossMargin);
  const partnerCommission = round2(grossMargin * m.partnerRate);
  const directCosts = round2(ledger.filter((l) => l.type === "FRAIS" && !l.simulated).reduce((s, l) => s + l.amount, 0));
  return {
    model,
    costHT,
    windchicRevenueHT: round2(windchicRevenueHT),
    clientTotalHT: round2(clientTotalHT),
    provisionHT: round2(provisionHT),
    grossMargin,
    marginRate: windchicRevenueHT > 0 && model === "REFACTURATION" ? round2((grossMargin / windchicRevenueHT) * 1000) / 1000 : null,
    markupOnCost: costHT > 0 && model === "REFACTURATION" ? round2((grossMargin / costHT) * 1000) / 1000 : null,
    partnerCommission,
    directCosts,
    netMargin: round2(grossMargin - partnerCommission - directCosts),
    lotsWithoutSelection,
  };
}

export type Cash = {
  in: number; out: number; balance: number;
  clientPaid: number;          // tout ce que le client a versé
  provisionReceived: number; supplierPaid: number; refunded: number;
  provisionToRefund: number;   // modèle HONORAIRES : provision - fournisseurs - restitutions
};

export function computeCash(ledger: LedgerLike[]): Cash {
  const real = ledger.filter((l) => !l.simulated);
  const sum = (types: string[]) => round2(real.filter((l) => types.includes(l.type)).reduce((s, l) => s + l.amount, 0));
  const inTypes = LEDGER_TYPES.filter((t) => t.dir === "IN").map((t) => t.key as string);
  const outTypes = LEDGER_TYPES.filter((t) => t.dir === "OUT").map((t) => t.key as string);
  const tin = sum(inTypes), tout = sum(outTypes);
  const provisionReceived = sum(["PROVISION"]);
  const supplierPaid = sum(["PAIEMENT_FOURNISSEUR"]);
  const refunded = sum(["REMBOURSEMENT_CLIENT"]);
  return {
    in: tin, out: tout, balance: round2(tin - tout),
    clientPaid: sum(["ACOMPTE_CLIENT", "SOLDE_CLIENT", "HONORAIRES", "PROVISION"]),
    provisionReceived, supplierPaid, refunded,
    provisionToRefund: round2(provisionReceived - supplierPaid - refunded),
  };
}

export function statusProbability(status: string) {
  return MISSION_STATUSES.find((s) => s.key === status)?.prob ?? 0;
}
