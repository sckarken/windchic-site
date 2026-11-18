// Modèles repris des tableurs WINDCHIC (« Gestion de projet par offre », « Brief client & coordination »,
// « Pilotage opérationnel et débours »). Les dates sont calculées depuis J (ouverture), Fin ou L (livraison).

export type TaskTpl = { phase: string; title: string; who: "Windchic" | "Client" | "Prestataire" | "Windchic + Client"; base: "J" | "Fin" | "L"; days: number; deliverable?: string; vigilance?: string };

export const TASK_STREAMS: Record<string, { label: string; tasks: TaskTpl[] }> = {
  COORDINATION: { label: "Coordination", tasks: [
    { phase: "Avant-vente", title: "Appel de découverte : objectifs, lieu, équipe, budget", who: "Windchic", base: "J", days: -100, deliverable: "Fiche brief remplie", vigilance: "Ne pas chiffrer sans connaître le règlement du salon" },
    { phase: "Avant-vente", title: "Envoyer le devis détaillé poste par poste", who: "Windchic", base: "J", days: -95, deliverable: "Devis envoyé", vigilance: "Marge ≥ marge cible sur chaque poste sous-traité" },
    { phase: "Avant-vente", title: "Signature du devis et des conditions générales", who: "Client", base: "J", days: -92, deliverable: "Devis signé", vigilance: "Conditions d'annulation écrites" },
    { phase: "Avant-vente", title: "Encaisser l'acompte client", who: "Client", base: "J", days: -90, deliverable: "Acompte reçu", vigilance: "Aucun engagement fournisseur avant l'acompte" },
    { phase: "Lancement", title: "Réunion de lancement : rétroplanning, rôles, contacts", who: "Windchic + Client", base: "J", days: -90, deliverable: "Compte rendu envoyé", vigilance: "Un seul interlocuteur côté client" },
    { phase: "Lancement", title: "Créer le dossier mission (Drive) et la fiche client", who: "Windchic", base: "J", days: -90, deliverable: "Dossier partagé" },
    { phase: "Préparation", title: "Demander 2 devis minimum par catégorie", who: "Windchic", base: "J", days: -80, deliverable: "Devis fournisseurs saisis" },
    { phase: "Préparation", title: "Faire valider les prestataires retenus", who: "Client", base: "J", days: -70, deliverable: "Validation écrite du client" },
    { phase: "Exécution", title: "Encaisser le solde client (100 % au plus tard J-30)", who: "Client", base: "J", days: -30, deliverable: "Solde reçu" },
    { phase: "Exécution", title: "Payer les fournisseurs et confirmer les horaires par écrit", who: "Windchic", base: "J", days: -7, deliverable: "Preuves de paiement" },
    { phase: "Clôture", title: "Rapprochement dépenses / provisions, factures justificatives", who: "Windchic", base: "Fin", days: 7, deliverable: "État final" },
    { phase: "Clôture", title: "Bilan client, avis écrit et accord pour citer la référence", who: "Windchic", base: "Fin", days: 10, deliverable: "Compte rendu" },
  ]},
  STAND: { label: "Stand", tasks: [
    { phase: "Brief", title: "Recueillir le brief stand : surface, emplacement, ADN de marque, budget", who: "Client", base: "J", days: -90 },
    { phase: "Brief", title: "Récupérer le règlement technique du salon", who: "Windchic", base: "J", days: -88, vigilance: "Hauteur max, matériaux ignifugés, accroches" },
    { phase: "Conception", title: "Demander 2 devis à des standistes locaux", who: "Windchic", base: "J", days: -85 },
    { phase: "Conception", title: "Valider la maquette 3D et le devis du standiste", who: "Client", base: "J", days: -70, vigilance: "Faire signer la maquette avant fabrication" },
    { phase: "Conception", title: "Commander le stand", who: "Windchic", base: "J", days: -65, vigilance: "Après acompte client" },
    { phase: "Technique", title: "Commander électricité, mobilier, écrans, internet auprès de l'organisateur", who: "Windchic", base: "J", days: -45, vigilance: "Tarifs majorés après la date limite" },
    { phase: "Graphisme", title: "Valider les fichiers graphiques (BAT)", who: "Client", base: "J", days: -30, vigilance: "Vérifier les langues et les logos" },
    { phase: "Fabrication", title: "Contrôler la fabrication (photos)", who: "Windchic", base: "J", days: -15 },
    { phase: "Montage", title: "Montage et réception du stand", who: "Prestataire", base: "J", days: -1 },
    { phase: "Démontage", title: "Démontage et état des lieux", who: "Prestataire", base: "Fin", days: 0 },
  ]},
  COMMUNICATION: { label: "Communication", tasks: [
    { phase: "Brief", title: "Brief com : objectifs, messages, langues", who: "Client", base: "J", days: -60 },
    { phase: "Prestataires", title: "Sélectionner photographe, vidéaste, hôtes (2 devis)", who: "Windchic", base: "J", days: -50 },
    { phase: "Contenus", title: "Valider les supports imprimés (kakémonos, flyers, QR)", who: "Client", base: "J", days: -21, vigilance: "Délais d'impression" },
    { phase: "Équipe", title: "Recruter et briefer les hôtes multilingues", who: "Windchic", base: "J", days: -14, vigilance: "Tenue, pitch, langues" },
    { phase: "Après", title: "Livraison des photos et vidéos montées", who: "Prestataire", base: "Fin", days: 7 },
  ]},
  RDV: { label: "RDV qualifiés", tasks: [
    { phase: "Ciblage", title: "Définir la cible : profils d'acheteurs, pays, secteurs", who: "Client", base: "J", days: -75 },
    { phase: "Ciblage", title: "Construire la liste de prospects", who: "Windchic", base: "J", days: -60, vigilance: "Noter la source de chaque contact" },
    { phase: "Approche", title: "Messages d'approche FR / EN / 中文", who: "Windchic", base: "J", days: -50 },
    { phase: "Approche", title: "Campagne de prise de contact + relances", who: "Windchic", base: "J", days: -45 },
    { phase: "Agenda", title: "Agenda des rendez-vous confirmé", who: "Windchic", base: "J", days: -10, vigilance: "Distinguer RDV demandés et confirmés" },
  ]},
  CONCIERGERIE: { label: "Conciergerie", tasks: [
    { phase: "Préparation", title: "Liste des voyageurs, dates et besoins (régime, langue)", who: "Client", base: "J", days: -75 },
    { phase: "Préparation", title: "Réserver les hôtels près du salon", who: "Windchic", base: "J", days: -70, vigilance: "Tarifs annulables — avis juridique voyages préalable" },
    { phase: "Préparation", title: "Lettres d'invitation pour les visas", who: "Windchic", base: "J", days: -70, vigilance: "Le client dépose ses demandes" },
    { phase: "Préparation", title: "Réserver les interprètes (2 devis)", who: "Windchic", base: "J", days: -45 },
    { phase: "Préparation", title: "Réserver les transferts aéroport / hôtel / salon", who: "Windchic", base: "J", days: -21 },
    { phase: "Préparation", title: "Carnet de voyage FR / EN / 中文", who: "Windchic", base: "J", days: -5 },
    { phase: "Sur place", title: "Accueil de l'équipe à l'arrivée", who: "Windchic", base: "J", days: -2 },
    { phase: "Sur place", title: "Astreinte téléphone et WeChat", who: "Windchic", base: "J", days: 0 },
  ]},
  SOURCING: { label: "Sourcing produit", tasks: [
    { phase: "Cahier des charges", title: "Cahier des charges : modèle, specs, quantité, normes CE", who: "Client", base: "L", days: -90, vigilance: "Normes CE et garantie exigées" },
    { phase: "Recherche", title: "Rechercher au moins 3 fabricants", who: "Windchic", base: "L", days: -80 },
    { phase: "Recherche", title: "Devis et échantillons", who: "Windchic", base: "L", days: -75 },
    { phase: "Recherche", title: "Comparatif prix, délais, garanties au client", who: "Windchic", base: "L", days: -65 },
    { phase: "Commande", title: "Validation du fabricant et acompte client", who: "Client", base: "L", days: -60, vigilance: "Aucune commande avant l'acompte" },
    { phase: "Contrôle", title: "Contrôle avant expédition (photos, vidéo, tests)", who: "Windchic", base: "L", days: -30, vigilance: "Pas d'expédition sans contrôle" },
    { phase: "Expédition", title: "Expédition et documents (facture, CE, colisage)", who: "Prestataire", base: "L", days: -28, vigilance: "Fret maritime : 30 à 45 jours" },
  ]},
};

