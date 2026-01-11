import Dexie, { type Table } from 'dexie';
import type {
  CentreCommercial,
  Poste,
  MembreEquipe,
  AxeStrategique,
  Objectif,
  Mesure,
  PlanAction,
  Reunion,
  Livrable,
  Evaluation,
  Audit,
  RisqueEntreprise,
  Alerte,
  ParametresApp,
  ImportLog,
  // Types BI - Import
  FichierImport,
  DossierImport,
  EtatLocatif,
  DonneesLoyer,
  DonneesFrequentation,
  DonneesChiffreAffaires,
  DonneesCharges,
  DonneesBail,
  DonneesTravaux,
  DonneesValorisation,
  DonneesEnergie,
  DonneesSatisfaction,
  // Types BI - Catalogue
  TypeRapportDefinition,
  PackRapport,
  // Types BI - Rapport Studio
  Rapport,
  ModeleRapport,
  // Types BI - Moteur d'Analyse
  ResultatKPI,
  Insight,
  RegleAlerte,
  AlerteGeneree,
  TendancePrediction,
  BenchmarkComparaison,
  ConfigurationBI,
  // Types Projet de Lancement
  ProjetLancement,
  PhaseProjet,
  Jalon,
  VagueRecrutement,
  PosteARecruter,
  ProspectCommercial,
  SuiviBEFA,
  Reserve,
  DocumentDOE,
  RisqueProjet,
  ActionCommunication,
  EvenementLancement,
  PhaseHandover,
  JalonCommercial,
  // Types Profil et Backup (v6)
  UserProfile,
  BackupHistoryEntry,
  JournalEntry,
  PeriodeCloturee,
  Document,
  MappingHistory,
  AuthCredentials,
} from '../types';

export class CockpitDatabase extends Dexie {
  // Tables existantes
  centres!: Table<CentreCommercial>;
  postes!: Table<Poste>;
  membresEquipe!: Table<MembreEquipe>;
  axes!: Table<AxeStrategique>;
  objectifs!: Table<Objectif>;
  mesures!: Table<Mesure>;
  actions!: Table<PlanAction>;
  reunions!: Table<Reunion>;
  livrables!: Table<Livrable>;
  evaluations!: Table<Evaluation>;
  audits!: Table<Audit>;
  risques!: Table<RisqueEntreprise>;
  alertes!: Table<Alerte>;
  parametres!: Table<ParametresApp>;
  importLogs!: Table<ImportLog>;

  // Tables BI - Module Import
  fichiersImport!: Table<FichierImport>;
  dossiersImport!: Table<DossierImport>;
  etatsLocatifs!: Table<EtatLocatif>;
  donneesLoyers!: Table<DonneesLoyer>;
  donneesFrequentation!: Table<DonneesFrequentation>;
  donneesChiffreAffaires!: Table<DonneesChiffreAffaires>;
  donneesCharges!: Table<DonneesCharges>;
  donneesBaux!: Table<DonneesBail>;
  donneesTravaux!: Table<DonneesTravaux>;
  donneesValorisation!: Table<DonneesValorisation>;
  donneesEnergie!: Table<DonneesEnergie>;
  donneesSatisfaction!: Table<DonneesSatisfaction>;

  // Tables BI - Module Catalogue
  typesRapport!: Table<TypeRapportDefinition>;
  packsRapport!: Table<PackRapport>;

  // Tables BI - Module Rapport Studio
  rapports!: Table<Rapport>;
  modelesRapport!: Table<ModeleRapport>;

  // Tables BI - Moteur d'Analyse
  resultatsKPI!: Table<ResultatKPI>;
  insights!: Table<Insight>;
  reglesAlerte!: Table<RegleAlerte>;
  alertesGenerees!: Table<AlerteGeneree>;
  tendancesPrediction!: Table<TendancePrediction>;
  benchmarks!: Table<BenchmarkComparaison>;
  configurationsBI!: Table<ConfigurationBI>;

