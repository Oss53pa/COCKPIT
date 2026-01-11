import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../db/database';
import type {
  BackupHistoryEntry,
  BackupMetadata,
  BackupValidation,
  AutoBackupConfig,
  RestoreOptions,
  RestoreResult,
  StorageStats,
} from '../types';
import pako from 'pako';
import { useNotificationStore } from './notificationStore';

// ===========================================
// CHIFFREMENT AES-256-GCM
// ===========================================

const ENCRYPTION_SALT_LENGTH = 16;
const ENCRYPTION_IV_LENGTH = 12;
const ENCRYPTION_TAG_LENGTH = 128;
const PBKDF2_ITERATIONS = 100000;

/**
 * Dérive une clé AES-256 à partir d'un mot de passe avec PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Chiffre les données avec AES-256-GCM
 */
async function encryptData(data: Uint8Array, password: string): Promise<Uint8Array> {
  const salt = crypto.getRandomValues(new Uint8Array(ENCRYPTION_SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_IV_LENGTH));
  const key = await deriveKey(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: ENCRYPTION_TAG_LENGTH },
    key,
    data
  );

  // Format: salt (16) + iv (12) + encrypted data
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encrypted), salt.length + iv.length);

  return result;
}

/**
 * Déchiffre les données avec AES-256-GCM
 */
async function decryptData(encryptedData: Uint8Array, password: string): Promise<Uint8Array> {
  const salt = encryptedData.slice(0, ENCRYPTION_SALT_LENGTH);
  const iv = encryptedData.slice(ENCRYPTION_SALT_LENGTH, ENCRYPTION_SALT_LENGTH + ENCRYPTION_IV_LENGTH);
  const data = encryptedData.slice(ENCRYPTION_SALT_LENGTH + ENCRYPTION_IV_LENGTH);

  const key = await deriveKey(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, tagLength: ENCRYPTION_TAG_LENGTH },
    key,
    data
  );

  return new Uint8Array(decrypted);
}

/**
 * Vérifie si les données sont chiffrées (header magique)
 */
function isEncrypted(data: Uint8Array): boolean {
  // Les données chiffrées commencent par un salt aléatoire
  // On vérifie que ce n'est ni du gzip (1f 8b) ni du JSON ({)
  if (data.length < ENCRYPTION_SALT_LENGTH + ENCRYPTION_IV_LENGTH + 16) {
    return false;
  }
  // Si ça commence par 1f 8b (gzip) ou 7b (JSON '{'), ce n'est pas chiffré
  return data[0] !== 0x1f && data[0] !== 0x7b && data[1] !== 0x8b;
}

interface BackupState {
  // État
  history: BackupHistoryEntry[];
  autoBackupConfig: AutoBackupConfig;
  storageStats: StorageStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadHistory: () => Promise<void>;
  createBackup: (cible: 'download' | 'local' | 'onedrive', options?: { centreIds?: string[]; password?: string }) => Promise<{ success: boolean; message: string; filename?: string }>;
  validateBackup: (file: File, password?: string) => Promise<BackupValidation>;
  restoreBackup: (file: File, options: RestoreOptions & { password?: string }) => Promise<RestoreResult>;
  deleteBackupEntry: (id: string) => Promise<void>;
  setAutoBackupConfig: (config: Partial<AutoBackupConfig>) => Promise<void>;
  calculateStorageStats: () => Promise<StorageStats>;
  cleanOldBackups: (keepCount: number) => Promise<number>;
}

// Configuration par défaut
const defaultAutoBackupConfig: AutoBackupConfig = {
  enabled: false,
  frequence: 'hebdomadaire',
  heure: '18:00',
  joursRetenus: 10,
  cibles: {
    local: true,
    onedrive: false,
  },
  notifierSiEchec: true,
};

