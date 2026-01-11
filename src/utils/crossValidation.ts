/**
 * Validation croisée pour les algorithmes de prédiction
 * Évalue la robustesse et la précision des modèles
 */

export interface ValidationResult {
  mse: number; // Mean Squared Error
  rmse: number; // Root Mean Squared Error
  mae: number; // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error
  r2: number; // Coefficient de détermination
}

export interface CrossValidationResult {
  folds: ValidationResult[];
  average: ValidationResult;
  standardDeviation: ValidationResult;
  isReliable: boolean;
  confidenceLevel: 'high' | 'medium' | 'low';
}

/**
 * Calcule les métriques de validation pour une prédiction
 */
export function calculateMetrics(
  actual: number[],
  predicted: number[]
): ValidationResult {
  if (actual.length !== predicted.length || actual.length === 0) {
    throw new Error('Les tableaux doivent avoir la même taille et ne pas être vides');
  }

  const n = actual.length;

  // MSE - Mean Squared Error
  const mse = actual.reduce((sum, a, i) => sum + Math.pow(a - predicted[i], 2), 0) / n;

  // RMSE - Root Mean Squared Error
  const rmse = Math.sqrt(mse);

  // MAE - Mean Absolute Error
  const mae = actual.reduce((sum, a, i) => sum + Math.abs(a - predicted[i]), 0) / n;

  // MAPE - Mean Absolute Percentage Error (évite division par 0)
  const mape = actual.reduce((sum, a, i) => {
    if (a === 0) return sum;
    return sum + Math.abs((a - predicted[i]) / a);
  }, 0) / actual.filter(a => a !== 0).length * 100;

  // R² - Coefficient de détermination
  const mean = actual.reduce((sum, a) => sum + a, 0) / n;
  const ssTotal = actual.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0);
  const ssResidual = actual.reduce((sum, a, i) => sum + Math.pow(a - predicted[i], 2), 0);
  const r2 = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

  return {
    mse: Math.round(mse * 100) / 100,
    rmse: Math.round(rmse * 100) / 100,
    mae: Math.round(mae * 100) / 100,
    mape: Math.round(mape * 100) / 100,
    r2: Math.round(r2 * 1000) / 1000,
  };
}

/**
 * K-Fold Cross Validation
 */
export function kFoldCrossValidation(
  data: number[],
  predictFn: (trainData: number[], testSize: number) => number[],
  k: number = 5
): CrossValidationResult {
  if (data.length < k * 2) {
    throw new Error(`Pas assez de données pour ${k} folds`);
  }

  const foldSize = Math.floor(data.length / k);
  const folds: ValidationResult[] = [];

  for (let i = 0; i < k; i++) {
    // Séparer les données en train et test
    const testStart = i * foldSize;
    const testEnd = testStart + foldSize;

    const testData = data.slice(testStart, testEnd);
    const trainData = [...data.slice(0, testStart), ...data.slice(testEnd)];

    // Prédire
    const predictions = predictFn(trainData, testData.length);

    // Calculer les métriques
    const metrics = calculateMetrics(testData, predictions);
    folds.push(metrics);
  }

  // Calculer les moyennes
  const average: ValidationResult = {
    mse: folds.reduce((sum, f) => sum + f.mse, 0) / k,
    rmse: folds.reduce((sum, f) => sum + f.rmse, 0) / k,
    mae: folds.reduce((sum, f) => sum + f.mae, 0) / k,
    mape: folds.reduce((sum, f) => sum + f.mape, 0) / k,
    r2: folds.reduce((sum, f) => sum + f.r2, 0) / k,
  };

  // Calculer les écarts-types
  const standardDeviation: ValidationResult = {
    mse: Math.sqrt(folds.reduce((sum, f) => sum + Math.pow(f.mse - average.mse, 2), 0) / k),
    rmse: Math.sqrt(folds.reduce((sum, f) => sum + Math.pow(f.rmse - average.rmse, 2), 0) / k),
    mae: Math.sqrt(folds.reduce((sum, f) => sum + Math.pow(f.mae - average.mae, 2), 0) / k),
    mape: Math.sqrt(folds.reduce((sum, f) => sum + Math.pow(f.mape - average.mape, 2), 0) / k),
    r2: Math.sqrt(folds.reduce((sum, f) => sum + Math.pow(f.r2 - average.r2, 2), 0) / k),
  };

  // Déterminer la fiabilité
  const isReliable = average.r2 > 0.7 && average.mape < 20;

  // Niveau de confiance
  let confidenceLevel: 'high' | 'medium' | 'low';
  if (average.r2 > 0.9 && average.mape < 10 && standardDeviation.r2 < 0.05) {
    confidenceLevel = 'high';
  } else if (average.r2 > 0.7 && average.mape < 20) {
    confidenceLevel = 'medium';
  } else {
    confidenceLevel = 'low';
  }

  return {
    folds,
    average: {
      mse: Math.round(average.mse * 100) / 100,
      rmse: Math.round(average.rmse * 100) / 100,
      mae: Math.round(average.mae * 100) / 100,
      mape: Math.round(average.mape * 100) / 100,
      r2: Math.round(average.r2 * 1000) / 1000,
    },
    standardDeviation: {
      mse: Math.round(standardDeviation.mse * 100) / 100,
      rmse: Math.round(standardDeviation.rmse * 100) / 100,
      mae: Math.round(standardDeviation.mae * 100) / 100,
      mape: Math.round(standardDeviation.mape * 100) / 100,
      r2: Math.round(standardDeviation.r2 * 1000) / 1000,
    },
    isReliable,
    confidenceLevel,
  };
}

