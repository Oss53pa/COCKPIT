/**
 * Tests unitaires pour le moteur de prédiction
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';

/**
 * Calcul de la régression linéaire simple
 */
function calculateLinearRegression(data: number[]): { slope: number; intercept: number; r2: number } {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] || 0, r2: 0 };

  // x = indices (0, 1, 2, ..., n-1)
  const sumX = (n * (n - 1)) / 2;
  const sumY = data.reduce((a, b) => a + b, 0);
  const sumXY = data.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R² calculation
  const meanY = sumY / n;
  const ssTotal = data.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
  const ssResidual = data.reduce((sum, y, x) => {
    const predicted = intercept + slope * x;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  const r2 = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

  return { slope, intercept, r2 };
}

/**
 * Calcul de la moyenne mobile
 */
function calculateMovingAverage(data: number[], window: number): number[] {
  if (window <= 0 || data.length === 0) return [];
  if (window > data.length) return [data.reduce((a, b) => a + b, 0) / data.length];

  const result: number[] = [];
  for (let i = window - 1; i < data.length; i++) {
    const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / window);
  }
  return result;
}

/**
 * Lissage exponentiel
 */
function calculateExponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
  if (data.length === 0) return [];
  if (alpha < 0 || alpha > 1) alpha = 0.3;

  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}

/**
 * Détection de tendance
 */
function detectTrend(data: number[]): 'up' | 'down' | 'stable' {
  if (data.length < 2) return 'stable';

  const { slope } = calculateLinearRegression(data);
  const avgValue = data.reduce((a, b) => a + b, 0) / data.length;
  const threshold = avgValue * 0.02; // 2% du average

  if (slope > threshold) return 'up';
  if (slope < -threshold) return 'down';
  return 'stable';
}

/**
 * Prédiction de valeurs futures
 */
function forecastValues(data: number[], periods: number): number[] {
  const { slope, intercept } = calculateLinearRegression(data);
  const n = data.length;

  return Array.from({ length: periods }, (_, i) => {
    const predicted = intercept + slope * (n + i);
    return Math.max(0, predicted); // Ne pas prédire des valeurs négatives
  });
}

// Tests

describe('Linear Regression', () => {
  it('should calculate slope and intercept correctly', () => {
    const data = [10, 20, 30, 40, 50];
    const result = calculateLinearRegression(data);

    expect(result.slope).toBe(10);
    expect(result.intercept).toBe(10);
    expect(result.r2).toBeCloseTo(1, 5);
  });

  it('should handle constant data', () => {
    const data = [50, 50, 50, 50];
    const result = calculateLinearRegression(data);

    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(50);
    expect(result.r2).toBe(1); // Perfect fit for constant
  });

  it('should handle single value', () => {
    const data = [100];
    const result = calculateLinearRegression(data);

    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(100);
  });

  it('should handle empty array', () => {
    const result = calculateLinearRegression([]);
    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(0);
  });

  it('should calculate R² correctly for imperfect fit', () => {
    const data = [10, 22, 28, 42, 48];
    const result = calculateLinearRegression(data);

    expect(result.r2).toBeGreaterThan(0.9);
    expect(result.r2).toBeLessThan(1);
  });
});

describe('Moving Average', () => {
  it('should calculate moving average correctly', () => {
    const data = [10, 20, 30, 40, 50];
    const result = calculateMovingAverage(data, 3);

    expect(result).toEqual([20, 30, 40]);
  });

  it('should handle window equal to data length', () => {
    const data = [10, 20, 30];
    const result = calculateMovingAverage(data, 3);

    expect(result).toEqual([20]);
  });

  it('should handle window larger than data', () => {
    const data = [10, 20, 30];
    const result = calculateMovingAverage(data, 5);

    expect(result).toEqual([20]);
  });

  it('should handle empty array', () => {
    expect(calculateMovingAverage([], 3)).toEqual([]);
  });

  it('should handle window of 1', () => {
    const data = [10, 20, 30];
    expect(calculateMovingAverage(data, 1)).toEqual([10, 20, 30]);
  });
});

describe('Exponential Smoothing', () => {
  it('should smooth data correctly', () => {
    const data = [10, 20, 30, 40, 50];
    const result = calculateExponentialSmoothing(data, 0.5);

    expect(result[0]).toBe(10);
    expect(result[1]).toBe(15); // 0.5*20 + 0.5*10
    expect(result.length).toBe(5);
  });

  it('should handle alpha = 1 (no smoothing)', () => {
    const data = [10, 20, 30];
    const result = calculateExponentialSmoothing(data, 1);

    expect(result).toEqual([10, 20, 30]);
  });

  it('should handle alpha = 0 (constant first value)', () => {
    const data = [10, 20, 30];
    const result = calculateExponentialSmoothing(data, 0);

    expect(result).toEqual([10, 10, 10]);
  });

  it('should handle empty array', () => {
    expect(calculateExponentialSmoothing([])).toEqual([]);
  });

  it('should use default alpha for invalid values', () => {
    const data = [10, 20, 30];
    const result1 = calculateExponentialSmoothing(data, -0.5);
    const result2 = calculateExponentialSmoothing(data, 1.5);
    const resultDefault = calculateExponentialSmoothing(data, 0.3);

    expect(result1).toEqual(resultDefault);
    expect(result2).toEqual(resultDefault);
  });
});

describe('Trend Detection', () => {
  it('should detect upward trend', () => {
    const data = [100, 110, 120, 130, 140, 150];
    expect(detectTrend(data)).toBe('up');
  });

  it('should detect downward trend', () => {
    const data = [150, 140, 130, 120, 110, 100];
    expect(detectTrend(data)).toBe('down');
  });

  it('should detect stable trend', () => {
    const data = [100, 101, 99, 100, 101, 100];
    expect(detectTrend(data)).toBe('stable');
  });

  it('should return stable for single value', () => {
    expect(detectTrend([100])).toBe('stable');
  });

  it('should return stable for empty array', () => {
    expect(detectTrend([])).toBe('stable');
  });
});

describe('Forecasting', () => {
  it('should forecast future values correctly', () => {
    const data = [10, 20, 30, 40, 50];
    const forecast = forecastValues(data, 3);

    expect(forecast[0]).toBeCloseTo(60, 1);
    expect(forecast[1]).toBeCloseTo(70, 1);
    expect(forecast[2]).toBeCloseTo(80, 1);
  });

  it('should not predict negative values', () => {
    const data = [50, 40, 30, 20, 10];
    const forecast = forecastValues(data, 10);

    forecast.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });

  it('should handle constant data', () => {
    const data = [100, 100, 100, 100];
    const forecast = forecastValues(data, 3);

    expect(forecast).toEqual([100, 100, 100]);
  });
});

describe('Integration', () => {
  it('should produce consistent results across methods', () => {
    const data = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];

    // All methods should indicate upward trend
    expect(detectTrend(data)).toBe('up');

    // Regression should have high R²
    const { r2 } = calculateLinearRegression(data);
    expect(r2).toBeCloseTo(1, 3);

    // Forecast should continue the trend
    const forecast = forecastValues(data, 2);
    expect(forecast[0]).toBeGreaterThan(200);
    expect(forecast[1]).toBeGreaterThan(forecast[0]);
  });
});
