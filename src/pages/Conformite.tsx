import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Shield,
  AlertTriangle,
  ClipboardCheck,
  Calendar,
  User,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertOctagon,
  TrendingUp,
  Activity,
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
import { useConformiteStore, useAppStore, useCentresStore } from '../store';
import type { Audit, RisqueEntreprise, NonConformite } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type TabType = 'audits' | 'risques';
type TypeAudit = 'interne' | 'externe' | 'reglementaire';
type StatutAudit = 'planifie' | 'en_cours' | 'termine' | 'annule';
type GraviteNC = 'mineure' | 'majeure' | 'critique';
type StatutNC = 'ouverte' | 'en_cours' | 'cloturee';
type StatutRisque = 'identifie' | 'en_traitement' | 'accepte' | 'cloture';

const typeAuditLabels: Record<TypeAudit, string> = {
  interne: 'Interne',
  externe: 'Externe',
  reglementaire: 'Réglementaire',
};

const typeAuditColors: Record<TypeAudit, string> = {
  interne: 'bg-blue-100 text-blue-800 border-blue-200',
  externe: 'bg-purple-100 text-purple-800 border-purple-200',
  reglementaire: 'bg-orange-100 text-orange-800 border-orange-200',
};

const statutAuditLabels: Record<StatutAudit, string> = {
  planifie: 'Planifié',
  en_cours: 'En cours',
  termine: 'Terminé',
  annule: 'Annulé',
};

const statutAuditColors: Record<StatutAudit, string> = {
  planifie: 'bg-info/10 text-info border-info/20',
  en_cours: 'bg-warning/10 text-warning border-warning/20',
  termine: 'bg-success/10 text-success border-success/20',
  annule: 'bg-primary-100 text-primary-500 border-primary-200',
};

const graviteNCLabels: Record<GraviteNC, string> = {
  mineure: 'Mineure',
  majeure: 'Majeure',
  critique: 'Critique',
};

const graviteNCColors: Record<GraviteNC, string> = {
  mineure: 'bg-info/10 text-info border-info/20',
  majeure: 'bg-warning/10 text-warning border-warning/20',
  critique: 'bg-error/10 text-error border-error/20',
};

const statutNCLabels: Record<StatutNC, string> = {
  ouverte: 'Ouverte',
  en_cours: 'En cours',
  cloturee: 'Clôturée',
};

const statutRisqueLabels: Record<StatutRisque, string> = {
  identifie: 'Identifié',
  en_traitement: 'En traitement',
  accepte: 'Accepté',
  cloture: 'Clôturé',
};

const statutRisqueColors: Record<StatutRisque, string> = {
  identifie: 'bg-info/10 text-info border-info/20',
  en_traitement: 'bg-warning/10 text-warning border-warning/20',
  accepte: 'bg-primary-100 text-primary-600 border-primary-200',
  cloture: 'bg-success/10 text-success border-success/20',
};

const categoriesRisque = [
  'Opérationnel',
  'Financier',
  'Juridique',
  'Technique',
  'Sécurité',
  'Environnemental',
  'Réputationnel',
  'RH',
  'Autre',
];

