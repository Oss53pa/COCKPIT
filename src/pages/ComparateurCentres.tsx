import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { ArrowLeft, Building2, Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../components/ui';
import { useCentresStore, useAxesStore, useMesuresStore } from '../store';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ComparateurCentres() {
  const navigate = useNavigate();
  const { centres, loadCentres } = useCentresStore();
  const { axes, loadAxes, objectifs, loadObjectifs } = useAxesStore();
  const { mesures, loadMesures } = useMesuresStore();

  const [selectedCentres, setSelectedCentres] = useState<string[]>([]);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  useEffect(() => {
    loadCentres();
    loadAxes();
    loadObjectifs();
    loadMesures();
  }, []);

  // Auto-select first 2 centers if none selected
  useEffect(() => {
    if (centres.length >= 2 && selectedCentres.length === 0) {
      setSelectedCentres([centres[0].id, centres[1].id]);
    }
  }, [centres]);

  const toggleCentre = (centreId: string) => {
    if (selectedCentres.includes(centreId)) {
      setSelectedCentres(selectedCentres.filter((id) => id !== centreId));
    } else if (selectedCentres.length < 4) {
      setSelectedCentres([...selectedCentres, centreId]);
    }
  };

  // Calculate performance data for each selected center
  const performanceData = useMemo(() => {
    return selectedCentres.map((centreId, index) => {
      const centre = centres.find((c) => c.id === centreId);
      const centreMesures = mesures.filter((m) => m.centreId === centreId);
      const mesuresVertes = centreMesures.filter((m) => m.statut === 'vert').length;
      const performance =
        centreMesures.length > 0
          ? Math.round((mesuresVertes / centreMesures.length) * 100)
          : 0;

      return {
        id: centreId,
        name: centre?.code || 'N/A',
        fullName: centre?.nom || 'N/A',
        performance,
        objectifs: objectifs.filter((o) => o.centreId === centreId).length,
        surface: centre?.surfaceLocative || 0,
        color: COLORS[index % COLORS.length],
        mesuresVertes,
        mesuresOranges: centreMesures.filter((m) => m.statut === 'orange').length,
        mesuresRouges: centreMesures.filter((m) => m.statut === 'rouge').length,
      };
    });
  }, [selectedCentres, centres, mesures, objectifs]);

  // Calculate radar data for strategic axes
  const radarData = useMemo(() => {
    const axesList = axes.slice(0, 6); // Limit to 6 axes for readability

    return axesList.map((axe) => {
      const dataPoint: Record<string, string | number> = {
        axe: axe.nom,
      };

      selectedCentres.forEach((centreId, index) => {
        const centre = centres.find((c) => c.id === centreId);
        const axeObjectifs = objectifs.filter(
          (o) => o.axeId === axe.id && o.centreId === centreId
        );
        const axeMesures = mesures.filter(
          (m) => m.centreId === centreId && axeObjectifs.some((o) => o.id === m.objectifId)
        );
        const mesuresVertes = axeMesures.filter((m) => m.statut === 'vert').length;
        const performance =
          axeMesures.length > 0 ? Math.round((mesuresVertes / axeMesures.length) * 100) : 0;

        dataPoint[centre?.code || `Centre ${index + 1}`] = performance;
      });

      return dataPoint;
    });
  }, [selectedCentres, centres, axes, objectifs, mesures]);

  // Comparison bar chart data
  const comparisonData = useMemo(() => {
    return [
      {
        name: 'Performance',
        ...Object.fromEntries(performanceData.map((d) => [d.name, d.performance])),
      },
      {
        name: 'KPIs Verts',
        ...Object.fromEntries(performanceData.map((d) => [d.name, d.mesuresVertes])),
      },
      {
        name: 'KPIs Orange',
        ...Object.fromEntries(performanceData.map((d) => [d.name, d.mesuresOranges])),
      },
      {
        name: 'KPIs Rouges',
        ...Object.fromEntries(performanceData.map((d) => [d.name, d.mesuresRouges])),
      },
    ];
  }, [performanceData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white dark:bg-primary-800 border border-primary-200 dark:border-primary-700 rounded-lg shadow-lg p-3">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-primary-600 dark:text-primary-400">{entry.name}:</span>
            <span className="font-medium text-primary-900 dark:text-primary-100">
              {entry.value}
              {entry.dataKey === 'performance' ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100">
              Comparateur de centres
            </h1>
            <p className="text-primary-500 dark:text-primary-400 mt-1">
              Comparez les performances de 2 \u00e0 4 centres
            </p>
          </div>
        </div>
      </div>

      {/* Centre Selector */}
      <Card>
        <CardHeader>
          <CardTitle>S\u00e9lection des centres ({selectedCentres.length}/4)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {centres.map((centre) => {
              const isSelected = selectedCentres.includes(centre.id);
              const colorIndex = selectedCentres.indexOf(centre.id);

              return (
                <button
                  key={centre.id}
                  onClick={() => toggleCentre(centre.id)}
                  disabled={!isSelected && selectedCentres.length >= 4}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-transparent text-white'
                      : 'border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800'
                  } ${!isSelected && selectedCentres.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    backgroundColor: isSelected ? COLORS[colorIndex % COLORS.length] : undefined,
                  }}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">{centre.code}</span>
                  <span className="text-sm opacity-75">{centre.nom}</span>
                  {isSelected && <Check className="w-4 h-4 ml-1" />}
                </button>
              );
            })}
          </div>
          {selectedCentres.length < 2 && (
            <p className="mt-3 text-sm text-warning">
              S\u00e9lectionnez au moins 2 centres pour comparer
            </p>
          )}
        </CardContent>
      </Card>

      {selectedCentres.length >= 2 && (
        <>
          {/* Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceData.map((data) => (
              <Card key={data.id}>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: data.color }}
                    >
                      {data.name.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-primary-900 dark:text-primary-100">
                        {data.name}
                      </p>
                      <p className="text-xs text-primary-500 dark:text-primary-400">
                        {data.fullName}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-primary-600 dark:text-primary-400">
                          Performance
                        </span>
                        <Badge
                          variant={
                            data.performance >= 80
                              ? 'success'
                              : data.performance >= 60
                              ? 'warning'
                              : 'error'
                          }
                        >
                          {data.performance}%
                        </Badge>
                      </div>
                      <div className="h-2 bg-primary-100 dark:bg-primary-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${data.performance}%`,
                            backgroundColor: data.color,
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="font-bold text-success">{data.mesuresVertes}</span>
                        <p className="text-primary-500 dark:text-primary-400">Verts</p>
                      </div>
                      <div>
                        <span className="font-bold text-warning">{data.mesuresOranges}</span>
                        <p className="text-primary-500 dark:text-primary-400">Orange</p>
                      </div>
                      <div>
                        <span className="font-bold text-error">{data.mesuresRouges}</span>
                        <p className="text-primary-500 dark:text-primary-400">Rouges</p>
                      </div>
                    </div>
                    <div className="text-sm text-primary-500 dark:text-primary-400 pt-2 border-t border-primary-100 dark:border-primary-700">
                      Surface: {data.surface.toLocaleString()} m\u00b2
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Comparaison des performances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                      <XAxis
                        dataKey="name"
                        stroke="var(--chart-text)"
                        fontSize={12}
                      />
                      <YAxis stroke="var(--chart-text)" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {performanceData.map((data) => (
                        <Bar
                          key={data.id}
                          dataKey={data.name}
                          fill={data.color}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance par axe strat\u00e9gique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {radarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="var(--chart-grid)" />
                        <PolarAngleAxis
                          dataKey="axe"
                          stroke="var(--chart-text)"
                          fontSize={11}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          stroke="var(--chart-text)"
                          fontSize={10}
                        />
                        {performanceData.map((data) => (
                          <Radar
                            key={data.id}
                            name={data.name}
                            dataKey={data.name}
                            stroke={data.color}
                            fill={data.color}
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        ))}
                        <Legend />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-primary-500 dark:text-primary-400">
                      Aucun axe strat\u00e9gique d\u00e9fini
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tableau comparatif d\u00e9taill\u00e9</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary-200 dark:border-primary-700">
                      <th className="text-left py-3 px-4 font-medium text-primary-600 dark:text-primary-400">
                        M\u00e9trique
                      </th>
                      {performanceData.map((data) => (
                        <th
                          key={data.id}
                          className="text-center py-3 px-4 font-medium"
                          style={{ color: data.color }}
                        >
                          {data.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-primary-100 dark:border-primary-700">
                      <td className="py-3 px-4 text-primary-700 dark:text-primary-300">
                        Performance globale
                      </td>
                      {performanceData.map((data) => (
                        <td
                          key={data.id}
                          className="text-center py-3 px-4 font-medium text-primary-900 dark:text-primary-100"
                        >
                          {data.performance}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-primary-100 dark:border-primary-700">
                      <td className="py-3 px-4 text-primary-700 dark:text-primary-300">
                        Objectifs suivis
                      </td>
                      {performanceData.map((data) => (
                        <td
                          key={data.id}
                          className="text-center py-3 px-4 font-medium text-primary-900 dark:text-primary-100"
                        >
                          {data.objectifs}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-primary-100 dark:border-primary-700">
                      <td className="py-3 px-4 text-primary-700 dark:text-primary-300">
                        Surface locative
                      </td>
                      {performanceData.map((data) => (
                        <td
                          key={data.id}
                          className="text-center py-3 px-4 font-medium text-primary-900 dark:text-primary-100"
                        >
                          {data.surface.toLocaleString()} m\u00b2
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-primary-100 dark:border-primary-700">
                      <td className="py-3 px-4 text-primary-700 dark:text-primary-300">
                        KPIs atteints
                      </td>
                      {performanceData.map((data) => (
                        <td key={data.id} className="text-center py-3 px-4 text-success font-medium">
                          {data.mesuresVertes}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-primary-100 dark:border-primary-700">
                      <td className="py-3 px-4 text-primary-700 dark:text-primary-300">
                        KPIs en attention
                      </td>
                      {performanceData.map((data) => (
                        <td key={data.id} className="text-center py-3 px-4 text-warning font-medium">
                          {data.mesuresOranges}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-primary-700 dark:text-primary-300">
                        KPIs critiques
                      </td>
                      {performanceData.map((data) => (
                        <td key={data.id} className="text-center py-3 px-4 text-error font-medium">
                          {data.mesuresRouges}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
