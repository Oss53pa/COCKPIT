// ============================================
// ALERT ENGINE - Moteur d'Alertes
// ============================================

import { v4 as uuidv4 } from 'uuid';
import type {
  RegleAlerte,
  AlerteGeneree,
  ResultatKPI,
  TypeKPICalcule,
  TypeRegleAlerte,
  OperateurComparaison,
} from '../types/bi';

// ===========================================
// TYPES
// ===========================================

export interface VerificationResult {
  regle: RegleAlerte;
  declenchee: boolean;
  kpiValeur?: number;
  kpiFormatee?: string;
  message?: string;
}

// ===========================================
// REGLES PREDEFINIES
// ===========================================

export function creerRegleAlertePredefinie(
  type: TypeRegleAlerte,
  centreId?: string
): Omit<RegleAlerte, 'id' | 'createdAt' | 'updatedAt' | 'nombreDeclenchements'> {
  const now = new Date().toISOString();

  const reglesPredefines: Record<TypeRegleAlerte, Omit<RegleAlerte, 'id' | 'createdAt' | 'updatedAt' | 'nombreDeclenchements'>> = {
    vacance_elevee: {
      centreId,
      type: 'vacance_elevee',
      nom: 'Vacance élevée',
      description: 'Alerte lorsque le taux de vacance dépasse le seuil',
      condition: {
        kpi: 'TAUX_VACANCE',
        operateur: '>',
        seuil: 10,
      },
      priorite: 'haute',
      actif: true,
      notificationEmail: false,
      frequenceVerification: 'quotidien',
    },
    effort_excessif: {
      centreId,
      type: 'effort_excessif',
      nom: 'Taux d\'effort excessif',
      description: 'Alerte lorsque le taux d\'effort moyen est trop élevé',
      condition: {
        kpi: 'TAUX_EFFORT_MOYEN',
        operateur: '>',
        seuil: 12,
      },
      priorite: 'normale',
      actif: true,
      notificationEmail: false,
      frequenceVerification: 'mensuel',
    },
    wault_faible: {
      centreId,
      type: 'wault_faible',
      nom: 'WAULT faible',
      description: 'Alerte lorsque le WAULT passe sous le seuil',
      condition: {
        kpi: 'WAULT',
        operateur: '<',
        seuil: 2,
      },
      priorite: 'haute',
      actif: true,
      notificationEmail: false,
      frequenceVerification: 'mensuel',
    },
    walb_faible: {
      centreId,
      type: 'walb_faible',
      nom: 'WALB faible',
      description: 'Alerte lorsque le WALB passe sous le seuil',
      condition: {
        kpi: 'WALB',
        operateur: '<',
        seuil: 1.5,
      },
      priorite: 'normale',
      actif: true,
      notificationEmail: false,
      frequenceVerification: 'mensuel',
    },
    impaye_critique: {
      centreId,
      type: 'impaye_critique',
      nom: 'Taux de recouvrement dégradé',
      description: 'Alerte lorsque le taux de recouvrement chute',
      condition: {
        kpi: 'TAUX_RECOUVREMENT',
        operateur: '<',
        seuil: 95,
      },
      priorite: 'critique',
      actif: true,
      notificationEmail: true,
      frequenceVerification: 'quotidien',
    },
    recouvrement_faible: {
      centreId,
      type: 'recouvrement_faible',
      nom: 'Recouvrement faible',
      description: 'Alerte lorsque le taux de recouvrement passe sous 98%',
      condition: {
        kpi: 'TAUX_RECOUVREMENT',
        operateur: '<',
        seuil: 98,
      },
      priorite: 'normale',
      actif: true,
      notificationEmail: false,
      frequenceVerification: 'hebdomadaire',
    },
    frequentation_baisse: {
      centreId,
      type: 'frequentation_baisse',
      nom: 'Baisse de fréquentation',
      description: 'Alerte sur la baisse de fréquentation',
      condition: {
        kpi: 'FREQUENTATION_TOTALE',
        operateur: '<',
        seuil: 0, // À configurer selon historique
      },
      priorite: 'normale',
      actif: false, // Désactivé par défaut car nécessite configuration
      notificationEmail: false,
      frequenceVerification: 'hebdomadaire',
    },
    ca_chute: {
      centreId,
      type: 'ca_chute',
      nom: 'Chute du CA',
      description: 'Alerte sur la baisse du chiffre d\'affaires',
      condition: {
        kpi: 'CA_TOTAL',
        operateur: '<',
        seuil: 0, // À configurer selon historique
      },
      priorite: 'haute',
      actif: false,
      notificationEmail: false,
      frequenceVerification: 'mensuel',
    },
    noi_baisse: {
      centreId,
      type: 'noi_baisse',
      nom: 'NOI en baisse',
      description: 'Alerte lorsque le NOI diminue significativement',
      condition: {
        kpi: 'NOI',
        operateur: '<',
        seuil: 0, // À configurer
      },
      priorite: 'critique',
      actif: false,
      notificationEmail: true,
      frequenceVerification: 'mensuel',
    },
    echeance_proche: {
      centreId,
      type: 'echeance_proche',
      nom: 'Échéance de bail proche',
      description: 'Alerte sur les baux arrivant à échéance',
      condition: {
        kpi: 'WAULT',
        operateur: '<',
        seuil: 1,
      },
      priorite: 'haute',
      actif: true,
      notificationEmail: false,
      frequenceVerification: 'mensuel',
    },
    concentration_elevee: {
      centreId,
      type: 'concentration_elevee',
      nom: 'Concentration locataire élevée',
      description: 'Alerte sur la concentration des revenus',
      condition: {
        kpi: 'CONCENTRATION_TOP5',
        operateur: '>',
        seuil: 50,
      },
      priorite: 'normale',
      actif: true,
      notificationEmail: false,
      frequenceVerification: 'mensuel',
    },
    charges_depassement: {
      centreId,
      type: 'charges_depassement',
      nom: 'Dépassement des charges',
      description: 'Alerte sur le taux de refacturation',
      condition: {
        kpi: 'TAUX_REFACTURATION',
        operateur: '<',
        seuil: 75,
      },
      priorite: 'normale',
      actif: true,
      notificationEmail: false,
      frequenceVerification: 'mensuel',
    },
    custom: {
      centreId,
      type: 'custom',
      nom: 'Règle personnalisée',
      description: 'Règle d\'alerte personnalisée',
      condition: {
        kpi: 'NOI',
        operateur: '<',
        seuil: 0,
      },
      priorite: 'normale',
      actif: false,
      notificationEmail: false,
      frequenceVerification: 'mensuel',
    },
  };

  return reglesPredefines[type];
}

