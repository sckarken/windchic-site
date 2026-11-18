// Verrous de passage d'étape : les règles écrites dans les process WINDCHIC deviennent automatiques.
import { computeCash, computeFinancials, type LedgerLike, type LotLike, type MissionLike } from "./finance";

export type GateInput = MissionLike & {
  lots: LotLike[];
  ledger: LedgerLike[];
  checks: { label: string; status: string }[];
  briefItems: { status: string }[];
  proposals: { status: string }[];
};

/** Retourne la liste des raisons qui empêchent de passer au statut cible (vide = autorisé). */
export function gateReasons(m: GateInput, target: string): string[] {
  const r: string[] = [];
  const fin = computeFinancials(m, m.lots, m.ledger);
  const cash = computeCash(m.ledger);
  const blocking = m.checks.filter((c) => c.status === "BLOQUANT");
  const order = ["A_QUALIFIER", "CHIFFRAGE", "DEVIS_ENVOYE", "VALIDEE", "EN_COURS", "CLOTURE", "TERMINEE"];
  const idx = order.indexOf(target);
  if (target === "PERDUE" || idx === -1) return r;

  if (idx >= order.indexOf("CHIFFRAGE")) {
    const open = m.briefItems.filter((b) => b.status === "A_DEMANDER" || b.status === "A_CLARIFIER").length;
    if (m.briefItems.length > 0 && open > Math.ceil(m.briefItems.length * 0.4))
      r.push(`Brief incomplet : ${open} questions ouvertes (règle : on ne contacte aucun prestataire avant un brief exploitable)`);
  }
  if (idx >= order.indexOf("DEVIS_ENVOYE")) {
    if (m.lots.length === 0) r.push("Aucun lot défini");
    else if (fin.lotsWithoutSelection > 0) r.push(`${fin.lotsWithoutSelection} lot(s) sans option retenue`);
    if (m.billingModel === "HONORAIRES" && !m.feeAmount) r.push("Honoraires non renseignés (à convenir AVANT la recherche approfondie)");
    if (m.billingModel === "REFACTURATION" && fin.marginRate != null && fin.marginRate < 0.15)
      r.push(`Taux de marque ${(fin.marginRate * 100).toFixed(1)} % sous le plancher de 15 %`);
  }
  if (idx >= order.indexOf("VALIDEE")) {
    if (!m.proposals.some((p) => p.status === "ACCEPTEE")) r.push("Aucune proposition acceptée par écrit par le client");
  }
  if (idx >= order.indexOf("EN_COURS")) {
    if (m.billingModel !== "APPORTEUR" && cash.clientPaid <= 0) r.push("Acompte client non encaissé (aucun engagement fournisseur avant l'acompte)");
    for (const c of blocking) r.push(`Conformité bloquante : ${c.label}`);
  }
  if (idx >= order.indexOf("TERMINEE")) {
    if (m.billingModel === "HONORAIRES" && Math.abs(cash.provisionToRefund) > 0.01)
      r.push(`Provision non soldée : ${cash.provisionToRefund.toFixed(2)} € à restituer ou justifier`);
    const pending = m.checks.filter((c) => c.status === "A_FAIRE" || c.status === "A_VERIFIER").length;
    if (pending > 0) r.push(`${pending} point(s) de conformité non clôturés`);
  }
  return r;
}
