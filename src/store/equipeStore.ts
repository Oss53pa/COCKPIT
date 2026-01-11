import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type {
  MembreEquipe,
  Departement,
  TypeContrat,
  StatutMembre,
  Competence,
  Formation,
  Absence,
  StatistiquesEquipe,
} from '../types';

interface EquipeState {
  membres: MembreEquipe[];
  isLoading: boolean;
  error: string | null;

  // Actions - Chargement
  loadMembres: (centreId: string) => Promise<void>;

  // Actions - CRUD
  addMembre: (membre: Omit<MembreEquipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MembreEquipe>;
  updateMembre: (id: string, updates: Partial<MembreEquipe>) => Promise<void>;
  deleteMembre: (id: string) => Promise<void>;

  // Actions - Compétences
  addCompetence: (membreId: string, competence: Omit<Competence, 'id'>) => Promise<void>;
  removeCompetence: (membreId: string, competenceId: string) => Promise<void>;

  // Actions - Formations
  addFormation: (membreId: string, formation: Omit<Formation, 'id'>) => Promise<void>;
  removeFormation: (membreId: string, formationId: string) => Promise<void>;

  // Actions - Absences
  addAbsence: (membreId: string, absence: Omit<Absence, 'id'>) => Promise<void>;
  updateAbsence: (membreId: string, absenceId: string, updates: Partial<Absence>) => Promise<void>;
  removeAbsence: (membreId: string, absenceId: string) => Promise<void>;

  // Getters
  getMembresByCentre: (centreId: string) => MembreEquipe[];
  getMembresByDepartement: (centreId: string, departement: Departement) => MembreEquipe[];
  getMembresByManager: (managerId: string) => MembreEquipe[];
  getMembre: (id: string) => MembreEquipe | undefined;
  getStatistiques: (centreId: string) => StatistiquesEquipe;
  getOrganigramme: (centreId: string) => { membre: MembreEquipe; subordinates: MembreEquipe[] }[];
}

export const useEquipeStore = create<EquipeState>((set, get) => ({
  membres: [],
  isLoading: false,
  error: null,

  // ===========================================
  // CHARGEMENT
  // ===========================================

  loadMembres: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      const membres = await db.membresEquipe
        .where('centreId')
        .equals(centreId)
        .toArray();
      set({ membres, isLoading: false });
    } catch (error) {
      set({ error: `Erreur chargement équipe: ${error}`, isLoading: false });
    }
  },

  // ===========================================
  // CRUD MEMBRES
  // ===========================================

  addMembre: async (membreData) => {
    const now = new Date().toISOString();
    const membre: MembreEquipe = {
      ...membreData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    await db.membresEquipe.add(membre);
    set((state) => ({ membres: [...state.membres, membre] }));
    return membre;
  },

  updateMembre: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.membresEquipe.update(id, { ...updates, updatedAt });
    set((state) => ({
      membres: state.membres.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt } : m
      ),
    }));
  },

  deleteMembre: async (id) => {
    await db.membresEquipe.delete(id);
    set((state) => ({
      membres: state.membres.filter((m) => m.id !== id),
    }));
  },

  // ===========================================
  // COMPETENCES
  // ===========================================

  addCompetence: async (membreId, competenceData) => {
    const membre = get().membres.find((m) => m.id === membreId);
    if (!membre) return;

    const competence: Competence = {
      ...competenceData,
      id: uuidv4(),
    };

    const newCompetences = [...membre.competences, competence];
    await get().updateMembre(membreId, { competences: newCompetences });
  },

  removeCompetence: async (membreId, competenceId) => {
    const membre = get().membres.find((m) => m.id === membreId);
    if (!membre) return;

    const newCompetences = membre.competences.filter((c) => c.id !== competenceId);
    await get().updateMembre(membreId, { competences: newCompetences });
  },

  // ===========================================
  // FORMATIONS
  // ===========================================

  addFormation: async (membreId, formationData) => {
    const membre = get().membres.find((m) => m.id === membreId);
    if (!membre) return;

    const formation: Formation = {
      ...formationData,
      id: uuidv4(),
    };

    const newFormations = [...membre.formations, formation];
    await get().updateMembre(membreId, { formations: newFormations });
  },

  removeFormation: async (membreId, formationId) => {
    const membre = get().membres.find((m) => m.id === membreId);
    if (!membre) return;

    const newFormations = membre.formations.filter((f) => f.id !== formationId);
    await get().updateMembre(membreId, { formations: newFormations });
  },

  // ===========================================
  // ABSENCES
  // ===========================================

  addAbsence: async (membreId, absenceData) => {
    const membre = get().membres.find((m) => m.id === membreId);
    if (!membre) return;

    const absence: Absence = {
      ...absenceData,
      id: uuidv4(),
    };

    const newAbsences = [...membre.absences, absence];
    await get().updateMembre(membreId, { absences: newAbsences });
  },

  updateAbsence: async (membreId, absenceId, updates) => {
    const membre = get().membres.find((m) => m.id === membreId);
    if (!membre) return;

    const newAbsences = membre.absences.map((a) =>
      a.id === absenceId ? { ...a, ...updates } : a
    );
    await get().updateMembre(membreId, { absences: newAbsences });
  },

  removeAbsence: async (membreId, absenceId) => {
    const membre = get().membres.find((m) => m.id === membreId);
    if (!membre) return;

    const newAbsences = membre.absences.filter((a) => a.id !== absenceId);
    await get().updateMembre(membreId, { absences: newAbsences });
  },

  // ===========================================
  // GETTERS
  // ===========================================

  getMembresByCentre: (centreId) => {
    return get().membres.filter((m) => m.centreId === centreId);
  },

  getMembresByDepartement: (centreId, departement) => {
    return get().membres.filter(
      (m) => m.centreId === centreId && m.departement === departement
    );
  },

  getMembresByManager: (managerId) => {
    return get().membres.filter((m) => m.managerId === managerId);
  },

  getMembre: (id) => {
    return get().membres.find((m) => m.id === id);
  },

  getStatistiques: (centreId) => {
    const membres = get().getMembresByCentre(centreId);
    const now = new Date();

    const stats: StatistiquesEquipe = {
      totalMembres: membres.length,
      parDepartement: {
        direction: 0,
        facility: 0,
        finance: 0,
        securite: 0,
        commercial_marketing: 0,
        administration: 0,
      },
      parTypeContrat: {
        cdi: 0,
        cdd: 0,
        stage: 0,
        interim: 0,
        consultant: 0,
        prestataire: 0,
      },
      parStatut: {
        actif: 0,
        conge: 0,
        formation: 0,
        mission: 0,
        inactif: 0,
      },
      masseSalariale: 0,
      ancienneteMovenne: 0,
      tauxPresence: 0,
    };

    let totalAnciennete = 0;
    let membresActifs = 0;

    membres.forEach((m) => {
      // Par département
      stats.parDepartement[m.departement]++;

      // Par type contrat
      stats.parTypeContrat[m.typeContrat]++;

      // Par statut
      stats.parStatut[m.statut]++;

      // Masse salariale
      if (m.salaireBase) {
        stats.masseSalariale! += m.salaireBase;
      }

      // Ancienneté
      const dateEmbauche = new Date(m.dateEmbauche);
      const anciennete = (now.getTime() - dateEmbauche.getTime()) / (1000 * 60 * 60 * 24 * 365);
      totalAnciennete += anciennete;

      // Présence
      if (m.statut === 'actif') {
        membresActifs++;
      }
    });

    stats.ancienneteMovenne = membres.length > 0 ? totalAnciennete / membres.length : 0;
    stats.tauxPresence = membres.length > 0 ? (membresActifs / membres.length) * 100 : 0;

    return stats;
  },

  getOrganigramme: (centreId) => {
    const membres = get().getMembresByCentre(centreId);

    // Trouver les managers (ceux qui n'ont pas de managerId ou dont le manager n'est pas dans le centre)
    const topLevel = membres.filter(
      (m) => !m.managerId || !membres.find((other) => other.id === m.managerId)
    );

    return topLevel.map((manager) => ({
      membre: manager,
      subordinates: membres.filter((m) => m.managerId === manager.id),
    }));
  },
}));

// Selectors
export const selectMembres = (state: EquipeState) => state.membres;
export const selectIsLoading = (state: EquipeState) => state.isLoading;
