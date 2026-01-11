import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Clock,
  Eye,
  Search,
  Calendar,
  Save,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Modal,
  ConfirmModal,
  Input,
  Select,
  Checkbox,
} from '../../components/ui';
import { useCentresStore, useAppStore } from '../../store';
import { useReportStudioStore } from '../../store/reportStudioStore';
import { CATALOGUE_RAPPORTS } from '../../data/catalogueRapports';
import ReportStudio from '../../components/ReportStudio/ReportStudio';
import type { StudioReport, ReportStatus, ReportTemplate } from '../../types/reportStudio';

const statutColors: Record<ReportStatus, string> = {
  draft: 'bg-primary-100 text-primary-700',
  generating: 'bg-info/10 text-info',
  review: 'bg-warning/10 text-warning',
  approved: 'bg-info/10 text-info',
  published: 'bg-success/10 text-success',
  archived: 'bg-primary-200 text-primary-500',
};

const statutLabels: Record<ReportStatus, string> = {
  draft: 'Brouillon',
  generating: 'En génération',
  review: 'En révision',
  approved: 'Approuvé',
  published: 'Publié',
  archived: 'Archivé',
};

// Mock data for reports list
const mockRapports: StudioReport[] = [
  {
    id: '1',
    centreId: 'centre-1',
    title: 'Rapport mensuel Janvier 2024',
    description: 'Rapport de performance du mois de janvier',
    type: 'rapport_mensuel_am',
    status: 'draft',
    author: 'John Doe',
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    periodLabel: 'Janvier 2024',
    contentTree: {
      sections: [
        {
          id: 'section-1',
          type: 'section',
          title: 'Résumé exécutif',
          level: 1,
          status: 'generated',
          isLocked: false,
          blocks: [
            {
              id: 'block-1',
              type: 'paragraph',
              content: 'Ce rapport présente une analyse complète des performances du centre pour le mois de janvier 2024. Les indicateurs clés montrent une progression significative par rapport au mois précédent.',
            },
          ],
          children: [],
        },
        {
          id: 'section-2',
          type: 'section',
          title: 'Analyse des performances',
          level: 1,
          status: 'manual',
          isLocked: false,
          blocks: [
            {
              id: 'block-2',
              type: 'heading',
              content: 'Indicateurs clés',
              level: 2,
            },
            {
              id: 'block-3',
              type: 'kpi_card',
              label: 'Chiffre d\'affaires',
              value: 125000,
              unit: '€',
              change: 12.5,
              changeType: 'positive',
              sparkline: [100, 110, 105, 120, 118, 125],
            },
            {
              id: 'block-4',
              type: 'chart',
              chartType: 'bar',
              data: {
                labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
                datasets: [{
                  label: 'Ventes',
                  data: [28000, 32000, 30000, 35000],
                  backgroundColor: '#1C3163',
                }],
              },
              config: {
                title: 'Évolution des ventes par semaine',
                legend: { show: true, position: 'top' },
              },
            },
          ],
          children: [],
        },
      ],
    },
    version: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    centreId: 'centre-1',
    title: 'Rapport trimestriel Q4 2023',
    type: 'rapport_trimestriel',
    status: 'published',
    author: 'Jane Smith',
    periodStart: '2023-10-01',
    periodEnd: '2023-12-31',
    periodLabel: 'Q4 2023',
    contentTree: { sections: [] },
    version: 3,
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-10T16:00:00Z',
    publishedAt: '2024-01-10T16:00:00Z',
  },
];

