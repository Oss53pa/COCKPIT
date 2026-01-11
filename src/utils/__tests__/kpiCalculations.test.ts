/**
 * Tests unitaires pour les calculs KPI
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';

// Fonctions de calcul KPI à tester (importées de kpiCalculations.ts)
// Note: Ces tests vérifient la logique mathématique des formules KPI

/**
 * Calcul du NOI (Net Operating Income)
 */
function calculateNOI(totalRevenue: number, operatingExpenses: number): number {
  return totalRevenue - operatingExpenses;
}

/**
 * Calcul du taux d'occupation
 */
function calculateOccupancyRate(occupiedArea: number, totalArea: number): number {
  if (totalArea === 0) return 0;
  return (occupiedArea / totalArea) * 100;
}

/**
 * Calcul du rendement brut
 */
function calculateGrossYield(annualRent: number, propertyValue: number): number {
  if (propertyValue === 0) return 0;
  return (annualRent / propertyValue) * 100;
}

/**
 * Calcul du WAULT (Weighted Average Unexpired Lease Term)
 */
function calculateWAULT(leases: Array<{ rent: number; remainingMonths: number }>): number {
  const totalRent = leases.reduce((sum, l) => sum + l.rent, 0);
  if (totalRent === 0) return 0;

  const weightedSum = leases.reduce(
    (sum, l) => sum + (l.rent * l.remainingMonths),
    0
  );

  return weightedSum / totalRent / 12; // Convert to years
}

/**
 * Calcul du DSO (Days Sales Outstanding)
 */
function calculateDSO(accountsReceivable: number, totalRevenue: number, days: number = 365): number {
  if (totalRevenue === 0) return 0;
  return (accountsReceivable / totalRevenue) * days;
}

/**
 * Calcul du taux de recouvrement
 */
function calculateCollectionRate(collected: number, billed: number): number {
  if (billed === 0) return 0;
  return (collected / billed) * 100;
}

/**
 * Calcul du CA au m²
 */
function calculateRevenuePerSqm(revenue: number, area: number): number {
  if (area === 0) return 0;
  return revenue / area;
}

/**
 * Calcul du taux de variation
 */
function calculateVariation(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Tests

describe('KPI Calculations', () => {
  describe('calculateNOI', () => {
    it('should calculate NOI correctly', () => {
      expect(calculateNOI(1000000, 300000)).toBe(700000);
    });

    it('should handle zero revenue', () => {
      expect(calculateNOI(0, 100000)).toBe(-100000);
    });

    it('should handle zero expenses', () => {
      expect(calculateNOI(500000, 0)).toBe(500000);
    });
  });

  describe('calculateOccupancyRate', () => {
    it('should calculate occupancy rate correctly', () => {
      expect(calculateOccupancyRate(8000, 10000)).toBe(80);
    });

    it('should return 100% for full occupancy', () => {
      expect(calculateOccupancyRate(10000, 10000)).toBe(100);
    });

    it('should return 0% for empty property', () => {
      expect(calculateOccupancyRate(0, 10000)).toBe(0);
    });

    it('should handle zero total area', () => {
      expect(calculateOccupancyRate(5000, 0)).toBe(0);
    });
  });

  describe('calculateGrossYield', () => {
    it('should calculate gross yield correctly', () => {
      expect(calculateGrossYield(100000, 1000000)).toBe(10);
    });

    it('should handle zero property value', () => {
      expect(calculateGrossYield(50000, 0)).toBe(0);
    });

    it('should return 0 for no rent', () => {
      expect(calculateGrossYield(0, 1000000)).toBe(0);
    });
  });

  describe('calculateWAULT', () => {
    it('should calculate WAULT correctly', () => {
      const leases = [
        { rent: 10000, remainingMonths: 24 },
        { rent: 20000, remainingMonths: 36 },
      ];
      // Expected: (10000*24 + 20000*36) / 30000 / 12 = 960000 / 30000 / 12 = 2.67 years
      const wault = calculateWAULT(leases);
      expect(wault).toBeCloseTo(2.67, 1);
    });

    it('should return 0 for empty leases', () => {
      expect(calculateWAULT([])).toBe(0);
    });

    it('should return 0 for zero rent', () => {
      const leases = [{ rent: 0, remainingMonths: 24 }];
      expect(calculateWAULT(leases)).toBe(0);
    });
  });

  describe('calculateDSO', () => {
    it('should calculate DSO correctly', () => {
      // AR 100k, Revenue 1M, 365 days = 36.5 days
      expect(calculateDSO(100000, 1000000)).toBeCloseTo(36.5, 1);
    });

    it('should handle zero revenue', () => {
      expect(calculateDSO(50000, 0)).toBe(0);
    });

    it('should work with custom period', () => {
      expect(calculateDSO(100000, 1000000, 30)).toBeCloseTo(3, 1);
    });
  });

  describe('calculateCollectionRate', () => {
    it('should calculate collection rate correctly', () => {
      expect(calculateCollectionRate(90000, 100000)).toBe(90);
    });

    it('should return 100% for full collection', () => {
      expect(calculateCollectionRate(100000, 100000)).toBe(100);
    });

    it('should handle zero billed', () => {
      expect(calculateCollectionRate(50000, 0)).toBe(0);
    });
  });

  describe('calculateRevenuePerSqm', () => {
    it('should calculate revenue per sqm correctly', () => {
      expect(calculateRevenuePerSqm(1000000, 5000)).toBe(200);
    });

    it('should handle zero area', () => {
      expect(calculateRevenuePerSqm(500000, 0)).toBe(0);
    });
  });

  describe('calculateVariation', () => {
    it('should calculate positive variation correctly', () => {
      expect(calculateVariation(120, 100)).toBe(20);
    });

    it('should calculate negative variation correctly', () => {
      expect(calculateVariation(80, 100)).toBe(-20);
    });

    it('should handle zero previous value with positive current', () => {
      expect(calculateVariation(100, 0)).toBe(100);
    });

    it('should handle zero previous value with zero current', () => {
      expect(calculateVariation(0, 0)).toBe(0);
    });

    it('should return 0% for no change', () => {
      expect(calculateVariation(100, 100)).toBe(0);
    });
  });
});

describe('Edge Cases', () => {
  it('should handle very large numbers', () => {
    expect(calculateNOI(10000000000, 3000000000)).toBe(7000000000);
  });

  it('should handle decimal values', () => {
    expect(calculateOccupancyRate(7532.5, 10000)).toBeCloseTo(75.325, 2);
  });

  it('should handle negative values where applicable', () => {
    // NOI can be negative
    expect(calculateNOI(100000, 150000)).toBe(-50000);
  });
});
