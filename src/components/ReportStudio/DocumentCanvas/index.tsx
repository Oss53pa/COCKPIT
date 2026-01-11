/**
 * Document Canvas Component
 * Main editing area for the report content
 */

import React, { useRef, useCallback } from 'react';
import { ContentBlock, Section } from '../../../types/reportStudio';
import { SectionRenderer } from './SectionRenderer';
import { useReportStudioStore } from '../../../store/reportStudioStore';

interface DocumentCanvasProps {
  content: {
    contentTree: {
      sections: Section[];
    };
    version?: number;
    lastEditedAt?: string;
  };
  mode: 'view' | 'edit';
  zoom: number;
  viewMode: 'single' | 'double' | 'continuous';
  selectedBlockId: string | null;
  onContentChange: (blockId: string, updates: Partial<ContentBlock>) => void;
  onBlockSelect: (blockId: string | null) => void;
  children?: React.ReactNode;
}

export const DocumentCanvas: React.FC<DocumentCanvasProps> = ({
  content,
  mode,
  zoom,
  viewMode,
  selectedBlockId,
  onContentChange,
  onBlockSelect,
  children,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { duplicateBlock, deleteBlock } = useReportStudioStore();

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Deselect block when clicking on empty space
    if (e.target === canvasRef.current || e.target === contentRef.current) {
      onBlockSelect(null);
    }
  }, [onBlockSelect]);

  const handleBlockDuplicate = useCallback((sectionId: string, blockId: string) => {
    duplicateBlock(sectionId, blockId);
  }, [duplicateBlock]);

  const handleBlockDelete = useCallback((sectionId: string, blockId: string) => {
    deleteBlock(sectionId, blockId);
  }, [deleteBlock]);

  // Calculate page dimensions based on view mode
  const pageWidth = viewMode === 'double' ? 1200 : 800;

  return (
    <div
      ref={canvasRef}
      className={`flex-1 overflow-auto bg-primary-200 relative ${mode === 'edit' ? 'cursor-text' : ''}`}
      onClick={handleClick}
    >
      {/* Floating toolbar (passed as children) */}
      {children}

      {/* Document content */}
      <div
        ref={contentRef}
        className={`mx-auto my-8 bg-white shadow-lg rounded-sm ${viewMode === 'continuous' ? 'min-h-screen' : ''}`}
        style={{
          width: `${pageWidth}px`,
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          padding: '60px 80px',
        }}
      >
        {/* Document header */}
        <div className="mb-8 pb-8 border-b border-primary-200">
          <h1 className="text-3xl font-bold text-primary-900 mb-4">
            Rapport
          </h1>
          <div className="flex items-center gap-4 text-sm text-primary-500">
            <span>Version {content.version || 1}</span>
            <span>|</span>
            <span>
              Dernière modification: {new Date(content.lastEditedAt || new Date().toISOString()).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Sections */}
        {content.contentTree.sections.map((section, index) => (
          <SectionRenderer
            key={section.id}
            section={section}
            isEditable={mode === 'edit'}
            isFirst={index === 0}
            selectedBlockId={selectedBlockId}
            onBlockSelect={onBlockSelect}
            onBlockChange={onContentChange}
            onBlockDuplicate={handleBlockDuplicate}
            onBlockDelete={handleBlockDelete}
          />
        ))}

        {/* Empty state */}
        {content.contentTree.sections.length === 0 && (
          <div className="text-center py-16 text-primary-400">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg">Document vide</p>
            {mode === 'edit' && (
              <p className="mt-2">Cliquez sur &quot;Ajouter une section&quot; pour commencer</p>
            )}
          </div>
        )}
      </div>

      {/* Page navigation for non-continuous view */}
      {viewMode !== 'continuous' && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-4">
          <button className="p-1 hover:bg-primary-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm">Page 1 / 24</span>
          <button className="p-1 hover:bg-primary-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
