import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  MessageCircle,
  FolderOpen,
  CheckSquare,
  Users,
  Clock,
  BarChart3,
  FileText,
  History,
  Settings,
  Search,
  Plus,
  MoreHorizontal,
  List,
  Calendar,
  Filter,
  Download,
  Link,
  User,
  X,
  Send,
  Paperclip,
  Upload,
  File,
  Image,
  Trash2,
  Edit2,
  Save,
  Bell,
  Moon,
  Sun,
  Globe,
  Lock,
  Mail,
  RefreshCw,
} from 'lucide-react';
import {
  format,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  isSameMonth,
  addMonths,
  subMonths,
  addDays,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  formatDistanceToNow,
} from 'date-fns';
import { fr } from 'date-fns/locale';

// ===========================================
// TYPES
// ===========================================

export interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  parentId?: string;
  color?: string;
  type: 'project' | 'group' | 'task' | 'milestone';
  comments?: number;
  dependencies?: string[];
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'in_progress' | 'completed' | 'delayed';
}

interface TeamGanttViewProps {
  projectName: string;
  tasks: GanttTask[];
  onTaskClick?: (task: GanttTask) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  sidebarItems?: { id: string; name: string; type: 'project' | 'folder' }[];
}

type ZoomLevel = 'day' | 'week' | 'month';
type SidebarSection = 'projects' | 'tasks' | 'discussions' | 'timesheet' | 'availability' | 'reports' | 'settings' | null;

interface FilterOptions {
  status: string[];
  assignee: string[];
  priority: string[];
}

interface Discussion {
  id: string;
  taskId?: string;
  taskName?: string;
  author: string;
  avatar?: string;
  message: string;
  timestamp: Date;
  replies?: Discussion[];
}

interface TimeEntry {
  id: string;
  taskId: string;
  taskName: string;
  date: Date;
  hours: number;
  description?: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  availability: number; // 0-100
  tasksCount: number;
}

// ===========================================
// COULEURS
// ===========================================

const COLORS = {
  primary: '#1e3a5f',
  primaryLight: '#2d4a6f',
  primaryDark: '#0f2744',
  accent: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  cyan: '#22d3ee',
  purple: '#a855f7',
  orange: '#fb923c',
  pink: '#ec4899',
  green: '#22c55e',
  blue: '#3b82f6',
};

const PRIORITY_COLORS = {
  low: '#94a3b8',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444',
};

const STATUS_COLORS = {
  pending: '#94a3b8',
  in_progress: '#3b82f6',
  completed: '#22c55e',
  delayed: '#ef4444',
};

// ===========================================
// DONNÉES MOCK POUR LES PANNEAUX
// ===========================================

const mockDiscussions: Discussion[] = [
  {
    id: '1',
    taskName: 'Recrutement Direction',
    author: 'Marie Dupont',
    message: 'Le candidat retenu pour le poste de directeur a confirmé sa disponibilité pour le 15 janvier.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    replies: [
      {
        id: '1-1',
        author: 'Jean Martin',
        message: 'Excellent ! Je prépare le contrat.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: '2',
    taskName: 'Négociations baux',
    author: 'Sophie Bernard',
    message: 'Point d\'attention : l\'enseigne principale demande une clause d\'exclusivité sur 500m².',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    taskName: 'Gros œuvre',
    author: 'Pierre Durand',
    message: 'Les travaux de fondation sont terminés avec 2 jours d\'avance !',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
];

const mockTimeEntries: TimeEntry[] = [
  { id: '1', taskId: 't1', taskName: 'Étude de marché', date: new Date(), hours: 4, description: 'Analyse concurrentielle' },
  { id: '2', taskId: 't2', taskName: 'Plans d\'aménagement', date: new Date(), hours: 3, description: 'Révision plans niveau 2' },
  { id: '3', taskId: 't3', taskName: 'Prospection enseignes', date: addDays(new Date(), -1), hours: 6, description: 'RDV avec 3 enseignes' },
  { id: '4', taskId: 't4', taskName: 'Négociations baux', date: addDays(new Date(), -1), hours: 2, description: 'Relecture contrat' },
  { id: '5', taskId: 't5', taskName: 'Recrutement Équipe', date: addDays(new Date(), -2), hours: 5, description: 'Entretiens candidats' },
];

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'Marie Dupont', role: 'Chef de projet', availability: 75, tasksCount: 8 },
  { id: '2', name: 'Jean Martin', role: 'Responsable juridique', availability: 60, tasksCount: 5 },
  { id: '3', name: 'Sophie Bernard', role: 'Commercial', availability: 90, tasksCount: 4 },
  { id: '4', name: 'Pierre Durand', role: 'Directeur travaux', availability: 40, tasksCount: 12 },
  { id: '5', name: 'Claire Petit', role: 'RH', availability: 85, tasksCount: 6 },
];

// ===========================================
// COMPOSANT PRINCIPAL
// ===========================================

