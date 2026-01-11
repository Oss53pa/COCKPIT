/**
 * Utilitaire pour l'enregistrement du Service Worker
 */

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
};

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

/**
 * Enregistre le Service Worker
 */
export function register(config?: Config): void {
  if ('serviceWorker' in navigator) {
    const swUrl = '/sw.js';

    if (isLocalhost) {
      // En local, vérifier que le SW est valide
      checkValidServiceWorker(swUrl, config);

      navigator.serviceWorker.ready.then(() => {
        console.log('[SW] Service Worker is running in development mode.');
      });
    } else {
      // En production, enregistrer directement
      registerValidSW(swUrl, config);
    }

    // Gérer les événements online/offline
    if (config) {
      window.addEventListener('online', () => config.onOnline?.());
      window.addEventListener('offline', () => config.onOffline?.());
    }
  }
}

/**
 * Enregistre un Service Worker valide
 */
async function registerValidSW(swUrl: string, config?: Config): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.register(swUrl);

    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (installingWorker == null) return;

      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // Nouvelle version disponible
            console.log('[SW] New content is available and will be used when all tabs are closed.');
            config?.onUpdate?.(registration);
          } else {
            // Contenu mis en cache pour la première fois
            console.log('[SW] Content is cached for offline use.');
            config?.onSuccess?.(registration);
          }
        }
      };
    };
  } catch (error) {
    console.error('[SW] Error during service worker registration:', error);
  }
}

/**
 * Vérifie si le Service Worker est valide
 */
async function checkValidServiceWorker(swUrl: string, config?: Config): Promise<void> {
  try {
    const response = await fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    });

    const contentType = response.headers.get('content-type');

    if (
      response.status === 404 ||
      (contentType != null && contentType.indexOf('javascript') === -1)
    ) {
      // Pas de SW trouvé, recharger la page
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      window.location.reload();
    } else {
      // SW trouvé, enregistrer
      registerValidSW(swUrl, config);
    }
  } catch {
    console.log('[SW] No internet connection found. App is running in offline mode.');
    config?.onOffline?.();
  }
}

/**
 * Désenregistre le Service Worker
 */
export async function unregister(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('[SW] Service Worker unregistered.');
    } catch (error) {
      console.error('[SW] Error unregistering service worker:', error);
    }
  }
}

/**
 * Force la mise à jour du Service Worker
 */
export async function update(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      console.log('[SW] Service Worker update triggered.');
    } catch (error) {
      console.error('[SW] Error updating service worker:', error);
    }
  }
}

/**
 * Envoie un message au Service Worker
 */
export function postMessage(message: unknown): void {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

/**
 * Vérifie si l'application est en ligne
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Vérifie si le Service Worker est supporté
 */
export function isSupported(): boolean {
  return 'serviceWorker' in navigator;
}
