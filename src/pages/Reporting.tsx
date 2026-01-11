import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  FileText,
  Calendar,
  Clock,
  User,
  Edit,
  Trash2,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Send,
  Eye,
  History,
  Filter,
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
} from '../components/ui';
import { useLivrablesStore, useAxesStore, useAppStore, useCentresStore } from '../store';
import type { Livrable, VersionLivrable, FrequenceMesure, Periode } from '../types';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

type StatutVersion = 'brouillon' | 'valide' | 'envoye';

const frequenceLabels: Record<FrequenceMesure, string> = {
  quotidien: 'Quotidien',
  hebdomadaire: 'Hebdomadaire',
  mensuel: 'Mensuel',
  bimestriel: 'Bimestriel',
  trimestriel: 'Trimestriel',
  semestriel: 'Semestriel',
  annuel: 'Annuel',
};

const statutVersionLabels: Record<StatutVersion, string> = {
  brouillon: 'Brouillon',
  valide: 'Validé',
  envoye: 'Envoyé',
};

const statutVersionColors: Record<StatutVersion, string> = {
  brouillon: 'bg-primary-100 text-primary-700 border-primary-200',
  valide: 'bg-warning/10 text-warning border-warning/20',
  envoye: 'bg-success/10 text-success border-success/20',
};

