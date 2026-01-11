/**
 * Section Editor Modal
 * Modal for editing section properties (title, level, status)
 */

import React, { useState, useEffect } from 'react';
import { X, FileText, Lock, Unlock, Trash2 } from 'lucide-react';
import { Section, SectionStatus } from '../../../types/reportStudio';

interface SectionEditorModalProps {
  isOpen: boolean;
  section: Section | null;
  onClose: () => void;
  onSave: (sectionId: string, updates: Partial<Section>) => void;
  onDelete: (sectionId: string) => void;
}

export const SectionEditorModal: React.FC<SectionEditorModalProps> = ({
  isOpen,
  section,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<number>(1);
  const [status, setStatus] = useState<SectionStatus>('manual');
  const [isLocked, setIsLocked] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (section) {
      setTitle(section.title);
      setLevel(section.level);
      setStatus(section.status);
      setIsLocked(section.isLocked);
      setShowDeleteConfirm(false);
    }
  }, [section]);

  if (!isOpen || !section) return null;

  const handleSave = () => {
    onSave(section.id, {
      title,
      level,
      status,
      isLocked,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(section.id);
    onClose();
  };

  const statusOptions: { value: SectionStatus; label: string; color: string }[] = [
    { value: 'manual', label: 'Manuel', color: 'bg-green-100 text-green-700' },
    { value: 'generated', label: 'Généré par IA', color: 'bg-purple-100 text-purple-700' },
    { value: 'edited', label: 'Modifié', color: 'bg-blue-100 text-blue-700' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-primary-900">Modifier la section</h2>
              <p className="text-xs text-primary-500">Personnalisez les propriétés</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-primary-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1.5">
              Titre de la section
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Titre de la section..."
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1.5">
              Niveau hiérarchique
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-colors text-sm font-medium ${
                    level === l
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'
                  }`}
                >
                  H{l}
                </button>
              ))}
            </div>
            <p className="text-xs text-primary-500 mt-1.5">
              H1 = Section principale, H4 = Sous-sous-sous-section
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1.5">
              Statut
            </label>
            <div className="flex gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-colors text-sm font-medium ${
                    status === opt.value
                      ? opt.color + ' border-transparent'
                      : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lock toggle */}
          <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
            <div className="flex items-center gap-3">
              {isLocked ? (
                <Lock className="w-5 h-5 text-warning" />
              ) : (
                <Unlock className="w-5 h-5 text-primary-400" />
              )}
              <div>
                <p className="text-sm font-medium text-primary-900">
                  {isLocked ? 'Section verrouillée' : 'Section déverrouillée'}
                </p>
                <p className="text-xs text-primary-500">
                  {isLocked ? 'Protégée contre les modifications' : 'Peut être modifiée'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isLocked ? 'bg-warning' : 'bg-primary-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isLocked ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Delete section */}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-error hover:bg-error/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Supprimer cette section</span>
            </button>
          ) : (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error font-medium mb-2">
                Confirmer la suppression ?
              </p>
              <p className="text-xs text-primary-600 mb-3">
                Cette action supprimera la section et tous ses blocs de contenu.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 px-3 text-sm font-medium text-primary-600 bg-white border border-primary-200 rounded-lg hover:bg-primary-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 px-3 text-sm font-medium text-white bg-error rounded-lg hover:bg-error/90"
                >
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-primary-200 bg-primary-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};
