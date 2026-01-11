/**
 * Data Library for Report Studio
 * Pre-defined charts and tables that can be inserted into reports
 */

export interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'financier' | 'locatif' | 'frequentation' | 'commercial';
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'donut' | 'gauge' | 'radar' | 'waterfall';
  // Types de rapports compatibles
  compatibleReportTypes: string[];
  // Source de données pour actualisation
  dataSource?: {
    type: 'kpi' | 'api' | 'computed';
    endpoint?: string;
    kpiCodes?: string[];
    refreshable: boolean;
  };
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
    }>;
  };
  config: {
    title: string;
    subtitle?: string;
    legend?: { show: boolean; position: 'top' | 'bottom' | 'left' | 'right' };
    xAxis?: { label?: string };
    yAxis?: { label?: string };
  };
}

export interface TableTemplate {
  id: string;
  name: string;
  description: string;
  category: 'locatif' | 'financier' | 'baux' | 'kpis' | 'budget';
  // Types de rapports compatibles
  compatibleReportTypes: string[];
  // Source de données pour actualisation
  dataSource?: {
    type: 'entity' | 'api' | 'computed';
    endpoint?: string;
    entityType?: string;
    refreshable: boolean;
  };
  headers: Array<{
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    format?: 'text' | 'number' | 'currency' | 'percentage' | 'date';
  }>;
  rows: Array<Record<string, { value: unknown; formatted?: string }>>;
  config: {
    striped?: boolean;
    bordered?: boolean;
    compact?: boolean;
  };
}

// ============================================
// CHART TEMPLATES
// ============================================

