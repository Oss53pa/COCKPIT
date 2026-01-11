// ============================================
// TYPES GESTION DOCUMENTAIRE
// Conformément au Cahier des Charges v1.1
// ============================================

// --- Type de stockage ---
export type TypeStockage = 'interne' | 'externe';

// --- Catégorie de document ---
export type CategorieDocument =
  | 'gouvernance'      // PV, décisions, validations
  | 'commercial'       // Baux, avenants, correspondances
  | 'technique'        // Plans, DOE, certificats
  | 'rh'               // Contrats, évaluations
  | 'finance'          // Factures, justificatifs
  | 'audit'            // Rapports, non-conformités
  | 'projet'           // Livrables, CR réunions
  | 'autre';

// --- Rétention par catégorie (en années) ---
export const RETENTION_PAR_CATEGORIE: Record<CategorieDocument, number> = {
  gouvernance: 10,
  commercial: 99, // Durée bail + 5 ans
  technique: 99,  // Vie du bâtiment
  rh: 99,         // Durée emploi + 5 ans
  finance: 10,
  audit: 7,
  projet: 99,     // Durée projet + 3 ans
  autre: 5,
};

// --- Type de fichier supporté ---
export interface TypeFichierSupporte {
  extension: string;
  mimeType: string;
  tailleMaxMo: number;
  categorie: 'document' | 'tableur' | 'image' | 'archive';
}

export const TYPES_FICHIERS_SUPPORTES: TypeFichierSupporte[] = [
  { extension: '.pdf', mimeType: 'application/pdf', tailleMaxMo: 10, categorie: 'document' },
  { extension: '.doc', mimeType: 'application/msword', tailleMaxMo: 10, categorie: 'document' },
  { extension: '.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', tailleMaxMo: 10, categorie: 'document' },
  { extension: '.xls', mimeType: 'application/vnd.ms-excel', tailleMaxMo: 10, categorie: 'tableur' },
  { extension: '.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', tailleMaxMo: 10, categorie: 'tableur' },
  { extension: '.jpg', mimeType: 'image/jpeg', tailleMaxMo: 5, categorie: 'image' },
  { extension: '.jpeg', mimeType: 'image/jpeg', tailleMaxMo: 5, categorie: 'image' },
  { extension: '.png', mimeType: 'image/png', tailleMaxMo: 5, categorie: 'image' },
  { extension: '.gif', mimeType: 'image/gif', tailleMaxMo: 5, categorie: 'image' },
  { extension: '.zip', mimeType: 'application/zip', tailleMaxMo: 20, categorie: 'archive' },
];

// --- Document stocké ---
export interface Document {
  id: string;
  nom: string;
  description?: string;
  categorie: CategorieDocument;
  typeStockage: TypeStockage;

  // Si stockage interne
  contenu?: string;           // Base64
  taille?: number;            // Octets
  mimeType?: string;

  // Si stockage externe
  cheminLocal?: string;       // Chemin fichier local
  urlCloud?: string;          // URL Google Drive, OneDrive
  hash?: string;              // Hash pour vérifier si modifié

  // Métadonnées
  extension: string;
  dateAjout: string;
  dateModification: string;
  ajoutePar: string;

  // Entité liée
  entiteType?: 'reunion' | 'audit' | 'action' | 'jalon' | 'risque' | 'handover' | 'evaluation' | 'centre';
  entiteId?: string;
  centreId?: string;

  // Rétention
  dateRetention?: string;     // Date avant laquelle ne pas supprimer

  // Aperçu
  miniature?: string;         // Base64 de la miniature (pour images, PDF)
  nombrePages?: number;       // Pour les PDF

  // Tags et recherche
  tags: string[];

  createdAt: string;
  updatedAt: string;
}

// --- Référence externe ---
export interface ReferenceExterne {
  id: string;
  documentId: string;
  type: 'local' | 'google_drive' | 'onedrive' | 'dropbox' | 'sharepoint' | 'autre';
  chemin: string;
  dateVerification?: string;
  estAccessible?: boolean;
  erreurAcces?: string;
}