// ===========================================
// VERIFICATION D'UNE REGLE
// ===========================================

export function verifierRegle(
  regle: RegleAlerte,
  resultatsKPI: ResultatKPI[]
): VerificationResult {
  const kpi = resultatsKPI.find(r => r.typeKPI === regle.condition.kpi);

  if (!kpi) {
    return {
      regle,
      declenchee: false,
      message: `KPI ${regle.condition.kpi} non disponible`,
    };
  }

  let declenchee = false;
  const { operateur, seuil, seuilMax } = regle.condition;
  const valeur = kpi.valeur;

  switch (operateur) {
    case '>':
      declenchee = valeur > seuil;
      break;
    case '<':
      declenchee = valeur < seuil;
      break;
    case '>=':
      declenchee = valeur >= seuil;
      break;
    case '<=':
      declenchee = valeur <= seuil;
      break;
    case '==':
      declenchee = valeur === seuil;
      break;
    case '!=':
      declenchee = valeur !== seuil;
      break;
    case 'entre':
      declenchee = valeur >= seuil && valeur <= (seuilMax || seuil);
      break;
  }

  return {
    regle,
    declenchee,
    kpiValeur: valeur,
    kpiFormatee: kpi.valeurFormatee,
    message: declenchee
      ? `${regle.nom}: ${kpi.valeurFormatee} ${operateur} ${seuil}`
      : undefined,
  };
}

