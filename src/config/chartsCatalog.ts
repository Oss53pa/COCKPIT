/**
 * Charts Catalog - Comprehensive chart types for the BI catalog
 * Based on EasyView-BI structure with 80+ chart types
 */

import type { LucideIcon } from 'lucide-react';

export type ChartCategoryCode =
  | 'COMPARISON'
  | 'TREND'
  | 'DISTRIBUTION'
  | 'RELATIONSHIP'
  | 'HIERARCHICAL'
  | 'GEOGRAPHIC'
  | 'KPI'
  | 'TABLE'
  | '3D_IMMERSIVE'
  | 'ANIMATED'
  | 'STATISTICAL';

export interface ChartCategory {
  code: ChartCategoryCode;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  color: string;
}

export interface ChartType {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  description: string;
  category: string;
  categoryCode: ChartCategoryCode;
  icon: string;
  popular: boolean;
  new: boolean;
  useCases: string[];
  dataRequirements: string[];
  variants: string[];
  complexity: 'simple' | 'medium' | 'advanced';
  aiRecommended?: boolean;
}

// ============================================================================
// CHART CATEGORIES
// ============================================================================

export const CHART_CATEGORIES: ChartCategory[] = [
  {
    code: 'COMPARISON',
    name: 'Comparaison',
    nameEn: 'Comparison',
    description: 'Comparer des valeurs entre catégories',
    icon: 'BarChart3',
    color: '#3B82F6',
  },
  {
    code: 'TREND',
    name: 'Tendance',
    nameEn: 'Trend',
    description: 'Visualiser l\'évolution dans le temps',
    icon: 'TrendingUp',
    color: '#10B981',
  },
  {
    code: 'DISTRIBUTION',
    name: 'Distribution',
    nameEn: 'Distribution',
    description: 'Montrer la répartition des données',
    icon: 'PieChart',
    color: '#8B5CF6',
  },
  {
    code: 'RELATIONSHIP',
    name: 'Relation',
    nameEn: 'Relationship',
    description: 'Analyser les corrélations entre variables',
    icon: 'GitBranch',
    color: '#F59E0B',
  },
  {
    code: 'HIERARCHICAL',
    name: 'Hiérarchique',
    nameEn: 'Hierarchical',
    description: 'Représenter des structures imbriquées',
    icon: 'Layers',
    color: '#EC4899',
  },
  {
    code: 'GEOGRAPHIC',
    name: 'Géographique',
    nameEn: 'Geographic',
    description: 'Visualiser des données sur carte',
    icon: 'Map',
    color: '#06B6D4',
  },
  {
    code: 'KPI',
    name: 'Indicateurs',
    nameEn: 'KPI',
    description: 'Afficher des métriques clés',
    icon: 'Gauge',
    color: '#EF4444',
  },
  {
    code: 'TABLE',
    name: 'Tableaux',
    nameEn: 'Tables',
    description: 'Présenter des données tabulaires',
    icon: 'Table',
    color: '#6B7280',
  },
  {
    code: '3D_IMMERSIVE',
    name: '3D & Immersif',
    nameEn: '3D & Immersive',
    description: 'Visualisations tridimensionnelles',
    icon: 'Box',
    color: '#7C3AED',
  },
  {
    code: 'ANIMATED',
    name: 'Animé & Temps Réel',
    nameEn: 'Animated & Real-Time',
    description: 'Graphiques dynamiques et streaming',
    icon: 'Activity',
    color: '#14B8A6',
  },
  {
    code: 'STATISTICAL',
    name: 'Statistique Avancé',
    nameEn: 'Advanced Statistical',
    description: 'Analyses statistiques complexes',
    icon: 'Calculator',
    color: '#F97316',
  },
];

// ============================================================================
// CHART TYPES - COMPARISON (8 types)
// ============================================================================

