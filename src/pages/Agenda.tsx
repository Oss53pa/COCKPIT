import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  FileText,
  CheckSquare,
  Edit,
  Trash2,
  X,
  Search,
  GripVertical,
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
import { useReunionsStore, useAppStore, useCentresStore } from '../store';
import type { Reunion, TypeReunion, Decision } from '../types';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';

type StatutReunion = 'planifiee' | 'realisee' | 'annulee' | 'reportee';

const typeReunionLabels: Record<TypeReunion, string> = {
  point_hebdo_cm: 'Point Hebdo CM',
  comite_pilotage: 'Comité de Pilotage',
  revue_mensuelle: 'Revue Mensuelle',
  revue_trimestrielle: 'Revue Trimestrielle',
  revue_strategique: 'Revue Stratégique',
  one_to_one: 'One-to-One',
  autre: 'Autre',
};

const typeReunionBgColors: Record<TypeReunion, string> = {
  point_hebdo_cm: 'bg-emerald-50 border-l-emerald-500',
  comite_pilotage: 'bg-purple-50 border-l-purple-500',
  revue_mensuelle: 'bg-blue-50 border-l-blue-500',
  revue_trimestrielle: 'bg-orange-50 border-l-orange-500',
  revue_strategique: 'bg-red-50 border-l-red-500',
  one_to_one: 'bg-cyan-50 border-l-cyan-500',
  autre: 'bg-gray-50 border-l-gray-400',
};

const typeReunionDotColors: Record<TypeReunion, string> = {
  point_hebdo_cm: 'bg-emerald-500',
  comite_pilotage: 'bg-purple-500',
  revue_mensuelle: 'bg-blue-500',
  revue_trimestrielle: 'bg-orange-500',
  revue_strategique: 'bg-red-500',
  one_to_one: 'bg-cyan-500',
  autre: 'bg-gray-400',
};

const statutLabels: Record<StatutReunion, string> = {
  planifiee: 'Planifiée',
  realisee: 'Réalisée',
  annulee: 'Annulée',
  reportee: 'Reportée',
};

const statutColors: Record<StatutReunion, string> = {
  planifiee: 'bg-info/10 text-info border-info/20',
  realisee: 'bg-success/10 text-success border-success/20',
  annulee: 'bg-error/10 text-error border-error/20',
  reportee: 'bg-warning/10 text-warning border-warning/20',
};

