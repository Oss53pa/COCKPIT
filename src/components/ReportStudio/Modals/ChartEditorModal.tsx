/**
 * Chart Editor Modal Component
 * Modal for creating and editing charts
 */

import React, { useState } from 'react';
import {
  X,
  BarChart2,
  LineChart,
  PieChart,
  Plus,
  Trash2,
} from 'lucide-react';
import { ChartType } from '../../../types/reportStudio';

interface ChartEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (chartData: ChartData) => void;
  initialData?: ChartData;
}

interface ChartData {
  chartType: ChartType;
  title: string;
  data: Array<{ label: string; value: number }>;
  config: {
    showLegend: boolean;
    showGrid: boolean;
    colorScheme: string;
  };
}

const defaultData: ChartData = {
  chartType: 'bar',
  title: 'Nouveau graphique',
  data: [
    { label: 'Janvier', value: 100 },
    { label: 'Février', value: 150 },
    { label: 'Mars', value: 200 },
  ],
  config: {
    showLegend: true,
    showGrid: true,
    colorScheme: 'corporate',
  },
};

export const ChartEditorModal: React.FC<ChartEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [chartData, setChartData] = useState<ChartData>(initialData || defaultData);

  const chartTypes: { type: ChartType; label: string; icon: React.ElementType }[] = [
    { type: 'bar', label: 'Barres', icon: BarChart2 },
    { type: 'line', label: 'Lignes', icon: LineChart },
    { type: 'pie', label: 'Camembert', icon: PieChart },
    { type: 'horizontal_bar', label: 'Barres H.', icon: BarChart2 },
    { type: 'area', label: 'Aires', icon: LineChart },
    { type: 'donut', label: 'Donut', icon: PieChart },
  ];

  const colorSchemes = [
    { id: 'corporate', label: 'Corporate', colors: ['#1C3163', '#4A6FA5', '#8FB8DE'] },
    { id: 'vibrant', label: 'Vibrant', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'] },
    { id: 'pastel', label: 'Pastel', colors: ['#FFB3BA', '#BAFFC9', '#BAE1FF'] },
    { id: 'monochrome', label: 'Monochrome', colors: ['#333333', '#666666', '#999999'] },
  ];

  const handleAddDataPoint = () => {
    setChartData({
      ...chartData,
      data: [...chartData.data, { label: `Point ${chartData.data.length + 1}`, value: 0 }],
    });
  };

  const handleRemoveDataPoint = (index: number) => {
    setChartData({
      ...chartData,
      data: chartData.data.filter((_, i) => i !== index),
    });
  };

  const handleDataChange = (index: number, field: 'label' | 'value', value: string | number) => {
    const newData = [...chartData.data];
    newData[index] = {
      ...newData[index],
      [field]: field === 'value' ? Number(value) : value,
    };
    setChartData({ ...chartData, data: newData });
  };

  const handleSave = () => {
    onSave(chartData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200">
          <h2 className="text-xl font-semibold text-primary-900">Éditeur de graphique</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-6">
            {/* Left column - Configuration */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Titre du graphique
                </label>
                <input
                  type="text"
                  value={chartData.title}
                  onChange={(e) => setChartData({ ...chartData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Titre du graphique"
                />
              </div>

              {/* Chart type */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Type de graphique
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {chartTypes.map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => setChartData({ ...chartData, chartType: type })}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                        chartData.chartType === type
                          ? 'border-primary bg-primary-50'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${
                        chartData.chartType === type ? 'text-primary' : 'text-primary-400'
                      }`} />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color scheme */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Palette de couleurs
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.id}
                      onClick={() => setChartData({
                        ...chartData,
                        config: { ...chartData.config, colorScheme: scheme.id },
                      })}
                      className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${
                        chartData.config.colorScheme === scheme.id
                          ? 'border-primary bg-primary-50'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex gap-1">
                        {scheme.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-sm">{scheme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={chartData.config.showLegend}
                    onChange={(e) => setChartData({
                      ...chartData,
                      config: { ...chartData.config, showLegend: e.target.checked },
                    })}
                    className="w-4 h-4 text-primary border-primary-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-primary-700">Afficher la légende</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={chartData.config.showGrid}
                    onChange={(e) => setChartData({
                      ...chartData,
                      config: { ...chartData.config, showGrid: e.target.checked },
                    })}
                    className="w-4 h-4 text-primary border-primary-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-primary-700">Afficher la grille</span>
                </label>
              </div>
            </div>

            {/* Right column - Data */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-primary-700">
                  Données
                </label>
                <button
                  onClick={handleAddDataPoint}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-primary hover:bg-primary-50 rounded"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {chartData.data.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={point.label}
                      onChange={(e) => handleDataChange(index, 'label', e.target.value)}
                      className="flex-1 px-3 py-2 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Libellé"
                    />
                    <input
                      type="number"
                      value={point.value}
                      onChange={(e) => handleDataChange(index, 'value', e.target.value)}
                      className="w-24 px-3 py-2 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Valeur"
                    />
                    <button
                      onClick={() => handleRemoveDataPoint(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      disabled={chartData.data.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Preview placeholder */}
              <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-500 text-center">
                  Aperçu du graphique
                </p>
                <div className="h-40 flex items-center justify-center text-primary-400">
                  <BarChart2 className="w-16 h-16" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-primary-200 bg-primary-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};
