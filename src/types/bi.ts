// ============================================
// TYPES BI - Modules Business Intelligence
// Application Immobilier Commercial
// ============================================

// ===========================================
// MODULE IMPORT - Types
// ===========================================

export type CategorieImport =
  | 'etat_locatif'
  | 'loyers'
  | 'frequentation'
  | 'chiffre_affaires'
  | 'charges'
  | 'travaux'
  | 'budget'
  | 'valorisation'
  | 'bail'
  | 'surface'
  | 'energie'
  | 'satisfaction';

export type FormatFichier = 'excel' | 'csv' | 'pdf' | 'json';

export type StatutImport = 'en_attente' | 'en_cours' | 'succes' | 'erreur' | 'partiel';

export type QualiteDonnees = 'excellent' | 'bon' | 'moyen' | 'faible';

export interface ColonneMapping {
  colonneSource: string;
  colonneDestination: string;
  typeDetecte: 'string' | 'number' | 'date' | 'boolean';
  transformation?: string;
}

export interface ValidationErreur {
  ligne: number;
  colonne: string;
  valeur: string;
  erreur: string;
  severite: 'erreur' | 'avertissement';
}

export interface FichierImport {
  id: string;
  centreId: string;
  dossierId?: string;
  nom: string;
  format: FormatFichier;
  taille: number;
  contenu: string; // Base64
  categorie: CategorieImport;
  mapping: ColonneMapping[];
  scoreQualite: number; // 0-100
  qualite: QualiteDonnees;
  lignesTotal: number;
  lignesValides: number;
  lignesErreur: number;
  erreurs: ValidationErreur[];
  donneesParsees: Record<string, unknown>[];
  statut: StatutImport;
  version: number;
  remplaceImportId?: string;
  estDerniereVersion: boolean;
  importePar: string;
  dateImport: string;
  createdAt: string;
  updatedAt: string;
}

export interface DossierImport {
  id: string;
  centreId: string;
  parentId?: string;
  nom: string;
  description?: string;
  categorie?: CategorieImport;
  couleur?: string;
  ordre: number;
  createdAt: string;
  updatedAt: string;
}

// --- Donnees Importees par Categorie ---

export interface EtatLocatif {
  id: string;
  centreId: string;
  fichierImportId: string;
  lotId: string;
  lotReference: string;
  locataireNom: string;
  locataireEnseigne: string;
  activiteCode: string;
  activiteLibelle?: string;
  surfaceGLA: number;
  surfaceUtile?: number;
  etage?: string;
  zone?: string;
  bailDebut: string;
  bailFin: string;
  loyerMinimumGaranti: number;
  loyerVariableTaux?: number;
  loyerVariableSeuil?: number;
  chargesProvision: number;
  depotGarantie: number;
  indexationIndice: 'ILC' | 'ILAT' | 'ICC';
  statutOccupation: 'occupe' | 'vacant' | 'en_travaux' | 'pre_loue';
  createdAt: string;
}

export interface DonneesLoyer {
  id: string;
  centreId: string;
  fichierImportId: string;
  lotId: string;
  locataireEnseigne: string;
  periodeAnnee: number;
  periodeMois: number;
  loyerAppele: number;
  loyerEncaisse: number;
  chargesAppelees: number;
  chargesEncaissees: number;
  retardJours?: number;
  statut: 'paye' | 'partiel' | 'impaye';
  createdAt: string;
}

export interface DonneesFrequentation {
  id: string;
  centreId: string;
  fichierImportId: string;
  date: string;
  entreesTotal: number;
  sortiesTotal?: number;
  entreeId?: string;
  zone?: string;
  heureDebut?: string;
  heureFin?: string;
  jourSemaine: string;
  estJourFerie: boolean;
  meteo?: string;
  evenementSpecial?: string;
  createdAt: string;
}

