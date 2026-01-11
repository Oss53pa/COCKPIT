import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Bell,
  Lightbulb,
  Target,
  RefreshCw,
  Filter,
  Calendar,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  Settings,
  Zap,
  Upload,
  Database,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Modal,
  Select,
} from '../../components/ui';
import { useAnalyseStore, useCentresStore, useAppStore } from '../../store';
import { db } from '../../db/database';
import type { ResultatKPI, Insight, AlerteDeclenche, Prediction } from '../../types/bi';

type TabType = 'kpis' | 'insights' | 'alertes' | 'predictions';

const statutKPIColors: Record<string, string> = {
  excellent: 'bg-success/10 text-success border-success/20',
  bon: 'bg-info/10 text-info border-info/20',
  attention: 'bg-warning/10 text-warning border-warning/20',
  alerte: 'bg-error/10 text-error border-error/20',
};

const prioriteColors: Record<string, string> = {
  haute: 'bg-error/10 text-error',
  moyenne: 'bg-warning/10 text-warning',
  basse: 'bg-info/10 text-info',
};

const severiteColors: Record<string, string> = {
  critique: 'bg-error text-white',
  haute: 'bg-error/10 text-error',
  moyenne: 'bg-warning/10 text-warning',
  basse: 'bg-info/10 text-info',
};

// Stats sur les données importées
interface StatsData {
  etatsLocatifs: number;
  loyers: number;
  baux: number;
  frequentation: number;
  chiffresAffaires: number;
  charges: number;
}

