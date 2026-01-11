/**
 * Analytics local - Tracking des événements utilisateur
 * Stocke les métriques dans IndexedDB pour analyse
 */

import { db } from '../db/database';

// Types d'événements
export type EventType =
  | 'page_view'
  | 'action'
  | 'error'
  | 'performance'
  | 'feature_use'
  | 'export'
  | 'import'
  | 'search';

export interface AnalyticsEvent {
  id?: string;
  type: EventType;
  name: string;
  category?: string;
  data?: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
  userId?: string;
}

export interface SessionInfo {
  id: string;
  startTime: string;
  endTime?: string;
  pageViews: number;
  actions: number;
  duration?: number;
}

// Session ID pour cette session
let currentSessionId: string | null = null;
let sessionStartTime: Date | null = null;

/**
 * Génère un ID de session unique
 */
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Initialise une nouvelle session
 */
export function initSession(): string {
  currentSessionId = generateSessionId();
  sessionStartTime = new Date();

  // Sauvegarder la session
  try {
    localStorage.setItem('cockpit-current-session', currentSessionId);
    localStorage.setItem('cockpit-session-start', sessionStartTime.toISOString());
  } catch {
    // Ignorer les erreurs localStorage
  }

  // Tracker le début de session
  trackEvent('action', 'session_start', 'session');

  return currentSessionId;
}

/**
 * Récupère ou crée l'ID de session
 */
export function getSessionId(): string {
  if (!currentSessionId) {
    const stored = localStorage.getItem('cockpit-current-session');
    if (stored) {
      currentSessionId = stored;
      const startStr = localStorage.getItem('cockpit-session-start');
      sessionStartTime = startStr ? new Date(startStr) : new Date();
    } else {
      initSession();
    }
  }
  return currentSessionId!;
}

/**
 * Termine la session actuelle
 */
export function endSession(): void {
  if (currentSessionId) {
    trackEvent('action', 'session_end', 'session', {
      duration: sessionStartTime
        ? Math.round((Date.now() - sessionStartTime.getTime()) / 1000)
        : 0,
    });

    localStorage.removeItem('cockpit-current-session');
    localStorage.removeItem('cockpit-session-start');
    currentSessionId = null;
    sessionStartTime = null;
  }
}

/**
 * Track un événement
 */
export async function trackEvent(
  type: EventType,
  name: string,
  category?: string,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    const event: AnalyticsEvent = {
      type,
      name,
      category,
      data,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
    };

    // Stocker dans IndexedDB si la table existe
    // Note: la table 'analytics' devrait être ajoutée au schéma Dexie
    const events = JSON.parse(localStorage.getItem('cockpit-analytics') || '[]');
    events.push(event);

    // Garder les 1000 derniers événements
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }

    localStorage.setItem('cockpit-analytics', JSON.stringify(events));
  } catch {
    // Ignorer les erreurs de tracking
  }
}

/**
 * Track une vue de page
 */
export function trackPageView(path: string, title?: string): void {
  trackEvent('page_view', path, 'navigation', { title });
}

/**
 * Track une action utilisateur
 */
export function trackAction(name: string, category: string, data?: Record<string, unknown>): void {
  trackEvent('action', name, category, data);
}

/**
 * Track une erreur
 */
export function trackError(
  error: Error | string,
  context?: Record<string, unknown>
): void {
  const errorData = typeof error === 'string'
    ? { message: error }
    : { message: error.message, stack: error.stack };

  trackEvent('error', 'error_occurred', 'error', {
    ...errorData,
    ...context,
  });
}

/**
 * Track une métrique de performance
 */
export function trackPerformance(
  metric: string,
  value: number,
  unit: string = 'ms'
): void {
  trackEvent('performance', metric, 'performance', { value, unit });
}

/**
 * Track l'utilisation d'une fonctionnalité
 */
export function trackFeatureUse(feature: string, details?: Record<string, unknown>): void {
  trackEvent('feature_use', feature, 'feature', details);
}

/**
 * Récupère les statistiques d'utilisation
 */
export function getUsageStats(): {
  totalEvents: number;
  eventsByType: Record<string, number>;
  topFeatures: Array<{ name: string; count: number }>;
  recentErrors: Array<{ message: string; timestamp: string }>;
} {
  try {
    const events: AnalyticsEvent[] = JSON.parse(
      localStorage.getItem('cockpit-analytics') || '[]'
    );

    // Comptage par type
    const eventsByType: Record<string, number> = {};
    const featureCounts: Record<string, number> = {};
    const recentErrors: Array<{ message: string; timestamp: string }> = [];

    for (const event of events) {
      // Par type
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

      // Features
      if (event.type === 'feature_use') {
        featureCounts[event.name] = (featureCounts[event.name] || 0) + 1;
      }

      // Erreurs récentes
      if (event.type === 'error' && event.data?.message) {
        recentErrors.push({
          message: event.data.message as string,
          timestamp: event.timestamp,
        });
      }
    }

    // Top features
    const topFeatures = Object.entries(featureCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: events.length,
      eventsByType,
      topFeatures,
      recentErrors: recentErrors.slice(-10),
    };
  } catch {
    return {
      totalEvents: 0,
      eventsByType: {},
      topFeatures: [],
      recentErrors: [],
    };
  }
}

/**
 * Efface les données analytics
 */
export function clearAnalytics(): void {
  localStorage.removeItem('cockpit-analytics');
}

/**
 * Exporte les données analytics
 */
export function exportAnalytics(): string {
  return localStorage.getItem('cockpit-analytics') || '[]';
}

// Écouter les événements de fin de session
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    endSession();
  });

  // Initialiser la session au chargement
  getSessionId();
}
