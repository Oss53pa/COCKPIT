import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type { Livrable, VersionLivrable, FrequenceMesure, Periode, DocumentAttache } from '../types';

type StatutVersion = 'brouillon' | 'valide' | 'envoye';

interface LivrablesState {
  livrables: Livrable[];
  isLoading: boolean;
  error: string | null;

  // Actions CRUD
  loadLivrables: (centreId?: string) => Promise<void>;
  getLivrablesByCentre: (centreId: string) => Livrable[];
  getLivrablesByAxe: (axeId: string) => Livrable[];
  getLivrablesByFrequence: (frequence: FrequenceMesure) => Livrable[];
  getLivrablesEnRetard: (centreId?: string) => Livrable[];
  addLivrable: (livrable: Omit<Livrable, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Livrable>;
  updateLivrable: (id: string, updates: Partial<Livrable>) => Promise<void>;
  deleteLivrable: (id: string) => Promise<void>;

  // Gestion des versions
  addVersion: (livrableId: string, version: Omit<VersionLivrable, 'id'>) => Promise<void>;
  updateVersion: (livrableId: string, versionId: string, updates: Partial<VersionLivrable>) => Promise<void>;
  deleteVersion: (livrableId: string, versionId: string) => Promise<void>;
  changerStatutVersion: (livrableId: string, versionId: string, statut: StatutVersion) => Promise<void>;

  // Utilitaires
  getDerniereVersion: (livrable: Livrable) => VersionLivrable | undefined;
  getProchaineLivraison: (livrable: Livrable) => Date | null;
  isLivrableEnRetard: (livrable: Livrable) => boolean;
}

// Calcul de la prochaine date de livraison basée sur la fréquence
function calculerProchaineLivraison(livrable: Livrable): Date | null {
  const derniereVersion = livrable.historique
    .filter((v) => v.statut === 'envoye')
    .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())[0];

  const dateReference = derniereVersion
    ? new Date(derniereVersion.dateCreation)
    : new Date(livrable.createdAt);

  const prochaine = new Date(dateReference);

  switch (livrable.frequence) {
    case 'quotidien':
      prochaine.setDate(prochaine.getDate() + 1);
      break;
    case 'hebdomadaire':
      prochaine.setDate(prochaine.getDate() + 7);
      break;
    case 'mensuel':
      prochaine.setMonth(prochaine.getMonth() + 1);
      break;
    case 'bimestriel':
      prochaine.setMonth(prochaine.getMonth() + 2);
      break;
    case 'trimestriel':
      prochaine.setMonth(prochaine.getMonth() + 3);
      break;
    case 'semestriel':
      prochaine.setMonth(prochaine.getMonth() + 6);
      break;
    case 'annuel':
      prochaine.setFullYear(prochaine.getFullYear() + 1);
      break;
    default:
      return null;
  }

  return prochaine;
}

export const useLivrablesStore = create<LivrablesState>((set, get) => ({
  livrables: [],
  isLoading: false,
  error: null,

  loadLivrables: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      let livrables: Livrable[];
      if (centreId) {
        livrables = await db.livrables.where('centreId').equals(centreId).toArray();
      } else {
        livrables = await db.livrables.toArray();
      }
      // Trier par titre
      livrables.sort((a, b) => a.titre.localeCompare(b.titre));
      set({ livrables, isLoading: false });
    } catch (error) {
      set({ error: `Erreur de chargement: ${error}`, isLoading: false });
    }
  },

  getLivrablesByCentre: (centreId) => {
    return get().livrables.filter((l) => l.centreId === centreId);
  },

  getLivrablesByAxe: (axeId) => {
    return get().livrables.filter((l) => l.axeId === axeId);
  },

  getLivrablesByFrequence: (frequence) => {
    return get().livrables.filter((l) => l.frequence === frequence);
  },

  getLivrablesEnRetard: (centreId) => {
    const today = new Date();
    return get().livrables.filter((l) => {
      const matchCentre = centreId ? l.centreId === centreId : true;
      if (!matchCentre) return false;

      const prochaine = calculerProchaineLivraison(l);
      return prochaine && prochaine < today;
    });
  },

  addLivrable: async (livrableData) => {
    const now = new Date().toISOString();
    const livrable: Livrable = {
      ...livrableData,
      id: uuidv4(),
      historique: livrableData.historique || [],
      createdAt: now,
      updatedAt: now,
    };

    await db.livrables.add(livrable);
    set((state) => ({
      livrables: [...state.livrables, livrable].sort((a, b) => a.titre.localeCompare(b.titre))
    }));
    return livrable;
  },

  updateLivrable: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.livrables.update(id, { ...updates, updatedAt });
    set((state) => ({
      livrables: state.livrables.map((l) =>
        l.id === id ? { ...l, ...updates, updatedAt } : l
      ),
    }));
  },

  deleteLivrable: async (id) => {
    await db.livrables.delete(id);
    set((state) => ({
      livrables: state.livrables.filter((l) => l.id !== id),
    }));
  },

  addVersion: async (livrableId, versionData) => {
    const version: VersionLivrable = {
      ...versionData,
      id: uuidv4(),
    };

    const livrable = get().livrables.find((l) => l.id === livrableId);
    if (livrable) {
      const updatedHistorique = [...livrable.historique, version];
      await get().updateLivrable(livrableId, { historique: updatedHistorique });
    }
  },

  updateVersion: async (livrableId, versionId, updates) => {
    const livrable = get().livrables.find((l) => l.id === livrableId);
    if (livrable) {
      const updatedHistorique = livrable.historique.map((v) =>
        v.id === versionId ? { ...v, ...updates } : v
      );
      await get().updateLivrable(livrableId, { historique: updatedHistorique });
    }
  },

  deleteVersion: async (livrableId, versionId) => {
    const livrable = get().livrables.find((l) => l.id === livrableId);
    if (livrable) {
      const updatedHistorique = livrable.historique.filter((v) => v.id !== versionId);
      await get().updateLivrable(livrableId, { historique: updatedHistorique });
    }
  },

  changerStatutVersion: async (livrableId, versionId, statut) => {
    await get().updateVersion(livrableId, versionId, { statut });
  },

  getDerniereVersion: (livrable) => {
    if (livrable.historique.length === 0) return undefined;
    return livrable.historique
      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())[0];
  },

  getProchaineLivraison: (livrable) => {
    return calculerProchaineLivraison(livrable);
  },

  isLivrableEnRetard: (livrable) => {
    const prochaine = calculerProchaineLivraison(livrable);
    if (!prochaine) return false;
    return prochaine < new Date();
  },
}));