export function RapportStudioPage() {
  const { centreId } = useParams<{ centreId: string }>();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const { addToast } = useAppStore();

  const { report, setReport, setContent, clearReport } = useReportStudioStore();

  const [rapports, setRapports] = useState<StudioReport[]>(mockRapports);
  const [isEditing, setIsEditing] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState<string>('all');
  const [recherche, setRecherche] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rapportToDelete, setRapportToDelete] = useState<StudioReport | null>(null);

  const [newRapportData, setNewRapportData] = useState({
    titre: '',
    typesRapport: [] as string[],
    periodStart: '',
    periodEnd: '',
    periodType: 'month' as 'month' | 'quarter' | 'year' | 'custom',
    saveAsTemplate: false,
    templateName: '',
    fromTemplate: null as string | null,
  });

  const [templates, setTemplates] = useState<ReportTemplate[]>([
    {
      id: 'tpl-mensuel-standard',
      name: 'Rapport Mensuel Standard',
      description: 'Template pour le reporting mensuel avec KPIs et graphiques',
      types: ['PERF_ACTIF', 'TDB_CENTRE'],
      category: 'mensuel',
      isDefault: true,
      author: 'Système',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      usageCount: 15,
      contentTree: { sections: [] },
      dataConfig: {
        requiredDataSources: ['kpis', 'frequentation'],
        refreshOnOpen: true,
        defaultPeriodType: 'month',
      },
    },
    {
      id: 'tpl-trimestriel-investisseur',
      name: 'Rapport Trimestriel Investisseur',
      description: 'Rapport complet pour les investisseurs',
      types: ['ANALYSE_PORTEFEUILLE', 'NOI_ANALYSIS', 'VALORISATION_DCF'],
      category: 'trimestriel',
      isDefault: false,
      author: 'User',
      createdAt: '2024-02-15',
      updatedAt: '2024-02-15',
      usageCount: 5,
      contentTree: { sections: [] },
      dataConfig: {
        requiredDataSources: ['kpis', 'financier', 'valorisation'],
        refreshOnOpen: true,
        defaultPeriodType: 'quarter',
      },
    },
  ]);

  const [activeTab, setActiveTab] = useState<'new' | 'template'>('new');

  // Period helpers
  const getPeriodLabel = () => {
    if (!newRapportData.periodStart || !newRapportData.periodEnd) return '';
    const start = new Date(newRapportData.periodStart);
    const end = new Date(newRapportData.periodEnd);
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };

    if (newRapportData.periodType === 'month') {
      return start.toLocaleDateString('fr-FR', options);
    } else if (newRapportData.periodType === 'quarter') {
      const quarter = Math.ceil((start.getMonth() + 1) / 3);
      return `T${quarter} ${start.getFullYear()}`;
    } else if (newRapportData.periodType === 'year') {
      return `Année ${start.getFullYear()}`;
    }
    return `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`;
  };

  const setQuickPeriod = (type: 'month' | 'quarter' | 'year') => {
    const now = new Date();
    let start: Date, end: Date;

    if (type === 'month') {
      // Previous month
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (type === 'quarter') {
      // Previous quarter
      const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
      const prevQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
      const year = currentQuarter === 1 ? now.getFullYear() - 1 : now.getFullYear();
      start = new Date(year, (prevQuarter - 1) * 3, 1);
      end = new Date(year, prevQuarter * 3, 0);
    } else {
      // Previous year
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear() - 1, 11, 31);
    }

    setNewRapportData(prev => ({
      ...prev,
      periodType: type,
      periodStart: start.toISOString().split('T')[0],
      periodEnd: end.toISOString().split('T')[0],
    }));
  };

  // Group reports by category
  const rapportsByCategory = Object.entries(CATALOGUE_RAPPORTS).reduce((acc, [code, config]) => {
    const cat = config.categorie;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ code, config });
    return acc;
  }, {} as Record<string, Array<{ code: string; config: typeof CATALOGUE_RAPPORTS[keyof typeof CATALOGUE_RAPPORTS] }>>);

  const categoryLabels: Record<string, string> = {
    asset_management: 'Asset Management',
    property_management: 'Property Management',
    leasing: 'Commercialisation',
    centre_commercial: 'Centre Commercial',
    financier: 'Financier',
    investissement: 'Investissement',
    projet: 'Projet & Mobilisation',
  };

  const toggleTypeSelection = (code: string) => {
    setNewRapportData(prev => ({
      ...prev,
      typesRapport: prev.typesRapport.includes(code)
        ? prev.typesRapport.filter(t => t !== code)
        : [...prev.typesRapport, code]
    }));
  };

  // Filter reports
  const filteredRapports = rapports.filter((r) => {
    if (filtreStatut !== 'all' && r.status !== filtreStatut) return false;
    if (recherche) {
      const searchLower = recherche.toLowerCase();
      return r.title.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const handleCreateRapport = () => {
    if (!centreId || !newRapportData.titre) return;

    // Check if creating from template or new
    let allSections: any[] = [];
    let reportTypes: string[] = [];

    if (newRapportData.fromTemplate) {
      const template = templates.find(t => t.id === newRapportData.fromTemplate);
      if (template) {
        reportTypes = template.types;
        // Clone sections from template
        allSections = template.contentTree.sections.map(s => ({
          ...s,
          id: crypto.randomUUID(),
        }));
      }
    } else {
      if (newRapportData.typesRapport.length === 0) return;
      reportTypes = newRapportData.typesRapport;
      // Combine sections from all selected types
      allSections = newRapportData.typesRapport.flatMap(typeCode => {
        const catalogEntry = CATALOGUE_RAPPORTS[typeCode as keyof typeof CATALOGUE_RAPPORTS];
        if (!catalogEntry?.sections) return [];
        return catalogEntry.sections.map((s) => ({
          id: crypto.randomUUID(),
          type: 'section' as const,
          title: s.titre,
          level: 1,
          status: 'manual' as const,
          isLocked: false,
          blocks: [],
          children: [],
          sourceType: typeCode,
        }));
      });
    }

    const newRapport: StudioReport = {
      id: crypto.randomUUID(),
      centreId,
      title: newRapportData.titre,
      type: reportTypes.join(','),
      status: 'draft',
      author: 'User',
      periodStart: newRapportData.periodStart || undefined,
      periodEnd: newRapportData.periodEnd || undefined,
      periodLabel: getPeriodLabel() || undefined,
      contentTree: {
        sections: allSections,
      },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save as template if requested
    if (newRapportData.saveAsTemplate && newRapportData.templateName) {
      const newTemplate: ReportTemplate = {
        id: `tpl-${crypto.randomUUID().slice(0, 8)}`,
        name: newRapportData.templateName,
        description: `Modèle basé sur "${newRapportData.titre}"`,
        types: reportTypes,
        category: newRapportData.periodType === 'month' ? 'mensuel' :
                  newRapportData.periodType === 'quarter' ? 'trimestriel' :
                  newRapportData.periodType === 'year' ? 'annuel' : 'custom',
        isDefault: false,
        author: 'User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        contentTree: { sections: allSections },
        dataConfig: {
          requiredDataSources: [],
          refreshOnOpen: true,
          defaultPeriodType: newRapportData.periodType,
        },
      };
      setTemplates([...templates, newTemplate]);
      addToast({ type: 'success', title: 'Modèle créé', message: `"${newRapportData.templateName}" ajouté` });
    }

    setRapports([...rapports, newRapport]);
    setIsCreateModalOpen(false);
    setNewRapportData({
      titre: '',
      typesRapport: [],
      periodStart: '',
      periodEnd: '',
      periodType: 'month',
      saveAsTemplate: false,
      templateName: '',
      fromTemplate: null,
    });
    setActiveTab('new');
    addToast({ type: 'success', title: 'Rapport créé', message: `${allSections.length} sections ajoutées` });
  };

  const handleCreateFromTemplate = (template: ReportTemplate) => {
    setNewRapportData(prev => ({
      ...prev,
      fromTemplate: template.id,
      typesRapport: template.types,
      periodType: template.dataConfig.defaultPeriodType,
    }));
    setQuickPeriod(template.dataConfig.defaultPeriodType);
  };

  const handleDeleteRapport = () => {
    if (!rapportToDelete) return;

    setRapports(rapports.filter(r => r.id !== rapportToDelete.id));
    setIsDeleteModalOpen(false);
    setRapportToDelete(null);
    addToast({ type: 'success', title: 'Rapport supprimé' });
  };

  const handleDupliquerRapport = (rapportId: string) => {
    const original = rapports.find(r => r.id === rapportId);
    if (!original) return;

    const duplicate: StudioReport = {
      ...original,
      id: crypto.randomUUID(),
      title: `${original.title} (copie)`,
      status: 'draft',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: undefined,
    };

    setRapports([...rapports, duplicate]);
    addToast({ type: 'success', title: 'Rapport dupliqué' });
  };

  const handleOuvrirRapport = (rapportItem: StudioReport) => {
    setReport(rapportItem);
    setContent(rapportItem.contentTree);
    setIsEditing(true);
  };

  const handleFermerRapport = () => {
    clearReport();
    setIsEditing(false);
  };

  // If editing, show the full ReportStudio component
  if (isEditing && report) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-100">
        <ReportStudio />
        {/* Back button overlay */}
        <button
          onClick={handleFermerRapport}
          className="fixed top-4 left-4 z-[60] px-4 py-2 bg-white rounded-lg shadow-lg text-sm font-medium text-primary-700 hover:bg-primary-50 flex items-center gap-2"
        >
          ← Retour à la liste
        </button>
      </div>
    );
  }

  // Report Card Component
  const RapportCard = ({ rapportItem }: { rapportItem: StudioReport }) => (
    <div className="bg-white p-4 rounded-lg border border-primary-200 hover:border-accent transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-primary-900">{rapportItem.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={statutColors[rapportItem.status]}>
              {statutLabels[rapportItem.status]}
            </Badge>
            <span className="text-xs text-primary-500">v{rapportItem.version}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOuvrirRapport(rapportItem)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDupliquerRapport(rapportItem.id)}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setRapportToDelete(rapportItem);
              setIsDeleteModalOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4 text-error" />
          </Button>
        </div>
      </div>

      <div className="text-sm text-primary-600 mb-3">
        {rapportItem.contentTree.sections.length} section(s)
      </div>

      <div className="flex items-center justify-between text-xs text-primary-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(rapportItem.updatedAt).toLocaleDateString('fr-FR')}
        </div>
        <Button variant="secondary" size="sm" onClick={() => handleOuvrirRapport(rapportItem)}>
          <Eye className="w-4 h-4 mr-1" />
          Ouvrir
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Rapport Studio</h1>
          <p className="text-primary-500 mt-1">{centre?.nom}</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Nouveau rapport
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
          <Input
            type="text"
            placeholder="Rechercher un rapport..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          options={[
            { value: 'all', label: 'Tous les statuts' },
            ...Object.entries(statutLabels).map(([value, label]) => ({ value, label })),
          ]}
          className="w-44"
        />
      </div>

      {/* Reports list */}
      {filteredRapports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-primary-300 mx-auto mb-4" />
            <p className="text-primary-500 mb-4">Aucun rapport</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un rapport
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredRapports.map((rapportItem) => (
            <RapportCard key={rapportItem.id} rapportItem={rapportItem} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setActiveTab('new');
          setNewRapportData({
            titre: '',
            typesRapport: [],
            periodStart: '',
            periodEnd: '',
            periodType: 'month',
            saveAsTemplate: false,
            templateName: '',
            fromTemplate: null,
          });
        }}
        title="Nouveau rapport"
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateRapport}
              disabled={!newRapportData.titre || (!newRapportData.fromTemplate && newRapportData.typesRapport.length === 0)}
            >
              Créer le rapport
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Tabs: New / From Template */}
          <div className="flex gap-2 border-b border-primary-200 pb-3">
            <button
              onClick={() => {
                setActiveTab('new');
                setNewRapportData(prev => ({ ...prev, fromTemplate: null }));
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'new'
                  ? 'bg-primary text-white'
                  : 'text-primary-600 hover:bg-primary-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              Nouveau rapport
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'template'
                  ? 'bg-primary text-white'
                  : 'text-primary-600 hover:bg-primary-50'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Depuis un modèle ({templates.length})
            </button>
          </div>

          {/* Title */}
          <Input
            label="Titre du rapport"
            value={newRapportData.titre}
            onChange={(e) =>
              setNewRapportData({ ...newRapportData, titre: e.target.value })
            }
            placeholder="Ex: Rapport mensuel Janvier 2024"
          />

          {/* Period Selection */}
          <div className="p-4 bg-primary-50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-primary-900">Période du rapport</span>
            </div>

            {/* Quick period buttons */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setQuickPeriod('month')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  newRapportData.periodType === 'month'
                    ? 'bg-primary text-white'
                    : 'bg-white text-primary-600 hover:bg-primary-100'
                }`}
              >
                Mois précédent
              </button>
              <button
                onClick={() => setQuickPeriod('quarter')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  newRapportData.periodType === 'quarter'
                    ? 'bg-primary text-white'
                    : 'bg-white text-primary-600 hover:bg-primary-100'
                }`}
              >
                Trimestre précédent
              </button>
              <button
                onClick={() => setQuickPeriod('year')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  newRapportData.periodType === 'year'
                    ? 'bg-primary text-white'
                    : 'bg-white text-primary-600 hover:bg-primary-100'
                }`}
              >
                Année précédente
              </button>
              <button
                onClick={() => setNewRapportData(prev => ({ ...prev, periodType: 'custom' }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  newRapportData.periodType === 'custom'
                    ? 'bg-primary text-white'
                    : 'bg-white text-primary-600 hover:bg-primary-100'
                }`}
              >
                Personnalisé
              </button>
            </div>

            {/* Date inputs */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-primary-600 mb-1">Du</label>
                <input
                  type="date"
                  value={newRapportData.periodStart}
                  onChange={(e) => setNewRapportData(prev => ({ ...prev, periodStart: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-primary-600 mb-1">Au</label>
                <input
                  type="date"
                  value={newRapportData.periodEnd}
                  onChange={(e) => setNewRapportData(prev => ({ ...prev, periodEnd: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {getPeriodLabel() && (
              <p className="mt-2 text-sm text-primary-700">
                Période: <strong>{getPeriodLabel()}</strong>
              </p>
            )}
          </div>

          {activeTab === 'template' ? (
            /* Template Selection */
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Sélectionnez un modèle
              </label>
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleCreateFromTemplate(template)}
                    className={`p-3 text-left rounded-xl border-2 transition-all ${
                      newRapportData.fromTemplate === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-primary-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-primary-900">{template.name}</p>
                        <p className="text-xs text-primary-500 mt-0.5">{template.description}</p>
                      </div>
                      {template.isDefault && (
                        <Badge className="bg-accent/10 text-accent text-xs">Défaut</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-primary-500">
                      <span>{template.types.length} types</span>
                      <span>·</span>
                      <span>{template.usageCount} utilisations</span>
                      <span>·</span>
                      <span className="capitalize">{template.category}</span>
                    </div>
                  </button>
                ))}
              </div>

              {newRapportData.fromTemplate && (
                <div className="mt-3 p-3 bg-success/10 rounded-lg flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-success" />
                  <p className="text-sm text-success">
                    Les données seront actualisées pour la période sélectionnée
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Type Selection */
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Types de rapport (sélection multiple)
              </label>
              <p className="text-xs text-primary-500 mb-3">
                Sélectionnez un ou plusieurs types pour combiner leurs sections
              </p>

              <div className="max-h-56 overflow-y-auto border border-primary-200 rounded-lg">
                {Object.entries(rapportsByCategory).map(([category, items]) => (
                  <div key={category} className="border-b border-primary-100 last:border-b-0">
                    <div className="px-3 py-2 bg-primary-50 font-medium text-sm text-primary-800 sticky top-0">
                      {categoryLabels[category] || category}
                    </div>
                    <div className="p-2 space-y-1">
                      {items.map(({ code, config }) => (
                        <label
                          key={code}
                          className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            newRapportData.typesRapport.includes(code)
                              ? 'bg-accent/10 border border-accent'
                              : 'hover:bg-primary-50 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={newRapportData.typesRapport.includes(code)}
                            onChange={() => toggleTypeSelection(code)}
                            className="mt-1 h-4 w-4 rounded border-primary-300 text-accent focus:ring-accent"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-primary-900">{config.nom}</span>
                              {config.estPremium && (
                                <Badge className="bg-warning/10 text-warning text-xs">Premium</Badge>
                              )}
                            </div>
                            <p className="text-xs text-primary-500 mt-0.5 line-clamp-1">
                              {config.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {newRapportData.typesRapport.length > 0 && (
                <div className="mt-3 p-3 bg-success/10 rounded-lg">
                  <p className="text-sm font-medium text-success">
                    {newRapportData.typesRapport.length} type(s) sélectionné(s)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Save as Template */}
          {activeTab === 'new' && newRapportData.typesRapport.length > 0 && (
            <div className="p-4 border border-primary-200 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRapportData.saveAsTemplate}
                  onChange={(e) => setNewRapportData(prev => ({ ...prev, saveAsTemplate: e.target.checked }))}
                  className="h-4 w-4 rounded border-primary-300 text-accent focus:ring-accent"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm text-primary-900">Sauvegarder comme modèle</span>
                  </div>
                  <p className="text-xs text-primary-500 mt-0.5">
                    Réutilisez cette structure pour vos prochains rapports
                  </p>
                </div>
              </label>

              {newRapportData.saveAsTemplate && (
                <div className="mt-3">
                  <Input
                    label="Nom du modèle"
                    value={newRapportData.templateName}
                    onChange={(e) => setNewRapportData(prev => ({ ...prev, templateName: e.target.value }))}
                    placeholder="Ex: Mon rapport mensuel"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteRapport}
        title="Supprimer le rapport"
        message={`Êtes-vous sûr de vouloir supprimer "${rapportToDelete?.title}" ?`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