const COMPARISON_CHARTS: ChartType[] = [
  {
    id: 'c1',
    code: 'BAR_CHART',
    name: 'Graphique en barres',
    nameEn: 'Bar Chart',
    description: 'Compare des valeurs entre différentes catégories. Le plus polyvalent des graphiques de comparaison.',
    category: 'Comparaison',
    categoryCode: 'COMPARISON',
    icon: 'BarChart3',
    popular: true,
    new: false,
    useCases: ['Comparaison de CA par enseigne', 'Loyers par locataire', 'Performance par zone'],
    dataRequirements: ['1 dimension catégorielle', '1+ mesures numériques'],
    variants: ['Horizontal', 'Vertical', 'Avec labels', 'Avec objectif'],
    complexity: 'simple',
  },
  {
    id: 'c2',
    code: 'COLUMN_CHART',
    name: 'Histogramme vertical',
    nameEn: 'Column Chart',
    description: 'Barres verticales pour comparer des valeurs. Idéal pour les séries temporelles courtes.',
    category: 'Comparaison',
    categoryCode: 'COMPARISON',
    icon: 'BarChart3',
    popular: true,
    new: false,
    useCases: ['CA mensuel', 'Fréquentation par mois', 'Comparaison N/N-1'],
    dataRequirements: ['1 dimension', '1+ mesures'],
    variants: ['Simple', 'Groupé', 'Avec ligne de tendance'],
    complexity: 'simple',
  },
  {
    id: 'c3',
    code: 'STACKED_BAR',
    name: 'Barres empilées',
    nameEn: 'Stacked Bar Chart',
    description: 'Montre la composition d\'un total avec les contributions de chaque partie.',
    category: 'Comparaison',
    categoryCode: 'COMPARISON',
    icon: 'BarChart3',
    popular: true,
    new: false,
    useCases: ['Répartition loyers par activité', 'Mix CA par catégorie', 'Budget par poste'],
    dataRequirements: ['1 dimension principale', '1 dimension de groupe', '1 mesure'],
    variants: ['Horizontal', 'Vertical', '100% empilé'],
    complexity: 'simple',
  },
  {
    id: 'c4',
    code: 'GROUPED_BAR',
    name: 'Barres groupées',
    nameEn: 'Grouped Bar Chart',
    description: 'Compare plusieurs séries côte à côte pour chaque catégorie.',
    category: 'Comparaison',
    categoryCode: 'COMPARISON',
    icon: 'BarChart3',
    popular: true,
    new: false,
    useCases: ['Comparaison N/N-1', 'Réalisé vs Budget', 'Multi-centres'],
    dataRequirements: ['1 dimension principale', '1 dimension de groupe', '1 mesure'],
    variants: ['Horizontal', 'Vertical'],
    complexity: 'simple',
  },
  {
    id: 'c5',
    code: 'WATERFALL_CHART',
    name: 'Graphique en cascade',
    nameEn: 'Waterfall Chart',
    description: 'Montre comment une valeur initiale évolue avec des ajouts et soustractions.',
    category: 'Comparaison',
    categoryCode: 'COMPARISON',
    icon: 'Activity',
    popular: true,
    new: false,
    useCases: ['Bridge NOI', 'Analyse des écarts', 'Décomposition du résultat'],
    dataRequirements: ['Valeur initiale', 'Variations +/-', 'Valeur finale'],
    variants: ['Horizontal', 'Vertical', 'Avec sous-totaux'],
    complexity: 'medium',
  },
  {
    id: 'c6',
    code: 'BULLET_CHART',
    name: 'Graphique à puces',
    nameEn: 'Bullet Chart',
    description: 'Compare une valeur à une cible avec des plages de performance. Compact et efficace.',
    category: 'Comparaison',
    categoryCode: 'COMPARISON',
    icon: 'Activity',
    popular: false,
    new: true,
    useCases: ['Objectifs commerciaux', 'KPIs vs cibles', 'Taux d\'occupation vs objectif'],
    dataRequirements: ['1 valeur actuelle', '1 valeur cible', 'Plages optionnelles'],
    variants: ['Horizontal', 'Vertical'],
    complexity: 'medium',
  },
  {
    id: 'c7',
    code: 'RADAR_CHART',
    name: 'Graphique radar',
    nameEn: 'Radar Chart',
    description: 'Compare plusieurs variables quantitatives sur des axes partant d\'un point central.',
    category: 'Comparaison',
    categoryCode: 'COMPARISON',
    icon: 'Target',
    popular: false,
    new: false,
    useCases: ['Score ESG multicritères', 'Benchmark enseignes', 'Profil de performance'],
    dataRequirements: ['3+ dimensions', '1 mesure par dimension'],
    variants: ['Simple', 'Rempli', 'Multiple'],
    complexity: 'medium',
  },
  {
    id: 'c8',
    code: 'LOLLIPOP_CHART',
    name: 'Graphique sucette',
    nameEn: 'Lollipop Chart',
    description: 'Version épurée du graphique en barres, avec un point et une ligne.',
    category: 'Comparaison',
    categoryCode: 'COMPARISON',
    icon: 'Activity',
    popular: false,
    new: true,
    useCases: ['Classements', 'Top N enseignes', 'Variations de loyers'],
    dataRequirements: ['1 dimension', '1 mesure'],
    variants: ['Horizontal', 'Vertical', 'Avec marqueurs'],
    complexity: 'simple',
  },
];

// ============================================================================
// CHART TYPES - TREND (7 types)
// ============================================================================

const TREND_CHARTS: ChartType[] = [
  {
    id: 'c9',
    code: 'LINE_CHART',
    name: 'Graphique linéaire',
    nameEn: 'Line Chart',
    description: 'Visualise les tendances et l\'évolution des données dans le temps.',
    category: 'Tendance',
    categoryCode: 'TREND',
    icon: 'LineChart',
    popular: true,
    new: false,
    useCases: ['Évolution du CA', 'Tendances fréquentation', 'Historique NOI'],
    dataRequirements: ['1 dimension temporelle', '1+ mesures'],
    variants: ['Simple', 'Multi-séries', 'Avec marqueurs', 'Lissé'],
    complexity: 'simple',
  },
  {
    id: 'c10',
    code: 'AREA_CHART',
    name: 'Graphique en aires',
    nameEn: 'Area Chart',
    description: 'Comme le graphique linéaire mais avec l\'aire sous la courbe remplie.',
    category: 'Tendance',
    categoryCode: 'TREND',
    icon: 'AreaChart',
    popular: true,
    new: false,
    useCases: ['CA cumulé', 'Parts de marché dans le temps', 'Flux de trésorerie'],
    dataRequirements: ['1 dimension temporelle', '1+ mesures'],
    variants: ['Simple', 'Empilé', '100% empilé', 'Stream'],
    complexity: 'simple',
  },
  {
    id: 'c11',
    code: 'SPARKLINE',
    name: 'Sparkline',
    nameEn: 'Sparkline',
    description: 'Mini graphique intégré dans une cellule pour montrer une tendance.',
    category: 'Tendance',
    categoryCode: 'TREND',
    icon: 'Activity',
    popular: true,
    new: false,
    useCases: ['Tableaux de bord', 'Dans les tableaux', 'KPI cards'],
    dataRequirements: ['Série de valeurs temporelles'],
    variants: ['Ligne', 'Barre', 'Win/Loss'],
    complexity: 'simple',
  },
  {
    id: 'c12',
    code: 'COMBO_CHART',
    name: 'Graphique combiné',
    nameEn: 'Combo Chart',
    description: 'Combine barres et lignes pour montrer différentes mesures sur le même graphique.',
    category: 'Tendance',
    categoryCode: 'TREND',
    icon: 'BarChart3',
    popular: true,
    new: false,
    useCases: ['CA et fréquentation', 'Volume et prix', 'NOI et taux d\'occupation'],
    dataRequirements: ['1 dimension', '2+ mesures d\'échelles différentes'],
    variants: ['Barres + Ligne', 'Aires + Ligne', 'Double axe Y'],
    complexity: 'medium',
  },
  {
    id: 'c13',
    code: 'STEP_CHART',
    name: 'Graphique en escalier',
    nameEn: 'Step Chart',
    description: 'Montre les changements discrets entre périodes sans interpolation.',
    category: 'Tendance',
    categoryCode: 'TREND',
    icon: 'Activity',
    popular: false,
    new: false,
    useCases: ['Tarification par palier', 'Changements de loyer', 'Évolution des taux'],
    dataRequirements: ['1 dimension temporelle', '1 mesure discrète'],
    variants: ['Avant', 'Après', 'Centre'],
    complexity: 'simple',
  },
  {
    id: 'c14',
    code: 'SLOPE_CHART',
    name: 'Graphique de pente',
    nameEn: 'Slope Chart',
    description: 'Compare deux points dans le temps en montrant la direction et l\'amplitude du changement.',
    category: 'Tendance',
    categoryCode: 'TREND',
    icon: 'TrendingUp',
    popular: false,
    new: true,
    useCases: ['Avant/Après travaux', 'Classement T1 vs T2', 'Évolution annuelle'],
    dataRequirements: ['2 périodes', '1 mesure', 'Catégories multiples'],
    variants: ['Simple', 'Avec labels'],
    complexity: 'medium',
  },
  {
    id: 'c15',
    code: 'RANGE_AREA',
    name: 'Aire avec intervalle',
    nameEn: 'Range Area Chart',
    description: 'Affiche une plage de valeurs (min-max) au fil du temps.',
    category: 'Tendance',
    categoryCode: 'TREND',
    icon: 'Activity',
    popular: false,
    new: false,
    useCases: ['Prévisions avec incertitude', 'Min/Max quotidien', 'Bandes de confiance'],
    dataRequirements: ['Temps', 'Valeur min', 'Valeur max'],
    variants: ['Simple', 'Avec ligne centrale', 'Multi-bandes'],
    complexity: 'medium',
  },
];

