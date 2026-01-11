/**
 * Skeleton - Composants de chargement
 * Affiche des placeholders animés pendant le chargement
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animate?: boolean;
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'md',
  animate = true,
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700
        ${roundedClasses[rounded]}
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
      style={style}
    />
  );
}

/**
 * Skeleton pour une ligne de texte
 */
export function SkeletonText({
  lines = 1,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 && lines > 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton pour un avatar
 */
export function SkeletonAvatar({
  size = 40,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      rounded="full"
      className={className}
    />
  );
}

/**
 * Skeleton pour une carte
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <SkeletonAvatar />
        <div className="flex-1">
          <Skeleton height={16} width="60%" className="mb-2" />
          <Skeleton height={12} width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

/**
 * Skeleton pour un tableau
 */
export function SkeletonTable({
  rows = 5,
  cols = 4,
  className = '',
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={16} className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} height={14} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton pour un graphique
 */
export function SkeletonChart({
  height = 300,
  className = '',
}: {
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}
      style={{ height }}
    >
      <Skeleton height={20} width="40%" className="mb-4" />
      <div className="flex items-end gap-2 h-[calc(100%-40px)]">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            height={`${Math.random() * 60 + 30}%`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton pour le dashboard
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton height={32} width={200} className="mb-2" />
          <Skeleton height={16} width={300} />
        </div>
        <Skeleton height={40} width={120} />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Skeleton height={14} width="60%" className="mb-2" />
            <Skeleton height={32} width="40%" className="mb-1" />
            <Skeleton height={12} width="80%" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      {/* Table */}
      <SkeletonTable rows={5} cols={5} />
    </div>
  );
}
