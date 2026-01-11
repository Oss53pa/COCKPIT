// ============================================
// TYPES MODULE PROJET DE LANCEMENT
// Centres en construction (ex: Cosmos Angré)
// ============================================

// --- Statuts ---
export type StatutProjet =
  | 'preparation'
  | 'mobilisation'
  | 'lancement'
  | 'stabilisation'
  | 'cloture'
  | 'termine';

export type StatutJalon =
  | 'a_venir'
  | 'en_cours'
  | 'en_retard'
  | 'a_risque'
  | 'atteint'
  | 'reporte';

export type StatutRecrutement =
  | 'a_lancer'
  | 'en_cours'
  | 'shortlist'
  | 'offre_envoyee'
  | 'negocie'
  | 'accepte'
  | 'integre'
  | 'annule';

export type StatutProspect =
  | 'identifie'
  | 'contacte'
  | 'interesse'
  | 'negociation'
  | 'offre_envoyee'
  | 'bail_signe'
  | 'perdu'
  | 'en_pause';

export type CategorieRisqueProjet =
  | 'planning'
  | 'budget'
  | 'technique'
  | 'commercial'
  | 'rh'
  | 'externe'
  | 'reglementaire';

// --- Projet Principal ---
export interface ProjetLancement {
  id: string;
  centreId: string;
  nom: string;
  statut: StatutProjet;

  // Dates clés
  dateDebut: string;
  dateSoftOpening: string;
  dateInauguration: string;
  dateFinStabilisation: string;

  // Budget
  budgetTotal: number;
  provisions: number;

  // Phase actuelle
  phaseActuelle: string;

  // Configuration alertes
  seuilAlerteJalon: number;
  seuilAlerteBudget: number;

  createdAt: string;
  updatedAt: string;
}

// --- Phases du Projet ---
export interface PhaseProjet {
  id: string;
  projetId: string;
  numero: number;
  nom: string;
  dateDebut: string;
  dateFin: string;
  budget: number;
  budgetEngage: number;
  budgetConsomme: number;
  statut: 'a_venir' | 'en_cours' | 'termine';
  avancement: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetPhase {
  phaseId: string;
  libelle: string;
  montantPrevu: number;
  montantEngage: number;
  montantConsomme: number;
}

// --- Jalons (PMI/PRINCE2 Standard) ---

// Type de jalon selon les standards internationaux
export type TypeJalon =
  | 'gate'           // Phase Gate / Decision Point
  | 'deliverable'    // Livrable majeur
  | 'checkpoint'     // Point de contrôle
  | 'review'         // Revue (Quality Review, Stage Review)
  | 'approval'       // Approbation formelle
  | 'handover'       // Transfert / Handover
  | 'go_live'        // Mise en production
  | 'closure';       // Clôture

// Catégorie fonctionnelle
export type CategorieJalon =
  | 'governance'     // Gouvernance et décision
  | 'commercial'     // Commercial et partenariats
  | 'technique'      // Technique et travaux
  | 'rh'             // Ressources humaines
  | 'finance'        // Finance et budget
  | 'legal'          // Juridique et conformité
  | 'marketing'      // Marketing et communication
  | 'operations';    // Opérations et logistique

// Indicateur RAG (Red-Amber-Green)
export type RAGStatus = 'green' | 'amber' | 'red' | 'grey';

// Livrables associés
export interface Deliverable {
  id: string;
  nom: string;
  description?: string;
  statut: 'pending' | 'in_progress' | 'completed' | 'approved';
  dateEcheance?: string;
  url?: string;
}

// Critère d'acceptation
export interface AcceptanceCriteria {
  id: string;
  description: string;
  completed: boolean;
  validatedBy?: string;
  validatedAt?: string;
}

// Historique des changements
export interface JalonHistory {
  id: string;
  date: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  reason?: string;
}

export interface Jalon {
  id: string;
  projetId: string;

  // === IDENTIFICATION ===
  code: string;                           // Identifiant unique (ex: J001, GATE-1)
  titre: string;
  description: string;
  type: TypeJalon;                        // Type selon PMI/PRINCE2
  categorie: CategorieJalon;              // Catégorie fonctionnelle
  phase?: string;                         // Phase du projet (conception, réalisation, etc.)
  workstream?: string;                    // Workstream / Chantier

  // === PLANIFICATION (Baseline vs Current) ===
  dateBaseline: string;                   // Date initiale planifiée (baseline)
  dateCible: string;                      // Date cible actuelle
  datePrevision?: string;                 // Date prévisionnelle (forecast)
  dateReelle?: string;                    // Date réelle d'atteinte
  dureeEstimee?: number;                  // Durée estimée en jours (pour tâches)

  // === RESPONSABILITÉS (RACI) ===
  responsableId?: string;                 // Responsible - Qui fait le travail
  accountableId?: string;                 // Accountable - Qui approuve/valide
  consultedIds?: string[];                // Consulted - À consulter
  informedIds?: string[];                 // Informed - À informer

