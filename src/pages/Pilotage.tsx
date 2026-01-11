import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Modal,
  ConfirmModal,
  Input,
  Select,
  Textarea,
  StatutKPIBadge,
} from '../components/ui';
import { useAxesStore, useMesuresStore, useAppStore, useCentresStore } from '../store';
import type { Objectif, AxeStrategique, FrequenceMesure } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Pilotage() {
  const { centreId } = useParams<{ centreId: string }>();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const { addToast } = useAppStore();
  const {
    axes,
    objectifs,
    loadAxes,
    loadObjectifs,
    getAxesByCentre,
    getObjectifsByAxe,
    addObjectif,
    updateObjectif,
    deleteObjectif,
  } = useAxesStore();
  const { mesures, loadMesures, getLastMesure, addMesure, calculerStatut } = useMesuresStore();

  const [expandedAxes, setExpandedAxes] = useState<Set<string>>(new Set());
  const [isObjectifModalOpen, setIsObjectifModalOpen] = useState(false);
  const [isMesureModalOpen, setIsMesureModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAxe, setSelectedAxe] = useState<AxeStrategique | null>(null);
  const [selectedObjectif, setSelectedObjectif] = useState<Objectif | null>(null);

  const [objectifForm, setObjectifForm] = useState({
    code: '',
    intitule: '',
    description: '',
    kpiNom: '',
    cible: '',
    poids: 10,
    frequenceMesure: 'mensuel' as FrequenceMesure,
    seuilVert: 100,
    seuilOrange: 80,
    seuilRouge: 60,
  });

  const [mesureForm, setMesureForm] = useState({
    valeurReelle: 0,
    commentaire: '',
  });

  useEffect(() => {
    if (centreId) {
      loadAxes(centreId);
      loadObjectifs(centreId);
      loadMesures(centreId);
    }
  }, [centreId]);

  const centreAxes = getAxesByCentre(centreId || '');

  const toggleAxe = (axeId: string) => {
    const newExpanded = new Set(expandedAxes);
    if (newExpanded.has(axeId)) {
      newExpanded.delete(axeId);
    } else {
      newExpanded.add(axeId);
    }
    setExpandedAxes(newExpanded);
  };

  const resetObjectifForm = () => {
    setObjectifForm({
      code: '',
      intitule: '',
      description: '',
      kpiNom: '',
      cible: '',
      poids: 10,
      frequenceMesure: 'mensuel',
      seuilVert: 100,
      seuilOrange: 80,
      seuilRouge: 60,
    });
    setSelectedObjectif(null);
    setSelectedAxe(null);
  };

  const handleOpenObjectifModal = (axe: AxeStrategique, objectif?: Objectif) => {
    setSelectedAxe(axe);
    if (objectif) {
      setSelectedObjectif(objectif);
      setObjectifForm({
        code: objectif.code,
        intitule: objectif.intitule,
        description: objectif.description,
        kpiNom: objectif.kpiNom,
        cible: String(objectif.cible),
        poids: objectif.poids,
        frequenceMesure: objectif.frequenceMesure,
        seuilVert: objectif.seuilVert,
        seuilOrange: objectif.seuilOrange,
        seuilRouge: objectif.seuilRouge,
      });
    } else {
      resetObjectifForm();
      // Générer un code automatique
      const axeObjectifs = getObjectifsByAxe(axe.id);
      const nextNum = axeObjectifs.length + 1;
      setObjectifForm((prev) => ({
        ...prev,
        code: `${axe.code.replace('AXE', '')}.${nextNum}`,
      }));
    }
    setIsObjectifModalOpen(true);
  };

  const handleSaveObjectif = async () => {
    if (!selectedAxe || !centreId) return;

    try {
      const objectifData = {
        ...objectifForm,
        axeId: selectedAxe.id,
        centreId,
      };

      if (selectedObjectif) {
        await updateObjectif(selectedObjectif.id, objectifData);
        addToast({ type: 'success', title: 'Objectif modifié' });
      } else {
        await addObjectif(objectifData);
        addToast({ type: 'success', title: 'Objectif créé' });
      }

      setIsObjectifModalOpen(false);
      resetObjectifForm();
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleDeleteObjectif = async () => {
    if (!selectedObjectif) return;

    try {
      await deleteObjectif(selectedObjectif.id);
      addToast({ type: 'success', title: 'Objectif supprimé' });
      setIsDeleteModalOpen(false);
      setSelectedObjectif(null);
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleOpenMesureModal = (objectif: Objectif) => {
    setSelectedObjectif(objectif);
    const lastMesure = getLastMesure(objectif.id);
    setMesureForm({
      valeurReelle: lastMesure?.valeurReelle || 0,
      commentaire: '',
    });
    setIsMesureModalOpen(true);
  };

  const handleSaveMesure = async () => {
    if (!selectedObjectif || !centreId) return;

    try {
      const now = new Date();
      const statut = calculerStatut(
        mesureForm.valeurReelle,
        selectedObjectif.seuilVert,
        selectedObjectif.seuilOrange,
        selectedObjectif.seuilRouge
      );

      await addMesure({
        objectifId: selectedObjectif.id,
        centreId,
        periode: {
          annee: now.getFullYear(),
          mois: now.getMonth() + 1,
        },
        valeurReelle: mesureForm.valeurReelle,
        valeurCible: Number(selectedObjectif.cible),
        ecart: 0,
        ecartPourcentage: 0,
        statut,
        commentaire: mesureForm.commentaire,
        piecesJointes: [],
        dateSaisie: now.toISOString(),
        saisiePar: 'DGA',
      });

      addToast({ type: 'success', title: 'Mesure enregistrée' });
      setIsMesureModalOpen(false);
      setSelectedObjectif(null);
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const frequenceOptions = [
    { value: 'quotidien', label: 'Quotidien' },
    { value: 'hebdomadaire', label: 'Hebdomadaire' },
    { value: 'mensuel', label: 'Mensuel' },
    { value: 'bimestriel', label: 'Bimestriel' },
    { value: 'trimestriel', label: 'Trimestriel' },
    { value: 'semestriel', label: 'Semestriel' },
    { value: 'annuel', label: 'Annuel' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Pilotage stratégique</h1>
          <p className="text-primary-500 mt-1">
            {centre?.nom} — Objectifs et indicateurs de performance
          </p>
        </div>
      </div>

      {/* Liste des axes */}
      <div className="space-y-4">
        {centreAxes.map((axe) => {
          const axeObjectifs = getObjectifsByAxe(axe.id);
          const isExpanded = expandedAxes.has(axe.id);

          // Calcul de la performance de l'axe
          const axeMesures = mesures.filter((m) =>
            axeObjectifs.some((o) => o.id === m.objectifId)
          );
          const mesuresVertes = axeMesures.filter((m) => m.statut === 'vert').length;
          const performance = axeMesures.length > 0
            ? Math.round((mesuresVertes / axeMesures.length) * 100)
            : 0;

          return (
            <Card key={axe.id} className="overflow-hidden">
              {/* Header de l'axe */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary-50 transition-colors"
                onClick={() => toggleAxe(axe.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: axe.couleur }}
                  >
                    {axe.code.replace('AXE', '')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">{axe.nom}</h3>
                    <p className="text-sm text-primary-500">
                      {axeObjectifs.length} objectif(s) — Poids: {axe.poids}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Performance */}
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-primary-200 rounded-full overflow-hidden">
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
                    <span className="text-sm font-medium text-primary-600 w-10">
                      {performance}%
                    </span>
                  </div>

                  {/* Chevron */}
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-primary-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-primary-400" />
                  )}
                </div>
              </div>

              {/* Contenu de l'axe (objectifs) */}
              {isExpanded && (
                <div className="border-t border-primary-200 p-4">
                  {/* Bouton ajouter */}
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenObjectifModal(axe);
                      }}
                    >
                      Ajouter un objectif
                    </Button>
                  </div>

                  {/* Liste des objectifs */}
                  {axeObjectifs.length > 0 ? (
                    <div className="space-y-3">
                      {axeObjectifs.map((objectif) => {
                        const lastMesure = getLastMesure(objectif.id);

                        return (
                          <div
                            key={objectif.id}
                            className="flex items-center justify-between p-4 bg-primary-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono text-primary-500">
                                  {objectif.code}
                                </span>
                                <h4 className="font-medium text-primary-900">
                                  {objectif.intitule}
                                </h4>
                              </div>
                              <p className="text-sm text-primary-500 mt-1">
                                KPI: {objectif.kpiNom} — Cible: {objectif.cible}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              {/* Dernière mesure */}
                              {lastMesure ? (
                                <div className="text-right">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-primary-900">
                                      {lastMesure.valeurReelle}
                                    </span>
                                    <StatutKPIBadge statut={lastMesure.statut} />
                                  </div>
                                  <p className="text-xs text-primary-500">
                                    {format(new Date(lastMesure.dateSaisie), 'dd/MM/yyyy')}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-sm text-primary-400">Non mesuré</span>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenMesureModal(objectif)}
                                >
                                  <TrendingUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenObjectifModal(axe, objectif)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedObjectif(objectif);
                                    setIsDeleteModalOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-error" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-primary-500">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Aucun objectif défini pour cet axe</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {centreAxes.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-primary-500">
                Aucun axe stratégique configuré pour ce centre
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Objectif */}
      <Modal
        isOpen={isObjectifModalOpen}
        onClose={() => {
          setIsObjectifModalOpen(false);
          resetObjectifForm();
        }}
        title={selectedObjectif ? 'Modifier l\'objectif' : 'Nouvel objectif'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsObjectifModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveObjectif}>
              {selectedObjectif ? 'Enregistrer' : 'Créer'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Code"
              value={objectifForm.code}
              onChange={(e) => setObjectifForm({ ...objectifForm, code: e.target.value })}
            />
            <Input
              label="Poids (%)"
              type="number"
              min={1}
              max={100}
              value={objectifForm.poids}
              onChange={(e) => setObjectifForm({ ...objectifForm, poids: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Intitulé"
            value={objectifForm.intitule}
            onChange={(e) => setObjectifForm({ ...objectifForm, intitule: e.target.value })}
          />

          <Textarea
            label="Description"
            rows={2}
            value={objectifForm.description}
            onChange={(e) => setObjectifForm({ ...objectifForm, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nom du KPI"
              value={objectifForm.kpiNom}
              onChange={(e) => setObjectifForm({ ...objectifForm, kpiNom: e.target.value })}
            />
            <Input
              label="Cible"
              value={objectifForm.cible}
              onChange={(e) => setObjectifForm({ ...objectifForm, cible: e.target.value })}
            />
          </div>

          <Select
            label="Fréquence de mesure"
            options={frequenceOptions}
            value={objectifForm.frequenceMesure}
            onChange={(e) => setObjectifForm({ ...objectifForm, frequenceMesure: e.target.value as FrequenceMesure })}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Seuil vert (≥)"
              type="number"
              value={objectifForm.seuilVert}
              onChange={(e) => setObjectifForm({ ...objectifForm, seuilVert: Number(e.target.value) })}
            />
            <Input
              label="Seuil orange (≥)"
              type="number"
              value={objectifForm.seuilOrange}
              onChange={(e) => setObjectifForm({ ...objectifForm, seuilOrange: Number(e.target.value) })}
            />
            <Input
              label="Seuil rouge (<)"
              type="number"
              value={objectifForm.seuilRouge}
              onChange={(e) => setObjectifForm({ ...objectifForm, seuilRouge: Number(e.target.value) })}
            />
          </div>
        </div>
      </Modal>

      {/* Modal Saisie Mesure */}
      <Modal
        isOpen={isMesureModalOpen}
        onClose={() => {
          setIsMesureModalOpen(false);
          setSelectedObjectif(null);
        }}
        title="Saisir une mesure"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsMesureModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveMesure}>Enregistrer</Button>
          </>
        }
      >
        {selectedObjectif && (
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <p className="font-medium text-primary-900">{selectedObjectif.intitule}</p>
              <p className="text-sm text-primary-500 mt-1">
                KPI: {selectedObjectif.kpiNom} — Cible: {selectedObjectif.cible}
              </p>
            </div>

            <Input
              label="Valeur réalisée"
              type="number"
              value={mesureForm.valeurReelle}
              onChange={(e) => setMesureForm({ ...mesureForm, valeurReelle: Number(e.target.value) })}
            />

            <Textarea
              label="Commentaire (optionnel)"
              rows={3}
              value={mesureForm.commentaire}
              onChange={(e) => setMesureForm({ ...mesureForm, commentaire: e.target.value })}
            />
          </div>
        )}
      </Modal>

      {/* Modal Confirmation Suppression */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteObjectif}
        title="Supprimer l'objectif"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedObjectif?.intitule}" ? Cette action supprimera également toutes les mesures associées.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