export const CHART_TEMPLATES: ChartTemplate[] = [
  // Performance
  {
    id: 'chart-evolution-noi',
    name: 'Évolution du NOI',
    description: 'Graphique montrant l\'évolution du Net Operating Income sur 12 mois',
    category: 'performance',
    chartType: 'line',
    compatibleReportTypes: ['PERF_ACTIF', 'ANALYSE_PORTEFEUILLE', 'REPORTING_PROPRIETAIRE', 'NOI_ANALYSIS', 'COMPTE_RESULTAT'],
    dataSource: {
      type: 'kpi',
      kpiCodes: ['NOI'],
      refreshable: true,
    },
    data: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [{
        label: 'NOI (k€)',
        data: [125, 128, 132, 130, 135, 140, 138, 142, 145, 148, 150, 155],
        borderColor: '#1C3163',
        backgroundColor: 'rgba(28, 49, 99, 0.1)',
      }],
    },
    config: {
      title: 'Évolution du NOI mensuel',
      subtitle: 'En milliers d\'euros',
      legend: { show: true, position: 'top' },
      yAxis: { label: 'NOI (k€)' },
    },
  },
  {
    id: 'chart-yield-comparison',
    name: 'Comparaison des Yields',
    description: 'Comparaison du yield net vs yield brut par trimestre',
    category: 'performance',
    chartType: 'bar',
    compatibleReportTypes: ['PERF_ACTIF', 'ANALYSE_PORTEFEUILLE', 'VALORISATION_DCF', 'DUE_DILIGENCE', 'SCENARIOS_ACQUISITION'],
    dataSource: {
      type: 'kpi',
      kpiCodes: ['YIELD_NET', 'YIELD_BRUT'],
      refreshable: true,
    },
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Yield Brut',
          data: [6.2, 6.4, 6.3, 6.5],
          backgroundColor: '#1C3163',
        },
        {
          label: 'Yield Net',
          data: [5.1, 5.3, 5.2, 5.4],
          backgroundColor: '#D4AF37',
        },
      ],
    },
    config: {
      title: 'Yield Brut vs Net',
      legend: { show: true, position: 'top' },
      yAxis: { label: 'Yield (%)' },
    },
  },
  {
    id: 'chart-kpi-gauges',
    name: 'Jauge Taux d\'occupation',
    description: 'Indicateur visuel du taux d\'occupation',
    category: 'performance',
    chartType: 'gauge',
    compatibleReportTypes: ['PERF_ACTIF', 'ETAT_LOCATIF_REPORT', 'REPORTING_PROPRIETAIRE', 'TDB_CENTRE', 'SUIVI_VACANCE'],
    dataSource: {
      type: 'kpi',
      kpiCodes: ['TAUX_OCCUPATION_PHYSIQUE'],
      refreshable: true,
    },
    data: {
      labels: ['Taux d\'occupation'],
      datasets: [{
        label: 'Occupation',
        data: [94.5],
        backgroundColor: '#10b981',
      }],
    },
    config: {
      title: 'Taux d\'occupation physique',
      subtitle: '94.5%',
    },
  },

  // Financier
  {
    id: 'chart-revenus-charges',
    name: 'Revenus vs Charges',
    description: 'Évolution mensuelle des revenus et charges',
    category: 'financier',
    chartType: 'area',
    compatibleReportTypes: ['COMPTE_RESULTAT', 'CF_OPERATIONNEL', 'NOI_ANALYSIS', 'BUDGET_VS_REEL', 'REPORTING_PROPRIETAIRE', 'GESTION_CHARGES'],
    dataSource: {
      type: 'kpi',
      kpiCodes: ['LOYER_TOTAL', 'CHARGES_TOTALES'],
      refreshable: true,
    },
    data: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [
        {
          label: 'Revenus',
          data: [180, 185, 190, 188, 195, 200],
          backgroundColor: 'rgba(16, 185, 129, 0.3)',
          borderColor: '#10b981',
        },
        {
          label: 'Charges',
          data: [55, 52, 58, 54, 56, 55],
          backgroundColor: 'rgba(239, 68, 68, 0.3)',
          borderColor: '#ef4444',
        },
      ],
    },
    config: {
      title: 'Revenus et Charges',
      legend: { show: true, position: 'top' },
      yAxis: { label: 'Montant (k€)' },
    },
  },
  {
    id: 'chart-repartition-charges',
    name: 'Répartition des Charges',
    description: 'Camembert montrant la ventilation des charges',
    category: 'financier',
    chartType: 'pie',
    compatibleReportTypes: ['GESTION_CHARGES', 'BUDGET_VS_REEL', 'REPORTING_PROPRIETAIRE', 'COMPTE_RESULTAT'],
    dataSource: {
      type: 'kpi',
      kpiCodes: ['CHARGES_TOTALES'],
      refreshable: true,
    },
    data: {
      labels: ['Maintenance', 'Énergie', 'Sécurité', 'Nettoyage', 'Assurances', 'Autres'],
      datasets: [{
        label: 'Charges',
        data: [25, 30, 15, 12, 8, 10],
        backgroundColor: ['#1C3163', '#D4AF37', '#10b981', '#8b5cf6', '#f97316', '#6b7280'],
      }],
    },
    config: {
      title: 'Ventilation des Charges',
      legend: { show: true, position: 'right' },
    },
  },
  {
    id: 'chart-budget-reel',
    name: 'Budget vs Réel',
    description: 'Comparaison budget prévisionnel vs réalisé',
    category: 'financier',
    chartType: 'waterfall',
    compatibleReportTypes: ['BUDGET_VS_REEL', 'GESTION_CHARGES', 'BUDGET_PROJET', 'REPORTING_PROJET'],
    dataSource: {
      type: 'computed',
      refreshable: true,
    },
    data: {
      labels: ['Budget', 'Écart Revenus', 'Écart Charges', 'Écart Travaux', 'Réel'],
      datasets: [{
        label: 'Montants',
        data: [1500, 50, -30, -20, 1500],
        backgroundColor: ['#1C3163', '#10b981', '#ef4444', '#ef4444', '#1C3163'],
      }],
    },
    config: {
      title: 'Budget vs Réel - Analyse des écarts',
      yAxis: { label: 'Montant (k€)' },
    },
  },

  // Locatif
  {
    id: 'chart-repartition-activites',
    name: 'Mix Commercial',
    description: 'Répartition par type d\'activité',
    category: 'locatif',
    chartType: 'donut',
    compatibleReportTypes: ['MERCHANDISING_MIX', 'ETAT_LOCATIF_REPORT', 'PIPELINE_COMMERCIAL', 'COMMERCIALISATION_PROJET', 'DUE_DILIGENCE'],
    dataSource: {
      type: 'entity',
      entityType: 'locataire',
      refreshable: true,
    },
    data: {
      labels: ['Mode', 'Restauration', 'Services', 'Loisirs', 'Alimentaire'],
      datasets: [{
        label: 'Surface',
        data: [35, 25, 15, 15, 10],
        backgroundColor: ['#1C3163', '#D4AF37', '#10b981', '#8b5cf6', '#f97316'],
      }],
    },
    config: {
      title: 'Mix Commercial par Activité',
      subtitle: 'Répartition en surface (m²)',
      legend: { show: true, position: 'right' },
    },
  },
  {
    id: 'chart-wault-evolution',
    name: 'Évolution WAULT',
    description: 'Suivi de la durée moyenne des baux',
    category: 'locatif',
    chartType: 'line',
    compatibleReportTypes: ['SUIVI_BAUX', 'PERF_ACTIF', 'REPORTING_PROPRIETAIRE', 'DUE_DILIGENCE', 'ANALYSE_PORTEFEUILLE'],
    dataSource: {
      type: 'kpi',
      kpiCodes: ['WAULT'],
      refreshable: true,
    },
    data: {
      labels: ['2020', '2021', '2022', '2023', '2024'],
      datasets: [{
        label: 'WAULT (années)',
        data: [4.2, 4.0, 3.8, 4.1, 4.5],
        borderColor: '#1C3163',
        backgroundColor: 'rgba(28, 49, 99, 0.1)',
      }],
    },
    config: {
      title: 'Évolution du WAULT',
      yAxis: { label: 'Années' },
    },
  },
  {
    id: 'chart-loyers-activite',
    name: 'Loyers par Activité',
    description: 'Loyer moyen au m² par type d\'activité',
    category: 'locatif',
    chartType: 'bar',
    compatibleReportTypes: ['BENCHMARK_LOYERS', 'MERCHANDISING_MIX', 'ETAT_LOCATIF_REPORT', 'DUE_DILIGENCE', 'ANALYSE_CONCURRENTIELLE'],
    dataSource: {
      type: 'kpi',
      kpiCodes: ['LOYER_MOYEN_M2'],
      refreshable: true,
    },
    data: {
      labels: ['Mode', 'Restauration', 'Services', 'Loisirs', 'Alimentaire'],
      datasets: [{
        label: 'Loyer €/m²',
        data: [450, 380, 320, 280, 250],
        backgroundColor: '#D4AF37',
      }],
    },
    config: {
      title: 'Loyer moyen par type d\'activité',
      subtitle: 'En €/m²/an',
      yAxis: { label: '€/m²/an' },
    },
  },

  // Fréquentation
  {
    id: 'chart-frequentation-mensuelle',
    name: 'Fréquentation Mensuelle',
    description: 'Nombre de visiteurs par mois',
    category: 'frequentation',
    chartType: 'bar',
    compatibleReportTypes: ['TDB_CENTRE', 'ANALYSE_FREQUENTATION', 'ETUDE_MARCHE', 'REPORTING_PROJET', 'ANALYSE_CONCURRENTIELLE'],
    dataSource: {
      type: 'kpi',
      kpiCodes: ['FREQUENTATION_TOTALE'],
      refreshable: true,
    },
    data: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [{
        label: 'Visiteurs (milliers)',
        data: [320, 290, 340, 360, 380, 350, 310, 280, 390, 410, 450, 520],
        backgroundColor: '#8b5cf6',
      }],
    },
    config: {
      title: 'Fréquentation mensuelle',
      subtitle: 'En milliers de visiteurs',
      yAxis: { label: 'Visiteurs (k)' },
    },
  },
  {
    id: 'chart-frequentation-journaliere',
    name: 'Fréquentation par Jour',
    description: 'Répartition hebdomadaire moyenne',
    category: 'frequentation',
    chartType: 'radar',
    compatibleReportTypes: ['ANALYSE_FREQUENTATION', 'TDB_CENTRE'],
    dataSource: {
      type: 'kpi',
      kpiCodes: ['FREQUENTATION_JOUR_MOYEN'],
      refreshable: true,
    },
    data: {
      labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      datasets: [{
        label: 'Visiteurs',
        data: [8500, 9200, 10500, 9800, 12000, 18500, 15000],
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        borderColor: '#8b5cf6',
      }],
    },
    config: {
      title: 'Répartition hebdomadaire',
    },
  },

  // Commercial
  {
    id: 'chart-ca-evolution',
    name: 'Évolution CA',
    description: 'Chiffre d\'affaires mensuel cumulé',
    category: 'commercial',
    chartType: 'area',
    compatibleReportTypes: ['ANALYSE_CA', 'PERF_ENSEIGNES', 'TDB_CENTRE', 'REPORTING_PROPRIETAIRE'],
    dataSource: {
      type: 'kpi',
      kpiCodes: ['CA_TOTAL'],
      refreshable: true,
    },
    data: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [
        {
          label: 'CA N',
          data: [2.1, 4.3, 6.8, 9.2, 11.8, 14.5],
          backgroundColor: 'rgba(28, 49, 99, 0.3)',
          borderColor: '#1C3163',
        },
        {
          label: 'CA N-1',
          data: [2.0, 4.1, 6.5, 8.8, 11.2, 13.8],
          backgroundColor: 'rgba(212, 175, 55, 0.3)',
          borderColor: '#D4AF37',
        },
      ],
    },
    config: {
      title: 'CA Cumulé N vs N-1',
      subtitle: 'En millions d\'euros',
      legend: { show: true, position: 'top' },
      yAxis: { label: 'CA (M€)' },
    },
  },
  {
    id: 'chart-top-enseignes',
    name: 'Top 10 Enseignes',
    description: 'Classement des enseignes par CA',
    category: 'commercial',
    chartType: 'bar',
    compatibleReportTypes: ['PERF_ENSEIGNES', 'ANALYSE_CA', 'TDB_CENTRE', 'MERCHANDISING_MIX'],
    dataSource: {
      type: 'entity',
      entityType: 'locataire',
      refreshable: true,
    },
    data: {
      labels: ['Enseigne A', 'Enseigne B', 'Enseigne C', 'Enseigne D', 'Enseigne E', 'Enseigne F', 'Enseigne G', 'Enseigne H', 'Enseigne I', 'Enseigne J'],
      datasets: [{
        label: 'CA (k€)',
        data: [850, 720, 680, 590, 520, 480, 420, 380, 350, 320],
        backgroundColor: '#10b981',
      }],
    },
    config: {
      title: 'Top 10 Enseignes par CA',
      yAxis: { label: 'CA (k€)' },
    },
  },
];