export interface DonneesChiffreAffaires {
  id: string;
  centreId: string;
  fichierImportId: string;
  lotId: string;
  locataireEnseigne: string;
  periodeAnnee: number;
  periodeMois: number;
  caDeclare: number;
  caCumulAnnee?: number;
  caN1?: number;
  variationVsN1?: number;
  caM2?: number;
  tauxEffort?: number;
  loyerVariableDu?: number;
  statutDeclaration: 'declare' | 'estime' | 'manquant';
  createdAt: string;
}

export interface DonneesCharges {
  id: string;
  centreId: string;
  fichierImportId: string;
  periodeAnnee: number;
  periodeMois?: number;
  categorieCharge: string;
  sousCategorie?: string;
  montantBudget: number;
  montantReel: number;
  montantRefacturable: number;
  montantNonRefacturable: number;
  cleRepartition: 'tantiemes' | 'surface' | 'ca' | 'forfait';
  tauxRefacturation: number;
  fournisseur?: string;
  createdAt: string;
}

export interface DonneesBail {
  id: string;
  centreId: string;
  fichierImportId: string;
  lotId: string;
  locataireNom: string;
  locataireEnseigne: string;
  locataireSIRET?: string;
  dateSignature: string;
  dateDebut: string;
  dateFin: string;
  dateBreak?: string;
  dureeInitiale: number;
  loyerAnnuel: number;
  chargesAnnuelles: number;
  depotGarantie: number;
  indexation: 'ILC' | 'ILAT' | 'ICC';
  franchiseMois?: number;
  paliers?: { debut: string; fin: string; loyer: number }[];
  droitEntree?: number;
  travauxBailleur?: number;
  travauxPreneur?: number;
  clausesParticulieres?: string;
  createdAt: string;
}

export interface DonneesTravaux {
  id: string;
  centreId: string;
  fichierImportId: string;
  reference: string;
  libelle: string;
  categorie: 'capex' | 'maintenance' | 'renovation' | 'mise_aux_normes';
  lotId?: string;
  zone?: string;
  montantBudget: number;
  montantEngage: number;
  montantRealise: number;
  dateDebut: string;
  dateFin?: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  entreprise?: string;
  createdAt: string;
}

export interface DonneesValorisation {
  id: string;
  centreId: string;
  fichierImportId: string;
  dateValorisation: string;
  valeurVenale: number;
  valeurLocative?: number;
  tauxCapitalisation: number;
  tauxActualisation?: number;
  methodologie: 'dcf' | 'comparaison' | 'capitalisation';
  expert?: string;
  hypotheses?: Record<string, unknown>;
  createdAt: string;
}

export interface DonneesEnergie {
  id: string;
  centreId: string;
  fichierImportId: string;
  periodeAnnee: number;
  periodeMois: number;
  typeEnergie: 'electricite' | 'gaz' | 'eau' | 'chauffage' | 'climatisation';
  consommation: number;
  unite: string;
  cout: number;
  zone?: string;
  createdAt: string;
}

export interface DonneesSatisfaction {
  id: string;
  centreId: string;
  fichierImportId: string;
  date: string;
  typeEnquete: 'nps' | 'satisfaction' | 'mystere';
  scoreGlobal: number;
  nps?: number;
  nombreRepondants: number;
  details?: Record<string, number>;
  commentaires?: string[];
  createdAt: string;
}

// ===========================================
// MODULE CATALOGUE - Types
// ===========================================

export type CategorieRapport =
  | 'asset_management'
  | 'property_management'
  | 'leasing'
  | 'centre_commercial'
  | 'financier'
  | 'investissement'
  | 'projet';