export function Agenda() {
  const { centreId } = useParams<{ centreId: string }>();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const { addToast } = useAppStore();
  const {
    reunions,
    loadReunions,
    getReunionsByCentre,
    addReunion,
    updateReunion,
    deleteReunion,
    changerStatut,
  } = useReunionsStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    titre: '',
    type: 'point_hebdo_cm' as TypeReunion,
    date: format(new Date(), 'yyyy-MM-dd'),
    heure: '09:00',
    duree: 60,
    participants: [] as string[],
    ordreDuJour: [] as string[],
    compteRendu: '',
    statut: 'planifiee' as StatutReunion,
  });

  const [newParticipant, setNewParticipant] = useState('');
  const [newPoint, setNewPoint] = useState('');

  useEffect(() => {
    if (centreId) {
      loadReunions(centreId);
    }
  }, [centreId]);

  const centreReunions = getReunionsByCentre(centreId || '');

  // Filtrage des réunions
  const filteredReunions = centreReunions.filter((reunion) => {
    if (filterType !== 'all' && reunion.type !== filterType) return false;
    if (filterCategory !== 'all' && reunion.statut !== filterCategory) return false;
    if (searchQuery && !reunion.titre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Réunions non planifiées (brouillons ou reportées)
  const unscheduledReunions = centreReunions.filter(
    (r) => r.statut === 'reportee'
  );

  // Calcul du calendrier complet (avec jours des mois adjacents)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Dimanche
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Trouver les réunions pour un jour donné
  const getReunionsForDay = (day: Date) => {
    return filteredReunions.filter((r) => isSameDay(new Date(r.date), day));
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      type: 'point_hebdo_cm',
      date: format(new Date(), 'yyyy-MM-dd'),
      heure: '09:00',
      duree: 60,
      participants: [],
      ordreDuJour: [],
      compteRendu: '',
      statut: 'planifiee',
    });
    setNewParticipant('');
    setNewPoint('');
    setSelectedReunion(null);
  };

  const handleOpenModal = (reunion?: Reunion, date?: Date) => {
    if (reunion) {
      setSelectedReunion(reunion);
      const reunionDate = new Date(reunion.date);
      setFormData({
        titre: reunion.titre,
        type: reunion.type,
        date: format(reunionDate, 'yyyy-MM-dd'),
        heure: format(reunionDate, 'HH:mm'),
        duree: reunion.duree,
        participants: [...reunion.participants],
        ordreDuJour: [...reunion.ordreDuJour],
        compteRendu: reunion.compteRendu || '',
        statut: reunion.statut,
      });
    } else {
      resetForm();
      if (date) {
        setFormData((prev) => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
      }
    }
    setIsModalOpen(true);
  };

  const handleOpenDetail = (reunion: Reunion) => {
    setSelectedReunion(reunion);
    setIsDetailModalOpen(true);
  };

  const handleSave = async () => {
    if (!centreId || !formData.titre) return;

    try {
      const dateTime = new Date(`${formData.date}T${formData.heure}`);

      const reunionData = {
        centreId,
        titre: formData.titre,
        type: formData.type,
        date: dateTime.toISOString(),
        duree: formData.duree,
        participants: formData.participants,
        ordreDuJour: formData.ordreDuJour,
        compteRendu: formData.compteRendu || undefined,
        decisions: selectedReunion?.decisions || [],
        actionsCreees: selectedReunion?.actionsCreees || [],
        statut: formData.statut,
      };

      if (selectedReunion) {
        await updateReunion(selectedReunion.id, reunionData);
        addToast({ type: 'success', title: 'Réunion modifiée' });
      } else {
        await addReunion(reunionData);
        addToast({ type: 'success', title: 'Réunion créée' });
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleDelete = async () => {
    if (!selectedReunion) return;

    try {
      await deleteReunion(selectedReunion.id);
      addToast({ type: 'success', title: 'Réunion supprimée' });
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false);
      setSelectedReunion(null);
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleAddParticipant = () => {
    if (newParticipant.trim() && !formData.participants.includes(newParticipant.trim())) {
      setFormData({
        ...formData,
        participants: [...formData.participants, newParticipant.trim()],
      });
      setNewParticipant('');
    }
  };

  const handleRemoveParticipant = (participant: string) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((p) => p !== participant),
    });
  };

  const handleAddPoint = () => {
    if (newPoint.trim()) {
      setFormData({
        ...formData,
        ordreDuJour: [...formData.ordreDuJour, newPoint.trim()],
      });
      setNewPoint('');
    }
  };

  const handleRemovePoint = (index: number) => {
    setFormData({
      ...formData,
      ordreDuJour: formData.ordreDuJour.filter((_, i) => i !== index),
    });
  };

  const handleStatutChange = async (reunion: Reunion, newStatut: StatutReunion) => {
    try {
      await changerStatut(reunion.id, newStatut);
      addToast({ type: 'success', title: 'Statut mis à jour' });
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const typeOptions = [
    { value: 'point_hebdo_cm', label: 'Point Hebdo CM' },
    { value: 'comite_pilotage', label: 'Comité de Pilotage' },
    { value: 'revue_mensuelle', label: 'Revue Mensuelle' },
    { value: 'revue_trimestrielle', label: 'Revue Trimestrielle' },
    { value: 'revue_strategique', label: 'Revue Stratégique' },
    { value: 'one_to_one', label: 'One-to-One' },
    { value: 'autre', label: 'Autre' },
  ];

  const statutOptions = [
    { value: 'planifiee', label: 'Planifiée' },
    { value: 'realisee', label: 'Réalisée' },
    { value: 'reportee', label: 'Reportée' },
    { value: 'annulee', label: 'Annulée' },
  ];

  const dureeOptions = [
    { value: '30', label: '30 min' },
    { value: '60', label: '1h' },
    { value: '90', label: '1h30' },
    { value: '120', label: '2h' },
    { value: '180', label: '3h' },
    { value: '240', label: '4h' },
  ];

  // Jours de la semaine
  const weekDays = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];

  return (
    <div className="flex gap-6 h-[calc(100vh-180px)]">
      {/* Calendrier principal */}
      <div className="flex-1 flex flex-col">
        {/* Header avec filtres */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Select
              options={[
                { value: 'all', label: 'Tous les types' },
                ...typeOptions,
              ]}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-44"
            />
            <Select
              options={[
                { value: 'all', label: 'Tous les statuts' },
                ...statutOptions,
              ]}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-40"
            />
          </div>

          {/* Navigation mois */}
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-primary-900 capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-primary-600" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 text-sm font-medium bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-primary-600" />
              </button>
            </div>
          </div>

          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-48"
            />
          </div>
        </div>

        {/* Grille du calendrier */}
        <div className="flex-1 bg-white rounded-xl border border-primary-200 overflow-hidden">
          {/* En-têtes des jours */}
          <div className="grid grid-cols-7 border-b border-primary-200">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`py-3 text-center text-xs font-semibold tracking-wider ${
                  index === 0 || index === 6 ? 'text-primary-400' : 'text-primary-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows: '1fr' }}>
            {calendarDays.map((day, index) => {
              const dayReunions = getReunionsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);
              const isHovered = hoveredDay && isSameDay(day, hoveredDay);
              const maxVisibleEvents = 3;

              return (
                <div
                  key={day.toISOString()}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`min-h-[120px] border-b border-r border-primary-100 p-1 relative ${
                    !isCurrentMonth ? 'bg-primary-50/50' : 'bg-white'
                  } ${index % 7 === 0 ? 'border-l-0' : ''}`}
                >
                  {/* Header du jour */}
                  <div className="flex items-center justify-between mb-1 px-1">
                    <span
                      className={`text-sm font-medium ${
                        isTodayDate
                          ? 'bg-primary-900 text-white w-7 h-7 rounded-full flex items-center justify-center'
                          : !isCurrentMonth
                          ? 'text-primary-300'
                          : 'text-primary-700'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {isHovered && isCurrentMonth && (
                      <button
                        onClick={() => handleOpenModal(undefined, day)}
                        className="text-xs text-primary-400 hover:text-primary-600 transition-colors"
                      >
                        + Ajouter
                      </button>
                    )}
                  </div>

                  {/* Événements */}
                  <div className="space-y-1">
                    {dayReunions.slice(0, maxVisibleEvents).map((reunion) => (
                      <div
                        key={reunion.id}
                        onClick={() => handleOpenDetail(reunion)}
                        className={`px-2 py-1 text-xs rounded cursor-pointer border-l-[3px] hover:opacity-80 transition-opacity ${typeReunionBgColors[reunion.type]}`}
                      >
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${typeReunionDotColors[reunion.type]}`} />
                          <span className="text-primary-600 font-medium">
                            {format(new Date(reunion.date), 'HH:mm')}
                          </span>
                        </div>
                        <div className="text-primary-800 truncate font-medium">
                          {reunion.titre}
                        </div>
                      </div>
                    ))}
                    {dayReunions.length > maxVisibleEvents && (
                      <button
                        onClick={() => {
                          // Afficher toutes les réunions du jour
                        }}
                        className="text-xs text-primary-500 hover:text-primary-700 pl-2"
                      >
                        Voir {dayReunions.length - maxVisibleEvents} de plus
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panneau latéral - Réunions non planifiées */}
      <div className="w-72 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-primary-900">Réunions reportées</h3>
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenModal()}
          >
            Nouvelle
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-primary-200 flex-1 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-primary-100">
            <Select
              options={typeOptions}
              value={filterType === 'all' ? '' : filterType}
              onChange={(e) => setFilterType(e.target.value || 'all')}
              className="w-full"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {unscheduledReunions.length === 0 ? (
              <div className="text-center py-8 text-primary-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune réunion reportée</p>
              </div>
            ) : (
              unscheduledReunions.map((reunion) => (
                <div
                  key={reunion.id}
                  onClick={() => handleOpenDetail(reunion)}
                  className={`p-3 rounded-lg border-l-[3px] cursor-pointer hover:shadow-md transition-shadow ${typeReunionBgColors[reunion.type]}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${typeReunionDotColors[reunion.type]}`} />
                    <span className="text-xs text-primary-500">
                      {format(new Date(reunion.date), 'HH:mm')}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-primary-800 line-clamp-2">
                    {reunion.titre}
                  </div>
                  {reunion.ordreDuJour.length > 0 && (
                    <div className="mt-1 text-xs text-primary-500">
                      {reunion.ordreDuJour.length} point(s) à l'ordre du jour
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-primary-100">
            <button
              onClick={() => handleOpenModal()}
              className="w-full py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
            >
              + Ajouter une réunion
            </button>
          </div>
        </div>
      </div>

      {/* Modal Création/Édition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedReunion ? 'Modifier la réunion' : 'Nouvelle réunion'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>{selectedReunion ? 'Enregistrer' : 'Créer'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Titre"
            value={formData.titre}
            onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
            placeholder="Ex: Point hebdomadaire avec l'équipe"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type de réunion"
              options={typeOptions}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as TypeReunion })}
            />
            <Select
              label="Statut"
              options={statutOptions}
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value as StatutReunion })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Input
              label="Heure"
              type="time"
              value={formData.heure}
              onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
            />
            <Select
              label="Durée"
              options={dureeOptions}
              value={String(formData.duree)}
              onChange={(e) => setFormData({ ...formData, duree: Number(e.target.value) })}
            />
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-primary-600 mb-2">Participants</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                placeholder="Nom du participant"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddParticipant();
                  }
                }}
              />
              <Button variant="secondary" onClick={handleAddParticipant}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.participants.map((participant, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  {participant}
                  <button
                    onClick={() => handleRemoveParticipant(participant)}
                    className="hover:text-error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Ordre du jour */}
          <div>
            <label className="block text-sm font-medium text-primary-600 mb-2">Ordre du jour</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newPoint}
                onChange={(e) => setNewPoint(e.target.value)}
                placeholder="Ajouter un point"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPoint();
                  }
                }}
              />
              <Button variant="secondary" onClick={handleAddPoint}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {formData.ordreDuJour.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-primary-50 rounded"
                >
                  <span className="text-sm">
                    {index + 1}. {point}
                  </span>
                  <button
                    onClick={() => handleRemovePoint(index)}
                    className="text-primary-400 hover:text-error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Compte-rendu (uniquement en édition) */}
          {selectedReunion && (
            <Textarea
              label="Compte-rendu"
              rows={4}
              value={formData.compteRendu}
              onChange={(e) => setFormData({ ...formData, compteRendu: e.target.value })}
              placeholder="Résumé de la réunion..."
            />
          )}
        </div>
      </Modal>

      {/* Modal Détail */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedReunion(null);
        }}
        title={selectedReunion?.titre || ''}
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDetailModalOpen(false);
                setSelectedReunion(null);
              }}
            >
              Fermer
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDetailModalOpen(false);
                if (selectedReunion) handleOpenModal(selectedReunion);
              }}
            >
              Modifier
            </Button>
            {selectedReunion?.statut === 'planifiee' && (
              <Button
                onClick={() => {
                  if (selectedReunion) {
                    handleStatutChange(selectedReunion, 'realisee');
                    setIsDetailModalOpen(false);
                  }
                }}
              >
                Marquer comme réalisée
              </Button>
            )}
          </>
        }
      >
        {selectedReunion && (
          <div className="space-y-6">
            {/* Infos générales */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-primary-500">Type</span>
                <div className={`mt-1 inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${typeReunionBgColors[selectedReunion.type]} border-l-[3px]`}>
                  <span className={`w-2 h-2 rounded-full ${typeReunionDotColors[selectedReunion.type]}`} />
                  {typeReunionLabels[selectedReunion.type]}
                </div>
              </div>
              <div>
                <span className="text-sm text-primary-500">Statut</span>
                <p className={`mt-1 inline-block text-sm px-2 py-1 rounded-full border ${statutColors[selectedReunion.statut]}`}>
                  {statutLabels[selectedReunion.statut]}
                </p>
              </div>
              <div>
                <span className="text-sm text-primary-500">Date & Heure</span>
                <p className="mt-1 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-400" />
                  {format(new Date(selectedReunion.date), 'EEEE dd MMMM yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
              <div>
                <span className="text-sm text-primary-500">Durée</span>
                <p className="mt-1 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-400" />
                  {selectedReunion.duree} minutes
                </p>
              </div>
            </div>

            {/* Participants */}
            {selectedReunion.participants.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-primary-500 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participants ({selectedReunion.participants.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedReunion.participants.map((participant, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {participant}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ordre du jour */}
            {selectedReunion.ordreDuJour.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-primary-500 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Ordre du jour
                </h4>
                <ol className="list-decimal list-inside space-y-1">
                  {selectedReunion.ordreDuJour.map((point, index) => (
                    <li key={index} className="text-sm text-primary-700">
                      {point}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Compte-rendu */}
            {selectedReunion.compteRendu && (
              <div>
                <h4 className="text-sm font-medium text-primary-500 mb-2">Compte-rendu</h4>
                <div className="p-3 bg-primary-50 rounded-lg text-sm text-primary-700 whitespace-pre-wrap">
                  {selectedReunion.compteRendu}
                </div>
              </div>
            )}

            {/* Décisions */}
            {selectedReunion.decisions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-primary-500 mb-2 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Décisions ({selectedReunion.decisions.length})
                </h4>
                <div className="space-y-2">
                  {selectedReunion.decisions.map((decision) => (
                    <div
                      key={decision.id}
                      className="p-3 bg-primary-50 rounded-lg border border-primary-100"
                    >
                      <p className="text-sm text-primary-700">{decision.description}</p>
                      {decision.echeance && (
                        <p className="text-xs text-primary-500 mt-1">
                          Échéance: {format(new Date(decision.echeance), 'dd/MM/yyyy')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
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
        title="Supprimer la réunion"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedReunion?.titre}" ?`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
