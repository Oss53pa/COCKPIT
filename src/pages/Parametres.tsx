import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Download,
  Upload,
  Database,
  Mail,
  Palette,
  Moon,
  Sun,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  XCircle,
  HardDrive,
  Cloud,
  FolderOpen,
  Trash2,
  RefreshCw,
  Info,
  History,
  FileArchive,
  BarChart3,
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
  Badge,
} from '../components/ui';
import { useAppStore, useAIStore, useBackupStore } from '../store';
import type { BackupHistoryEntry } from '../types';
import { exportAllData, importAllData } from '../db/database';
import {
  OPENROUTER_MODELS,
  CLAUDE_MODELS,
  validateApiKey,
  AIProvider,
} from '../services/aiService';
import {
  isFileSystemAccessSupported,
  saveViaDownload,
  saveWithFilePicker,
  saveToDirectory,
  selectBackupDirectory,
  getStoredDirectoryHandle,
  removeStoredDirectoryHandle,
  verifyDirectoryHandle,
  BACKUP_HANDLE_KEYS,
  startAutoSave,
  stopAutoSave,
  isAutoSaveRunning,
  performAutoSave,
  formatLastSaveTime,
} from '../utils/backupManager';
import { Clock, Play, Square, Zap, Bot, Key, Cpu, Eye, EyeOff, ExternalLink } from 'lucide-react';