// ===========================================
// VERIFICATION DE TOUTES LES REGLES
// ===========================================

export function verifierToutesRegles(
  regles: RegleAlerte[],
  resultatsKPI: ResultatKPI[]
): VerificationResult[] {
  const reglesActives = regles.filter(r => r.actif);
  return reglesActives.map(regle => verifierRegle(regle, resultatsKPI));
}

// ===========================================
// GENERATION D'ALERTES
// ===========================================

export function genererAlerte(
  centreId: string,
  regle: RegleAlerte,
  kpiValeur: number,
  kpiFormatee: string
): AlerteGeneree {
  const now = new Date().toISOString();

  // Construire le message selon l'opérateur
  let messageCondition = '';
  switch (regle.condition.operateur) {
    case '>':
      messageCondition = `supérieure à ${regle.condition.seuil}`;
      break;
    case '<':
      messageCondition = `inférieure à ${regle.condition.seuil}`;
      break;
    case '>=':
      messageCondition = `supérieure ou égale à ${regle.condition.seuil}`;
      break;
    case '<=':
      messageCondition = `inférieure ou égale à ${regle.condition.seuil}`;
      break;
    case '==':
      messageCondition = `égale à ${regle.condition.seuil}`;
      break;
    case '!=':
      messageCondition = `différente de ${regle.condition.seuil}`;
      break;
    case 'entre':
      messageCondition = `entre ${regle.condition.seuil} et ${regle.condition.seuilMax}`;
      break;
  }

  return {
    id: uuidv4(),
    centreId,
    regleId: regle.id,
    titre: regle.nom,
    message: `${regle.description}. La valeur actuelle (${kpiFormatee}) est ${messageCondition}.`,
    kpiConcerne: regle.condition.kpi,
    valeurActuelle: kpiValeur,
    seuilDeclenche: regle.condition.seuil,
    priorite: regle.priorite,
    lue: false,
    traitee: false,
    dateGeneration: now,
    createdAt: now,
  };
}

// ===========================================
// GENERER ALERTES DECLENCHEES
// ===========================================

export function genererAlertesDecelenchees(
  centreId: string,
  regles: RegleAlerte[],
  resultatsKPI: ResultatKPI[]
): AlerteGeneree[] {
  const resultats = verifierToutesRegles(regles, resultatsKPI);
  const alertes: AlerteGeneree[] = [];

  for (const resultat of resultats) {
    if (resultat.declenchee && resultat.kpiValeur !== undefined && resultat.kpiFormatee) {
      alertes.push(genererAlerte(
        centreId,
        resultat.regle,
        resultat.kpiValeur,
        resultat.kpiFormatee
      ));
    }
  }

  return alertes;
}

// ===========================================
// OBTENIR TOUTES LES REGLES PREDEFINIES
// ===========================================

export function getToutesReglesPredefines(
  centreId?: string
): Omit<RegleAlerte, 'id' | 'createdAt' | 'updatedAt' | 'nombreDeclenchements'>[] {
  const types: TypeRegleAlerte[] = [
    'vacance_elevee',
    'effort_excessif',
    'wault_faible',
    'walb_faible',
    'impaye_critique',
    'recouvrement_faible',
    'concentration_elevee',
    'charges_depassement',
    'echeance_proche',
  ];

  return types.map(type => creerRegleAlertePredefinie(type, centreId));
}

// ===========================================
// LABELS ET HELPERS
// ===========================================

