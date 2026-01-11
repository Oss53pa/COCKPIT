/**
 * Section Item Component
 * Individual section in the navigation panel
 */

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Lock,
  Plus,
  GripVertical,
  Sparkles,
  PenLine,
  CheckCircle,
  Settings,
} from 'lucide-react';
import { Section, SectionStatus } from '../../../types/reportStudio';

interface SectionItemProps {
  section: Section;
  isSelected: boolean;
  isExpanded: boolean;
  depth: number;
  onClick: () => void;
  onDoubleClick?: () => void;
  onToggleExpand: () => void;
  onAddChild: () => void;
  onDragEnd: (draggedId: string, targetId: string) => void;
}

export const SectionItem: React.FC<SectionItemProps> = ({
  section,
  isSelected,
  isExpanded,
  depth,
  onClick,
  onDoubleClick,
  onToggleExpand,
  onAddChild,
  onDragEnd,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const hasChildren = section.children && section.children.length > 0;

  const statusIcons: Record<SectionStatus, React.ReactNode> = {
    generated: <Sparkles className="w-3 h-3 text-purple-500" />,
    edited: <PenLine className="w-3 h-3 text-blue-500" />,
    manual: <CheckCircle className="w-3 h-3 text-green-500" />,
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('sectionId', section.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('sectionId');
    if (draggedId && draggedId !== section.id) {
      onDragEnd(draggedId, section.id);
    }
    setIsDragOver(false);
  };

  return (
    <div className="mb-1">
      <div
        className={`
          flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer group
          ${isSelected ? 'bg-primary-100 text-primary-900' : 'hover:bg-primary-50'}
          ${isDragging ? 'opacity-50' : ''}
          ${isDragOver ? 'ring-2 ring-primary' : ''}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={onClick}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick?.();
        }}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag handle */}
        <button
          className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3 text-primary-400" />
        </button>

        {/* Expand/Collapse button */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-0.5 hover:bg-primary-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Section icon */}
        <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />

        {/* Title */}
        <span className="flex-1 text-sm truncate">{section.title}</span>

        {/* Status indicator */}
        <span className="flex-shrink-0">{statusIcons[section.status]}</span>

        {/* Lock indicator */}
        {section.isLocked && (
          <Lock className="w-3 h-3 text-primary-400 flex-shrink-0" />
        )}

        {/* Edit section button */}
        {onDoubleClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDoubleClick();
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-primary-200 rounded"
            title="Modifier la section"
          >
            <Settings className="w-3 h-3" />
          </button>
        )}

        {/* Add child button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddChild();
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-primary-200 rounded"
          title="Ajouter une sous-section"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-2 border-l border-primary-200">
          {section.children.map((child) => (
            <SectionItem
              key={child.id}
              section={child}
              isSelected={false}
              isExpanded={true}
              depth={depth + 1}
              onClick={() => {}}
              onToggleExpand={() => {}}
              onAddChild={() => {}}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
      )}
    </div>
  );
};