// ============================================================================
// CHART TYPES - DISTRIBUTION (6 types)
// ============================================================================

const DISTRIBUTION_CHARTS: ChartType[] = [
  {
    id: 'c16',
    code: 'PIE_CHART',
    name: 'Diagramme circulaire',
    nameEn: 'Pie Chart',
    description: 'Montre la répartition d\'un total en pourcentages. Limiter à 5-7 segments.',
    category: 'Distribution',
    categoryCode: 'DISTRIBUTION',
    icon: 'PieChart',
    popular: true,
    new: false,
    useCases: ['Mix activités', 'Répartition loyers', 'Part des enseignes'],
    dataRequirements: ['1 dimension catégorielle', '1 mesure'],
    variants: ['Simple', 'Avec labels', 'Explosé'],
    complexity: 'simple',
  },
  {
    id: 'c17',
    code: 'DONUT_CHART',
    name: 'Graphique en anneau',
    nameEn: 'Donut Chart',
    description: 'Version du pie chart avec un trou central, permettant d\'afficher une valeur clé.',
    category: 'Distribution',
    categoryCode: 'DISTRIBUTION',
    icon: 'PieChart',
    popular: true,
    new: false,
    useCases: ['Taux d\'occupation', 'Progression objectif', 'KPI central'],
    dataRequirements: ['1 dimension', '1 mesure', 'Optionnel: KPI central'],
    variants: ['Simple', 'Demi-anneau', 'Multiples'],
    complexity: 'simple',
  },
  {
    id: 'c18',
    code: 'FUNNEL_CHART',
    name: 'Graphique en entonnoir',
    nameEn: 'Funnel Chart',
    description: 'Visualise les étapes d\'un processus avec les taux de conversion.',
    category: 'Distribution',
    categoryCode: 'DISTRIBUTION',
    icon: 'Filter',
    popular: true,
    new: false,
    useCases: ['Tunnel de commercialisation', 'Conversion visiteurs', 'Processus de bail'],
    dataRequirements: ['Étapes ordonnées', 'Valeur par étape'],
    variants: ['Simple', 'Avec pourcentages', 'Comparatif'],
    complexity: 'medium',
  },
  {
    id: 'c19',
    code: 'HISTOGRAM',
    name: 'Histogramme de distribution',
    nameEn: 'Histogram',
    description: 'Montre la distribution de fréquence d\'une variable continue.',
    category: 'Distribution',
    categoryCode: 'DISTRIBUTION',
    icon: 'BarChart3',
    popular: false,
    new: false,
    useCases: ['Distribution des loyers', 'Répartition des surfaces', 'Analyse statistique'],
    dataRequirements: ['1 variable continue', 'Intervalles (bins)'],
    variants: ['Simple', 'Avec courbe normale', 'Cumulatif'],
    complexity: 'medium',
  },
  {
    id: 'c20',
    code: 'BOX_PLOT',
    name: 'Boîte à moustaches',
    nameEn: 'Box Plot',
    description: 'Affiche la distribution statistique: médiane, quartiles, outliers.',
    category: 'Distribution',
    categoryCode: 'DISTRIBUTION',
    icon: 'Box',
    popular: false,
    new: false,
    useCases: ['Comparaison de distributions', 'Détection d\'outliers', 'Benchmark loyers'],
    dataRequirements: ['1 variable continue', 'Optionnel: groupes'],
    variants: ['Vertical', 'Horizontal', 'Violin'],
    complexity: 'advanced',
  },
  {
    id: 'c21',
    code: 'WAFFLE_CHART',
    name: 'Graphique en gaufre',
    nameEn: 'Waffle Chart',
    description: 'Grille de carrés représentant des pourcentages de manière visuelle.',
    category: 'Distribution',
    categoryCode: 'DISTRIBUTION',
    icon: 'Grid3X3',
    popular: false,
    new: true,
    useCases: ['Taux d\'occupation visuel', 'Progression 100%', 'Parts de marché'],
    dataRequirements: ['Catégories', 'Pourcentages'],
    variants: ['10x10', '5x20', 'Avec icônes'],
    complexity: 'simple',
  },
];

// ============================================================================
// CHART TYPES - RELATIONSHIP (5 types)
// ============================================================================

