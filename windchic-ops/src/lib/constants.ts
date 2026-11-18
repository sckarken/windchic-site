// Référentiels métier WINDCHIC (FR + 中文 pour Wenjing)

export const MISSION_STATUSES = [
  { key: "A_QUALIFIER", fr: "À qualifier", zh: "待确认", prob: 0.1 },
  { key: "CHIFFRAGE", fr: "Sourcing & chiffrage", zh: "询价报价", prob: 0.25 },
  { key: "DEVIS_ENVOYE", fr: "Devis envoyé", zh: "已报价", prob: 0.5 },
  { key: "VALIDEE", fr: "Validée", zh: "已确认", prob: 1 },
  { key: "EN_COURS", fr: "En cours", zh: "执行中", prob: 1 },
  { key: "CLOTURE", fr: "Clôture financière", zh: "财务结算", prob: 1 },
  { key: "TERMINEE", fr: "Terminée", zh: "已完成", prob: 1 },
  { key: "PERDUE", fr: "Perdue", zh: "已流失", prob: 0 },
] as const;
export type MissionStatus = (typeof MISSION_STATUSES)[number]["key"];
export const ACTIVE_STATUSES: MissionStatus[] = ["A_QUALIFIER", "CHIFFRAGE", "DEVIS_ENVOYE", "VALIDEE", "EN_COURS", "CLOTURE"];
export const SIGNED_STATUSES: MissionStatus[] = ["VALIDEE", "EN_COURS", "CLOTURE", "TERMINEE"];

export const BILLING_MODELS = [
  { key: "REFACTURATION", fr: "Refacturation avec marge", short: "B · Refacturation", hint: "WINDCHIC achète et revend, facture unique. Cible SASU." },
  { key: "HONORAIRES", fr: "Honoraires + provision", short: "A · Honoraires", hint: "Honoraires WINDCHIC + provision tiers rapprochée et trop-perçu restitué." },
  { key: "APPORTEUR", fr: "Apporteur d'affaires", short: "Apporteur", hint: "Le prestataire facture le client et verse une commission à WINDCHIC." },
] as const;
export type BillingModel = (typeof BILLING_MODELS)[number]["key"];

export const MISSION_TYPES = [
  { key: "SALON", fr: "Salon clés en main" },
  { key: "EVENEMENT", fr: "Événement / matériel" },
  { key: "CONCIERGERIE", fr: "Conciergerie / délégation" },
  { key: "SOURCING", fr: "Sourcing produit" },
  { key: "LOGISTIQUE", fr: "Logistique / main-d'œuvre" },
  { key: "AUTRE", fr: "Autre" },
] as const;

export const URGENCIES = [
  { key: "NORMALE", fr: "Normale" },
  { key: "HAUTE", fr: "Haute" },
  { key: "CRITIQUE", fr: "Critique" },
] as const;

export const SUPPLIER_CATEGORIES = [
  "Location d'écrans", "Audiovisuel et éclairage", "Informatique", "Standiste", "Mobilier",
  "Hôtel", "Transport et transferts", "Vols", "Interprète", "Hôtes et intérim",
  "Photo et vidéo", "Main-d'œuvre", "Animation", "Traiteur", "Impression", "Fabricant (Chine)", "Autre",
];

export const SUPPLIER_STATUSES = [
  { key: "A_CONTACTER", fr: "À contacter" },
  { key: "ACTIF", fr: "Actif" },
  { key: "REFUS", fr: "A décliné" },
  { key: "A_EVITER", fr: "À éviter" },
] as const;

export const QUOTE_STATUSES = [
  { key: "DEMANDE", fr: "Demandé" },
  { key: "RECU", fr: "Reçu" },
  { key: "SANS_REPONSE", fr: "Sans réponse" },
  { key: "REFUS", fr: "Refus / pas dispo" },
  { key: "RETENU", fr: "Retenu" },
] as const;

export const TASK_STATUSES = [
  { key: "A_FAIRE", fr: "À faire", zh: "待办" },
  { key: "EN_COURS", fr: "En cours", zh: "进行中" },
  { key: "BLOQUE", fr: "Bloqué", zh: "受阻" },
  { key: "FAIT", fr: "Fait", zh: "已完成" },
  { key: "SANS_OBJET", fr: "Sans objet", zh: "不适用" },
] as const;

export const BRIEF_STATUSES = [
  { key: "A_DEMANDER", fr: "❓ À demander" },
  { key: "A_CLARIFIER", fr: "⚠️ À clarifier" },
  { key: "CONFIRME", fr: "✅ Confirmé" },
  { key: "SANS_OBJET", fr: "— Sans objet" },
] as const;

export const CHECK_STATUSES = [
  { key: "A_FAIRE", fr: "À faire" },
  { key: "A_VERIFIER", fr: "À vérifier" },
  { key: "VALIDE", fr: "Validé" },
  { key: "BLOQUANT", fr: "BLOQUANT" },
  { key: "SANS_OBJET", fr: "Sans objet" },
] as const;

// Journal de trésorerie : le sens est porté par le type
export const LEDGER_TYPES = [
  { key: "ACOMPTE_CLIENT", fr: "Acompte client", dir: "IN", bucket: "SALE" },
  { key: "SOLDE_CLIENT", fr: "Solde client", dir: "IN", bucket: "SALE" },
  { key: "HONORAIRES", fr: "Honoraires WINDCHIC encaissés", dir: "IN", bucket: "SALE" },
  { key: "PROVISION", fr: "Provision frais tiers reçue", dir: "IN", bucket: "PROVISION" },
  { key: "COMMISSION_RECUE", fr: "Commission apporteur reçue", dir: "IN", bucket: "SALE" },
  { key: "PAIEMENT_FOURNISSEUR", fr: "Paiement fournisseur", dir: "OUT", bucket: "SUPPLIER" },
  { key: "REMBOURSEMENT_CLIENT", fr: "Restitution trop-perçu client", dir: "OUT", bucket: "REFUND" },
  { key: "COMMISSION_PARTENAIRE", fr: "Commission partenaire versée", dir: "OUT", bucket: "PARTNER" },
  { key: "FRAIS", fr: "Frais directs (déplacement…)", dir: "OUT", bucket: "COST" },
] as const;
export type LedgerType = (typeof LEDGER_TYPES)[number]["key"];

export const DOC_TYPES = [
  { key: "BRIEF", fr: "Fiche brief" },
  { key: "CONTRAT", fr: "Contrat / devis signé" },
  { key: "MANDAT", fr: "Mandat" },
  { key: "DEVIS_FOURNISSEUR", fr: "Devis fournisseur" },
  { key: "FACTURE", fr: "Facture" },
  { key: "PREUVE_PAIEMENT", fr: "Preuve de paiement" },
  { key: "AUTRE", fr: "Autre" },
] as const;

export function label<T extends { key: string; fr: string }>(list: readonly T[], key: string | null | undefined) {
  return list.find((x) => x.key === key)?.fr ?? key ?? "—";
}
