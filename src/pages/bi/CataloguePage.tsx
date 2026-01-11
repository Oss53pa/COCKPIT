import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Star,
  StarOff,
  Clock,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Target,
  DollarSign,
  BarChart3,
  Settings,
  Users,
  Building2,
  Eye,
  Info,
  FileText,
  PieChart,
  LineChart,
  Activity,
  Gauge,
  Layers,
  Store,
  Briefcase,
  Leaf,
  HardHat,
  Shield,
  Calculator,
  Wallet,
  Calendar,
  ClipboardList,
  Grid3X3,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BookOpen,
  X,
  Plus,
  Play,
  Map,
  Box,
  Table,
  GitBranch,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Modal,
  Input,
  Select,
} from '../../components/ui';
import { useCatalogueStore, useCentresStore, useAppStore } from '../../store';
import {
  ALL_COMMERCIAL_REAL_ESTATE_REPORTS,
  SECTOR_CATEGORIES,
  COMMERCIAL_REAL_ESTATE_SECTOR_INFO,
  getAllKPIs,
  searchReports,
  getReportsByCategory,
  getPopularReports,
  getAIPoweredReports,
  getPremiumReports,
  getReportsByComplexity,
} from '../../config/sectorDetails';
import type { ReportConfig, CatalogueKPIDefinition, SectorCategory } from '../../config/sectorDetails';
import {
  ALL_CHART_TYPES,
  CHART_CATEGORIES,
  getChartsByCategory,
  getPopularCharts,
  getNewCharts,
  searchCharts,
  getChartsByComplexity,
} from '../../config/chartsCatalog';
import type { ChartType, ChartCategoryCode } from '../../config/chartsCatalog';
import ChartPreview from '../../components/catalog/ChartPreview';

type CatalogSection = 'reports' | 'kpis' | 'charts';
type ViewMode = 'grid' | 'list';
type ComplexityFilter = '' | 'simple' | 'standard' | 'advanced' | 'expert';

// Icon mapping for dynamic icons
const iconMap: Record<string, React.ElementType> = {
  TrendingUp,
  DollarSign,
  Store,
  Calendar,
  Users,
  ClipboardList,
  Building2,
  Grid3X3,
  Calculator,
  Wallet,
  Leaf,
  Search: Eye,
  Target,
  Briefcase,
  HardHat,
  BarChart3,
  PieChart,
  GitBranch,
  Layers,
  Map,
  Gauge,
  Table,
  Box,
  Activity,
  LineChart,
};

const getIcon = (iconName: string): React.ElementType => {
  return iconMap[iconName] || FileText;
};

// Complexity colors and labels
const complexityConfig = {
  simple: { label: 'Simple', color: 'bg-green-100 text-green-700' },
  standard: { label: 'Standard', color: 'bg-blue-100 text-blue-700' },
  advanced: { label: 'Avancé', color: 'bg-orange-100 text-orange-700' },
  expert: { label: 'Expert', color: 'bg-purple-100 text-purple-700' },
};

// Category colors
const categoryColors: Record<string, string> = {
  asset_management: 'bg-blue-500',
  property_management: 'bg-emerald-500',
  leasing: 'bg-orange-500',
  retail_performance: 'bg-purple-500',
  financial: 'bg-pink-500',
  sustainability: 'bg-green-500',
  investment: 'bg-cyan-500',
  project: 'bg-lime-500',
};