const RELATIONSHIP_CHARTS: ChartType[] = [
  {
    id: 'c22',
    code: 'SCATTER_PLOT',
    name: 'Nuage de points',
    nameEn: 'Scatter Plot',
    description: 'Montre la relation entre deux variables numériques.',
    category: 'Relation',
    categoryCode: 'RELATIONSHIP',
    icon: 'Circle',
    popular: true,
    new: false,
    useCases: ['Corrélation loyer/CA', 'Surface vs Performance', 'Analyse de régression'],
    dataRequirements: ['2 mesures numériques', 'Optionnel: dimension pour couleur/taille'],
    variants: ['Simple', 'Avec régression', 'Bubble'],
    complexity: 'medium',
  },
  {
    id: 'c23',
    code: 'BUBBLE_CHART',
    name: 'Graphique à bulles',
    nameEn: 'Bubble Chart',
    description: 'Scatter plot avec une 3e dimension représentée par la taille des bulles.',
    category: 'Relation',
    categoryCode: 'RELATIONSHIP',
    icon: 'Circle',
    popular: true,
    new: false,
    useCases: ['Matrice CA/Surface/Loyer', 'Analyse de portefeuille', 'Segmentation enseignes'],
    dataRequirements: ['2 mesures pour X/Y', '1 mesure pour taille', 'Optionnel: couleur'],
    variants: ['Simple', 'Avec labels', 'Animé'],
    complexity: 'medium',
  },
  {
    id: 'c24',
    code: 'HEATMAP',
    name: 'Carte de chaleur',
    nameEn: 'Heatmap',
    description: 'Matrice colorée montrant l\'intensité des valeurs à l\'intersection de deux dimensions.',
    category: 'Relation',
    categoryCode: 'RELATIONSHIP',
    icon: 'Flame',
    popular: true,
    new: false,
    useCases: ['Fréquentation heure/jour', 'Performance par zone/activité', 'Corrélations'],
    dataRequirements: ['2 dimensions catégorielles', '1 mesure numérique'],
    variants: ['Simple', 'Avec valeurs', 'Divergente'],
    complexity: 'medium',
  },
  {
    id: 'c25',
    code: 'CORRELATION_MATRIX',
    name: 'Matrice de corrélation',
    nameEn: 'Correlation Matrix',
    description: 'Visualise les corrélations entre plusieurs variables.',
    category: 'Relation',
    categoryCode: 'RELATIONSHIP',
    icon: 'Grid3X3',
    popular: false,
    new: false,
    useCases: ['Analyse exploratoire', 'Sélection de KPIs', 'Data science'],
    dataRequirements: ['3+ variables numériques'],
    variants: ['Couleur', 'Avec valeurs', 'Demi-matrice'],
    complexity: 'advanced',
  },
  {
    id: 'c26',
    code: 'NETWORK_GRAPH',
    name: 'Graphe de réseau',
    nameEn: 'Network Graph',
    description: 'Visualise les connexions et relations entre entités.',
    category: 'Relation',
    categoryCode: 'RELATIONSHIP',
    icon: 'GitBranch',
    popular: false,
    new: true,
    useCases: ['Relations enseignes-groupes', 'Flux entre zones', 'Organisation'],
    dataRequirements: ['Nœuds', 'Liens', 'Optionnel: poids'],
    variants: ['Force-directed', 'Hiérarchique', 'Circulaire'],
    complexity: 'advanced',
  },
];

// ============================================================================
// CHART TYPES - HIERARCHICAL (4 types)
// ============================================================================

const HIERARCHICAL_CHARTS: ChartType[] = [
  {
    id: 'c27',
    code: 'TREEMAP',
    name: 'Treemap',
    nameEn: 'Treemap',
    description: 'Rectangles imbriqués montrant les proportions et la hiérarchie.',
    category: 'Hiérarchique',
    categoryCode: 'HIERARCHICAL',
    icon: 'LayoutGrid',
    popular: true,
    new: false,
    useCases: ['Structure des loyers', 'Mix activités', 'Répartition surfaces'],
    dataRequirements: ['1+ dimensions hiérarchiques', '1 mesure pour taille', 'Optionnel: mesure pour couleur'],
    variants: ['Simple', 'Avec labels', 'Avec drill-down'],
    complexity: 'medium',
  },
  {
    id: 'c28',
    code: 'SUNBURST',
    name: 'Diagramme soleil',
    nameEn: 'Sunburst Chart',
    description: 'Représentation circulaire d\'une hiérarchie multi-niveaux.',
    category: 'Hiérarchique',
    categoryCode: 'HIERARCHICAL',
    icon: 'Target',
    popular: false,
    new: false,
    useCases: ['Structure organisationnelle', 'Catégories imbriquées', 'Navigation données'],
    dataRequirements: ['2+ niveaux hiérarchiques', '1 mesure'],
    variants: ['Simple', 'Interactif', 'Avec zoom'],
    complexity: 'medium',
  },
  {
    id: 'c29',
    code: 'SANKEY_DIAGRAM',
    name: 'Diagramme de Sankey',
    nameEn: 'Sankey Diagram',
    description: 'Montre les flux et transferts entre catégories avec largeur proportionnelle.',
    category: 'Hiérarchique',
    categoryCode: 'HIERARCHICAL',
    icon: 'GitBranch',
    popular: true,
    new: false,
    useCases: ['Flux financiers', 'Parcours visiteurs', 'Décomposition revenus'],
    dataRequirements: ['Source', 'Destination', 'Valeur du flux'],
    variants: ['Horizontal', 'Vertical', 'Multi-niveaux'],
    complexity: 'advanced',
  },
  {
    id: 'c30',
    code: 'ORG_CHART',
    name: 'Organigramme',
    nameEn: 'Organization Chart',
    description: 'Représente la structure hiérarchique d\'une organisation.',
    category: 'Hiérarchique',
    categoryCode: 'HIERARCHICAL',
    icon: 'Users',
    popular: false,
    new: false,
    useCases: ['Structure équipes', 'Hiérarchie locataires', 'Arbre de décision'],
    dataRequirements: ['Parent', 'Enfant', 'Optionnel: attributs'],
    variants: ['Vertical', 'Horizontal', 'Radial'],
    complexity: 'medium',
  },
];

// ============================================================================
// CHART TYPES - GEOGRAPHIC (4 types)
// ============================================================================

