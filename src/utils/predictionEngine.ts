// ============================================
// PREDICTION ENGINE - Prédictions par Tendances
// ============================================

import { v4 as uuidv4 } from 'uuid';
import type {
  TendancePrediction,
  ResultatKPI,
  TypeKPICalcule,
} from '../types/bi';

// ===========================================
// TYPES
// ===========================================

export type MethodologiePrediction = 'lineaire' | 'moyenne_mobile' | 'exponentiel';

export interface PointDonnee {
  periode: string;
  valeur: number;
}

export interface PredictionPoint {
  periode: string;
  valeur: number;
  confianceBasse: number;
  confianceHaute: number;
}

export interface ParametresPrediction {
  horizon: number; // Nombre de mois
  methodologie: MethodologiePrediction;
  fenetreMoyenneMobile?: number; // Pour moyenne mobile
  facteurLissage?: number; // Pour exponentiel (0-1)
}

// ===========================================
// REGRESSION LINEAIRE
// ===========================================

interface RegressionResult {
  pente: number;
  ordonnee: number;
  r2: number;
  ecartType: number;
}

function calculerRegressionLineaire(valeurs: number[]): RegressionResult {
  const n = valeurs.length;
  if (n < 2) {
    return { pente: 0, ordonnee: valeurs[0] || 0, r2: 0, ecartType: 0 };
  }

  // Calculs pour régression linéaire
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += valeurs[i];
    sumXY += i * valeurs[i];
    sumX2 += i * i;
    sumY2 += valeurs[i] * valeurs[i];
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) {
    return { pente: 0, ordonnee: sumY / n, r2: 0, ecartType: 0 };
  }

  const pente = (n * sumXY - sumX * sumY) / denominator;
  const ordonnee = (sumY - pente * sumX) / n;

  // Calculer R²
  const yMean = sumY / n;
  let ssRes = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    const yPred = ordonnee + pente * i;
    ssRes += Math.pow(valeurs[i] - yPred, 2);
    ssTot += Math.pow(valeurs[i] - yMean, 2);
  }

  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  const ecartType = Math.sqrt(ssRes / n);

  return { pente, ordonnee, r2, ecartType };
}

// ===========================================
// MOYENNE MOBILE
// ===========================================

function calculerMoyenneMobile(valeurs: number[], fenetre: number): number[] {
  const result: number[] = [];
  const n = valeurs.length;

  for (let i = 0; i < n; i++) {
    const debut = Math.max(0, i - fenetre + 1);
    const slice = valeurs.slice(debut, i + 1);
    const moyenne = slice.reduce((a, b) => a + b, 0) / slice.length;
    result.push(moyenne);
  }

  return result;
}

function predireMoyenneMobile(
  valeurs: number[],
  fenetre: number,
  horizon: number
): { predictions: number[]; ecartType: number } {
  const moyennes = calculerMoyenneMobile(valeurs, fenetre);
  const dernieresMoyennes = moyennes.slice(-fenetre);

  // Calculer la tendance sur les dernières moyennes
  const regression = calculerRegressionLineaire(dernieresMoyennes);

  const predictions: number[] = [];
  for (let i = 1; i <= horizon; i++) {
    const valeurPredite = regression.ordonnee + regression.pente * (fenetre + i - 1);
    predictions.push(valeurPredite);
  }

  return { predictions, ecartType: regression.ecartType };
}

// ===========================================
// LISSAGE EXPONENTIEL
// ===========================================

function calculerLissageExponentiel(valeurs: number[], alpha: number): number[] {
  const result: number[] = [valeurs[0]];

  for (let i = 1; i < valeurs.length; i++) {
    const valeurLissee = alpha * valeurs[i] + (1 - alpha) * result[i - 1];
    result.push(valeurLissee);
  }

  return result;
}

function predireLissageExponentiel(
  valeurs: number[],
  alpha: number,
  horizon: number
): { predictions: number[]; ecartType: number } {
  const lisse = calculerLissageExponentiel(valeurs, alpha);
  const derniereValeur = lisse[lisse.length - 1];

  // Pour le lissage simple, la prédiction est la dernière valeur lissée
  // On ajoute une tendance basée sur la différence des dernières valeurs
  const tendance = lisse.length > 1
    ? (lisse[lisse.length - 1] - lisse[lisse.length - 2])
    : 0;

  const predictions: number[] = [];
  for (let i = 1; i <= horizon; i++) {
    predictions.push(derniereValeur + tendance * i);
  }

  // Calcul écart-type
  let sumSquares = 0;
  for (let i = 1; i < valeurs.length; i++) {
    sumSquares += Math.pow(valeurs[i] - lisse[i - 1], 2);
  }
  const ecartType = Math.sqrt(sumSquares / (valeurs.length - 1));

  return { predictions, ecartType };
}

