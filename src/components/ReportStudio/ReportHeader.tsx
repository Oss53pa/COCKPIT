/**
 * Report Header Component
 * Toolbar with title, save, export and mode controls
 */

import React, { useState } from 'react';
import {
  ChevronLeft,
  Save,
  Download,
  FileText,
  FileType,
  Presentation,
  Sheet,
  Globe,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Palette,
} from 'lucide-react';
import { StudioReport, ExportFormat } from '../../types/reportStudio';
import { useReportStudioStore } from '../../store/reportStudioStore';

interface ReportHeaderProps {
  report: StudioReport;
  mode: 'view' | 'edit';
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  zoom: number;
  onSave: () => void;
  onExport: (format: ExportFormat) => void;
  onZoomChange: (zoom: number) => void;
  onModeToggle: () => void;
  onDesignSettings?: () => void;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  report,
  mode,
  hasUnsavedChanges,
  isSaving,
  zoom,
  onSave,
  onExport,
  onZoomChange,
  onModeToggle,
  onDesignSettings,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(report.title);

  const { undo, redo, canUndo, canRedo } = useReportStudioStore();

  const statusColors: Record<string, string> = {
    draft: 'bg-primary-100 text-primary-800',
    generating: 'bg-info/10 text-info',
    review: 'bg-warning/10 text-warning',
    approved: 'bg-success/10 text-success',
    published: 'bg-success/10 text-success',
    archived: 'bg-primary-200 text-primary-600',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Brouillon',
    generating: 'Génération...',
    review: 'En révision',
    approved: 'Approuvé',
    published: 'Publié',
    archived: 'Archivé',
  };

  const exportFormats: { format: ExportFormat; label: string; icon: React.ElementType }[] = [
    { format: 'pdf', label: 'PDF', icon: FileText },
    { format: 'docx', label: 'Word', icon: FileType },
    { format: 'pptx', label: 'PowerPoint', icon: Presentation },
    { format: 'xlsx', label: 'Excel', icon: Sheet },
    { format: 'html', label: 'HTML', icon: Globe },
  ];

  const zoomOptions = [50, 75, 100, 125, 150, 200];

  return (
    <header className="bg-white border-b border-primary-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left section - Back button and title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
            title="Retour"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="text-lg font-semibold border-b-2 border-primary outline-none px-1"
                autoFocus
              />
            ) : (
              <h1
                className="text-lg font-semibold text-primary-900 cursor-pointer hover:text-primary"
                onClick={() => mode === 'edit' && setIsEditingTitle(true)}
                title={mode === 'edit' ? 'Cliquer pour modifier' : ''}
              >
                {title}
              </h1>
            )}

            {/* Status badge */}
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[report.status] || statusColors.draft}`}>
              {statusLabels[report.status] || report.status}
            </span>

            {/* Unsaved changes indicator */}
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600">
                (modifications non sauvegardées)
              </span>
            )}
          </div>
        </div>

        {/* Center section - Version and undo/redo */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-primary-500">v{report.version}</span>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border-l border-primary-200 pl-4">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className={`p-2 rounded-lg transition-colors ${
                canUndo() ? 'hover:bg-primary-100 text-primary-700' : 'text-primary-300 cursor-not-allowed'
              }`}
              title="Annuler (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className={`p-2 rounded-lg transition-colors ${
                canRedo() ? 'hover:bg-primary-100 text-primary-700' : 'text-primary-300 cursor-not-allowed'
              }`}
              title="Rétablir (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom control */}
          <div className="flex items-center gap-1 mr-4 border-r border-primary-200 pr-4">
            <button
              onClick={() => onZoomChange(Math.max(50, zoom - 25))}
              className="p-1 hover:bg-primary-100 rounded"
              disabled={zoom <= 50}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <select
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="text-sm border rounded px-2 py-1"
            >
              {zoomOptions.map((z) => (
                <option key={z} value={z}>{z}%</option>
              ))}
            </select>
            <button
              onClick={() => onZoomChange(Math.min(200, zoom + 25))}
              className="p-1 hover:bg-primary-100 rounded"
              disabled={zoom >= 200}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Design Settings button */}
          {onDesignSettings && (
            <button
              onClick={onDesignSettings}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-primary-100 text-primary-700 hover:bg-primary-200 flex items-center gap-2"
              title="Paramètres de design"
            >
              <Palette className="w-4 h-4" />
              Design
            </button>
          )}

          {/* Mode toggle */}
          <button
            onClick={onModeToggle}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'edit'
                ? 'bg-primary text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            {mode === 'edit' ? 'Mode édition' : 'Mode lecture'}
          </button>

          {/* Save button */}
          <button
            onClick={onSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              hasUnsavedChanges
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-primary-100 text-primary-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sauvegarder
              </>
            )}
          </button>

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-primary-200 py-1 z-50">
                  {exportFormats.map(({ format, label, icon: Icon }) => (
                    <button
                      key={format}
                      onClick={() => {
                        onExport(format);
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span>Exporter en {label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
