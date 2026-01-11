/**
 * Floating Toolbar Component
 * Contextual toolbar for inserting and editing blocks
 */

import React, { useState } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  BarChart2,
  Table,
  Image,
  AlertCircle,
  Quote,
  Minus,
  SeparatorHorizontal,
  LayoutGrid,
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  ChevronDown,
  Library,
} from 'lucide-react';
import { BlockType } from '../../../types/reportStudio';

interface FloatingToolbarProps {
  visible: boolean;
  selectedBlockId: string | null;
  onInsert: (type: BlockType, afterBlockId?: string) => void;
  onOpenLibrary?: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

interface ToolbarItem {
  type: BlockType;
  label: string;
  icon: React.ElementType;
  category: 'text' | 'data' | 'media' | 'layout';
}

const toolbarItems: ToolbarItem[] = [
  { type: 'paragraph', label: 'Paragraphe', icon: Type, category: 'text' },
  { type: 'heading', label: 'Titre H1', icon: Heading1, category: 'text' },
  { type: 'heading', label: 'Titre H2', icon: Heading2, category: 'text' },
  { type: 'heading', label: 'Titre H3', icon: Heading3, category: 'text' },
  { type: 'list', label: 'Liste à puces', icon: List, category: 'text' },
  { type: 'list', label: 'Liste numérotée', icon: ListOrdered, category: 'text' },
  { type: 'chart', label: 'Graphique', icon: BarChart2, category: 'data' },
  { type: 'table', label: 'Tableau', icon: Table, category: 'data' },
  { type: 'kpi_card', label: 'KPI', icon: LayoutGrid, category: 'data' },
  { type: 'image', label: 'Image', icon: Image, category: 'media' },
  { type: 'callout', label: 'Encadré', icon: AlertCircle, category: 'layout' },
  { type: 'quote', label: 'Citation', icon: Quote, category: 'layout' },
  { type: 'divider', label: 'Séparateur', icon: Minus, category: 'layout' },
  { type: 'pagebreak', label: 'Saut de page', icon: SeparatorHorizontal, category: 'layout' },
];

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  visible,
  selectedBlockId,
  onInsert,
  onOpenLibrary,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}) => {
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('text');

  if (!visible) return null;

  const categories = [
    { id: 'text', label: 'Texte' },
    { id: 'data', label: 'Données' },
    { id: 'media', label: 'Média' },
    { id: 'layout', label: 'Mise en page' },
  ];

  const filteredItems = toolbarItems.filter((item) => item.category === activeCategory);

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-2 flex items-center gap-2">
        {/* Insert block button */}
        <div className="relative">
          <button
            onClick={() => setShowInsertMenu(!showInsertMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Insérer</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Insert menu dropdown */}
          {showInsertMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowInsertMenu(false)}
              />
              <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-primary-200 p-4 min-w-[320px] z-50">
                {/* Category tabs */}
                <div className="flex gap-1 mb-3 border-b border-primary-100 pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-primary text-white'
                          : 'text-primary-600 hover:bg-primary-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Items grid */}
                <div className="grid grid-cols-2 gap-2">
                  {filteredItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={`${item.type}-${index}`}
                        onClick={() => {
                          onInsert(item.type, selectedBlockId || undefined);
                          setShowInsertMenu(false);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm text-primary-700">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-primary-200" />

        {/* Library button */}
        {onOpenLibrary && (
          <button
            onClick={onOpenLibrary}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
            title="Bibliothèque de données"
          >
            <Library className="w-4 h-4" />
            <span className="text-sm font-medium">Bibliothèque</span>
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-8 bg-primary-200" />

        {/* Quick insert buttons */}
        <button
          onClick={() => onInsert('paragraph', selectedBlockId || undefined)}
          className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
          title="Paragraphe"
        >
          <Type className="w-4 h-4 text-primary-600" />
        </button>
        <button
          onClick={() => onInsert('heading', selectedBlockId || undefined)}
          className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
          title="Titre"
        >
          <Heading1 className="w-4 h-4 text-primary-600" />
        </button>
        <button
          onClick={() => onInsert('chart', selectedBlockId || undefined)}
          className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
          title="Graphique vide"
        >
          <BarChart2 className="w-4 h-4 text-primary-600" />
        </button>
        <button
          onClick={() => onInsert('table', selectedBlockId || undefined)}
          className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
          title="Tableau vide"
        >
          <Table className="w-4 h-4 text-primary-600" />
        </button>

        {/* Divider */}
        {selectedBlockId && (
          <>
            <div className="w-px h-8 bg-primary-200" />

            {/* Block actions */}
            <button
              onClick={onMoveUp}
              className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
              title="Déplacer vers le haut"
            >
              <ArrowUp className="w-4 h-4 text-primary-600" />
            </button>
            <button
              onClick={onMoveDown}
              className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
              title="Déplacer vers le bas"
            >
              <ArrowDown className="w-4 h-4 text-primary-600" />
            </button>
            <button
              onClick={onDuplicate}
              className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
              title="Dupliquer"
            >
              <Copy className="w-4 h-4 text-primary-600" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
