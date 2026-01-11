import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Mail,
  Building2,
  Briefcase,
  Camera,
  Pen,
  Save,
  X,
  Sun,
  Moon,
  Monitor,
  Globe,
  Calendar,
  Bell,
  BellOff,
  FileSignature,
  Trash2,
  RotateCcw,
  Check,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
  Input,
  Select,
} from '../components/ui';
import { useProfileStore, useAppStore, useCentresStore } from '../store';
import type { UserPreferences } from '../types';

export function Profil() {
  const {
    profile,
    isLoading,
    loadProfile,
    updateProfile,
    updatePreferences,
    setAvatar,
    setSignature,
    getFullName,
    getInitials,
  } = useProfileStore();

  const { addToast } = useAppStore();
  const { centres } = useCentresStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    fonction: '',
    organisation: '',
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // Charger le profil au montage
  useEffect(() => {
    loadProfile();
  }, []);

  // Synchroniser le formulaire avec le profil
  useEffect(() => {
    if (profile) {
      setFormData({
        nom: profile.nom || '',
        prenom: profile.prenom || '',
        email: profile.email || '',
        fonction: profile.fonction || '',
        organisation: profile.organisation || '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    await updateProfile(formData);
    setIsEditing(false);
    addToast({
      type: 'success',
      title: 'Profil mis à jour',
      message: 'Vos informations ont été enregistrées',
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'Fichier trop volumineux',
        message: 'L\'image doit faire moins de 2 MB',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      await setAvatar(base64);
      addToast({
        type: 'success',
        title: 'Avatar mis à jour',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'Fichier trop volumineux',
        message: 'La signature doit faire moins de 1 MB',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      await setSignature(base64);
      addToast({
        type: 'success',
        title: 'Signature mise à jour',
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePreferenceChange = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    await updatePreferences({ [key]: value });
    addToast({
      type: 'success',
      title: 'Préférence mise à jour',
    });
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-900">Mon Profil</h1>
        <p className="text-primary-500 mt-1">Gérez vos informations personnelles et préférences</p>
      </div>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations Personnelles
              </CardTitle>
              <CardDescription>Vos informations apparaissent dans les rapports</CardDescription>
            </div>
            {!isEditing ? (
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
                leftIcon={<Pen className="w-4 h-4" />}
              >
                Modifier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Enregistrer
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-600">
                    {getInitials()}
                  </div>
                )}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-primary-900 text-white rounded-full hover:bg-primary-800 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              {profile.avatar && (
                <button
                  onClick={() => setAvatar(undefined)}
                  className="text-sm text-danger hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Supprimer
                </button>
              )}
            </div>

            {/* Formulaire */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                disabled={!isEditing}
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="Fonction"
                value={formData.fonction}
                onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                disabled={!isEditing}
                leftIcon={<Briefcase className="w-4 h-4" />}
                placeholder="Ex: Directrice Générale Adjointe"
              />
              <Input
                label="Organisation"
                value={formData.organisation}
                onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                disabled={!isEditing}
                leftIcon={<Building2 className="w-4 h-4" />}
                className="col-span-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Préférences d'affichage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Préférences d'Affichage
          </CardTitle>
          <CardDescription>Personnalisez l'interface de l'application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Thème */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-3">Thème</label>
              <div className="flex gap-3">
                <button
                  onClick={() => handlePreferenceChange('theme', 'light')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-btn border transition-all ${
                    profile.preferences.theme === 'light'
                      ? 'border-primary-900 bg-primary-50'
                      : 'border-primary-200 hover:border-primary-300'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Clair
                  {profile.preferences.theme === 'light' && <Check className="w-4 h-4 text-success" />}
                </button>
                <button
                  onClick={() => handlePreferenceChange('theme', 'dark')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-btn border transition-all ${
                    profile.preferences.theme === 'dark'
                      ? 'border-primary-900 bg-primary-50'
                      : 'border-primary-200 hover:border-primary-300'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Sombre
                  {profile.preferences.theme === 'dark' && <Check className="w-4 h-4 text-success" />}
                </button>
                <button
                  onClick={() => handlePreferenceChange('theme', 'system')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-btn border transition-all ${
                    profile.preferences.theme === 'system'
                      ? 'border-primary-900 bg-primary-50'
                      : 'border-primary-200 hover:border-primary-300'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  Système
                  {profile.preferences.theme === 'system' && <Check className="w-4 h-4 text-success" />}
                </button>
              </div>
            </div>

            {/* Langue et formats */}
            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Langue"
                value={profile.preferences.langue}
                onChange={(e) => handlePreferenceChange('langue', e.target.value as 'fr' | 'en')}
                options={[
                  { value: 'fr', label: 'Français' },
                  { value: 'en', label: 'English' },
                ]}
              />
              <Select
                label="Format de date"
                value={profile.preferences.formatDate}
                onChange={(e) => handlePreferenceChange('formatDate', e.target.value as UserPreferences['formatDate'])}
                options={[
                  { value: 'DD/MM/YYYY', label: '31/01/2026' },
                  { value: 'YYYY-MM-DD', label: '2026-01-31' },
                  { value: 'MM/DD/YYYY', label: '01/31/2026' },
                ]}
              />
              <Select
                label="Devise par défaut"
                value={profile.preferences.deviseDefaut}
                onChange={(e) => handlePreferenceChange('deviseDefaut', e.target.value)}
                options={[
                  { value: 'XOF', label: 'XOF - Franc CFA' },
                  { value: 'EUR', label: 'EUR - Euro' },
                  { value: 'USD', label: 'USD - Dollar US' },
                ]}
              />
            </div>

            {/* Centre par défaut */}
            <div>
              <Select
                label="Centre affiché au démarrage"
                value={profile.preferences.centreParDefaut || ''}
                onChange={(e) => handlePreferenceChange('centreParDefaut', e.target.value || undefined)}
                options={[
                  { value: '', label: 'Dashboard global' },
                  ...centres.map((c) => ({ value: c.id, label: c.nom })),
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configurez les alertes par email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div className="flex items-center gap-3">
                {profile.preferences.notificationsEmail ? (
                  <Bell className="w-5 h-5 text-success" />
                ) : (
                  <BellOff className="w-5 h-5 text-primary-400" />
                )}
                <div>
                  <p className="font-medium text-primary-900">Notifications par email</p>
                  <p className="text-sm text-primary-500">
                    {profile.preferences.notificationsEmail
                      ? 'Vous recevrez des alertes par email'
                      : 'Les notifications email sont désactivées'}
                  </p>
                </div>
              </div>
              <Button
                variant={profile.preferences.notificationsEmail ? 'secondary' : 'primary'}
                onClick={() => handlePreferenceChange('notificationsEmail', !profile.preferences.notificationsEmail)}
              >
                {profile.preferences.notificationsEmail ? 'Désactiver' : 'Activer'}
              </Button>
            </div>

            {profile.preferences.notificationsEmail && (
              <Select
                label="Fréquence du digest"
                value={profile.preferences.digestFrequence}
                onChange={(e) => handlePreferenceChange('digestFrequence', e.target.value as UserPreferences['digestFrequence'])}
                options={[
                  { value: 'quotidien', label: 'Quotidien (chaque soir)' },
                  { value: 'hebdomadaire', label: 'Hebdomadaire (lundi matin)' },
                  { value: 'jamais', label: 'Uniquement alertes critiques' },
                ]}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Signature pour rapports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            Signature pour Rapports
          </CardTitle>
          <CardDescription>Votre signature apparaîtra sur les rapports exportés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div className="p-4 border-2 border-dashed border-primary-200 rounded-lg bg-white min-h-[100px] flex items-center justify-center">
                {profile.signature ? (
                  <img
                    src={profile.signature}
                    alt="Signature"
                    className="max-h-20 object-contain"
                  />
                ) : (
                  <p className="text-primary-400 text-sm">Aucune signature définie</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={signatureInputRef}
                type="file"
                accept="image/*"
                onChange={handleSignatureChange}
                className="hidden"
              />
              <Button
                variant="secondary"
                onClick={() => signatureInputRef.current?.click()}
                leftIcon={<Camera className="w-4 h-4" />}
              >
                {profile.signature ? 'Changer' : 'Importer'}
              </Button>
              {profile.signature && (
                <Button
                  variant="danger"
                  onClick={() => setSignature(undefined)}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Supprimer
                </Button>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-primary-400">
            Conseil: Utilisez une image PNG avec fond transparent pour un meilleur rendu.
          </p>
        </CardContent>
      </Card>

      {/* Qualité d'export */}
      <Card>
        <CardHeader>
          <CardTitle>Options d'Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Qualité des exports"
              value={profile.preferences.exportQualite}
              onChange={(e) => handlePreferenceChange('exportQualite', e.target.value as 'standard' | 'haute')}
              options={[
                { value: 'standard', label: 'Standard (fichiers plus légers)' },
                { value: 'haute', label: 'Haute qualité (meilleur rendu)' },
              ]}
            />
            <Select
              label="Intervalle de sauvegarde auto (Report Studio)"
              value={String(profile.preferences.autoSaveInterval)}
              onChange={(e) => handlePreferenceChange('autoSaveInterval', parseInt(e.target.value))}
              options={[
                { value: '15', label: 'Toutes les 15 secondes' },
                { value: '30', label: 'Toutes les 30 secondes' },
                { value: '60', label: 'Toutes les minutes' },
                { value: '120', label: 'Toutes les 2 minutes' },
              ]}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
