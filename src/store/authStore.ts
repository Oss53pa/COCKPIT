import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../db/database';
import { hashPassword, verifyPassword, generateSalt } from '../utils/authCrypto';
import type { AuthCredentials, AuthSession, LoginFormData, SetupFormData } from '../types';

interface AuthState {
  // Etat de session
  session: AuthSession;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  needsSetup: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (data: LoginFormData) => Promise<boolean>;
  logout: () => void;
  setupAccount: (data: SetupFormData) => Promise<boolean>;
  checkSession: () => boolean;
  clearError: () => void;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24h si pas "se souvenir"

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Etat initial
      session: {
        isAuthenticated: false,
        userId: null,
        email: null,
        loginAt: null,
        rememberMe: false,
        expiresAt: undefined,
      },
      isLoading: false,
      error: null,
      isInitialized: false,
      needsSetup: false,

      // Initialiser et verifier si un compte existe
      initialize: async () => {
        set({ isLoading: true, error: null });
        try {
          const credentials = await db.authCredentials.toArray();
          const needsSetup = credentials.length === 0;

          // Verifier si session encore valide
          const { session } = get();
          let isStillValid = false;

          if (session.isAuthenticated && !needsSetup) {
            if (session.rememberMe) {
              isStillValid = true;
            } else if (session.expiresAt) {
              isStillValid = new Date(session.expiresAt) > new Date();
            }
          }

          if (!isStillValid && session.isAuthenticated) {
            // Session expiree
            set({
              session: {
                isAuthenticated: false,
                userId: null,
                email: null,
                loginAt: null,
                rememberMe: false,
                expiresAt: undefined,
              },
            });
          }

          set({ isLoading: false, isInitialized: true, needsSetup });
        } catch (error) {
          console.error('Erreur initialisation auth:', error);
          set({ isLoading: false, error: String(error), isInitialized: true, needsSetup: true });
        }
      },

      // Connexion
      login: async (data: LoginFormData) => {
        set({ isLoading: true, error: null });
        try {
          const credentials = await db.authCredentials
            .where('email')
            .equals(data.email.toLowerCase().trim())
            .first();

          if (!credentials) {
            set({ isLoading: false, error: 'Email ou mot de passe incorrect' });
            return false;
          }

          const isValid = await verifyPassword(
            data.password,
            credentials.passwordHash,
            credentials.salt
          );

          if (!isValid) {
            set({ isLoading: false, error: 'Email ou mot de passe incorrect' });
            return false;
          }

          // Mise a jour derniere connexion
          await db.authCredentials.update(credentials.id, {
            lastLoginAt: new Date().toISOString(),
          });

          const now = new Date();
          const session: AuthSession = {
            isAuthenticated: true,
            userId: credentials.id,
            email: credentials.email,
            loginAt: now.toISOString(),
            rememberMe: data.rememberMe,
            expiresAt: data.rememberMe
              ? undefined
              : new Date(now.getTime() + SESSION_DURATION).toISOString(),
          };

          set({ session, isLoading: false, error: null });
          return true;
        } catch (error) {
          console.error('Erreur login:', error);
          set({ isLoading: false, error: 'Erreur de connexion' });
          return false;
        }
      },

      // Deconnexion
      logout: () => {
        set({
          session: {
            isAuthenticated: false,
            userId: null,
            email: null,
            loginAt: null,
            rememberMe: false,
            expiresAt: undefined,
          },
          error: null,
        });
      },

      // Configuration initiale (premier lancement)
      setupAccount: async (data: SetupFormData) => {
        set({ isLoading: true, error: null });
        try {
          if (data.password !== data.confirmPassword) {
            set({ isLoading: false, error: 'Les mots de passe ne correspondent pas' });
            return false;
          }

          if (data.password.length < 6) {
            set({ isLoading: false, error: 'Le mot de passe doit contenir au moins 6 caracteres' });
            return false;
          }

          const salt = await generateSalt();
          const passwordHash = await hashPassword(data.password, salt);

          const credentials: AuthCredentials = {
            id: crypto.randomUUID(),
            email: data.email.toLowerCase().trim(),
            passwordHash,
            salt,
            createdAt: new Date().toISOString(),
          };

          await db.authCredentials.add(credentials);

          // Connexion automatique apres creation
          const session: AuthSession = {
            isAuthenticated: true,
            userId: credentials.id,
            email: credentials.email,
            loginAt: new Date().toISOString(),
            rememberMe: true,
            expiresAt: undefined,
          };

          set({
            session,
            isLoading: false,
            needsSetup: false,
            error: null,
          });

          return true;
        } catch (error) {
          console.error('Erreur setup:', error);
          set({ isLoading: false, error: 'Erreur lors de la creation du compte' });
          return false;
        }
      },

      // Verifier validite session
      checkSession: () => {
        const { session } = get();
        if (!session.isAuthenticated) return false;
        if (session.rememberMe) return true;
        if (session.expiresAt) {
          return new Date(session.expiresAt) > new Date();
        }
        return false;
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'cockpit-auth-store',
      partialize: (state) => ({
        session: state.session,
      }),
    }
  )
);

// Fonction d'initialisation a appeler au demarrage
export function initializeAuth() {
  const store = useAuthStore.getState();
  if (!store.isInitialized) {
    store.initialize();
  }
}