export function CataloguePage() {
  const { centreId } = useParams<{ centreId: string }>();
  const navigate = useNavigate();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const { addToast } = useAppStore();

  const {
    recherche,
    rapportsFavoris,
    setRecherche,
    toggleRapportFavori,
  } = useCatalogueStore();

  // State
  const [catalogSection, setCatalogSection] = useState<CatalogSection>('reports');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [complexityFilter, setComplexityFilter] = useState<ComplexityFilter>('');
  const [showAIOnly, setShowAIOnly] = useState(false);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(SECTOR_CATEGORIES.map(c => c.code))
  );
  const [selectedChartCategory, setSelectedChartCategory] = useState<ChartCategoryCode | ''>('');
  const [chartComplexityFilter, setChartComplexityFilter] = useState<'' | 'simple' | 'medium' | 'advanced'>('');
  const [showPopularChartsOnly, setShowPopularChartsOnly] = useState(false);
  const [showNewChartsOnly, setShowNewChartsOnly] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ChartType | null>(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  // All reports
  const allReports = useMemo(() => Object.values(ALL_COMMERCIAL_REAL_ESTATE_REPORTS), []);

  // Filtered reports
  const filteredReports = useMemo(() => {
    let reports = allReports;

    // Search filter
    if (recherche) {
      reports = searchReports(recherche);
    }

    // Category filter
    if (selectedCategory) {
      reports = reports.filter(r => r.category === selectedCategory);
    }

    // Complexity filter
    if (complexityFilter) {
      reports = reports.filter(r => r.complexity === complexityFilter);
    }

    // AI filter
    if (showAIOnly) {
      reports = reports.filter(r => r.aiPowered);
    }

    // Premium filter
    if (showPremiumOnly) {
      reports = reports.filter(r => r.premium);
    }

    return reports;
  }, [allReports, recherche, selectedCategory, complexityFilter, showAIOnly, showPremiumOnly]);

  // Reports grouped by category
  const reportsByCategory = useMemo(() => {
    const grouped: Record<string, ReportConfig[]> = {};
    SECTOR_CATEGORIES.forEach(cat => {
      grouped[cat.code] = filteredReports.filter(
        r => r.category === cat.code.toLowerCase().replace('_', '_')
      );
    });
    return grouped;
  }, [filteredReports]);

  // All KPIs
  const allKPIs = useMemo(() => getAllKPIs(), []);

  // Popular reports
  const popularReports = useMemo(() => getPopularReports(), []);

  // Filtered charts
  const filteredCharts = useMemo(() => {
    let charts = ALL_CHART_TYPES;

    // Search filter
    if (recherche) {
      charts = searchCharts(recherche);
    }

    // Category filter
    if (selectedChartCategory) {
      charts = charts.filter(c => c.categoryCode === selectedChartCategory);
    }

    // Complexity filter
    if (chartComplexityFilter) {
      charts = charts.filter(c => c.complexity === chartComplexityFilter);
    }

    // Popular filter
    if (showPopularChartsOnly) {
      charts = charts.filter(c => c.popular);
    }

    // New filter
    if (showNewChartsOnly) {
      charts = charts.filter(c => c.new);
    }

    return charts;
  }, [recherche, selectedChartCategory, chartComplexityFilter, showPopularChartsOnly, showNewChartsOnly]);

  // Charts grouped by category
  const chartsByCategory = useMemo(() => {
    const grouped: Record<string, ChartType[]> = {};
    CHART_CATEGORIES.forEach(cat => {
      grouped[cat.code] = filteredCharts.filter(c => c.categoryCode === cat.code);
    });
    return grouped;
  }, [filteredCharts]);

  // Toggle category expansion
  const toggleCategory = (code: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedCategories(newExpanded);
  };

  // Open report detail modal
  const openReportDetail = (report: ReportConfig) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  // Open chart detail modal
  const openChartDetail = (chart: ChartType) => {
    setSelectedChart(chart);
    setIsChartModalOpen(true);
  };

  // Close chart modal
  const closeChartModal = () => {
    setIsChartModalOpen(false);
    setSelectedChart(null);
  };

  // Create report from template
  const createReport = (report: ReportConfig) => {
    addToast({
      type: 'success',
      message: `Rapport "${report.name}" créé avec succès`,
    });
    closeModal();
    // Navigate to report studio (future implementation)
    // navigate(`/centres/${centreId}/bi/studio?template=${report.code}`);
  };

  // Report Card Component
  const ReportCard = ({ report }: { report: ReportConfig }) => {
    const isFavori = rapportsFavoris.includes(report.code);
    const Icon = getIcon(report.icon);
    const complexity = complexityConfig[report.complexity];

    return (
      <div
        className="bg-white rounded-lg border border-primary-200 hover:border-accent hover:shadow-md transition-all cursor-pointer group"
        onClick={() => openReportDetail(report)}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${report.color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: report.color }} />
              </div>
              <div>
                <h3 className="font-medium text-primary-900 group-hover:text-accent transition-colors">
                  {report.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={complexity.color}>{complexity.label}</Badge>
                  {report.aiPowered && (
                    <Badge className="bg-purple-100 text-purple-700">
                      <Sparkles className="w-3 h-3 mr-1" />
                      IA
                    </Badge>
                  )}
                  {report.new && (
                    <Badge className="bg-green-100 text-green-700">Nouveau</Badge>
                  )}
                  {report.premium && (
                    <Badge className="bg-amber-100 text-amber-700">Premium</Badge>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleRapportFavori(report.code);
              }}
              className="p-1 hover:bg-primary-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isFavori ? (
                <Star className="w-4 h-4 text-warning fill-warning" />
              ) : (
                <StarOff className="w-4 h-4 text-primary-400" />
              )}
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-primary-600 mb-3 line-clamp-2">
            {report.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-primary-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {report.estimatedPages.min}-{report.estimatedPages.max} pages
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {report.kpis.length} KPIs
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {report.updateFrequency === 'monthly' && 'Mensuel'}
              {report.updateFrequency === 'weekly' && 'Hebdo'}
              {report.updateFrequency === 'quarterly' && 'Trimestriel'}
              {report.updateFrequency === 'annually' && 'Annuel'}
              {report.updateFrequency === 'daily' && 'Quotidien'}
              {report.updateFrequency === 'on_demand' && 'À la demande'}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="px-4 py-2 border-t border-primary-100 bg-primary-50/50">
          <div className="flex flex-wrap gap-1">
            {report.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-white rounded text-primary-500"
              >
                {tag}
              </span>
            ))}
            {report.tags.length > 4 && (
              <span className="text-xs px-2 py-0.5 text-primary-400">
                +{report.tags.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Report List Item Component
  const ReportListItem = ({ report }: { report: ReportConfig }) => {
    const isFavori = rapportsFavoris.includes(report.code);
    const Icon = getIcon(report.icon);
    const complexity = complexityConfig[report.complexity];

    return (
      <div
        className="flex items-center gap-4 p-4 bg-white rounded-lg border border-primary-200 hover:border-accent hover:shadow-sm transition-all cursor-pointer group"
        onClick={() => openReportDetail(report)}
      >
        <div
          className="p-2 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${report.color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: report.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-primary-900 truncate group-hover:text-accent transition-colors">
              {report.name}
            </h3>
            <Badge className={complexity.color}>{complexity.label}</Badge>
            {report.aiPowered && (
              <Badge className="bg-purple-100 text-purple-700">
                <Sparkles className="w-3 h-3 mr-1" />
                IA
              </Badge>
            )}
          </div>
          <p className="text-sm text-primary-500 truncate mt-0.5">
            {report.description}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-primary-500 flex-shrink-0">
          <span>{report.kpis.length} KPIs</span>
          <span>{report.sections.length} sections</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleRapportFavori(report.code);
            }}
            className="p-1 hover:bg-primary-50 rounded"
          >
            {isFavori ? (
              <Star className="w-4 h-4 text-warning fill-warning" />
            ) : (
              <StarOff className="w-4 h-4 text-primary-400" />
            )}
          </button>
          <ChevronRight className="w-4 h-4 text-primary-300" />
        </div>
      </div>
    );
  };

  // KPI Card Component
  const KPICard = ({ kpi }: { kpi: CatalogueKPIDefinition }) => {
    const trendIcon = kpi.trend === 'higher_better' ? TrendingUp : kpi.trend === 'lower_better' ? TrendingUp : Target;
    const trendColor = kpi.trend === 'higher_better' ? 'text-green-500' : kpi.trend === 'lower_better' ? 'text-red-500' : 'text-blue-500';

    return (
      <div className="bg-white p-4 rounded-lg border border-primary-200 hover:border-accent transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-medium text-primary-900">{kpi.name}</h3>
            <span className="text-xs font-mono text-primary-500">{kpi.code}</span>
          </div>
          <Badge className="bg-primary-100 text-primary-700">{kpi.unit}</Badge>
        </div>

        <p className="text-sm text-primary-600 mb-3 line-clamp-2">
          {kpi.description}
        </p>

        <div className="flex items-center justify-between text-xs">
          <span className="text-primary-500">
            <Clock className="w-3 h-3 inline mr-1" />
            {kpi.frequency === 'monthly' && 'Mensuel'}
            {kpi.frequency === 'quarterly' && 'Trimestriel'}
            {kpi.frequency === 'annually' && 'Annuel'}
            {kpi.frequency === 'daily' && 'Quotidien'}
            {kpi.frequency === 'weekly' && 'Hebdomadaire'}
          </span>
          <span className={`flex items-center gap-1 ${trendColor}`}>
            {React.createElement(trendIcon, { className: 'w-3 h-3' })}
            {kpi.trend === 'higher_better' && 'Plus = Mieux'}
            {kpi.trend === 'lower_better' && 'Moins = Mieux'}
            {kpi.trend === 'target' && 'Objectif'}
          </span>
        </div>

        {kpi.formula && (
          <div className="mt-3 p-2 bg-primary-50 rounded text-xs font-mono text-primary-600">
            {kpi.formula}
          </div>
        )}

        {kpi.benchmark && (
          <div className="mt-3 grid grid-cols-4 gap-1 text-xs">
            <div className="text-center p-1 bg-green-50 rounded">
              <div className="text-green-700 font-medium">{kpi.benchmark.excellent}</div>
              <div className="text-green-600">Excellent</div>
            </div>
            <div className="text-center p-1 bg-blue-50 rounded">
              <div className="text-blue-700 font-medium">{kpi.benchmark.good}</div>
              <div className="text-blue-600">Bon</div>
            </div>
            <div className="text-center p-1 bg-orange-50 rounded">
              <div className="text-orange-700 font-medium">{kpi.benchmark.acceptable}</div>
              <div className="text-orange-600">Acceptable</div>
            </div>
            <div className="text-center p-1 bg-red-50 rounded">
              <div className="text-red-700 font-medium">{kpi.benchmark.poor}</div>
              <div className="text-red-600">Faible</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Category Section Component
  const CategorySection = ({ category }: { category: SectorCategory }) => {
    const isExpanded = expandedCategories.has(category.code);
    const categoryKey = category.code.toLowerCase();
    const reports = filteredReports.filter(r => {
      const reportCat = r.category.toLowerCase().replace(/-/g, '_');
      return reportCat === categoryKey ||
             reportCat === categoryKey.replace('_', '') ||
             r.category === category.code.toLowerCase();
    });

    if (reports.length === 0 && recherche) return null;

    const Icon = getIcon(category.icon);

    return (
      <Card className="overflow-hidden">
        <CardHeader
          className="cursor-pointer hover:bg-primary-50 transition-colors"
          onClick={() => toggleCategory(category.code)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-primary-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-primary-400" />
              )}
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${category.color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: category.color }} />
              </div>
              <div>
                <CardTitle>{category.name}</CardTitle>
                <p className="text-sm text-primary-500 mt-0.5">
                  {category.description}
                </p>
              </div>
            </div>
            <Badge className="bg-primary-100 text-primary-700">
              {reports.length} rapports
            </Badge>
          </div>
        </CardHeader>

        {isExpanded && reports.length > 0 && (
          <CardContent className="pt-0">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <ReportCard key={report.code} report={report} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {reports.map((report) => (
                  <ReportListItem key={report.code} report={report} />
                ))}
              </div>
            )}
          </CardContent>
        )}

        {isExpanded && reports.length === 0 && (
          <CardContent className="pt-0">
            <p className="text-sm text-primary-500 text-center py-8">
              Aucun rapport dans cette catégorie
            </p>
          </CardContent>
        )}
      </Card>
    );
  };

  // Chart Card Component
  const ChartCard = ({ chart }: { chart: ChartType }) => {
    const complexityColors = {
      simple: 'bg-green-100 text-green-700',
      medium: 'bg-blue-100 text-blue-700',
      advanced: 'bg-purple-100 text-purple-700',
    };
    const complexityLabels = {
      simple: 'Simple',
      medium: 'Moyen',
      advanced: 'Avancé',
    };

    return (
      <div
        className="bg-white rounded-lg border border-primary-200 hover:border-accent hover:shadow-md transition-all cursor-pointer group overflow-hidden"
        onClick={() => openChartDetail(chart)}
      >
        {/* Chart Preview */}
        <div className="h-32 bg-gradient-to-br from-primary-50 to-white p-2 flex items-center justify-center">
          <ChartPreview chartCode={chart.code} className="w-full h-full" />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-primary-900 group-hover:text-accent transition-colors">
              {chart.name}
            </h3>
            <div className="flex items-center gap-1">
              {chart.popular && (
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
              )}
              {chart.new && (
                <Badge className="bg-green-100 text-green-700 text-xs">Nouveau</Badge>
              )}
            </div>
          </div>

          <p className="text-sm text-primary-500 line-clamp-2 mb-3">
            {chart.description}
          </p>

          <div className="flex items-center justify-between">
            <Badge className={complexityColors[chart.complexity]}>
              {complexityLabels[chart.complexity]}
            </Badge>
            <span className="text-xs text-primary-400">
              {chart.variants.length} variantes
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Chart Category Section Component
  const ChartCategorySection = ({ categoryCode, categoryName, categoryColor, categoryIcon, charts }: {
    categoryCode: string;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    charts: ChartType[];
  }) => {
    const isExpanded = expandedCategories.has(categoryCode);
    const Icon = getIcon(categoryIcon);

    if (charts.length === 0 && recherche) return null;

    return (
      <Card className="overflow-hidden">
        <CardHeader
          className="cursor-pointer hover:bg-primary-50 transition-colors"
          onClick={() => toggleCategory(categoryCode)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-primary-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-primary-400" />
              )}
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${categoryColor}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: categoryColor }} />
              </div>
              <div>
                <CardTitle>{categoryName}</CardTitle>
              </div>
            </div>
            <Badge className="bg-primary-100 text-primary-700">
              {charts.length} graphiques
            </Badge>
          </div>
        </CardHeader>

        {isExpanded && charts.length > 0 && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {charts.map((chart) => (
                <ChartCard key={chart.code} chart={chart} />
              ))}
            </div>
          </CardContent>
        )}

        {isExpanded && charts.length === 0 && (
          <CardContent className="pt-0">
            <p className="text-sm text-primary-500 text-center py-8">
              Aucun graphique dans cette catégorie
            </p>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Catalogue BI</h1>
          <p className="text-primary-500 mt-1">
            {centre?.nom} | {Object.keys(ALL_COMMERCIAL_REAL_ESTATE_REPORTS).length} Rapports | {allKPIs.length} KPIs | {ALL_CHART_TYPES.length} Graphiques
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            leftIcon={<BookOpen className="w-4 h-4" />}
            onClick={() => window.open('https://docs.cockpit.fr/catalogue', '_blank')}
          >
            Documentation
          </Button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-4 border-b border-primary-200">
        <button
          onClick={() => setCatalogSection('reports')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            catalogSection === 'reports'
              ? 'border-accent text-accent font-medium'
              : 'border-transparent text-primary-500 hover:text-primary-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Rapports ({filteredReports.length})
        </button>
        <button
          onClick={() => setCatalogSection('kpis')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            catalogSection === 'kpis'
              ? 'border-accent text-accent font-medium'
              : 'border-transparent text-primary-500 hover:text-primary-700'
          }`}
        >
          <Gauge className="w-4 h-4" />
          KPIs ({allKPIs.length})
        </button>
        <button
          onClick={() => setCatalogSection('charts')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            catalogSection === 'charts'
              ? 'border-accent text-accent font-medium'
              : 'border-transparent text-primary-500 hover:text-primary-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Graphiques ({filteredCharts.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
          <Input
            type="text"
            placeholder="Rechercher rapports, KPIs..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        {catalogSection === 'reports' && (
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: '', label: 'Toutes catégories' },
              ...SECTOR_CATEGORIES.map((cat) => ({
                value: cat.code.toLowerCase(),
                label: cat.name,
              })),
            ]}
            className="w-48"
          />
        )}

        {/* Complexity Filter */}
        {catalogSection === 'reports' && (
          <Select
            value={complexityFilter}
            onChange={(e) => setComplexityFilter(e.target.value as ComplexityFilter)}
            options={[
              { value: '', label: 'Toute complexité' },
              { value: 'simple', label: 'Simple' },
              { value: 'standard', label: 'Standard' },
              { value: 'advanced', label: 'Avancé' },
              { value: 'expert', label: 'Expert' },
            ]}
            className="w-40"
          />
        )}

        {/* Quick Filters */}
        {catalogSection === 'reports' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAIOnly(!showAIOnly)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                showAIOnly
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              IA
            </button>
            <button
              onClick={() => setShowPremiumOnly(!showPremiumOnly)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                showPremiumOnly
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
            >
              <Star className="w-3 h-3" />
              Premium
            </button>
          </div>
        )}

        {/* View Mode Toggle */}
        {catalogSection === 'reports' && (
          <div className="flex items-center gap-1 bg-primary-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-primary-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-primary-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-primary-200'
              }`}
            >
              <List className="w-4 h-4 text-primary-600" />
            </button>
          </div>
        )}

        {/* Chart Category Filter */}
        {catalogSection === 'charts' && (
          <Select
            value={selectedChartCategory}
            onChange={(e) => setSelectedChartCategory(e.target.value as ChartCategoryCode | '')}
            options={[
              { value: '', label: 'Toutes catégories' },
              ...CHART_CATEGORIES.map((cat) => ({
                value: cat.code,
                label: cat.name,
              })),
            ]}
            className="w-48"
          />
        )}

        {/* Chart Complexity Filter */}
        {catalogSection === 'charts' && (
          <Select
            value={chartComplexityFilter}
            onChange={(e) => setChartComplexityFilter(e.target.value as '' | 'simple' | 'medium' | 'advanced')}
            options={[
              { value: '', label: 'Toute complexité' },
              { value: 'simple', label: 'Simple' },
              { value: 'medium', label: 'Moyen' },
              { value: 'advanced', label: 'Avancé' },
            ]}
            className="w-40"
          />
        )}

        {/* Chart Quick Filters */}
        {catalogSection === 'charts' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPopularChartsOnly(!showPopularChartsOnly)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                showPopularChartsOnly
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
            >
              <Star className="w-3 h-3" />
              Populaires
            </button>
            <button
              onClick={() => setShowNewChartsOnly(!showNewChartsOnly)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                showNewChartsOnly
                  ? 'bg-green-100 text-green-700'
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              Nouveaux
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {catalogSection === 'reports' && (
        <div className="space-y-4">
          {/* Popular Reports Section */}
          {!recherche && !selectedCategory && !complexityFilter && !showAIOnly && !showPremiumOnly && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <CardTitle>Rapports Populaires</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {popularReports.slice(0, 4).map((report) => (
                    <ReportCard key={report.code} report={report} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Sections */}
          {SECTOR_CATEGORIES.map((category) => (
            <CategorySection key={category.code} category={category} />
          ))}

          {/* No Results */}
          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-primary-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-primary-900 mb-2">
                Aucun rapport trouvé
              </h3>
              <p className="text-primary-500">
                Modifiez vos critères de recherche ou de filtrage
              </p>
            </div>
          )}
        </div>
      )}

      {catalogSection === 'kpis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allKPIs
            .filter(
              (kpi) =>
                !recherche ||
                kpi.name.toLowerCase().includes(recherche.toLowerCase()) ||
                kpi.code.toLowerCase().includes(recherche.toLowerCase()) ||
                kpi.description.toLowerCase().includes(recherche.toLowerCase())
            )
            .map((kpi) => (
              <KPICard key={kpi.code} kpi={kpi} />
            ))}
        </div>
      )}

      {catalogSection === 'charts' && (
        <div className="space-y-4">
          {/* Popular Charts Section */}
          {!recherche && !selectedChartCategory && !chartComplexityFilter && !showPopularChartsOnly && !showNewChartsOnly && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-warning fill-warning" />
                  <CardTitle>Graphiques Populaires</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {getPopularCharts().slice(0, 8).map((chart) => (
                    <ChartCard key={chart.code} chart={chart} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chart Category Sections */}
          {CHART_CATEGORIES.map((category) => (
            <ChartCategorySection
              key={category.code}
              categoryCode={category.code}
              categoryName={category.name}
              categoryColor={category.color}
              categoryIcon={category.icon}
              charts={chartsByCategory[category.code] || []}
            />
          ))}

          {/* No Results */}
          {filteredCharts.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-primary-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-primary-900 mb-2">
                Aucun graphique trouvé
              </h3>
              <p className="text-primary-500">
                Modifiez vos critères de recherche ou de filtrage
              </p>
            </div>
          )}
        </div>
      )}

      {/* Report Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedReport?.name || ''}
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={closeModal}>
              Fermer
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                leftIcon={<Eye className="w-4 h-4" />}
              >
                Aperçu
              </Button>
              <Button
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => selectedReport && createReport(selectedReport)}
              >
                Créer ce rapport
              </Button>
            </div>
          </div>
        }
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${selectedReport.color}15` }}
              >
                {React.createElement(getIcon(selectedReport.icon), {
                  className: 'w-8 h-8',
                  style: { color: selectedReport.color },
                })}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={complexityConfig[selectedReport.complexity].color}>
                    {complexityConfig[selectedReport.complexity].label}
                  </Badge>
                  {selectedReport.aiPowered && (
                    <Badge className="bg-purple-100 text-purple-700">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Assisté par IA
                    </Badge>
                  )}
                  {selectedReport.premium && (
                    <Badge className="bg-amber-100 text-amber-700">Premium</Badge>
                  )}
                </div>
                <p className="text-primary-600">{selectedReport.description}</p>
              </div>
            </div>

            {/* Long Description */}
            <div className="p-4 bg-primary-50 rounded-lg">
              <h4 className="font-medium text-primary-900 mb-2">Description détaillée</h4>
              <div className="text-sm text-primary-700 whitespace-pre-line">
                {selectedReport.longDescription}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-900">
                  {selectedReport.estimatedPages.min}-{selectedReport.estimatedPages.max}
                </div>
                <div className="text-xs text-primary-500">Pages estimées</div>
              </div>
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-900">
                  {selectedReport.kpis.length}
                </div>
                <div className="text-xs text-primary-500">KPIs</div>
              </div>
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-900">
                  {selectedReport.sections.length}
                </div>
                <div className="text-xs text-primary-500">Sections</div>
              </div>
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-900">
                  {selectedReport.dataRequirements.length}
                </div>
                <div className="text-xs text-primary-500">Données requises</div>
              </div>
            </div>

            {/* Sections */}
            <div>
              <h4 className="font-medium text-primary-900 mb-3">Sections du rapport</h4>
              <div className="space-y-2">
                {selectedReport.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-primary-900">{section.title}</div>
                      <div className="text-xs text-primary-500">{section.description}</div>
                    </div>
                    {section.aiPowered && (
                      <Badge className="bg-purple-100 text-purple-700">
                        <Sparkles className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* KPIs */}
            <div>
              <h4 className="font-medium text-primary-900 mb-3">KPIs inclus</h4>
              <div className="flex flex-wrap gap-2">
                {selectedReport.kpis.map((kpi) => (
                  <Badge key={kpi.code} className="bg-accent/10 text-accent">
                    {kpi.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <h4 className="font-medium text-primary-900 mb-3">Destinataires</h4>
              <div className="flex flex-wrap gap-2">
                {selectedReport.targetAudience.map((audience) => (
                  <Badge key={audience} className="bg-primary-100 text-primary-700">
                    {audience}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Industry Standards */}
            {selectedReport.industryStandards.length > 0 && (
              <div>
                <h4 className="font-medium text-primary-900 mb-3">Standards appliqués</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.industryStandards.map((standard) => (
                    <Badge
                      key={standard.code}
                      className="bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200"
                      onClick={() => standard.url && window.open(standard.url, '_blank')}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {standard.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Use Cases */}
            <div>
              <h4 className="font-medium text-primary-900 mb-3">Cas d'usage</h4>
              <ul className="space-y-1">
                {selectedReport.useCases.map((useCase, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-primary-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>

            {/* Limitations */}
            {selectedReport.limitations.length > 0 && (
              <div>
                <h4 className="font-medium text-primary-900 mb-3">Limitations</h4>
                <ul className="space-y-1">
                  {selectedReport.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-primary-600">
                      <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Chart Detail Modal */}
      <Modal
        isOpen={isChartModalOpen}
        onClose={closeChartModal}
        title={selectedChart?.name || ''}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={closeChartModal}>
              Fermer
            </Button>
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Utiliser ce graphique
            </Button>
          </div>
        }
      >
        {selectedChart && (
          <div className="space-y-6">
            {/* Chart Preview */}
            <div className="h-48 bg-gradient-to-br from-primary-50 to-white rounded-lg p-4 flex items-center justify-center">
              <ChartPreview chartCode={selectedChart.code} className="w-full h-full" />
            </div>

            {/* Description */}
            <div>
              <h4 className="font-medium text-primary-900 mb-2">Description</h4>
              <p className="text-primary-600">{selectedChart.description}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <div className="text-lg font-bold text-primary-900">
                  {selectedChart.complexity === 'simple' ? 'Simple' : selectedChart.complexity === 'medium' ? 'Moyen' : 'Avancé'}
                </div>
                <div className="text-xs text-primary-500">Complexité</div>
              </div>
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <div className="text-lg font-bold text-primary-900">
                  {selectedChart.variants.length}
                </div>
                <div className="text-xs text-primary-500">Variantes</div>
              </div>
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <div className="text-lg font-bold text-primary-900">
                  {selectedChart.dataRequirements.length}
                </div>
                <div className="text-xs text-primary-500">Données requises</div>
              </div>
            </div>

            {/* Use Cases */}
            <div>
              <h4 className="font-medium text-primary-900 mb-3">Cas d'usage</h4>
              <ul className="space-y-1">
                {selectedChart.useCases.map((useCase, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-primary-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Requirements */}
            <div>
              <h4 className="font-medium text-primary-900 mb-3">Données requises</h4>
              <div className="flex flex-wrap gap-2">
                {selectedChart.dataRequirements.map((req, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-700">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div>
              <h4 className="font-medium text-primary-900 mb-3">Variantes disponibles</h4>
              <div className="flex flex-wrap gap-2">
                {selectedChart.variants.map((variant, index) => (
                  <Badge key={index} className="bg-primary-100 text-primary-700">
                    {variant}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