// ============================================
// TABLE TEMPLATES
// ============================================

export const TABLE_TEMPLATES: TableTemplate[] = [
  // Locatif
  {
    id: 'table-etat-locatif',
    name: 'État Locatif Synthétique',
    description: 'Résumé des principaux locataires',
    category: 'locatif',
    compatibleReportTypes: ['ETAT_LOCATIF_REPORT', 'REPORTING_PROPRIETAIRE', 'DUE_DILIGENCE', 'PERF_ACTIF', 'ANALYSE_PORTEFEUILLE'],
    dataSource: {
      type: 'entity',
      entityType: 'bail',
      refreshable: true,
    },
    headers: [
      { key: 'locataire', label: 'Locataire', align: 'left' },
      { key: 'local', label: 'Local', align: 'left' },
      { key: 'surface', label: 'Surface (m²)', align: 'right', format: 'number' },
      { key: 'loyer', label: 'Loyer annuel', align: 'right', format: 'currency' },
      { key: 'echeance', label: 'Échéance bail', align: 'center', format: 'date' },
    ],
    rows: [
      { locataire: { value: 'Carrefour' }, local: { value: 'N001' }, surface: { value: 2500, formatted: '2 500' }, loyer: { value: 875000, formatted: '875 000 €' }, echeance: { value: '2027-12-31', formatted: '31/12/2027' } },
      { locataire: { value: 'H&M' }, local: { value: 'N102' }, surface: { value: 850, formatted: '850' }, loyer: { value: 340000, formatted: '340 000 €' }, echeance: { value: '2026-06-30', formatted: '30/06/2026' } },
      { locataire: { value: 'Zara' }, local: { value: 'N104' }, surface: { value: 720, formatted: '720' }, loyer: { value: 324000, formatted: '324 000 €' }, echeance: { value: '2025-09-15', formatted: '15/09/2025' } },
      { locataire: { value: 'Sephora' }, local: { value: 'N201' }, surface: { value: 280, formatted: '280' }, loyer: { value: 168000, formatted: '168 000 €' }, echeance: { value: '2028-03-01', formatted: '01/03/2028' } },
      { locataire: { value: 'McDonald\'s' }, local: { value: 'R001' }, surface: { value: 420, formatted: '420' }, loyer: { value: 189000, formatted: '189 000 €' }, echeance: { value: '2029-12-31', formatted: '31/12/2029' } },
    ],
    config: { striped: true, bordered: true },
  },
  {
    id: 'table-vacance',
    name: 'Lots Vacants',
    description: 'Liste des lots vacants disponibles',
    category: 'locatif',
    compatibleReportTypes: ['SUIVI_VACANCE', 'ETAT_LOCATIF_REPORT', 'PIPELINE_COMMERCIAL', 'COMMERCIALISATION_PROJET'],
    dataSource: {
      type: 'entity',
      entityType: 'lot',
      refreshable: true,
    },
    headers: [
      { key: 'local', label: 'Local', align: 'left' },
      { key: 'surface', label: 'Surface (m²)', align: 'right', format: 'number' },
      { key: 'etage', label: 'Étage', align: 'center' },
      { key: 'vacantDepuis', label: 'Vacant depuis', align: 'center', format: 'date' },
      { key: 'loyerCible', label: 'Loyer cible', align: 'right', format: 'currency' },
    ],
    rows: [
      { local: { value: 'N205' }, surface: { value: 150, formatted: '150' }, etage: { value: '2' }, vacantDepuis: { value: '2024-01-15', formatted: '15/01/2024' }, loyerCible: { value: 67500, formatted: '67 500 €' } },
      { local: { value: 'N308' }, surface: { value: 85, formatted: '85' }, etage: { value: '3' }, vacantDepuis: { value: '2023-11-01', formatted: '01/11/2023' }, loyerCible: { value: 34000, formatted: '34 000 €' } },
    ],
    config: { striped: true, bordered: true, compact: true },
  },

  // Baux
  {
    id: 'table-echeances-baux',
    name: 'Échéances des Baux',
    description: 'Baux arrivant à échéance dans les 12 prochains mois',
    category: 'baux',
    compatibleReportTypes: ['SUIVI_BAUX', 'REPORTING_PROPRIETAIRE', 'DUE_DILIGENCE', 'PERF_ACTIF'],
    dataSource: {
      type: 'entity',
      entityType: 'bail',
      refreshable: true,
    },
    headers: [
      { key: 'locataire', label: 'Locataire', align: 'left' },
      { key: 'surface', label: 'Surface', align: 'right', format: 'number' },
      { key: 'loyer', label: 'Loyer actuel', align: 'right', format: 'currency' },
      { key: 'echeance', label: 'Échéance', align: 'center', format: 'date' },
      { key: 'option', label: 'Option', align: 'center' },
    ],
    rows: [
      { locataire: { value: 'Zara' }, surface: { value: 720, formatted: '720 m²' }, loyer: { value: 324000, formatted: '324 000 €' }, echeance: { value: '2025-09-15', formatted: '15/09/2025' }, option: { value: 'Break' } },
      { locataire: { value: 'FNAC' }, surface: { value: 1200, formatted: '1 200 m²' }, loyer: { value: 420000, formatted: '420 000 €' }, echeance: { value: '2025-06-30', formatted: '30/06/2025' }, option: { value: 'Fin' } },
      { locataire: { value: 'Orange' }, surface: { value: 95, formatted: '95 m²' }, loyer: { value: 47500, formatted: '47 500 €' }, echeance: { value: '2025-12-31', formatted: '31/12/2025' }, option: { value: 'Break' } },
    ],
    config: { striped: true, bordered: true },
  },

  // Financier
  {
    id: 'table-compte-resultat',
    name: 'Compte de Résultat Simplifié',
    description: 'P&L synthétique de l\'actif',
    category: 'financier',
    compatibleReportTypes: ['COMPTE_RESULTAT', 'NOI_ANALYSIS', 'REPORTING_PROPRIETAIRE', 'BUDGET_VS_REEL', 'DUE_DILIGENCE'],
    dataSource: {
      type: 'computed',
      refreshable: true,
    },
    headers: [
      { key: 'poste', label: 'Poste', align: 'left' },
      { key: 'budget', label: 'Budget', align: 'right', format: 'currency' },
      { key: 'reel', label: 'Réel', align: 'right', format: 'currency' },
      { key: 'ecart', label: 'Écart', align: 'right', format: 'percentage' },
    ],
    rows: [
      { poste: { value: 'Loyers' }, budget: { value: 2400000, formatted: '2 400 000 €' }, reel: { value: 2450000, formatted: '2 450 000 €' }, ecart: { value: 2.1, formatted: '+2.1%' } },
      { poste: { value: 'Charges refacturées' }, budget: { value: 180000, formatted: '180 000 €' }, reel: { value: 175000, formatted: '175 000 €' }, ecart: { value: -2.8, formatted: '-2.8%' } },
      { poste: { value: 'Autres revenus' }, budget: { value: 50000, formatted: '50 000 €' }, reel: { value: 55000, formatted: '55 000 €' }, ecart: { value: 10, formatted: '+10.0%' } },
      { poste: { value: 'Total Revenus', style: { fontWeight: 'bold' } }, budget: { value: 2630000, formatted: '2 630 000 €' }, reel: { value: 2680000, formatted: '2 680 000 €' }, ecart: { value: 1.9, formatted: '+1.9%' } },
      { poste: { value: 'Charges exploitation' }, budget: { value: -620000, formatted: '-620 000 €' }, reel: { value: -600000, formatted: '-600 000 €' }, ecart: { value: 3.2, formatted: '+3.2%' } },
      { poste: { value: 'NOI', style: { fontWeight: 'bold' } }, budget: { value: 2010000, formatted: '2 010 000 €' }, reel: { value: 2080000, formatted: '2 080 000 €' }, ecart: { value: 3.5, formatted: '+3.5%' } },
    ],
    config: { bordered: true },
  },

  // KPIs
  {
    id: 'table-kpis-synthese',
    name: 'Synthèse KPIs',
    description: 'Tableau récapitulatif des indicateurs clés',
    category: 'kpis',
    compatibleReportTypes: ['PERF_ACTIF', 'TDB_CENTRE', 'REPORTING_PROPRIETAIRE', 'ANALYSE_PORTEFEUILLE', 'DUE_DILIGENCE', 'DASHBOARD_PROJET'],
    dataSource: {
      type: 'kpi',
      kpiCodes: ['TAUX_OCCUPATION_PHYSIQUE', 'WAULT', 'YIELD_NET', 'NOI', 'TAUX_RECOUVREMENT'],
      refreshable: true,
    },
    headers: [
      { key: 'indicateur', label: 'Indicateur', align: 'left' },
      { key: 'valeur', label: 'Valeur', align: 'right' },
      { key: 'evolution', label: 'vs N-1', align: 'right', format: 'percentage' },
      { key: 'cible', label: 'Cible', align: 'right' },
    ],
    rows: [
      { indicateur: { value: 'Taux d\'occupation physique' }, valeur: { value: '94.5%' }, evolution: { value: 1.2, formatted: '+1.2%' }, cible: { value: '95%' } },
      { indicateur: { value: 'Taux d\'occupation financier' }, valeur: { value: '96.2%' }, evolution: { value: 0.8, formatted: '+0.8%' }, cible: { value: '97%' } },
      { indicateur: { value: 'WAULT (années)' }, valeur: { value: '4.5' }, evolution: { value: 0.3, formatted: '+0.3' }, cible: { value: '4.0' } },
      { indicateur: { value: 'Yield Net' }, valeur: { value: '5.4%' }, evolution: { value: 0.2, formatted: '+0.2%' }, cible: { value: '5.5%' } },
      { indicateur: { value: 'NOI (M€)' }, valeur: { value: '2.08' }, evolution: { value: 3.5, formatted: '+3.5%' }, cible: { value: '2.01' } },
      { indicateur: { value: 'Taux de recouvrement' }, valeur: { value: '98.5%' }, evolution: { value: -0.5, formatted: '-0.5%' }, cible: { value: '99%' } },
    ],
    config: { striped: true, bordered: true },
  },

  // Budget
  {
    id: 'table-budget-detail',
    name: 'Budget Détaillé',
    description: 'Suivi budgétaire par poste',
    category: 'budget',
    compatibleReportTypes: ['BUDGET_VS_REEL', 'GESTION_CHARGES', 'BUDGET_PROJET', 'REPORTING_PROJET'],
    dataSource: {
      type: 'computed',
      refreshable: true,
    },
    headers: [
      { key: 'poste', label: 'Poste de charge', align: 'left' },
      { key: 'budget', label: 'Budget', align: 'right', format: 'currency' },
      { key: 'engage', label: 'Engagé', align: 'right', format: 'currency' },
      { key: 'realise', label: 'Réalisé', align: 'right', format: 'currency' },
      { key: 'reste', label: 'RAF', align: 'right', format: 'currency' },
    ],
    rows: [
      { poste: { value: 'Maintenance technique' }, budget: { value: 150000, formatted: '150 000 €' }, engage: { value: 120000, formatted: '120 000 €' }, realise: { value: 85000, formatted: '85 000 €' }, reste: { value: 65000, formatted: '65 000 €' } },
      { poste: { value: 'Énergie' }, budget: { value: 180000, formatted: '180 000 €' }, engage: { value: 180000, formatted: '180 000 €' }, realise: { value: 95000, formatted: '95 000 €' }, reste: { value: 85000, formatted: '85 000 €' } },
      { poste: { value: 'Sécurité' }, budget: { value: 90000, formatted: '90 000 €' }, engage: { value: 90000, formatted: '90 000 €' }, realise: { value: 45000, formatted: '45 000 €' }, reste: { value: 45000, formatted: '45 000 €' } },
      { poste: { value: 'Nettoyage' }, budget: { value: 72000, formatted: '72 000 €' }, engage: { value: 72000, formatted: '72 000 €' }, realise: { value: 36000, formatted: '36 000 €' }, reste: { value: 36000, formatted: '36 000 €' } },
      { poste: { value: 'Assurances' }, budget: { value: 48000, formatted: '48 000 €' }, engage: { value: 48000, formatted: '48 000 €' }, realise: { value: 48000, formatted: '48 000 €' }, reste: { value: 0, formatted: '0 €' } },
    ],
    config: { striped: true, bordered: true },
  },
];

