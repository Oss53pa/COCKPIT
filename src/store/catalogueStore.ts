import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type {
  TypeRapportDefinition,
  PackRapport,
  CategorieRapport,
  TypeRapportCode,
  CategorieImport,
} from '../types/bi';
import {
  CATALOGUE_RAPPORTS,
  PACKS_RAPPORTS,
  RAPPORTS_PAR_CATEGORIE,
  getRapportsByCategorie,
  getTypeRapport,
  getPackRapport,
  getRapportsActifs,
  getRapportsPremium,
  getRapportsCombinables,
} from '../data/catalogueRapports';
import { ALL_KPI_DEFINITIONS, getKPIDefinition } from '../data/kpiDefinitions';

interface DisponibiliteDonnees {
  categoriesDisponibles: CategorieImport[];
  categoriesManquantes: CategorieImport[];
  scoreCompletude: number; // 0-100
  estDisponible: boolean;
}

interface CatalogueFilters {
  categorie?: CategorieRapport;
  complexite?: 'simple' | 'intermediaire' | 'avance';
  recherche?: string;
  estPremium?: boolean;
}

type CategorieKPI = 'financier' | 'occupation' | 'locatif' | 'commercial' | 'exploitation' | 'investissement';

interface CatalogueState {
  // Data (statiques depuis les fichiers data)
  typesRapport: Record<TypeRapportCode, TypeRapportDefinition>;
  packs: PackRapport[];

  // State dynamique
  filtres: CatalogueFilters;
  categorieSelectionnee: CategorieRapport | null;
  typeRapportSelectionne: TypeRapportCode | null;
  packSelectionne: string | null;

  // État pour CataloguePage (KPIs et rapports favoris)
  filtreCategorie: CategorieKPI | null;
  recherche: string;
  kpisFavoris: string[];
  rapportsFavoris: string[];

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Données disponibles par centre (calculées)
  donneesDisponiblesParCentre: Record<string, CategorieImport[]>;

  // Actions - Navigation
  setFiltres: (filtres: CatalogueFilters) => void;
  resetFiltres: () => void;
  selectCategorie: (categorie: CategorieRapport | null) => void;
  selectTypeRapport: (code: TypeRapportCode | null) => void;
  selectPack: (packId: string | null) => void;

  // Actions - CataloguePage
  setFiltreCategorie: (categorie: CategorieKPI | null) => void;
  setRecherche: (recherche: string) => void;
  toggleKPIFavori: (kpiCode: string) => void;
  toggleRapportFavori: (rapportCode: string) => void;

  // Actions - Queries
  getTypesRapport: () => TypeRapportDefinition[];
  getTypesRapportFiltres: () => TypeRapportDefinition[];
  getTypeRapport: (code: TypeRapportCode) => TypeRapportDefinition | undefined;
  getTypesParCategorie: (categorie: CategorieRapport) => TypeRapportDefinition[];
  getPacks: () => PackRapport[];
  getPack: (id: string) => PackRapport | undefined;
  getRapportsCombinables: (code: TypeRapportCode) => TypeRapportDefinition[];

  // Actions - Disponibilité données
  loadDonneesDisponibles: (centreId: string) => Promise<void>;
  checkDisponibiliteDonnees: (centreId: string, code: TypeRapportCode) => DisponibiliteDonnees;
  getCategoriesManquantes: (centreId: string, code: TypeRapportCode) => CategorieImport[];

