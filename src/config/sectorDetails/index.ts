/**
 * Sector Details Index - Commercial Real Estate
 *
 * Ce fichier centralise l'export de toutes les configurations détaillées
 * pour le secteur Immobilier Commercial de Cockpit.
 */

// ============================================================================
// COMMERCIAL REAL ESTATE - Part 1
// ============================================================================
export {
  // Report Configs
  ASSET_PERFORMANCE_REPORT,
  NOI_ANALYSIS_REPORT,
  RENT_ROLL_REPORT,
  LEASE_EXPIRY_REPORT,
  TENANT_PERFORMANCE_REPORT,
  FOOTFALL_ANALYSIS_REPORT,
  COMMERCIAL_REAL_ESTATE_REPORTS,

  // Sector Info & Categories
  COMMERCIAL_REAL_ESTATE_SECTOR_INFO,
  SECTOR_CATEGORIES,
  INDUSTRY_STANDARDS,

  // Helper Functions
  getReportByCode,
  getReportsByCategory,
  getPopularReports,
  getAIPoweredReports,
  getAllKPIs,
} from './commercialRealEstateDetails';

export type {
  IndustryStandard,
  KPIBenchmark,
  AssetTypeBenchmark,
  CatalogueKPIDefinition,
  DataFieldRequirement,
  ReportSection,
  ReportConfig,
  SectorCategory,
  SectorInfo,
} from './commercialRealEstateDetails';

// ============================================================================
// COMMERCIAL REAL ESTATE - Part 2
// ============================================================================
export {
  VACANCY_ANALYSIS_REPORT,
  MERCHANDISING_MIX_REPORT,
  BUDGET_VS_ACTUAL_REPORT,
  CASH_FLOW_REPORT,
  ESG_REPORT,
  DUE_DILIGENCE_REPORT,
  COMMERCIAL_REAL_ESTATE_REPORTS_PART2,
} from './commercialRealEstateDetails2';

// ============================================================================
// PROJECT REPORTS - Projet & Travaux
// ============================================================================
export {
  CONSTRUCTION_PROGRESS_REPORT,
  BUDGET_TRACKING_REPORT,
  MOBILIZATION_STATUS_REPORT,
  HANDOVER_CHECKLIST_REPORT,
  PROJECT_DASHBOARD_REPORT,
  PROJECT_REPORTS,
} from './projectReports';

// ============================================================================
// COMBINED EXPORTS
// ============================================================================
import { COMMERCIAL_REAL_ESTATE_REPORTS } from './commercialRealEstateDetails';
import { COMMERCIAL_REAL_ESTATE_REPORTS_PART2 } from './commercialRealEstateDetails2';
import { PROJECT_REPORTS } from './projectReports';

/**
 * All Commercial Real Estate Reports (17 reports total)
 */
export const ALL_COMMERCIAL_REAL_ESTATE_REPORTS = {
  ...COMMERCIAL_REAL_ESTATE_REPORTS,
  ...COMMERCIAL_REAL_ESTATE_REPORTS_PART2,
  ...PROJECT_REPORTS,
};

/**
 * Get all reports as an array
 */
export function getAllReports() {
  return Object.values(ALL_COMMERCIAL_REAL_ESTATE_REPORTS);
}

/**
 * Get reports count
 */
export function getReportsCount(): number {
  return Object.keys(ALL_COMMERCIAL_REAL_ESTATE_REPORTS).length;
}

/**
 * Get unique KPIs count
 */
export function getUniqueKPIsCount(): number {
  const kpiCodes = new Set<string>();
  Object.values(ALL_COMMERCIAL_REAL_ESTATE_REPORTS).forEach(report => {
    report.kpis.forEach(kpi => kpiCodes.add(kpi.code));
  });
  return kpiCodes.size;
}

/**
 * Search reports by query
 */
export function searchReports(query: string) {
  const lowerQuery = query.toLowerCase();
  return Object.values(ALL_COMMERCIAL_REAL_ESTATE_REPORTS).filter(report =>
    report.name.toLowerCase().includes(lowerQuery) ||
    report.description.toLowerCase().includes(lowerQuery) ||
    report.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get reports by complexity
 */
export function getReportsByComplexity(complexity: 'simple' | 'standard' | 'advanced' | 'expert') {
  return Object.values(ALL_COMMERCIAL_REAL_ESTATE_REPORTS).filter(
    report => report.complexity === complexity
  );
}

/**
 * Get premium reports
 */
export function getPremiumReports() {
  return Object.values(ALL_COMMERCIAL_REAL_ESTATE_REPORTS).filter(
    report => report.premium
  );
}

/**
 * Get new reports (marked as new)
 */
export function getNewReports() {
  return Object.values(ALL_COMMERCIAL_REAL_ESTATE_REPORTS).filter(
    report => report.new
  );
}