// --- Statistiques de stockage ---
export interface StorageStatistics {
  totalUtilise: number;        // Octets
  limiteEstimee: number;       // ~500 MB pour IndexedDB
  pourcentageUtilise: number;  // 0-100
  parCategorie: Record<CategorieDocument, {
    nombre: number;
    taille: number;
  }>;
  documentsVolumineux: Array<{
    id: string;
    nom: string;
    taille: number;
    categorie: CategorieDocument;
    dateAjout: string;
  }>;
  recommandations: string[];
}

// --- Options de recherche documents ---
export interface DocumentSearchOptions {
  recherche?: string;          // Texte libre
  categories?: CategorieDocument[];
  entiteType?: string;
  entiteId?: string;
  centreId?: string;
  typeStockage?: TypeStockage;
  dateDebut?: string;
  dateFin?: string;
  tailleMin?: number;
  tailleMax?: number;
  tags?: string[];
  triPar?: 'nom' | 'date' | 'taille' | 'categorie';
  ordreDesc?: boolean;
}

// --- Résultat recherche documents ---
export interface DocumentSearchResult {
  documents: Document[];
  total: number;
  page: number;
  parPage: number;
  filtresAppliques: Partial<DocumentSearchOptions>;
}

// --- Options d'upload document ---
export interface DocumentUploadOptions {
  fichier: File;
  categorie: CategorieDocument;
  description?: string;
  tags?: string[];
  entiteType?: string;
  entiteId?: string;
  centreId?: string;
  stockageExterne?: boolean;   // Si true, stocker comme référence
  genererMiniature?: boolean;
}

// --- Résultat upload ---
export interface DocumentUploadResult {
  success: boolean;
  document?: Document;
  erreur?: string;
  avertissements?: string[];
}

// --- Actions groupées ---
export interface DocumentBulkAction {
  action: 'supprimer' | 'archiver' | 'exporter' | 'deplacer' | 'externaliser';
  documentIds: string[];
  options?: {
    nouvelleCategorie?: CategorieDocument;
    formatExport?: 'zip' | 'individual';
    confirmation?: boolean;
  };
}

export interface DocumentBulkResult {
  success: boolean;
  traites: number;
  erreurs: Array<{
    documentId: string;
    erreur: string;
  }>;
}

// --- Entités supportant les pièces jointes ---
export const ENTITES_AVEC_DOCUMENTS = [
  { type: 'reunion', label: 'Réunions', icone: 'Calendar' },
  { type: 'audit', label: 'Audits', icone: 'ClipboardCheck' },
  { type: 'action', label: 'Actions', icone: 'CheckSquare' },
  { type: 'jalon', label: 'Jalons projet', icone: 'Flag' },
  { type: 'risque', label: 'Risques', icone: 'AlertTriangle' },
  { type: 'handover', label: 'Handover (DOE)', icone: 'FileText' },
  { type: 'evaluation', label: 'Évaluations', icone: 'Star' },
] as const;

// --- Fonctions utilitaires ---
export function getTypeFichier(extension: string): TypeFichierSupporte | undefined {
  return TYPES_FICHIERS_SUPPORTES.find(t => t.extension === extension.toLowerCase());
}

export function estFichierSupporte(nomFichier: string): boolean {
  const extension = '.' + nomFichier.split('.').pop()?.toLowerCase();
  return TYPES_FICHIERS_SUPPORTES.some(t => t.extension === extension);
}

export function getTailleMaxPourType(extension: string): number {
  const type = getTypeFichier(extension);
  return type ? type.tailleMaxMo * 1024 * 1024 : 10 * 1024 * 1024; // 10 MB par défaut
}

export function formatTaille(octets: number): string {
  if (octets < 1024) return `${octets} B`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} KB`;
  return `${(octets / (1024 * 1024)).toFixed(1)} MB`;
}

export function getRetentionPourCategorie(categorie: CategorieDocument): number {
  return RETENTION_PAR_CATEGORIE[categorie] || 5;
}
