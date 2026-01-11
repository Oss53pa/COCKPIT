/**
 * Gestionnaire de sauvegarde avec File System Access API
 * Permet de sauvegarder sur le disque local (C:) ou OneDrive
 * Supporte le chiffrement AES-GCM et le versioning
 */

import { exportAllData, importAllData } from '../db/database';
import { encryptData, decryptData, isEncryptedData, isCryptoSupported, EncryptedData } from './crypto';

// Version du format de sauvegarde
const BACKUP_FORMAT_VERSION = 2;

// Types pour l'API File System Access
declare global {
  interface Window {
    showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
    showOpenFilePicker?: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
    showDirectoryPicker?: (options?: DirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>;
  }
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: FilePickerAcceptType[];
  startIn?: FileSystemHandle | WellKnownDirectory;
}

interface OpenFilePickerOptions {
  multiple?: boolean;
  types?: FilePickerAcceptType[];
  startIn?: FileSystemHandle | WellKnownDirectory;
}

interface DirectoryPickerOptions {
  id?: string;
  mode?: 'read' | 'readwrite';
  startIn?: FileSystemHandle | WellKnownDirectory;
}

interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

type WellKnownDirectory = 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';

export type SaveLocation = 'download' | 'local' | 'onedrive' | 'custom';

export interface SaveLocationConfig {
  type: SaveLocation;
  path?: string;
  directoryHandle?: FileSystemDirectoryHandle;
}

export interface BackupResult {
  success: boolean;
  message: string;
  filePath?: string;
}

export interface BackupOptions {
  encrypt?: boolean;
  password?: string;
  includeVersion?: boolean;
}

export interface VersionedBackup {
  version: number;
  createdAt: string;
  appVersion: string;
  encrypted: boolean;
  data: string | EncryptedData;
}

/**
 * Crée une structure de backup versionnée
 */
function createVersionedBackup(data: string, encrypted: boolean, encryptedData?: EncryptedData): VersionedBackup {
  return {
    version: BACKUP_FORMAT_VERSION,
    createdAt: new Date().toISOString(),
    appVersion: '1.0.0',
    encrypted,
    data: encrypted && encryptedData ? encryptedData : data,
  };
}

/**
 * Prépare les données pour la sauvegarde (avec ou sans chiffrement)
 */
async function prepareBackupData(options: BackupOptions = {}): Promise<string> {
  const rawData = await exportAllData();

  if (options.encrypt && options.password) {
    if (!isCryptoSupported()) {
      throw new Error('Le chiffrement n\'est pas supporté par ce navigateur');
    }
    const encryptedData = await encryptData(rawData, options.password);
    const versionedBackup = createVersionedBackup(rawData, true, encryptedData);
    return JSON.stringify(versionedBackup, null, 2);
  }

  if (options.includeVersion !== false) {
    const versionedBackup = createVersionedBackup(rawData, false);
    return JSON.stringify(versionedBackup, null, 2);
  }

  return rawData;
}

/**
 * Restaure les données depuis un backup (avec ou sans déchiffrement)
 */
async function restoreBackupData(content: string, password?: string): Promise<{ success: boolean; message: string }> {
  try {
    const parsed = JSON.parse(content);

    // Vérifier si c'est un backup versionné
    if (parsed.version && typeof parsed.version === 'number') {
      const versionedBackup = parsed as VersionedBackup;

      if (versionedBackup.encrypted) {
        if (!password) {
          return { success: false, message: 'Ce backup est chiffré. Veuillez fournir le mot de passe.' };
        }
        if (!isEncryptedData(versionedBackup.data)) {
          return { success: false, message: 'Format de données chiffrées invalide.' };
        }
        const decryptedData = await decryptData(versionedBackup.data, password);
        return importAllData(decryptedData);
      } else {
        // Backup non chiffré mais versionné
        const data = typeof versionedBackup.data === 'string'
          ? versionedBackup.data
          : JSON.stringify(versionedBackup.data);
        return importAllData(data);
      }
    }

    // Ancien format non versionné
    return importAllData(content);
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Erreur lors de la restauration' };
  }
}

// Clés pour stocker les handles dans IndexedDB
const STORAGE_KEY_LOCAL = 'cockpit-backup-handle-local';
const STORAGE_KEY_ONEDRIVE = 'cockpit-backup-handle-onedrive';

/**
 * Vérifie si l'API File System Access est disponible
 */
export function isFileSystemAccessSupported(): boolean {
  return 'showSaveFilePicker' in window && 'showDirectoryPicker' in window;
}

/**
 * Génère un nom de fichier de backup avec la date
 */
function generateBackupFileName(): string {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  return `cockpit-backup-${date}_${time}.json`;
}

/**
 * Sauvegarde standard via téléchargement navigateur
 */
export async function saveViaDownload(): Promise<BackupResult> {
  try {
    const data = await exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateBackupFileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: 'Fichier téléchargé dans le dossier de téléchargements',
    };
  } catch (error) {
    return {
      success: false,
      message: `Erreur lors de l'export: ${error}`,
    };
  }
}

