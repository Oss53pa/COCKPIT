import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { emailService } from '../services/emailService';
import type {
  EmailConfiguration,
  NotificationHistoryEntry,
  NotificationStats,
  NotificationOptions,
  EmailJSConfig,
  DEFAULT_EMAIL_CONFIG,
} from '../types';

interface NotificationState {
  // Configuration
  config: EmailConfiguration;
  isConfigured: boolean;

  // Historique
  history: NotificationHistoryEntry[];

  // État
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  lastTestResult: { success: boolean; message: string; date: string } | null;

  // Actions de configuration
  updateConfig: (config: Partial<EmailConfiguration>) => void;
  setEmailJSConfig: (config: EmailJSConfig) => void;
  updateOptions: (options: Partial<NotificationOptions>) => void;
  enableNotifications: (enabled: boolean) => void;

  // Actions d'envoi
  sendTestEmail: () => Promise<boolean>;
  sendAlertNotification: (
    titre: string,
    message: string,
    priorite: 'critique' | 'haute' | 'normale' | 'info',
    centre?: string,
    lien?: string
  ) => Promise<boolean>;
  sendBailReminder: (
    locataire: string,
    local: string,
    centre: string,
    dateExpiration: string,
    joursRestants: number
  ) => Promise<boolean>;
  sendBackupNotification: (
    tailleMo: string,
    enregistrements: number,
    centresInclus: number,
    success: boolean,
    erreur?: string
  ) => Promise<boolean>;
  sendImportNotification: (
    nomFichier: string,
    lignesImportees: number,
    centre: string,
    success: boolean,
    erreur?: string
  ) => Promise<boolean>;
  sendEcheanceNotification: (
    titre: string,
    dateEcheance: string,
    responsable: string,
    centre: string,
    joursRestants: number
  ) => Promise<boolean>;
  sendObjectifAtteintNotification: (
    objectif: string,
    valeur: string,
    cible: string,
    centre: string
  ) => Promise<boolean>;

  // Historique
  addToHistory: (entry: Omit<NotificationHistoryEntry, 'id'>) => void;
  clearHistory: () => void;
  getStats: () => NotificationStats;
}

