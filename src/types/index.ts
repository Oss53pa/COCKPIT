// ============================================
// TYPES PRINCIPAUX - Application Cockpit CRMC
// ============================================

// --- Types de base ---
export type Departement =
  | 'direction'
  | 'facility'
  | 'finance'
  | 'securite'
  | 'commercial_marketing'
  | 'administration';

export type FrequenceMesure =
  | 'quotidien'
  | 'hebdomadaire'
  | 'mensuel'
  | 'bimestriel'
  | 'trimestriel'
  | 'semestriel'
  | 'annuel';

export type StatutAction =
  | 'a_faire'
  | 'en_cours'
  | 'en_attente'
  | 'termine'
  | 'annule';

export type TypeReunion =
  | 'point_hebdo_cm'
  | 'comite_pilotage'
  | 'revue_mensuelle'
  | 'revue_trimestrielle'
  | 'revue_strategique'
  | 'one_to_one'
  | 'autre';

export type StatutKPI = 'vert' | 'orange' | 'rouge';

export type PrioriteAction = 'critique' | 'haute' | 'moyenne' | 'basse';

export type AlertePriorite = 'critique' | 'haute' | 'normale' | 'info';

// --- Centre Commercial ---
export interface SeuilsAlerte {
  kpiRouge: number;
  kpiOrange: number;
  retardAction: number; // jours
  rappelSaisie: number; // jours avant échéance
}

export interface ConfigurationCentre {
  deviseMonetaire: string;
  exerciceFiscal: { debut: number; fin: number };
  objectifsAnnee: number;
  seuilsAlerte: SeuilsAlerte;
}

export interface CentreCommercial {
  id: string;
  code: string;
  nom: string;
  adresse: string;
  ville: string;
  dateOuverture: string;
  surfaceTotale: number;
  surfaceLocative: number;
  nombreNiveaux: number;
  nombreLocaux: number;
  statut: 'actif' | 'en_construction' | 'inactif';
  modeExploitationActif: boolean; // Permet d'activer le mode exploitation en avance (période transitoire)
  logo?: string;
  couleurTheme: string;
  configuration: ConfigurationCentre;
  createdAt: string;
  updatedAt: string;
}

// --- Structure Organisationnelle ---
export interface ObjectifPoste {
  id: string;
  description: string;
  poids: number;
  cible: string | number;
}

export interface Poste {
  id: string;
  centreId: string;
  titre: string;
  titulaire: string;
  email?: string;
  telephone?: string;
  rattachement?: string;
  departement: Departement;
  objectifs: ObjectifPoste[];
  createdAt: string;
  updatedAt: string;
}

// --- Équipe et Membres ---
export type TypeContrat = 'cdi' | 'cdd' | 'stage' | 'interim' | 'consultant' | 'prestataire';
export type StatutMembre = 'actif' | 'conge' | 'formation' | 'mission' | 'inactif';
export type NiveauCompetence = 'debutant' | 'intermediaire' | 'confirme' | 'expert';

export interface Competence {
  id: string;
  nom: string;
  niveau: NiveauCompetence;
  dateAcquisition?: string;
  certification?: string;
}

export interface Formation {
  id: string;
  titre: string;
  organisme: string;
  dateDebut: string;
  dateFin?: string;
  enCours: boolean;
  certification?: string;
}

export interface Absence {
  id: string;
  type: 'conge_paye' | 'maladie' | 'formation' | 'mission' | 'autre';
  dateDebut: string;
  dateFin: string;
  motif?: string;
  validee: boolean;
}

