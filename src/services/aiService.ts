/**
 * Service IA Unifié - Support OpenRouter et Claude (Anthropic)
 * Permet d'utiliser plusieurs providers d'IA via une interface commune
 */

// ============================================
// CONFIGURATION DES PROVIDERS
// ============================================

export type AIProvider = 'openrouter' | 'claude';

const API_URLS = {
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  claude: 'https://api.anthropic.com/v1/messages',
};

// Modèles OpenRouter (gratuits)
export const OPENROUTER_MODELS = [
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B',
    provider: 'Meta',
    description: 'Compact et rapide',
    contextLength: 131072,
    free: true,
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct:free',
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    description: 'Excellent équilibre',
    contextLength: 131072,
    free: true,
  },
  {
    id: 'google/gemma-2-9b-it:free',
    name: 'Gemma 2 9B',
    provider: 'Google',
    description: 'Performant pour l\'analyse',
    contextLength: 8192,
    free: true,
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B',
    provider: 'Mistral AI',
    description: 'Modèle français performant',
    contextLength: 32768,
    free: true,
  },
  {
    id: 'qwen/qwen-2-7b-instruct:free',
    name: 'Qwen 2 7B',
    provider: 'Alibaba',
    description: 'Bon pour l\'analyse',
    contextLength: 32768,
    free: true,
  },
  {
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    name: 'Phi-3 Mini',
    provider: 'Microsoft',
    description: 'Petit mais puissant',
    contextLength: 128000,
    free: true,
  },
];

// Modèles Claude (Anthropic)
export const CLAUDE_MODELS = [
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Meilleur rapport qualité/prix, très intelligent',
    contextLength: 200000,
    free: false,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    description: 'Rapide et économique',
    contextLength: 200000,
    free: false,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Le plus puissant, idéal pour tâches complexes',
    contextLength: 200000,
    free: false,
  },
];