// Configuration par défaut
const defaultConfig: EmailConfiguration = {
  enabled: false,
  service: 'none',
  destinataireEmail: '',
  destinataireNom: '',
  options: {
    alertesCritiques: true,
    alertesImportantes: true,
    alertesInfo: false,
    digestQuotidien: false,
    digestHebdomadaire: true,
    heureDigest: '08:00',
    jourDigestHebdo: 1,
    nouvelleEcheance: true,
    baillExpiration: true,
    objectifAtteint: true,
    importTermine: false,
    backupEffectue: false,
    rappelEcheanceJours: 7,
    rappelBailJours: 90,
  },
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // État initial
      config: defaultConfig,
      isConfigured: false,
      history: [],
      isLoading: false,
      isSending: false,
      error: null,
      lastTestResult: null,

      // Mettre à jour la configuration
      updateConfig: (newConfig) => {
        const config = { ...get().config, ...newConfig };
        set({ config });

        // Réinitialiser le service email avec la nouvelle config
        emailService.configure(config);
        set({ isConfigured: emailService.isConfigured() });
      },

      // Configurer EmailJS
      setEmailJSConfig: (emailjsConfig) => {
        const config = {
          ...get().config,
          service: 'emailjs' as const,
          emailjs: emailjsConfig,
        };
        set({ config });
        emailService.configure(config);
        set({ isConfigured: emailService.isConfigured() });
      },

      // Mettre à jour les options de notification
      updateOptions: (options) => {
        const config = {
          ...get().config,
          options: { ...get().config.options, ...options },
        };
        set({ config });
        emailService.configure(config);
      },

      // Activer/désactiver les notifications
      enableNotifications: (enabled) => {
        const config = { ...get().config, enabled };
        set({ config });
        emailService.configure(config);
        set({ isConfigured: emailService.isConfigured() });
      },

      // Envoyer un email de test
      sendTestEmail: async () => {
        const { config } = get();

        if (!config.enabled || !config.emailjs?.publicKey) {
          set({
            lastTestResult: {
              success: false,
              message: 'Configuration EmailJS incomplète',
              date: new Date().toISOString(),
            },
          });
          return false;
        }

        set({ isSending: true, error: null });

        try {
          // S'assurer que le service est configuré
          emailService.configure(config);

          const result = await emailService.sendTestEmail();

          const testResult = {
            success: result.success,
            message: result.success
              ? 'Email de test envoyé avec succès !'
              : result.error || 'Erreur inconnue',
            date: new Date().toISOString(),
          };

          set({
            isSending: false,
            lastTestResult: testResult,
            config: {
              ...config,
              lastTestAt: new Date().toISOString(),
              lastTestSuccess: result.success,
            },
          });

          // Ajouter à l'historique
          get().addToHistory({
            type: 'info',
            sujet: 'Test de configuration email',
            destinataire: config.destinataireEmail,
            envoyeAt: new Date().toISOString(),
            statut: result.success ? 'envoye' : 'echec',
            erreur: result.error,
          });

          return result.success;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
          set({
            isSending: false,
            error: errorMessage,
            lastTestResult: {
              success: false,
              message: errorMessage,
              date: new Date().toISOString(),
            },
          });
          return false;
        }
      },

      // Envoyer une notification d'alerte
      sendAlertNotification: async (titre, message, priorite, centre, lien) => {
        const { config } = get();

        if (!config.enabled) {
          return false;
        }

        set({ isSending: true });

        try {
          emailService.configure(config);
          const result = await emailService.sendAlertNotification(
            titre,
            message,
            priorite,
            centre,
            lien
          );

          set({ isSending: false });

          // Ajouter à l'historique
          get().addToHistory({
            type: 'alerte',
            sujet: titre,
            destinataire: config.destinataireEmail,
            envoyeAt: new Date().toISOString(),
            statut: result.success ? 'envoye' : 'echec',
            erreur: result.error,
          });

          return result.success;
        } catch (error) {
          set({ isSending: false });
          return false;
        }
      },

      // Envoyer un rappel de bail
      sendBailReminder: async (locataire, local, centre, dateExpiration, joursRestants) => {
        const { config } = get();

        if (!config.enabled || !config.options.baillExpiration) {
          return false;
        }

        set({ isSending: true });

        try {
          emailService.configure(config);
          const result = await emailService.sendBailExpirationReminder(
            locataire,
            local,
            centre,
            dateExpiration,
            joursRestants
          );

          set({ isSending: false });

          // Ajouter à l'historique
          get().addToHistory({
            type: 'rappel',
            sujet: `Rappel bail: ${locataire}`,
            destinataire: config.destinataireEmail,
            envoyeAt: new Date().toISOString(),
            statut: result.success ? 'envoye' : 'echec',
            erreur: result.error,
          });

          return result.success;
        } catch (error) {
          set({ isSending: false });
          return false;
        }
      },

      // Envoyer une notification de backup
      sendBackupNotification: async (tailleMo, enregistrements, centresInclus, success, erreur) => {
        const { config } = get();

        if (!config.enabled || !config.options.backupEffectue) {
          return false;
        }

        set({ isSending: true });

        try {
          emailService.configure(config);
          const result = await emailService.sendBackupNotification(
            tailleMo,
            enregistrements,
            centresInclus,
            success,
            erreur
          );

          set({ isSending: false });

          get().addToHistory({
            type: 'info',
            sujet: success ? 'Sauvegarde effectuée' : 'Échec de sauvegarde',
            destinataire: config.destinataireEmail,
            envoyeAt: new Date().toISOString(),
            statut: result.success ? 'envoye' : 'echec',
            erreur: result.error,
          });

          return result.success;
        } catch (error) {
          set({ isSending: false });
          return false;
        }
      },

      // Envoyer une notification d'import
      sendImportNotification: async (nomFichier, lignesImportees, centre, success, erreur) => {
        const { config } = get();

        if (!config.enabled || !config.options.importTermine) {
          return false;
        }

        set({ isSending: true });

        try {
          emailService.configure(config);
          const result = await emailService.sendImportTermineNotification(
            nomFichier,
            lignesImportees,
            centre,
            success,
            erreur
          );

          set({ isSending: false });

          get().addToHistory({
            type: 'info',
            sujet: success ? `Import terminé: ${nomFichier}` : `Échec import: ${nomFichier}`,
            destinataire: config.destinataireEmail,
            envoyeAt: new Date().toISOString(),
            statut: result.success ? 'envoye' : 'echec',
            erreur: result.error,
          });

          return result.success;
        } catch (error) {
          set({ isSending: false });
          return false;
        }
      },

      // Envoyer une notification d'échéance
      sendEcheanceNotification: async (titre, dateEcheance, responsable, centre, joursRestants) => {
        const { config } = get();

        if (!config.enabled || !config.options.nouvelleEcheance) {
          return false;
        }

        set({ isSending: true });

        try {
          emailService.configure(config);
          const result = await emailService.sendEcheanceActionNotification(
            titre,
            dateEcheance,
            responsable,
            centre,
            joursRestants
          );

          set({ isSending: false });

          get().addToHistory({
            type: 'rappel',
            sujet: `Échéance: ${titre}`,
            destinataire: config.destinataireEmail,
            envoyeAt: new Date().toISOString(),
            statut: result.success ? 'envoye' : 'echec',
            erreur: result.error,
          });

          return result.success;
        } catch (error) {
          set({ isSending: false });
          return false;
        }
      },

      // Envoyer une notification d'objectif atteint
      sendObjectifAtteintNotification: async (objectif, valeur, cible, centre) => {
        const { config } = get();

        if (!config.enabled || !config.options.objectifAtteint) {
          return false;
        }

        set({ isSending: true });

        try {
          emailService.configure(config);
          const result = await emailService.sendObjectifAtteintNotification(
            objectif,
            valeur,
            cible,
            centre
          );

          set({ isSending: false });

          get().addToHistory({
            type: 'info',
            sujet: `Objectif atteint: ${objectif}`,
            destinataire: config.destinataireEmail,
            envoyeAt: new Date().toISOString(),
            statut: result.success ? 'envoye' : 'echec',
            erreur: result.error,
          });

          return result.success;
        } catch (error) {
          set({ isSending: false });
          return false;
        }
      },

      // Ajouter une entrée à l'historique
      addToHistory: (entry) => {
        const fullEntry: NotificationHistoryEntry = {
          ...entry,
          id: crypto.randomUUID(),
        };

        set((state) => ({
          history: [fullEntry, ...state.history].slice(0, 100), // Garder les 100 dernières
        }));
      },

      // Effacer l'historique
      clearHistory: () => {
        set({ history: [] });
      },

      // Obtenir les statistiques
      getStats: () => {
        const { history } = get();

        const stats: NotificationStats = {
          totalEnvoyes: history.filter((h) => h.statut === 'envoye').length,
          totalEchecs: history.filter((h) => h.statut === 'echec').length,
          dernierEnvoi: history.find((h) => h.statut === 'envoye')?.envoyeAt,
          parType: {
            alertes: history.filter((h) => h.type === 'alerte').length,
            digests: history.filter((h) => h.type === 'digest').length,
            rappels: history.filter((h) => h.type === 'rappel').length,
            infos: history.filter((h) => h.type === 'info').length,
          },
          parJour: [],
        };

        // Calculer les envois par jour (7 derniers jours)
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          const count = history.filter((h) => h.envoyeAt.startsWith(dateStr)).length;
          stats.parJour.push({ date: dateStr, count });
        }

        return stats;
      },
    }),
    {
      name: 'cockpit-notifications',
      partialize: (state) => ({
        config: state.config,
        history: state.history,
      }),
    }
  )
);

// Hook pour vérifier si les notifications sont configurées
export function useNotificationsConfigured() {
  return useNotificationStore((state) => state.isConfigured && state.config.enabled);
}
