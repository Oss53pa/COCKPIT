/**
 * Commercial Real Estate Sector - Detailed Report Configurations
 * Standards: RICS, ICSC, EPRA, GRESB, IFRS 16, BREEAM
 *
 * Ce fichier contient les configurations détaillées pour les rapports du secteur
 * Immobilier Commercial (Centres Commerciaux) conformes aux standards internationaux.
 */

// ============================================================================
// INTERFACES - Standards Internationaux Immobilier Commercial
// ============================================================================

export interface IndustryStandard {
  code: string;
  name: string;
  organization: string;
  description: string;
  url?: string;
}

export interface KPIBenchmark {
  excellent: number;
  good: number;
  acceptable: number;
  poor: number;
}

export interface AssetTypeBenchmark {
  regional: number;
  superRegional: number;
  community: number;
  neighborhood: number;
  outletCenter: number;
  retailPark: number;
}

export interface CatalogueKPIDefinition {
  code: string;
  name: string;
  nameEn: string;
  shortName: string;
  formula: string;
  unit: '%' | 'ratio' | 'EUR' | 'EUR/m2' | 'EUR/m2/an' | 'm2' | 'years' | 'months' | 'days' | 'visitors' | 'score' | 'number';
  description: string;
  methodology?: string;
  icscDefinition?: string;
  epraDefinition?: string;
  benchmark?: KPIBenchmark;
  assetTypeBenchmark?: AssetTypeBenchmark;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  trend: 'higher_better' | 'lower_better' | 'target';
  targetValue?: number;
  standardReference?: IndustryStandard;
  category: 'financial' | 'operational' | 'commercial' | 'sustainability' | 'risk';
}

export interface DataFieldRequirement {
  fieldName: string;
  fieldNameEn: string;
  description: string;
  dataType: 'numeric' | 'text' | 'date' | 'boolean' | 'currency' | 'percentage' | 'area' | 'enum';
  required: boolean;
  sources: string[];
  validationRules?: string[];
  exampleValues: string[];
  format?: string;
}

export interface ReportSection {
  id: string;
  title: string;
  titleEn: string;
  shortTitle: string;
  description: string;
  type: 'executive_summary' | 'kpi_dashboard' | 'chart' | 'table' | 'analysis' | 'recommendations' | 'map' | 'comparison' | 'trend';
  chartTypes?: ('bar' | 'line' | 'area' | 'pie' | 'donut' | 'waterfall' | 'scatter' | 'heatmap' | 'gauge' | 'treemap' | 'funnel' | 'radar' | 'sankey')[];
  kpis?: string[];
  columns?: string[];
  insights?: string[];
  aiPowered?: boolean;
  optional?: boolean;
}

export interface ReportConfig {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  shortName: string;
  category: 'asset_management' | 'property_management' | 'leasing' | 'retail_performance' | 'financial' | 'sustainability' | 'investment' | 'project';
  subcategory: string;
  icon: string;
  color: string;
  description: string;
  longDescription: string;
  longDescriptionEn: string;
  industryStandards: IndustryStandard[];
  estimatedPages: { min: number; max: number };
  complexity: 'simple' | 'standard' | 'advanced' | 'expert';
  updateFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'on_demand';
  targetAudience: string[];
  kpis: CatalogueKPIDefinition[];
  dataRequirements: DataFieldRequirement[];
  sections: ReportSection[];
  useCases: string[];
  limitations: string[];
  relatedReports: string[];
  bestPractices: string[];
  tags: string[];
  popular: boolean;
  new: boolean;
  aiPowered: boolean;
  premium: boolean;
}

export interface SectorCategory {
  code: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  description: string;
  reportsCount: number;
}

export interface SectorInfo {
  code: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  color: string;
  standards: IndustryStandard[];
  categories: SectorCategory[];
  totalReports: number;
  totalKPIs: number;
}

// ============================================================================
// INDUSTRY STANDARDS - Standards Internationaux
// ============================================================================

export const INDUSTRY_STANDARDS: Record<string, IndustryStandard> = {
  ICSC: {
    code: 'ICSC',
    name: 'ICSC Standards',
    organization: 'International Council of Shopping Centers',
    description: 'Standards mondiaux pour les centres commerciaux',
    url: 'https://www.icsc.com'
  },
  EPRA: {
    code: 'EPRA',
    name: 'EPRA BPR',
    organization: 'European Public Real Estate Association',
    description: 'Best Practices Recommendations pour le reporting immobilier',
    url: 'https://www.epra.com'
  },
  RICS: {
    code: 'RICS',
    name: 'RICS Red Book',
    organization: 'Royal Institution of Chartered Surveyors',
    description: 'Standards globaux pour l\'évaluation immobilière',
    url: 'https://www.rics.org'
  },
  GRESB: {
    code: 'GRESB',
    name: 'GRESB Standards',
    organization: 'Global Real Estate Sustainability Benchmark',
    description: 'Benchmark ESG pour l\'immobilier',
    url: 'https://www.gresb.com'
  },
  BREEAM: {
    code: 'BREEAM',
    name: 'BREEAM',
    organization: 'Building Research Establishment',
    description: 'Certification environnementale des bâtiments',
    url: 'https://www.breeam.com'
  },
  IFRS16: {
    code: 'IFRS16',
    name: 'IFRS 16 Leases',
    organization: 'IASB',
    description: 'Norme comptable internationale pour les baux',
    url: 'https://www.ifrs.org'
  },
  IPMS: {
    code: 'IPMS',
    name: 'IPMS',
    organization: 'IPMS Coalition',
    description: 'Standards internationaux de mesure des surfaces',
    url: 'https://ipmsc.org'
  },
  CNCC: {
    code: 'CNCC',
    name: 'CNCC Standards',
    organization: 'Conseil National des Centres Commerciaux',
    description: 'Standards français des centres commerciaux',
    url: 'https://www.cncc.com'
  }
};

// ============================================================================
// SECTOR CATEGORIES - Catégories de rapports
// ============================================================================

export const SECTOR_CATEGORIES: SectorCategory[] = [
  {
    code: 'ASSET_MANAGEMENT',
    name: 'Asset Management',
    nameEn: 'Asset Management',
    icon: 'Briefcase',
    color: '#3B82F6',
    description: 'Performance et valorisation des actifs',
    reportsCount: 6
  },
  {
    code: 'PROPERTY_MANAGEMENT',
    name: 'Property Management',
    nameEn: 'Property Management',
    icon: 'Building2',
    color: '#10B981',
    description: 'Gestion opérationnelle des immeubles',
    reportsCount: 5
  },
  {
    code: 'LEASING',
    name: 'Commercialisation',
    nameEn: 'Leasing',
    icon: 'Store',
    color: '#F97316',
    description: 'Location et gestion des baux',
    reportsCount: 5
  },
  {
    code: 'RETAIL_PERFORMANCE',
    name: 'Performance Retail',
    nameEn: 'Retail Performance',
    icon: 'TrendingUp',
    color: '#8B5CF6',
    description: 'CA, fréquentation et enseignes',
    reportsCount: 6
  },
  {
    code: 'FINANCIAL',
    name: 'Financier',
    nameEn: 'Financial',
    icon: 'DollarSign',
    color: '#EC4899',
    description: 'Analyses financières et comptables',
    reportsCount: 5
  },
  {
    code: 'SUSTAINABILITY',
    name: 'RSE & ESG',
    nameEn: 'Sustainability & ESG',
    icon: 'Leaf',
    color: '#22C55E',
    description: 'Développement durable et conformité',
    reportsCount: 4
  },
  {
    code: 'INVESTMENT',
    name: 'Investissement',
    nameEn: 'Investment',
    icon: 'Target',
    color: '#06B6D4',
    description: 'Acquisition, cession et valorisation',
    reportsCount: 4
  },
  {
    code: 'PROJECT',
    name: 'Projet & Travaux',
    nameEn: 'Project & Construction',
    icon: 'HardHat',
    color: '#84CC16',
    description: 'Développement et rénovation',
    reportsCount: 5
  }
];

