/**
 * Report Studio - Main Component
 * Based on EasyView-BI architecture
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ContentBlock, BlockType, Section, ExportFormat, ExportOptions, ReportDesignSettings } from '../../types/reportStudio';
import { useReportStudioStore } from '../../store/reportStudioStore';
import { ReportHeader } from './ReportHeader';
import { NavigationPanel } from './NavigationPanel';
import { DocumentCanvas } from './DocumentCanvas';
import { AIPanel } from './AIPanel';
import { FloatingToolbar } from './Toolbar/FloatingToolbar';
import { ExportModal } from './Modals/ExportModal';
import { ChartEditorModal } from './Modals/ChartEditorModal';
import { DesignSettingsModal } from './Modals/DesignSettingsModal';
import { SectionEditorModal } from './Modals/SectionEditorModal';
import { DataLibraryModal } from './Modals/DataLibraryModal';
import { exportReport, downloadBlob } from '../../utils/reportExport';
import type { ChartTemplate, TableTemplate } from '../../data/dataLibrary';

interface ReportStudioProps {
  className?: string;
}

const ReportStudio: React.FC<ReportStudioProps> = ({ className }) => {
  // Modals state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showChartEditor, setShowChartEditor] = useState(false);
  const [showDesignSettings, setShowDesignSettings] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [showDataLibrary, setShowDataLibrary] = useState(false);
  const [editingChartId, setEditingChartId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // Get state and actions from Zustand store
  const {
    report,
    content,
    editor,
    ui,
    // Actions
    selectSection,
    selectBlock,
    setEditing,
    reorderSections,
    addSection,
    updateSection,
    deleteSection,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    setSaving,
    markAsSaved,
    toggleSidebar,
    toggleAIPanel,
    setZoomLevel,
    undo,
    redo,
    canUndo,
    canRedo,
    createBlock,
    updateDesignSettings,
  } = useReportStudioStore();

  // Handlers
  const handleSectionClick = useCallback((sectionId: string) => {
    selectSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectSection]);

  const handleSectionReorder = useCallback((sections: Section[]) => {
    const oldSections = content.sections;
    const movedSection = sections.find((s, i) => oldSections[i]?.id !== s.id);
    if (movedSection) {
      const startIndex = oldSections.findIndex(s => s.id === movedSection.id);
      const endIndex = sections.findIndex(s => s.id === movedSection.id);
      if (startIndex !== -1 && endIndex !== -1) {
        reorderSections(startIndex, endIndex);
      }
    }
  }, [content.sections, reorderSections]);

  const handleAddSection = useCallback((parentId?: string) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type: 'section',
      title: 'Nouvelle section',
      level: 1,
      status: 'manual',
      isLocked: false,
      isCollapsed: false,
      children: [],
      blocks: [
        {
          id: `block-${Date.now()}`,
          type: 'paragraph',
          content: 'Contenu de la nouvelle section...',
        },
      ],
    };
    addSection(newSection, parentId);
  }, [addSection]);

  const handleEditSection = useCallback((sectionId: string) => {
    setEditingSectionId(sectionId);
    setShowSectionEditor(true);
  }, []);

  const handleSaveSection = useCallback((sectionId: string, updates: Partial<Section>) => {
    updateSection(sectionId, updates);
  }, [updateSection]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    deleteSection(sectionId);
    if (editor.selectedSectionId === sectionId) {
      selectSection(null);
    }
  }, [deleteSection, editor.selectedSectionId, selectSection]);

  const editingSection = editingSectionId
    ? content.sections.find(s => s.id === editingSectionId) || null
    : null;

  const handleOpenDataLibrary = useCallback(() => {
    setShowDataLibrary(true);
  }, []);

  const handleInsertChartFromLibrary = useCallback((chart: ChartTemplate) => {
    if (!editor.selectedSectionId && content.sections.length > 0) {
      selectSection(content.sections[0].id);
    }

    const sectionId = editor.selectedSectionId || content.sections[0]?.id;
    if (!sectionId) return;

    const newBlock = {
      id: `block-${Date.now()}`,
      type: 'chart' as const,
      chartType: chart.chartType,
      data: chart.data,
      config: chart.config,
    };

    addBlock(sectionId, newBlock);
    selectBlock(newBlock.id);
  }, [editor.selectedSectionId, content.sections, addBlock, selectBlock, selectSection]);

  const handleInsertTableFromLibrary = useCallback((table: TableTemplate) => {
    if (!editor.selectedSectionId && content.sections.length > 0) {
      selectSection(content.sections[0].id);
    }

    const sectionId = editor.selectedSectionId || content.sections[0]?.id;
    if (!sectionId) return;

    const newBlock = {
      id: `block-${Date.now()}`,
      type: 'table' as const,
      headers: table.headers,
      rows: table.rows,
      config: table.config,
    };

    addBlock(sectionId, newBlock);
    selectBlock(newBlock.id);
  }, [editor.selectedSectionId, content.sections, addBlock, selectBlock, selectSection]);

  const handleInsert = useCallback((type: BlockType, afterBlockId?: string) => {
    if (!editor.selectedSectionId && content.sections.length > 0) {
      selectSection(content.sections[0].id);
    }

    const sectionId = editor.selectedSectionId || content.sections[0]?.id;
    if (!sectionId) return;

    const newBlock = createBlock(type);
    addBlock(sectionId, newBlock, afterBlockId);
    selectBlock(newBlock.id);

    // Open chart editor for new charts
    if (type === 'chart') {
      setEditingChartId(newBlock.id);
      setShowChartEditor(true);
    }
  }, [editor.selectedSectionId, content.sections, createBlock, addBlock, selectBlock, selectSection]);

  const handleContentChange = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
    const section = content.sections.find(s =>
      s.blocks.some(b => b.id === blockId) ||
      s.children?.some(c => c.blocks?.some(b => b.id === blockId))
    );
    if (section) {
      updateBlock(section.id, blockId, updates);
    }
  }, [content.sections, updateBlock]);

  const handleBlockSelect = useCallback((blockId: string | null) => {
    selectBlock(blockId);
  }, [selectBlock]);

  const handleDelete = useCallback(() => {
    if (!editor.selectedBlockId) return;
    const section = content.sections.find(s =>
      s.blocks.some(b => b.id === editor.selectedBlockId)
    );
    if (section) {
      deleteBlock(section.id, editor.selectedBlockId);
      selectBlock(null);
    }
  }, [editor.selectedBlockId, content.sections, deleteBlock, selectBlock]);

  const handleDuplicate = useCallback(() => {
    if (!editor.selectedBlockId) return;
    const section = content.sections.find(s =>
      s.blocks.some(b => b.id === editor.selectedBlockId)
    );
    if (section) {
      duplicateBlock(section.id, editor.selectedBlockId);
    }
  }, [editor.selectedBlockId, content.sections, duplicateBlock]);

  const handleMoveUp = useCallback(() => {
    if (!editor.selectedBlockId) return;
    const section = content.sections.find(s =>
      s.blocks.some(b => b.id === editor.selectedBlockId)
    );
    if (section) {
      const blockIndex = section.blocks.findIndex(b => b.id === editor.selectedBlockId);
      if (blockIndex > 0) {
        moveBlock(section.id, editor.selectedBlockId, section.id, blockIndex - 1);
      }
    }
  }, [editor.selectedBlockId, content.sections, moveBlock]);

  const handleMoveDown = useCallback(() => {
    if (!editor.selectedBlockId) return;
    const section = content.sections.find(s =>
      s.blocks.some(b => b.id === editor.selectedBlockId)
    );
    if (section) {
      const blockIndex = section.blocks.findIndex(b => b.id === editor.selectedBlockId);
      if (blockIndex < section.blocks.length - 1) {
        moveBlock(section.id, editor.selectedBlockId, section.id, blockIndex + 1);
      }
    }
  }, [editor.selectedBlockId, content.sections, moveBlock]);

  const handleSave = useCallback(async () => {
    if (!report || !content) return;
    setSaving(true);
    try {
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000));
      markAsSaved();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [report, content, setSaving, markAsSaved]);

  const handleExport = useCallback((_format: ExportFormat) => {
    setShowExportModal(true);
  }, []);

  const handleOpenDesignSettings = useCallback(() => {
    setShowDesignSettings(true);
  }, []);

  const handleSaveDesignSettings = useCallback((settings: ReportDesignSettings) => {
    updateDesignSettings(settings);
  }, [updateDesignSettings]);

  const handleExportConfirm = useCallback(async (format: ExportFormat, options: ExportOptions) => {
    if (!report) return;

    console.log('Exporting:', format, options);

    const result = await exportReport(report, content, format, options);

    if (result.success && result.blob && result.filename) {
      downloadBlob(result.blob, result.filename);
      setShowExportModal(false);
    } else {
      alert(`Erreur lors de l'export: ${result.error || 'Erreur inconnue'}`);
    }
  }, [report, content]);

  const handleZoomChange = useCallback((zoom: number) => {
    setZoomLevel(zoom);
  }, [setZoomLevel]);

  const handleModeToggle = useCallback(() => {
    setEditing(!editor.isEditing);
  }, [editor.isEditing, setEditing]);

  const handleChartSave = useCallback((chartData: { chartType: string; title: string; data: Array<{ label: string; value: number }>; config: Record<string, unknown> }) => {
    if (editingChartId) {
      const section = content.sections.find(s =>
        s.blocks.some(b => b.id === editingChartId)
      );
      if (section) {
        updateBlock(section.id, editingChartId, {
          chartType: chartData.chartType,
          data: {
            labels: chartData.data.map((d) => d.label),
            datasets: [{
              label: chartData.title,
              data: chartData.data.map((d) => d.value),
              backgroundColor: '#1C3163',
            }],
          },
          config: {
            title: chartData.title,
            ...chartData.config,
          },
        });
      }
    }
    setShowChartEditor(false);
    setEditingChartId(null);
  }, [editingChartId, content.sections, updateBlock]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            e.preventDefault();
            if (canUndo()) undo();
            break;
          case 'y':
            e.preventDefault();
            if (canRedo()) redo();
            break;
          case 'd':
            e.preventDefault();
            handleDuplicate();
            break;
        }
      }
      if (e.key === 'Delete' && editor.selectedBlockId) {
        handleDelete();
      }
      if (e.key === 'Escape') {
        handleBlockSelect(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleBlockSelect, handleDelete, handleDuplicate, undo, redo, canUndo, canRedo, editor.selectedBlockId]);

  // No report loaded state
  if (!report) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-gray-100 ${className || ''}`}>
      {/* Header */}
      <ReportHeader
        report={report}
        mode={editor.isEditing ? 'edit' : 'view'}
        hasUnsavedChanges={ui.hasUnsavedChanges}
        isSaving={ui.isSaving}
        zoom={editor.zoomLevel}
        onSave={handleSave}
        onExport={handleExport}
        onZoomChange={handleZoomChange}
        onModeToggle={handleModeToggle}
        onDesignSettings={handleOpenDesignSettings}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Panel (Left) */}
        <NavigationPanel
          sections={content.sections}
          selectedSectionId={editor.selectedSectionId}
          collapsed={ui.sidebarCollapsed}
          onSectionClick={handleSectionClick}
          onSectionEdit={handleEditSection}
          onReorder={handleSectionReorder}
          onAddSection={handleAddSection}
          onCollapse={toggleSidebar}
        />

        {/* Document Canvas (Center) */}
        <DocumentCanvas
          content={{ contentTree: content }}
          mode={editor.isEditing ? 'edit' : 'view'}
          zoom={editor.zoomLevel}
          viewMode="continuous"
          selectedBlockId={editor.selectedBlockId}
          onContentChange={handleContentChange}
          onBlockSelect={handleBlockSelect}
        >
          {/* Floating Toolbar for edit mode */}
          {editor.isEditing && (
            <FloatingToolbar
              visible={true}
              selectedBlockId={editor.selectedBlockId}
              onInsert={handleInsert}
              onOpenLibrary={handleOpenDataLibrary}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          )}
        </DocumentCanvas>

        {/* AI Panel (Right) */}
        <AIPanel
          report={report}
          selectedBlockId={editor.selectedBlockId}
          collapsed={ui.aiPanelCollapsed}
          onCollapse={toggleAIPanel}
        />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        reportTitle={report.title}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportConfirm}
      />

      {/* Chart Editor Modal */}
      <ChartEditorModal
        isOpen={showChartEditor}
        onClose={() => {
          setShowChartEditor(false);
          setEditingChartId(null);
        }}
        onSave={handleChartSave}
      />

      {/* Design Settings Modal */}
      <DesignSettingsModal
        isOpen={showDesignSettings}
        settings={report.designSettings}
        onClose={() => setShowDesignSettings(false)}
        onSave={handleSaveDesignSettings}
      />

      {/* Section Editor Modal */}
      <SectionEditorModal
        isOpen={showSectionEditor}
        section={editingSection}
        onClose={() => {
          setShowSectionEditor(false);
          setEditingSectionId(null);
        }}
        onSave={handleSaveSection}
        onDelete={handleDeleteSection}
      />

      {/* Data Library Modal */}
      <DataLibraryModal
        isOpen={showDataLibrary}
        reportTypes={report.type ? report.type.split(',') : []}
        onClose={() => setShowDataLibrary(false)}
        onSelectChart={handleInsertChartFromLibrary}
        onSelectTable={handleInsertTableFromLibrary}
      />
    </div>
  );
};

export default ReportStudio;