  // Tables Projet de Lancement
  projets!: Table<ProjetLancement>;
  phasesProjet!: Table<PhaseProjet>;
  jalons!: Table<Jalon>;
  vaguesRecrutement!: Table<VagueRecrutement>;
  postesARecruter!: Table<PosteARecruter>;
  prospectsCommerciaux!: Table<ProspectCommercial>;
  suiviBEFA!: Table<SuiviBEFA>;
  reserves!: Table<Reserve>;
  documentsDOE!: Table<DocumentDOE>;
  risquesProjet!: Table<RisqueProjet>;
  actionsCommunication!: Table<ActionCommunication>;
  evenementsLancement!: Table<EvenementLancement>;
  phasesHandover!: Table<PhaseHandover>;
  jalonsCommerciaux!: Table<JalonCommercial>;

  // Tables v6 - Profil, Backup, Journal, Documents
  userProfile!: Table<UserProfile>;
  backupHistory!: Table<BackupHistoryEntry>;
  journalModifications!: Table<JournalEntry>;
  periodesCloturees!: Table<PeriodeCloturee>;
  documents!: Table<Document>;
  mappingHistory!: Table<MappingHistory>;

  // Table v7 - Authentification
  authCredentials!: Table<AuthCredentials>;

  constructor() {
    super('CockpitCRMC');

    // Version 1 - Tables existantes
    this.version(1).stores({
      centres: 'id, code, nom, statut, ville, createdAt',
      postes: 'id, centreId, departement, titre, titulaire, createdAt',
      axes: 'id, centreId, code, ordre, createdAt',
      objectifs: 'id, axeId, centreId, code, responsableId, frequenceMesure, createdAt',
      mesures: 'id, objectifId, centreId, [periode.annee+periode.mois], statut, dateSaisie, createdAt',
      actions: 'id, centreId, axeId, objectifId, statut, priorite, responsableId, dateEcheance, createdAt',
      reunions: 'id, centreId, type, date, statut, createdAt',
      livrables: 'id, centreId, axeId, frequence, createdAt',
      evaluations: 'id, centreId, posteId, [periode.annee+periode.mois], statut, createdAt',
      audits: 'id, centreId, type, datePlanifiee, statut, createdAt',
      risques: 'id, centreId, categorie, statut, scoreRisque, createdAt',
      alertes: 'id, centreId, type, priorite, lue, traitee, dateCreation',
      parametres: 'id',
      importLogs: 'id, centreId, typeImport, dateImport, statut',
    });

    // Version 2 - Ajout tables BI
    this.version(2).stores({
      // Tables existantes (inchangées)
      centres: 'id, code, nom, statut, ville, createdAt',
      postes: 'id, centreId, departement, titre, titulaire, createdAt',
      axes: 'id, centreId, code, ordre, createdAt',
      objectifs: 'id, axeId, centreId, code, responsableId, frequenceMesure, createdAt',
      mesures: 'id, objectifId, centreId, [periode.annee+periode.mois], statut, dateSaisie, createdAt',
      actions: 'id, centreId, axeId, objectifId, statut, priorite, responsableId, dateEcheance, createdAt',
      reunions: 'id, centreId, type, date, statut, createdAt',
      livrables: 'id, centreId, axeId, frequence, createdAt',
      evaluations: 'id, centreId, posteId, [periode.annee+periode.mois], statut, createdAt',
      audits: 'id, centreId, type, datePlanifiee, statut, createdAt',
      risques: 'id, centreId, categorie, statut, scoreRisque, createdAt',
      alertes: 'id, centreId, type, priorite, lue, traitee, dateCreation',
      parametres: 'id',
      importLogs: 'id, centreId, typeImport, dateImport, statut',

      // BI - Module Import
      fichiersImport: 'id, centreId, dossierId, categorie, statut, dateImport, version, createdAt',
      dossiersImport: 'id, centreId, parentId, categorie, ordre, createdAt',
      etatsLocatifs: 'id, centreId, fichierImportId, lotId, locataireEnseigne, statutOccupation, createdAt',
      donneesLoyers: 'id, centreId, fichierImportId, lotId, [periodeAnnee+periodeMois], statut, createdAt',
      donneesFrequentation: 'id, centreId, fichierImportId, date, zone, createdAt',
      donneesChiffreAffaires: 'id, centreId, fichierImportId, lotId, [periodeAnnee+periodeMois], createdAt',
      donneesCharges: 'id, centreId, fichierImportId, categorieCharge, [periodeAnnee+periodeMois], createdAt',
      donneesBaux: 'id, centreId, fichierImportId, lotId, locataireEnseigne, dateFin, createdAt',
      donneesTravaux: 'id, centreId, fichierImportId, reference, categorie, statut, createdAt',
      donneesValorisation: 'id, centreId, fichierImportId, dateValorisation, createdAt',
      donneesEnergie: 'id, centreId, fichierImportId, typeEnergie, [periodeAnnee+periodeMois], createdAt',
      donneesSatisfaction: 'id, centreId, fichierImportId, date, typeEnquete, createdAt',

      // BI - Module Catalogue
      typesRapport: 'id, code, categorie, complexite, actif, createdAt',
      packsRapport: 'id, code, nom, createdAt',

      // BI - Module Rapport Studio
      rapports: 'id, centreId, typeRapportCode, statut, auteur, dateCreation, createdAt',
      modelesRapport: 'id, typeRapportCode, nom, estPublic, auteur, createdAt',

      // BI - Moteur d'Analyse
      resultatsKPI: 'id, centreId, typeKPI, [periodeDebut+periodeFin], dateCalcul, createdAt',
      insights: 'id, centreId, type, severite, traitee, dateDetection, createdAt',
      reglesAlerte: 'id, centreId, type, actif, priorite, createdAt',
      alertesGenerees: 'id, centreId, regleId, priorite, lue, traitee, dateGeneration, createdAt',
      tendancesPrediction: 'id, centreId, kpi, dateCalcul, createdAt',
      benchmarks: 'id, centreId, kpi, dateComparaison, createdAt',
      configurationsBI: 'id, centreId, createdAt',
    });

    // Version 3 - Ajout tables Module Projet de Lancement
    this.version(3).stores({
      // Tables existantes (inchangées)
      centres: 'id, code, nom, statut, ville, createdAt',
      postes: 'id, centreId, departement, titre, titulaire, createdAt',
      axes: 'id, centreId, code, ordre, createdAt',
      objectifs: 'id, axeId, centreId, code, responsableId, frequenceMesure, createdAt',
      mesures: 'id, objectifId, centreId, [periode.annee+periode.mois], statut, dateSaisie, createdAt',
      actions: 'id, centreId, axeId, objectifId, statut, priorite, responsableId, dateEcheance, createdAt',
      reunions: 'id, centreId, type, date, statut, createdAt',
      livrables: 'id, centreId, axeId, frequence, createdAt',
      evaluations: 'id, centreId, posteId, [periode.annee+periode.mois], statut, createdAt',
      audits: 'id, centreId, type, datePlanifiee, statut, createdAt',
      risques: 'id, centreId, categorie, statut, scoreRisque, createdAt',
      alertes: 'id, centreId, type, priorite, lue, traitee, dateCreation',
      parametres: 'id',
      importLogs: 'id, centreId, typeImport, dateImport, statut',

      // BI - Module Import (inchangés)
      fichiersImport: 'id, centreId, dossierId, categorie, statut, dateImport, version, createdAt',
      dossiersImport: 'id, centreId, parentId, categorie, ordre, createdAt',
      etatsLocatifs: 'id, centreId, fichierImportId, lotId, locataireEnseigne, statutOccupation, createdAt',
      donneesLoyers: 'id, centreId, fichierImportId, lotId, [periodeAnnee+periodeMois], statut, createdAt',
      donneesFrequentation: 'id, centreId, fichierImportId, date, zone, createdAt',
      donneesChiffreAffaires: 'id, centreId, fichierImportId, lotId, [periodeAnnee+periodeMois], createdAt',
      donneesCharges: 'id, centreId, fichierImportId, categorieCharge, [periodeAnnee+periodeMois], createdAt',
      donneesBaux: 'id, centreId, fichierImportId, lotId, locataireEnseigne, dateFin, createdAt',
      donneesTravaux: 'id, centreId, fichierImportId, reference, categorie, statut, createdAt',
      donneesValorisation: 'id, centreId, fichierImportId, dateValorisation, createdAt',
      donneesEnergie: 'id, centreId, fichierImportId, typeEnergie, [periodeAnnee+periodeMois], createdAt',
      donneesSatisfaction: 'id, centreId, fichierImportId, date, typeEnquete, createdAt',

      // BI - Autres modules (inchangés)
      typesRapport: 'id, code, categorie, complexite, actif, createdAt',
      packsRapport: 'id, code, nom, createdAt',
      rapports: 'id, centreId, typeRapportCode, statut, auteur, dateCreation, createdAt',
      modelesRapport: 'id, typeRapportCode, nom, estPublic, auteur, createdAt',
      resultatsKPI: 'id, centreId, typeKPI, [periodeDebut+periodeFin], dateCalcul, createdAt',
      insights: 'id, centreId, type, severite, traitee, dateDetection, createdAt',
      reglesAlerte: 'id, centreId, type, actif, priorite, createdAt',
      alertesGenerees: 'id, centreId, regleId, priorite, lue, traitee, dateGeneration, createdAt',
      tendancesPrediction: 'id, centreId, kpi, dateCalcul, createdAt',
      benchmarks: 'id, centreId, kpi, dateComparaison, createdAt',
      configurationsBI: 'id, centreId, createdAt',

      // Module Projet de Lancement
      projets: 'id, centreId, statut, dateSoftOpening, dateInauguration, createdAt',
      phasesProjet: 'id, projetId, numero, statut, createdAt',
      jalons: 'id, projetId, code, importance, statut, dateCible, ordre, createdAt',
      vaguesRecrutement: 'id, projetId, numero, priorite, createdAt',
      postesARecruter: 'id, projetId, vagueId, departement, statut, priorite, createdAt',
      prospectsCommerciaux: 'id, projetId, enseigne, categorie, statut, probabilite, estLocomotive, createdAt',
      suiviBEFA: 'id, projetId, prospectId, enseigne, vague, statut, createdAt',
      reserves: 'id, projetId, numero, lot, classification, statut, createdAt',
      documentsDOE: 'id, projetId, lot, type, obligatoire, recu, conforme, createdAt',
      risquesProjet: 'id, projetId, code, categorie, criticite, statut, createdAt',
      actionsCommunication: 'id, projetId, type, periode, statut, createdAt',
      evenementsLancement: 'id, projetId, type, date, statut, createdAt',
      phasesHandover: 'id, projetId, code, statut, createdAt',
      jalonsCommerciaux: 'id, projetId, date, statut, createdAt',
    });

    // Version 4 - Ajout du champ modeExploitationActif pour la période transitoire
    this.version(4).stores({
      // Tables existantes - centres avec nouvel index modeExploitationActif
      centres: 'id, code, nom, statut, modeExploitationActif, ville, createdAt',
      postes: 'id, centreId, departement, titre, titulaire, createdAt',
      axes: 'id, centreId, code, ordre, createdAt',
      objectifs: 'id, axeId, centreId, code, responsableId, frequenceMesure, createdAt',
      mesures: 'id, objectifId, centreId, [periode.annee+periode.mois], statut, dateSaisie, createdAt',
      actions: 'id, centreId, axeId, objectifId, statut, priorite, responsableId, dateEcheance, createdAt',
      reunions: 'id, centreId, type, date, statut, createdAt',
      livrables: 'id, centreId, axeId, frequence, createdAt',
      evaluations: 'id, centreId, posteId, [periode.annee+periode.mois], statut, createdAt',
      audits: 'id, centreId, type, datePlanifiee, statut, createdAt',
      risques: 'id, centreId, categorie, statut, scoreRisque, createdAt',
      alertes: 'id, centreId, type, priorite, lue, traitee, dateCreation',
      parametres: 'id',
      importLogs: 'id, centreId, typeImport, dateImport, statut',

      // BI - Module Import (inchangés)
      fichiersImport: 'id, centreId, dossierId, categorie, statut, dateImport, version, createdAt',
      dossiersImport: 'id, centreId, parentId, categorie, ordre, createdAt',
      etatsLocatifs: 'id, centreId, fichierImportId, lotId, locataireEnseigne, statutOccupation, createdAt',
      donneesLoyers: 'id, centreId, fichierImportId, lotId, [periodeAnnee+periodeMois], statut, createdAt',
      donneesFrequentation: 'id, centreId, fichierImportId, date, zone, createdAt',
      donneesChiffreAffaires: 'id, centreId, fichierImportId, lotId, [periodeAnnee+periodeMois], createdAt',
      donneesCharges: 'id, centreId, fichierImportId, categorieCharge, [periodeAnnee+periodeMois], createdAt',
      donneesBaux: 'id, centreId, fichierImportId, lotId, locataireEnseigne, dateFin, createdAt',
      donneesTravaux: 'id, centreId, fichierImportId, reference, categorie, statut, createdAt',
      donneesValorisation: 'id, centreId, fichierImportId, dateValorisation, createdAt',
      donneesEnergie: 'id, centreId, fichierImportId, typeEnergie, [periodeAnnee+periodeMois], createdAt',
      donneesSatisfaction: 'id, centreId, fichierImportId, date, typeEnquete, createdAt',

      // BI - Autres modules (inchangés)
      typesRapport: 'id, code, categorie, complexite, actif, createdAt',
      packsRapport: 'id, code, nom, createdAt',
      rapports: 'id, centreId, typeRapportCode, statut, auteur, dateCreation, createdAt',
      modelesRapport: 'id, typeRapportCode, nom, estPublic, auteur, createdAt',
      resultatsKPI: 'id, centreId, typeKPI, [periodeDebut+periodeFin], dateCalcul, createdAt',
      insights: 'id, centreId, type, severite, traitee, dateDetection, createdAt',
      reglesAlerte: 'id, centreId, type, actif, priorite, createdAt',
      alertesGenerees: 'id, centreId, regleId, priorite, lue, traitee, dateGeneration, createdAt',
      tendancesPrediction: 'id, centreId, kpi, dateCalcul, createdAt',
      benchmarks: 'id, centreId, kpi, dateComparaison, createdAt',
      configurationsBI: 'id, centreId, createdAt',

      // Module Projet de Lancement (inchangés)
      projets: 'id, centreId, statut, dateSoftOpening, dateInauguration, createdAt',
      phasesProjet: 'id, projetId, numero, statut, createdAt',
      jalons: 'id, projetId, code, importance, statut, dateCible, ordre, createdAt',
      vaguesRecrutement: 'id, projetId, numero, priorite, createdAt',
      postesARecruter: 'id, projetId, vagueId, departement, statut, priorite, createdAt',
      prospectsCommerciaux: 'id, projetId, enseigne, categorie, statut, probabilite, estLocomotive, createdAt',
      suiviBEFA: 'id, projetId, prospectId, enseigne, vague, statut, createdAt',
      reserves: 'id, projetId, numero, lot, classification, statut, createdAt',
      documentsDOE: 'id, projetId, lot, type, obligatoire, recu, conforme, createdAt',
      risquesProjet: 'id, projetId, code, categorie, criticite, statut, createdAt',
      actionsCommunication: 'id, projetId, type, periode, statut, createdAt',
      evenementsLancement: 'id, projetId, type, date, statut, createdAt',
      phasesHandover: 'id, projetId, code, statut, createdAt',
      jalonsCommerciaux: 'id, projetId, date, statut, createdAt',
    }).upgrade(async (tx) => {
      // Migration: initialiser modeExploitationActif pour les centres existants
      // - true si actif (le mode exploitation est déjà activé)
      // - false si en_construction (pas encore en exploitation)
      await tx.table('centres').toCollection().modify((centre) => {
        centre.modeExploitationActif = centre.statut === 'actif';
      });
    });

    // Version 5 - Ajout table membresEquipe
    this.version(5).stores({
      // Tables existantes
      centres: 'id, code, nom, statut, modeExploitationActif, ville, createdAt',
      postes: 'id, centreId, departement, titre, titulaire, createdAt',
      membresEquipe: 'id, centreId, matricule, nom, prenom, departement, typeContrat, statut, managerId, dateEmbauche, createdAt',
      axes: 'id, centreId, code, ordre, createdAt',
      objectifs: 'id, axeId, centreId, code, responsableId, frequenceMesure, createdAt',
      mesures: 'id, objectifId, centreId, [periode.annee+periode.mois], statut, dateSaisie, createdAt',
      actions: 'id, centreId, axeId, objectifId, statut, priorite, responsableId, dateEcheance, createdAt',
      reunions: 'id, centreId, type, date, statut, createdAt',
      livrables: 'id, centreId, axeId, frequence, createdAt',
      evaluations: 'id, centreId, posteId, [periode.annee+periode.mois], statut, createdAt',
      audits: 'id, centreId, type, datePlanifiee, statut, createdAt',
      risques: 'id, centreId, categorie, statut, scoreRisque, createdAt',
      alertes: 'id, centreId, type, priorite, lue, traitee, dateCreation',
      parametres: 'id',
      importLogs: 'id, centreId, typeImport, dateImport, statut',

      // BI - Module Import
      fichiersImport: 'id, centreId, dossierId, categorie, statut, dateImport, version, createdAt',
      dossiersImport: 'id, centreId, parentId, categorie, ordre, createdAt',
      etatsLocatifs: 'id, centreId, fichierImportId, lotId, locataireEnseigne, statutOccupation, createdAt',
      donneesLoyers: 'id, centreId, fichierImportId, lotId, [periodeAnnee+periodeMois], statut, createdAt',
      donneesFrequentation: 'id, centreId, fichierImportId, date, zone, createdAt',
      donneesChiffreAffaires: 'id, centreId, fichierImportId, lotId, [periodeAnnee+periodeMois], createdAt',
      donneesCharges: 'id, centreId, fichierImportId, categorieCharge, [periodeAnnee+periodeMois], createdAt',
      donneesBaux: 'id, centreId, fichierImportId, lotId, locataireEnseigne, dateFin, createdAt',
      donneesTravaux: 'id, centreId, fichierImportId, reference, categorie, statut, createdAt',
      donneesValorisation: 'id, centreId, fichierImportId, dateValorisation, createdAt',
      donneesEnergie: 'id, centreId, fichierImportId, typeEnergie, [periodeAnnee+periodeMois], createdAt',
      donneesSatisfaction: 'id, centreId, fichierImportId, date, typeEnquete, createdAt',

      // BI - Autres modules
      typesRapport: 'id, code, categorie, complexite, actif, createdAt',
      packsRapport: 'id, code, nom, createdAt',
      rapports: 'id, centreId, typeRapportCode, statut, auteur, dateCreation, createdAt',
      modelesRapport: 'id, typeRapportCode, nom, estPublic, auteur, createdAt',
      resultatsKPI: 'id, centreId, typeKPI, [periodeDebut+periodeFin], dateCalcul, createdAt',
      insights: 'id, centreId, type, severite, traitee, dateDetection, createdAt',
      reglesAlerte: 'id, centreId, type, actif, priorite, createdAt',
      alertesGenerees: 'id, centreId, regleId, priorite, lue, traitee, dateGeneration, createdAt',
      tendancesPrediction: 'id, centreId, kpi, dateCalcul, createdAt',
      benchmarks: 'id, centreId, kpi, dateComparaison, createdAt',
      configurationsBI: 'id, centreId, createdAt',

      // Module Projet de Lancement
      projets: 'id, centreId, statut, dateSoftOpening, dateInauguration, createdAt',
      phasesProjet: 'id, projetId, numero, statut, createdAt',
      jalons: 'id, projetId, code, importance, statut, dateCible, ordre, createdAt',
      vaguesRecrutement: 'id, projetId, numero, priorite, createdAt',
      postesARecruter: 'id, projetId, vagueId, departement, statut, priorite, createdAt',
      prospectsCommerciaux: 'id, projetId, enseigne, categorie, statut, probabilite, estLocomotive, createdAt',
      suiviBEFA: 'id, projetId, prospectId, enseigne, vague, statut, createdAt',
      reserves: 'id, projetId, numero, lot, classification, statut, createdAt',
      documentsDOE: 'id, projetId, lot, type, obligatoire, recu, conforme, createdAt',
      risquesProjet: 'id, projetId, code, categorie, criticite, statut, createdAt',
      actionsCommunication: 'id, projetId, type, periode, statut, createdAt',
      evenementsLancement: 'id, projetId, type, date, statut, createdAt',
      phasesHandover: 'id, projetId, code, statut, createdAt',
      jalonsCommerciaux: 'id, projetId, date, statut, createdAt',
    });

    // Version 6 - Ajout tables Profil, Backup, Journal, Documents (Cahier des charges v1.1)
    this.version(6).stores({
      // Tables existantes
      centres: 'id, code, nom, statut, modeExploitationActif, ville, createdAt',
      postes: 'id, centreId, departement, titre, titulaire, createdAt',
      membresEquipe: 'id, centreId, matricule, nom, prenom, departement, typeContrat, statut, managerId, dateEmbauche, createdAt',
      axes: 'id, centreId, code, ordre, createdAt',
      objectifs: 'id, axeId, centreId, code, responsableId, frequenceMesure, createdAt',
      mesures: 'id, objectifId, centreId, [periode.annee+periode.mois], statut, dateSaisie, createdAt',
      actions: 'id, centreId, axeId, objectifId, statut, priorite, responsableId, dateEcheance, createdAt',
      reunions: 'id, centreId, type, date, statut, createdAt',
      livrables: 'id, centreId, axeId, frequence, createdAt',
      evaluations: 'id, centreId, posteId, [periode.annee+periode.mois], statut, createdAt',
      audits: 'id, centreId, type, datePlanifiee, statut, createdAt',
      risques: 'id, centreId, categorie, statut, scoreRisque, createdAt',
      alertes: 'id, centreId, type, priorite, lue, traitee, dateCreation',
      parametres: 'id',
      importLogs: 'id, centreId, typeImport, dateImport, statut',

      // BI - Module Import
      fichiersImport: 'id, centreId, dossierId, categorie, statut, dateImport, version, createdAt',
      dossiersImport: 'id, centreId, parentId, categorie, ordre, createdAt',
      etatsLocatifs: 'id, centreId, fichierImportId, lotId, locataireEnseigne, statutOccupation, createdAt',
      donneesLoyers: 'id, centreId, fichierImportId, lotId, [periodeAnnee+periodeMois], statut, createdAt',
      donneesFrequentation: 'id, centreId, fichierImportId, date, zone, createdAt',
      donneesChiffreAffaires: 'id, centreId, fichierImportId, lotId, [periodeAnnee+periodeMois], createdAt',
      donneesCharges: 'id, centreId, fichierImportId, categorieCharge, [periodeAnnee+periodeMois], createdAt',
      donneesBaux: 'id, centreId, fichierImportId, lotId, locataireEnseigne, dateFin, createdAt',
      donneesTravaux: 'id, centreId, fichierImportId, reference, categorie, statut, createdAt',
      donneesValorisation: 'id, centreId, fichierImportId, dateValorisation, createdAt',
      donneesEnergie: 'id, centreId, fichierImportId, typeEnergie, [periodeAnnee+periodeMois], createdAt',
      donneesSatisfaction: 'id, centreId, fichierImportId, date, typeEnquete, createdAt',

      // BI - Autres modules
      typesRapport: 'id, code, categorie, complexite, actif, createdAt',
      packsRapport: 'id, code, nom, createdAt',
      rapports: 'id, centreId, typeRapportCode, statut, auteur, dateCreation, createdAt',
      modelesRapport: 'id, typeRapportCode, nom, estPublic, auteur, createdAt',
      resultatsKPI: 'id, centreId, typeKPI, [periodeDebut+periodeFin], dateCalcul, createdAt',
      insights: 'id, centreId, type, severite, traitee, dateDetection, createdAt',
      reglesAlerte: 'id, centreId, type, actif, priorite, createdAt',
      alertesGenerees: 'id, centreId, regleId, priorite, lue, traitee, dateGeneration, createdAt',
      tendancesPrediction: 'id, centreId, kpi, dateCalcul, createdAt',
      benchmarks: 'id, centreId, kpi, dateComparaison, createdAt',
      configurationsBI: 'id, centreId, createdAt',

      // Module Projet de Lancement
      projets: 'id, centreId, statut, dateSoftOpening, dateInauguration, createdAt',
      phasesProjet: 'id, projetId, numero, statut, createdAt',
      jalons: 'id, projetId, code, importance, statut, dateCible, ordre, createdAt',
      vaguesRecrutement: 'id, projetId, numero, priorite, createdAt',
      postesARecruter: 'id, projetId, vagueId, departement, statut, priorite, createdAt',
      prospectsCommerciaux: 'id, projetId, enseigne, categorie, statut, probabilite, estLocomotive, createdAt',
      suiviBEFA: 'id, projetId, prospectId, enseigne, vague, statut, createdAt',
      reserves: 'id, projetId, numero, lot, classification, statut, createdAt',
      documentsDOE: 'id, projetId, lot, type, obligatoire, recu, conforme, createdAt',
      risquesProjet: 'id, projetId, code, categorie, criticite, statut, createdAt',
      actionsCommunication: 'id, projetId, type, periode, statut, createdAt',
      evenementsLancement: 'id, projetId, type, date, statut, createdAt',
      phasesHandover: 'id, projetId, code, statut, createdAt',
      jalonsCommerciaux: 'id, projetId, date, statut, createdAt',

      // Nouvelles tables v6 - Profil Utilisateur
      userProfile: 'id, email, createdAt',

      // Nouvelles tables v6 - Sauvegarde
      backupHistory: 'id, date, type, cible, statut, createdAt',

      // Nouvelles tables v6 - Journal des Modifications
      journalModifications: 'id, date, action, table, centreId, createdAt',
      periodesCloturees: 'id, centreId, [annee+mois], dateCloture, createdAt',

      // Nouvelles tables v6 - Gestion Documentaire
      documents: 'id, centreId, categorie, entiteType, entiteId, typeStockage, dateAjout, *tags, createdAt',

      // Nouvelles tables v6 - Mapping Import
      mappingHistory: 'id, templateType, dateCreation, nombreUtilisations',
    });

    // Version 7 - Authentification locale
    this.version(7).stores({
      authCredentials: 'id, email, createdAt',
    });
  }
}

