import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type { Alerte, AlertePriorite } from '../types';
import { useNotificationStore } from './notificationStore';

interface AlertesState {
  alertes: Alerte[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadAlertes: () => Promise<void>;
  getAlertesNonLues: () => Alerte[];
  getAlertesByCentre: (centreId: string) => Alerte[];
  getAlertesByPriorite: (priorite: AlertePriorite) => Alerte[];
  addAlerte: (alerte: Omit<Alerte, 'id' | 'lue' | 'traitee' | 'dateCreation'>) => Promise<Alerte>;
  marquerCommeLue: (id: string) => Promise<void>;
  marquerCommeTraitee: (id: string) => Promise<void>;
  supprimerAlerte: (id: string) => Promise<void>;
  supprimerAlertesTraitees: () => Promise<void>;
}

export const useAlertesStore = create<AlertesState>((set, get) => ({
  alertes: [],
  isLoading: false,
  error: null,

  loadAlertes: async () => {
    set({ isLoading: true, error: null });
    try {
      const alertes = await db.alertes.orderBy('dateCreation').reverse().toArray();
      set({ alertes, isLoading: false });
    } catch (error) {
      set({ error: `Erreur de chargement: ${error}`, isLoading: false });
    }
  },

  getAlertesNonLues: () => {
    return get().alertes.filter((a) => !a.lue);
  },

  getAlertesByCentre: (centreId) => {
    return get().alertes.filter((a) => a.centreId === centreId);
  },

  getAlertesByPriorite: (priorite) => {
    return get().alertes.filter((a) => a.priorite === priorite);
  },

  addAlerte: async (alerteData) => {
    const alerte: Alerte = {
      ...alerteData,
      id: uuidv4(),
      lue: false,
      traitee: false,
      dateCreation: new Date().toISOString(),
    };

    await db.alertes.add(alerte);
    set((state) => ({ alertes: [alerte, ...state.alertes] }));

    // Envoyer une notification email si configuré
    try {
      const notificationStore = useNotificationStore.getState();
      if (notificationStore.config.enabled) {
        // Récupérer le nom du centre si disponible
        let centreName: string | undefined;
        if (alerteData.centreId) {
          const centre = await db.centres.get(alerteData.centreId);
          centreName = centre?.nom;
        }

        await notificationStore.sendAlertNotification(
          alerte.titre,
          alerte.message,
          alerte.priorite,
          centreName,
          alerte.lien
        );
      }
    } catch (error) {
      console.warn('Erreur envoi notification email:', error);
    }

    return alerte;
  },

  marquerCommeLue: async (id) => {
    await db.alertes.update(id, { lue: true });
    set((state) => ({
      alertes: state.alertes.map((a) =>
        a.id === id ? { ...a, lue: true } : a
      ),
    }));
  },

  marquerCommeTraitee: async (id) => {
    const dateTraitement = new Date().toISOString();
    await db.alertes.update(id, { traitee: true, dateTraitement });
    set((state) => ({
      alertes: state.alertes.map((a) =>
        a.id === id ? { ...a, traitee: true, dateTraitement } : a
      ),
    }));
  },

  supprimerAlerte: async (id) => {
    await db.alertes.delete(id);
    set((state) => ({
      alertes: state.alertes.filter((a) => a.id !== id),
    }));
  },

  supprimerAlertesTraitees: async () => {
    const alertesTraitees = get().alertes.filter((a) => a.traitee);
    await Promise.all(alertesTraitees.map((a) => db.alertes.delete(a.id)));
    set((state) => ({
      alertes: state.alertes.filter((a) => !a.traitee),
    }));
  },
}));