/**
 * Sauvegarde avec choix de l'emplacement via File System Access API
 */
export async function saveWithFilePicker(suggestedDir?: WellKnownDirectory): Promise<BackupResult> {
  if (!isFileSystemAccessSupported()) {
    return saveViaDownload();
  }

  try {
    const data = await exportAllData();

    const options: SaveFilePickerOptions = {
      suggestedName: generateBackupFileName(),
      types: [
        {
          description: 'Fichier de sauvegarde Cockpit',
          accept: { 'application/json': ['.json'] },
        },
      ],
    };

    if (suggestedDir) {
      options.startIn = suggestedDir;
    }

    const handle = await window.showSaveFilePicker!(options);
    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();

    return {
      success: true,
      message: `Sauvegarde enregistrée: ${handle.name}`,
      filePath: handle.name,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Sauvegarde annulée',
      };
    }
    return {
      success: false,
      message: `Erreur lors de la sauvegarde: ${error.message}`,
    };
  }
}

/**
 * Sélectionne et mémorise un dossier pour les sauvegardes
 */
export async function selectBackupDirectory(storageKey: string): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemAccessSupported()) {
    return null;
  }

  try {
    const handle = await window.showDirectoryPicker!({
      mode: 'readwrite',
    });

    // Stocker le handle pour une utilisation future (via IndexedDB)
    await storeDirectoryHandle(storageKey, handle);

    return handle;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }
    throw error;
  }
}

/**
 * Sauvegarde dans un dossier préalablement sélectionné
 */
export async function saveToDirectory(
  directoryHandle: FileSystemDirectoryHandle
): Promise<BackupResult> {
  try {
    // Vérifier les permissions
    const permission = await directoryHandle.requestPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      return {
        success: false,
        message: 'Permission refusée pour écrire dans ce dossier',
      };
    }

    const data = await exportAllData();
    const fileName = generateBackupFileName();

    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();

    return {
      success: true,
      message: `Sauvegarde enregistrée: ${fileName}`,
      filePath: fileName,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erreur lors de la sauvegarde: ${error.message}`,
    };
  }
}

/**
 * Stocke un handle de dossier dans IndexedDB pour persistance
 */
async function storeDirectoryHandle(key: string, handle: FileSystemDirectoryHandle): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cockpit-backup-handles', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('handles')) {
        db.createObjectStore('handles');
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('handles', 'readwrite');
      const store = tx.objectStore('handles');
      store.put(handle, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Récupère un handle de dossier depuis IndexedDB
 */
export async function getStoredDirectoryHandle(key: string): Promise<FileSystemDirectoryHandle | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cockpit-backup-handles', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('handles')) {
        db.createObjectStore('handles');
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('handles', 'readonly');
      const store = tx.objectStore('handles');
      const getRequest = store.get(key);

      getRequest.onsuccess = () => resolve(getRequest.result || null);
      getRequest.onerror = () => reject(getRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Supprime un handle de dossier stocké
 */
export async function removeStoredDirectoryHandle(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cockpit-backup-handles', 1);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('handles', 'readwrite');
      const store = tx.objectStore('handles');
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Vérifie si un handle stocké est encore valide
 */
export async function verifyDirectoryHandle(
  handle: FileSystemDirectoryHandle
): Promise<boolean> {
  try {
    const permission = await handle.queryPermission({ mode: 'readwrite' });
    return permission === 'granted';
  } catch {
    return false;
  }
}

/**
 * Import depuis un fichier avec File Picker
 */
export async function importWithFilePicker(): Promise<BackupResult> {
  if (!isFileSystemAccessSupported()) {
    return {
      success: false,
      message: 'API File System non supportée. Utilisez le bouton Importer standard.',
    };
  }

  try {
    const [handle] = await window.showOpenFilePicker!({
      types: [
        {
          description: 'Fichier de sauvegarde Cockpit',
          accept: { 'application/json': ['.json'] },
        },
      ],
    });

    const file = await handle.getFile();
    const text = await file.text();
    const result = await importAllData(text);

    if (result.success) {
      return {
        success: true,
        message: result.message,
        filePath: handle.name,
      };
    } else {
      return {
        success: false,
        message: result.message,
      };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Import annulé',
      };
    }
    return {
      success: false,
      message: `Erreur lors de l'import: ${error.message}`,
    };
  }
}

// Constantes exportées pour les clés de stockage
export const BACKUP_HANDLE_KEYS = {
  LOCAL: STORAGE_KEY_LOCAL,
  ONEDRIVE: STORAGE_KEY_ONEDRIVE,
};

