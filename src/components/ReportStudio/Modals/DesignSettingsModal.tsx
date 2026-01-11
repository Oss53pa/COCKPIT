/**
 * Design Settings Modal
 * Modal for configuring report design settings with vertical tabs
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Type,
  Layout,
  Image,
  FileText,
  List,
} from 'lucide-react';
import { ReportDesignSettings } from '../../../types/reportStudio';

interface DesignSettingsModalProps {
  isOpen: boolean;
  settings: ReportDesignSettings | undefined;
  onClose: () => void;
  onSave: (settings: ReportDesignSettings) => void;
}

const DEFAULT_SETTINGS: ReportDesignSettings = {
  pageFormat: {
    size: 'A4',
    orientation: 'portrait',
    margins: 'normal',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    baseFontSize: 14,
  },
  colors: {
    primary: '#1C3163',
    secondary: '#4A6FA5',
    accent: '#E85D04',
    text: '#333333',
    background: '#FFFFFF',
  },
  branding: {
    showLogo: true,
    logoUrl: '',
    showFooter: true,
    footerText: '',
  },
  cover: {
    enabled: true,
    template: 'modern',
    title: '',
    subtitle: '',
    backgroundImage: '',
  },
  tableOfContents: {
    enabled: true,
    depth: 3,
    showPageNumbers: true,
  },
};

const FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Nunito',
  'Playfair Display',
  'Merriweather',
];

const COVER_TEMPLATES = [
  { id: 'modern', name: 'Moderne', description: 'Design épuré avec bandeau coloré' },
  { id: 'classic', name: 'Classique', description: 'Style traditionnel professionnel' },
  { id: 'minimal', name: 'Minimaliste', description: 'Simple et élégant' },
  { id: 'bold', name: 'Audacieux', description: 'Couleurs vives et impactantes' },
];

type TabId = 'pageFormat' | 'typography' | 'colors' | 'branding' | 'cover' | 'toc';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'pageFormat', label: 'Format', icon: Layout },
  { id: 'typography', label: 'Typo', icon: Type },
  { id: 'colors', label: 'Couleurs', icon: Palette },
  { id: 'branding', label: 'Marque', icon: Image },
  { id: 'cover', label: 'Couverture', icon: FileText },
  { id: 'toc', label: 'Sommaire', icon: List },
];

export const DesignSettingsModal: React.FC<DesignSettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<ReportDesignSettings>(
    settings || DEFAULT_SETTINGS
  );
  const [activeTab, setActiveTab] = useState<TabId>('pageFormat');

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    } else {
      setLocalSettings(DEFAULT_SETTINGS);
    }
  }, [settings, isOpen]);

  const updateSettings = <K extends keyof ReportDesignSettings>(
    section: K,
    updates: Partial<ReportDesignSettings[K]>
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary-900">
                Paramètres de design
              </h2>
              <p className="text-sm text-primary-500">
                Personnalisez l'apparence de votre rapport
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content with vertical tabs */}
        <div className="flex-1 flex overflow-hidden">
          {/* Vertical Tabs */}
          <div className="w-24 bg-primary-50 border-r border-primary-200 flex flex-col py-4">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-3 px-2 mx-2 mb-1 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'pageFormat' && (
              <PageFormatTab
                settings={localSettings.pageFormat}
                onChange={(updates) => updateSettings('pageFormat', updates)}
              />
            )}
            {activeTab === 'typography' && (
              <TypographyTab
                settings={localSettings.typography}
                onChange={(updates) => updateSettings('typography', updates)}
              />
            )}
            {activeTab === 'colors' && (
              <ColorsTab
                settings={localSettings.colors}
                onChange={(updates) => updateSettings('colors', updates)}
              />
            )}
            {activeTab === 'branding' && (
              <BrandingTab
                settings={localSettings.branding}
                onChange={(updates) => updateSettings('branding', updates)}
              />
            )}
            {activeTab === 'cover' && (
              <CoverTab
                settings={localSettings.cover}
                onChange={(updates) => updateSettings('cover', updates)}
              />
            )}
            {activeTab === 'toc' && (
              <TocTab
                settings={localSettings.tableOfContents}
                onChange={(updates) => updateSettings('tableOfContents', updates)}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-primary-200 bg-primary-50">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-primary-600 hover:text-primary-800 transition-colors"
          >
            Réinitialiser
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Page Format Tab
interface PageFormatTabProps {
  settings: ReportDesignSettings['pageFormat'];
  onChange: (updates: Partial<ReportDesignSettings['pageFormat']>) => void;
}

const PageFormatTab: React.FC<PageFormatTabProps> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-primary-900 mb-4">Format de page</h3>
      <p className="text-sm text-primary-500 mb-6">
        Configurez les dimensions et les marges de votre document.
      </p>
    </div>

    <div className="grid grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-primary-700 mb-2">
          Taille du papier
        </label>
        <select
          value={settings.size}
          onChange={(e) => onChange({ size: e.target.value as 'A4' | 'Letter' | 'A3' })}
          className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="A4">A4 (210 x 297 mm)</option>
          <option value="A3">A3 (297 x 420 mm)</option>
          <option value="Letter">Letter US (216 x 279 mm)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary-700 mb-2">
          Orientation
        </label>
        <select
          value={settings.orientation}
          onChange={(e) => onChange({ orientation: e.target.value as 'portrait' | 'landscape' })}
          className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Paysage</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary-700 mb-2">
          Marges
        </label>
        <select
          value={settings.margins}
          onChange={(e) => onChange({ margins: e.target.value as 'normal' | 'narrow' | 'wide' })}
          className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="narrow">Étroites (12.7 mm)</option>
          <option value="normal">Normales (25.4 mm)</option>
          <option value="wide">Larges (50.8 mm)</option>
        </select>
      </div>
    </div>

    {/* Preview */}
    <div className="mt-8 flex justify-center">
      <div
        className={`bg-white border-2 border-primary-300 shadow-lg ${
          settings.orientation === 'portrait' ? 'w-32 h-44' : 'w-44 h-32'
        }`}
      >
        <div
          className="h-full bg-primary-50 m-1"
          style={{
            margin: settings.margins === 'narrow' ? '2px' : settings.margins === 'wide' ? '8px' : '4px',
          }}
        >
          <div className="flex flex-col items-center justify-center h-full text-xs text-primary-400">
            <span>{settings.size}</span>
            <span>{settings.orientation === 'portrait' ? 'Portrait' : 'Paysage'}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Typography Tab
interface TypographyTabProps {
  settings: ReportDesignSettings['typography'];
  onChange: (updates: Partial<ReportDesignSettings['typography']>) => void;
}

const TypographyTab: React.FC<TypographyTabProps> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-primary-900 mb-4">Typographie</h3>
      <p className="text-sm text-primary-500 mb-6">
        Choisissez les polices et tailles de texte pour votre rapport.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-primary-700 mb-2">
          Police des titres
        </label>
        <select
          value={settings.headingFont}
          onChange={(e) => onChange({ headingFont: e.target.value })}
          className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          {FONTS.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary-700 mb-2">
          Police du corps
        </label>
        <select
          value={settings.bodyFont}
          onChange={(e) => onChange({ bodyFont: e.target.value })}
          className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          {FONTS.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-primary-700 mb-2">
        Taille de base: {settings.baseFontSize}px
      </label>
      <input
        type="range"
        min="10"
        max="18"
        value={settings.baseFontSize}
        onChange={(e) => onChange({ baseFontSize: parseInt(e.target.value) })}
        className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-primary-400 mt-1">
        <span>10px</span>
        <span>14px</span>
        <span>18px</span>
      </div>
    </div>

    {/* Typography Preview */}
    <div className="mt-6 p-6 bg-primary-50 rounded-xl">
      <p className="text-xs text-primary-500 mb-4 uppercase tracking-wide">Aperçu</p>
      <h3
        style={{
          fontFamily: settings.headingFont,
          fontSize: `${settings.baseFontSize * 1.75}px`,
        }}
        className="font-bold text-primary-900 mb-3"
      >
        Titre de section
      </h3>
      <h4
        style={{
          fontFamily: settings.headingFont,
          fontSize: `${settings.baseFontSize * 1.25}px`,
        }}
        className="font-semibold text-primary-800 mb-2"
      >
        Sous-titre
      </h4>
      <p
        style={{
          fontFamily: settings.bodyFont,
          fontSize: `${settings.baseFontSize}px`,
        }}
        className="text-primary-700"
      >
        Ceci est un exemple de texte de corps avec la police et la taille sélectionnées.
        Le texte doit être lisible et agréable à lire.
      </p>
    </div>
  </div>
);

// Colors Tab
interface ColorsTabProps {
  settings: ReportDesignSettings['colors'];
  onChange: (updates: Partial<ReportDesignSettings['colors']>) => void;
}

const ColorsTab: React.FC<ColorsTabProps> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-primary-900 mb-4">Palette de couleurs</h3>
      <p className="text-sm text-primary-500 mb-6">
        Définissez les couleurs principales de votre rapport.
      </p>
    </div>

    <div className="grid grid-cols-5 gap-4">
      <ColorPicker
        label="Primaire"
        value={settings.primary}
        onChange={(color) => onChange({ primary: color })}
      />
      <ColorPicker
        label="Secondaire"
        value={settings.secondary}
        onChange={(color) => onChange({ secondary: color })}
      />
      <ColorPicker
        label="Accent"
        value={settings.accent}
        onChange={(color) => onChange({ accent: color })}
      />
      <ColorPicker
        label="Texte"
        value={settings.text}
        onChange={(color) => onChange({ text: color })}
      />
      <ColorPicker
        label="Fond"
        value={settings.background}
        onChange={(color) => onChange({ background: color })}
      />
    </div>

    {/* Color Palette Preview */}
    <div className="mt-6">
      <p className="text-xs text-primary-500 mb-3 uppercase tracking-wide">Aperçu de la palette</p>
      <div className="flex gap-2 h-16 rounded-xl overflow-hidden shadow-sm">
        {Object.entries(settings).map(([key, color]) => (
          <div
            key={key}
            className="flex-1 flex items-end justify-center pb-2"
            style={{ backgroundColor: color }}
          >
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              key === 'background' || key === 'text' ? 'bg-white/80 text-gray-700' : 'bg-black/20 text-white'
            }`}>
              {key}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Sample Preview */}
    <div
      className="mt-6 p-6 rounded-xl border"
      style={{ backgroundColor: settings.background, borderColor: settings.primary }}
    >
      <h4 style={{ color: settings.primary }} className="text-lg font-bold mb-2">
        Exemple de titre
      </h4>
      <p style={{ color: settings.text }} className="mb-3">
        Voici un exemple de paragraphe avec les couleurs sélectionnées.
      </p>
      <div className="flex gap-2">
        <span
          className="px-3 py-1 rounded text-white text-sm"
          style={{ backgroundColor: settings.primary }}
        >
          Primaire
        </span>
        <span
          className="px-3 py-1 rounded text-white text-sm"
          style={{ backgroundColor: settings.secondary }}
        >
          Secondaire
        </span>
        <span
          className="px-3 py-1 rounded text-white text-sm"
          style={{ backgroundColor: settings.accent }}
        >
          Accent
        </span>
      </div>
    </div>
  </div>
);

// Branding Tab
interface BrandingTabProps {
  settings: ReportDesignSettings['branding'];
  onChange: (updates: Partial<ReportDesignSettings['branding']>) => void;
}

const BrandingTab: React.FC<BrandingTabProps> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-primary-900 mb-4">Identité visuelle</h3>
      <p className="text-sm text-primary-500 mb-6">
        Personnalisez le branding de votre rapport avec votre logo et pied de page.
      </p>
    </div>

    <div className="space-y-6">
      {/* Logo Section */}
      <div className="p-4 border border-primary-200 rounded-xl">
        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={settings.showLogo}
            onChange={(e) => onChange({ showLogo: e.target.checked })}
            className="w-5 h-5 text-primary border-primary-300 rounded focus:ring-primary"
          />
          <span className="font-medium text-primary-900">Afficher le logo</span>
        </label>

        {settings.showLogo && (
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              URL du logo
            </label>
            <input
              type="text"
              value={settings.logoUrl || ''}
              onChange={(e) => onChange({ logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <p className="text-xs text-primary-400 mt-2">
              Formats supportés: PNG, JPG, SVG. Taille recommandée: 200x60px
            </p>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="p-4 border border-primary-200 rounded-xl">
        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={settings.showFooter}
            onChange={(e) => onChange({ showFooter: e.target.checked })}
            className="w-5 h-5 text-primary border-primary-300 rounded focus:ring-primary"
          />
          <span className="font-medium text-primary-900">Afficher le pied de page</span>
        </label>

        {settings.showFooter && (
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Texte du pied de page
            </label>
            <input
              type="text"
              value={settings.footerText || ''}
              onChange={(e) => onChange({ footerText: e.target.value })}
              placeholder="© 2024 Votre entreprise - Tous droits réservés"
              className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        )}
      </div>
    </div>
  </div>
);

// Cover Tab
interface CoverTabProps {
  settings: ReportDesignSettings['cover'];
  onChange: (updates: Partial<ReportDesignSettings['cover']>) => void;
}

const CoverTab: React.FC<CoverTabProps> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-primary-900 mb-4">Page de couverture</h3>
      <p className="text-sm text-primary-500 mb-6">
        Configurez l'apparence de la page de couverture de votre rapport.
      </p>
    </div>

    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={settings.enabled}
        onChange={(e) => onChange({ enabled: e.target.checked })}
        className="w-5 h-5 text-primary border-primary-300 rounded focus:ring-primary"
      />
      <span className="font-medium text-primary-900">Inclure une page de couverture</span>
    </label>

    {settings.enabled && (
      <div className="space-y-6">
        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-3">
            Modèle de couverture
          </label>
          <div className="grid grid-cols-2 gap-3">
            {COVER_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => onChange({ template: template.id })}
                className={`p-4 text-left rounded-xl border-2 transition-all ${
                  settings.template === template.id
                    ? 'border-primary bg-primary-50'
                    : 'border-primary-200 hover:border-primary-300'
                }`}
              >
                <p className="font-semibold text-primary-900">{template.name}</p>
                <p className="text-sm text-primary-500 mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Titre personnalisé
            </label>
            <input
              type="text"
              value={settings.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Laisser vide pour le titre du rapport"
              className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Sous-titre
            </label>
            <input
              type="text"
              value={settings.subtitle || ''}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              placeholder="Sous-titre optionnel"
              className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        {/* Background Image */}
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">
            Image de fond (optionnel)
          </label>
          <input
            type="text"
            value={settings.backgroundImage || ''}
            onChange={(e) => onChange({ backgroundImage: e.target.value })}
            placeholder="https://example.com/background.jpg"
            className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>
    )}
  </div>
);

// Table of Contents Tab
interface TocTabProps {
  settings: ReportDesignSettings['tableOfContents'];
  onChange: (updates: Partial<ReportDesignSettings['tableOfContents']>) => void;
}

const TocTab: React.FC<TocTabProps> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-primary-900 mb-4">Table des matières</h3>
      <p className="text-sm text-primary-500 mb-6">
        Configurez la génération automatique de la table des matières.
      </p>
    </div>

    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={settings.enabled}
        onChange={(e) => onChange({ enabled: e.target.checked })}
        className="w-5 h-5 text-primary border-primary-300 rounded focus:ring-primary"
      />
      <span className="font-medium text-primary-900">Inclure une table des matières</span>
    </label>

    {settings.enabled && (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Profondeur des niveaux
            </label>
            <select
              value={settings.depth}
              onChange={(e) => onChange({ depth: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value={1}>Niveau 1 uniquement</option>
              <option value={2}>Niveaux 1 et 2</option>
              <option value={3}>Niveaux 1 à 3</option>
              <option value={4}>Tous les niveaux</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showPageNumbers}
                onChange={(e) => onChange({ showPageNumbers: e.target.checked })}
                className="w-5 h-5 text-primary border-primary-300 rounded focus:ring-primary"
              />
              <span className="text-sm text-primary-700">Afficher les numéros de page</span>
            </label>
          </div>
        </div>

        {/* TOC Preview */}
        <div className="p-4 bg-primary-50 rounded-xl">
          <p className="text-xs text-primary-500 mb-3 uppercase tracking-wide">Aperçu</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-primary-900">1. Résumé exécutif</span>
              {settings.showPageNumbers && <span className="text-primary-400">3</span>}
            </div>
            {settings.depth >= 2 && (
              <div className="flex justify-between pl-4">
                <span className="text-primary-700">1.1 Introduction</span>
                {settings.showPageNumbers && <span className="text-primary-400">3</span>}
              </div>
            )}
            {settings.depth >= 3 && (
              <div className="flex justify-between pl-8">
                <span className="text-primary-600">1.1.1 Contexte</span>
                {settings.showPageNumbers && <span className="text-primary-400">3</span>}
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium text-primary-900">2. Analyse des performances</span>
              {settings.showPageNumbers && <span className="text-primary-400">5</span>}
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-primary-900">3. Recommandations</span>
              {settings.showPageNumbers && <span className="text-primary-400">12</span>}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

// Color Picker Component
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-primary-700 mb-2">{label}</label>
    <div className="space-y-2">
      <div
        className="w-full h-12 rounded-lg cursor-pointer border-2 border-primary-200 hover:border-primary-300 transition-colors relative overflow-hidden"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 text-xs text-center border border-primary-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono"
      />
    </div>
  </div>
);

export default DesignSettingsModal;
