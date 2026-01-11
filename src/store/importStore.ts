import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { useNotificationStore } from './notificationStore';
import { useCentresStore } from './centresStore';
import type {
  FichierImport,
  DossierImport,
  CategorieImport,
  ColonneMapping,
  StatutImport,
  ValidationErreur,
  QualiteDonnees,
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
} from '../types/bi';
import {
  parserFichier,
  genererMappingAutomatique,
  type FichierParse,
} from '../utils/fileParser';
import {
  validerDonnees,
  transformerDonnees,
  nettoyerDonnees,
  type ResultatValidation,
} from '../utils/dataValidation';

// ===========================================
// TYPES
// ===========================================

interface ImportEnCours {
  fichierParse: FichierParse | null;
  categorie: CategorieImport | null;
  mapping: ColonneMapping[];
  validation: ResultatValidation | null;
  donneesTransformees: Record<string, unknown>[];
  etape: 'upload' | 'mapping' | 'validation' | 'import' | 'termine';
  progression: number;
  erreur: string | null;
}

interface ImportState {
  // Fichiers importés
  fichiers: FichierImport[];
  fichiersParCentre: Record<string, FichierImport[]>;

  // Dossiers
  dossiers: DossierImport[];
  dossiersParCentre: Record<string, DossierImport[]>;

  // Import en cours
  importEnCours: ImportEnCours;

  // State
  isLoading: boolean;
  error: string | null;

  // Actions - Chargement
  loadFichiers: (centreId: string) => Promise<void>;
  loadDossiers: (centreId: string) => Promise<void>;
  loadAll: (centreId: string) => Promise<void>;

  // Actions - Upload et parsing
  uploadFichier: (file: File) => Promise<void>;
  setCategorie: (categorie: CategorieImport) => void;
  setMapping: (mapping: ColonneMapping[]) => void;
  genererMappingAuto: () => void;
  valider: () => void;

  // Actions - Import
  importerDonnees: (centreId: string, dossierId?: string) => Promise<FichierImport | null>;
  annulerImport: () => void;
  resetImport: () => void;

  // Actions - Gestion fichiers
  getFichier: (id: string) => FichierImport | undefined;
  supprimerFichier: (id: string) => Promise<void>;
  getFichiersParCategorie: (centreId: string, categorie: CategorieImport) => FichierImport[];

  // Actions - Dossiers
  creerDossier: (dossier: Omit<DossierImport, 'id' | 'createdAt' | 'updatedAt'>) => Promise<DossierImport>;
  renommerDossier: (id: string, nom: string) => Promise<void>;
  supprimerDossier: (id: string) => Promise<void>;
  deplacerFichierDansDossier: (fichierId: string, dossierId: string | null) => Promise<void>;

  // Actions - Versioning
  getVersionsPrecedentes: (fichierId: string) => Promise<FichierImport[]>;
}

// ===========================================
// INITIAL STATE
// ===========================================

const importEnCoursInitial: ImportEnCours = {
  fichierParse: null,
  categorie: null,
  mapping: [],
  validation: null,
  donneesTransformees: [],
  etape: 'upload',
  progression: 0,
  erreur: null,
};

// ===========================================
// STORE
// ===========================================

