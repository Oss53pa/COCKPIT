import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  FileText,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { useAIStore, useAppStore } from '../../store';
import {
  chatWithAssistant,
  OPENROUTER_MODELS,
  CLAUDE_MODELS,
  ChatMessage,
} from '../../services/aiService';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'analyze',
    label: 'Analyser mes KPIs',
    icon: <BarChart3 className="w-4 h-4" />,
    prompt: 'Analyse les KPIs de mon centre commercial et donne-moi des recommandations pour améliorer la performance.',
  },
  {
    id: 'insights',
    label: 'Générer des insights',
    icon: <Sparkles className="w-4 h-4" />,
    prompt: 'Génère des insights business à partir de mes données de ventes et fréquentation. Identifie les tendances et opportunités.',
  },
  {
    id: 'report',
    label: 'Aide rapport',
    icon: <FileText className="w-4 h-4" />,
    prompt: 'Aide-moi à rédiger un rapport de performance mensuel professionnel avec les sections clés: synthèse, KPIs, analyse, recommandations.',
  },
  {
    id: 'predict',
    label: 'Prédictions',
    icon: <TrendingUp className="w-4 h-4" />,
    prompt: 'Quelles sont les tendances et prédictions pour les prochains mois ? Analyse les patterns saisonniers et donne des projections.',
  },
];

interface AIError {
  message: string;
  code?: string;
  status?: number;
}

