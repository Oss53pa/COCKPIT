import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type { AxeStrategique, Objectif } from '../types';

interface AxesState {
  axes: AxeStrategique[];
  objectifs: Objectif[];
  isLoading: boolean;
  error: string | null;

  // Actions Axes
  loadAxes: (centreId?: string) => Promise<void>;
  getAxesByCentre: (centreId: string) => AxeStrategique[];
  addAxe: (axe: Omit<AxeStrategique, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AxeStrategique>;
  updateAxe: (id: string, updates: Partial<AxeStrategique>) => Promise<void>;
  deleteAxe: (id: string) => Promise<void>;

  // Actions Objectifs
  loadObjectifs: (centreId?: string) => Promise<void>;
  getObjectifsByAxe: (axeId: string) => Objectif[];
  getObjectifsByCentre: (centreId: string) => Objectif[];
  addObjectif: (objectif: Omit<Objectif, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Objectif>;
  updateObjectif: (id: string, updates: Partial<Objectif>) => Promise<void>;
  deleteObjectif: (id: string) => Promise<void>;

  // Initialisation des axes par défaut
  initializeDefaultAxes: (centreId: string) => Promise<void>;
}

const defaultAxesTemplate = [
  { code: 'AXE1', nom: 'Performance Financière', couleur: '#3b82f6', icone: 'TrendingUp', poids: 25 },
  { code: 'AXE2', nom: 'Excellence Opérationnelle', couleur: '#10b981', icone: 'Settings', poids: 20 },
  { code: 'AXE3', nom: 'Gouvernance & Conformité', couleur: '#8b5cf6', icone: 'Shield', poids: 15 },
  { code: 'AXE4', nom: 'Développement Commercial', couleur: '#f97316', icone: 'Store', poids: 20 },
  { code: 'AXE5', nom: 'Leadership & Capital Humain', couleur: '#ec4899', icone: 'Users', poids: 10 },
  { code: 'AXE6', nom: 'Relations Stakeholders', couleur: '#06b6d4', icone: 'Handshake', poids: 10 },
];

export const useAxesStore = create<AxesState>((set, get) => ({
  axes: [],
  objectifs: [],
  isLoading: false,
  error: null,

  // Axes
  loadAxes: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      let axes: AxeStrategique[];
      if (centreId) {
        axes = await db.axes.where('centreId').equals(centreId).sortBy('ordre');
      } else {
        axes = await db.axes.orderBy('ordre').toArray();
      }
      set({ axes, isLoading: false });
    } catch (error) {
      set({ error: `Erreur de chargement: ${error}`, isLoading: false });
    }
  },

  getAxesByCentre: (centreId) => {
    return get().axes.filter((a) => a.centreId === centreId).sort((a, b) => a.ordre - b.ordre);
  },

  addAxe: async (axeData) => {
    const now = new Date().toISOString();
    const axe: AxeStrategique = {
      ...axeData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    await db.axes.add(axe);
    set((state) => ({ axes: [...state.axes, axe] }));
    return axe;
  },

  updateAxe: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.axes.update(id, { ...updates, updatedAt });
    set((state) => ({
      axes: state.axes.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt } : a
      ),
    }));
  },

  deleteAxe: async (id) => {
    await db.axes.delete(id);
    // Supprimer les objectifs liés
    await db.objectifs.where('axeId').equals(id).delete();
    set((state) => ({
      axes: state.axes.filter((a) => a.id !== id),
      objectifs: state.objectifs.filter((o) => o.axeId !== id),
    }));
  },

  // Objectifs
  loadObjectifs: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      let objectifs: Objectif[];
      if (centreId) {
        objectifs = await db.objectifs.where('centreId').equals(centreId).toArray();
      } else {
        objectifs = await db.objectifs.toArray();
      }
      set({ objectifs, isLoading: false });
    } catch (error) {
      set({ error: `Erreur de chargement: ${error}`, isLoading: false });
    }
  },

  getObjectifsByAxe: (axeId) => {
    return get().objectifs.filter((o) => o.axeId === axeId);
  },

  getObjectifsByCentre: (centreId) => {
    return get().objectifs.filter((o) => o.centreId === centreId);
  },

  addObjectif: async (objectifData) => {
    const now = new Date().toISOString();
    const objectif: Objectif = {
      ...objectifData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    await db.objectifs.add(objectif);
    set((state) => ({ objectifs: [...state.objectifs, objectif] }));
    return objectif;
  },

  updateObjectif: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.objectifs.update(id, { ...updates, updatedAt });
    set((state) => ({
      objectifs: state.objectifs.map((o) =>
        o.id === id ? { ...o, ...updates, updatedAt } : o
      ),
    }));
  },

  deleteObjectif: async (id) => {
    await db.objectifs.delete(id);
    set((state) => ({
      objectifs: state.objectifs.filter((o) => o.id !== id),
    }));
  },

  // Initialisation des axes par défaut pour un nouveau centre
  initializeDefaultAxes: async (centreId) => {
    const now = new Date().toISOString();
    const axes: AxeStrategique[] = defaultAxesTemplate.map((template, index) => ({
      ...template,
      id: uuidv4(),
      centreId,
      description: `Axe stratégique ${template.nom}`,
      ordre: index + 1,
      createdAt: now,
      updatedAt: now,
    }));

    await db.axes.bulkAdd(axes);
    set((state) => ({ axes: [...state.axes, ...axes] }));
  },
}));
