import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendDataPoint {
  periode: string;
  label: string;
  [key: string]: number | string;
}

interface TrendLine {
  key: string;
  name: string;
  color: string;
}

interface TrendWidgetProps {
  title: string;
  data: TrendDataPoint[];
  lines: TrendLine[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  periodType?: 'mois' | 'trimestre' | 'annee';
}

export function TrendWidget({
  title,
  data,
  lines,
  height = 250,
  showGrid = true,
  showLegend = true,
}: TrendWidgetProps) {
  const [activeLine, setActiveLine] = useState<string | null>(null);

  // Calculate trends for each line
  const trends = lines.map((line) => {
    if (data.length < 2) return { key: line.key, trend: 0, direction: 'stable' as const };
    const firstValue = data[0][line.key] as number;
    const lastValue = data[data.length - 1][line.key] as number;
    const trend = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
    const direction = trend > 1 ? 'up' : trend < -1 ? 'down' : 'stable';
    return { key: line.key, trend, direction };
  });

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-error" />;
      default:
        return <Minus className="w-4 h-4 text-primary-400" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white dark:bg-primary-800 border border-primary-200 dark:border-primary-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-primary-600 dark:text-primary-400">
                {entry.name}
              </span>
            </div>
            <span className="font-medium text-primary-900 dark:text-primary-100">
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-primary-500 dark:text-primary-400">
        <p>Aucune donn\u00e9e de tendance disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with title and trend indicators */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-primary-900 dark:text-primary-100">
          {title}
        </h3>
        <div className="flex items-center gap-3">
          {trends.map((t) => {
            const line = lines.find((l) => l.key === t.key);
            if (!line) return null;
            return (
              <div
                key={t.key}
                className="flex items-center gap-1 text-xs"
                onMouseEnter={() => setActiveLine(t.key)}
                onMouseLeave={() => setActiveLine(null)}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: line.color }}
                />
                <span className="text-primary-600 dark:text-primary-400">
                  {line.name}
                </span>
                {getTrendIcon(t.direction)}
                <span
                  className={`font-medium ${
                    t.direction === 'up'
                      ? 'text-success'
                      : t.direction === 'down'
                      ? 'text-error'
                      : 'text-primary-500'
                  }`}
                >
                  {t.trend > 0 ? '+' : ''}
                  {t.trend.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid)"
                vertical={false}
              />
            )}
            <XAxis
              dataKey="label"
              stroke="var(--chart-text)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--chart-text)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
              }
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px' }}
              />
            )}
            {lines.map((line) => (
              <Area
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                fill={line.color}
                fillOpacity={activeLine === null || activeLine === line.key ? 0.1 : 0.02}
                strokeWidth={activeLine === null || activeLine === line.key ? 2 : 1}
                strokeOpacity={activeLine === null || activeLine === line.key ? 1 : 0.3}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Helper function to generate mock trend data
export function generateTrendData(
  months: number = 6,
  baseValue: number = 100,
  variance: number = 20
): TrendDataPoint[] {
  const monthNames = [
    'Jan', 'F\u00e9v', 'Mar', 'Avr', 'Mai', 'Jun',
    'Jul', 'Ao\u00fb', 'Sep', 'Oct', 'Nov', 'D\u00e9c',
  ];

  const now = new Date();
  const data: TrendDataPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    data.push({
      periode: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
      label: `${monthNames[monthIndex]} ${year}`,
      value: baseValue + (Math.random() - 0.5) * variance * 2,
    });
  }

  return data;
}
