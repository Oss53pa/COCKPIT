// ============================================
// TYPES SAUVEGARDE ET RESTAURATION
// Conformément au Cahier des Charges v1.1
// ============================================

// --- Structure du fichier de sauvegarde ---
export interface BackupMetadata {
  version: string;
  exportDate: string;
  appVersion: string;
  dbVersion: number;
  checksum: string;
  tables: number;
  totalRecords: number;
  centresInclus: string[];
  tailleMo: number;
}

export interface BackupFile {
  meta: BackupMetadata;
  profile?: import('./userProfile').UserProfile;
  settings: Record<string, unknown>;
  data: BackupData;
}

export interface BackupData {
  // Core
  centres: unknown[];
  postes: unknown[];
  membresEquipe: unknown[];
  axes: unknown[];
  objectifs: unknown[];
  mesures: unknown[];
  actions: unknown[];
  reunions: unknown[];
  livrables: unknown[];
  evaluations: unknown[];
  audits: unknown[];
  risques: unknown[];
  alertes: unknown[];
  parametres: unknown[];
  importLogs: unknown[];
  // BI
  fichiersImport: unknown[];
  dossiersImport: unknown[];
  etatsLocatifs: unknown[];
  donneesLoyers: unknown[];
  donneesFrequentation: unknown[];
  donneesChiffreAffaires: unknown[];
  donneesCharges: unknown[];
  donneesBaux: unknown[];
  donneesTravaux: unknown[];
  donneesValorisation: unknown[];
  donneesEnergie: unknown[];
  donneesSatisfaction: unknown[];
  typesRapport: unknown[];
  packsRapport: unknown[];
  rapports: unknown[];
  modelesRapport: unknown[];
  resultatsKPI: unknown[];
  insights: unknown[];
  reglesAlerte: unknown[];
  alertesGenerees: unknown[];
  tendancesPrediction: unknown[];
  benchmarks: unknown[];
  configurationsBI: unknown[];
  // Projet
  projets: unknown[];
  phasesProjet: unknown[];
  jalons: unknown[];
  vaguesRecrutement: unknown[];
  postesARecruter: unknown[];
  prospectsCommerciaux: unknown[];
  suiviBEFA: unknown[];
  reserves: unknown[];
  documentsDOE: unknown[];
  risquesProjet: unknown[];
  actionsCommunication: unknown[];
  evenementsLancement: unknown[];
  phasesHandover: unknown[];
  jalonsCommerciaux: unknown[];
  // Nouvelles tables
  backupHistory: unknown[];
  journalModifications: unknown[];
  documents: unknown[];
}

// --- Historique des sauvegardes ---
export interface BackupHistoryEntry {
  id: string;
  date: string;
  type: 'manuel' | 'automatique';
  cible: 'download' | 'local' | 'onedrive' | 'cloud';
  tailleMo: number;
  centresInclus: number;
  enregistrements: number;
  statut: 'succes' | 'erreur' | 'partiel';
  erreur?: string;
  cheminFichier?: string;
  checksum: string;
}

// --- Configuration de sauvegarde automatique améliorée ---
export interface AutoBackupConfig {
  enabled: boolean;
  frequence: 'quotidien' | 'hebdomadaire' | 'mensuel';
  heure: string; // Format HH:MM
  joursRetenus: number; // Nombre de sauvegardes à conserver (5, 10, 30)
  cibles: {
    local: boolean;
    onedrive: boolean;
  };
  notifierSiEchec: boolean;
  derniereSauvegarde?: string;
  dernierStatut?: 'succes' | 'erreur';
  prochaineSauvegarde?: string;
}

// --- Options de restauration ---
export interface RestoreOptions {
  mode: 'complet' | 'fusion';
  centresARestaurer?: string[]; // Si vide, tous les centres
  tablesARestaurer?: string[]; // Si vide, toutes les tables
  strategieConflits: 'garder_local' | 'garder_import' | 'plus_recent';
  creerSauvegardeAvant: boolean;
}

export interface RestoreResult {
  success: boolean;
  message: string;
  enregistrementsRestaures: number;
  enregistrementsIgnores: number;
  conflitsResolus: number;
  erreurs: string[];
  dureeMs: number;
}

// --- Validation de sauvegarde ---
export interface BackupValidation {
  isValid: boolean;
  version: string;
  compatible: boolean;
  dateExport: string;
  centresCount: number;
  recordsCount: number;
  integrityCheck: boolean;
  warnings: string[];
  errors: string[];
}

// --- Export sélectif par centre ---
export interface SelectiveExportOptions {
  centreIds: string[];
  inclureHistorique: boolean;
  periodeDebut?: string;
  periodeFin?: string;
  inclureDocuments: boolean;
  compresser: boolean;
}

// --- Statistiques de stockage ---
export interface StorageStats {
  totalUtilise: number; // Octets
  limiteEstimee: number; // ~500 MB pour IndexedDB
  parCategorie: {
    documents: number;
    donneesMétier: number;
    historiqueImports: number;
    sauvegardesLocales: number;
  };
  documentsVolumineux: Array<{
    nom: string;
    taille: number;
    type: string;
    dateAjout: string;
  }>;
}
