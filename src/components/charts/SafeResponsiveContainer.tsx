import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, ResponsiveContainerProps } from 'recharts';

/**
 * SafeResponsiveContainer - Wrapper around Recharts ResponsiveContainer
 * that prevents the -1 width/height warning by only rendering
 * the chart after the container has been measured.
 */
export function SafeResponsiveContainer({
  children,
  minHeight = 0,
  ...props
}: ResponsiveContainerProps & { minHeight?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure the container is measured
    const timer = requestAnimationFrame(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          setIsReady(true);
        }
      }
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight }}>
      {isReady ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} {...props}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
