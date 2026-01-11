import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  MessageCircle,
} from 'lucide-react';
import {
  format,
  differenceInDays,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  isSameMonth,
  addMonths,
  subMonths,
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
  collapsed?: boolean;
  comments?: number;
}

export interface GanttGroup {
  id: string;
  name: string;
  color: string;
  tasks: GanttTask[];
}

interface GanttChartProps {
  tasks: GanttTask[];
  onTaskClick?: (task: GanttTask) => void;
}

// ===========================================
// COMPOSANT GANTT - STYLE TEAMGANTT
// ===========================================

export function GanttChart({ tasks, onTaskClick }: GanttChartProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Synchroniser le scroll vertical
  const handleTimelineScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (listRef.current) {
      listRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  }, []);

  const handleListScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  }, []);

  // Calculer la plage de dates
  const { startDate, endDate, days, months } = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      const start = startOfMonth(subMonths(today, 1));
      const end = endOfMonth(addMonths(today, 2));
      return {
        startDate: start,
        endDate: end,
        days: eachDayOfInterval({ start, end }),
        months: [] as { date: Date; days: number }[],
      };
    }

    let minDate = tasks[0].startDate;
    let maxDate = tasks[0].endDate;
    tasks.forEach((t) => {
      if (t.startDate < minDate) minDate = t.startDate;
      if (t.endDate > maxDate) maxDate = t.endDate;
    });

    const start = startOfMonth(subMonths(minDate, 1));
    const end = endOfMonth(addMonths(maxDate, 1));
    const allDays = eachDayOfInterval({ start, end });

    // Grouper par mois
    const monthList: { date: Date; days: number }[] = [];
    let currentMonth = startOfMonth(start);
    while (currentMonth <= end) {
      const daysInMonth = allDays.filter((d) => isSameMonth(d, currentMonth)).length;
      if (daysInMonth > 0) {
        monthList.push({ date: currentMonth, days: daysInMonth });
      }
      currentMonth = addMonths(currentMonth, 1);
    }

    return { startDate: start, endDate: end, days: allDays, months: monthList };
  }, [tasks]);

  // Construire la hiérarchie
  const hierarchy = useMemo(() => {
    const map = new Map<string, GanttTask & { children: string[] }>();
    const roots: string[] = [];

    tasks.forEach((t) => {
      map.set(t.id, { ...t, children: [] });
    });

    tasks.forEach((t) => {
      if (t.parentId && map.has(t.parentId)) {
        map.get(t.parentId)!.children.push(t.id);
      } else {
        roots.push(t.id);
      }
    });

    return { map, roots };
  }, [tasks]);

  // Aplatir pour l'affichage
  const flatList = useMemo(() => {
    const result: { task: GanttTask; level: number; hasChildren: boolean }[] = [];

    const traverse = (ids: string[], level: number) => {
      ids.forEach((id) => {
        const item = hierarchy.map.get(id);
        if (!item) return;
        const hasChildren = item.children.length > 0;
        result.push({ task: item, level, hasChildren });
        if (hasChildren && !collapsedIds.has(id)) {
          traverse(item.children, level + 1);
        }
      });
    };

    traverse(hierarchy.roots, 0);
    return result;
  }, [hierarchy, collapsedIds]);

  // Toggle collapse
  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Dimensions
  const DAY_WIDTH = 32;
  const ROW_HEIGHT = 36;
  const LIST_WIDTH = 300;
  const PERCENT_WIDTH = 70;

  // Position de la barre
  const getBarStyle = (task: GanttTask) => {
    const startOffset = differenceInDays(task.startDate, startDate);
    const duration = Math.max(1, differenceInDays(task.endDate, task.startDate) + 1);
    return {
      left: startOffset * DAY_WIDTH,
      width: duration * DAY_WIDTH,
    };
  };

  // Trouver la couleur du parent
  const getTaskColor = (task: GanttTask): string => {
    if (task.color) return task.color;
    if (task.parentId) {
      const parent = hierarchy.map.get(task.parentId);
      if (parent) return getTaskColor(parent);
    }
    return '#60a5fa';
  };

  return (
    <div className="gantt-container flex border border-gray-300 rounded-lg overflow-hidden bg-white text-sm">
      {/* ===== PANNEAU GAUCHE ===== */}
      <div className="flex-shrink-0 bg-white border-r border-gray-200" style={{ width: LIST_WIDTH + PERCENT_WIDTH }}>
        {/* Header */}
        <div className="flex bg-gray-100 border-b border-gray-300" style={{ height: 50 }}>
          <div className="flex items-center px-3 font-semibold text-gray-700" style={{ width: LIST_WIDTH }}>
            Tâche
          </div>
          <div className="flex items-center justify-center font-semibold text-gray-700 border-l border-gray-300" style={{ width: PERCENT_WIDTH }}>
            % Fait
          </div>
        </div>

        {/* Liste */}
        <div
          ref={listRef}
          className="overflow-y-auto overflow-x-hidden"
          style={{ height: 'calc(70vh - 50px)' }}
          onScroll={handleListScroll}
        >
          {flatList.map(({ task, level, hasChildren }) => {
            const isHovered = hoveredId === task.id;
            const isCollapsed = collapsedIds.has(task.id);
            const isGroupOrProject = task.type === 'group' || task.type === 'project';

            return (
              <div
                key={task.id}
                className={`flex border-b border-gray-100 cursor-pointer transition-colors ${
                  isHovered ? 'bg-blue-50' : isGroupOrProject ? 'bg-gray-50' : 'bg-white'
                }`}
                style={{ height: ROW_HEIGHT }}
                onMouseEnter={() => setHoveredId(task.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onTaskClick?.(task)}
              >
                {/* Nom avec indentation */}
                <div className="flex items-center overflow-hidden" style={{ width: LIST_WIDTH }}>
                  <div style={{ width: level * 20 + 8 }} />

                  {/* Expand/Collapse */}
                  {hasChildren ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCollapse(task.id);
                      }}
                      className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded mr-1"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  ) : (
                    <div className="w-6" />
                  )}

                  {/* Cercle checkbox */}
                  <div
                    className={`w-4 h-4 rounded-full border-2 mr-2 flex-shrink-0 ${
                      task.progress === 100
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {task.progress === 100 && (
                      <svg className="w-full h-full text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  {/* Commentaires */}
                  {task.comments && task.comments > 0 && (
                    <div className="flex items-center text-gray-400 mr-2">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="text-xs ml-0.5">{task.comments}</span>
                    </div>
                  )}

                  {/* Nom */}
                  <span
                    className={`truncate ${
                      isGroupOrProject ? 'font-semibold text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    {task.name}
                  </span>
                </div>

                {/* Pourcentage */}
                <div
                  className="flex items-center justify-center border-l border-gray-100"
                  style={{ width: PERCENT_WIDTH }}
                >
                  <span className={`tabular-nums ${task.progress === 100 ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                    {task.progress}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== PANNEAU DROIT - TIMELINE ===== */}
      <div className="flex-1 overflow-hidden">
        {/* Header dates */}
        <div className="bg-gray-100 border-b border-gray-300" style={{ height: 50 }}>
          <div className="overflow-x-auto h-full" style={{ width: '100%' }}>
            <div style={{ width: days.length * DAY_WIDTH, minWidth: '100%' }}>
              {/* Mois */}
              <div className="flex" style={{ height: 25 }}>
                {months.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center text-sm font-semibold text-gray-700 border-r border-gray-200"
                    style={{ width: m.days * DAY_WIDTH }}
                  >
                    {format(m.date, 'MMMM yyyy', { locale: fr })}
                  </div>
                ))}
              </div>
              {/* Jours */}
              <div className="flex" style={{ height: 25 }}>
                {days.map((day, i) => {
                  const isWE = isWeekend(day);
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-center text-xs border-r ${
                        isWE ? 'bg-gray-200 text-gray-400' : 'text-gray-600'
                      } border-gray-200`}
                      style={{ width: DAY_WIDTH }}
                    >
                      {day.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Zone des barres */}
        <div
          ref={timelineRef}
          className="overflow-auto"
          style={{ height: 'calc(70vh - 50px)' }}
          onScroll={handleTimelineScroll}
        >
          <div
            className="relative"
            style={{
              width: days.length * DAY_WIDTH,
              height: flatList.length * ROW_HEIGHT,
              minWidth: '100%',
            }}
          >
            {/* Grille verticale */}
            <svg className="absolute inset-0 pointer-events-none" style={{ width: days.length * DAY_WIDTH, height: flatList.length * ROW_HEIGHT }}>
              {days.map((day, i) => {
                const isWE = isWeekend(day);
                return (
                  <g key={i}>
                    {isWE && (
                      <rect
                        x={i * DAY_WIDTH}
                        y={0}
                        width={DAY_WIDTH}
                        height={flatList.length * ROW_HEIGHT}
                        fill="#f3f4f6"
                      />
                    )}
                    <line
                      x1={i * DAY_WIDTH}
                      y1={0}
                      x2={i * DAY_WIDTH}
                      y2={flatList.length * ROW_HEIGHT}
                      stroke="#e5e7eb"
                      strokeWidth={1}
                    />
                  </g>
                );
              })}
              {/* Lignes horizontales */}
              {flatList.map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={(i + 1) * ROW_HEIGHT}
                  x2={days.length * DAY_WIDTH}
                  y2={(i + 1) * ROW_HEIGHT}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              ))}
            </svg>

            {/* Ligne aujourd'hui */}
            {(() => {
              const today = new Date();
              const offset = differenceInDays(today, startDate);
              if (offset >= 0 && offset < days.length) {
                return (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30"
                    style={{ left: offset * DAY_WIDTH + DAY_WIDTH / 2 }}
                  />
                );
              }
              return null;
            })()}

            {/* Barres */}
            {flatList.map(({ task }, index) => {
              const { left, width } = getBarStyle(task);
              const color = getTaskColor(task);
              const isHovered = hoveredId === task.id;
              const isGroup = task.type === 'group' || task.type === 'project';
              const isMilestone = task.type === 'milestone';
              const y = index * ROW_HEIGHT;

              return (
                <div
                  key={task.id}
                  className="absolute"
                  style={{ top: y, left: 0, right: 0, height: ROW_HEIGHT }}
                  onMouseEnter={() => setHoveredId(task.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {isMilestone ? (
                    // Losange
                    <div
                      className="absolute"
                      style={{
                        left: left + width / 2 - 6,
                        top: ROW_HEIGHT / 2 - 6,
                        width: 12,
                        height: 12,
                        backgroundColor: color,
                        transform: 'rotate(45deg)',
                      }}
                    />
                  ) : isGroup ? (
                    // Barre de groupe avec triangles
                    <div
                      className="absolute flex items-center"
                      style={{ left: left - 6, top: ROW_HEIGHT / 2 - 4, height: 8 }}
                    >
                      {/* Triangle gauche */}
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          borderTop: '4px solid transparent',
                          borderBottom: '4px solid transparent',
                          borderRight: `6px solid ${color}`,
                        }}
                      />
                      {/* Barre */}
                      <div style={{ width: width, height: 8, backgroundColor: color }} />
                      {/* Triangle droit */}
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          borderTop: '4px solid transparent',
                          borderBottom: '4px solid transparent',
                          borderLeft: `6px solid ${color}`,
                        }}
                      />
                    </div>
                  ) : (
                    // Barre de tâche avec progression
                    <div
                      className={`absolute rounded cursor-pointer transition-shadow ${isHovered ? 'shadow-lg z-10' : 'shadow'}`}
                      style={{
                        left: left + 2,
                        top: ROW_HEIGHT / 2 - 9,
                        width: width - 4,
                        height: 18,
                      }}
                      onClick={() => onTaskClick?.(task)}
                    >
                      {/* Fond clair */}
                      <div
                        className="absolute inset-0 rounded"
                        style={{ backgroundColor: color, opacity: 0.35 }}
                      />
                      {/* Progression */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-l"
                        style={{
                          width: `${task.progress}%`,
                          backgroundColor: color,
                          borderTopRightRadius: task.progress === 100 ? '4px' : 0,
                          borderBottomRightRadius: task.progress === 100 ? '4px' : 0,
                        }}
                      />
                      {/* Bordure */}
                      <div
                        className="absolute inset-0 rounded border"
                        style={{ borderColor: color }}
                      />
                    </div>
                  )}

                  {/* Tooltip */}
                  {isHovered && (
                    <div
                      className="absolute z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none"
                      style={{
                        left: left + width / 2,
                        top: -30,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      {task.name} - {task.progress}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GanttChart;