  // === CLASSIFICATION ===
  importance: 'critique' | 'majeur' | 'normal';
  statut: StatutJalon;
  ragStatus: RAGStatus;                   // Indicateur santé (RAG)
  progression: number;                    // % d'avancement (0-100)
  confiance: number;                      // Niveau de confiance (0-100)

  // === DÉPENDANCES ===
  dependances: string[];                  // Jalons prédécesseurs (IDs)
  successeurs?: string[];                 // Jalons successeurs (IDs)
  dependancesExternes?: string[];         // Dépendances externes (texte libre)
  bloqueurs?: string[];                   // Bloqueurs actuels

  // === CRITÈRES DE VALIDATION ===
  critereValidation: string;              // Description du critère principal
  criteresAcceptation?: AcceptanceCriteria[]; // Liste de critères détaillés
  livrables?: Deliverable[];              // Documents/livrables requis
  qualityGate?: boolean;                  // Est-ce un Quality Gate?

  // === SUIVI FINANCIER ===
  budgetAlloue?: number;                  // Budget alloué au jalon
  coutReel?: number;                      // Coût réel
  impactBudgetaire?: 'low' | 'medium' | 'high'; // Impact sur le budget global

  // === RISQUES ===
  risqueIds?: string[];                   // Risques associés (IDs)
  niveauRisque?: 'low' | 'medium' | 'high' | 'critical';

  // === DOCUMENTATION ===
  commentaire?: string;
  notes?: string;                         // Notes internes
  justificationRetard?: string;           // Justification si retard
  actionsCorrectives?: string;            // Actions correctives prévues
  liens?: { label: string; url: string }[]; // Liens vers documents

  // === HISTORIQUE ===
  historique?: JalonHistory[];            // Historique des modifications

  // === METADATA ===
  ordre: number;
  tags?: string[];                        // Tags pour filtrage
  visible: boolean;                       // Visible sur timeline/gantt
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// --- Recrutement ---
export interface VagueRecrutement {
  id: string;
  projetId: string;
  numero: number;
  nom: string;
  deadline: string;
  priorite: 'critique' | 'haute' | 'moyenne' | 'basse';
  createdAt: string;
  updatedAt: string;
}

// Types additionnels pour recrutement détaillé
export type TypeContratRecrutement = 'cdi' | 'cdd' | 'stage' | 'interim' | 'consultant';
export type SourceRecrutement = 'interne' | 'cabinet' | 'jobboard' | 'cooptation' | 'linkedin' | 'spontanee' | 'autre';
export type NiveauEtudes = 'bac' | 'bac2' | 'bac3' | 'bac5' | 'doctorat' | 'autre';

export interface CompetenceRequise {
  id: string;
  nom: string;
  niveau: 'debutant' | 'intermediaire' | 'confirme' | 'expert';
  obligatoire: boolean;
}

export interface CandidatRecrutement {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  sourceCandidat: SourceRecrutement;
  dateReception: string;
  dateEntretien?: string;
  noteEntretien?: number; // 1-5
  noteTechnique?: number; // 1-5
  commentaireEntretien?: string;
  statut: 'recu' | 'preselectionne' | 'entretien_planifie' | 'entretien_realise' | 'retenu' | 'refuse' | 'desiste';
  cvUrl?: string;
  pretentionSalariale?: number;
}

export interface EquipementIntegration {
  id: string;
  type: 'materiel' | 'logiciel' | 'acces' | 'mobilier' | 'autre';
  description: string;
  commande: boolean;
  recu: boolean;
  dateCommande?: string;
  dateLivraisonPrevue?: string;
}

export interface FormationIntegration {
  id: string;
  titre: string;
  type: 'interne' | 'externe' | 'elearning';
  duree: string;
  planifiee: boolean;
  datePrevue?: string;
  obligatoire: boolean;
}

export interface PosteARecruter {
  id: string;
  vagueId: string;
  projetId: string;

  // Informations poste
  titre: string;
  departement: string;
  typeContrat: TypeContratRecrutement;
  dureeContrat?: number; // en mois si CDD/stage
  missions: string;
  competencesRequises: CompetenceRequise[];
  experienceRequise: number; // années
  niveauEtudes: NiveauEtudes;
  languesRequises: string[];
  avantages?: string;

  // Rémunération
  salaireMensuel: number;
  salaireMin?: number;
  salaireMax?: number;
  variablePrevu?: number;
  devise: string;

  // Planification
  dateEntreePrevue: string;
  dateEntreeReelle?: string;
  priorite: 'critique' | 'haute' | 'moyenne' | 'basse';

  // Recrutement
  statut: StatutRecrutement;
  sourceRecrutement?: SourceRecrutement;
  responsableRecrutement?: string;
  cabinetRecrutement?: string;
  urlAnnonce?: string;
  datePublication?: string;
  dateLimite?: string;
  candidats: CandidatRecrutement[];
  candidatRetenu?: string;
  dateRecrutement?: string;

  // Intégration
  equipementsNecessaires: EquipementIntegration[];
  formationsAPlanifier: FormationIntegration[];
  parcoursDintegration?: string;
  tuteurIntegration?: string;