// ===========================================
// PREDICTION AVEC INTERVALLE DE CONFIANCE
// ===========================================

function genererPredictionsAvecConfiance(
  valeurs: number[],
  periodeDepart: Date,
  parametres: ParametresPrediction
): PredictionPoint[] {
  const { horizon, methodologie, fenetreMoyenneMobile = 3, facteurLissage = 0.3 } = parametres;

  let predictions: number[];
  let ecartType: number;

  switch (methodologie) {
    case 'moyenne_mobile':
      const resultMM = predireMoyenneMobile(valeurs, fenetreMoyenneMobile, horizon);
      predictions = resultMM.predictions;
      ecartType = resultMM.ecartType;
      break;

    case 'exponentiel':
      const resultExp = predireLissageExponentiel(valeurs, facteurLissage, horizon);
      predictions = resultExp.predictions;
      ecartType = resultExp.ecartType;
      break;

    case 'lineaire':
    default:
      const regression = calculerRegressionLineaire(valeurs);
      predictions = [];
      for (let i = 1; i <= horizon; i++) {
        predictions.push(regression.ordonnee + regression.pente * (valeurs.length + i - 1));
      }
      ecartType = regression.ecartType;
      break;
  }

  // Générer les points de prédiction avec intervalles de confiance
  const points: PredictionPoint[] = [];
  const niveauConfiance = 1.96; // 95%

  for (let i = 0; i < horizon; i++) {
    const moisFutur = new Date(periodeDepart);
    moisFutur.setMonth(moisFutur.getMonth() + i + 1);

    // L'incertitude augmente avec l'horizon
    const facteurIncertitude = Math.sqrt(1 + (i + 1) / valeurs.length);
    const marge = niveauConfiance * ecartType * facteurIncertitude;

    points.push({
      periode: moisFutur.toISOString().slice(0, 7),
      valeur: predictions[i],
      confianceBasse: predictions[i] - marge,
      confianceHaute: predictions[i] + marge,
    });
  }

  return points;
}

// ===========================================
// FONCTION PRINCIPALE - GENERER PREDICTION
// ===========================================

export function genererPrediction(
  centreId: string,
  kpi: TypeKPICalcule,
  historique: ResultatKPI[],
  parametres: ParametresPrediction = { horizon: 12, methodologie: 'lineaire' }
): TendancePrediction | null {
  // Trier par date et extraire les valeurs
  const historiqueTrié = [...historique]
    .filter(h => h.typeKPI === kpi)
    .sort((a, b) => new Date(a.periodeDebut).getTime() - new Date(b.periodeDebut).getTime());

  if (historiqueTrié.length < 3) {
    console.warn('Pas assez de données pour la prédiction (minimum 3 points)');
    return null;
  }

  const valeurs = historiqueTrié.map(h => h.valeur);
  const derniereDate = new Date(historiqueTrié[historiqueTrié.length - 1].periodeFin);

  // Générer les prédictions
  const predictions = genererPredictionsAvecConfiance(valeurs, derniereDate, parametres);

  // Calculer les statistiques
  const valeurActuelle = valeurs[valeurs.length - 1];
  const valeurPredite = predictions[predictions.length - 1].valeur;
  const variationPredite = valeurPredite - valeurActuelle;
  const variationPourcentage = valeurActuelle !== 0
    ? (variationPredite / valeurActuelle) * 100
    : 0;

  // Déterminer la tendance
  const tendance: 'hausse' | 'baisse' | 'stable' =
    variationPourcentage > 2 ? 'hausse' :
    variationPourcentage < -2 ? 'baisse' : 'stable';

  // Calculer le score de confiance basé sur R²
  const regression = calculerRegressionLineaire(valeurs);
  const confiance = Math.max(0, Math.min(100, regression.r2 * 100));

  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    centreId,
    kpi,
    valeurActuelle,
    valeurPredite,
    horizon: parametres.horizon,
    confiance,
    tendance,
    variationPredite,
    variationPourcentage,
    donneesHistoriques: historiqueTrié.map(h => ({
      periode: h.periodeDebut,
      valeur: h.valeur,
    })),
    predictions,
    methodologie: parametres.methodologie,
    dateCalcul: now,
    createdAt: now,
  };
}

// ===========================================
// GENERER PREDICTIONS MULTIPLES
// ===========================================

