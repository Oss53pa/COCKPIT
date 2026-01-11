/**
 * Block Renderer Component
 * Main renderer that dispatches to specific block type components
 */

import React from 'react';
import { GripVertical, Copy, Trash2 } from 'lucide-react';
import { ContentBlock } from '../../../types/reportStudio';
import { ParagraphBlock } from './ParagraphBlock';
import { HeadingBlock } from './HeadingBlock';
import { ChartBlock } from './ChartBlock';
import { TableBlock } from './TableBlock';
import { ImageBlock } from './ImageBlock';
import { CalloutBlock } from './CalloutBlock';
import { DividerBlock } from './DividerBlock';
import { ListBlock } from './ListBlock';
import { KPICardBlock } from './KPICardBlock';

interface BlockRendererProps {
  block: ContentBlock;
  isEditable: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<ContentBlock>) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, position: 'before' | 'after') => void;
  onDragOver: (e: React.DragEvent) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  isEditable,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDrop,
  onDragOver,
  onDuplicate,
  onDelete,
}) => {
  const [showDropBefore, setShowDropBefore] = React.useState(false);
  const [showDropAfter, setShowDropAfter] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(e);

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    if (e.clientY < midY) {
      setShowDropBefore(true);
      setShowDropAfter(false);
    } else {
      setShowDropBefore(false);
      setShowDropAfter(true);
    }
  };

  const handleDragLeave = () => {
    setShowDropBefore(false);
    setShowDropAfter(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const position = showDropBefore ? 'before' : 'after';
    onDrop(e, position);
    setShowDropBefore(false);
    setShowDropAfter(false);
  };

  const renderBlock = () => {
    switch (block.type) {
      case 'paragraph':
        return (
          <ParagraphBlock
            block={block}
            isEditable={isEditable}
            onChange={onChange}
          />
        );
      case 'heading':
        return (
          <HeadingBlock
            block={block}
            isEditable={isEditable}
            onChange={onChange}
          />
        );
      case 'chart':
        return (
          <ChartBlock
            block={block}
            isEditable={isEditable}
            onChange={onChange}
          />
        );
      case 'table':
        return (
          <TableBlock
            block={block}
            isEditable={isEditable}
            onChange={onChange}
          />
        );
      case 'image':
        return (
          <ImageBlock
            block={block}
            isEditable={isEditable}
            onChange={onChange}
          />
        );
      case 'callout':
        return (
          <CalloutBlock
            block={block}
            isEditable={isEditable}
            onChange={onChange}
          />
        );
      case 'divider':
        return <DividerBlock block={block} />;
      case 'pagebreak':
        return (
          <div className="border-t-2 border-dashed border-gray-300 my-8 relative">
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-2 text-xs text-gray-400">
              Saut de page
            </span>
          </div>
        );
      case 'list':
        return (
          <ListBlock
            block={block}
            isEditable={isEditable}
            onChange={onChange}
          />
        );
      case 'kpi_card':
        return (
          <KPICardBlock
            block={block}
            isEditable={isEditable}
            onChange={onChange}
          />
        );
      default:
        return (
          <div className="p-4 bg-gray-100 rounded text-gray-500 text-sm">
            Type de bloc non supporté: {(block as ContentBlock).type}
          </div>
        );
    }
  };

  return (
    <div
      className="relative group"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop indicator - before */}
      {showDropBefore && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary rounded" />
      )}

      {/* Block wrapper */}
      <div
        className={`relative rounded transition-all ${
          isEditable ? 'hover:ring-2 hover:ring-primary/20' : ''
        } ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={onSelect}
        draggable={isEditable}
        onDragStart={onDragStart}
      >
        {/* Block actions (visible on hover in edit mode) */}
        {isEditable && (
          <div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
            <button
              className="p-1.5 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 cursor-grab active:cursor-grabbing"
              title="Déplacer"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </button>
            <button
              className="p-1.5 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50"
              title="Dupliquer"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
            <button
              className="p-1.5 bg-white border border-gray-200 rounded shadow-sm hover:bg-red-50"
              title="Supprimer"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}

        {/* AI badge */}
        {block.metadata?.aiGenerated && (
          <div className="absolute -right-2 -top-2 z-10">
            <span className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded-full">
              IA
            </span>
          </div>
        )}

        {/* Block content */}
        {renderBlock()}
      </div>

      {/* Drop indicator - after */}
      {showDropAfter && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded" />
      )}
    </div>
  );
};