  // Actions - Favoris et personnalisation (stockés en DB)
  loadTypesPersonnalises: () => Promise<void>;
  saveTypePersonnalise: (type: TypeRapportDefinition) => Promise<void>;
  loadPacksPersonnalises: () => Promise<void>;
  savePackPersonnalise: (pack: Omit<PackRapport, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PackRapport>;
  deletePackPersonnalise: (id: string) => Promise<void>;
}

export const useCatalogueStore = create<CatalogueState>((set, get) => ({
  // Initial state
  typesRapport: CATALOGUE_RAPPORTS,
  packs: [...PACKS_RAPPORTS],
  filtres: {},
  categorieSelectionnee: null,
  typeRapportSelectionne: null,
  packSelectionne: null,
  filtreCategorie: null,
  recherche: '',
  kpisFavoris: [],
  rapportsFavoris: [],
  isLoading: false,
  error: null,
  donneesDisponiblesParCentre: {},

  // Navigation
  setFiltres: (filtres) => {
    set({ filtres });
  },

  resetFiltres: () => {
    set({ filtres: {} });
  },

  // CataloguePage actions
  setFiltreCategorie: (filtreCategorie) => {
    set({ filtreCategorie });
  },

  setRecherche: (recherche) => {
    set({ recherche });
  },

  toggleKPIFavori: (kpiCode) => {
    set((state) => ({
      kpisFavoris: state.kpisFavoris.includes(kpiCode)
        ? state.kpisFavoris.filter((c) => c !== kpiCode)
        : [...state.kpisFavoris, kpiCode],
    }));
  },

  toggleRapportFavori: (rapportCode) => {
    set((state) => ({
      rapportsFavoris: state.rapportsFavoris.includes(rapportCode)
        ? state.rapportsFavoris.filter((c) => c !== rapportCode)
        : [...state.rapportsFavoris, rapportCode],
    }));
  },

  selectCategorie: (categorie) => {
    set({ categorieSelectionnee: categorie, typeRapportSelectionne: null });
  },

  selectTypeRapport: (code) => {
    set({ typeRapportSelectionne: code });
  },

  selectPack: (packId) => {
    set({ packSelectionne: packId });
  },

  // Queries
  getTypesRapport: () => {
    return Object.values(get().typesRapport);
  },

  getTypesRapportFiltres: () => {
    const { typesRapport, filtres } = get();
    let results = Object.values(typesRapport);

    if (filtres.categorie) {
      results = results.filter(r => r.categorie === filtres.categorie);
    }

    if (filtres.complexite) {
      results = results.filter(r => r.complexite === filtres.complexite);
    }

    if (filtres.estPremium !== undefined) {
      results = results.filter(r => r.estPremium === filtres.estPremium);
    }

    if (filtres.recherche) {
      const recherche = filtres.recherche.toLowerCase();
      results = results.filter(r =>
        r.nom.toLowerCase().includes(recherche) ||
        r.description.toLowerCase().includes(recherche) ||
        r.code.toLowerCase().includes(recherche)
      );
    }

    return results;
  },

  getTypeRapport: (code) => {
    return get().typesRapport[code];
  },

  getTypesParCategorie: (categorie) => {
    return Object.values(get().typesRapport).filter(r => r.categorie === categorie);
  },

  getPacks: () => {
    return get().packs;
  },

  getPack: (id) => {
    return get().packs.find(p => p.id === id);
  },

  getRapportsCombinables: (code) => {
    const rapport = get().typesRapport[code];
    if (!rapport) return [];
    return rapport.combinableAvec
      .map(c => get().typesRapport[c])
      .filter(Boolean);
  },

  // Disponibilité données
  loadDonneesDisponibles: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      const categoriesAvecDonnees: CategorieImport[] = [];

      // Vérifier chaque catégorie de données
      const checks: { categorie: CategorieImport; table: typeof db.etatsLocatifs }[] = [
        { categorie: 'etat_locatif', table: db.etatsLocatifs },
        { categorie: 'loyers', table: db.donneesLoyers },
        { categorie: 'frequentation', table: db.donneesFrequentation },
        { categorie: 'chiffre_affaires', table: db.donneesChiffreAffaires },
        { categorie: 'charges', table: db.donneesCharges },
        { categorie: 'bail', table: db.donneesBaux },
        { categorie: 'travaux', table: db.donneesTravaux },
        { categorie: 'valorisation', table: db.donneesValorisation },
        { categorie: 'energie', table: db.donneesEnergie },
        { categorie: 'satisfaction', table: db.donneesSatisfaction },
      ];

      for (const check of checks) {
        const count = await check.table.where('centreId').equals(centreId).count();
        if (count > 0) {
          categoriesAvecDonnees.push(check.categorie);
        }
      }

      set((state) => ({
        donneesDisponiblesParCentre: {
          ...state.donneesDisponiblesParCentre,
          [centreId]: categoriesAvecDonnees,
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: `Erreur vérification données: ${error}`, isLoading: false });
    }
  },

  checkDisponibiliteDonnees: (centreId, code) => {
    const rapport = get().typesRapport[code];
    const donneesDisponibles = get().donneesDisponiblesParCentre[centreId] || [];

    if (!rapport) {
      return {
        categoriesDisponibles: [],
        categoriesManquantes: [],
        scoreCompletude: 0,
        estDisponible: false,
      };
    }

    const categoriesRequises = rapport.categoriesRequises;
    const categoriesDisponibles = categoriesRequises.filter(c => donneesDisponibles.includes(c));
    const categoriesManquantes = categoriesRequises.filter(c => !donneesDisponibles.includes(c));
    const scoreCompletude = categoriesRequises.length > 0
      ? Math.round((categoriesDisponibles.length / categoriesRequises.length) * 100)
      : 100;

    return {
      categoriesDisponibles,
      categoriesManquantes,
      scoreCompletude,
      estDisponible: categoriesManquantes.length === 0,
    };
  },

  getCategoriesManquantes: (centreId, code) => {
    const { categoriesManquantes } = get().checkDisponibiliteDonnees(centreId, code);
    return categoriesManquantes;
  },

  // Personnalisation
  loadTypesPersonnalises: async () => {
    try {
      const typesDB = await db.typesRapport.toArray();
      if (typesDB.length > 0) {
        set((state) => {
          const typesRapport = { ...state.typesRapport };
          for (const type of typesDB) {
            typesRapport[type.code] = type;
          }
          return { typesRapport };
        });
      }
    } catch (error) {
      console.error('Erreur chargement types personnalisés:', error);
    }
  },

  saveTypePersonnalise: async (type) => {
    const updatedAt = new Date().toISOString();
    const typeToSave = { ...type, updatedAt };

    await db.typesRapport.put(typeToSave);

    set((state) => ({
      typesRapport: {
        ...state.typesRapport,
        [type.code]: typeToSave,
      },
    }));
  },

  loadPacksPersonnalises: async () => {
    try {
      const packsDB = await db.packsRapport.toArray();
      if (packsDB.length > 0) {
        set((state) => ({
          packs: [...PACKS_RAPPORTS, ...packsDB],
        }));
      }
    } catch (error) {
      console.error('Erreur chargement packs personnalisés:', error);
    }
  },

  savePackPersonnalise: async (packData) => {
    const now = new Date().toISOString();
    const pack: PackRapport = {
      ...packData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    await db.packsRapport.add(pack);

    set((state) => ({
      packs: [...state.packs, pack],
    }));

    return pack;
  },

  deletePackPersonnalise: async (id) => {
    // Ne supprimer que les packs personnalisés (pas les packs prédéfinis)
    const packPredefini = PACKS_RAPPORTS.find(p => p.id === id);
    if (packPredefini) {
      throw new Error('Impossible de supprimer un pack prédéfini');
    }

    await db.packsRapport.delete(id);

    set((state) => ({
      packs: state.packs.filter(p => p.id !== id),
    }));
  },
}));

// ===========================================
// SELECTORS (pour optimisation)
// ===========================================

export const selectTypesRapport = (state: CatalogueState) => state.typesRapport;
export const selectPacks = (state: CatalogueState) => state.packs;
export const selectFiltres = (state: CatalogueState) => state.filtres;
export const selectCategorieSelectionnee = (state: CatalogueState) => state.categorieSelectionnee;
export const selectTypeRapportSelectionne = (state: CatalogueState) => state.typeRapportSelectionne;