const GEOGRAPHIC_CHARTS: ChartType[] = [
  {
    id: 'c31',
    code: 'CHOROPLETH_MAP',
    name: 'Carte choroplèthe',
    nameEn: 'Choropleth Map',
    description: 'Carte où les régions sont colorées selon une valeur.',
    category: 'Géographique',
    categoryCode: 'GEOGRAPHIC',
    icon: 'Map',
    popular: true,
    new: false,
    useCases: ['Performance par région', 'Zone de chalandise', 'Densité population'],
    dataRequirements: ['Codes géographiques', '1 mesure numérique'],
    variants: ['France', 'Régions', 'Départements', 'Communes'],
    complexity: 'medium',
  },
  {
    id: 'c32',
    code: 'BUBBLE_MAP',
    name: 'Carte à bulles',
    nameEn: 'Bubble Map',
    description: 'Points géolocalisés dont la taille représente une valeur.',
    category: 'Géographique',
    categoryCode: 'GEOGRAPHIC',
    icon: 'Map',
    popular: true,
    new: false,
    useCases: ['Localisation des centres', 'Points de vente', 'CA par site'],
    dataRequirements: ['Coordonnées (lat/lng)', '1 mesure pour taille'],
    variants: ['Simple', 'Clustered', 'Avec heatmap'],
    complexity: 'medium',
  },
  {
    id: 'c33',
    code: 'FLOW_MAP',
    name: 'Carte de flux',
    nameEn: 'Flow Map',
    description: 'Montre les mouvements et connexions entre localisations.',
    category: 'Géographique',
    categoryCode: 'GEOGRAPHIC',
    icon: 'Map',
    popular: false,
    new: true,
    useCases: ['Flux clients', 'Logistique', 'Provenance visiteurs'],
    dataRequirements: ['Origine (lat/lng)', 'Destination (lat/lng)', 'Volume'],
    variants: ['Lignes', 'Arcs', 'Animé'],
    complexity: 'advanced',
  },
  {
    id: 'c34',
    code: 'FLOOR_PLAN',
    name: 'Plan d\'étage',
    nameEn: 'Floor Plan',
    description: 'Visualisation des données sur un plan de bâtiment.',
    category: 'Géographique',
    categoryCode: 'GEOGRAPHIC',
    icon: 'Map',
    popular: true,
    new: false,
    useCases: ['Occupation par lot', 'Performance par zone', 'Flux visiteurs'],
    dataRequirements: ['Plan SVG', 'Identifiants zones', 'Mesures par zone'],
    variants: ['Heatmap', 'Statut', 'Avec données'],
    complexity: 'advanced',
    aiRecommended: true,
  },
];

// ============================================================================
// CHART TYPES - KPI (6 types)
// ============================================================================

const KPI_CHARTS: ChartType[] = [
  {
    id: 'c35',
    code: 'GAUGE_CHART',
    name: 'Jauge',
    nameEn: 'Gauge Chart',
    description: 'Affiche une valeur unique par rapport à un objectif ou des seuils.',
    category: 'Indicateurs',
    categoryCode: 'KPI',
    icon: 'Gauge',
    popular: true,
    new: false,
    useCases: ['Taux d\'occupation', 'Score performance', 'Atteinte objectif'],
    dataRequirements: ['1 valeur', 'Min/Max', 'Optionnel: seuils'],
    variants: ['Demi-cercle', 'Cercle complet', 'Linéaire'],
    complexity: 'simple',
  },
  {
    id: 'c36',
    code: 'KPI_CARD',
    name: 'Carte KPI',
    nameEn: 'KPI Card',
    description: 'Affiche un indicateur clé avec comparaison et tendance.',
    category: 'Indicateurs',
    categoryCode: 'KPI',
    icon: 'Activity',
    popular: true,
    new: false,
    useCases: ['NOI', 'CA mensuel', 'Fréquentation', 'Vacance'],
    dataRequirements: ['Valeur actuelle', 'Optionnel: comparaison, tendance'],
    variants: ['Simple', 'Avec sparkline', 'Avec comparaison'],
    complexity: 'simple',
  },
  {
    id: 'c37',
    code: 'PROGRESS_BAR',
    name: 'Barre de progression',
    nameEn: 'Progress Bar',
    description: 'Montre l\'avancement vers un objectif.',
    category: 'Indicateurs',
    categoryCode: 'KPI',
    icon: 'Activity',
    popular: true,
    new: false,
    useCases: ['Progression commercialisation', 'Objectif annuel', 'Recouvrement'],
    dataRequirements: ['Valeur actuelle', 'Valeur cible'],
    variants: ['Horizontal', 'Circulaire', 'Segmenté'],
    complexity: 'simple',
  },
  {
    id: 'c38',
    code: 'TRAFFIC_LIGHT',
    name: 'Feu tricolore',
    nameEn: 'Traffic Light',
    description: 'Indicateur visuel simple pour le statut (vert/orange/rouge).',
    category: 'Indicateurs',
    categoryCode: 'KPI',
    icon: 'Activity',
    popular: false,
    new: false,
    useCases: ['Statut projets', 'Niveau d\'alerte', 'Conformité'],
    dataRequirements: ['1 valeur', 'Seuils pour couleurs'],
    variants: ['Vertical', 'Horizontal', 'Avec label'],
    complexity: 'simple',
  },
  {
    id: 'c39',
    code: 'METRIC_TILE',
    name: 'Tuile métrique',
    nameEn: 'Metric Tile',
    description: 'Ensemble de métriques dans une tuile compacte et visuelle.',
    category: 'Indicateurs',
    categoryCode: 'KPI',
    icon: 'LayoutGrid',
    popular: false,
    new: true,
    useCases: ['Dashboard exécutif', 'Résumé performance', 'KPIs multiples'],
    dataRequirements: ['1-4 métriques', 'Optionnel: icônes, couleurs'],
    variants: ['1 métrique', '2 métriques', '4 métriques'],
    complexity: 'simple',
  },
  {
    id: 'c40',
    code: 'COMPARISON_INDICATOR',
    name: 'Indicateur de comparaison',
    nameEn: 'Comparison Indicator',
    description: 'Compare une valeur à une référence avec variation en %.',
    category: 'Indicateurs',
    categoryCode: 'KPI',
    icon: 'TrendingUp',
    popular: true,
    new: false,
    useCases: ['Variation N/N-1', 'vs Budget', 'vs Objectif'],
    dataRequirements: ['Valeur actuelle', 'Valeur de référence'],
    variants: ['Simple', 'Avec flèche', 'Avec barre'],
    complexity: 'simple',
  },
];

// ============================================================================
// CHART TYPES - TABLE (4 types)
// ============================================================================