// ============================================================================
// REPORT 1: PERFORMANCE GLOBALE DE L'ACTIF
// ============================================================================

export const ASSET_PERFORMANCE_REPORT: ReportConfig = {
  id: 'asset-performance',
  code: 'ASSET_PERFORMANCE',
  name: 'Performance Globale de l\'Actif',
  nameEn: 'Asset Performance Report',
  shortName: 'Perf. Actif',
  category: 'asset_management',
  subcategory: 'performance',
  icon: 'TrendingUp',
  color: '#3B82F6',

  description: 'Analyse complète de la performance financière et opérationnelle d\'un centre commercial',

  longDescription: `Le rapport de Performance Globale de l'Actif fournit une vue synthétique et détaillée de tous les indicateurs clés de performance d'un centre commercial.

**Objectifs du rapport :**
- Mesurer la performance financière (NOI, rendement, valorisation)
- Analyser la performance commerciale (CA, fréquentation, occupation)
- Identifier les leviers d'amélioration
- Comparer aux benchmarks du marché

**Métriques EPRA incluses :**
- EPRA Net Initial Yield
- EPRA Topped-up NIY
- EPRA Vacancy Rate
- EPRA Cost Ratio

**Standards appliqués :**
- EPRA Best Practices Recommendations
- ICSC Shopping Center Definitions
- RICS Valuation Standards`,

  longDescriptionEn: `The Asset Performance Report provides a synthetic and detailed view of all key performance indicators for a shopping center.

**Report Objectives:**
- Measure financial performance (NOI, yield, valuation)
- Analyze commercial performance (sales, footfall, occupancy)
- Identify improvement levers
- Compare to market benchmarks`,

  industryStandards: [
    INDUSTRY_STANDARDS.EPRA,
    INDUSTRY_STANDARDS.ICSC,
    INDUSTRY_STANDARDS.RICS
  ],

  estimatedPages: { min: 12, max: 25 },
  complexity: 'standard',
  updateFrequency: 'monthly',

  targetAudience: [
    'Asset Managers',
    'Direction Générale',
    'Investisseurs',
    'Comité d\'investissement',
    'Property Managers'
  ],

  kpis: [
    {
      code: 'NOI',
      name: 'Net Operating Income',
      nameEn: 'Net Operating Income',
      shortName: 'NOI',
      formula: 'Revenus Locatifs - Charges Non Récupérables',
      unit: 'EUR',
      description: 'Revenu net d\'exploitation avant charges financières et amortissements',
      epraDefinition: 'Rental income less property operating expenses',
      benchmark: { excellent: 0, good: 0, acceptable: 0, poor: 0 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'financial',
      standardReference: INDUSTRY_STANDARDS.EPRA
    },
    {
      code: 'NOI_M2',
      name: 'NOI par m²',
      nameEn: 'NOI per sqm',
      shortName: 'NOI/m²',
      formula: 'NOI / Surface GLA',
      unit: 'EUR/m2',
      description: 'NOI ramené au mètre carré de surface locative',
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'financial',
      assetTypeBenchmark: {
        regional: 280,
        superRegional: 320,
        community: 180,
        neighborhood: 120,
        outletCenter: 250,
        retailPark: 100
      }
    },
    {
      code: 'EPRA_NIY',
      name: 'EPRA Net Initial Yield',
      nameEn: 'EPRA Net Initial Yield',
      shortName: 'NIY',
      formula: 'Loyer Net Annualisé / (Valeur Brute + Droits)',
      unit: '%',
      description: 'Rendement initial net selon méthodologie EPRA',
      epraDefinition: 'Annualised rental income based on passing cash rents, less non-recoverable property operating expenses, divided by gross market value',
      benchmark: { excellent: 6, good: 5, acceptable: 4, poor: 3 },
      frequency: 'quarterly',
      trend: 'target',
      targetValue: 5.5,
      category: 'financial',
      standardReference: INDUSTRY_STANDARDS.EPRA
    },
    {
      code: 'EPRA_VACANCY',
      name: 'EPRA Vacancy Rate',
      nameEn: 'EPRA Vacancy Rate',
      shortName: 'Vacance',
      formula: 'ERV Lots Vacants / ERV Total',
      unit: '%',
      description: 'Taux de vacance financière selon EPRA',
      epraDefinition: 'Estimated rental value of vacant space divided by ERV of total portfolio',
      benchmark: { excellent: 3, good: 5, acceptable: 8, poor: 12 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'operational',
      standardReference: INDUSTRY_STANDARDS.EPRA
    },
    {
      code: 'WAULT',
      name: 'WAULT (Weighted Average Unexpired Lease Term)',
      nameEn: 'Weighted Average Unexpired Lease Term',
      shortName: 'WAULT',
      formula: 'Σ(Loyer × Durée Résiduelle) / Σ(Loyer)',
      unit: 'years',
      description: 'Durée moyenne pondérée des baux restant à courir',
      benchmark: { excellent: 5, good: 4, acceptable: 3, poor: 2 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'risk'
    },
    {
      code: 'OCCUPANCY_RATE',
      name: 'Taux d\'Occupation Physique',
      nameEn: 'Physical Occupancy Rate',
      shortName: 'TOP',
      formula: '(Surface Louée / Surface GLA) × 100',
      unit: '%',
      description: 'Pourcentage de surfaces occupées',
      benchmark: { excellent: 98, good: 95, acceptable: 90, poor: 85 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'FOOTFALL',
      name: 'Fréquentation',
      nameEn: 'Footfall',
      shortName: 'Fréq.',
      formula: 'Comptage visiteurs (entrées)',
      unit: 'visitors',
      description: 'Nombre de visiteurs sur la période',
      frequency: 'daily',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'SALES_DENSITY',
      name: 'Densité de CA',
      nameEn: 'Sales Density',
      shortName: 'CA/m²',
      formula: 'CA Total Enseignes / Surface GLA',
      unit: 'EUR/m2',
      description: 'Chiffre d\'affaires par m² de surface locative',
      icscDefinition: 'Tenant sales per square meter of GLA',
      benchmark: { excellent: 6000, good: 4500, acceptable: 3000, poor: 2000 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'commercial',
      standardReference: INDUSTRY_STANDARDS.ICSC
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Surface GLA',
      fieldNameEn: 'Gross Leasable Area',
      description: 'Surface locative brute totale en m²',
      dataType: 'area',
      required: true,
      sources: ['Plans architecte', 'Relevé géomètre'],
      validationRules: ['IPMS-3 Retail'],
      exampleValues: ['45,000 m²', '28,500 m²']
    },
    {
      fieldName: 'Loyers facturés',
      fieldNameEn: 'Billed Rent',
      description: 'Montant des loyers facturés sur la période',
      dataType: 'currency',
      required: true,
      sources: ['Comptabilité', 'Gestion locative'],
      validationRules: ['Mensuel', 'HT'],
      exampleValues: ['1,250,000 EUR', '890,000 EUR']
    },
    {
      fieldName: 'Charges d\'exploitation',
      fieldNameEn: 'Operating Expenses',
      description: 'Charges non récupérables',
      dataType: 'currency',
      required: true,
      sources: ['Comptabilité analytique'],
      exampleValues: ['180,000 EUR', '95,000 EUR']
    },
    {
      fieldName: 'Valeur vénale',
      fieldNameEn: 'Market Value',
      description: 'Dernière valorisation expertisée',
      dataType: 'currency',
      required: true,
      sources: ['Rapport d\'expertise RICS'],
      validationRules: ['< 12 mois'],
      exampleValues: ['185,000,000 EUR']
    },
    {
      fieldName: 'CA enseignes',
      fieldNameEn: 'Tenant Sales',
      description: 'Chiffres d\'affaires déclarés par les enseignes',
      dataType: 'currency',
      required: true,
      sources: ['Déclarations mensuelles', 'Extractions caisses'],
      exampleValues: ['15,800,000 EUR']
    },
    {
      fieldName: 'Comptage visiteurs',
      fieldNameEn: 'Visitor Count',
      description: 'Données de fréquentation',
      dataType: 'numeric',
      required: true,
      sources: ['Compteurs automatiques', 'Mytraffic', 'Eco-Counter'],
      exampleValues: ['850,000 visiteurs/mois']
    }
  ],

  sections: [
    {
      id: 'executive_summary',
      title: 'Résumé Exécutif',
      titleEn: 'Executive Summary',
      shortTitle: 'Résumé',
      description: 'Synthèse des points clés et recommandations',
      type: 'executive_summary',
      kpis: ['NOI', 'EPRA_NIY', 'OCCUPANCY_RATE', 'FOOTFALL'],
      aiPowered: true
    },
    {
      id: 'kpi_dashboard',
      title: 'Tableau de Bord KPIs',
      titleEn: 'KPI Dashboard',
      shortTitle: 'KPIs',
      description: 'Vue synthétique des indicateurs clés',
      type: 'kpi_dashboard',
      chartTypes: ['gauge', 'bar'],
      kpis: ['NOI', 'NOI_M2', 'EPRA_NIY', 'EPRA_VACANCY', 'WAULT', 'OCCUPANCY_RATE', 'FOOTFALL', 'SALES_DENSITY']
    },
    {
      id: 'financial_analysis',
      title: 'Analyse Financière',
      titleEn: 'Financial Analysis',
      shortTitle: 'Finance',
      description: 'Performance financière détaillée',
      type: 'analysis',
      chartTypes: ['waterfall', 'line', 'bar'],
      kpis: ['NOI', 'NOI_M2', 'EPRA_NIY'],
      insights: ['Évolution du NOI', 'Décomposition des revenus', 'Analyse des charges']
    },
    {
      id: 'occupancy_analysis',
      title: 'Analyse de l\'Occupation',
      titleEn: 'Occupancy Analysis',
      shortTitle: 'Occupation',
      description: 'État locatif et vacance',
      type: 'analysis',
      chartTypes: ['pie', 'treemap', 'bar'],
      kpis: ['OCCUPANCY_RATE', 'EPRA_VACANCY', 'WAULT']
    },
    {
      id: 'commercial_performance',
      title: 'Performance Commerciale',
      titleEn: 'Commercial Performance',
      shortTitle: 'Commercial',
      description: 'CA enseignes et fréquentation',
      type: 'analysis',
      chartTypes: ['line', 'bar', 'heatmap'],
      kpis: ['FOOTFALL', 'SALES_DENSITY']
    },
    {
      id: 'benchmark',
      title: 'Benchmark Marché',
      titleEn: 'Market Benchmark',
      shortTitle: 'Benchmark',
      description: 'Comparaison aux standards du marché',
      type: 'comparison',
      chartTypes: ['radar', 'bar']
    },
    {
      id: 'recommendations',
      title: 'Recommandations',
      titleEn: 'Recommendations',
      shortTitle: 'Actions',
      description: 'Plan d\'actions recommandé',
      type: 'recommendations',
      aiPowered: true
    }
  ],

  useCases: [
    'Reporting mensuel aux investisseurs',
    'Comité d\'investissement',
    'Suivi de la performance locative',
    'Préparation des business reviews',
    'Benchmark inter-actifs'
  ],

  limitations: [
    'Nécessite des données de CA enseignes à jour',
    'Valorisation expertisée requise pour les métriques EPRA',
    'Comptage visiteurs dépendant de la fiabilité des capteurs'
  ],

  relatedReports: [
    'NOI_ANALYSIS',
    'TENANT_PERFORMANCE',
    'FOOTFALL_ANALYSIS',
    'LEASE_EXPIRY'
  ],

  bestPractices: [
    'Mettre à jour les données CA mensuellement',
    'Valider les comptages de fréquentation',
    'Réconcilier avec la comptabilité',
    'Comparer aux périodes N-1'
  ],

  tags: ['performance', 'asset management', 'KPIs', 'EPRA', 'monthly'],
  popular: true,
  new: false,
  aiPowered: true,
  premium: false
};

// ============================================================================
// REPORT 2: ANALYSE DU NOI
// ============================================================================

export const NOI_ANALYSIS_REPORT: ReportConfig = {
  id: 'noi-analysis',
  code: 'NOI_ANALYSIS',
  name: 'Analyse du NOI',
  nameEn: 'NOI Analysis',
  shortName: 'NOI',
  category: 'financial',
  subcategory: 'profitability',
  icon: 'DollarSign',
  color: '#EC4899',

  description: 'Analyse détaillée du Net Operating Income et de ses composantes',

  longDescription: `Le rapport d'Analyse du NOI décompose le revenu net d'exploitation pour identifier les leviers de performance et d'optimisation.

**Composantes analysées :**
- Revenus locatifs (loyers minimum garantis, loyers variables)
- Revenus annexes (parkings, terrasses, publicité, revenus divers)
- Charges récupérables et non récupérables
- Provision pour impayés

**Analyses incluses :**
- Waterfall NOI (décomposition)
- Évolution mensuelle et annuelle
- Variance budget vs réel
- Projection à fin d'année`,

  longDescriptionEn: `The NOI Analysis report breaks down net operating income to identify performance and optimization levers.`,

  industryStandards: [
    INDUSTRY_STANDARDS.EPRA,
    INDUSTRY_STANDARDS.IFRS16
  ],

  estimatedPages: { min: 8, max: 15 },
  complexity: 'standard',
  updateFrequency: 'monthly',

  targetAudience: [
    'Asset Managers',
    'Direction Financière',
    'Contrôleurs de gestion',
    'Property Managers'
  ],

  kpis: [
    {
      code: 'NOI',
      name: 'Net Operating Income',
      nameEn: 'Net Operating Income',
      shortName: 'NOI',
      formula: 'Revenus Locatifs - Charges Non Récupérables',
      unit: 'EUR',
      description: 'Revenu net d\'exploitation',
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'financial'
    },
    {
      code: 'NOI_MARGIN',
      name: 'Marge NOI',
      nameEn: 'NOI Margin',
      shortName: 'Marge',
      formula: '(NOI / Revenus Totaux) × 100',
      unit: '%',
      description: 'Ratio de profitabilité opérationnelle',
      benchmark: { excellent: 85, good: 80, acceptable: 75, poor: 70 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'financial'
    },
    {
      code: 'LIKE_FOR_LIKE_NOI',
      name: 'NOI Like-for-Like',
      nameEn: 'Like-for-Like NOI Growth',
      shortName: 'LfL NOI',
      formula: '((NOI N - NOI N-1) / NOI N-1) × 100',
      unit: '%',
      description: 'Croissance du NOI à périmètre constant',
      benchmark: { excellent: 5, good: 3, acceptable: 1, poor: -2 },
      frequency: 'quarterly',
      trend: 'higher_better',
      category: 'financial'
    },
    {
      code: 'COST_RATIO',
      name: 'EPRA Cost Ratio',
      nameEn: 'EPRA Cost Ratio',
      shortName: 'Cost Ratio',
      formula: '(Charges Admin + Charges Opé) / Revenus Locatifs Bruts',
      unit: '%',
      description: 'Ratio de coûts selon EPRA',
      benchmark: { excellent: 15, good: 20, acceptable: 25, poor: 30 },
      frequency: 'quarterly',
      trend: 'lower_better',
      category: 'financial',
      standardReference: INDUSTRY_STANDARDS.EPRA
    },
    {
      code: 'RECOVERY_RATE',
      name: 'Taux de Récupération Charges',
      nameEn: 'Expense Recovery Rate',
      shortName: 'Récup.',
      formula: '(Charges Refacturées / Charges Totales) × 100',
      unit: '%',
      description: 'Part des charges refacturées aux locataires',
      benchmark: { excellent: 95, good: 90, acceptable: 85, poor: 75 },
      frequency: 'quarterly',
      trend: 'higher_better',
      category: 'financial'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Loyers facturés',
      fieldNameEn: 'Billed Rent',
      description: 'Détail des loyers par locataire',
      dataType: 'currency',
      required: true,
      sources: ['Comptabilité', 'Gestion locative'],
      exampleValues: ['12,500,000 EUR/an']
    },
    {
      fieldName: 'Revenus variables',
      fieldNameEn: 'Variable Income',
      description: 'Loyers en % du CA, revenus annexes',
      dataType: 'currency',
      required: true,
      sources: ['Déclarations CA', 'Comptabilité'],
      exampleValues: ['850,000 EUR/an']
    },
    {
      fieldName: 'Charges propriétaire',
      fieldNameEn: 'Landlord Expenses',
      description: 'Charges non récupérables',
      dataType: 'currency',
      required: true,
      sources: ['Comptabilité analytique'],
      exampleValues: ['1,200,000 EUR/an']
    },
    {
      fieldName: 'Budget NOI',
      fieldNameEn: 'NOI Budget',
      description: 'Budget NOI de l\'exercice',
      dataType: 'currency',
      required: false,
      sources: ['Budget prévisionnel'],
      exampleValues: ['11,000,000 EUR']
    }
  ],

  sections: [
    {
      id: 'noi_summary',
      title: 'Synthèse NOI',
      titleEn: 'NOI Summary',
      shortTitle: 'Synthèse',
      description: 'Vue d\'ensemble du NOI et tendances',
      type: 'kpi_dashboard',
      chartTypes: ['gauge', 'line'],
      kpis: ['NOI', 'NOI_MARGIN', 'LIKE_FOR_LIKE_NOI']
    },
    {
      id: 'noi_waterfall',
      title: 'Décomposition du NOI',
      titleEn: 'NOI Breakdown',
      shortTitle: 'Waterfall',
      description: 'Waterfall des composantes du NOI',
      type: 'chart',
      chartTypes: ['waterfall']
    },
    {
      id: 'revenue_analysis',
      title: 'Analyse des Revenus',
      titleEn: 'Revenue Analysis',
      shortTitle: 'Revenus',
      description: 'Détail des revenus locatifs et annexes',
      type: 'analysis',
      chartTypes: ['bar', 'pie']
    },
    {
      id: 'cost_analysis',
      title: 'Analyse des Charges',
      titleEn: 'Cost Analysis',
      shortTitle: 'Charges',
      description: 'Détail des charges par catégorie',
      type: 'analysis',
      chartTypes: ['bar', 'treemap'],
      kpis: ['COST_RATIO', 'RECOVERY_RATE']
    },
    {
      id: 'budget_variance',
      title: 'Écarts Budget',
      titleEn: 'Budget Variance',
      shortTitle: 'Budget',
      description: 'Analyse des écarts vs budget',
      type: 'comparison',
      chartTypes: ['bar', 'line']
    },
    {
      id: 'noi_forecast',
      title: 'Projection NOI',
      titleEn: 'NOI Forecast',
      shortTitle: 'Prévision',
      description: 'Projection à fin d\'exercice',
      type: 'trend',
      chartTypes: ['line', 'area'],
      aiPowered: true
    }
  ],

  useCases: [
    'Reporting financier mensuel',
    'Analyse de rentabilité',
    'Suivi budgétaire',
    'Préparation des closings',
    'Business plan actif'
  ],

  limitations: [
    'Dépend de la qualité de la comptabilité analytique',
    'Les projections sont indicatives'
  ],

  relatedReports: [
    'ASSET_PERFORMANCE',
    'BUDGET_VS_ACTUAL',
    'CASH_FLOW'
  ],

  bestPractices: [
    'Réconcilier mensuellement avec la comptabilité',
    'Documenter les écarts significatifs',
    'Suivre les indicateurs en tendance'
  ],

  tags: ['NOI', 'financial', 'profitability', 'budget'],
  popular: true,
  new: false,
  aiPowered: true,
  premium: false
};

// ============================================================================
// REPORT 3: ÉTAT LOCATIF
// ============================================================================

export const RENT_ROLL_REPORT: ReportConfig = {
  id: 'rent-roll',
  code: 'RENT_ROLL',
  name: 'État Locatif',
  nameEn: 'Rent Roll',
  shortName: 'État Loc.',
  category: 'property_management',
  subcategory: 'leasing',
  icon: 'ClipboardList',
  color: '#10B981',

  description: 'Liste exhaustive des baux et locataires avec détails contractuels',

  longDescription: `L'État Locatif (Rent Roll) est le document de référence qui recense l'ensemble des baux d'un centre commercial.

**Informations par bail :**
- Identité locataire et enseigne
- Surfaces (GLA, terrasse, réserve)
- Conditions financières (loyer minimum, loyer variable, charges)
- Échéances clés (fin de bail, break, indexation)
- Garanties (dépôt, caution bancaire)

**Analyses dérivées :**
- Répartition par activité (Merchandising Mix)
- Concentration des revenus
- Échéancier des baux
- Reversion potentielle`,

  longDescriptionEn: `The Rent Roll is the reference document listing all leases of a shopping center.`,

  industryStandards: [
    INDUSTRY_STANDARDS.ICSC,
    INDUSTRY_STANDARDS.IFRS16
  ],

  estimatedPages: { min: 10, max: 30 },
  complexity: 'simple',
  updateFrequency: 'monthly',

  targetAudience: [
    'Property Managers',
    'Asset Managers',
    'Comptabilité',
    'Juridique',
    'Investisseurs (due diligence)'
  ],

  kpis: [
    {
      code: 'TOTAL_GLA',
      name: 'Surface GLA Totale',
      nameEn: 'Total GLA',
      shortName: 'GLA',
      formula: 'Σ Surfaces locatives',
      unit: 'm2',
      description: 'Surface locative brute totale',
      frequency: 'monthly',
      trend: 'target',
      category: 'operational'
    },
    {
      code: 'OCCUPANCY_RATE',
      name: 'Taux d\'Occupation',
      nameEn: 'Occupancy Rate',
      shortName: 'Occup.',
      formula: '(Surface Louée / GLA) × 100',
      unit: '%',
      description: 'Pourcentage de surfaces occupées',
      benchmark: { excellent: 98, good: 95, acceptable: 90, poor: 85 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'TOTAL_RENT',
      name: 'Loyer Total Annuel',
      nameEn: 'Total Annual Rent',
      shortName: 'Loyer',
      formula: 'Σ Loyers minimum garantis annualisés',
      unit: 'EUR',
      description: 'Montant total des loyers annuels',
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'financial'
    },
    {
      code: 'AVG_RENT_SQM',
      name: 'Loyer Moyen au m²',
      nameEn: 'Average Rent per sqm',
      shortName: 'Loyer/m²',
      formula: 'Loyer Total / Surface Louée',
      unit: 'EUR/m2',
      description: 'Loyer moyen par m² de surface louée',
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'financial'
    },
    {
      code: 'TENANT_COUNT',
      name: 'Nombre de Locataires',
      nameEn: 'Tenant Count',
      shortName: 'Nb Loc.',
      formula: 'Count(Baux actifs)',
      unit: 'number',
      description: 'Nombre de baux en cours',
      frequency: 'monthly',
      trend: 'target',
      category: 'operational'
    },
    {
      code: 'TOP5_CONCENTRATION',
      name: 'Concentration Top 5',
      nameEn: 'Top 5 Concentration',
      shortName: 'Top 5',
      formula: '(Loyer Top 5 / Loyer Total) × 100',
      unit: '%',
      description: 'Part des 5 premiers locataires dans les loyers',
      benchmark: { excellent: 20, good: 30, acceptable: 40, poor: 50 },
      frequency: 'quarterly',
      trend: 'lower_better',
      category: 'risk'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Référence lot',
      fieldNameEn: 'Unit Reference',
      description: 'Identifiant unique du lot',
      dataType: 'text',
      required: true,
      sources: ['Système de gestion'],
      exampleValues: ['A-001', 'B-125', 'FOOD-01']
    },
    {
      fieldName: 'Raison sociale',
      fieldNameEn: 'Company Name',
      description: 'Nom légal du locataire',
      dataType: 'text',
      required: true,
      sources: ['Bail', 'K-bis'],
      exampleValues: ['ZARA FRANCE SAS', 'FNAC DARTY SA']
    },
    {
      fieldName: 'Enseigne',
      fieldNameEn: 'Brand',
      description: 'Nom commercial',
      dataType: 'text',
      required: true,
      sources: ['Bail'],
      exampleValues: ['Zara', 'Fnac', 'Sephora']
    },
    {
      fieldName: 'Activité CNCC',
      fieldNameEn: 'CNCC Activity',
      description: 'Code activité CNCC',
      dataType: 'enum',
      required: true,
      sources: ['Bail', 'Classification CNCC'],
      exampleValues: ['1.1 Mode Femme', '2.3 Restauration Rapide']
    },
    {
      fieldName: 'Surface GLA',
      fieldNameEn: 'GLA',
      description: 'Surface locative brute',
      dataType: 'area',
      required: true,
      sources: ['Bail', 'Relevé géomètre'],
      exampleValues: ['850 m²', '120 m²']
    },
    {
      fieldName: 'Loyer minimum garanti',
      fieldNameEn: 'Minimum Guaranteed Rent',
      description: 'LMG annuel HT',
      dataType: 'currency',
      required: true,
      sources: ['Bail'],
      exampleValues: ['250,000 EUR/an', '48,000 EUR/an']
    },
    {
      fieldName: 'Date fin bail',
      fieldNameEn: 'Lease End Date',
      description: 'Date d\'échéance du bail',
      dataType: 'date',
      required: true,
      sources: ['Bail'],
      format: 'DD/MM/YYYY',
      exampleValues: ['31/12/2028', '30/06/2026']
    },
    {
      fieldName: 'Date break',
      fieldNameEn: 'Break Date',
      description: 'Prochaine date de sortie possible',
      dataType: 'date',
      required: false,
      sources: ['Bail'],
      exampleValues: ['31/12/2025']
    }
  ],

  sections: [
    {
      id: 'summary',
      title: 'Synthèse État Locatif',
      titleEn: 'Rent Roll Summary',
      shortTitle: 'Synthèse',
      description: 'Chiffres clés de l\'état locatif',
      type: 'kpi_dashboard',
      chartTypes: ['gauge'],
      kpis: ['TOTAL_GLA', 'OCCUPANCY_RATE', 'TOTAL_RENT', 'TENANT_COUNT']
    },
    {
      id: 'tenant_list',
      title: 'Liste des Locataires',
      titleEn: 'Tenant List',
      shortTitle: 'Locataires',
      description: 'Tableau détaillé des baux',
      type: 'table',
      columns: ['Lot', 'Enseigne', 'Activité', 'Surface', 'Loyer', 'Fin Bail']
    },
    {
      id: 'vacancy',
      title: 'Lots Vacants',
      titleEn: 'Vacant Units',
      shortTitle: 'Vacance',
      description: 'Liste des lots disponibles',
      type: 'table',
      columns: ['Lot', 'Surface', 'ERV', 'Durée vacance']
    },
    {
      id: 'activity_mix',
      title: 'Mix Activités',
      titleEn: 'Activity Mix',
      shortTitle: 'Mix',
      description: 'Répartition par type d\'activité',
      type: 'chart',
      chartTypes: ['treemap', 'pie']
    },
    {
      id: 'concentration',
      title: 'Analyse Concentration',
      titleEn: 'Concentration Analysis',
      shortTitle: 'Concentration',
      description: 'Risque de concentration locataires',
      type: 'analysis',
      chartTypes: ['bar'],
      kpis: ['TOP5_CONCENTRATION']
    },
    {
      id: 'rent_analysis',
      title: 'Analyse des Loyers',
      titleEn: 'Rent Analysis',
      shortTitle: 'Loyers',
      description: 'Distribution et moyennes des loyers',
      type: 'analysis',
      chartTypes: ['bar', 'scatter'],
      kpis: ['AVG_RENT_SQM']
    }
  ],

  useCases: [
    'Due diligence acquisition',
    'Reporting investisseurs',
    'Gestion courante',
    'Préparation budget',
    'Analyse de portefeuille'
  ],

  limitations: [
    'Les données doivent être réconciliées avec les baux originaux',
    'Les loyers variables ne sont pas inclus dans le LMG'
  ],

  relatedReports: [
    'LEASE_EXPIRY',
    'TENANT_PERFORMANCE',
    'MERCHANDISING_MIX',
    'VACANCY_ANALYSIS'
  ],

  bestPractices: [
    'Mettre à jour à chaque mouvement locatif',
    'Vérifier la cohérence des surfaces',
    'Documenter les conditions particulières'
  ],

  tags: ['rent roll', 'leasing', 'tenants', 'property management'],
  popular: true,
  new: false,
  aiPowered: false,
  premium: false
};

// ============================================================================
// REPORT 4: ÉCHÉANCIER DES BAUX
// ============================================================================

export const LEASE_EXPIRY_REPORT: ReportConfig = {
  id: 'lease-expiry',
  code: 'LEASE_EXPIRY',
  name: 'Échéancier des Baux',
  nameEn: 'Lease Expiry Schedule',
  shortName: 'Échéances',
  category: 'leasing',
  subcategory: 'risk_management',
  icon: 'Calendar',
  color: '#F97316',

  description: 'Analyse des échéances de baux et risque de vacance future',

  longDescription: `L'Échéancier des Baux analyse les dates clés des contrats de location pour anticiper les risques et opportunités.

**Dates analysées :**
- Fins de bail (expiries)
- Options de sortie (breaks)
- Prochaines indexations
- Dates de renouvellement

**Indicateurs de risque :**
- WAULT / WALB
- Concentration des échéances
- Exposition par année
- Potentiel de réversion

**Actions recommandées :**
- Priorisation des renégociations
- Anticipation des départs
- Stratégie de relet`,

  longDescriptionEn: `The Lease Expiry Schedule analyzes key contract dates to anticipate risks and opportunities.`,

  industryStandards: [
    INDUSTRY_STANDARDS.EPRA,
    INDUSTRY_STANDARDS.IFRS16
  ],

  estimatedPages: { min: 6, max: 12 },
  complexity: 'simple',
  updateFrequency: 'monthly',

  targetAudience: [
    'Leasing Managers',
    'Asset Managers',
    'Property Managers',
    'Direction Générale'
  ],

  kpis: [
    {
      code: 'WAULT',
      name: 'WAULT',
      nameEn: 'Weighted Average Unexpired Lease Term',
      shortName: 'WAULT',
      formula: 'Σ(Loyer × Durée Résiduelle) / Σ(Loyer)',
      unit: 'years',
      description: 'Durée moyenne pondérée jusqu\'à fin de bail',
      benchmark: { excellent: 5, good: 4, acceptable: 3, poor: 2 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'risk'
    },
    {
      code: 'WALB',
      name: 'WALB',
      nameEn: 'Weighted Average Lease to Break',
      shortName: 'WALB',
      formula: 'Σ(Loyer × Durée jusqu\'au Break) / Σ(Loyer)',
      unit: 'years',
      description: 'Durée moyenne pondérée jusqu\'à première sortie possible',
      benchmark: { excellent: 3, good: 2.5, acceptable: 2, poor: 1.5 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'risk'
    },
    {
      code: 'EXPIRY_Y1',
      name: 'Échéances Année 1',
      nameEn: 'Year 1 Expiries',
      shortName: 'Y1',
      formula: 'Loyers des baux expirant dans 12 mois / Loyer Total',
      unit: '%',
      description: 'Part des loyers expirant dans l\'année',
      benchmark: { excellent: 10, good: 15, acceptable: 20, poor: 30 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'risk'
    },
    {
      code: 'BREAK_Y1',
      name: 'Breaks Année 1',
      nameEn: 'Year 1 Breaks',
      shortName: 'Breaks Y1',
      formula: 'Loyers des baux avec break dans 12 mois / Loyer Total',
      unit: '%',
      description: 'Part des loyers avec option de sortie dans l\'année',
      benchmark: { excellent: 5, good: 10, acceptable: 15, poor: 25 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'risk'
    },
    {
      code: 'REVERSION_POTENTIAL',
      name: 'Potentiel de Réversion',
      nameEn: 'Reversion Potential',
      shortName: 'Réversion',
      formula: '((ERV - Loyer Actuel) / Loyer Actuel) × 100',
      unit: '%',
      description: 'Potentiel d\'augmentation des loyers au renouvellement',
      benchmark: { excellent: 15, good: 10, acceptable: 5, poor: 0 },
      frequency: 'annually',
      trend: 'higher_better',
      category: 'commercial'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Date fin bail',
      fieldNameEn: 'Lease End Date',
      description: 'Date d\'expiration du bail',
      dataType: 'date',
      required: true,
      sources: ['Bail'],
      exampleValues: ['31/12/2027']
    },
    {
      fieldName: 'Date break',
      fieldNameEn: 'Break Option Date',
      description: 'Prochaine date d\'option de sortie',
      dataType: 'date',
      required: false,
      sources: ['Bail'],
      exampleValues: ['30/06/2025']
    },
    {
      fieldName: 'Loyer annuel',
      fieldNameEn: 'Annual Rent',
      description: 'Loyer annuel pour pondération',
      dataType: 'currency',
      required: true,
      sources: ['État locatif'],
      exampleValues: ['120,000 EUR']
    },
    {
      fieldName: 'ERV',
      fieldNameEn: 'Estimated Rental Value',
      description: 'Valeur locative de marché estimée',
      dataType: 'currency',
      required: false,
      sources: ['Expertise', 'Benchmark marché'],
      exampleValues: ['135,000 EUR']
    }
  ],

  sections: [
    {
      id: 'wault_summary',
      title: 'Synthèse WAULT/WALB',
      titleEn: 'WAULT/WALB Summary',
      shortTitle: 'WAULT',
      description: 'Indicateurs de durée résiduelle',
      type: 'kpi_dashboard',
      chartTypes: ['gauge'],
      kpis: ['WAULT', 'WALB']
    },
    {
      id: 'expiry_schedule',
      title: 'Calendrier des Échéances',
      titleEn: 'Expiry Schedule',
      shortTitle: 'Calendrier',
      description: 'Vue chronologique des échéances',
      type: 'chart',
      chartTypes: ['bar', 'line']
    },
    {
      id: 'expiry_table',
      title: 'Détail par Locataire',
      titleEn: 'Tenant Detail',
      shortTitle: 'Détail',
      description: 'Liste des échéances par locataire',
      type: 'table',
      columns: ['Enseigne', 'Loyer', 'Fin Bail', 'Break', 'Durée Restante']
    },
    {
      id: 'risk_analysis',
      title: 'Analyse des Risques',
      titleEn: 'Risk Analysis',
      shortTitle: 'Risques',
      description: 'Concentration et exposition',
      type: 'analysis',
      chartTypes: ['bar', 'heatmap'],
      kpis: ['EXPIRY_Y1', 'BREAK_Y1']
    },
    {
      id: 'reversion_analysis',
      title: 'Analyse de Réversion',
      titleEn: 'Reversion Analysis',
      shortTitle: 'Réversion',
      description: 'Potentiel d\'augmentation des loyers',
      type: 'analysis',
      chartTypes: ['scatter', 'bar'],
      kpis: ['REVERSION_POTENTIAL']
    },
    {
      id: 'action_plan',
      title: 'Plan d\'Actions',
      titleEn: 'Action Plan',
      shortTitle: 'Actions',
      description: 'Priorisation des renégociations',
      type: 'recommendations',
      aiPowered: true
    }
  ],

  useCases: [
    'Gestion du risque locatif',
    'Planification des renégociations',
    'Reporting investisseurs',
    'Due diligence',
    'Business plan'
  ],

  limitations: [
    'Les options de break dépendent des décisions des locataires',
    'Les ERV sont des estimations'
  ],

  relatedReports: [
    'RENT_ROLL',
    'VACANCY_ANALYSIS',
    'TENANT_PERFORMANCE'
  ],

  bestPractices: [
    'Anticiper les échéances 18-24 mois à l\'avance',
    'Mettre à jour les ERV annuellement',
    'Suivre les signaux de départ des enseignes'
  ],

  tags: ['leasing', 'risk', 'WAULT', 'expiries'],
  popular: true,
  new: false,
  aiPowered: true,
  premium: false
};

// ============================================================================
// REPORT 5: PERFORMANCE DES ENSEIGNES
// ============================================================================

export const TENANT_PERFORMANCE_REPORT: ReportConfig = {
  id: 'tenant-performance',
  code: 'TENANT_PERFORMANCE',
  name: 'Performance des Enseignes',
  nameEn: 'Tenant Performance',
  shortName: 'Perf. Enseignes',
  category: 'retail_performance',
  subcategory: 'tenant_analysis',
  icon: 'Store',
  color: '#8B5CF6',

  description: 'Analyse détaillée des performances commerciales des enseignes',

  longDescription: `Le rapport de Performance des Enseignes analyse les chiffres d'affaires et indicateurs clés de chaque locataire.

**Indicateurs analysés :**
- Chiffre d'affaires mensuel et cumulé
- Évolution vs N-1 (like-for-like)
- Densité de CA (€/m²)
- Taux d'effort (loyer/CA)
- Panier moyen et taux de conversion

**Classifications :**
- Top performers
- Enseignes à surveiller
- Enseignes en difficulté

**Benchmarks ICSC :**
- Par catégorie d'activité
- Par format de centre
- Par zone géographique`,

  longDescriptionEn: `The Tenant Performance report analyzes sales and key indicators for each tenant.`,

  industryStandards: [
    INDUSTRY_STANDARDS.ICSC,
    INDUSTRY_STANDARDS.CNCC
  ],

  estimatedPages: { min: 10, max: 25 },
  complexity: 'standard',
  updateFrequency: 'monthly',

  targetAudience: [
    'Directeur de Centre',
    'Leasing Managers',
    'Asset Managers',
    'Marketing'
  ],

  kpis: [
    {
      code: 'TOTAL_SALES',
      name: 'CA Total Centre',
      nameEn: 'Total Center Sales',
      shortName: 'CA Total',
      formula: 'Σ CA Enseignes',
      unit: 'EUR',
      description: 'Chiffre d\'affaires total déclaré',
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'commercial'
    },
    {
      code: 'SALES_LFL',
      name: 'Évolution CA LfL',
      nameEn: 'Like-for-Like Sales Growth',
      shortName: 'LfL',
      formula: '((CA N - CA N-1) / CA N-1) × 100',
      unit: '%',
      description: 'Croissance du CA à périmètre constant',
      benchmark: { excellent: 5, good: 2, acceptable: 0, poor: -3 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'commercial'
    },
    {
      code: 'SALES_DENSITY',
      name: 'Densité CA',
      nameEn: 'Sales Density',
      shortName: 'CA/m²',
      formula: 'CA / Surface GLA',
      unit: 'EUR/m2',
      description: 'CA par m² de surface locative',
      benchmark: { excellent: 6000, good: 4500, acceptable: 3000, poor: 2000 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'commercial',
      standardReference: INDUSTRY_STANDARDS.ICSC
    },
    {
      code: 'OCCUPANCY_COST_RATIO',
      name: 'Taux d\'Effort',
      nameEn: 'Occupancy Cost Ratio',
      shortName: 'Taux Effort',
      formula: '(Loyer + Charges) / CA × 100',
      unit: '%',
      description: 'Part du CA consacrée au loyer et charges',
      benchmark: { excellent: 8, good: 12, acceptable: 15, poor: 20 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'risk',
      icscDefinition: 'Total occupancy cost as percentage of tenant sales'
    },
    {
      code: 'BASKET_SIZE',
      name: 'Panier Moyen',
      nameEn: 'Average Basket Size',
      shortName: 'Panier',
      formula: 'CA / Nombre de Transactions',
      unit: 'EUR',
      description: 'Montant moyen par transaction',
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'commercial'
    },
    {
      code: 'CONVERSION_RATE',
      name: 'Taux de Conversion',
      nameEn: 'Conversion Rate',
      shortName: 'Conversion',
      formula: '(Transactions / Visiteurs Boutique) × 100',
      unit: '%',
      description: 'Part des visiteurs effectuant un achat',
      benchmark: { excellent: 25, good: 20, acceptable: 15, poor: 10 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'commercial'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'CA mensuel',
      fieldNameEn: 'Monthly Sales',
      description: 'Chiffre d\'affaires déclaré par l\'enseigne',
      dataType: 'currency',
      required: true,
      sources: ['Déclaration locataire', 'Extraction caisse'],
      exampleValues: ['185,000 EUR', '52,000 EUR']
    },
    {
      fieldName: 'CA N-1',
      fieldNameEn: 'Prior Year Sales',
      description: 'CA de la période comparable N-1',
      dataType: 'currency',
      required: true,
      sources: ['Historique'],
      exampleValues: ['175,000 EUR']
    },
    {
      fieldName: 'Nombre de transactions',
      fieldNameEn: 'Transaction Count',
      description: 'Nombre de tickets de caisse',
      dataType: 'numeric',
      required: false,
      sources: ['Extraction caisse'],
      exampleValues: ['3,500', '1,200']
    },
    {
      fieldName: 'Surface GLA',
      fieldNameEn: 'GLA',
      description: 'Surface locative',
      dataType: 'area',
      required: true,
      sources: ['État locatif'],
      exampleValues: ['450 m²']
    },
    {
      fieldName: 'Loyer + Charges',
      fieldNameEn: 'Occupancy Cost',
      description: 'Coût d\'occupation mensuel',
      dataType: 'currency',
      required: true,
      sources: ['Comptabilité'],
      exampleValues: ['18,500 EUR']
    }
  ],

  sections: [
    {
      id: 'sales_summary',
      title: 'Synthèse CA Centre',
      titleEn: 'Center Sales Summary',
      shortTitle: 'Synthèse',
      description: 'Performance globale du centre',
      type: 'kpi_dashboard',
      chartTypes: ['gauge', 'line'],
      kpis: ['TOTAL_SALES', 'SALES_LFL', 'SALES_DENSITY']
    },
    {
      id: 'tenant_ranking',
      title: 'Classement Enseignes',
      titleEn: 'Tenant Ranking',
      shortTitle: 'Ranking',
      description: 'Top et bottom performers',
      type: 'table',
      columns: ['Rang', 'Enseigne', 'CA', 'Évolution', 'CA/m²', 'Taux Effort']
    },
    {
      id: 'activity_analysis',
      title: 'Performance par Activité',
      titleEn: 'Performance by Activity',
      shortTitle: 'Activités',
      description: 'CA et évolution par secteur d\'activité',
      type: 'analysis',
      chartTypes: ['bar', 'treemap']
    },
    {
      id: 'effort_rate_analysis',
      title: 'Analyse Taux d\'Effort',
      titleEn: 'Occupancy Cost Analysis',
      shortTitle: 'Taux Effort',
      description: 'Distribution et enseignes à risque',
      type: 'analysis',
      chartTypes: ['scatter', 'bar'],
      kpis: ['OCCUPANCY_COST_RATIO']
    },
    {
      id: 'lfl_analysis',
      title: 'Évolution Like-for-Like',
      titleEn: 'Like-for-Like Analysis',
      shortTitle: 'LfL',
      description: 'Tendances à périmètre constant',
      type: 'trend',
      chartTypes: ['line', 'bar'],
      kpis: ['SALES_LFL']
    },
    {
      id: 'alerts',
      title: 'Enseignes à Surveiller',
      titleEn: 'Tenants to Watch',
      shortTitle: 'Alertes',
      description: 'Signaux d\'alerte et actions',
      type: 'recommendations',
      aiPowered: true
    }
  ],

  useCases: [
    'Suivi mensuel de la performance',
    'Identification des enseignes à risque',
    'Négociation des renouvellements',
    'Stratégie de merchandising',
    'Reporting investisseurs'
  ],

  limitations: [
    'Dépend de la qualité des déclarations CA',
    'Certaines enseignes ne déclarent pas ou avec retard',
    'Les données de transactions ne sont pas toujours disponibles'
  ],

  relatedReports: [
    'RENT_ROLL',
    'FOOTFALL_ANALYSIS',
    'MERCHANDISING_MIX',
    'LEASE_EXPIRY'
  ],

  bestPractices: [
    'Relancer les déclarations CA en retard',
    'Croiser avec les données de fréquentation',
    'Analyser les tendances sur 12 mois glissants'
  ],

  tags: ['sales', 'tenant', 'performance', 'retail'],
  popular: true,
  new: false,
  aiPowered: true,
  premium: false
};

// ============================================================================
// REPORT 6: ANALYSE DE LA FRÉQUENTATION
// ============================================================================

export const FOOTFALL_ANALYSIS_REPORT: ReportConfig = {
  id: 'footfall-analysis',
  code: 'FOOTFALL_ANALYSIS',
  name: 'Analyse de la Fréquentation',
  nameEn: 'Footfall Analysis',
  shortName: 'Fréquentation',
  category: 'retail_performance',
  subcategory: 'traffic_analysis',
  icon: 'Users',
  color: '#8B5CF6',

  description: 'Analyse approfondie des flux visiteurs et tendances de fréquentation',

  longDescription: `L'Analyse de la Fréquentation étudie les flux de visiteurs pour optimiser la performance commerciale.

**Dimensions d'analyse :**
- Évolution quotidienne, hebdomadaire, mensuelle
- Répartition par entrée et par zone
- Pics de fréquentation (horaires, jours)
- Impact des événements et météo
- Comparaison aux indices marché (CNCC, Mytraffic)

**Indicateurs clés :**
- Fréquentation totale et évolution
- Taux de pénétration zone de chalandise
- CA par visiteur
- Temps de présence moyen`,

  longDescriptionEn: `Footfall Analysis studies visitor flows to optimize commercial performance.`,

  industryStandards: [
    INDUSTRY_STANDARDS.CNCC,
    INDUSTRY_STANDARDS.ICSC
  ],

  estimatedPages: { min: 8, max: 18 },
  complexity: 'standard',
  updateFrequency: 'weekly',

  targetAudience: [
    'Directeur de Centre',
    'Marketing',
    'Asset Managers',
    'Enseignes partenaires'
  ],

  kpis: [
    {
      code: 'TOTAL_FOOTFALL',
      name: 'Fréquentation Totale',
      nameEn: 'Total Footfall',
      shortName: 'Visiteurs',
      formula: 'Σ Comptages entrées',
      unit: 'visitors',
      description: 'Nombre total de visiteurs sur la période',
      frequency: 'daily',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'FOOTFALL_LFL',
      name: 'Évolution Fréquentation LfL',
      nameEn: 'Like-for-Like Footfall Growth',
      shortName: 'LfL Fréq.',
      formula: '((Fréq N - Fréq N-1) / Fréq N-1) × 100',
      unit: '%',
      description: 'Évolution de la fréquentation vs N-1',
      benchmark: { excellent: 3, good: 1, acceptable: -1, poor: -5 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'AVG_DAILY_FOOTFALL',
      name: 'Fréquentation Jour Moyen',
      nameEn: 'Average Daily Footfall',
      shortName: 'Fréq. Jour',
      formula: 'Fréquentation Mois / Nombre Jours Ouverture',
      unit: 'visitors',
      description: 'Moyenne journalière de visiteurs',
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'SALES_PER_VISITOR',
      name: 'CA par Visiteur',
      nameEn: 'Sales per Visitor',
      shortName: 'CA/Visiteur',
      formula: 'CA Total / Fréquentation',
      unit: 'EUR',
      description: 'Dépense moyenne par visiteur',
      benchmark: { excellent: 35, good: 25, acceptable: 18, poor: 12 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'commercial'
    },
    {
      code: 'CATCHMENT_PENETRATION',
      name: 'Taux de Pénétration',
      nameEn: 'Catchment Penetration Rate',
      shortName: 'Pénétration',
      formula: '(Visiteurs Uniques / Population Zone) × 100',
      unit: '%',
      description: 'Part de la population de la zone visitant le centre',
      frequency: 'quarterly',
      trend: 'higher_better',
      category: 'commercial'
    },
    {
      code: 'DWELL_TIME',
      name: 'Temps de Présence',
      nameEn: 'Dwell Time',
      shortName: 'Durée',
      formula: 'Temps moyen passé dans le centre',
      unit: 'minutes',
      description: 'Durée moyenne de visite',
      benchmark: { excellent: 90, good: 70, acceptable: 50, poor: 30 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'commercial'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Comptage entrées',
      fieldNameEn: 'Entry Count',
      description: 'Données des compteurs par entrée',
      dataType: 'numeric',
      required: true,
      sources: ['Compteurs automatiques', 'Mytraffic', 'Eco-Counter'],
      exampleValues: ['25,000/jour', '750,000/mois']
    },
    {
      fieldName: 'Date/Heure',
      fieldNameEn: 'Date/Time',
      description: 'Timestamp des comptages',
      dataType: 'date',
      required: true,
      sources: ['Système de comptage'],
      format: 'YYYY-MM-DD HH:MM',
      exampleValues: ['2024-01-15 14:30']
    },
    {
      fieldName: 'CA Total',
      fieldNameEn: 'Total Sales',
      description: 'CA pour calcul dépense/visiteur',
      dataType: 'currency',
      required: true,
      sources: ['Déclarations enseignes'],
      exampleValues: ['18,500,000 EUR/mois']
    },
    {
      fieldName: 'Population zone',
      fieldNameEn: 'Catchment Population',
      description: 'Population de la zone de chalandise',
      dataType: 'numeric',
      required: false,
      sources: ['INSEE', 'Études géomarketing'],
      exampleValues: ['450,000 habitants']
    },
    {
      fieldName: 'Données météo',
      fieldNameEn: 'Weather Data',
      description: 'Conditions météorologiques',
      dataType: 'text',
      required: false,
      sources: ['API météo'],
      exampleValues: ['Ensoleillé 22°C', 'Pluie 12°C']
    }
  ],

  sections: [
    {
      id: 'footfall_summary',
      title: 'Synthèse Fréquentation',
      titleEn: 'Footfall Summary',
      shortTitle: 'Synthèse',
      description: 'KPIs clés de fréquentation',
      type: 'kpi_dashboard',
      chartTypes: ['gauge', 'line'],
      kpis: ['TOTAL_FOOTFALL', 'FOOTFALL_LFL', 'AVG_DAILY_FOOTFALL']
    },
    {
      id: 'trend_analysis',
      title: 'Tendances',
      titleEn: 'Trends',
      shortTitle: 'Tendances',
      description: 'Évolution de la fréquentation',
      type: 'trend',
      chartTypes: ['line', 'area']
    },
    {
      id: 'weekly_pattern',
      title: 'Profil Hebdomadaire',
      titleEn: 'Weekly Pattern',
      shortTitle: 'Semaine',
      description: 'Répartition par jour de la semaine',
      type: 'chart',
      chartTypes: ['bar', 'heatmap']
    },
    {
      id: 'hourly_pattern',
      title: 'Profil Horaire',
      titleEn: 'Hourly Pattern',
      shortTitle: 'Heures',
      description: 'Répartition par heure',
      type: 'chart',
      chartTypes: ['line', 'heatmap']
    },
    {
      id: 'entry_analysis',
      title: 'Analyse par Entrée',
      titleEn: 'Entry Analysis',
      shortTitle: 'Entrées',
      description: 'Répartition par point d\'entrée',
      type: 'analysis',
      chartTypes: ['pie', 'bar']
    },
    {
      id: 'conversion_analysis',
      title: 'Analyse de Conversion',
      titleEn: 'Conversion Analysis',
      shortTitle: 'Conversion',
      description: 'Transformation visiteurs en acheteurs',
      type: 'analysis',
      chartTypes: ['funnel', 'bar'],
      kpis: ['SALES_PER_VISITOR']
    },
    {
      id: 'benchmark',
      title: 'Benchmark Marché',
      titleEn: 'Market Benchmark',
      shortTitle: 'Benchmark',
      description: 'Comparaison aux indices sectoriels',
      type: 'comparison',
      chartTypes: ['line', 'bar']
    }
  ],

  useCases: [
    'Optimisation des horaires d\'ouverture',
    'Planification des événements',
    'Négociation avec les enseignes',
    'Reporting marketing',
    'Étude d\'impact travaux'
  ],

  limitations: [
    'Précision des compteurs (marge d\'erreur 3-5%)',
    'Distinction entrées/sorties',
    'Comptage des passages multiples'
  ],

  relatedReports: [
    'TENANT_PERFORMANCE',
    'MARKETING_ROI',
    'EVENT_ANALYSIS'
  ],

  bestPractices: [
    'Calibrer régulièrement les compteurs',
    'Corréler avec les données CA',
    'Analyser l\'impact météo'
  ],

  tags: ['footfall', 'traffic', 'visitors', 'retail'],
  popular: true,
  new: false,
  aiPowered: true,
  premium: false
};

// ============================================================================
// EXPORTS - Tous les rapports du secteur
// ============================================================================

export const COMMERCIAL_REAL_ESTATE_REPORTS: Record<string, ReportConfig> = {
  ASSET_PERFORMANCE: ASSET_PERFORMANCE_REPORT,
  NOI_ANALYSIS: NOI_ANALYSIS_REPORT,
  RENT_ROLL: RENT_ROLL_REPORT,
  LEASE_EXPIRY: LEASE_EXPIRY_REPORT,
  TENANT_PERFORMANCE: TENANT_PERFORMANCE_REPORT,
  FOOTFALL_ANALYSIS: FOOTFALL_ANALYSIS_REPORT,
};

// ============================================================================
// SECTOR INFO - Informations du secteur
// ============================================================================

export const COMMERCIAL_REAL_ESTATE_SECTOR_INFO: SectorInfo = {
  code: 'COMMERCIAL_REAL_ESTATE',
  name: 'Immobilier Commercial',
  nameEn: 'Commercial Real Estate',
  description: 'Centres commerciaux, retail parks et actifs de commerce',
  icon: 'Store',
  color: '#3B82F6',
  standards: [
    INDUSTRY_STANDARDS.ICSC,
    INDUSTRY_STANDARDS.EPRA,
    INDUSTRY_STANDARDS.RICS,
    INDUSTRY_STANDARDS.CNCC,
    INDUSTRY_STANDARDS.GRESB,
    INDUSTRY_STANDARDS.BREEAM
  ],
  categories: SECTOR_CATEGORIES,
  totalReports: Object.keys(COMMERCIAL_REAL_ESTATE_REPORTS).length,
  totalKPIs: Object.values(COMMERCIAL_REAL_ESTATE_REPORTS).reduce(
    (sum, report) => sum + report.kpis.length,
    0
  )
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getReportByCode(code: string): ReportConfig | undefined {
  return COMMERCIAL_REAL_ESTATE_REPORTS[code];
}

export function getReportsByCategory(category: string): ReportConfig[] {
  return Object.values(COMMERCIAL_REAL_ESTATE_REPORTS).filter(
    report => report.category === category
  );
}

export function getPopularReports(): ReportConfig[] {
  return Object.values(COMMERCIAL_REAL_ESTATE_REPORTS).filter(
    report => report.popular
  );
}

export function getAIPoweredReports(): ReportConfig[] {
  return Object.values(COMMERCIAL_REAL_ESTATE_REPORTS).filter(
    report => report.aiPowered
  );
}

export function getAllKPIs(): CatalogueKPIDefinition[] {
  const kpis: CatalogueKPIDefinition[] = [];
  const seenCodes = new Set<string>();

  Object.values(COMMERCIAL_REAL_ESTATE_REPORTS).forEach(report => {
    report.kpis.forEach(kpi => {
      if (!seenCodes.has(kpi.code)) {
        kpis.push(kpi);
        seenCodes.add(kpi.code);
      }
    });
  });

  return kpis;
}
