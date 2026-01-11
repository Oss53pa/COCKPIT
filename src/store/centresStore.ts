import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type { CentreCommercial, ConfigurationCentre } from '../types';

interface CentresState {
  centres: CentreCommercial[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCentres: () => Promise<void>;
  getCentre: (id: string) => CentreCommercial | undefined;
  addCentre: (centre: Omit<CentreCommercial, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CentreCommercial>;
  updateCentre: (id: string, updates: Partial<CentreCommercial>) => Promise<void>;
  deleteCentre: (id: string) => Promise<void>;
}

const defaultConfiguration: ConfigurationCentre = {
  deviseMonetaire: 'XOF',
  exerciceFiscal: { debut: 1, fin: 12 },
  objectifsAnnee: new Date().getFullYear(),
  seuilsAlerte: {
    kpiRouge: 70,
    kpiOrange: 90,
    retardAction: 3,
    rappelSaisie: 5,
  },
};

export const useCentresStore = create<CentresState>((set, get) => ({
  centres: [],
  isLoading: false,
  error: null,

  loadCentres: async () => {
    set({ isLoading: true, error: null });
    try {
      const centres = await db.centres.orderBy('createdAt').reverse().toArray();
      set({ centres, isLoading: false });
    } catch (error) {
      set({ error: `Erreur de chargement: ${error}`, isLoading: false });
    }
  },

  getCentre: (id) => {
    return get().centres.find((c) => c.id === id);
  },

  addCentre: async (centreData) => {
    const now = new Date().toISOString();
    const centre: CentreCommercial = {
      ...centreData,
      id: uuidv4(),
      configuration: centreData.configuration || defaultConfiguration,
      // Initialiser modeExploitationActif : true si actif, false si en construction
      modeExploitationActif: centreData.modeExploitationActif ?? centreData.statut === 'actif',
      createdAt: now,
      updatedAt: now,
    };

    await db.centres.add(centre);
    set((state) => ({ centres: [centre, ...state.centres] }));
    return centre;
  },

  updateCentre: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.centres.update(id, { ...updates, updatedAt });
    set((state) => ({
      centres: state.centres.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt } : c
      ),
    }));
  },

  deleteCentre: async (id) => {
    await db.centres.delete(id);
    // Supprimer aussi les données liées
    await db.postes.where('centreId').equals(id).delete();
    await db.axes.where('centreId').equals(id).delete();
    await db.objectifs.where('centreId').equals(id).delete();
    await db.mesures.where('centreId').equals(id).delete();
    await db.actions.where('centreId').equals(id).delete();
    await db.reunions.where('centreId').equals(id).delete();

    set((state) => ({
      centres: state.centres.filter((c) => c.id !== id),
    }));
  },
}));
