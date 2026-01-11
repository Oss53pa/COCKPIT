import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type {
  ResultatKPI,
  TypeKPICalcule,
  Insight,
  TypeInsight,
  SeveriteInsight,
  RegleAlerte,
  AlerteGeneree,
  TendancePrediction,
  BenchmarkComparaison,
  ConfigurationBI,
  EtatLocatif,
  DonneesLoyer,
  DonneesChiffreAffaires,
  DonneesCharges,
  DonneesBail,
  DonneesFrequentation,
  DonneesValorisation,
} from '../types/bi';
import {
  calculerKPI,
  creerResultatKPI,
  calculerTousKPIs,
  type DonneesCalculKPI,
} from '../utils/kpiCalculations';

// ===========================================
// TYPES STATE
// ===========================================

interface PeriodeAnalyse {
  debut: string;
  fin: string;
  label: string;
}

interface AnalyseState {
  // Résultats KPIs
  resultatsKPI: ResultatKPI[];
  resultatsKPIParCentre: Record<string, ResultatKPI[]>;
  // Alias pour AnalysePage
  kpisCalcules: ResultatKPI[];

  // Insights
  insights: Insight[];
  insightsNonTraites: Insight[];

  // Alertes
  reglesAlerte: RegleAlerte[];
  alertesGenerees: AlerteGeneree[];
  alertesNonLues: AlerteGeneree[];
  // Alias pour AnalysePage
  alertes: AlerteGeneree[];

  // Prédictions
  predictions: TendancePrediction[];

  // Benchmarks
  benchmarks: BenchmarkComparaison[];

  // Configuration
  configurationBI: ConfigurationBI | null;

  // State
  isLoading: boolean;
  isCalculating: boolean;
  error: string | null;
  dernierCalcul: string | null;

  // Période sélectionnée
  periodeSelectionnee: PeriodeAnalyse;
  // Alias pour AnalysePage
  periodeAnalyse: PeriodeAnalyse;
  setPeriodeAnalyse: (periode: PeriodeAnalyse) => void;

  // Actions - Chargement
  loadResultatsKPI: (centreId: string) => Promise<void>;
  loadInsights: (centreId: string) => Promise<void>;
  loadReglesAlerte: (centreId?: string) => Promise<void>;
  loadAlertesGenerees: (centreId: string) => Promise<void>;
  loadPredictions: (centreId: string) => Promise<void>;
  loadConfigurationBI: (centreId: string) => Promise<void>;
  loadAll: (centreId: string) => Promise<void>;

  // Actions - Calcul KPIs
  calculerKPIsPourCentre: (centreId: string, periode: PeriodeAnalyse) => Promise<ResultatKPI[]>;
  calculerKPIUnique: (centreId: string, typeKPI: TypeKPICalcule, periode: PeriodeAnalyse) => Promise<ResultatKPI | null>;
  sauvegarderResultatsKPI: (resultats: ResultatKPI[]) => Promise<void>;

