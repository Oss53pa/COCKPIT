import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  showDot?: boolean;
}

export function Sparkline({
  data,
  color = '#22c55e',
  width = 80,
  height = 24,
  showDot = true,
}: SparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="bg-primary-100 dark:bg-primary-700 rounded"
        style={{ width, height }}
      />
    );
  }

  // Determine trend color
  const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0;
  const trendColor = trend >= 0 ? '#22c55e' : '#ef4444';
  const finalColor = color === 'auto' ? trendColor : color;

  // Format data for recharts
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={finalColor}
            strokeWidth={1.5}
            dot={showDot ? { r: 0 } : false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SparklineWithLabelProps extends SparklineProps {
  label?: string;
  value?: string | number;
  trend?: number;
}

export function SparklineWithLabel({
  data,
  color = 'auto',
  width = 80,
  height = 24,
  label,
  value,
  trend,
}: SparklineWithLabelProps) {
  const trendColor = trend !== undefined && trend >= 0 ? 'text-success' : 'text-error';
  const trendIcon = trend !== undefined && trend >= 0 ? '↑' : '↓';

  return (
    <div className="flex items-center gap-2">
      <Sparkline data={data} color={color} width={width} height={height} />
      {(label || value !== undefined || trend !== undefined) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs text-primary-500 dark:text-primary-400">
              {label}
            </span>
          )}
          <div className="flex items-center gap-1">
            {value !== undefined && (
              <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                {value}
              </span>
            )}
            {trend !== undefined && (
              <span className={`text-xs ${trendColor}`}>
                {trendIcon} {Math.abs(trend).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
