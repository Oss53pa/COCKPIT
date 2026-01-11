import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Flag,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Trash2,
  Link2,
  X,
  Save,
  BarChart3,
  List,
  FileText,
  Users,
  Target,
  GitBranch,
  ClipboardCheck,
  Shield,
  Info,
  ExternalLink,
  TrendingUp,
  Tag,
  Layers,
  UserCheck,
  MessageSquare,
  Bell,
  CheckSquare,
  Square,
  ArrowRight,
  AlertOctagon,
  Gauge,
  Upload,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Modal } from '../components/ui';
import { TeamGanttView, type GanttTask } from '../components/gantt';
import { useCentresStore, useProjetStore } from '../store';
import { format, differenceInDays, addMonths, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Jalon, StatutJalon, TypeJalon, CategorieJalon, RAGStatus, AcceptanceCriteria, Deliverable } from '../types';
import { ImportCRChantierModal } from '../components/projet/ImportCRChantierModal';

// Couleurs par importance
const importanceColors = {
  critique: { bg: 'bg-error/10', border: 'border-error', text: 'text-error', fill: '#ef4444' },
  majeur: { bg: 'bg-warning/10', border: 'border-warning', text: 'text-warning', fill: '#f59e0b' },
  normal: { bg: 'bg-info/10', border: 'border-info', text: 'text-info', fill: '#3b82f6' },
};

// Couleurs par statut
const statutColors = {
  a_venir: { bg: 'bg-primary-100', icon: Circle, color: '#737373' },
  en_cours: { bg: 'bg-info/20', icon: Clock, color: '#3b82f6' },
  en_retard: { bg: 'bg-error/20', icon: AlertCircle, color: '#ef4444' },
  a_risque: { bg: 'bg-warning/20', icon: AlertTriangle, color: '#f59e0b' },
  atteint: { bg: 'bg-success/20', icon: CheckCircle2, color: '#22c55e' },
  reporte: { bg: 'bg-primary-200', icon: Calendar, color: '#525252' },
};

// Types de jalon avec labels
const typeJalonLabels: Record<TypeJalon, { label: string; icon: React.ReactNode }> = {
  gate: { label: 'Phase Gate', icon: <Shield className="w-4 h-4" /> },
  deliverable: { label: 'Livrable', icon: <FileText className="w-4 h-4" /> },
  checkpoint: { label: 'Point de contrôle', icon: <Target className="w-4 h-4" /> },
  review: { label: 'Revue', icon: <ClipboardCheck className="w-4 h-4" /> },
  approval: { label: 'Approbation', icon: <CheckCircle2 className="w-4 h-4" /> },
  handover: { label: 'Transfert', icon: <ArrowRight className="w-4 h-4" /> },
  go_live: { label: 'Mise en production', icon: <TrendingUp className="w-4 h-4" /> },
  closure: { label: 'Clôture', icon: <Flag className="w-4 h-4" /> },
};

const categorieJalonLabels: Record<CategorieJalon, string> = {
  governance: 'Gouvernance',
  commercial: 'Commercial',
  technique: 'Technique',
  rh: 'Ressources humaines',
  finance: 'Finance',
  legal: 'Juridique',
  marketing: 'Marketing',
  operations: 'Opérations',
};

const ragLabels: Record<RAGStatus, { label: string; color: string; bgColor: string }> = {
  green: { label: 'Vert - Conforme', color: 'text-success', bgColor: 'bg-success' },
  amber: { label: 'Orange - Vigilance', color: 'text-warning', bgColor: 'bg-warning' },
  red: { label: 'Rouge - Critique', color: 'text-error', bgColor: 'bg-error' },
  grey: { label: 'Gris - Non évalué', color: 'text-primary-400', bgColor: 'bg-primary-400' },
};

// Onglets du formulaire
type ModalTab = 'general' | 'planning' | 'raci' | 'status' | 'dependencies' | 'validation' | 'documentation';

const modalTabs: { id: ModalTab; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'Général', icon: <Info className="w-4 h-4" /> },
  { id: 'planning', label: 'Planification', icon: <Calendar className="w-4 h-4" /> },
  { id: 'raci', label: 'RACI', icon: <Users className="w-4 h-4" /> },
  { id: 'status', label: 'Suivi', icon: <Gauge className="w-4 h-4" /> },
  { id: 'dependencies', label: 'Dépendances', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'validation', label: 'Validation', icon: <ClipboardCheck className="w-4 h-4" /> },
  { id: 'documentation', label: 'Documentation', icon: <FileText className="w-4 h-4" /> },
];

// Interface pour les données du formulaire
interface JalonFormData {
  // Identification
  code: string;
  titre: string;
  description: string;
  type: TypeJalon;
  categorie: CategorieJalon;
  phase: string;
  workstream: string;

  // Planification
  dateBaseline: string;
  dateCible: string;
  datePrevision: string;
  dateReelle: string;
  dureeEstimee: number;

  // RACI
  responsableId: string;
  accountableId: string;
  consultedIds: string[];
  informedIds: string[];

  // Suivi
  importance: 'critique' | 'majeur' | 'normal';
  statut: StatutJalon;
  ragStatus: RAGStatus;
  progression: number;
  confiance: number;

  // Dépendances
  dependances: string[];
  successeurs: string[];
  dependancesExternes: string[];
  bloqueurs: string[];

  // Validation
  critereValidation: string;
  criteresAcceptation: AcceptanceCriteria[];
  livrables: Deliverable[];
  qualityGate: boolean;

  // Finance
  budgetAlloue: number;
  coutReel: number;
  impactBudgetaire: 'low' | 'medium' | 'high';

  // Risques
  niveauRisque: 'low' | 'medium' | 'high' | 'critical';

  // Documentation
  commentaire: string;
  notes: string;
  justificationRetard: string;
  actionsCorrectives: string;
  tags: string[];
  visible: boolean;
}

// Fonction pour créer des données initiales
const createInitialFormData = (jalon?: Jalon): JalonFormData => ({
  code: jalon?.code || '',
  titre: jalon?.titre || '',
  description: jalon?.description || '',
  type: jalon?.type || 'checkpoint',
  categorie: jalon?.categorie || 'operations',
  phase: jalon?.phase || '',
  workstream: jalon?.workstream || '',

  dateBaseline: jalon?.dateBaseline ? format(new Date(jalon.dateBaseline), 'yyyy-MM-dd') : '',
  dateCible: jalon?.dateCible ? format(new Date(jalon.dateCible), 'yyyy-MM-dd') : '',
  datePrevision: jalon?.datePrevision ? format(new Date(jalon.datePrevision), 'yyyy-MM-dd') : '',
  dateReelle: jalon?.dateReelle ? format(new Date(jalon.dateReelle), 'yyyy-MM-dd') : '',
  dureeEstimee: jalon?.dureeEstimee || 0,

  responsableId: jalon?.responsableId || '',
  accountableId: jalon?.accountableId || '',
  consultedIds: jalon?.consultedIds || [],
  informedIds: jalon?.informedIds || [],

  importance: jalon?.importance || 'normal',
  statut: jalon?.statut || 'a_venir',
  ragStatus: jalon?.ragStatus || 'grey',
  progression: jalon?.progression || 0,
  confiance: jalon?.confiance || 50,

  dependances: jalon?.dependances || [],
  successeurs: jalon?.successeurs || [],
  dependancesExternes: jalon?.dependancesExternes || [],
  bloqueurs: jalon?.bloqueurs || [],

  critereValidation: jalon?.critereValidation || '',
  criteresAcceptation: jalon?.criteresAcceptation || [],
  livrables: jalon?.livrables || [],
  qualityGate: jalon?.qualityGate || false,

  budgetAlloue: jalon?.budgetAlloue || 0,
  coutReel: jalon?.coutReel || 0,
  impactBudgetaire: jalon?.impactBudgetaire || 'low',

  niveauRisque: jalon?.niveauRisque || 'low',

  commentaire: jalon?.commentaire || '',
  notes: jalon?.notes || '',
  justificationRetard: jalon?.justificationRetard || '',
  actionsCorrectives: jalon?.actionsCorrectives || '',
  tags: jalon?.tags || [],
  visible: jalon?.visible !== false,
});