export function AnalysePage() {
  const { centreId } = useParams<{ centreId: string }>();
  const navigate = useNavigate();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const { addToast } = useAppStore();

  const {
    kpisCalcules,
    insights,
    alertes,
    predictions,
    periodeAnalyse,
    isCalculating,
    calculerKPIsPourCentre,
    detecterInsights,
    verifierAlertes,
    genererPredictions,
    setPeriodeAnalyse,
  } = useAnalyseStore();

  const [activeTab, setActiveTab] = useState<TabType>('kpis');
  const [selectedKPI, setSelectedKPI] = useState<ResultatKPI | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [filtreStatut, setFiltreStatut] = useState<string>('all');
  const [filtreCategorie, setFiltreCategorie] = useState<string>('all');
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Vérifier si des données existent pour ce centre
  useEffect(() => {
    const checkData = async () => {
      if (!centreId) return;
      setIsLoadingStats(true);
      try {
        const [etatsLocatifs, loyers, baux, frequentation, chiffresAffaires, charges] = await Promise.all([
          db.etatsLocatifs.where('centreId').equals(centreId).count(),
          db.donneesLoyers.where('centreId').equals(centreId).count(),
          db.donneesBaux.where('centreId').equals(centreId).count(),
          db.donneesFrequentation.where('centreId').equals(centreId).count(),
          db.donneesChiffreAffaires.where('centreId').equals(centreId).count(),
          db.donneesCharges.where('centreId').equals(centreId).count(),
        ]);
        setStatsData({ etatsLocatifs, loyers, baux, frequentation, chiffresAffaires, charges });
      } catch (error) {
        console.error('Erreur vérification données:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    checkData();
  }, [centreId]);

  // Vérifier s'il y a des données
  const hasData = statsData && (
    statsData.etatsLocatifs > 0 ||
    statsData.loyers > 0 ||
    statsData.baux > 0 ||
    statsData.frequentation > 0 ||
    statsData.chiffresAffaires > 0 ||
    statsData.charges > 0
  );

  useEffect(() => {
    if (centreId && hasData) {
      // Charger les données au montage seulement s'il y a des données
      handleRefresh();
    }
  }, [centreId, hasData]);

  const handleRefresh = async () => {
    if (!centreId) return;

    try {
      await calculerKPIsPourCentre(centreId);
      await detecterInsights(centreId);
      await verifierAlertes(centreId);
      await genererPredictions(centreId);
      addToast({ type: 'success', title: 'Analyse mise à jour' });
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  // Filtrer les KPIs
  const filteredKPIs = kpisCalcules.filter((kpi) => {
    if (filtreStatut !== 'all' && kpi.statut !== filtreStatut) return false;
    if (filtreCategorie !== 'all' && kpi.categorie !== filtreCategorie) return false;
    return true;
  });

  // Grouper les KPIs par catégorie
  const kpisParCategorie = filteredKPIs.reduce((acc, kpi) => {
    const cat = kpi.categorie || 'Autres';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(kpi);
    return acc;
  }, {} as Record<string, ResultatKPI[]>);

  // Stats résumé
  const statsKPIs = {
    total: kpisCalcules.length,
    excellent: kpisCalcules.filter((k) => k.statut === 'excellent').length,
    bon: kpisCalcules.filter((k) => k.statut === 'bon').length,
    attention: kpisCalcules.filter((k) => k.statut === 'attention').length,
    alerte: kpisCalcules.filter((k) => k.statut === 'alerte').length,
  };

  const alertesNonLues = alertes.filter((a) => !a.acquittee);

  const KPICard = ({ kpi }: { kpi: ResultatKPI }) => (
    <div
      className="bg-white p-4 rounded-lg border border-primary-200 hover:border-accent transition-colors cursor-pointer"
      onClick={() => setSelectedKPI(kpi)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm text-primary-500">{kpi.nom}</div>
        <Badge className={`border ${statutKPIColors[kpi.statut]}`}>
          {kpi.statut}
        </Badge>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-primary-900">
            {typeof kpi.valeur === 'number'
              ? kpi.valeur.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
              : kpi.valeur}
            {kpi.unite && <span className="text-sm font-normal ml-1">{kpi.unite}</span>}
          </div>
        </div>

        {kpi.variation !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm ${
              kpi.variation > 0 ? 'text-success' : kpi.variation < 0 ? 'text-error' : 'text-primary-500'
            }`}
          >
            {kpi.variation > 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : kpi.variation < 0 ? (
              <ArrowDownRight className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            {Math.abs(kpi.variation).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );

  const InsightCard = ({ insight }: { insight: Insight }) => (
    <div
      className="bg-white p-4 rounded-lg border border-primary-200 hover:border-accent transition-colors cursor-pointer"
      onClick={() => setSelectedInsight(insight)}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${prioriteColors[insight.priorite]}`}>
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-primary-900">{insight.titre}</div>
            <Badge className={prioriteColors[insight.priorite]}>
              {insight.priorite}
            </Badge>
          </div>
          <p className="text-sm text-primary-600 line-clamp-2">{insight.description}</p>

          {insight.impact && (
            <div className="mt-2 flex items-center gap-2 text-xs text-primary-500">
              <Target className="w-3 h-3" />
              Impact: {insight.impact}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const AlerteCard = ({ alerte }: { alerte: AlerteDeclenche }) => (
    <div
      className={`p-4 rounded-lg border ${
        alerte.acquittee ? 'bg-primary-50 border-primary-200' : 'bg-white border-primary-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${severiteColors[alerte.severite]}`}>
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-primary-900">{alerte.titre}</div>
            <div className="flex items-center gap-2">
              <Badge className={severiteColors[alerte.severite]}>
                {alerte.severite}
              </Badge>
              {alerte.acquittee && (
                <CheckCircle className="w-4 h-4 text-success" />
              )}
            </div>
          </div>
          <p className="text-sm text-primary-600">{alerte.message}</p>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-primary-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(alerte.dateCreation).toLocaleDateString('fr-FR')}
            </div>
            {!alerte.acquittee && (
              <Button variant="ghost" size="sm">
                Acquitter
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const PredictionCard = ({ prediction }: { prediction: Prediction }) => (
    <div className="bg-white p-4 rounded-lg border border-primary-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-medium text-primary-900">{prediction.indicateur}</div>
          <div className="text-xs text-primary-500">Méthode: {prediction.methode}</div>
        </div>
        <Badge
          className={
            prediction.tendance === 'hausse'
              ? 'bg-success/10 text-success'
              : prediction.tendance === 'baisse'
              ? 'bg-error/10 text-error'
              : 'bg-primary-100 text-primary-600'
          }
        >
          {prediction.tendance === 'hausse' ? (
            <><TrendingUp className="w-3 h-3 mr-1" /> Hausse</>
          ) : prediction.tendance === 'baisse' ? (
            <><TrendingDown className="w-3 h-3 mr-1" /> Baisse</>
          ) : (
            <><Minus className="w-3 h-3 mr-1" /> Stable</>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-2 bg-primary-50 rounded-lg text-center">
          <div className="text-xs text-primary-500">Valeur actuelle</div>
          <div className="font-bold text-primary-900">
            {prediction.valeurActuelle.toLocaleString('fr-FR')}
          </div>
        </div>
        <div className="p-2 bg-accent/10 rounded-lg text-center">
          <div className="text-xs text-primary-500">Prévision (3 mois)</div>
          <div className="font-bold text-accent">
            {prediction.valeursPredites[2]?.toLocaleString('fr-FR') || '—'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="text-primary-500">
          Confiance: {(prediction.confiance * 100).toFixed(0)}%
        </div>
        <div className="w-24 bg-primary-200 rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full"
            style={{ width: `${prediction.confiance * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Analyse BI</h1>
          <p className="text-primary-500 mt-1">{centre?.nom}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={periodeAnalyse.debut.slice(0, 7)}
            onChange={(e) => {
              const [year, month] = e.target.value.split('-');
              const debut = new Date(parseInt(year), parseInt(month) - 1, 1);
              const fin = new Date(parseInt(year), parseInt(month), 0);
              setPeriodeAnalyse({
                debut: debut.toISOString().split('T')[0],
                fin: fin.toISOString().split('T')[0],
                label: debut.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
              });
            }}
            options={Array.from({ length: 12 }, (_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - i);
              return {
                value: d.toISOString().slice(0, 7),
                label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
              };
            })}
            className="w-48"
          />
          <Button
            leftIcon={<RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            disabled={isCalculating}
          >
            Actualiser
          </Button>
        </div>
      </div>

      {/* État de chargement */}
      {isLoadingStats && (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="w-12 h-12 text-primary-300 mx-auto mb-4 animate-spin" />
            <p className="text-primary-500">Vérification des données...</p>
          </CardContent>
        </Card>
      )}

      {/* État vide - Pas de données importées */}
      {!isLoadingStats && !hasData && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-warning" />
              </div>
              <h2 className="text-xl font-bold text-primary-900 mb-2">Aucune donnée à analyser</h2>
              <p className="text-primary-500 mb-6">
                Pour utiliser l'analyse BI, vous devez d'abord importer des données d'exploitation :
                états locatifs, loyers, baux, fréquentation, etc.
              </p>

              {/* Types de données */}
              <div className="grid grid-cols-2 gap-3 mb-6 text-left">
                <div className="p-3 bg-primary-50 rounded-lg flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-sm font-medium text-primary-700">États locatifs</p>
                    <p className="text-xs text-primary-500">{statsData?.etatsLocatifs || 0} enregistrements</p>
                  </div>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-sm font-medium text-primary-700">Loyers</p>
                    <p className="text-xs text-primary-500">{statsData?.loyers || 0} enregistrements</p>
                  </div>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-sm font-medium text-primary-700">Baux</p>
                    <p className="text-xs text-primary-500">{statsData?.baux || 0} enregistrements</p>
                  </div>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-sm font-medium text-primary-700">Fréquentation</p>
                    <p className="text-xs text-primary-500">{statsData?.frequentation || 0} enregistrements</p>
                  </div>
                </div>
              </div>

              <Button
                leftIcon={<Upload className="w-4 h-4" />}
                onClick={() => navigate(`/centre/${centreId}/bi/import`)}
              >
                Importer des données
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenu principal - visible seulement s'il y a des données */}
      {!isLoadingStats && hasData && (
        <>
      {/* Stats résumé */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-900">{statsKPIs.total}</div>
                <div className="text-sm text-primary-500">KPIs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  {statsKPIs.excellent + statsKPIs.bon}
                </div>
                <div className="text-sm text-primary-500">Conformes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">{statsKPIs.attention}</div>
                <div className="text-sm text-primary-500">Attention</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error/10 rounded-lg">
                <XCircle className="w-5 h-5 text-error" />
              </div>
              <div>
                <div className="text-2xl font-bold text-error">{statsKPIs.alerte}</div>
                <div className="text-sm text-primary-500">Alertes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Lightbulb className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{insights.length}</div>
                <div className="text-sm text-primary-500">Insights</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-primary-200">
        <button
          onClick={() => setActiveTab('kpis')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'kpis'
              ? 'border-accent text-accent font-medium'
              : 'border-transparent text-primary-500 hover:text-primary-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          KPIs ({kpisCalcules.length})
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'insights'
              ? 'border-accent text-accent font-medium'
              : 'border-transparent text-primary-500 hover:text-primary-700'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Insights ({insights.length})
        </button>
        <button
          onClick={() => setActiveTab('alertes')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'alertes'
              ? 'border-accent text-accent font-medium'
              : 'border-transparent text-primary-500 hover:text-primary-700'
          }`}
        >
          <Bell className="w-4 h-4" />
          Alertes
          {alertesNonLues.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-error text-white rounded-full">
              {alertesNonLues.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'predictions'
              ? 'border-accent text-accent font-medium'
              : 'border-transparent text-primary-500 hover:text-primary-700'
          }`}
        >
          <Zap className="w-4 h-4" />
          Prédictions ({predictions.length})
        </button>
      </div>

      {/* Filtres pour KPIs */}
      {activeTab === 'kpis' && (
        <div className="flex items-center gap-4">
          <Select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            options={[
              { value: 'all', label: 'Tous les statuts' },
              { value: 'excellent', label: 'Excellent' },
              { value: 'bon', label: 'Bon' },
              { value: 'attention', label: 'Attention' },
              { value: 'alerte', label: 'Alerte' },
            ]}
            className="w-40"
          />
          <Select
            value={filtreCategorie}
            onChange={(e) => setFiltreCategorie(e.target.value)}
            options={[
              { value: 'all', label: 'Toutes catégories' },
              ...Object.keys(kpisParCategorie).map((cat) => ({ value: cat, label: cat })),
            ]}
            className="w-44"
          />
        </div>
      )}

      {/* Contenu */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          {Object.entries(kpisParCategorie).map(([categorie, kpis]) => (
            <div key={categorie}>
              <h3 className="text-lg font-medium text-primary-900 mb-3">{categorie}</h3>
              <div className="grid grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                  <KPICard key={kpi.code} kpi={kpi} />
                ))}
              </div>
            </div>
          ))}

          {filteredKPIs.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 text-primary-300 mx-auto mb-4" />
                <p className="text-primary-500">Aucun KPI calculé</p>
                <Button className="mt-4" onClick={handleRefresh}>
                  Lancer l'analyse
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="grid grid-cols-2 gap-4">
          {insights.length === 0 ? (
            <Card className="col-span-2">
              <CardContent className="py-12 text-center">
                <Lightbulb className="w-12 h-12 text-primary-300 mx-auto mb-4" />
                <p className="text-primary-500">Aucun insight détecté</p>
              </CardContent>
            </Card>
          ) : (
            insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))
          )}
        </div>
      )}

      {activeTab === 'alertes' && (
        <div className="space-y-4">
          {alertes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="w-12 h-12 text-primary-300 mx-auto mb-4" />
                <p className="text-primary-500">Aucune alerte active</p>
              </CardContent>
            </Card>
          ) : (
            alertes.map((alerte) => (
              <AlerteCard key={alerte.id} alerte={alerte} />
            ))
          )}
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="grid grid-cols-3 gap-4">
          {predictions.length === 0 ? (
            <Card className="col-span-3">
              <CardContent className="py-12 text-center">
                <Zap className="w-12 h-12 text-primary-300 mx-auto mb-4" />
                <p className="text-primary-500">Aucune prédiction disponible</p>
                <p className="text-sm text-primary-400 mt-2">
                  Les prédictions nécessitent au moins 6 mois de données historiques
                </p>
              </CardContent>
            </Card>
          ) : (
            predictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))
          )}
        </div>
      )}
      </>
      )}

      {/* Modal détail KPI */}
      <Modal
        isOpen={!!selectedKPI}
        onClose={() => setSelectedKPI(null)}
        title={selectedKPI?.nom || ''}
        size="md"
        footer={
          <Button variant="ghost" onClick={() => setSelectedKPI(null)}>
            Fermer
          </Button>
        }
      >
        {selectedKPI && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className={`border ${statutKPIColors[selectedKPI.statut]}`}>
                {selectedKPI.statut}
              </Badge>
              <span className="text-sm font-mono text-primary-500">{selectedKPI.code}</span>
            </div>

            <div className="p-6 bg-primary-50 rounded-lg text-center">
              <div className="text-4xl font-bold text-primary-900">
                {typeof selectedKPI.valeur === 'number'
                  ? selectedKPI.valeur.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                  : selectedKPI.valeur}
                {selectedKPI.unite && (
                  <span className="text-xl font-normal ml-2">{selectedKPI.unite}</span>
                )}
              </div>

              {selectedKPI.variation !== undefined && (
                <div
                  className={`flex items-center justify-center gap-1 mt-2 ${
                    selectedKPI.variation > 0
                      ? 'text-success'
                      : selectedKPI.variation < 0
                      ? 'text-error'
                      : 'text-primary-500'
                  }`}
                >
                  {selectedKPI.variation > 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : selectedKPI.variation < 0 ? (
                    <TrendingDown className="w-5 h-5" />
                  ) : (
                    <Minus className="w-5 h-5" />
                  )}
                  {selectedKPI.variation > 0 ? '+' : ''}
                  {selectedKPI.variation.toFixed(1)}% vs période précédente
                </div>
              )}
            </div>

            <div className="text-sm text-primary-500">
              Calculé le {new Date(selectedKPI.dateCalcul).toLocaleDateString('fr-FR')}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal détail Insight */}
      <Modal
        isOpen={!!selectedInsight}
        onClose={() => setSelectedInsight(null)}
        title={selectedInsight?.titre || ''}
        size="md"
        footer={
          <Button variant="ghost" onClick={() => setSelectedInsight(null)}>
            Fermer
          </Button>
        }
      >
        {selectedInsight && (
          <div className="space-y-4">
            <Badge className={prioriteColors[selectedInsight.priorite]}>
              Priorité {selectedInsight.priorite}
            </Badge>

            <p className="text-primary-700">{selectedInsight.description}</p>

            {selectedInsight.impact && (
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="text-sm text-primary-500 mb-1">Impact estimé</div>
                <div className="font-medium text-primary-900">{selectedInsight.impact}</div>
              </div>
            )}

            {selectedInsight.recommandation && (
              <div className="p-4 bg-accent/10 rounded-lg">
                <div className="text-sm text-primary-500 mb-1">Recommandation</div>
                <div className="font-medium text-primary-900">{selectedInsight.recommandation}</div>
              </div>
            )}

            {selectedInsight.donneesAssociees && selectedInsight.donneesAssociees.length > 0 && (
              <div>
                <div className="text-sm text-primary-500 mb-2">Données associées</div>
                <div className="flex flex-wrap gap-2">
                  {selectedInsight.donneesAssociees.map((donnee, index) => (
                    <Badge key={index} className="bg-primary-100 text-primary-700">
                      {donnee}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
