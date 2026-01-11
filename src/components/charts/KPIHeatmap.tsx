import React, { useState } from 'react';
import type { StatutKPI } from '../../types';

interface HeatmapCell {
  centreId: string;
  centreName: string;
  kpiId: string;
  kpiName: string;
  value: number;
  target: number;
  status: StatutKPI;
  unit?: string;
}

interface KPIHeatmapProps {
  data: HeatmapCell[];
  centres: Array<{ id: string; name: string; code: string }>;
  kpis: Array<{ id: string; name: string }>;
  onCellClick?: (cell: HeatmapCell) => void;
}

const statusColors: Record<StatutKPI, { bg: string; hover: string }> = {
  vert: {
    bg: 'bg-success/80',
    hover: 'hover:bg-success',
  },
  orange: {
    bg: 'bg-warning/80',
    hover: 'hover:bg-warning',
  },
  rouge: {
    bg: 'bg-error/80',
    hover: 'hover:bg-error',
  },
};

export function KPIHeatmap({ data, centres, kpis, onCellClick }: KPIHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Create a lookup map for quick access
  const dataMap = new Map<string, HeatmapCell>();
  data.forEach((cell) => {
    dataMap.set(`${cell.centreId}-${cell.kpiId}`, cell);
  });

  const handleMouseEnter = (
    cell: HeatmapCell | undefined,
    event: React.MouseEvent
  ) => {
    if (cell) {
      setHoveredCell(cell);
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  if (centres.length === 0 || kpis.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-primary-500 dark:text-primary-400">
        Aucune donn\u00e9e disponible pour la heatmap
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white dark:bg-primary-800 p-2 text-left text-xs font-medium text-primary-500 dark:text-primary-400 border-b border-primary-200 dark:border-primary-700">
              Centre / KPI
            </th>
            {kpis.map((kpi) => (
              <th
                key={kpi.id}
                className="p-2 text-center text-xs font-medium text-primary-600 dark:text-primary-300 border-b border-primary-200 dark:border-primary-700 min-w-[60px]"
                title={kpi.name}
              >
                <div className="truncate max-w-[80px]">{kpi.name}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {centres.map((centre) => (
            <tr key={centre.id}>
              <td className="sticky left-0 z-10 bg-white dark:bg-primary-800 p-2 text-sm font-medium text-primary-900 dark:text-primary-100 border-b border-primary-100 dark:border-primary-700">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary-500 dark:text-primary-400 font-mono">
                    {centre.code}
                  </span>
                  <span className="truncate max-w-[120px]">{centre.name}</span>
                </div>
              </td>
              {kpis.map((kpi) => {
                const cell = dataMap.get(`${centre.id}-${kpi.id}`);
                const colors = cell ? statusColors[cell.status] : null;

                return (
                  <td
                    key={kpi.id}
                    className="p-1 border-b border-primary-100 dark:border-primary-700"
                  >
                    {cell ? (
                      <button
                        className={`w-full h-8 rounded ${colors?.bg} ${colors?.hover} transition-colors cursor-pointer flex items-center justify-center`}
                        onMouseEnter={(e) => handleMouseEnter(cell, e)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => onCellClick?.(cell)}
                      >
                        <span className="text-xs font-medium text-white">
                          {cell.value.toLocaleString('fr-FR', {
                            maximumFractionDigits: 1,
                          })}
                        </span>
                      </button>
                    ) : (
                      <div className="w-full h-8 rounded bg-primary-100 dark:bg-primary-700 flex items-center justify-center">
                        <span className="text-xs text-primary-400">-</span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 px-3 py-2 bg-primary-900 dark:bg-primary-100 text-white dark:text-primary-900 text-xs rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="font-medium mb-1">{hoveredCell.kpiName}</div>
          <div className="flex items-center gap-2">
            <span>
              Valeur: {hoveredCell.value.toLocaleString('fr-FR')}{' '}
              {hoveredCell.unit || ''}
            </span>
          </div>
          <div className="text-primary-300 dark:text-primary-600">
            Cible: {hoveredCell.target.toLocaleString('fr-FR')}{' '}
            {hoveredCell.unit || ''}
          </div>
          <div
            className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #171717',
            }}
          />
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-success" />
          <span className="text-primary-600 dark:text-primary-400">Atteint</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-warning" />
          <span className="text-primary-600 dark:text-primary-400">Attention</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-error" />
          <span className="text-primary-600 dark:text-primary-400">Critique</span>
        </div>
      </div>
    </div>
  );
}
