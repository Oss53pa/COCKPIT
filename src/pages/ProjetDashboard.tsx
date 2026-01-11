import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  Users,
  Building2,
  ClipboardCheck,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Target,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  Wallet,
  Flag,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, ConfirmModal } from '../components/ui';
import { useCentresStore, useProjetStore, useAppStore } from '../store';
import { format, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';

// Composant Compte à rebours
function CountdownCard({
  title,
  targetDate,
  icon: Icon,
  color,
}: {
  title: string;
  targetDate: string;
  icon: React.ElementType;
  color: string;
}) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate);
      const now = new Date();
      const days = differenceInDays(target, now);
      const hours = differenceInHours(target, now) % 24;
      const minutes = differenceInMinutes(target, now) % 60;
      setTimeLeft({ days: Math.max(0, days), hours: Math.max(0, hours), minutes: Math.max(0, minutes) });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isUrgent = timeLeft.days <= 30;
  const isCritical = timeLeft.days <= 7;

  return (
    <Card className={`relative overflow-hidden ${isCritical ? 'ring-2 ring-error' : isUrgent ? 'ring-2 ring-warning' : ''}`}>
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8"
        style={{ backgroundColor: color }}
      />
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-primary-500 mb-1">{title}</p>
            <p className="text-xs text-primary-400 mb-3">
              {format(new Date(targetDate), 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
            <div className="flex items-baseline gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary-900">{timeLeft.days}</p>
                <p className="text-xs text-primary-500">jours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-primary-700">{timeLeft.hours}</p>
                <p className="text-xs text-primary-500">heures</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-medium text-primary-600">{timeLeft.minutes}</p>
                <p className="text-xs text-primary-500">min</p>
              </div>
            </div>
          </div>
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-7 h-7" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant Indicateur de progression
function ProgressIndicator({
  label,
  current,
  total,
  icon: Icon,
  color,
}: {
  label: string;
  current: number;
  total: number;
  icon: React.ElementType;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-primary-900">{label}</p>
          <p className="text-sm font-bold text-primary-900">
            {current}<span className="text-primary-400 font-normal">/{total}</span>
          </p>
        </div>
        <div className="h-2 bg-primary-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
      </div>
      <span
        className="text-lg font-bold"
        style={{ color: percentage >= 80 ? '#22c55e' : percentage >= 50 ? color : '#ef4444' }}
      >
        {percentage}%
      </span>
    </div>
  );
}

export function ProjetDashboard() {
  const { centreId } = useParams<{ centreId: string }>();
  const navigate = useNavigate();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const updateCentre = useCentresStore((state) => state.updateCentre);
  const { addToast } = useAppStore();
  const {
    projets,
    phases,
    jalons,
    vaguesRecrutement,
    postesARecruter,
    prospects,
    reserves,
    suiviBEFA,
    risquesProjet,
    loadProjet,
    getStatistiquesProjet,
    initializeDefaultProjet,
  } = useProjetStore();

  const [isInitializing, setIsInitializing] = useState(false);
  const [isActivateExploitationModalOpen, setIsActivateExploitationModalOpen] = useState(false);

  // Détermine si on peut activer le mode exploitation (en construction sans exploitation)
  const peutActiverExploitation = centre?.statut === 'en_construction' && !centre?.modeExploitationActif;

  // Détermine si on est en période transitoire
  const estEnTransition = centre?.statut === 'en_construction' && centre?.modeExploitationActif;

  // Fonction pour activer le mode exploitation
  const handleActivateExploitation = async () => {
    if (!centreId) return;
    try {
      await updateCentre(centreId, { modeExploitationActif: true });
      addToast({
        type: 'success',
        title: 'Mode exploitation activé',
        message: 'Le centre est maintenant en période de transition (projet + exploitation).',
      });
      setIsActivateExploitationModalOpen(false);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible d\'activer le mode exploitation.',
      });
    }
  };

  useEffect(() => {
    if (centreId) {
      loadProjet(centreId);
    }
  }, [centreId]);

  if (!centre) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-primary-500">Centre non trouvé</p>
      </div>
    );
  }

  const projet = projets.find((p) => p.centreId === centreId);

  // Initialisation du projet si nécessaire
  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const softOpening = new Date();
      softOpening.setMonth(softOpening.getMonth() + 6);
      const inauguration = new Date(softOpening);
      inauguration.setMonth(inauguration.getMonth() + 1);

      await initializeDefaultProjet(
        centreId!,
        centre.nom,
        softOpening.toISOString(),
        inauguration.toISOString()
      );
    } finally {
      setIsInitializing(false);
    }
  };

  if (!projet) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-primary-50 rounded-2xl">
        <Building2 className="w-16 h-16 text-primary-300 mb-4" />
        <h2 className="text-xl font-bold text-primary-900 mb-2">Mode Projet non initialisé</h2>
        <p className="text-primary-500 mb-6 text-center max-w-md">
          Ce centre est en phase de construction. Initialisez le projet pour commencer à suivre les jalons, le recrutement et la commercialisation.
        </p>
        <Button onClick={handleInitialize} disabled={isInitializing}>
          {isInitializing ? 'Initialisation...' : 'Initialiser le projet de lancement'}
        </Button>
      </div>
    );
  }

  const stats = getStatistiquesProjet(projet.id);
  const projetJalons = jalons.filter((j) => j.projetId === projet.id);
  const projetPhases = phases.filter((p) => p.projetId === projet.id);
  const projetRisques = risquesProjet.filter((r) => r.projetId === projet.id);

  // Jalons à venir (triés par date)
  const jalonsAVenir = projetJalons
    .filter((j) => j.statut !== 'atteint')
    .sort((a, b) => new Date(a.dateCible).getTime() - new Date(b.dateCible).getTime())
    .slice(0, 5);

  // Risques critiques
  const risquesCritiques = projetRisques
    .filter((r) => r.criticite >= 15 && r.statut !== 'clos')
    .sort((a, b) => b.criticite - a.criticite)
    .slice(0, 3);

  // Données pour le graphique des phases
  const phasesData = projetPhases.map((phase) => ({
    nom: phase.nom,
    avancement: phase.avancement,
    budget: Math.round((phase.budgetConsomme / phase.budget) * 100),
    statut: phase.statut,
  }));

  // Statut badge pour les jalons
  const getJalonStatutBadge = (statut: string) => {
    switch (statut) {
      case 'atteint':
        return <Badge variant="success">Atteint</Badge>;
      case 'en_cours':
        return <Badge variant="info">En cours</Badge>;
      case 'en_retard':
        return <Badge variant="error">En retard</Badge>;
      case 'a_risque':
        return <Badge variant="warning">À risque</Badge>;
      default:
        return <Badge variant="default">À venir</Badge>;
    }
  };

  // Icône pour les jalons
  const getJalonIcon = (statut: string) => {
    switch (statut) {
      case 'atteint':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'en_cours':
        return <Circle className="w-5 h-5 text-info fill-info/20" />;
      case 'en_retard':
        return <AlertCircle className="w-5 h-5 text-error" />;
      case 'a_risque':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      default:
        return <Circle className="w-5 h-5 text-primary-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl relative"
            style={{ backgroundColor: centre.couleurTheme }}
          >
            {centre.code.substring(0, 2)}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-info rounded-full flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-white" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-primary-900">{centre.nom}</h1>
              <Badge variant="info">Mode Projet</Badge>
            </div>
            <p className="text-primary-500">Phase: {projet.phaseActuelle}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {/* Bouton activation mode exploitation - visible si pas encore en transition */}
          {peutActiverExploitation && (
            <Button
              variant="secondary"
              onClick={() => setIsActivateExploitationModalOpen(true)}
              leftIcon={<Target className="w-4 h-4" />}
              className="text-success border-success hover:bg-success/10"
            >
              Activer exploitation
            </Button>
          )}
          {/* Indicateur période transitoire */}
          {estEnTransition && (
            <Badge variant="warning" className="flex items-center gap-1 px-3 py-2">
              <Target className="w-4 h-4" />
              Période de transition
            </Badge>
          )}
          <Button
            variant="secondary"
            onClick={() => navigate(`/centre/${centreId}/projet/jalons`)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Planning
          </Button>
          <Button
            onClick={() => navigate(`/centre/${centreId}/projet/recrutement`)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Recrutement
          </Button>
        </div>
      </div>

      {/* Compte à rebours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CountdownCard
          title="Soft Opening"
          targetDate={projet.dateSoftOpening}
          icon={Flag}
          color="#f59e0b"
        />
        <CountdownCard
          title="Inauguration"
          targetDate={projet.dateInauguration}
          icon={Calendar}
          color="#22c55e"
        />
      </div>

      {/* Indicateurs clés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Indicateurs de progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProgressIndicator
              label="Jalons atteints"
              current={stats.jalonsAtteints}
              total={stats.jalonsTotal}
              icon={CheckCircle2}
              color="#22c55e"
            />
            <ProgressIndicator
              label="Postes recrutés"
              current={stats.postesRecrutes}
              total={stats.postesTotal}
              icon={Users}
              color="#3b82f6"
            />
            <ProgressIndicator
              label="Occupation commerciale"
              current={stats.glaSigne}
              total={stats.glaTotal}
              icon={Building2}
              color="#8b5cf6"
            />
            <ProgressIndicator
              label="BEFA complets"
              current={stats.befaComplets}
              total={stats.befaTotal}
              icon={ClipboardCheck}
              color="#f59e0b"
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget et Phases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget global */}
        <Card>
          <CardHeader
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate(`/centre/${centreId}/projet/budget`)}>
                Détails
              </Button>
            }
          >
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Budget projet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-primary-500">Consommé</p>
                <p className="text-2xl font-bold text-primary-900">
                  {(stats.budgetConsomme / 1000000).toFixed(1)}M
                  <span className="text-lg text-primary-400 font-normal"> FCFA</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary-500">Budget total</p>
                <p className="text-xl font-semibold text-primary-700">
                  {(stats.budgetTotal / 1000000).toFixed(1)}M FCFA
                </p>
              </div>
            </div>
            <div className="h-3 bg-primary-100 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${
                  stats.ecartBudget > 5 ? 'bg-error' : stats.ecartBudget > 0 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${Math.min(100, (stats.budgetConsomme / stats.budgetTotal) * 100)}%` }}
              />
            </div>
            <p className={`text-sm ${stats.ecartBudget > 0 ? 'text-error' : 'text-success'}`}>
              {stats.ecartBudget > 0 ? '+' : ''}{stats.ecartBudget}% par rapport au budget
            </p>
          </CardContent>
        </Card>

        {/* Avancement des phases */}
        <Card>
          <CardHeader>
            <CardTitle>Avancement des phases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phasesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#737373', fontSize: 12 }} />
                  <YAxis dataKey="nom" type="category" width={100} tick={{ fill: '#737373', fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Avancement']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="avancement" radius={[0, 4, 4, 0]}>
                    {phasesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.statut === 'termine' ? '#22c55e' : entry.statut === 'en_cours' ? '#3b82f6' : '#d4d4d4'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jalons et Risques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prochains jalons */}
        <Card>
          <CardHeader
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate(`/centre/${centreId}/projet/jalons`)}>
                Voir tout
              </Button>
            }
          >
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Prochains jalons
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jalonsAVenir.length > 0 ? (
              <div className="space-y-3">
                {jalonsAVenir.map((jalon, index) => (
                  <div
                    key={jalon.id}
                    className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/centre/${centreId}/projet/jalons`)}
                  >
                    <div className="flex flex-col items-center">
                      {getJalonIcon(jalon.statut)}
                      {index < jalonsAVenir.length - 1 && (
                        <div className="w-0.5 h-8 bg-primary-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary-500">{jalon.code}</span>
                        <Badge
                          variant={jalon.importance === 'critique' ? 'error' : jalon.importance === 'majeur' ? 'warning' : 'default'}
                          size="sm"
                        >
                          {jalon.importance}
                        </Badge>
                      </div>
                      <p className="font-medium text-primary-900">{jalon.titre}</p>
                      <p className="text-xs text-primary-500">
                        {format(new Date(jalon.dateCible), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getJalonStatutBadge(jalon.statut)}
                      <ChevronRight className="w-4 h-4 text-primary-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                <p className="text-primary-500">Tous les jalons sont atteints</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risques critiques */}
        <Card>
          <CardHeader
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate(`/centre/${centreId}/projet/risques`)}>
                Voir tout
              </Button>
            }
          >
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Risques critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            {risquesCritiques.length > 0 ? (
              <div className="space-y-3">
                {risquesCritiques.map((risque) => (
                  <div
                    key={risque.id}
                    className="p-4 bg-error/5 border border-error/10 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-mono text-xs text-primary-500">{risque.code}</span>
                        <p className="font-medium text-primary-900">{risque.titre}</p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-error/10 rounded-full">
                        <span className="text-xs font-bold text-error">{risque.criticite}</span>
                        <span className="text-xs text-error">/25</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-primary-500">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">P:</span> {risque.probabilite}/5
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">I:</span> {risque.impact}/5
                      </span>
                      <Badge variant="default" size="sm">{risque.categorie}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                <p className="text-primary-500">Aucun risque critique identifié</p>
              </div>
            )}

            {/* Réserves bloquantes */}
            {stats.reservesBloquantes > 0 && (
              <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-xl">
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">{stats.reservesBloquantes} réserve(s) bloquante(s)</span>
                </div>
                <p className="text-sm text-primary-600 mt-1">
                  {stats.reservesTotales} réserves ouvertes au total
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation rapide */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'Jalons', icon: Flag, path: 'jalons', color: '#3b82f6' },
              { label: 'Recrutement', icon: Users, path: 'recrutement', color: '#22c55e' },
              { label: 'Commercial', icon: Building2, path: 'commercial', color: '#8b5cf6' },
              { label: 'Handover', icon: ClipboardCheck, path: 'handover', color: '#f59e0b' },
              { label: 'Budget', icon: Wallet, path: 'budget', color: '#ec4899' },
              { label: 'Risques', icon: AlertTriangle, path: 'risques', color: '#ef4444' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(`/centre/${centreId}/projet/${item.path}`)}
                className="flex flex-col items-center gap-2 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <span className="text-sm font-medium text-primary-700">{item.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de confirmation activation mode exploitation */}
      <ConfirmModal
        isOpen={isActivateExploitationModalOpen}
        onClose={() => setIsActivateExploitationModalOpen(false)}
        onConfirm={handleActivateExploitation}
        title="Activer le mode exploitation"
        message="Le centre entrera en période de transition avec accès simultané au mode projet et au mode exploitation. Cela permet de préparer l'exploitation tout en finalisant le projet de lancement."
        confirmLabel="Activer"
        variant="default"
      />
    </div>
  );
}