// Modal d'édition de jalon - Standard PMI/PRINCE2
function JalonModal({
  isOpen,
  onClose,
  jalon,
  projetId,
  onSave,
  allJalons,
  teamMembers,
}: {
  isOpen: boolean;
  onClose: () => void;
  jalon?: Jalon;
  projetId: string;
  onSave: (data: Partial<Jalon>) => void;
  allJalons: Jalon[];
  teamMembers: { id: string; name: string }[];
}) {
  const [activeTab, setActiveTab] = useState<ModalTab>('general');
  const [formData, setFormData] = useState<JalonFormData>(createInitialFormData(jalon));
  const [newTag, setNewTag] = useState('');
  const [newCritere, setNewCritere] = useState('');
  const [newLivrable, setNewLivrable] = useState('');
  const [newDependanceExterne, setNewDependanceExterne] = useState('');
  const [newBloqueur, setNewBloqueur] = useState('');

  useEffect(() => {
    if (jalon) {
      setFormData(createInitialFormData(jalon));
    } else {
      setFormData(createInitialFormData());
    }
    setActiveTab('general');
  }, [jalon, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave: Partial<Jalon> = {
      ...formData,
      dateBaseline: formData.dateBaseline ? new Date(formData.dateBaseline).toISOString() : new Date().toISOString(),
      dateCible: new Date(formData.dateCible).toISOString(),
      datePrevision: formData.datePrevision ? new Date(formData.datePrevision).toISOString() : undefined,
      dateReelle: formData.dateReelle ? new Date(formData.dateReelle).toISOString() : undefined,
      projetId,
    };

    onSave(dataToSave);
    onClose();
  };

  // Calculer la variance
  const calculateVariance = () => {
    if (!formData.dateBaseline || !formData.dateCible) return null;
    const baseline = new Date(formData.dateBaseline);
    const target = new Date(formData.dateCible);
    return differenceInDays(target, baseline);
  };

  const variance = calculateVariance();

  // Render field label avec tooltip optionnel
  const FieldLabel = ({ label, tooltip, required }: { label: string; tooltip?: string; required?: boolean }) => (
    <label className="block text-sm font-medium text-primary-700 mb-1.5 flex items-center gap-1">
      {label}
      {required && <span className="text-error">*</span>}
      {tooltip && (
        <span className="group relative">
          <Info className="w-3.5 h-3.5 text-primary-400 cursor-help" />
          <span className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-primary-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
            {tooltip}
          </span>
        </span>
      )}
    </label>
  );

  // Render select field
  const SelectField = ({
    label,
    value,
    onChange,
    options,
    tooltip,
    required
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    tooltip?: string;
    required?: boolean;
  }) => (
    <div>
      <FieldLabel label={label} tooltip={tooltip} required={required} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-sm"
        required={required}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  // Render du contenu par onglet
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-4">
            {/* Section Identification */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Identification
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel label="Code" tooltip="Identifiant unique du jalon (ex: GATE-01, J001)" required />
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="GATE-01"
                    required
                  />
                </div>
                <SelectField
                  label="Type"
                  value={formData.type}
                  onChange={(v) => setFormData({ ...formData, type: v as TypeJalon })}
                  options={Object.entries(typeJalonLabels).map(([value, { label }]) => ({ value, label }))}
                  tooltip="Type de jalon selon PMI/PRINCE2"
                  required
                />
              </div>

              <div className="mt-4">
                <FieldLabel label="Titre" required />
                <Input
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Titre descriptif du jalon"
                  required
                />
              </div>

              <div className="mt-4">
                <FieldLabel label="Description" />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Description détaillée du jalon et de ses objectifs..."
                />
              </div>
            </div>

            {/* Section Classification */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Classification
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Catégorie"
                  value={formData.categorie}
                  onChange={(v) => setFormData({ ...formData, categorie: v as CategorieJalon })}
                  options={Object.entries(categorieJalonLabels).map(([value, label]) => ({ value, label }))}
                  tooltip="Domaine fonctionnel du jalon"
                />
                <SelectField
                  label="Importance"
                  value={formData.importance}
                  onChange={(v) => setFormData({ ...formData, importance: v as 'critique' | 'majeur' | 'normal' })}
                  options={[
                    { value: 'normal', label: 'Normal' },
                    { value: 'majeur', label: 'Majeur' },
                    { value: 'critique', label: 'Critique' },
                  ]}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <FieldLabel label="Phase" tooltip="Phase du cycle de vie projet" />
                  <Input
                    value={formData.phase}
                    onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                    placeholder="ex: Conception, Réalisation..."
                  />
                </div>
                <div>
                  <FieldLabel label="Workstream" tooltip="Chantier ou flux de travail" />
                  <Input
                    value={formData.workstream}
                    onChange={(e) => setFormData({ ...formData, workstream: e.target.value })}
                    placeholder="ex: Infrastructure, Commercial..."
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-200 rounded-full text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, j) => j !== i) })}
                      className="hover:text-error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Ajouter un tag..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      e.preventDefault();
                      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
                      setNewTag('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (newTag.trim()) {
                      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
                      setNewTag('');
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'planning':
        return (
          <div className="space-y-4">
            {/* Dates principales */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Dates clés
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel label="Date baseline" tooltip="Date initialement planifiée (ne change pas)" required />
                  <Input
                    type="date"
                    value={formData.dateBaseline}
                    onChange={(e) => setFormData({ ...formData, dateBaseline: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <FieldLabel label="Date cible" tooltip="Date cible actuelle" required />
                  <Input
                    type="date"
                    value={formData.dateCible}
                    onChange={(e) => setFormData({ ...formData, dateCible: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <FieldLabel label="Date prévisionnelle" tooltip="Estimation actuelle de la date réelle" />
                  <Input
                    type="date"
                    value={formData.datePrevision}
                    onChange={(e) => setFormData({ ...formData, datePrevision: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel label="Date réelle" tooltip="Date effective d'atteinte (si complété)" />
                  <Input
                    type="date"
                    value={formData.dateReelle}
                    onChange={(e) => setFormData({ ...formData, dateReelle: e.target.value })}
                  />
                </div>
              </div>

              {/* Variance indicator */}
              {variance !== null && (
                <div className={`mt-4 p-3 rounded-lg ${
                  variance === 0 ? 'bg-success/10 border border-success/20' :
                  variance > 0 ? 'bg-warning/10 border border-warning/20' :
                  'bg-error/10 border border-error/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Variance baseline vs cible</span>
                    <span className={`text-sm font-bold ${
                      variance === 0 ? 'text-success' :
                      variance > 0 ? 'text-warning' :
                      'text-error'
                    }`}>
                      {variance === 0 ? 'Conforme' : variance > 0 ? `+${variance} jours` : `${variance} jours`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Durée estimée */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Durée
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel label="Durée estimée (jours)" tooltip="Nombre de jours de travail estimés" />
                  <Input
                    type="number"
                    min={0}
                    value={formData.dureeEstimee || ''}
                    onChange={(e) => setFormData({ ...formData, dureeEstimee: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end">
                  <div className="w-full p-3 bg-white rounded-lg border border-primary-200">
                    <span className="text-xs text-primary-500">Jours restants</span>
                    <p className="text-lg font-bold text-primary-900">
                      {formData.dateCible ? differenceInDays(new Date(formData.dateCible), new Date()) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'raci':
        return (
          <div className="space-y-4">
            {/* Explication RACI */}
            <div className="bg-info/5 border border-info/20 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-info mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Matrice RACI
              </h4>
              <p className="text-xs text-primary-600">
                <strong>R</strong>esponsible = Réalise le travail |
                <strong> A</strong>ccountable = Approuve/Valide |
                <strong> C</strong>onsulted = À consulter |
                <strong> I</strong>nformed = À informer
              </p>
            </div>

            {/* Responsible & Accountable */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Responsabilités principales
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel label="Responsable (R)" tooltip="Personne qui réalise le travail" />
                  <select
                    value={formData.responsableId}
                    onChange={(e) => setFormData({ ...formData, responsableId: e.target.value })}
                    className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                  >
                    <option value="">-- Sélectionner --</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel label="Approbateur (A)" tooltip="Personne qui valide/approuve" />
                  <select
                    value={formData.accountableId}
                    onChange={(e) => setFormData({ ...formData, accountableId: e.target.value })}
                    className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                  >
                    <option value="">-- Sélectionner --</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Consulted */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                À consulter (C)
              </h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.consultedIds.map((id) => {
                  const member = teamMembers.find(m => m.id === id);
                  return member ? (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-info/20 rounded-full text-xs">
                      {member.name}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, consultedIds: formData.consultedIds.filter(i => i !== id) })}
                        className="hover:text-error"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value && !formData.consultedIds.includes(e.target.value)) {
                    setFormData({ ...formData, consultedIds: [...formData.consultedIds, e.target.value] });
                  }
                  e.target.value = '';
                }}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-sm"
              >
                <option value="">+ Ajouter une personne à consulter</option>
                {teamMembers.filter(m => !formData.consultedIds.includes(m.id)).map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Informed */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                À informer (I)
              </h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.informedIds.map((id) => {
                  const member = teamMembers.find(m => m.id === id);
                  return member ? (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-200 rounded-full text-xs">
                      {member.name}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, informedIds: formData.informedIds.filter(i => i !== id) })}
                        className="hover:text-error"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value && !formData.informedIds.includes(e.target.value)) {
                    setFormData({ ...formData, informedIds: [...formData.informedIds, e.target.value] });
                  }
                  e.target.value = '';
                }}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-sm"
              >
                <option value="">+ Ajouter une personne à informer</option>
                {teamMembers.filter(m => !formData.informedIds.includes(m.id)).map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'status':
        return (
          <div className="space-y-4">
            {/* Statut et RAG */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                État actuel
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Statut"
                  value={formData.statut}
                  onChange={(v) => setFormData({ ...formData, statut: v as StatutJalon })}
                  options={[
                    { value: 'a_venir', label: 'À venir' },
                    { value: 'en_cours', label: 'En cours' },
                    { value: 'a_risque', label: 'À risque' },
                    { value: 'en_retard', label: 'En retard' },
                    { value: 'atteint', label: 'Atteint' },
                    { value: 'reporte', label: 'Reporté' },
                  ]}
                  required
                />
                <div>
                  <FieldLabel label="Indicateur RAG" tooltip="Red-Amber-Green status" />
                  <div className="flex gap-2">
                    {(['green', 'amber', 'red', 'grey'] as RAGStatus[]).map((rag) => (
                      <button
                        key={rag}
                        type="button"
                        onClick={() => setFormData({ ...formData, ragStatus: rag })}
                        className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                          formData.ragStatus === rag
                            ? `border-${ragLabels[rag].bgColor.replace('bg-', '')} ${ragLabels[rag].bgColor} text-white`
                            : 'border-primary-200 hover:border-primary-400'
                        }`}
                        style={{
                          backgroundColor: formData.ragStatus === rag
                            ? rag === 'green' ? '#22c55e' : rag === 'amber' ? '#f59e0b' : rag === 'red' ? '#ef4444' : '#9ca3af'
                            : undefined,
                          borderColor: rag === 'green' ? '#22c55e' : rag === 'amber' ? '#f59e0b' : rag === 'red' ? '#ef4444' : '#9ca3af'
                        }}
                      >
                        <span className={`text-xs font-medium ${formData.ragStatus === rag ? 'text-white' : 'text-primary-700'}`}>
                          {rag === 'green' ? 'V' : rag === 'amber' ? 'O' : rag === 'red' ? 'R' : 'N/A'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Progression et confiance */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Avancement
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <FieldLabel label="Progression" tooltip="Pourcentage d'avancement" />
                    <span className="text-sm font-bold text-primary-900">{formData.progression}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.progression}
                    onChange={(e) => setFormData({ ...formData, progression: parseInt(e.target.value) })}
                    className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-primary-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <FieldLabel label="Niveau de confiance" tooltip="Confiance dans l'atteinte de la date cible" />
                    <span className="text-sm font-bold text-primary-900">{formData.confiance}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.confiance}
                    onChange={(e) => setFormData({ ...formData, confiance: parseInt(e.target.value) })}
                    className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-success"
                  />
                </div>
              </div>
            </div>

            {/* Risque */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                Évaluation du risque
              </h4>
              <SelectField
                label="Niveau de risque"
                value={formData.niveauRisque}
                onChange={(v) => setFormData({ ...formData, niveauRisque: v as 'low' | 'medium' | 'high' | 'critical' })}
                options={[
                  { value: 'low', label: 'Faible' },
                  { value: 'medium', label: 'Moyen' },
                  { value: 'high', label: 'Élevé' },
                  { value: 'critical', label: 'Critique' },
                ]}
              />
            </div>
          </div>
        );

      case 'dependencies':
        return (
          <div className="space-y-4">
            {/* Dépendances internes */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Jalons prédécesseurs
              </h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.dependances.map((depId) => {
                  const dep = allJalons.find(j => j.id === depId);
                  return dep ? (
                    <span key={depId} className="inline-flex items-center gap-1 px-2 py-1 bg-info/20 rounded-full text-xs">
                      {dep.code} - {dep.titre}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, dependances: formData.dependances.filter(i => i !== depId) })}
                        className="hover:text-error"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value && !formData.dependances.includes(e.target.value)) {
                    setFormData({ ...formData, dependances: [...formData.dependances, e.target.value] });
                  }
                  e.target.value = '';
                }}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-sm"
              >
                <option value="">+ Ajouter un jalon prédécesseur</option>
                {allJalons.filter(j => j.id !== jalon?.id && !formData.dependances.includes(j.id)).map((j) => (
                  <option key={j.id} value={j.id}>{j.code} - {j.titre}</option>
                ))}
              </select>
            </div>

            {/* Successeurs */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Jalons successeurs
              </h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.successeurs.map((depId) => {
                  const dep = allJalons.find(j => j.id === depId);
                  return dep ? (
                    <span key={depId} className="inline-flex items-center gap-1 px-2 py-1 bg-success/20 rounded-full text-xs">
                      {dep.code} - {dep.titre}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, successeurs: formData.successeurs.filter(i => i !== depId) })}
                        className="hover:text-error"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value && !formData.successeurs.includes(e.target.value)) {
                    setFormData({ ...formData, successeurs: [...formData.successeurs, e.target.value] });
                  }
                  e.target.value = '';
                }}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-sm"
              >
                <option value="">+ Ajouter un jalon successeur</option>
                {allJalons.filter(j => j.id !== jalon?.id && !formData.successeurs.includes(j.id)).map((j) => (
                  <option key={j.id} value={j.id}>{j.code} - {j.titre}</option>
                ))}
              </select>
            </div>

            {/* Dépendances externes */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Dépendances externes
              </h4>
              <div className="space-y-2 mb-2">
                {formData.dependancesExternes.map((dep, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-white rounded border border-primary-200">
                    <span className="flex-1 text-sm">{dep}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, dependancesExternes: formData.dependancesExternes.filter((_, j) => j !== i) })}
                      className="text-primary-400 hover:text-error"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newDependanceExterne}
                  onChange={(e) => setNewDependanceExterne(e.target.value)}
                  placeholder="Ex: Livraison équipement fournisseur X"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (newDependanceExterne.trim()) {
                      setFormData({ ...formData, dependancesExternes: [...formData.dependancesExternes, newDependanceExterne.trim()] });
                      setNewDependanceExterne('');
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Bloqueurs */}
            <div className="bg-error/5 border border-error/20 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-error mb-3 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                Bloqueurs actifs
              </h4>
              <div className="space-y-2 mb-2">
                {formData.bloqueurs.map((bloq, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-white rounded border border-error/20">
                    <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />
                    <span className="flex-1 text-sm">{bloq}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, bloqueurs: formData.bloqueurs.filter((_, j) => j !== i) })}
                      className="text-primary-400 hover:text-error"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newBloqueur}
                  onChange={(e) => setNewBloqueur(e.target.value)}
                  placeholder="Décrire le bloqueur..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (newBloqueur.trim()) {
                      setFormData({ ...formData, bloqueurs: [...formData.bloqueurs, newBloqueur.trim()] });
                      setNewBloqueur('');
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'validation':
        return (
          <div className="space-y-4">
            {/* Quality Gate */}
            <div className="bg-primary-50 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.qualityGate}
                  onChange={(e) => setFormData({ ...formData, qualityGate: e.target.checked })}
                  className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="font-medium text-primary-900">Quality Gate</span>
                  <p className="text-xs text-primary-500">Ce jalon est un point de décision Go/No-Go</p>
                </div>
              </label>
            </div>

            {/* Critère principal */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Critère de validation principal
              </h4>
              <textarea
                value={formData.critereValidation}
                onChange={(e) => setFormData({ ...formData, critereValidation: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Décrire le critère principal qui définit que ce jalon est atteint..."
              />
            </div>

            {/* Critères d'acceptation */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Critères d'acceptation (checklist)
              </h4>
              <div className="space-y-2 mb-3">
                {formData.criteresAcceptation.map((critere, i) => (
                  <div key={critere.id} className="flex items-center gap-2 p-2 bg-white rounded border border-primary-200">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...formData.criteresAcceptation];
                        updated[i] = { ...updated[i], completed: !updated[i].completed };
                        setFormData({ ...formData, criteresAcceptation: updated });
                      }}
                      className={`flex-shrink-0 ${critere.completed ? 'text-success' : 'text-primary-400'}`}
                    >
                      {critere.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>
                    <span className={`flex-1 text-sm ${critere.completed ? 'line-through text-primary-400' : ''}`}>
                      {critere.description}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        criteresAcceptation: formData.criteresAcceptation.filter((_, j) => j !== i)
                      })}
                      className="text-primary-400 hover:text-error"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCritere}
                  onChange={(e) => setNewCritere(e.target.value)}
                  placeholder="Ajouter un critère d'acceptation..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (newCritere.trim()) {
                      const newCritereObj: AcceptanceCriteria = {
                        id: `crit-${Date.now()}`,
                        description: newCritere.trim(),
                        completed: false,
                      };
                      setFormData({ ...formData, criteresAcceptation: [...formData.criteresAcceptation, newCritereObj] });
                      setNewCritere('');
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Livrables requis */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Livrables requis
              </h4>
              <div className="space-y-2 mb-3">
                {formData.livrables.map((livrable, i) => (
                  <div key={livrable.id} className="flex items-center gap-2 p-2 bg-white rounded border border-primary-200">
                    <FileText className="w-4 h-4 text-primary-400 flex-shrink-0" />
                    <span className="flex-1 text-sm">{livrable.nom}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      livrable.statut === 'approved' ? 'bg-success/10 text-success' :
                      livrable.statut === 'completed' ? 'bg-info/10 text-info' :
                      livrable.statut === 'in_progress' ? 'bg-warning/10 text-warning' : 'bg-primary-100 text-primary-600'
                    }`}>
                      {livrable.statut === 'approved' ? 'Approuvé' :
                       livrable.statut === 'completed' ? 'Complété' :
                       livrable.statut === 'in_progress' ? 'En cours' : 'En attente'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        livrables: formData.livrables.filter((_, j) => j !== i)
                      })}
                      className="text-primary-400 hover:text-error"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newLivrable}
                  onChange={(e) => setNewLivrable(e.target.value)}
                  placeholder="Nom du livrable requis..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (newLivrable.trim()) {
                      const newLivrableObj: Deliverable = {
                        id: `liv-${Date.now()}`,
                        nom: newLivrable.trim(),
                        statut: 'pending',
                      };
                      setFormData({ ...formData, livrables: [...formData.livrables, newLivrableObj] });
                      setNewLivrable('');
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'documentation':
        return (
          <div className="space-y-4">
            {/* Commentaire */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Commentaire général
              </h4>
              <textarea
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Commentaire visible par tous..."
              />
            </div>

            {/* Notes internes */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes internes
              </h4>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Notes internes pour l'équipe projet..."
              />
            </div>

            {/* Justification retard */}
            {(formData.statut === 'en_retard' || formData.statut === 'a_risque') && (
              <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-warning mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Justification du retard/risque
                </h4>
                <textarea
                  value={formData.justificationRetard}
                  onChange={(e) => setFormData({ ...formData, justificationRetard: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-warning/30 rounded-lg focus:ring-2 focus:ring-warning/50 text-sm"
                  placeholder="Expliquer les raisons du retard ou du risque identifié..."
                />
              </div>
            )}

            {/* Actions correctives */}
            {(formData.statut === 'en_retard' || formData.statut === 'a_risque' || formData.ragStatus === 'red' || formData.ragStatus === 'amber') && (
              <div className="bg-info/5 border border-info/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-info mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Actions correctives
                </h4>
                <textarea
                  value={formData.actionsCorrectives}
                  onChange={(e) => setFormData({ ...formData, actionsCorrectives: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-info/30 rounded-lg focus:ring-2 focus:ring-info/50 text-sm"
                  placeholder="Décrire les actions correctives planifiées pour revenir sur la cible..."
                />
              </div>
            )}

            {/* Visibilité */}
            <div className="bg-primary-50 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.visible}
                  onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                  className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="font-medium text-primary-900">Visible sur Timeline/Gantt</span>
                  <p className="text-xs text-primary-500">Afficher ce jalon sur les vues planning</p>
                </div>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={jalon ? `Modifier le jalon ${jalon.code}` : 'Nouveau jalon'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-[70vh]">
        {/* Tabs navigation */}
        <div className="flex border-b border-primary-200 mb-4 overflow-x-auto">
          {modalTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-primary-500 hover:text-primary-700 hover:border-primary-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-1">
          {renderTabContent()}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-primary-200">
          <div className="text-xs text-primary-500">
            {jalon && jalon.createdAt && (
              <>
                Créé le {format(new Date(jalon.createdAt), 'dd/MM/yyyy', { locale: fr })}
                {jalon.updatedAt && jalon.updatedAt !== jalon.createdAt && (
                  <> • Modifié le {format(new Date(jalon.updatedAt), 'dd/MM/yyyy', { locale: fr })}</>
                )}
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} type="button">
              Annuler
            </Button>
            <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
              {jalon ? 'Enregistrer' : 'Créer le jalon'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// Composant Timeline
function Timeline({
  jalons,
  currentMonth,
  onJalonClick,
}: {
  jalons: Jalon[];
  currentMonth: Date;
  onJalonClick: (jalon: Jalon) => void;
}) {
  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(addMonths(currentMonth, 2));
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Regrouper les jalons par mois
  const months = [currentMonth, addMonths(currentMonth, 1), addMonths(currentMonth, 2)];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header des mois */}
        <div className="flex border-b border-primary-200">
          {months.map((month, i) => (
            <div key={i} className="flex-1 px-4 py-2 text-center font-medium text-primary-700 border-r last:border-r-0 border-primary-200">
              {format(month, 'MMMM yyyy', { locale: fr })}
            </div>
          ))}
        </div>

        {/* Ligne du temps */}
        <div className="relative h-4 bg-primary-100 flex">
          {months.map((_, i) => (
            <div key={i} className="flex-1 border-r last:border-r-0 border-primary-200" />
          ))}
          {/* Marqueur aujourd'hui */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-error z-10"
            style={{
              left: `${((new Date().getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100}%`,
            }}
          />
        </div>

        {/* Jalons sur la timeline */}
        <div className="relative py-4 min-h-[200px]">
          {jalons
            .filter((j) => {
              const jDate = new Date(j.dateCible);
              return isWithinInterval(jDate, { start: startDate, end: endDate });
            })
            .map((jalon, index) => {
              const jDate = new Date(jalon.dateCible);
              const position = ((jDate.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100;
              const colors = importanceColors[jalon.importance];
              const statutConfig = statutColors[jalon.statut];
              const IconComponent = statutConfig.icon;

              // Alterner les hauteurs pour éviter le chevauchement
              const row = index % 3;
              const topPosition = 20 + row * 60;

              return (
                <div
                  key={jalon.id}
                  className="absolute cursor-pointer group"
                  style={{ left: `${position}%`, top: `${topPosition}px`, transform: 'translateX(-50%)' }}
                  onClick={() => onJalonClick(jalon)}
                >
                  {/* Ligne verticale */}
                  <div className={`absolute left-1/2 -translate-x-1/2 w-0.5 -top-4 h-4 ${colors.bg}`} />

                  {/* Point du jalon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${colors.border} ${statutConfig.bg} group-hover:scale-110 transition-transform`}
                  >
                    <IconComponent className="w-5 h-5" style={{ color: statutConfig.color }} />
                  </div>

                  {/* Label */}
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-center">
                    <span className={`text-xs font-mono ${colors.text}`}>{jalon.code}</span>
                    <p className="text-xs text-primary-600 max-w-[100px] truncate">{jalon.titre}</p>
                  </div>

                  {/* Tooltip au hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-20">
                    <div className="bg-primary-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-[200px]">
                      <p className="font-medium">{jalon.titre}</p>
                      <p className="text-primary-300 mt-1">{format(jDate, 'dd MMMM yyyy', { locale: fr })}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export function ProjetJalons() {
  const { centreId } = useParams<{ centreId: string }>();
  const navigate = useNavigate();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const {
    projets,
    jalons,
    loadProjet,
    addJalon,
    updateJalon,
    deleteJalon,
  } = useProjetStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'gantt'>('gantt');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showImportCRModal, setShowImportCRModal] = useState(false);
  const [selectedJalon, setSelectedJalon] = useState<Jalon | undefined>();
  const [filterStatut, setFilterStatut] = useState<string>('all');

  // Calculer projet et jalons (avant le useMemo)
  const projet = projets.find((p) => p.centreId === centreId);
  const projetJalons = useMemo(() => {
    if (!projet) return [];
    return jalons
      .filter((j) => j.projetId === projet.id)
      .sort((a, b) => a.ordre - b.ordre);
  }, [jalons, projet]);

  const filteredJalons = useMemo(() => {
    if (filterStatut === 'all') return projetJalons;
    return projetJalons.filter((j) => j.statut === filterStatut);
  }, [projetJalons, filterStatut]);

  // Statistiques
  const stats = useMemo(() => ({
    total: projetJalons.length,
    atteints: projetJalons.filter((j) => j.statut === 'atteint').length,
    enRetard: projetJalons.filter((j) => j.statut === 'en_retard').length,
    aRisque: projetJalons.filter((j) => j.statut === 'a_risque').length,
    critiques: projetJalons.filter((j) => j.importance === 'critique' && j.statut !== 'atteint').length,
  }), [projetJalons]);

  // Membres d'équipe fictifs pour la démo
  const teamMembers = useMemo(() => [
    { id: 'user-1', name: 'Marie Dupont', avatar: undefined },
    { id: 'user-2', name: 'Jean Martin', avatar: undefined },
    { id: 'user-3', name: 'Sophie Bernard', avatar: undefined },
    { id: 'user-4', name: 'Pierre Durand', avatar: undefined },
    { id: 'user-5', name: 'Claire Petit', avatar: undefined },
  ], []);

  // Mapper le statut jalon vers le statut Gantt
  const mapStatus = (statut: StatutJalon): 'pending' | 'in_progress' | 'completed' | 'delayed' => {
    switch (statut) {
      case 'atteint': return 'completed';
      case 'en_cours': return 'in_progress';
      case 'en_retard': return 'delayed';
      case 'a_risque': return 'delayed';
      default: return 'pending';
    }
  };

  // Mapper l'importance vers la priorité Gantt
  const mapPriority = (importance: 'critique' | 'majeur' | 'normal'): 'low' | 'medium' | 'high' | 'critical' => {
    switch (importance) {
      case 'critique': return 'critical';
      case 'majeur': return 'high';
      default: return 'medium';
    }
  };

  // Génération des tâches Gantt - DOIT être avant les returns conditionnels
  const ganttTasks = useMemo((): GanttTask[] => {
    if (!projet || !centre) return [];

    const tasks: GanttTask[] = [];
    const projectStart = new Date(projet.dateDebut);
    const projectEnd = new Date(projet.dateFinStabilisation);

    // Couleurs pour les phases
    const phaseColors = {
      conception: '#22d3ee',    // cyan
      recrutement: '#a78bfa',   // violet
      commercial: '#fb923c',    // orange
      travaux: '#f472b6',       // pink
      lancement: '#4ade80',     // green
    };

    // Projet principal
    const projectProgress = Math.round((stats.atteints / stats.total) * 100) || 0;
    tasks.push({
      id: 'project',
      name: `${centre?.code || 'Projet'} - ${centre?.nom || 'Centre'}`,
      startDate: projectStart,
      endDate: projectEnd,
      progress: projectProgress,
      type: 'project',
      color: '#3b82f6',
      status: projectProgress === 100 ? 'completed' : 'in_progress',
    });

    // Phase 1: Conception & Setup
    const conceptionEnd = addDays(projectStart, 45);
    const conceptionJalons = projetJalons.filter(j =>
      new Date(j.dateCible) <= conceptionEnd && new Date(j.dateCible) >= projectStart
    );
    const conceptionProgress = conceptionJalons.length > 0
      ? Math.round((conceptionJalons.filter(j => j.statut === 'atteint').length / conceptionJalons.length) * 100)
      : 0;
    tasks.push({
      id: 'conception',
      name: 'Conception & Setup',
      startDate: projectStart,
      endDate: conceptionEnd,
      progress: conceptionProgress,
      parentId: 'project',
      type: 'group',
      color: phaseColors.conception,
      status: conceptionProgress === 100 ? 'completed' : 'in_progress',
    });

    // Phase 2: Recrutement
    const recrutementStart = addDays(projectStart, 30);
    const recrutementEnd = addDays(projectStart, 120);
    const recrutementJalons = projetJalons.filter(j =>
      new Date(j.dateCible) <= recrutementEnd && new Date(j.dateCible) >= recrutementStart
    );
    const recrutementProgress = recrutementJalons.length > 0
      ? Math.round((recrutementJalons.filter(j => j.statut === 'atteint').length / recrutementJalons.length) * 100)
      : 0;
    tasks.push({
      id: 'recrutement',
      name: 'Recrutement',
      startDate: recrutementStart,
      endDate: recrutementEnd,
      progress: recrutementProgress,
      parentId: 'project',
      type: 'group',
      color: phaseColors.recrutement,
      dependencies: ['conception'],
      status: recrutementProgress === 100 ? 'completed' : 'in_progress',
    });

    // Phase 3: Commercial
    const commercialStart = addDays(projectStart, 15);
    const commercialEnd = new Date(projet.dateSoftOpening);
    tasks.push({
      id: 'commercial',
      name: 'Commercial & Marketing',
      startDate: commercialStart,
      endDate: commercialEnd,
      progress: 60,
      parentId: 'project',
      type: 'group',
      color: phaseColors.commercial,
      status: 'in_progress',
    });

    // Phase 4: Travaux & Aménagement
    const travauxStart = addDays(projectStart, 60);
    const travauxEnd = addDays(new Date(projet.dateSoftOpening), -14);
    tasks.push({
      id: 'travaux',
      name: 'Travaux & Aménagement',
      startDate: travauxStart,
      endDate: travauxEnd,
      progress: 45,
      parentId: 'project',
      type: 'group',
      color: phaseColors.travaux,
      dependencies: ['conception'],
      status: 'in_progress',
    });

    // Phase 5: Lancement
    const lancementStart = addDays(new Date(projet.dateSoftOpening), -30);
    const lancementEnd = new Date(projet.dateInauguration);
    tasks.push({
      id: 'lancement',
      name: 'Lancement & Ouverture',
      startDate: lancementStart,
      endDate: lancementEnd,
      progress: 20,
      parentId: 'project',
      type: 'group',
      color: phaseColors.lancement,
      dependencies: ['travaux', 'recrutement'],
      status: 'pending',
    });

    // Ajouter les jalons comme tâches
    projetJalons.forEach((jalon, index) => {
      const jalonDate = new Date(jalon.dateCible);
      const jalonProgress = jalon.statut === 'atteint' ? 100 :
                           jalon.statut === 'en_cours' ? 50 :
                           jalon.statut === 'a_risque' ? 30 : 0;

      // Déterminer le parent basé sur la date
      let parentId = 'project';
      if (jalonDate <= conceptionEnd) parentId = 'conception';
      else if (jalonDate >= recrutementStart && jalonDate <= recrutementEnd) parentId = 'recrutement';
      else if (jalonDate >= commercialStart && jalonDate <= commercialEnd) parentId = 'commercial';
      else if (jalonDate >= travauxStart && jalonDate <= travauxEnd) parentId = 'travaux';
      else if (jalonDate >= lancementStart) parentId = 'lancement';

      // Couleur par importance
      const color = jalon.importance === 'critique' ? '#ef4444' :
                   jalon.importance === 'majeur' ? '#f59e0b' :
                   tasks.find(t => t.id === parentId)?.color || '#3b82f6';

      // Assigner un membre d'équipe (rotation pour la démo)
      const assignee = teamMembers[index % teamMembers.length];

      tasks.push({
        id: jalon.id,
        name: `${jalon.code} - ${jalon.titre}`,
        startDate: addDays(jalonDate, -7),
        endDate: jalonDate,
        progress: jalonProgress,
        parentId,
        type: jalon.importance === 'critique' ? 'milestone' : 'task',
        color,
        // Nouvelles propriétés
        dependencies: jalon.dependances.length > 0 ? jalon.dependances : undefined,
        assignee,
        priority: mapPriority(jalon.importance),
        status: mapStatus(jalon.statut),
      });
    });

    // Ajouter des tâches de conception avec assignees et dépendances
    tasks.push({
      id: 'conception-etude',
      name: 'Étude de marché',
      startDate: projectStart,
      endDate: addDays(projectStart, 21),
      progress: 100,
      parentId: 'conception',
      type: 'task',
      color: phaseColors.conception,
      assignee: teamMembers[0],
      status: 'completed',
      priority: 'high',
    });
    tasks.push({
      id: 'conception-plans',
      name: 'Plans d\'aménagement',
      startDate: addDays(projectStart, 14),
      endDate: addDays(projectStart, 35),
      progress: 85,
      parentId: 'conception',
      type: 'task',
      color: phaseColors.conception,
      dependencies: ['conception-etude'],
      assignee: teamMembers[1],
      status: 'in_progress',
      priority: 'high',
    });
    tasks.push({
      id: 'conception-budget',
      name: 'Validation budget',
      startDate: addDays(projectStart, 28),
      endDate: addDays(projectStart, 42),
      progress: 60,
      parentId: 'conception',
      type: 'task',
      color: phaseColors.conception,
      dependencies: ['conception-plans'],
      assignee: teamMembers[2],
      status: 'in_progress',
      priority: 'critical',
    });

    // Ajouter des tâches de recrutement avec assignees et dépendances
    tasks.push({
      id: 'recrutement-direction',
      name: 'Recrutement Direction',
      startDate: recrutementStart,
      endDate: addDays(recrutementStart, 45),
      progress: 100,
      parentId: 'recrutement',
      type: 'task',
      color: phaseColors.recrutement,
      assignee: teamMembers[3],
      status: 'completed',
      priority: 'critical',
    });
    tasks.push({
      id: 'recrutement-equipe',
      name: 'Recrutement Équipe',
      startDate: addDays(recrutementStart, 30),
      endDate: addDays(recrutementStart, 75),
      progress: 70,
      parentId: 'recrutement',
      type: 'task',
      color: phaseColors.recrutement,
      dependencies: ['recrutement-direction'],
      assignee: teamMembers[4],
      status: 'in_progress',
      priority: 'high',
    });
    tasks.push({
      id: 'recrutement-formation',
      name: 'Formation',
      startDate: addDays(recrutementStart, 60),
      endDate: recrutementEnd,
      progress: 30,
      parentId: 'recrutement',
      type: 'task',
      color: phaseColors.recrutement,
      dependencies: ['recrutement-equipe'],
      assignee: teamMembers[0],
      status: 'in_progress',
      priority: 'medium',
    });

    // Ajouter des tâches commerciales avec assignees et dépendances
    tasks.push({
      id: 'commercial-prospection',
      name: 'Prospection enseignes',
      startDate: commercialStart,
      endDate: addDays(commercialStart, 60),
      progress: 90,
      parentId: 'commercial',
      type: 'task',
      color: phaseColors.commercial,
      assignee: teamMembers[1],
      status: 'in_progress',
      priority: 'high',
    });
    tasks.push({
      id: 'commercial-negociation',
      name: 'Négociations baux',
      startDate: addDays(commercialStart, 30),
      endDate: addDays(commercialStart, 120),
      progress: 65,
      parentId: 'commercial',
      type: 'task',
      color: phaseColors.commercial,
      dependencies: ['commercial-prospection'],
      assignee: teamMembers[2],
      status: 'in_progress',
      priority: 'critical',
    });
    tasks.push({
      id: 'commercial-marketing',
      name: 'Plan marketing lancement',
      startDate: addDays(commercialStart, 90),
      endDate: commercialEnd,
      progress: 40,
      parentId: 'commercial',
      type: 'task',
      color: phaseColors.commercial,
      dependencies: ['commercial-negociation'],
      assignee: teamMembers[3],
      status: 'in_progress',
      priority: 'medium',
    });

    // Ajouter des tâches travaux avec assignees et dépendances
    tasks.push({
      id: 'travaux-gros-oeuvre',
      name: 'Gros œuvre',
      startDate: travauxStart,
      endDate: addDays(travauxStart, 60),
      progress: 100,
      parentId: 'travaux',
      type: 'task',
      color: phaseColors.travaux,
      assignee: teamMembers[4],
      status: 'completed',
      priority: 'critical',
    });
    tasks.push({
      id: 'travaux-second-oeuvre',
      name: 'Second œuvre',
      startDate: addDays(travauxStart, 45),
      endDate: addDays(travauxStart, 90),
      progress: 55,
      parentId: 'travaux',
      type: 'task',
      color: phaseColors.travaux,
      dependencies: ['travaux-gros-oeuvre'],
      assignee: teamMembers[0],
      status: 'in_progress',
      priority: 'high',
    });
    tasks.push({
      id: 'travaux-finitions',
      name: 'Finitions & Aménagement',
      startDate: addDays(travauxStart, 75),
      endDate: travauxEnd,
      progress: 20,
      parentId: 'travaux',
      type: 'task',
      color: phaseColors.travaux,
      dependencies: ['travaux-second-oeuvre'],
      assignee: teamMembers[1],
      status: 'in_progress',
      priority: 'high',
    });

    // Ajouter des tâches lancement avec assignees et dépendances
    tasks.push({
      id: 'lancement-tests',
      name: 'Tests & Recette',
      startDate: lancementStart,
      endDate: addDays(lancementStart, 14),
      progress: 0,
      parentId: 'lancement',
      type: 'task',
      color: phaseColors.lancement,
      dependencies: ['travaux-finitions'],
      assignee: teamMembers[2],
      status: 'pending',
      priority: 'critical',
    });
    tasks.push({
      id: 'lancement-soft',
      name: 'Soft Opening',
      startDate: new Date(projet.dateSoftOpening),
      endDate: addDays(new Date(projet.dateSoftOpening), 7),
      progress: 0,
      parentId: 'lancement',
      type: 'milestone',
      color: '#f59e0b',
      dependencies: ['lancement-tests'],
      assignee: teamMembers[3],
      status: 'pending',
      priority: 'critical',
    });
    tasks.push({
      id: 'lancement-inauguration',
      name: 'Inauguration',
      startDate: addDays(new Date(projet.dateInauguration), -3),
      endDate: new Date(projet.dateInauguration),
      progress: 0,
      parentId: 'lancement',
      type: 'milestone',
      color: '#22c55e',
      dependencies: ['lancement-soft'],
      assignee: teamMembers[4],
      status: 'pending',
      priority: 'critical',
    });

    return tasks;
  }, [projet, projetJalons, stats, centre, teamMembers]);

  // Handler pour la mise à jour des tâches via drag & drop
  const handleTaskUpdate = async (taskId: string, updates: Partial<GanttTask>) => {
    // Vérifier si c'est un jalon
    const jalon = projetJalons.find(j => j.id === taskId);
    if (jalon && updates.endDate) {
      // Mettre à jour la date cible du jalon
      await updateJalon(taskId, {
        dateCible: updates.endDate.toISOString(),
      });
    }
    // Note: Pour les tâches fictives (non-jalons), on pourrait ajouter
    // une persistance locale ou simplement ignorer
  };

  // useEffect APRÈS tous les useMemo
  useEffect(() => {
    if (centreId) {
      loadProjet(centreId);
    }
  }, [centreId, loadProjet]);

  // Returns conditionnels APRÈS tous les hooks
  if (!centre) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-primary-500">Centre non trouvé</p>
      </div>
    );
  }

  if (!projet) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-primary-500">Projet non initialisé</p>
      </div>
    );
  }

  const handleSave = async (data: Partial<Jalon>) => {
    if (selectedJalon) {
      await updateJalon(selectedJalon.id, data);
    } else {
      await addJalon({
        ...data,
        projetId: projet.id,
        dependances: [],
        ordre: projetJalons.length + 1,
      } as any);
    }
    setSelectedJalon(undefined);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer ce jalon ?')) {
      await deleteJalon(id);
    }
  };

  const openEditModal = (jalon: Jalon) => {
    setSelectedJalon(jalon);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedJalon(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/centre/${centreId}/projet`)}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-primary-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Jalons & Planning</h1>
            <p className="text-primary-500">{centre.nom}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-primary-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'gantt' ? 'bg-white shadow text-primary-900' : 'text-primary-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Gantt
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'timeline' ? 'bg-white shadow text-primary-900' : 'text-primary-600'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-white shadow text-primary-900' : 'text-primary-600'
              }`}
            >
              <List className="w-4 h-4" />
              Liste
            </button>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowImportCRModal(true)}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Import CR Chantier
          </Button>
          <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            Nouveau jalon
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-900">{stats.atteints}/{stats.total}</p>
              <p className="text-xs text-primary-500">Jalons atteints</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-error">{stats.enRetard}</p>
              <p className="text-xs text-primary-500">En retard</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{stats.aRisque}</p>
              <p className="text-xs text-primary-500">À risque</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-error">{stats.critiques}</p>
              <p className="text-xs text-primary-500">Critiques restants</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{Math.round((stats.atteints / stats.total) * 100) || 0}%</p>
              <p className="text-xs text-primary-500">Progression</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vue Gantt - Style TeamGantt */}
      {viewMode === 'gantt' && (
        <TeamGanttView
          projectName={`${centre.code} - ${centre.nom}`}
          tasks={ganttTasks}
          onTaskClick={(task) => {
            // Ne rien faire pour les groupes/projets
            if (task.type === 'group' || task.type === 'project') {
              return;
            }
            // Chercher le jalon correspondant
            const jalon = projetJalons.find(j => j.id === task.id);
            if (jalon) {
              openEditModal(jalon);
            }
            // Pour les tâches de démonstration (IDs comme 'conception-etude'),
            // on ne fait rien car ce sont des exemples
          }}
          onTaskUpdate={handleTaskUpdate}
          sidebarItems={[
            { id: centre.id, name: centre.nom, type: 'project' },
          ]}
        />
      )}

      {/* Vue Timeline */}
      {viewMode === 'timeline' && (
        <Card>
          <CardHeader
            action={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                  className="p-1.5 hover:bg-primary-100 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium px-2">
                  {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </span>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 hover:bg-primary-100 rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            }
          >
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Timeline des jalons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline
              jalons={projetJalons}
              currentMonth={currentMonth}
              onJalonClick={openEditModal}
            />
          </CardContent>
        </Card>
      )}

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader
            action={
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-3 py-1.5 text-sm border border-primary-300 rounded-lg"
              >
                <option value="all">Tous les statuts</option>
                <option value="a_venir">À venir</option>
                <option value="en_cours">En cours</option>
                <option value="a_risque">À risque</option>
                <option value="en_retard">En retard</option>
                <option value="atteint">Atteint</option>
              </select>
            }
          >
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Liste des jalons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredJalons.map((jalon) => {
                const colors = importanceColors[jalon.importance];
                const statutConfig = statutColors[jalon.statut];
                const IconComponent = statutConfig.icon;
                const daysUntil = differenceInDays(new Date(jalon.dateCible), new Date());

                return (
                  <div
                    key={jalon.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${colors.border} ${colors.bg}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${statutConfig.bg}`}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: statutConfig.color }} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-mono text-sm ${colors.text}`}>{jalon.code}</span>
                        <Badge
                          variant={jalon.importance === 'critique' ? 'error' : jalon.importance === 'majeur' ? 'warning' : 'default'}
                        >
                          {jalon.importance}
                        </Badge>
                        <Badge
                          variant={
                            jalon.statut === 'atteint' ? 'success' :
                            jalon.statut === 'en_retard' ? 'error' :
                            jalon.statut === 'a_risque' ? 'warning' :
                            jalon.statut === 'en_cours' ? 'info' : 'default'
                          }
                        >
                          {jalon.statut.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="font-medium text-primary-900">{jalon.titre}</p>
                      {jalon.description && (
                        <p className="text-sm text-primary-600 mt-1">{jalon.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-primary-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(jalon.dateCible), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        {jalon.statut !== 'atteint' && (
                          <span className={`flex items-center gap-1 ${daysUntil < 0 ? 'text-error' : daysUntil <= 7 ? 'text-warning' : ''}`}>
                            <Clock className="w-3 h-3" />
                            {daysUntil < 0 ? `${Math.abs(daysUntil)}j de retard` : `J-${daysUntil}`}
                          </span>
                        )}
                        {jalon.dependances.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Link2 className="w-3 h-3" />
                            {jalon.dependances.length} dépendance(s)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(jalon)}
                        className="p-2 hover:bg-primary-200 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-primary-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(jalon.id)}
                        className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-error" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredJalons.length === 0 && (
                <div className="text-center py-12">
                  <Flag className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                  <p className="text-primary-500">Aucun jalon trouvé</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dates clés du projet */}
      <Card>
        <CardHeader>
          <CardTitle>Dates clés du projet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary-50 rounded-xl">
              <p className="text-xs text-primary-500 mb-1">Début du projet</p>
              <p className="font-semibold text-primary-900">
                {format(new Date(projet.dateDebut), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            <div className="p-4 bg-warning/10 rounded-xl border border-warning/20">
              <p className="text-xs text-warning mb-1">Soft Opening</p>
              <p className="font-semibold text-primary-900">
                {format(new Date(projet.dateSoftOpening), 'dd MMMM yyyy', { locale: fr })}
              </p>
              <p className="text-xs text-warning mt-1">
                J-{differenceInDays(new Date(projet.dateSoftOpening), new Date())}
              </p>
            </div>
            <div className="p-4 bg-success/10 rounded-xl border border-success/20">
              <p className="text-xs text-success mb-1">Inauguration</p>
              <p className="font-semibold text-primary-900">
                {format(new Date(projet.dateInauguration), 'dd MMMM yyyy', { locale: fr })}
              </p>
              <p className="text-xs text-success mt-1">
                J-{differenceInDays(new Date(projet.dateInauguration), new Date())}
              </p>
            </div>
            <div className="p-4 bg-info/10 rounded-xl border border-info/20">
              <p className="text-xs text-info mb-1">Fin stabilisation</p>
              <p className="font-semibold text-primary-900">
                {format(new Date(projet.dateFinStabilisation), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <JalonModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJalon(undefined);
        }}
        jalon={selectedJalon}
        projetId={projet.id}
        onSave={handleSave}
        allJalons={projetJalons}
        teamMembers={teamMembers}
      />

      {/* Modal Import CR Chantier */}
      <ImportCRChantierModal
        isOpen={showImportCRModal}
        onClose={() => setShowImportCRModal(false)}
        centreId={centreId || ''}
      />
    </div>
  );
}
