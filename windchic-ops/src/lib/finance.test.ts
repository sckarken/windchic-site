import { test } from "node:test";
import assert from "node:assert/strict";
import { computeFinancials, computeCash } from "./finance";
import { gateReasons } from "./rules";

const base = { status: "CHIFFRAGE", feeAmount: null, markupRate: 0.25, commissionRate: 0.15, partnerRate: 0 };

test("refacturation : coefficient 1,25 => taux de marque 20 %", () => {
  const f = computeFinancials({ ...base, billingModel: "REFACTURATION" }, [
    { quotes: [{ amountHT: 8000, selected: true, sellPriceHT: null }, { amountHT: 7000, selected: false, sellPriceHT: null }] },
  ]);
  assert.equal(f.costHT, 8000);
  assert.equal(f.windchicRevenueHT, 10000);
  assert.equal(f.grossMargin, 2000);
  assert.equal(f.marginRate, 0.2);
  assert.equal(f.markupOnCost, 0.25);
});

test("refacturation : prix forcé + commission partenaire + frais", () => {
  const f = computeFinancials({ ...base, billingModel: "REFACTURATION", partnerRate: 0.3 },
    [{ quotes: [{ amountHT: 1000, selected: true, sellPriceHT: 1400 }] }],
    [{ type: "FRAIS", amount: 50 }]);
  assert.equal(f.grossMargin, 400);
  assert.equal(f.partnerCommission, 120);
  assert.equal(f.netMargin, 230);
});

test("honoraires + provision : cas MWC (3 100 + 6 000)", () => {
  const f = computeFinancials({ ...base, billingModel: "HONORAIRES", feeAmount: 3100 }, [
    { quotes: [{ amountHT: 2500, selected: true, sellPriceHT: null }] },
    { quotes: [{ amountHT: 3000, selected: true, sellPriceHT: null }] },
    { quotes: [{ amountHT: 500, selected: true, sellPriceHT: null }] },
  ]);
  assert.equal(f.windchicRevenueHT, 3100);
  assert.equal(f.provisionHT, 6000);
  assert.equal(f.clientTotalHT, 9100);
  assert.equal(f.grossMargin, 3100);
});

test("trésorerie : écart provision 500 € à restituer", () => {
  const c = computeCash([
    { type: "PROVISION", amount: 6000 }, { type: "HONORAIRES", amount: 3100 },
    { type: "PAIEMENT_FOURNISSEUR", amount: 5500 },
  ]);
  assert.equal(c.provisionToRefund, 500);
  assert.equal(c.balance, 3600);
  const c2 = computeCash([{ type: "PROVISION", amount: 6000 }, { type: "PAIEMENT_FOURNISSEUR", amount: 5500 }, { type: "REMBOURSEMENT_CLIENT", amount: 500 }]);
  assert.equal(c2.provisionToRefund, 0);
});

test("apporteur : 15 % de la facture prestataire (Ségovie)", () => {
  const f = computeFinancials({ ...base, billingModel: "APPORTEUR" }, [{ quotes: [{ amountHT: 3330, selected: true, sellPriceHT: null }] }]);
  assert.equal(f.grossMargin, 499.5);
});

test("verrou : pas d'exécution sans acompte ni avec conformité bloquante", () => {
  const m = { ...base, billingModel: "REFACTURATION", lots: [{ quotes: [{ amountHT: 100, selected: true, sellPriceHT: null }] }],
    ledger: [], checks: [{ label: "Avis juridique voyages", status: "BLOQUANT" }], briefItems: [], proposals: [{ status: "ACCEPTEE" }] };
  const r = gateReasons(m, "EN_COURS");
  assert.ok(r.some((x) => x.includes("Acompte")));
  assert.ok(r.some((x) => x.includes("Avis juridique")));
  assert.deepEqual(gateReasons({ ...m, ledger: [{ type: "ACOMPTE_CLIENT", amount: 50 }], checks: [] }, "EN_COURS"), []);
});
