import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type { PlanAction, SousAction, StatutAction, PrioriteAction, Commentaire } from '../types';

interface ActionsState {
  actions: PlanAction[];
  isLoading: boolean;
  error: string | null;

  // Actions CRUD
  loadActions: (centreId?: string) => Promise<void>;
  getActionsByCentre: (centreId: string) => PlanAction[];
  getActionsByStatut: (statut: StatutAction) => PlanAction[];
  getActionsByAxe: (axeId: string) => PlanAction[];
  getActionsEnRetard: () => PlanAction[];
  addAction: (action: Omit<PlanAction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PlanAction>;
  updateAction: (id: string, updates: Partial<PlanAction>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;

  // Gestion des sous-actions
  addSousAction: (actionId: string, sousAction: Omit<SousAction, 'id'>) => Promise<void>;
  updateSousAction: (actionId: string, sousActionId: string, updates: Partial<SousAction>) => Promise<void>;
  deleteSousAction: (actionId: string, sousActionId: string) => Promise<void>;

  // Commentaires
  addCommentaire: (actionId: string, auteur: string, contenu: string) => Promise<void>;

  // Changement de statut
  changerStatut: (id: string, nouveauStatut: StatutAction) => Promise<void>;

  // Calcul d'avancement
  calculerAvancement: (action: PlanAction) => number;
}

export const useActionsStore = create<ActionsState>((set, get) => ({
  actions: [],
  isLoading: false,
  error: null,

  loadActions: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      let actions: PlanAction[];
      if (centreId) {
        actions = await db.actions.where('centreId').equals(centreId).toArray();
      } else {
        actions = await db.actions.toArray();
      }
      // Trier par priorité puis par échéance
      actions.sort((a, b) => {
        const prioriteOrder: Record<PrioriteAction, number> = { critique: 0, haute: 1, moyenne: 2, basse: 3 };
        if (prioriteOrder[a.priorite] !== prioriteOrder[b.priorite]) {
          return prioriteOrder[a.priorite] - prioriteOrder[b.priorite];
        }
        return new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime();
      });
      set({ actions, isLoading: false });
    } catch (error) {
      set({ error: `Erreur de chargement: ${error}`, isLoading: false });
    }
  },

  getActionsByCentre: (centreId) => {
    return get().actions.filter((a) => a.centreId === centreId);
  },

  getActionsByStatut: (statut) => {
    return get().actions.filter((a) => a.statut === statut);
  },

  getActionsByAxe: (axeId) => {
    return get().actions.filter((a) => a.axeId === axeId);
  },

  getActionsEnRetard: () => {
    const today = new Date();
    return get().actions.filter((a) =>
      a.statut !== 'termine' &&
      a.statut !== 'annule' &&
      new Date(a.dateEcheance) < today
    );
  },

  addAction: async (actionData) => {
    const now = new Date().toISOString();
    const action: PlanAction = {
      ...actionData,
      id: uuidv4(),
      sousActions: actionData.sousActions || [],
      risques: actionData.risques || [],
      commentaires: actionData.commentaires || [],
      contributeurs: actionData.contributeurs || [],
      createdAt: now,
      updatedAt: now,
    };

    await db.actions.add(action);
    set((state) => ({ actions: [...state.actions, action] }));
    return action;
  },

  updateAction: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.actions.update(id, { ...updates, updatedAt });
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt } : a
      ),
    }));
  },

  deleteAction: async (id) => {
    await db.actions.delete(id);
    set((state) => ({
      actions: state.actions.filter((a) => a.id !== id),
    }));
  },

  addSousAction: async (actionId, sousActionData) => {
    const sousAction: SousAction = {
      ...sousActionData,
      id: uuidv4(),
    };

    const action = get().actions.find((a) => a.id === actionId);
    if (action) {
      const updatedSousActions = [...action.sousActions, sousAction];
      await get().updateAction(actionId, { sousActions: updatedSousActions });
    }
  },

  updateSousAction: async (actionId, sousActionId, updates) => {
    const action = get().actions.find((a) => a.id === actionId);
    if (action) {
      const updatedSousActions = action.sousActions.map((sa) =>
        sa.id === sousActionId ? { ...sa, ...updates } : sa
      );
      await get().updateAction(actionId, { sousActions: updatedSousActions });
    }
  },

  deleteSousAction: async (actionId, sousActionId) => {
    const action = get().actions.find((a) => a.id === actionId);
    if (action) {
      const updatedSousActions = action.sousActions.filter((sa) => sa.id !== sousActionId);
      await get().updateAction(actionId, { sousActions: updatedSousActions });
    }
  },

  addCommentaire: async (actionId, auteur, contenu) => {
    const commentaire: Commentaire = {
      id: uuidv4(),
      auteur,
      contenu,
      date: new Date().toISOString(),
    };

    const action = get().actions.find((a) => a.id === actionId);
    if (action) {
      const updatedCommentaires = [...action.commentaires, commentaire];
      await get().updateAction(actionId, { commentaires: updatedCommentaires });
    }
  },

  changerStatut: async (id, nouveauStatut) => {
    const updates: Partial<PlanAction> = { statut: nouveauStatut };

    if (nouveauStatut === 'termine') {
      updates.dateRealisation = new Date().toISOString();
      updates.avancement = 100;
    }

    await get().updateAction(id, updates);
  },

  calculerAvancement: (action) => {
    if (action.sousActions.length === 0) {
      return action.avancement;
    }

    const totalAvancement = action.sousActions.reduce((sum, sa) => sum + sa.avancement, 0);
    return Math.round(totalAvancement / action.sousActions.length);
  },
}));
