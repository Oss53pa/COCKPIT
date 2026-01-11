// ============================================
// TYPES TEMPLATES D'IMPORT
// Conformément au Cahier des Charges v1.1
// ============================================

// --- Types de templates ---
export type ImportTemplateType =
  | 'etat_locatif'
  | 'ca_locataires'
  | 'frequentation'
  | 'charges'
  | 'energie'
  | 'encaissements';

// --- Définition d'une colonne de template ---
export interface TemplateColumn {
  nom: string;
  type: 'texte' | 'nombre' | 'date' | 'liste' | 'booleen' | 'auto';
  obligatoire: boolean;
  description: string;
  format?: string; // Ex: "DD/MM/YYYY", "0.00"
  valeursAutorisees?: string[]; // Pour type 'liste'
  valeurDefaut?: string | number | boolean;
  validation?: {
    min?: number;
    max?: number;
    regex?: string;
    unique?: boolean;
  };
  mappingBase?: string; // Nom du champ dans la base de données
}

// --- Définition d'un template d'import ---
export interface ImportTemplate {
  id: string;
  type: ImportTemplateType;
  nom: string;
  nomFichier: string;
  description: string;
  icone: string;
  colonnes: TemplateColumn[];
  onglets: {
    instructions: boolean;
    donnees: boolean;
    listes: boolean;
    exemple: boolean;
  };
  reglesValidation: ValidationRule[];
  kpisCalcules: string[];
  correspondancesSYSCOHADA?: Record<string, string>;
}

// --- Règle de validation ---
export interface ValidationRule {
  id: string;
  nom: string;
  description: string;
  type: 'completude' | 'coherence' | 'format' | 'unicite' | 'reference' | 'metier';
  condition: string; // Expression à évaluer
  message: string;
  severite: 'erreur' | 'avertissement' | 'info';
  champsConcernes: string[];
}

// --- Résultat de validation d'import ---
export interface ImportValidationResult {
  scoreQualite: number; // 0-100
  statut: 'excellent' | 'bon' | 'moyen' | 'insuffisant';
  lignesTotal: number;
  lignesValides: number;
  lignesAvertissements: number;
  lignesErreurs: number;
  details: {
    completude: number; // Score 0-30
    coherence: number; // Score 0-25
    format: number; // Score 0-20
    unicite: number; // Score 0-15
    references: number; // Score 0-10
  };
  erreurs: ImportError[];
  avertissements: ImportWarning[];
  suggestions: string[];
}

export interface ImportError {
  ligne: number;
  colonne: string;
  valeur: string;
  message: string;
  regle: string;
  correction?: string;
}

export interface ImportWarning {
  ligne: number;
  colonne: string;
  valeur: string;
  message: string;
  regle: string;
}

// --- État d'import ---
export interface ImportState {
  fichier: {
    nom: string;
    taille: number;
    type: string;
  };
  template: ImportTemplateType;
  etape: 'upload' | 'analyse' | 'mapping' | 'validation' | 'revision' | 'import' | 'termine';
  progression: number;
  mapping: ColumnMapping[];
  validation: ImportValidationResult | null;
  donneesPreview: Record<string, unknown>[];
  erreursCourantes: ImportError[];
}

// --- Mapping de colonnes ---
export interface ColumnMapping {
  colonneSource: string;
  colonneTemplate: string;
  confiance: number; // 0-100, niveau de confiance du mapping auto
  manuel: boolean;
  transformation?: string; // Expression de transformation si nécessaire
}

// --- Configuration de mapping automatique ---
export interface AutoMappingConfig {
  seuilConfiance: number; // Seuil minimum pour accepter un mapping auto (0-100)
  utiliserSynonymes: boolean;
  utiliserHistorique: boolean;
  langueSource: 'fr' | 'en';
}

// --- Historique des mappings ---
export interface MappingHistory {
  id: string;
  templateType: ImportTemplateType;
  mappings: ColumnMapping[];
  dateCreation: string;
  nombreUtilisations: number;
}

// ============================================
// TEMPLATES PRÉDÉFINIS
// ============================================

