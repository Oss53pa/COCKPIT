/**
 * Chart Block Component
 */

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { ChartBlock as ChartBlockType, ContentBlock } from '../../../types/reportStudio';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartBlockProps {
  block: ChartBlockType;
  isEditable: boolean;
  onChange: (updates: Partial<ContentBlock>) => void;
}

export const ChartBlock: React.FC<ChartBlockProps> = ({
  block,
  isEditable,
  onChange,
}) => {
  const chartData = {
    labels: block.data.labels || [],
    datasets: block.data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || '#1C3163',
      borderColor: dataset.borderColor || '#1C3163',
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: block.config.legend?.show ?? true,
        position: (block.config.legend?.position || 'top') as 'top' | 'bottom' | 'left' | 'right',
      },
      title: {
        display: !!block.config.title,
        text: block.config.title || '',
      },
    },
    scales: block.chartType !== 'pie' && block.chartType !== 'donut' ? {
      x: {
        grid: {
          display: block.config.gridLines ?? true,
        },
        title: {
          display: !!block.config.xAxis?.title,
          text: block.config.xAxis?.title || '',
        },
      },
      y: {
        grid: {
          display: block.config.gridLines ?? true,
        },
        title: {
          display: !!block.config.yAxis?.title,
          text: block.config.yAxis?.title || '',
        },
        min: block.config.yAxis?.min,
        max: block.config.yAxis?.max,
      },
    } : undefined,
  };

  const renderChart = () => {
    switch (block.chartType) {
      case 'line':
      case 'area':
        return (
          <Line
            data={{
              ...chartData,
              datasets: chartData.datasets.map((d) => ({
                ...d,
                fill: block.chartType === 'area',
              })),
            }}
            options={options}
          />
        );
      case 'bar':
      case 'horizontal_bar':
      case 'stacked_bar':
        return (
          <Bar
            data={chartData}
            options={{
              ...options,
              indexAxis: block.chartType === 'horizontal_bar' ? 'y' : 'x',
              scales: block.chartType === 'stacked_bar' ? {
                x: { stacked: true },
                y: { stacked: true },
              } : options.scales,
            }}
          />
        );
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'donut':
        return <Doughnut data={chartData} options={options} />;
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-primary-200">
      {/* Chart title */}
      {block.config.title && (
        <h3 className="text-lg font-semibold text-primary-900 mb-2">
          {block.config.title}
        </h3>
      )}

      {/* Chart subtitle */}
      {block.config.subtitle && (
        <p className="text-sm text-primary-500 mb-4">{block.config.subtitle}</p>
      )}

      {/* Chart container */}
      <div
        style={{
          height: block.config.height || 300,
          width: '100%',
        }}
      >
        {renderChart()}
      </div>

      {/* Chart source */}
      {block.config.source && (
        <p className="text-xs text-primary-400 mt-2">
          Source: {block.config.source}
        </p>
      )}

      {/* Edit overlay */}
      {isEditable && (
        <div
          className="absolute inset-0 bg-primary/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={() => {
            // Open chart editor modal
            console.log('Edit chart:', block.id);
          }}
        >
          <span className="bg-white px-4 py-2 rounded-lg shadow text-sm font-medium text-primary">
            Double-cliquez pour modifier
          </span>
        </div>
      )}
    </div>
  );
};
