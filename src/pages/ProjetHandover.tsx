import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  FolderOpen,
  List,
  LayoutGrid,
  Plus,
  Search,
  X,
  Camera,
  Download,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useProjetStore, useAppStore } from '../store';
import type { Reserve, DocumentDOE } from '../types';

type ViewMode = 'reserves' | 'doe';
type ReserveFilter = 'all' | 'bloquante' | 'majeure' | 'mineure';
type StatutFilter = 'all' | 'ouverte' | 'en_cours' | 'levee' | 'contestee';

export function ProjetHandover() {
  const { centreId } = useParams<{ centreId: string }>();
  const { setCurrentCentre, addToast } = useAppStore();
  const {
    projets,
    reserves,
    documentsDOE,
    loadProjet,
    loadDOE,
    addReserve,
    updateReserve,
    addDocumentDOE,
    updateDocumentDOE,
  } = useProjetStore();

  const [viewMode, setViewMode] = useState<ViewMode>('doe');
  const [reserveFilter, setReserveFilter] = useState<ReserveFilter>('all');
  const [statutFilter, setStatutFilter] = useState<StatutFilter>('all');
  const [lotFilter, setLotFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDOEModal, setShowDOEModal] = useState(false);
  const [selectedReserve, setSelectedReserve] = useState<Reserve | null>(null);
  const [selectedDOE, setSelectedDOE] = useState<DocumentDOE | null>(null);
  const [reserveFromDOE, setReserveFromDOE] = useState<DocumentDOE | null>(null);

  useEffect(() => {
    if (centreId) {
      setCurrentCentre(centreId);
      loadProjet(centreId);
    }
  }, [centreId, setCurrentCentre, loadProjet]);

  const projet = projets.find((p) => p.centreId === centreId);

  useEffect(() => {
    if (projet) {
      loadDOE(projet.id);
    }
  }, [projet, loadDOE]);

  // Lots uniques
  const lots = [...new Set(reserves.map((r) => r.lot))].sort();
  const lotsDoc = [...new Set(documentsDOE.map((d) => d.lot))].sort();

  // Filtrage réserves
  const filteredReserves = reserves.filter((reserve) => {
    if (reserveFilter !== 'all' && reserve.classification !== reserveFilter) return false;
    if (statutFilter !== 'all' && reserve.statut !== statutFilter) return false;
    if (lotFilter !== 'all' && reserve.lot !== lotFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        reserve.numero.toLowerCase().includes(term) ||
        reserve.description.toLowerCase().includes(term) ||
        reserve.localisation.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Filtrage DOE
  const filteredDOE = documentsDOE.filter((doc) => {
    if (lotFilter !== 'all' && doc.lot !== lotFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        doc.description.toLowerCase().includes(term) ||
        doc.type.toLowerCase().includes(term) ||
        doc.lot.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Statistiques
  const stats = {
    totalReserves: reserves.length,
    bloquantes: reserves.filter((r) => r.classification === 'bloquante' && r.statut !== 'levee').length,
    majeures: reserves.filter((r) => r.classification === 'majeure' && r.statut !== 'levee').length,
    mineures: reserves.filter((r) => r.classification === 'mineure' && r.statut !== 'levee').length,
    levees: reserves.filter((r) => r.statut === 'levee').length,
    enRetard: reserves.filter((r) => {
      if (r.statut === 'levee') return false;
      return differenceInDays(new Date(), parseISO(r.dateLimite)) > 0;
    }).length,
    docsTotal: documentsDOE.length,
    docsRecus: documentsDOE.filter((d) => d.recu).length,
    docsVerifies: documentsDOE.filter((d) => d.verifie).length,
    docsConformes: documentsDOE.filter((d) => d.conforme).length,
    docsManquants: documentsDOE.filter((d) => d.obligatoire && !d.recu).length,
  };

  const getClassificationColor = (classification: Reserve['classification']) => {
    switch (classification) {
      case 'bloquante':
        return 'bg-error/10 text-error border-error/20';
      case 'majeure':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'mineure':
        return 'bg-info/10 text-info border-info/20';
    }
  };

  const getStatutBadge = (statut: Reserve['statut']) => {
    switch (statut) {
      case 'ouverte':
        return 'bg-error/10 text-error';
      case 'en_cours':
        return 'bg-warning/10 text-warning';
      case 'levee':
        return 'bg-success/10 text-success';
      case 'contestee':
        return 'bg-purple-100 text-purple-700';
    }
  };

  const getStatutLabel = (statut: Reserve['statut']) => {
    switch (statut) {
      case 'ouverte':
        return 'Ouverte';
      case 'en_cours':
        return 'En cours';
      case 'levee':
        return 'Levée';
      case 'contestee':
        return 'Contestée';
    }
  };

  // Modal Réserve
  const ReserveModal = () => {
    const [formData, setFormData] = useState<Partial<Reserve>>(
      selectedReserve || {
        numero: `R-${String(reserves.length + 1).padStart(3, '0')}`,
        lot: reserveFromDOE?.lot || '',
        localisation: '',
        description: reserveFromDOE ? `Non-conformité sur: ${reserveFromDOE.description}` : '',
        classification: 'mineure',
        dateIdentification: format(new Date(), 'yyyy-MM-dd'),
        dateLimite: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        responsableEntreprise: '',
        statut: 'ouverte',
        photos: [],
        documentDOEId: reserveFromDOE?.id,
      }
    );

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!projet) return;

      try {
        if (selectedReserve) {
          await updateReserve(selectedReserve.id, formData);
          addToast({ type: 'success', title: 'Réserve mise à jour' });
        } else {
          await addReserve({
            ...formData,
            projetId: projet.id,
          } as Omit<Reserve, 'id' | 'createdAt' | 'updatedAt'>);
          addToast({ type: 'success', title: 'Réserve créée' });
        }
        setShowAddModal(false);
        setSelectedReserve(null);
        setReserveFromDOE(null);
      } catch {
        addToast({ type: 'error', title: 'Erreur lors de la sauvegarde' });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-primary-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-primary-900">
              {selectedReserve ? 'Modifier la réserve' : 'Nouvelle réserve'}
            </h2>
            <button
              onClick={() => {
                setShowAddModal(false);
                setSelectedReserve(null);
                setReserveFromDOE(null);
              }}
              className="p-2 hover:bg-primary-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Numéro
                </label>
                <input
                  type="text"
                  value={formData.numero || ''}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Lot
                </label>
                <input
                  type="text"
                  value={formData.lot || ''}
                  onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                  placeholder="ex: Électricité, Plomberie..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Localisation
              </label>
              <input
                type="text"
                value={formData.localisation || ''}
                onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                placeholder="ex: RDC - Zone A - Local 12"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Classification
                </label>
                <select
                  value={formData.classification || 'mineure'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      classification: e.target.value as Reserve['classification'],
                    })
                  }
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                >
                  <option value="bloquante">Bloquante</option>
                  <option value="majeure">Majeure</option>
                  <option value="mineure">Mineure</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Statut
                </label>
                <select
                  value={formData.statut || 'ouverte'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      statut: e.target.value as Reserve['statut'],
                      dateLevee:
                        e.target.value === 'levee'
                          ? format(new Date(), 'yyyy-MM-dd')
                          : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                >
                  <option value="ouverte">Ouverte</option>
                  <option value="en_cours">En cours</option>
                  <option value="levee">Levée</option>
                  <option value="contestee">Contestée</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Date identification
                </label>
                <input
                  type="date"
                  value={formData.dateIdentification || ''}
                  onChange={(e) => setFormData({ ...formData, dateIdentification: e.target.value })}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Date limite
                </label>
                <input
                  type="date"
                  value={formData.dateLimite || ''}
                  onChange={(e) => setFormData({ ...formData, dateLimite: e.target.value })}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Entreprise responsable
              </label>
              <input
                type="text"
                value={formData.responsableEntreprise || ''}
                onChange={(e) =>
                  setFormData({ ...formData, responsableEntreprise: e.target.value })
                }
                className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Commentaire
              </label>
              <textarea
                value={formData.commentaire || ''}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedReserve(null);
                  setReserveFromDOE(null);
                }}
                className="px-4 py-2 text-primary-700 hover:bg-primary-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800"
              >
                {selectedReserve ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Modal DOE
  const DOEModal = () => {
    const [formData, setFormData] = useState<Partial<DocumentDOE>>(
      selectedDOE || {
        lot: '',
        type: '',
        description: '',
        obligatoire: true,
        recu: false,
        verifie: false,
        conforme: false,
      }
    );

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!projet) return;

      try {
        if (selectedDOE) {
          await updateDocumentDOE(selectedDOE.id, formData);
          addToast({ type: 'success', title: 'Document mis à jour' });
        } else {
          await addDocumentDOE({
            ...formData,
            projetId: projet.id,
          } as Omit<DocumentDOE, 'id' | 'createdAt' | 'updatedAt'>);
          addToast({ type: 'success', title: 'Document ajouté' });
        }
        setShowDOEModal(false);
        setSelectedDOE(null);
      } catch {
        addToast({ type: 'error', title: 'Erreur lors de la sauvegarde' });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full">
          <div className="border-b border-primary-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-primary-900">
              {selectedDOE ? 'Modifier le document' : 'Nouveau document DOE'}
            </h2>
            <button
              onClick={() => {
                setShowDOEModal(false);
                setSelectedDOE(null);
              }}
              className="p-2 hover:bg-primary-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Lot</label>
                <input
                  type="text"
                  value={formData.lot || ''}
                  onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Type</label>
                <select
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                  required
                >
                  <option value="">Sélectionner...</option>
                  <option value="plans_recollement">Plans de recollement</option>
                  <option value="notices_techniques">Notices techniques</option>
                  <option value="pv_essais">PV d'essais</option>
                  <option value="certificats">Certificats</option>
                  <option value="garanties">Garanties</option>
                  <option value="fiches_techniques">Fiches techniques</option>
                  <option value="manuels">Manuels d'utilisation</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                rows={2}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.obligatoire || false}
                  onChange={(e) => setFormData({ ...formData, obligatoire: e.target.checked })}
                  className="w-4 h-4 rounded border-primary-300 text-primary-900 focus:ring-primary-500"
                />
                <span className="text-sm text-primary-700">Document obligatoire</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.recu || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recu: e.target.checked,
                      dateReception: e.target.checked
                        ? format(new Date(), 'yyyy-MM-dd')
                        : undefined,
                    })
                  }
                  className="w-4 h-4 rounded border-primary-300 text-primary-900 focus:ring-primary-500"
                />
                <span className="text-sm text-primary-700">Reçu</span>
              </label>
              {formData.recu && (
                <>
                  <label className="flex items-center gap-2 ml-6">
                    <input
                      type="checkbox"
                      checked={formData.verifie || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          verifie: e.target.checked,
                          dateVerification: e.target.checked
                            ? format(new Date(), 'yyyy-MM-dd')
                            : undefined,
                        })
                      }
                      className="w-4 h-4 rounded border-primary-300 text-primary-900 focus:ring-primary-500"
                    />
                    <span className="text-sm text-primary-700">Vérifié</span>
                  </label>
                  {formData.verifie && (
                    <label className="flex items-center gap-2 ml-6">
                      <input
                        type="checkbox"
                        checked={formData.conforme || false}
                        onChange={(e) => setFormData({ ...formData, conforme: e.target.checked })}
                        className="w-4 h-4 rounded border-primary-300 text-primary-900 focus:ring-primary-500"
                      />
                      <span className="text-sm text-primary-700">Conforme</span>
                    </label>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Commentaire
              </label>
              <textarea
                value={formData.commentaire || ''}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowDOEModal(false);
                  setSelectedDOE(null);
                }}
                className="px-4 py-2 text-primary-700 hover:bg-primary-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800"
              >
                {selectedDOE ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (!projet) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-primary-500">Aucun projet trouvé pour ce centre</p>
        <Link to={`/centre/${centreId}/projet`} className="mt-4 text-primary-700 hover:underline">
          Retour au tableau de bord projet
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/centre/${centreId}/projet`}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-primary-900">
              Handover Technique
            </h1>
            <p className="text-primary-500">Réserves et DOE</p>
          </div>
        </div>
        <button
          onClick={() => (viewMode === 'reserves' ? setShowAddModal(true) : setShowDOEModal(true))}
          className="flex items-center gap-2 px-4 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800"
        >
          <Plus className="w-4 h-4" />
          {viewMode === 'reserves' ? 'Nouvelle réserve' : 'Nouveau document'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-primary-200">
          <div className="flex items-center gap-2 text-primary-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">Bloquantes</span>
          </div>
          <p className={`text-2xl font-bold ${stats.bloquantes > 0 ? 'text-error' : 'text-success'}`}>
            {stats.bloquantes}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-primary-200">
          <div className="flex items-center gap-2 text-primary-500 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">Majeures</span>
          </div>
          <p className={`text-2xl font-bold ${stats.majeures > 0 ? 'text-warning' : 'text-success'}`}>
            {stats.majeures}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-primary-200">
          <div className="flex items-center gap-2 text-primary-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">En retard</span>
          </div>
          <p className={`text-2xl font-bold ${stats.enRetard > 0 ? 'text-error' : 'text-success'}`}>
            {stats.enRetard}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-primary-200">
          <div className="flex items-center gap-2 text-primary-500 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs">Levées</span>
          </div>
          <p className="text-2xl font-bold text-success">{stats.levees}</p>
          <p className="text-xs text-primary-400">/ {stats.totalReserves}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-primary-200">
          <div className="flex items-center gap-2 text-primary-500 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs">DOE reçus</span>
          </div>
          <p className="text-2xl font-bold text-primary-900">{stats.docsRecus}</p>
          <p className="text-xs text-primary-400">/ {stats.docsTotal}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-primary-200">
          <div className="flex items-center gap-2 text-primary-500 mb-1">
            <FolderOpen className="w-4 h-4" />
            <span className="text-xs">DOE manquants</span>
          </div>
          <p className={`text-2xl font-bold ${stats.docsManquants > 0 ? 'text-error' : 'text-success'}`}>
            {stats.docsManquants}
          </p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white rounded-xl border border-primary-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* View Mode */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('reserves')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'reserves'
                  ? 'bg-primary-900 text-white'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              <List className="w-4 h-4" />
              Réserves
            </button>
            <button
              onClick={() => setViewMode('doe')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'doe'
                  ? 'bg-primary-900 text-white'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              DOE
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-primary-200 rounded-lg text-sm w-48"
              />
            </div>

            {viewMode === 'reserves' && (
              <>
                <select
                  value={reserveFilter}
                  onChange={(e) => setReserveFilter(e.target.value as ReserveFilter)}
                  className="px-3 py-2 border border-primary-200 rounded-lg text-sm"
                >
                  <option value="all">Toutes classifications</option>
                  <option value="bloquante">Bloquantes</option>
                  <option value="majeure">Majeures</option>
                  <option value="mineure">Mineures</option>
                </select>
                <select
                  value={statutFilter}
                  onChange={(e) => setStatutFilter(e.target.value as StatutFilter)}
                  className="px-3 py-2 border border-primary-200 rounded-lg text-sm"
                >
                  <option value="all">Tous statuts</option>
                  <option value="ouverte">Ouvertes</option>
                  <option value="en_cours">En cours</option>
                  <option value="levee">Levées</option>
                  <option value="contestee">Contestées</option>
                </select>
              </>
            )}

            <select
              value={lotFilter}
              onChange={(e) => setLotFilter(e.target.value)}
              className="px-3 py-2 border border-primary-200 rounded-lg text-sm"
            >
              <option value="all">Tous les lots</option>
              {(viewMode === 'reserves' ? lots : lotsDoc).map((lot) => (
                <option key={lot} value={lot}>
                  {lot}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'reserves' ? (
        <div className="bg-white rounded-xl border border-primary-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50 border-b border-primary-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    N°
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Lot
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Localisation
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Description
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Classification
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Date limite
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Entreprise
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Statut
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {filteredReserves.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-primary-500">
                      Aucune réserve trouvée
                    </td>
                  </tr>
                ) : (
                  filteredReserves.map((reserve) => {
                    const isOverdue =
                      reserve.statut !== 'levee' &&
                      differenceInDays(new Date(), parseISO(reserve.dateLimite)) > 0;

                    return (
                      <tr key={reserve.id} className="hover:bg-primary-50">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-medium">{reserve.numero}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">{reserve.lot}</td>
                        <td className="px-4 py-3 text-sm">{reserve.localisation}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-primary-700 line-clamp-2">
                            {reserve.description}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getClassificationColor(
                              reserve.classification
                            )}`}
                          >
                            {reserve.classification.charAt(0).toUpperCase() +
                              reserve.classification.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-sm ${isOverdue ? 'text-error font-medium' : 'text-primary-600'}`}
                          >
                            {format(parseISO(reserve.dateLimite), 'dd MMM yyyy', { locale: fr })}
                          </span>
                          {isOverdue && (
                            <span className="block text-xs text-error">
                              {differenceInDays(new Date(), parseISO(reserve.dateLimite))}j de retard
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">{reserve.responsableEntreprise}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutBadge(
                              reserve.statut
                            )}`}
                          >
                            {getStatutLabel(reserve.statut)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {reserve.photos.length > 0 && (
                              <button className="p-1.5 hover:bg-primary-100 rounded-lg">
                                <Camera className="w-4 h-4 text-primary-500" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedReserve(reserve);
                                setShowAddModal(true);
                              }}
                              className="p-1.5 hover:bg-primary-100 rounded-lg"
                            >
                              <Eye className="w-4 h-4 text-primary-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-primary-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50 border-b border-primary-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Lot
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Description
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Obligatoire
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Reçu
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Vérifié
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Conforme
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Réserves
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {filteredDOE.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-primary-500">
                      Aucun document trouvé
                    </td>
                  </tr>
                ) : (
                  filteredDOE.map((doc) => {
                    // Compter les réserves liées à ce DOE
                    const doeReserves = reserves.filter(r => r.documentDOEId === doc.id);
                    const reservesOuvertes = doeReserves.filter(r => r.statut !== 'levee');

                    return (
                    <tr key={doc.id} className="hover:bg-primary-50">
                      <td className="px-4 py-3 text-sm font-medium">{doc.lot}</td>
                      <td className="px-4 py-3 text-sm">
                        {doc.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-primary-700">{doc.description}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {doc.obligatoire ? (
                          <span className="px-2 py-1 bg-warning/10 text-warning rounded-full text-xs">
                            Oui
                          </span>
                        ) : (
                          <span className="text-primary-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={async () => {
                            await updateDocumentDOE(doc.id, {
                              recu: !doc.recu,
                              dateReception: !doc.recu
                                ? format(new Date(), 'yyyy-MM-dd')
                                : undefined,
                            });
                          }}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            doc.recu
                              ? 'bg-success border-success text-white'
                              : 'border-primary-300 hover:border-primary-400'
                          }`}
                        >
                          {doc.recu && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={async () => {
                            if (!doc.recu) return;
                            await updateDocumentDOE(doc.id, {
                              verifie: !doc.verifie,
                              dateVerification: !doc.verifie
                                ? format(new Date(), 'yyyy-MM-dd')
                                : undefined,
                            });
                          }}
                          disabled={!doc.recu}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            doc.verifie
                              ? 'bg-info border-info text-white'
                              : doc.recu
                                ? 'border-primary-300 hover:border-primary-400'
                                : 'border-primary-200 bg-primary-50 cursor-not-allowed'
                          }`}
                        >
                          {doc.verifie && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={async () => {
                            if (!doc.verifie) return;
                            await updateDocumentDOE(doc.id, { conforme: !doc.conforme });
                          }}
                          disabled={!doc.verifie}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            doc.conforme
                              ? 'bg-success border-success text-white'
                              : doc.verifie
                                ? 'border-primary-300 hover:border-primary-400'
                                : 'border-primary-200 bg-primary-50 cursor-not-allowed'
                          }`}
                        >
                          {doc.conforme && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {doeReserves.length > 0 ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reservesOuvertes.length > 0
                              ? 'bg-error/10 text-error'
                              : 'bg-success/10 text-success'
                          }`}>
                            {reservesOuvertes.length > 0
                              ? `${reservesOuvertes.length} ouverte(s)`
                              : `${doeReserves.length} levée(s)`}
                          </span>
                        ) : (
                          <span className="text-primary-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Bouton Ajouter Réserve */}
                          <button
                            onClick={() => {
                              setReserveFromDOE(doc);
                              setShowAddModal(true);
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-warning bg-warning/10 hover:bg-warning/20 rounded-lg transition-colors"
                            title="Ajouter une réserve"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Réserve
                          </button>
                          {doc.fichierId && (
                            <button className="p-1.5 hover:bg-primary-100 rounded-lg">
                              <Download className="w-4 h-4 text-primary-500" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedDOE(doc);
                              setShowDOEModal(true);
                            }}
                            className="p-1.5 hover:bg-primary-100 rounded-lg"
                          >
                            <Eye className="w-4 h-4 text-primary-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && <ReserveModal />}
      {showDOEModal && <DOEModal />}
    </div>
  );
}