// Types pour les onglets
type SettingsTab = 'apparence' | 'donnees' | 'email' | 'ia' | 'apropos';

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TABS: TabConfig[] = [
  { id: 'apparence', label: 'Apparence', icon: <Palette className="w-4 h-4" />, description: 'Theme et interface' },
  { id: 'donnees', label: 'Donnees', icon: <Database className="w-4 h-4" />, description: 'Sauvegarde et restauration' },
  { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" />, description: 'Notifications' },
  { id: 'ia', label: 'Intelligence Artificielle', icon: <Bot className="w-4 h-4" />, description: 'Proph3et' },
  { id: 'apropos', label: 'A propos', icon: <Info className="w-4 h-4" />, description: 'Version et infos' },
];

export function Parametres() {
  const { theme, setTheme, addToast, autoSaveConfig, setAutoSaveConfig, updateLastSave } = useAppStore();
  const {
    config: aiConfig,
    setActiveProvider,
    setOpenRouterApiKey,
    setClaudeApiKey,
    setOpenRouterModel,
    setClaudeModel,
    setTemperature,
    setMaxTokens,
    usage: aiUsage,
  } = useAIStore();
  const {
    history: backupHistory,
    storageStats,
    isLoading: isLoadingBackup,
    loadHistory,
    createBackup,
    restoreBackup,
    deleteBackupEntry,
    calculateStorageStats,
  } = useBackupStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('apparence');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isSavingOneDrive, setIsSavingOneDrive] = useState(false);
  const [isSelectingLocal, setIsSelectingLocal] = useState(false);
  const [isSelectingOneDrive, setIsSelectingOneDrive] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Etat pour la configuration IA
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [tempOpenRouterKey, setTempOpenRouterKey] = useState(aiConfig.openrouterApiKey);
  const [tempClaudeKey, setTempClaudeKey] = useState(aiConfig.claudeApiKey);
  const [isValidatingOpenRouter, setIsValidatingOpenRouter] = useState(false);
  const [isValidatingClaude, setIsValidatingClaude] = useState(false);

  // Handles des dossiers configures
  const [localHandle, setLocalHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [oneDriveHandle, setOneDriveHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [localFolderName, setLocalFolderName] = useState<string | null>(null);
  const [oneDriveFolderName, setOneDriveFolderName] = useState<string | null>(null);

  const fileSystemSupported = isFileSystemAccessSupported();

  // Charger les handles stockes au demarrage
  useEffect(() => {
    const loadStoredHandles = async () => {
      if (!fileSystemSupported) return;

      try {
        const storedLocal = await getStoredDirectoryHandle(BACKUP_HANDLE_KEYS.LOCAL);
        if (storedLocal) {
          const isValid = await verifyDirectoryHandle(storedLocal);
          if (isValid) {
            setLocalHandle(storedLocal);
            setLocalFolderName(storedLocal.name);
          }
        }

        const storedOneDrive = await getStoredDirectoryHandle(BACKUP_HANDLE_KEYS.ONEDRIVE);
        if (storedOneDrive) {
          const isValid = await verifyDirectoryHandle(storedOneDrive);
          if (isValid) {
            setOneDriveHandle(storedOneDrive);
            setOneDriveFolderName(storedOneDrive.name);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des handles:', error);
      }
    };

    loadStoredHandles();
  }, [fileSystemSupported]);

  // Charger l'historique des sauvegardes
  useEffect(() => {
    loadHistory();
    calculateStorageStats();
  }, []);

  // Gerer la sauvegarde automatique
  useEffect(() => {
    if (autoSaveConfig.enabled && fileSystemSupported) {
      const hasRequiredFolders =
        autoSaveConfig.target === 'local' ? localHandle !== null :
        autoSaveConfig.target === 'onedrive' ? oneDriveHandle !== null :
        localHandle !== null || oneDriveHandle !== null;

      if (hasRequiredFolders) {
        startAutoSave(autoSaveConfig.intervalMinutes, autoSaveConfig.target, {
          onStart: () => setIsAutoSaving(true),
          onSuccess: (target, fileName) => {
            setIsAutoSaving(false);
            updateLastSave('success');
            addToast({
              type: 'success',
              title: 'Sauvegarde automatique',
              message: `${target === 'local' ? 'Local' : 'OneDrive'}: ${fileName}`,
              duration: 3000,
            });
          },
          onError: (target, error) => {
            setIsAutoSaving(false);
            updateLastSave('error');
            addToast({
              type: 'error',
              title: 'Erreur sauvegarde auto',
              message: `${target}: ${error}`,
            });
          },
        });
      }
    } else {
      stopAutoSave();
    }

    return () => {
      stopAutoSave();
    };
  }, [autoSaveConfig.enabled, autoSaveConfig.intervalMinutes, autoSaveConfig.target, localHandle, oneDriveHandle, fileSystemSupported]);

  // Handlers pour la sauvegarde automatique
  const handleToggleAutoSave = () => {
    if (autoSaveConfig.enabled) {
      setAutoSaveConfig({ enabled: false });
      addToast({ type: 'info', title: 'Sauvegarde automatique', message: 'Desactivee' });
    } else {
      const hasFolder =
        autoSaveConfig.target === 'local' ? localHandle !== null :
        autoSaveConfig.target === 'onedrive' ? oneDriveHandle !== null :
        localHandle !== null || oneDriveHandle !== null;

      if (!hasFolder) {
        addToast({
          type: 'warning',
          title: 'Configuration requise',
          message: 'Veuillez d\'abord configurer un dossier de sauvegarde',
        });
        return;
      }

      setAutoSaveConfig({ enabled: true });
      addToast({
        type: 'success',
        title: 'Sauvegarde automatique',
        message: `Activee - Toutes les ${autoSaveConfig.intervalMinutes} minutes`,
      });
    }
  };

  const handleSaveNow = async () => {
    setIsAutoSaving(true);
    try {
      const result = await performAutoSave(autoSaveConfig.target);
      if (result.success) {
        updateLastSave('success');
        addToast({
          type: 'success',
          title: 'Sauvegarde effectuee',
          message: result.results.map(r => `${r.target}: ${r.message}`).join('\n'),
        });
      } else {
        updateLastSave('error');
        const errors = result.results.filter(r => !r.success);
        addToast({
          type: 'error',
          title: 'Erreur de sauvegarde',
          message: errors.map(r => `${r.target}: ${r.message}`).join('\n'),
        });
      }
    } catch (error) {
      updateLastSave('error');
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Validation des cles API
  const handleValidateOpenRouter = async () => {
    if (!tempOpenRouterKey.trim()) {
      addToast({ type: 'warning', title: 'Cle API requise', message: 'Veuillez entrer votre cle API OpenRouter' });
      return;
    }

    setIsValidatingOpenRouter(true);
    try {
      const isValid = await validateApiKey('openrouter', tempOpenRouterKey.trim());
      if (isValid) {
        setOpenRouterApiKey(tempOpenRouterKey.trim());
        addToast({ type: 'success', title: 'Cle API validee', message: 'Votre cle API OpenRouter est configuree' });
      } else {
        addToast({ type: 'error', title: 'Cle invalide', message: 'La cle API n\'est pas valide ou a expire' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur de validation', message: String(error) });
    } finally {
      setIsValidatingOpenRouter(false);
    }
  };

  const handleValidateClaude = async () => {
    if (!tempClaudeKey.trim()) {
      addToast({ type: 'warning', title: 'Cle API requise', message: 'Veuillez entrer votre cle API Claude' });
      return;
    }

    setIsValidatingClaude(true);
    try {
      const isValid = await validateApiKey('claude', tempClaudeKey.trim());
      if (isValid) {
        setClaudeApiKey(tempClaudeKey.trim());
        addToast({ type: 'success', title: 'Cle API validee', message: 'Votre cle API Claude est configuree' });
      } else {
        addToast({ type: 'error', title: 'Cle invalide', message: 'La cle API n\'est pas valide ou a expire' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur de validation', message: String(error) });
    } finally {
      setIsValidatingClaude(false);
    }
  };

  // Handlers pour export/import
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await saveViaDownload();
      if (result.success) {
        addToast({ type: 'success', title: 'Export reussi', message: result.message });
      } else {
        addToast({ type: 'error', title: 'Erreur d\'export', message: result.message });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur d\'export', message: String(error) });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectLocalFolder = async () => {
    setIsSelectingLocal(true);
    try {
      const handle = await selectBackupDirectory(BACKUP_HANDLE_KEYS.LOCAL);
      if (handle) {
        setLocalHandle(handle);
        setLocalFolderName(handle.name);
        addToast({
          type: 'success',
          title: 'Dossier configure',
          message: `Dossier local: ${handle.name}`,
        });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    } finally {
      setIsSelectingLocal(false);
    }
  };

  const handleSelectOneDriveFolder = async () => {
    setIsSelectingOneDrive(true);
    try {
      const handle = await selectBackupDirectory(BACKUP_HANDLE_KEYS.ONEDRIVE);
      if (handle) {
        setOneDriveHandle(handle);
        setOneDriveFolderName(handle.name);
        addToast({
          type: 'success',
          title: 'Dossier configure',
          message: `Dossier OneDrive: ${handle.name}`,
        });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    } finally {
      setIsSelectingOneDrive(false);
    }
  };

  const handleSaveLocal = async () => {
    if (!localHandle) {
      setIsSavingLocal(true);
      try {
        const result = await saveWithFilePicker('documents');
        if (result.success) {
          addToast({ type: 'success', title: 'Sauvegarde reussie', message: result.message });
        } else if (result.message !== 'Sauvegarde annulee') {
          addToast({ type: 'error', title: 'Erreur', message: result.message });
        }
      } catch (error) {
        addToast({ type: 'error', title: 'Erreur', message: String(error) });
      } finally {
        setIsSavingLocal(false);
      }
      return;
    }

    setIsSavingLocal(true);
    try {
      const result = await saveToDirectory(localHandle);
      if (result.success) {
        addToast({ type: 'success', title: 'Sauvegarde locale reussie', message: result.message });
      } else {
        addToast({ type: 'error', title: 'Erreur', message: result.message });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    } finally {
      setIsSavingLocal(false);
    }
  };

  const handleSaveOneDrive = async () => {
    if (!oneDriveHandle) {
      setIsSavingOneDrive(true);
      try {
        const result = await saveWithFilePicker('documents');
        if (result.success) {
          addToast({ type: 'success', title: 'Sauvegarde reussie', message: result.message });
        } else if (result.message !== 'Sauvegarde annulee') {
          addToast({ type: 'error', title: 'Erreur', message: result.message });
        }
      } catch (error) {
        addToast({ type: 'error', title: 'Erreur', message: String(error) });
      } finally {
        setIsSavingOneDrive(false);
      }
      return;
    }

    setIsSavingOneDrive(true);
    try {
      const result = await saveToDirectory(oneDriveHandle);
      if (result.success) {
        addToast({ type: 'success', title: 'Sauvegarde OneDrive reussie', message: result.message });
      } else {
        addToast({ type: 'error', title: 'Erreur', message: result.message });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    } finally {
      setIsSavingOneDrive(false);
    }
  };

  const handleRemoveLocalFolder = async () => {
    await removeStoredDirectoryHandle(BACKUP_HANDLE_KEYS.LOCAL);
    setLocalHandle(null);
    setLocalFolderName(null);
    addToast({ type: 'info', title: 'Configuration supprimee', message: 'Dossier local retire' });
  };

  const handleRemoveOneDriveFolder = async () => {
    await removeStoredDirectoryHandle(BACKUP_HANDLE_KEYS.ONEDRIVE);
    setOneDriveHandle(null);
    setOneDriveFolderName(null);
    addToast({ type: 'info', title: 'Configuration supprimee', message: 'Dossier OneDrive retire' });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const result = await importAllData(text);
      if (result.success) {
        addToast({ type: 'success', title: 'Import reussi', message: result.message });
        window.location.reload();
      } else {
        addToast({ type: 'error', title: 'Erreur d\'import', message: result.message });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur d\'import', message: String(error) });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handlers pour l'historique des sauvegardes
  const handleCreateBackup = async (cible: 'download' | 'local') => {
    try {
      const result = await createBackup(cible);
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Sauvegarde creee',
          message: cible === 'download' ? 'Le fichier a ete telecharge' : 'Sauvegarde locale creee',
        });
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Erreur de sauvegarde', message: String(err) });
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await restoreBackup(file, { mode: 'complet', creerSauvegardeAvant: false });
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Restauration reussie',
          message: 'Toutes les donnees ont ete restaurees',
        });
        window.location.reload();
      } else {
        throw new Error(result.message || 'La restauration a echoue');
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Erreur de restauration', message: String(err) });
    }
  };

  const handleDeleteBackup = async (id: string) => {
    if (!confirm('Supprimer cette sauvegarde ?')) return;
    await deleteBackupEntry(id);
    addToast({ type: 'success', title: 'Sauvegarde supprimee' });
  };

  // Formater la date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formater la taille
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  };

  // Status badge
  const getStatusBadge = (statut: BackupHistoryEntry['statut']) => {
    switch (statut) {
      case 'succes':
        return <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>Reussi</Badge>;
      case 'erreur':
        return <Badge variant="danger" icon={<XCircle className="w-3 h-3" />}>Erreur</Badge>;
      case 'partiel':
        return <Badge variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>Partiel</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  // Rendu des onglets
  const renderTabContent = () => {
    switch (activeTab) {
      case 'apparence':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Apparence
              </CardTitle>
              <CardDescription>Personnalisez l'interface de l'application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-600 mb-2">
                    Theme
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-btn border transition-all ${
                        theme === 'light'
                          ? 'border-primary-900 bg-primary-50'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      Clair
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-btn border transition-all ${
                        theme === 'dark'
                          ? 'border-primary-900 bg-primary-50'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      Sombre
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-btn border transition-all ${
                        theme === 'system'
                          ? 'border-primary-900 bg-primary-50'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      Systeme
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'donnees':
        return (
          <div className="space-y-4">
            {/* Alerte sauvegarde */}
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-primary-900">
                    Sauvegarde recommandee
                  </p>
                  <p className="text-sm text-primary-500 mt-1">
                    Vos donnees sont stockees localement dans votre navigateur. Il est recommande d'effectuer des sauvegardes regulieres pour eviter toute perte de donnees.
                  </p>
                </div>
              </div>
            </div>

            {/* Sauvegarde locale */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HardDrive className="w-5 h-5 text-primary-700" />
                  Sauvegarde locale (Disque C:)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary-500 mb-4">
                  Sauvegardez vos donnees directement sur votre disque local
                </p>

                {localFolderName && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-success/10 rounded text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-primary-700">Dossier configure: <strong>{localFolderName}</strong></span>
                    <button
                      onClick={handleRemoveLocalFolder}
                      className="ml-auto text-primary-400 hover:text-danger transition-colors"
                      title="Supprimer la configuration"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={handleSaveLocal}
                    isLoading={isSavingLocal}
                    leftIcon={<Download className="w-4 h-4" />}
                    disabled={!fileSystemSupported}
                  >
                    {localHandle ? 'Sauvegarder' : 'Choisir et sauvegarder'}
                  </Button>
                  {fileSystemSupported && (
                    <Button
                      variant="secondary"
                      onClick={handleSelectLocalFolder}
                      isLoading={isSelectingLocal}
                      leftIcon={<FolderOpen className="w-4 h-4" />}
                    >
                      {localHandle ? 'Changer de dossier' : 'Configurer un dossier'}
                    </Button>
                  )}
                </div>

                {!fileSystemSupported && (
                  <p className="text-xs text-warning mt-2">
                    Votre navigateur ne supporte pas la sauvegarde directe. Utilisez Chrome, Edge ou Opera.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Sauvegarde OneDrive */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Cloud className="w-5 h-5 text-info" />
                  Sauvegarde OneDrive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary-500 mb-4">
                  Sauvegardez vos donnees dans votre dossier OneDrive (synchronise automatiquement avec le cloud)
                </p>

                {oneDriveFolderName && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-info/10 rounded text-sm">
                    <CheckCircle className="w-4 h-4 text-info" />
                    <span className="text-primary-700">Dossier configure: <strong>{oneDriveFolderName}</strong></span>
                    <button
                      onClick={handleRemoveOneDriveFolder}
                      className="ml-auto text-primary-400 hover:text-danger transition-colors"
                      title="Supprimer la configuration"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={handleSaveOneDrive}
                    isLoading={isSavingOneDrive}
                    leftIcon={<Cloud className="w-4 h-4" />}
                    disabled={!fileSystemSupported}
                  >
                    {oneDriveHandle ? 'Sauvegarder sur OneDrive' : 'Choisir et sauvegarder'}
                  </Button>
                  {fileSystemSupported && (
                    <Button
                      variant="secondary"
                      onClick={handleSelectOneDriveFolder}
                      isLoading={isSelectingOneDrive}
                      leftIcon={<FolderOpen className="w-4 h-4" />}
                    >
                      {oneDriveHandle ? 'Changer de dossier' : 'Configurer OneDrive'}
                    </Button>
                  )}
                </div>

                <p className="text-xs text-primary-400 mt-3">
                  Astuce: Selectionnez votre dossier OneDrive (generalement C:\Users\VotreNom\OneDrive) pour une synchronisation automatique.
                </p>
              </CardContent>
            </Card>

            {/* Sauvegarde automatique */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-primary-700" />
                  Sauvegarde automatique
                  {autoSaveConfig.enabled && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-success/20 text-success rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                      Active
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary-500 mb-4">
                  Sauvegardez automatiquement vos donnees a intervalles reguliers
                </p>

                {!fileSystemSupported ? (
                  <p className="text-xs text-warning">
                    Votre navigateur ne supporte pas la sauvegarde automatique. Utilisez Chrome, Edge ou Opera.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-600 mb-1">
                          Intervalle
                        </label>
                        <select
                          value={autoSaveConfig.intervalMinutes}
                          onChange={(e) => setAutoSaveConfig({ intervalMinutes: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-primary-200 rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={autoSaveConfig.enabled}
                        >
                          <option value={5}>Toutes les 5 minutes</option>
                          <option value={15}>Toutes les 15 minutes</option>
                          <option value={30}>Toutes les 30 minutes</option>
                          <option value={60}>Toutes les heures</option>
                          <option value={120}>Toutes les 2 heures</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-600 mb-1">
                          Destination
                        </label>
                        <select
                          value={autoSaveConfig.target}
                          onChange={(e) => setAutoSaveConfig({ target: e.target.value as 'local' | 'onedrive' | 'both' })}
                          className="w-full px-3 py-2 border border-primary-200 rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={autoSaveConfig.enabled}
                        >
                          <option value="local" disabled={!localHandle}>
                            Disque local {!localHandle && '(non configure)'}
                          </option>
                          <option value="onedrive" disabled={!oneDriveHandle}>
                            OneDrive {!oneDriveHandle && '(non configure)'}
                          </option>
                          <option value="both" disabled={!localHandle && !oneDriveHandle}>
                            Les deux
                          </option>
                        </select>
                      </div>
                    </div>

                    {autoSaveConfig.lastSaveTime && (
                      <div className="flex items-center gap-2 mb-4 text-sm text-primary-600">
                        <span>Derniere sauvegarde:</span>
                        <span className={`font-medium ${autoSaveConfig.lastSaveStatus === 'success' ? 'text-success' : 'text-danger'}`}>
                          {formatLastSaveTime(autoSaveConfig.lastSaveTime)}
                        </span>
                        {autoSaveConfig.lastSaveStatus === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-danger" />
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant={autoSaveConfig.enabled ? 'danger' : 'primary'}
                        onClick={handleToggleAutoSave}
                        leftIcon={autoSaveConfig.enabled ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        disabled={!localHandle && !oneDriveHandle}
                      >
                        {autoSaveConfig.enabled ? 'Arreter' : 'Demarrer'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleSaveNow}
                        isLoading={isAutoSaving}
                        leftIcon={<Zap className="w-4 h-4" />}
                        disabled={!localHandle && !oneDriveHandle}
                      >
                        Sauvegarder maintenant
                      </Button>
                    </div>

                    {!localHandle && !oneDriveHandle && (
                      <p className="text-xs text-warning mt-2">
                        Configurez d'abord un dossier de sauvegarde (local ou OneDrive) ci-dessus.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Statistiques de stockage */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Database className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-primary-500">Base de donnees</p>
                      <p className="text-xl font-bold text-primary-900">
                        {storageStats ? formatSize(storageStats.totalUtilise) : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <History className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-primary-500">Sauvegardes</p>
                      <p className="text-xl font-bold text-primary-900">
                        {backupHistory.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Clock className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-primary-500">Derniere sauvegarde</p>
                      <p className="text-sm font-medium text-primary-900">
                        {backupHistory.length > 0 ? formatDate(backupHistory[0].date) : 'Jamais'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-primary-500">Enregistrements</p>
                      <p className="text-xl font-bold text-primary-900">
                        {backupHistory.length > 0 ? backupHistory[0].enregistrements?.toLocaleString() : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Creer et Restaurer */}
            <div className="grid grid-cols-2 gap-6">
              {/* Creer une sauvegarde */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Download className="w-5 h-5" />
                    Creer une Sauvegarde
                  </CardTitle>
                  <CardDescription>
                    Exportez vos donnees pour les conserver en lieu sur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        onClick={() => handleCreateBackup('download')}
                        disabled={isLoadingBackup}
                        leftIcon={<FileArchive className="w-4 h-4" />}
                        className="flex-1"
                      >
                        Telecharger (.json.gz)
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleCreateBackup('local')}
                        disabled={isLoadingBackup}
                        leftIcon={<HardDrive className="w-4 h-4" />}
                        className="flex-1"
                      >
                        Sauvegarde locale
                      </Button>
                    </div>

                    <div className="p-3 bg-primary-50 rounded-lg flex items-start gap-2">
                      <Info className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-primary-600">
                        Les fichiers sont compresses et contiennent toutes vos donnees.
                        Conservez-les dans un endroit sur (cloud, disque externe).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Restaurer */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="w-5 h-5" />
                    Restaurer une Sauvegarde
                  </CardTitle>
                  <CardDescription>
                    Recuperez vos donnees depuis un fichier de sauvegarde
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <input
                      ref={restoreInputRef}
                      type="file"
                      accept=".json,.json.gz"
                      onChange={handleRestoreBackup}
                      className="hidden"
                    />

                    <div
                      onClick={() => restoreInputRef.current?.click()}
                      className="border-2 border-dashed border-primary-200 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all"
                    >
                      <Upload className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-primary-700">
                        Cliquez pour selectionner un fichier
                      </p>
                      <p className="text-xs text-primary-500 mt-1">
                        .json ou .json.gz
                      </p>
                    </div>

                    <div className="p-3 bg-warning/10 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-warning">
                        Attention: La restauration remplacera toutes les donnees actuelles.
                        Creez une sauvegarde avant de restaurer.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historique des sauvegardes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <History className="w-5 h-5" />
                      Historique des Sauvegardes
                    </CardTitle>
                    <CardDescription>
                      Vos 10 dernieres sauvegardes locales
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadHistory()}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    Actualiser
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {backupHistory.length === 0 ? (
                  <div className="text-center py-8 text-primary-500">
                    <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune sauvegarde dans l'historique</p>
                    <p className="text-sm mt-1">Creez votre premiere sauvegarde</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {backupHistory.map((backup) => (
                      <div
                        key={backup.id}
                        className="flex items-center justify-between p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <FileArchive className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-primary-900">
                                {formatDate(backup.date)}
                              </p>
                              {getStatusBadge(backup.statut)}
                            </div>
                            <p className="text-sm text-primary-500">
                              {backup.type === 'automatique' ? 'Sauvegarde automatique' : 'Sauvegarde manuelle'}
                              <span className="ml-2">
                                - {backup.centresInclus} centre(s), {backup.enregistrements?.toLocaleString() || 0} enregistrements
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-primary-500">
                            {formatSize(backup.tailleMo * 1024 * 1024)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBackup(backup.id)}
                            leftIcon={<Trash2 className="w-3 h-3" />}
                            className="text-danger hover:bg-danger/10"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'email':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Notifications Email
              </CardTitle>
              <CardDescription>Configurez l'envoi d'alertes par email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-info/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-info mt-0.5" />
                    <div>
                      <p className="font-medium text-primary-900">
                        Configuration requise
                      </p>
                      <p className="text-sm text-primary-500 mt-1">
                        Pour activer les notifications par email, vous devez configurer un service d'envoi (EmailJS, Resend ou SendGrid). Cette fonctionnalite permet de recevoir des alertes importantes directement dans votre boite mail.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Service d'envoi"
                    options={[
                      { value: 'none', label: 'Desactive' },
                      { value: 'emailjs', label: 'EmailJS' },
                      { value: 'resend', label: 'Resend' },
                      { value: 'sendgrid', label: 'SendGrid' },
                    ]}
                    value="none"
                    onChange={() => {}}
                  />
                  <Input
                    label="Email destinataire"
                    type="email"
                    placeholder="votre@email.com"
                    disabled
                  />
                </div>

                <p className="text-sm text-primary-400">
                  La configuration detaillee des services email sera disponible dans une prochaine version.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 'ia':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="text-2xl" style={{ fontFamily: "'Grand Hotel', cursive" }}>Proph3et</span>
                <span className="text-sm font-normal text-primary-500">- Assistant IA</span>
                {(aiConfig.openrouterApiKey || aiConfig.claudeApiKey) && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-success/20 text-success rounded-full">
                    Configure
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Connectez OpenRouter (modeles gratuits) ou Claude (Anthropic) pour activer Proph3et
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Selection du provider actif */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-3">
                    Provider IA actif
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveProvider('openrouter')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        aiConfig.activeProvider === 'openrouter'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">OpenRouter</span>
                        {aiConfig.openrouterApiKey && (
                          <CheckCircle className="w-4 h-4 text-success ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-primary-500 text-left">
                        Modeles gratuits: Llama, Gemma, Mistral...
                      </p>
                    </button>
                    <button
                      onClick={() => setActiveProvider('claude')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        aiConfig.activeProvider === 'claude'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-5 h-5 text-orange-600" />
                        <span className="font-medium">Claude</span>
                        {aiConfig.claudeApiKey && (
                          <CheckCircle className="w-4 h-4 text-success ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-primary-500 text-left">
                        Anthropic: Sonnet, Haiku, Opus
                      </p>
                    </button>
                  </div>
                </div>

                {/* Configuration OpenRouter */}
                <div className={`p-4 rounded-lg border ${aiConfig.activeProvider === 'openrouter' ? 'border-purple-300 bg-purple-50/50' : 'border-primary-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium text-primary-900">OpenRouter</h4>
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      Obtenir une cle gratuite <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <input
                        type={showOpenRouterKey ? 'text' : 'password'}
                        value={tempOpenRouterKey}
                        onChange={(e) => setTempOpenRouterKey(e.target.value)}
                        placeholder="sk-or-v1-..."
                        className="w-full px-3 py-2 pr-10 border border-primary-200 rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
                      >
                        {showOpenRouterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleValidateOpenRouter}
                      isLoading={isValidatingOpenRouter}
                      disabled={!tempOpenRouterKey.trim()}
                      size="sm"
                    >
                      Valider
                    </Button>
                  </div>
                  {aiConfig.openrouterApiKey && (
                    <select
                      value={aiConfig.openrouterModel}
                      onChange={(e) => setOpenRouterModel(e.target.value)}
                      className="w-full px-3 py-2 border border-primary-200 rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {OPENROUTER_MODELS.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} ({model.provider}) - {model.description}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Configuration Claude */}
                <div className={`p-4 rounded-lg border ${aiConfig.activeProvider === 'claude' ? 'border-orange-300 bg-orange-50/50' : 'border-primary-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-5 h-5 text-orange-600" />
                    <h4 className="font-medium text-primary-900">Claude (Anthropic)</h4>
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1"
                    >
                      Obtenir une cle <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <input
                        type={showClaudeKey ? 'text' : 'password'}
                        value={tempClaudeKey}
                        onChange={(e) => setTempClaudeKey(e.target.value)}
                        placeholder="sk-ant-..."
                        className="w-full px-3 py-2 pr-10 border border-primary-200 rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClaudeKey(!showClaudeKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
                      >
                        {showClaudeKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleValidateClaude}
                      isLoading={isValidatingClaude}
                      disabled={!tempClaudeKey.trim()}
                      size="sm"
                    >
                      Valider
                    </Button>
                  </div>
                  {aiConfig.claudeApiKey && (
                    <select
                      value={aiConfig.claudeModel}
                      onChange={(e) => setClaudeModel(e.target.value)}
                      className="w-full px-3 py-2 border border-primary-200 rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {CLAUDE_MODELS.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Parametres avances */}
                {(aiConfig.openrouterApiKey || aiConfig.claudeApiKey) && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          Temperature: {aiConfig.temperature}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={aiConfig.temperature}
                          onChange={(e) => setTemperature(parseFloat(e.target.value))}
                          className="w-full accent-purple-600"
                        />
                        <p className="text-xs text-primary-400 mt-1">
                          0 = precis, 1 = creatif
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          Tokens max: {aiConfig.maxTokens}
                        </label>
                        <input
                          type="range"
                          min="256"
                          max="4096"
                          step="256"
                          value={aiConfig.maxTokens}
                          onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                          className="w-full accent-purple-600"
                        />
                        <p className="text-xs text-primary-400 mt-1">
                          Longueur max des reponses
                        </p>
                      </div>
                    </div>

                    {/* Statistiques d'utilisation */}
                    <div className="p-4 bg-primary-50 rounded-lg">
                      <h4 className="font-medium text-primary-900 mb-3">Statistiques d'utilisation</h4>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-primary-500">Total requetes</p>
                          <p className="text-xl font-semibold text-primary-900">{aiUsage.totalRequests}</p>
                        </div>
                        <div>
                          <p className="text-primary-500">Tokens utilises</p>
                          <p className="text-xl font-semibold text-primary-900">{aiUsage.totalTokens.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-primary-500">OpenRouter</p>
                          <p className="text-xl font-semibold text-purple-600">{aiUsage.openrouterRequests}</p>
                        </div>
                        <div>
                          <p className="text-primary-500">Claude</p>
                          <p className="text-xl font-semibold text-orange-600">{aiUsage.claudeRequests}</p>
                        </div>
                      </div>
                      {aiUsage.lastUsed && (
                        <p className="text-xs text-primary-400 mt-3">
                          Derniere utilisation: {new Date(aiUsage.lastUsed).toLocaleString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'apropos':
        return (
          <Card>
            <CardHeader>
              <CardTitle>A propos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-purple-600 rounded-xl flex items-center justify-center text-white">
                    <Settings className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="font-display text-3xl text-primary-900">Cockpit</h2>
                    <p className="text-primary-500">Application de pilotage strategique</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-200">
                  <div>
                    <p className="text-sm text-primary-500">Version</p>
                    <p className="font-medium text-primary-900">1.0.0</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-500">Build</p>
                    <p className="font-medium text-primary-900">2024.01</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-primary-200">
                  <p className="text-sm text-primary-500 mb-2">Description</p>
                  <p className="text-primary-700">
                    Application de pilotage strategique multi-centres commerciaux.
                    Permet la gestion des centres en construction et en exploitation,
                    le suivi des KPIs, la generation de rapports et l'analyse BI.
                  </p>
                </div>

                <div className="pt-4 border-t border-primary-200">
                  <p className="text-sm text-primary-500 mb-2">Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Dexie (IndexedDB)', 'Chart.js', 'PDF.js'].map((tech) => (
                      <span key={tech} className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex gap-6 max-w-6xl">
      {/* Sidebar avec les onglets */}
      <div className="w-64 flex-shrink-0">
        <div className="sticky top-4">
          <h1 className="text-2xl font-bold text-primary-900 mb-6">Parametres</h1>
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent text-white shadow-md'
                    : 'text-primary-600 hover:bg-primary-50 hover:text-primary-900'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-white' : 'text-primary-400'}>
                  {tab.icon}
                </span>
                <div>
                  <p className="font-medium text-sm">{tab.label}</p>
                  <p className={`text-xs ${activeTab === tab.id ? 'text-white/70' : 'text-primary-400'}`}>
                    {tab.description}
                  </p>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="flex-1 min-w-0">
        {renderTabContent()}
      </div>
    </div>
  );
}