export const TYPE_REGLE_LABELS: Record<TypeRegleAlerte, string> = {
  vacance_elevee: 'Vacance élevée',
  effort_excessif: 'Taux d\'effort excessif',
  wault_faible: 'WAULT faible',
  walb_faible: 'WALB faible',
  impaye_critique: 'Impayés critiques',
  recouvrement_faible: 'Recouvrement faible',
  frequentation_baisse: 'Baisse fréquentation',
  ca_chute: 'Chute CA',
  noi_baisse: 'NOI en baisse',
  echeance_proche: 'Échéance proche',
  concentration_elevee: 'Concentration élevée',
  charges_depassement: 'Dépassement charges',
  custom: 'Personnalisée',
};

export const OPERATEUR_LABELS: Record<OperateurComparaison, string> = {
  '>': 'Supérieur à',
  '<': 'Inférieur à',
  '>=': 'Supérieur ou égal à',
  '<=': 'Inférieur ou égal à',
  '==': 'Égal à',
  '!=': 'Différent de',
  'entre': 'Entre',
};

export const PRIORITE_LABELS: Record<string, string> = {
  info: 'Information',
  normale: 'Normale',
  haute: 'Haute',
  critique: 'Critique',
};

export const PRIORITE_COULEURS: Record<string, string> = {
  info: '#3b82f6',
  normale: '#10b981',
  haute: '#f59e0b',
  critique: '#ef4444',
};

export const FREQUENCE_LABELS: Record<string, string> = {
  temps_reel: 'Temps réel',
  quotidien: 'Quotidien',
  hebdomadaire: 'Hebdomadaire',
  mensuel: 'Mensuel',
};

// ===========================================
// HELPER - KPIs DISPONIBLES POUR ALERTES
// ===========================================

export const KPI_POUR_ALERTES: { code: TypeKPICalcule; label: string }[] = [
  { code: 'NOI', label: 'NOI' },
  { code: 'YIELD_NET', label: 'Yield Net' },
  { code: 'WAULT', label: 'WAULT' },
  { code: 'WALB', label: 'WALB' },
  { code: 'TAUX_OCCUPATION_PHYSIQUE', label: 'Taux d\'occupation physique' },
  { code: 'TAUX_OCCUPATION_FINANCIER', label: 'Taux d\'occupation financier' },
  { code: 'TAUX_VACANCE', label: 'Taux de vacance' },
  { code: 'TAUX_EFFORT_MOYEN', label: 'Taux d\'effort moyen' },
  { code: 'TAUX_RECOUVREMENT', label: 'Taux de recouvrement' },
  { code: 'DSO', label: 'DSO (jours)' },
  { code: 'CONCENTRATION_TOP5', label: 'Concentration Top 5' },
  { code: 'CONCENTRATION_TOP10', label: 'Concentration Top 10' },
  { code: 'TAUX_REFACTURATION', label: 'Taux de refacturation' },
  { code: 'CA_TOTAL', label: 'CA Total' },
  { code: 'FREQUENTATION_TOTALE', label: 'Fréquentation totale' },
];

// ===========================================
// ALERTES DASHBOARD GENERAL
// ===========================================

import type {
  Alerte,
  AlertePriorite,
  Mesure,
  Objectif,
  PlanAction,
  CentreCommercial,
} from '../types';

export interface AlerteDashboard extends Omit<Alerte, 'id' | 'dateCreation' | 'lue' | 'traitee'> {
  id?: string;
}

interface DashboardAlertConfig {
  seuilRetardAction: number;
  seuilTendanceNegative: number;
  joursAvantEcheance: number;
}

const defaultDashboardConfig: DashboardAlertConfig = {
  seuilRetardAction: 7,
  seuilTendanceNegative: 3,
  joursAvantEcheance: 3,
};

/**
 * Détecte les KPIs critiques (passés en rouge) depuis les mesures générales
 */
