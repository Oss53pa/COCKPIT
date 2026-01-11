/**
 * KPI Card Block Component
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KPICardBlock as KPICardBlockType, ContentBlock } from '../../../types/reportStudio';

interface KPICardBlockProps {
  block: KPICardBlockType;
  isEditable: boolean;
  onChange: (updates: Partial<ContentBlock>) => void;
}

export const KPICardBlock: React.FC<KPICardBlockProps> = ({
  block,
  isEditable,
  onChange,
}) => {
  const changeColors = {
    positive: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: TrendingUp,
    },
    negative: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: TrendingDown,
    },
    neutral: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      icon: Minus,
    },
  };

  const changeStyle = changeColors[block.changeType || 'neutral'];
  const ChangeIcon = changeStyle.icon;

  const formatValue = (value: string | number): string => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('fr-FR').format(value);
    }
    return value;
  };

  const renderSparkline = () => {
    if (!block.sparkline || block.sparkline.length === 0) return null;

    const max = Math.max(...block.sparkline);
    const min = Math.min(...block.sparkline);
    const range = max - min || 1;
    const height = 40;
    const width = 100;
    const stepX = width / (block.sparkline.length - 1);

    const points = block.sparkline
      .map((value, index) => {
        const x = index * stepX;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
      >
        <polyline
          points={points}
          fill="none"
          stroke={block.changeType === 'positive' ? '#10B981' : block.changeType === 'negative' ? '#EF4444' : '#6B7280'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="bg-white border border-primary-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Label */}
          <p className="text-sm text-primary-500 font-medium">{block.label}</p>

          {/* Value */}
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-primary-900">
              {formatValue(block.value)}
            </span>
            {block.unit && (
              <span className="text-lg text-primary-600">{block.unit}</span>
            )}
          </div>

          {/* Change indicator */}
          {block.change !== undefined && (
            <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full ${changeStyle.bg}`}>
              <ChangeIcon className={`w-3 h-3 ${changeStyle.text}`} />
              <span className={`text-sm font-medium ${changeStyle.text}`}>
                {block.change > 0 ? '+' : ''}{block.change}%
              </span>
            </div>
          )}
        </div>

        {/* Sparkline */}
        {block.sparkline && (
          <div className="flex-shrink-0">
            {renderSparkline()}
          </div>
        )}
      </div>
    </div>
  );
};