export const DEFAULT_STREAMS_BY_TYPE: Record<string, string[]> = {
  SALON: ["COORDINATION", "STAND", "COMMUNICATION"],
  EVENEMENT: ["COORDINATION"],
  CONCIERGERIE: ["COORDINATION", "CONCIERGERIE"],
  SOURCING: ["COORDINATION", "SOURCING"],
  LOGISTIQUE: ["COORDINATION"],
  AUTRE: ["COORDINATION"],
};

export const BRIEF_TEMPLATE: { category: string; question: string }[] = [
  { category: "Besoin", question: "Qu'est-ce que le client veut exactement ? (en une phrase)" },
  { category: "Besoin", question: "Pourquoi ? Quel résultat attend-il ?" },
  { category: "Besoin", question: "Exemple de référence : photo, vidéo, lien, modèle existant" },
  { category: "Besoin", question: "Critères OBLIGATOIRES (non négociables)" },
  { category: "Besoin", question: "Critères SOUHAITABLES (bonus)" },
  { category: "Besoin", question: "Ce que le client NE veut PAS" },
  { category: "Besoin", question: "Peut-on proposer une alternative ? Jusqu'où ?" },
  { category: "Quantité / specs", question: "Quantité (unités, personnes, heures…)" },
  { category: "Quantité / specs", question: "Caractéristiques techniques, qualité, marque, normes" },
  { category: "Où / quand", question: "Date(s) de la prestation ou de livraison" },
  { category: "Où / quand", question: "Lieu exact et conditions d'accès (badges, horaires)" },
  { category: "Où / quand", question: "Logistique : qui livre, qui installe, qu'est-ce qui est fourni sur place ?" },
  { category: "Argent", question: "Budget ou fourchette (INTERNE : jamais transmis au prestataire)" },
  { category: "Argent", question: "Qui paie ? Entité légale, adresse de facturation, n° TVA" },
  { category: "Décision", question: "Qui valide la décision finale côté client ?" },
  { category: "Décision", question: "Date limite pour recevoir notre proposition" },
  { category: "Contact", question: "Contact sur place le jour J (nom, téléphone, WeChat/WhatsApp)" },
  { category: "Contact", question: "Langue de travail et canal préféré" },
];