const TABLE_CHARTS: ChartType[] = [
  {
    id: 'c41',
    code: 'DATA_TABLE',
    name: 'Tableau de données',
    nameEn: 'Data Table',
    description: 'Affichage tabulaire classique avec tri, filtres et pagination.',
    category: 'Tableaux',
    categoryCode: 'TABLE',
    icon: 'Table',
    popular: true,
    new: false,
    useCases: ['État locatif', 'Liste enseignes', 'Détail transactions'],
    dataRequirements: ['Colonnes', 'Lignes de données'],
    variants: ['Simple', 'Avec totaux', 'Avec sparklines', 'Avec formatage conditionnel'],
    complexity: 'simple',
  },
  {
    id: 'c42',
    code: 'PIVOT_TABLE',
    name: 'Tableau croisé dynamique',
    nameEn: 'Pivot Table',
    description: 'Agrège les données selon plusieurs dimensions avec totaux.',
    category: 'Tableaux',
    categoryCode: 'TABLE',
    icon: 'Table',
    popular: true,
    new: false,
    useCases: ['Analyse multidimensionnelle', 'Reporting financier', 'CA par activité/mois'],
    dataRequirements: ['1+ dimensions en ligne', '1+ dimensions en colonne', '1+ mesures'],
    variants: ['Simple', 'Avec sous-totaux', 'Avec drill-down'],
    complexity: 'medium',
  },
  {
    id: 'c43',
    code: 'MATRIX',
    name: 'Matrice',
    nameEn: 'Matrix',
    description: 'Tableau avec formatage conditionnel et visualisations intégrées.',
    category: 'Tableaux',
    categoryCode: 'TABLE',
    icon: 'Grid3X3',
    popular: false,
    new: false,
    useCases: ['Scorecard', 'Comparaison multicritères', 'Performance enseignes'],
    dataRequirements: ['2 dimensions', '1 mesure'],
    variants: ['Couleur', 'Avec barres', 'Avec icônes'],
    complexity: 'medium',
  },
  {
    id: 'c44',
    code: 'CROSSTAB',
    name: 'Tableau croisé',
    nameEn: 'Crosstab',
    description: 'Croisement de deux dimensions avec mesures à l\'intersection.',
    category: 'Tableaux',
    categoryCode: 'TABLE',
    icon: 'Table',
    popular: false,
    new: false,
    useCases: ['CA par enseigne et mois', 'Analyse bidimensionnelle'],
    dataRequirements: ['1 dimension en ligne', '1 dimension en colonne', '1 mesure'],
    variants: ['Simple', 'Avec totaux', 'Avec heatmap'],
    complexity: 'medium',
  },
];

// ============================================================================
// CHART TYPES - 3D & IMMERSIVE (6 types)
// ============================================================================

const IMMERSIVE_3D_CHARTS: ChartType[] = [
  {
    id: 'c45',
    code: '3D_BAR_CHART',
    name: 'Barres 3D',
    nameEn: '3D Bar Chart',
    description: 'Histogramme tridimensionnel avec profondeur et perspective.',
    category: '3D & Immersif',
    categoryCode: '3D_IMMERSIVE',
    icon: 'Box',
    popular: true,
    new: false,
    useCases: ['Présentations exécutives', 'Comparaisons premium', 'Dashboards innovants'],
    dataRequirements: ['1-2 dimensions', '1+ mesures'],
    variants: ['Perspective', 'Isométrique', 'Animé', 'Avec ombres'],
    complexity: 'medium',
  },
  {
    id: 'c46',
    code: '3D_PIE_CHART',
    name: 'Camembert 3D',
    nameEn: '3D Pie Chart',
    description: 'Diagramme circulaire avec effet de profondeur et inclinaison.',
    category: '3D & Immersif',
    categoryCode: '3D_IMMERSIVE',
    icon: 'PieChart',
    popular: true,
    new: false,
    useCases: ['Répartitions élégantes', 'Présentations', 'Infographies'],
    dataRequirements: ['1 dimension', '1 mesure'],
    variants: ['Incliné', 'Explosé 3D', 'Donut 3D', 'Avec reflets'],
    complexity: 'medium',
  },
  {
    id: 'c47',
    code: '3D_SCATTER',
    name: 'Nuage de points 3D',
    nameEn: '3D Scatter Plot',
    description: 'Scatter plot dans l\'espace 3D avec rotation interactive.',
    category: '3D & Immersif',
    categoryCode: '3D_IMMERSIVE',
    icon: 'Circle',
    popular: true,
    new: false,
    useCases: ['Clustering 3D', 'Analyse multidimensionnelle', 'Data Science'],
    dataRequirements: ['3 mesures numériques', 'Optionnel: couleur, taille'],
    variants: ['Points', 'Sphères', 'Avec trajectoires', 'Clusters colorés'],
    complexity: 'advanced',
  },
  {
    id: 'c48',
    code: '3D_SURFACE',
    name: 'Surface 3D',
    nameEn: '3D Surface',
    description: 'Visualisation de données sur une surface tridimensionnelle continue.',
    category: '3D & Immersif',
    categoryCode: '3D_IMMERSIVE',
    icon: 'Layers',
    popular: false,
    new: false,
    useCases: ['Données topographiques', 'Analyse de surface', 'Heatmap 3D'],
    dataRequirements: ['X, Y, Z coordonnées', 'Grille de données'],
    variants: ['Wireframe', 'Solid', 'Contour', 'Gradient'],
    complexity: 'advanced',
  },
  {
    id: 'c49',
    code: '3D_GLOBE',
    name: 'Globe terrestre 3D',
    nameEn: '3D Globe',
    description: 'Visualisation géographique sur un globe rotatif interactif.',
    category: '3D & Immersif',
    categoryCode: '3D_IMMERSIVE',
    icon: 'Map',
    popular: true,
    new: true,
    useCases: ['Données mondiales', 'Connexions internationales', 'Implantations globales'],
    dataRequirements: ['Coordonnées GPS', 'Mesures par pays'],
    variants: ['Jour/Nuit', 'Arcs de connexion', 'Heatmap sphérique', 'Points lumineux'],
    complexity: 'advanced',
  },
  {
    id: 'c50',
    code: 'ISOMETRIC_CHART',
    name: 'Graphique isométrique',
    nameEn: 'Isometric Chart',
    description: 'Visualisation avec projection isométrique 2.5D élégante.',
    category: '3D & Immersif',
    categoryCode: '3D_IMMERSIVE',
    icon: 'Box',
    popular: true,
    new: false,
    useCases: ['Infographies', 'Présentations modernes', 'Design premium'],
    dataRequirements: ['1-2 dimensions', '1+ mesures'],
    variants: ['Barres', 'Blocs', 'Icônes', 'Avec ombres'],
    complexity: 'medium',
  },
];