export function detecterMesuresCritiques(
  mesures: Mesure[],
  objectifs: Objectif[],
  centres: CentreCommercial[]
): AlerteDashboard[] {
  const alertes: AlerteDashboard[] = [];
  const objectifsMap = new Map(objectifs.map((o) => [o.id, o]));
  const centresMap = new Map(centres.map((c) => [c.id, c]));

  // Grouper par objectif et prendre la dernière mesure
  const dernieresMesures = new Map<string, Mesure>();
  mesures.forEach((m) => {
    const existing = dernieresMesures.get(m.objectifId);
    if (!existing || new Date(m.dateSaisie) > new Date(existing.dateSaisie)) {
      dernieresMesures.set(m.objectifId, m);
    }
  });

  dernieresMesures.forEach((mesure, objectifId) => {
    if (mesure.statut === 'rouge') {
      const objectif = objectifsMap.get(objectifId);
      const centre = centresMap.get(mesure.centreId);

      alertes.push({
        centreId: mesure.centreId,
        type: 'kpi_critique',
        priorite: 'critique',
        titre: `KPI critique: ${objectif?.kpiNom || 'Inconnu'}`,
        message: `Le KPI "${objectif?.kpiNom}" est en zone critique pour ${centre?.nom || 'un centre'}. Valeur: ${mesure.valeurReelle}, Cible: ${mesure.valeurCible}`,
        lien: `/centre/${mesure.centreId}/pilotage`,
        entiteType: 'objectif',
        entiteId: objectifId,
      });
    }
  });

  return alertes;
}

/**
 * Détecte les tendances négatives sur plusieurs périodes
 */
export function detecterTendancesNegativesDashboard(
  mesures: Mesure[],
  objectifs: Objectif[],
  centres: CentreCommercial[],
  config: Partial<DashboardAlertConfig> = {}
): AlerteDashboard[] {
  const { seuilTendanceNegative } = { ...defaultDashboardConfig, ...config };
  const alertes: AlerteDashboard[] = [];
  const objectifsMap = new Map(objectifs.map((o) => [o.id, o]));
  const centresMap = new Map(centres.map((c) => [c.id, c]));

  // Grouper les mesures par objectif
  const mesuresParObjectif = new Map<string, Mesure[]>();
  mesures.forEach((m) => {
    const existing = mesuresParObjectif.get(m.objectifId) || [];
    existing.push(m);
    mesuresParObjectif.set(m.objectifId, existing);
  });

  mesuresParObjectif.forEach((mesuresList, objectifId) => {
    if (mesuresList.length < seuilTendanceNegative) return;

    const sorted = mesuresList.sort(
      (a, b) => new Date(a.dateSaisie).getTime() - new Date(b.dateSaisie).getTime()
    );
    const dernieres = sorted.slice(-seuilTendanceNegative);

    let tendanceNegative = true;
    for (let i = 1; i < dernieres.length; i++) {
      if (dernieres[i].valeurReelle >= dernieres[i - 1].valeurReelle) {
        tendanceNegative = false;
        break;
      }
    }

    if (tendanceNegative) {
      const derniere = dernieres[dernieres.length - 1];
      const objectif = objectifsMap.get(objectifId);
      const centre = centresMap.get(derniere.centreId);

      alertes.push({
        centreId: derniere.centreId,
        type: 'kpi_critique',
        priorite: 'haute',
        titre: `Tendance négative: ${objectif?.kpiNom || 'Inconnu'}`,
        message: `Le KPI "${objectif?.kpiNom}" montre une tendance à la baisse sur ${seuilTendanceNegative} périodes pour ${centre?.nom || 'un centre'}.`,
        lien: `/centre/${derniere.centreId}/pilotage`,
        entiteType: 'objectif',
        entiteId: objectifId,
      });
    }
  });

  return alertes;
}

/**
 * Détecte les actions en retard
 */
