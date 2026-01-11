import React, { useState, useEffect } from 'react';
import {
  History,
  FileEdit,
  Upload,
  Trash2,
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  Download,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Database,
  XCircle,
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
  Modal,
} from '../components/ui';
import { useJournalStore, useCentresStore, useAppStore } from '../store';
import type { JournalEntry, ActionJournal, JournalFilters } from '../types';

// Mapping des actions vers icônes et couleurs
const ACTION_CONFIG: Record<ActionJournal, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
  import: { icon: <Upload className="w-4 h-4" />, color: 'text-info', bgColor: 'bg-info/10', label: 'Import' },
  modification: { icon: <FileEdit className="w-4 h-4" />, color: 'text-warning', bgColor: 'bg-warning/10', label: 'Modification' },
  suppression: { icon: <Trash2 className="w-4 h-4" />, color: 'text-danger', bgColor: 'bg-danger/10', label: 'Suppression' },
  creation: { icon: <Plus className="w-4 h-4" />, color: 'text-success', bgColor: 'bg-success/10', label: 'Création' },
  cloture: { icon: <Lock className="w-4 h-4" />, color: 'text-primary-600', bgColor: 'bg-primary-100', label: 'Clôture' },
  validation: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-success', bgColor: 'bg-success/10', label: 'Validation' },
  annulation: { icon: <XCircle className="w-4 h-4" />, color: 'text-danger', bgColor: 'bg-danger/10', label: 'Annulation' },
  restauration: { icon: <RefreshCw className="w-4 h-4" />, color: 'text-accent-500', bgColor: 'bg-accent-100', label: 'Restauration' },
};

