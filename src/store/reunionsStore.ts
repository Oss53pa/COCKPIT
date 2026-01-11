import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type { Reunion, TypeReunion, Decision } from '../types';

type StatutReunion = 'planifiee' | 'realisee' | 'annulee' | 'reportee';

interface ReunionsState {
  reunions: Reunion[];
  isLoading: boolean;
  error: string | null;

  // Actions CRUD
  loadReunions: (centreId?: string) => Promise<void>;
  getReunionsByCentre: (centreId: string) => Reunion[];
  getReunionsByType: (type: TypeReunion) => Reunion[];
  getReunionsByStatut: (statut: StatutReunion) => Reunion[];
  getReunionsAVenir: (centreId?: string) => Reunion[];
  getReunionsPassees: (centreId?: string) => Reunion[];
  addReunion: (reunion: Omit<Reunion, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Reunion>;
  updateReunion: (id: string, updates: Partial<Reunion>) => Promise<void>;
  deleteReunion: (id: string) => Promise<void>;

  // Gestion des décisions
  addDecision: (reunionId: string, decision: Omit<Decision, 'id'>) => Promise<void>;
  updateDecision: (reunionId: string, decisionId: string, updates: Partial<Decision>) => Promise<void>;
  deleteDecision: (reunionId: string, decisionId: string) => Promise<void>;

  // Changement de statut
  changerStatut: (id: string, nouveauStatut: StatutReunion) => Promise<void>;

  // Gestion de l'ordre du jour
  addPointOrdreDuJour: (reunionId: string, point: string) => Promise<void>;
  removePointOrdreDuJour: (reunionId: string, index: number) => Promise<void>;
  updatePointOrdreDuJour: (reunionId: string, index: number, nouveauPoint: string) => Promise<void>;

  // Gestion des participants
  addParticipant: (reunionId: string, participant: string) => Promise<void>;
  removeParticipant: (reunionId: string, participant: string) => Promise<void>;
}

export const useReunionsStore = create<ReunionsState>((set, get) => ({
  reunions: [],
  isLoading: false,
  error: null,

  loadReunions: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      let reunions: Reunion[];
      if (centreId) {
        reunions = await db.reunions.where('centreId').equals(centreId).toArray();
      } else {
        reunions = await db.reunions.toArray();
      }
      // Trier par date (les plus récentes d'abord)
      reunions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      set({ reunions, isLoading: false });
    } catch (error) {
      set({ error: `Erreur de chargement: ${error}`, isLoading: false });
    }
  },

  getReunionsByCentre: (centreId) => {
    return get().reunions.filter((r) => r.centreId === centreId);
  },

  getReunionsByType: (type) => {
    return get().reunions.filter((r) => r.type === type);
  },

  getReunionsByStatut: (statut) => {
    return get().reunions.filter((r) => r.statut === statut);
  },

  getReunionsAVenir: (centreId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return get().reunions.filter((r) => {
      const dateReunion = new Date(r.date);
      const matchCentre = centreId ? r.centreId === centreId : true;
      return matchCentre && dateReunion >= today && r.statut === 'planifiee';
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  getReunionsPassees: (centreId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return get().reunions.filter((r) => {
      const dateReunion = new Date(r.date);
      const matchCentre = centreId ? r.centreId === centreId : true;
      return matchCentre && (dateReunion < today || r.statut === 'realisee');
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addReunion: async (reunionData) => {
    const now = new Date().toISOString();
    const reunion: Reunion = {
      ...reunionData,
      id: uuidv4(),
      ordreDuJour: reunionData.ordreDuJour || [],
      participants: reunionData.participants || [],
      decisions: reunionData.decisions || [],
      actionsCreees: reunionData.actionsCreees || [],
      createdAt: now,
      updatedAt: now,
    };

    await db.reunions.add(reunion);
    set((state) => ({
      reunions: [reunion, ...state.reunions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    }));
    return reunion;
  },

  updateReunion: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.reunions.update(id, { ...updates, updatedAt });
    set((state) => ({
      reunions: state.reunions.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt } : r
      ),
    }));
  },

  deleteReunion: async (id) => {
    await db.reunions.delete(id);
    set((state) => ({
      reunions: state.reunions.filter((r) => r.id !== id),
    }));
  },

  addDecision: async (reunionId, decisionData) => {
    const decision: Decision = {
      ...decisionData,
      id: uuidv4(),
    };

    const reunion = get().reunions.find((r) => r.id === reunionId);
    if (reunion) {
      const updatedDecisions = [...reunion.decisions, decision];
      await get().updateReunion(reunionId, { decisions: updatedDecisions });
    }
  },

  updateDecision: async (reunionId, decisionId, updates) => {
    const reunion = get().reunions.find((r) => r.id === reunionId);
    if (reunion) {
      const updatedDecisions = reunion.decisions.map((d) =>
        d.id === decisionId ? { ...d, ...updates } : d
      );
      await get().updateReunion(reunionId, { decisions: updatedDecisions });
    }
  },

  deleteDecision: async (reunionId, decisionId) => {
    const reunion = get().reunions.find((r) => r.id === reunionId);
    if (reunion) {
      const updatedDecisions = reunion.decisions.filter((d) => d.id !== decisionId);
      await get().updateReunion(reunionId, { decisions: updatedDecisions });
    }
  },

  changerStatut: async (id, nouveauStatut) => {
    await get().updateReunion(id, { statut: nouveauStatut });
  },

  addPointOrdreDuJour: async (reunionId, point) => {
    const reunion = get().reunions.find((r) => r.id === reunionId);
    if (reunion) {
      const updatedOrdreDuJour = [...reunion.ordreDuJour, point];
      await get().updateReunion(reunionId, { ordreDuJour: updatedOrdreDuJour });
    }
  },

  removePointOrdreDuJour: async (reunionId, index) => {
    const reunion = get().reunions.find((r) => r.id === reunionId);
    if (reunion) {
      const updatedOrdreDuJour = reunion.ordreDuJour.filter((_, i) => i !== index);
      await get().updateReunion(reunionId, { ordreDuJour: updatedOrdreDuJour });
    }
  },

  updatePointOrdreDuJour: async (reunionId, index, nouveauPoint) => {
    const reunion = get().reunions.find((r) => r.id === reunionId);
    if (reunion) {
      const updatedOrdreDuJour = reunion.ordreDuJour.map((point, i) =>
        i === index ? nouveauPoint : point
      );
      await get().updateReunion(reunionId, { ordreDuJour: updatedOrdreDuJour });
    }
  },

  addParticipant: async (reunionId, participant) => {
    const reunion = get().reunions.find((r) => r.id === reunionId);
    if (reunion && !reunion.participants.includes(participant)) {
      const updatedParticipants = [...reunion.participants, participant];
      await get().updateReunion(reunionId, { participants: updatedParticipants });
    }
  },

  removeParticipant: async (reunionId, participant) => {
    const reunion = get().reunions.find((r) => r.id === reunionId);
    if (reunion) {
      const updatedParticipants = reunion.participants.filter((p) => p !== participant);
      await get().updateReunion(reunionId, { participants: updatedParticipants });
    }
  },
}));
