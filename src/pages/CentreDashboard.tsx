import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  ClipboardList,
  AlertTriangle,
  Calendar,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, StatutKPIBadge } from '../components/ui';
import {
  useCentresStore,
  useAxesStore,
  useMesuresStore,
  useActionsStore,
  useAppStore,
} from '../store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function CentreDashboard() {
  const { centreId } = useParams<{ centreId: string }>();
  const navigate = useNavigate();
  const { setCurrentCentre } = useAppStore();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const { axes, loadAxes, objectifs, loadObjectifs, getAxesByCentre, getObjectifsByCentre } = useAxesStore();
  const { mesures, loadMesures } = useMesuresStore();
  const { actions, loadActions, getActionsByCentre, getActionsEnRetard } = useActionsStore();

  useEffect(() => {
    if (centreId) {
      setCurrentCentre(centreId);
      loadAxes(centreId);
      loadObjectifs(centreId);
      loadMesures(centreId);
      loadActions(centreId);
    }
  }, [centreId]);

  if (!centre) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-primary-500">Centre non trouvé</p>
      </div>
    );
  }

  const centreAxes = getAxesByCentre(centreId || '');
  const centreObjectifs = getObjectifsByCentre(centreId || '');
  const centreActions = getActionsByCentre(centreId || '');
  const centreMesures = mesures.filter((m) => m.centreId === centreId);
  const actionsEnRetard = getActionsEnRetard().filter((a) => a.centreId === centreId);

  // Calcul de la performance par axe
  const performanceParAxe = centreAxes.map((axe) => {
    const axeObjectifs = centreObjectifs.filter((o) => o.axeId === axe.id);
    const axeMesures = centreMesures.filter((m) =>
      axeObjectifs.some((o) => o.id === m.objectifId)
    );
    const mesuresVertes = axeMesures.filter((m) => m.statut === 'vert').length;
    const performance = axeMesures.length > 0
      ? Math.round((mesuresVertes / axeMesures.length) * 100)
      : 0;

    return {
      axe: axe.nom.split(' ').slice(0, 2).join(' '),
      code: axe.code,
      performance,
      fullMark: 100,
      couleur: axe.couleur,
    };
  });

  // Statistiques globales
  const stats = {
    objectifsTotal: centreObjectifs.length,
    objectifsAtteints: centreMesures.filter((m) => m.statut === 'vert').length,
    actionsEnCours: centreActions.filter((a) => a.statut === 'en_cours').length,
    actionsEnRetard: actionsEnRetard.length,
  };

  // Performance globale
  const performanceGlobale = centreMesures.length > 0
    ? Math.round((stats.objectifsAtteints / centreMesures.length) * 100)
    : 0;

  // Dernières mesures
  const dernieresMesures = centreMesures
    .sort((a, b) => new Date(b.dateSaisie).getTime() - new Date(a.dateSaisie).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: centre.couleurTheme }}
          >
            {centre.code.substring(0, 2)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-900">{centre.nom}</h1>
            <p className="text-primary-500">{centre.ville}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/centre/${centreId}/pilotage`)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Piloter les KPIs
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-500">Performance globale</p>
                <p className="text-3xl font-bold text-primary-900 mt-1">{performanceGlobale}%</p>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  performanceGlobale >= 80
                    ? 'bg-success/10'
                    : performanceGlobale >= 60
                    ? 'bg-warning/10'
                    : 'bg-error/10'
                }`}
              >
                <TrendingUp
                  className={`w-6 h-6 ${
                    performanceGlobale >= 80
                      ? 'text-success'
                      : performanceGlobale >= 60
                      ? 'text-warning'
                      : 'text-error'
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-500">Objectifs atteints</p>
                <p className="text-3xl font-bold text-primary-900 mt-1">
                  {stats.objectifsAtteints}
                  <span className="text-lg text-primary-400">/{stats.objectifsTotal}</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-500">Actions en cours</p>
                <p className="text-3xl font-bold text-primary-900 mt-1">{stats.actionsEnCours}</p>
              </div>
              <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-500">Actions en retard</p>
                <p className="text-3xl font-bold text-error mt-1">{stats.actionsEnRetard}</p>
              </div>
              <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-error" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar de performance par axe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance par axe stratégique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {performanceParAxe.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={performanceParAxe}>
                    <PolarGrid stroke="#e5e5e5" />
                    <PolarAngleAxis
                      dataKey="axe"
                      tick={{ fill: '#737373', fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: '#737373', fontSize: 10 }}
                    />
                    <Radar
                      name="Performance"
                      dataKey="performance"
                      stroke="#171717"
                      fill="#171717"
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-primary-500">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Liste des axes */}
        <Card>
          <CardHeader
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/centre/${centreId}/pilotage`)}
              >
                Détails
              </Button>
            }
          >
            <CardTitle>Axes stratégiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {centreAxes.map((axe) => {
                const axeData = performanceParAxe.find((p) => p.code === axe.code);
                const performance = axeData?.performance || 0;

                return (
                  <div
                    key={axe.id}
                    className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: axe.couleur }}
                    >
                      {axe.code.replace('AXE', '')}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-primary-900 text-sm">{axe.nom}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-primary-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${performance}%`,
                              backgroundColor:
                                performance >= 80
                                  ? '#22c55e'
                                  : performance >= 60
                                  ? '#f59e0b'
                                  : '#ef4444',
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-primary-600 w-12 text-right">
                          {performance}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {centreAxes.length === 0 && (
                <p className="text-center text-primary-500 py-4">
                  Aucun axe configuré
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dernières mesures et Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernières mesures */}
        <Card>
          <CardHeader
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/centre/${centreId}/pilotage`)}
              >
                Voir tout
              </Button>
            }
          >
            <CardTitle>Dernières mesures saisies</CardTitle>
          </CardHeader>
          <CardContent>
            {dernieresMesures.length > 0 ? (
              <div className="space-y-3">
                {dernieresMesures.map((mesure) => {
                  const objectif = centreObjectifs.find((o) => o.id === mesure.objectifId);
                  return (
                    <div
                      key={mesure.id}
                      className="flex items-center justify-between p-3 bg-primary-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-primary-900 text-sm">
                          {objectif?.intitule || 'Objectif inconnu'}
                        </p>
                        <p className="text-xs text-primary-500">
                          {format(new Date(mesure.dateSaisie), 'dd/MM/yyyy', { locale: fr })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-primary-900">
                          {mesure.valeurReelle}
                        </span>
                        <StatutKPIBadge statut={mesure.statut} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-primary-500 py-4">
                Aucune mesure enregistrée
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions en retard */}
        <Card>
          <CardHeader
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/centre/${centreId}/actions`)}
              >
                Voir tout
              </Button>
            }
          >
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Actions prioritaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actionsEnRetard.length > 0 ? (
              <div className="space-y-3">
                {actionsEnRetard.slice(0, 5).map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-3 bg-error/5 border border-error/10 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-primary-900 text-sm">{action.titre}</p>
                      <p className="text-xs text-error">
                        Échéance: {format(new Date(action.dateEcheance), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>
                    <Badge variant="error">En retard</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-success" />
                </div>
                <p className="text-primary-500">Aucune action en retard</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