export const db = new CockpitDatabase();

// Initialisation des paramètres par défaut
export async function initializeDatabase() {
  const params = await db.parametres.get('default');
  if (!params) {
    await db.parametres.add({
      id: 'default',
      theme: 'light',
      langue: 'fr',
      configEmail: {
        provider: 'none',
        recipients: {
          primary: '',
          cc: [],
        },
        preferences: {
          digestMode: false,
          digestTime: '18:00',
          digestDays: [1, 2, 3, 4, 5],
          immediateFor: ['critique', 'haute'],
        },
        actif: false,
      },
      versionDonnees: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

// Fonction d'export complet des données
export async function exportAllData(): Promise<string> {
  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    centres: await db.centres.toArray(),
    postes: await db.postes.toArray(),
    axes: await db.axes.toArray(),
    objectifs: await db.objectifs.toArray(),
    mesures: await db.mesures.toArray(),
    actions: await db.actions.toArray(),
    reunions: await db.reunions.toArray(),
    livrables: await db.livrables.toArray(),
    evaluations: await db.evaluations.toArray(),
    audits: await db.audits.toArray(),
    risques: await db.risques.toArray(),
    alertes: await db.alertes.toArray(),
    parametres: await db.parametres.toArray(),
  };
  return JSON.stringify(data, null, 2);
}

// Fonction d'import des données
export async function importAllData(jsonData: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonData);

    await db.transaction('rw',
      [db.centres, db.postes, db.axes, db.objectifs, db.mesures,
       db.actions, db.reunions, db.livrables, db.evaluations,
       db.audits, db.risques, db.alertes, db.parametres],
      async () => {
        // Vider les tables existantes
        await db.centres.clear();
        await db.postes.clear();
        await db.axes.clear();
        await db.objectifs.clear();
        await db.mesures.clear();
        await db.actions.clear();
        await db.reunions.clear();
        await db.livrables.clear();
        await db.evaluations.clear();
        await db.audits.clear();
        await db.risques.clear();
        await db.alertes.clear();

        // Importer les nouvelles données
        if (data.centres?.length) await db.centres.bulkAdd(data.centres);
        if (data.postes?.length) await db.postes.bulkAdd(data.postes);
        if (data.axes?.length) await db.axes.bulkAdd(data.axes);
        if (data.objectifs?.length) await db.objectifs.bulkAdd(data.objectifs);
        if (data.mesures?.length) await db.mesures.bulkAdd(data.mesures);
        if (data.actions?.length) await db.actions.bulkAdd(data.actions);
        if (data.reunions?.length) await db.reunions.bulkAdd(data.reunions);
        if (data.livrables?.length) await db.livrables.bulkAdd(data.livrables);
        if (data.evaluations?.length) await db.evaluations.bulkAdd(data.evaluations);
        if (data.audits?.length) await db.audits.bulkAdd(data.audits);
        if (data.risques?.length) await db.risques.bulkAdd(data.risques);
        if (data.alertes?.length) await db.alertes.bulkAdd(data.alertes);
        if (data.parametres?.length) {
          await db.parametres.clear();
          await db.parametres.bulkAdd(data.parametres);
        }
      }
    );

    return { success: true, message: 'Import réussi' };
  } catch (error) {
    return { success: false, message: `Erreur d'import: ${error}` };
  }
}
