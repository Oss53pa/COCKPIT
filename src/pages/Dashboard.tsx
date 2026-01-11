import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Rocket,
  Users,
  Calendar,
  Target,
  Store,
  GitCompare,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  ClipboardList,
  PieChart,
  BarChart3,
  Activity,
  Wallet,
  UserCheck,
  FileCheck,
  ChevronRight,
  Eye,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { differenceInDays, parseISO, format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../components/ui';
import { PerformanceGauge } from '../components/charts/PerformanceGauge';
import { Sparkline } from '../components/charts/Sparkline';
import { useCentresStore, useAxesStore, useMesuresStore, useActionsStore, useAlertesStore, useAppStore, useProjetStore } from '../store';
import { telechargerDashboardPDF } from '../utils/dashboardExport';

export function Dashboard() {
  const navigate = useNavigate();
  const { setCurrentCentre, theme } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'actions' | 'projets'>('overview');
  const isDark = theme === 'dark';
  const { centres, loadCentres } = useCentresStore();
  const { axes, loadAxes, objectifs, loadObjectifs } = useAxesStore();
  const { mesures, loadMesures } = useMesuresStore();
  const { actions, loadActions, getActionsEnRetard } = useActionsStore();
  const { alertes, loadAlertes, getAlertesNonLues } = useAlertesStore();
  const { projets, jalons, postesARecruter, prospects, vaguesRecrutement, loadProjet } = useProjetStore();

  useEffect(() => {
    loadCentres();
    loadAxes();
    loadObjectifs();
    loadMesures();
    loadActions();
    loadAlertes();
  }, []);

  // Charger les projets pour les centres en mode projet
  useEffect(() => {
    centres
      .filter((c) => c.modeProjetActif)
      .forEach((c) => loadProjet(c.id));
  }, [centres, loadProjet]);

  const alertesNonLues = getAlertesNonLues();
  const actionsEnRetard = getActionsEnRetard();

  // Séparer les centres actifs et en construction
  const centresActifs = centres.filter((c) => c.statut === 'actif' && !c.modeProjetActif);
  const centresEnProjet = centres.filter((c) => c.modeProjetActif);

  // Calcul des statistiques globales améliorées
  const stats = useMemo(() => {
    const actionsTerminees = actions.filter((a) => a.statut === 'termine');
    const actionsEnCours = actions.filter((a) => a.statut === 'en_cours');
    const actionsAFaire = actions.filter((a) => a.statut === 'a_faire');

    // Calcul du budget total des actions
    const budgetTotal = actions.reduce((sum, a) => sum + (a.budget?.prevu || 0), 0);
    const budgetConsomme = actions.reduce((sum, a) => sum + (a.budget?.consomme || 0), 0);

    // Surface totale
    const surfaceTotale = centres.reduce((sum, c) => sum + (c.surfaceLocative || 0), 0);

    // Taux de réalisation des actions
    const tauxRealisation = actions.length > 0
      ? Math.round((actionsTerminees.length / actions.length) * 100)
      : 0;

    // Performance moyenne
    const mesuresVertes = mesures.filter((m) => m.statut === 'vert').length;
    const performanceGlobale = mesures.length > 0
      ? Math.round((mesuresVertes / mesures.length) * 100)
      : 0;

    return {
      totalCentres: centres.length,
      centresActifs: centresActifs.length,
      centresEnProjet: centresEnProjet.length,
      totalObjectifs: objectifs.length,
      actionsTotal: actions.length,
      actionsTerminees: actionsTerminees.length,
      actionsEnCours: actionsEnCours.length,
      actionsAFaire: actionsAFaire.length,
      actionsEnRetard: actionsEnRetard.length,
      budgetTotal,
      budgetConsomme,
      surfaceTotale,
      tauxRealisation,
      performanceGlobale,
      kpisVerts: mesures.filter((m) => m.statut === 'vert').length,
      kpisOrange: mesures.filter((m) => m.statut === 'orange').length,
      kpisRouge: mesures.filter((m) => m.statut === 'rouge').length,
    };
  }, [centres, centresActifs, centresEnProjet, objectifs, actions, actionsEnRetard, mesures]);

  // Statistiques projet globales
  const projetStatsGlobal = useMemo(() => {
    let totalJalons = 0;
    let jalonsAtteints = 0;
    let totalPostes = 0;
    let postesIntegres = 0;
    let totalProspects = 0;
    let prospectsSigns = 0;
    let glaTotale = 0;
    let glaSignee = 0;

    centresEnProjet.forEach((centre) => {
      const projet = projets.find((p) => p.centreId === centre.id);
      if (!projet) return;

      const projetJalons = jalons.filter((j) => j.projetId === projet.id);
      const projetPostes = postesARecruter.filter((p) => p.projetId === projet.id);
      const projetProspects = prospects.filter((p) => p.projetId === projet.id);

      totalJalons += projetJalons.length;
      jalonsAtteints += projetJalons.filter((j) => j.statut === 'atteint').length;
      totalPostes += projetPostes.length;
      postesIntegres += projetPostes.filter((p) => p.statut === 'integre').length;
      totalProspects += projetProspects.length;
      const signed = projetProspects.filter((p) => p.statut === 'bail_signe');
      prospectsSigns += signed.length;
      glaTotale += centre.surfaceLocative || 0;
      glaSignee += signed.reduce((sum, p) => sum + p.surface, 0);
    });

    return {
      totalJalons,
      jalonsAtteints,
      tauxJalons: totalJalons > 0 ? Math.round((jalonsAtteints / totalJalons) * 100) : 0,
      totalPostes,
      postesIntegres,
      tauxRecrutement: totalPostes > 0 ? Math.round((postesIntegres / totalPostes) * 100) : 0,
      totalProspects,
      prospectsSigns,
      tauxCommercialisation: glaTotale > 0 ? Math.round((glaSignee / glaTotale) * 100) : 0,
      glaTotale,
      glaSignee,
    };
  }, [centresEnProjet, projets, jalons, postesARecruter, prospects]);

  // Données pour le graphique de performance par centre
  const performanceParCentre = useMemo(() => {
    return centres.map((centre) => {
      const centreMesures = mesures.filter((m) => m.centreId === centre.id);
      const mesuresVertes = centreMesures.filter((m) => m.statut === 'vert').length;
      const performance = centreMesures.length > 0
        ? Math.round((mesuresVertes / centreMesures.length) * 100)
        : 0;

      const centreActions = actions.filter((a) => a.centreId === centre.id);
      const actionsTerminees = centreActions.filter((a) => a.statut === 'termine').length;
      const tauxActions = centreActions.length > 0
        ? Math.round((actionsTerminees / centreActions.length) * 100)
        : 0;

      return {
        name: centre.code,
        fullName: centre.nom,
        performance,
        tauxActions,
        kpis: centreMesures.length,
        actions: centreActions.length,
        color: centre.couleurTheme || '#171717',
      };
    });
  }, [centres, mesures, actions]);

  // Données pour le pie chart des statuts KPI
  const statutsKPI = [
    { name: 'Atteint', value: stats.kpisVerts, color: '#22c55e' },
    { name: 'Attention', value: stats.kpisOrange, color: '#f59e0b' },
    { name: 'Critique', value: stats.kpisRouge, color: '#ef4444' },
  ];

  // Données pour le pie chart des statuts Actions
  const statutsActions = [
    { name: 'Terminées', value: stats.actionsTerminees, color: '#22c55e' },
    { name: 'En cours', value: stats.actionsEnCours, color: '#3b82f6' },
    { name: 'À faire', value: stats.actionsAFaire, color: '#a3a3a3' },
    { name: 'En retard', value: stats.actionsEnRetard, color: '#ef4444' },
  ];

  // Tendance des performances (simulée - basée sur les mesures existantes)
  const tendancePerformance = useMemo(() => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthMesures = mesures.filter((m) => {
        const mesureDate = new Date(m.dateSaisie);
        return mesureDate >= monthStart && mesureDate <= monthEnd;
      });

      const vertes = monthMesures.filter((m) => m.statut === 'vert').length;
      const perf = monthMesures.length > 0 ? Math.round((vertes / monthMesures.length) * 100) : null;

      last6Months.push({
        mois: format(date, 'MMM', { locale: fr }),
        performance: perf,
        mesures: monthMesures.length,
      });
    }
    return last6Months;
  }, [mesures]);

  // Données par axe stratégique
  const performanceParAxe = useMemo(() => {
    const axePerf: Record<string, { nom: string; code: string; performance: number; count: number; couleur: string }> = {};

    axes.forEach((axe) => {
      const axeMesures = mesures.filter((m) => {
        const obj = objectifs.find((o) => o.id === m.objectifId);
        return obj?.axeId === axe.id;
      });

      const vertes = axeMesures.filter((m) => m.statut === 'vert').length;
      axePerf[axe.id] = {
        nom: axe.nom,
        code: axe.code,
        performance: axeMesures.length > 0 ? Math.round((vertes / axeMesures.length) * 100) : 0,
        count: axeMesures.length,
        couleur: axe.couleur,
      };
    });

    return Object.values(axePerf).filter((a) => a.count > 0);
  }, [axes, mesures, objectifs]);

  const handleCentreClick = (centreId: string) => {
    setCurrentCentre(centreId);
    navigate(`/centre/${centreId}`);
  };

  // Export PDF handler
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await telechargerDashboardPDF({
        centres,
        mesures,
        actions,
        dateExport: new Date(),
      });
    } catch (error) {
      console.error('Erreur export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Generate sparkline data for each center
  const getSparklineData = (centreId: string): number[] => {
    const centreMesures = mesures
      .filter((m) => m.centreId === centreId)
      .sort((a, b) => new Date(a.dateSaisie).getTime() - new Date(b.dateSaisie).getTime());

    if (centreMesures.length < 2) return [];
    const last6 = centreMesures.slice(-6);
    return last6.map((m) => (m.statut === 'vert' ? 100 : m.statut === 'orange' ? 50 : 0));
  };

  // Projet stats pour un centre
  const getProjetStats = (centreId: string) => {
    const projet = projets.find((p) => p.centreId === centreId);
    if (!projet) return null;

    const projetJalons = jalons.filter((j) => j.projetId === projet.id);
    const projetPostes = postesARecruter.filter((p) => p.projetId === projet.id);
    const projetProspects = prospects.filter((p) => p.projetId === projet.id);

    const joursRestants = differenceInDays(parseISO(projet.dateSoftOpening), new Date());
    const jalonsAtteints = projetJalons.filter((j) => j.statut === 'atteint').length;
    const postesIntegres = projetPostes.filter((p) => p.statut === 'integre').length;
    const prospectsSigns = projetProspects.filter((p) => p.statut === 'bail_signe');
    const glaSigne = prospectsSigns.reduce((sum, p) => sum + p.surface, 0);

    return {
      projet,
      joursRestants,
      jalonsAtteints,
      jalonsTotal: projetJalons.length,
      postesIntegres,
      postesTotal: projetPostes.length,
      prospectsSigns: prospectsSigns.length,
      prospectsTotal: projetProspects.length,
      glaSigne,
    };
  };

  // Tendance indicator
  const TrendIndicator = ({ value, previousValue }: { value: number; previousValue?: number }) => {
    if (previousValue === undefined) return null;
    const diff = value - previousValue;
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-success" />;
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-error" />;
    return <Minus className="w-4 h-4 text-primary-400" />;
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <Layers className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'actions', label: 'Actions', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'projets', label: 'Projets', icon: <Rocket className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100">Tableau de bord</h1>
          <p className="text-primary-500 dark:text-primary-400 mt-1">Vue consolidée multi-centres</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/actions-consolidees')}
            leftIcon={<ClipboardList className="w-4 h-4" />}
          >
            Plan d'action consolidé
          </Button>
          {centres.length >= 2 && (
            <Button
              variant="ghost"
              onClick={() => navigate('/comparateur')}
              leftIcon={<GitCompare className="w-4 h-4" />}
            >
              Comparer
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleExportPDF}
            disabled={isExporting}
            leftIcon={<Download className="w-4 h-4" />}
          >
            {isExporting ? 'Export...' : 'Export PDF'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/centres')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Gérer les centres
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-primary-100 dark:bg-primary-800 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-100 shadow-sm'
                : 'text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Vue d'ensemble */}
      {activeTab === 'overview' && (
        <>
          {/* KPIs Principaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-primary-900 to-primary-700 text-white">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-200">Performance Globale</p>
                    <p className="text-3xl font-bold mt-1">{stats.performanceGlobale}%</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${stats.performanceGlobale}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-500 dark:text-primary-400">Centres actifs</p>
                    <p className="text-3xl font-bold text-primary-900 dark:text-primary-100 mt-1">
                      {stats.centresActifs}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-success" />
                  </div>
                </div>
                <p className="text-xs text-primary-500 mt-2">
                  {stats.surfaceTotale.toLocaleString()} m² GLA totale
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-500 dark:text-primary-400">En construction</p>
                    <p className="text-3xl font-bold text-info mt-1">{stats.centresEnProjet}</p>
                  </div>
                  <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-info" />
                  </div>
                </div>
                <p className="text-xs text-info mt-2">
                  {projetStatsGlobal.tauxJalons}% jalons atteints
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-500 dark:text-primary-400">Taux réalisation</p>
                    <p className="text-3xl font-bold text-success mt-1">{stats.tauxRealisation}%</p>
                  </div>
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                </div>
                <p className="text-xs text-primary-500 mt-2">
                  {stats.actionsTerminees}/{stats.actionsTotal} actions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-500 dark:text-primary-400">Actions en retard</p>
                    <p className={`text-3xl font-bold mt-1 ${stats.actionsEnRetard > 0 ? 'text-error' : 'text-success'}`}>
                      {stats.actionsEnRetard}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.actionsEnRetard > 0 ? 'bg-error/10' : 'bg-success/10'}`}>
                    <AlertTriangle className={`w-6 h-6 ${stats.actionsEnRetard > 0 ? 'text-error' : 'text-success'}`} />
                  </div>
                </div>
                <p className="text-xs text-primary-500 mt-2">
                  {stats.actionsEnCours} en cours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-500 dark:text-primary-400">Budget actions</p>
                    <p className="text-2xl font-bold text-primary-900 dark:text-primary-100 mt-1">
                      {(stats.budgetConsomme / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-warning" />
                  </div>
                </div>
                <p className="text-xs text-primary-500 mt-2">
                  sur {(stats.budgetTotal / 1000000).toFixed(1)}M prévus
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Section Projets en construction - Vue résumée */}
          {centresEnProjet.length > 0 && (
            <Card>
              <CardHeader
                action={
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('projets')}>
                    Voir détails <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                }
              >
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-info" />
                  Projets en construction ({centresEnProjet.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-4 bg-primary-50 dark:bg-primary-800 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-primary-500 mb-2">
                      <Target className="w-5 h-5" />
                      <span className="text-sm font-medium">Jalons</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                      {projetStatsGlobal.jalonsAtteints}/{projetStatsGlobal.totalJalons}
                    </p>
                    <div className="mt-2 h-2 bg-primary-200 dark:bg-primary-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-info rounded-full"
                        style={{ width: `${projetStatsGlobal.tauxJalons}%` }}
                      />
                    </div>
                    <p className="text-xs text-primary-500 mt-1">{projetStatsGlobal.tauxJalons}%</p>
                  </div>

                  <div className="text-center p-4 bg-primary-50 dark:bg-primary-800 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-primary-500 mb-2">
                      <UserCheck className="w-5 h-5" />
                      <span className="text-sm font-medium">Recrutement</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                      {projetStatsGlobal.postesIntegres}/{projetStatsGlobal.totalPostes}
                    </p>
                    <div className="mt-2 h-2 bg-primary-200 dark:bg-primary-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full"
                        style={{ width: `${projetStatsGlobal.tauxRecrutement}%` }}
                      />
                    </div>
                    <p className="text-xs text-primary-500 mt-1">{projetStatsGlobal.tauxRecrutement}%</p>
                  </div>

                  <div className="text-center p-4 bg-primary-50 dark:bg-primary-800 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-primary-500 mb-2">
                      <Store className="w-5 h-5" />
                      <span className="text-sm font-medium">Baux signés</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                      {projetStatsGlobal.prospectsSigns}/{projetStatsGlobal.totalProspects}
                    </p>
                    <div className="mt-2 h-2 bg-primary-200 dark:bg-primary-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning rounded-full"
                        style={{ width: `${projetStatsGlobal.tauxCommercialisation}%` }}
                      />
                    </div>
                    <p className="text-xs text-primary-500 mt-1">{projetStatsGlobal.tauxCommercialisation}% GLA</p>
                  </div>

                  <div className="text-center p-4 bg-primary-50 dark:bg-primary-800 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-primary-500 mb-2">
                      <FileCheck className="w-5 h-5" />
                      <span className="text-sm font-medium">GLA signée</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                      {(projetStatsGlobal.glaSignee / 1000).toFixed(1)}k
                    </p>
                    <p className="text-xs text-primary-500 mt-3">
                      sur {(projetStatsGlobal.glaTotale / 1000).toFixed(1)}k m²
                    </p>
                  </div>
                </div>

                {/* Mini cartes projets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {centresEnProjet.slice(0, 4).map((centre) => {
                    const projetStats = getProjetStats(centre.id);
                    return (
                      <div
                        key={centre.id}
                        onClick={() => {
                          setCurrentCentre(centre.id);
                          navigate(`/centre/${centre.id}/projet`);
                        }}
                        className="flex items-center gap-4 p-3 bg-white dark:bg-primary-700 border border-primary-200 dark:border-primary-600 rounded-lg hover:border-info cursor-pointer transition-colors"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: centre.couleurTheme || '#3b82f6' }}
                        >
                          {centre.code.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-primary-900 dark:text-primary-100 truncate">{centre.nom}</p>
                          <p className="text-xs text-primary-500">{centre.ville}</p>
                        </div>
                        {projetStats && (
                          <div className="text-right">
                            <p className={`text-lg font-bold ${projetStats.joursRestants <= 30 ? 'text-error' : projetStats.joursRestants <= 90 ? 'text-warning' : 'text-info'}`}>
                              J-{Math.max(0, projetStats.joursRestants)}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Graphiques principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance par centre */}
            <Card>
              <CardHeader>
                <CardTitle>Performance par centre</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={performanceParCentre} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#404040' : '#e5e5e5'} />
                      <XAxis type="number" domain={[0, 100]} stroke={isDark ? '#a3a3a3' : '#737373'} fontSize={12} />
                      <YAxis dataKey="name" type="category" width={60} stroke={isDark ? '#a3a3a3' : '#737373'} fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#262626' : '#fff',
                          border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`,
                          borderRadius: '8px',
                          color: isDark ? '#fafafa' : '#171717',
                        }}
                        formatter={(value: number, name: string) => [
                          `${value}%`,
                          name === 'performance' ? 'Performance KPI' : 'Taux actions terminées'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="performance" name="Performance KPI" fill="#22c55e" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="tauxActions" name="Actions terminées" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Répartition KPIs et Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition des statuts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 h-72">
                  {/* KPIs */}
                  <div>
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2 text-center">KPIs</p>
                    <div className="h-48">
                      {mesures.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <RechartsPieChart>
                            <Pie
                              data={statutsKPI}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {statutsKPI.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-primary-400">
                          Aucune mesure
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center gap-3 flex-wrap">
                      {statutsKPI.map((item) => (
                        <div key={item.name} className="flex items-center gap-1 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-primary-600 dark:text-primary-400">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2 text-center">Actions</p>
                    <div className="h-48">
                      {actions.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <RechartsPieChart>
                            <Pie
                              data={statutsActions}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {statutsActions.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-primary-400">
                          Aucune action
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center gap-3 flex-wrap">
                      {statutsActions.map((item) => (
                        <div key={item.name} className="flex items-center gap-1 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-primary-600 dark:text-primary-400">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Centres en exploitation */}
          {centresActifs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-success" />
                  <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-100">Centres en exploitation</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {centresActifs.map((centre) => {
                  const centreObjectifs = objectifs.filter((o) => o.centreId === centre.id);
                  const centreMesures = mesures.filter((m) => m.centreId === centre.id);
                  const mesuresVertes = centreMesures.filter((m) => m.statut === 'vert').length;
                  const performance = centreMesures.length > 0
                    ? Math.round((mesuresVertes / centreMesures.length) * 100)
                    : 0;
                  const centreActions = actions.filter((a) => a.centreId === centre.id);
                  const actionsEnRetardCentre = centreActions.filter(
                    (a) => a.statut !== 'termine' && a.statut !== 'annule' && a.dateEcheance && new Date(a.dateEcheance) < new Date()
                  );

                  const statusColor = performance >= 80 ? 'success' : performance >= 60 ? 'warning' : 'error';

                  return (
                    <Card
                      key={centre.id}
                      hoverable
                      onClick={() => handleCentreClick(centre.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: centre.couleurTheme || '#171717' }}
                          >
                            {centre.code.substring(0, 2)}
                          </div>
                          <div>
                            <CardTitle>{centre.nom}</CardTitle>
                            <p className="text-sm text-primary-500 dark:text-primary-400">{centre.ville}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Performance avec Sparkline */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-primary-600 dark:text-primary-400">Performance</span>
                              <div className="flex items-center gap-2">
                                {getSparklineData(centre.id).length >= 2 && (
                                  <Sparkline
                                    data={getSparklineData(centre.id)}
                                    color={statusColor === 'success' ? '#22c55e' : statusColor === 'warning' ? '#f59e0b' : '#ef4444'}
                                    width={60}
                                    height={20}
                                  />
                                )}
                                <Badge variant={statusColor}>{performance}%</Badge>
                              </div>
                            </div>
                            <div className="h-2 bg-primary-100 dark:bg-primary-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-${statusColor}`}
                                style={{ width: `${performance}%` }}
                              />
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="text-center p-2 bg-primary-50 dark:bg-primary-800 rounded-lg">
                              <p className="text-xs text-primary-500">Objectifs</p>
                              <p className="font-semibold text-primary-900 dark:text-primary-100">{centreObjectifs.length}</p>
                            </div>
                            <div className="text-center p-2 bg-primary-50 dark:bg-primary-800 rounded-lg">
                              <p className="text-xs text-primary-500">Actions</p>
                              <p className="font-semibold text-primary-900 dark:text-primary-100">{centreActions.length}</p>
                            </div>
                            <div className={`text-center p-2 rounded-lg ${actionsEnRetardCentre.length > 0 ? 'bg-error/10' : 'bg-primary-50 dark:bg-primary-800'}`}>
                              <p className="text-xs text-primary-500">Retard</p>
                              <p className={`font-semibold ${actionsEnRetardCentre.length > 0 ? 'text-error' : 'text-primary-900 dark:text-primary-100'}`}>
                                {actionsEnRetardCentre.length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message si aucun centre */}
          {centres.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="w-12 h-12 text-primary-300 dark:text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
                  Aucun centre configuré
                </h3>
                <p className="text-primary-500 dark:text-primary-400 mb-4">
                  Commencez par ajouter votre premier centre commercial
                </p>
                <Button onClick={() => navigate('/centres')}>
                  Ajouter un centre
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Alertes prioritaires */}
          {alertesNonLues.length > 0 && (
            <Card>
              <CardHeader
                action={
                  <Button variant="ghost" size="sm" onClick={() => navigate('/alertes')}>
                    Voir tout
                  </Button>
                }
              >
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Alertes prioritaires ({alertesNonLues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertesNonLues.slice(0, 5).map((alerte) => (
                    <div
                      key={alerte.id}
                      className="flex items-start gap-3 p-3 bg-primary-50 dark:bg-primary-700/50 rounded-lg"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          alerte.priorite === 'critique'
                            ? 'bg-error'
                            : alerte.priorite === 'haute'
                            ? 'bg-warning'
                            : 'bg-info'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-primary-900 dark:text-primary-100">{alerte.titre}</p>
                        <p className="text-sm text-primary-500 dark:text-primary-400">{alerte.message}</p>
                      </div>
                      <Badge
                        variant={
                          alerte.priorite === 'critique'
                            ? 'error'
                            : alerte.priorite === 'haute'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {alerte.priorite}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Tab: Performance */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Tendance de performance */}
          <Card>
            <CardHeader>
              <CardTitle>Tendance de performance (6 derniers mois)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={tendancePerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#404040' : '#e5e5e5'} />
                    <XAxis dataKey="mois" stroke={isDark ? '#a3a3a3' : '#737373'} fontSize={12} />
                    <YAxis domain={[0, 100]} stroke={isDark ? '#a3a3a3' : '#737373'} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#262626' : '#fff',
                        border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`,
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="performance"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      connectNulls
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance par axe stratégique */}
          {performanceParAxe.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance par axe stratégique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <RadarChart data={performanceParAxe}>
                        <PolarGrid stroke={isDark ? '#404040' : '#e5e5e5'} />
                        <PolarAngleAxis dataKey="code" stroke={isDark ? '#a3a3a3' : '#737373'} fontSize={12} />
                        <PolarRadiusAxis domain={[0, 100]} stroke={isDark ? '#a3a3a3' : '#737373'} fontSize={10} />
                        <Radar
                          name="Performance"
                          dataKey="performance"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {performanceParAxe.map((axe) => (
                      <div key={axe.code} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: axe.couleur }} />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-primary-900 dark:text-primary-100">{axe.code}</span>
                            <span className={`font-bold ${axe.performance >= 80 ? 'text-success' : axe.performance >= 60 ? 'text-warning' : 'text-error'}`}>
                              {axe.performance}%
                            </span>
                          </div>
                          <p className="text-xs text-primary-500 truncate">{axe.nom}</p>
                          <div className="mt-1 h-1.5 bg-primary-100 dark:bg-primary-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${axe.performance}%`,
                                backgroundColor: axe.couleur
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparaison détaillée des centres */}
          <Card>
            <CardHeader>
              <CardTitle>Comparaison des centres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={performanceParCentre}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#404040' : '#e5e5e5'} />
                    <XAxis dataKey="name" stroke={isDark ? '#a3a3a3' : '#737373'} fontSize={12} />
                    <YAxis stroke={isDark ? '#a3a3a3' : '#737373'} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#262626' : '#fff',
                        border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`,
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="performance" name="Performance KPI %" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="tauxActions" name="Actions terminées %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="kpis" name="Nb KPIs" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actions" name="Nb Actions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Actions */}
      {activeTab === 'actions' && (
        <div className="space-y-6">
          {/* Stats actions */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-3xl font-bold text-primary-900 dark:text-primary-100">{stats.actionsTotal}</p>
                <p className="text-sm text-primary-500">Total actions</p>
              </CardContent>
            </Card>
            <Card className="bg-success/5 border-success/20">
              <CardContent className="py-4 text-center">
                <p className="text-3xl font-bold text-success">{stats.actionsTerminees}</p>
                <p className="text-sm text-success">Terminées</p>
              </CardContent>
            </Card>
            <Card className="bg-info/5 border-info/20">
              <CardContent className="py-4 text-center">
                <p className="text-3xl font-bold text-info">{stats.actionsEnCours}</p>
                <p className="text-sm text-info">En cours</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-3xl font-bold text-primary-500">{stats.actionsAFaire}</p>
                <p className="text-sm text-primary-500">À faire</p>
              </CardContent>
            </Card>
            <Card className="bg-error/5 border-error/20">
              <CardContent className="py-4 text-center">
                <p className="text-3xl font-bold text-error">{stats.actionsEnRetard}</p>
                <p className="text-sm text-error">En retard</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions en retard par centre */}
          <Card>
            <CardHeader
              action={
                <Button onClick={() => navigate('/actions-consolidees')} leftIcon={<Eye className="w-4 h-4" />}>
                  Voir plan consolidé
                </Button>
              }
            >
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-error" />
                Actions en retard par centre
              </CardTitle>
            </CardHeader>
            <CardContent>
              {actionsEnRetard.length === 0 ? (
                <div className="text-center py-8 text-success">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-medium">Aucune action en retard</p>
                  <p className="text-sm text-primary-500">Toutes les actions sont dans les délais</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {centres.map((centre) => {
                    const centreActionsRetard = actionsEnRetard.filter((a) => a.centreId === centre.id);
                    if (centreActionsRetard.length === 0) return null;

                    return (
                      <div key={centre.id} className="border border-error/20 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: centre.couleurTheme || '#171717' }}
                          >
                            {centre.code.substring(0, 2)}
                          </div>
                          <span className="font-medium text-primary-900 dark:text-primary-100">{centre.nom}</span>
                          <Badge variant="error">{centreActionsRetard.length} en retard</Badge>
                        </div>
                        <div className="space-y-2">
                          {centreActionsRetard.slice(0, 3).map((action) => (
                            <div key={action.id} className="flex items-center justify-between p-2 bg-error/5 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-primary-900 dark:text-primary-100">{action.titre}</p>
                                <p className="text-xs text-error">
                                  Échéance: {format(new Date(action.dateEcheance), 'dd/MM/yyyy')}
                                  {' '}({differenceInDays(new Date(), new Date(action.dateEcheance))} jours de retard)
                                </p>
                              </div>
                              <Badge variant={action.priorite === 'critique' ? 'error' : action.priorite === 'haute' ? 'warning' : 'default'}>
                                {action.priorite}
                              </Badge>
                            </div>
                          ))}
                          {centreActionsRetard.length > 3 && (
                            <p className="text-xs text-primary-500 text-center">
                              +{centreActionsRetard.length - 3} autres actions en retard
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Graphique répartition actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par statut</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <RechartsPieChart>
                      <Pie
                        data={statutsActions}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statutsActions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions par centre</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={performanceParCentre} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#404040' : '#e5e5e5'} />
                      <XAxis type="number" stroke={isDark ? '#a3a3a3' : '#737373'} fontSize={12} />
                      <YAxis dataKey="name" type="category" width={60} stroke={isDark ? '#a3a3a3' : '#737373'} fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#262626' : '#fff',
                          border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`,
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="actions" name="Nombre d'actions" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Projets */}
      {activeTab === 'projets' && (
        <div className="space-y-6">
          {centresEnProjet.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Rocket className="w-12 h-12 text-primary-300 dark:text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
                  Aucun projet en cours
                </h3>
                <p className="text-primary-500 dark:text-primary-400 mb-4">
                  Activez le mode projet sur un centre pour démarrer
                </p>
                <Button onClick={() => navigate('/centres')}>
                  Gérer les centres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats globales projets */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-info/5 border-info/20">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center">
                        <Target className="w-6 h-6 text-info" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-info">
                          {projetStatsGlobal.jalonsAtteints}/{projetStatsGlobal.totalJalons}
                        </p>
                        <p className="text-sm text-primary-500">Jalons atteints</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-success/5 border-success/20">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-success">
                          {projetStatsGlobal.postesIntegres}/{projetStatsGlobal.totalPostes}
                        </p>
                        <p className="text-sm text-primary-500">Postes pourvus</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-warning/5 border-warning/20">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                        <Store className="w-6 h-6 text-warning" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-warning">
                          {projetStatsGlobal.prospectsSigns}/{projetStatsGlobal.totalProspects}
                        </p>
                        <p className="text-sm text-primary-500">Baux signés</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-700 rounded-full flex items-center justify-center">
                        <FileCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                          {projetStatsGlobal.tauxCommercialisation}%
                        </p>
                        <p className="text-sm text-primary-500">Taux commercialisation</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cartes projets détaillées */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {centresEnProjet.map((centre) => {
                  const projetStats = getProjetStats(centre.id);
                  if (!projetStats) return null;

                  return (
                    <Card
                      key={centre.id}
                      hoverable
                      onClick={() => {
                        setCurrentCentre(centre.id);
                        navigate(`/centre/${centre.id}/projet`);
                      }}
                      className="border-l-4 border-l-info"
                    >
                      <CardContent>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: centre.couleurTheme || '#3b82f6' }}
                            >
                              {centre.code.substring(0, 2)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-primary-900 dark:text-primary-100">{centre.nom}</h3>
                              <p className="text-sm text-primary-500 dark:text-primary-400">{centre.ville}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${projetStats.joursRestants <= 30 ? 'text-error' : projetStats.joursRestants <= 90 ? 'text-warning' : 'text-info'}`}>
                              J-{Math.max(0, projetStats.joursRestants)}
                            </p>
                            <p className="text-xs text-primary-500">
                              {format(parseISO(projetStats.projet.dateSoftOpening), 'dd MMM yyyy', { locale: fr })}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                          <div className="text-center p-2 bg-primary-50 dark:bg-primary-700/50 rounded-lg">
                            <p className="text-lg font-bold text-primary-900 dark:text-primary-100">
                              {projetStats.jalonsAtteints}/{projetStats.jalonsTotal}
                            </p>
                            <p className="text-xs text-primary-500 dark:text-primary-400">Jalons</p>
                            <div className="mt-1 h-1 bg-primary-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-info rounded-full"
                                style={{ width: `${projetStats.jalonsTotal > 0 ? (projetStats.jalonsAtteints / projetStats.jalonsTotal) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-center p-2 bg-primary-50 dark:bg-primary-700/50 rounded-lg">
                            <p className="text-lg font-bold text-primary-900 dark:text-primary-100">
                              {projetStats.postesIntegres}/{projetStats.postesTotal}
                            </p>
                            <p className="text-xs text-primary-500 dark:text-primary-400">Recrutés</p>
                            <div className="mt-1 h-1 bg-primary-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-success rounded-full"
                                style={{ width: `${projetStats.postesTotal > 0 ? (projetStats.postesIntegres / projetStats.postesTotal) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-center p-2 bg-primary-50 dark:bg-primary-700/50 rounded-lg">
                            <p className="text-lg font-bold text-primary-900 dark:text-primary-100">
                              {projetStats.prospectsSigns}/{projetStats.prospectsTotal}
                            </p>
                            <p className="text-xs text-primary-500 dark:text-primary-400">Baux</p>
                            <div className="mt-1 h-1 bg-primary-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-warning rounded-full"
                                style={{ width: `${projetStats.prospectsTotal > 0 ? (projetStats.prospectsSigns / projetStats.prospectsTotal) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-center p-2 bg-primary-50 dark:bg-primary-700/50 rounded-lg">
                            <p className="text-lg font-bold text-primary-900 dark:text-primary-100">
                              {projetStats.glaSigne > 0 ? `${(projetStats.glaSigne / 1000).toFixed(1)}k` : '0'}
                            </p>
                            <p className="text-xs text-primary-500 dark:text-primary-400">m² GLA</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
