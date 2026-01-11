/**
 * Commercial Real Estate Sector - Part 2
 * Additional Report Configurations
 */

import type { ReportConfig, CatalogueKPIDefinition } from './commercialRealEstateDetails';
import { INDUSTRY_STANDARDS } from './commercialRealEstateDetails';

// ============================================================================
// REPORT 7: ANALYSE DE LA VACANCE
// ============================================================================

export const VACANCY_ANALYSIS_REPORT: ReportConfig = {
  id: 'vacancy-analysis',
  code: 'VACANCY_ANALYSIS',
  name: 'Analyse de la Vacance',
  nameEn: 'Vacancy Analysis',
  shortName: 'Vacance',
  category: 'leasing',
  subcategory: 'vacancy',
  icon: 'Building',
  color: '#F97316',

  description: 'Analyse détaillée de la vacance et stratégie de relocation',

  longDescription: `L'Analyse de la Vacance identifie les lots vacants et propose des stratégies de commercialisation.

**Dimensions d'analyse :**
- Vacance physique vs financière
- Durée de vacance par lot
- Causes de la vacance
- Potentiel de revalorisation
- Pipeline de commercialisation

**Indicateurs EPRA :**
- EPRA Vacancy Rate
- ERV vacante
- Manque à gagner`,

  longDescriptionEn: `Vacancy Analysis identifies vacant units and proposes reletting strategies.`,

  industryStandards: [
    INDUSTRY_STANDARDS.EPRA,
    INDUSTRY_STANDARDS.ICSC
  ],

  estimatedPages: { min: 6, max: 12 },
  complexity: 'simple',
  updateFrequency: 'monthly',

  targetAudience: [
    'Leasing Managers',
    'Asset Managers',
    'Property Managers'
  ],

  kpis: [
    {
      code: 'PHYSICAL_VACANCY',
      name: 'Vacance Physique',
      nameEn: 'Physical Vacancy Rate',
      shortName: 'Vac. Phys.',
      formula: '(Surface Vacante / Surface GLA) × 100',
      unit: '%',
      description: 'Pourcentage de surfaces non occupées',
      benchmark: { excellent: 3, good: 5, acceptable: 8, poor: 12 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'operational'
    },
    {
      code: 'EPRA_VACANCY',
      name: 'EPRA Vacancy Rate',
      nameEn: 'EPRA Vacancy Rate',
      shortName: 'Vac. EPRA',
      formula: '(ERV Vacante / ERV Totale) × 100',
      unit: '%',
      description: 'Vacance financière selon EPRA',
      benchmark: { excellent: 3, good: 5, acceptable: 8, poor: 12 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'financial',
      standardReference: INDUSTRY_STANDARDS.EPRA
    },
    {
      code: 'VACANCY_COST',
      name: 'Manque à Gagner',
      nameEn: 'Vacancy Cost',
      shortName: 'MAG',
      formula: 'ERV Lots Vacants × Durée Vacance',
      unit: 'EUR',
      description: 'Coût de la vacance en loyers perdus',
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'financial'
    },
    {
      code: 'AVG_VACANCY_DURATION',
      name: 'Durée Moyenne de Vacance',
      nameEn: 'Average Vacancy Duration',
      shortName: 'Durée Vac.',
      formula: 'Moyenne(Jours depuis départ locataire)',
      unit: 'days',
      description: 'Nombre moyen de jours de vacance',
      benchmark: { excellent: 60, good: 90, acceptable: 180, poor: 365 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'operational'
    },
    {
      code: 'RELET_RATE',
      name: 'Taux de Relocation',
      nameEn: 'Reletting Rate',
      shortName: 'Reloc.',
      formula: '(Lots Reloués / Lots Libérés) × 100',
      unit: '%',
      description: 'Pourcentage des lots libérés qui ont été reloués',
      benchmark: { excellent: 90, good: 80, acceptable: 70, poor: 50 },
      frequency: 'quarterly',
      trend: 'higher_better',
      category: 'commercial'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Lots vacants',
      fieldNameEn: 'Vacant Units',
      description: 'Liste des lots non occupés',
      dataType: 'text',
      required: true,
      sources: ['État locatif'],
      exampleValues: ['A-012', 'B-025']
    },
    {
      fieldName: 'Surface vacante',
      fieldNameEn: 'Vacant Area',
      description: 'Surface GLA vacante par lot',
      dataType: 'area',
      required: true,
      sources: ['État locatif'],
      exampleValues: ['250 m²', '85 m²']
    },
    {
      fieldName: 'Date de libération',
      fieldNameEn: 'Vacancy Start Date',
      description: 'Date de départ du dernier locataire',
      dataType: 'date',
      required: true,
      sources: ['Gestion locative'],
      exampleValues: ['15/03/2024']
    },
    {
      fieldName: 'ERV',
      fieldNameEn: 'ERV',
      description: 'Valeur locative estimée du lot',
      dataType: 'currency',
      required: true,
      sources: ['Expertise', 'Benchmark'],
      exampleValues: ['45,000 EUR/an']
    }
  ],

  sections: [
    {
      id: 'vacancy_summary',
      title: 'Synthèse Vacance',
      titleEn: 'Vacancy Summary',
      shortTitle: 'Synthèse',
      description: 'KPIs de vacance',
      type: 'kpi_dashboard',
      chartTypes: ['gauge'],
      kpis: ['PHYSICAL_VACANCY', 'EPRA_VACANCY', 'VACANCY_COST']
    },
    {
      id: 'vacant_units_list',
      title: 'Liste des Lots Vacants',
      titleEn: 'Vacant Units List',
      shortTitle: 'Lots',
      description: 'Détail de chaque lot vacant',
      type: 'table',
      columns: ['Lot', 'Surface', 'ERV', 'Durée', 'Cause']
    },
    {
      id: 'vacancy_map',
      title: 'Cartographie Vacance',
      titleEn: 'Vacancy Map',
      shortTitle: 'Carte',
      description: 'Localisation des lots vacants',
      type: 'map'
    },
    {
      id: 'vacancy_trend',
      title: 'Évolution de la Vacance',
      titleEn: 'Vacancy Trend',
      shortTitle: 'Tendance',
      description: 'Historique de la vacance',
      type: 'trend',
      chartTypes: ['line', 'area']
    },
    {
      id: 'pipeline',
      title: 'Pipeline Commercial',
      titleEn: 'Leasing Pipeline',
      shortTitle: 'Pipeline',
      description: 'Prospects et négociations en cours',
      type: 'table',
      columns: ['Lot', 'Prospect', 'Statut', 'Loyer Cible']
    },
    {
      id: 'recommendations',
      title: 'Stratégie de Commercialisation',
      titleEn: 'Leasing Strategy',
      shortTitle: 'Stratégie',
      description: 'Actions recommandées par lot',
      type: 'recommendations',
      aiPowered: true
    }
  ],

  useCases: [
    'Suivi de la commercialisation',
    'Reporting vacance mensuel',
    'Stratégie asset management',
    'Business plan actif'
  ],

  limitations: [
    'Les ERV sont des estimations',
    'Le pipeline dépend de la mise à jour par les équipes leasing'
  ],

  relatedReports: [
    'RENT_ROLL',
    'LEASE_EXPIRY',
    'TENANT_PERFORMANCE'
  ],

  bestPractices: [
    'Analyser les causes de vacance',
    'Benchmarker les loyers demandés',
    'Suivre le pipeline hebdomadairement'
  ],

  tags: ['vacancy', 'leasing', 'commercialization'],
  popular: true,
  new: false,
  aiPowered: true,
  premium: false
};

// ============================================================================
// REPORT 8: MERCHANDISING MIX
// ============================================================================

export const MERCHANDISING_MIX_REPORT: ReportConfig = {
  id: 'merchandising-mix',
  code: 'MERCHANDISING_MIX',
  name: 'Merchandising Mix',
  nameEn: 'Merchandising Mix',
  shortName: 'Mix',
  category: 'leasing',
  subcategory: 'tenant_mix',
  icon: 'Grid3X3',
  color: '#F97316',

  description: 'Analyse de la répartition des activités et optimisation du mix commercial',

  longDescription: `L'analyse du Merchandising Mix évalue l'équilibre des activités commerciales du centre.

**Dimensions analysées :**
- Répartition par catégorie CNCC/ICSC
- Équilibre surfaces/loyers/CA
- Positionnement prix (entrée/milieu/haut de gamme)
- Couverture des besoins de la zone
- Comparaison aux best practices

**Optimisations suggérées :**
- Activités sous-représentées
- Synergies entre enseignes
- Flux de circulation`,

  longDescriptionEn: `Merchandising Mix analysis evaluates the balance of commercial activities.`,

  industryStandards: [
    INDUSTRY_STANDARDS.ICSC,
    INDUSTRY_STANDARDS.CNCC
  ],

  estimatedPages: { min: 8, max: 15 },
  complexity: 'standard',
  updateFrequency: 'quarterly',

  targetAudience: [
    'Leasing Managers',
    'Asset Managers',
    'Directeur de Centre',
    'Marketing'
  ],

  kpis: [
    {
      code: 'ACTIVITY_DIVERSITY',
      name: 'Indice de Diversité',
      nameEn: 'Diversity Index',
      shortName: 'Diversité',
      formula: 'Herfindahl-Hirschman Index inversé',
      unit: 'score',
      description: 'Mesure de la diversité des activités',
      benchmark: { excellent: 80, good: 70, acceptable: 60, poor: 50 },
      frequency: 'quarterly',
      trend: 'higher_better',
      category: 'commercial'
    },
    {
      code: 'ANCHOR_RATIO',
      name: 'Ratio Locomotives',
      nameEn: 'Anchor Ratio',
      shortName: 'Ancres',
      formula: '(Surface Locomotives / GLA Totale) × 100',
      unit: '%',
      description: 'Part des surfaces occupées par les locomotives',
      benchmark: { excellent: 30, good: 25, acceptable: 20, poor: 15 },
      frequency: 'quarterly',
      trend: 'target',
      targetValue: 25,
      category: 'commercial'
    },
    {
      code: 'FASHION_RATIO',
      name: 'Part Mode & Équipement',
      nameEn: 'Fashion Ratio',
      shortName: 'Mode',
      formula: '(Surface Mode / GLA) × 100',
      unit: '%',
      description: 'Part des surfaces dédiées à la mode',
      frequency: 'quarterly',
      trend: 'target',
      targetValue: 35,
      category: 'commercial'
    },
    {
      code: 'FNB_RATIO',
      name: 'Part Restauration',
      nameEn: 'F&B Ratio',
      shortName: 'F&B',
      formula: '(Surface F&B / GLA) × 100',
      unit: '%',
      description: 'Part des surfaces dédiées à la restauration',
      benchmark: { excellent: 15, good: 12, acceptable: 8, poor: 5 },
      frequency: 'quarterly',
      trend: 'higher_better',
      category: 'commercial'
    },
    {
      code: 'LEISURE_RATIO',
      name: 'Part Loisirs & Services',
      nameEn: 'Leisure & Services Ratio',
      shortName: 'Loisirs',
      formula: '(Surface Loisirs / GLA) × 100',
      unit: '%',
      description: 'Part des surfaces loisirs et services',
      frequency: 'quarterly',
      trend: 'target',
      category: 'commercial'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Activité CNCC',
      fieldNameEn: 'CNCC Activity',
      description: 'Code activité selon nomenclature CNCC',
      dataType: 'enum',
      required: true,
      sources: ['État locatif'],
      exampleValues: ['1.1 Mode Femme', '5.2 Restauration Assise']
    },
    {
      fieldName: 'Type d\'enseigne',
      fieldNameEn: 'Tenant Type',
      description: 'Classification (locomotive, moyenne surface, boutique)',
      dataType: 'enum',
      required: true,
      sources: ['Gestion locative'],
      exampleValues: ['Locomotive', 'MSS', 'Boutique']
    },
    {
      fieldName: 'Positionnement prix',
      fieldNameEn: 'Price Positioning',
      description: 'Gamme de prix de l\'enseigne',
      dataType: 'enum',
      required: false,
      sources: ['Analyse marketing'],
      exampleValues: ['Entrée de gamme', 'Milieu de gamme', 'Premium']
    }
  ],

  sections: [
    {
      id: 'mix_overview',
      title: 'Vue d\'Ensemble du Mix',
      titleEn: 'Mix Overview',
      shortTitle: 'Vue',
      description: 'Répartition globale des activités',
      type: 'kpi_dashboard',
      chartTypes: ['treemap', 'pie']
    },
    {
      id: 'activity_breakdown',
      title: 'Détail par Activité',
      titleEn: 'Activity Breakdown',
      shortTitle: 'Activités',
      description: 'Surface, loyer et CA par catégorie',
      type: 'table',
      columns: ['Activité', 'Surface', '% Surface', 'Loyer', '% Loyer', 'CA']
    },
    {
      id: 'benchmark_comparison',
      title: 'Comparaison Best Practices',
      titleEn: 'Best Practice Comparison',
      shortTitle: 'Benchmark',
      description: 'Position vs standards du marché',
      type: 'comparison',
      chartTypes: ['radar', 'bar']
    },
    {
      id: 'tenant_positioning',
      title: 'Positionnement Enseignes',
      titleEn: 'Tenant Positioning',
      shortTitle: 'Position.',
      description: 'Carte de positionnement prix/surface',
      type: 'chart',
      chartTypes: ['scatter']
    },
    {
      id: 'gaps_analysis',
      title: 'Analyse des Lacunes',
      titleEn: 'Gaps Analysis',
      shortTitle: 'Lacunes',
      description: 'Activités manquantes ou sous-représentées',
      type: 'analysis',
      aiPowered: true
    },
    {
      id: 'recommendations',
      title: 'Stratégie de Mix',
      titleEn: 'Mix Strategy',
      shortTitle: 'Stratégie',
      description: 'Recommandations d\'évolution',
      type: 'recommendations',
      aiPowered: true
    }
  ],

  useCases: [
    'Stratégie de commercialisation',
    'Repositionnement d\'actif',
    'Due diligence acquisition',
    'Business plan'
  ],

  limitations: [
    'La nomenclature CNCC peut différer d\'un centre à l\'autre',
    'Les benchmarks varient selon le format de centre'
  ],

  relatedReports: [
    'RENT_ROLL',
    'TENANT_PERFORMANCE',
    'VACANCY_ANALYSIS'
  ],

  bestPractices: [
    'Utiliser la nomenclature CNCC standard',
    'Comparer à des centres de même typologie',
    'Prendre en compte la zone de chalandise'
  ],

  tags: ['merchandising', 'mix', 'tenant', 'strategy'],
  popular: true,
  new: false,
  aiPowered: true,
  premium: false
};

// ============================================================================
// REPORT 9: BUDGET VS RÉEL
// ============================================================================

export const BUDGET_VS_ACTUAL_REPORT: ReportConfig = {
  id: 'budget-vs-actual',
  code: 'BUDGET_VS_ACTUAL',
  name: 'Budget vs Réel',
  nameEn: 'Budget vs Actual',
  shortName: 'Budget',
  category: 'financial',
  subcategory: 'budgeting',
  icon: 'Calculator',
  color: '#EC4899',

  description: 'Analyse des écarts entre budget et réalisé',

  longDescription: `Le rapport Budget vs Réel analyse les écarts de performance par rapport aux prévisions.

**Lignes budgétaires suivies :**
- Revenus locatifs (LMG, loyers variables, autres revenus)
- Charges récupérables et non récupérables
- CAPEX et travaux
- Frais de gestion

**Analyses d'écarts :**
- Écart prix / écart volume
- Écarts favorables / défavorables
- Projection fin d'exercice (forecast)`,

  longDescriptionEn: `Budget vs Actual report analyzes variances between budget and actual performance.`,

  industryStandards: [
    INDUSTRY_STANDARDS.EPRA
  ],

  estimatedPages: { min: 8, max: 15 },
  complexity: 'standard',
  updateFrequency: 'monthly',

  targetAudience: [
    'Contrôleurs de gestion',
    'Asset Managers',
    'Direction Financière',
    'Property Managers'
  ],

  kpis: [
    {
      code: 'REVENUE_VARIANCE',
      name: 'Écart Revenus',
      nameEn: 'Revenue Variance',
      shortName: 'Écart Rev.',
      formula: '((Réel - Budget) / Budget) × 100',
      unit: '%',
      description: 'Écart des revenus vs budget',
      benchmark: { excellent: 2, good: 0, acceptable: -2, poor: -5 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'financial'
    },
    {
      code: 'OPEX_VARIANCE',
      name: 'Écart Charges',
      nameEn: 'Operating Expense Variance',
      shortName: 'Écart Chg.',
      formula: '((Réel - Budget) / Budget) × 100',
      unit: '%',
      description: 'Écart des charges vs budget (négatif = favorable)',
      benchmark: { excellent: -5, good: 0, acceptable: 5, poor: 10 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'financial'
    },
    {
      code: 'NOI_VARIANCE',
      name: 'Écart NOI',
      nameEn: 'NOI Variance',
      shortName: 'Écart NOI',
      formula: '((NOI Réel - NOI Budget) / NOI Budget) × 100',
      unit: '%',
      description: 'Écart du NOI vs budget',
      benchmark: { excellent: 3, good: 0, acceptable: -3, poor: -8 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'financial'
    },
    {
      code: 'FORECAST_ACCURACY',
      name: 'Précision du Forecast',
      nameEn: 'Forecast Accuracy',
      shortName: 'Précision',
      formula: '100 - |Écart Forecast vs Réel|',
      unit: '%',
      description: 'Précision des prévisions précédentes',
      benchmark: { excellent: 98, good: 95, acceptable: 90, poor: 85 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'financial'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Budget par ligne',
      fieldNameEn: 'Budget by Line',
      description: 'Budget détaillé par poste comptable',
      dataType: 'currency',
      required: true,
      sources: ['Budget prévisionnel'],
      exampleValues: ['Loyers: 12,500,000 EUR', 'Charges: 2,800,000 EUR']
    },
    {
      fieldName: 'Réalisé par ligne',
      fieldNameEn: 'Actual by Line',
      description: 'Réalisé comptable par poste',
      dataType: 'currency',
      required: true,
      sources: ['Comptabilité'],
      exampleValues: ['Loyers: 12,750,000 EUR', 'Charges: 2,650,000 EUR']
    },
    {
      fieldName: 'Forecast révisé',
      fieldNameEn: 'Revised Forecast',
      description: 'Prévision mise à jour',
      dataType: 'currency',
      required: false,
      sources: ['Controlling'],
      exampleValues: ['NOI forecast: 10,200,000 EUR']
    }
  ],

  sections: [
    {
      id: 'variance_summary',
      title: 'Synthèse des Écarts',
      titleEn: 'Variance Summary',
      shortTitle: 'Synthèse',
      description: 'Vue d\'ensemble des écarts budget',
      type: 'kpi_dashboard',
      chartTypes: ['gauge'],
      kpis: ['REVENUE_VARIANCE', 'OPEX_VARIANCE', 'NOI_VARIANCE']
    },
    {
      id: 'waterfall',
      title: 'Waterfall Budget → Réel',
      titleEn: 'Budget to Actual Waterfall',
      shortTitle: 'Waterfall',
      description: 'Décomposition des écarts',
      type: 'chart',
      chartTypes: ['waterfall']
    },
    {
      id: 'revenue_detail',
      title: 'Détail Revenus',
      titleEn: 'Revenue Detail',
      shortTitle: 'Revenus',
      description: 'Écarts revenus par catégorie',
      type: 'table',
      columns: ['Poste', 'Budget', 'Réel', 'Écart €', 'Écart %']
    },
    {
      id: 'expense_detail',
      title: 'Détail Charges',
      titleEn: 'Expense Detail',
      shortTitle: 'Charges',
      description: 'Écarts charges par catégorie',
      type: 'table',
      columns: ['Poste', 'Budget', 'Réel', 'Écart €', 'Écart %']
    },
    {
      id: 'trend_analysis',
      title: 'Évolution Mensuelle',
      titleEn: 'Monthly Trend',
      shortTitle: 'Tendance',
      description: 'Évolution des écarts dans le temps',
      type: 'trend',
      chartTypes: ['line']
    },
    {
      id: 'forecast',
      title: 'Projection Fin d\'Exercice',
      titleEn: 'Year-End Forecast',
      shortTitle: 'Forecast',
      description: 'Prévision actualisée',
      type: 'analysis',
      chartTypes: ['bar'],
      aiPowered: true
    }
  ],

  useCases: [
    'Reporting mensuel de gestion',
    'Revues de performance',
    'Préparation des closings',
    'Communication investisseurs'
  ],

  limitations: [
    'La qualité dépend de la comptabilité analytique',
    'Certains écarts sont timing (provisions)'
  ],

  relatedReports: [
    'NOI_ANALYSIS',
    'ASSET_PERFORMANCE',
    'CASH_FLOW'
  ],

  bestPractices: [
    'Réconcilier avec la comptabilité',
    'Documenter les écarts significatifs',
    'Actualiser le forecast mensuellement'
  ],

  tags: ['budget', 'variance', 'financial', 'controlling'],
  popular: true,
  new: false,
  aiPowered: true,
  premium: false
};

// ============================================================================
// REPORT 10: CASH FLOW
// ============================================================================

export const CASH_FLOW_REPORT: ReportConfig = {
  id: 'cash-flow',
  code: 'CASH_FLOW',
  name: 'Tableau de Flux de Trésorerie',
  nameEn: 'Cash Flow Statement',
  shortName: 'Cash Flow',
  category: 'financial',
  subcategory: 'treasury',
  icon: 'Wallet',
  color: '#EC4899',

  description: 'Analyse des flux de trésorerie et position de liquidité',

  longDescription: `Le Tableau de Flux de Trésorerie analyse les mouvements de trésorerie opérationnels.

**Flux analysés :**
- Encaissements locatifs
- Décaissements (charges, travaux, impôts)
- Flux d'investissement (CAPEX)
- Service de la dette

**Indicateurs de liquidité :**
- Position de trésorerie
- DSO (délai de paiement locataires)
- DPO (délai de paiement fournisseurs)
- Taux de recouvrement`,

  longDescriptionEn: `Cash Flow Statement analyzes operational cash movements.`,

  industryStandards: [
    INDUSTRY_STANDARDS.EPRA
  ],

  estimatedPages: { min: 6, max: 12 },
  complexity: 'standard',
  updateFrequency: 'monthly',

  targetAudience: [
    'Direction Financière',
    'Trésorerie',
    'Asset Managers',
    'Investisseurs'
  ],

  kpis: [
    {
      code: 'OPERATING_CASH_FLOW',
      name: 'Cash Flow Opérationnel',
      nameEn: 'Operating Cash Flow',
      shortName: 'OCF',
      formula: 'Encaissements - Décaissements Opérationnels',
      unit: 'EUR',
      description: 'Flux de trésorerie d\'exploitation',
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'financial'
    },
    {
      code: 'COLLECTION_RATE',
      name: 'Taux de Recouvrement',
      nameEn: 'Collection Rate',
      shortName: 'Recouv.',
      formula: '(Loyers Encaissés / Loyers Facturés) × 100',
      unit: '%',
      description: 'Pourcentage des loyers encaissés',
      benchmark: { excellent: 99, good: 97, acceptable: 95, poor: 90 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'financial'
    },
    {
      code: 'DSO',
      name: 'DSO (Days Sales Outstanding)',
      nameEn: 'Days Sales Outstanding',
      shortName: 'DSO',
      formula: '(Créances Locataires / CA Annuel) × 365',
      unit: 'days',
      description: 'Délai moyen de paiement des locataires',
      benchmark: { excellent: 15, good: 30, acceptable: 45, poor: 60 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'financial'
    },
    {
      code: 'CASH_POSITION',
      name: 'Position de Trésorerie',
      nameEn: 'Cash Position',
      shortName: 'Tréso.',
      formula: 'Solde comptes bancaires',
      unit: 'EUR',
      description: 'Trésorerie disponible',
      frequency: 'daily',
      trend: 'higher_better',
      category: 'financial'
    },
    {
      code: 'ARREARS_RATE',
      name: 'Taux d\'Impayés',
      nameEn: 'Arrears Rate',
      shortName: 'Impayés',
      formula: '(Impayés > 30j / Loyers Annuels) × 100',
      unit: '%',
      description: 'Part des loyers en retard de plus de 30 jours',
      benchmark: { excellent: 1, good: 2, acceptable: 4, poor: 8 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'risk'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Encaissements',
      fieldNameEn: 'Collections',
      description: 'Détail des encaissements par nature',
      dataType: 'currency',
      required: true,
      sources: ['Comptabilité', 'Relevés bancaires'],
      exampleValues: ['Loyers: 1,250,000 EUR', 'Charges: 180,000 EUR']
    },
    {
      fieldName: 'Décaissements',
      fieldNameEn: 'Disbursements',
      description: 'Détail des décaissements par nature',
      dataType: 'currency',
      required: true,
      sources: ['Comptabilité', 'Relevés bancaires'],
      exampleValues: ['Fournisseurs: 280,000 EUR', 'Salaires: 95,000 EUR']
    },
    {
      fieldName: 'Créances locataires',
      fieldNameEn: 'Tenant Receivables',
      description: 'Balance âgée des créances',
      dataType: 'currency',
      required: true,
      sources: ['Comptabilité auxiliaire'],
      exampleValues: ['< 30j: 150,000 EUR', '30-60j: 25,000 EUR']
    }
  ],

  sections: [
    {
      id: 'cash_summary',
      title: 'Synthèse Trésorerie',
      titleEn: 'Cash Summary',
      shortTitle: 'Synthèse',
      description: 'Position et indicateurs clés',
      type: 'kpi_dashboard',
      chartTypes: ['gauge'],
      kpis: ['CASH_POSITION', 'COLLECTION_RATE', 'DSO']
    },
    {
      id: 'cash_flow_statement',
      title: 'Tableau des Flux',
      titleEn: 'Cash Flow Statement',
      shortTitle: 'Flux',
      description: 'Détail des flux de trésorerie',
      type: 'chart',
      chartTypes: ['waterfall']
    },
    {
      id: 'collection_analysis',
      title: 'Analyse Recouvrement',
      titleEn: 'Collection Analysis',
      shortTitle: 'Recouv.',
      description: 'Performance du recouvrement',
      type: 'analysis',
      chartTypes: ['bar', 'line'],
      kpis: ['COLLECTION_RATE', 'ARREARS_RATE']
    },
    {
      id: 'aged_balance',
      title: 'Balance Âgée',
      titleEn: 'Aged Balance',
      shortTitle: 'Balance',
      description: 'Créances par ancienneté',
      type: 'table',
      columns: ['Locataire', '< 30j', '30-60j', '60-90j', '> 90j', 'Total']
    },
    {
      id: 'cash_forecast',
      title: 'Prévision de Trésorerie',
      titleEn: 'Cash Forecast',
      shortTitle: 'Prévision',
      description: 'Projection des flux à venir',
      type: 'trend',
      chartTypes: ['line', 'area'],
      aiPowered: true
    }
  ],

  useCases: [
    'Gestion de trésorerie',
    'Suivi du recouvrement',
    'Prévision de liquidité',
    'Reporting investisseurs'
  ],

  limitations: [
    'Les prévisions sont basées sur l\'historique',
    'Certains flux exceptionnels ne sont pas prévisibles'
  ],

  relatedReports: [
    'NOI_ANALYSIS',
    'BUDGET_VS_ACTUAL',
    'TENANT_PERFORMANCE'
  ],

  bestPractices: [
    'Suivre les impayés hebdomadairement',
    'Anticiper les gros décaissements',
    'Maintenir une réserve de liquidité'
  ],

  tags: ['cash flow', 'treasury', 'collection', 'financial'],
  popular: true,
  new: false,
  aiPowered: true,
  premium: false
};

// ============================================================================
// REPORT 11: RAPPORT ESG / DÉVELOPPEMENT DURABLE
// ============================================================================

export const ESG_REPORT: ReportConfig = {
  id: 'esg-report',
  code: 'ESG_REPORT',
  name: 'Rapport ESG',
  nameEn: 'ESG Report',
  shortName: 'ESG',
  category: 'sustainability',
  subcategory: 'esg',
  icon: 'Leaf',
  color: '#22C55E',

  description: 'Performance environnementale, sociale et de gouvernance',

  longDescription: `Le Rapport ESG mesure la performance extra-financière du centre commercial selon les critères GRESB et réglementaires.

**Dimensions E (Environnement) :**
- Consommations énergétiques et émissions CO2
- Certifications environnementales (BREEAM, HQE)
- Gestion des déchets et économie circulaire
- Biodiversité et espaces verts

**Dimensions S (Social) :**
- Accessibilité PMR
- Satisfaction visiteurs et locataires
- Engagement local et solidarité
- Santé et sécurité

**Dimensions G (Gouvernance) :**
- Éthique et conformité
- Transparence reporting
- Gestion des risques`,

  longDescriptionEn: `ESG Report measures extra-financial performance according to GRESB and regulatory criteria.`,

  industryStandards: [
    INDUSTRY_STANDARDS.GRESB,
    INDUSTRY_STANDARDS.BREEAM
  ],

  estimatedPages: { min: 15, max: 30 },
  complexity: 'advanced',
  updateFrequency: 'annually',

  targetAudience: [
    'Direction RSE',
    'Investisseurs',
    'Asset Managers',
    'Régulateurs'
  ],

  kpis: [
    {
      code: 'ENERGY_INTENSITY',
      name: 'Intensité Énergétique',
      nameEn: 'Energy Intensity',
      shortName: 'kWh/m²',
      formula: 'Consommation Énergie / Surface',
      unit: 'EUR/m2',
      description: 'Consommation d\'énergie par m²',
      benchmark: { excellent: 100, good: 150, acceptable: 200, poor: 300 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'sustainability'
    },
    {
      code: 'CARBON_INTENSITY',
      name: 'Intensité Carbone',
      nameEn: 'Carbon Intensity',
      shortName: 'kgCO2/m²',
      formula: 'Émissions CO2 / Surface',
      unit: 'EUR/m2',
      description: 'Émissions de CO2 par m²',
      benchmark: { excellent: 20, good: 35, acceptable: 50, poor: 80 },
      frequency: 'annually',
      trend: 'lower_better',
      category: 'sustainability'
    },
    {
      code: 'WASTE_RECYCLING_RATE',
      name: 'Taux de Recyclage',
      nameEn: 'Waste Recycling Rate',
      shortName: 'Recyclage',
      formula: '(Déchets Recyclés / Déchets Totaux) × 100',
      unit: '%',
      description: 'Part des déchets recyclés ou valorisés',
      benchmark: { excellent: 70, good: 50, acceptable: 35, poor: 20 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'sustainability'
    },
    {
      code: 'GREEN_CERTIFICATION',
      name: 'Score Certification',
      nameEn: 'Green Certification Score',
      shortName: 'Certif.',
      formula: 'Score BREEAM ou équivalent',
      unit: 'score',
      description: 'Niveau de certification environnementale',
      frequency: 'annually',
      trend: 'higher_better',
      category: 'sustainability'
    },
    {
      code: 'GRESB_SCORE',
      name: 'Score GRESB',
      nameEn: 'GRESB Score',
      shortName: 'GRESB',
      formula: 'Score benchmark GRESB',
      unit: 'score',
      description: 'Score au benchmark GRESB',
      benchmark: { excellent: 80, good: 65, acceptable: 50, poor: 35 },
      frequency: 'annually',
      trend: 'higher_better',
      category: 'sustainability',
      standardReference: INDUSTRY_STANDARDS.GRESB
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Consommation énergie',
      fieldNameEn: 'Energy Consumption',
      description: 'Relevés de consommation par énergie',
      dataType: 'numeric',
      required: true,
      sources: ['Compteurs', 'Factures énergéticiens'],
      exampleValues: ['2,500,000 kWh/an électricité', '500,000 kWh/an gaz']
    },
    {
      fieldName: 'Émissions CO2',
      fieldNameEn: 'CO2 Emissions',
      description: 'Bilan carbone scopes 1, 2, 3',
      dataType: 'numeric',
      required: true,
      sources: ['Bilan carbone', 'Facteurs d\'émission'],
      exampleValues: ['1,200 tCO2e/an']
    },
    {
      fieldName: 'Données déchets',
      fieldNameEn: 'Waste Data',
      description: 'Volumes de déchets par filière',
      dataType: 'numeric',
      required: true,
      sources: ['Prestataires déchets'],
      exampleValues: ['800 tonnes/an', '45% recyclage']
    },
    {
      fieldName: 'Certifications',
      fieldNameEn: 'Certifications',
      description: 'Certifications environnementales obtenues',
      dataType: 'text',
      required: false,
      sources: ['Certificats'],
      exampleValues: ['BREEAM Very Good', 'HQE Excellent']
    }
  ],

  sections: [
    {
      id: 'esg_summary',
      title: 'Synthèse ESG',
      titleEn: 'ESG Summary',
      shortTitle: 'Synthèse',
      description: 'Vue d\'ensemble des performances ESG',
      type: 'kpi_dashboard',
      chartTypes: ['radar', 'gauge'],
      kpis: ['ENERGY_INTENSITY', 'CARBON_INTENSITY', 'GRESB_SCORE']
    },
    {
      id: 'environmental',
      title: 'Performance Environnementale',
      titleEn: 'Environmental Performance',
      shortTitle: 'Environ.',
      description: 'Énergie, carbone, déchets, eau',
      type: 'analysis',
      chartTypes: ['bar', 'line'],
      kpis: ['ENERGY_INTENSITY', 'CARBON_INTENSITY', 'WASTE_RECYCLING_RATE']
    },
    {
      id: 'social',
      title: 'Performance Sociale',
      titleEn: 'Social Performance',
      shortTitle: 'Social',
      description: 'Accessibilité, satisfaction, emploi',
      type: 'analysis',
      chartTypes: ['bar', 'pie']
    },
    {
      id: 'governance',
      title: 'Gouvernance',
      titleEn: 'Governance',
      shortTitle: 'Gouv.',
      description: 'Conformité, éthique, transparence',
      type: 'analysis'
    },
    {
      id: 'certifications',
      title: 'Certifications & Labels',
      titleEn: 'Certifications & Labels',
      shortTitle: 'Certif.',
      description: 'État des certifications',
      type: 'table',
      columns: ['Certification', 'Niveau', 'Date', 'Validité']
    },
    {
      id: 'action_plan',
      title: 'Plan d\'Actions ESG',
      titleEn: 'ESG Action Plan',
      shortTitle: 'Actions',
      description: 'Feuille de route amélioration',
      type: 'recommendations',
      aiPowered: true
    }
  ],

  useCases: [
    'Reporting SFDR/Taxonomie',
    'Benchmark GRESB',
    'Communication investisseurs',
    'Stratégie RSE',
    'Certification environnementale'
  ],

  limitations: [
    'Certaines données scope 3 sont estimées',
    'Les benchmarks varient selon les sources'
  ],

  relatedReports: [
    'ASSET_PERFORMANCE',
    'ENERGY_CONSUMPTION'
  ],

  bestPractices: [
    'Collecter les données mensuellement',
    'Utiliser les facteurs d\'émission officiels',
    'Documenter la méthodologie'
  ],

  tags: ['ESG', 'sustainability', 'GRESB', 'carbon', 'environment'],
  popular: true,
  new: true,
  aiPowered: true,
  premium: true
};

// ============================================================================
// REPORT 12: DUE DILIGENCE ACQUISITION
// ============================================================================

export const DUE_DILIGENCE_REPORT: ReportConfig = {
  id: 'due-diligence',
  code: 'DUE_DILIGENCE',
  name: 'Due Diligence Acquisition',
  nameEn: 'Acquisition Due Diligence',
  shortName: 'Due Dil.',
  category: 'investment',
  subcategory: 'acquisition',
  icon: 'Search',
  color: '#06B6D4',

  description: 'Rapport d\'audit complet pour acquisition d\'actif',

  longDescription: `Le rapport de Due Diligence fournit une analyse exhaustive d\'un actif en vue d\'une acquisition.

**Volets analysés :**
- Due diligence financière (revenus, charges, NOI)
- Due diligence locative (baux, locataires, risques)
- Due diligence technique (état du bâtiment, CAPEX)
- Due diligence juridique (titres, servitudes, litiges)
- Due diligence environnementale (sols, amiante, ESG)

**Livrables :**
- Red flags identifiés
- Ajustements de prix recommandés
- Conditions suspensives suggérées`,

  longDescriptionEn: `Due Diligence report provides comprehensive analysis for asset acquisition.`,

  industryStandards: [
    INDUSTRY_STANDARDS.RICS,
    INDUSTRY_STANDARDS.EPRA
  ],

  estimatedPages: { min: 40, max: 80 },
  complexity: 'expert',
  updateFrequency: 'on_demand',

  targetAudience: [
    'Comité d\'investissement',
    'Direction Générale',
    'Banques financeuses',
    'Conseils (avocats, auditeurs)'
  ],

  kpis: [
    {
      code: 'ADJUSTED_NOI',
      name: 'NOI Ajusté',
      nameEn: 'Adjusted NOI',
      shortName: 'NOI Adj.',
      formula: 'NOI Historique + Ajustements',
      unit: 'EUR',
      description: 'NOI retraité des éléments non récurrents',
      frequency: 'annually',
      trend: 'higher_better',
      category: 'financial'
    },
    {
      code: 'IMPLIED_CAP_RATE',
      name: 'Taux de Capitalisation Implicite',
      nameEn: 'Implied Cap Rate',
      shortName: 'Cap Rate',
      formula: 'NOI Stabilisé / Prix d\'Acquisition',
      unit: '%',
      description: 'Rendement initial à l\'acquisition',
      frequency: 'annually',
      trend: 'higher_better',
      category: 'financial'
    },
    {
      code: 'CAPEX_REQUIREMENT',
      name: 'CAPEX Requis',
      nameEn: 'Required CAPEX',
      shortName: 'CAPEX',
      formula: 'Σ Travaux nécessaires 5 ans',
      unit: 'EUR',
      description: 'Investissements nécessaires',
      frequency: 'annually',
      trend: 'lower_better',
      category: 'financial'
    },
    {
      code: 'RED_FLAGS_COUNT',
      name: 'Nombre de Red Flags',
      nameEn: 'Red Flags Count',
      shortName: 'Red Flags',
      formula: 'Count(Points d\'attention critiques)',
      unit: 'number',
      description: 'Points bloquants ou à négocier',
      frequency: 'annually',
      trend: 'lower_better',
      category: 'risk'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Data room complète',
      fieldNameEn: 'Complete Data Room',
      description: 'Ensemble des documents de la data room',
      dataType: 'text',
      required: true,
      sources: ['Data room vendeur'],
      exampleValues: ['Baux', 'États financiers', 'Plans', 'Rapports techniques']
    },
    {
      fieldName: 'États financiers 3 ans',
      fieldNameEn: '3-Year Financials',
      description: 'Historique financier sur 3 exercices',
      dataType: 'currency',
      required: true,
      sources: ['Comptabilité certifiée'],
      exampleValues: ['Bilans', 'Comptes de résultat', 'Annexes']
    },
    {
      fieldName: 'Rapport technique',
      fieldNameEn: 'Technical Report',
      description: 'Audit technique du bâtiment',
      dataType: 'text',
      required: true,
      sources: ['Bureau d\'études technique'],
      exampleValues: ['État structure', 'Équipements', 'Plan CAPEX']
    }
  ],

  sections: [
    {
      id: 'executive_summary',
      title: 'Executive Summary',
      titleEn: 'Executive Summary',
      shortTitle: 'Summary',
      description: 'Synthèse et recommandation d\'investissement',
      type: 'executive_summary',
      aiPowered: true
    },
    {
      id: 'investment_highlights',
      title: 'Points Clés de l\'Investissement',
      titleEn: 'Investment Highlights',
      shortTitle: 'Points Clés',
      description: 'Forces et opportunités',
      type: 'analysis'
    },
    {
      id: 'financial_dd',
      title: 'Due Diligence Financière',
      titleEn: 'Financial Due Diligence',
      shortTitle: 'Finance',
      description: 'Analyse des revenus et charges',
      type: 'analysis',
      chartTypes: ['waterfall', 'bar'],
      kpis: ['ADJUSTED_NOI', 'IMPLIED_CAP_RATE']
    },
    {
      id: 'leasing_dd',
      title: 'Due Diligence Locative',
      titleEn: 'Leasing Due Diligence',
      shortTitle: 'Locatif',
      description: 'Analyse des baux et locataires',
      type: 'analysis',
      chartTypes: ['bar', 'treemap']
    },
    {
      id: 'technical_dd',
      title: 'Due Diligence Technique',
      titleEn: 'Technical Due Diligence',
      shortTitle: 'Technique',
      description: 'État du bâtiment et CAPEX',
      type: 'analysis',
      kpis: ['CAPEX_REQUIREMENT']
    },
    {
      id: 'legal_dd',
      title: 'Due Diligence Juridique',
      titleEn: 'Legal Due Diligence',
      shortTitle: 'Juridique',
      description: 'Risques juridiques et titres',
      type: 'analysis'
    },
    {
      id: 'red_flags',
      title: 'Red Flags & Risques',
      titleEn: 'Red Flags & Risks',
      shortTitle: 'Red Flags',
      description: 'Points d\'attention critiques',
      type: 'analysis',
      kpis: ['RED_FLAGS_COUNT']
    },
    {
      id: 'valuation',
      title: 'Valorisation',
      titleEn: 'Valuation',
      shortTitle: 'Valo',
      description: 'Analyse de la valeur',
      type: 'analysis',
      chartTypes: ['bar', 'scatter']
    },
    {
      id: 'recommendations',
      title: 'Recommandations',
      titleEn: 'Recommendations',
      shortTitle: 'Recomm.',
      description: 'Ajustements de prix et conditions',
      type: 'recommendations',
      aiPowered: true
    }
  ],

  useCases: [
    'Acquisition d\'actif',
    'Refinancement',
    'Restructuration de dette',
    'Reporting au comité d\'investissement'
  ],

  limitations: [
    'Dépend de la qualité de la data room',
    'Certaines vérifications nécessitent des experts tiers'
  ],

  relatedReports: [
    'ASSET_PERFORMANCE',
    'RENT_ROLL',
    'NOI_ANALYSIS'
  ],

  bestPractices: [
    'Constituer une équipe pluridisciplinaire',
    'Vérifier les sources de données',
    'Documenter tous les ajustements'
  ],

  tags: ['due diligence', 'acquisition', 'investment', 'risk'],
  popular: true,
  new: false,
  aiPowered: true,
  premium: true
};

// ============================================================================
// EXPORTS - Rapports supplémentaires
// ============================================================================

export const COMMERCIAL_REAL_ESTATE_REPORTS_PART2: Record<string, ReportConfig> = {
  VACANCY_ANALYSIS: VACANCY_ANALYSIS_REPORT,
  MERCHANDISING_MIX: MERCHANDISING_MIX_REPORT,
  BUDGET_VS_ACTUAL: BUDGET_VS_ACTUAL_REPORT,
  CASH_FLOW: CASH_FLOW_REPORT,
  ESG_REPORT: ESG_REPORT,
  DUE_DILIGENCE: DUE_DILIGENCE_REPORT,
};
