import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const { session, isInitialized, checkSession, initialize } = useAuthStore();

  // Initialiser l'auth si pas fait
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Afficher loader pendant initialisation
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50 dark:bg-primary-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-900 rounded-full animate-spin" />
          <p className="text-primary-600 dark:text-primary-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers login si pas authentifie ou session expiree
  if (!session.isAuthenticated || !checkSession()) {
    // Sauvegarder l'URL demandee pour redirection apres login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
