import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type { Evaluation, CritereEvaluation, Periode } from '../types';

type StatutEvaluation = 'brouillon' | 'finalise' | 'valide';

// Critères par défaut pour l'auto-évaluation
const criteresParDefaut: Omit<CritereEvaluation, 'note' | 'commentaire'>[] = [
  { id: '1', nom: 'Atteinte des objectifs', poids: 25 },
  { id: '2', nom: 'Qualité du travail', poids: 20 },
  { id: '3', nom: 'Autonomie et initiative', poids: 15 },
  { id: '4', nom: 'Travail en équipe', poids: 15 },
  { id: '5', nom: 'Communication', poids: 10 },
  { id: '6', nom: 'Respect des délais', poids: 10 },
  { id: '7', nom: 'Développement des compétences', poids: 5 },
];

interface EvaluationsState {
  evaluations: Evaluation[];
  isLoading: boolean;
  error: string | null;

  // Actions CRUD
  loadEvaluations: (centreId?: string) => Promise<void>;
  getEvaluationsByCentre: (centreId: string) => Evaluation[];
  getEvaluationsByPoste: (posteId: string) => Evaluation[];
  getEvaluationsByStatut: (statut: StatutEvaluation) => Evaluation[];
  getEvaluationEnCours: (centreId: string, posteId: string) => Evaluation | undefined;
  addEvaluation: (evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Evaluation>;
  updateEvaluation: (id: string, updates: Partial<Evaluation>) => Promise<void>;
  deleteEvaluation: (id: string) => Promise<void>;

  // Auto-évaluation
  creerAutoEvaluation: (centreId: string, posteId: string, periode: Periode) => Promise<Evaluation>;
  sauvegarderBrouillon: (id: string, updates: Partial<Evaluation>) => Promise<void>;
  finaliserAutoEvaluation: (id: string) => Promise<void>;
  validerEvaluation: (id: string, commentaireManager?: string) => Promise<void>;

  // Gestion des critères
  updateCritere: (evaluationId: string, critereId: string, note: number, commentaire?: string) => Promise<void>;

  // Calculs
  calculerNoteGlobale: (criteres: CritereEvaluation[]) => number;
  getCriteresParDefaut: () => Omit<CritereEvaluation, 'note' | 'commentaire'>[];
}

export const useEvaluationsStore = create<EvaluationsState>((set, get) => ({
  evaluations: [],
  isLoading: false,
  error: null,

  loadEvaluations: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      let evaluations: Evaluation[];
      if (centreId) {
        evaluations = await db.evaluations.where('centreId').equals(centreId).toArray();
      } else {
        evaluations = await db.evaluations.toArray();
      }
      // Trier par date (les plus récentes d'abord)
      evaluations.sort((a, b) => {
        const dateA = a.dateEvaluation || a.createdAt;
        const dateB = b.dateEvaluation || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      set({ evaluations, isLoading: false });
    } catch (error) {
      set({ error: `Erreur de chargement: ${error}`, isLoading: false });
    }
  },

  getEvaluationsByCentre: (centreId) => {
    return get().evaluations.filter((e) => e.centreId === centreId);
  },

  getEvaluationsByPoste: (posteId) => {
    return get().evaluations.filter((e) => e.posteId === posteId);
  },

  getEvaluationsByStatut: (statut) => {
    return get().evaluations.filter((e) => e.statut === statut);
  },

  getEvaluationEnCours: (centreId, posteId) => {
    return get().evaluations.find(
      (e) => e.centreId === centreId && e.posteId === posteId && e.statut !== 'valide'
    );
  },

  addEvaluation: async (evaluationData) => {
    const now = new Date().toISOString();
    const evaluation: Evaluation = {
      ...evaluationData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    await db.evaluations.add(evaluation);
    set((state) => ({
      evaluations: [evaluation, ...state.evaluations],
    }));
    return evaluation;
  },

  updateEvaluation: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.evaluations.update(id, { ...updates, updatedAt });
    set((state) => ({
      evaluations: state.evaluations.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt } : e
      ),
    }));
  },

  deleteEvaluation: async (id) => {
    await db.evaluations.delete(id);
    set((state) => ({
      evaluations: state.evaluations.filter((e) => e.id !== id),
    }));
  },

  creerAutoEvaluation: async (centreId, posteId, periode) => {
    // Initialiser les critères avec les valeurs par défaut (sans notes)
    const criteres: CritereEvaluation[] = criteresParDefaut.map((c) => ({
      ...c,
      id: uuidv4(),
      note: undefined,
      commentaire: undefined,
    }));

    const evaluation = await get().addEvaluation({
      centreId,
      posteId,
      periode,
      criteres,
      noteGlobale: undefined,
      pointsForts: [],
      axesAmelioration: [],
      objectifsProchainePeriode: [],
      commentaireGeneral: undefined,
      statut: 'brouillon',
      dateEvaluation: undefined,
    });

    return evaluation;
  },

  sauvegarderBrouillon: async (id, updates) => {
    await get().updateEvaluation(id, updates);
  },

  finaliserAutoEvaluation: async (id) => {
    const evaluation = get().evaluations.find((e) => e.id === id);
    if (!evaluation) return;

    // Calculer la note globale
    const noteGlobale = get().calculerNoteGlobale(evaluation.criteres);

    await get().updateEvaluation(id, {
      statut: 'finalise',
      noteGlobale,
      dateEvaluation: new Date().toISOString(),
    });
  },

  validerEvaluation: async (id, commentaireManager) => {
    const updates: Partial<Evaluation> = {
      statut: 'valide',
    };
    if (commentaireManager) {
      updates.commentaireGeneral = commentaireManager;
    }
    await get().updateEvaluation(id, updates);
  },

  updateCritere: async (evaluationId, critereId, note, commentaire) => {
    const evaluation = get().evaluations.find((e) => e.id === evaluationId);
    if (!evaluation) return;

    const updatedCriteres = evaluation.criteres.map((c) =>
      c.id === critereId ? { ...c, note, commentaire } : c
    );

    // Recalculer la note globale si tous les critères sont notés
    const tousNotes = updatedCriteres.every((c) => c.note !== undefined);
    const noteGlobale = tousNotes ? get().calculerNoteGlobale(updatedCriteres) : undefined;

    await get().updateEvaluation(evaluationId, {
      criteres: updatedCriteres,
      noteGlobale,
    });
  },

  calculerNoteGlobale: (criteres) => {
    const criteresNotes = criteres.filter((c) => c.note !== undefined);
    if (criteresNotes.length === 0) return 0;

    const totalPoids = criteresNotes.reduce((sum, c) => sum + c.poids, 0);
    const sommeNotes = criteresNotes.reduce((sum, c) => sum + (c.note || 0) * c.poids, 0);

    return Math.round((sommeNotes / totalPoids) * 100) / 100;
  },

  getCriteresParDefaut: () => criteresParDefaut,
}));
