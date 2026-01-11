import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Plus,
  Filter,
  List,
  LayoutGrid,
  Calendar as CalendarIcon,
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Search,
  GripVertical,
  Columns3,
  CalendarDays,
  Target,
  Users,
  DollarSign,
  AlertTriangle,
  CheckSquare,
  X,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Modal,
  ConfirmModal,
  Input,
  Select,
  Textarea,
  StatutActionBadge,
  PrioriteBadge,
} from '../components/ui';
import { useActionsStore, useAxesStore, useAppStore, useCentresStore } from '../store';
import type { PlanAction, StatutAction, PrioriteAction, SousAction, Risque, Budget } from '../types';
import {
  format,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';

type ViewMode = 'list' | 'kanban' | 'calendar' | 'cards';

// Couleurs par priorité
const prioriteColors: Record<PrioriteAction, string> = {
  critique: 'bg-error',
  haute: 'bg-warning',
  moyenne: 'bg-info',
  basse: 'bg-success',
};

const prioriteBorderColors: Record<PrioriteAction, string> = {
  critique: 'border-l-error',
  haute: 'border-l-warning',
  moyenne: 'border-l-info',
  basse: 'border-l-success',
};

export function Actions() {
  const { centreId } = useParams<{ centreId: string }>();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const { addToast } = useAppStore();
  const { axes, loadAxes, getAxesByCentre, objectifs, loadObjectifs, getObjectifsByCentre, getObjectifsByAxe } = useAxesStore();
  const {
    actions,
    loadActions,
    getActionsByCentre,
    addAction,
    updateAction,
    deleteAction,
    changerStatut,
  } = useActionsStore();

  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<PlanAction | null>(null);
  const [filterAxe, setFilterAxe] = useState<string>('all');
  const [filterPriorite, setFilterPriorite] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedAction, setDraggedAction] = useState<PlanAction | null>(null);

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    axeId: '',
    objectifId: '',
    priorite: 'moyenne' as PrioriteAction,
    statut: 'a_faire' as StatutAction,
    responsableId: '',
    contributeurs: [] as string[],
    dateDebut: format(new Date(), 'yyyy-MM-dd'),
    dateEcheance: '',
    dateRealisation: '',
    avancement: 0,
    budget: { prevu: 0, consomme: 0, devise: 'XOF' } as Budget,
    sousActions: [] as SousAction[],
    risques: [] as Risque[],
  });

  const [formTab, setFormTab] = useState<'general' | 'planning' | 'budget' | 'tasks' | 'risks'>('general');
  const [newContributeur, setNewContributeur] = useState('');
  const [newSousAction, setNewSousAction] = useState('');
  const [newRisque, setNewRisque] = useState({ description: '', probabilite: 'moyenne' as const, impact: 'moyen' as const, mitigation: '' });

  useEffect(() => {
    if (centreId) {
      loadAxes(centreId);
      loadObjectifs(centreId);
      loadActions(centreId);
    }
  }, [centreId]);

  const centreAxes = getAxesByCentre(centreId || '');
  const centreActions = getActionsByCentre(centreId || '');
  const centreObjectifs = getObjectifsByCentre(centreId || '');

  // Objectifs filtrés par axe sélectionné
  const objectifsForSelectedAxe = formData.axeId
    ? getObjectifsByAxe(formData.axeId)
    : centreObjectifs;

  // Filtrage des actions
  const filteredActions = useMemo(() => {
    return centreActions.filter((action) => {
      if (filterAxe !== 'all' && action.axeId !== filterAxe) return false;
      if (filterPriorite !== 'all' && action.priorite !== filterPriorite) return false;
      if (filterStatut !== 'all' && action.statut !== filterStatut) return false;
      if (searchQuery && !action.titre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [centreActions, filterAxe, filterPriorite, filterStatut, searchQuery]);

  // Actions non planifiées (sans date d'échéance)
  const unscheduledActions = filteredActions.filter(
    (a) => !a.dateEcheance && a.statut !== 'termine' && a.statut !== 'annule'
  );

  // Groupement par statut pour le Kanban
  const actionsByStatut: Record<StatutAction, PlanAction[]> = {
    a_faire: filteredActions.filter((a) => a.statut === 'a_faire'),
    en_cours: filteredActions.filter((a) => a.statut === 'en_cours'),
    en_attente: filteredActions.filter((a) => a.statut === 'en_attente'),
    termine: filteredActions.filter((a) => a.statut === 'termine'),
    annule: filteredActions.filter((a) => a.statut === 'annule'),
  };

  const statutLabels: Record<StatutAction, string> = {
    a_faire: 'À faire',
    en_cours: 'En cours',
    en_attente: 'En attente',
    termine: 'Terminé',
    annule: 'Annulé',
  };

  const statutColors: Record<StatutAction, string> = {
    a_faire: 'bg-primary-100 border-primary-300',
    en_cours: 'bg-info/10 border-info/30',
    en_attente: 'bg-warning/10 border-warning/30',
    termine: 'bg-success/10 border-success/30',
    annule: 'bg-error/10 border-error/30',
  };

  // Jours du calendrier
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Actions par jour
  const actionsByDay = useMemo(() => {
    const map: Record<string, PlanAction[]> = {};
    filteredActions.forEach((action) => {
      if (action.dateEcheance) {
        const key = format(new Date(action.dateEcheance), 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(action);
      }
    });
    return map;
  }, [filteredActions]);

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      axeId: '',
      objectifId: '',
      priorite: 'moyenne',
      statut: 'a_faire',
      responsableId: '',
      contributeurs: [],
      dateDebut: format(new Date(), 'yyyy-MM-dd'),
      dateEcheance: '',
      dateRealisation: '',
      avancement: 0,
      budget: { prevu: 0, consomme: 0, devise: 'EUR' },
      sousActions: [],
      risques: [],
    });
    setSelectedAction(null);
    setFormTab('general');
    setNewContributeur('');
    setNewSousAction('');
    setNewRisque({ description: '', probabilite: 'moyenne', impact: 'moyen', mitigation: '' });
  };

  const handleOpenModal = (action?: PlanAction) => {
    if (action) {
      setSelectedAction(action);
      setFormData({
        titre: action.titre,
        description: action.description,
        axeId: action.axeId || '',
        objectifId: action.objectifId || '',
        priorite: action.priorite,
        statut: action.statut,
        responsableId: action.responsableId || '',
        contributeurs: action.contributeurs || [],
        dateDebut: action.dateDebut,
        dateEcheance: action.dateEcheance,
        dateRealisation: action.dateRealisation || '',
        avancement: action.avancement,
        budget: action.budget || { prevu: 0, consomme: 0, devise: 'EUR' },
        sousActions: action.sousActions || [],
        risques: action.risques || [],
      });
    } else {
      resetForm();
    }
    setFormTab('general');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!centreId) return;

    if (!formData.titre.trim()) {
      addToast({ type: 'error', title: 'Erreur', message: 'Le titre est obligatoire' });
      return;
    }

    try {
      const actionData = {
        ...formData,
        centreId,
        commentaires: selectedAction?.commentaires || [],
      };

      if (selectedAction) {
        await updateAction(selectedAction.id, actionData);
        addToast({ type: 'success', title: 'Action modifiée' });
      } else {
        await addAction(actionData);
        addToast({ type: 'success', title: 'Action créée' });
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  // Helpers pour les sous-actions
  const addSousAction = () => {
    if (!newSousAction.trim()) return;
    const sousAction: SousAction = {
      id: uuidv4(),
      description: newSousAction,
      statut: 'a_faire',
      echeance: formData.dateEcheance || '',
      avancement: 0,
    };
    setFormData({ ...formData, sousActions: [...formData.sousActions, sousAction] });
    setNewSousAction('');
  };

  const removeSousAction = (id: string) => {
    setFormData({ ...formData, sousActions: formData.sousActions.filter((sa) => sa.id !== id) });
  };

  const toggleSousAction = (id: string) => {
    setFormData({
      ...formData,
      sousActions: formData.sousActions.map((sa) =>
        sa.id === id
          ? { ...sa, statut: sa.statut === 'termine' ? 'a_faire' : 'termine', avancement: sa.statut === 'termine' ? 0 : 100 }
          : sa
      ),
    });
  };

  // Helpers pour les contributeurs
  const addContributeur = () => {
    if (!newContributeur.trim() || formData.contributeurs.includes(newContributeur.trim())) return;
    setFormData({ ...formData, contributeurs: [...formData.contributeurs, newContributeur.trim()] });
    setNewContributeur('');
  };

  const removeContributeur = (name: string) => {
    setFormData({ ...formData, contributeurs: formData.contributeurs.filter((c) => c !== name) });
  };

  // Helpers pour les risques
  const addRisque = () => {
    if (!newRisque.description.trim()) return;
    const risque: Risque = {
      id: uuidv4(),
      ...newRisque,
    };
    setFormData({ ...formData, risques: [...formData.risques, risque] });
    setNewRisque({ description: '', probabilite: 'moyenne', impact: 'moyen', mitigation: '' });
  };

  const removeRisque = (id: string) => {
    setFormData({ ...formData, risques: formData.risques.filter((r) => r.id !== id) });
  };

  // Calcul automatique de l'avancement basé sur les sous-actions
  useEffect(() => {
    if (formData.sousActions.length > 0) {
      const total = formData.sousActions.length;
      const completed = formData.sousActions.filter((sa) => sa.statut === 'termine').length;
      const newAvancement = Math.round((completed / total) * 100);
      if (newAvancement !== formData.avancement) {
        setFormData((prev) => ({ ...prev, avancement: newAvancement }));
      }
    }
  }, [formData.sousActions]);

  const handleDelete = async () => {
    if (!selectedAction) return;

    try {
      await deleteAction(selectedAction.id);
      addToast({ type: 'success', title: 'Action supprimée' });
      setIsDeleteModalOpen(false);
      setSelectedAction(null);
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  // Drag & Drop pour Kanban
  const handleDragStartKanban = (e: React.DragEvent, action: PlanAction) => {
    e.dataTransfer.setData('actionId', action.id);
    e.dataTransfer.setData('dragType', 'kanban');
    setDraggedAction(action);
  };

  const handleDropKanban = async (e: React.DragEvent, newStatut: StatutAction) => {
    e.preventDefault();
    const actionId = e.dataTransfer.getData('actionId');
    const dragType = e.dataTransfer.getData('dragType');
    if (actionId && dragType === 'kanban') {
      await changerStatut(actionId, newStatut);
      addToast({ type: 'success', title: 'Statut mis à jour' });
    }
    setDraggedAction(null);
  };

  // Drag & Drop pour Calendrier
  const handleDragStartCalendar = (e: React.DragEvent, action: PlanAction) => {
    e.dataTransfer.setData('actionId', action.id);
    e.dataTransfer.setData('dragType', 'calendar');
    setDraggedAction(action);
  };

  const handleDropCalendar = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const actionId = e.dataTransfer.getData('actionId');
    const dragType = e.dataTransfer.getData('dragType');
    if (actionId && (dragType === 'calendar' || dragType === 'unscheduled')) {
      await updateAction(actionId, { dateEcheance: format(date, 'yyyy-MM-dd') });
      addToast({ type: 'success', title: 'Date mise à jour' });
    }
    setDraggedAction(null);
  };

  // Drag & Drop pour actions non planifiées
  const handleDragStartUnscheduled = (e: React.DragEvent, action: PlanAction) => {
    e.dataTransfer.setData('actionId', action.id);
    e.dataTransfer.setData('dragType', 'unscheduled');
    setDraggedAction(action);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const prioriteOptions = [
    { value: 'critique', label: 'Critique' },
    { value: 'haute', label: 'Haute' },
    { value: 'moyenne', label: 'Moyenne' },
    { value: 'basse', label: 'Basse' },
  ];

  const statutOptions = [
    { value: 'a_faire', label: 'À faire' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'termine', label: 'Terminé' },
    { value: 'annule', label: 'Annulé' },
  ];

  const axeOptions = [
    { value: '', label: 'Aucun axe' },
    ...centreAxes.map((axe) => ({ value: axe.id, label: axe.nom })),
  ];

  // Composant carte d'action compacte pour le calendrier
  const CalendarActionCard = ({ action, mini = false }: { action: PlanAction; mini?: boolean }) => {
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStartCalendar(e, action)}
        onClick={() => handleOpenModal(action)}
        className={`group cursor-pointer px-2 py-1 rounded text-xs border-l-2 ${prioriteBorderColors[action.priorite]} bg-white hover:shadow-sm transition-all mb-1 truncate`}
      >
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${prioriteColors[action.priorite]}`} />
          <span className="truncate font-medium text-primary-900">{action.titre}</span>
        </div>
      </div>
    );
  };

  // Composant carte d'action pour le Kanban
  const KanbanActionCard = ({ action }: { action: PlanAction }) => {
    const isOverdue =
      action.statut !== 'termine' &&
      action.statut !== 'annule' &&
      action.dateEcheance &&
      new Date(action.dateEcheance) < new Date();
    const daysLeft = action.dateEcheance
      ? differenceInDays(new Date(action.dateEcheance), new Date())
      : null;
    const axe = centreAxes.find((a) => a.id === action.axeId);

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStartKanban(e, action)}
        className={`bg-white p-3 rounded-lg border-l-4 shadow-sm cursor-move hover:shadow-md transition-all ${
          prioriteBorderColors[action.priorite]
        } ${isOverdue ? 'ring-1 ring-error/30' : ''}`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-primary-900 text-sm line-clamp-2">{action.titre}</h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(action);
            }}
            className="p-1 hover:bg-primary-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-primary-400" />
          </button>
        </div>

        {action.description && (
          <p className="text-xs text-primary-500 mb-2 line-clamp-2">{action.description}</p>
        )}

        <div className="flex flex-wrap gap-1 mb-2">
          <PrioriteBadge priorite={action.priorite} />
          {axe && (
            <Badge size="sm">
              <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: axe.couleur }} />
              {axe.code}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          {action.dateEcheance && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-error' : 'text-primary-500'}`}>
              <CalendarIcon className="w-3 h-3" />
              {format(new Date(action.dateEcheance), 'dd/MM')}
            </div>
          )}
          <div className="flex items-center gap-1 text-primary-500">
            <div className="w-12 h-1 bg-primary-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-700 rounded-full"
                style={{ width: `${action.avancement}%` }}
              />
            </div>
            <span>{action.avancement}%</span>
          </div>
        </div>
      </div>
    );
  };

  // Composant carte pour vue Cartes
  const LargeActionCard = ({ action }: { action: PlanAction }) => {
    const isOverdue =
      action.statut !== 'termine' &&
      action.statut !== 'annule' &&
      action.dateEcheance &&
      new Date(action.dateEcheance) < new Date();
    const daysLeft = action.dateEcheance
      ? differenceInDays(new Date(action.dateEcheance), new Date())
      : null;
    const axe = centreAxes.find((a) => a.id === action.axeId);

    return (
      <div
        className={`bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer ${
          isOverdue ? 'border-error/30' : 'border-primary-200'
        }`}
        onClick={() => handleOpenModal(action)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${prioriteColors[action.priorite]}`} />
            <StatutActionBadge statut={action.statut} />
          </div>
          {axe && (
            <Badge size="sm" style={{ backgroundColor: `${axe.couleur}20`, color: axe.couleur }}>
              {axe.code}
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-primary-900 mb-2">{action.titre}</h3>

        {action.description && (
          <p className="text-sm text-primary-600 mb-3 line-clamp-2">{action.description}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4 text-sm text-primary-500">
            {action.dateDebut && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {format(new Date(action.dateDebut), 'dd/MM')}
              </span>
            )}
            {action.dateEcheance && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-error font-medium' : ''}`}>
                <Clock className="w-4 h-4" />
                {format(new Date(action.dateEcheance), 'dd/MM')}
                {isOverdue && <span className="ml-1">(En retard)</span>}
                {!isOverdue && daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 && (
                  <span className="ml-1 text-warning">J-{daysLeft}</span>
                )}
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-primary-500 mb-1">
            <span>Avancement</span>
            <span className="font-medium">{action.avancement}%</span>
          </div>
          <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                action.avancement === 100 ? 'bg-success' : 'bg-primary-700'
              }`}
              style={{ width: `${action.avancement}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-180px)]">
      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Plans d'actions</h1>
            <p className="text-primary-500 mt-1">{centre?.nom}</p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
            Nouvelle action
          </Button>
        </div>

        {/* Filtres et vues */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 border border-primary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filtres */}
          <Select
            options={[
              { value: 'all', label: 'Tous les axes' },
              ...centreAxes.map((a) => ({ value: a.id, label: a.nom })),
            ]}
            value={filterAxe}
            onChange={(e) => setFilterAxe(e.target.value)}
            className="w-36"
          />
          <Select
            options={[{ value: 'all', label: 'Toutes priorités' }, ...prioriteOptions]}
            value={filterPriorite}
            onChange={(e) => setFilterPriorite(e.target.value)}
            className="w-36"
          />
          <Select
            options={[{ value: 'all', label: 'Tous statuts' }, ...statutOptions]}
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="w-36"
          />

          {/* Sélecteur de vue */}
          <div className="flex border border-primary-200 rounded-lg overflow-hidden ml-auto">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 flex items-center gap-1 text-sm ${
                viewMode === 'calendar' ? 'bg-primary-900 text-white' : 'bg-white text-primary-600 hover:bg-primary-50'
              }`}
              title="Vue Calendrier"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 flex items-center gap-1 text-sm ${
                viewMode === 'kanban' ? 'bg-primary-900 text-white' : 'bg-white text-primary-600 hover:bg-primary-50'
              }`}
              title="Vue Kanban"
            >
              <Columns3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 flex items-center gap-1 text-sm ${
                viewMode === 'cards' ? 'bg-primary-900 text-white' : 'bg-white text-primary-600 hover:bg-primary-50'
              }`}
              title="Vue Cartes"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 flex items-center gap-1 text-sm ${
                viewMode === 'list' ? 'bg-primary-900 text-white' : 'bg-white text-primary-600 hover:bg-primary-50'
              }`}
              title="Vue Liste"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Vue Calendrier */}
        {viewMode === 'calendar' && (
          <div className="flex-1 bg-white rounded-xl border border-primary-200 overflow-hidden flex flex-col">
            {/* Header du calendrier */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 hover:bg-primary-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5 text-primary-600" />
                </button>
                <h2 className="text-lg font-semibold text-primary-900 w-40 text-center">
                  {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </h2>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 hover:bg-primary-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5 text-primary-600" />
                </button>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setCurrentMonth(new Date())}>
                Aujourd'hui
              </Button>
            </div>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 border-b border-primary-200">
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, i) => (
                <div
                  key={day}
                  className={`py-2 text-center text-sm font-medium ${
                    i === 0 || i === 6 ? 'text-primary-400' : 'text-primary-600'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grille du calendrier */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-auto">
              {calendarDays.map((day, index) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const dayActions = actionsByDay[dayKey] || [];
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);
                const isWeekend = getDay(day) === 0 || getDay(day) === 6;

                return (
                  <div
                    key={index}
                    className={`border-b border-r border-primary-100 p-1 min-h-[100px] ${
                      !isCurrentMonth ? 'bg-primary-50/50' : isWeekend ? 'bg-primary-50/30' : 'bg-white'
                    }`}
                    onDrop={(e) => handleDropCalendar(e, day)}
                    onDragOver={handleDragOver}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                          isCurrentDay
                            ? 'bg-primary-900 text-white'
                            : !isCurrentMonth
                            ? 'text-primary-300'
                            : 'text-primary-700'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayActions.length > 0 && (
                        <button
                          onClick={() => handleOpenModal()}
                          className="p-0.5 hover:bg-primary-100 rounded text-primary-400 hover:text-primary-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      {dayActions.slice(0, 3).map((action) => (
                        <CalendarActionCard key={action.id} action={action} />
                      ))}
                      {dayActions.length > 3 && (
                        <button className="text-xs text-primary-500 hover:text-primary-700 w-full text-left px-2">
                          +{dayActions.length - 3} autres
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vue Kanban */}
        {viewMode === 'kanban' && (
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 h-full min-w-[1000px]">
              {(['a_faire', 'en_cours', 'en_attente', 'termine', 'annule'] as StatutAction[]).map(
                (statut) => (
                  <div
                    key={statut}
                    className={`flex-1 rounded-xl p-3 min-w-[200px] flex flex-col ${statutColors[statut]}`}
                    onDrop={(e) => handleDropKanban(e, statut)}
                    onDragOver={handleDragOver}
                  >
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="font-semibold text-primary-900 text-sm">{statutLabels[statut]}</h3>
                      <Badge size="sm">{actionsByStatut[statut].length}</Badge>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto">
                      {actionsByStatut[statut].map((action) => (
                        <KanbanActionCard key={action.id} action={action} />
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Vue Cartes */}
        {viewMode === 'cards' && (
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredActions.map((action) => (
                <LargeActionCard key={action.id} action={action} />
              ))}
              {filteredActions.length === 0 && (
                <div className="col-span-full text-center py-12 text-primary-500">
                  Aucune action trouvée
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vue Liste */}
        {viewMode === 'list' && (
          <div className="flex-1 overflow-auto">
            <Card className="h-full">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-primary-50 sticky top-0">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700">Action</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700">Axe</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700">Priorité</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700">Statut</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700">Échéance</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700">Avancement</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-primary-500">
                          Aucune action trouvée
                        </td>
                      </tr>
                    ) : (
                      filteredActions.map((action) => {
                        const axe = centreAxes.find((a) => a.id === action.axeId);
                        const isOverdue =
                          action.statut !== 'termine' &&
                          action.statut !== 'annule' &&
                          action.dateEcheance &&
                          new Date(action.dateEcheance) < new Date();

                        return (
                          <tr
                            key={action.id}
                            className={`border-b border-primary-100 hover:bg-primary-50 cursor-pointer ${
                              isOverdue ? 'bg-error/5' : ''
                            }`}
                            onClick={() => handleOpenModal(action)}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${prioriteColors[action.priorite]}`} />
                                <div>
                                  <p className="font-medium text-primary-900">{action.titre}</p>
                                  {action.description && (
                                    <p className="text-xs text-primary-500 line-clamp-1 max-w-[200px]">
                                      {action.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {axe ? (
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded" style={{ backgroundColor: axe.couleur }} />
                                  <span className="text-sm">{axe.code}</span>
                                </div>
                              ) : (
                                <span className="text-primary-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <PrioriteBadge priorite={action.priorite} />
                            </td>
                            <td className="py-3 px-4">
                              <StatutActionBadge statut={action.statut} />
                            </td>
                            <td className="py-3 px-4">
                              {action.dateEcheance ? (
                                <span className={isOverdue ? 'text-error font-medium' : ''}>
                                  {format(new Date(action.dateEcheance), 'dd/MM/yyyy')}
                                </span>
                              ) : (
                                <span className="text-primary-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-primary-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary-700 rounded-full"
                                    style={{ width: `${action.avancement}%` }}
                                  />
                                </div>
                                <span className="text-sm text-primary-600">{action.avancement}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenModal(action);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAction(action);
                                    setIsDeleteModalOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-error" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Sidebar - Actions non planifiées (visible en vue calendrier) */}
      {viewMode === 'calendar' && (
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-primary-200 h-full flex flex-col">
            <div className="p-3 border-b border-primary-200">
              <h3 className="font-semibold text-primary-900 text-sm">Non planifiées</h3>
              <p className="text-xs text-primary-500 mt-0.5">Glissez vers le calendrier</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {unscheduledActions.length > 0 ? (
                unscheduledActions.map((action) => (
                  <div
                    key={action.id}
                    draggable
                    onDragStart={(e) => handleDragStartUnscheduled(e, action)}
                    onClick={() => handleOpenModal(action)}
                    className={`p-3 bg-primary-50 rounded-lg border-l-4 ${prioriteBorderColors[action.priorite]} cursor-move hover:bg-primary-100 transition-colors`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${prioriteColors[action.priorite]}`} />
                      <span className="text-xs font-medium text-primary-600 capitalize">{action.priorite}</span>
                    </div>
                    <p className="text-sm font-medium text-primary-900 line-clamp-2">{action.titre}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <StatutActionBadge statut={action.statut} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-primary-400 text-sm">
                  Toutes les actions sont planifiées
                </div>
              )}
            </div>
            <div className="p-2 border-t border-primary-200">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => handleOpenModal()}
              >
                Nouvelle action
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création/Édition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedAction ? "Modifier l'action" : 'Nouvelle action'}
        size="xl"
        footer={
          <>
            {selectedAction && (
              <Button
                variant="ghost"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsDeleteModalOpen(true);
                }}
                className="text-error mr-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            )}
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>{selectedAction ? 'Enregistrer' : 'Créer'}</Button>
          </>
        }
      >
        {/* Tabs */}
        <div className="flex border-b border-primary-200 mb-4 -mt-2">
          {[
            { id: 'general', label: 'Général', icon: Edit },
            { id: 'planning', label: 'Planification', icon: CalendarIcon },
            { id: 'tasks', label: 'Sous-actions', icon: CheckSquare },
            { id: 'budget', label: 'Budget', icon: DollarSign },
            { id: 'risks', label: 'Risques', icon: AlertTriangle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFormTab(id as typeof formTab)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                formTab === id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-primary-500 hover:text-primary-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === 'tasks' && formData.sousActions.length > 0 && (
                <Badge size="sm">{formData.sousActions.length}</Badge>
              )}
              {id === 'risks' && formData.risques.length > 0 && (
                <Badge size="sm" className="bg-warning/10 text-warning">{formData.risques.length}</Badge>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Général */}
        {formTab === 'general' && (
          <div className="space-y-4">
            <Input
              label="Titre *"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              placeholder="Titre de l'action"
              required
            />

            <Textarea
              label="Description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez l'action, ses objectifs et le contexte..."
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Axe stratégique"
                options={axeOptions}
                value={formData.axeId}
                onChange={(e) => setFormData({ ...formData, axeId: e.target.value, objectifId: '' })}
              />
              <Select
                label="Objectif lié"
                options={[
                  { value: '', label: 'Aucun objectif' },
                  ...objectifsForSelectedAxe.map((obj) => ({ value: obj.id, label: `${obj.code} - ${obj.intitule}` })),
                ]}
                value={formData.objectifId}
                onChange={(e) => setFormData({ ...formData, objectifId: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Responsable"
                value={formData.responsableId}
                onChange={(e) => setFormData({ ...formData, responsableId: e.target.value })}
                placeholder="Nom du responsable"
                leftIcon={<User className="w-4 h-4" />}
              />
              <Select
                label="Priorité"
                options={prioriteOptions}
                value={formData.priorite}
                onChange={(e) => setFormData({ ...formData, priorite: e.target.value as PrioriteAction })}
              />
            </div>

            {/* Contributeurs */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Contributeurs
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.contributeurs.map((contrib) => (
                  <Badge key={contrib} className="bg-primary-100 text-primary-700 flex items-center gap-1">
                    {contrib}
                    <button type="button" onClick={() => removeContributeur(contrib)} className="hover:text-error">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newContributeur}
                  onChange={(e) => setNewContributeur(e.target.value)}
                  placeholder="Ajouter un contributeur"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addContributeur())}
                  className="flex-1"
                />
                <Button type="button" variant="secondary" onClick={addContributeur} disabled={!newContributeur.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Planification */}
        {formTab === 'planning' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Statut"
                options={statutOptions}
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as StatutAction })}
              />
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Avancement</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.avancement}
                    onChange={(e) => setFormData({ ...formData, avancement: Number(e.target.value) })}
                    className="flex-1 h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer"
                    disabled={formData.sousActions.length > 0}
                  />
                  <span className="text-sm font-medium text-primary-700 w-12 text-right">{formData.avancement}%</span>
                </div>
                {formData.sousActions.length > 0 && (
                  <p className="text-xs text-primary-500 mt-1">Calculé automatiquement depuis les sous-actions</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Date de début"
                type="date"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
              />
              <Input
                label="Date d'échéance"
                type="date"
                value={formData.dateEcheance}
                onChange={(e) => setFormData({ ...formData, dateEcheance: e.target.value })}
              />
              {(formData.statut === 'termine' || formData.statut === 'annule') && (
                <Input
                  label="Date de réalisation"
                  type="date"
                  value={formData.dateRealisation}
                  onChange={(e) => setFormData({ ...formData, dateRealisation: e.target.value })}
                />
              )}
            </div>

            {/* Barre de progression visuelle */}
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary-700">Progression globale</span>
                <span className={`text-lg font-bold ${formData.avancement === 100 ? 'text-success' : 'text-primary-900'}`}>
                  {formData.avancement}%
                </span>
              </div>
              <div className="h-3 bg-primary-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${
                    formData.avancement === 100 ? 'bg-success' : formData.avancement > 50 ? 'bg-info' : 'bg-warning'
                  }`}
                  style={{ width: `${formData.avancement}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Sous-actions */}
        {formTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSousAction}
                onChange={(e) => setNewSousAction(e.target.value)}
                placeholder="Ajouter une sous-action / tâche..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSousAction())}
                className="flex-1"
              />
              <Button type="button" onClick={addSousAction} disabled={!newSousAction.trim()}>
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {formData.sousActions.length === 0 ? (
                <div className="text-center py-8 text-primary-400">
                  <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune sous-action définie</p>
                  <p className="text-xs mt-1">Les sous-actions permettent de décomposer l'action en tâches plus petites</p>
                </div>
              ) : (
                formData.sousActions.map((sa, index) => (
                  <div
                    key={sa.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      sa.statut === 'termine' ? 'bg-success/5 border-success/20' : 'bg-white border-primary-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSousAction(sa.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        sa.statut === 'termine'
                          ? 'bg-success border-success text-white'
                          : 'border-primary-300 hover:border-primary-500'
                      }`}
                    >
                      {sa.statut === 'termine' && <Check className="w-3 h-3" />}
                    </button>
                    <span className={`flex-1 ${sa.statut === 'termine' ? 'line-through text-primary-400' : 'text-primary-900'}`}>
                      {sa.description}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSousAction(sa.id)}
                      className="p-1 text-primary-400 hover:text-error transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {formData.sousActions.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                <span className="text-sm text-primary-600">
                  {formData.sousActions.filter((sa) => sa.statut === 'termine').length} / {formData.sousActions.length} complétées
                </span>
                <div className="w-32 h-2 bg-primary-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all"
                    style={{
                      width: `${(formData.sousActions.filter((sa) => sa.statut === 'termine').length / formData.sousActions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Budget */}
        {formTab === 'budget' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Budget prévu"
                type="number"
                min={0}
                step={100}
                value={formData.budget.prevu}
                onChange={(e) => setFormData({ ...formData, budget: { ...formData.budget, prevu: Number(e.target.value) } })}
                leftIcon={<DollarSign className="w-4 h-4" />}
              />
              <Input
                label="Budget consommé"
                type="number"
                min={0}
                step={100}
                value={formData.budget.consomme}
                onChange={(e) => setFormData({ ...formData, budget: { ...formData.budget, consomme: Number(e.target.value) } })}
                leftIcon={<DollarSign className="w-4 h-4" />}
              />
              <Select
                label="Devise"
                options={[
                  { value: 'XOF', label: 'XOF (FCFA)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'MAD', label: 'MAD (DH)' },
                ]}
                value={formData.budget.devise}
                onChange={(e) => setFormData({ ...formData, budget: { ...formData.budget, devise: e.target.value } })}
              />
            </div>

            {formData.budget.prevu > 0 && (
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary-700">Consommation budgétaire</span>
                  <span
                    className={`text-lg font-bold ${
                      formData.budget.consomme > formData.budget.prevu
                        ? 'text-error'
                        : formData.budget.consomme > formData.budget.prevu * 0.8
                        ? 'text-warning'
                        : 'text-success'
                    }`}
                  >
                    {Math.round((formData.budget.consomme / formData.budget.prevu) * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-primary-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all rounded-full ${
                      formData.budget.consomme > formData.budget.prevu
                        ? 'bg-error'
                        : formData.budget.consomme > formData.budget.prevu * 0.8
                        ? 'bg-warning'
                        : 'bg-success'
                    }`}
                    style={{ width: `${Math.min((formData.budget.consomme / formData.budget.prevu) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-primary-500">
                  <span>
                    Consommé: {formData.budget.consomme.toLocaleString()} {formData.budget.devise}
                  </span>
                  <span>
                    Reste: {Math.max(0, formData.budget.prevu - formData.budget.consomme).toLocaleString()} {formData.budget.devise}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Risques */}
        {formTab === 'risks' && (
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg space-y-3">
              <Input
                label="Description du risque"
                value={newRisque.description}
                onChange={(e) => setNewRisque({ ...newRisque, description: e.target.value })}
                placeholder="Décrivez le risque identifié..."
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Probabilité"
                  options={[
                    { value: 'faible', label: 'Faible' },
                    { value: 'moyenne', label: 'Moyenne' },
                    { value: 'elevee', label: 'Élevée' },
                  ]}
                  value={newRisque.probabilite}
                  onChange={(e) => setNewRisque({ ...newRisque, probabilite: e.target.value as 'faible' | 'moyenne' | 'elevee' })}
                />
                <Select
                  label="Impact"
                  options={[
                    { value: 'faible', label: 'Faible' },
                    { value: 'moyen', label: 'Moyen' },
                    { value: 'eleve', label: 'Élevé' },
                  ]}
                  value={newRisque.impact}
                  onChange={(e) => setNewRisque({ ...newRisque, impact: e.target.value as 'faible' | 'moyen' | 'eleve' })}
                />
              </div>
              <Textarea
                label="Plan de mitigation"
                rows={2}
                value={newRisque.mitigation}
                onChange={(e) => setNewRisque({ ...newRisque, mitigation: e.target.value })}
                placeholder="Actions prévues pour réduire ou éliminer ce risque..."
              />
              <Button type="button" onClick={addRisque} disabled={!newRisque.description.trim()} className="w-full">
                <Plus className="w-4 h-4 mr-1" />
                Ajouter le risque
              </Button>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {formData.risques.length === 0 ? (
                <div className="text-center py-6 text-primary-400">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Aucun risque identifié</p>
                </div>
              ) : (
                formData.risques.map((risque) => {
                  const probabiliteColor = risque.probabilite === 'elevee' ? 'text-error' : risque.probabilite === 'moyenne' ? 'text-warning' : 'text-success';
                  const impactColor = risque.impact === 'eleve' ? 'text-error' : risque.impact === 'moyen' ? 'text-warning' : 'text-success';
                  return (
                    <div key={risque.id} className="p-3 bg-white border border-primary-200 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-primary-900">{risque.description}</p>
                          <div className="flex gap-4 mt-1 text-xs">
                            <span className={probabiliteColor}>Probabilité: {risque.probabilite}</span>
                            <span className={impactColor}>Impact: {risque.impact}</span>
                          </div>
                          {risque.mitigation && (
                            <p className="text-sm text-primary-600 mt-2 p-2 bg-primary-50 rounded">
                              <strong>Mitigation:</strong> {risque.mitigation}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRisque(risque.id)}
                          className="p-1 text-primary-400 hover:text-error transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Confirmation Suppression */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer l'action"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedAction?.titre}" ?`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
