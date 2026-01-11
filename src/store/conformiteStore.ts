import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type { Audit, RisqueEntreprise, NonConformite, DocumentAttache } from '../types';

type TypeAudit = 'interne' | 'externe' | 'reglementaire';
type StatutAudit = 'planifie' | 'en_cours' | 'termine' | 'annule';
type GraviteNC = 'mineure' | 'majeure' | 'critique';
type StatutNC = 'ouverte' | 'en_cours' | 'cloturee';
type StatutRisque = 'identifie' | 'en_traitement' | 'accepte' | 'cloture';

interface ConformiteState {
  audits: Audit[];
  risques: RisqueEntreprise[];
  isLoading: boolean;
  error: string | null;

  // Actions CRUD Audits
  loadAudits: (centreId?: string) => Promise<void>;
  getAuditsByCentre: (centreId: string) => Audit[];
  getAuditsByType: (type: TypeAudit) => Audit[];
  getAuditsByStatut: (statut: StatutAudit) => Audit[];
  getAuditsAPlanifier: (centreId?: string) => Audit[];
  addAudit: (audit: Omit<Audit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Audit>;
  updateAudit: (id: string, updates: Partial<Audit>) => Promise<void>;
  deleteAudit: (id: string) => Promise<void>;
  changerStatutAudit: (id: string, statut: StatutAudit) => Promise<void>;

  // Gestion des non-conformités
  addNonConformite: (auditId: string, nc: Omit<NonConformite, 'id'>) => Promise<void>;
  updateNonConformite: (auditId: string, ncId: string, updates: Partial<NonConformite>) => Promise<void>;
  deleteNonConformite: (auditId: string, ncId: string) => Promise<void>;
  cloturerNonConformite: (auditId: string, ncId: string) => Promise<void>;

  // Actions CRUD Risques
  loadRisques: (centreId?: string) => Promise<void>;
  getRisquesByCentre: (centreId: string) => RisqueEntreprise[];
  getRisquesByCategorie: (categorie: string) => RisqueEntreprise[];
  getRisquesCritiques: (centreId?: string) => RisqueEntreprise[];
  addRisque: (risque: Omit<RisqueEntreprise, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RisqueEntreprise>;
  updateRisque: (id: string, updates: Partial<RisqueEntreprise>) => Promise<void>;
  deleteRisque: (id: string) => Promise<void>;
  changerStatutRisque: (id: string, statut: StatutRisque) => Promise<void>;

  // Statistiques
  getStatsAudits: (centreId: string) => {
    total: number;
    planifies: number;
    enCours: number;
    termines: number;
    ncOuvertes: number;
    ncCritiques: number;
  };
  getStatsRisques: (centreId: string) => {
    total: number;
    critiques: number;
    moyens: number;
    faibles: number;
    enTraitement: number;
  };
}

export const useConformiteStore = create<ConformiteState>((set, get) => ({
  audits: [],
  risques: [],
  isLoading: false,
  error: null,

  // ===== AUDITS =====

  loadAudits: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      let audits: Audit[];
      if (centreId) {
        audits = await db.audits.where('centreId').equals(centreId).toArray();
      } else {
        audits = await db.audits.toArray();
      }
      // Trier par date planifiée
      audits.sort((a, b) => new Date(a.datePlanifiee).getTime() - new Date(b.datePlanifiee).getTime());
      set({ audits, isLoading: false });
    } catch (error) {
      set({ error: `Erreur de chargement audits: ${error}`, isLoading: false });
    }
  },

  getAuditsByCentre: (centreId) => {
    return get().audits.filter((a) => a.centreId === centreId);
  },

  getAuditsByType: (type) => {
    return get().audits.filter((a) => a.type === type);
  },

  getAuditsByStatut: (statut) => {
    return get().audits.filter((a) => a.statut === statut);
  },

  getAuditsAPlanifier: (centreId) => {
    const today = new Date();
    const dans30Jours = new Date();
    dans30Jours.setDate(today.getDate() + 30);

    return get().audits.filter((a) => {
      const matchCentre = centreId ? a.centreId === centreId : true;
      const datePlanifiee = new Date(a.datePlanifiee);
      return matchCentre && a.statut === 'planifie' && datePlanifiee <= dans30Jours;
    });
  },

  addAudit: async (auditData) => {
    const now = new Date().toISOString();
    const audit: Audit = {
      ...auditData,
      id: uuidv4(),
      nonConformites: auditData.nonConformites || [],
      createdAt: now,
      updatedAt: now,
    };

    await db.audits.add(audit);
    set((state) => ({
      audits: [...state.audits, audit].sort(
        (a, b) => new Date(a.datePlanifiee).getTime() - new Date(b.datePlanifiee).getTime()
      ),
    }));
    return audit;
  },

  updateAudit: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.audits.update(id, { ...updates, updatedAt });
    set((state) => ({
      audits: state.audits.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt } : a
      ),
    }));
  },

  deleteAudit: async (id) => {
    await db.audits.delete(id);
    set((state) => ({
      audits: state.audits.filter((a) => a.id !== id),
    }));
  },

  changerStatutAudit: async (id, statut) => {
    const updates: Partial<Audit> = { statut };
    if (statut === 'termine') {
      updates.dateRealisation = new Date().toISOString();
    }
    await get().updateAudit(id, updates);
  },

  addNonConformite: async (auditId, ncData) => {
    const nc: NonConformite = {
      ...ncData,
      id: uuidv4(),
    };

    const audit = get().audits.find((a) => a.id === auditId);
    if (audit) {
      const updatedNCs = [...audit.nonConformites, nc];
      await get().updateAudit(auditId, { nonConformites: updatedNCs });
    }
  },

  updateNonConformite: async (auditId, ncId, updates) => {
    const audit = get().audits.find((a) => a.id === auditId);
    if (audit) {
      const updatedNCs = audit.nonConformites.map((nc) =>
        nc.id === ncId ? { ...nc, ...updates } : nc
      );
      await get().updateAudit(auditId, { nonConformites: updatedNCs });
    }
  },

  deleteNonConformite: async (auditId, ncId) => {
    const audit = get().audits.find((a) => a.id === auditId);
    if (audit) {
      const updatedNCs = audit.nonConformites.filter((nc) => nc.id !== ncId);
      await get().updateAudit(auditId, { nonConformites: updatedNCs });
    }
  },

  cloturerNonConformite: async (auditId, ncId) => {
    await get().updateNonConformite(auditId, ncId, {
      statut: 'cloturee',
      dateCloture: new Date().toISOString(),
    });
  },

  // ===== RISQUES =====

  loadRisques: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      let risques: RisqueEntreprise[];
      if (centreId) {
        risques = await db.risques.where('centreId').equals(centreId).toArray();
      } else {
        risques = await db.risques.toArray();
      }
      // Trier par score de risque décroissant
      risques.sort((a, b) => b.scoreRisque - a.scoreRisque);
      set({ risques, isLoading: false });
    } catch (error) {
      set({ error: `Erreur de chargement risques: ${error}`, isLoading: false });
    }
  },

  getRisquesByCentre: (centreId) => {
    return get().risques.filter((r) => r.centreId === centreId);
  },

  getRisquesByCategorie: (categorie) => {
    return get().risques.filter((r) => r.categorie === categorie);
  },

  getRisquesCritiques: (centreId) => {
    return get().risques.filter((r) => {
      const matchCentre = centreId ? r.centreId === centreId : true;
      return matchCentre && r.scoreRisque >= 15; // Score critique (ex: 5x3 ou 3x5)
    });
  },

  addRisque: async (risqueData) => {
    const now = new Date().toISOString();
    const risque: RisqueEntreprise = {
      ...risqueData,
      id: uuidv4(),
      scoreRisque: risqueData.probabilite * risqueData.impact,
      createdAt: now,
      updatedAt: now,
    };

    await db.risques.add(risque);
    set((state) => ({
      risques: [...state.risques, risque].sort((a, b) => b.scoreRisque - a.scoreRisque),
    }));
    return risque;
  },

  updateRisque: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    const risque = get().risques.find((r) => r.id === id);

    // Recalculer le score si probabilité ou impact change
    let finalUpdates = { ...updates, updatedAt };
    if (updates.probabilite !== undefined || updates.impact !== undefined) {
      const prob = updates.probabilite ?? risque?.probabilite ?? 1;
      const imp = updates.impact ?? risque?.impact ?? 1;
      finalUpdates.scoreRisque = prob * imp;
    }

    await db.risques.update(id, finalUpdates);
    set((state) => ({
      risques: state.risques
        .map((r) => (r.id === id ? { ...r, ...finalUpdates } : r))
        .sort((a, b) => b.scoreRisque - a.scoreRisque),
    }));
  },

  deleteRisque: async (id) => {
    await db.risques.delete(id);
    set((state) => ({
      risques: state.risques.filter((r) => r.id !== id),
    }));
  },

  changerStatutRisque: async (id, statut) => {
    const updates: Partial<RisqueEntreprise> = { statut };
    if (statut === 'cloture' || statut === 'accepte') {
      updates.dateDerniereRevue = new Date().toISOString();
    }
    await get().updateRisque(id, updates);
  },

  // ===== STATISTIQUES =====

  getStatsAudits: (centreId) => {
    const audits = get().getAuditsByCentre(centreId);
    const ncOuvertes = audits.reduce(
      (acc, a) => acc + a.nonConformites.filter((nc) => nc.statut !== 'cloturee').length,
      0
    );
    const ncCritiques = audits.reduce(
      (acc, a) => acc + a.nonConformites.filter((nc) => nc.gravite === 'critique' && nc.statut !== 'cloturee').length,
      0
    );

    return {
      total: audits.length,
      planifies: audits.filter((a) => a.statut === 'planifie').length,
      enCours: audits.filter((a) => a.statut === 'en_cours').length,
      termines: audits.filter((a) => a.statut === 'termine').length,
      ncOuvertes,
      ncCritiques,
    };
  },

  getStatsRisques: (centreId) => {
    const risques = get().getRisquesByCentre(centreId).filter((r) => r.statut !== 'cloture');

    return {
      total: risques.length,
      critiques: risques.filter((r) => r.scoreRisque >= 15).length,
      moyens: risques.filter((r) => r.scoreRisque >= 8 && r.scoreRisque < 15).length,
      faibles: risques.filter((r) => r.scoreRisque < 8).length,
      enTraitement: risques.filter((r) => r.statut === 'en_traitement').length,
    };
  },
}));
