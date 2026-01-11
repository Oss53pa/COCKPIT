import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Star,
  TrendingUp,
  Target,
  Award,
  Edit,
  Trash2,
  Check,
  Send,
  FileText,
  Calendar,
  ChevronRight,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
  Badge,
  Modal,
  ConfirmModal,
  Input,
  Select,
  Textarea,
} from '../components/ui';
import { useEvaluationsStore, useAppStore, useCentresStore } from '../store';
import type { Evaluation, CritereEvaluation, Periode } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type StatutEvaluation = 'brouillon' | 'finalise' | 'valide';

const statutLabels: Record<StatutEvaluation, string> = {
  brouillon: 'Brouillon',
  finalise: 'Finalisée',
  valide: 'Validée',
};

const statutColors: Record<StatutEvaluation, string> = {
  brouillon: 'bg-warning/10 text-warning border-warning/20',
  finalise: 'bg-info/10 text-info border-info/20',
  valide: 'bg-success/10 text-success border-success/20',
};

const statutIcons: Record<StatutEvaluation, React.ReactNode> = {
  brouillon: <Clock className="w-4 h-4" />,
  finalise: <Send className="w-4 h-4" />,
  valide: <CheckCircle className="w-4 h-4" />,
};

const noteLabels: Record<number, string> = {
  1: 'Insuffisant',
  2: 'À améliorer',
  3: 'Satisfaisant',
  4: 'Excellent',
};

const noteColors: Record<number, string> = {
  1: 'bg-error text-white',
  2: 'bg-warning text-white',
  3: 'bg-info text-white',
  4: 'bg-success text-white',
};