export function genererPredictionsMultiples(
  centreId: string,
  historique: ResultatKPI[],
  kpis: TypeKPICalcule[],
  parametres: ParametresPrediction = { horizon: 12, methodologie: 'lineaire' }
): TendancePrediction[] {
  const predictions: TendancePrediction[] = [];

  for (const kpi of kpis) {
    const prediction = genererPrediction(centreId, kpi, historique, parametres);
    if (prediction) {
      predictions.push(prediction);
    }
  }

  return predictions;
}

// ===========================================
// KPIs RECOMMANDES POUR PREDICTION
// ===========================================

export const KPI_POUR_PREDICTION: TypeKPICalcule[] = [
  'NOI',
  'TAUX_OCCUPATION_PHYSIQUE',
  'TAUX_VACANCE',
  'CA_TOTAL',
  'FREQUENTATION_TOTALE',
  'LOYER_TOTAL',
  'TAUX_RECOUVREMENT',
];

// ===========================================
// HELPERS - ANALYSE TENDANCE
// ===========================================

export function analyserTendance(valeurs: number[]): {
  tendance: 'hausse' | 'baisse' | 'stable';
  force: 'forte' | 'moderee' | 'faible';
  regression: RegressionResult;
} {
  const regression = calculerRegressionLineaire(valeurs);
  const moyenneValeurs = valeurs.reduce((a, b) => a + b, 0) / valeurs.length;

  // Calculer le taux de variation mensuel moyen
  const variationMensuelle = moyenneValeurs !== 0
    ? (regression.pente / moyenneValeurs) * 100
    : 0;

  // Déterminer la tendance
  let tendance: 'hausse' | 'baisse' | 'stable';
  if (variationMensuelle > 1) tendance = 'hausse';
  else if (variationMensuelle < -1) tendance = 'baisse';
  else tendance = 'stable';

  // Déterminer la force (basée sur R²)
  let force: 'forte' | 'moderee' | 'faible';
  if (regression.r2 > 0.7) force = 'forte';
  else if (regression.r2 > 0.4) force = 'moderee';
  else force = 'faible';

  return { tendance, force, regression };
}

// ===========================================
// DETECTION ANOMALIES
// ===========================================

export function detecterAnomalies(
  valeurs: number[],
  seuilEcartTypes = 2
): { index: number; valeur: number; ecart: number }[] {
  if (valeurs.length < 3) return [];

  const moyenne = valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
  const ecartType = Math.sqrt(
    valeurs.reduce((sum, val) => sum + Math.pow(val - moyenne, 2), 0) / valeurs.length
  );

  const anomalies: { index: number; valeur: number; ecart: number }[] = [];

  for (let i = 0; i < valeurs.length; i++) {
    const ecart = Math.abs(valeurs[i] - moyenne) / ecartType;
    if (ecart > seuilEcartTypes) {
      anomalies.push({
        index: i,
        valeur: valeurs[i],
        ecart,
      });
    }
  }

  return anomalies;
}

// ===========================================
// SAISONNALITE
// ===========================================

export function detecterSaisonnalite(
  valeurs: number[],
  periodes: string[]
): { estSaisonnier: boolean; periodePic: number; periodeBas: number } | null {
  if (valeurs.length < 12) return null;

  // Regrouper par mois
  const moyennesParMois: number[] = new Array(12).fill(0);
  const comptesParMois: number[] = new Array(12).fill(0);

  for (let i = 0; i < valeurs.length; i++) {
    const mois = new Date(periodes[i]).getMonth();
    moyennesParMois[mois] += valeurs[i];
    comptesParMois[mois]++;
  }

  for (let i = 0; i < 12; i++) {
    if (comptesParMois[i] > 0) {
      moyennesParMois[i] /= comptesParMois[i];
    }
  }

  // Trouver pic et creux
  let maxMois = 0;
  let minMois = 0;
  let maxVal = moyennesParMois[0];
  let minVal = moyennesParMois[0];

  for (let i = 1; i < 12; i++) {
    if (moyennesParMois[i] > maxVal) {
      maxVal = moyennesParMois[i];
      maxMois = i;
    }
    if (moyennesParMois[i] < minVal) {
      minVal = moyennesParMois[i];
      minMois = i;
    }
  }

  // Détecter si variation significative (> 20%)
  const moyenneGlobale = valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
  const variation = ((maxVal - minVal) / moyenneGlobale) * 100;

  return {
    estSaisonnier: variation > 20,
    periodePic: maxMois + 1,
    periodeBas: minMois + 1,
  };
}