export const useBackupStore = create<BackupState>()(
  persist(
    (set, get) => ({
      // État initial
      history: [],
      autoBackupConfig: defaultAutoBackupConfig,
      storageStats: null,
      isLoading: false,
      error: null,

      // Charger l'historique des sauvegardes
      loadHistory: async () => {
        set({ isLoading: true, error: null });
        try {
          const history = await db.backupHistory.orderBy('date').reverse().toArray();
          set({ history, isLoading: false });
        } catch (error) {
          console.error('Erreur lors du chargement de l\'historique:', error);
          set({ error: String(error), isLoading: false });
        }
      },

      // Créer une sauvegarde
      createBackup: async (cible, options = {}) => {
        set({ isLoading: true, error: null });
        const startTime = Date.now();

        try {
          // Collecter toutes les données
          const data = await collectAllData(options.centreIds);

          // Créer les métadonnées
          const meta: BackupMetadata = {
            version: '1.1',
            exportDate: new Date().toISOString(),
            appVersion: '1.1.0',
            dbVersion: 6,
            checksum: await calculateChecksum(JSON.stringify(data)),
            tables: Object.keys(data).length,
            totalRecords: Object.values(data).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
            centresInclus: options.centreIds || (await db.centres.toArray()).map(c => c.id),
            tailleMo: 0,
          };

          // Structurer le fichier de backup
          const backupContent = {
            meta,
            data,
          };

          const jsonString = JSON.stringify(backupContent);
          const compressedData = pako.gzip(jsonString);

          // Chiffrer si mot de passe fourni
          let finalData: Uint8Array;
          let isEncryptedBackup = false;

          if (options.password) {
            finalData = await encryptData(compressedData, options.password);
            isEncryptedBackup = true;
          } else {
            finalData = compressedData;
          }

          meta.tailleMo = finalData.length / (1024 * 1024);

          // Générer le nom du fichier
          const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
          const encryptedSuffix = isEncryptedBackup ? '.encrypted' : '';
          const filename = `cockpit_backup_${dateStr}${encryptedSuffix}.json.gz`;

          // Créer le blob
          const blob = new Blob([finalData], { type: isEncryptedBackup ? 'application/octet-stream' : 'application/gzip' });

          // Enregistrer dans l'historique
          const historyEntry: BackupHistoryEntry = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            type: 'manuel',
            cible,
            tailleMo: meta.tailleMo,
            centresInclus: meta.centresInclus.length,
            enregistrements: meta.totalRecords,
            statut: 'succes',
            checksum: meta.checksum,
          };

          await db.backupHistory.add(historyEntry);

          // Télécharger le fichier
          if (cible === 'download') {
            downloadBlob(blob, filename);
          }

          // Recharger l'historique
          await get().loadHistory();

          // Envoyer notification de succès
          try {
            const notificationStore = useNotificationStore.getState();
            if (notificationStore.config.enabled && notificationStore.config.options.rapportsHebdomadaires) {
              await notificationStore.sendBackupNotification(
                meta.tailleMo.toFixed(2),
                meta.totalRecords,
                meta.centresInclus.length,
                true
              );
            }
          } catch (notifError) {
            console.warn('Erreur envoi notification backup:', notifError);
          }

          set({ isLoading: false });
          return {
            success: true,
            message: `Sauvegarde créée avec succès (${meta.tailleMo.toFixed(2)} MB, ${meta.totalRecords} enregistrements)`,
            filename,
          };
        } catch (error) {
          console.error('Erreur lors de la création de la sauvegarde:', error);

          // Envoyer notification d'échec
          try {
            const notificationStore = useNotificationStore.getState();
            if (notificationStore.config.enabled && get().autoBackupConfig.notifierSiEchec) {
              await notificationStore.sendBackupNotification(
                '0',
                0,
                0,
                false,
                String(error)
              );
            }
          } catch (notifError) {
            console.warn('Erreur envoi notification échec backup:', notifError);
          }

          set({ error: String(error), isLoading: false });
          return { success: false, message: String(error) };
        }
      },

      // Valider un fichier de sauvegarde
      validateBackup: async (file) => {
        const result: BackupValidation = {
          isValid: false,
          version: '',
          compatible: false,
          dateExport: '',
          centresCount: 0,
          recordsCount: 0,
          integrityCheck: false,
          warnings: [],
          errors: [],
        };

        try {
          const arrayBuffer = await file.arrayBuffer();
          let jsonString: string;

          // Tenter de décompresser (gzip)
          try {
            const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
            jsonString = decompressed;
          } catch {
            // Si échec, essayer comme JSON brut
            jsonString = new TextDecoder().decode(arrayBuffer);
          }

          const data = JSON.parse(jsonString);

          // Vérifier la structure
          if (!data.meta) {
            result.errors.push('Structure de sauvegarde invalide: métadonnées manquantes');
            return result;
          }

          result.version = data.meta.version || '1.0';
          result.dateExport = data.meta.exportDate || '';
          result.centresCount = data.meta.centresInclus?.length || 0;
          result.recordsCount = data.meta.totalRecords || 0;

          // Vérifier la compatibilité de version
          const currentDbVersion = 6;
          const backupDbVersion = data.meta.dbVersion || 1;
          result.compatible = backupDbVersion <= currentDbVersion;

          if (!result.compatible) {
            result.errors.push(`Version de base de données incompatible (backup: ${backupDbVersion}, actuelle: ${currentDbVersion})`);
          }

          // Vérifier l'intégrité (checksum)
          if (data.meta.checksum) {
            const calculatedChecksum = await calculateChecksum(JSON.stringify(data.data));
            result.integrityCheck = calculatedChecksum === data.meta.checksum;
            if (!result.integrityCheck) {
              result.warnings.push('Le checksum ne correspond pas - les données peuvent avoir été modifiées');
            }
          } else {
            result.integrityCheck = true;
            result.warnings.push('Pas de checksum dans la sauvegarde - impossible de vérifier l\'intégrité');
          }

          // Vérifications supplémentaires
          if (!data.data) {
            result.errors.push('Aucune donnée trouvée dans la sauvegarde');
          }

          result.isValid = result.errors.length === 0 && result.compatible;

        } catch (error) {
          result.errors.push(`Erreur de lecture du fichier: ${error}`);
        }

        return result;
      },

      // Restaurer une sauvegarde
      restoreBackup: async (file, options) => {
        const startTime = Date.now();
        const result: RestoreResult = {
          success: false,
          message: '',
          enregistrementsRestaures: 0,
          enregistrementsIgnores: 0,
          conflitsResolus: 0,
          erreurs: [],
          dureeMs: 0,
        };

        try {
          // Valider d'abord
          const validation = await get().validateBackup(file);
          if (!validation.isValid) {
            result.erreurs = validation.errors;
            result.message = 'Validation échouée';
            return result;
          }

          // Créer une sauvegarde avant restauration si demandé
          if (options.creerSauvegardeAvant) {
            await get().createBackup('download');
          }

          // Lire et décompresser le fichier
          const arrayBuffer = await file.arrayBuffer();
          let jsonString: string;
          try {
            jsonString = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
          } catch {
            jsonString = new TextDecoder().decode(arrayBuffer);
          }

          const backupData = JSON.parse(jsonString);

          // Effectuer la restauration
          if (options.mode === 'complet') {
            await performFullRestore(backupData.data);
            result.enregistrementsRestaures = backupData.meta.totalRecords;
          } else {
            // Mode fusion - plus complexe, à implémenter
            result.message = 'Mode fusion non encore implémenté';
            result.erreurs.push('Mode fusion non supporté dans cette version');
            return result;
          }

          // Enregistrer dans l'historique
          const historyEntry: BackupHistoryEntry = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            type: 'manuel',
            cible: 'download',
            tailleMo: 0,
            centresInclus: backupData.meta.centresInclus?.length || 0,
            enregistrements: result.enregistrementsRestaures,
            statut: 'succes',
            checksum: backupData.meta.checksum || '',
          };
          await db.backupHistory.add(historyEntry);

          result.success = true;
          result.message = `Restauration réussie: ${result.enregistrementsRestaures} enregistrements restaurés`;
          result.dureeMs = Date.now() - startTime;

        } catch (error) {
          result.erreurs.push(String(error));
          result.message = `Erreur de restauration: ${error}`;
        }

        result.dureeMs = Date.now() - startTime;
        return result;
      },

      // Supprimer une entrée de l'historique
      deleteBackupEntry: async (id) => {
        try {
          await db.backupHistory.delete(id);
          await get().loadHistory();
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          set({ error: String(error) });
        }
      },

      // Configurer la sauvegarde automatique
      setAutoBackupConfig: async (config) => {
        const newConfig = { ...get().autoBackupConfig, ...config };
        set({ autoBackupConfig: newConfig });
      },

      // Calculer les statistiques de stockage
      calculateStorageStats: async () => {
        const stats: StorageStats = {
          totalUtilise: 0,
          limiteEstimee: 500 * 1024 * 1024, // 500 MB
          parCategorie: {
            documents: 0,
            donneesMétier: 0,
            historiqueImports: 0,
            sauvegardesLocales: 0,
          },
          documentsVolumineux: [],
        };

        try {
          // Estimer la taille des différentes tables
          const centres = await db.centres.toArray();
          const documents = await db.documents.toArray();
          const fichiersImport = await db.fichiersImport.toArray();
          const backupHistory = await db.backupHistory.toArray();

          // Calculer les tailles (estimation basée sur JSON.stringify)
          const tailleDonnees = JSON.stringify(centres).length;
          const tailleDocuments = documents.reduce((sum, doc) => {
            const taille = doc.contenu ? doc.contenu.length * 0.75 : 0; // base64 -> bytes
            return sum + taille;
          }, 0);
          const tailleImports = JSON.stringify(fichiersImport).length;
          const tailleBackups = JSON.stringify(backupHistory).length;

          stats.parCategorie.donneesMétier = tailleDonnees;
          stats.parCategorie.documents = tailleDocuments;
          stats.parCategorie.historiqueImports = tailleImports;
          stats.parCategorie.sauvegardesLocales = tailleBackups;

          stats.totalUtilise = tailleDonnees + tailleDocuments + tailleImports + tailleBackups;

          // Documents volumineux
          stats.documentsVolumineux = documents
            .filter(doc => doc.taille && doc.taille > 1024 * 1024) // > 1 MB
            .map(doc => ({
              id: doc.id,
              nom: doc.nom,
              taille: doc.taille || 0,
              categorie: doc.categorie,
              dateAjout: doc.dateAjout,
            }))
            .sort((a, b) => b.taille - a.taille)
            .slice(0, 10);

        } catch (error) {
          console.error('Erreur lors du calcul des statistiques:', error);
        }

        set({ storageStats: stats });
        return stats;
      },

      // Nettoyer les anciennes sauvegardes
      cleanOldBackups: async (keepCount) => {
        const { history } = get();
        const toDelete = history.slice(keepCount);
        let deleted = 0;

        for (const entry of toDelete) {
          try {
            await db.backupHistory.delete(entry.id);
            deleted++;
          } catch (error) {
            console.error('Erreur lors de la suppression:', error);
          }
        }

        await get().loadHistory();
        return deleted;
      },
    }),
    {
      name: 'cockpit-backup-store',
      partialize: (state) => ({
        autoBackupConfig: state.autoBackupConfig,
      }),
    }
  )
);