// ============================================
// SAUVEGARDE AUTOMATIQUE
// ============================================

type AutoSaveTarget = 'local' | 'onedrive' | 'both';

interface AutoSaveCallbacks {
  onSuccess: (target: string, fileName: string) => void;
  onError: (target: string, error: string) => void;
  onStart: () => void;
}

let autoSaveIntervalId: number | null = null;
let autoSaveCallbacks: AutoSaveCallbacks | null = null;

/**
 * Démarre la sauvegarde automatique
 */
export function startAutoSave(
  intervalMinutes: number,
  target: AutoSaveTarget,
  callbacks: AutoSaveCallbacks
): void {
  // Arrêter tout intervalle existant
  stopAutoSave();

  autoSaveCallbacks = callbacks;

  // Convertir en millisecondes
  const intervalMs = intervalMinutes * 60 * 1000;

  // Créer le nouvel intervalle
  autoSaveIntervalId = window.setInterval(async () => {
    await performAutoSave(target);
  }, intervalMs);

  console.log(`[AutoSave] Démarré - Intervalle: ${intervalMinutes} min, Cible: ${target}`);
}

/**
 * Arrête la sauvegarde automatique
 */
export function stopAutoSave(): void {
  if (autoSaveIntervalId !== null) {
    window.clearInterval(autoSaveIntervalId);
    autoSaveIntervalId = null;
    console.log('[AutoSave] Arrêté');
  }
  autoSaveCallbacks = null;
}

/**
 * Vérifie si la sauvegarde automatique est active
 */
export function isAutoSaveRunning(): boolean {
  return autoSaveIntervalId !== null;
}

/**
 * Effectue une sauvegarde automatique
 */
export async function performAutoSave(target: AutoSaveTarget): Promise<{
  success: boolean;
  results: { target: string; success: boolean; message: string }[];
}> {
  const results: { target: string; success: boolean; message: string }[] = [];

  autoSaveCallbacks?.onStart();

  // Récupérer les handles stockés
  const localHandle = await getStoredDirectoryHandle(STORAGE_KEY_LOCAL);
  const oneDriveHandle = await getStoredDirectoryHandle(STORAGE_KEY_ONEDRIVE);

  // Sauvegarde locale
  if (target === 'local' || target === 'both') {
    if (localHandle) {
      try {
        const isValid = await verifyDirectoryHandle(localHandle);
        if (isValid) {
          const result = await saveToDirectory(localHandle);
          results.push({
            target: 'local',
            success: result.success,
            message: result.message,
          });
          if (result.success) {
            autoSaveCallbacks?.onSuccess('local', result.filePath || '');
          } else {
            autoSaveCallbacks?.onError('local', result.message);
          }
        } else {
          const msg = 'Permission expirée pour le dossier local. Veuillez reconfigurer.';
          results.push({ target: 'local', success: false, message: msg });
          autoSaveCallbacks?.onError('local', msg);
        }
      } catch (error: any) {
        const msg = `Erreur: ${error.message}`;
        results.push({ target: 'local', success: false, message: msg });
        autoSaveCallbacks?.onError('local', msg);
      }
    } else {
      const msg = 'Aucun dossier local configuré';
      results.push({ target: 'local', success: false, message: msg });
      autoSaveCallbacks?.onError('local', msg);
    }
  }

  // Sauvegarde OneDrive
  if (target === 'onedrive' || target === 'both') {
    if (oneDriveHandle) {
      try {
        const isValid = await verifyDirectoryHandle(oneDriveHandle);
        if (isValid) {
          const result = await saveToDirectory(oneDriveHandle);
          results.push({
            target: 'onedrive',
            success: result.success,
            message: result.message,
          });
          if (result.success) {
            autoSaveCallbacks?.onSuccess('onedrive', result.filePath || '');
          } else {
            autoSaveCallbacks?.onError('onedrive', result.message);
          }
        } else {
          const msg = 'Permission expirée pour OneDrive. Veuillez reconfigurer.';
          results.push({ target: 'onedrive', success: false, message: msg });
          autoSaveCallbacks?.onError('onedrive', msg);
        }
      } catch (error: any) {
        const msg = `Erreur: ${error.message}`;
        results.push({ target: 'onedrive', success: false, message: msg });
        autoSaveCallbacks?.onError('onedrive', msg);
      }
    } else {
      const msg = 'Aucun dossier OneDrive configuré';
      results.push({ target: 'onedrive', success: false, message: msg });
      autoSaveCallbacks?.onError('onedrive', msg);
    }
  }

  const allSuccess = results.every((r) => r.success);
  return { success: allSuccess, results };
}

/**
 * Formate une date pour l'affichage
 */
export function formatLastSaveTime(isoString: string | null): string {
  if (!isoString) return 'Jamais';

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