export function AIAssistant() {
  const {
    config,
    conversations,
    isLoading,
    isPanelOpen,
    addMessage,
    clearConversations,
    setLoading,
    setError,
    setPanelOpen,
    recordUsage,
    getCurrentApiKey,
    getCurrentModel,
    isCurrentProviderConfigured,
  } = useAIStore();
  const { addToast } = useAppStore();

  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  // Focus input when panel opens
  useEffect(() => {
    if (isPanelOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isPanelOpen, isMinimized]);

  const isConfigured = isCurrentProviderConfigured();
  const currentApiKey = getCurrentApiKey();
  const currentModel = getCurrentModel();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!isConfigured) {
      addToast({
        type: 'warning',
        title: 'Proph3et non configuré',
        message: `Configurez votre clé API ${config.activeProvider === 'claude' ? 'Claude' : 'OpenRouter'} dans les Paramètres`,
      });
      return;
    }

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addMessage({ role: 'user', content: userMessage });

    setLoading(true);
    try {
      // Build conversation history
      const history: ChatMessage[] = conversations
        .slice(-10) // Last 10 messages for context
        .map((m) => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: userMessage });

      const result = await chatWithAssistant(
        config.activeProvider,
        currentApiKey,
        currentModel,
        history,
        { centreName: 'Centre actuel' }
      );

      if (result.success && result.content) {
        addMessage({
          role: 'assistant',
          content: result.content,
          model: currentModel,
          tokens: result.tokens?.total,
          provider: config.activeProvider,
        });
        if (result.tokens?.total) {
          recordUsage(result.tokens.total, config.activeProvider);
        }
      } else {
        setError(result.error || 'Erreur inconnue');
        addToast({
          type: 'error',
          title: 'Erreur Proph3et',
          message: result.error || 'Impossible de générer une réponse',
        });
      }
    } catch (error: unknown) {
      const aiError = error as AIError;
      setError(aiError.message);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: aiError.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (!isConfigured) {
      addToast({
        type: 'warning',
        title: 'Proph3et non configuré',
        message: `Configurez votre clé API ${config.activeProvider === 'claude' ? 'Claude' : 'OpenRouter'} dans les Paramètres`,
      });
      return;
    }

    addMessage({ role: 'user', content: action.prompt });

    setLoading(true);
    try {
      const result = await chatWithAssistant(
        config.activeProvider,
        currentApiKey,
        currentModel,
        [{ role: 'user', content: action.prompt }],
        { centreName: 'Centre actuel' }
      );

      if (result.success && result.content) {
        addMessage({
          role: 'assistant',
          content: result.content,
          model: currentModel,
          tokens: result.tokens?.total,
          provider: config.activeProvider,
        });
        if (result.tokens?.total) {
          recordUsage(result.tokens.total, config.activeProvider);
        }
      } else {
        addToast({
          type: 'error',
          title: 'Erreur Proph3et',
          message: result.error || 'Impossible de générer une réponse',
        });
      }
    } catch (error: unknown) {
      const aiError = error as AIError;
      addToast({
        type: 'error',
        title: 'Erreur',
        message: aiError.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get current model info
  const allModels = [...OPENROUTER_MODELS, ...CLAUDE_MODELS];
  const currentModelInfo = allModels.find((m) => m.id === currentModel);
  const providerColor = config.activeProvider === 'claude' ? 'orange' : 'purple';

  if (!isPanelOpen) {
    return (
      <button
        onClick={() => setPanelOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br ${
          config.activeProvider === 'claude'
            ? 'from-orange-500 to-amber-600'
            : 'from-purple-600 to-blue-600'
        } text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group z-50`}
        title="Proph3et - Assistant IA"
      >
        {config.activeProvider === 'claude' ? (
          <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
        ) : (
          <Cpu className="w-6 h-6 group-hover:scale-110 transition-transform" />
        )}
        {isConfigured && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-primary-200 dark:border-gray-700 z-50 flex flex-col transition-all ${
        isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r ${
          config.activeProvider === 'claude'
            ? 'from-orange-500 to-amber-600'
            : 'from-purple-600 to-blue-600'
        } text-white rounded-t-2xl cursor-pointer`}
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        <div className="flex items-center gap-2">
          {config.activeProvider === 'claude' ? (
            <Bot className="w-5 h-5" />
          ) : (
            <Cpu className="w-5 h-5" />
          )}
          <span className="text-xl" style={{ fontFamily: "'Grand Hotel', cursive" }}>
            Proph3et
          </span>
          {currentModelInfo && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {currentModelInfo.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPanelOpen(false);
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                {config.activeProvider === 'claude' ? (
                  <Bot className="w-12 h-12 text-orange-300 mx-auto mb-4" />
                ) : (
                  <Cpu className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                )}
                <h3 className="text-2xl text-primary-900 dark:text-white mb-2" style={{ fontFamily: "'Grand Hotel', cursive" }}>
                  Proph3et
                </h3>
                <p className="font-medium text-primary-700 dark:text-gray-300 mb-1">
                  Comment puis-je vous aider ?
                </p>
                <p className="text-sm text-primary-500 dark:text-gray-400 mb-4">
                  Posez-moi des questions sur vos données, demandez des analyses ou de l'aide pour vos rapports.
                </p>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      disabled={!isConfigured || isLoading}
                      className={`flex items-center gap-2 p-3 text-left text-sm bg-primary-50 dark:bg-gray-700 hover:bg-${providerColor}-50 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className={`text-${providerColor}-600`}>{action.icon}</span>
                      <span className="text-primary-700 dark:text-gray-200">{action.label}</span>
                    </button>
                  ))}
                </div>

                {!isConfigured && (
                  <p className="text-xs text-warning mt-4">
                    Configurez Proph3et ({config.activeProvider === 'claude' ? 'Claude' : 'OpenRouter'}) dans les Paramètres.
                  </p>
                )}
              </div>
            ) : (
              <>
                {conversations.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        msg.role === 'user'
                          ? config.activeProvider === 'claude'
                            ? 'bg-orange-500 text-white rounded-br-md'
                            : 'bg-purple-600 text-white rounded-br-md'
                          : 'bg-primary-100 dark:bg-gray-700 text-primary-900 dark:text-white rounded-bl-md'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                      {msg.role === 'assistant' && (msg.tokens || msg.provider) && (
                        <div className="text-xs opacity-60 mt-1 flex items-center gap-2">
                          {msg.provider && (
                            <span className="capitalize">{msg.provider}</span>
                          )}
                          {msg.tokens && <span>{msg.tokens} tokens</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-primary-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2 text-primary-600 dark:text-gray-300">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Réflexion en cours...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-primary-100 dark:border-gray-700">
            {conversations.length > 0 && (
              <div className="flex justify-between items-center mb-2">
                <button
                  onClick={clearConversations}
                  className="text-xs text-primary-400 hover:text-danger flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Effacer la conversation
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isConfigured
                    ? 'Demandez à Proph3et...'
                    : 'Configurez Proph3et dans Paramètres'
                }
                disabled={!isConfigured || isLoading}
                className={`flex-1 px-3 py-2 border border-primary-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-${providerColor}-500 disabled:bg-primary-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed`}
                rows={1}
                style={{ minHeight: '40px', maxHeight: '100px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !isConfigured || isLoading}
                className={`px-4 py-2 ${
                  config.activeProvider === 'claude'
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