export const useImportStore = create<ImportState>((set, get) => ({
  // Initial state
  fichiers: [],
  fichiersParCentre: {},
  dossiers: [],
  dossiersParCentre: {},
  importEnCours: { ...importEnCoursInitial },
  isLoading: false,
  error: null,

  // ===========================================
  // CHARGEMENT
  // ===========================================

  loadFichiers: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      const fichiers = await db.fichiersImport
        .where('centreId')
        .equals(centreId)
        .and(f => f.estDerniereVersion)
        .reverse()
        .sortBy('dateImport');

      set((state) => ({
        fichiers,
        fichiersParCentre: {
          ...state.fichiersParCentre,
          [centreId]: fichiers,
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: `Erreur chargement fichiers: ${error}`, isLoading: false });
    }
  },

  loadDossiers: async (centreId) => {
    try {
      const dossiers = await db.dossiersImport
        .where('centreId')
        .equals(centreId)
        .sortBy('ordre');

      set((state) => ({
        dossiers,
        dossiersParCentre: {
          ...state.dossiersParCentre,
          [centreId]: dossiers,
        },
      }));
    } catch (error) {
      console.error('Erreur chargement dossiers:', error);
    }
  },

  loadAll: async (centreId) => {
    await Promise.all([
      get().loadFichiers(centreId),
      get().loadDossiers(centreId),
    ]);
  },

  // ===========================================
  // UPLOAD ET PARSING
  // ===========================================

  uploadFichier: async (file) => {
    set((state) => ({
      importEnCours: {
        ...state.importEnCours,
        etape: 'upload',
        progression: 0,
        erreur: null,
      },
    }));

    try {
      // Vérifier la taille (max 10 Mo)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Le fichier dépasse la taille maximale de 10 Mo');
      }

      set((state) => ({
        importEnCours: { ...state.importEnCours, progression: 30 },
      }));

      // Parser le fichier
      const fichierParse = await parserFichier(file);

      if (fichierParse.erreurParsing) {
        throw new Error(fichierParse.erreurParsing);
      }

      set((state) => ({
        importEnCours: {
          ...state.importEnCours,
          fichierParse,
          etape: 'mapping',
          progression: 100,
        },
      }));
    } catch (error) {
      set((state) => ({
        importEnCours: {
          ...state.importEnCours,
          erreur: String(error),
          etape: 'upload',
        },
      }));
    }
  },

  setCategorie: (categorie) => {
    set((state) => ({
      importEnCours: {
        ...state.importEnCours,
        categorie,
      },
    }));

    // Générer le mapping automatique
    get().genererMappingAuto();
  },

  setMapping: (mapping) => {
    set((state) => ({
      importEnCours: {
        ...state.importEnCours,
        mapping,
      },
    }));
  },

  genererMappingAuto: () => {
    const { fichierParse, categorie } = get().importEnCours;
    if (!fichierParse || !categorie) return;

    const mapping = genererMappingAutomatique(fichierParse.colonnes, categorie);

    // Ajouter les types détectés
    const mappingAvecTypes = mapping.map(m => ({
      ...m,
      typeDetecte: fichierParse.typesDetectes[m.colonneSource] || 'string',
    }));

    set((state) => ({
      importEnCours: {
        ...state.importEnCours,
        mapping: mappingAvecTypes,
      },
    }));
  },

  valider: () => {
    const { fichierParse, mapping, categorie } = get().importEnCours;
    if (!fichierParse || !categorie || mapping.length === 0) return;

    set((state) => ({
      importEnCours: {
        ...state.importEnCours,
        etape: 'validation',
        progression: 0,
      },
    }));

    // Nettoyer les données
    const donneesNettoyees = nettoyerDonnees(fichierParse.lignes);

    set((state) => ({
      importEnCours: { ...state.importEnCours, progression: 30 },
    }));

    // Valider
    const validation = validerDonnees(donneesNettoyees, mapping, categorie);

    set((state) => ({
      importEnCours: { ...state.importEnCours, progression: 60 },
    }));

    // Transformer
    const donneesTransformees = transformerDonnees(donneesNettoyees, mapping);

    set((state) => ({
      importEnCours: {
        ...state.importEnCours,
        validation,
        donneesTransformees,
        progression: 100,
      },
    }));
  },

  // ===========================================
  // IMPORT
  // ===========================================

  importerDonnees: async (centreId, dossierId) => {
    const { fichierParse, categorie, mapping, validation, donneesTransformees } = get().importEnCours;

    if (!fichierParse || !categorie || !validation) {
      return null;
    }

    set((state) => ({
      importEnCours: {
        ...state.importEnCours,
        etape: 'import',
        progression: 0,
        erreur: null,
      },
    }));

    try {
      const now = new Date().toISOString();
      const fichierId = uuidv4();

      // Créer l'enregistrement du fichier
      const fichierImport: FichierImport = {
        id: fichierId,
        centreId,
        dossierId,
        nom: fichierParse.nom,
        format: fichierParse.format,
        taille: fichierParse.taille,
        contenu: fichierParse.contenuBase64,
        categorie,
        mapping,
        scoreQualite: validation.scoreQualite,
        qualite: validation.qualite,
        lignesTotal: fichierParse.lignesTotal,
        lignesValides: validation.lignesValides,
        lignesErreur: validation.lignesErreur,
        erreurs: validation.erreurs,
        donneesParsees: donneesTransformees,
        statut: validation.valide ? 'succes' : 'partiel',
        version: 1,
        estDerniereVersion: true,
        importePar: 'utilisateur',
        dateImport: now,
        createdAt: now,
        updatedAt: now,
      };

      set((state) => ({
        importEnCours: { ...state.importEnCours, progression: 20 },
      }));

      // Sauvegarder le fichier
      await db.fichiersImport.add(fichierImport);

      set((state) => ({
        importEnCours: { ...state.importEnCours, progression: 40 },
      }));

      // Importer les données dans les tables spécifiques
      await importerDansTable(centreId, fichierId, categorie, donneesTransformees);

      set((state) => ({
        importEnCours: {
          ...state.importEnCours,
          etape: 'termine',
          progression: 100,
        },
        fichiers: [fichierImport, ...state.fichiers],
        fichiersParCentre: {
          ...state.fichiersParCentre,
          [centreId]: [fichierImport, ...(state.fichiersParCentre[centreId] || [])],
        },
      }));

      // Envoyer notification de succès
      try {
        const notificationStore = useNotificationStore.getState();
        if (notificationStore.config.enabled && notificationStore.config.options.importTermine) {
          const centre = useCentresStore.getState().getCentre(centreId);
          await notificationStore.sendImportNotification(
            fichierImport.nom,
            fichierImport.lignesValides,
            centre?.nom || centreId,
            true
          );
        }
      } catch (notifError) {
        console.warn('Erreur envoi notification import:', notifError);
      }

      return fichierImport;
    } catch (error) {
      // Envoyer notification d'échec
      try {
        const notificationStore = useNotificationStore.getState();
        if (notificationStore.config.enabled && notificationStore.config.options.importTermine) {
          const centre = useCentresStore.getState().getCentre(centreId);
          const nomFichier = get().importEnCours.fichierParse?.nom || 'Fichier inconnu';
          await notificationStore.sendImportNotification(
            nomFichier,
            0,
            centre?.nom || centreId,
            false,
            String(error)
          );
        }
      } catch (notifError) {
        console.warn('Erreur envoi notification échec import:', notifError);
      }

      set((state) => ({
        importEnCours: {
          ...state.importEnCours,
          erreur: `Erreur import: ${error}`,
          etape: 'validation',
        },
      }));
      return null;
    }
  },

  annulerImport: () => {
    set({ importEnCours: { ...importEnCoursInitial } });
  },

  resetImport: () => {
    set({ importEnCours: { ...importEnCoursInitial } });
  },

  // ===========================================
  // GESTION FICHIERS
  // ===========================================

  getFichier: (id) => {
    return get().fichiers.find(f => f.id === id);
  },

  supprimerFichier: async (id) => {
    const fichier = get().getFichier(id);
    if (!fichier) return;

    // Supprimer les données associées
    await supprimerDonneesTable(fichier.centreId, id, fichier.categorie);

    // Supprimer le fichier
    await db.fichiersImport.delete(id);

    set((state) => ({
      fichiers: state.fichiers.filter(f => f.id !== id),
      fichiersParCentre: {
        ...state.fichiersParCentre,
        [fichier.centreId]: (state.fichiersParCentre[fichier.centreId] || []).filter(f => f.id !== id),
      },
    }));
  },

  getFichiersParCategorie: (centreId, categorie) => {
    const fichiers = get().fichiersParCentre[centreId] || [];
    return fichiers.filter(f => f.categorie === categorie);
  },

  // ===========================================
  // DOSSIERS
  // ===========================================

  creerDossier: async (dossierData) => {
    const now = new Date().toISOString();
    const dossier: DossierImport = {
      ...dossierData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    await db.dossiersImport.add(dossier);

    set((state) => ({
      dossiers: [...state.dossiers, dossier],
      dossiersParCentre: {
        ...state.dossiersParCentre,
        [dossier.centreId]: [...(state.dossiersParCentre[dossier.centreId] || []), dossier],
      },
    }));

    return dossier;
  },

  renommerDossier: async (id, nom) => {
    const updatedAt = new Date().toISOString();
    await db.dossiersImport.update(id, { nom, updatedAt });

    set((state) => ({
      dossiers: state.dossiers.map(d => d.id === id ? { ...d, nom, updatedAt } : d),
    }));
  },

  supprimerDossier: async (id) => {
    // Mettre les fichiers du dossier à la racine
    await db.fichiersImport.where('dossierId').equals(id).modify({ dossierId: undefined });

    await db.dossiersImport.delete(id);

    set((state) => ({
      dossiers: state.dossiers.filter(d => d.id !== id),
      fichiers: state.fichiers.map(f => f.dossierId === id ? { ...f, dossierId: undefined } : f),
    }));
  },

  deplacerFichierDansDossier: async (fichierId, dossierId) => {
    const updatedAt = new Date().toISOString();
    await db.fichiersImport.update(fichierId, { dossierId: dossierId || undefined, updatedAt });

    set((state) => ({
      fichiers: state.fichiers.map(f =>
        f.id === fichierId ? { ...f, dossierId: dossierId || undefined, updatedAt } : f
      ),
    }));
  },

  // ===========================================
  // VERSIONING
  // ===========================================

  getVersionsPrecedentes: async (fichierId) => {
    const fichier = get().getFichier(fichierId);
    if (!fichier) return [];

    // Trouver les versions précédentes
    const versions = await db.fichiersImport
      .where('centreId')
      .equals(fichier.centreId)
      .and(f => f.categorie === fichier.categorie && f.nom === fichier.nom)
      .sortBy('version');

    return versions.filter(v => v.id !== fichierId);
  },
}));

