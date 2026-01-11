// ============================================
// TYPES JOURNAL DES MODIFICATIONS
// Conformément au Cahier des Charges v1.1
// ============================================

// --- Type d'action dans le journal ---
export type ActionJournal =
  | 'import'
  | 'modification'
  | 'suppression'
  | 'creation'
  | 'cloture'
  | 'validation'
  | 'annulation'
  | 'restauration';

// --- Entrée dans le journal des modifications ---
export interface JournalEntry {
  id: string;
  date: string;
  action: ActionJournal;
  table: string;
  enregistrementsAffectes: number;
  utilisateur: string;
  details: JournalDetails;
  scoreQualite?: number; // Pour les imports
  erreurs?: string[];
  avertissements?: string[];
  createdAt: string;
}

export interface JournalDetails {
  // Pour les imports
  fichierSource?: string;
  typeImport?: string;

  // Pour les modifications
  champModifie?: string;
  ancienneValeur?: unknown;
  nouvelleValeur?: unknown;

  // Pour les clôtures de période
  periode?: string;
  motifCloture?: string;

  // Justification
  justification?: string;

  // Contexte supplémentaire
  entiteId?: string;
  entiteType?: string;
  centreId?: string;

  // Pour les restaurations
  fichierRestoration?: string;
  enregistrementsRestaures?: number;
}

// --- Période clôturée ---
export interface PeriodeCloturee {
  id: string;
  centreId: string;
  annee: number;
  mois: number;
  dateCloture: string;
  clotureParAuto: boolean; // Clôture automatique (M+15) ou manuelle
  utilisateur: string;
  justification?: string;
  donnees: {
    tables: string[];
    enregistrements: number;
  };
  deverrouillages: Array<{
    date: string;
    utilisateur: string;
    justification: string;
    dureeHeures: number;
  }>;
}

// --- Configuration des clôtures ---
export interface ConfigurationCloture {
  clotureAutomatiqueActive: boolean;
  jourClotureAuto: number; // Ex: 15 pour M+15
  notifierAvantCloture: boolean;
  joursNotificationAvance: number;
  permettreDeverrouillage: boolean;
  justificationObligatoire: boolean;
}

// --- Statistiques du journal ---
export interface JournalStats {
  periodeDebut: string;
  periodeFin: string;
  totalEntrees: number;
  parAction: Record<ActionJournal, number>;
  parTable: Record<string, number>;
  erreursTotales: number;
  avertissementsTotaux: number;
  scoreQualiteMoyen: number;
}

// --- Filtres pour le journal ---
export interface JournalFilters {
  dateDebut?: string;
  dateFin?: string;
  actions?: ActionJournal[];
  tables?: string[];
  utilisateur?: string;
  centreId?: string;
  avecErreurs?: boolean;
  recherche?: string;
}

// --- Rectification de données ---
export interface RectificationDonnees {
  id: string;
  centreId: string;
  table: string;
  periodeAffectee: {
    annee: number;
    mois: number;
  };
  enregistrementsModifies: number;
  justification: string;
  dateDemande: string;
  dateApplication?: string;
  statut: 'en_attente' | 'appliquee' | 'rejetee';
  utilisateur: string;
  kpisRecalcules: string[];
  journalEntryId?: string;
}

// --- Export du journal ---
export interface JournalExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  filtres: JournalFilters;
  colonnes: string[];
  inclureDetails: boolean;
  triPar: 'date' | 'action' | 'table';
  ordreDesc: boolean;
}

// --- Configuration par défaut ---
export const DEFAULT_CLOTURE_CONFIG: ConfigurationCloture = {
  clotureAutomatiqueActive: true,
  jourClotureAuto: 15,
  notifierAvantCloture: true,
  joursNotificationAvance: 3,
  permettreDeverrouillage: true,
  justificationObligatoire: true,
};

// --- Tables concernées par le journal ---
export const TABLES_JOURNALISEES = [
  'centres',
  'etatsLocatifs',
  'donneesLoyers',
  'donneesFrequentation',
  'donneesChiffreAffaires',
  'donneesCharges',
  'donneesBaux',
  'donneesEnergie',
  'donneesSatisfaction',
  'mesures',
  'actions',
  'evaluations',
  'audits',
] as const;

export type TableJournalisee = typeof TABLES_JOURNALISEES[number];