// Tous les modèles disponibles
export const ALL_MODELS = [
  ...OPENROUTER_MODELS.map(m => ({ ...m, apiProvider: 'openrouter' as AIProvider })),
  ...CLAUDE_MODELS.map(m => ({ ...m, apiProvider: 'claude' as AIProvider })),
];

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextLength: number;
  free: boolean;
  apiProvider: AIProvider;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIAnalysisResult {
  success: boolean;
  content?: string;
  error?: string;
  model?: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

// ============================================
// FONCTIONS D'ENVOI PAR PROVIDER
// ============================================

/**
 * Envoie une requête à OpenRouter
 */
async function sendToOpenRouter(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<AIAnalysisResult> {
  try {
    const response = await fetch(API_URLS.openrouter, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Cockpit - Pilotage Stratégique',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error?.message || `Erreur API OpenRouter: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      content: data.choices[0]?.message?.content || '',
      model,
      tokens: data.usage ? {
        prompt: data.usage.prompt_tokens,
        completion: data.usage.completion_tokens,
        total: data.usage.total_tokens,
      } : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur de connexion à OpenRouter',
    };
  }
}

/**
 * Envoie une requête à Claude (Anthropic)
 */
async function sendToClaude(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<AIAnalysisResult> {
  try {
    // Séparer le system message des autres messages pour Claude
    const systemMessage = messages.find(m => m.role === 'system');
    const otherMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(API_URLS.claude, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
        system: systemMessage?.content || '',
        messages: otherMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error?.message || `Erreur API Claude: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      content: data.content[0]?.text || '',
      model,
      tokens: data.usage ? {
        prompt: data.usage.input_tokens,
        completion: data.usage.output_tokens,
        total: data.usage.input_tokens + data.usage.output_tokens,
      } : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur de connexion à Claude',
    };
  }
}

// ============================================
// INTERFACE UNIFIÉE
// ============================================

/**
 * Envoie une requête au provider approprié
 */
export async function sendChatCompletion(
  provider: AIProvider,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<AIAnalysisResult> {
  if (!apiKey) {
    return {
      success: false,
      error: `Clé API ${provider === 'claude' ? 'Claude' : 'OpenRouter'} non configurée`,
    };
  }

  if (provider === 'claude') {
    return sendToClaude(apiKey, model, messages, options);
  } else {
    return sendToOpenRouter(apiKey, model, messages, options);
  }
}

/**
 * Valide une clé API
 */
export async function validateApiKey(provider: AIProvider, apiKey: string): Promise<boolean> {
  const testModel = provider === 'claude'
    ? 'claude-3-5-haiku-20241022'
    : 'meta-llama/llama-3.2-3b-instruct:free';

  const result = await sendChatCompletion(
    provider,
    apiKey,
    testModel,
    [{ role: 'user', content: 'Test' }],
    { maxTokens: 5 }
  );
  return result.success;
}

/**
 * Obtient les modèles disponibles pour un provider
 */
export function getModelsForProvider(provider: AIProvider): AIModel[] {
  return ALL_MODELS.filter(m => m.apiProvider === provider);
}

// ============================================
// PROMPTS SPÉCIALISÉS POUR COCKPIT
// ============================================

const SYSTEM_PROMPT_BASE = `Tu es un assistant IA expert en gestion de centres commerciaux et en analyse de données business.
Tu travailles pour l'application Cockpit, un outil de pilotage stratégique pour la gestion multi-centres.
Tu dois répondre en français de manière professionnelle et concise.
Utilise des données chiffrées quand c'est pertinent et structure tes réponses avec des titres et listes.`;

/**
 * Analyse des KPIs et données de performance
 */
export async function analyzeKPIs(
  provider: AIProvider,
  apiKey: string,
  model: string,
  data: {
    kpis: Array<{ nom: string; valeur: number; objectif: number; unite: string }>;
    periode: string;
    centre?: string;
  }
): Promise<AIAnalysisResult> {
  const systemPrompt = `${SYSTEM_PROMPT_BASE}
Tu es spécialisé dans l'analyse des indicateurs de performance (KPIs) des centres commerciaux.
Analyse les KPIs fournis et donne des insights pertinents sur la performance.`;

  const userPrompt = `Analyse les KPIs suivants pour ${data.centre || 'le centre'} sur la période ${data.periode}:

${data.kpis.map(k => `- ${k.nom}: ${k.valeur}${k.unite} (objectif: ${k.objectif}${k.unite}) - ${((k.valeur / k.objectif) * 100).toFixed(1)}% de l'objectif`).join('\n')}

Fournis:
1. Une synthèse de la performance globale
2. Les points forts (KPIs au-dessus de l'objectif)
3. Les points d'attention (KPIs en dessous de l'objectif)
4. 3 recommandations concrètes d'amélioration`;

  return sendChatCompletion(provider, apiKey, model, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}

/**
 * Génération d'insights à partir des données
 */
export async function generateInsights(
  provider: AIProvider,
  apiKey: string,
  model: string,
  data: {
    type: 'ventes' | 'frequentation' | 'loyers' | 'general';
    donnees: Record<string, any>;
    contexte?: string;
  }
): Promise<AIAnalysisResult> {
  const systemPrompt = `${SYSTEM_PROMPT_BASE}
Tu es spécialisé dans la génération d'insights business à partir de données brutes.
Identifie les tendances, anomalies et opportunités.`;

  const userPrompt = `Analyse ces données de type "${data.type}" et génère des insights:

Données: ${JSON.stringify(data.donnees, null, 2)}

${data.contexte ? `Contexte additionnel: ${data.contexte}` : ''}

Fournis:
1. 3-5 insights clés
2. Les tendances identifiées
3. Les anomalies ou points d'attention
4. Des recommandations actionables`;

  return sendChatCompletion(provider, apiKey, model, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}

/**
 * Aide à la rédaction de rapports
 */
export async function helpWriteReport(
  provider: AIProvider,
  apiKey: string,
  model: string,
  data: {
    typeRapport: string;
    sections: string[];
    donnees: Record<string, any>;
    style?: 'formel' | 'executif' | 'detaille';
  }
): Promise<AIAnalysisResult> {
  const styleDesc = {
    formel: 'professionnel et formel, adapté pour une présentation officielle',
    executif: 'synthétique et orienté décision, pour les dirigeants',
    detaille: 'complet et détaillé, avec toutes les explications nécessaires',
  };

  const systemPrompt = `${SYSTEM_PROMPT_BASE}
Tu es spécialisé dans la rédaction de rapports professionnels pour les centres commerciaux.
Style demandé: ${styleDesc[data.style || 'formel']}`;

  const userPrompt = `Aide-moi à rédiger un rapport de type "${data.typeRapport}".

Sections à inclure: ${data.sections.join(', ')}

Données disponibles:
${JSON.stringify(data.donnees, null, 2)}

Génère le contenu pour chaque section demandée, en utilisant les données fournies.
Structure le rapport de manière professionnelle avec des titres, sous-titres et paragraphes clairs.`;

  return sendChatCompletion(provider, apiKey, model, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], { maxTokens: 4096 });
}

/**
 * Prédictions et tendances
 */
export async function generatePredictions(
  provider: AIProvider,
  apiKey: string,
  model: string,
  data: {
    historique: Array<{ periode: string; valeur: number }>;
    indicateur: string;
    horizonPrediction: string;
  }
): Promise<AIAnalysisResult> {
  const systemPrompt = `${SYSTEM_PROMPT_BASE}
Tu es spécialisé dans l'analyse prédictive pour les centres commerciaux.
Base tes prédictions sur les tendances historiques et les patterns saisonniers.
Sois prudent dans tes prédictions et indique toujours le niveau de confiance.`;

  const userPrompt = `Analyse l'historique et fais des prédictions pour l'indicateur "${data.indicateur}":

Historique:
${data.historique.map(h => `${h.periode}: ${h.valeur}`).join('\n')}

Horizon de prédiction: ${data.horizonPrediction}

Fournis:
1. L'analyse de la tendance historique
2. Les patterns identifiés (saisonnalité, cycles)
3. Tes prédictions avec niveau de confiance (faible/moyen/élevé)
4. Les facteurs qui pourraient influencer ces prédictions
5. Les risques et incertitudes`;

  return sendChatCompletion(provider, apiKey, model, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}

/**
 * Analyse comparative multi-centres
 */
export async function compareCentres(
  provider: AIProvider,
  apiKey: string,
  model: string,
  data: {
    centres: Array<{
      nom: string;
      kpis: Record<string, number>;
    }>;
    metriques: string[];
  }
): Promise<AIAnalysisResult> {
  const systemPrompt = `${SYSTEM_PROMPT_BASE}
Tu es spécialisé dans l'analyse comparative de performance entre centres commerciaux.
Compare objectivement les centres et identifie les meilleures pratiques.`;

  const userPrompt = `Compare la performance des centres suivants:

${data.centres.map(c => `**${c.nom}**:
${Object.entries(c.kpis).map(([k, v]) => `  - ${k}: ${v}`).join('\n')}`).join('\n\n')}

Métriques à analyser: ${data.metriques.join(', ')}

Fournis:
1. Un classement global des centres avec justification
2. Les points forts de chaque centre
3. Les axes d'amélioration par centre
4. Les meilleures pratiques à partager entre centres
5. Un plan d'action recommandé`;

  return sendChatCompletion(provider, apiKey, model, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}

/**
 * Chat libre avec l'assistant IA
 */
export async function chatWithAssistant(
  provider: AIProvider,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  context?: {
    centreName?: string;
    currentPage?: string;
    data?: Record<string, any>;
  }
): Promise<AIAnalysisResult> {
  const contextInfo = context ? `
Contexte actuel:
- Centre sélectionné: ${context.centreName || 'Aucun'}
- Page actuelle: ${context.currentPage || 'Inconnue'}
${context.data ? `- Données contextuelles: ${JSON.stringify(context.data)}` : ''}
` : '';

  const systemPrompt = `${SYSTEM_PROMPT_BASE}
${contextInfo}
Réponds aux questions de l'utilisateur de manière utile et contextuelle.
Si tu n'as pas assez d'informations, demande des précisions.`;

  return sendChatCompletion(provider, apiKey, model, [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]);
}

/**
 * Résumé automatique de données
 */
export async function summarizeData(
  provider: AIProvider,
  apiKey: string,
  model: string,
  data: {
    titre: string;
    contenu: string | Record<string, any>;
    format?: 'bullet' | 'paragraph' | 'executive';
  }
): Promise<AIAnalysisResult> {
  const formatDesc = {
    bullet: 'en points clés (bullet points)',
    paragraph: 'en paragraphes fluides',
    executive: 'en résumé exécutif très court (3-4 phrases max)',
  };

  const systemPrompt = `${SYSTEM_PROMPT_BASE}
Tu es spécialisé dans la synthèse de données complexes.
Format de sortie demandé: ${formatDesc[data.format || 'bullet']}`;

  const contenu = typeof data.contenu === 'string'
    ? data.contenu
    : JSON.stringify(data.contenu, null, 2);

  const userPrompt = `Résume les informations suivantes concernant "${data.titre}":

${contenu}

Crée un résumé clair et actionable.`;

  return sendChatCompletion(provider, apiKey, model, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}

// Export des anciens noms pour compatibilité
export { OPENROUTER_MODELS as FREE_MODELS };
