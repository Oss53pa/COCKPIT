import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Building2,
  MapPin,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Rocket,
  Target,
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
import { useCentresStore, useAxesStore, useAppStore } from '../store';
import type { CentreCommercial } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Centres() {
  const navigate = useNavigate();
  const { centres, loadCentres, addCentre, updateCentre, deleteCentre } = useCentresStore();
  const { initializeDefaultAxes } = useAxesStore();
  const { setCurrentCentre, addToast } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<CentreCommercial | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    adresse: '',
    ville: '',
    dateOuverture: '',
    surfaceTotale: 0,
    surfaceLocative: 0,
    nombreNiveaux: 1,
    nombreLocaux: 0,
    statut: 'actif' as 'actif' | 'en_construction' | 'inactif',
    modeExploitationActif: true,
    couleurTheme: '#171717',
  });

  useEffect(() => {
    loadCentres();
  }, []);

  const resetForm = () => {
    setFormData({
      code: '',
      nom: '',
      adresse: '',
      ville: '',
      dateOuverture: '',
      surfaceTotale: 0,
      surfaceLocative: 0,
      nombreNiveaux: 1,
      nombreLocaux: 0,
      statut: 'actif',
      modeExploitationActif: true,
      couleurTheme: '#171717',
    });
    setSelectedCentre(null);
  };

  const handleOpenModal = (centre?: CentreCommercial) => {
    if (centre) {
      setSelectedCentre(centre);
      setFormData({
        code: centre.code,
        nom: centre.nom,
        adresse: centre.adresse,
        ville: centre.ville,
        dateOuverture: centre.dateOuverture,
        surfaceTotale: centre.surfaceTotale,
        surfaceLocative: centre.surfaceLocative,
        nombreNiveaux: centre.nombreNiveaux,
        nombreLocaux: centre.nombreLocaux,
        statut: centre.statut,
        modeExploitationActif: centre.modeExploitationActif ?? centre.statut === 'actif',
        couleurTheme: centre.couleurTheme,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
    setMenuOpenId(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedCentre) {
        await updateCentre(selectedCentre.id, formData);
        addToast({ type: 'success', title: 'Centre modifié avec succès' });
      } else {
        const newCentre = await addCentre({
          ...formData,
          configuration: {
            deviseMonetaire: 'XOF',
            exerciceFiscal: { debut: 1, fin: 12 },
            objectifsAnnee: new Date().getFullYear(),
            seuilsAlerte: {
              kpiRouge: 70,
              kpiOrange: 90,
              retardAction: 3,
              rappelSaisie: 5,
            },
          },
        });
        // Initialiser les axes par défaut pour le nouveau centre
        await initializeDefaultAxes(newCentre.id);
        addToast({ type: 'success', title: 'Centre créé avec succès' });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleDelete = async () => {
    if (selectedCentre) {
      try {
        await deleteCentre(selectedCentre.id);
        addToast({ type: 'success', title: 'Centre supprimé' });
        setIsDeleteModalOpen(false);
        setSelectedCentre(null);
      } catch (error) {
        addToast({ type: 'error', title: 'Erreur de suppression', message: String(error) });
      }
    }
  };

  const handleViewCentre = (centre: CentreCommercial) => {
    setCurrentCentre(centre.id);
    navigate(`/centre/${centre.id}`);
    setMenuOpenId(null);
  };

  const statutOptions = [
    { value: 'en_construction', label: 'En construction' },
    { value: 'actif', label: 'En exploitation' },
    { value: 'inactif', label: 'Inactif' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Centres commerciaux</h1>
          <p className="text-primary-500 mt-1">Gérez vos centres commerciaux</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
          Nouveau centre
        </Button>
      </div>

      {/* Liste des centres */}
      {centres.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 text-primary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary-900 mb-2">
              Aucun centre enregistré
            </h3>
            <p className="text-primary-500 mb-4">
              Créez votre premier centre commercial pour commencer
            </p>
            <Button onClick={() => handleOpenModal()}>
              Créer un centre
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centres.map((centre) => (
            <Card key={centre.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: centre.couleurTheme }}
                    >
                      {centre.code.substring(0, 2)}
                    </div>
                    <div>
                      <CardTitle>{centre.nom}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-primary-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        {centre.ville}
                      </div>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === centre.id ? null : centre.id)}
                      className="p-1 hover:bg-primary-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-primary-500" />
                    </button>

                    {menuOpenId === centre.id && (
                      <div className="absolute right-0 top-8 bg-white border border-primary-200 rounded-lg shadow-lg z-10 py-1 min-w-[150px]">
                        <button
                          onClick={() => handleViewCentre(centre)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </button>
                        <button
                          onClick={() => handleOpenModal(centre)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCentre(centre);
                            setIsDeleteModalOpen(true);
                            setMenuOpenId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 flex items-center gap-2 text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Statut */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-500">Statut</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          centre.statut === 'actif'
                            ? 'success'
                            : centre.statut === 'en_construction'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {centre.statut === 'actif'
                          ? 'En exploitation'
                          : centre.statut === 'en_construction'
                          ? 'En construction'
                          : 'Inactif'}
                      </Badge>
                      {/* Badge période transitoire - en construction avec mode exploitation */}
                      {centre.statut === 'en_construction' && centre.modeExploitationActif && (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Transition
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-primary-500">Surface GLA</p>
                      <p className="font-semibold text-primary-900">
                        {centre.surfaceLocative.toLocaleString()} m²
                      </p>
                    </div>
                    <div>
                      <p className="text-primary-500">Locaux</p>
                      <p className="font-semibold text-primary-900">{centre.nombreLocaux}</p>
                    </div>
                  </div>

                  {/* Date d'ouverture */}
                  {centre.dateOuverture && (
                    <div className="flex items-center gap-2 text-sm text-primary-500">
                      <Calendar className="w-4 h-4" />
                      Ouvert depuis {format(new Date(centre.dateOuverture), 'MMMM yyyy', { locale: fr })}
                    </div>
                  )}

                  {/* Action */}
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleViewCentre(centre)}
                  >
                    Accéder au centre
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Création/Édition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedCentre ? 'Modifier le centre' : 'Nouveau centre'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              {selectedCentre ? 'Enregistrer' : 'Créer'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Code"
              placeholder="Ex: CYP"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
            <Input
              label="Nom"
              placeholder="Nom du centre"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            />
          </div>

          <Input
            label="Adresse"
            placeholder="Adresse complète"
            value={formData.adresse}
            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ville"
              placeholder="Ville"
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
            />
            <Input
              label="Date d'ouverture"
              type="date"
              value={formData.dateOuverture}
              onChange={(e) => setFormData({ ...formData, dateOuverture: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Surface totale (m²)"
              type="number"
              value={formData.surfaceTotale}
              onChange={(e) => setFormData({ ...formData, surfaceTotale: Number(e.target.value) })}
            />
            <Input
              label="Surface locative GLA (m²)"
              type="number"
              value={formData.surfaceLocative}
              onChange={(e) => setFormData({ ...formData, surfaceLocative: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Nombre de niveaux"
              type="number"
              min={1}
              value={formData.nombreNiveaux}
              onChange={(e) => setFormData({ ...formData, nombreNiveaux: Number(e.target.value) })}
            />
            <Input
              label="Nombre de locaux"
              type="number"
              value={formData.nombreLocaux}
              onChange={(e) => setFormData({ ...formData, nombreLocaux: Number(e.target.value) })}
            />
            <Select
              label="Statut"
              options={statutOptions}
              value={formData.statut}
              onChange={(e) => {
                const newStatut = e.target.value as 'actif' | 'en_construction' | 'inactif';
                setFormData({
                  ...formData,
                  statut: newStatut,
                  // Activer automatiquement le mode exploitation si actif
                  modeExploitationActif: newStatut === 'actif' ? true : formData.modeExploitationActif,
                });
              }}
            />
          </div>

          {/* Option Mode Exploitation - visible si statut en_construction (période transitoire) */}
          {formData.statut === 'en_construction' && (
            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.modeExploitationActif}
                  onChange={(e) => setFormData({ ...formData, modeExploitationActif: e.target.checked })}
                  className="w-5 h-5 rounded border-primary-300 text-success focus:ring-success"
                />
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-success" />
                  <div>
                    <span className="font-medium text-primary-900">Activer le mode exploitation</span>
                    <p className="text-xs text-primary-500 mt-0.5">
                      Permet d'accéder aux modules d'exploitation en parallèle du mode projet (période de transition)
                    </p>
                  </div>
                </div>
              </label>
            </div>
          )}

          {formData.statut === 'actif' && (
            <div className="p-3 bg-success/10 rounded-lg border border-success/20 flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-success" />
              <span className="text-primary-700">Le mode exploitation est automatiquement activé pour les centres actifs</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-primary-600 mb-1">
              Couleur du thème
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.couleurTheme}
                onChange={(e) => setFormData({ ...formData, couleurTheme: e.target.value })}
                className="w-10 h-10 rounded-lg border border-primary-200 cursor-pointer"
              />
              <span className="text-sm text-primary-500">{formData.couleurTheme}</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Confirmation Suppression */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le centre"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedCentre?.nom}" ? Cette action supprimera également tous les objectifs, mesures et actions associés.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