// ============================================
// HELPERS
// ============================================

export const CHART_CATEGORIES = [
  { id: 'performance', label: 'Performance', color: '#1C3163' },
  { id: 'financier', label: 'Financier', color: '#ec4899' },
  { id: 'locatif', label: 'Locatif', color: '#10b981' },
  { id: 'frequentation', label: 'Fréquentation', color: '#8b5cf6' },
  { id: 'commercial', label: 'Commercial', color: '#f97316' },
];

export const TABLE_CATEGORIES = [
  { id: 'locatif', label: 'État Locatif', color: '#10b981' },
  { id: 'baux', label: 'Baux', color: '#D4AF37' },
  { id: 'financier', label: 'Financier', color: '#ec4899' },
  { id: 'kpis', label: 'KPIs', color: '#1C3163' },
  { id: 'budget', label: 'Budget', color: '#f97316' },
];

export function getChartsByCategory(category: string): ChartTemplate[] {
  return CHART_TEMPLATES.filter(c => c.category === category);
}

export function getTablesByCategory(category: string): TableTemplate[] {
  return TABLE_TEMPLATES.filter(t => t.category === category);
}

export function getChartById(id: string): ChartTemplate | undefined {
  return CHART_TEMPLATES.find(c => c.id === id);
}

export function getTableById(id: string): TableTemplate | undefined {
  return TABLE_TEMPLATES.find(t => t.id === id);
}