export type TypeRapportCode =
  // Asset Management
  | 'PERF_ACTIF'
  | 'ANALYSE_PORTEFEUILLE'
  | 'BUSINESS_PLAN'
  | 'VALORISATION_DCF'
  // Property Management
  | 'ETAT_LOCATIF_REPORT'
  | 'SUIVI_BAUX'
  | 'GESTION_CHARGES'
  | 'REPORTING_PROPRIETAIRE'
  // Leasing
  | 'PIPELINE_COMMERCIAL'
  | 'MERCHANDISING_MIX'
  | 'BENCHMARK_LOYERS'
  | 'SUIVI_VACANCE'
  // Centre Commercial
  | 'TDB_CENTRE'
  | 'ANALYSE_FREQUENTATION'
  | 'PERF_ENSEIGNES'
  | 'ANALYSE_CA'
  // Financier
  | 'COMPTE_RESULTAT'
  | 'CF_OPERATIONNEL'
  | 'NOI_ANALYSIS'
  | 'BUDGET_VS_REEL'
  // Investissement
  | 'DUE_DILIGENCE'
  | 'ETUDE_MARCHE'
  | 'ANALYSE_CONCURRENTIELLE'
  | 'SCENARIOS_ACQUISITION'
  // Projet / Mobilisation
  | 'DASHBOARD_PROJET'
  | 'SUIVI_JALONS'
  | 'SUIVI_RECRUTEMENT'
  | 'COMMERCIALISATION_PROJET'
  | 'BUDGET_PROJET'
  | 'RISQUES_PROJET'
  | 'HANDOVER_CHECKLIST'
  | 'REPORTING_PROJET';

export type TypeGraphique =
  | 'ligne'
  | 'barre'
  | 'barre_horizontale'
  | 'barre_empilee'
  | 'camembert'
  | 'donut'
  | 'aire'
  | 'aire_empilee'
  | 'radar'
  | 'jauge'
  | 'treemap'
  | 'waterfall'
  | 'scatter'
  | 'heatmap'
  | 'funnel';

export type NiveauComplexite = 'simple' | 'intermediaire' | 'avance';

export interface KPIDefinition {
  code: string;
  nom: string;
  nomCourt: string;
  description: string;
  formule: string;
  unite: 'EUR' | '%' | 'annees' | 'mois' | 'm2' | 'EUR/m2' | 'EUR/m2/an' | 'visiteurs' | 'score' | 'ratio' | 'nombre';
  formatAffichage: string;
  categoriesRequises: CategorieImport[];
  seuilVert?: number;
  seuilOrange?: number;
  seuilRouge?: number;
  tendancePositive: 'hausse' | 'baisse';
  icone?: string;
}

export interface SectionRapportType {
  id: string;
  titre: string;
  titreCourt: string;
  description: string;
  ordre: number;
  kpisCodes: string[];
  graphiquesRecommandes: TypeGraphique[];
  contenuType: 'texte' | 'tableau' | 'graphique' | 'mixte';
  optionnel: boolean;
  promptIA?: string;
}

