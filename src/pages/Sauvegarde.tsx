/**
 * Page Sauvegarde - Gestion des sauvegardes et restaurations
 */

import React, { useState, useEffect } from 'react';
import {
  Save,
  Download,
  Upload,
  FolderOpen,
  Cloud,
  HardDrive,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { useAppStore } from '../store';

export function Sauvegarde() {
  const { addToast } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const handleExportBackup = async () => {
    setIsLoading(true);
    try {
      // Collecter toutes les données du localStorage
      const backupData: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            backupData[key] = JSON.parse(localStorage.getItem(key) || '');
          } catch {
            backupData[key] = localStorage.getItem(key);
          }
        }
      }

      // Créer le fichier de sauvegarde
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cockpit-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastBackup(new Date().toISOString());
      addToast({ type: 'success', title: 'Sauvegarde exportée avec succès' });
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur lors de l\'export', message: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const content = await file.text();
      const backupData = JSON.parse(content);

      // Restaurer les données
      Object.entries(backupData).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      });

      addToast({ type: 'success', title: 'Restauration réussie', message: 'La page va se recharger' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur lors de la restauration', message: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100">
          Sauvegarde & Restauration
        </h1>
        <p className="text-primary-500 dark:text-primary-400 mt-1">
          Gérez vos sauvegardes pour protéger vos données
        </p>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-dashed border-primary-200 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer">
          <CardContent className="p-6">
            <button
              onClick={handleExportBackup}
              disabled={isLoading}
              className="w-full flex flex-col items-center gap-4 text-center"
            >
              <div className="p-4 bg-primary-100 dark:bg-primary-800 rounded-2xl">
                {isLoading ? (
                  <RefreshCw className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin" />
                ) : (
                  <Download className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-primary-900 dark:text-primary-100">
                  Exporter une sauvegarde
                </h3>
                <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">
                  Téléchargez un fichier contenant toutes vos données
                </p>
              </div>
            </button>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-primary-200 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer">
          <CardContent className="p-6">
            <label className="w-full flex flex-col items-center gap-4 text-center cursor-pointer">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900 dark:text-primary-100">
                  Restaurer une sauvegarde
                </h3>
                <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">
                  Importez un fichier de sauvegarde existant
                </p>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Informations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Informations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-primary-500" />
              <div>
                <p className="font-medium text-primary-900 dark:text-primary-100">Stockage local</p>
                <p className="text-sm text-primary-500">Les données sont stockées dans votre navigateur</p>
              </div>
            </div>
            <CheckCircle className="w-5 h-5 text-success" />
          </div>

          {lastBackup && (
            <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-success">Dernière sauvegarde</p>
                <p className="text-sm text-primary-500">
                  {new Date(lastBackup).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          )}

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Recommandation</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Effectuez des sauvegardes régulières pour éviter toute perte de données.
                  Les données stockées uniquement dans le navigateur peuvent être perdues
                  si vous videz le cache ou changez de navigateur.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