export function Conformite() {
  const { centreId } = useParams<{ centreId: string }>();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const { addToast } = useAppStore();
  const {
    audits,
    risques,
    loadAudits,
    loadRisques,
    getAuditsByCentre,
    getRisquesByCentre,
    addAudit,
    updateAudit,
    deleteAudit,
    changerStatutAudit,
    addNonConformite,
    updateNonConformite,
    cloturerNonConformite,
    addRisque,
    updateRisque,
    deleteRisque,
    changerStatutRisque,
    getStatsAudits,
    getStatsRisques,
  } = useConformiteStore();

  const [activeTab, setActiveTab] = useState<TabType>('audits');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isRisqueModalOpen, setIsRisqueModalOpen] = useState(false);
  const [isNCModalOpen, setIsNCModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [selectedRisque, setSelectedRisque] = useState<RisqueEntreprise | null>(null);
  const [deleteType, setDeleteType] = useState<'audit' | 'risque'>('audit');
  const [expandedAudits, setExpandedAudits] = useState<Set<string>>(new Set());
  const [filterTypeAudit, setFilterTypeAudit] = useState<string>('all');
  const [filterStatutAudit, setFilterStatutAudit] = useState<string>('all');
  const [filterCategorieRisque, setFilterCategorieRisque] = useState<string>('all');

  const [auditFormData, setAuditFormData] = useState({
    titre: '',
    type: 'interne' as TypeAudit,
    description: '',
    datePlanifiee: format(new Date(), 'yyyy-MM-dd'),
    auditeur: '',
    statut: 'planifie' as StatutAudit,
  });

  const [risqueFormData, setRisqueFormData] = useState({
    categorie: 'Opérationnel',
    description: '',
    probabilite: 3,
    impact: 3,
    proprietaire: '',
    planMitigation: '',
    statut: 'identifie' as StatutRisque,
  });

  const [ncFormData, setNCFormData] = useState({
    description: '',
    gravite: 'mineure' as GraviteNC,
    actionCorrective: '',
  });

  useEffect(() => {
    if (centreId) {
      loadAudits(centreId);
      loadRisques(centreId);
    }
  }, [centreId]);

  const centreAudits = getAuditsByCentre(centreId || '');
  const centreRisques = getRisquesByCentre(centreId || '');
  const statsAudits = getStatsAudits(centreId || '');
  const statsRisques = getStatsRisques(centreId || '');

  // Filtrage
  const filteredAudits = centreAudits.filter((audit) => {
    if (filterTypeAudit !== 'all' && audit.type !== filterTypeAudit) return false;
    if (filterStatutAudit !== 'all' && audit.statut !== filterStatutAudit) return false;
    return true;
  });

  const filteredRisques = centreRisques.filter((risque) => {
    if (filterCategorieRisque !== 'all' && risque.categorie !== filterCategorieRisque) return false;
    if (risque.statut === 'cloture') return false;
    return true;
  });

  const toggleAudit = (auditId: string) => {
    const newExpanded = new Set(expandedAudits);
    if (newExpanded.has(auditId)) {
      newExpanded.delete(auditId);
    } else {
      newExpanded.add(auditId);
    }
    setExpandedAudits(newExpanded);
  };

  const resetAuditForm = () => {
    setAuditFormData({
      titre: '',
      type: 'interne',
      description: '',
      datePlanifiee: format(new Date(), 'yyyy-MM-dd'),
      auditeur: '',
      statut: 'planifie',
    });
    setSelectedAudit(null);
  };

  const resetRisqueForm = () => {
    setRisqueFormData({
      categorie: 'Opérationnel',
      description: '',
      probabilite: 3,
      impact: 3,
      proprietaire: '',
      planMitigation: '',
      statut: 'identifie',
    });
    setSelectedRisque(null);
  };

  const resetNCForm = () => {
    setNCFormData({
      description: '',
      gravite: 'mineure',
      actionCorrective: '',
    });
  };

  const handleOpenAuditModal = (audit?: Audit) => {
    if (audit) {
      setSelectedAudit(audit);
      setAuditFormData({
        titre: audit.titre,
        type: audit.type,
        description: audit.description || '',
        datePlanifiee: format(new Date(audit.datePlanifiee), 'yyyy-MM-dd'),
        auditeur: audit.auditeur,
        statut: audit.statut,
      });
    } else {
      resetAuditForm();
    }
    setIsAuditModalOpen(true);
  };

  const handleOpenRisqueModal = (risque?: RisqueEntreprise) => {
    if (risque) {
      setSelectedRisque(risque);
      setRisqueFormData({
        categorie: risque.categorie,
        description: risque.description,
        probabilite: risque.probabilite,
        impact: risque.impact,
        proprietaire: risque.proprietaire || '',
        planMitigation: risque.planMitigation || '',
        statut: risque.statut,
      });
    } else {
      resetRisqueForm();
    }
    setIsRisqueModalOpen(true);
  };

  const handleOpenNCModal = (audit: Audit) => {
    setSelectedAudit(audit);
    resetNCForm();
    setIsNCModalOpen(true);
  };

  const handleOpenDetail = (audit: Audit) => {
    setSelectedAudit(audit);
    setIsDetailModalOpen(true);
  };

  const handleSaveAudit = async () => {
    if (!centreId || !auditFormData.titre) return;

    try {
      if (selectedAudit) {
        await updateAudit(selectedAudit.id, auditFormData);
        addToast({ type: 'success', title: 'Audit modifié' });
      } else {
        await addAudit({
          ...auditFormData,
          centreId,
          nonConformites: [],
        });
        addToast({ type: 'success', title: 'Audit créé' });
      }

      setIsAuditModalOpen(false);
      resetAuditForm();
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleSaveRisque = async () => {
    if (!centreId || !risqueFormData.description) return;

    try {
      if (selectedRisque) {
        await updateRisque(selectedRisque.id, risqueFormData);
        addToast({ type: 'success', title: 'Risque modifié' });
      } else {
        await addRisque({
          ...risqueFormData,
          centreId,
          scoreRisque: risqueFormData.probabilite * risqueFormData.impact,
          dateIdentification: new Date().toISOString(),
        });
        addToast({ type: 'success', title: 'Risque créé' });
      }

      setIsRisqueModalOpen(false);
      resetRisqueForm();
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleSaveNC = async () => {
    if (!selectedAudit || !ncFormData.description) return;

    try {
      await addNonConformite(selectedAudit.id, {
        ...ncFormData,
        dateDetection: new Date().toISOString(),
        statut: 'ouverte',
      });
      addToast({ type: 'success', title: 'Non-conformité ajoutée' });
      setIsNCModalOpen(false);
      resetNCForm();
      loadAudits(centreId);
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteType === 'audit' && selectedAudit) {
        await deleteAudit(selectedAudit.id);
        addToast({ type: 'success', title: 'Audit supprimé' });
      } else if (deleteType === 'risque' && selectedRisque) {
        await deleteRisque(selectedRisque.id);
        addToast({ type: 'success', title: 'Risque supprimé' });
      }
      setIsDeleteModalOpen(false);
      setSelectedAudit(null);
      setSelectedRisque(null);
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleCloturerNC = async (audit: Audit, ncId: string) => {
    try {
      await cloturerNonConformite(audit.id, ncId);
      addToast({ type: 'success', title: 'Non-conformité clôturée' });
      loadAudits(centreId);
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 15) return 'bg-error text-white';
    if (score >= 8) return 'bg-warning text-white';
    return 'bg-success text-white';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 15) return 'Critique';
    if (score >= 8) return 'Moyen';
    return 'Faible';
  };

  const typeAuditOptions = [
    { value: 'interne', label: 'Interne' },
    { value: 'externe', label: 'Externe' },
    { value: 'reglementaire', label: 'Réglementaire' },
  ];

  const statutAuditOptions = [
    { value: 'planifie', label: 'Planifié' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'termine', label: 'Terminé' },
    { value: 'annule', label: 'Annulé' },
  ];

  const graviteNCOptions = [
    { value: 'mineure', label: 'Mineure' },
    { value: 'majeure', label: 'Majeure' },
    { value: 'critique', label: 'Critique' },
  ];

  const statutRisqueOptions = [
    { value: 'identifie', label: 'Identifié' },
    { value: 'en_traitement', label: 'En traitement' },
    { value: 'accepte', label: 'Accepté' },
    { value: 'cloture', label: 'Clôturé' },
  ];

  const categorieOptions = categoriesRisque.map((c) => ({ value: c, label: c }));

  const probabiliteOptions = [
    { value: '1', label: '1 - Très improbable' },
    { value: '2', label: '2 - Peu probable' },
    { value: '3', label: '3 - Possible' },
    { value: '4', label: '4 - Probable' },
    { value: '5', label: '5 - Très probable' },
  ];

  const impactOptions = [
    { value: '1', label: '1 - Négligeable' },
    { value: '2', label: '2 - Mineur' },
    { value: '3', label: '3 - Modéré' },
    { value: '4', label: '4 - Majeur' },
    { value: '5', label: '5 - Critique' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Conformité</h1>
          <p className="text-primary-500 mt-1">{centre?.nom}</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'audits' ? (
            <>
              <Select
                options={[
                  { value: 'all', label: 'Tous les types' },
                  ...typeAuditOptions,
                ]}
                value={filterTypeAudit}
                onChange={(e) => setFilterTypeAudit(e.target.value)}
                className="w-40"
              />
              <Select
                options={[
                  { value: 'all', label: 'Tous les statuts' },
                  ...statutAuditOptions,
                ]}
                value={filterStatutAudit}
                onChange={(e) => setFilterStatutAudit(e.target.value)}
                className="w-40"
              />
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenAuditModal()}>
                Nouvel audit
              </Button>
            </>
          ) : (
            <>
              <Select
                options={[
                  { value: 'all', label: 'Toutes catégories' },
                  ...categorieOptions,
                ]}
                value={filterCategorieRisque}
                onChange={(e) => setFilterCategorieRisque(e.target.value)}
                className="w-44"
              />
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenRisqueModal()}>
                Nouveau risque
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary-200">
        <button
          onClick={() => setActiveTab('audits')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'audits'
              ? 'border-primary-900 text-primary-900'
              : 'border-transparent text-primary-500 hover:text-primary-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Audits
            <Badge>{centreAudits.length}</Badge>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('risques')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'risques'
              ? 'border-primary-900 text-primary-900'
              : 'border-transparent text-primary-500 hover:text-primary-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Risques
            <Badge>{filteredRisques.length}</Badge>
          </div>
        </button>
      </div>

      {/* Stats Cards */}
      {activeTab === 'audits' ? (
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <ClipboardCheck className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-900">{statsAudits.total}</div>
                  <div className="text-sm text-primary-500">Audits</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-info/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-info" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-info">{statsAudits.planifies}</div>
                  <div className="text-sm text-primary-500">Planifiés</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Activity className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-warning">{statsAudits.enCours}</div>
                  <div className="text-sm text-primary-500">En cours</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-error/10 rounded-lg">
                  <AlertOctagon className="w-5 h-5 text-error" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-error">{statsAudits.ncOuvertes}</div>
                  <div className="text-sm text-primary-500">NC ouvertes</div>
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
                  <div className="text-2xl font-bold text-success">{statsAudits.termines}</div>
                  <div className="text-sm text-primary-500">Terminés</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-900">{statsRisques.total}</div>
                  <div className="text-sm text-primary-500">Risques actifs</div>
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
                  <div className="text-2xl font-bold text-error">{statsRisques.critiques}</div>
                  <div className="text-sm text-primary-500">Critiques</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-warning">{statsRisques.moyens}</div>
                  <div className="text-sm text-primary-500">Moyens</div>
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
                  <div className="text-2xl font-bold text-success">{statsRisques.faibles}</div>
                  <div className="text-sm text-primary-500">Faibles</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content */}
      {activeTab === 'audits' ? (
        <div className="space-y-4">
          {filteredAudits.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardCheck className="w-12 h-12 text-primary-300 mx-auto mb-4" />
                <p className="text-primary-500">Aucun audit trouvé</p>
                <Button
                  className="mt-4"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => handleOpenAuditModal()}
                >
                  Créer un audit
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredAudits.map((audit) => {
              const isExpanded = expandedAudits.has(audit.id);
              const ncOuvertes = audit.nonConformites.filter((nc) => nc.statut !== 'cloturee').length;

              return (
                <Card key={audit.id}>
                  <CardHeader
                    className="cursor-pointer hover:bg-primary-50 transition-colors"
                    onClick={() => toggleAudit(audit.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-primary-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-primary-400" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle>{audit.titre}</CardTitle>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${typeAuditColors[audit.type]}`}>
                              {typeAuditLabels[audit.type]}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${statutAuditColors[audit.statut]}`}>
                              {statutAuditLabels[audit.statut]}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-primary-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(audit.datePlanifiee), 'dd/MM/yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {audit.auditeur}
                            </span>
                            {ncOuvertes > 0 && (
                              <span className="flex items-center gap-1 text-error">
                                <AlertTriangle className="w-4 h-4" />
                                {ncOuvertes} NC ouverte(s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDetail(audit)}>
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenAuditModal(audit)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAudit(audit);
                            setDeleteType('audit');
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-error" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent>
                      <div className="space-y-4">
                        {audit.description && (
                          <p className="text-sm text-primary-600">{audit.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-primary-900">
                            Non-conformités ({audit.nonConformites.length})
                          </h4>
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Plus className="w-4 h-4" />}
                            onClick={() => handleOpenNCModal(audit)}
                          >
                            Ajouter NC
                          </Button>
                        </div>

                        {audit.nonConformites.length === 0 ? (
                          <p className="text-sm text-primary-400 italic">Aucune non-conformité</p>
                        ) : (
                          <div className="space-y-2">
                            {audit.nonConformites.map((nc) => (
                              <div
                                key={nc.id}
                                className={`p-3 rounded-lg border ${
                                  nc.statut === 'cloturee'
                                    ? 'bg-primary-50 border-primary-100'
                                    : 'bg-white border-primary-200'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-xs px-2 py-0.5 rounded-full border ${graviteNCColors[nc.gravite]}`}>
                                        {graviteNCLabels[nc.gravite]}
                                      </span>
                                      <span className="text-xs text-primary-500">
                                        {statutNCLabels[nc.statut]}
                                      </span>
                                    </div>
                                    <p className="text-sm text-primary-700">{nc.description}</p>
                                    {nc.actionCorrective && (
                                      <p className="text-xs text-primary-500 mt-1">
                                        <strong>Action:</strong> {nc.actionCorrective}
                                      </p>
                                    )}
                                  </div>
                                  {nc.statut !== 'cloturee' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCloturerNC(audit, nc.id)}
                                    >
                                      <CheckCircle className="w-4 h-4 text-success" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Matrice des risques simplifiée */}
          <Card>
            <CardHeader>
              <CardTitle>Matrice des risques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-1 text-center text-xs">
                <div></div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-2 font-medium text-primary-600">Impact {i}</div>
                ))}
                {[5, 4, 3, 2, 1].map((prob) => (
                  <React.Fragment key={prob}>
                    <div className="p-2 font-medium text-primary-600">P{prob}</div>
                    {[1, 2, 3, 4, 5].map((imp) => {
                      const score = prob * imp;
                      const risquesInCell = filteredRisques.filter(
                        (r) => r.probabilite === prob && r.impact === imp
                      );
                      return (
                        <div
                          key={`${prob}-${imp}`}
                          className={`p-2 rounded ${getScoreColor(score)} ${
                            risquesInCell.length > 0 ? 'ring-2 ring-primary-900' : ''
                          }`}
                        >
                          {risquesInCell.length > 0 ? (
                            <span className="font-bold">{risquesInCell.length}</span>
                          ) : (
                            <span className="opacity-50">{score}</span>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Liste des risques */}
          {filteredRisques.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="w-12 h-12 text-primary-300 mx-auto mb-4" />
                <p className="text-primary-500">Aucun risque trouvé</p>
                <Button
                  className="mt-4"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => handleOpenRisqueModal()}
                >
                  Identifier un risque
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Score</th>
                      <th>Catégorie</th>
                      <th>Description</th>
                      <th>P x I</th>
                      <th>Propriétaire</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRisques.map((risque) => (
                      <tr key={risque.id}>
                        <td>
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold ${getScoreColor(risque.scoreRisque)}`}>
                            {risque.scoreRisque}
                          </span>
                        </td>
                        <td>
                          <Badge>{risque.categorie}</Badge>
                        </td>
                        <td>
                          <div>
                            <p className="text-sm text-primary-900 line-clamp-2">{risque.description}</p>
                            {risque.planMitigation && (
                              <p className="text-xs text-primary-500 mt-1 line-clamp-1">
                                <strong>Plan:</strong> {risque.planMitigation}
                              </p>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="text-sm text-primary-600">
                            {risque.probabilite} x {risque.impact}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm text-primary-600">
                            {risque.proprietaire || '—'}
                          </span>
                        </td>
                        <td>
                          <span className={`text-xs px-2 py-1 rounded-full border ${statutRisqueColors[risque.statut]}`}>
                            {statutRisqueLabels[risque.statut]}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenRisqueModal(risque)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRisque(risque);
                                setDeleteType('risque');
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-error" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal Audit */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => {
          setIsAuditModalOpen(false);
          resetAuditForm();
        }}
        title={selectedAudit ? 'Modifier l\'audit' : 'Nouvel audit'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAuditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveAudit}>{selectedAudit ? 'Enregistrer' : 'Créer'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Titre"
            value={auditFormData.titre}
            onChange={(e) => setAuditFormData({ ...auditFormData, titre: e.target.value })}
            placeholder="Ex: Audit sécurité incendie"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type d'audit"
              options={typeAuditOptions}
              value={auditFormData.type}
              onChange={(e) => setAuditFormData({ ...auditFormData, type: e.target.value as TypeAudit })}
            />
            <Select
              label="Statut"
              options={statutAuditOptions}
              value={auditFormData.statut}
              onChange={(e) => setAuditFormData({ ...auditFormData, statut: e.target.value as StatutAudit })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date planifiée"
              type="date"
              value={auditFormData.datePlanifiee}
              onChange={(e) => setAuditFormData({ ...auditFormData, datePlanifiee: e.target.value })}
            />
            <Input
              label="Auditeur"
              value={auditFormData.auditeur}
              onChange={(e) => setAuditFormData({ ...auditFormData, auditeur: e.target.value })}
              placeholder="Nom de l'auditeur"
            />
          </div>

          <Textarea
            label="Description"
            rows={3}
            value={auditFormData.description}
            onChange={(e) => setAuditFormData({ ...auditFormData, description: e.target.value })}
            placeholder="Périmètre et objectifs de l'audit..."
          />
        </div>
      </Modal>

      {/* Modal Risque */}
      <Modal
        isOpen={isRisqueModalOpen}
        onClose={() => {
          setIsRisqueModalOpen(false);
          resetRisqueForm();
        }}
        title={selectedRisque ? 'Modifier le risque' : 'Nouveau risque'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsRisqueModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveRisque}>{selectedRisque ? 'Enregistrer' : 'Créer'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Catégorie"
              options={categorieOptions}
              value={risqueFormData.categorie}
              onChange={(e) => setRisqueFormData({ ...risqueFormData, categorie: e.target.value })}
            />
            <Select
              label="Statut"
              options={statutRisqueOptions}
              value={risqueFormData.statut}
              onChange={(e) => setRisqueFormData({ ...risqueFormData, statut: e.target.value as StatutRisque })}
            />
          </div>

          <Textarea
            label="Description du risque"
            rows={3}
            value={risqueFormData.description}
            onChange={(e) => setRisqueFormData({ ...risqueFormData, description: e.target.value })}
            placeholder="Décrivez le risque identifié..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Probabilité"
              options={probabiliteOptions}
              value={String(risqueFormData.probabilite)}
              onChange={(e) => setRisqueFormData({ ...risqueFormData, probabilite: Number(e.target.value) })}
            />
            <Select
              label="Impact"
              options={impactOptions}
              value={String(risqueFormData.impact)}
              onChange={(e) => setRisqueFormData({ ...risqueFormData, impact: Number(e.target.value) })}
            />
          </div>

          <div className="p-4 bg-primary-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-600">Score de risque:</span>
              <span className={`px-3 py-1 rounded-lg font-bold ${getScoreColor(risqueFormData.probabilite * risqueFormData.impact)}`}>
                {risqueFormData.probabilite * risqueFormData.impact} - {getScoreLabel(risqueFormData.probabilite * risqueFormData.impact)}
              </span>
            </div>
          </div>

          <Input
            label="Propriétaire"
            value={risqueFormData.proprietaire}
            onChange={(e) => setRisqueFormData({ ...risqueFormData, proprietaire: e.target.value })}
            placeholder="Responsable du risque"
          />

          <Textarea
            label="Plan de mitigation"
            rows={3}
            value={risqueFormData.planMitigation}
            onChange={(e) => setRisqueFormData({ ...risqueFormData, planMitigation: e.target.value })}
            placeholder="Actions prévues pour réduire le risque..."
          />
        </div>
      </Modal>

      {/* Modal Non-Conformité */}
      <Modal
        isOpen={isNCModalOpen}
        onClose={() => {
          setIsNCModalOpen(false);
          resetNCForm();
        }}
        title="Nouvelle non-conformité"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsNCModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveNC}>Ajouter</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Gravité"
            options={graviteNCOptions}
            value={ncFormData.gravite}
            onChange={(e) => setNCFormData({ ...ncFormData, gravite: e.target.value as GraviteNC })}
          />

          <Textarea
            label="Description"
            rows={3}
            value={ncFormData.description}
            onChange={(e) => setNCFormData({ ...ncFormData, description: e.target.value })}
            placeholder="Décrivez la non-conformité..."
          />

          <Textarea
            label="Action corrective (optionnel)"
            rows={2}
            value={ncFormData.actionCorrective}
            onChange={(e) => setNCFormData({ ...ncFormData, actionCorrective: e.target.value })}
            placeholder="Action corrective prévue..."
          />
        </div>
      </Modal>

      {/* Modal Détail Audit */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAudit(null);
        }}
        title={selectedAudit?.titre || ''}
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)}>
            Fermer
          </Button>
        }
      >
        {selectedAudit && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-primary-500">Type</span>
                <p className={`mt-1 inline-block text-sm px-2 py-1 rounded-full border ${typeAuditColors[selectedAudit.type]}`}>
                  {typeAuditLabels[selectedAudit.type]}
                </p>
              </div>
              <div>
                <span className="text-sm text-primary-500">Statut</span>
                <p className={`mt-1 inline-block text-sm px-2 py-1 rounded-full border ${statutAuditColors[selectedAudit.statut]}`}>
                  {statutAuditLabels[selectedAudit.statut]}
                </p>
              </div>
              <div>
                <span className="text-sm text-primary-500">Date planifiée</span>
                <p className="mt-1 font-medium">
                  {format(new Date(selectedAudit.datePlanifiee), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <div>
                <span className="text-sm text-primary-500">Auditeur</span>
                <p className="mt-1 font-medium">{selectedAudit.auditeur}</p>
              </div>
            </div>

            {selectedAudit.description && (
              <div>
                <span className="text-sm text-primary-500">Description</span>
                <p className="mt-1 text-primary-700">{selectedAudit.description}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-primary-900 mb-3">
                Non-conformités ({selectedAudit.nonConformites.length})
              </h4>
              {selectedAudit.nonConformites.length === 0 ? (
                <p className="text-sm text-primary-400 italic">Aucune non-conformité détectée</p>
              ) : (
                <div className="space-y-2">
                  {selectedAudit.nonConformites.map((nc) => (
                    <div
                      key={nc.id}
                      className={`p-3 rounded-lg border ${
                        nc.statut === 'cloturee'
                          ? 'bg-success/5 border-success/20'
                          : nc.gravite === 'critique'
                          ? 'bg-error/5 border-error/20'
                          : 'bg-white border-primary-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${graviteNCColors[nc.gravite]}`}>
                          {graviteNCLabels[nc.gravite]}
                        </span>
                        <span className="text-xs text-primary-500">
                          {nc.statut === 'cloturee' ? (
                            <span className="text-success">Clôturée</span>
                          ) : (
                            statutNCLabels[nc.statut]
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-primary-700">{nc.description}</p>
                      {nc.actionCorrective && (
                        <p className="text-xs text-primary-500 mt-2">
                          <strong>Action corrective:</strong> {nc.actionCorrective}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Confirmation Suppression */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={deleteType === 'audit' ? 'Supprimer l\'audit' : 'Supprimer le risque'}
        message={
          deleteType === 'audit'
            ? `Êtes-vous sûr de vouloir supprimer l'audit "${selectedAudit?.titre}" et toutes ses non-conformités ?`
            : `Êtes-vous sûr de vouloir supprimer ce risque ?`
        }
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
