import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Plus,
  ChevronLeft,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Save,
  Filter,
  BarChart3,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Modal } from '../components/ui';
import { useCentresStore, useProjetStore } from '../store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { RisqueProjet, CategorieRisqueProjet, ActionMitigation } from '../types';

// Couleurs par catégorie
const categorieColors: Record<CategorieRisqueProjet, { bg: string; text: string; icon: React.ElementType }> = {
  planning: { bg: 'bg-blue-100', text: 'text-blue-600', icon: Clock },
  budget: { bg: 'bg-green-100', text: 'text-green-600', icon: TrendingUp },
  technique: { bg: 'bg-purple-100', text: 'text-purple-600', icon: Shield },
  commercial: { bg: 'bg-orange-100', text: 'text-orange-600', icon: TrendingUp },
  rh: { bg: 'bg-pink-100', text: 'text-pink-600', icon: AlertCircle },
  externe: { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: AlertTriangle },
  reglementaire: { bg: 'bg-red-100', text: 'text-red-600', icon: Shield },
};

// Couleurs par criticité
const getCriticiteColor = (criticite: number) => {
  if (criticite >= 20) return { bg: 'bg-error', text: 'text-white', label: 'Critique' };
  if (criticite >= 15) return { bg: 'bg-error/70', text: 'text-white', label: 'Très élevé' };
  if (criticite >= 10) return { bg: 'bg-warning', text: 'text-white', label: 'Élevé' };
  if (criticite >= 5) return { bg: 'bg-warning/60', text: 'text-primary-900', label: 'Modéré' };
  return { bg: 'bg-success/40', text: 'text-primary-900', label: 'Faible' };
};

