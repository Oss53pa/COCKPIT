import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../db/database';
import type {
  UserProfile,
  UserPreferences,
  DEFAULT_USER_PREFERENCES,
  DEFAULT_USER_PROFILE,
} from '../types';

interface ProfileState {
  // État
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  setAvatar: (avatar: string | undefined) => Promise<void>;
  setSignature: (signature: string | undefined) => Promise<void>;
  resetProfile: () => Promise<void>;

  // Getters
  getPreference: <K extends keyof UserPreferences>(key: K) => UserPreferences[K];
  getFullName: () => string;
  getInitials: () => string;
}

// Valeurs par défaut des préférences
const defaultPreferences: UserPreferences = {
  langue: 'fr',
  theme: 'system',
  formatDate: 'DD/MM/YYYY',
  formatNombre: 'fr-FR',
  deviseDefaut: 'XOF',
  centreParDefaut: undefined,
  dashboardWidgets: [
    'kpi-summary',
    'alerts-recent',
    'actions-progress',
    'centres-overview',
  ],
  notificationsEmail: false,
  digestFrequence: 'hebdomadaire',
  exportQualite: 'haute',
  autoSaveInterval: 30,
};

// Profil par défaut
const createDefaultProfile = (): UserProfile => ({
  id: 'default-user',
  nom: '',
  prenom: '',
  email: '',
  fonction: '',
  organisation: 'CRMC',
  preferences: { ...defaultPreferences },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      // État initial
      profile: null,
      isLoading: false,
      error: null,
      isInitialized: false,

      // Charger le profil depuis IndexedDB
      loadProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          let profile = await db.userProfile.get('default-user');

          if (!profile) {
            // Créer un profil par défaut
            profile = createDefaultProfile();
            await db.userProfile.add(profile);
          }

          set({ profile, isLoading: false, isInitialized: true });
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
          // En cas d'erreur, utiliser un profil par défaut en mémoire
          set({
            profile: createDefaultProfile(),
            isLoading: false,
            error: String(error),
            isInitialized: true
          });
        }
      },

      // Mettre à jour le profil
      updateProfile: async (updates) => {
        const { profile } = get();
        if (!profile) return;

        const updatedProfile: UserProfile = {
          ...profile,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        try {
          await db.userProfile.put(updatedProfile);
          set({ profile: updatedProfile, error: null });
        } catch (error) {
          console.error('Erreur lors de la mise à jour du profil:', error);
          set({ error: String(error) });
        }
      },

      // Mettre à jour les préférences
      updatePreferences: async (preferences) => {
        const { profile } = get();
        if (!profile) return;

        const updatedProfile: UserProfile = {
          ...profile,
          preferences: {
            ...profile.preferences,
            ...preferences,
          },
          updatedAt: new Date().toISOString(),
        };

        try {
          await db.userProfile.put(updatedProfile);
          set({ profile: updatedProfile, error: null });

          // Appliquer le thème si changé
          if (preferences.theme) {
            applyTheme(preferences.theme);
          }

          // Appliquer la langue si changée
          if (preferences.langue) {
            document.documentElement.lang = preferences.langue;
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour des préférences:', error);
          set({ error: String(error) });
        }
      },

      // Définir l'avatar
      setAvatar: async (avatar) => {
        await get().updateProfile({ avatar });
      },

      // Définir la signature
      setSignature: async (signature) => {
        await get().updateProfile({ signature });
      },

      // Réinitialiser le profil
      resetProfile: async () => {
        const defaultProfile = createDefaultProfile();
        try {
          await db.userProfile.put(defaultProfile);
          set({ profile: defaultProfile, error: null });
        } catch (error) {
          console.error('Erreur lors de la réinitialisation du profil:', error);
          set({ error: String(error) });
        }
      },

      // Obtenir une préférence spécifique
      getPreference: (key) => {
        const { profile } = get();
        return profile?.preferences[key] ?? defaultPreferences[key];
      },

      // Obtenir le nom complet
      getFullName: () => {
        const { profile } = get();
        if (!profile) return '';
        return `${profile.prenom} ${profile.nom}`.trim() || 'Utilisateur';
      },

      // Obtenir les initiales
      getInitials: () => {
        const { profile } = get();
        if (!profile) return 'U';
        const prenom = profile.prenom?.[0] || '';
        const nom = profile.nom?.[0] || '';
        return (prenom + nom).toUpperCase() || 'U';
      },
    }),
    {
      name: 'cockpit-profile-store',
      partialize: (state) => ({
        // Ne persister que les données essentielles dans localStorage
        // Le profil complet est dans IndexedDB
        isInitialized: state.isInitialized,
      }),
    }
  )
);

// Fonction utilitaire pour appliquer le thème
function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}

// Initialiser le profil au chargement
export function initializeProfile() {
  const store = useProfileStore.getState();
  if (!store.isInitialized) {
    store.loadProfile();
  }
}