/**
 * Time Series Cross Validation (validation croisée pour séries temporelles)
 * Plus adaptée car respecte l'ordre temporel
 */
export function timeSeriesCrossValidation(
  data: number[],
  predictFn: (trainData: number[], horizons: number) => number[],
  minTrainSize: number = 10,
  horizon: number = 3
): CrossValidationResult {
  const folds: ValidationResult[] = [];

  // On commence avec minTrainSize points et on avance progressivement
  for (let trainEnd = minTrainSize; trainEnd <= data.length - horizon; trainEnd++) {
    const trainData = data.slice(0, trainEnd);
    const testData = data.slice(trainEnd, trainEnd + horizon);

    const predictions = predictFn(trainData, horizon);
    const metrics = calculateMetrics(testData, predictions);
    folds.push(metrics);
  }

  if (folds.length === 0) {
    throw new Error('Pas assez de données pour la validation croisée temporelle');
  }

  const k = folds.length;

  // Calculer les moyennes
  const average: ValidationResult = {
    mse: folds.reduce((sum, f) => sum + f.mse, 0) / k,
    rmse: folds.reduce((sum, f) => sum + f.rmse, 0) / k,
    mae: folds.reduce((sum, f) => sum + f.mae, 0) / k,
    mape: folds.reduce((sum, f) => sum + f.mape, 0) / k,
    r2: folds.reduce((sum, f) => sum + f.r2, 0) / k,
  };

  // Calculer les écarts-types
  const standardDeviation: ValidationResult = {
    mse: Math.sqrt(folds.reduce((sum, f) => sum + Math.pow(f.mse - average.mse, 2), 0) / k),
    rmse: Math.sqrt(folds.reduce((sum, f) => sum + Math.pow(f.rmse - average.rmse, 2), 0) / k),
    mae: Math.sqrt(folds.reduce((sum, f) => sum + Math.pow(f.mae - average.mae, 2), 0) / k),
    mape: Math.sqrt(folds.reduce((sum, f) => sum + Math.pow(f.mape - average.mape, 2), 0) / k),
    r2: Math.sqrt(folds.reduce((sum, f) => sum + Math.pow(f.r2 - average.r2, 2), 0) / k),
  };

  const isReliable = average.r2 > 0.7 && average.mape < 20;

  let confidenceLevel: 'high' | 'medium' | 'low';
  if (average.r2 > 0.9 && average.mape < 10) {
    confidenceLevel = 'high';
  } else if (average.r2 > 0.7 && average.mape < 20) {
    confidenceLevel = 'medium';
  } else {
    confidenceLevel = 'low';
  }

  return {
    folds,
    average: {
      mse: Math.round(average.mse * 100) / 100,
      rmse: Math.round(average.rmse * 100) / 100,
      mae: Math.round(average.mae * 100) / 100,
      mape: Math.round(average.mape * 100) / 100,
      r2: Math.round(average.r2 * 1000) / 1000,
    },
    standardDeviation: {
      mse: Math.round(standardDeviation.mse * 100) / 100,
      rmse: Math.round(standardDeviation.rmse * 100) / 100,
      mae: Math.round(standardDeviation.mae * 100) / 100,
      mape: Math.round(standardDeviation.mape * 100) / 100,
      r2: Math.round(standardDeviation.r2 * 1000) / 1000,
    },
    isReliable,
    confidenceLevel,
  };
}

/**
 * Fonction de prédiction simple pour les tests (régression linéaire)
 */
export function simpleLinearPredict(trainData: number[], count: number): number[] {
  const n = trainData.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = trainData.reduce((a, b) => a + b, 0);
  const sumXY = trainData.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return Array.from({ length: count }, (_, i) => intercept + slope * (n + i));
}