// Modal d'édition de risque
function RisqueModal({
  isOpen,
  onClose,
  risque,
  projetId,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  risque?: RisqueProjet;
  projetId: string;
  onSave: (data: Partial<RisqueProjet>) => void;
}) {
  const [formData, setFormData] = useState({
    code: risque?.code || '',
    titre: risque?.titre || '',
    description: risque?.description || '',
    categorie: risque?.categorie || 'planning' as CategorieRisqueProjet,
    probabilite: risque?.probabilite || 3,
    impact: risque?.impact || 3,
    statut: risque?.statut || 'identifie' as const,
    actionMitigation: risque?.actionsMitigation[0]?.description || '',
  });

  useEffect(() => {
    if (risque) {
      setFormData({
        code: risque.code,
        titre: risque.titre,
        description: risque.description,
        categorie: risque.categorie,
        probabilite: risque.probabilite,
        impact: risque.impact,
        statut: risque.statut,
        actionMitigation: risque.actionsMitigation[0]?.description || '',
      });
    }
  }, [risque]);

  const criticite = formData.probabilite * formData.impact;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const actions: ActionMitigation[] = formData.actionMitigation ? [{
      id: risque?.actionsMitigation[0]?.id || crypto.randomUUID(),
      description: formData.actionMitigation,
      echeance: new Date().toISOString(),
      statut: 'a_faire',
    }] : [];

    onSave({
      code: formData.code,
      titre: formData.titre,
      description: formData.description,
      categorie: formData.categorie,
      probabilite: formData.probabilite as 1 | 2 | 3 | 4 | 5,
      impact: formData.impact as 1 | 2 | 3 | 4 | 5,
      criticite,
      statut: formData.statut,
      actionsMitigation: actions,
      dateIdentification: risque?.dateIdentification || new Date().toISOString(),
      projetId,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={risque ? 'Modifier le risque' : 'Nouveau risque'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="R01"
            required
          />
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1.5">Catégorie</label>
            <select
              value={formData.categorie}
              onChange={(e) => setFormData({ ...formData, categorie: e.target.value as CategorieRisqueProjet })}
              className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="planning">Planning</option>
              <option value="budget">Budget</option>
              <option value="technique">Technique</option>
              <option value="commercial">Commercial</option>
              <option value="rh">RH</option>
              <option value="externe">Externe</option>
              <option value="reglementaire">Réglementaire</option>
            </select>
          </div>
        </div>

        <Input
          label="Titre"
          value={formData.titre}
          onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
          placeholder="Titre du risque"
          required
        />

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1.5">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Description détaillée du risque..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1.5">
              Probabilité: {formData.probabilite}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.probabilite}
              onChange={(e) => setFormData({ ...formData, probabilite: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-primary-500">
              <span>Faible</span>
              <span>Élevée</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1.5">
              Impact: {formData.impact}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.impact}
              onChange={(e) => setFormData({ ...formData, impact: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-primary-500">
              <span>Faible</span>
              <span>Élevé</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1.5">Criticité</label>
            <div className={`text-center py-2 rounded-lg ${getCriticiteColor(criticite).bg} ${getCriticiteColor(criticite).text}`}>
              <span className="text-2xl font-bold">{criticite}</span>
              <span className="text-sm">/25</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1.5">Statut</label>
          <select
            value={formData.statut}
            onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
            className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="identifie">Identifié</option>
            <option value="en_traitement">En traitement</option>
            <option value="mitige">Mitigé</option>
            <option value="realise">Réalisé</option>
            <option value="clos">Clos</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1.5">Action de mitigation</label>
          <textarea
            value={formData.actionMitigation}
            onChange={(e) => setFormData({ ...formData, actionMitigation: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Mesure pour réduire le risque..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
            {risque ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Matrice de risques
function RisqueMatrix({ risques }: { risques: RisqueProjet[] }) {
  const getCount = (prob: number, impact: number) => {
    return risques.filter((r) => r.probabilite === prob && r.impact === impact && r.statut !== 'clos').length;
  };

  return (
    <div className="p-4">
      <div className="flex items-end gap-2">
        <div className="w-16 flex flex-col items-center gap-1 text-xs text-primary-500">
          <span className="transform -rotate-90 whitespace-nowrap">Probabilité</span>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1">
            {[5, 4, 3, 2, 1].map((prob) => (
              <React.Fragment key={prob}>
                {[1, 2, 3, 4, 5].map((impact) => {
                  const count = getCount(prob, impact);
                  const criticite = prob * impact;
                  const color = getCriticiteColor(criticite);
                  return (
                    <div
                      key={`${prob}-${impact}`}
                      className={`h-12 flex items-center justify-center rounded text-sm font-medium ${color.bg} ${color.text}`}
                    >
                      {count > 0 ? count : ''}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="text-center text-xs text-primary-500">{i}</div>
            ))}
          </div>
          <div className="text-center text-xs text-primary-500 mt-1">Impact</div>
        </div>
      </div>
    </div>
  );
}

export function ProjetRisques() {
  const { centreId } = useParams<{ centreId: string }>();
  const navigate = useNavigate();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const {
    projets,
    risquesProjet,
    loadProjet,
    addRisque,
    updateRisque,
    deleteRisque,
  } = useProjetStore();

  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRisque, setSelectedRisque] = useState<RisqueProjet | undefined>();
  const [filterCategorie, setFilterCategorie] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');

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
  if (!projet) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-primary-500">Projet non initialisé</p>
      </div>
    );
  }

  const projetRisques = risquesProjet
    .filter((r) => r.projetId === projet.id)
    .sort((a, b) => b.criticite - a.criticite);

  // Filtrer les risques
  const filteredRisques = projetRisques.filter((risque) => {
    const matchCategorie = filterCategorie === 'all' || risque.categorie === filterCategorie;
    const matchStatut = filterStatut === 'all' || risque.statut === filterStatut;
    return matchCategorie && matchStatut;
  });

  // Statistiques
  const risquesActifs = projetRisques.filter((r) => r.statut !== 'clos');
  const stats = {
    total: projetRisques.length,
    actifs: risquesActifs.length,
    critiques: risquesActifs.filter((r) => r.criticite >= 15).length,
    eleves: risquesActifs.filter((r) => r.criticite >= 10 && r.criticite < 15).length,
    moderes: risquesActifs.filter((r) => r.criticite >= 5 && r.criticite < 10).length,
    faibles: risquesActifs.filter((r) => r.criticite < 5).length,
    scoreTotal: risquesActifs.reduce((sum, r) => sum + r.criticite, 0),
  };

  const handleSave = async (data: Partial<RisqueProjet>) => {
    if (selectedRisque) {
      await updateRisque(selectedRisque.id, data);
    } else {
      await addRisque(data as any);
    }
    setSelectedRisque(undefined);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer ce risque ?')) {
      await deleteRisque(id);
    }
  };

  const openEditModal = (risque: RisqueProjet) => {
    setSelectedRisque(risque);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedRisque(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/centre/${centreId}/projet`)}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-primary-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Risques Projet</h1>
            <p className="text-primary-500">{centre.nom}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-primary-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow text-primary-900' : 'text-primary-600'
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'matrix' ? 'bg-white shadow text-primary-900' : 'text-primary-600'
              }`}
            >
              Matrice
            </button>
          </div>
          <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            Nouveau risque
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-900">{stats.actifs}</p>
              <p className="text-xs text-primary-500">Risques actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-error/30 bg-error/5">
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-error">{stats.critiques}</p>
              <p className="text-xs text-error">Critiques (15-25)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{stats.eleves}</p>
              <p className="text-xs text-warning">Élevés (10-14)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.moderes}</p>
              <p className="text-xs text-orange-600">Modérés (5-9)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success/5">
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{stats.faibles}</p>
              <p className="text-xs text-success">Faibles (1-4)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-900">{stats.scoreTotal}</p>
              <p className="text-xs text-primary-500">Score total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matrice */}
      {viewMode === 'matrix' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Matrice des risques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RisqueMatrix risques={projetRisques} />
            <div className="flex justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-success/40" />
                <span>Faible (1-4)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-warning/60" />
                <span>Modéré (5-9)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-warning" />
                <span>Élevé (10-14)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-error/70" />
                <span>Très élevé (15-19)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-error" />
                <span>Critique (20-25)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres */}
      <div className="flex gap-4">
        <select
          value={filterCategorie}
          onChange={(e) => setFilterCategorie(e.target.value)}
          className="px-3 py-2 border border-primary-300 rounded-lg"
        >
          <option value="all">Toutes catégories</option>
          <option value="planning">Planning</option>
          <option value="budget">Budget</option>
          <option value="technique">Technique</option>
          <option value="commercial">Commercial</option>
          <option value="rh">RH</option>
          <option value="externe">Externe</option>
          <option value="reglementaire">Réglementaire</option>
        </select>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-3 py-2 border border-primary-300 rounded-lg"
        >
          <option value="all">Tous statuts</option>
          <option value="identifie">Identifié</option>
          <option value="en_traitement">En traitement</option>
          <option value="mitige">Mitigé</option>
          <option value="realise">Réalisé</option>
          <option value="clos">Clos</option>
        </select>
      </div>

      {/* Liste des risques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Registre des risques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredRisques.map((risque) => {
              const catConfig = categorieColors[risque.categorie];
              const critConfig = getCriticiteColor(risque.criticite);
              const CatIcon = catConfig.icon;

              return (
                <div
                  key={risque.id}
                  className={`p-4 rounded-xl border ${risque.criticite >= 15 ? 'border-error/30 bg-error/5' : 'border-primary-200 bg-primary-50'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${catConfig.bg}`}>
                      <CatIcon className={`w-6 h-6 ${catConfig.text}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-primary-500">{risque.code}</span>
                        <Badge variant="default" size="sm">{risque.categorie}</Badge>
                        <Badge
                          variant={
                            risque.statut === 'clos' ? 'success' :
                            risque.statut === 'mitige' ? 'info' :
                            risque.statut === 'realise' ? 'error' : 'default'
                          }
                          size="sm"
                        >
                          {risque.statut.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="font-medium text-primary-900">{risque.titre}</p>
                      {risque.description && (
                        <p className="text-sm text-primary-600 mt-1">{risque.description}</p>
                      )}

                      <div className="flex items-center gap-6 mt-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-primary-500">Probabilité:</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${
                                  i <= risque.probabilite ? 'bg-primary-900' : 'bg-primary-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary-500">Impact:</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${
                                  i <= risque.impact ? 'bg-primary-900' : 'bg-primary-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {risque.actionsMitigation.length > 0 && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-primary-200">
                          <p className="text-xs text-primary-500 mb-1">Plan de mitigation:</p>
                          <p className="text-sm text-primary-700">{risque.actionsMitigation[0].description}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-3 py-1.5 rounded-lg ${critConfig.bg} ${critConfig.text}`}>
                        <span className="text-xl font-bold">{risque.criticite}</span>
                        <span className="text-xs">/25</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(risque)}
                          className="p-2 hover:bg-primary-200 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-primary-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(risque.id)}
                          className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-error" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredRisques.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                <p className="text-primary-500">Aucun risque trouvé</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <RisqueModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRisque(undefined);
        }}
        risque={selectedRisque}
        projetId={projet.id}
        onSave={handleSave}
      />
    </div>
  );
}
