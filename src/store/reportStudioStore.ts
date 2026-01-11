/**
 * Zustand store for Report Studio state management
 * Based on EasyView-BI architecture
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  StudioReport,
  ContentTree,
  Section,
  ContentBlock,
  BlockType,
  EditorState,
  AIPanelState,
  UIState,
  Insight,
  Recommendation,
  AIMessage,
  ReportDesignSettings,
} from '../types/reportStudio';

// ============================================================================
// State Interface
// ============================================================================

interface ReportStudioState {
  // Report data
  report: StudioReport | null;
  content: ContentTree;

  // AI data
  insights: Insight[];
  recommendations: Recommendation[];

  // Editor state
  editor: EditorState;

  // AI Panel state
  aiPanel: AIPanelState;

  // UI state
  ui: UIState;

  // History for undo/redo
  history: ContentTree[];
  historyIndex: number;

  // Actions - Report
  setReport: (report: StudioReport) => void;
  setContent: (content: ContentTree) => void;
  updateContent: (content: ContentTree) => void;
  clearReport: () => void;

  // Actions - Sections
  addSection: (section: Section, afterId?: string) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  deleteSection: (sectionId: string) => void;
  moveSection: (sectionId: string, newIndex: number) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;

  // Actions - Blocks
  addBlock: (sectionId: string, block: ContentBlock, afterBlockId?: string) => void;
  updateBlock: (sectionId: string, blockId: string, updates: Partial<ContentBlock>) => void;
  deleteBlock: (sectionId: string, blockId: string) => void;
  moveBlock: (fromSectionId: string, blockId: string, toSectionId: string, newIndex: number) => void;
  duplicateBlock: (sectionId: string, blockId: string) => void;

  // Actions - Editor
  selectSection: (sectionId: string | null) => void;
  selectBlock: (blockId: string | null) => void;
  setEditing: (isEditing: boolean) => void;
  setZoomLevel: (level: number) => void;

  // Actions - AI Panel
  setAIPanelOpen: (isOpen: boolean) => void;
  setAIActiveTab: (tab: AIPanelState['activeTab']) => void;
  addChatMessage: (message: AIMessage) => void;
  clearChatMessages: () => void;
  setAILoading: (isLoading: boolean) => void;
  setInsights: (insights: Insight[]) => void;
  setRecommendations: (recommendations: Recommendation[]) => void;

  // Actions - UI
  setSaving: (isSaving: boolean) => void;
  setGenerating: (isGenerating: boolean) => void;
  markAsSaved: () => void;
  toggleSidebar: () => void;
  toggleAIPanel: () => void;

  // Actions - History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Actions - Design
  updateDesignSettings: (settings: ReportDesignSettings) => void;

  // Helpers
  createBlock: (type: BlockType) => ContentBlock;
}

// ============================================================================
// Initial States
// ============================================================================

const initialEditorState: EditorState = {
  selectedSectionId: null,
  selectedBlockId: null,
  isEditing: false,
  isDragging: false,
  zoomLevel: 100,
  showGrid: false,
  showComments: true,
};

const initialAIPanelState: AIPanelState = {
  isOpen: true,
  activeTab: 'summary',
  isLoading: false,
  chatMessages: [],
};

const initialUIState: UIState = {
  isSaving: false,
  isGenerating: false,
  isPublishing: false,
  hasUnsavedChanges: false,
  lastSavedAt: null,
  sidebarCollapsed: false,
  aiPanelCollapsed: false,
};

const initialContent: ContentTree = {
  sections: [],
};

// ============================================================================
// Helper Functions
// ============================================================================

function findSectionIndex(sections: Section[], sectionId: string): number {
  return sections.findIndex((s) => s.id === sectionId);
}

function findBlockIndex(section: Section, blockId: string): number {
  return section.blocks.findIndex((b) => b.id === blockId);
}

// ============================================================================
// Store
// ============================================================================

export const useReportStudioStore = create<ReportStudioState>((set, get) => ({
  // Initial state
  report: null,
  content: initialContent,
  insights: [],
  recommendations: [],
  editor: { ...initialEditorState },
  aiPanel: { ...initialAIPanelState },
  ui: { ...initialUIState },
  history: [],
  historyIndex: -1,

  // Report actions
  setReport: (report) => set({ report }),

  setContent: (content) =>
    set({
      content,
      history: [content],
      historyIndex: 0,
    }),

  updateContent: (content) => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(content);
    if (newHistory.length > 50) newHistory.shift();

    set({
      content,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      ui: { ...state.ui, hasUnsavedChanges: true },
    });
  },

  clearReport: () =>
    set({
      report: null,
      content: initialContent,
      insights: [],
      recommendations: [],
      editor: { ...initialEditorState },
      aiPanel: { ...initialAIPanelState },
      ui: { ...initialUIState },
      history: [],
      historyIndex: -1,
    }),

  // Section actions
  addSection: (section, afterId) => {
    const state = get();
    const sections = [...state.content.sections];
    const newSection = { ...section, id: section.id || uuidv4() };

    if (afterId) {
      const index = findSectionIndex(sections, afterId);
      sections.splice(index + 1, 0, newSection);
    } else {
      sections.push(newSection);
    }

    const newContent = { ...state.content, sections };
    get().updateContent(newContent);
  },

  updateSection: (sectionId, updates) => {
    const state = get();
    const sections = state.content.sections.map((s) =>
      s.id === sectionId ? { ...s, ...updates } : s
    );
    const newContent = { ...state.content, sections };
    get().updateContent(newContent);
  },

  deleteSection: (sectionId) => {
    const state = get();
    const sections = state.content.sections.filter((s) => s.id !== sectionId);
    const newContent = { ...state.content, sections };
    get().updateContent(newContent);

    if (state.editor.selectedSectionId === sectionId) {
      set({
        editor: {
          ...state.editor,
          selectedSectionId: null,
          selectedBlockId: null,
        },
      });
    }
  },

  moveSection: (sectionId, newIndex) => {
    const state = get();
    const sections = [...state.content.sections];
    const currentIndex = findSectionIndex(sections, sectionId);

    if (currentIndex !== -1 && currentIndex !== newIndex) {
      const [section] = sections.splice(currentIndex, 1);
      sections.splice(newIndex, 0, section);
      const newContent = { ...state.content, sections };
      get().updateContent(newContent);
    }
  },

  reorderSections: (startIndex, endIndex) => {
    const state = get();
    const sections = [...state.content.sections];
    const [section] = sections.splice(startIndex, 1);
    sections.splice(endIndex, 0, section);
    const newContent = { ...state.content, sections };
    get().updateContent(newContent);
  },

  // Block actions
  addBlock: (sectionId, block, afterBlockId) => {
    const state = get();
    const sections = state.content.sections.map((s) => {
      if (s.id !== sectionId) return s;

      const blocks = [...s.blocks];
      const newBlock = { ...block, id: block.id || uuidv4() };

      if (afterBlockId) {
        const index = findBlockIndex(s, afterBlockId);
        blocks.splice(index + 1, 0, newBlock);
      } else {
        blocks.push(newBlock);
      }

      return { ...s, blocks };
    });

    const newContent = { ...state.content, sections };
    get().updateContent(newContent);
  },

  updateBlock: (sectionId, blockId, updates) => {
    const state = get();
    const sections = state.content.sections.map((s) => {
      if (s.id !== sectionId) return s;

      const blocks = s.blocks.map((b) =>
        b.id === blockId ? ({ ...b, ...updates } as ContentBlock) : b
      );

      return { ...s, blocks };
    });

    const newContent = { ...state.content, sections };
    get().updateContent(newContent);
  },

  deleteBlock: (sectionId, blockId) => {
    const state = get();
    const sections = state.content.sections.map((s) => {
      if (s.id !== sectionId) return s;
      return { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) };
    });

    const newContent = { ...state.content, sections };
    get().updateContent(newContent);

    if (state.editor.selectedBlockId === blockId) {
      set({ editor: { ...state.editor, selectedBlockId: null } });
    }
  },

  moveBlock: (fromSectionId, blockId, toSectionId, newIndex) => {
    const state = get();
    let movedBlock: ContentBlock | null = null;

    // Remove from source section
    let sections = state.content.sections.map((s) => {
      if (s.id !== fromSectionId) return s;
      const blockIndex = findBlockIndex(s, blockId);
      if (blockIndex === -1) return s;
      movedBlock = s.blocks[blockIndex];
      return { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) };
    });

    if (!movedBlock) return;

    // Add to target section
    sections = sections.map((s) => {
      if (s.id !== toSectionId) return s;
      const blocks = [...s.blocks];
      blocks.splice(newIndex, 0, movedBlock!);
      return { ...s, blocks };
    });

    const newContent = { ...state.content, sections };
    get().updateContent(newContent);
  },

  duplicateBlock: (sectionId, blockId) => {
    const state = get();
    const sections = state.content.sections.map((s) => {
      if (s.id !== sectionId) return s;

      const blockIndex = findBlockIndex(s, blockId);
      if (blockIndex === -1) return s;

      const originalBlock = s.blocks[blockIndex];
      const duplicatedBlock = {
        ...JSON.parse(JSON.stringify(originalBlock)),
        id: uuidv4(),
      };

      const blocks = [...s.blocks];
      blocks.splice(blockIndex + 1, 0, duplicatedBlock);

      return { ...s, blocks };
    });

    const newContent = { ...state.content, sections };
    get().updateContent(newContent);
  },

  // Editor actions
  selectSection: (sectionId) =>
    set((state) => ({
      editor: {
        ...state.editor,
        selectedSectionId: sectionId,
        selectedBlockId: null,
      },
    })),

  selectBlock: (blockId) =>
    set((state) => ({
      editor: { ...state.editor, selectedBlockId: blockId },
    })),

  setEditing: (isEditing) =>
    set((state) => ({
      editor: { ...state.editor, isEditing },
    })),

  setZoomLevel: (level) =>
    set((state) => ({
      editor: {
        ...state.editor,
        zoomLevel: Math.min(200, Math.max(50, level)),
      },
    })),

  // AI Panel actions
  setAIPanelOpen: (isOpen) =>
    set((state) => ({
      aiPanel: { ...state.aiPanel, isOpen },
    })),

  setAIActiveTab: (tab) =>
    set((state) => ({
      aiPanel: { ...state.aiPanel, activeTab: tab },
    })),

  addChatMessage: (message) =>
    set((state) => ({
      aiPanel: {
        ...state.aiPanel,
        chatMessages: [...state.aiPanel.chatMessages, message],
      },
    })),

  clearChatMessages: () =>
    set((state) => ({
      aiPanel: { ...state.aiPanel, chatMessages: [] },
    })),

  setAILoading: (isLoading) =>
    set((state) => ({
      aiPanel: { ...state.aiPanel, isLoading },
    })),

  setInsights: (insights) => set({ insights }),

  setRecommendations: (recommendations) => set({ recommendations }),

  // UI actions
  setSaving: (isSaving) =>
    set((state) => ({
      ui: { ...state.ui, isSaving },
    })),

  setGenerating: (isGenerating) =>
    set((state) => ({
      ui: { ...state.ui, isGenerating },
    })),

  markAsSaved: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        hasUnsavedChanges: false,
        lastSavedAt: new Date(),
      },
    })),

  toggleSidebar: () =>
    set((state) => ({
      ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
    })),

  toggleAIPanel: () =>
    set((state) => ({
      ui: { ...state.ui, aiPanelCollapsed: !state.ui.aiPanelCollapsed },
    })),

  // History actions
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({
        content: state.history[newIndex],
        historyIndex: newIndex,
        ui: { ...state.ui, hasUnsavedChanges: true },
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({
        content: state.history[newIndex],
        historyIndex: newIndex,
        ui: { ...state.ui, hasUnsavedChanges: true },
      });
    }
  },

  canUndo: () => get().historyIndex > 0,

  canRedo: () => get().historyIndex < get().history.length - 1,

  // Design settings
  updateDesignSettings: (settings) =>
    set((state) => ({
      report: state.report
        ? { ...state.report, designSettings: settings }
        : null,
      ui: { ...state.ui, hasUnsavedChanges: true },
    })),

  // Helper to create blocks
  createBlock: (type: BlockType): ContentBlock => {
    const id = uuidv4();
    const baseBlock = { id, type };

    switch (type) {
      case 'paragraph':
        return {
          ...baseBlock,
          type: 'paragraph',
          content: 'Nouveau paragraphe. Double-cliquez pour éditer.',
        };
      case 'heading':
        return {
          ...baseBlock,
          type: 'heading',
          content: 'Nouveau titre',
          level: 2,
        };
      case 'list':
        return {
          ...baseBlock,
          type: 'list',
          listType: 'bullet',
          items: [
            { id: uuidv4(), content: 'Premier élément' },
            { id: uuidv4(), content: 'Deuxième élément' },
          ],
        };
      case 'chart':
        return {
          ...baseBlock,
          type: 'chart',
          chartType: 'bar',
          data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr'],
            datasets: [
              {
                label: 'Données',
                data: [400, 300, 600, 800],
                backgroundColor: '#1C3163',
              },
            ],
          },
          config: {
            title: 'Nouveau graphique',
            colorScheme: 'corporate',
            legend: { show: true, position: 'top' },
          },
        };
      case 'table':
        return {
          ...baseBlock,
          type: 'table',
          headers: [
            { id: 'h1', label: 'Colonne 1', key: 'col1' },
            { id: 'h2', label: 'Colonne 2', key: 'col2' },
            { id: 'h3', label: 'Colonne 3', key: 'col3' },
          ],
          rows: [
            {
              col1: { value: 'Valeur 1' },
              col2: { value: 'Valeur 2' },
              col3: { value: 'Valeur 3' },
            },
          ],
          config: { striped: true, bordered: true },
        };
      case 'image':
        return {
          ...baseBlock,
          type: 'image',
          src: '',
          alt: 'Image',
          caption: 'Légende de l\'image',
        };
      case 'callout':
        return {
          ...baseBlock,
          type: 'callout',
          variant: 'info',
          title: 'Information importante',
          content: 'Contenu de l\'encadré.',
        };
      case 'quote':
        return {
          ...baseBlock,
          type: 'quote',
          content: 'Citation à modifier...',
          author: 'Auteur',
        };
      case 'divider':
        return { ...baseBlock, type: 'divider', style: 'solid' };
      case 'pagebreak':
        return { ...baseBlock, type: 'pagebreak' };
      case 'kpi_card':
        return {
          ...baseBlock,
          type: 'kpi_card',
          label: 'Indicateur',
          value: 0,
          unit: '',
          changeType: 'neutral',
        };
      default:
        return { ...baseBlock, type: 'paragraph', content: 'Nouveau bloc' };
    }
  },
}));

// ============================================================================
// Selectors
// ============================================================================

export const selectCurrentSection = (state: ReportStudioState) => {
  if (!state.editor.selectedSectionId) return null;
  return (
    state.content.sections.find((s) => s.id === state.editor.selectedSectionId) ||
    null
  );
};

export const selectCurrentBlock = (state: ReportStudioState) => {
  if (!state.editor.selectedBlockId) return null;
  for (const section of state.content.sections) {
    const block = section.blocks.find((b) => b.id === state.editor.selectedBlockId);
    if (block) return block;
  }
  return null;
};