export const COMPLIANCE_TEMPLATE: { label: string; owner: string; models?: string[]; types?: string[]; blocking?: boolean }[] = [
  { label: "Contrat / devis signé avant recherche approfondie", owner: "Théo" },
  { label: "Acompte client encaissé avant tout engagement fournisseur", owner: "Théo" },
  { label: "Mandat préalable explicite (achats au nom du client)", owner: "Théo", models: ["HONORAIRES"] },
  { label: "Factures fournisseurs au nom du client", owner: "Théo", models: ["HONORAIRES"] },
  { label: "Dépenses au montant exact, sans marge", owner: "Théo", models: ["HONORAIRES"] },
  { label: "Traitement comptable des avances validé", owner: "Comptable", models: ["HONORAIRES"] },
  { label: "Convention d'apporteur signée avant mise en relation", owner: "Théo", models: ["APPORTEUR"] },
  { label: "Vols / hôtels : avis juridique Code du tourisme (Atout France)", owner: "Juriste", types: ["CONCIERGERIE"], blocking: true },
  { label: "TVA / territorialité (Chine, Espagne, France)", owner: "Comptable" },
  { label: "RC Pro et responsabilités sous-traitance", owner: "Théo" },
  { label: "Rémunération partenaire : document contractuel", owner: "Juriste" },
  { label: "Reddition finale et preuves de virement", owner: "Théo" },
];

export function computeDue(tpl: TaskTpl, dates: { J?: Date | null; Fin?: Date | null; L?: Date | null }) {
  const ref = tpl.base === "J" ? dates.J : tpl.base === "Fin" ? dates.Fin ?? dates.J : dates.L ?? dates.J;
  if (!ref) return null;
  const d = new Date(ref);
  d.setDate(d.getDate() + tpl.days);
  return d;
}
