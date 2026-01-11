/**
 * Utilitaires de retry pour les opérations asynchrones
 */

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  maxDelay?: number;
  retryIf?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delay: 1000,
  backoff: 'exponential',
  maxDelay: 30000,
  retryIf: () => true,
  onRetry: () => {},
};

/**
 * Calcule le délai pour une tentative donnée
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  backoff: 'linear' | 'exponential',
  maxDelay: number
): number {
  let delay: number;

  if (backoff === 'exponential') {
    delay = baseDelay * Math.pow(2, attempt - 1);
  } else {
    delay = baseDelay * attempt;
  }

  // Ajouter un peu de jitter pour éviter les thundering herds
  const jitter = Math.random() * 0.1 * delay;
  delay += jitter;

  return Math.min(delay, maxDelay);
}

/**
 * Attend un délai spécifié
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Exécute une fonction avec retry automatique
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Vérifier si on doit réessayer
      if (!opts.retryIf(error)) {
        throw error;
      }

      // Si c'est la dernière tentative, on throw
      if (attempt === opts.maxAttempts) {
        throw error;
      }

      // Callback de retry
      opts.onRetry(attempt, error);

      // Attendre avant de réessayer
      const delay = calculateDelay(attempt, opts.delay, opts.backoff, opts.maxDelay);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Crée une version avec retry d'une fonction
 */
export function createRetryable<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: Parameters<T>) => {
    return withRetry(() => fn(...args), options);
  }) as T;
}

/**
 * Retry spécifique pour les requêtes réseau
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  if (error instanceof Error) {
    const networkErrors = [
      'network',
      'timeout',
      'aborted',
      'connection',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
    ];
    return networkErrors.some((e) =>
      error.message.toLowerCase().includes(e.toLowerCase())
    );
  }
  return false;
}

/**
 * Retry pour les requêtes HTTP avec gestion des codes d'erreur
 */
export function isRetryableHttpError(error: unknown): boolean {
  // Erreurs réseau
  if (isNetworkError(error)) return true;

  // Erreurs HTTP retryables (5xx, 429)
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    return status >= 500 || status === 429;
  }

  return false;
}

/**
 * Fetch avec retry automatique
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return withRetry(
    async () => {
      const response = await fetch(url, options);

      if (!response.ok && (response.status >= 500 || response.status === 429)) {
        throw { status: response.status, statusText: response.statusText };
      }

      return response;
    },
    {
      retryIf: isRetryableHttpError,
      ...retryOptions,
    }
  );
}

/**
 * Timeout wrapper pour les promises
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError?: Error
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(timeoutError || new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Combine retry et timeout
 */
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return withRetry(() => withTimeout(fn(), timeoutMs), retryOptions);
}
