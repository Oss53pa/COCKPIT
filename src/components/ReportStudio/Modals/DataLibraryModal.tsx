/**
 * Data Library Modal
 * Modal for selecting pre-defined charts and tables from the library
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  BarChart2,
  Table,
  Search,
  LineChart,
  PieChart,
  Activity,
  TrendingUp,
} from 'lucide-react';
import {
  CHART_TEMPLATES,
  TABLE_TEMPLATES,
  CHART_CATEGORIES,
  TABLE_CATEGORIES,
  ChartTemplate,
  TableTemplate,
  getChartsForReportTypes,
  getTablesForReportTypes,
} from '../../../data/dataLibrary';

type LibraryTab = 'charts' | 'tables';

interface DataLibraryModalProps {
  isOpen: boolean;
  reportTypes?: string[]; // Types de rapport pour filtrer
  onClose: () => void;
  onSelectChart: (chart: ChartTemplate) => void;
  onSelectTable: (table: TableTemplate) => void;
}

export const DataLibraryModal: React.FC<DataLibraryModalProps> = ({
  isOpen,
  reportTypes,
  onClose,
  onSelectChart,
  onSelectTable,
}) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('charts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showAllItems, setShowAllItems] = useState(false);

  const categories = activeTab === 'charts' ? CHART_CATEGORIES : TABLE_CATEGORIES;

  // Base charts/tables filtered by report type (if provided)
  const baseCharts = useMemo(() => {
    if (!reportTypes || reportTypes.length === 0 || showAllItems) {
      return CHART_TEMPLATES;
    }
    return getChartsForReportTypes(reportTypes);
  }, [reportTypes, showAllItems]);

  const baseTables = useMemo(() => {
    if (!reportTypes || reportTypes.length === 0 || showAllItems) {
      return TABLE_TEMPLATES;
    }
    return getTablesForReportTypes(reportTypes);
  }, [reportTypes, showAllItems]);

  const filteredCharts = useMemo(() => {
    return baseCharts.filter(chart => {
      const matchesSearch = searchQuery === '' ||
        chart.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chart.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || chart.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [baseCharts, searchQuery, selectedCategory]);

  const filteredTables = useMemo(() => {
    return baseTables.filter(table => {
      const matchesSearch = searchQuery === '' ||
        table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || table.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [baseTables, searchQuery, selectedCategory]);

  const getChartIcon = (chartType: string) => {
    switch (chartType) {
      case 'line':
        return <LineChart className="w-5 h-5" />;
      case 'bar':
        return <BarChart2 className="w-5 h-5" />;
      case 'pie':
      case 'donut':
        return <PieChart className="w-5 h-5" />;
      case 'area':
        return <Activity className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const handleSelectChart = (chart: ChartTemplate) => {
    onSelectChart(chart);
    onClose();
  };

  const handleSelectTable = (table: TableTemplate) => {
    onSelectTable(table);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200">
          <div>
            <h2 className="text-lg font-semibold text-primary-900">Bibliothèque de données</h2>
            <p className="text-sm text-primary-500">
              Sélectionnez un graphique ou tableau pré-configuré
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-primary-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between px-6 pt-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setActiveTab('charts');
                setSelectedCategory('all');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'charts'
                  ? 'bg-primary text-white'
                  : 'text-primary-600 hover:bg-primary-50'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Graphiques ({baseCharts.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('tables');
                setSelectedCategory('all');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'tables'
                  ? 'bg-primary text-white'
                  : 'text-primary-600 hover:bg-primary-50'
              }`}
            >
              <Table className="w-4 h-4" />
              Tableaux ({baseTables.length})
            </button>
          </div>

          {/* Toggle show all */}
          {reportTypes && reportTypes.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAllItems}
                onChange={(e) => setShowAllItems(e.target.checked)}
                className="h-4 w-4 rounded border-primary-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-primary-600">Afficher tous</span>
            </label>
          )}
        </div>

        {/* Filter indicator */}
        {reportTypes && reportTypes.length > 0 && !showAllItems && (
          <div className="mx-6 mt-2 px-3 py-2 bg-accent/10 rounded-lg flex items-center gap-2">
            <span className="text-xs text-accent">
              Filtré pour {reportTypes.length} type(s) de rapport
            </span>
          </div>
        )}

        {/* Search and Filters */}
        <div className="px-6 py-4 flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-primary-500 hover:bg-primary-50'
              }`}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'text-white'
                    : 'text-primary-600 hover:bg-primary-50'
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: cat.color } : undefined}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {activeTab === 'charts' ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredCharts.map((chart) => (
                <button
                  key={chart.id}
                  onClick={() => handleSelectChart(chart)}
                  onMouseEnter={() => setHoveredItem(chart.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`p-4 border rounded-xl text-left transition-all ${
                    hoveredItem === chart.id
                      ? 'border-primary shadow-lg scale-[1.02]'
                      : 'border-primary-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${CHART_CATEGORIES.find(c => c.id === chart.category)?.color}20`,
                        color: CHART_CATEGORIES.find(c => c.id === chart.category)?.color,
                      }}
                    >
                      {getChartIcon(chart.chartType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-primary-900 truncate">{chart.name}</h3>
                      <p className="text-xs text-primary-500 mt-0.5 line-clamp-2">
                        {chart.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${CHART_CATEGORIES.find(c => c.id === chart.category)?.color}20`,
                            color: CHART_CATEGORIES.find(c => c.id === chart.category)?.color,
                          }}
                        >
                          {CHART_CATEGORIES.find(c => c.id === chart.category)?.label}
                        </span>
                        <span className="text-xs text-primary-400">
                          {chart.chartType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mini preview */}
                  <div className="mt-3 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                    <div className="flex items-end gap-1 h-10">
                      {chart.data.datasets[0]?.data.slice(0, 8).map((value, idx) => (
                        <div
                          key={idx}
                          className="w-3 rounded-t"
                          style={{
                            height: `${(value / Math.max(...chart.data.datasets[0].data)) * 100}%`,
                            backgroundColor: CHART_CATEGORIES.find(c => c.id === chart.category)?.color || '#1C3163',
                            opacity: 0.7,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              ))}

              {filteredCharts.length === 0 && (
                <div className="col-span-2 py-12 text-center text-primary-500">
                  Aucun graphique trouvé
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleSelectTable(table)}
                  onMouseEnter={() => setHoveredItem(table.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`p-4 border rounded-xl text-left transition-all ${
                    hoveredItem === table.id
                      ? 'border-primary shadow-lg'
                      : 'border-primary-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${TABLE_CATEGORIES.find(c => c.id === table.category)?.color}20`,
                        color: TABLE_CATEGORIES.find(c => c.id === table.category)?.color,
                      }}
                    >
                      <Table className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-primary-900">{table.name}</h3>
                      <p className="text-xs text-primary-500 mt-0.5">
                        {table.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${TABLE_CATEGORIES.find(c => c.id === table.category)?.color}20`,
                            color: TABLE_CATEGORIES.find(c => c.id === table.category)?.color,
                          }}
                        >
                          {TABLE_CATEGORIES.find(c => c.id === table.category)?.label}
                        </span>
                        <span className="text-xs text-primary-400">
                          {table.headers.length} colonnes · {table.rows.length} lignes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Table preview */}
                  <div className="mt-3 overflow-hidden rounded-lg border border-primary-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-primary-50">
                          {table.headers.slice(0, 4).map((header) => (
                            <th
                              key={header.key}
                              className="px-2 py-1.5 text-left font-medium text-primary-700"
                            >
                              {header.label}
                            </th>
                          ))}
                          {table.headers.length > 4 && (
                            <th className="px-2 py-1.5 text-primary-400">...</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.slice(0, 2).map((row, idx) => (
                          <tr key={idx} className="border-t border-primary-100">
                            {table.headers.slice(0, 4).map((header) => (
                              <td key={header.key} className="px-2 py-1 text-primary-600">
                                {row[header.key]?.formatted || String(row[header.key]?.value || '')}
                              </td>
                            ))}
                            {table.headers.length > 4 && (
                              <td className="px-2 py-1 text-primary-400">...</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </button>
              ))}

              {filteredTables.length === 0 && (
                <div className="py-12 text-center text-primary-500">
                  Aucun tableau trouvé
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-primary-200 bg-primary-50 rounded-b-xl">
          <p className="text-xs text-primary-500 text-center">
            Cliquez sur un élément pour l'insérer dans votre rapport. Les données sont des exemples et peuvent être personnalisées.
          </p>
        </div>
      </div>
    </div>
  );
};