// ===========================================
// HELPERS - Import dans tables
// ===========================================

async function importerDansTable(
  centreId: string,
  fichierImportId: string,
  categorie: CategorieImport,
  donnees: Record<string, unknown>[]
): Promise<void> {
  const now = new Date().toISOString();

  switch (categorie) {
    case 'etat_locatif':
      const etatsLocatifs: EtatLocatif[] = donnees.map(d => ({
        id: uuidv4(),
        centreId,
        fichierImportId,
        lotId: String(d.lotReference || ''),
        lotReference: String(d.lotReference || ''),
        locataireNom: String(d.locataireEnseigne || ''),
        locataireEnseigne: String(d.locataireEnseigne || ''),
        activiteCode: String(d.activiteCode || ''),
        surfaceGLA: Number(d.surfaceGLA) || 0,
        bailDebut: String(d.bailDebut || ''),
        bailFin: String(d.bailFin || ''),
        loyerMinimumGaranti: Number(d.loyerMinimumGaranti) || 0,
        chargesProvision: Number(d.chargesProvision) || 0,
        depotGarantie: Number(d.depotGarantie) || 0,
        indexationIndice: (d.indexationIndice as 'ILC' | 'ILAT' | 'ICC') || 'ILC',
        statutOccupation: (d.statutOccupation as 'occupe' | 'vacant' | 'en_travaux' | 'pre_loue') || 'occupe',
        createdAt: now,
      }));
      await db.etatsLocatifs.bulkAdd(etatsLocatifs);
      break;

    case 'loyers':
      const loyers: DonneesLoyer[] = donnees.map(d => ({
        id: uuidv4(),
        centreId,
        fichierImportId,
        lotId: String(d.lotId || ''),
        locataireEnseigne: String(d.locataireEnseigne || ''),
        periodeAnnee: Number(d.periodeAnnee) || new Date().getFullYear(),
        periodeMois: Number(d.periodeMois) || 1,
        loyerAppele: Number(d.loyerAppele) || 0,
        loyerEncaisse: Number(d.loyerEncaisse) || 0,
        chargesAppelees: Number(d.chargesAppelees) || 0,
        chargesEncaissees: Number(d.chargesEncaissees) || 0,
        statut: (d.statut as 'paye' | 'partiel' | 'impaye') || 'paye',
        createdAt: now,
      }));
      await db.donneesLoyers.bulkAdd(loyers);
      break;

    case 'frequentation':
      const frequentation: DonneesFrequentation[] = donnees.map(d => ({
        id: uuidv4(),
        centreId,
        fichierImportId,
        date: String(d.date || ''),
        entreesTotal: Number(d.entreesTotal) || 0,
        zone: d.zone ? String(d.zone) : undefined,
        jourSemaine: new Date(String(d.date)).toLocaleDateString('fr-FR', { weekday: 'long' }),
        estJourFerie: false,
        createdAt: now,
      }));
      await db.donneesFrequentation.bulkAdd(frequentation);
      break;

    case 'chiffre_affaires':
      const ca: DonneesChiffreAffaires[] = donnees.map(d => ({
        id: uuidv4(),
        centreId,
        fichierImportId,
        lotId: String(d.lotId || ''),
        locataireEnseigne: String(d.locataireEnseigne || ''),
        periodeAnnee: Number(d.periodeAnnee) || new Date().getFullYear(),
        periodeMois: Number(d.periodeMois) || 1,
        caDeclare: Number(d.caDeclare) || 0,
        statutDeclaration: 'declare',
        createdAt: now,
      }));
      await db.donneesChiffreAffaires.bulkAdd(ca);
      break;

    case 'charges':
      const charges: DonneesCharges[] = donnees.map(d => ({
        id: uuidv4(),
        centreId,
        fichierImportId,
        periodeAnnee: Number(d.periodeAnnee) || new Date().getFullYear(),
        periodeMois: d.periodeMois ? Number(d.periodeMois) : undefined,
        categorieCharge: String(d.categorieCharge || ''),
        montantBudget: Number(d.montantBudget) || 0,
        montantReel: Number(d.montantReel) || 0,
        montantRefacturable: Number(d.montantRefacturable) || 0,
        montantNonRefacturable: Number(d.montantNonRefacturable) || 0,
        cleRepartition: 'tantiemes',
        tauxRefacturation: 100,
        createdAt: now,
      }));
      await db.donneesCharges.bulkAdd(charges);
      break;

    case 'bail':
      const baux: DonneesBail[] = donnees.map(d => ({
        id: uuidv4(),
        centreId,
        fichierImportId,
        lotId: String(d.lotId || ''),
        locataireNom: String(d.locataireEnseigne || ''),
        locataireEnseigne: String(d.locataireEnseigne || ''),
        dateSignature: String(d.dateDebut || ''),
        dateDebut: String(d.dateDebut || ''),
        dateFin: String(d.dateFin || ''),
        dateBreak: d.dateBreak ? String(d.dateBreak) : undefined,
        dureeInitiale: 9,
        loyerAnnuel: Number(d.loyerAnnuel) || 0,
        chargesAnnuelles: Number(d.chargesAnnuelles) || 0,
        depotGarantie: Number(d.depotGarantie) || 0,
        indexation: 'ILC',
        createdAt: now,
      }));
      await db.donneesBaux.bulkAdd(baux);
      break;

    case 'travaux':
      const travaux: DonneesTravaux[] = donnees.map(d => ({
        id: uuidv4(),
        centreId,
        fichierImportId,
        reference: String(d.reference || ''),
        libelle: String(d.libelle || ''),
        categorie: (d.categorie as 'capex' | 'maintenance' | 'renovation' | 'mise_aux_normes') || 'maintenance',
        montantBudget: Number(d.montantBudget) || 0,
        montantEngage: Number(d.montantEngage) || 0,
        montantRealise: Number(d.montantRealise) || 0,
        dateDebut: String(d.dateDebut || now),
        statut: (d.statut as 'planifie' | 'en_cours' | 'termine' | 'annule') || 'planifie',
        createdAt: now,
      }));
      await db.donneesTravaux.bulkAdd(travaux);
      break;

    case 'valorisation':
      const valorisations: DonneesValorisation[] = donnees.map(d => ({
        id: uuidv4(),
        centreId,
        fichierImportId,
        dateValorisation: String(d.dateValorisation || ''),
        valeurVenale: Number(d.valeurVenale) || 0,
        valeurLocative: d.valeurLocative ? Number(d.valeurLocative) : undefined,
        tauxCapitalisation: Number(d.tauxCapitalisation) || 0,
        methodologie: 'capitalisation',
        createdAt: now,
      }));
      await db.donneesValorisation.bulkAdd(valorisations);
      break;

    case 'energie':
      const energie: DonneesEnergie[] = donnees.map(d => ({
        id: uuidv4(),
        centreId,
        fichierImportId,
        periodeAnnee: Number(d.periodeAnnee) || new Date().getFullYear(),
        periodeMois: Number(d.periodeMois) || 1,
        typeEnergie: (d.typeEnergie as 'electricite' | 'gaz' | 'eau' | 'chauffage' | 'climatisation') || 'electricite',
        consommation: Number(d.consommation) || 0,
        unite: String(d.unite || 'kWh'),
        cout: Number(d.cout) || 0,
        createdAt: now,
      }));
      await db.donneesEnergie.bulkAdd(energie);
      break;

    case 'satisfaction':
      const satisfaction: DonneesSatisfaction[] = donnees.map(d => ({
        id: uuidv4(),
        centreId,
        fichierImportId,
        date: String(d.date || ''),
        typeEnquete: 'satisfaction',
        scoreGlobal: Number(d.scoreGlobal) || 0,
        nps: d.nps ? Number(d.nps) : undefined,
        nombreRepondants: Number(d.nombreRepondants) || 0,
        createdAt: now,
      }));
      await db.donneesSatisfaction.bulkAdd(satisfaction);
      break;
  }
}