export const TEMPLATE_ETAT_LOCATIF: ImportTemplate = {
  id: 'tmpl-etat-locatif',
  type: 'etat_locatif',
  nom: 'État Locatif',
  nomFichier: 'template_etat_locatif.xlsx',
  description: 'Locaux, locataires, baux, surfaces',
  icone: 'Building2',
  colonnes: [
    { nom: 'code_local', type: 'texte', obligatoire: true, description: 'Identifiant unique du local', mappingBase: 'lotId' },
    { nom: 'designation', type: 'texte', obligatoire: true, description: 'Nom/description du local', mappingBase: 'designation' },
    { nom: 'niveau', type: 'texte', obligatoire: true, description: 'Étage (RDC, R+1, etc.)', mappingBase: 'niveau', valeursAutorisees: ['SS', 'RDC', 'R+1', 'R+2', 'R+3', 'R+4', 'R+5'] },
    { nom: 'zone', type: 'texte', obligatoire: false, description: 'Zone commerciale', mappingBase: 'zone' },
    { nom: 'surface_m2', type: 'nombre', obligatoire: true, description: 'Surface en m²', mappingBase: 'surface', validation: { min: 0 } },
    { nom: 'locataire', type: 'texte', obligatoire: false, description: 'Nom du locataire (vide si vacant)', mappingBase: 'locataireEnseigne' },
    { nom: 'activite', type: 'texte', obligatoire: false, description: "Type d'activité", mappingBase: 'activite' },
    { nom: 'statut', type: 'liste', obligatoire: true, description: 'Statut du local', mappingBase: 'statutOccupation', valeursAutorisees: ['Occupé', 'Vacant', 'Réservé', 'En travaux'] },
    { nom: 'date_debut_bail', type: 'date', obligatoire: false, description: 'Date début bail', mappingBase: 'dateDebutBail', format: 'DD/MM/YYYY' },
    { nom: 'date_fin_bail', type: 'date', obligatoire: false, description: 'Date fin bail', mappingBase: 'dateFinBail', format: 'DD/MM/YYYY' },
    { nom: 'loyer_mensuel', type: 'nombre', obligatoire: false, description: 'Loyer mensuel HT', mappingBase: 'loyerMensuel', validation: { min: 0 } },
    { nom: 'charges_mensuelles', type: 'nombre', obligatoire: false, description: 'Charges mensuelles', mappingBase: 'chargesMensuelles', validation: { min: 0 } },
  ],
  onglets: { instructions: true, donnees: true, listes: true, exemple: true },
  reglesValidation: [
    { id: 'rv-001', nom: 'Surface totale', description: 'La somme des surfaces doit correspondre à la surface totale du centre (±5%)', type: 'metier', condition: 'sum(surface_m2) BETWEEN (surfaceTotaleCentre * 0.95) AND (surfaceTotaleCentre * 1.05)', message: 'Écart significatif entre la somme des surfaces et la surface totale du centre', severite: 'avertissement', champsConcernes: ['surface_m2'] },
    { id: 'rv-002', nom: 'Locataire unique', description: 'Un local ne peut avoir qu\'un seul locataire actif', type: 'unicite', condition: 'unique(code_local, locataire) WHERE statut = "Occupé"', message: 'Doublon détecté: ce local a déjà un locataire', severite: 'erreur', champsConcernes: ['code_local', 'locataire'] },
    { id: 'rv-003', nom: 'Dates bail cohérentes', description: 'Date début doit être antérieure à date fin', type: 'coherence', condition: 'date_debut_bail < date_fin_bail', message: 'La date de début du bail est postérieure à la date de fin', severite: 'erreur', champsConcernes: ['date_debut_bail', 'date_fin_bail'] },
  ],
  kpisCalcules: ['taux_occupation', 'surface_vacante', 'wault', 'walb'],
};

