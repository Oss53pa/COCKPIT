import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type { Mesure, Periode, StatutKPI } from '../types';

interface MesuresState {
  mesures: Mesure[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadMesures: (centreId?: string, objectifId?: string) => Promise<void>;
  getMesuresByObjectif: (objectifId: string) => Mesure[];
  getMesuresByPeriode: (centreId: string, periode: Periode) => Mesure[];
  getLastMesure: (objectifId: string) => Mesure | undefined;
  addMesure: (mesure: Omit<Mesure, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Mesure>;
  updateMesure: (id: string, updates: Partial<Mesure>) => Promise<void>;
  deleteMesure: (id: string) => Promise<void>;

  // Calculs
  calculerStatut: (valeurReelle: number, seuilVert: number, seuilOrange: number, seuilRouge: number) => StatutKPI;
  calculerEcart: (valeurReelle: number, valeurCible: number) => { ecart: number; ecartPourcentage: number };
}

export const useMesuresStore = create<MesuresState>((set, get) => ({
  mesures: [],
  isLoading: false,
  error: null,

  loadMesures: async (centreId, objectifId) => {
    set({ isLoading: true, error: null });
    try {
      let mesures: Mesure[];
      if (objectifId) {
        mesures = await db.mesures.where('objectifId').equals(objectifId).toArray();
      } else if (centreId) {
        mesures = await db.mesures.where('centreId').equals(centreId).toArray();
      } else {
        mesures = await db.mesures.toArray();
      }
      // Trier par date de saisie décroissante
      mesures.sort((a, b) => new Date(b.dateSaisie).getTime() - new Date(a.dateSaisie).getTime());
      set({ mesures, isLoading: false });
    } catch (error) {
      set({ error: `Erreur de chargement: ${error}`, isLoading: false });
    }
  },

  getMesuresByObjectif: (objectifId) => {
    return get().mesures.filter((m) => m.objectifId === objectifId);
  },

  getMesuresByPeriode: (centreId, periode) => {
    return get().mesures.filter((m) =>
      m.centreId === centreId &&
      m.periode.annee === periode.annee &&
      (periode.mois === undefined || m.periode.mois === periode.mois) &&
      (periode.trimestre === undefined || m.periode.trimestre === periode.trimestre)
    );
  },

  getLastMesure: (objectifId) => {
    const mesures = get().getMesuresByObjectif(objectifId);
    return mesures[0]; // Déjà trié par date décroissante
  },

  addMesure: async (mesureData) => {
    const now = new Date().toISOString();
    const { ecart, ecartPourcentage } = get().calculerEcart(mesureData.valeurReelle, mesureData.valeurCible);

    const mesure: Mesure = {
      ...mesureData,
      id: uuidv4(),
      ecart,
      ecartPourcentage,
      createdAt: now,
      updatedAt: now,
    };

    await db.mesures.add(mesure);
    set((state) => ({ mesures: [mesure, ...state.mesures] }));
    return mesure;
  },

  updateMesure: async (id, updates) => {
    const updatedAt = new Date().toISOString();

    // Recalculer l'écart si les valeurs changent
    let finalUpdates = { ...updates, updatedAt };
    if (updates.valeurReelle !== undefined || updates.valeurCible !== undefined) {
      const existingMesure = get().mesures.find((m) => m.id === id);
      if (existingMesure) {
        const valeurReelle = updates.valeurReelle ?? existingMesure.valeurReelle;
        const valeurCible = updates.valeurCible ?? existingMesure.valeurCible;
        const { ecart, ecartPourcentage } = get().calculerEcart(valeurReelle, valeurCible);
        finalUpdates = { ...finalUpdates, ecart, ecartPourcentage };
      }
    }

    await db.mesures.update(id, finalUpdates);
    set((state) => ({
      mesures: state.mesures.map((m) =>
        m.id === id ? { ...m, ...finalUpdates } : m
      ),
    }));
  },

  deleteMesure: async (id) => {
    await db.mesures.delete(id);
    set((state) => ({
      mesures: state.mesures.filter((m) => m.id !== id),
    }));
  },

  calculerStatut: (valeurReelle, seuilVert, seuilOrange, seuilRouge) => {
    // Pour les KPIs où plus c'est élevé mieux c'est (ex: taux de recouvrement)
    if (seuilVert > seuilRouge) {
      if (valeurReelle >= seuilVert) return 'vert';
      if (valeurReelle >= seuilOrange) return 'orange';
      return 'rouge';
    }
    // Pour les KPIs où moins c'est mieux (ex: ratio de charges)
    else {
      if (valeurReelle <= seuilVert) return 'vert';
      if (valeurReelle <= seuilOrange) return 'orange';
      return 'rouge';
    }
  },

  calculerEcart: (valeurReelle, valeurCible) => {
    const ecart = valeurReelle - valeurCible;
    const ecartPourcentage = valeurCible !== 0
      ? ((valeurReelle - valeurCible) / valeurCible) * 100
      : 0;
    return { ecart, ecartPourcentage: Math.round(ecartPourcentage * 100) / 100 };
  },
}));
