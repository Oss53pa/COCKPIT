import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIProvider } from '../services/aiService';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIConfig {
  // Provider actif
  activeProvider: AIProvider;

  // Clés API par provider
  openrouterApiKey: string;
  claudeApiKey: string;

  // Modèles sélectionnés par provider
  openrouterModel: string;
  claudeModel: string;

  // Paramètres globaux
  temperature: number;
  maxTokens: number;
}

export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  lastUsed: string | null;
  requestsToday: number;
  lastResetDate: string;
  // Stats par provider
  openrouterRequests: number;
  claudeRequests: number;
}

export interface ConversationMessage extends ChatMessage {
  id: string;
  timestamp: string;
  model?: string;
  tokens?: number;
  provider?: AIProvider;
}

interface AIState {
  // Configuration
  config: AIConfig;

  // Statistiques d'utilisation
  usage: AIUsageStats;

  // Historique des conversations
  conversations: ConversationMessage[];

  // État UI
  isLoading: boolean;
  lastError: string | null;
  isPanelOpen: boolean;

  // Actions - Configuration
  setActiveProvider: (provider: AIProvider) => void;
  setOpenRouterApiKey: (key: string) => void;
  setClaudeApiKey: (key: string) => void;
  setOpenRouterModel: (modelId: string) => void;
  setClaudeModel: (modelId: string) => void;
  setTemperature: (temp: number) => void;
  setMaxTokens: (tokens: number) => void;
  clearConfig: () => void;

  // Getters
  getCurrentApiKey: () => string;
  getCurrentModel: () => string;
  isCurrentProviderConfigured: () => boolean;

  // Actions - Usage
  recordUsage: (tokens: number, provider: AIProvider) => void;
  resetDailyUsage: () => void;

  // Actions - Conversations
  addMessage: (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => void;
  clearConversations: () => void;

  // Actions - UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
}

const DEFAULT_CONFIG: AIConfig = {
  activeProvider: 'openrouter',
  openrouterApiKey: '',
  claudeApiKey: '',
  openrouterModel: 'meta-llama/llama-3.1-8b-instruct:free',
  claudeModel: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
  maxTokens: 2048,
};

const DEFAULT_USAGE: AIUsageStats = {
  totalRequests: 0,
  totalTokens: 0,
  lastUsed: null,
  requestsToday: 0,
  lastResetDate: new Date().toISOString().split('T')[0],
  openrouterRequests: 0,
  claudeRequests: 0,
};

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      // État initial
      config: DEFAULT_CONFIG,
      usage: DEFAULT_USAGE,
      conversations: [],
      isLoading: false,
      lastError: null,
      isPanelOpen: false,

      // Configuration
      setActiveProvider: (provider) => set((state) => ({
        config: { ...state.config, activeProvider: provider },
      })),

      setOpenRouterApiKey: (key) => set((state) => ({
        config: { ...state.config, openrouterApiKey: key },
      })),

      setClaudeApiKey: (key) => set((state) => ({
        config: { ...state.config, claudeApiKey: key },
      })),

      setOpenRouterModel: (modelId) => set((state) => ({
        config: { ...state.config, openrouterModel: modelId },
      })),

      setClaudeModel: (modelId) => set((state) => ({
        config: { ...state.config, claudeModel: modelId },
      })),

      setTemperature: (temp) => set((state) => ({
        config: { ...state.config, temperature: temp },
      })),

      setMaxTokens: (tokens) => set((state) => ({
        config: { ...state.config, maxTokens: tokens },
      })),

      clearConfig: () => set({
        config: DEFAULT_CONFIG,
        conversations: [],
      }),

      // Getters
      getCurrentApiKey: () => {
        const state = get();
        return state.config.activeProvider === 'claude'
          ? state.config.claudeApiKey
          : state.config.openrouterApiKey;
      },

      getCurrentModel: () => {
        const state = get();
        return state.config.activeProvider === 'claude'
          ? state.config.claudeModel
          : state.config.openrouterModel;
      },

      isCurrentProviderConfigured: () => {
        const state = get();
        const apiKey = state.config.activeProvider === 'claude'
          ? state.config.claudeApiKey
          : state.config.openrouterApiKey;
        return apiKey.length > 0;
      },

      // Usage
      recordUsage: (tokens, provider) => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => {
          const shouldReset = state.usage.lastResetDate !== today;
          return {
            usage: {
              totalRequests: state.usage.totalRequests + 1,
              totalTokens: state.usage.totalTokens + tokens,
              lastUsed: new Date().toISOString(),
              requestsToday: shouldReset ? 1 : state.usage.requestsToday + 1,
              lastResetDate: today,
              openrouterRequests: provider === 'openrouter'
                ? state.usage.openrouterRequests + 1
                : state.usage.openrouterRequests,
              claudeRequests: provider === 'claude'
                ? state.usage.claudeRequests + 1
                : state.usage.claudeRequests,
            },
          };
        });
      },

      resetDailyUsage: () => set((state) => ({
        usage: {
          ...state.usage,
          requestsToday: 0,
          lastResetDate: new Date().toISOString().split('T')[0],
        },
      })),

      // Conversations
      addMessage: (message) => set((state) => ({
        conversations: [
          ...state.conversations,
          {
            ...message,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          },
        ].slice(-100), // Garder les 100 derniers messages
      })),

      clearConversations: () => set({ conversations: [] }),

      // UI
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ lastError: error }),
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      setPanelOpen: (open) => set({ isPanelOpen: open }),
    }),
    {
      name: 'cockpit-ai-store',
      partialize: (state) => ({
        config: state.config,
        usage: state.usage,
      }),
    }
  )
);

// Hook utilitaire pour vérifier si l'IA est configurée
export function useIsAIConfigured(): boolean {
  return useAIStore((state) => {
    const apiKey = state.config.activeProvider === 'claude'
      ? state.config.claudeApiKey
      : state.config.openrouterApiKey;
    return apiKey.length > 0;
  });
}

// Hook pour obtenir la configuration IA
export function useAIConfig(): AIConfig {
  return useAIStore((state) => state.config);
}
