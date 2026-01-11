// ============================================
// TYPES EXPORT HTML
// Conformément au Cahier des Charges v1.1
// ============================================

// --- Types d'export HTML ---
export type HtmlExportType =
  | 'dashboard'
  | 'rapport'
  | 'comparateur'
  | 'analyse';

// --- Templates d'export ---
export type ExportTemplate =
  | 'executif'      // Synthèse une page pour direction
  | 'operationnel'  // Détail complet pour équipes
  | 'investisseur'  // Focus financier et valorisation
  | 'presentation'; // Format slides horizontales

// --- Options d'export HTML pour Dashboard ---
export interface DashboardExportOptions {
  centreId: string;
  periode: {
    type: 'mois' | 'trimestre' | 'annee';
    valeur: string; // Format: YYYY-MM, YYYY-Q1, YYYY
  };
  graphiquesInteractifs: boolean; // Chart.js embarqué ou images statiques
  inclureAlertes: boolean;
  inclureCommentaires: boolean;
  inclureTendances: boolean;
  watermark: boolean;
  watermarkTexte?: string;
  template: ExportTemplate;
}

// --- Options d'export HTML pour Rapport ---
export interface RapportExportOptions {
  rapportId: string;
  tableDesMatieres: boolean;
  numerotationPages: boolean;
  modePresentation: boolean; // Plein écran slide par slide
  donneesBrutesJson: boolean;
  optimiserImpression: boolean;
  template: ExportTemplate;
}

// --- Options d'export Comparateur ---
export interface ComparateurExportOptions {
  centreIds: string[];
  kpisSelectionnes: string[];
  periode: {
    debut: string;
    fin: string;
  };
  inclureGraphiquesRadar: boolean;
  inclureClassement: boolean;
  inclureEvolution: boolean;
  template: ExportTemplate;
}

// --- Configuration de personnalisation visuelle ---
export interface ExportPersonalisation {
  logo?: string; // Base64
  organisation: string;
  paletteCouleurs: {
    primaire: string;
    secondaire: string;
    accent: string;
    succes: string;
    warning: string;
    danger: string;
  };
  enTete: {
    afficher: boolean;
    texte?: string;
    hauteur: number;
  };
  piedDePage: {
    afficher: boolean;
    texte?: string;
    inclureDate: boolean;
    inclureNumeroPage: boolean;
  };
  watermark: {
    actif: boolean;
    texte: string;
    opacite: number; // 0-1
    rotation: number; // degrés
  };
  mentionsLegales?: string;
}

// --- Structure du fichier HTML généré ---
export interface HtmlExportResult {
  success: boolean;
  html?: string;
  filename: string;
  tailleMo: number;
  assets?: {
    images: string[]; // Base64 des images
    scripts: string[]; // Scripts embarqués
    styles: string; // CSS embarqué
  };
  erreurs?: string[];
}

// --- Export en archive ZIP ---
export interface ZipExportOptions {
  inclureAssetsExterne: boolean;
  structureDossiers: boolean;
  inclureDonneesJson: boolean;
}

export interface ZipExportResult {
  success: boolean;
  blob?: Blob;
  filename: string;
  fichiers: string[];
  tailleMo: number;
  erreurs?: string[];
}

// --- Prévisualisation ---
export interface ExportPreview {
  html: string;
  miniature?: string; // Image base64 de la première page
  nombrePages: number;
  tempsGeneration: number;
}

// --- Paramètres Chart.js pour export ---
export interface ChartExportConfig {
  type: 'embedded' | 'image';
  resolution: 'standard' | 'haute' | 'retina';
  animations: boolean;
  responsive: boolean;
  maintainAspectRatio: boolean;
}

// --- En-tête et pied de page HTML ---
export interface HtmlHeader {
  titre: string;
  sousTitre?: string;
  logo?: string;
  date: string;
  auteur: string;
  organisation: string;
  centreNom?: string;
  periodeTexte?: string;
}

export interface HtmlFooter {
  texte: string;
  numeroPage?: number;
  totalPages?: number;
  mentionsLegales?: string;
  signature?: string;
}

// --- Section de rapport HTML ---
export interface HtmlSection {
  id: string;
  titre: string;
  niveau: 1 | 2 | 3 | 4;
  contenu: string; // HTML
  ancre: string;
  sousSections?: HtmlSection[];
}

// --- Table des matières générée ---
export interface TableDesMatieres {
  sections: Array<{
    titre: string;
    niveau: number;
    ancre: string;
    page?: number;
  }>;
}
