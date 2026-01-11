import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Columns3,
  CalendarDays,
  Target,
  Users,
  DollarSign,
  AlertTriangle,
  CheckSquare,
  X,
  Check,
  Building2,
  ArrowLeft,
  Download,
  Eye,
  TrendingUp,
  Activity,
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type ViewMode = 'list' | 'kanban' | 'calendar' | 'timeline';

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

export function ActionsConsolidees() {
  const navigate = useNavigate();
  const { centres, loadCentres } = useCentresStore();
  const { theme, setCurrentCentre } = useAppStore();
  const isDark = theme === 'dark';
  const { axes, loadAxes, objectifs, loadObjectifs } = useAxesStore();
  const {
    actions,
    loadActions,
    getActionsEnRetard,
    updateAction,
    changerStatut,
  } = useActionsStore();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterCentre, setFilterCentre] = useState<string>('all');
  const [filterPriorite, setFilterPriorite] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAction, setSelectedAction] = useState<PlanAction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadCentres();
    loadAxes();
    loadObjectifs();
    loadActions(); // Charger TOUTES les actions (sans centreId)
  }, []);

  const actionsEnRetard = getActionsEnRetard();

  // Statistiques globales
  const stats = useMemo(() => {
    const total = actions.length;
    const terminees = actions.filter((a) => a.statut === 'termine').length;
    const enCours = actions.filter((a) => a.statut === 'en_cours').length;
    const aFaire = actions.filter((a) => a.statut === 'a_faire').length;
    const enRetard = actionsEnRetard.length;
    const critique = actions.filter((a) => a.priorite === 'critique' && a.statut !== 'termine' && a.statut !== 'annule').length;
    const budgetTotal = actions.reduce((sum, a) => sum + (a.budget?.prevu || 0), 0);
    const budgetConsomme = actions.reduce((sum, a) => sum + (a.budget?.consomme || 0), 0);

    return { total, terminees, enCours, aFaire, enRetard, critique, budgetTotal, budgetConsomme };
  }, [actions, actionsEnRetard]);

  // Statistiques par centre
  const statsByCentre = useMemo(() => {
    return centres.map((centre) => {
      const centreActions = actions.filter((a) => a.centreId === centre.id);
      const terminees = centreActions.filter((a) => a.statut === 'termine').length;
      const enRetard = centreActions.filter(
        (a) => a.statut !== 'termine' && a.statut !== 'annule' && a.dateEcheance && new Date(a.dateEcheance) < new Date()
      ).length;

      return {
        id: centre.id,
        code: centre.code,
        nom: centre.nom,
        couleur: centre.couleurTheme || '#171717',
        total: centreActions.length,
        terminees,
        enRetard,
        tauxRealisation: centreActions.length > 0 ? Math.round((terminees / centreActions.length) * 100) : 0,
      };
    });
  }, [centres, actions]);

  // Filtrage des actions
  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      if (filterCentre !== 'all' && action.centreId !== filterCentre) return false;
      if (filterPriorite !== 'all' && action.priorite !== filterPriorite) return false;
      if (filterStatut !== 'all' && action.statut !== filterStatut) return false;
      if (searchQuery && !action.titre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [actions, filterCentre, filterPriorite, filterStatut, searchQuery]);

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
    a_faire: 'bg-primary-100 dark:bg-primary-800 border-primary-300 dark:border-primary-600',
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

  // Données pour les graphiques
  const chartData = useMemo(() => {
    return statsByCentre.map((c) => ({
      name: c.code,
      total: c.total,
      terminees: c.terminees,
      enRetard: c.enRetard,
    }));
  }, [statsByCentre]);

  const pieData = [
    { name: 'Terminées', value: stats.terminees, color: '#22c55e' },
    { name: 'En cours', value: stats.enCours, color: '#3b82f6' },
    { name: 'À faire', value: stats.aFaire, color: '#a3a3a3' },
    { name: 'En retard', value: stats.enRetard, color: '#ef4444' },
  ];

  const handleActionClick = (action: PlanAction) => {
    setSelectedAction(action);
    setIsDetailOpen(true);
  };

  const handleGoToCentre = (centreId: string) => {
    setCurrentCentre(centreId);
    navigate(`/centre/${centreId}/actions`);
  };

  // Drag & Drop pour Kanban
  const handleDragStartKanban = (e: React.DragEvent, action: PlanAction) => {
    e.dataTransfer.setData('actionId', action.id);
    e.dataTransfer.setData('dragType', 'kanban');
  };

  const handleDropKanban = async (e: React.DragEvent, newStatut: StatutAction) => {
    e.preventDefault();
    const actionId = e.dataTransfer.getData('actionId');
    const dragType = e.dataTransfer.getData('dragType');
    if (actionId && dragType === 'kanban') {
      await changerStatut(actionId, newStatut);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getCentre = (centreId: string) => centres.find((c) => c.id === centreId);

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

  // Composant carte d'action pour le Kanban (avec indicateur de centre)
  const KanbanActionCard = ({ action }: { action: PlanAction }) => {
    const centre = getCentre(action.centreId);
    const isOverdue =
      action.statut !== 'termine' &&
      action.statut !== 'annule' &&
      action.dateEcheance &&
      new Date(action.dateEcheance) < new Date();

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStartKanban(e, action)}
        onClick={() => handleActionClick(action)}
        className={`group bg-white dark:bg-primary-800 p-3 rounded-lg border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-all ${
          prioriteBorderColors[action.priorite]
        } ${isOverdue ? 'ring-1 ring-error/30' : ''}`}
      >
        {/* Indicateur du centre */}
        {centre && (
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: centre.couleurTheme || '#171717' }}
            >
              {centre.code.substring(0, 1)}
            </div>
            <span className="text-xs text-primary-500 dark:text-primary-400">{centre.nom}</span>
          </div>
        )}

        <h4 className="font-medium text-primary-900 dark:text-primary-100 text-sm line-clamp-2 mb-2">{action.titre}</h4>

        <div className="flex flex-wrap gap-1 mb-2">
          <PrioriteBadge priorite={action.priorite} />
        </div>

        <div className="flex items-center justify-between text-xs">
          {action.dateEcheance && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-error' : 'text-primary-500 dark:text-primary-400'}`}>
              <CalendarIcon className="w-3 h-3" />
              {format(new Date(action.dateEcheance), 'dd/MM')}
            </div>
          )}
          <div className="flex items-center gap-1 text-primary-500 dark:text-primary-400">
            <div className="w-12 h-1 bg-primary-100 dark:bg-primary-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-700 dark:bg-primary-300 rounded-full"
                style={{ width: `${action.avancement}%` }}
              />
            </div>
            <span>{action.avancement}%</span>
          </div>
        </div>
      </div>
    );
  };

  // Composant ligne pour la vue liste
  const ActionListRow = ({ action }: { action: PlanAction }) => {
    const centre = getCentre(action.centreId);
    const isOverdue =
      action.statut !== 'termine' &&
      action.statut !== 'annule' &&
      action.dateEcheance &&
      new Date(action.dateEcheance) < new Date();

    return (
      <tr
        className={`border-b border-primary-100 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-800 cursor-pointer ${
          isOverdue ? 'bg-error/5' : ''
        }`}
        onClick={() => handleActionClick(action)}
      >
        <td className="py-3 px-4">
          {centre && (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: centre.couleurTheme || '#171717' }}
              >
                {centre.code.substring(0, 2)}
              </div>
              <span className="text-sm text-primary-600 dark:text-primary-400">{centre.nom}</span>
            </div>
          )}
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${prioriteColors[action.priorite]}`} />
            <div>
              <p className="font-medium text-primary-900 dark:text-primary-100">{action.titre}</p>
              {action.description && (
                <p className="text-xs text-primary-500 dark:text-primary-400 line-clamp-1 max-w-[250px]">
                  {action.description}
                </p>
              )}
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <PrioriteBadge priorite={action.priorite} />
        </td>
        <td className="py-3 px-4">
          <StatutActionBadge statut={action.statut} />
        </td>
        <td className="py-3 px-4">
          {action.dateEcheance ? (
            <span className={isOverdue ? 'text-error font-medium' : 'text-primary-700 dark:text-primary-300'}>
              {format(new Date(action.dateEcheance), 'dd/MM/yyyy')}
              {isOverdue && (
                <span className="block text-xs">
                  ({differenceInDays(new Date(), new Date(action.dateEcheance))}j retard)
                </span>
              )}
            </span>
          ) : (
            <span className="text-primary-400">—</span>
          )}
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-primary-200 dark:bg-primary-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-700 dark:bg-primary-300 rounded-full"
                style={{ width: `${action.avancement}%` }}
              />
            </div>
            <span className="text-sm text-primary-600 dark:text-primary-400">{action.avancement}%</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (action.centreId) handleGoToCentre(action.centreId);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </td>
      </tr>
    );
  };

  // Composant carte calendrier
  const CalendarActionCard = ({ action }: { action: PlanAction }) => {
    const centre = getCentre(action.centreId);

    return (
      <div
        onClick={() => handleActionClick(action)}
        className={`group cursor-pointer px-2 py-1 rounded text-xs border-l-2 ${prioriteBorderColors[action.priorite]} bg-white dark:bg-primary-800 hover:shadow-sm transition-all mb-1 truncate`}
      >
        <div className="flex items-center gap-1">
          {centre && (
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: centre.couleurTheme || '#171717' }}
            />
          )}
          <span className="truncate font-medium text-primary-900 dark:text-primary-100">{action.titre}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header simple et clair */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100 flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-xl">
                <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              Plan d'action consolidé
            </h1>
            <p className="text-primary-500 dark:text-primary-400 mt-1">
              {centres.length} centre{centres.length > 1 ? 's' : ''} • {filteredActions.length} action{filteredActions.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
          Exporter
        </Button>
      </div>

      {/* Stats Cards - design moderne et coloré */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white dark:bg-primary-900 rounded-xl p-4 border border-primary-100 dark:border-primary-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-lg">
              <LayoutGrid className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">{stats.total}</p>
              <p className="text-xs text-primary-500">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.terminees}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Terminées</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.enCours}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">En cours</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-primary-900 rounded-xl p-4 border border-primary-100 dark:border-primary-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-lg">
              <Clock className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.aFaire}</p>
              <p className="text-xs text-primary-500">À faire</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.enRetard}</p>
              <p className="text-xs text-red-600 dark:text-red-400">En retard</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.critique}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Critiques</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/30 rounded-xl p-4 border border-violet-200 dark:border-violet-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                {stats.total > 0 ? Math.round((stats.terminees / stats.total) * 100) : 0}%
              </p>
              <p className="text-xs text-violet-600 dark:text-violet-400">Réalisation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats par centre - design amélioré */}
      {centres.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {statsByCentre.map((centre) => (
            <div
              key={centre.id}
              onClick={() => setFilterCentre(filterCentre === centre.id ? 'all' : centre.id)}
              className={`flex-shrink-0 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                filterCentre === centre.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-800 shadow-lg shadow-primary-500/20'
                  : 'border-primary-100 dark:border-primary-700 bg-white dark:bg-primary-900 hover:border-primary-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                  style={{ backgroundColor: centre.couleur }}
                >
                  {centre.code.substring(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-primary-900 dark:text-primary-100">{centre.nom}</p>
                  <div className="flex items-center gap-3 text-sm mt-1">
                    <span className="text-primary-500">{centre.total} actions</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-primary-100 dark:bg-primary-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success rounded-full"
                          style={{ width: `${centre.tauxRealisation}%` }}
                        />
                      </div>
                      <span className="text-success font-medium">{centre.tauxRealisation}%</span>
                    </div>
                    {centre.enRetard > 0 && (
                      <span className="px-2 py-0.5 bg-error/10 text-error text-xs rounded-full font-medium">
                        {centre.enRetard} en retard
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtres et vues */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Recherche */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 text-primary-900 dark:text-primary-100"
          />
        </div>

        {/* Filtres */}
        <Select
          options={[
            { value: 'all', label: 'Tous les centres' },
            ...centres.map((c) => ({ value: c.id, label: c.nom })),
          ]}
          value={filterCentre}
          onChange={(e) => setFilterCentre(e.target.value)}
          className="w-44"
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

        {/* Reset filters */}
        {(filterCentre !== 'all' || filterPriorite !== 'all' || filterStatut !== 'all' || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterCentre('all');
              setFilterPriorite('all');
              setFilterStatut('all');
              setSearchQuery('');
            }}
          >
            <X className="w-4 h-4 mr-1" />
            Réinitialiser
          </Button>
        )}

        {/* Sélecteur de vue */}
        <div className="flex border border-primary-200 dark:border-primary-700 rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 flex items-center gap-1 text-sm ${
              viewMode === 'list' ? 'bg-primary-900 text-white' : 'bg-white dark:bg-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-700'
            }`}
            title="Vue Liste"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-2 flex items-center gap-1 text-sm ${
              viewMode === 'kanban' ? 'bg-primary-900 text-white' : 'bg-white dark:bg-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-700'
            }`}
            title="Vue Kanban"
          >
            <Columns3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 flex items-center gap-1 text-sm ${
              viewMode === 'calendar' ? 'bg-primary-900 text-white' : 'bg-white dark:bg-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-700'
            }`}
            title="Vue Calendrier"
          >
            <CalendarDays className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`p-2 flex items-center gap-1 text-sm ${
              viewMode === 'timeline' ? 'bg-primary-900 text-white' : 'bg-white dark:bg-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-700'
            }`}
            title="Vue Graphiques"
          >
            <Activity className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-50 dark:bg-primary-800 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700 dark:text-primary-300">Centre</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700 dark:text-primary-300">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700 dark:text-primary-300">Priorité</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700 dark:text-primary-300">Statut</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700 dark:text-primary-300">Échéance</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700 dark:text-primary-300">Avancement</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-800 dark:to-primary-900 flex items-center justify-center mb-4">
                            <Target className="w-12 h-12 text-primary-300 dark:text-primary-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 mb-2">
                            Aucune action trouvée
                          </h3>
                          <p className="text-primary-500 dark:text-primary-400 max-w-md mb-6">
                            {searchQuery || filterCentre !== 'all' || filterPriorite !== 'all' || filterStatut !== 'all'
                              ? 'Modifiez vos filtres pour voir plus de résultats'
                              : 'Commencez par créer des actions dans vos centres pour les voir apparaître ici'}
                          </p>
                          {centres.length > 0 && (
                            <Button
                              onClick={() => handleGoToCentre(centres[0].id)}
                              leftIcon={<Plus className="w-4 h-4" />}
                            >
                              Créer une action
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredActions.map((action) => (
                      <ActionListRow key={action.id} action={action} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vue Kanban */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-[1200px]">
            {(['a_faire', 'en_cours', 'en_attente', 'termine', 'annule'] as StatutAction[]).map((statut) => {
              const kanbanColors: Record<StatutAction, { bg: string; border: string; icon: string }> = {
                a_faire: { bg: 'bg-slate-50 dark:bg-slate-900/50', border: 'border-slate-200 dark:border-slate-700', icon: 'text-slate-400' },
                en_cours: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-400' },
                en_attente: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: 'text-amber-400' },
                termine: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: 'text-emerald-400' },
                annule: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: 'text-red-400' },
              };

              const kanbanIcons: Record<StatutAction, React.ReactNode> = {
                a_faire: <Clock className={`w-5 h-5 ${kanbanColors[statut].icon}`} />,
                en_cours: <Activity className={`w-5 h-5 ${kanbanColors[statut].icon}`} />,
                en_attente: <AlertTriangle className={`w-5 h-5 ${kanbanColors[statut].icon}`} />,
                termine: <CheckSquare className={`w-5 h-5 ${kanbanColors[statut].icon}`} />,
                annule: <X className={`w-5 h-5 ${kanbanColors[statut].icon}`} />,
              };

              return (
                <div
                  key={statut}
                  className={`flex-1 rounded-2xl p-4 min-w-[240px] flex flex-col border-2 ${kanbanColors[statut].bg} ${kanbanColors[statut].border}`}
                  onDrop={(e) => handleDropKanban(e, statut)}
                  onDragOver={handleDragOver}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {kanbanIcons[statut]}
                      <h3 className="font-semibold text-primary-900 dark:text-primary-100">{statutLabels[statut]}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-sm font-bold ${
                      statut === 'termine' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
                      statut === 'en_cours' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      statut === 'a_faire' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                      statut === 'en_attente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {actionsByStatut[statut].length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px]">
                    {actionsByStatut[statut].map((action) => (
                      <KanbanActionCard key={action.id} action={action} />
                    ))}
                    {actionsByStatut[statut].length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className={`w-16 h-16 rounded-2xl ${kanbanColors[statut].bg} border-2 border-dashed ${kanbanColors[statut].border} flex items-center justify-center mb-3`}>
                          {kanbanIcons[statut]}
                        </div>
                        <p className="text-sm font-medium text-primary-400 dark:text-primary-500">Aucune action</p>
                        <p className="text-xs text-primary-300 dark:text-primary-600 mt-1">
                          Glissez une action ici
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vue Calendrier */}
      {viewMode === 'calendar' && (
        <Card>
          <CardContent className="p-0">
            {/* Header du calendrier */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary-200 dark:border-primary-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </button>
                <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-100 w-40 text-center">
                  {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </h2>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </button>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setCurrentMonth(new Date())}>
                Aujourd'hui
              </Button>
            </div>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 border-b border-primary-200 dark:border-primary-700">
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, i) => (
                <div
                  key={day}
                  className={`py-2 text-center text-sm font-medium ${
                    i === 0 || i === 6 ? 'text-primary-400' : 'text-primary-600 dark:text-primary-400'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grille du calendrier */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const dayActions = actionsByDay[dayKey] || [];
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);
                const isWeekend = getDay(day) === 0 || getDay(day) === 6;

                return (
                  <div
                    key={index}
                    className={`border-b border-r border-primary-100 dark:border-primary-700 p-1 min-h-[100px] ${
                      !isCurrentMonth ? 'bg-primary-50/50 dark:bg-primary-900/50' : isWeekend ? 'bg-primary-50/30 dark:bg-primary-800/30' : 'bg-white dark:bg-primary-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                          isCurrentDay
                            ? 'bg-primary-900 dark:bg-primary-100 text-white dark:text-primary-900'
                            : !isCurrentMonth
                            ? 'text-primary-300 dark:text-primary-600'
                            : 'text-primary-700 dark:text-primary-300'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayActions.length > 0 && (
                        <Badge size="sm" variant="default">{dayActions.length}</Badge>
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
          </CardContent>
        </Card>
      )}

      {/* Vue Graphiques/Timeline */}
      {viewMode === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actions par centre */}
          <Card>
            <CardHeader>
              <CardTitle>Actions par centre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#404040' : '#e5e5e5'} />
                    <XAxis type="number" stroke={isDark ? '#a3a3a3' : '#737373'} fontSize={12} />
                    <YAxis dataKey="name" type="category" width={60} stroke={isDark ? '#a3a3a3' : '#737373'} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#262626' : '#fff',
                        border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`,
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="terminees" name="Terminées" fill="#22c55e" stackId="a" />
                    <Bar dataKey="enRetard" name="En retard" fill="#ef4444" stackId="a" />
                    <Bar dataKey="total" name="Total" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Répartition par statut */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par statut</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Actions en retard détaillées */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-error" />
                Actions en retard ({actionsEnRetard.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {actionsEnRetard.length === 0 ? (
                <div className="text-center py-8 text-success">
                  <CheckSquare className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-medium">Aucune action en retard</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {actionsEnRetard.map((action) => {
                    const centre = getCentre(action.centreId);
                    const joursRetard = differenceInDays(new Date(), new Date(action.dateEcheance));

                    return (
                      <div
                        key={action.id}
                        onClick={() => handleActionClick(action)}
                        className="flex items-center gap-4 p-3 bg-error/5 border border-error/20 rounded-lg cursor-pointer hover:bg-error/10 transition-colors"
                      >
                        {centre && (
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ backgroundColor: centre.couleurTheme || '#171717' }}
                          >
                            {centre.code.substring(0, 2)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-primary-900 dark:text-primary-100 truncate">{action.titre}</p>
                          <p className="text-sm text-primary-500 dark:text-primary-400">{centre?.nom}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-error font-bold">{joursRetard}j</p>
                          <p className="text-xs text-primary-500">de retard</p>
                        </div>
                        <PrioriteBadge priorite={action.priorite} />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de détail */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedAction(null);
        }}
        title="Détail de l'action"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>
              Fermer
            </Button>
            {selectedAction && (
              <Button
                onClick={() => {
                  if (selectedAction.centreId) handleGoToCentre(selectedAction.centreId);
                }}
              >
                Voir dans le centre
              </Button>
            )}
          </>
        }
      >
        {selectedAction && (
          <div className="space-y-4">
            {/* Centre */}
            {getCentre(selectedAction.centreId) && (
              <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: getCentre(selectedAction.centreId)?.couleurTheme || '#171717' }}
                >
                  {getCentre(selectedAction.centreId)?.code.substring(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-primary-900 dark:text-primary-100">{getCentre(selectedAction.centreId)?.nom}</p>
                  <p className="text-sm text-primary-500">{getCentre(selectedAction.centreId)?.ville}</p>
                </div>
              </div>
            )}

            {/* Titre et description */}
            <div>
              <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">{selectedAction.titre}</h3>
              {selectedAction.description && (
                <p className="text-primary-600 dark:text-primary-400 mt-2">{selectedAction.description}</p>
              )}
            </div>

            {/* Badges */}
            <div className="flex gap-2">
              <PrioriteBadge priorite={selectedAction.priorite} />
              <StatutActionBadge statut={selectedAction.statut} />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-primary-500 dark:text-primary-400">Date de début</p>
                <p className="font-medium text-primary-900 dark:text-primary-100">
                  {selectedAction.dateDebut ? format(new Date(selectedAction.dateDebut), 'dd/MM/yyyy') : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-primary-500 dark:text-primary-400">Date d'échéance</p>
                <p className={`font-medium ${
                  selectedAction.dateEcheance && new Date(selectedAction.dateEcheance) < new Date() && selectedAction.statut !== 'termine'
                    ? 'text-error'
                    : 'text-primary-900 dark:text-primary-100'
                }`}>
                  {selectedAction.dateEcheance ? format(new Date(selectedAction.dateEcheance), 'dd/MM/yyyy') : '—'}
                </p>
              </div>
            </div>

            {/* Avancement */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-primary-500 dark:text-primary-400">Avancement</span>
                <span className="font-medium text-primary-900 dark:text-primary-100">{selectedAction.avancement}%</span>
              </div>
              <div className="h-2 bg-primary-200 dark:bg-primary-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${selectedAction.avancement === 100 ? 'bg-success' : 'bg-info'}`}
                  style={{ width: `${selectedAction.avancement}%` }}
                />
              </div>
            </div>

            {/* Responsable */}
            {selectedAction.responsableId && (
              <div>
                <p className="text-sm text-primary-500 dark:text-primary-400">Responsable</p>
                <p className="font-medium text-primary-900 dark:text-primary-100">{selectedAction.responsableId}</p>
              </div>
            )}

            {/* Sous-actions */}
            {selectedAction.sousActions && selectedAction.sousActions.length > 0 && (
              <div>
                <p className="text-sm text-primary-500 dark:text-primary-400 mb-2">
                  Sous-actions ({selectedAction.sousActions.filter((sa) => sa.statut === 'termine').length}/{selectedAction.sousActions.length})
                </p>
                <div className="space-y-1">
                  {selectedAction.sousActions.map((sa) => (
                    <div key={sa.id} className="flex items-center gap-2 text-sm">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        sa.statut === 'termine' ? 'bg-success border-success' : 'border-primary-300'
                      }`}>
                        {sa.statut === 'termine' && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={sa.statut === 'termine' ? 'line-through text-primary-400' : 'text-primary-700 dark:text-primary-300'}>
                        {sa.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budget */}
            {selectedAction.budget && selectedAction.budget.prevu > 0 && (
              <div className="p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                <p className="text-sm text-primary-500 dark:text-primary-400 mb-2">Budget</p>
                <div className="flex justify-between text-sm mb-1">
                  <span>Consommé: {selectedAction.budget.consomme.toLocaleString()} {selectedAction.budget.devise}</span>
                  <span>Prévu: {selectedAction.budget.prevu.toLocaleString()} {selectedAction.budget.devise}</span>
                </div>
                <div className="h-2 bg-primary-200 dark:bg-primary-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selectedAction.budget.consomme > selectedAction.budget.prevu ? 'bg-error' : 'bg-success'
                    }`}
                    style={{ width: `${Math.min((selectedAction.budget.consomme / selectedAction.budget.prevu) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