export function TeamGanttView({
  projectName,
  tasks,
  onTaskClick,
  onTaskUpdate,
  sidebarItems = [],
}: TeamGanttViewProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'tasks' | 'discussions' | 'files' | 'history' | 'people'>('tasks');
  const [viewMode, setViewMode] = useState<'gantt' | 'list'>('gantt');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedSidebarItem, setSelectedSidebarItem] = useState<string | null>(null);

  // Sidebar panel state
  const [activeSidebarSection, setActiveSidebarSection] = useState<SidebarSection>(null);

  // Nouvelles fonctionnalités
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('day');
  const [showDependencies, setShowDependencies] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({ status: [], assignee: [], priority: [] });
  const [searchQuery, setSearchQuery] = useState('');

  // Panel states
  const [discussions, setDiscussions] = useState<Discussion[]>(mockDiscussions);
  const [newMessage, setNewMessage] = useState('');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries);
  const [newTimeEntry, setNewTimeEntry] = useState({ taskName: '', hours: 0, description: '' });

  // Drag & Drop state
  const [draggingTask, setDraggingTask] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'move' | 'resize-start' | 'resize-end' | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [dragEndDate, setDragEndDate] = useState<Date | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Synchroniser le scroll (vertical entre task list et timeline, horizontal entre header et body)
  const handleTimelineScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (taskListRef.current) {
      taskListRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (timelineHeaderRef.current) {
      timelineHeaderRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  const handleTaskListScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  }, []);

  // Dimensions selon le niveau de zoom
  const getDimensions = useCallback(() => {
    switch (zoomLevel) {
      case 'day':
        return { DAY_WIDTH: 28, ROW_HEIGHT: 32 };
      case 'week':
        return { DAY_WIDTH: 12, ROW_HEIGHT: 32 };
      case 'month':
        return { DAY_WIDTH: 4, ROW_HEIGHT: 32 };
      default:
        return { DAY_WIDTH: 28, ROW_HEIGHT: 32 };
    }
  }, [zoomLevel]);

  const { DAY_WIDTH, ROW_HEIGHT } = getDimensions();

  // Tâches assignées à l'utilisateur courant (mock)
  const myTasks = useMemo(() => {
    return tasks.filter(t => t.type === 'task' && t.status !== 'completed').slice(0, 5);
  }, [tasks]);

  // Filtrer les tâches
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filters.status.length > 0 && task.status && !filters.status.includes(task.status)) {
        return false;
      }
      if (filters.assignee.length > 0 && task.assignee && !filters.assignee.includes(task.assignee.id)) {
        return false;
      }
      if (filters.priority.length > 0 && task.priority && !filters.priority.includes(task.priority)) {
        return false;
      }
      return true;
    });
  }, [tasks, searchQuery, filters]);

  // Calculer les dates
  const { startDate, days, months, weeks } = useMemo(() => {
    const activeTasks = filteredTasks.length > 0 ? filteredTasks : tasks;

    if (activeTasks.length === 0) {
      const today = new Date();
      const start = startOfMonth(subMonths(today, 1));
      const end = endOfMonth(addMonths(today, 2));
      return {
        startDate: start,
        days: eachDayOfInterval({ start, end }),
        months: [] as { date: Date; days: number }[],
        weeks: [] as { date: Date; days: number }[],
      };
    }

    let minDate = activeTasks[0].startDate;
    let maxDate = activeTasks[0].endDate;
    activeTasks.forEach((t) => {
      if (t.startDate < minDate) minDate = t.startDate;
      if (t.endDate > maxDate) maxDate = t.endDate;
    });

    const start = startOfMonth(subMonths(minDate, 1));
    const end = endOfMonth(addMonths(maxDate, 2));
    const allDays = eachDayOfInterval({ start, end });

    const monthList: { date: Date; days: number }[] = [];
    let currentMonth = startOfMonth(start);
    while (currentMonth <= end) {
      const daysInMonth = allDays.filter((d) => isSameMonth(d, currentMonth)).length;
      if (daysInMonth > 0) {
        monthList.push({ date: currentMonth, days: daysInMonth });
      }
      currentMonth = addMonths(currentMonth, 1);
    }

    const weekList: { date: Date; days: number }[] = [];
    const allWeeks = eachWeekOfInterval({ start, end }, { locale: fr });
    allWeeks.forEach((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { locale: fr });
      const daysInWeek = allDays.filter((d) => d >= weekStart && d <= weekEnd).length;
      if (daysInWeek > 0) {
        weekList.push({ date: weekStart, days: daysInWeek });
      }
    });

    return { startDate: start, days: allDays, months: monthList, weeks: weekList };
  }, [filteredTasks, tasks]);

  // Hiérarchie
  const hierarchy = useMemo(() => {
    const map = new Map<string, GanttTask & { children: string[] }>();
    const roots: string[] = [];

    filteredTasks.forEach((t) => map.set(t.id, { ...t, children: [] }));
    filteredTasks.forEach((t) => {
      if (t.parentId && map.has(t.parentId)) {
        map.get(t.parentId)!.children.push(t.id);
      } else {
        roots.push(t.id);
      }
    });

    return { map, roots };
  }, [filteredTasks]);

  // Liste aplatie
  const flatList = useMemo(() => {
    const result: { task: GanttTask; level: number; hasChildren: boolean; index: number }[] = [];
    const traverse = (ids: string[], level: number) => {
      ids.forEach((id) => {
        const item = hierarchy.map.get(id);
        if (!item) return;
        const hasChildren = item.children.length > 0;
        result.push({ task: item, level, hasChildren, index: result.length });
        if (hasChildren && !collapsedIds.has(id)) {
          traverse(item.children, level + 1);
        }
      });
    };
    traverse(hierarchy.roots, 0);
    return result;
  }, [hierarchy, collapsedIds]);

  // Map des positions des tâches pour les dépendances
  const taskPositions = useMemo(() => {
    const positions = new Map<string, { y: number; left: number; width: number; right: number }>();
    flatList.forEach(({ task }, index) => {
      const startOffset = differenceInDays(task.startDate, startDate);
      const duration = Math.max(1, differenceInDays(task.endDate, task.startDate) + 1);
      const left = startOffset * DAY_WIDTH;
      const width = duration * DAY_WIDTH;
      positions.set(task.id, {
        y: index * ROW_HEIGHT + ROW_HEIGHT / 2,
        left,
        width,
        right: left + width,
      });
    });
    return positions;
  }, [flatList, startDate, DAY_WIDTH, ROW_HEIGHT]);

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getBarStyle = (task: GanttTask) => {
    const startOffset = differenceInDays(task.startDate, startDate);
    const duration = Math.max(1, differenceInDays(task.endDate, task.startDate) + 1);
    return { left: startOffset * DAY_WIDTH, width: duration * DAY_WIDTH };
  };

  const getTaskColor = (task: GanttTask): string => {
    if (task.color) return task.color;
    if (task.parentId) {
      const parent = hierarchy.map.get(task.parentId);
      if (parent) return getTaskColor(parent);
    }
    return COLORS.cyan;
  };

  // ===========================================
  // DRAG & DROP
  // ===========================================

  const handleDragStart = useCallback((e: React.MouseEvent, taskId: string, type: 'move' | 'resize-start' | 'resize-end') => {
    e.preventDefault();
    e.stopPropagation();

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.type === 'project' || task.type === 'group') return;

    setDraggingTask(taskId);
    setDragType(type);
    setDragStartX(e.clientX);
    setDragStartDate(task.startDate);
    setDragEndDate(task.endDate);
  }, [tasks]);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!draggingTask || !dragStartDate || !dragEndDate) return;

    const deltaX = e.clientX - dragStartX;
    const deltaDays = Math.round(deltaX / DAY_WIDTH);

    if (deltaDays === 0) return;

    const task = tasks.find((t) => t.id === draggingTask);
    if (!task) return;

    let newStartDate = task.startDate;
    let newEndDate = task.endDate;

    if (dragType === 'move') {
      newStartDate = addDays(dragStartDate, deltaDays);
      newEndDate = addDays(dragEndDate, deltaDays);
    } else if (dragType === 'resize-start') {
      newStartDate = addDays(dragStartDate, deltaDays);
      if (newStartDate >= newEndDate) {
        newStartDate = addDays(newEndDate, -1);
      }
    } else if (dragType === 'resize-end') {
      newEndDate = addDays(dragEndDate, deltaDays);
      if (newEndDate <= newStartDate) {
        newEndDate = addDays(newStartDate, 1);
      }
    }

    if (onTaskUpdate) {
      onTaskUpdate(draggingTask, { startDate: newStartDate, endDate: newEndDate });
    }
  }, [draggingTask, dragStartX, dragStartDate, dragEndDate, dragType, DAY_WIDTH, tasks, onTaskUpdate]);

  const handleDragEnd = useCallback(() => {
    setDraggingTask(null);
    setDragType(null);
    setDragStartX(0);
    setDragStartDate(null);
    setDragEndDate(null);
  }, []);

  useEffect(() => {
    if (draggingTask) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [draggingTask, handleDragMove, handleDragEnd]);

  // ===========================================
  // EXPORT
  // ===========================================

  const handleExport = useCallback(async (format: 'png' | 'pdf') => {
    const element = document.getElementById('gantt-export-area');
    if (!element) return;

    if (format === 'png') {
      try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const link = document.createElement('a');
        link.download = `${projectName}-gantt.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Export PNG failed:', error);
        alert('Export PNG non disponible. Installez html2canvas.');
      }
    } else if (format === 'pdf') {
      try {
        const html2canvas = (await import('html2canvas')).default;
        const { jsPDF } = await import('jspdf');
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4');
        const imgWidth = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${projectName}-gantt.pdf`);
      } catch (error) {
        console.error('Export PDF failed:', error);
        alert('Export PDF non disponible.');
      }
    }
  }, [projectName]);

  // ===========================================
  // HANDLERS POUR LES PANNEAUX
  // ===========================================

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const newDiscussion: Discussion = {
      id: Date.now().toString(),
      author: 'Moi',
      message: newMessage,
      timestamp: new Date(),
    };
    setDiscussions([newDiscussion, ...discussions]);
    setNewMessage('');
  };

  const handleAddTimeEntry = () => {
    if (!newTimeEntry.taskName || newTimeEntry.hours <= 0) return;
    const entry: TimeEntry = {
      id: Date.now().toString(),
      taskId: 'new',
      taskName: newTimeEntry.taskName,
      date: new Date(),
      hours: newTimeEntry.hours,
      description: newTimeEntry.description,
    };
    setTimeEntries([entry, ...timeEntries]);
    setNewTimeEntry({ taskName: '', hours: 0, description: '' });
  };

  // ===========================================
  // RENDER DEPENDENCY LINES
  // ===========================================

  const renderDependencyLines = useMemo(() => {
    if (!showDependencies) return null;

    const lines: React.ReactNode[] = [];

    flatList.forEach(({ task }) => {
      if (!task.dependencies || task.dependencies.length === 0) return;

      const targetPos = taskPositions.get(task.id);
      if (!targetPos) return;

      task.dependencies.forEach((depId) => {
        const sourcePos = taskPositions.get(depId);
        if (!sourcePos) return;

        const startX = sourcePos.right;
        const startY = sourcePos.y;
        const endX = targetPos.left;
        const endY = targetPos.y;

        const controlOffset = Math.abs(endY - startY) > ROW_HEIGHT ? 20 : 10;

        const path = endX > startX
          ? `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`
          : `M ${startX} ${startY} L ${startX + 15} ${startY} L ${startX + 15} ${startY + (endY > startY ? ROW_HEIGHT : -ROW_HEIGHT)} L ${endX - 15} ${endY} L ${endX} ${endY}`;

        lines.push(
          <g key={`dep-${depId}-${task.id}`}>
            <path
              d={path}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray={endX <= startX ? "4,2" : "none"}
              markerEnd="url(#arrowhead)"
            />
          </g>
        );
      });
    });

    return lines;
  }, [flatList, taskPositions, showDependencies, ROW_HEIGHT]);

  // ===========================================
  // RENDER PANELS
  // ===========================================

  const renderSidebarPanel = () => {
    if (!activeSidebarSection) return null;

    const panelContent = {
      projects: (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Mes Projets</h3>
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedSidebarItem(item.id)}
              >
                <FolderOpen className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">Projet actif</p>
                </div>
              </div>
            ))}
            <button className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500">
              <Plus className="w-5 h-5" />
              <span>Nouveau projet</span>
            </button>
          </div>
        </div>
      ),
      tasks: (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Mes Tâches</h3>
          <div className="space-y-2">
            {myTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => onTaskClick?.(task)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 text-sm truncate">{task.name}</span>
                  {task.priority && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                    />
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{format(task.endDate, 'dd MMM', { locale: fr })}</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${task.progress}%`, backgroundColor: getTaskColor(task) }}
                  />
                </div>
              </div>
            ))}
            {myTasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Aucune tâche assignée</p>
            )}
          </div>
        </div>
      ),
      discussions: (
        <div className="flex flex-col h-full">
          <h3 className="font-semibold text-gray-900 mb-4">Discussions</h3>
          <div className="flex-1 overflow-y-auto space-y-4">
            {discussions.map((disc) => (
              <div key={disc.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {disc.author.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">{disc.author}</span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(disc.timestamp, { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                    {disc.taskName && (
                      <p className="text-xs text-blue-600 mb-1">Re: {disc.taskName}</p>
                    )}
                    <p className="text-sm text-gray-700">{disc.message}</p>
                    {disc.replies && disc.replies.map((reply) => (
                      <div key={reply.id} className="mt-2 ml-4 pl-2 border-l-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-xs">{reply.author}</span>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(reply.timestamp, { addSuffix: true, locale: fr })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Écrire un message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ),
      timesheet: (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Feuille de temps</h3>
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700">
              Total cette semaine: <span className="font-bold">{timeEntries.reduce((acc, e) => acc + e.hours, 0)}h</span>
            </p>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 text-sm">{entry.taskName}</span>
                  <span className="text-sm font-bold text-blue-600">{entry.hours}h</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{format(entry.date, 'EEEE dd MMM', { locale: fr })}</span>
                  {entry.description && <span className="truncate ml-2">{entry.description}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <input
              type="text"
              value={newTimeEntry.taskName}
              onChange={(e) => setNewTimeEntry({ ...newTimeEntry, taskName: e.target.value })}
              placeholder="Tâche"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={newTimeEntry.hours || ''}
                onChange={(e) => setNewTimeEntry({ ...newTimeEntry, hours: Number(e.target.value) })}
                placeholder="Heures"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                value={newTimeEntry.description}
                onChange={(e) => setNewTimeEntry({ ...newTimeEntry, description: e.target.value })}
                placeholder="Description"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <button
              onClick={handleAddTimeEntry}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
            >
              Ajouter
            </button>
          </div>
        </div>
      ),
      availability: (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Disponibilité de l'équipe</h3>
          <div className="space-y-3">
            {mockTeamMembers.map((member) => (
              <div key={member.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                  <span className="text-xs text-gray-500">{member.tasksCount} tâches</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${100 - member.availability}%`,
                        backgroundColor: member.availability < 30 ? '#ef4444' : member.availability < 60 ? '#f59e0b' : '#22c55e',
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{
                    color: member.availability < 30 ? '#ef4444' : member.availability < 60 ? '#f59e0b' : '#22c55e',
                  }}>
                    {member.availability}% dispo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      reports: (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Rapports</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'completed').length}</p>
              <p className="text-xs text-blue-700">Tâches terminées</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{tasks.filter(t => t.status === 'in_progress').length}</p>
              <p className="text-xs text-orange-700">En cours</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{tasks.filter(t => t.status === 'delayed').length}</p>
              <p className="text-xs text-red-700">En retard</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.round(tasks.reduce((acc, t) => acc + t.progress, 0) / tasks.length) || 0}%
              </p>
              <p className="text-xs text-green-700">Progression</p>
            </div>
          </div>
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <button className="flex items-center gap-2 w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm">
              <FileText className="w-4 h-4 text-gray-500" />
              <span>Rapport d'avancement</span>
            </button>
            <button className="flex items-center gap-2 w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <span>Analyse des délais</span>
            </button>
            <button className="flex items-center gap-2 w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm">
              <Users className="w-4 h-4 text-gray-500" />
              <span>Charge équipe</span>
            </button>
          </div>
        </div>
      ),
      settings: (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Paramètres</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="text-sm">Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 peer-checked:bg-blue-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-500" />
                <span className="text-sm">Mode sombre</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 peer-checked:bg-blue-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-sm">Résumé par email</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 peer-checked:bg-blue-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-gray-500" />
                <span className="text-sm">Langue</span>
              </div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm">Format de date</span>
              </div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                <option value="yyyy-MM-dd">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      ),
    };

    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => setActiveSidebarSection(null)}
        />
        {/* Panel */}
        <div className="relative w-96 h-full bg-white shadow-xl ml-56 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">
              {activeSidebarSection === 'projects' && 'Mes Projets'}
              {activeSidebarSection === 'tasks' && 'Mes Tâches'}
              {activeSidebarSection === 'discussions' && 'Discussions'}
              {activeSidebarSection === 'timesheet' && 'Feuille de temps'}
              {activeSidebarSection === 'availability' && 'Disponibilité'}
              {activeSidebarSection === 'reports' && 'Rapports'}
              {activeSidebarSection === 'settings' && 'Paramètres'}
            </h2>
            <button
              onClick={() => setActiveSidebarSection(null)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {panelContent[activeSidebarSection]}
          </div>
        </div>
      </div>
    );
  };

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-100 rounded-lg overflow-hidden shadow-lg">
      {/* ===== SIDEBAR GAUCHE ===== */}
      <div className="w-56 flex-shrink-0 flex flex-col" style={{ backgroundColor: COLORS.primary }}>
        {/* Logo / Header */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-white" />
            <span className="text-white font-bold text-lg">Gantt</span>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded text-white/70 text-sm">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white placeholder-white/50 w-full"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          <SidebarItem
            icon={<FolderOpen className="w-4 h-4" />}
            label="Mes Projets"
            active={activeSidebarSection === 'projects'}
            onClick={() => setActiveSidebarSection(activeSidebarSection === 'projects' ? null : 'projects')}
          />
          <SidebarItem
            icon={<CheckSquare className="w-4 h-4" />}
            label="Mes Tâches"
            badge={myTasks.length}
            active={activeSidebarSection === 'tasks'}
            onClick={() => setActiveSidebarSection(activeSidebarSection === 'tasks' ? null : 'tasks')}
          />
          <SidebarItem
            icon={<MessageCircle className="w-4 h-4" />}
            label="Discussions"
            badge={discussions.length}
            active={activeSidebarSection === 'discussions'}
            onClick={() => setActiveSidebarSection(activeSidebarSection === 'discussions' ? null : 'discussions')}
          />
          <SidebarItem
            icon={<Clock className="w-4 h-4" />}
            label="Feuille de temps"
            active={activeSidebarSection === 'timesheet'}
            onClick={() => setActiveSidebarSection(activeSidebarSection === 'timesheet' ? null : 'timesheet')}
          />
          <SidebarItem
            icon={<Users className="w-4 h-4" />}
            label="Disponibilité"
            active={activeSidebarSection === 'availability'}
            onClick={() => setActiveSidebarSection(activeSidebarSection === 'availability' ? null : 'availability')}
          />
          <SidebarItem
            icon={<FileText className="w-4 h-4" />}
            label="Rapports"
            active={activeSidebarSection === 'reports'}
            onClick={() => setActiveSidebarSection(activeSidebarSection === 'reports' ? null : 'reports')}
          />
          <SidebarItem
            icon={<Settings className="w-4 h-4" />}
            label="Paramètres"
            active={activeSidebarSection === 'settings'}
            onClick={() => setActiveSidebarSection(activeSidebarSection === 'settings' ? null : 'settings')}
          />

          {/* Section Projets */}
          <div className="pt-4">
            <div className="px-2 py-1 text-xs font-semibold text-white/50 uppercase tracking-wider">
              Projets Actifs
            </div>
            {sidebarItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${
                  selectedSidebarItem === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setSelectedSidebarItem(item.id)}
              >
                <FolderOpen className="w-4 h-4" />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top Bar avec tabs */}
        <div className="border-b border-gray-200">
          {/* Projet Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900">{projectName}</h1>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('png')}
                className="flex items-center gap-1 px-2 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm"
                title="Exporter en PNG"
              >
                <Download className="w-4 h-4" />
                PNG
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-1 px-2 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm"
                title="Exporter en PDF"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center px-4">
            <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')}>
              SOMMAIRE
            </TabButton>
            <TabButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} badge={filteredTasks.length}>
              TÂCHES
            </TabButton>
            <TabButton active={activeTab === 'discussions'} onClick={() => setActiveTab('discussions')} badge={discussions.length}>
              DISCUSSIONS
            </TabButton>
            <TabButton active={activeTab === 'files'} onClick={() => setActiveTab('files')}>
              FICHIERS
            </TabButton>
            <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
              HISTORIQUE
            </TabButton>
            <TabButton active={activeTab === 'people'} onClick={() => setActiveTab('people')}>
              ÉQUIPE
            </TabButton>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded">
              <button
                onClick={() => setZoomLevel('day')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  zoomLevel === 'day' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Jour
              </button>
              <button
                onClick={() => setZoomLevel('week')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  zoomLevel === 'week' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setZoomLevel('month')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  zoomLevel === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Mois
              </button>
            </div>

            <button
              onClick={() => setShowDependencies(!showDependencies)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                showDependencies ? 'bg-blue-100 text-blue-700' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              Dépendances
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-700' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filtres
            </button>
          </div>

          <div className="flex items-center gap-1 bg-gray-200 rounded p-0.5">
            <button
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'gantt'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              GANTT
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              LISTE
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Statut:</span>
              <div className="flex gap-1">
                {(['pending', 'in_progress', 'completed', 'delayed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        status: prev.status.includes(status)
                          ? prev.status.filter((s) => s !== status)
                          : [...prev.status, status],
                      }));
                    }}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      filters.status.includes(status)
                        ? 'text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    style={filters.status.includes(status) ? { backgroundColor: STATUS_COLORS[status] } : {}}
                  >
                    {status === 'pending' ? 'En attente' :
                     status === 'in_progress' ? 'En cours' :
                     status === 'completed' ? 'Terminé' : 'En retard'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Priorité:</span>
              <div className="flex gap-1">
                {(['low', 'medium', 'high', 'critical'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        priority: prev.priority.includes(priority)
                          ? prev.priority.filter((p) => p !== priority)
                          : [...prev.priority, priority],
                      }));
                    }}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      filters.priority.includes(priority)
                        ? 'text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    style={filters.priority.includes(priority) ? { backgroundColor: PRIORITY_COLORS[priority] } : {}}
                  >
                    {priority === 'low' ? 'Basse' :
                     priority === 'medium' ? 'Moyenne' :
                     priority === 'high' ? 'Haute' : 'Critique'}
                  </button>
                ))}
              </div>
            </div>

            {(filters.status.length > 0 || filters.priority.length > 0 || filters.assignee.length > 0) && (
              <button
                onClick={() => setFilters({ status: [], assignee: [], priority: [] })}
                className="px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 rounded"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        )}

        {/* ===== TAB CONTENT ===== */}

        {/* SOMMAIRE Tab */}
        {activeTab === 'summary' && (
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{filteredTasks.filter(t => t.progress === 100).length}/{filteredTasks.length}</p>
                      <p className="text-sm text-gray-500">Tâches terminées</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(filteredTasks.reduce((acc, t) => acc + t.progress, 0) / (filteredTasks.length || 1))}%</p>
                      <p className="text-sm text-gray-500">Progression globale</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{filteredTasks.filter(t => t.status === 'delayed').length}</p>
                      <p className="text-sm text-gray-500">Tâches en retard</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{mockTeamMembers.length}</p>
                      <p className="text-sm text-gray-500">Membres de l'équipe</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Upcoming Tasks */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-500" />
                    Activité récente
                  </h3>
                  <div className="space-y-3">
                    {discussions.slice(0, 3).map((disc) => (
                      <div key={disc.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {disc.author.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{disc.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {disc.author} • {formatDistanceToNow(disc.timestamp, { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    Prochaines échéances
                  </h3>
                  <div className="space-y-3">
                    {filteredTasks.filter(t => t.progress < 100).sort((a, b) => a.endDate.getTime() - b.endDate.getTime()).slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {task.priority && (
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLORS[task.priority] }} />
                          )}
                          <span className="text-sm text-gray-900 truncate">{task.name}</span>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">{format(task.endDate, 'dd MMM', { locale: fr })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress by Status */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Répartition par statut</h3>
                <div className="flex gap-4">
                  {(['pending', 'in_progress', 'completed', 'delayed'] as const).map((status) => {
                    const count = filteredTasks.filter(t => t.status === status).length;
                    const percentage = filteredTasks.length > 0 ? Math.round((count / filteredTasks.length) * 100) : 0;
                    return (
                      <div key={status} className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
                          <span className="text-sm font-medium text-gray-700">
                            {status === 'pending' ? 'En attente' : status === 'in_progress' ? 'En cours' : status === 'completed' ? 'Terminé' : 'En retard'}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                        <p className="text-xs text-gray-500">{percentage}% du total</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DISCUSSIONS Tab */}
        {activeTab === 'discussions' && (
          <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-3xl mx-auto space-y-4">
                {discussions.map((disc) => (
                  <div key={disc.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                        {disc.author.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{disc.author}</span>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(disc.timestamp, { addSuffix: true, locale: fr })}
                          </span>
                        </div>
                        {disc.taskName && (
                          <p className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Re: {disc.taskName}
                          </p>
                        )}
                        <p className="text-gray-700">{disc.message}</p>
                        {disc.replies && disc.replies.length > 0 && (
                          <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                            {disc.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs flex-shrink-0">
                                  {reply.author.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 text-sm">{reply.author}</span>
                                    <span className="text-xs text-gray-400">
                                      {formatDistanceToNow(reply.timestamp, { addSuffix: true, locale: fr })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{reply.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                          <button className="hover:text-blue-600 flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            Répondre
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="max-w-3xl mx-auto flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Écrire un nouveau message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FICHIERS Tab */}
        {activeTab === 'files' && (
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Fichiers du projet</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Upload className="w-4 h-4" />
                  Ajouter un fichier
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un fichier..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>Tous les types</option>
                    <option>Documents</option>
                    <option>Images</option>
                    <option>Plans</option>
                  </select>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { name: 'Plan_Niveau_1.dwg', type: 'Plan', size: '2.4 MB', date: new Date(), author: 'Pierre Durand' },
                    { name: 'Contrat_Bail_Commercial.pdf', type: 'Document', size: '450 KB', date: addDays(new Date(), -2), author: 'Jean Martin' },
                    { name: 'Etude_Impact.docx', type: 'Document', size: '1.2 MB', date: addDays(new Date(), -5), author: 'Marie Dupont' },
                    { name: 'Photo_Chantier_01.jpg', type: 'Image', size: '3.8 MB', date: addDays(new Date(), -1), author: 'Sophie Bernard' },
                    { name: 'Budget_Previsionnel.xlsx', type: 'Document', size: '890 KB', date: addDays(new Date(), -7), author: 'Marie Dupont' },
                  ].map((file, idx) => (
                    <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        file.type === 'Plan' ? 'bg-purple-100' : file.type === 'Image' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {file.type === 'Plan' ? (
                          <FileText className={`w-5 h-5 text-purple-600`} />
                        ) : file.type === 'Image' ? (
                          <Image className={`w-5 h-5 text-green-600`} />
                        ) : (
                          <File className={`w-5 h-5 text-blue-600`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.author} • {format(file.date, 'dd MMM yyyy', { locale: fr })}</p>
                      </div>
                      <span className="text-sm text-gray-500">{file.size}</span>
                      <button className="p-2 hover:bg-gray-200 rounded-lg">
                        <Download className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded-lg">
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HISTORIQUE Tab */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Historique du projet</h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {[
                    { action: 'Tâche terminée', detail: 'Fondations terminées avec 2 jours d\'avance', user: 'Pierre Durand', date: new Date(), type: 'success' },
                    { action: 'Commentaire ajouté', detail: 'Discussion sur les clauses du bail commercial', user: 'Sophie Bernard', date: addDays(new Date(), -1), type: 'comment' },
                    { action: 'Fichier ajouté', detail: 'Plan_Niveau_1.dwg', user: 'Pierre Durand', date: addDays(new Date(), -2), type: 'file' },
                    { action: 'Membre ajouté', detail: 'Claire Petit a rejoint l\'équipe', user: 'Marie Dupont', date: addDays(new Date(), -3), type: 'team' },
                    { action: 'Jalon atteint', detail: 'Phase 1 - Études préliminaires terminée', user: 'Système', date: addDays(new Date(), -5), type: 'milestone' },
                    { action: 'Tâche créée', detail: 'Recrutement équipe exploitation', user: 'Marie Dupont', date: addDays(new Date(), -7), type: 'task' },
                    { action: 'Projet créé', detail: 'Centre Commercial Grand Place', user: 'Marie Dupont', date: addDays(new Date(), -30), type: 'project' },
                  ].map((event, idx) => (
                    <div key={idx} className="relative pl-10">
                      <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white ${
                        event.type === 'success' ? 'bg-green-500' :
                        event.type === 'comment' ? 'bg-blue-500' :
                        event.type === 'file' ? 'bg-purple-500' :
                        event.type === 'team' ? 'bg-orange-500' :
                        event.type === 'milestone' ? 'bg-yellow-500' :
                        event.type === 'task' ? 'bg-cyan-500' : 'bg-gray-500'
                      }`}></div>
                      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{event.action}</span>
                          <span className="text-xs text-gray-500">{format(event.date, 'dd MMM yyyy HH:mm', { locale: fr })}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{event.detail}</p>
                        <p className="text-xs text-gray-500">par {event.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉQUIPE Tab */}
        {activeTab === 'people' && (
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Équipe du projet</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  Ajouter un membre
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {mockTeamMembers.map((member) => (
                  <div key={member.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-500 mb-3">{member.role}</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Disponibilité</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${member.availability}%`,
                                    backgroundColor: member.availability > 70 ? '#22c55e' : member.availability > 40 ? '#f59e0b' : '#ef4444'
                                  }}
                                />
                              </div>
                              <span className="text-gray-700 font-medium">{member.availability}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500">Tâches assignées</p>
                            <p className="text-gray-900 font-medium mt-1">{member.tasksCount} tâches</p>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TÂCHES Tab - GANTT CHART */}
        {activeTab === 'tasks' && (
        <div id="gantt-export-area" className="flex-1 flex overflow-hidden">
          {/* Panneau gauche - Liste des tâches */}
          <div className="w-[500px] flex-shrink-0 border-r border-gray-200 flex flex-col">
            <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <div className="flex-1 px-3 py-2">Tâche</div>
              <div className="w-28 px-2 py-2 text-center border-l border-gray-200">Assigné</div>
              <div className="w-20 px-2 py-2 text-center border-l border-gray-200">% Fait</div>
            </div>

            <div
              ref={taskListRef}
              className="flex-1 overflow-y-auto overflow-x-hidden"
              onScroll={handleTaskListScroll}
            >
              {flatList.map(({ task, level, hasChildren }) => {
                const isHovered = hoveredId === task.id;
                const isCollapsed = collapsedIds.has(task.id);
                const isGroup = task.type === 'group' || task.type === 'project';

                return (
                  <div
                    key={task.id}
                    className={`flex border-b border-gray-100 cursor-pointer transition-colors ${
                      isHovered ? 'bg-blue-50' : ''
                    } ${draggingTask === task.id ? 'bg-blue-100' : ''}`}
                    style={{ height: ROW_HEIGHT }}
                    onMouseEnter={() => setHoveredId(task.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => onTaskClick?.(task)}
                  >
                    <div className="flex-1 flex items-center overflow-hidden">
                      <div style={{ width: level * 16 + 8 }} />

                      {hasChildren ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleCollapse(task.id); }}
                          className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </button>
                      ) : (
                        <div className="w-5" />
                      )}

                      {task.priority && (
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                          title={task.priority}
                        />
                      )}

                      <div
                        className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center flex-shrink-0 ${
                          task.progress === 100
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {task.progress === 100 && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>

                      {task.comments && task.comments > 0 && (
                        <div className="flex items-center text-gray-400 mr-1.5">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="text-xs ml-0.5">{task.comments}</span>
                        </div>
                      )}

                      {task.dependencies && task.dependencies.length > 0 && (
                        <div className="flex items-center text-blue-400 mr-1.5" title={`${task.dependencies.length} dépendance(s)`}>
                          <Link className="w-3 h-3" />
                        </div>
                      )}

                      <span className={`truncate text-sm ${isGroup ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {task.name}
                      </span>
                    </div>

                    <div className="w-28 flex items-center justify-center border-l border-gray-100 px-1">
                      {task.assignee ? (
                        <div className="flex items-center gap-1.5" title={task.assignee.name}>
                          {task.assignee.avatar ? (
                            <img
                              src={task.assignee.avatar}
                              alt={task.assignee.name}
                              className="w-6 h-6 rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                              <User className="w-3.5 h-3.5 text-gray-600" />
                            </div>
                          )}
                          <span className="text-xs text-gray-600 truncate">
                            {task.assignee.name.split(' ')[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>

                    <div className="w-20 flex items-center justify-center border-l border-gray-100">
                      <span className={`text-sm tabular-nums ${task.progress === 100 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panneau droit - Timeline */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              ref={timelineHeaderRef}
              className="border-b border-gray-200 bg-gray-50 overflow-x-scroll flex-shrink-0 scrollbar-hide"
            >
              <div style={{ width: days.length * DAY_WIDTH }}>
                <div className="flex border-b border-gray-200" style={{ height: 24 }}>
                  {months.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-xs font-medium text-gray-600 border-r border-gray-200"
                      style={{ width: m.days * DAY_WIDTH }}
                    >
                      {format(m.date, 'MMMM yyyy', { locale: fr })}
                    </div>
                  ))}
                </div>
                <div className="flex" style={{ height: 24 }}>
                  {zoomLevel === 'day' && days.map((day, i) => {
                    const isWE = isWeekend(day);
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-center text-xs border-r ${
                          isWE ? 'bg-gray-100 text-gray-400' : 'text-gray-500'
                        } border-gray-200`}
                        style={{ width: DAY_WIDTH }}
                      >
                        {day.getDate()}
                      </div>
                    );
                  })}
                  {zoomLevel === 'week' && weeks.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-xs text-gray-500 border-r border-gray-200"
                      style={{ width: w.days * DAY_WIDTH }}
                    >
                      S{format(w.date, 'w', { locale: fr })}
                    </div>
                  ))}
                  {zoomLevel === 'month' && months.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-xs text-gray-500 border-r border-gray-200"
                      style={{ width: m.days * DAY_WIDTH }}
                    >
                      {format(m.date, 'MMM', { locale: fr })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              ref={timelineRef}
              className="flex-1 overflow-auto"
              onScroll={handleTimelineScroll}
            >
              <div
                className="relative"
                style={{ width: days.length * DAY_WIDTH, height: flatList.length * ROW_HEIGHT }}
              >
                <svg ref={svgRef} className="absolute inset-0 pointer-events-none" style={{ width: days.length * DAY_WIDTH, height: flatList.length * ROW_HEIGHT }}>
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                    </marker>
                  </defs>

                  {days.map((day, i) => {
                    const isWE = isWeekend(day);
                    return (
                      <g key={i}>
                        {isWE && (
                          <rect x={i * DAY_WIDTH} y={0} width={DAY_WIDTH} height={flatList.length * ROW_HEIGHT} fill="#f9fafb" />
                        )}
                        <line x1={(i + 1) * DAY_WIDTH} y1={0} x2={(i + 1) * DAY_WIDTH} y2={flatList.length * ROW_HEIGHT} stroke="#e5e7eb" />
                      </g>
                    );
                  })}
                  {flatList.map((_, i) => (
                    <line key={`h${i}`} x1={0} y1={(i + 1) * ROW_HEIGHT} x2={days.length * DAY_WIDTH} y2={(i + 1) * ROW_HEIGHT} stroke="#f3f4f6" />
                  ))}

                  {renderDependencyLines}
                </svg>

                {(() => {
                  const today = new Date();
                  const offset = differenceInDays(today, startDate);
                  if (offset >= 0 && offset < days.length) {
                    return <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20" style={{ left: offset * DAY_WIDTH + DAY_WIDTH / 2 }} />;
                  }
                  return null;
                })()}

                {flatList.map(({ task }, index) => {
                  const { left, width } = getBarStyle(task);
                  const color = getTaskColor(task);
                  const isHovered = hoveredId === task.id;
                  const isDragging = draggingTask === task.id;
                  const isGroup = task.type === 'group' || task.type === 'project';
                  const isMilestone = task.type === 'milestone';
                  const y = index * ROW_HEIGHT;

                  return (
                    <div
                      key={task.id}
                      className="absolute"
                      style={{ top: y, height: ROW_HEIGHT }}
                      onMouseEnter={() => setHoveredId(task.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {isMilestone ? (
                        <div
                          className="absolute cursor-pointer"
                          style={{
                            left: left + DAY_WIDTH / 2 - 8,
                            top: ROW_HEIGHT / 2 - 8,
                            width: 16,
                            height: 16,
                            backgroundColor: color,
                            transform: 'rotate(45deg)',
                          }}
                          onClick={() => onTaskClick?.(task)}
                        />
                      ) : isGroup ? (
                        <div className="absolute flex items-center" style={{ left: left - 6, top: ROW_HEIGHT / 2 - 4 }}>
                          <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderRight: `6px solid ${color}` }} />
                          <div style={{ width, height: 8, backgroundColor: color }} />
                          <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `6px solid ${color}` }} />
                        </div>
                      ) : (
                        <div
                          className={`absolute rounded-sm overflow-hidden group ${isHovered || isDragging ? 'shadow-md z-10' : 'shadow-sm'}`}
                          style={{
                            left: left + 2,
                            top: ROW_HEIGHT / 2 - 10,
                            width: width - 4,
                            height: 20,
                            cursor: isDragging ? 'grabbing' : 'grab',
                          }}
                        >
                          <div className="absolute inset-0" style={{ backgroundColor: color, opacity: 0.3 }} />
                          <div className="absolute inset-y-0 left-0" style={{ width: `${task.progress}%`, backgroundColor: color }} />

                          <div
                            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-black/20"
                            onMouseDown={(e) => handleDragStart(e, task.id, 'resize-start')}
                          />

                          <div
                            className="absolute inset-0 cursor-grab active:cursor-grabbing"
                            onMouseDown={(e) => handleDragStart(e, task.id, 'move')}
                          >
                            {width > 60 && (
                              <span className="absolute inset-0 flex items-center px-2 text-xs text-white font-medium truncate pointer-events-none">
                                {task.name}
                              </span>
                            )}
                          </div>

                          <div
                            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-black/20"
                            onMouseDown={(e) => handleDragStart(e, task.id, 'resize-end')}
                          />

                          <div className="absolute inset-0 border rounded-sm" style={{ borderColor: color }} />
                        </div>
                      )}

                      {isHovered && !isDragging && (
                        <div
                          className="absolute z-30 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none"
                          style={{
                            left: left + width / 2,
                            top: -28,
                            transform: 'translateX(-50%)',
                          }}
                        >
                          <div className="font-medium">{task.name}</div>
                          <div className="text-gray-400">
                            {format(task.startDate, 'dd/MM', { locale: fr })} - {format(task.endDate, 'dd/MM', { locale: fr })} • {task.progress}%
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        )}

      </div>

      {/* Panneau latéral */}
      {renderSidebarPanel()}
    </div>
  );
}

// ===========================================
// SOUS-COMPOSANTS
// ===========================================

function SidebarItem({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${
        active ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">{badge}</span>
      )}
    </div>
  );
}

function TabButton({ children, active, onClick, badge }: { children: React.ReactNode; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      <span className="flex items-center gap-1.5">
        {children}
        {badge !== undefined && (
          <span className={`px-1.5 py-0.5 rounded-full text-xs ${active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
            {badge}
          </span>
        )}
      </span>
    </button>
  );
}

export default TeamGanttView;