export const TEMPLATE_CA_LOCATAIRES: ImportTemplate = {
  id: 'tmpl-ca-locataires',
  type: 'ca_locataires',
  nom: 'Chiffre d\'Affaires Locataires',
  nomFichier: 'template_ca_locataires.xlsx',
  description: 'CA déclaré mensuel par locataire',
  icone: 'TrendingUp',
  colonnes: [
    { nom: 'code_local', type: 'texte', obligatoire: true, description: 'Réf. du local', mappingBase: 'lotId' },
    { nom: 'locataire', type: 'texte', obligatoire: true, description: 'Nom locataire', mappingBase: 'locataireEnseigne' },
    { nom: 'mois', type: 'date', obligatoire: true, description: 'Mois concerné (MM/YYYY)', mappingBase: 'periode', format: 'MM/YYYY' },
    { nom: 'ca_declare', type: 'nombre', obligatoire: true, description: 'CA déclaré HT', mappingBase: 'montantCA', validation: { min: 0 } },
    { nom: 'ca_certifie', type: 'booleen', obligatoire: false, description: 'CA certifié ?', mappingBase: 'certifie', valeurDefaut: false },
    { nom: 'source', type: 'liste', obligatoire: false, description: 'Source des données', mappingBase: 'source', valeursAutorisees: ['Déclaratif', 'Comptable', 'Estimé'] },
  ],
  onglets: { instructions: true, donnees: true, listes: true, exemple: true },
  reglesValidation: [
    { id: 'rv-ca-001', nom: 'CA positif', description: 'Le CA ne peut pas être négatif', type: 'format', condition: 'ca_declare >= 0', message: 'Le chiffre d\'affaires ne peut pas être négatif', severite: 'erreur', champsConcernes: ['ca_declare'] },
    { id: 'rv-ca-002', nom: 'Local existant', description: 'Le local doit exister dans l\'état locatif', type: 'reference', condition: 'code_local IN etats_locatifs.code_local', message: 'Ce code local n\'existe pas dans l\'état locatif', severite: 'erreur', champsConcernes: ['code_local'] },
  ],
  kpisCalcules: ['ca_m2', 'ca_total', 'evolution_ca'],
};

export const TEMPLATE_FREQUENTATION: ImportTemplate = {
  id: 'tmpl-frequentation',
  type: 'frequentation',
  nom: 'Fréquentation',
  nomFichier: 'template_frequentation.xlsx',
  description: 'Comptage visiteurs journalier',
  icone: 'Users',
  colonnes: [
    { nom: 'date', type: 'date', obligatoire: true, description: 'Date du comptage', mappingBase: 'date', format: 'DD/MM/YYYY' },
    { nom: 'entree_principale', type: 'nombre', obligatoire: true, description: 'Entrées porte principale', mappingBase: 'entreePrincipale', validation: { min: 0 } },
    { nom: 'entree_parking', type: 'nombre', obligatoire: false, description: 'Entrées depuis parking', mappingBase: 'entreeParking', validation: { min: 0 } },
    { nom: 'entree_secondaire', type: 'nombre', obligatoire: false, description: 'Autres entrées', mappingBase: 'entreeSecondaire', validation: { min: 0 } },
    { nom: 'total_visiteurs', type: 'nombre', obligatoire: true, description: 'Total journalier', mappingBase: 'totalVisiteurs', validation: { min: 0 } },
    { nom: 'jour_semaine', type: 'auto', obligatoire: false, description: 'Calculé automatiquement', mappingBase: 'jourSemaine' },
    { nom: 'evenement', type: 'texte', obligatoire: false, description: 'Événement particulier', mappingBase: 'evenement' },
  ],
  onglets: { instructions: true, donnees: true, listes: false, exemple: true },
  reglesValidation: [
    { id: 'rv-freq-001', nom: 'Total cohérent', description: 'Le total doit être ≥ somme des entrées', type: 'coherence', condition: 'total_visiteurs >= (entree_principale + COALESCE(entree_parking, 0) + COALESCE(entree_secondaire, 0))', message: 'Le total des visiteurs est inférieur à la somme des entrées', severite: 'avertissement', champsConcernes: ['total_visiteurs', 'entree_principale', 'entree_parking', 'entree_secondaire'] },
    { id: 'rv-freq-002', nom: 'Valeur aberrante', description: 'Signale les valeurs > 3x la moyenne', type: 'metier', condition: 'total_visiteurs <= (AVG(total_visiteurs) * 3)', message: 'Valeur anormalement élevée (> 3x la moyenne)', severite: 'avertissement', champsConcernes: ['total_visiteurs'] },
  ],
  kpisCalcules: ['visiteurs_jour', 'ca_visiteur', 'tendance_trafic'],
};

