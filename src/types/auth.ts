/**
 * Types pour l'authentification locale
 */

// Credentials stockes dans IndexedDB
export interface AuthCredentials {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLoginAt?: string;
}

// Session d'authentification (persistee dans localStorage)
export interface AuthSession {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  loginAt: string | null;
  rememberMe: boolean;
  expiresAt?: string;
}

// Donnees du formulaire de login
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Donnees du formulaire de creation de compte
export interface SetupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}