// ============================================
// FILTERING BY REPORT TYPE
// ============================================

/**
 * Get charts compatible with given report types
 */
export function getChartsForReportTypes(reportTypes: string[]): ChartTemplate[] {
  if (!reportTypes || reportTypes.length === 0) {
    return CHART_TEMPLATES;
  }
  return CHART_TEMPLATES.filter(chart =>
    chart.compatibleReportTypes.some(type => reportTypes.includes(type))
  );
}

/**
 * Get tables compatible with given report types
 */
export function getTablesForReportTypes(reportTypes: string[]): TableTemplate[] {
  if (!reportTypes || reportTypes.length === 0) {
    return TABLE_TEMPLATES;
  }
  return TABLE_TEMPLATES.filter(table =>
    table.compatibleReportTypes.some(type => reportTypes.includes(type))
  );
}

/**
 * Get all compatible data elements for given report types
 */
export function getDataLibraryForReportTypes(reportTypes: string[]) {
  return {
    charts: getChartsForReportTypes(reportTypes),
    tables: getTablesForReportTypes(reportTypes),
  };
}

/**
 * Check if a data element needs refresh based on period
 */
export function isDataRefreshable(element: ChartTemplate | TableTemplate): boolean {
  return element.dataSource?.refreshable ?? false;
}
