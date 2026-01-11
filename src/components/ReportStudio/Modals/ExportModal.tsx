/**
 * Export Modal Component
 * Modal for exporting reports in various formats
 */

import React, { useState } from 'react';
import {
  X,
  FileText,
  FileType,
  Presentation,
  Sheet,
  Globe,
  Code,
  Download,
} from 'lucide-react';
import { ExportFormat, ExportOptions } from '../../../types/reportStudio';

interface ExportModalProps {
  isOpen: boolean;
  reportTitle: string;
  onClose: () => void;
  onExport: (format: ExportFormat, options: ExportOptions) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  reportTitle,
  onClose,
  onExport,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    quality: 'standard',
    pageSize: 'A4',
    orientation: 'portrait',
    margins: 'normal',
    includeTableOfContents: true,
    includeCoverPage: true,
    includeComments: false,
  });
  const [isExporting, setIsExporting] = useState(false);

  const formats: { format: ExportFormat; label: string; icon: React.ElementType; description: string }[] = [
    { format: 'pdf', label: 'PDF', icon: FileText, description: 'Document portable, idéal pour l\'impression' },
    { format: 'docx', label: 'Word', icon: FileType, description: 'Document éditable Microsoft Word' },
    { format: 'pptx', label: 'PowerPoint', icon: Presentation, description: 'Présentation Microsoft PowerPoint' },
    { format: 'xlsx', label: 'Excel', icon: Sheet, description: 'Tableur avec données brutes' },
    { format: 'html', label: 'HTML', icon: Globe, description: 'Page web interactive' },
    { format: 'markdown', label: 'Markdown', icon: Code, description: 'Format texte simple' },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedFormat, { ...options, format: selectedFormat });
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200">
          <div>
            <h2 className="text-xl font-semibold text-primary-900">Exporter le rapport</h2>
            <p className="text-sm text-primary-500">{reportTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Format selection */}
          <div className="mb-6">
            <h3 className="font-medium text-primary-900 mb-3">Format d'export</h3>
            <div className="grid grid-cols-3 gap-3">
              {formats.map(({ format, label, icon: Icon, description }) => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedFormat === format
                      ? 'border-primary bg-primary-50'
                      : 'border-primary-200 hover:border-primary-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${
                    selectedFormat === format ? 'text-primary' : 'text-primary-400'
                  }`} />
                  <p className="font-medium text-primary-900">{label}</p>
                  <p className="text-xs text-primary-500 mt-1">{description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          {(selectedFormat === 'pdf' || selectedFormat === 'docx') && (
            <div className="space-y-4">
              <h3 className="font-medium text-primary-900">Options</h3>

              {/* Quality */}
              <div>
                <label className="text-sm text-primary-600">Qualité</label>
                <select
                  value={options.quality}
                  onChange={(e) => setOptions({ ...options, quality: e.target.value as 'draft' | 'standard' | 'high' })}
                  className="w-full mt-1 px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Brouillon</option>
                  <option value="standard">Standard</option>
                  <option value="high">Haute qualité</option>
                </select>
              </div>

              {/* Page size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-primary-600">Taille de page</label>
                  <select
                    value={options.pageSize}
                    onChange={(e) => setOptions({ ...options, pageSize: e.target.value as 'A4' | 'Letter' | 'A3' })}
                    className="w-full mt-1 px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="A3">A3</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-primary-600">Orientation</label>
                  <select
                    value={options.orientation}
                    onChange={(e) => setOptions({ ...options, orientation: e.target.value as 'portrait' | 'landscape' })}
                    className="w-full mt-1 px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Paysage</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeCoverPage}
                    onChange={(e) => setOptions({ ...options, includeCoverPage: e.target.checked })}
                    className="w-4 h-4 text-primary border-primary-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-primary-700">Inclure la page de couverture</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeTableOfContents}
                    onChange={(e) => setOptions({ ...options, includeTableOfContents: e.target.checked })}
                    className="w-4 h-4 text-primary border-primary-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-primary-700">Inclure la table des matières</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeComments}
                    onChange={(e) => setOptions({ ...options, includeComments: e.target.checked })}
                    className="w-4 h-4 text-primary border-primary-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-primary-700">Inclure les commentaires</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-primary-200 bg-primary-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Exporter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