async function supprimerDonneesTable(
  centreId: string,
  fichierImportId: string,
  categorie: CategorieImport
): Promise<void> {
  switch (categorie) {
    case 'etat_locatif':
      await db.etatsLocatifs.where('fichierImportId').equals(fichierImportId).delete();
      break;
    case 'loyers':
      await db.donneesLoyers.where('fichierImportId').equals(fichierImportId).delete();
      break;
    case 'frequentation':
      await db.donneesFrequentation.where('fichierImportId').equals(fichierImportId).delete();
      break;
    case 'chiffre_affaires':
      await db.donneesChiffreAffaires.where('fichierImportId').equals(fichierImportId).delete();
      break;
    case 'charges':
      await db.donneesCharges.where('fichierImportId').equals(fichierImportId).delete();
      break;
    case 'bail':
      await db.donneesBaux.where('fichierImportId').equals(fichierImportId).delete();
      break;
    case 'travaux':
      await db.donneesTravaux.where('fichierImportId').equals(fichierImportId).delete();
      break;
    case 'valorisation':
      await db.donneesValorisation.where('fichierImportId').equals(fichierImportId).delete();
      break;
    case 'energie':
      await db.donneesEnergie.where('fichierImportId').equals(fichierImportId).delete();
      break;
    case 'satisfaction':
      await db.donneesSatisfaction.where('fichierImportId').equals(fichierImportId).delete();
      break;
  }
}

// ===========================================
// SELECTORS
// ===========================================

export const selectImportEnCours = (state: ImportState) => state.importEnCours;
export const selectFichiers = (state: ImportState) => state.fichiers;
export const selectDossiers = (state: ImportState) => state.dossiers;
