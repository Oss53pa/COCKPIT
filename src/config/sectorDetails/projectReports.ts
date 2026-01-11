/**
 * Project & Construction Reports - Rapports Projet & Travaux
 *
 * Ce fichier contient les configurations de rapports pour le suivi
 * des projets de construction et de renovation de centres commerciaux.
 */

import { ReportConfig, CatalogueKPIDefinition, INDUSTRY_STANDARDS } from './commercialRealEstateDetails';

// ============================================================================
// REPORT 1: SUIVI AVANCEMENT CHANTIER
// ============================================================================

export const CONSTRUCTION_PROGRESS_REPORT: ReportConfig = {
  id: 'construction-progress',
  code: 'CONSTRUCTION_PROGRESS',
  name: 'Suivi Avancement Chantier',
  nameEn: 'Construction Progress Report',
  shortName: 'Avancement',
  category: 'project',
  subcategory: 'construction',
  icon: 'HardHat',
  color: '#84CC16',

  description: 'Tableau de bord du suivi de l\'avancement des travaux de construction ou renovation',

  longDescription: `Le rapport de Suivi Avancement Chantier permet de monitorer l'etat d'avancement des travaux en temps reel.

**Indicateurs suivis :**
- Avancement physique global et par lot
- Respect du planning (jalons, chemin critique)
- Suivi des retards et causes
- Productivite des equipes

**Analyses incluses :**
- Courbe en S (planifie vs realise)
- Gantt simplifie des jalons cles
- Alertes sur les ecarts
- Projection de la date de livraison

**Points de vigilance :**
- Coherence avec le planning maitre
- Impact des aleas sur la date de livraison
- Coordination entre lots`,

  longDescriptionEn: `The Construction Progress Report monitors the status of construction works in real-time.`,

  industryStandards: [],

  estimatedPages: { min: 8, max: 15 },
  complexity: 'standard',
  updateFrequency: 'weekly',

  targetAudience: [
    'Chef de Projet',
    'Direction de Programme',
    'Maitrise d\'Ouvrage',
    'Asset Managers',
    'Investisseurs'
  ],

  kpis: [
    {
      code: 'PHYSICAL_PROGRESS',
      name: 'Avancement Physique',
      nameEn: 'Physical Progress',
      shortName: 'Avancement',
      formula: '(Travaux Realises / Travaux Totaux) x 100',
      unit: '%',
      description: 'Pourcentage d\'avancement physique du chantier',
      benchmark: { excellent: 100, good: 95, acceptable: 85, poor: 70 },
      frequency: 'weekly',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'SCHEDULE_VARIANCE',
      name: 'Ecart Planning',
      nameEn: 'Schedule Variance',
      shortName: 'Ecart',
      formula: 'Date Prevue - Date Reelle (en jours)',
      unit: 'days',
      description: 'Ecart entre le planning prevu et l\'avancement reel',
      benchmark: { excellent: 0, good: 7, acceptable: 14, poor: 30 },
      frequency: 'weekly',
      trend: 'lower_better',
      category: 'operational'
    },
    {
      code: 'MILESTONES_ON_TIME',
      name: 'Jalons Respectes',
      nameEn: 'Milestones On Time',
      shortName: 'Jalons OK',
      formula: '(Jalons Atteints a Temps / Jalons Totaux) x 100',
      unit: '%',
      description: 'Pourcentage de jalons atteints dans les delais',
      benchmark: { excellent: 100, good: 90, acceptable: 80, poor: 60 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'DELAY_DAYS',
      name: 'Retard Cumule',
      nameEn: 'Cumulative Delay',
      shortName: 'Retard',
      formula: 'Somme des jours de retard',
      unit: 'days',
      description: 'Nombre de jours de retard cumule sur le projet',
      benchmark: { excellent: 0, good: 15, acceptable: 30, poor: 60 },
      frequency: 'weekly',
      trend: 'lower_better',
      category: 'risk'
    },
    {
      code: 'LOTS_COMPLETED',
      name: 'Lots Termines',
      nameEn: 'Completed Lots',
      shortName: 'Lots OK',
      formula: 'Nombre de lots livres / Nombre total de lots',
      unit: '%',
      description: 'Pourcentage de lots de travaux termines',
      frequency: 'weekly',
      trend: 'higher_better',
      category: 'operational'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Planning maitre',
      fieldNameEn: 'Master Schedule',
      description: 'Planning de reference du projet',
      dataType: 'date',
      required: true,
      sources: ['MS Project', 'Primavera', 'Excel'],
      exampleValues: ['Gantt detaille']
    },
    {
      fieldName: 'Avancement par lot',
      fieldNameEn: 'Progress by Lot',
      description: 'Pourcentage d\'avancement de chaque lot',
      dataType: 'percentage',
      required: true,
      sources: ['Rapports OPC', 'Reunions chantier'],
      exampleValues: ['Gros oeuvre: 85%', 'CVC: 45%']
    },
    {
      fieldName: 'Comptes-rendus chantier',
      fieldNameEn: 'Site Meeting Minutes',
      description: 'PV des reunions de chantier',
      dataType: 'text',
      required: true,
      sources: ['OPC', 'MOE'],
      exampleValues: ['CR hebdomadaire']
    }
  ],

  sections: [
    {
      id: 'progress_summary',
      title: 'Synthese Avancement',
      titleEn: 'Progress Summary',
      shortTitle: 'Synthese',
      description: 'Vue d\'ensemble de l\'avancement du projet',
      type: 'kpi_dashboard',
      chartTypes: ['gauge', 'bar'],
      kpis: ['PHYSICAL_PROGRESS', 'SCHEDULE_VARIANCE', 'MILESTONES_ON_TIME']
    },
    {
      id: 's_curve',
      title: 'Courbe en S',
      titleEn: 'S-Curve',
      shortTitle: 'Courbe S',
      description: 'Comparaison planifie vs realise',
      type: 'chart',
      chartTypes: ['line', 'area']
    },
    {
      id: 'lot_progress',
      title: 'Avancement par Lot',
      titleEn: 'Progress by Lot',
      shortTitle: 'Par Lot',
      description: 'Detail de l\'avancement de chaque lot',
      type: 'table',
      columns: ['Lot', 'Entreprise', 'Prevu', 'Realise', 'Ecart']
    },
    {
      id: 'milestones',
      title: 'Jalons Cles',
      titleEn: 'Key Milestones',
      shortTitle: 'Jalons',
      description: 'Etat des jalons du projet',
      type: 'chart',
      chartTypes: ['bar'],
      kpis: ['MILESTONES_ON_TIME']
    },
    {
      id: 'delays_analysis',
      title: 'Analyse des Retards',
      titleEn: 'Delay Analysis',
      shortTitle: 'Retards',
      description: 'Causes et impacts des retards',
      type: 'analysis',
      chartTypes: ['bar', 'pie'],
      kpis: ['DELAY_DAYS']
    },
    {
      id: 'recommendations',
      title: 'Actions Correctives',
      titleEn: 'Corrective Actions',
      shortTitle: 'Actions',
      description: 'Plan de rattrapage et recommandations',
      type: 'recommendations',
      aiPowered: true
    }
  ],

  useCases: [
    'Reporting hebdomadaire chantier',
    'Comite de pilotage projet',
    'Information investisseurs',
    'Coordination MOE/MOA',
    'Anticipation des livraisons'
  ],

  limitations: [
    'Depend de la fiabilite des pointages',
    'Les aleas meteo ne sont pas toujours previsibles',
    'Necessite une mise a jour reguliere'
  ],

  relatedReports: [
    'BUDGET_TRACKING',
    'MOBILIZATION_STATUS',
    'HANDOVER_CHECKLIST'
  ],

  bestPractices: [
    'Mettre a jour l\'avancement chaque semaine',
    'Documenter les causes de retard',
    'Anticiper les impacts sur les jalons suivants'
  ],

  tags: ['construction', 'avancement', 'planning', 'chantier', 'projet'],
  popular: true,
  new: true,
  aiPowered: true,
  premium: false
};

// ============================================================================
// REPORT 2: SUIVI BUDGETAIRE TRAVAUX
// ============================================================================

export const BUDGET_TRACKING_REPORT: ReportConfig = {
  id: 'budget-tracking',
  code: 'BUDGET_TRACKING',
  name: 'Suivi Budgetaire Travaux',
  nameEn: 'Construction Budget Tracking',
  shortName: 'Budget Travaux',
  category: 'project',
  subcategory: 'financial',
  icon: 'Wallet',
  color: '#84CC16',

  description: 'Suivi financier detaille du budget de construction et des engagements',

  longDescription: `Le rapport de Suivi Budgetaire Travaux permet de controler les depenses de construction en temps reel.

**Elements suivis :**
- Budget initial et revisions
- Engagements (marches signes)
- Facturations et paiements
- Reste a facturer et reste a payer
- Provisions pour aleas

**Analyses incluses :**
- Comparaison budget vs engage vs facture
- Projection du cout final (EAC)
- Suivi des avenants et TMA
- Courbe de tresorerie`,

  longDescriptionEn: `The Construction Budget Tracking report monitors construction expenses in real-time.`,

  industryStandards: [],

  estimatedPages: { min: 10, max: 20 },
  complexity: 'advanced',
  updateFrequency: 'monthly',

  targetAudience: [
    'Chef de Projet',
    'Direction Financiere',
    'Controleur de Gestion',
    'Direction de Programme',
    'Investisseurs'
  ],

  kpis: [
    {
      code: 'BUDGET_VARIANCE',
      name: 'Ecart Budget',
      nameEn: 'Budget Variance',
      shortName: 'Ecart',
      formula: '((Cout Estime Final - Budget Initial) / Budget Initial) x 100',
      unit: '%',
      description: 'Ecart entre le cout final estime et le budget initial',
      benchmark: { excellent: 0, good: 3, acceptable: 5, poor: 10 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'financial'
    },
    {
      code: 'COMMITMENT_RATE',
      name: 'Taux d\'Engagement',
      nameEn: 'Commitment Rate',
      shortName: 'Engage',
      formula: '(Marches Signes / Budget Total) x 100',
      unit: '%',
      description: 'Pourcentage du budget engage en marches',
      frequency: 'monthly',
      trend: 'target',
      targetValue: 100,
      category: 'financial'
    },
    {
      code: 'BILLING_RATE',
      name: 'Taux de Facturation',
      nameEn: 'Billing Rate',
      shortName: 'Facture',
      formula: '(Montant Facture / Montant Engage) x 100',
      unit: '%',
      description: 'Pourcentage des engagements factures',
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'financial'
    },
    {
      code: 'CHANGE_ORDERS_PCT',
      name: 'Taux d\'Avenants',
      nameEn: 'Change Orders Rate',
      shortName: 'Avenants',
      formula: '(Montant Avenants / Budget Initial) x 100',
      unit: '%',
      description: 'Part des avenants dans le budget',
      benchmark: { excellent: 3, good: 5, acceptable: 8, poor: 15 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'risk'
    },
    {
      code: 'EAC',
      name: 'Cout Final Estime (EAC)',
      nameEn: 'Estimate at Completion',
      shortName: 'EAC',
      formula: 'Engage + Reste a Engager + Provisions',
      unit: 'EUR',
      description: 'Estimation du cout total a l\'achevement',
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'financial'
    },
    {
      code: 'CONTINGENCY_USED',
      name: 'Provisions Utilisees',
      nameEn: 'Contingency Used',
      shortName: 'Provisions',
      formula: '(Provisions Consommees / Provisions Initiales) x 100',
      unit: '%',
      description: 'Part des provisions pour aleas consommees',
      benchmark: { excellent: 50, good: 70, acceptable: 90, poor: 100 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'risk'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Budget initial',
      fieldNameEn: 'Initial Budget',
      description: 'Budget de reference approuve',
      dataType: 'currency',
      required: true,
      sources: ['Business plan', 'APS'],
      exampleValues: ['45,000,000 EUR']
    },
    {
      fieldName: 'Marches signes',
      fieldNameEn: 'Signed Contracts',
      description: 'Liste des marches et montants',
      dataType: 'currency',
      required: true,
      sources: ['Direction Juridique', 'Achats'],
      exampleValues: ['38,500,000 EUR']
    },
    {
      fieldName: 'Factures',
      fieldNameEn: 'Invoices',
      description: 'Factures recues et validees',
      dataType: 'currency',
      required: true,
      sources: ['Comptabilite'],
      exampleValues: ['22,300,000 EUR']
    },
    {
      fieldName: 'Avenants',
      fieldNameEn: 'Change Orders',
      description: 'Liste des travaux supplementaires',
      dataType: 'currency',
      required: true,
      sources: ['MOE', 'Chef de projet'],
      exampleValues: ['1,850,000 EUR']
    }
  ],

  sections: [
    {
      id: 'budget_summary',
      title: 'Synthese Budgetaire',
      titleEn: 'Budget Summary',
      shortTitle: 'Synthese',
      description: 'Vue d\'ensemble du budget travaux',
      type: 'kpi_dashboard',
      chartTypes: ['gauge', 'bar'],
      kpis: ['BUDGET_VARIANCE', 'EAC', 'COMMITMENT_RATE']
    },
    {
      id: 'waterfall',
      title: 'Evolution du Budget',
      titleEn: 'Budget Evolution',
      shortTitle: 'Waterfall',
      description: 'Du budget initial au cout final estime',
      type: 'chart',
      chartTypes: ['waterfall']
    },
    {
      id: 'lot_detail',
      title: 'Detail par Lot',
      titleEn: 'Detail by Lot',
      shortTitle: 'Par Lot',
      description: 'Budget, engage et facture par lot',
      type: 'table',
      columns: ['Lot', 'Budget', 'Engage', 'Facture', 'RAP', 'Ecart']
    },
    {
      id: 'change_orders',
      title: 'Suivi des Avenants',
      titleEn: 'Change Orders Tracking',
      shortTitle: 'Avenants',
      description: 'Liste et analyse des travaux supplementaires',
      type: 'analysis',
      chartTypes: ['bar', 'pie'],
      kpis: ['CHANGE_ORDERS_PCT']
    },
    {
      id: 'cash_flow',
      title: 'Courbe de Tresorerie',
      titleEn: 'Cash Flow Curve',
      shortTitle: 'Tresorerie',
      description: 'Projection des decaissements',
      type: 'trend',
      chartTypes: ['line', 'area']
    },
    {
      id: 'risk_analysis',
      title: 'Analyse des Risques',
      titleEn: 'Risk Analysis',
      shortTitle: 'Risques',
      description: 'Points de vigilance financiers',
      type: 'recommendations',
      aiPowered: true,
      kpis: ['CONTINGENCY_USED']
    }
  ],

  useCases: [
    'Reporting financier mensuel',
    'Comite d\'investissement',
    'Suivi des engagements',
    'Negociation avec les entreprises',
    'Projection de tresorerie'
  ],

  limitations: [
    'Les provisions sont des estimations',
    'Les avenants peuvent survenir tardivement',
    'Depend de la qualite du suivi comptable'
  ],

  relatedReports: [
    'CONSTRUCTION_PROGRESS',
    'CHANGE_ORDER_ANALYSIS',
    'CASH_FLOW'
  ],

  bestPractices: [
    'Actualiser le cout final estime mensuellement',
    'Documenter chaque avenant',
    'Prevoir des provisions adequates'
  ],

  tags: ['budget', 'travaux', 'finances', 'construction', 'projet'],
  popular: true,
  new: true,
  aiPowered: true,
  premium: false
};

// ============================================================================
// REPORT 3: ETAT DE LA MOBILISATION
// ============================================================================

export const MOBILIZATION_STATUS_REPORT: ReportConfig = {
  id: 'mobilization-status',
  code: 'MOBILIZATION_STATUS',
  name: 'Etat de la Mobilisation',
  nameEn: 'Mobilization Status Report',
  shortName: 'Mobilisation',
  category: 'project',
  subcategory: 'operations',
  icon: 'Users',
  color: '#84CC16',

  description: 'Suivi de la mobilisation des equipes et ressources avant ouverture',

  longDescription: `Le rapport d'Etat de la Mobilisation permet de suivre la preparation operationnelle avant l'ouverture du centre.

**Axes de mobilisation :**
- Recrutement et formation des equipes
- Commercialisation (signature des baux)
- Installation des enseignes
- Mise en place des contrats d'exploitation
- Preparation marketing et communication

**Synchronisation :**
- Alignement avec l'avancement chantier
- Detection des ecarts
- Optimisation des ressources`,

  longDescriptionEn: `The Mobilization Status Report tracks operational preparation before center opening.`,

  industryStandards: [],

  estimatedPages: { min: 8, max: 15 },
  complexity: 'standard',
  updateFrequency: 'weekly',

  targetAudience: [
    'Directeur de Centre (designe)',
    'Chef de Projet',
    'Direction des Operations',
    'Direction Commerciale',
    'RH'
  ],

  kpis: [
    {
      code: 'RECRUITMENT_PROGRESS',
      name: 'Avancement Recrutement',
      nameEn: 'Recruitment Progress',
      shortName: 'Recrutement',
      formula: '(Postes Pourvus / Postes a Pourvoir) x 100',
      unit: '%',
      description: 'Pourcentage des postes pourvus',
      benchmark: { excellent: 100, good: 90, acceptable: 75, poor: 50 },
      frequency: 'weekly',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'LEASING_PROGRESS',
      name: 'Taux de Commercialisation',
      nameEn: 'Leasing Progress',
      shortName: 'Commerc.',
      formula: '(Surface Signee / Surface GLA) x 100',
      unit: '%',
      description: 'Pourcentage de la surface commercialisee',
      benchmark: { excellent: 95, good: 85, acceptable: 75, poor: 60 },
      frequency: 'weekly',
      trend: 'higher_better',
      category: 'commercial'
    },
    {
      code: 'TENANT_FITOUT_PROGRESS',
      name: 'Avancement Amenagements',
      nameEn: 'Tenant Fit-out Progress',
      shortName: 'Amenag.',
      formula: '(Boutiques Pretes / Boutiques Signees) x 100',
      unit: '%',
      description: 'Pourcentage des boutiques pretes a ouvrir',
      benchmark: { excellent: 100, good: 90, acceptable: 80, poor: 60 },
      frequency: 'weekly',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'CONTRACTS_SIGNED',
      name: 'Contrats d\'Exploitation',
      nameEn: 'Operating Contracts Signed',
      shortName: 'Contrats',
      formula: '(Contrats Signes / Contrats Requis) x 100',
      unit: '%',
      description: 'Pourcentage des contrats d\'exploitation signes',
      benchmark: { excellent: 100, good: 95, acceptable: 85, poor: 70 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'DAYS_TO_OPENING',
      name: 'Jours avant Ouverture',
      nameEn: 'Days to Opening',
      shortName: 'J-X',
      formula: 'Date Ouverture - Date du Jour',
      unit: 'days',
      description: 'Nombre de jours restants avant ouverture',
      frequency: 'daily',
      trend: 'target',
      category: 'operational'
    },
    {
      code: 'MOBILIZATION_SYNC',
      name: 'Synchronisation Mob/Chantier',
      nameEn: 'Mobilization/Construction Sync',
      shortName: 'Synchro',
      formula: 'Avancement Mobilisation - Avancement Chantier',
      unit: '%',
      description: 'Ecart entre mobilisation et avancement chantier',
      benchmark: { excellent: 5, good: 0, acceptable: -10, poor: -20 },
      frequency: 'weekly',
      trend: 'target',
      targetValue: 0,
      category: 'risk'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Organigramme cible',
      fieldNameEn: 'Target Organization',
      description: 'Liste des postes a pourvoir',
      dataType: 'text',
      required: true,
      sources: ['RH', 'Direction Operations'],
      exampleValues: ['45 postes']
    },
    {
      fieldName: 'Etat commercial',
      fieldNameEn: 'Leasing Status',
      description: 'Surface signee et en negociation',
      dataType: 'area',
      required: true,
      sources: ['Direction Commerciale'],
      exampleValues: ['85% signe']
    },
    {
      fieldName: 'Planning amenagements',
      fieldNameEn: 'Fit-out Schedule',
      description: 'Dates de livraison boutiques',
      dataType: 'date',
      required: true,
      sources: ['MOE', 'Enseignes'],
      exampleValues: ['Planning detaille']
    }
  ],

  sections: [
    {
      id: 'mobilization_summary',
      title: 'Synthese Mobilisation',
      titleEn: 'Mobilization Summary',
      shortTitle: 'Synthese',
      description: 'Vue d\'ensemble de la preparation',
      type: 'kpi_dashboard',
      chartTypes: ['gauge', 'bar'],
      kpis: ['RECRUITMENT_PROGRESS', 'LEASING_PROGRESS', 'TENANT_FITOUT_PROGRESS', 'DAYS_TO_OPENING']
    },
    {
      id: 'recruitment_detail',
      title: 'Detail Recrutement',
      titleEn: 'Recruitment Detail',
      shortTitle: 'Recrutement',
      description: 'Etat par poste et par vague',
      type: 'table',
      columns: ['Poste', 'Vague', 'Statut', 'Date Integration']
    },
    {
      id: 'leasing_status',
      title: 'Etat Commercial',
      titleEn: 'Leasing Status',
      shortTitle: 'Commercial',
      description: 'Surface signee et pipeline',
      type: 'analysis',
      chartTypes: ['treemap', 'bar'],
      kpis: ['LEASING_PROGRESS']
    },
    {
      id: 'fitout_tracking',
      title: 'Suivi Amenagements',
      titleEn: 'Fit-out Tracking',
      shortTitle: 'Amenagements',
      description: 'Avancement des travaux enseignes',
      type: 'table',
      columns: ['Enseigne', 'Debut', 'Fin Prevue', 'Avancement', 'Alerte']
    },
    {
      id: 'sync_analysis',
      title: 'Synchronisation',
      titleEn: 'Synchronization Analysis',
      shortTitle: 'Synchro',
      description: 'Alignement chantier/mobilisation',
      type: 'comparison',
      chartTypes: ['line', 'bar'],
      kpis: ['MOBILIZATION_SYNC']
    },
    {
      id: 'countdown',
      title: 'Compte a Rebours',
      titleEn: 'Countdown',
      shortTitle: 'J-X',
      description: 'Actions prioritaires avant ouverture',
      type: 'recommendations',
      aiPowered: true
    }
  ],

  useCases: [
    'Pilotage pre-ouverture',
    'Coordination equipes projet',
    'Reporting Direction Generale',
    'Anticipation des risques',
    'Communication interne'
  ],

  limitations: [
    'Les delais enseignes sont parfois imprevisibles',
    'Depend de la coordination entre services'
  ],

  relatedReports: [
    'CONSTRUCTION_PROGRESS',
    'HANDOVER_CHECKLIST',
    'TENANT_FITOUT_TRACKER'
  ],

  bestPractices: [
    'Synchroniser avec le planning chantier',
    'Anticiper les recrutements de 3-6 mois',
    'Suivre les amenagements enseignes de pres'
  ],

  tags: ['mobilisation', 'pre-ouverture', 'recrutement', 'commercialisation'],
  popular: true,
  new: true,
  aiPowered: true,
  premium: false
};

// ============================================================================
// REPORT 4: CHECKLIST HANDOVER
// ============================================================================

export const HANDOVER_CHECKLIST_REPORT: ReportConfig = {
  id: 'handover-checklist',
  code: 'HANDOVER_CHECKLIST',
  name: 'Checklist Handover',
  nameEn: 'Handover Checklist Report',
  shortName: 'Handover',
  category: 'project',
  subcategory: 'handover',
  icon: 'ClipboardList',
  color: '#84CC16',

  description: 'Suivi de la reception et du transfert des ouvrages vers l\'exploitation',

  longDescription: `Le rapport Checklist Handover permet de suivre le processus de reception des travaux et le transfert vers les equipes d'exploitation.

**Phases couvertes :**
- Pre-reception (OPR)
- Reception avec reserves
- Levee des reserves
- Formation des equipes
- Mise en service des installations
- Documentation et DOE

**Points de controle :**
- Conformite aux plans et specifications
- Tests et essais de fonctionnement
- Garanties et assurances
- Documentation complete`,

  longDescriptionEn: `The Handover Checklist Report tracks the acceptance process and transfer to operations teams.`,

  industryStandards: [],

  estimatedPages: { min: 6, max: 12 },
  complexity: 'standard',
  updateFrequency: 'weekly',

  targetAudience: [
    'Chef de Projet',
    'Directeur de Centre',
    'Direction Technique',
    'MOE',
    'Facility Manager'
  ],

  kpis: [
    {
      code: 'HANDOVER_PROGRESS',
      name: 'Avancement Handover',
      nameEn: 'Handover Progress',
      shortName: 'Handover',
      formula: '(Points Valides / Points Totaux) x 100',
      unit: '%',
      description: 'Pourcentage de la checklist handover completee',
      benchmark: { excellent: 100, good: 95, acceptable: 85, poor: 70 },
      frequency: 'weekly',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'SNAG_COUNT',
      name: 'Reserves Ouvertes',
      nameEn: 'Open Snags',
      shortName: 'Reserves',
      formula: 'Nombre de reserves non levees',
      unit: 'number',
      description: 'Nombre de reserves en cours',
      benchmark: { excellent: 0, good: 10, acceptable: 30, poor: 50 },
      frequency: 'weekly',
      trend: 'lower_better',
      category: 'operational'
    },
    {
      code: 'SNAG_CLOSURE_RATE',
      name: 'Taux de Levee',
      nameEn: 'Snag Closure Rate',
      shortName: 'Levee',
      formula: '(Reserves Levees / Reserves Totales) x 100',
      unit: '%',
      description: 'Pourcentage des reserves levees',
      benchmark: { excellent: 100, good: 90, acceptable: 80, poor: 60 },
      frequency: 'weekly',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'DOE_COMPLETION',
      name: 'DOE Complet',
      nameEn: 'As-Built Documentation',
      shortName: 'DOE',
      formula: '(Documents Recus / Documents Requis) x 100',
      unit: '%',
      description: 'Pourcentage de la documentation recue',
      benchmark: { excellent: 100, good: 95, acceptable: 85, poor: 70 },
      frequency: 'monthly',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'TRAINING_COMPLETION',
      name: 'Formations Completees',
      nameEn: 'Training Completion',
      shortName: 'Formations',
      formula: '(Formations Realisees / Formations Prevues) x 100',
      unit: '%',
      description: 'Pourcentage des formations realisees',
      benchmark: { excellent: 100, good: 90, acceptable: 80, poor: 60 },
      frequency: 'weekly',
      trend: 'higher_better',
      category: 'operational'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Checklist handover',
      fieldNameEn: 'Handover Checklist',
      description: 'Liste des points a valider',
      dataType: 'text',
      required: true,
      sources: ['Template projet', 'MOE'],
      exampleValues: ['250 points de controle']
    },
    {
      fieldName: 'Liste des reserves',
      fieldNameEn: 'Snag List',
      description: 'Reserves identifiees en reception',
      dataType: 'text',
      required: true,
      sources: ['OPR', 'MOE', 'MOA'],
      exampleValues: ['45 reserves']
    },
    {
      fieldName: 'Planning formations',
      fieldNameEn: 'Training Schedule',
      description: 'Calendrier des formations',
      dataType: 'date',
      required: true,
      sources: ['MOE', 'Entreprises'],
      exampleValues: ['Planning detaille']
    }
  ],

  sections: [
    {
      id: 'handover_summary',
      title: 'Synthese Handover',
      titleEn: 'Handover Summary',
      shortTitle: 'Synthese',
      description: 'Etat global du transfert',
      type: 'kpi_dashboard',
      chartTypes: ['gauge', 'bar'],
      kpis: ['HANDOVER_PROGRESS', 'SNAG_COUNT', 'DOE_COMPLETION']
    },
    {
      id: 'checklist_status',
      title: 'Etat de la Checklist',
      titleEn: 'Checklist Status',
      shortTitle: 'Checklist',
      description: 'Detail par categorie',
      type: 'table',
      columns: ['Categorie', 'Total', 'Valide', 'En cours', 'Non fait']
    },
    {
      id: 'snag_management',
      title: 'Gestion des Reserves',
      titleEn: 'Snag Management',
      shortTitle: 'Reserves',
      description: 'Suivi des reserves par lot',
      type: 'analysis',
      chartTypes: ['bar', 'pie'],
      kpis: ['SNAG_CLOSURE_RATE']
    },
    {
      id: 'documentation',
      title: 'Documentation',
      titleEn: 'Documentation',
      shortTitle: 'DOE',
      description: 'Etat des documents recus',
      type: 'table',
      columns: ['Document', 'Lot', 'Statut', 'Date Reception']
    },
    {
      id: 'training',
      title: 'Formations',
      titleEn: 'Training',
      shortTitle: 'Formations',
      description: 'Etat des formations realisees',
      type: 'table',
      columns: ['Formation', 'Intervenant', 'Date', 'Participants', 'Statut']
    },
    {
      id: 'action_plan',
      title: 'Plan d\'Actions',
      titleEn: 'Action Plan',
      shortTitle: 'Actions',
      description: 'Actions prioritaires pour cloturer le handover',
      type: 'recommendations',
      aiPowered: true
    }
  ],

  useCases: [
    'Reception des travaux',
    'Transfert vers exploitation',
    'Suivi des garanties',
    'Audit qualite',
    'Archivage projet'
  ],

  limitations: [
    'Les reserves mineures peuvent etre longues a lever',
    'Le DOE complet peut prendre plusieurs mois'
  ],

  relatedReports: [
    'CONSTRUCTION_PROGRESS',
    'MOBILIZATION_STATUS',
    'WARRANTY_TRACKER'
  ],

  bestPractices: [
    'Commencer le handover 3 mois avant ouverture',
    'Impliquer les equipes exploitation tot',
    'Documenter systematiquement les formations'
  ],

  tags: ['handover', 'reception', 'reserves', 'DOE', 'formation'],
  popular: false,
  new: true,
  aiPowered: true,
  premium: false
};

// ============================================================================
// REPORT 5: TABLEAU DE BORD PROJET
// ============================================================================

export const PROJECT_DASHBOARD_REPORT: ReportConfig = {
  id: 'project-dashboard',
  code: 'PROJECT_DASHBOARD',
  name: 'Tableau de Bord Projet',
  nameEn: 'Project Dashboard',
  shortName: 'Dashboard Projet',
  category: 'project',
  subcategory: 'overview',
  icon: 'Target',
  color: '#84CC16',

  description: 'Vue synthetique de l\'ensemble des indicateurs cles du projet',

  longDescription: `Le Tableau de Bord Projet offre une vue consolidee de tous les aspects du projet de construction.

**Dimensions couvertes :**
- Avancement physique et planning
- Budget et couts
- Mobilisation et commercialisation
- Risques et alertes
- Jalons a venir

**Public cible :**
- Direction Generale
- Comite de Pilotage
- Investisseurs
- Partenaires`,

  longDescriptionEn: `The Project Dashboard provides a consolidated view of all project aspects.`,

  industryStandards: [],

  estimatedPages: { min: 4, max: 8 },
  complexity: 'simple',
  updateFrequency: 'weekly',

  targetAudience: [
    'Direction Generale',
    'Comite de Pilotage',
    'Investisseurs',
    'Asset Managers'
  ],

  kpis: [
    {
      code: 'OVERALL_PROGRESS',
      name: 'Avancement Global',
      nameEn: 'Overall Progress',
      shortName: 'Avancement',
      formula: 'Moyenne ponderee des avancements',
      unit: '%',
      description: 'Avancement global du projet',
      benchmark: { excellent: 100, good: 95, acceptable: 85, poor: 70 },
      frequency: 'weekly',
      trend: 'higher_better',
      category: 'operational'
    },
    {
      code: 'BUDGET_STATUS',
      name: 'Situation Budgetaire',
      nameEn: 'Budget Status',
      shortName: 'Budget',
      formula: 'Ecart EAC vs Budget',
      unit: '%',
      description: 'Ecart entre cout final estime et budget',
      benchmark: { excellent: 0, good: 3, acceptable: 5, poor: 10 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'financial'
    },
    {
      code: 'SCHEDULE_STATUS',
      name: 'Situation Planning',
      nameEn: 'Schedule Status',
      shortName: 'Planning',
      formula: 'Retard cumule en jours',
      unit: 'days',
      description: 'Retard par rapport au planning initial',
      benchmark: { excellent: 0, good: 15, acceptable: 30, poor: 60 },
      frequency: 'weekly',
      trend: 'lower_better',
      category: 'operational'
    },
    {
      code: 'RISK_SCORE',
      name: 'Score Risque',
      nameEn: 'Risk Score',
      shortName: 'Risque',
      formula: 'Agregation des risques identifies',
      unit: 'score',
      description: 'Niveau de risque global du projet',
      benchmark: { excellent: 20, good: 40, acceptable: 60, poor: 80 },
      frequency: 'monthly',
      trend: 'lower_better',
      category: 'risk'
    },
    {
      code: 'OPENING_READINESS',
      name: 'Maturite Ouverture',
      nameEn: 'Opening Readiness',
      shortName: 'Readiness',
      formula: 'Score composite de preparation',
      unit: '%',
      description: 'Niveau de preparation pour l\'ouverture',
      benchmark: { excellent: 95, good: 85, acceptable: 75, poor: 60 },
      frequency: 'weekly',
      trend: 'higher_better',
      category: 'operational'
    }
  ],

  dataRequirements: [
    {
      fieldName: 'Donnees avancement',
      fieldNameEn: 'Progress Data',
      description: 'Avancements des differents volets',
      dataType: 'percentage',
      required: true,
      sources: ['Rapports detailles'],
      exampleValues: ['Chantier: 75%, Mobilisation: 60%']
    },
    {
      fieldName: 'Donnees budgetaires',
      fieldNameEn: 'Budget Data',
      description: 'Situation financiere',
      dataType: 'currency',
      required: true,
      sources: ['Rapport budget'],
      exampleValues: ['Budget: 45M, EAC: 46.5M']
    },
    {
      fieldName: 'Registre des risques',
      fieldNameEn: 'Risk Register',
      description: 'Liste des risques identifies',
      dataType: 'text',
      required: true,
      sources: ['Chef de projet'],
      exampleValues: ['12 risques actifs']
    }
  ],

  sections: [
    {
      id: 'executive_summary',
      title: 'Resume Executif',
      titleEn: 'Executive Summary',
      shortTitle: 'Resume',
      description: 'Points cles et alertes',
      type: 'executive_summary',
      aiPowered: true
    },
    {
      id: 'global_kpis',
      title: 'Indicateurs Globaux',
      titleEn: 'Global KPIs',
      shortTitle: 'KPIs',
      description: 'Vue synthetique des KPIs projet',
      type: 'kpi_dashboard',
      chartTypes: ['gauge'],
      kpis: ['OVERALL_PROGRESS', 'BUDGET_STATUS', 'SCHEDULE_STATUS', 'RISK_SCORE', 'OPENING_READINESS']
    },
    {
      id: 'progress_overview',
      title: 'Avancement par Axe',
      titleEn: 'Progress by Area',
      shortTitle: 'Avancement',
      description: 'Avancement chantier, mobilisation, commercial',
      type: 'chart',
      chartTypes: ['radar', 'bar']
    },
    {
      id: 'key_milestones',
      title: 'Jalons Cles',
      titleEn: 'Key Milestones',
      shortTitle: 'Jalons',
      description: 'Prochaines echeances importantes',
      type: 'table',
      columns: ['Jalon', 'Date Cible', 'Statut', 'Responsable']
    },
    {
      id: 'top_risks',
      title: 'Risques Majeurs',
      titleEn: 'Top Risks',
      shortTitle: 'Risques',
      description: 'Les 5 risques prioritaires',
      type: 'table',
      columns: ['Risque', 'Impact', 'Probabilite', 'Score', 'Mitigation']
    },
    {
      id: 'decisions_needed',
      title: 'Decisions Requises',
      titleEn: 'Decisions Needed',
      shortTitle: 'Decisions',
      description: 'Points necessitant une decision',
      type: 'recommendations',
      aiPowered: true
    }
  ],

  useCases: [
    'Comite de pilotage',
    'Reporting Direction Generale',
    'Communication investisseurs',
    'Revue de projet periodique'
  ],

  limitations: [
    'Vue synthetique - consulter rapports detailles pour plus d\'infos',
    'Mise a jour dependante des rapports sources'
  ],

  relatedReports: [
    'CONSTRUCTION_PROGRESS',
    'BUDGET_TRACKING',
    'MOBILIZATION_STATUS',
    'HANDOVER_CHECKLIST'
  ],

  bestPractices: [
    'Mettre a jour avant chaque comite',
    'Harmoniser les codes couleur',
    'Prioriser les messages cles'
  ],

  tags: ['dashboard', 'projet', 'synthese', 'direction', 'reporting'],
  popular: true,
  new: true,
  aiPowered: true,
  premium: false
};

// ============================================================================
// EXPORTS
// ============================================================================

export const PROJECT_REPORTS: Record<string, ReportConfig> = {
  CONSTRUCTION_PROGRESS: CONSTRUCTION_PROGRESS_REPORT,
  BUDGET_TRACKING: BUDGET_TRACKING_REPORT,
  MOBILIZATION_STATUS: MOBILIZATION_STATUS_REPORT,
  HANDOVER_CHECKLIST: HANDOVER_CHECKLIST_REPORT,
  PROJECT_DASHBOARD: PROJECT_DASHBOARD_REPORT,
};