export interface MembreEquipe {
  id: string;
  centreId: string;
  // Informations personnelles
  matricule: string;
  nom: string;
  prenom: string;
  photo?: string;
  email: string;
  telephone: string;
  telephoneUrgence?: string;
  dateNaissance?: string;
  adresse?: string;
  // Informations professionnelles
  poste: string;
  departement: Departement;
  typeContrat: TypeContrat;
  dateEmbauche: string;
  dateFinContrat?: string;
  managerId?: string; // ID du supérieur hiérarchique
  statut: StatutMembre;
  // Rémunération
  salaireBase?: number;
  devise: string;
  // Compétences et formations
  competences: Competence[];
  formations: Formation[];
  // Absences
  absences: Absence[];
  // Notes et objectifs
  objectifs: ObjectifPoste[];
  notes?: string;
  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

export interface StatistiquesEquipe {
  totalMembres: number;
  parDepartement: Record<Departement, number>;
  parTypeContrat: Record<TypeContrat, number>;
  parStatut: Record<StatutMembre, number>;
  masseSalariale?: number;
  ancienneteMovenne: number;
  tauxPresence: number;
}

// --- Axes Stratégiques et Objectifs ---
export interface Objectif {
  id: string;
  axeId: string;
  centreId: string;
  code: string;
  intitule: string;
  description: string;
  kpiNom: string;
  cible: string | number;
  poids: number;
  frequenceMesure: FrequenceMesure;
  responsableId?: string;
  formuleCalcul?: string;
  seuilVert: number;
  seuilOrange: number;
  seuilRouge: number;
  createdAt: string;
  updatedAt: string;
}

export interface AxeStrategique {
  id: string;
  centreId: string;
  code: string;
  nom: string;
  description: string;
  poids: number;
  couleur: string;
  icone: string;
  ordre: number;
  createdAt: string;
  updatedAt: string;
}

// --- Mesures et Suivis ---
export interface Periode {
  annee: number;
  mois?: number;
  trimestre?: number;
  semestre?: number;
  semaine?: number;
}

export interface DocumentAttache {
  id: string;
  nom: string;
  type: string;
  taille: number;
  contenu: string; // Base64
  dateAjout: string;
}

export interface Mesure {
  id: string;
  objectifId: string;
  centreId: string;
  periode: Periode;
  valeurReelle: number;
  valeurCible: number;
  ecart: number;
  ecartPourcentage: number;
  statut: StatutKPI;
  commentaire?: string;
  piecesJointes: DocumentAttache[];
  dateSaisie: string;
  saisiePar: string;
  createdAt: string;
  updatedAt: string;
}

// --- Plans d'Actions ---
export interface Budget {
  prevu: number;
  consomme: number;
  devise: string;
}

export interface Risque {
  id: string;
  description: string;
  probabilite: 'faible' | 'moyenne' | 'elevee';
  impact: 'faible' | 'moyen' | 'eleve';
  mitigation?: string;
}

export interface Commentaire {
  id: string;
  auteur: string;
  contenu: string;
  date: string;
}

export interface SousAction {
  id: string;
  description: string;
  responsableId?: string;
  echeance: string;
  statut: StatutAction;
  avancement: number;
}

export interface PlanAction {
  id: string;
  centreId: string;
  axeId?: string;
  objectifId?: string;
  titre: string;
  description: string;
  priorite: PrioriteAction;
  statut: StatutAction;
  responsableId?: string;
  contributeurs: string[];
  dateDebut: string;
  dateEcheance: string;
  dateRealisation?: string;
  avancement: number;
  sousActions: SousAction[];
  budget?: Budget;
  risques: Risque[];
  commentaires: Commentaire[];
  createdAt: string;
  updatedAt: string;
}

// --- Réunions et Suivis Managériaux ---
export interface Decision {
  id: string;
  description: string;
  responsableId?: string;
  echeance?: string;
}

export interface Reunion {
  id: string;
  centreId: string;
  type: TypeReunion;
  titre: string;
  date: string;
  duree: number;
  participants: string[];
  ordreDuJour: string[];
  compteRendu?: string;
  decisions: Decision[];
  actionsCreees: string[];
  statut: 'planifiee' | 'realisee' | 'annulee' | 'reportee';
  createdAt: string;
  updatedAt: string;
}

// --- Livrables et Documents ---
export interface VersionLivrable {
  id: string;
  dateCreation: string;
  periode: Periode;
  fichier: DocumentAttache;
  statut: 'brouillon' | 'valide' | 'envoye';
  commentaires?: string;
}

export interface Livrable {
  id: string;
  centreId: string;
  axeId: string;
  titre: string;
  description: string;
  frequence: FrequenceMesure;
  destinataire: string;
  modele?: string;
  historique: VersionLivrable[];
  createdAt: string;
  updatedAt: string;
}

// --- Évaluations ---
export interface CritereEvaluation {
  id: string;
  nom: string;
  poids: number;
  note?: number; // 1-4
  commentaire?: string;
}

export interface Evaluation {
  id: string;
  centreId: string;
  posteId: string;
  periode: Periode;
  criteres: CritereEvaluation[];
  noteGlobale?: number;
  pointsForts: string[];
  axesAmelioration: string[];
  objectifsProchainePeriode: string[];
  commentaireGeneral?: string;
  statut: 'brouillon' | 'finalise' | 'valide';
  dateEvaluation?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Audits et Conformité ---
export interface NonConformite {
  id: string;
  description: string;
  gravite: 'mineure' | 'majeure' | 'critique';
  actionCorrective?: string;
  dateDetection: string;
  dateCloture?: string;
  statut: 'ouverte' | 'en_cours' | 'cloturee';
}

export interface Audit {
  id: string;
  centreId: string;
  type: 'interne' | 'externe' | 'reglementaire';
  titre: string;
  description?: string;
  datePlanifiee: string;
  dateRealisation?: string;
  auditeur: string;
  nonConformites: NonConformite[];
  rapport?: DocumentAttache;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  createdAt: string;
  updatedAt: string;
}

// --- Registre des Risques ---
export interface RisqueEntreprise {
  id: string;
  centreId: string;
  categorie: string;
  description: string;
  probabilite: number; // 1-5
  impact: number; // 1-5
  scoreRisque: number; // probabilite * impact
  proprietaire?: string;
  planMitigation?: string;
  statut: 'identifie' | 'en_traitement' | 'accepte' | 'cloture';
  dateIdentification: string;
  dateDerniereRevue?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Alertes et Notifications ---
export interface Alerte {
  id: string;
  centreId?: string;
  type: 'kpi_critique' | 'retard_action' | 'rappel_saisie' | 'echeance_proche' | 'reunion' | 'audit' | 'autre';
  priorite: AlertePriorite;
  titre: string;
  message: string;
  lien?: string;
  entiteType?: string;
  entiteId?: string;
  lue: boolean;
  traitee: boolean;
  dateCreation: string;
  dateTraitement?: string;
}

// --- Configuration Email ---
export interface ConfigEmail {
  provider: 'emailjs' | 'resend' | 'sendgrid' | 'none';
  emailjs?: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
  resend?: {
    apiKey: string;
    fromEmail: string;
  };
  sendgrid?: {
    apiKey: string;
    fromEmail: string;
  };
  recipients: {
    primary: string;
    cc: string[];
  };
  preferences: {
    digestMode: boolean;
    digestTime: string;
    digestDays: number[];
    immediateFor: AlertePriorite[];
  };
  actif: boolean;
}

// --- Paramètres Application ---
export interface ParametresApp {
  id: string;
  theme: 'light' | 'dark' | 'system';
  langue: string;
  configEmail: ConfigEmail;
  derniereConnexion?: string;
  versionDonnees: number;
  createdAt: string;
  updatedAt: string;
}

// --- Import/Export ---
export interface ImportLog {
  id: string;
  centreId: string;
  typeImport: string;
  nomFichier: string;
  dateImport: string;
  lignesTraitees: number;
  lignesErreur: number;
  erreurs: string[];
  statut: 'succes' | 'partiel' | 'echec';
}

export interface ExportConfig {
  format: 'json' | 'pdf' | 'xlsx' | 'pptx';
  contenu: string[];
  periodeDebut?: string;
  periodeFin?: string;
  centreIds?: string[];
}

// --- Types utilitaires ---
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  centreId?: string;
  axeId?: string;
  statut?: string;
  dateDebut?: string;
  dateFin?: string;
  recherche?: string;
}

// ===========================================
// EXPORT TYPES BI
// ===========================================
export * from './bi';

// ===========================================
// EXPORT TYPES PROJET
// ===========================================
export * from './projet';

// ===========================================
// EXPORT TYPES PROFIL UTILISATEUR
// ===========================================
export * from './userProfile';

// ===========================================
// EXPORT TYPES SAUVEGARDE
// ===========================================
export * from './backup';

// ===========================================
// EXPORT TYPES EXPORT HTML
// ===========================================
export * from './htmlExport';

// ===========================================
// EXPORT TYPES TEMPLATES IMPORT
// ===========================================
export * from './importTemplates';

// ===========================================
// EXPORT TYPES SYSCOHADA
// ===========================================
export * from './syscohada';

// ===========================================
// EXPORT TYPES JOURNAL
// ===========================================
export * from './journal';

// ===========================================
// EXPORT TYPES DOCUMENTS
// ===========================================
export * from './documents';

// ===========================================
// EXPORT TYPES EMAIL & NOTIFICATIONS
// ===========================================
export * from './email';

// ===========================================
// EXPORT TYPES AUTHENTIFICATION
// ===========================================
export * from './auth';
