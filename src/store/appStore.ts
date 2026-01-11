import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Configuration de sauvegarde automatique
export interface AutoSaveConfig {
  enabled: boolean;
  intervalMinutes: number; // Intervalle en minutes (5, 15, 30, 60, etc.)
  target: 'local' | 'onedrive' | 'both';
  lastSaveTime: string | null;
  lastSaveStatus: 'success' | 'error' | null;
}

interface AppState {
  // Navigation
  sidebarOpen: boolean;
  currentCentreId: string | null;

  // Theme
  theme: 'light' | 'dark' | 'system';

  // UI State
  isLoading: boolean;
  loadingMessage: string;

  // Notifications
  toasts: Toast[];

  // Auto-save configuration
  autoSaveConfig: AutoSaveConfig;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentCentre: (centreId: string | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLoading: (loading: boolean, message?: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setAutoSaveConfig: (config: Partial<AutoSaveConfig>) => void;
  updateLastSave: (status: 'success' | 'error') => void;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // État initial
      sidebarOpen: true,
      currentCentreId: null,
      theme: 'light',
      isLoading: false,
      loadingMessage: '',
      toasts: [],
      autoSaveConfig: {
        enabled: false,
        intervalMinutes: 30,
        target: 'local',
        lastSaveTime: null,
        lastSaveStatus: null,
      },

      // Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setCurrentCentre: (centreId) => set({ currentCentreId: centreId }),

      setTheme: (theme) => {
        // Appliquer le thème au document
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
        set({ theme });
      },

      setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),

      addToast: (toast) => set((state) => ({
        toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }]
      })),

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      })),

      setAutoSaveConfig: (config) => set((state) => ({
        autoSaveConfig: { ...state.autoSaveConfig, ...config }
      })),

      updateLastSave: (status) => set((state) => ({
        autoSaveConfig: {
          ...state.autoSaveConfig,
          lastSaveTime: new Date().toISOString(),
          lastSaveStatus: status,
        }
      })),
    }),
    {
      name: 'cockpit-app-store',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        currentCentreId: state.currentCentreId,
        theme: state.theme,
        autoSaveConfig: state.autoSaveConfig,
      }),
    }
  )
);