export interface TypeRapportDefinition {
  id: string;
  code: TypeRapportCode;
  nom: string;
  nomCourt: string;
  description: string;
  categorie: CategorieRapport;
  complexite: NiveauComplexite;
  pagesMin: number;
  pagesMax: number;
  categoriesRequises: CategorieImport[];
  kpis: KPIDefinition[];
  sections: SectionRapportType[];
  graphiquesRecommandes: TypeGraphique[];
  frequenceRecommandee: 'quotidien' | 'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel' | 'ponctuel';
  destinatairesTypes: string[];
  combinableAvec: TypeRapportCode[];
  icone: string;
  couleur: string;
  estPremium: boolean;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackRapport {
  id: string;
  code: string;
  nom: string;
  description: string;
  rapportsCodes: TypeRapportCode[];
  pagesEstimees: string;
  periodicite: string;
  destinataires: string[];
  icone: string;
  couleur: string;
  createdAt: string;
  updatedAt: string;
}

// ===========================================
// MODULE RAPPORT STUDIO - Types
// ===========================================

export type StatutRapport = 'brouillon' | 'en_revision' | 'approuve' | 'publie' | 'archive';

export type TypeBloc =
  | 'paragraphe'
  | 'tableau'
  | 'graphique'
  | 'kpi_card'
  | 'kpi_grid'
  | 'image'
  | 'titre'
  | 'separateur'
  | 'sommaire'
  | 'saut_page';

export interface StyleBloc {
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  border?: string;
}

export interface BlocBase {
  id: string;
  ordre: number;
  style?: StyleBloc;
}

export interface BlocParagraphe extends BlocBase {
  type: 'paragraphe';
  contenu: string; // HTML ou Markdown
}

export interface ColonneTableau {
  key: string;
  label: string;
  format?: 'texte' | 'nombre' | 'pourcentage' | 'euro' | 'date';
  align?: 'left' | 'center' | 'right';
  largeur?: string;
}

export interface BlocTableau extends BlocBase {
  type: 'tableau';
  titre?: string;
  colonnes: ColonneTableau[];
  donnees: Record<string, unknown>[];
  afficherTotal?: boolean;
  triable?: boolean;
  pagination?: boolean;
}

export interface SerieGraphique {
  dataKey: string;
  color?: string;
  name?: string;
  type?: 'line' | 'bar' | 'area';
}

export interface BlocGraphique extends BlocBase {
  type: 'graphique';
  titre?: string;
  typeGraphique: TypeGraphique;
  donnees: Record<string, unknown>[];
  configuration: {
    xAxis?: string;
    yAxis?: string;
    series: SerieGraphique[];
    legende?: boolean;
    grille?: boolean;
    tooltip?: boolean;
    animation?: boolean;
  };
  hauteur?: number;
}

export interface BlocKPICard extends BlocBase {
  type: 'kpi_card';
  kpiCode: string;
  titre?: string;
  valeur: number;
  unite: string;
  tendance?: 'hausse' | 'baisse' | 'stable';
  variationPourcentage?: number;
  variationAbsolue?: number;
  objectif?: number;
  statut?: 'vert' | 'orange' | 'rouge';
  icone?: string;
  sparklineData?: number[];
}

export interface BlocKPIGrid extends BlocBase {
  type: 'kpi_grid';
  titre?: string;
  kpis: Omit<BlocKPICard, 'id' | 'ordre' | 'type'>[];
  colonnes: 2 | 3 | 4;
}

export interface BlocImage extends BlocBase {
  type: 'image';
  src: string; // Base64 ou URL
  alt?: string;
  legende?: string;
  largeur?: 'auto' | '50%' | '75%' | '100%';
}

export interface BlocTitre extends BlocBase {
  type: 'titre';
  niveau: 1 | 2 | 3 | 4;
  texte: string;
  numerotation?: boolean;
}

export interface BlocSeparateur extends BlocBase {
  type: 'separateur';
  variante: 'ligne' | 'espace' | 'pointilles';
  epaisseur?: number;
}

export interface BlocSommaire extends BlocBase {
  type: 'sommaire';
  niveauMax: 1 | 2 | 3;
  titre?: string;
}

export interface BlocSautPage extends BlocBase {
  type: 'saut_page';
}

export type BlocRapport =
  | BlocParagraphe
  | BlocTableau
  | BlocGraphique
  | BlocKPICard
  | BlocKPIGrid
  | BlocImage
  | BlocTitre
  | BlocSeparateur
  | BlocSommaire
  | BlocSautPage;

export interface SectionRapport {
  id: string;
  titre: string;
  ordre: number;
  repliee?: boolean;
  blocs: BlocRapport[];
}

export interface VersionRapport {
  id: string;
  numero: number;
  contenu: SectionRapport[];
  auteur: string;
  commentaire?: string;
  dateCreation: string;
}

export interface CommentaireRevision {
  id: string;
  auteur: string;
  contenu: string;
  sectionId?: string;
  blocId?: string;
  resolu: boolean;
  dateCreation: string;
}

export interface Rapport {
  id: string;
  centreId: string;
  typeRapportCode: TypeRapportCode;
  titre: string;
  sousTitre?: string;
  description?: string;
  statut: StatutRapport;
  auteur: string;
  reviseur?: string;
  approbateur?: string;
  periodeDebut: string;
  periodeFin: string;
  periodeLabel: string;
  sourcesDonneesIds: string[];
  sections: SectionRapport[];
  versions: VersionRapport[];
  versionActuelle: number;
  commentairesRevision: CommentaireRevision[];
  resumeExecutif?: string;
  recommandations?: string[];
  dateCreation: string;
  dateModification: string;
  dateSoumission?: string;
  dateApprobation?: string;
  datePublication?: string;
  exportsGeneres: ExportGenere[];
  scoreConfiance?: number;
  completudeDonnees?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExportGenere {
  id: string;
  format: FormatExport;
  fichier?: string; // Base64
  tailleFichier?: number;
  dateGeneration: string;
  genereePar: string;
  nombreTelechargements: number;
}

export interface ModeleRapport {
  id: string;
  typeRapportCode: TypeRapportCode;
  nom: string;
  description?: string;
  sections: SectionRapport[];
  estPublic: boolean;
  auteur: string;
  nombreUtilisations: number;
  createdAt: string;
  updatedAt: string;
}

// ===========================================
// MOTEUR D'ANALYSE - Types
// ===========================================

export type TypeKPICalcule =
  | 'NOI'
  | 'NOI_M2'
  | 'YIELD_BRUT'
  | 'YIELD_NET'
  | 'WAULT'
  | 'WALB'
  | 'TAUX_OCCUPATION_PHYSIQUE'
  | 'TAUX_OCCUPATION_FINANCIER'
  | 'TAUX_VACANCE'
  | 'TAUX_EFFORT'
  | 'TAUX_EFFORT_MOYEN'
  | 'REVERSION'
  | 'LOYER_MOYEN_M2'
  | 'LOYER_TOTAL'
  | 'CHARGES_TOTALES'
  | 'CHARGES_M2'
  | 'TAUX_REFACTURATION'
  | 'CA_TOTAL'
  | 'CA_M2'
  | 'CA_VISITEUR'
  | 'FREQUENTATION_TOTALE'
  | 'FREQUENTATION_JOUR_MOYEN'
  | 'TAUX_TRANSFORMATION'
  | 'PANIER_MOYEN'
  | 'TAUX_RECOUVREMENT'
  | 'DSO'
  | 'CONCENTRATION_TOP5'
  | 'CONCENTRATION_TOP10'
  | 'DIVERSITE_ACTIVITES'
  | 'RATIO_ANCRES'
  | 'VALEUR_ACTIF'
  | 'VALEUR_M2';

export interface ResultatKPI {
  id: string;
  centreId: string;
  typeKPI: TypeKPICalcule;
  valeur: number;
  valeurFormatee: string;
  unite: string;
  periodeDebut: string;
  periodeFin: string;
  periodeLabel: string;
  valeurN1?: number;
  variationAbsolue?: number;
  variationPourcentage?: number;
  tendance: 'hausse' | 'baisse' | 'stable';
  statut: 'vert' | 'orange' | 'rouge';
  details?: Record<string, unknown>;
  sourcesDonnees: string[];
  dateCalcul: string;
  createdAt: string;
}

export type TypeInsight =
  | 'concentration_risque'
  | 'concentration_activite'
  | 'vacance_anormale'
  | 'vacance_prolongee'
  | 'echeances_groupees'
  | 'echeance_majeure'
  | 'sous_performance_loyer'
  | 'sous_performance_ca'
  | 'sur_performance'
  | 'opportunite_reversion'
  | 'tendance_frequentation_baisse'
  | 'tendance_frequentation_hausse'
  | 'tendance_ca_baisse'
  | 'tendance_ca_hausse'
  | 'anomalie_ca'
  | 'anomalie_charges'
  | 'impaye_critique'
  | 'effort_excessif'
  | 'noi_degradation'
  | 'benchmark_inferieur';

export type SeveriteInsight = 'info' | 'attention' | 'alerte' | 'critique';

export interface Insight {
  id: string;
  centreId: string;
  type: TypeInsight;
  severite: SeveriteInsight;
  titre: string;
  description: string;
  valeurActuelle: number;
  seuilReference?: number;
  ecartPourcentage?: number;
  entitesImpactees: string[];
  entitesDetails?: { id: string; nom: string; valeur?: number }[];
  impact: 'faible' | 'moyen' | 'eleve' | 'critique';
  recommandations: string[];
  actionsLiees?: string[];
  dateDetection: string;
  dateExpiration?: string;
  traitee: boolean;
  dateTraitement?: string;
  traitePar?: string;
  commentaireTraitement?: string;
  createdAt: string;
  updatedAt: string;
}

export type TypeRegleAlerte =
  | 'vacance_elevee'
  | 'effort_excessif'
  | 'wault_faible'
  | 'walb_faible'
  | 'impaye_critique'
  | 'recouvrement_faible'
  | 'frequentation_baisse'
  | 'ca_chute'
  | 'noi_baisse'
  | 'echeance_proche'
  | 'concentration_elevee'
  | 'charges_depassement'
  | 'custom';

export type OperateurComparaison = '>' | '<' | '>=' | '<=' | '==' | '!=' | 'entre';

export interface RegleAlerte {
  id: string;
  centreId?: string; // null = globale
  type: TypeRegleAlerte;
  nom: string;
  description: string;
  condition: {
    kpi: TypeKPICalcule;
    operateur: OperateurComparaison;
    seuil: number;
    seuilMax?: number; // pour operateur 'entre'
  };
  priorite: 'info' | 'normale' | 'haute' | 'critique';
  actif: boolean;
  notificationEmail: boolean;
  destinatairesEmail?: string[];
  frequenceVerification: 'temps_reel' | 'quotidien' | 'hebdomadaire' | 'mensuel';
  derniereVerification?: string;
  nombreDeclenchements: number;
  createdAt: string;
  updatedAt: string;
}

export interface AlerteGeneree {
  id: string;
  centreId: string;
  regleId: string;
  titre: string;
  message: string;
  kpiConcerne: TypeKPICalcule;
  valeurActuelle: number;
  seuilDeclenche: number;
  priorite: 'info' | 'normale' | 'haute' | 'critique';
  lue: boolean;
  traitee: boolean;
  dateGeneration: string;
  dateTraitement?: string;
  traitePar?: string;
  createdAt: string;
}

export interface TendancePrediction {
  id: string;
  centreId: string;
  kpi: TypeKPICalcule;
  valeurActuelle: number;
  valeurPredite: number;
  horizon: number; // mois
  confiance: number; // 0-100
  tendance: 'hausse' | 'baisse' | 'stable';
  variationPredite: number;
  variationPourcentage: number;
  donneesHistoriques: { periode: string; valeur: number }[];
  predictions: { periode: string; valeur: number; confianceBasse: number; confianceHaute: number }[];
  methodologie: 'lineaire' | 'moyenne_mobile' | 'exponentiel';
  dateCalcul: string;
  createdAt: string;
}

export interface BenchmarkComparaison {
  id: string;
  centreId: string;
  kpi: TypeKPICalcule;
  valeurCentre: number;
  valeurBenchmark: number;
  ecart: number;
  ecartPourcentage: number;
  position: 'superieur' | 'inferieur' | 'egal';
  percentile?: number;
  sourceBenchmark: string;
  dateComparaison: string;
  createdAt: string;
}

// ===========================================
// EXPORT - Types
// ===========================================

export type FormatExport = 'pdf' | 'xlsx' | 'docx' | 'pptx' | 'html';

export interface ConfigExportRapport {
  format: FormatExport;
  inclureSommaire: boolean;
  inclureGraphiques: boolean;
  inclureTableaux: boolean;
  inclureKPIs: boolean;
  orientation: 'portrait' | 'paysage';
  taillePolice: number;
  entetePied: boolean;
  entete?: {
    logo?: string;
    titre?: string;
    sousTitre?: string;
  };
  piedPage?: {
    afficherPage: boolean;
    afficherDate: boolean;
    textePersonnalise?: string;
  };
  filigrane?: string;
  qualiteImages: 'basse' | 'moyenne' | 'haute';
  compresser: boolean;
}

// ===========================================
// CONFIGURATION - Types
// ===========================================

export interface ConfigurationBI {
  id: string;
  centreId: string;
  // Seuils KPIs par defaut
  seuilsKPI: {
    vacance: { vert: number; orange: number; rouge: number };
    effort: { vert: number; orange: number; rouge: number };
    wault: { vert: number; orange: number; rouge: number };
    recouvrement: { vert: number; orange: number; rouge: number };
    noi: { vert: number; orange: number; rouge: number };
  };
  // Parametres Import
  importConfig: {
    tailleFichierMax: number; // Mo
    formatsAutorises: FormatFichier[];
    detecterDoublons: boolean;
    versionnerFichiers: boolean;
  };
  // Parametres Rapports
  rapportConfig: {
    modeleParDefaut?: string;
    exportFormatParDefaut: FormatExport;
    inclureLogo: boolean;
    logoBase64?: string;
  };
  // Parametres Analyse
  analyseConfig: {
    frequenceCalculKPI: 'quotidien' | 'hebdomadaire' | 'mensuel';
    historiqueKPIMois: number;
    predictionHorizonMois: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ===========================================
// METADATA - Types Labels et Couleurs
// ===========================================

export const CATEGORIE_IMPORT_LABELS: Record<CategorieImport, string> = {
  etat_locatif: 'État Locatif',
  loyers: 'Loyers et Charges',
  frequentation: 'Fréquentation',
  chiffre_affaires: 'CA Locataires',
  charges: 'Charges et Refacturations',
  travaux: 'Travaux et Investissements',
  budget: 'Budget',
  valorisation: 'Valorisation',
  bail: 'Données Contractuelles',
  surface: 'Surfaces et Plans',
  energie: 'Consommations Énergétiques',
  satisfaction: 'Enquêtes Satisfaction',
};

export const CATEGORIE_RAPPORT_LABELS: Record<CategorieRapport, string> = {
  asset_management: 'Asset Management',
  property_management: 'Property Management',
  leasing: 'Leasing & Commercialisation',
  centre_commercial: 'Centre Commercial',
  financier: 'Financier',
  investissement: 'Investissement',
  projet: 'Projet & Mobilisation',
};

export const CATEGORIE_RAPPORT_COULEURS: Record<CategorieRapport, string> = {
  asset_management: '#3b82f6', // blue
  property_management: '#10b981', // teal
  leasing: '#f97316', // orange
  centre_commercial: '#8b5cf6', // purple
  financier: '#ec4899', // pink
  investissement: '#06b6d4', // cyan
  projet: '#84cc16', // lime - construction/project
};

export const COMPLEXITE_LABELS: Record<NiveauComplexite, string> = {
  simple: 'Simple',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

export const STATUT_RAPPORT_LABELS: Record<StatutRapport, string> = {
  brouillon: 'Brouillon',
  en_revision: 'En Révision',
  approuve: 'Approuvé',
  publie: 'Publié',
  archive: 'Archivé',
};

export const SEVERITE_INSIGHT_LABELS: Record<SeveriteInsight, string> = {
  info: 'Information',
  attention: 'Attention',
  alerte: 'Alerte',
  critique: 'Critique',
};

export const SEVERITE_INSIGHT_COULEURS: Record<SeveriteInsight, string> = {
  info: '#3b82f6',
  attention: '#f59e0b',
  alerte: '#ef4444',
  critique: '#dc2626',
};