// Fonctions utilitaires

async function collectAllData(centreIds?: string[]) {
  const data: Record<string, unknown[]> = {};

  // Tables principales
  data.centres = centreIds
    ? await db.centres.where('id').anyOf(centreIds).toArray()
    : await db.centres.toArray();

  const centreFilter = centreIds ? { centreId: centreIds } : {};

  data.postes = await db.postes.toArray();
  data.membresEquipe = await db.membresEquipe.toArray();
  data.axes = await db.axes.toArray();
  data.objectifs = await db.objectifs.toArray();
  data.mesures = await db.mesures.toArray();
  data.actions = await db.actions.toArray();
  data.reunions = await db.reunions.toArray();
  data.livrables = await db.livrables.toArray();
  data.evaluations = await db.evaluations.toArray();
  data.audits = await db.audits.toArray();
  data.risques = await db.risques.toArray();
  data.alertes = await db.alertes.toArray();
  data.parametres = await db.parametres.toArray();

  // Tables BI
  data.fichiersImport = await db.fichiersImport.toArray();
  data.dossiersImport = await db.dossiersImport.toArray();
  data.etatsLocatifs = await db.etatsLocatifs.toArray();
  data.donneesLoyers = await db.donneesLoyers.toArray();
  data.donneesFrequentation = await db.donneesFrequentation.toArray();
  data.donneesChiffreAffaires = await db.donneesChiffreAffaires.toArray();
  data.donneesCharges = await db.donneesCharges.toArray();
  data.donneesBaux = await db.donneesBaux.toArray();
  data.donneesTravaux = await db.donneesTravaux.toArray();
  data.donneesValorisation = await db.donneesValorisation.toArray();
  data.donneesEnergie = await db.donneesEnergie.toArray();
  data.donneesSatisfaction = await db.donneesSatisfaction.toArray();
  data.typesRapport = await db.typesRapport.toArray();
  data.packsRapport = await db.packsRapport.toArray();
  data.rapports = await db.rapports.toArray();
  data.modelesRapport = await db.modelesRapport.toArray();
  data.resultatsKPI = await db.resultatsKPI.toArray();
  data.insights = await db.insights.toArray();
  data.reglesAlerte = await db.reglesAlerte.toArray();
  data.alertesGenerees = await db.alertesGenerees.toArray();
  data.tendancesPrediction = await db.tendancesPrediction.toArray();
  data.benchmarks = await db.benchmarks.toArray();
  data.configurationsBI = await db.configurationsBI.toArray();

  // Tables Projet
  data.projets = await db.projets.toArray();
  data.phasesProjet = await db.phasesProjet.toArray();
  data.jalons = await db.jalons.toArray();
  data.vaguesRecrutement = await db.vaguesRecrutement.toArray();
  data.postesARecruter = await db.postesARecruter.toArray();
  data.prospectsCommerciaux = await db.prospectsCommerciaux.toArray();
  data.suiviBEFA = await db.suiviBEFA.toArray();
  data.reserves = await db.reserves.toArray();
  data.documentsDOE = await db.documentsDOE.toArray();
  data.risquesProjet = await db.risquesProjet.toArray();
  data.actionsCommunication = await db.actionsCommunication.toArray();
  data.evenementsLancement = await db.evenementsLancement.toArray();
  data.phasesHandover = await db.phasesHandover.toArray();
  data.jalonsCommerciaux = await db.jalonsCommerciaux.toArray();

  // Tables v6
  data.userProfile = await db.userProfile.toArray();
  data.journalModifications = await db.journalModifications.toArray();
  data.periodesCloturees = await db.periodesCloturees.toArray();
  data.documents = await db.documents.toArray();
  data.mappingHistory = await db.mappingHistory.toArray();

  return data;
}

async function performFullRestore(data: Record<string, unknown[]>) {
  await db.transaction('rw', db.tables, async () => {
    // Vider toutes les tables
    for (const table of db.tables) {
      await table.clear();
    }

    // Restaurer les données
    for (const [tableName, records] of Object.entries(data)) {
      if (Array.isArray(records) && records.length > 0) {
        const table = db.table(tableName);
        if (table) {
          await table.bulkAdd(records);
        }
      }
    }
  });
}

async function calculateChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return 'sha256:' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