// ============================================================================
// CHART TYPES - ANIMATED (6 types)
// ============================================================================

const ANIMATED_CHARTS: ChartType[] = [
  {
    id: 'c51',
    code: 'LIVE_STREAM',
    name: 'Streaming temps réel',
    nameEn: 'Live Stream Chart',
    description: 'Graphique qui se met à jour en continu avec les données entrantes.',
    category: 'Animé & Temps Réel',
    categoryCode: 'ANIMATED',
    icon: 'Activity',
    popular: true,
    new: false,
    useCases: ['Fréquentation live', 'Monitoring', 'Analytics temps réel'],
    dataRequirements: ['Flux de données', 'Timestamp'],
    variants: ['Ligne scrollante', 'Points', 'Avec historique', 'Multi-séries'],
    complexity: 'advanced',
  },
  {
    id: 'c52',
    code: 'BAR_CHART_RACE',
    name: 'Bar Chart Race',
    nameEn: 'Bar Chart Race',
    description: 'Course de barres animée montrant l\'évolution des classements dans le temps.',
    category: 'Animé & Temps Réel',
    categoryCode: 'ANIMATED',
    icon: 'BarChart3',
    popular: true,
    new: true,
    useCases: ['Évolution des classements', 'Top enseignes par année', 'Historique CA'],
    dataRequirements: ['Dimension temporelle', 'Catégories', 'Valeurs'],
    variants: ['Horizontal', 'Avec avatars', 'Avec compteur'],
    complexity: 'advanced',
  },
  {
    id: 'c53',
    code: 'ANIMATED_DONUT',
    name: 'Donut animé',
    nameEn: 'Animated Donut',
    description: 'Anneau qui s\'anime pour révéler progressivement les valeurs.',
    category: 'Animé & Temps Réel',
    categoryCode: 'ANIMATED',
    icon: 'PieChart',
    popular: true,
    new: false,
    useCases: ['Chargement', 'Progression', 'Scores animés'],
    dataRequirements: ['Valeur actuelle', 'Maximum'],
    variants: ['Simple', 'Avec icône', 'Multi-anneaux', 'Gradient'],
    complexity: 'medium',
  },
  {
    id: 'c54',
    code: 'PARTICLE_FLOW',
    name: 'Flux de particules',
    nameEn: 'Particle Flow',
    description: 'Particules animées montrant des flux et mouvements de données.',
    category: 'Animé & Temps Réel',
    categoryCode: 'ANIMATED',
    icon: 'Activity',
    popular: true,
    new: true,
    useCases: ['Flux visiteurs', 'Mouvements', 'Transferts'],
    dataRequirements: ['Source', 'Destination', 'Volume'],
    variants: ['Points', 'Lignes', 'Avec traînée', 'Coloré par catégorie'],
    complexity: 'advanced',
  },
  {
    id: 'c55',
    code: 'TICKER_TAPE',
    name: 'Bandeau défilant',
    nameEn: 'Ticker Tape',
    description: 'Données défilant horizontalement style ticker.',
    category: 'Animé & Temps Réel',
    categoryCode: 'ANIMATED',
    icon: 'Activity',
    popular: true,
    new: false,
    useCases: ['KPIs temps réel', 'Alertes', 'News'],
    dataRequirements: ['Flux de valeurs', 'Labels'],
    variants: ['Simple', 'Avec graphiques mini', 'Coloré +/-'],
    complexity: 'simple',
  },
  {
    id: 'c56',
    code: 'COUNTDOWN_TIMER',
    name: 'Compte à rebours',
    nameEn: 'Countdown Timer',
    description: 'Timer visuel avec animations pour les deadlines.',
    category: 'Animé & Temps Réel',
    categoryCode: 'ANIMATED',
    icon: 'Clock',
    popular: false,
    new: false,
    useCases: ['Événements', 'Deadlines baux', 'Échéances'],
    dataRequirements: ['Date/heure cible'],
    variants: ['Digital', 'Analogique', 'Progressif', 'Flip clock'],
    complexity: 'simple',
  },
];

// ============================================================================
// CHART TYPES - STATISTICAL (8 types)
// ============================================================================