export const TEMPLATE_CHARGES: ImportTemplate = {
  id: 'tmpl-charges',
  type: 'charges',
  nom: 'Charges d\'Exploitation',
  nomFichier: 'template_charges.xlsx',
  description: 'Dépenses par catégorie SYSCOHADA',
  icone: 'Receipt',
  colonnes: [
    { nom: 'mois', type: 'date', obligatoire: true, description: 'Mois concerné', mappingBase: 'periode', format: 'MM/YYYY' },
    { nom: 'categorie', type: 'liste', obligatoire: true, description: 'Catégorie de charge', mappingBase: 'categorieCharge', valeursAutorisees: ['601', '604', '605', '6051', '6052', '6056', '612', '613', '6211', '622', '6231', '624', '625', '626', '627', '628', '631', '641', '646', '661', '664', '668', '671'] },
    { nom: 'sous_categorie', type: 'texte', obligatoire: false, description: 'Sous-catégorie', mappingBase: 'sousCategorie' },
    { nom: 'fournisseur', type: 'texte', obligatoire: false, description: 'Nom fournisseur', mappingBase: 'fournisseur' },
    { nom: 'reference_facture', type: 'texte', obligatoire: false, description: 'N° facture', mappingBase: 'referenceFacture' },
    { nom: 'montant_ht', type: 'nombre', obligatoire: true, description: 'Montant HT', mappingBase: 'montantHT', validation: { min: 0 } },
    { nom: 'tva', type: 'nombre', obligatoire: false, description: 'Montant TVA', mappingBase: 'montantTVA', validation: { min: 0 } },
    { nom: 'montant_ttc', type: 'nombre', obligatoire: true, description: 'Montant TTC', mappingBase: 'montantTTC', validation: { min: 0 } },
    { nom: 'date_paiement', type: 'date', obligatoire: false, description: 'Date de paiement', mappingBase: 'datePaiement', format: 'DD/MM/YYYY' },
    { nom: 'statut', type: 'liste', obligatoire: false, description: 'Statut paiement', mappingBase: 'statutPaiement', valeursAutorisees: ['Payé', 'À payer', 'Litige'] },
  ],
  onglets: { instructions: true, donnees: true, listes: true, exemple: true },
  reglesValidation: [
    { id: 'rv-ch-001', nom: 'TTC cohérent', description: 'TTC doit être égal à HT + TVA', type: 'coherence', condition: 'montant_ttc = montant_ht + COALESCE(tva, 0)', message: 'Le montant TTC ne correspond pas à HT + TVA', severite: 'avertissement', champsConcernes: ['montant_ht', 'tva', 'montant_ttc'] },
  ],
  kpisCalcules: ['charges_m2', 'noi', 'ratio_charges_revenus'],
  correspondancesSYSCOHADA: {
    '601': 'Achats stockés',
    '604': "Achats d'études et prestations",
    '605': 'Autres achats',
    '6051': 'Fournitures non stockables (eau, électricité)',
    '6052': "Fournitures d'entretien",
    '6056': 'Achats de petit matériel',
    '612': 'Transports sur achats',
    '613': 'Transports pour le compte de tiers',
    '6211': 'Sous-traitance générale',
    '622': 'Locations et charges locatives',
    '6231': 'Publicité, publications',
    '624': 'Entretien et réparations',
    '625': "Primes d'assurance",
    '626': 'Études, recherches',
    '627': 'Publicité, relations publiques',
    '628': 'Frais divers',
    '631': 'Frais bancaires',
    '641': 'Impôts et taxes directs',
    '646': "Droits d'enregistrement",
    '661': 'Rémunérations du personnel',
    '664': 'Charges sociales',
    '668': 'Autres charges sociales',
    '671': 'Intérêts des emprunts',
  },
};