export function detecterActionsEnRetardDashboard(
  actions: PlanAction[],
  centres: CentreCommercial[],
  config: Partial<DashboardAlertConfig> = {}
): AlerteDashboard[] {
  const { seuilRetardAction } = { ...defaultDashboardConfig, ...config };
  const alertes: AlerteDashboard[] = [];
  const centresMap = new Map(centres.map((c) => [c.id, c]));
  const now = new Date();

  actions.forEach((action) => {
    if (action.statut === 'termine' || action.statut === 'annule') return;

    const echeance = new Date(action.dateEcheance);
    const retardJours = Math.floor((now.getTime() - echeance.getTime()) / (1000 * 60 * 60 * 24));

    if (retardJours >= seuilRetardAction) {
      const centre = centresMap.get(action.centreId);
      const priorite: AlertePriorite = retardJours >= seuilRetardAction * 2 ? 'critique' : 'haute';

      alertes.push({
        centreId: action.centreId,
        type: 'retard_action',
        priorite,
        titre: `Action en retard: ${action.titre}`,
        message: `L'action "${action.titre}" est en retard de ${retardJours} jours pour ${centre?.nom || 'un centre'}.`,
        lien: `/centre/${action.centreId}/actions`,
        entiteType: 'action',
        entiteId: action.id,
      });
    }
  });

  return alertes;
}

/**
 * Détecte les échéances proches
 */
export function detecterEcheancesProches(
  actions: PlanAction[],
  centres: CentreCommercial[],
  config: Partial<DashboardAlertConfig> = {}
): AlerteDashboard[] {
  const { joursAvantEcheance } = { ...defaultDashboardConfig, ...config };
  const alertes: AlerteDashboard[] = [];
  const centresMap = new Map(centres.map((c) => [c.id, c]));
  const now = new Date();

  actions.forEach((action) => {
    if (action.statut === 'termine' || action.statut === 'annule') return;

    const echeance = new Date(action.dateEcheance);
    const joursRestants = Math.floor((echeance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (joursRestants > 0 && joursRestants <= joursAvantEcheance) {
      const centre = centresMap.get(action.centreId);

      alertes.push({
        centreId: action.centreId,
        type: 'echeance_proche',
        priorite: joursRestants <= 1 ? 'haute' : 'normale',
        titre: `Échéance proche: ${action.titre}`,
        message: `L'action "${action.titre}" arrive à échéance dans ${joursRestants} jour(s) pour ${centre?.nom || 'un centre'}.`,
        lien: `/centre/${action.centreId}/actions`,
        entiteType: 'action',
        entiteId: action.id,
      });
    }
  });

  return alertes;
}

/**
 * Génère toutes les alertes intelligentes pour le dashboard
 */
export function genererAlertesDashboard(
  mesures: Mesure[],
  objectifs: Objectif[],
  actions: PlanAction[],
  centres: CentreCommercial[],
  config: Partial<DashboardAlertConfig> = {}
): Alerte[] {
  const alertesGenerees: AlerteDashboard[] = [
    ...detecterMesuresCritiques(mesures, objectifs, centres),
    ...detecterTendancesNegativesDashboard(mesures, objectifs, centres, config),
    ...detecterActionsEnRetardDashboard(actions, centres, config),
    ...detecterEcheancesProches(actions, centres, config),
  ];

  const now = new Date().toISOString();
  return alertesGenerees.map((a) => ({
    ...a,
    id: a.id || uuidv4(),
    dateCreation: now,
    lue: false,
    traitee: false,
  }));
}

/**
 * Déduplique les alertes pour éviter les doublons
 */
export function dedupliquerAlertesDashboard(
  nouvellesAlertes: Alerte[],
  alertesExistantes: Alerte[]
): Alerte[] {
  const existingKeys = new Set(
    alertesExistantes
      .filter((a) => !a.traitee)
      .map((a) => `${a.type}-${a.entiteId}`)
  );

  return nouvellesAlertes.filter(
    (a) => !existingKeys.has(`${a.type}-${a.entiteId}`)
  );
}