  // Actions - Insights
  detecterInsights: (centreId: string) => Promise<Insight[]>;
  ajouterInsight: (insight: Omit<Insight, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Insight>;
  traiterInsight: (id: string, commentaire?: string) => Promise<void>;
  supprimerInsight: (id: string) => Promise<void>;

  // Actions - Alertes
  ajouterRegleAlerte: (regle: Omit<RegleAlerte, 'id' | 'createdAt' | 'updatedAt' | 'nombreDeclenchements'>) => Promise<RegleAlerte>;
  modifierRegleAlerte: (id: string, updates: Partial<RegleAlerte>) => Promise<void>;
  supprimerRegleAlerte: (id: string) => Promise<void>;
  toggleRegleAlerte: (id: string) => Promise<void>;
  verifierAlertes: (centreId: string) => Promise<AlerteGeneree[]>;
  marquerAlerteLue: (id: string) => Promise<void>;
  traiterAlerte: (id: string) => Promise<void>;

  // Actions - Prédictions
  genererPredictions: (centreId: string, kpi: TypeKPICalcule, horizon: number) => Promise<TendancePrediction | null>;
  sauvegarderPrediction: (prediction: TendancePrediction) => Promise<void>;

  // Actions - Configuration
  sauvegarderConfigurationBI: (config: Omit<ConfigurationBI, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;

  // Actions - Période
  setPeriode: (periode: PeriodeAnalyse) => void;

  // Helpers
  getKPIParType: (centreId: string, type: TypeKPICalcule) => ResultatKPI | undefined;
  getInsightsParSeverite: (severite: SeveriteInsight) => Insight[];
  getAlertesParPriorite: (priorite: string) => AlerteGeneree[];
}

// ===========================================
// CONFIGURATION PAR DEFAUT
// ===========================================

const defaultConfigurationBI: Omit<ConfigurationBI, 'id' | 'centreId' | 'createdAt' | 'updatedAt'> = {
  seuilsKPI: {
    vacance: { vert: 5, orange: 10, rouge: 15 },
    effort: { vert: 8, orange: 12, rouge: 15 },
    wault: { vert: 4, orange: 2.5, rouge: 1.5 },
    recouvrement: { vert: 98, orange: 95, rouge: 90 },
    noi: { vert: 0, orange: -5, rouge: -10 },
  },
  importConfig: {
    tailleFichierMax: 10,
    formatsAutorises: ['excel', 'csv', 'json'],
    detecterDoublons: true,
    versionnerFichiers: true,
  },
  rapportConfig: {
    exportFormatParDefaut: 'pdf',
    inclureLogo: true,
  },
  analyseConfig: {
    frequenceCalculKPI: 'quotidien',
    historiqueKPIMois: 24,
    predictionHorizonMois: 12,
  },
};

// ===========================================
// HELPERS - Chargement données
// ===========================================

async function chargerDonneesCalcul(centreId: string, periode: PeriodeAnalyse): Promise<DonneesCalculKPI> {
  const [
    etatsLocatifs,
    loyers,
    chiffresAffaires,
    charges,
    baux,
    frequentation,
    valorisations,
    centre,
  ] = await Promise.all([
    db.etatsLocatifs.where('centreId').equals(centreId).toArray(),
    db.donneesLoyers.where('centreId').equals(centreId).toArray(),
    db.donneesChiffreAffaires.where('centreId').equals(centreId).toArray(),
    db.donneesCharges.where('centreId').equals(centreId).toArray(),
    db.donneesBaux.where('centreId').equals(centreId).toArray(),
    db.donneesFrequentation.where('centreId').equals(centreId).toArray(),
    db.donneesValorisation.where('centreId').equals(centreId).toArray(),
    db.centres.get(centreId),
  ]);

  const derniereValo = valorisations.sort((a, b) =>
    new Date(b.dateValorisation).getTime() - new Date(a.dateValorisation).getTime()
  )[0];

  return {
    centreId,
    periodeDebut: periode.debut,
    periodeFin: periode.fin,
    etatsLocatifs,
    loyers,
    chiffresAffaires,
    charges,
    baux,
    frequentation,
    valorisation: derniereValo,
    surfaceTotale: centre?.surfaceLocative || 0,
    valeurActif: derniereValo?.valeurVenale || 0,
  };
}

// ===========================================
// STORE
// ===========================================

const defaultPeriode: PeriodeAnalyse = {
  debut: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
  fin: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0],
  label: 'Mois précédent',
};

export const useAnalyseStore = create<AnalyseState>((set, get) => ({
  // Initial state
  resultatsKPI: [],
  resultatsKPIParCentre: {},
  kpisCalcules: [], // Alias
  insights: [],
  insightsNonTraites: [],
  reglesAlerte: [],
  alertesGenerees: [],
  alertesNonLues: [],
  alertes: [], // Alias
  predictions: [],
  benchmarks: [],
  configurationBI: null,
  isLoading: false,
  isCalculating: false,
  error: null,
  dernierCalcul: null,
  periodeSelectionnee: defaultPeriode,
  periodeAnalyse: defaultPeriode, // Alias

  // ===========================================
  // CHARGEMENT
  // ===========================================

  loadResultatsKPI: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      const resultats = await db.resultatsKPI
        .where('centreId')
        .equals(centreId)
        .reverse()
        .sortBy('dateCalcul');

      set((state) => ({
        resultatsKPI: resultats,
        kpisCalcules: resultats, // Alias sync
        resultatsKPIParCentre: {
          ...state.resultatsKPIParCentre,
          [centreId]: resultats,
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: `Erreur chargement KPIs: ${error}`, isLoading: false });
    }
  },

  loadInsights: async (centreId) => {
    try {
      const insights = await db.insights
        .where('centreId')
        .equals(centreId)
        .reverse()
        .sortBy('dateDetection');

      set({
        insights,
        insightsNonTraites: insights.filter(i => !i.traitee),
      });
    } catch (error) {
      console.error('Erreur chargement insights:', error);
    }
  },

  loadReglesAlerte: async (centreId) => {
    try {
      let regles: RegleAlerte[];
      if (centreId) {
        regles = await db.reglesAlerte
          .where('centreId')
          .equals(centreId)
          .or('centreId')
          .equals('')
          .toArray();
      } else {
        regles = await db.reglesAlerte.toArray();
      }
      set({ reglesAlerte: regles });
    } catch (error) {
      console.error('Erreur chargement règles alerte:', error);
    }
  },

  loadAlertesGenerees: async (centreId) => {
    try {
      const alertesData = await db.alertesGenerees
        .where('centreId')
        .equals(centreId)
        .reverse()
        .sortBy('dateGeneration');

      set({
        alertesGenerees: alertesData,
        alertes: alertesData, // Alias sync
        alertesNonLues: alertesData.filter(a => !a.lue),
      });
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    }
  },

  loadPredictions: async (centreId) => {
    try {
      const predictions = await db.tendancesPrediction
        .where('centreId')
        .equals(centreId)
        .toArray();

      set({ predictions });
    } catch (error) {
      console.error('Erreur chargement prédictions:', error);
    }
  },

  loadConfigurationBI: async (centreId) => {
    try {
      const config = await db.configurationsBI
        .where('centreId')
        .equals(centreId)
        .first();

      set({ configurationBI: config || null });
    } catch (error) {
      console.error('Erreur chargement configuration BI:', error);
    }
  },

  loadAll: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().loadResultatsKPI(centreId),
        get().loadInsights(centreId),
        get().loadReglesAlerte(centreId),
        get().loadAlertesGenerees(centreId),
        get().loadPredictions(centreId),
        get().loadConfigurationBI(centreId),
      ]);
      set({ isLoading: false });
    } catch (error) {
      set({ error: `Erreur chargement: ${error}`, isLoading: false });
    }
  },

  // ===========================================
  // CALCUL KPIs
  // ===========================================

  calculerKPIsPourCentre: async (centreId, periode) => {
    const periodeToUse = periode || get().periodeSelectionnee;
    set({ isCalculating: true, error: null });
    try {
      const donnees = await chargerDonneesCalcul(centreId, periodeToUse);
      const resultats = calculerTousKPIs(donnees);

      // Sauvegarder en base
      await get().sauvegarderResultatsKPI(resultats);

      set((state) => ({
        resultatsKPI: resultats,
        kpisCalcules: resultats, // Alias sync
        resultatsKPIParCentre: {
          ...state.resultatsKPIParCentre,
          [centreId]: resultats,
        },
        isCalculating: false,
        dernierCalcul: new Date().toISOString(),
      }));

      return resultats;
    } catch (error) {
      set({ error: `Erreur calcul KPIs: ${error}`, isCalculating: false });
      return [];
    }
  },

  calculerKPIUnique: async (centreId, typeKPI, periode) => {
    try {
      const donnees = await chargerDonneesCalcul(centreId, periode);
      const resultat = creerResultatKPI(typeKPI, donnees);

      await db.resultatsKPI.add(resultat);

      set((state) => ({
        resultatsKPI: [...state.resultatsKPI, resultat],
      }));

      return resultat;
    } catch (error) {
      console.error('Erreur calcul KPI unique:', error);
      return null;
    }
  },

  sauvegarderResultatsKPI: async (resultats) => {
    try {
      await db.resultatsKPI.bulkPut(resultats);
    } catch (error) {
      console.error('Erreur sauvegarde KPIs:', error);
    }
  },

  // ===========================================
  // INSIGHTS
  // ===========================================

  detecterInsights: async (centreId) => {
    const resultats = get().resultatsKPIParCentre[centreId] || [];
    const config = get().configurationBI;
    const insightsDetectes: Insight[] = [];
    const now = new Date().toISOString();

    // Détection concentration risque (Top 5 > 50%)
    const kpiConcentration = resultats.find(r => r.typeKPI === 'CONCENTRATION_TOP5');
    if (kpiConcentration && kpiConcentration.valeur > 50) {
      insightsDetectes.push({
        id: uuidv4(),
        centreId,
        type: 'concentration_risque',
        severite: kpiConcentration.valeur > 60 ? 'critique' : 'alerte',
        titre: 'Concentration locataire élevée',
        description: `Les 5 premiers locataires représentent ${kpiConcentration.valeurFormatee} des revenus`,
        valeurActuelle: kpiConcentration.valeur,
        seuilReference: 50,
        ecartPourcentage: kpiConcentration.valeur - 50,
        entitesImpactees: [],
        impact: kpiConcentration.valeur > 60 ? 'critique' : 'eleve',
        recommandations: [
          'Diversifier le mix locatif',
          'Identifier des enseignes alternatives',
          'Négocier des durées de bail plus longues avec les top locataires',
        ],
        dateDetection: now,
        traitee: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Détection vacance anormale (> 10%)
    const kpiVacance = resultats.find(r => r.typeKPI === 'TAUX_VACANCE');
    if (kpiVacance && kpiVacance.valeur > 10) {
      insightsDetectes.push({
        id: uuidv4(),
        centreId,
        type: 'vacance_anormale',
        severite: kpiVacance.valeur > 15 ? 'critique' : 'alerte',
        titre: 'Taux de vacance élevé',
        description: `Le taux de vacance est de ${kpiVacance.valeurFormatee}`,
        valeurActuelle: kpiVacance.valeur,
        seuilReference: 10,
        ecartPourcentage: kpiVacance.valeur - 10,
        entitesImpactees: [],
        impact: kpiVacance.valeur > 15 ? 'critique' : 'eleve',
        recommandations: [
          'Accélérer la commercialisation des lots vacants',
          'Revoir la politique tarifaire',
          'Analyser les causes de départ des locataires',
        ],
        dateDetection: now,
        traitee: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Détection WAULT faible (< 2 ans)
    const kpiWault = resultats.find(r => r.typeKPI === 'WAULT');
    if (kpiWault && kpiWault.valeur < 2) {
      insightsDetectes.push({
        id: uuidv4(),
        centreId,
        type: 'echeances_groupees',
        severite: kpiWault.valeur < 1.5 ? 'critique' : 'attention',
        titre: 'WAULT faible - Échéances proches',
        description: `La durée moyenne des baux est de ${kpiWault.valeurFormatee}`,
        valeurActuelle: kpiWault.valeur,
        seuilReference: 2,
        entitesImpactees: [],
        impact: kpiWault.valeur < 1.5 ? 'critique' : 'moyen',
        recommandations: [
          'Identifier les baux arrivant à échéance',
          'Anticiper les renouvellements',
          'Négocier des extensions de durée',
        ],
        dateDetection: now,
        traitee: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Détection taux effort excessif (> 12%)
    const kpiEffort = resultats.find(r => r.typeKPI === 'TAUX_EFFORT_MOYEN');
    if (kpiEffort && kpiEffort.valeur > 12) {
      insightsDetectes.push({
        id: uuidv4(),
        centreId,
        type: 'effort_excessif',
        severite: kpiEffort.valeur > 15 ? 'critique' : 'attention',
        titre: 'Taux d\'effort moyen élevé',
        description: `Le taux d'effort moyen est de ${kpiEffort.valeurFormatee}`,
        valeurActuelle: kpiEffort.valeur,
        seuilReference: 12,
        ecartPourcentage: kpiEffort.valeur - 12,
        entitesImpactees: [],
        impact: kpiEffort.valeur > 15 ? 'eleve' : 'moyen',
        recommandations: [
          'Identifier les locataires en difficulté',
          'Envisager des aménagements de loyer',
          'Surveiller les risques d\'impayés',
        ],
        dateDetection: now,
        traitee: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Détection taux recouvrement faible (< 95%)
    const kpiRecouvrement = resultats.find(r => r.typeKPI === 'TAUX_RECOUVREMENT');
    if (kpiRecouvrement && kpiRecouvrement.valeur < 95) {
      insightsDetectes.push({
        id: uuidv4(),
        centreId,
        type: 'impaye_critique',
        severite: kpiRecouvrement.valeur < 90 ? 'critique' : 'alerte',
        titre: 'Taux de recouvrement dégradé',
        description: `Le taux de recouvrement est de ${kpiRecouvrement.valeurFormatee}`,
        valeurActuelle: kpiRecouvrement.valeur,
        seuilReference: 95,
        ecartPourcentage: 95 - kpiRecouvrement.valeur,
        entitesImpactees: [],
        impact: kpiRecouvrement.valeur < 90 ? 'critique' : 'eleve',
        recommandations: [
          'Relancer les impayés',
          'Mettre en place un plan de recouvrement',
          'Évaluer les provisions pour créances douteuses',
        ],
        dateDetection: now,
        traitee: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Sauvegarder les insights
    if (insightsDetectes.length > 0) {
      await db.insights.bulkAdd(insightsDetectes);
      set((state) => ({
        insights: [...insightsDetectes, ...state.insights],
        insightsNonTraites: [...insightsDetectes, ...state.insightsNonTraites],
      }));
    }

    return insightsDetectes;
  },

  ajouterInsight: async (insightData) => {
    const now = new Date().toISOString();
    const insight: Insight = {
      ...insightData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    await db.insights.add(insight);

    set((state) => ({
      insights: [insight, ...state.insights],
      insightsNonTraites: insight.traitee
        ? state.insightsNonTraites
        : [insight, ...state.insightsNonTraites],
    }));

    return insight;
  },

  traiterInsight: async (id, commentaire) => {
    const now = new Date().toISOString();
    await db.insights.update(id, {
      traitee: true,
      dateTraitement: now,
      commentaireTraitement: commentaire,
      updatedAt: now,
    });

    set((state) => ({
      insights: state.insights.map(i =>
        i.id === id ? { ...i, traitee: true, dateTraitement: now, commentaireTraitement: commentaire } : i
      ),
      insightsNonTraites: state.insightsNonTraites.filter(i => i.id !== id),
    }));
  },

  supprimerInsight: async (id) => {
    await db.insights.delete(id);
    set((state) => ({
      insights: state.insights.filter(i => i.id !== id),
      insightsNonTraites: state.insightsNonTraites.filter(i => i.id !== id),
    }));
  },

  // ===========================================
  // ALERTES
  // ===========================================

  ajouterRegleAlerte: async (regleData) => {
    const now = new Date().toISOString();
    const regle: RegleAlerte = {
      ...regleData,
      id: uuidv4(),
      nombreDeclenchements: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.reglesAlerte.add(regle);

    set((state) => ({
      reglesAlerte: [...state.reglesAlerte, regle],
    }));

    return regle;
  },

  modifierRegleAlerte: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.reglesAlerte.update(id, { ...updates, updatedAt });

    set((state) => ({
      reglesAlerte: state.reglesAlerte.map(r =>
        r.id === id ? { ...r, ...updates, updatedAt } : r
      ),
    }));
  },

  supprimerRegleAlerte: async (id) => {
    await db.reglesAlerte.delete(id);
    set((state) => ({
      reglesAlerte: state.reglesAlerte.filter(r => r.id !== id),
    }));
  },

  toggleRegleAlerte: async (id) => {
    const regle = get().reglesAlerte.find(r => r.id === id);
    if (regle) {
      await get().modifierRegleAlerte(id, { actif: !regle.actif });
    }
  },

  verifierAlertes: async (centreId) => {
    const reglesActives = get().reglesAlerte.filter(r => r.actif);
    const resultats = get().resultatsKPIParCentre[centreId] || [];
    const alertesGenerees: AlerteGeneree[] = [];
    const now = new Date().toISOString();

    for (const regle of reglesActives) {
      // Trouver le KPI correspondant
      const kpi = resultats.find(r => r.typeKPI === regle.condition.kpi);
      if (!kpi) continue;

      let declenchee = false;

      switch (regle.condition.operateur) {
        case '>':
          declenchee = kpi.valeur > regle.condition.seuil;
          break;
        case '<':
          declenchee = kpi.valeur < regle.condition.seuil;
          break;
        case '>=':
          declenchee = kpi.valeur >= regle.condition.seuil;
          break;
        case '<=':
          declenchee = kpi.valeur <= regle.condition.seuil;
          break;
        case '==':
          declenchee = kpi.valeur === regle.condition.seuil;
          break;
        case '!=':
          declenchee = kpi.valeur !== regle.condition.seuil;
          break;
        case 'entre':
          declenchee = kpi.valeur >= regle.condition.seuil &&
            kpi.valeur <= (regle.condition.seuilMax || regle.condition.seuil);
          break;
      }

      if (declenchee) {
        const alerte: AlerteGeneree = {
          id: uuidv4(),
          centreId,
          regleId: regle.id,
          titre: regle.nom,
          message: `${regle.description}. Valeur actuelle: ${kpi.valeurFormatee}, Seuil: ${regle.condition.seuil}`,
          kpiConcerne: regle.condition.kpi,
          valeurActuelle: kpi.valeur,
          seuilDeclenche: regle.condition.seuil,
          priorite: regle.priorite,
          lue: false,
          traitee: false,
          dateGeneration: now,
          createdAt: now,
        };

        alertesGenerees.push(alerte);

        // Mettre à jour le compteur de déclenchements
        await db.reglesAlerte.update(regle.id, {
          nombreDeclenchements: regle.nombreDeclenchements + 1,
          derniereVerification: now,
        });
      }
    }

    // Sauvegarder les alertes générées
    if (alertesGenerees.length > 0) {
      await db.alertesGenerees.bulkAdd(alertesGenerees);
      set((state) => ({
        alertesGenerees: [...alertesGenerees, ...state.alertesGenerees],
        alertesNonLues: [...alertesGenerees, ...state.alertesNonLues],
      }));
    }

    return alertesGenerees;
  },

  marquerAlerteLue: async (id) => {
    await db.alertesGenerees.update(id, { lue: true });
    set((state) => ({
      alertesGenerees: state.alertesGenerees.map(a =>
        a.id === id ? { ...a, lue: true } : a
      ),
      alertesNonLues: state.alertesNonLues.filter(a => a.id !== id),
    }));
  },

  traiterAlerte: async (id) => {
    const now = new Date().toISOString();
    await db.alertesGenerees.update(id, { traitee: true, dateTraitement: now });
    set((state) => ({
      alertesGenerees: state.alertesGenerees.map(a =>
        a.id === id ? { ...a, traitee: true, dateTraitement: now } : a
      ),
    }));
  },

  // ===========================================
  // PREDICTIONS
  // ===========================================

  genererPredictions: async (centreId, kpi, horizon) => {
    try {
      // Charger l'historique des KPIs
      const historique = await db.resultatsKPI
        .where('centreId')
        .equals(centreId)
        .and(r => r.typeKPI === kpi)
        .sortBy('periodeDebut');

      if (historique.length < 3) {
        console.warn('Pas assez de données historiques pour la prédiction');
        return null;
      }

      // Calculer la tendance linéaire simple
      const valeurs = historique.map(h => h.valeur);
      const n = valeurs.length;
      const sumX = (n * (n - 1)) / 2;
      const sumY = valeurs.reduce((a, b) => a + b, 0);
      const sumXY = valeurs.reduce((sum, val, i) => sum + i * val, 0);
      const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

      const pente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const ordonnee = (sumY - pente * sumX) / n;

      // Générer les prédictions
      const predictions: { periode: string; valeur: number; confianceBasse: number; confianceHaute: number }[] = [];
      const ecartType = Math.sqrt(
        valeurs.reduce((sum, val, i) => sum + Math.pow(val - (ordonnee + pente * i), 2), 0) / n
      );

      for (let i = 1; i <= horizon; i++) {
        const moisFutur = new Date();
        moisFutur.setMonth(moisFutur.getMonth() + i);

        const valeurPredite = ordonnee + pente * (n + i - 1);
        const marge = ecartType * 1.96 * Math.sqrt(1 + 1 / n + Math.pow(i, 2) / sumX2);

        predictions.push({
          periode: moisFutur.toISOString().slice(0, 7),
          valeur: valeurPredite,
          confianceBasse: valeurPredite - marge,
          confianceHaute: valeurPredite + marge,
        });
      }

      const valeurActuelle = valeurs[valeurs.length - 1];
      const valeurPredite = predictions[predictions.length - 1].valeur;
      const variationPredite = valeurPredite - valeurActuelle;
      const variationPourcentage = valeurActuelle !== 0
        ? (variationPredite / valeurActuelle) * 100
        : 0;

      const tendance: 'hausse' | 'baisse' | 'stable' =
        variationPourcentage > 2 ? 'hausse' :
        variationPourcentage < -2 ? 'baisse' : 'stable';

      const prediction: TendancePrediction = {
        id: uuidv4(),
        centreId,
        kpi,
        valeurActuelle,
        valeurPredite,
        horizon,
        confiance: Math.max(0, Math.min(100, 100 - (ecartType / valeurActuelle) * 100)),
        tendance,
        variationPredite,
        variationPourcentage,
        donneesHistoriques: historique.map(h => ({
          periode: h.periodeDebut,
          valeur: h.valeur,
        })),
        predictions,
        methodologie: 'lineaire',
        dateCalcul: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await get().sauvegarderPrediction(prediction);

      return prediction;
    } catch (error) {
      console.error('Erreur génération prédiction:', error);
      return null;
    }
  },

  sauvegarderPrediction: async (prediction) => {
    await db.tendancesPrediction.put(prediction);
    set((state) => ({
      predictions: [
        prediction,
        ...state.predictions.filter(p => !(p.centreId === prediction.centreId && p.kpi === prediction.kpi)),
      ],
    }));
  },

  // ===========================================
  // CONFIGURATION
  // ===========================================

  sauvegarderConfigurationBI: async (configData) => {
    const now = new Date().toISOString();
    const existing = get().configurationBI;

    const config: ConfigurationBI = {
      ...configData,
      id: existing?.id || uuidv4(),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await db.configurationsBI.put(config);
    set({ configurationBI: config });
  },

  // ===========================================
  // PERIODE
  // ===========================================

  setPeriode: (periode) => {
    set({ periodeSelectionnee: periode, periodeAnalyse: periode });
  },

  setPeriodeAnalyse: (periode) => {
    set({ periodeSelectionnee: periode, periodeAnalyse: periode });
  },

  // ===========================================
  // HELPERS
  // ===========================================

  getKPIParType: (centreId, type) => {
    const resultats = get().resultatsKPIParCentre[centreId] || [];
    return resultats.find(r => r.typeKPI === type);
  },

  getInsightsParSeverite: (severite) => {
    return get().insights.filter(i => i.severite === severite);
  },

  getAlertesParPriorite: (priorite) => {
    return get().alertesGenerees.filter(a => a.priorite === priorite);
  },
}));

// ===========================================
// SELECTORS
// ===========================================

export const selectResultatsKPI = (state: AnalyseState) => state.resultatsKPI;
export const selectInsights = (state: AnalyseState) => state.insights;
export const selectInsightsNonTraites = (state: AnalyseState) => state.insightsNonTraites;
export const selectAlertesNonLues = (state: AnalyseState) => state.alertesNonLues;
export const selectPredictions = (state: AnalyseState) => state.predictions;
export const selectIsCalculating = (state: AnalyseState) => state.isCalculating;