export function Reporting() {
  const { centreId } = useParams<{ centreId: string }>();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const { addToast } = useAppStore();
  const { axes, loadAxes, getAxesByCentre } = useAxesStore();
  const {
    livrables,
    loadLivrables,
    getLivrablesByCentre,
    addLivrable,
    updateLivrable,
    deleteLivrable,
    addVersion,
    changerStatutVersion,
    getDerniereVersion,
    getProchaineLivraison,
    isLivrableEnRetard,
  } = useLivrablesStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHistoriqueModalOpen, setIsHistoriqueModalOpen] = useState(false);
  const [selectedLivrable, setSelectedLivrable] = useState<Livrable | null>(null);
  const [expandedAxes, setExpandedAxes] = useState<Set<string>>(new Set());
  const [filterAxe, setFilterAxe] = useState<string>('all');
  const [filterFrequence, setFilterFrequence] = useState<string>('all');

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    axeId: '',
    frequence: 'mensuel' as FrequenceMesure,
    destinataire: '',
    modele: '',
  });

  const [versionFormData, setVersionFormData] = useState({
    periode: {
      annee: new Date().getFullYear(),
      mois: new Date().getMonth() + 1,
    } as Periode,
    commentaires: '',
  });

  useEffect(() => {
    if (centreId) {
      loadAxes(centreId);
      loadLivrables(centreId);
    }
  }, [centreId]);

  const centreAxes = getAxesByCentre(centreId || '');
  const centreLivrables = getLivrablesByCentre(centreId || '');

  // Filtrage des livrables
  const filteredLivrables = centreLivrables.filter((livrable) => {
    if (filterAxe !== 'all' && livrable.axeId !== filterAxe) return false;
    if (filterFrequence !== 'all' && livrable.frequence !== filterFrequence) return false;
    return true;
  });

  // Grouper les livrables par axe
  const livrablesByAxe = centreAxes.reduce((acc, axe) => {
    acc[axe.id] = filteredLivrables.filter((l) => l.axeId === axe.id);
    return acc;
  }, {} as Record<string, Livrable[]>);

  // Livrables sans axe
  const livrablesNonClasses = filteredLivrables.filter((l) => !l.axeId);

  // Stats
  const livrablesEnRetard = filteredLivrables.filter((l) => isLivrableEnRetard(l));
  const livrablesAJour = filteredLivrables.filter((l) => !isLivrableEnRetard(l));

  const toggleAxe = (axeId: string) => {
    const newExpanded = new Set(expandedAxes);
    if (newExpanded.has(axeId)) {
      newExpanded.delete(axeId);
    } else {
      newExpanded.add(axeId);
    }
    setExpandedAxes(newExpanded);
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      axeId: centreAxes[0]?.id || '',
      frequence: 'mensuel',
      destinataire: '',
      modele: '',
    });
    setSelectedLivrable(null);
  };

  const resetVersionForm = () => {
    setVersionFormData({
      periode: {
        annee: new Date().getFullYear(),
        mois: new Date().getMonth() + 1,
      },
      commentaires: '',
    });
  };

  const handleOpenModal = (livrable?: Livrable) => {
    if (livrable) {
      setSelectedLivrable(livrable);
      setFormData({
        titre: livrable.titre,
        description: livrable.description,
        axeId: livrable.axeId,
        frequence: livrable.frequence,
        destinataire: livrable.destinataire,
        modele: livrable.modele || '',
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleOpenVersionModal = (livrable: Livrable) => {
    setSelectedLivrable(livrable);
    resetVersionForm();
    setIsVersionModalOpen(true);
  };

  const handleOpenHistorique = (livrable: Livrable) => {
    setSelectedLivrable(livrable);
    setIsHistoriqueModalOpen(true);
  };

  const handleSave = async () => {
    if (!centreId || !formData.titre || !formData.axeId) return;

    try {
      if (selectedLivrable) {
        await updateLivrable(selectedLivrable.id, formData);
        addToast({ type: 'success', title: 'Livrable modifié' });
      } else {
        await addLivrable({
          ...formData,
          centreId,
          historique: [],
        });
        addToast({ type: 'success', title: 'Livrable créé' });
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleSaveVersion = async () => {
    if (!selectedLivrable) return;

    try {
      await addVersion(selectedLivrable.id, {
        dateCreation: new Date().toISOString(),
        periode: versionFormData.periode,
        fichier: {
          id: crypto.randomUUID(),
          nom: `${selectedLivrable.titre}_${versionFormData.periode.annee}_${versionFormData.periode.mois}.pdf`,
          type: 'application/pdf',
          taille: 0,
          contenu: '',
          dateAjout: new Date().toISOString(),
        },
        statut: 'brouillon',
        commentaires: versionFormData.commentaires,
      });
      addToast({ type: 'success', title: 'Version ajoutée' });
      setIsVersionModalOpen(false);
      resetVersionForm();
      // Recharger les livrables pour voir la mise à jour
      loadLivrables(centreId);
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleDelete = async () => {
    if (!selectedLivrable) return;

    try {
      await deleteLivrable(selectedLivrable.id);
      addToast({ type: 'success', title: 'Livrable supprimé' });
      setIsDeleteModalOpen(false);
      setSelectedLivrable(null);
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleStatutVersionChange = async (livrable: Livrable, versionId: string, newStatut: StatutVersion) => {
    try {
      await changerStatutVersion(livrable.id, versionId, newStatut);
      addToast({ type: 'success', title: 'Statut mis à jour' });
      loadLivrables(centreId);
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

  const axeOptions = centreAxes.map((axe) => ({ value: axe.id, label: axe.nom }));

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

  const LivrableCard = ({ livrable }: { livrable: Livrable }) => {
    const derniereVersion = getDerniereVersion(livrable);
    const prochaineLivraison = getProchaineLivraison(livrable);
    const enRetard = isLivrableEnRetard(livrable);
    const axe = centreAxes.find((a) => a.id === livrable.axeId);

    return (
      <div
        className={`bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
          enRetard ? 'border-error/30 bg-error/5' : 'border-primary-200'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h4 className="font-medium text-primary-900">{livrable.titre}</h4>
            {livrable.description && (
              <p className="text-xs text-primary-500 mt-1 line-clamp-2">{livrable.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleOpenHistorique(livrable)}>
              <History className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(livrable)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedLivrable(livrable);
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash2 className="w-4 h-4 text-error" />
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge>
            <Clock className="w-3 h-3 mr-1" />
            {frequenceLabels[livrable.frequence]}
          </Badge>
          {livrable.destinataire && (
            <Badge>
              <User className="w-3 h-3 mr-1" />
              {livrable.destinataire}
            </Badge>
          )}
        </div>

        {/* Dernière version */}
        <div className="mb-3 p-2 bg-primary-50 rounded-lg">
          <div className="text-xs text-primary-500 mb-1">Dernière version</div>
          {derniereVersion ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {derniereVersion.periode.mois
                  ? `${moisOptions[derniereVersion.periode.mois - 1]?.label} ${derniereVersion.periode.annee}`
                  : derniereVersion.periode.annee}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${statutVersionColors[derniereVersion.statut]}`}>
                {statutVersionLabels[derniereVersion.statut]}
              </span>
            </div>
          ) : (
            <span className="text-sm text-primary-400">Aucune version</span>
          )}
        </div>

        {/* Prochaine livraison */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-400" />
            <span className="text-primary-600">Prochaine:</span>
          </div>
          {prochaineLivraison ? (
            <span className={enRetard ? 'text-error font-medium' : 'text-primary-700'}>
              {format(prochaineLivraison, 'dd/MM/yyyy')}
              {enRetard && (
                <AlertTriangle className="w-4 h-4 inline ml-1 text-error" />
              )}
            </span>
          ) : (
            <span className="text-primary-400">—</span>
          )}
        </div>

        {/* Bouton nouvelle version */}
        <Button
          variant="secondary"
          size="sm"
          className="w-full mt-3"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenVersionModal(livrable)}
        >
          Nouvelle version
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Reporting</h1>
          <p className="text-primary-500 mt-1">{centre?.nom}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtres */}
          <Select
            options={[
              { value: 'all', label: 'Tous les axes' },
              ...axeOptions,
            ]}
            value={filterAxe}
            onChange={(e) => setFilterAxe(e.target.value)}
            className="w-48"
          />
          <Select
            options={[
              { value: 'all', label: 'Toutes fréquences' },
              ...frequenceOptions,
            ]}
            value={filterFrequence}
            onChange={(e) => setFilterFrequence(e.target.value)}
            className="w-44"
          />

          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
            Nouveau livrable
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-900">{filteredLivrables.length}</div>
                <div className="text-sm text-primary-500">Livrables</div>
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
                <div className="text-2xl font-bold text-success">{livrablesAJour.length}</div>
                <div className="text-sm text-primary-500">À jour</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
              <div>
                <div className="text-2xl font-bold text-error">{livrablesEnRetard.length}</div>
                <div className="text-sm text-primary-500">En retard</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <Send className="w-5 h-5 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold text-info">
                  {filteredLivrables.reduce((acc, l) => acc + l.historique.filter((v) => v.statut === 'envoye').length, 0)}
                </div>
                <div className="text-sm text-primary-500">Envoyés</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste par axe */}
      <div className="space-y-4">
        {centreAxes.map((axe) => {
          const axeLivrables = livrablesByAxe[axe.id] || [];
          if (filterAxe !== 'all' && filterAxe !== axe.id) return null;
          if (axeLivrables.length === 0 && filterAxe === 'all') return null;

          const isExpanded = expandedAxes.has(axe.id);

          return (
            <Card key={axe.id}>
              <CardHeader
                className="cursor-pointer hover:bg-primary-50 transition-colors"
                onClick={() => toggleAxe(axe.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-primary-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-primary-400" />
                    )}
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: axe.couleur }}
                    />
                    <CardTitle>{axe.nom}</CardTitle>
                  </div>
                  <Badge>{axeLivrables.length} livrable(s)</Badge>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  {axeLivrables.length === 0 ? (
                    <div className="text-center py-8 text-primary-500">
                      Aucun livrable pour cet axe
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {axeLivrables.map((livrable) => (
                        <LivrableCard key={livrable.id} livrable={livrable} />
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}

        {/* Livrables non classés */}
        {livrablesNonClasses.length > 0 && filterAxe === 'all' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Non classés</CardTitle>
                <Badge>{livrablesNonClasses.length} livrable(s)</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {livrablesNonClasses.map((livrable) => (
                  <LivrableCard key={livrable.id} livrable={livrable} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Message si aucun livrable */}
        {filteredLivrables.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-primary-300 mx-auto mb-4" />
              <p className="text-primary-500">Aucun livrable trouvé</p>
              <Button
                className="mt-4"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => handleOpenModal()}
              >
                Créer un livrable
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Création/Édition Livrable */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedLivrable ? 'Modifier le livrable' : 'Nouveau livrable'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>{selectedLivrable ? 'Enregistrer' : 'Créer'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Titre"
            value={formData.titre}
            onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
            placeholder="Ex: Rapport mensuel de fréquentation"
          />

          <Textarea
            label="Description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description du livrable..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Axe stratégique"
              options={axeOptions}
              value={formData.axeId}
              onChange={(e) => setFormData({ ...formData, axeId: e.target.value })}
            />
            <Select
              label="Fréquence"
              options={frequenceOptions}
              value={formData.frequence}
              onChange={(e) => setFormData({ ...formData, frequence: e.target.value as FrequenceMesure })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Destinataire"
              value={formData.destinataire}
              onChange={(e) => setFormData({ ...formData, destinataire: e.target.value })}
              placeholder="Ex: Direction Générale"
            />
            <Input
              label="Modèle (optionnel)"
              value={formData.modele}
              onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
              placeholder="Lien vers le modèle"
            />
          </div>
        </div>
      </Modal>

      {/* Modal Nouvelle Version */}
      <Modal
        isOpen={isVersionModalOpen}
        onClose={() => {
          setIsVersionModalOpen(false);
          resetVersionForm();
        }}
        title={`Nouvelle version - ${selectedLivrable?.titre}`}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsVersionModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveVersion}>Créer la version</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Année"
              type="number"
              value={versionFormData.periode.annee}
              onChange={(e) =>
                setVersionFormData({
                  ...versionFormData,
                  periode: { ...versionFormData.periode, annee: Number(e.target.value) },
                })
              }
            />
            <Select
              label="Mois"
              options={moisOptions}
              value={String(versionFormData.periode.mois || 1)}
              onChange={(e) =>
                setVersionFormData({
                  ...versionFormData,
                  periode: { ...versionFormData.periode, mois: Number(e.target.value) },
                })
              }
            />
          </div>

          <Textarea
            label="Commentaires (optionnel)"
            rows={3}
            value={versionFormData.commentaires}
            onChange={(e) => setVersionFormData({ ...versionFormData, commentaires: e.target.value })}
            placeholder="Notes sur cette version..."
          />

          <div className="p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-600">
              <strong>Note:</strong> Le fichier pourra être uploadé après la création de la version.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal Historique */}
      <Modal
        isOpen={isHistoriqueModalOpen}
        onClose={() => {
          setIsHistoriqueModalOpen(false);
          setSelectedLivrable(null);
        }}
        title={`Historique - ${selectedLivrable?.titre}`}
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setIsHistoriqueModalOpen(false)}>
            Fermer
          </Button>
        }
      >
        {selectedLivrable && (
          <div className="space-y-4">
            {selectedLivrable.historique.length === 0 ? (
              <div className="text-center py-8 text-primary-500">
                Aucune version disponible
              </div>
            ) : (
              <div className="space-y-3">
                {selectedLivrable.historique
                  .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
                  .map((version) => (
                    <div
                      key={version.id}
                      className="p-4 bg-primary-50 rounded-lg border border-primary-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary-400" />
                          <div>
                            <span className="font-medium text-primary-900">
                              {version.periode.mois
                                ? `${moisOptions[version.periode.mois - 1]?.label} ${version.periode.annee}`
                                : version.periode.annee}
                            </span>
                            <span className="text-xs text-primary-500 ml-2">
                              {format(new Date(version.dateCreation), 'dd/MM/yyyy HH:mm', { locale: fr })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full border ${statutVersionColors[version.statut]}`}>
                            {statutVersionLabels[version.statut]}
                          </span>
                          {version.statut === 'brouillon' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatutVersionChange(selectedLivrable, version.id, 'valide')}
                            >
                              <CheckCircle className="w-4 h-4 text-success" />
                            </Button>
                          )}
                          {version.statut === 'valide' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatutVersionChange(selectedLivrable, version.id, 'envoye')}
                            >
                              <Send className="w-4 h-4 text-info" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {version.commentaires && (
                        <p className="text-sm text-primary-600 mt-2">{version.commentaires}</p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Confirmation Suppression */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le livrable"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedLivrable?.titre}" et tout son historique ?`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
