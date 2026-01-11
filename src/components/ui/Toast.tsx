/**
 * Toast - Système de notifications toast amélioré
 * Supporte plusieurs types, positions, et animations
 */
import React, { useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastStore {
  toasts: Toast[];
  position: ToastPosition;
  maxToasts: number;
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  setPosition: (position: ToastPosition) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  position: 'top-right',
  maxToasts: 5,

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast: Toast = {
      id,
      duration: 5000,
      dismissible: true,
      ...toast,
    };

    set((state) => {
      const toasts = [newToast, ...state.toasts].slice(0, state.maxToasts);
      return { toasts };
    });

    // Auto-dismiss
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },

  setPosition: (position) => {
    set({ position });
  },
}));

// Helper functions pour faciliter l'utilisation
export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) =>
    useToastStore.getState().addToast({ type: 'success', title, message, ...options }),

  error: (title: string, message?: string, options?: Partial<Toast>) =>
    useToastStore.getState().addToast({ type: 'error', title, message, duration: 8000, ...options }),

  warning: (title: string, message?: string, options?: Partial<Toast>) =>
    useToastStore.getState().addToast({ type: 'warning', title, message, ...options }),

  info: (title: string, message?: string, options?: Partial<Toast>) =>
    useToastStore.getState().addToast({ type: 'info', title, message, ...options }),

  dismiss: (id: string) => useToastStore.getState().removeToast(id),

  dismissAll: () => useToastStore.getState().clearAll(),
};

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const typeStyles: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  warning: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
  info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
};

const iconStyles: Record<ToastType, string> = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
};

const positionStyles: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast: t, onDismiss }: ToastItemProps) {
  const Icon = icons[t.type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        transform transition-all duration-300 ease-out
        animate-slide-in min-w-[320px] max-w-[420px]
        ${typeStyles[t.type]}
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconStyles[t.type]}`} />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white">{t.title}</p>
        {t.message && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t.message}</p>
        )}
        {t.action && (
          <button
            onClick={t.action.onClick}
            className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            {t.action.label}
          </button>
        )}
      </div>

      {t.dismissible && (
        <button
          onClick={() => onDismiss(t.id)}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Fermer la notification"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}

export function ToastContainer() {
  const { toasts, position, removeToast } = useToastStore();

  const handleDismiss = useCallback((id: string) => {
    removeToast(id);
  }, [removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      className={`fixed z-50 flex flex-col gap-2 ${positionStyles[position]}`}
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}

// CSS pour l'animation (à ajouter dans le CSS global ou via Tailwind)
const styles = `
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
`;

// Injecter les styles si nécessaire
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  if (!document.head.querySelector('[data-toast-styles]')) {
    styleSheet.setAttribute('data-toast-styles', '');
    document.head.appendChild(styleSheet);
  }
}
