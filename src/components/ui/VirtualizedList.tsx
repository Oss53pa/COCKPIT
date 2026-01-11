/**
 * Liste virtualisée pour les longues listes de données
 * Améliore les performances en ne rendant que les éléments visibles
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight?: number;
  overscan?: number;
  className?: string;
  emptyMessage?: string;
}

interface VirtualizedState {
  scrollTop: number;
  startIndex: number;
  endIndex: number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  containerHeight = 400,
  overscan = 3,
  className = '',
  emptyMessage = 'Aucun élément',
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<VirtualizedState>({
    scrollTop: 0,
    startIndex: 0,
    endIndex: Math.min(Math.ceil(containerHeight / itemHeight) + overscan, items.length),
  });

  // Calculer les indices visibles
  const calculateVisibleRange = useCallback(
    (scrollTop: number) => {
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);

      return { startIndex, endIndex };
    },
    [containerHeight, itemHeight, items.length, overscan]
  );

  // Gérer le scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      const { startIndex, endIndex } = calculateVisibleRange(scrollTop);

      setState({
        scrollTop,
        startIndex,
        endIndex,
      });
    },
    [calculateVisibleRange]
  );

  // Recalculer lors du changement de la liste
  useEffect(() => {
    const { startIndex, endIndex } = calculateVisibleRange(state.scrollTop);
    setState((prev) => ({
      ...prev,
      startIndex,
      endIndex,
    }));
  }, [items.length, calculateVisibleRange, state.scrollTop]);

  // Hauteur totale du contenu
  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);

  // Offset du premier élément visible
  const offsetTop = useMemo(
    () => state.startIndex * itemHeight,
    [state.startIndex, itemHeight]
  );

  // Éléments visibles
  const visibleItems = useMemo(
    () => items.slice(state.startIndex, state.endIndex),
    [items, state.startIndex, state.endIndex]
  );

  if (items.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-gray-500 dark:text-gray-400 ${className}`}
        style={{ height: containerHeight }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetTop,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={state.startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, state.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook pour utiliser la virtualisation
 */
export function useVirtualizedList<T>(
  items: T[],
  options: {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
  }
) {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetTop = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetTop,
    startIndex,
    handleScroll,
    containerStyle: { height: containerHeight, overflow: 'auto' },
    innerStyle: { height: totalHeight, position: 'relative' as const },
    offsetStyle: {
      position: 'absolute' as const,
      top: offsetTop,
      left: 0,
      right: 0,
    },
  };
}
