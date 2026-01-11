import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Calendar,
  Users,
  Store,
  Hammer,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  Lightbulb,
  DollarSign,
  Settings,
  Zap,
  ArrowLeftRight,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Modal,
  Input,
} from '../components/ui';
import { useProjetStore, useCentresStore, useAppStore } from '../store';
import { format, differenceInDays, addDays, parseISO, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';

// ===========================================
// TYPES
// ===========================================

interface ElementPlanning {
  id: string;
  type: 'chantier' | 'mobilisation';
  categorie: string;
  titre: string;
  dateBaseline: string;
  dateCible: string;
  dateReelle?: string;
  statut: string;
  avancement: number;
  dependances?: string[];
  impact?: 'critique' | 'majeur' | 'normal';
  budget?: number;
}

interface Decalage {
  element: ElementPlanning;
  joursRetard: number;
  cause: string;
  elementsImpactes: ElementPlanning[];
  economiesPotentielles?: number;
  recommandation: string;
}

interface ActionSynchronisation {
  id: string;
  type: 'decaler' | 'maintenir' | 'accelerer';
  elementId: string;
  nouvelleDate?: string;
  raison: string;
  impactBudget?: number;
}

// ===========================================
// COMPOSANT PRINCIPAL
// ===========================================

export function ProjetSynchronisation() {
  const { centreId } = useParams<{ centreId: string }>();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const { addToast } = useAppStore();

  const {
    projet,
    jalons,
    phasesHandover,
    reserves,
    postesARecruter,
    vaguesRecrutement,
    prospects,
    loadProjet,
    updateJalon,
  } = useProjetStore();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedDecalage, setSelectedDecalage] = useState<Decalage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joursDecalage, setJoursDecalage] = useState(0);

  // Charger les données
  useEffect(() => {
    if (centreId) {
      loadProjet(centreId).finally(() => setIsLoading(false));
    }
  }, [centreId, loadProjet]);

  // Construire les éléments de planning
  const elementsPlanning = useMemo(() => {
    const elements: ElementPlanning[] = [];

    // Vérifier que les données sont chargées
    const jalonsList = jalons || [];
    const phasesHandoverList = phasesHandover || [];
    const vaguesRecrutementList = vaguesRecrutement || [];
    const postesARecruterList = postesARecruter || [];

    // === CHANTIER ===
    // Jalons techniques
    jalonsList
      .filter(j => j.categorie === 'technique' || j.type === 'handover')
      .forEach(j => {
        elements.push({
          id: `jalon-${j.id}`,
          type: 'chantier',
          categorie: 'Jalon technique',
          titre: j.titre,
          dateBaseline: j.dateBaseline || j.dateCible,
          dateCible: j.dateCible,
          dateReelle: j.dateReelle,
          statut: j.statut,
          avancement: j.progression || 0,
          impact: j.importance,
        });
      });

    // Phases handover
    phasesHandoverList.forEach(ph => {
      elements.push({
        id: `handover-${ph.id}`,
        type: 'chantier',
        categorie: 'Handover',
        titre: ph.nom,
        dateBaseline: ph.dateDebut,
        dateCible: ph.dateFin,
        statut: ph.avancement === 100 ? 'termine' : ph.avancement > 0 ? 'en_cours' : 'a_venir',
        avancement: ph.avancement || 0,
        impact: 'majeur',
      });
    });

    // === MOBILISATION ===
    // Jalons RH / Commercial / Marketing
    jalonsList
      .filter(j => ['rh', 'commercial', 'marketing', 'operations'].includes(j.categorie || ''))
      .forEach(j => {
        elements.push({
          id: `jalon-${j.id}`,
          type: 'mobilisation',
          categorie: j.categorie === 'rh' ? 'Recrutement' : j.categorie === 'commercial' ? 'Commercial' : 'Marketing',
          titre: j.titre,
          dateBaseline: j.dateBaseline,
          dateCible: j.dateCible,
          dateReelle: j.dateReelle,
          statut: j.statut,
          avancement: j.progression,
          dependances: j.dependances,
          impact: j.importance,
        });
      });

    // Vagues de recrutement
    vaguesRecrutementList.forEach(v => {
      const postesVague = postesARecruterList.filter(p => p.vagueId === v.id);
      const postesIntegres = postesVague.filter(p => p.statut === 'integre').length;
      elements.push({
        id: `recrutement-${v.id}`,
        type: 'mobilisation',
        categorie: 'Recrutement',
        titre: `Vague ${v.numero}: ${v.nom}`,
        dateBaseline: v.deadline,
        dateCible: v.deadline,
        statut: postesIntegres === postesVague.length ? 'termine' : 'en_cours',
        avancement: postesVague.length > 0 ? (postesIntegres / postesVague.length) * 100 : 0,
        impact: v.priorite === 'critique' ? 'critique' : v.priorite === 'haute' ? 'majeur' : 'normal',
        budget: postesVague.reduce((sum, p) => sum + (p.salaireMensuel || 0), 0),
      });
    });

    return elements;
  }, [jalons, phasesHandover, vaguesRecrutement, postesARecruter]);

  // Calculer les retards chantier
  const retardChantier = useMemo(() => {
    const elementsChantier = elementsPlanning.filter(e => e.type === 'chantier');
    let maxRetard = 0;
    let elementEnRetard: ElementPlanning | null = null;

    elementsChantier.forEach(e => {
      if (e.statut !== 'termine' && e.statut !== 'atteint') {
        const retard = differenceInDays(new Date(), parseISO(e.dateCible));
        if (retard > maxRetard) {
          maxRetard = retard;
          elementEnRetard = e;
        }
      }
    });

    return { jours: Math.max(0, maxRetard), element: elementEnRetard };
  }, [elementsPlanning]);

  // Détecter les décalages et recommandations
  const decalages = useMemo(() => {
    const result: Decalage[] = [];

    if (retardChantier.jours > 0) {
      // Trouver les éléments de mobilisation qui devraient être décalés
      const elementsMobilisation = elementsPlanning.filter(e => e.type === 'mobilisation');

      elementsMobilisation.forEach(em => {
        const dateCible = parseISO(em.dateCible);
        const aujourdHui = new Date();

        // Si la date cible est dans le futur mais le chantier est en retard
        if (isAfter(dateCible, aujourdHui) && em.avancement < 50) {
          const joursAvantMobilisation = differenceInDays(dateCible, aujourdHui);

          // Si la mobilisation est prévue avant la fin estimée du chantier (avec le retard)
          if (joursAvantMobilisation < retardChantier.jours + 30) {
            result.push({
              element: em,
              joursRetard: retardChantier.jours,
              cause: `Retard chantier de ${retardChantier.jours} jours`,
              elementsImpactes: [em],
              economiesPotentielles: em.budget ? Math.round(em.budget * 0.5) : undefined,
              recommandation: `Décaler de ${retardChantier.jours} jours pour aligner avec le chantier`,
            });
          }
        }
      });
    }

    return result;
  }, [elementsPlanning, retardChantier]);

  // Statistiques
  const stats = useMemo(() => {
    const chantier = elementsPlanning.filter(e => e.type === 'chantier');
    const mobilisation = elementsPlanning.filter(e => e.type === 'mobilisation');

    const avancementChantier = chantier.length > 0
      ? chantier.reduce((sum, e) => sum + e.avancement, 0) / chantier.length
      : 0;

    const avancementMobilisation = mobilisation.length > 0
      ? mobilisation.reduce((sum, e) => sum + e.avancement, 0) / mobilisation.length
      : 0;

    const ecart = avancementMobilisation - avancementChantier;

    return {
      avancementChantier: Math.round(avancementChantier),
      avancementMobilisation: Math.round(avancementMobilisation),
      ecart: Math.round(ecart),
      retardChantier: retardChantier.jours,
      elementsEnAvance: mobilisation.filter(e => e.avancement > avancementChantier + 10).length,
      economiesPotentielles: decalages.reduce((sum, d) => sum + (d.economiesPotentielles || 0), 0),
    };
  }, [elementsPlanning, retardChantier, decalages]);

  // Appliquer un décalage
  const appliquerDecalage = async (decalage: Decalage, jours: number) => {
    try {
      // Mettre à jour les jalons concernés
      for (const element of decalage.elementsImpactes) {
        if (element.id.startsWith('jalon-')) {
          const jalonId = element.id.replace('jalon-', '');
          const nouvelleDate = format(addDays(parseISO(element.dateCible), jours), 'yyyy-MM-dd');
          await updateJalon(jalonId, { dateCible: nouvelleDate });
        }
      }

      addToast({
        type: 'success',
        title: 'Dates ajustées',
        message: `${decalage.elementsImpactes.length} élément(s) décalé(s) de ${jours} jours`,
      });

      setIsModalOpen(false);
      setSelectedDecalage(null);
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  // Rendu des cartes de timeline
  const TimelineCard = ({ element }: { element: ElementPlanning }) => {
    const isEnRetard = element.statut === 'en_retard' ||
      (element.statut !== 'termine' && element.statut !== 'atteint' &&
       differenceInDays(new Date(), parseISO(element.dateCible)) > 0);

    const isTermine = element.statut === 'termine' || element.statut === 'atteint';

    return (
      <div className={`p-3 rounded-lg border ${
        isTermine
          ? 'bg-success/5 border-success/20'
          : isEnRetard
            ? 'bg-error/5 border-error/20'
            : 'bg-white border-primary-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${
                element.categorie === 'Recrutement' ? 'bg-purple-100 text-purple-700' :
                element.categorie === 'Commercial' ? 'bg-blue-100 text-blue-700' :
                element.categorie === 'Marketing' ? 'bg-pink-100 text-pink-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {element.categorie}
              </Badge>
              {element.impact === 'critique' && (
                <AlertCircle className="w-4 h-4 text-error" />
              )}
            </div>
            <p className="font-medium text-primary-900 mt-1 truncate">{element.titre}</p>
            <p className="text-xs text-primary-500 mt-0.5">
              Cible: {format(parseISO(element.dateCible), 'dd MMM yyyy', { locale: fr })}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${
              isTermine ? 'text-success' : isEnRetard ? 'text-error' : 'text-primary-900'
            }`}>
              {element.avancement}%
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-2 h-1.5 bg-primary-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isTermine ? 'bg-success' : isEnRetard ? 'bg-error' : 'bg-accent'
            }`}
            style={{ width: `${element.avancement}%` }}
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-primary-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Synchronisation Chantier / Mobilisation</h1>
          <p className="text-primary-500 mt-1">
            {centre?.nom} - Alignez les plannings pour optimiser les ressources
          </p>
        </div>
        <Button
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={() => loadProjet(centreId || '')}
        >
          Actualiser
        </Button>
      </div>

      {/* Alerte principale si retard */}
      {stats.retardChantier > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-primary-900">
                  Retard chantier détecté : {stats.retardChantier} jours
                </h3>
                <p className="text-primary-600 mt-1">
                  {decalages.length} action(s) de mobilisation pourraient être décalées pour économiser des ressources.
                  {stats.economiesPotentielles > 0 && (
                    <span className="font-medium text-success ml-1">
                      Économies potentielles : {stats.economiesPotentielles.toLocaleString()} FCFA/mois
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (decalages.length > 0) {
                    setSelectedDecalage(decalages[0]);
                    setJoursDecalage(stats.retardChantier);
                    setIsModalOpen(true);
                  }
                }}
              >
                Voir les recommandations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats comparatives */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Hammer className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-900">{stats.avancementChantier}%</div>
                <div className="text-sm text-primary-500">Avancement chantier</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-900">{stats.avancementMobilisation}%</div>
                <div className="text-sm text-primary-500">Avancement mobilisation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                stats.ecart > 10 ? 'bg-warning/10' : stats.ecart < -10 ? 'bg-error/10' : 'bg-success/10'
              }`}>
                <ArrowLeftRight className={`w-5 h-5 ${
                  stats.ecart > 10 ? 'text-warning' : stats.ecart < -10 ? 'text-error' : 'text-success'
                }`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  stats.ecart > 10 ? 'text-warning' : stats.ecart < -10 ? 'text-error' : 'text-success'
                }`}>
                  {stats.ecart > 0 ? '+' : ''}{stats.ecart}%
                </div>
                <div className="text-sm text-primary-500">Écart mob./chantier</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                stats.elementsEnAvance > 0 ? 'bg-warning/10' : 'bg-success/10'
              }`}>
                <Zap className={`w-5 h-5 ${
                  stats.elementsEnAvance > 0 ? 'text-warning' : 'text-success'
                }`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  stats.elementsEnAvance > 0 ? 'text-warning' : 'text-success'
                }`}>
                  {stats.elementsEnAvance}
                </div>
                <div className="text-sm text-primary-500">Mobilisations en avance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualisation comparative */}
      <div className="grid grid-cols-2 gap-6">
        {/* Colonne Chantier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hammer className="w-5 h-5 text-orange-600" />
              Chantier / Travaux
              {stats.retardChantier > 0 && (
                <Badge className="bg-error/10 text-error ml-2">
                  -{stats.retardChantier}j
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {elementsPlanning
              .filter(e => e.type === 'chantier')
              .sort((a, b) => parseISO(a.dateCible).getTime() - parseISO(b.dateCible).getTime())
              .map(element => (
                <TimelineCard key={element.id} element={element} />
              ))}

            {elementsPlanning.filter(e => e.type === 'chantier').length === 0 && (
              <div className="text-center py-8 text-primary-400">
                <Hammer className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucun jalon chantier défini</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Colonne Mobilisation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Mobilisation
              {stats.ecart > 10 && (
                <Badge className="bg-warning/10 text-warning ml-2">
                  En avance
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {elementsPlanning
              .filter(e => e.type === 'mobilisation')
              .sort((a, b) => parseISO(a.dateCible).getTime() - parseISO(b.dateCible).getTime())
              .map(element => {
                const decalage = decalages.find(d => d.element.id === element.id);
                return (
                  <div key={element.id} className="relative">
                    {decalage && (
                      <button
                        onClick={() => {
                          setSelectedDecalage(decalage);
                          setJoursDecalage(decalage.joursRetard);
                          setIsModalOpen(true);
                        }}
                        className="absolute -right-2 -top-2 p-1 bg-warning rounded-full text-white shadow-lg hover:bg-warning/80 transition-colors z-10"
                      >
                        <Lightbulb className="w-4 h-4" />
                      </button>
                    )}
                    <TimelineCard element={element} />
                  </div>
                );
              })}

            {elementsPlanning.filter(e => e.type === 'mobilisation').length === 0 && (
              <div className="text-center py-8 text-primary-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune action de mobilisation définie</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Liste des recommandations */}
      {decalages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-warning" />
              Recommandations de synchronisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {decalages.map((decalage, index) => (
                <div
                  key={index}
                  className="p-4 bg-warning/5 border border-warning/20 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Clock className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium text-primary-900">{decalage.element.titre}</p>
                      <p className="text-sm text-primary-500">{decalage.recommandation}</p>
                      {decalage.economiesPotentielles && (
                        <p className="text-sm text-success font-medium mt-1">
                          <DollarSign className="w-3 h-3 inline" />
                          Économie potentielle: {decalage.economiesPotentielles.toLocaleString()} FCFA/mois
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedDecalage(decalage);
                      setJoursDecalage(decalage.joursRetard);
                      setIsModalOpen(true);
                    }}
                  >
                    Ajuster
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indicateur de bonne synchronisation */}
      {decalages.length === 0 && stats.retardChantier === 0 && (
        <Card className="border-success bg-success/5">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="text-lg font-bold text-primary-900">Plannings synchronisés</h3>
            <p className="text-primary-600 mt-1">
              Le chantier et la mobilisation sont bien alignés. Aucun ajustement nécessaire.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal d'ajustement */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajuster le planning"
        size="md"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => selectedDecalage && appliquerDecalage(selectedDecalage, joursDecalage)}
            >
              Appliquer le décalage
            </Button>
          </div>
        }
      >
        {selectedDecalage && (
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <h4 className="font-medium text-primary-900">{selectedDecalage.element.titre}</h4>
              <p className="text-sm text-primary-500 mt-1">{selectedDecalage.cause}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Décalage en jours
              </label>
              <Input
                type="number"
                value={joursDecalage}
                onChange={(e) => setJoursDecalage(Number(e.target.value))}
                min={0}
                max={365}
              />
            </div>

            <div className="p-4 bg-warning/10 rounded-lg">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="text-sm text-primary-700">
                    <strong>Date actuelle:</strong>{' '}
                    {format(parseISO(selectedDecalage.element.dateCible), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                  <p className="text-sm text-primary-700 mt-1">
                    <strong>Nouvelle date:</strong>{' '}
                    {format(addDays(parseISO(selectedDecalage.element.dateCible), joursDecalage), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            </div>

            {selectedDecalage.economiesPotentielles && (
              <div className="p-4 bg-success/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-success" />
                  <p className="text-sm text-success font-medium">
                    Économie potentielle: {selectedDecalage.economiesPotentielles.toLocaleString()} FCFA/mois
                  </p>
                </div>
                <p className="text-xs text-primary-500 mt-1">
                  En décalant cette action, vous évitez d'engager des dépenses prématurément.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
