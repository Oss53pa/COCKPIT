import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PerformanceGaugeProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  thresholds?: {
    green: number;
    orange: number;
  };
}

export function PerformanceGauge({
  value,
  size = 'md',
  showLabel = true,
  label = 'Performance',
  thresholds = { green: 80, orange: 60 },
}: PerformanceGaugeProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));

  // Determine color based on thresholds
  const getColor = () => {
    if (clampedValue >= thresholds.green) return '#22c55e';
    if (clampedValue >= thresholds.orange) return '#f59e0b';
    return '#ef4444';
  };

  const color = getColor();

  // Size configurations
  const sizeConfig = {
    sm: { width: 80, height: 48, innerRadius: 25, outerRadius: 35, fontSize: 'text-sm' },
    md: { width: 120, height: 72, innerRadius: 38, outerRadius: 52, fontSize: 'text-lg' },
    lg: { width: 160, height: 96, innerRadius: 50, outerRadius: 70, fontSize: 'text-2xl' },
  };

  const config = sizeConfig[size];

  // Data for the gauge (half-circle)
  const data = [
    { value: clampedValue, color },
    { value: 100 - clampedValue, color: '#e5e5e5' },
  ];

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: config.width, height: config.height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={config.innerRadius}
              outerRadius={config.outerRadius}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? entry.color : 'var(--color-border)'}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Value display in center */}
        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{ paddingBottom: size === 'sm' ? '4px' : '8px' }}
        >
          <span className={`font-bold text-primary-900 dark:text-primary-100 ${config.fontSize}`}>
            {Math.round(clampedValue)}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-xs text-primary-500 dark:text-primary-400 mt-1">
          {label}
        </span>
      )}
    </div>
  );
}

interface MultiGaugeProps {
  gauges: Array<{
    value: number;
    label: string;
    color?: string;
  }>;
}

export function MultiGauge({ gauges }: MultiGaugeProps) {
  return (
    <div className="flex items-center justify-around gap-4">
      {gauges.map((gauge, index) => (
        <PerformanceGauge
          key={index}
          value={gauge.value}
          label={gauge.label}
          size="sm"
        />
      ))}
    </div>
  );
}
