import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Shield } from 'lucide-react';
import { Card, CardContent, Button, Input } from '../components/ui';
import { useAuthStore } from '../store';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    session,
    isLoading,
    error,
    needsSetup,
    isInitialized,
    login,
    setupAccount,
    clearError,
    initialize,
  } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: true,
  });

  // Initialiser l'auth si pas fait
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Rediriger si deja connecte
  useEffect(() => {
    if (session.isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [session.isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    let success: boolean;
    if (needsSetup) {
      success = await setupAccount({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
    } else {
      success = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
    }

    if (success) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  };

  // Afficher loader pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-900 rounded-full animate-spin" />
          <p className="text-primary-600 dark:text-primary-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-900 dark:bg-primary-100 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white dark:text-primary-900" />
          </div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white">Cockpit</h1>
          <p className="text-primary-600 dark:text-primary-300 mt-1">
            {needsSetup
              ? 'Configurez votre compte pour commencer'
              : 'Connectez-vous pour continuer'}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="votre@email.com"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 border border-primary-200 dark:border-primary-700 rounded-lg bg-white dark:bg-primary-800 text-primary-900 dark:text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={needsSetup ? 'Minimum 6 caracteres' : '••••••••'}
                    required
                    autoComplete={needsSetup ? 'new-password' : 'current-password'}
                    className="w-full pl-10 pr-12 py-2.5 border border-primary-200 dark:border-primary-700 rounded-lg bg-white dark:bg-primary-800 text-primary-900 dark:text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmation mot de passe (setup uniquement) */}
              {needsSetup && (
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirmez votre mot de passe"
                      required
                      autoComplete="new-password"
                      className="w-full pl-10 pr-4 py-2.5 border border-primary-200 dark:border-primary-700 rounded-lg bg-white dark:bg-primary-800 text-primary-900 dark:text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Se souvenir de moi (login uniquement) */}
              {!needsSetup && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="w-4 h-4 rounded border-primary-300 text-primary-900 focus:ring-primary-500"
                  />
                  <span className="text-sm text-primary-600 dark:text-primary-400">
                    Se souvenir de moi
                  </span>
                </label>
              )}

              {/* Message d'erreur */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Bouton submit */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                leftIcon={
                  needsSetup ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />
                }
              >
                {needsSetup ? 'Creer mon compte' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-xs text-primary-500 dark:text-primary-400 mt-4">
          {needsSetup
            ? 'Vos donnees sont stockees localement sur votre appareil.'
            : 'Application locale - Aucune connexion internet requise'}
        </p>
      </div>
    </div>
  );
}