  // Métadonnées
  commentaire?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Commercialisation ---
export interface MixCommercial {
  categorie: string;
  pourcentageCible: number;
  pourcentageRealise: number;
}

export interface JalonCommercial {
  id: string;
  projetId: string;
  date: string;
  cibleOccupation: number;
  glaCible: number;
  realise?: number;
  statut: 'a_venir' | 'atteint' | 'non_atteint';
}

export interface Contact {
  nom: string;
  fonction: string;
  telephone?: string;
  email?: string;
}

export interface Interaction {
  id: string;
  date: string;
  type: 'appel' | 'email' | 'reunion' | 'visite';
  resume: string;
  prochainAction?: string;
}

export interface ProspectCommercial {
  id: string;
  projetId: string;
  enseigne: string;
  categorie: string;
  surface: number;
  loyerPropose: number;
  statut: StatutProspect;
  dateContact: string;
  dateRelance?: string;
  probabilite: number;
  estLocomotive: boolean;
  contacts: Contact[];
  historique: Interaction[];
  createdAt: string;
  updatedAt: string;
}

// --- BEFA et Aménagements ---
export interface SuiviBEFA {
  id: string;
  projetId: string;
  prospectId?: string;
  enseigne: string;
  local: string;
  surface: number;

  // Contrats
  befaSigne: boolean;
  dateBEFA?: string;
  piloteBSigne: boolean;
  datePiloteB?: string;
  socotecSigne: boolean;
  dateSOCOTEC?: string;

  // Plans
  plansRecus: boolean;
  datePlans?: string;
  plansValidesTechnique: boolean;
  dateValidationTechnique?: string;
  plansValidesDefinitif: boolean;
  dateValidationDefinitive?: string;

  // Suivi
  vague: number;
  deadlineSignature: string;
  statut: 'en_attente' | 'en_cours' | 'complet' | 'bloque';
  responsableSuivi?: string;
  commentaire?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Handover Technique ---
export interface PhaseHandover {
  id: string;
  projetId: string;
  code: string;
  nom: string;
  dateDebut: string;
  dateFin: string;
  activites: string[];
  responsableId?: string;
  statut: 'a_venir' | 'en_cours' | 'termine';
  avancement: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reserve {
  id: string;
  projetId: string;
  documentDOEId?: string; // Lien vers le document DOE associé
  numero: string;
  lot: string;
  localisation: string;
  description: string;
  classification: 'bloquante' | 'majeure' | 'mineure';
  dateIdentification: string;
  dateLimite: string;
  dateLevee?: string;
  responsableEntreprise: string;
  statut: 'ouverte' | 'en_cours' | 'levee' | 'contestee';
  photos: string[];
  commentaire?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDOE {
  id: string;
  projetId: string;
  lot: string;
  type: string;
  description: string;
  obligatoire: boolean;
  recu: boolean;
  dateReception?: string;
  verifie: boolean;
  dateVerification?: string;
  conforme: boolean;
  commentaire?: string;
  fichierId?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Communication ---
export type TypeActionComm =
  | 'identite_visuelle'
  | 'site_web'
  | 'reseaux_sociaux'
  | 'affichage_ooh'
  | 'radio'
  | 'presse'
  | 'relations_publiques'
  | 'evenement';

export interface ActionCommunication {
  id: string;
  projetId: string;
  periode: string;
  type: TypeActionComm;
  description: string;
  budget: number;
  dateDebut: string;
  dateFin: string;
  responsableId?: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  resultats?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvenementLancement {
  id: string;
  projetId: string;
  type: 'conference_presse' | 'soft_opening' | 'inauguration' | 'autre';
  nom: string;
  date: string;
  budget: number;
  lieu: string;
  responsableId?: string;
  invites: number;
  programme?: string;
  statut: 'planifie' | 'confirme' | 'realise' | 'annule';
  bilanPost?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Risques Projet ---
export interface ActionMitigation {
  id: string;
  description: string;
  responsableId?: string;
  echeance: string;
  statut: 'a_faire' | 'en_cours' | 'fait';
  efficacite?: 'efficace' | 'partielle' | 'inefficace';
}

export interface RisqueProjet {
  id: string;
  projetId: string;
  code: string;
  titre: string;
  description: string;
  categorie: CategorieRisqueProjet;
  probabilite: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  criticite: number;
  statut: 'identifie' | 'en_traitement' | 'mitige' | 'realise' | 'clos';
  responsableId?: string;
  actionsMitigation: ActionMitigation[];
  dateIdentification: string;
  dateRevue?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Statistiques Projet ---
export interface StatistiquesProjet {
  joursAvantSoftOpening: number;
  joursAvantInauguration: number;
  jalonsAtteints: number;
  jalonsTotal: number;
  postesRecrutes: number;
  postesTotal: number;
  occupationPourcent: number;
  glaSigne: number;
  glaTotal: number;
  budgetConsomme: number;
  budgetTotal: number;
  ecartBudget: number;
  reservesBloquantes: number;
  reservesTotales: number;
  befaComplets: number;
  befaTotal: number;
}