const STATISTICAL_CHARTS: ChartType[] = [
  {
    id: 'c57',
    code: 'DENSITY_PLOT',
    name: 'Courbe de densité',
    nameEn: 'Density Plot',
    description: 'Distribution de probabilité estimée par noyau (KDE).',
    category: 'Statistique Avancé',
    categoryCode: 'STATISTICAL',
    icon: 'TrendingUp',
    popular: true,
    new: false,
    useCases: ['Distribution des loyers', 'Comparaison de populations', 'Statistiques'],
    dataRequirements: ['Variable continue'],
    variants: ['Simple', 'Empilé', 'Ridgeline', 'Violin'],
    complexity: 'advanced',
  },
  {
    id: 'c58',
    code: 'VIOLIN_PLOT',
    name: 'Graphique en violon',
    nameEn: 'Violin Plot',
    description: 'Combine boxplot et densité pour une vue complète de la distribution.',
    category: 'Statistique Avancé',
    categoryCode: 'STATISTICAL',
    icon: 'Box',
    popular: true,
    new: false,
    useCases: ['Comparaison de distributions', 'Analyse statistique', 'Benchmark'],
    dataRequirements: ['Variable continue', 'Groupes'],
    variants: ['Simple', 'Split', 'Avec points', 'Avec boxplot'],
    complexity: 'advanced',
  },
  {
    id: 'c59',
    code: 'REGRESSION_PLOT',
    name: 'Régression linéaire',
    nameEn: 'Regression Plot',
    description: 'Scatter plot avec droite de régression et intervalles de confiance.',
    category: 'Statistique Avancé',
    categoryCode: 'STATISTICAL',
    icon: 'TrendingUp',
    popular: true,
    new: false,
    useCases: ['Corrélation', 'Prédiction', 'Modélisation'],
    dataRequirements: ['Variable X', 'Variable Y'],
    variants: ['Linéaire', 'Polynomial', 'LOESS', 'Avec résidus'],
    complexity: 'advanced',
  },
  {
    id: 'c60',
    code: 'CONFIDENCE_INTERVAL',
    name: 'Intervalle de confiance',
    nameEn: 'Confidence Interval',
    description: 'Visualise les incertitudes avec des bandes de confiance.',
    category: 'Statistique Avancé',
    categoryCode: 'STATISTICAL',
    icon: 'Activity',
    popular: true,
    new: false,
    useCases: ['Prévisions', 'Estimations', 'Incertitude'],
    dataRequirements: ['Moyenne', 'Écart-type ou IC'],
    variants: ['Bandes', 'Error bars', 'Fan chart', 'Bootstrap'],
    complexity: 'advanced',
  },
  {
    id: 'c61',
    code: 'PARALLEL_COORDINATES',
    name: 'Coordonnées parallèles',
    nameEn: 'Parallel Coordinates',
    description: 'Visualise les relations entre plusieurs variables continues.',
    category: 'Statistique Avancé',
    categoryCode: 'STATISTICAL',
    icon: 'Activity',
    popular: true,
    new: false,
    useCases: ['Analyse multivariée', 'Clustering', 'Outliers'],
    dataRequirements: ['3+ variables numériques'],
    variants: ['Simple', 'Avec brushing', 'Coloré par cluster', 'Interactif'],
    complexity: 'advanced',
  },
  {
    id: 'c62',
    code: 'HEXBIN',
    name: 'Hexbin',
    nameEn: 'Hexbin',
    description: 'Agrégation en hexagones pour les grands nuages de points.',
    category: 'Statistique Avancé',
    categoryCode: 'STATISTICAL',
    icon: 'Grid3X3',
    popular: true,
    new: false,
    useCases: ['Big data', 'Densité 2D', 'Géospatial'],
    dataRequirements: ['X', 'Y', 'Grand volume'],
    variants: ['Simple', 'Avec taille', 'Logarithmique', 'Avec stats'],
    complexity: 'advanced',
  },
  {
    id: 'c63',
    code: 'CONTOUR_PLOT',
    name: 'Courbes de niveau',
    nameEn: 'Contour Plot',
    description: 'Lignes d\'iso-valeurs montrant les gradients de données.',
    category: 'Statistique Avancé',
    categoryCode: 'STATISTICAL',
    icon: 'Layers',
    popular: true,
    new: false,
    useCases: ['Densité 2D', 'Optimisation', 'Zones de chaleur'],
    dataRequirements: ['X', 'Y', 'Z ou densité'],
    variants: ['Lignes', 'Rempli', 'Avec points', '3D'],
    complexity: 'advanced',
  },
  {
    id: 'c64',
    code: 'BEESWARM',
    name: 'Beeswarm / Essaim',
    nameEn: 'Beeswarm Plot',
    description: 'Points disposés comme un essaim d\'abeilles sans chevauchement.',
    category: 'Statistique Avancé',
    categoryCode: 'STATISTICAL',
    icon: 'Activity',
    popular: true,
    new: true,
    useCases: ['Distribution exacte', 'Petits datasets', 'Comparaisons'],
    dataRequirements: ['Catégories', 'Valeurs numériques'],
    variants: ['Horizontal', 'Vertical', 'Coloré', 'Avec violin'],
    complexity: 'medium',
  },
];

// ============================================================================
// ALL CHARTS COMBINED
// ============================================================================

export const ALL_CHART_TYPES: ChartType[] = [
  ...COMPARISON_CHARTS,
  ...TREND_CHARTS,
  ...DISTRIBUTION_CHARTS,
  ...RELATIONSHIP_CHARTS,
  ...HIERARCHICAL_CHARTS,
  ...GEOGRAPHIC_CHARTS,
  ...KPI_CHARTS,
  ...TABLE_CHARTS,
  ...IMMERSIVE_3D_CHARTS,
  ...ANIMATED_CHARTS,
  ...STATISTICAL_CHARTS,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getChartsByCategory(categoryCode: ChartCategoryCode): ChartType[] {
  return ALL_CHART_TYPES.filter(chart => chart.categoryCode === categoryCode);
}

export function getPopularCharts(): ChartType[] {
  return ALL_CHART_TYPES.filter(chart => chart.popular);
}

export function getNewCharts(): ChartType[] {
  return ALL_CHART_TYPES.filter(chart => chart.new);
}

export function getChartByCode(code: string): ChartType | undefined {
  return ALL_CHART_TYPES.find(chart => chart.code === code);
}

export function searchCharts(query: string): ChartType[] {
  const lowerQuery = query.toLowerCase();
  return ALL_CHART_TYPES.filter(
    chart =>
      chart.name.toLowerCase().includes(lowerQuery) ||
      chart.description.toLowerCase().includes(lowerQuery) ||
      chart.useCases.some(uc => uc.toLowerCase().includes(lowerQuery))
  );
}

export function getChartsByComplexity(complexity: 'simple' | 'medium' | 'advanced'): ChartType[] {
  return ALL_CHART_TYPES.filter(chart => chart.complexity === complexity);
}

export function getRecommendedChartsForData(
  dimensions: number,
  measures: number,
  isTemporal: boolean,
  dataVolume: 'small' | 'medium' | 'large'
): ChartType[] {
  let recommendations: ChartType[] = [];

  // Simple case: 1 dimension, 1 measure
  if (dimensions === 1 && measures === 1) {
    if (isTemporal) {
      recommendations = ALL_CHART_TYPES.filter(c =>
        ['LINE_CHART', 'AREA_CHART', 'COLUMN_CHART', 'SPARKLINE'].includes(c.code)
      );
    } else {
      recommendations = ALL_CHART_TYPES.filter(c =>
        ['BAR_CHART', 'PIE_CHART', 'DONUT_CHART', 'TREEMAP'].includes(c.code)
      );
    }
  }

  // 2 measures: scatter or combo
  if (measures >= 2) {
    recommendations = ALL_CHART_TYPES.filter(c =>
      ['SCATTER_PLOT', 'BUBBLE_CHART', 'COMBO_CHART', 'HEATMAP'].includes(c.code)
    );
  }

  // Large data volume
  if (dataVolume === 'large') {
    recommendations = recommendations.filter(c =>
      !['PIE_CHART', 'RADAR_CHART'].includes(c.code)
    );
    const hexbin = ALL_CHART_TYPES.find(c => c.code === 'HEXBIN');
    if (hexbin) recommendations.push(hexbin);
  }

  return recommendations;
}