export function Evaluations() {
  const { centreId } = useParams<{ centreId: string }>();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const { addToast } = useAppStore();
  const {
    evaluations,
    loadEvaluations,
    getEvaluationsByCentre,
    creerAutoEvaluation,
    updateEvaluation,
    deleteEvaluation,
    updateCritere,
    finaliserAutoEvaluation,
    calculerNoteGlobale,
  } = useEvaluationsStore();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHistoriqueModalOpen, setIsHistoriqueModalOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);

  const [newEvalPeriode, setNewEvalPeriode] = useState({
    annee: new Date().getFullYear(),
    semestre: Math.ceil((new Date().getMonth() + 1) / 6),
  });

  const [pointFortInput, setPointFortInput] = useState('');
  const [axeAmeliorationInput, setAxeAmeliorationInput] = useState('');
  const [objectifInput, setObjectifInput] = useState('');

  useEffect(() => {
    if (centreId) {
      loadEvaluations(centreId);
    }
  }, [centreId]);

  const centreEvaluations = getEvaluationsByCentre(centreId || '');
  const evaluationEnCours = centreEvaluations.find((e) => e.statut === 'brouillon');
  const evaluationsFinalisees = centreEvaluations.filter((e) => e.statut !== 'brouillon');

  const handleCreerEvaluation = async () => {
    if (!centreId) return;

    try {
      const periode: Periode = {
        annee: newEvalPeriode.annee,
        semestre: newEvalPeriode.semestre,
      };

      const evaluation = await creerAutoEvaluation(centreId, 'self', periode);
      setSelectedEvaluation(evaluation);
      setIsNewModalOpen(false);
      setIsEvalModalOpen(true);
      addToast({ type: 'success', title: 'Auto-évaluation créée' });
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleOpenEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsEvalModalOpen(true);
  };

  const handleSaveEvaluation = async () => {
    if (!selectedEvaluation) return;

    try {
      await updateEvaluation(selectedEvaluation.id, {
        criteres: selectedEvaluation.criteres,
        pointsForts: selectedEvaluation.pointsForts,
        axesAmelioration: selectedEvaluation.axesAmelioration,
        objectifsProchainePeriode: selectedEvaluation.objectifsProchainePeriode,
        commentaireGeneral: selectedEvaluation.commentaireGeneral,
      });
      addToast({ type: 'success', title: 'Brouillon sauvegardé' });
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleFinaliser = async () => {
    if (!selectedEvaluation) return;

    // Vérifier que tous les critères sont notés
    const tousNotes = selectedEvaluation.criteres.every((c) => c.note !== undefined);
    if (!tousNotes) {
      addToast({ type: 'warning', title: 'Attention', message: 'Veuillez noter tous les critères avant de finaliser.' });
      return;
    }

    try {
      await finaliserAutoEvaluation(selectedEvaluation.id);
      addToast({ type: 'success', title: 'Auto-évaluation finalisée', message: 'Votre évaluation a été envoyée pour validation.' });
      setIsEvalModalOpen(false);
      loadEvaluations(centreId);
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleDelete = async () => {
    if (!selectedEvaluation) return;

    try {
      await deleteEvaluation(selectedEvaluation.id);
      addToast({ type: 'success', title: 'Évaluation supprimée' });
      setIsDeleteModalOpen(false);
      setSelectedEvaluation(null);
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleNoteCritere = (critereId: string, note: number) => {
    if (!selectedEvaluation) return;

    const updatedCriteres = selectedEvaluation.criteres.map((c) =>
      c.id === critereId ? { ...c, note } : c
    );

    setSelectedEvaluation({
      ...selectedEvaluation,
      criteres: updatedCriteres,
      noteGlobale: calculerNoteGlobale(updatedCriteres),
    });
  };

  const handleCommentaireCritere = (critereId: string, commentaire: string) => {
    if (!selectedEvaluation) return;

    const updatedCriteres = selectedEvaluation.criteres.map((c) =>
      c.id === critereId ? { ...c, commentaire } : c
    );

    setSelectedEvaluation({
      ...selectedEvaluation,
      criteres: updatedCriteres,
    });
  };

  const handleAddPointFort = () => {
    if (!selectedEvaluation || !pointFortInput.trim()) return;

    setSelectedEvaluation({
      ...selectedEvaluation,
      pointsForts: [...selectedEvaluation.pointsForts, pointFortInput.trim()],
    });
    setPointFortInput('');
  };

  const handleRemovePointFort = (index: number) => {
    if (!selectedEvaluation) return;

    setSelectedEvaluation({
      ...selectedEvaluation,
      pointsForts: selectedEvaluation.pointsForts.filter((_, i) => i !== index),
    });
  };

  const handleAddAxeAmelioration = () => {
    if (!selectedEvaluation || !axeAmeliorationInput.trim()) return;

    setSelectedEvaluation({
      ...selectedEvaluation,
      axesAmelioration: [...selectedEvaluation.axesAmelioration, axeAmeliorationInput.trim()],
    });
    setAxeAmeliorationInput('');
  };

  const handleRemoveAxeAmelioration = (index: number) => {
    if (!selectedEvaluation) return;

    setSelectedEvaluation({
      ...selectedEvaluation,
      axesAmelioration: selectedEvaluation.axesAmelioration.filter((_, i) => i !== index),
    });
  };

  const handleAddObjectif = () => {
    if (!selectedEvaluation || !objectifInput.trim()) return;

    setSelectedEvaluation({
      ...selectedEvaluation,
      objectifsProchainePeriode: [...selectedEvaluation.objectifsProchainePeriode, objectifInput.trim()],
    });
    setObjectifInput('');
  };

  const handleRemoveObjectif = (index: number) => {
    if (!selectedEvaluation) return;

    setSelectedEvaluation({
      ...selectedEvaluation,
      objectifsProchainePeriode: selectedEvaluation.objectifsProchainePeriode.filter((_, i) => i !== index),
    });
  };

  const getNoteGlobaleColor = (note: number | undefined) => {
    if (note === undefined) return 'text-primary-400';
    if (note >= 3.5) return 'text-success';
    if (note >= 2.5) return 'text-info';
    if (note >= 1.5) return 'text-warning';
    return 'text-error';
  };

  const formatPeriode = (periode: Periode) => {
    if (periode.semestre) {
      return `S${periode.semestre} ${periode.annee}`;
    }
    if (periode.trimestre) {
      return `T${periode.trimestre} ${periode.annee}`;
    }
    if (periode.mois) {
      const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      return `${mois[periode.mois - 1]} ${periode.annee}`;
    }
    return String(periode.annee);
  };

  const semestreOptions = [
    { value: '1', label: '1er semestre (Jan-Juin)' },
    { value: '2', label: '2ème semestre (Juil-Déc)' },
  ];

  const anneeOptions = [
    { value: String(new Date().getFullYear() - 1), label: String(new Date().getFullYear() - 1) },
    { value: String(new Date().getFullYear()), label: String(new Date().getFullYear()) },
    { value: String(new Date().getFullYear() + 1), label: String(new Date().getFullYear() + 1) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Mon Auto-évaluation</h1>
          <p className="text-primary-500 mt-1">{centre?.nom}</p>
        </div>
        <div className="flex items-center gap-3">
          {evaluationsFinalisees.length > 0 && (
            <Button
              variant="secondary"
              leftIcon={<FileText className="w-4 h-4" />}
              onClick={() => setIsHistoriqueModalOpen(true)}
            >
              Historique
            </Button>
          )}
          {!evaluationEnCours && (
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewModalOpen(true)}>
              Nouvelle auto-évaluation
            </Button>
          )}
        </div>
      </div>

      {/* Évaluation en cours */}
      {evaluationEnCours ? (
        <Card className="border-2 border-warning/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning" />
                  Auto-évaluation en cours
                </CardTitle>
                <CardDescription>
                  Période: {formatPeriode(evaluationEnCours.periode)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${statutColors[evaluationEnCours.statut]}`}>
                  {statutLabels[evaluationEnCours.statut]}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-sm text-primary-500">Critères remplis</span>
                  <p className="text-xl font-bold text-primary-900">
                    {evaluationEnCours.criteres.filter((c) => c.note !== undefined).length} / {evaluationEnCours.criteres.length}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-primary-500">Note provisoire</span>
                  <p className={`text-xl font-bold ${getNoteGlobaleColor(evaluationEnCours.noteGlobale)}`}>
                    {evaluationEnCours.noteGlobale !== undefined
                      ? `${evaluationEnCours.noteGlobale.toFixed(2)} / 4`
                      : '—'}
                  </p>
                </div>
              </div>
              <Button
                leftIcon={<Edit className="w-4 h-4" />}
                onClick={() => handleOpenEvaluation(evaluationEnCours)}
              >
                Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-12 h-12 text-primary-300 mx-auto mb-4" />
            <p className="text-primary-500 mb-4">Aucune auto-évaluation en cours</p>
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewModalOpen(true)}>
              Démarrer mon auto-évaluation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dernière évaluation validée */}
      {evaluationsFinalisees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dernière évaluation</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const derniere = evaluationsFinalisees[0];
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm text-primary-500">Période</span>
                        <p className="font-medium">{formatPeriode(derniere.periode)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-primary-500">Note globale</span>
                        <p className={`text-2xl font-bold ${getNoteGlobaleColor(derniere.noteGlobale)}`}>
                          {derniere.noteGlobale?.toFixed(2)} / 4
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-primary-500">Statut</span>
                        <p className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full border ${statutColors[derniere.statut]}`}>
                          {statutIcons[derniere.statut]}
                          {statutLabels[derniere.statut]}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => handleOpenEvaluation(derniere)}
                    >
                      Voir détails
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {/* Résumé des critères */}
                  <div className="grid grid-cols-7 gap-2">
                    {derniere.criteres.map((critere) => (
                      <div
                        key={critere.id}
                        className="text-center p-2 bg-primary-50 rounded-lg"
                        title={critere.nom}
                      >
                        <div className={`text-lg font-bold ${critere.note ? noteColors[critere.note].replace('bg-', 'text-').replace(' text-white', '') : 'text-primary-300'}`}>
                          {critere.note || '—'}
                        </div>
                        <div className="text-xs text-primary-500 truncate">{critere.nom.split(' ')[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Guide d'auto-évaluation */}
      <Card>
        <CardHeader>
          <CardTitle>Guide de notation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((note) => (
              <div key={note} className="text-center p-4 rounded-lg bg-primary-50">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${noteColors[note]} mb-2`}>
                  {note}
                </div>
                <p className="font-medium text-primary-900">{noteLabels[note]}</p>
                <p className="text-xs text-primary-500 mt-1">
                  {note === 1 && 'Objectifs non atteints, difficultés importantes'}
                  {note === 2 && 'Objectifs partiellement atteints, progression nécessaire'}
                  {note === 3 && 'Objectifs atteints, bonne performance'}
                  {note === 4 && 'Objectifs dépassés, performance exceptionnelle'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Nouvelle Évaluation */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Nouvelle auto-évaluation"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsNewModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreerEvaluation}>Démarrer</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-primary-600">
            Sélectionnez la période pour votre auto-évaluation :
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Année"
              options={anneeOptions}
              value={String(newEvalPeriode.annee)}
              onChange={(e) => setNewEvalPeriode({ ...newEvalPeriode, annee: Number(e.target.value) })}
            />
            <Select
              label="Semestre"
              options={semestreOptions}
              value={String(newEvalPeriode.semestre)}
              onChange={(e) => setNewEvalPeriode({ ...newEvalPeriode, semestre: Number(e.target.value) })}
            />
          </div>

          <div className="p-4 bg-info/10 rounded-lg border border-info/20">
            <p className="text-sm text-info">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              L'auto-évaluation vous permet de faire le point sur votre performance.
              Prenez le temps de réfléchir à chaque critère de manière objective.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal Évaluation */}
      <Modal
        isOpen={isEvalModalOpen}
        onClose={() => {
          if (selectedEvaluation?.statut === 'brouillon') {
            handleSaveEvaluation();
          }
          setIsEvalModalOpen(false);
        }}
        title={`Auto-évaluation - ${selectedEvaluation ? formatPeriode(selectedEvaluation.periode) : ''}`}
        size="xl"
        footer={
          selectedEvaluation?.statut === 'brouillon' ? (
            <>
              <Button variant="ghost" onClick={() => setIsEvalModalOpen(false)}>
                Fermer
              </Button>
              <Button variant="secondary" leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveEvaluation}>
                Sauvegarder
              </Button>
              <Button leftIcon={<Send className="w-4 h-4" />} onClick={handleFinaliser}>
                Finaliser
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setIsEvalModalOpen(false)}>
              Fermer
            </Button>
          )
        }
      >
        {selectedEvaluation && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Note globale */}
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div>
                <span className="text-sm text-primary-500">Note globale calculée</span>
                <p className={`text-3xl font-bold ${getNoteGlobaleColor(selectedEvaluation.noteGlobale)}`}>
                  {selectedEvaluation.noteGlobale !== undefined
                    ? `${selectedEvaluation.noteGlobale.toFixed(2)} / 4`
                    : 'En attente'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm text-primary-500">Progression</span>
                <p className="text-lg font-medium text-primary-700">
                  {selectedEvaluation.criteres.filter((c) => c.note !== undefined).length} / {selectedEvaluation.criteres.length} critères
                </p>
              </div>
            </div>

            {/* Critères */}
            <div>
              <h3 className="font-semibold text-primary-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Critères d'évaluation
              </h3>
              <div className="space-y-4">
                {selectedEvaluation.criteres.map((critere) => (
                  <div key={critere.id} className="p-4 bg-white border border-primary-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-medium text-primary-900">{critere.nom}</span>
                        <span className="text-xs text-primary-400 ml-2">({critere.poids}%)</span>
                      </div>
                      {selectedEvaluation.statut === 'brouillon' ? (
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map((note) => (
                            <button
                              key={note}
                              onClick={() => handleNoteCritere(critere.id, note)}
                              className={`w-10 h-10 rounded-lg font-bold transition-all ${
                                critere.note === note
                                  ? noteColors[note]
                                  : 'bg-primary-100 text-primary-400 hover:bg-primary-200'
                              }`}
                            >
                              {note}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className={`px-3 py-1 rounded-lg font-bold ${critere.note ? noteColors[critere.note] : 'bg-primary-100 text-primary-400'}`}>
                          {critere.note ? `${critere.note} - ${noteLabels[critere.note]}` : 'Non noté'}
                        </div>
                      )}
                    </div>
                    {selectedEvaluation.statut === 'brouillon' ? (
                      <Textarea
                        placeholder="Commentaire justificatif (optionnel)..."
                        rows={2}
                        value={critere.commentaire || ''}
                        onChange={(e) => handleCommentaireCritere(critere.id, e.target.value)}
                      />
                    ) : critere.commentaire ? (
                      <p className="text-sm text-primary-600 italic">{critere.commentaire}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Points forts */}
            <div>
              <h3 className="font-semibold text-primary-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Mes points forts
              </h3>
              {selectedEvaluation.statut === 'brouillon' && (
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Ajouter un point fort..."
                    value={pointFortInput}
                    onChange={(e) => setPointFortInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPointFort())}
                  />
                  <Button variant="secondary" onClick={handleAddPointFort}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                {selectedEvaluation.pointsForts.map((point, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-success/5 rounded-lg border border-success/20">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="flex-1 text-sm text-primary-700">{point}</span>
                    {selectedEvaluation.statut === 'brouillon' && (
                      <button onClick={() => handleRemovePointFort(index)} className="text-primary-400 hover:text-error">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {selectedEvaluation.pointsForts.length === 0 && (
                  <p className="text-sm text-primary-400 italic">Aucun point fort ajouté</p>
                )}
              </div>
            </div>

            {/* Axes d'amélioration */}
            <div>
              <h3 className="font-semibold text-primary-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                Mes axes d'amélioration
              </h3>
              {selectedEvaluation.statut === 'brouillon' && (
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Ajouter un axe d'amélioration..."
                    value={axeAmeliorationInput}
                    onChange={(e) => setAxeAmeliorationInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAxeAmelioration())}
                  />
                  <Button variant="secondary" onClick={handleAddAxeAmelioration}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                {selectedEvaluation.axesAmelioration.map((axe, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-warning/5 rounded-lg border border-warning/20">
                    <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
                    <span className="flex-1 text-sm text-primary-700">{axe}</span>
                    {selectedEvaluation.statut === 'brouillon' && (
                      <button onClick={() => handleRemoveAxeAmelioration(index)} className="text-primary-400 hover:text-error">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {selectedEvaluation.axesAmelioration.length === 0 && (
                  <p className="text-sm text-primary-400 italic">Aucun axe d'amélioration ajouté</p>
                )}
              </div>
            </div>

            {/* Objectifs prochaine période */}
            <div>
              <h3 className="font-semibold text-primary-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-info" />
                Mes objectifs pour la prochaine période
              </h3>
              {selectedEvaluation.statut === 'brouillon' && (
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Ajouter un objectif..."
                    value={objectifInput}
                    onChange={(e) => setObjectifInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddObjectif())}
                  />
                  <Button variant="secondary" onClick={handleAddObjectif}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                {selectedEvaluation.objectifsProchainePeriode.map((objectif, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-info/5 rounded-lg border border-info/20">
                    <Target className="w-4 h-4 text-info flex-shrink-0" />
                    <span className="flex-1 text-sm text-primary-700">{objectif}</span>
                    {selectedEvaluation.statut === 'brouillon' && (
                      <button onClick={() => handleRemoveObjectif(index)} className="text-primary-400 hover:text-error">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {selectedEvaluation.objectifsProchainePeriode.length === 0 && (
                  <p className="text-sm text-primary-400 italic">Aucun objectif ajouté</p>
                )}
              </div>
            </div>

            {/* Commentaire général */}
            <div>
              <h3 className="font-semibold text-primary-900 mb-4">Commentaire général</h3>
              {selectedEvaluation.statut === 'brouillon' ? (
                <Textarea
                  rows={4}
                  placeholder="Réflexions globales sur la période, contexte particulier, remarques..."
                  value={selectedEvaluation.commentaireGeneral || ''}
                  onChange={(e) =>
                    setSelectedEvaluation({
                      ...selectedEvaluation,
                      commentaireGeneral: e.target.value,
                    })
                  }
                />
              ) : selectedEvaluation.commentaireGeneral ? (
                <p className="text-sm text-primary-600 p-3 bg-primary-50 rounded-lg">
                  {selectedEvaluation.commentaireGeneral}
                </p>
              ) : (
                <p className="text-sm text-primary-400 italic">Aucun commentaire</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Historique */}
      <Modal
        isOpen={isHistoriqueModalOpen}
        onClose={() => setIsHistoriqueModalOpen(false)}
        title="Historique des évaluations"
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setIsHistoriqueModalOpen(false)}>
            Fermer
          </Button>
        }
      >
        <div className="space-y-3">
          {evaluationsFinalisees.map((evaluation) => (
            <div
              key={evaluation.id}
              className="p-4 bg-primary-50 rounded-lg border border-primary-100 cursor-pointer hover:bg-primary-100 transition-colors"
              onClick={() => {
                setIsHistoriqueModalOpen(false);
                handleOpenEvaluation(evaluation);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="font-medium text-primary-900">{formatPeriode(evaluation.periode)}</span>
                    {evaluation.dateEvaluation && (
                      <p className="text-xs text-primary-500">
                        Finalisée le {format(new Date(evaluation.dateEvaluation), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xl font-bold ${getNoteGlobaleColor(evaluation.noteGlobale)}`}>
                    {evaluation.noteGlobale?.toFixed(2)} / 4
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${statutColors[evaluation.statut]}`}>
                    {statutLabels[evaluation.statut]}
                  </span>
                  <ChevronRight className="w-5 h-5 text-primary-400" />
                </div>
              </div>
            </div>
          ))}
          {evaluationsFinalisees.length === 0 && (
            <p className="text-center text-primary-500 py-8">Aucune évaluation dans l'historique</p>
          )}
        </div>
      </Modal>

      {/* Modal Confirmation Suppression */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer l'évaluation"
        message="Êtes-vous sûr de vouloir supprimer cette auto-évaluation ?"
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
