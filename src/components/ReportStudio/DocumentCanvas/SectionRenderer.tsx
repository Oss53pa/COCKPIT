/**
 * Section Renderer Component
 * Renders a section with its blocks in the document canvas
 */

import React from 'react';
import { Lock, ChevronDown, ChevronRight } from 'lucide-react';
import { Section, ContentBlock } from '../../../types/reportStudio';
import { BlockRenderer } from '../BlockRenderers';

interface SectionRendererProps {
  section: Section;
  isEditable: boolean;
  isFirst: boolean;
  selectedBlockId: string | null;
  onBlockSelect: (blockId: string | null) => void;
  onBlockChange: (blockId: string, updates: Partial<ContentBlock>) => void;
  onBlockDuplicate: (sectionId: string, blockId: string) => void;
  onBlockDelete: (sectionId: string, blockId: string) => void;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  isEditable,
  isFirst,
  selectedBlockId,
  onBlockSelect,
  onBlockChange,
  onBlockDuplicate,
  onBlockDelete,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(section.isCollapsed || false);

  const handleDragStart = (e: React.DragEvent, block: ContentBlock) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'block',
      blockId: block.id,
      sectionId: section.id,
    }));
  };

  const handleDrop = (_e: React.DragEvent, _position: 'before' | 'after') => {
    // Handle drop logic here
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      id={`section-${section.id}`}
      className={`relative ${!isFirst ? 'mt-8 pt-8 border-t border-primary-200' : ''}`}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4 group">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-primary-100 rounded"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        <h2 className={`font-semibold text-primary-900 ${
          section.level === 1 ? 'text-2xl' : section.level === 2 ? 'text-xl' : 'text-lg'
        }`}>
          {section.title}
        </h2>

        {section.isLocked && (
          <Lock className="w-4 h-4 text-primary-400" />
        )}

        {/* Section status badge */}
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          section.status === 'generated' ? 'bg-purple-100 text-purple-700' :
          section.status === 'edited' ? 'bg-blue-100 text-blue-700' :
          'bg-green-100 text-green-700'
        }`}>
          {section.status === 'generated' ? 'IA' :
           section.status === 'edited' ? 'Modifié' : 'Manuel'}
        </span>
      </div>

      {/* Section content */}
      {!isCollapsed && (
        <div className="space-y-4">
          {section.blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              isEditable={isEditable && !section.isLocked}
              isSelected={selectedBlockId === block.id}
              onSelect={() => onBlockSelect(block.id)}
              onChange={(updates) => onBlockChange(block.id, updates)}
              onDragStart={(e) => handleDragStart(e, block)}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDuplicate={() => onBlockDuplicate(section.id, block.id)}
              onDelete={() => onBlockDelete(section.id, block.id)}
            />
          ))}

          {/* Empty section placeholder */}
          {section.blocks.length === 0 && isEditable && (
            <div className="text-center py-8 text-primary-400 border-2 border-dashed border-primary-200 rounded-lg">
              <p>Section vide</p>
              <p className="text-sm">Utilisez la barre d'outils pour ajouter du contenu</p>
            </div>
          )}
        </div>
      )}

      {/* Collapsed indicator */}
      {isCollapsed && (
        <div className="text-sm text-primary-400 italic">
          {section.blocks.length} bloc(s) - Cliquez pour développer
        </div>
      )}

      {/* Children sections */}
      {section.children && section.children.length > 0 && !isCollapsed && (
        <div className="ml-6 mt-4">
          {section.children.map((child, index) => (
            <SectionRenderer
              key={child.id}
              section={child}
              isEditable={isEditable}
              isFirst={index === 0}
              selectedBlockId={selectedBlockId}
              onBlockSelect={onBlockSelect}
              onBlockChange={onBlockChange}
              onBlockDuplicate={onBlockDuplicate}
              onBlockDelete={onBlockDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
