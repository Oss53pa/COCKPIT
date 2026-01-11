import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type {
  ProjetLancement,
  PhaseProjet,
  Jalon,
  VagueRecrutement,
  PosteARecruter,
  ProspectCommercial,
  SuiviBEFA,
  Reserve,
  DocumentDOE,
  RisqueProjet,
  StatistiquesProjet,
} from '../types';
import { differenceInDays } from 'date-fns';

interface ProjetState {
  projets: ProjetLancement[];
  phases: PhaseProjet[];
  jalons: Jalon[];
  vaguesRecrutement: VagueRecrutement[];
  postesARecruter: PosteARecruter[];
  prospects: ProspectCommercial[];
  suiviBEFA: SuiviBEFA[];
  reserves: Reserve[];
  documentsDOE: DocumentDOE[];
  risquesProjet: RisqueProjet[];
  isLoading: boolean;
  error: string | null;

  // Actions Projet
  loadProjet: (centreId: string) => Promise<void>;
  getProjetByCentre: (centreId: string) => ProjetLancement | undefined;
  createProjet: (projet: Omit<ProjetLancement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ProjetLancement>;
  updateProjet: (id: string, updates: Partial<ProjetLancement>) => Promise<void>;

  // Actions Phases
  loadPhases: (projetId: string) => Promise<void>;
  addPhase: (phase: Omit<PhaseProjet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PhaseProjet>;
  updatePhase: (id: string, updates: Partial<PhaseProjet>) => Promise<void>;

  // Actions Jalons
  loadJalons: (projetId: string) => Promise<void>;
  addJalon: (jalon: Omit<Jalon, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Jalon>;
  updateJalon: (id: string, updates: Partial<Jalon>) => Promise<void>;
  deleteJalon: (id: string) => Promise<void>;

  // Actions Recrutement
  loadRecrutement: (projetId: string) => Promise<void>;
  addVague: (vague: Omit<VagueRecrutement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<VagueRecrutement>;
  addPoste: (poste: Omit<PosteARecruter, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PosteARecruter>;
  updatePoste: (id: string, updates: Partial<PosteARecruter>) => Promise<void>;

  // Actions Commercialisation
  loadProspects: (projetId: string) => Promise<void>;
  addProspect: (prospect: Omit<ProspectCommercial, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ProspectCommercial>;
  updateProspect: (id: string, updates: Partial<ProspectCommercial>) => Promise<void>;
  deleteProspect: (id: string) => Promise<void>;

  // Actions BEFA
  loadBEFA: (projetId: string) => Promise<void>;
  addBEFA: (befa: Omit<SuiviBEFA, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SuiviBEFA>;
  updateBEFA: (id: string, updates: Partial<SuiviBEFA>) => Promise<void>;

  // Actions Réserves
  loadReserves: (projetId: string) => Promise<void>;
  addReserve: (reserve: Omit<Reserve, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Reserve>;
  updateReserve: (id: string, updates: Partial<Reserve>) => Promise<void>;

  // Actions DOE
  loadDOE: (projetId: string) => Promise<void>;
  addDocumentDOE: (doc: Omit<DocumentDOE, 'id' | 'createdAt' | 'updatedAt'>) => Promise<DocumentDOE>;
  updateDocumentDOE: (id: string, updates: Partial<DocumentDOE>) => Promise<void>;

  // Actions Risques
  loadRisques: (projetId: string) => Promise<void>;
  addRisque: (risque: Omit<RisqueProjet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RisqueProjet>;
  updateRisque: (id: string, updates: Partial<RisqueProjet>) => Promise<void>;
  deleteRisque: (id: string) => Promise<void>;

  // Statistiques
  getStatistiquesProjet: (projetId: string) => StatistiquesProjet;

  // Initialisation projet par défaut
  initializeDefaultProjet: (centreId: string, nom: string, dateSoftOpening: string, dateInauguration: string) => Promise<ProjetLancement>;
}

export const useProjetStore = create<ProjetState>((set, get) => ({
  projets: [],
  phases: [],
  jalons: [],
  vaguesRecrutement: [],
  postesARecruter: [],
  prospects: [],
  suiviBEFA: [],
  reserves: [],
  documentsDOE: [],
  risquesProjet: [],
  isLoading: false,
  error: null,

  // Projet
  loadProjet: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      const projets = await db.projets.where('centreId').equals(centreId).toArray();
      set({ projets, isLoading: false });

      // Charger les données associées si projet existe
      if (projets.length > 0) {
        const projetId = projets[0].id;
        await get().loadPhases(projetId);
        await get().loadJalons(projetId);
        await get().loadRecrutement(projetId);
        await get().loadProspects(projetId);
        await get().loadBEFA(projetId);
        await get().loadReserves(projetId);
        await get().loadRisques(projetId);
      }
    } catch (error) {
      set({ error: `Erreur de chargement: ${error}`, isLoading: false });
    }
  },

  getProjetByCentre: (centreId) => {
    return get().projets.find((p) => p.centreId === centreId);
  },

  createProjet: async (projetData) => {
    const now = new Date().toISOString();
    const projet: ProjetLancement = {
      ...projetData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.projets.add(projet);
    set((state) => ({ projets: [...state.projets, projet] }));
    return projet;
  },

  updateProjet: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.projets.update(id, { ...updates, updatedAt });
    set((state) => ({
      projets: state.projets.map((p) => (p.id === id ? { ...p, ...updates, updatedAt } : p)),
    }));
  },

  // Phases
  loadPhases: async (projetId) => {
    const phases = await db.phasesProjet.where('projetId').equals(projetId).sortBy('numero');
    set({ phases });
  },

  addPhase: async (phaseData) => {
    const now = new Date().toISOString();
    const phase: PhaseProjet = {
      ...phaseData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.phasesProjet.add(phase);
    set((state) => ({ phases: [...state.phases, phase] }));
    return phase;
  },

  updatePhase: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.phasesProjet.update(id, { ...updates, updatedAt });
    set((state) => ({
      phases: state.phases.map((p) => (p.id === id ? { ...p, ...updates, updatedAt } : p)),
    }));
  },

  // Jalons
  loadJalons: async (projetId) => {
    const jalons = await db.jalons.where('projetId').equals(projetId).sortBy('ordre');
    set({ jalons });
  },

  addJalon: async (jalonData) => {
    const now = new Date().toISOString();
    const jalon: Jalon = {
      ...jalonData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.jalons.add(jalon);
    set((state) => ({ jalons: [...state.jalons, jalon] }));
    return jalon;
  },

  updateJalon: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.jalons.update(id, { ...updates, updatedAt });
    set((state) => ({
      jalons: state.jalons.map((j) => (j.id === id ? { ...j, ...updates, updatedAt } : j)),
    }));
  },

  deleteJalon: async (id) => {
    await db.jalons.delete(id);
    set((state) => ({ jalons: state.jalons.filter((j) => j.id !== id) }));
  },

  // Recrutement
  loadRecrutement: async (projetId) => {
    const vaguesRecrutement = await db.vaguesRecrutement.where('projetId').equals(projetId).sortBy('numero');
    const postesARecruter = await db.postesARecruter.where('projetId').equals(projetId).toArray();
    set({ vaguesRecrutement, postesARecruter });
  },

  addVague: async (vagueData) => {
    const now = new Date().toISOString();
    const vague: VagueRecrutement = {
      ...vagueData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.vaguesRecrutement.add(vague);
    set((state) => ({ vaguesRecrutement: [...state.vaguesRecrutement, vague] }));
    return vague;
  },

  addPoste: async (posteData) => {
    const now = new Date().toISOString();
    const poste: PosteARecruter = {
      ...posteData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.postesARecruter.add(poste);
    set((state) => ({ postesARecruter: [...state.postesARecruter, poste] }));
    return poste;
  },

  updatePoste: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.postesARecruter.update(id, { ...updates, updatedAt });
    set((state) => ({
      postesARecruter: state.postesARecruter.map((p) => (p.id === id ? { ...p, ...updates, updatedAt } : p)),
    }));
  },

  // Prospects
  loadProspects: async (projetId) => {
    const prospects = await db.prospectsCommerciaux.where('projetId').equals(projetId).toArray();
    set({ prospects });
  },

  addProspect: async (prospectData) => {
    const now = new Date().toISOString();
    const prospect: ProspectCommercial = {
      ...prospectData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.prospectsCommerciaux.add(prospect);
    set((state) => ({ prospects: [...state.prospects, prospect] }));
    return prospect;
  },

  updateProspect: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.prospectsCommerciaux.update(id, { ...updates, updatedAt });
    set((state) => ({
      prospects: state.prospects.map((p) => (p.id === id ? { ...p, ...updates, updatedAt } : p)),
    }));
  },

  deleteProspect: async (id) => {
    await db.prospectsCommerciaux.delete(id);
    set((state) => ({ prospects: state.prospects.filter((p) => p.id !== id) }));
  },

  // BEFA
  loadBEFA: async (projetId) => {
    const suiviBEFA = await db.suiviBEFA.where('projetId').equals(projetId).toArray();
    set({ suiviBEFA });
  },

  addBEFA: async (befaData) => {
    const now = new Date().toISOString();
    const befa: SuiviBEFA = {
      ...befaData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.suiviBEFA.add(befa);
    set((state) => ({ suiviBEFA: [...state.suiviBEFA, befa] }));
    return befa;
  },

  updateBEFA: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.suiviBEFA.update(id, { ...updates, updatedAt });
    set((state) => ({
      suiviBEFA: state.suiviBEFA.map((b) => (b.id === id ? { ...b, ...updates, updatedAt } : b)),
    }));
  },

  // Réserves
  loadReserves: async (projetId) => {
    const reserves = await db.reserves.where('projetId').equals(projetId).toArray();
    set({ reserves });
  },

  addReserve: async (reserveData) => {
    const now = new Date().toISOString();
    const reserve: Reserve = {
      ...reserveData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.reserves.add(reserve);
    set((state) => ({ reserves: [...state.reserves, reserve] }));
    return reserve;
  },

  updateReserve: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.reserves.update(id, { ...updates, updatedAt });
    set((state) => ({
      reserves: state.reserves.map((r) => (r.id === id ? { ...r, ...updates, updatedAt } : r)),
    }));
  },

  // DOE
  loadDOE: async (projetId) => {
    const documentsDOE = await db.documentsDOE.where('projetId').equals(projetId).toArray();
    set({ documentsDOE });
  },

  addDocumentDOE: async (docData) => {
    const now = new Date().toISOString();
    const doc: DocumentDOE = {
      ...docData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.documentsDOE.add(doc);
    set((state) => ({ documentsDOE: [...state.documentsDOE, doc] }));
    return doc;
  },

  updateDocumentDOE: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.documentsDOE.update(id, { ...updates, updatedAt });
    set((state) => ({
      documentsDOE: state.documentsDOE.map((d) => (d.id === id ? { ...d, ...updates, updatedAt } : d)),
    }));
  },

  // Risques
  loadRisques: async (projetId) => {
    const risquesProjet = await db.risquesProjet.where('projetId').equals(projetId).toArray();
    set({ risquesProjet });
  },

  addRisque: async (risqueData) => {
    const now = new Date().toISOString();
    const risque: RisqueProjet = {
      ...risqueData,
      id: uuidv4(),
      criticite: risqueData.probabilite * risqueData.impact,
      createdAt: now,
      updatedAt: now,
    };
    await db.risquesProjet.add(risque);
    set((state) => ({ risquesProjet: [...state.risquesProjet, risque] }));
    return risque;
  },

  updateRisque: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    const finalUpdates = { ...updates, updatedAt };
    if (updates.probabilite !== undefined || updates.impact !== undefined) {
      const existing = get().risquesProjet.find((r) => r.id === id);
      if (existing) {
        const prob = updates.probabilite ?? existing.probabilite;
        const imp = updates.impact ?? existing.impact;
        (finalUpdates as any).criticite = prob * imp;
      }
    }
    await db.risquesProjet.update(id, finalUpdates);
    set((state) => ({
      risquesProjet: state.risquesProjet.map((r) => (r.id === id ? { ...r, ...finalUpdates } : r)),
    }));
  },

  deleteRisque: async (id) => {
    await db.risquesProjet.delete(id);
    set((state) => ({ risquesProjet: state.risquesProjet.filter((r) => r.id !== id) }));
  },

  // Statistiques
  getStatistiquesProjet: (projetId) => {
    const projet = get().projets.find((p) => p.id === projetId);
    const jalons = get().jalons.filter((j) => j.projetId === projetId);
    const postes = get().postesARecruter.filter((p) => p.projetId === projetId);
    const prospects = get().prospects.filter((p) => p.projetId === projetId);
    const reserves = get().reserves.filter((r) => r.projetId === projetId);
    const befa = get().suiviBEFA.filter((b) => b.projetId === projetId);
    const phases = get().phases.filter((p) => p.projetId === projetId);

    const now = new Date();
    const softOpening = projet ? new Date(projet.dateSoftOpening) : now;
    const inauguration = projet ? new Date(projet.dateInauguration) : now;

    const jalonsAtteints = jalons.filter((j) => j.statut === 'atteint').length;
    const postesRecrutes = postes.filter((p) => p.statut === 'integre').length;
    const prospectsSigns = prospects.filter((p) => p.statut === 'bail_signe');
    const glaSigne = prospectsSigns.reduce((sum, p) => sum + p.surface, 0);
    const glaTotal = projet ? 10000 : 0; // À récupérer du centre

    const budgetConsomme = phases.reduce((sum, p) => sum + p.budgetConsomme, 0);
    const budgetTotal = projet?.budgetTotal || 0;

    return {
      joursAvantSoftOpening: differenceInDays(softOpening, now),
      joursAvantInauguration: differenceInDays(inauguration, now),
      jalonsAtteints,
      jalonsTotal: jalons.length,
      postesRecrutes,
      postesTotal: postes.length,
      occupationPourcent: glaTotal > 0 ? Math.round((glaSigne / glaTotal) * 100) : 0,
      glaSigne,
      glaTotal,
      budgetConsomme,
      budgetTotal,
      ecartBudget: budgetTotal > 0 ? Math.round(((budgetConsomme - budgetTotal) / budgetTotal) * 100 * 10) / 10 : 0,
      reservesBloquantes: reserves.filter((r) => r.classification === 'bloquante' && r.statut !== 'levee').length,
      reservesTotales: reserves.filter((r) => r.statut !== 'levee').length,
      befaComplets: befa.filter((b) => b.statut === 'complet').length,
      befaTotal: befa.length,
    };
  },

  // Initialisation avec jalons par défaut
  initializeDefaultProjet: async (centreId, nom, dateSoftOpening, dateInauguration) => {
    const now = new Date().toISOString();

    // Créer le projet
    const projet = await get().createProjet({
      centreId,
      nom,
      statut: 'preparation',
      dateDebut: now,
      dateSoftOpening,
      dateInauguration,
      dateFinStabilisation: dateInauguration, // À ajuster
      budgetTotal: 720500000,
      provisions: 65500000,
      phaseActuelle: 'preparation',
      seuilAlerteJalon: 7,
      seuilAlerteBudget: 5,
    });

    // Créer les phases par défaut
    const phasesData = [
      { numero: 1, nom: 'Préparation', budget: 85000000 },
      { numero: 2, nom: 'Mobilisation', budget: 420000000 },
      { numero: 3, nom: 'Lancement', budget: 150000000 },
    ];

    for (const phase of phasesData) {
      await get().addPhase({
        projetId: projet.id,
        numero: phase.numero,
        nom: phase.nom,
        dateDebut: now,
        dateFin: dateSoftOpening,
        budget: phase.budget,
        budgetEngage: 0,
        budgetConsomme: 0,
        statut: phase.numero === 1 ? 'en_cours' : 'a_venir',
        avancement: 0,
      });
    }

    // Créer les jalons par défaut
    const jalonsData = [
      { code: 'J1', titre: 'Center Manager recruté', importance: 'critique' as const },
      { code: 'J2', titre: 'Équipe managériale complète', importance: 'critique' as const },
      { code: 'J3', titre: '50% baux signés', importance: 'majeur' as const },
      { code: 'J4', titre: '85% baux signés', importance: 'critique' as const },
      { code: 'J5', titre: 'Handover technique', importance: 'critique' as const },
      { code: 'J6', titre: 'Commission sécurité', importance: 'critique' as const },
      { code: 'J7', titre: 'Soft Opening', importance: 'critique' as const },
      { code: 'J8', titre: 'Inauguration', importance: 'critique' as const },
    ];

    for (let i = 0; i < jalonsData.length; i++) {
      await get().addJalon({
        projetId: projet.id,
        code: jalonsData[i].code,
        titre: jalonsData[i].titre,
        description: '',
        dateCible: i < 7 ? dateSoftOpening : dateInauguration,
        importance: jalonsData[i].importance,
        statut: 'a_venir',
        dependances: i > 0 ? [jalonsData[i - 1].code] : [],
        critereValidation: '',
        ordre: i + 1,
      });
    }

    // Créer les vagues de recrutement par défaut
    const vaguesData = [
      { numero: 1, nom: 'Management', priorite: 'critique' as const },
      { numero: 2, nom: 'Superviseurs', priorite: 'haute' as const },
      { numero: 3, nom: 'Équipe opérationnelle', priorite: 'moyenne' as const },
      { numero: 4, nom: 'Renfort ouverture', priorite: 'basse' as const },
    ];

    for (const vague of vaguesData) {
      await get().addVague({
        projetId: projet.id,
        numero: vague.numero,
        nom: vague.nom,
        deadline: dateSoftOpening,
        priorite: vague.priorite,
      });
    }

    return projet;
  },
}));