export const TEMPLATE_ENERGIE: ImportTemplate = {
  id: 'tmpl-energie',
  type: 'energie',
  nom: 'Consommation Énergétique',
  nomFichier: 'template_energie.xlsx',
  description: 'Électricité, eau, climatisation',
  icone: 'Zap',
  colonnes: [
    { nom: 'mois', type: 'date', obligatoire: true, description: 'Mois concerné', mappingBase: 'periode', format: 'MM/YYYY' },
    { nom: 'type_energie', type: 'liste', obligatoire: true, description: 'Type d\'énergie', mappingBase: 'typeEnergie', valeursAutorisees: ['Électricité', 'Eau', 'Gaz', 'Climatisation'] },
    { nom: 'compteur', type: 'texte', obligatoire: false, description: 'Référence compteur', mappingBase: 'referenceCompteur' },
    { nom: 'index_debut', type: 'nombre', obligatoire: true, description: 'Index début période', mappingBase: 'indexDebut', validation: { min: 0 } },
    { nom: 'index_fin', type: 'nombre', obligatoire: true, description: 'Index fin période', mappingBase: 'indexFin', validation: { min: 0 } },
    { nom: 'consommation', type: 'nombre', obligatoire: true, description: 'Consommation (kWh, m³)', mappingBase: 'consommation', validation: { min: 0 } },
    { nom: 'montant_facture', type: 'nombre', obligatoire: false, description: 'Montant facturé', mappingBase: 'montantFacture', validation: { min: 0 } },
    { nom: 'fournisseur', type: 'texte', obligatoire: false, description: 'CIE, SODECI, etc.', mappingBase: 'fournisseur' },
  ],
  onglets: { instructions: true, donnees: true, listes: true, exemple: true },
  reglesValidation: [
    { id: 'rv-en-001', nom: 'Index croissant', description: 'Index fin doit être supérieur à index début', type: 'coherence', condition: 'index_fin > index_debut', message: 'L\'index de fin doit être supérieur à l\'index de début', severite: 'erreur', champsConcernes: ['index_debut', 'index_fin'] },
    { id: 'rv-en-002', nom: 'Consommation calculée', description: 'Consommation doit correspondre à index_fin - index_debut', type: 'coherence', condition: 'consommation = index_fin - index_debut', message: 'La consommation ne correspond pas à la différence des index', severite: 'avertissement', champsConcernes: ['consommation', 'index_debut', 'index_fin'] },
  ],
  kpisCalcules: ['consommation_m2', 'cout_energie', 'intensite_energetique'],
};

export const TEMPLATE_ENCAISSEMENTS: ImportTemplate = {
  id: 'tmpl-encaissements',
  type: 'encaissements',
  nom: 'Encaissements Loyers',
  nomFichier: 'template_encaissements.xlsx',
  description: 'Suivi des paiements locataires',
  icone: 'Wallet',
  colonnes: [
    { nom: 'code_local', type: 'texte', obligatoire: true, description: 'Réf. du local', mappingBase: 'lotId' },
    { nom: 'locataire', type: 'texte', obligatoire: true, description: 'Nom locataire', mappingBase: 'locataireEnseigne' },
    { nom: 'periode', type: 'date', obligatoire: true, description: 'Période concernée', mappingBase: 'periode', format: 'MM/YYYY' },
    { nom: 'loyer_du', type: 'nombre', obligatoire: true, description: 'Montant dû', mappingBase: 'montantDu', validation: { min: 0 } },
    { nom: 'loyer_encaisse', type: 'nombre', obligatoire: true, description: 'Montant encaissé', mappingBase: 'montantEncaisse', validation: { min: 0 } },
    { nom: 'date_encaissement', type: 'date', obligatoire: false, description: 'Date de paiement', mappingBase: 'dateEncaissement', format: 'DD/MM/YYYY' },
    { nom: 'mode_paiement', type: 'liste', obligatoire: false, description: 'Mode de paiement', mappingBase: 'modePaiement', valeursAutorisees: ['Virement', 'Chèque', 'Mobile Money', 'Espèces'] },
    { nom: 'reference', type: 'texte', obligatoire: false, description: 'Référence paiement', mappingBase: 'reference' },
    { nom: 'solde', type: 'auto', obligatoire: false, description: 'Calculé (dû - encaissé)', mappingBase: 'solde' },
  ],
  onglets: { instructions: true, donnees: true, listes: true, exemple: true },
  reglesValidation: [
    { id: 'rv-enc-001', nom: 'Local existant', description: 'Le local doit exister dans l\'état locatif', type: 'reference', condition: 'code_local IN etats_locatifs.code_local', message: 'Ce code local n\'existe pas dans l\'état locatif', severite: 'erreur', champsConcernes: ['code_local'] },
  ],
  kpisCalcules: ['taux_recouvrement', 'creances', 'dso'],
};

// --- Liste de tous les templates ---
export const ALL_IMPORT_TEMPLATES: ImportTemplate[] = [
  TEMPLATE_ETAT_LOCATIF,
  TEMPLATE_CA_LOCATAIRES,
  TEMPLATE_FREQUENTATION,
  TEMPLATE_CHARGES,
  TEMPLATE_ENERGIE,
  TEMPLATE_ENCAISSEMENTS,
];

// --- Fonction utilitaire pour obtenir un template ---
export function getTemplateByType(type: ImportTemplateType): ImportTemplate | undefined {
  return ALL_IMPORT_TEMPLATES.find(t => t.type === type);
}