export function Journal() {
  const {
    entries,
    periodesCloturees,
    isLoading,
    loadEntries,
    loadPeriodesCloturees,
    getStats,
    cloturerPeriode,
    deverrouillerPeriode,
  } = useJournalStore();

  const { centres } = useCentresStore();
  const { addToast } = useAppStore();

  const [filters, setFilters] = useState<JournalFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showClotureModal, setShowClotureModal] = useState(false);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getStats>> | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [clotureData, setClotureData] = useState({
    centreId: '',
    annee: new Date().getFullYear(),
    mois: new Date().getMonth() + 1,
    justification: '',
  });

  // Charger les entrées au montage
  useEffect(() => {
    loadEntries(filters);
  }, []);

  // Appliquer les filtres
  const handleApplyFilters = () => {
    loadEntries(filters);
    setShowFilters(false);
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setFilters({});
    loadEntries({});
    setShowFilters(false);
  };

  // Charger les stats
  const handleShowStats = async () => {
    const s = await getStats(filters);
    setStats(s);
    setShowStatsModal(true);
  };

  // Clôturer une période
  const handleCloture = async () => {
    const success = await cloturerPeriode(
      clotureData.centreId,
      clotureData.annee,
      clotureData.mois,
      clotureData.justification
    );

    if (success) {
      addToast({
        type: 'success',
        title: 'Période clôturée',
        message: `La période ${clotureData.mois}/${clotureData.annee} a été clôturée`,
      });
      setShowClotureModal(false);
      loadEntries(filters);
    } else {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de clôturer cette période',
      });
    }
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

  // Obtenir le nom du centre
  const getCentreName = (centreId?: string) => {
    if (!centreId) return 'Global';
    return centres.find(c => c.id === centreId)?.nom || centreId;
  };

  // Générer les mois pour le select
  const moisOptions = [
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Journal des Modifications</h1>
          <p className="text-primary-500 mt-1">
            Historique et traçabilité de toutes les opérations sur les données
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowClotureModal(true)}
            leftIcon={<Lock className="w-4 h-4" />}
          >
            Clôturer période
          </Button>
          <Button
            variant="secondary"
            onClick={handleShowStats}
            leftIcon={<BarChart3 className="w-4 h-4" />}
          >
            Statistiques
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher dans le journal..."
                value={filters.recherche || ''}
                onChange={(e) => setFilters({ ...filters, recherche: e.target.value })}
                leftIcon={<Search className="w-4 h-4" />}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              />
            </div>
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="w-4 h-4" />}
            >
              Filtres
            </Button>
            <Button
              variant="secondary"
              onClick={() => loadEntries(filters)}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Actualiser
            </Button>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-primary-100 grid grid-cols-4 gap-4">
              <Select
                label="Centre"
                value={filters.centreId || ''}
                onChange={(e) => setFilters({ ...filters, centreId: e.target.value || undefined })}
                options={[
                  { value: '', label: 'Tous les centres' },
                  ...centres.map(c => ({ value: c.id, label: c.nom })),
                ]}
              />
              <Select
                label="Type d'action"
                value={filters.actions?.[0] || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  actions: e.target.value ? [e.target.value as ActionJournal] : undefined
                })}
                options={[
                  { value: '', label: 'Toutes les actions' },
                  { value: 'import', label: 'Import' },
                  { value: 'modification', label: 'Modification' },
                  { value: 'suppression', label: 'Suppression' },
                  { value: 'creation', label: 'Création' },
                  { value: 'cloture', label: 'Clôture' },
                ]}
              />
              <Input
                type="date"
                label="Date début"
                value={filters.dateDebut?.split('T')[0] || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  dateDebut: e.target.value ? new Date(e.target.value).toISOString() : undefined
                })}
              />
              <Input
                type="date"
                label="Date fin"
                value={filters.dateFin?.split('T')[0] || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  dateFin: e.target.value ? new Date(e.target.value).toISOString() : undefined
                })}
              />

              <div className="col-span-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={handleResetFilters}>
                  Réinitialiser
                </Button>
                <Button variant="primary" onClick={handleApplyFilters}>
                  Appliquer les filtres
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résumé */}
      <div className="flex items-center justify-between text-sm text-primary-500">
        <span>{entries.length} entrées trouvées</span>
        {filters.dateDebut && (
          <span>
            Période: {formatDate(filters.dateDebut)} - {filters.dateFin ? formatDate(filters.dateFin) : 'Maintenant'}
          </span>
        )}
      </div>

      {/* Liste des entrées */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 text-primary-400 animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto mb-3 text-primary-300" />
              <p className="text-primary-500">Aucune entrée dans le journal</p>
              <p className="text-sm text-primary-400 mt-1">
                Les opérations sur les données apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="divide-y divide-primary-100">
              {entries.map((entry) => {
                const actionConfig = ACTION_CONFIG[entry.action];
                const isExpanded = expandedEntry === entry.id;

                return (
                  <div
                    key={entry.id}
                    className="hover:bg-primary-50 transition-colors"
                  >
                    {/* Ligne principale */}
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer"
                      onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                    >
                      <div className={`p-2 rounded-lg ${actionConfig.bgColor}`}>
                        <span className={actionConfig.color}>{actionConfig.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              entry.action === 'import' ? 'info' :
                              entry.action === 'modification' ? 'warning' :
                              entry.action === 'suppression' ? 'danger' :
                              entry.action === 'creation' ? 'success' :
                              'secondary'
                            }
                          >
                            {actionConfig.label}
                          </Badge>
                          <span className="text-sm font-medium text-primary-900">{entry.table}</span>
                          {entry.erreurs && entry.erreurs.length > 0 && (
                            <Badge variant="danger" icon={<AlertTriangle className="w-3 h-3" />}>
                              {entry.erreurs.length} erreurs
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-primary-500 mt-1">
                          {entry.enregistrementsAffectes} enregistrement{entry.enregistrementsAffectes > 1 ? 's' : ''} affecté{entry.enregistrementsAffectes > 1 ? 's' : ''}
                          {entry.details.fichierSource && (
                            <span className="ml-2">- {entry.details.fichierSource}</span>
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-primary-900">{formatDate(entry.date)}</p>
                        <p className="text-xs text-primary-500">
                          {getCentreName(entry.details.centreId)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {entry.scoreQualite !== undefined && (
                          <div className={`px-2 py-1 rounded text-sm font-medium ${
                            entry.scoreQualite >= 90 ? 'bg-success/10 text-success' :
                            entry.scoreQualite >= 70 ? 'bg-warning/10 text-warning' :
                            'bg-danger/10 text-danger'
                          }`}>
                            {entry.scoreQualite}%
                          </div>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-primary-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-primary-400" />
                        )}
                      </div>
                    </div>

                    {/* Détails étendus */}
                    {isExpanded && (
                      <div className="px-4 pb-4 ml-14 space-y-3">
                        {/* Détails de l'opération */}
                        <div className="p-3 bg-primary-50 rounded-lg">
                          <h4 className="text-sm font-medium text-primary-700 mb-2">Détails</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {entry.details.entiteId && (
                              <div>
                                <span className="text-primary-500">ID Entité:</span>
                                <span className="ml-2 font-mono text-primary-900">{entry.details.entiteId}</span>
                              </div>
                            )}
                            {entry.details.champModifie && (
                              <div>
                                <span className="text-primary-500">Champ:</span>
                                <span className="ml-2 text-primary-900">{entry.details.champModifie}</span>
                              </div>
                            )}
                            {entry.details.ancienneValeur !== undefined && (
                              <div>
                                <span className="text-primary-500">Ancienne valeur:</span>
                                <span className="ml-2 text-danger">{String(entry.details.ancienneValeur)}</span>
                              </div>
                            )}
                            {entry.details.nouvelleValeur !== undefined && (
                              <div>
                                <span className="text-primary-500">Nouvelle valeur:</span>
                                <span className="ml-2 text-success">{String(entry.details.nouvelleValeur)}</span>
                              </div>
                            )}
                            {entry.details.justification && (
                              <div className="col-span-2">
                                <span className="text-primary-500">Justification:</span>
                                <span className="ml-2 text-primary-900">{entry.details.justification}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Erreurs */}
                        {entry.erreurs && entry.erreurs.length > 0 && (
                          <div className="p-3 bg-danger/10 rounded-lg">
                            <h4 className="text-sm font-medium text-danger mb-2">Erreurs</h4>
                            <ul className="text-sm text-primary-700 space-y-1">
                              {entry.erreurs.map((err, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <XCircle className="w-4 h-4 text-danger mt-0.5 flex-shrink-0" />
                                  {err}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Avertissements */}
                        {entry.avertissements && entry.avertissements.length > 0 && (
                          <div className="p-3 bg-warning/10 rounded-lg">
                            <h4 className="text-sm font-medium text-warning mb-2">Avertissements</h4>
                            <ul className="text-sm text-primary-700 space-y-1">
                              {entry.avertissements.map((warn, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                                  {warn}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Statistiques */}
      <Modal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title="Statistiques du Journal"
        size="lg"
      >
        {stats && (
          <div className="space-y-6">
            {/* Résumé */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-primary-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-primary-900">{stats.totalEntrees}</p>
                <p className="text-sm text-primary-500">Entrées totales</p>
              </div>
              <div className="p-4 bg-danger/10 rounded-lg text-center">
                <p className="text-3xl font-bold text-danger">{stats.erreursTotales}</p>
                <p className="text-sm text-primary-500">Erreurs</p>
              </div>
              <div className="p-4 bg-success/10 rounded-lg text-center">
                <p className="text-3xl font-bold text-success">{stats.scoreQualiteMoyen.toFixed(0)}%</p>
                <p className="text-sm text-primary-500">Score qualité moyen</p>
              </div>
            </div>

            {/* Par action */}
            <div>
              <h4 className="font-medium text-primary-900 mb-3">Par type d'action</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(stats.parAction).map(([action, count]) => {
                  const config = ACTION_CONFIG[action as ActionJournal];
                  return (
                    <div key={action} className="flex items-center justify-between p-2 bg-primary-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className={config.color}>{config.icon}</span>
                        <span className="text-sm text-primary-700">{config.label}</span>
                      </div>
                      <span className="font-medium text-primary-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Par table */}
            <div>
              <h4 className="font-medium text-primary-900 mb-3">Par table</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(stats.parTable).map(([table, count]) => (
                  <div key={table} className="flex items-center justify-between p-2 bg-primary-50 rounded">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-primary-400" />
                      <span className="text-sm text-primary-700">{table}</span>
                    </div>
                    <span className="font-medium text-primary-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Clôture */}
      <Modal
        isOpen={showClotureModal}
        onClose={() => setShowClotureModal(false)}
        title="Clôturer une période"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium text-warning">Attention</p>
                <p className="text-sm text-primary-700 mt-1">
                  La clôture d'une période empêche toute modification des données de cette période.
                  Cette action peut être déverrouillée temporairement si nécessaire.
                </p>
              </div>
            </div>
          </div>

          <Select
            label="Centre"
            value={clotureData.centreId}
            onChange={(e) => setClotureData({ ...clotureData, centreId: e.target.value })}
            options={[
              { value: '', label: 'Sélectionner un centre' },
              ...centres.map(c => ({ value: c.id, label: c.nom })),
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Mois"
              value={String(clotureData.mois)}
              onChange={(e) => setClotureData({ ...clotureData, mois: parseInt(e.target.value) })}
              options={moisOptions}
            />
            <Input
              type="number"
              label="Année"
              value={clotureData.annee}
              onChange={(e) => setClotureData({ ...clotureData, annee: parseInt(e.target.value) })}
              min={2020}
              max={2030}
            />
          </div>

          <Input
            label="Justification (optionnelle)"
            value={clotureData.justification}
            onChange={(e) => setClotureData({ ...clotureData, justification: e.target.value })}
            placeholder="Raison de la clôture..."
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowClotureModal(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleCloture}
              disabled={!clotureData.centreId}
              leftIcon={<Lock className="w-4 h-4" />}
            >
              Clôturer la période
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
