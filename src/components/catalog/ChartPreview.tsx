/**
 * ChartPreview - SVG previews for chart types in the catalog
 * Provides visual previews of each chart type for the BI catalog
 */

import React from 'react';

interface ChartPreviewProps {
  chartCode: string;
  className?: string;
}

const ChartPreview: React.FC<ChartPreviewProps> = ({ chartCode, className = '' }) => {
  const baseClass = `w-full h-32 rounded-lg ${className}`;

  const previews: Record<string, React.ReactNode> = {
    // ============================================================
    // COMPARISON CHARTS
    // ============================================================
    BAR_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <defs>
          <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <rect x="20" y="70" width="30" height="20" rx="2" fill="url(#barGrad)" />
        <rect x="60" y="40" width="30" height="50" rx="2" fill="url(#barGrad)" />
        <rect x="100" y="25" width="30" height="65" rx="2" fill="url(#barGrad)" />
        <rect x="140" y="50" width="30" height="40" rx="2" fill="url(#barGrad)" />
        <line x1="15" y1="90" x2="185" y2="90" stroke="#E5E7EB" strokeWidth="1" />
      </svg>
    ),

    COLUMN_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <defs>
          <linearGradient id="colGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <rect x="25" y="60" width="25" height="30" rx="2" fill="url(#colGrad)" />
        <rect x="55" y="35" width="25" height="55" rx="2" fill="url(#colGrad)" />
        <rect x="85" y="20" width="25" height="70" rx="2" fill="url(#colGrad)" />
        <rect x="115" y="45" width="25" height="45" rx="2" fill="url(#colGrad)" />
        <rect x="145" y="30" width="25" height="60" rx="2" fill="url(#colGrad)" />
        <line x1="20" y1="90" x2="180" y2="90" stroke="#E5E7EB" strokeWidth="1" />
      </svg>
    ),

    STACKED_BAR: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="25" y="55" width="25" height="35" rx="2" fill="#3B82F6" />
        <rect x="25" y="35" width="25" height="20" rx="2" fill="#60A5FA" />
        <rect x="55" y="30" width="25" height="60" rx="2" fill="#3B82F6" />
        <rect x="55" y="10" width="25" height="20" rx="2" fill="#60A5FA" />
        <rect x="85" y="40" width="25" height="50" rx="2" fill="#3B82F6" />
        <rect x="85" y="25" width="25" height="15" rx="2" fill="#60A5FA" />
        <rect x="115" y="50" width="25" height="40" rx="2" fill="#3B82F6" />
        <rect x="115" y="30" width="25" height="20" rx="2" fill="#60A5FA" />
        <rect x="145" y="35" width="25" height="55" rx="2" fill="#3B82F6" />
        <rect x="145" y="15" width="25" height="20" rx="2" fill="#60A5FA" />
        <line x1="20" y1="90" x2="180" y2="90" stroke="#E5E7EB" strokeWidth="1" />
      </svg>
    ),

    GROUPED_BAR: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="25" y="50" width="12" height="35" rx="2" fill="#3B82F6" />
        <rect x="39" y="40" width="12" height="45" rx="2" fill="#10B981" />
        <rect x="65" y="30" width="12" height="55" rx="2" fill="#3B82F6" />
        <rect x="79" y="25" width="12" height="60" rx="2" fill="#10B981" />
        <rect x="105" y="45" width="12" height="40" rx="2" fill="#3B82F6" />
        <rect x="119" y="35" width="12" height="50" rx="2" fill="#10B981" />
        <rect x="145" y="55" width="12" height="30" rx="2" fill="#3B82F6" />
        <rect x="159" y="50" width="12" height="35" rx="2" fill="#10B981" />
        <line x1="20" y1="85" x2="180" y2="85" stroke="#E5E7EB" strokeWidth="1" />
      </svg>
    ),

    WATERFALL_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="20" y="30" width="25" height="60" rx="2" fill="#10B981" />
        <rect x="50" y="30" width="25" height="20" rx="2" fill="#10B981" />
        <line x1="45" y1="30" x2="55" y2="30" stroke="#9CA3AF" strokeDasharray="2" />
        <rect x="80" y="20" width="25" height="30" rx="2" fill="#10B981" />
        <line x1="75" y1="50" x2="85" y2="50" stroke="#9CA3AF" strokeDasharray="2" />
        <rect x="110" y="50" width="25" height="20" rx="2" fill="#EF4444" />
        <line x1="105" y1="50" x2="115" y2="50" stroke="#9CA3AF" strokeDasharray="2" />
        <rect x="140" y="40" width="25" height="50" rx="2" fill="#3B82F6" />
        <line x1="20" y1="90" x2="180" y2="90" stroke="#E5E7EB" strokeWidth="1" />
      </svg>
    ),

    BULLET_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="20" y="20" width="160" height="20" rx="2" fill="#E5E7EB" />
        <rect x="20" y="20" width="120" height="20" rx="2" fill="#D1D5DB" />
        <rect x="20" y="20" width="80" height="20" rx="2" fill="#9CA3AF" />
        <rect x="20" y="25" width="100" height="10" rx="1" fill="#3B82F6" />
        <line x1="130" y1="18" x2="130" y2="42" stroke="#1F2937" strokeWidth="2" />
        <rect x="20" y="55" width="160" height="20" rx="2" fill="#E5E7EB" />
        <rect x="20" y="55" width="140" height="20" rx="2" fill="#D1D5DB" />
        <rect x="20" y="55" width="100" height="20" rx="2" fill="#9CA3AF" />
        <rect x="20" y="60" width="130" height="10" rx="1" fill="#10B981" />
        <line x1="120" y1="53" x2="120" y2="77" stroke="#1F2937" strokeWidth="2" />
      </svg>
    ),

    RADAR_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <polygon points="100,15 145,35 140,70 100,85 60,70 55,35" fill="none" stroke="#E5E7EB" strokeWidth="1" />
        <polygon points="100,30 130,42 128,62 100,72 72,62 70,42" fill="none" stroke="#E5E7EB" strokeWidth="1" />
        <polygon points="100,45 115,50 114,58 100,62 86,58 85,50" fill="none" stroke="#E5E7EB" strokeWidth="1" />
        <polygon points="100,20 140,38 120,68 100,78 70,60 65,38" fill="rgba(59, 130, 246, 0.3)" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="100" cy="20" r="3" fill="#3B82F6" />
        <circle cx="140" cy="38" r="3" fill="#3B82F6" />
        <circle cx="120" cy="68" r="3" fill="#3B82F6" />
        <circle cx="70" cy="60" r="3" fill="#3B82F6" />
        <circle cx="65" cy="38" r="3" fill="#3B82F6" />
      </svg>
    ),

    LOLLIPOP_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <line x1="30" y1="70" x2="30" y2="90" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="30" cy="70" r="6" fill="#3B82F6" />
        <line x1="60" y1="45" x2="60" y2="90" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="60" cy="45" r="6" fill="#3B82F6" />
        <line x1="90" y1="25" x2="90" y2="90" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="90" cy="25" r="6" fill="#3B82F6" />
        <line x1="120" y1="55" x2="120" y2="90" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="120" cy="55" r="6" fill="#3B82F6" />
        <line x1="150" y1="35" x2="150" y2="90" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="150" cy="35" r="6" fill="#3B82F6" />
        <line x1="20" y1="90" x2="170" y2="90" stroke="#E5E7EB" strokeWidth="1" />
      </svg>
    ),

    // ============================================================
    // TREND CHARTS
    // ============================================================
    LINE_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
          </linearGradient>
        </defs>
        <path d="M20 70 L50 50 L80 60 L110 30 L140 40 L170 20" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
        <path d="M20 70 L50 50 L80 60 L110 30 L140 40 L170 20 L170 90 L20 90 Z" fill="url(#lineGrad)" />
        <circle cx="20" cy="70" r="4" fill="#10B981" />
        <circle cx="50" cy="50" r="4" fill="#10B981" />
        <circle cx="80" cy="60" r="4" fill="#10B981" />
        <circle cx="110" cy="30" r="4" fill="#10B981" />
        <circle cx="140" cy="40" r="4" fill="#10B981" />
        <circle cx="170" cy="20" r="4" fill="#10B981" />
        <line x1="15" y1="90" x2="185" y2="90" stroke="#E5E7EB" strokeWidth="1" />
      </svg>
    ),

    AREA_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <defs>
          <linearGradient id="areaGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
          </linearGradient>
          <linearGradient id="areaGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.1)" />
          </linearGradient>
        </defs>
        <path d="M20 60 L50 45 L80 55 L110 35 L140 45 L170 25 L170 85 L20 85 Z" fill="url(#areaGrad1)" />
        <path d="M20 70 L50 60 L80 68 L110 50 L140 58 L170 40 L170 85 L20 85 Z" fill="url(#areaGrad2)" />
        <path d="M20 60 L50 45 L80 55 L110 35 L140 45 L170 25" fill="none" stroke="#3B82F6" strokeWidth="2" />
        <path d="M20 70 L50 60 L80 68 L110 50 L140 58 L170 40" fill="none" stroke="#8B5CF6" strokeWidth="2" />
      </svg>
    ),

    SPARKLINE: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="20" y="25" width="160" height="50" rx="4" fill="#F3F4F6" />
        <path d="M30 55 L45 45 L60 50 L75 35 L90 40 L105 30 L120 38 L135 32 L150 42 L165 28"
              fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
        <circle cx="165" cy="28" r="3" fill="#10B981" />
        <text x="100" y="90" textAnchor="middle" fontSize="10" fill="#6B7280">+12.5%</text>
      </svg>
    ),

    COMBO_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="25" y="55" width="20" height="30" rx="2" fill="#3B82F6" />
        <rect x="55" y="40" width="20" height="45" rx="2" fill="#3B82F6" />
        <rect x="85" y="50" width="20" height="35" rx="2" fill="#3B82F6" />
        <rect x="115" y="35" width="20" height="50" rx="2" fill="#3B82F6" />
        <rect x="145" y="45" width="20" height="40" rx="2" fill="#3B82F6" />
        <path d="M35 50 L65 30 L95 40 L125 25 L155 35" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        <circle cx="35" cy="50" r="4" fill="#EF4444" />
        <circle cx="65" cy="30" r="4" fill="#EF4444" />
        <circle cx="95" cy="40" r="4" fill="#EF4444" />
        <circle cx="125" cy="25" r="4" fill="#EF4444" />
        <circle cx="155" cy="35" r="4" fill="#EF4444" />
        <line x1="20" y1="85" x2="180" y2="85" stroke="#E5E7EB" strokeWidth="1" />
      </svg>
    ),

    STEP_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <path d="M25 70 L45 70 L45 50 L65 50 L65 35 L85 35 L85 45 L105 45 L105 30 L125 30 L125 40 L145 40 L145 25 L165 25"
              fill="none" stroke="#10B981" strokeWidth="3" />
        <line x1="20" y1="85" x2="175" y2="85" stroke="#E5E7EB" strokeWidth="1" />
      </svg>
    ),

    SLOPE_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <line x1="40" y1="15" x2="40" y2="85" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="160" y1="15" x2="160" y2="85" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="40" y1="25" x2="160" y2="35" stroke="#3B82F6" strokeWidth="2" />
        <line x1="40" y1="40" x2="160" y2="25" stroke="#10B981" strokeWidth="2" />
        <line x1="40" y1="55" x2="160" y2="70" stroke="#F59E0B" strokeWidth="2" />
        <line x1="40" y1="70" x2="160" y2="55" stroke="#EF4444" strokeWidth="2" />
        <circle cx="40" cy="25" r="4" fill="#3B82F6" />
        <circle cx="160" cy="35" r="4" fill="#3B82F6" />
        <circle cx="40" cy="40" r="4" fill="#10B981" />
        <circle cx="160" cy="25" r="4" fill="#10B981" />
        <circle cx="40" cy="55" r="4" fill="#F59E0B" />
        <circle cx="160" cy="70" r="4" fill="#F59E0B" />
        <circle cx="40" cy="70" r="4" fill="#EF4444" />
        <circle cx="160" cy="55" r="4" fill="#EF4444" />
        <text x="40" y="95" textAnchor="middle" fontSize="8" fill="#6B7280">2023</text>
        <text x="160" y="95" textAnchor="middle" fontSize="8" fill="#6B7280">2024</text>
      </svg>
    ),

    RANGE_AREA: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <defs>
          <linearGradient id="rangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
          </linearGradient>
        </defs>
        <path d="M25 30 L55 25 L85 35 L115 20 L145 30 L175 15 L175 70 L145 65 L115 55 L85 70 L55 60 L25 65 Z"
              fill="url(#rangeGrad)" stroke="#3B82F6" strokeWidth="1" />
        <path d="M25 48 L55 43 L85 52 L115 38 L145 48 L175 35" fill="none" stroke="#3B82F6" strokeWidth="2" />
        <line x1="20" y1="85" x2="180" y2="85" stroke="#E5E7EB" strokeWidth="1" />
      </svg>
    ),

    // ============================================================
    // DISTRIBUTION CHARTS
    // ============================================================
    PIE_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <circle cx="100" cy="50" r="40" fill="#E5E7EB" />
        <path d="M100 50 L100 10 A40 40 0 0 1 140 50 Z" fill="#3B82F6" />
        <path d="M100 50 L140 50 A40 40 0 0 1 100 90 Z" fill="#10B981" />
        <path d="M100 50 L100 90 A40 40 0 0 1 65 70 Z" fill="#F59E0B" />
        <path d="M100 50 L65 70 A40 40 0 0 1 60 50 Z" fill="#EF4444" />
        <path d="M100 50 L60 50 A40 40 0 0 1 100 10 Z" fill="#8B5CF6" />
      </svg>
    ),

    DONUT_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <circle cx="100" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="15" />
        <circle cx="100" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="15"
                strokeDasharray="75 176" strokeDashoffset="0" transform="rotate(-90 100 50)" />
        <circle cx="100" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="15"
                strokeDasharray="50 201" strokeDashoffset="-75" transform="rotate(-90 100 50)" />
        <circle cx="100" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="15"
                strokeDasharray="45 206" strokeDashoffset="-125" transform="rotate(-90 100 50)" />
        <circle cx="100" cy="50" r="40" fill="none" stroke="#8B5CF6" strokeWidth="15"
                strokeDasharray="81 170" strokeDashoffset="-170" transform="rotate(-90 100 50)" />
        <text x="100" y="54" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1F2937">75%</text>
      </svg>
    ),

    FUNNEL_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <path d="M30 15 L170 15 L150 30 L50 30 Z" fill="#3B82F6" />
        <path d="M50 32 L150 32 L135 47 L65 47 Z" fill="#60A5FA" />
        <path d="M65 49 L135 49 L120 64 L80 64 Z" fill="#93C5FD" />
        <path d="M80 66 L120 66 L110 81 L90 81 Z" fill="#BFDBFE" />
        <text x="100" y="24" textAnchor="middle" fontSize="8" fill="white">1000</text>
        <text x="100" y="42" textAnchor="middle" fontSize="8" fill="white">750</text>
        <text x="100" y="58" textAnchor="middle" fontSize="8" fill="#1F2937">400</text>
        <text x="100" y="76" textAnchor="middle" fontSize="8" fill="#1F2937">120</text>
      </svg>
    ),

    HISTOGRAM: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="25" y="70" width="18" height="15" fill="#3B82F6" />
        <rect x="45" y="45" width="18" height="40" fill="#3B82F6" />
        <rect x="65" y="25" width="18" height="60" fill="#3B82F6" />
        <rect x="85" y="15" width="18" height="70" fill="#3B82F6" />
        <rect x="105" y="30" width="18" height="55" fill="#3B82F6" />
        <rect x="125" y="50" width="18" height="35" fill="#3B82F6" />
        <rect x="145" y="65" width="18" height="20" fill="#3B82F6" />
        <path d="M30 72 Q70 20, 95 15 Q120 20, 155 67" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="3" />
        <line x1="20" y1="85" x2="175" y2="85" stroke="#E5E7EB" strokeWidth="1" />
      </svg>
    ),

    BOX_PLOT: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <line x1="40" y1="50" x2="40" y2="15" stroke="#3B82F6" strokeWidth="1" />
        <line x1="40" y1="50" x2="40" y2="85" stroke="#3B82F6" strokeWidth="1" />
        <line x1="30" y1="15" x2="50" y2="15" stroke="#3B82F6" strokeWidth="2" />
        <line x1="30" y1="85" x2="50" y2="85" stroke="#3B82F6" strokeWidth="2" />
        <rect x="25" y="35" width="30" height="30" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2" />
        <line x1="25" y1="50" x2="55" y2="50" stroke="#1F2937" strokeWidth="2" />
        <line x1="100" y1="50" x2="100" y2="20" stroke="#10B981" strokeWidth="1" />
        <line x1="100" y1="50" x2="100" y2="80" stroke="#10B981" strokeWidth="1" />
        <line x1="90" y1="20" x2="110" y2="20" stroke="#10B981" strokeWidth="2" />
        <line x1="90" y1="80" x2="110" y2="80" stroke="#10B981" strokeWidth="2" />
        <rect x="85" y="38" width="30" height="25" fill="#A7F3D0" stroke="#10B981" strokeWidth="2" />
        <line x1="85" y1="48" x2="115" y2="48" stroke="#1F2937" strokeWidth="2" />
        <line x1="160" y1="50" x2="160" y2="25" stroke="#F59E0B" strokeWidth="1" />
        <line x1="160" y1="50" x2="160" y2="75" stroke="#F59E0B" strokeWidth="1" />
        <line x1="150" y1="25" x2="170" y2="25" stroke="#F59E0B" strokeWidth="2" />
        <line x1="150" y1="75" x2="170" y2="75" stroke="#F59E0B" strokeWidth="2" />
        <rect x="145" y="40" width="30" height="20" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
        <line x1="145" y1="52" x2="175" y2="52" stroke="#1F2937" strokeWidth="2" />
      </svg>
    ),

    WAFFLE_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        {[...Array(10)].map((_, row) =>
          [...Array(10)].map((_, col) => {
            const index = row * 10 + col;
            let fill = '#E5E7EB';
            if (index < 45) fill = '#3B82F6';
            else if (index < 70) fill = '#10B981';
            else if (index < 85) fill = '#F59E0B';
            return (
              <rect
                key={`waffle-${row}-${col}`}
                x={25 + col * 16}
                y={10 + row * 8}
                width="14"
                height="6"
                rx="1"
                fill={fill}
              />
            );
          })
        )}
      </svg>
    ),

    // ============================================================
    // RELATIONSHIP CHARTS
    // ============================================================
    SCATTER_PLOT: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <line x1="25" y1="85" x2="185" y2="85" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="25" y1="85" x2="25" y2="10" stroke="#E5E7EB" strokeWidth="1" />
        <circle cx="45" cy="65" r="5" fill="#3B82F6" opacity="0.7" />
        <circle cx="60" cy="55" r="4" fill="#3B82F6" opacity="0.7" />
        <circle cx="75" cy="60" r="6" fill="#3B82F6" opacity="0.7" />
        <circle cx="90" cy="45" r="5" fill="#3B82F6" opacity="0.7" />
        <circle cx="105" cy="50" r="4" fill="#3B82F6" opacity="0.7" />
        <circle cx="120" cy="35" r="7" fill="#3B82F6" opacity="0.7" />
        <circle cx="135" cy="40" r="5" fill="#3B82F6" opacity="0.7" />
        <circle cx="150" cy="30" r="4" fill="#3B82F6" opacity="0.7" />
        <circle cx="165" cy="25" r="6" fill="#3B82F6" opacity="0.7" />
        <line x1="40" y1="70" x2="170" y2="20" stroke="#EF4444" strokeWidth="2" strokeDasharray="4" opacity="0.5" />
      </svg>
    ),

    BUBBLE_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <circle cx="50" cy="60" r="15" fill="rgba(59, 130, 246, 0.5)" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="90" cy="40" r="22" fill="rgba(16, 185, 129, 0.5)" stroke="#10B981" strokeWidth="2" />
        <circle cx="140" cy="55" r="12" fill="rgba(245, 158, 11, 0.5)" stroke="#F59E0B" strokeWidth="2" />
        <circle cx="165" cy="30" r="18" fill="rgba(139, 92, 246, 0.5)" stroke="#8B5CF6" strokeWidth="2" />
        <circle cx="120" cy="70" r="10" fill="rgba(239, 68, 68, 0.5)" stroke="#EF4444" strokeWidth="2" />
      </svg>
    ),

    HEATMAP: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4, 5].map((col) => {
            const colors = ['#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#991B1B'];
            const colorIndex = (row * 6 + col) % colors.length;
            return (
              <rect
                key={`heatmap-${row}-${col}`}
                x={30 + col * 25}
                y={15 + row * 15}
                width="23"
                height="13"
                rx="2"
                fill={colors[colorIndex]}
              />
            );
          })
        )}
      </svg>
    ),

    CORRELATION_MATRIX: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4].map((col) => {
            const value = Math.abs(row - col);
            const colors = ['#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];
            return (
              <rect
                key={`corr-${row}-${col}`}
                x={35 + col * 28}
                y={12 + row * 16}
                width="26"
                height="14"
                rx="2"
                fill={colors[value]}
              />
            );
          })
        )}
      </svg>
    ),

    NETWORK_GRAPH: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <line x1="50" y1="30" x2="100" y2="50" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="50" y1="30" x2="80" y2="70" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="100" y1="50" x2="150" y2="30" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="100" y1="50" x2="130" y2="75" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="100" y1="50" x2="80" y2="70" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="150" y1="30" x2="130" y2="75" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="80" y1="70" x2="130" y2="75" stroke="#E5E7EB" strokeWidth="2" />
        <circle cx="50" cy="30" r="10" fill="#3B82F6" />
        <circle cx="100" cy="50" r="14" fill="#10B981" />
        <circle cx="150" cy="30" r="10" fill="#F59E0B" />
        <circle cx="80" cy="70" r="8" fill="#8B5CF6" />
        <circle cx="130" cy="75" r="8" fill="#EF4444" />
      </svg>
    ),

    // ============================================================
    // HIERARCHICAL CHARTS
    // ============================================================
    TREEMAP: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="15" y="10" width="80" height="50" rx="3" fill="#3B82F6" />
        <rect x="97" y="10" width="45" height="35" rx="3" fill="#10B981" />
        <rect x="144" y="10" width="42" height="35" rx="3" fill="#F59E0B" />
        <rect x="97" y="47" width="89" height="18" rx="3" fill="#8B5CF6" />
        <rect x="15" y="62" width="50" height="28" rx="3" fill="#EC4899" />
        <rect x="67" y="62" width="60" height="28" rx="3" fill="#EF4444" />
        <rect x="129" y="67" width="57" height="23" rx="3" fill="#14B8A6" />
      </svg>
    ),

    SUNBURST: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <circle cx="100" cy="50" r="15" fill="#3B82F6" />
        <path d="M100 50 L100 20 A30 30 0 0 1 130 50 Z" fill="#60A5FA" />
        <path d="M100 50 L130 50 A30 30 0 0 1 100 80 Z" fill="#93C5FD" />
        <path d="M100 50 L100 80 A30 30 0 0 1 70 50 Z" fill="#10B981" />
        <path d="M100 50 L70 50 A30 30 0 0 1 100 20 Z" fill="#F59E0B" />
        <path d="M100 10 A40 40 0 0 1 140 50 L130 50 A30 30 0 0 0 100 20 Z" fill="#8B5CF6" />
        <path d="M140 50 A40 40 0 0 1 100 90 L100 80 A30 30 0 0 0 130 50 Z" fill="#EC4899" />
        <path d="M100 90 A40 40 0 0 1 60 50 L70 50 A30 30 0 0 0 100 80 Z" fill="#14B8A6" />
        <path d="M60 50 A40 40 0 0 1 100 10 L100 20 A30 30 0 0 0 70 50 Z" fill="#EF4444" />
      </svg>
    ),

    SANKEY_DIAGRAM: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <path d="M20 20 C60 20, 60 15, 100 15 C140 15, 140 20, 180 20" fill="none" stroke="#3B82F6" strokeWidth="12" opacity="0.7" />
        <path d="M20 45 C60 45, 60 35, 100 35 C140 35, 140 50, 180 50" fill="none" stroke="#10B981" strokeWidth="10" opacity="0.7" />
        <path d="M20 70 C60 70, 60 55, 100 55 C140 55, 140 75, 180 75" fill="none" stroke="#F59E0B" strokeWidth="8" opacity="0.7" />
        <rect x="15" y="15" width="10" height="65" rx="2" fill="#1F2937" />
        <rect x="175" y="15" width="10" height="65" rx="2" fill="#1F2937" />
      </svg>
    ),

    ORG_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="80" y="10" width="40" height="20" rx="4" fill="#3B82F6" />
        <line x1="100" y1="30" x2="100" y2="40" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="50" y1="40" x2="150" y2="40" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="50" y1="40" x2="50" y2="50" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="100" y1="40" x2="100" y2="50" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="150" y1="40" x2="150" y2="50" stroke="#9CA3AF" strokeWidth="1" />
        <rect x="30" y="50" width="40" height="16" rx="3" fill="#10B981" />
        <rect x="80" y="50" width="40" height="16" rx="3" fill="#10B981" />
        <rect x="130" y="50" width="40" height="16" rx="3" fill="#10B981" />
        <line x1="50" y1="66" x2="50" y2="74" stroke="#9CA3AF" strokeWidth="1" />
        <rect x="35" y="74" width="30" height="14" rx="2" fill="#F59E0B" />
      </svg>
    ),

    // ============================================================
    // GEOGRAPHIC CHARTS
    // ============================================================
    CHOROPLETH_MAP: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <path d="M30 30 L50 25 L60 35 L55 50 L40 55 L25 45 Z" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="1" />
        <path d="M55 25 L80 20 L90 30 L85 45 L60 50 L55 35 Z" fill="#60A5FA" stroke="#3B82F6" strokeWidth="1" />
        <path d="M85 20 L110 25 L115 40 L105 55 L85 50 L80 35 Z" fill="#3B82F6" stroke="#3B82F6" strokeWidth="1" />
        <path d="M110 30 L135 25 L145 40 L140 60 L115 55 L110 40 Z" fill="#1D4ED8" stroke="#3B82F6" strokeWidth="1" />
        <path d="M140 30 L165 35 L170 55 L160 70 L145 65 L140 50 Z" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1" />
        <path d="M40 60 L70 55 L80 70 L70 85 L45 80 L35 70 Z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1" />
        <path d="M75 60 L105 55 L115 70 L105 85 L80 80 L70 70 Z" fill="#60A5FA" stroke="#3B82F6" strokeWidth="1" />
        <path d="M110 60 L145 55 L155 70 L145 85 L115 80 L105 70 Z" fill="#1E40AF" stroke="#3B82F6" strokeWidth="1" />
      </svg>
    ),

    BUBBLE_MAP: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="20" y="10" width="160" height="80" rx="5" fill="#E0F2FE" />
        <path d="M40 50 Q60 30, 80 50 T120 50 T160 50" fill="none" stroke="#BAE6FD" strokeWidth="2" />
        <circle cx="45" cy="45" r="8" fill="rgba(239, 68, 68, 0.6)" stroke="#EF4444" strokeWidth="1" />
        <circle cx="80" cy="35" r="15" fill="rgba(239, 68, 68, 0.6)" stroke="#EF4444" strokeWidth="1" />
        <circle cx="120" cy="55" r="10" fill="rgba(239, 68, 68, 0.6)" stroke="#EF4444" strokeWidth="1" />
        <circle cx="150" cy="40" r="20" fill="rgba(239, 68, 68, 0.6)" stroke="#EF4444" strokeWidth="1" />
        <circle cx="100" cy="70" r="6" fill="rgba(239, 68, 68, 0.6)" stroke="#EF4444" strokeWidth="1" />
      </svg>
    ),

    FLOW_MAP: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="20" y="15" width="160" height="70" rx="4" fill="#E0F2FE" />
        <circle cx="50" cy="40" r="6" fill="#3B82F6" />
        <circle cx="150" cy="60" r="8" fill="#EF4444" />
        <circle cx="100" cy="35" r="5" fill="#10B981" />
        <path d="M50 40 Q75 30, 100 35" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.6" />
        <path d="M100 35 Q125 40, 150 60" fill="none" stroke="#10B981" strokeWidth="3" opacity="0.6" />
        <path d="M50 40 Q100 70, 150 60" fill="none" stroke="#F59E0B" strokeWidth="4" opacity="0.6" />
      </svg>
    ),

    FLOOR_PLAN: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="20" y="15" width="160" height="70" rx="3" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" />
        <rect x="25" y="20" width="40" height="30" rx="2" fill="#10B981" opacity="0.7" />
        <rect x="70" y="20" width="50" height="30" rx="2" fill="#3B82F6" opacity="0.7" />
        <rect x="125" y="20" width="50" height="30" rx="2" fill="#F59E0B" opacity="0.7" />
        <rect x="25" y="55" width="60" height="25" rx="2" fill="#EF4444" opacity="0.7" />
        <rect x="90" y="55" width="40" height="25" rx="2" fill="#8B5CF6" opacity="0.7" />
        <rect x="135" y="55" width="40" height="25" rx="2" fill="#E5E7EB" />
        <text x="45" y="38" textAnchor="middle" fontSize="6" fill="white">A1</text>
        <text x="95" y="38" textAnchor="middle" fontSize="6" fill="white">A2</text>
        <text x="150" y="38" textAnchor="middle" fontSize="6" fill="white">A3</text>
      </svg>
    ),

    // ============================================================
    // KPI CHARTS
    // ============================================================
    GAUGE_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <path d="M40 80 A50 50 0 0 1 160 80" fill="none" stroke="#E5E7EB" strokeWidth="12" strokeLinecap="round" />
        <path d="M40 80 A50 50 0 0 1 130 35" fill="none" stroke="#10B981" strokeWidth="12" strokeLinecap="round" />
        <circle cx="100" cy="80" r="8" fill="#1F2937" />
        <line x1="100" y1="80" x2="125" y2="45" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" transform="rotate(-30 100 80)" />
        <text x="100" y="95" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1F2937">75%</text>
      </svg>
    ),

    KPI_CARD: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="20" y="15" width="160" height="70" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
        <text x="35" y="40" fontSize="12" fill="#6B7280">Revenue</text>
        <text x="35" y="62" fontSize="20" fontWeight="bold" fill="#1F2937">$124,500</text>
        <text x="35" y="78" fontSize="10" fill="#10B981">↑ 12.5%</text>
        <path d="M120 55 L130 50 L140 55 L150 45 L160 48 L170 35" fill="none" stroke="#10B981" strokeWidth="2" />
      </svg>
    ),

    PROGRESS_BAR: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <text x="20" y="25" fontSize="10" fill="#6B7280">Project Alpha</text>
        <rect x="20" y="32" width="160" height="12" rx="6" fill="#E5E7EB" />
        <rect x="20" y="32" width="120" height="12" rx="6" fill="#3B82F6" />
        <text x="182" y="42" fontSize="10" fill="#1F2937">75%</text>
        <text x="20" y="60" fontSize="10" fill="#6B7280">Project Beta</text>
        <rect x="20" y="67" width="160" height="12" rx="6" fill="#E5E7EB" />
        <rect x="20" y="67" width="80" height="12" rx="6" fill="#10B981" />
        <text x="182" y="77" fontSize="10" fill="#1F2937">50%</text>
      </svg>
    ),

    TRAFFIC_LIGHT: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="30" y="15" width="40" height="70" rx="8" fill="#1F2937" />
        <circle cx="50" cy="30" r="8" fill="#EF4444" />
        <circle cx="50" cy="50" r="8" fill="#6B7280" />
        <circle cx="50" cy="70" r="8" fill="#6B7280" />
        <rect x="85" y="15" width="40" height="70" rx="8" fill="#1F2937" />
        <circle cx="105" cy="30" r="8" fill="#6B7280" />
        <circle cx="105" cy="50" r="8" fill="#F59E0B" />
        <circle cx="105" cy="70" r="8" fill="#6B7280" />
        <rect x="140" y="15" width="40" height="70" rx="8" fill="#1F2937" />
        <circle cx="160" cy="30" r="8" fill="#6B7280" />
        <circle cx="160" cy="50" r="8" fill="#6B7280" />
        <circle cx="160" cy="70" r="8" fill="#10B981" />
      </svg>
    ),

    METRIC_TILE: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="20" y="15" width="70" height="70" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
        <text x="55" y="40" textAnchor="middle" fontSize="8" fill="#6B7280">Revenue</text>
        <text x="55" y="58" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1F2937">$45K</text>
        <text x="55" y="72" textAnchor="middle" fontSize="8" fill="#10B981">+15%</text>
        <rect x="110" y="15" width="70" height="70" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
        <text x="145" y="40" textAnchor="middle" fontSize="8" fill="#6B7280">Users</text>
        <text x="145" y="58" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1F2937">2.4K</text>
        <text x="145" y="72" textAnchor="middle" fontSize="8" fill="#EF4444">-3%</text>
      </svg>
    ),

    COMPARISON_INDICATOR: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="20" y="20" width="160" height="60" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
        <text x="40" y="42" fontSize="10" fill="#6B7280">vs Last Year</text>
        <text x="40" y="62" fontSize="18" fontWeight="bold" fill="#10B981">+23.5%</text>
        <polygon points="150,35 165,50 150,65" fill="#10B981" />
        <rect x="120" y="40" width="30" height="20" rx="4" fill="#D1FAE5" />
        <text x="135" y="54" textAnchor="middle" fontSize="10" fill="#10B981">▲</text>
      </svg>
    ),

    // ============================================================
    // TABLE CHARTS
    // ============================================================
    DATA_TABLE: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="20" y="15" width="160" height="70" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="1" />
        <rect x="20" y="15" width="160" height="15" fill="#F3F4F6" />
        <line x1="70" y1="15" x2="70" y2="85" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="120" y1="15" x2="120" y2="85" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="20" y1="30" x2="180" y2="30" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="20" y1="48" x2="180" y2="48" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="20" y1="66" x2="180" y2="66" stroke="#E5E7EB" strokeWidth="1" />
        <text x="45" y="25" textAnchor="middle" fontSize="7" fill="#6B7280">Name</text>
        <text x="95" y="25" textAnchor="middle" fontSize="7" fill="#6B7280">Value</text>
        <text x="150" y="25" textAnchor="middle" fontSize="7" fill="#6B7280">Status</text>
      </svg>
    ),

    PIVOT_TABLE: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="20" y="15" width="160" height="70" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="1" />
        <rect x="20" y="15" width="40" height="70" fill="#E0E7FF" />
        <rect x="20" y="15" width="160" height="15" fill="#C7D2FE" />
        <line x1="60" y1="15" x2="60" y2="85" stroke="#A5B4FC" strokeWidth="1" />
        <line x1="100" y1="15" x2="100" y2="85" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="140" y1="15" x2="140" y2="85" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="20" y1="30" x2="180" y2="30" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="20" y1="50" x2="180" y2="50" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="20" y1="70" x2="180" y2="70" stroke="#E5E7EB" strokeWidth="1" />
      </svg>
    ),

    MATRIX: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3, 4].map((col) => (
            <rect
              key={`matrix-${row}-${col}`}
              x={30 + col * 30}
              y={18 + row * 18}
              width="28"
              height="16"
              rx="2"
              fill={`rgba(59, 130, 246, ${0.2 + ((row * 5 + col) % 8) * 0.1})`}
            />
          ))
        )}
      </svg>
    ),

    CROSSTAB: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="20" y="15" width="160" height="70" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="1" />
        <rect x="20" y="15" width="45" height="70" fill="#FEF3C7" />
        <rect x="20" y="15" width="160" height="18" fill="#FDE68A" />
        <line x1="65" y1="15" x2="65" y2="85" stroke="#FCD34D" strokeWidth="1" />
        <line x1="20" y1="33" x2="180" y2="33" stroke="#E5E7EB" strokeWidth="1" />
        <text x="42" y="27" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#92400E">Cat.</text>
        <text x="110" y="27" textAnchor="middle" fontSize="7" fill="#92400E">Q1 | Q2 | Q3 | Q4</text>
      </svg>
    ),

    // ============================================================
    // 3D & IMMERSIVE
    // ============================================================
    '3D_BAR_CHART': (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <defs>
          <linearGradient id="bar3dGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <polygon points="30,75 50,75 55,70 35,70" fill="#1E40AF" />
        <rect x="30" y="55" width="20" height="20" fill="url(#bar3dGrad)" />
        <polygon points="50,55 55,50 55,70 50,75" fill="#2563EB" />
        <polygon points="70,75 90,75 95,70 75,70" fill="#1E40AF" />
        <rect x="70" y="35" width="20" height="40" fill="url(#bar3dGrad)" />
        <polygon points="90,35 95,30 95,70 90,75" fill="#2563EB" />
        <polygon points="110,75 130,75 135,70 115,70" fill="#1E40AF" />
        <rect x="110" y="20" width="20" height="55" fill="url(#bar3dGrad)" />
        <polygon points="130,20 135,15 135,70 130,75" fill="#2563EB" />
        <polygon points="150,75 170,75 175,70 155,70" fill="#1E40AF" />
        <rect x="150" y="40" width="20" height="35" fill="url(#bar3dGrad)" />
        <polygon points="170,40 175,35 175,70 170,75" fill="#2563EB" />
      </svg>
    ),

    '3D_PIE_CHART': (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <ellipse cx="100" cy="60" rx="50" ry="15" fill="#1E40AF" />
        <ellipse cx="100" cy="50" rx="50" ry="15" fill="#E5E7EB" />
        <path d="M100 50 L100 35 A35 10 0 0 1 135 50 Z" fill="#3B82F6" />
        <path d="M100 50 L135 50 A35 10 0 0 1 100 60 Z" fill="#10B981" />
        <path d="M100 50 L100 60 A35 10 0 0 1 70 50 Z" fill="#F59E0B" />
        <path d="M100 50 L70 50 A35 10 0 0 1 100 35 Z" fill="#8B5CF6" />
        <ellipse cx="100" cy="40" rx="50" ry="15" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      </svg>
    ),

    '3D_SCATTER': (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <line x1="30" y1="80" x2="100" y2="80" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="30" y1="80" x2="30" y2="20" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="30" y1="80" x2="60" y2="95" stroke="#E5E7EB" strokeWidth="1" />
        <circle cx="50" cy="60" r="5" fill="rgba(59, 130, 246, 0.7)" />
        <circle cx="75" cy="45" r="7" fill="rgba(16, 185, 129, 0.7)" />
        <circle cx="60" cy="35" r="4" fill="rgba(245, 158, 11, 0.7)" />
        <circle cx="90" cy="55" r="6" fill="rgba(139, 92, 246, 0.7)" />
        <circle cx="110" cy="40" r="5" fill="rgba(236, 72, 153, 0.7)" />
        <circle cx="130" cy="50" r="8" fill="rgba(239, 68, 68, 0.7)" />
        <circle cx="150" cy="30" r="6" fill="rgba(20, 184, 166, 0.7)" />
      </svg>
    ),

    '3D_SURFACE': (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <defs>
          <linearGradient id="surfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <path d="M20 70 Q50 50, 70 60 Q90 70, 100 40 Q110 10, 130 30 Q150 50, 180 35"
              fill="none" stroke="url(#surfGrad)" strokeWidth="3" />
        <path d="M20 80 Q50 60, 70 70 Q90 80, 100 50 Q110 20, 130 40 Q150 60, 180 45"
              fill="none" stroke="url(#surfGrad)" strokeWidth="2" opacity="0.6" />
        <path d="M20 90 Q50 70, 70 80 Q90 90, 100 60 Q110 30, 130 50 Q150 70, 180 55"
              fill="none" stroke="url(#surfGrad)" strokeWidth="1" opacity="0.3" />
      </svg>
    ),

    '3D_GLOBE': (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <defs>
          <radialGradient id="globeGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#1E40AF" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="50" r="40" fill="url(#globeGrad)" />
        <ellipse cx="100" cy="50" rx="40" ry="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <ellipse cx="100" cy="50" rx="20" ry="40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <path d="M100 10 Q110 30, 100 50 Q90 70, 100 90" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <circle cx="85" cy="35" r="3" fill="#10B981" />
        <circle cx="110" cy="45" r="4" fill="#10B981" />
        <circle cx="95" cy="60" r="3" fill="#10B981" />
        <path d="M85 35 Q100 25, 110 45" fill="none" stroke="#F59E0B" strokeWidth="1" opacity="0.8" />
      </svg>
    ),

    ISOMETRIC_CHART: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <defs>
          <linearGradient id="isoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <polygon points="50,70 70,80 70,60 50,50" fill="#2563EB" />
        <polygon points="50,70 50,50 70,40 70,60" fill="url(#isoGrad1)" />
        <polygon points="50,50 70,40 90,50 70,60" fill="#60A5FA" />
        <polygon points="90,70 110,80 110,40 90,30" fill="#2563EB" />
        <polygon points="90,70 90,30 110,20 110,60" fill="url(#isoGrad1)" />
        <polygon points="90,30 110,20 130,30 110,40" fill="#60A5FA" />
        <polygon points="130,70 150,80 150,50 130,40" fill="#2563EB" />
        <polygon points="130,70 130,40 150,30 150,60" fill="url(#isoGrad1)" />
        <polygon points="130,40 150,30 170,40 150,50" fill="#60A5FA" />
      </svg>
    ),

    // ============================================================
    // ANIMATED
    // ============================================================
    LIVE_STREAM: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="15" y="10" width="170" height="80" rx="5" fill="#0F172A" />
        <path d="M25 60 L40 50 L55 55 L70 40 L85 45 L100 35 L115 42 L130 30 L145 38 L160 25 L175 32"
              fill="none" stroke="#10B981" strokeWidth="2" />
        <circle cx="175" cy="32" r="4" fill="#10B981">
          <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="30" cy="20" r="4" fill="#EF4444">
          <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
        <text x="40" y="24" fontSize="8" fill="#EF4444">LIVE</text>
      </svg>
    ),

    BAR_CHART_RACE: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="20" y="15" width="150" height="15" rx="3" fill="#3B82F6" />
        <text x="175" y="26" fontSize="10" fill="#1F2937">USA</text>
        <rect x="20" y="35" width="120" height="15" rx="3" fill="#10B981" />
        <text x="145" y="46" fontSize="10" fill="#1F2937">CHN</text>
        <rect x="20" y="55" width="90" height="15" rx="3" fill="#F59E0B" />
        <text x="115" y="66" fontSize="10" fill="#1F2937">JPN</text>
        <rect x="20" y="75" width="60" height="15" rx="3" fill="#EF4444" />
        <text x="85" y="86" fontSize="10" fill="#1F2937">DEU</text>
        <text x="100" y="98" textAnchor="middle" fontSize="8" fill="#6B7280">▶ 2024</text>
      </svg>
    ),

    ANIMATED_DONUT: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <circle cx="100" cy="50" r="35" fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle cx="100" cy="50" r="35" fill="none" stroke="#3B82F6" strokeWidth="10"
                strokeDasharray="165 55" strokeDashoffset="55" transform="rotate(-90 100 50)">
          <animate attributeName="stroke-dashoffset" values="220;55" dur="1.5s" fill="freeze" />
        </circle>
        <text x="100" y="54" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1F2937">75%</text>
      </svg>
    ),

    PARTICLE_FLOW: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <defs>
          <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="1" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="30" cy="50" r="15" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
        <circle cx="170" cy="50" r="15" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
        <path d="M45 45 Q100 30, 155 45" fill="none" stroke="url(#flowGrad)" strokeWidth="3" />
        <path d="M45 50 Q100 50, 155 50" fill="none" stroke="url(#flowGrad)" strokeWidth="2" />
        <path d="M45 55 Q100 70, 155 55" fill="none" stroke="url(#flowGrad)" strokeWidth="3" />
        <circle cx="70" cy="42" r="3" fill="#3B82F6" />
        <circle cx="90" cy="48" r="3" fill="#3B82F6" />
        <circle cx="110" cy="52" r="3" fill="#3B82F6" />
        <circle cx="130" cy="47" r="3" fill="#3B82F6" />
      </svg>
    ),

    TICKER_TAPE: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="20" y="35" width="160" height="30" rx="4" fill="#F3F4F6" />
        <text x="30" y="55" fontSize="10" fill="#1F2937">AAPL +2.5%</text>
        <text x="85" y="55" fontSize="10" fill="#EF4444">TSLA -1.2%</text>
        <text x="140" y="55" fontSize="10" fill="#10B981">MSFT +0.8%</text>
      </svg>
    ),

    COUNTDOWN_TIMER: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <rect x="25" y="25" width="40" height="50" rx="5" fill="#1F2937" />
        <text x="45" y="58" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#10B981">12</text>
        <text x="45" y="70" textAnchor="middle" fontSize="8" fill="#6B7280">DAYS</text>
        <text x="80" y="55" fontSize="20" fill="#6B7280">:</text>
        <rect x="95" y="25" width="40" height="50" rx="5" fill="#1F2937" />
        <text x="115" y="58" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#10B981">05</text>
        <text x="115" y="70" textAnchor="middle" fontSize="8" fill="#6B7280">HRS</text>
        <text x="150" y="55" fontSize="20" fill="#6B7280">:</text>
        <rect x="160" y="25" width="25" height="50" rx="5" fill="#1F2937" />
        <text x="172" y="58" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#10B981">32</text>
      </svg>
    ),

    // ============================================================
    // STATISTICAL
    // ============================================================
    DENSITY_PLOT: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <defs>
          <linearGradient id="densityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </linearGradient>
        </defs>
        <path d="M25 85 Q40 85, 60 60 Q80 20, 100 20 Q120 20, 140 60 Q160 85, 175 85 L175 85 L25 85 Z"
              fill="url(#densityGrad)" stroke="#3B82F6" strokeWidth="2" />
        <line x1="20" y1="85" x2="180" y2="85" stroke="#E5E7EB" strokeWidth="1" />
      </svg>
    ),

    VIOLIN_PLOT: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <path d="M50 20 Q30 35, 30 50 Q30 65, 50 80 Q70 65, 70 50 Q70 35, 50 20" fill="rgba(59, 130, 246, 0.3)" stroke="#3B82F6" strokeWidth="2" />
        <line x1="50" y1="30" x2="50" y2="70" stroke="#1F2937" strokeWidth="2" />
        <rect x="45" y="40" width="10" height="20" fill="#3B82F6" />
        <line x1="43" y1="50" x2="57" y2="50" stroke="white" strokeWidth="2" />
        <path d="M100 15 Q75 30, 75 50 Q75 70, 100 85 Q125 70, 125 50 Q125 30, 100 15" fill="rgba(16, 185, 129, 0.3)" stroke="#10B981" strokeWidth="2" />
        <line x1="100" y1="25" x2="100" y2="75" stroke="#1F2937" strokeWidth="2" />
        <rect x="95" y="38" width="10" height="24" fill="#10B981" />
        <line x1="93" y1="50" x2="107" y2="50" stroke="white" strokeWidth="2" />
        <path d="M150 25 Q135 40, 135 50 Q135 60, 150 75 Q165 60, 165 50 Q165 40, 150 25" fill="rgba(245, 158, 11, 0.3)" stroke="#F59E0B" strokeWidth="2" />
        <line x1="150" y1="32" x2="150" y2="68" stroke="#1F2937" strokeWidth="2" />
        <rect x="145" y="42" width="10" height="16" fill="#F59E0B" />
        <line x1="143" y1="50" x2="157" y2="50" stroke="white" strokeWidth="2" />
      </svg>
    ),

    REGRESSION_PLOT: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <line x1="25" y1="85" x2="185" y2="85" stroke="#E5E7EB" strokeWidth="1" />
        <line x1="25" y1="85" x2="25" y2="10" stroke="#E5E7EB" strokeWidth="1" />
        <circle cx="40" cy="70" r="4" fill="#3B82F6" opacity="0.7" />
        <circle cx="55" cy="65" r="4" fill="#3B82F6" opacity="0.7" />
        <circle cx="70" cy="55" r="4" fill="#3B82F6" opacity="0.7" />
        <circle cx="90" cy="50" r="4" fill="#3B82F6" opacity="0.7" />
        <circle cx="110" cy="40" r="4" fill="#3B82F6" opacity="0.7" />
        <circle cx="130" cy="35" r="4" fill="#3B82F6" opacity="0.7" />
        <circle cx="150" cy="25" r="4" fill="#3B82F6" opacity="0.7" />
        <circle cx="170" cy="20" r="4" fill="#3B82F6" opacity="0.7" />
        <line x1="35" y1="75" x2="175" y2="15" stroke="#EF4444" strokeWidth="2" />
        <path d="M35 65 L175 5" fill="none" stroke="#EF4444" strokeWidth="1" strokeDasharray="3" opacity="0.3" />
        <path d="M35 85 L175 25" fill="none" stroke="#EF4444" strokeWidth="1" strokeDasharray="3" opacity="0.3" />
      </svg>
    ),

    CONFIDENCE_INTERVAL: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <defs>
          <linearGradient id="ciGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.1)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
          </linearGradient>
        </defs>
        <path d="M25 25 L55 30 L85 20 L115 35 L145 25 L175 30 L175 70 L145 65 L115 55 L85 70 L55 60 L25 65 Z"
              fill="url(#ciGrad)" />
        <path d="M25 45 L55 45 L85 40 L115 48 L145 42 L175 48" fill="none" stroke="#3B82F6" strokeWidth="2" />
        <line x1="20" y1="85" x2="180" y2="85" stroke="#E5E7EB" strokeWidth="1" />
      </svg>
    ),

    PARALLEL_COORDINATES: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <line x1="30" y1="15" x2="30" y2="85" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="70" y1="15" x2="70" y2="85" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="110" y1="15" x2="110" y2="85" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="150" y1="15" x2="150" y2="85" stroke="#E5E7EB" strokeWidth="2" />
        <path d="M30 25 L70 45 L110 35 L150 55" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.7" />
        <path d="M30 40 L70 30 L110 60 L150 40" fill="none" stroke="#10B981" strokeWidth="2" opacity="0.7" />
        <path d="M30 60 L70 55 L110 45 L150 25" fill="none" stroke="#F59E0B" strokeWidth="2" opacity="0.7" />
        <path d="M30 75 L70 65 L110 70 L150 65" fill="none" stroke="#EF4444" strokeWidth="2" opacity="0.7" />
      </svg>
    ),

    HEXBIN: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        {[
          { x: 50, y: 30, color: '#BFDBFE' },
          { x: 80, y: 30, color: '#60A5FA' },
          { x: 110, y: 30, color: '#93C5FD' },
          { x: 140, y: 30, color: '#DBEAFE' },
          { x: 35, y: 50, color: '#93C5FD' },
          { x: 65, y: 50, color: '#3B82F6' },
          { x: 95, y: 50, color: '#1D4ED8' },
          { x: 125, y: 50, color: '#3B82F6' },
          { x: 155, y: 50, color: '#60A5FA' },
          { x: 50, y: 70, color: '#60A5FA' },
          { x: 80, y: 70, color: '#93C5FD' },
          { x: 110, y: 70, color: '#60A5FA' },
          { x: 140, y: 70, color: '#BFDBFE' },
        ].map((hex, i) => (
          <polygon
            key={`hex-${i}`}
            points={`${hex.x},${hex.y - 10} ${hex.x + 12},${hex.y - 5} ${hex.x + 12},${hex.y + 5} ${hex.x},${hex.y + 10} ${hex.x - 12},${hex.y + 5} ${hex.x - 12},${hex.y - 5}`}
            fill={hex.color}
          />
        ))}
      </svg>
    ),

    CONTOUR_PLOT: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <ellipse cx="100" cy="50" rx="70" ry="35" fill="none" stroke="#BFDBFE" strokeWidth="2" />
        <ellipse cx="100" cy="50" rx="55" ry="27" fill="none" stroke="#93C5FD" strokeWidth="2" />
        <ellipse cx="100" cy="50" rx="40" ry="20" fill="none" stroke="#60A5FA" strokeWidth="2" />
        <ellipse cx="100" cy="50" rx="25" ry="12" fill="none" stroke="#3B82F6" strokeWidth="2" />
        <ellipse cx="100" cy="50" rx="10" ry="5" fill="#1D4ED8" />
      </svg>
    ),

    BEESWARM: (
      <svg viewBox="0 0 200 100" className={baseClass}>
        <line x1="20" y1="85" x2="180" y2="85" stroke="#E5E7EB" strokeWidth="1" />
        {[
          { x: 50, points: [25, 30, 35, 28, 32] },
          { x: 100, points: [45, 40, 50, 42, 38, 48] },
          { x: 150, points: [60, 55, 65, 58] },
        ].map((group, gi) => (
          <g key={`group-${gi}`}>
            {group.points.map((y, i) => (
              <circle
                key={`point-${gi}-${i}`}
                cx={group.x + (i % 2 === 0 ? -5 : 5) * Math.floor(i / 2)}
                cy={y}
                r="4"
                fill="#3B82F6"
                opacity="0.7"
              />
            ))}
          </g>
        ))}
      </svg>
    ),
  };

  const defaultPreview = (
    <svg viewBox="0 0 200 100" className={baseClass}>
      <rect x="30" y="20" width="140" height="60" rx="8" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" />
      <text x="100" y="55" textAnchor="middle" fontSize="12" fill="#9CA3AF">Preview</text>
    </svg>
  );

  return <>{previews[chartCode] || defaultPreview}</>;
};

export default ChartPreview;
