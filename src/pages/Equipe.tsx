import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Plus,
  Search,
  Users,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Building2,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Award,
  GraduationCap,
  Clock,
  Filter,
  LayoutGrid,
  List,
  GitBranch,
  UserCircle,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
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
import { useEquipeStore, useCentresStore, useAppStore } from '../store';
import type {
  MembreEquipe,
  Departement,
  TypeContrat,
  StatutMembre,
  NiveauCompetence,
  Competence,
  Formation,
  Absence,
} from '../types';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

type ViewMode = 'grid' | 'list' | 'organigramme';
type FormTab = 'info' | 'contrat' | 'competences' | 'formations' | 'absences';

const departementLabels: Record<Departement, string> = {
  direction: 'Direction',
  facility: 'Facility Management',
  finance: 'Finance',
  securite: 'Sécurité',
  commercial_marketing: 'Commercial & Marketing',
  administration: 'Administration',
};

const departementColors: Record<Departement, string> = {
  direction: 'bg-purple-100 text-purple-800 border-purple-200',
  facility: 'bg-blue-100 text-blue-800 border-blue-200',
  finance: 'bg-green-100 text-green-800 border-green-200',
  securite: 'bg-red-100 text-red-800 border-red-200',
  commercial_marketing: 'bg-orange-100 text-orange-800 border-orange-200',
  administration: 'bg-gray-100 text-gray-800 border-gray-200',
};

const typeContratLabels: Record<TypeContrat, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  stage: 'Stage',
  interim: 'Intérim',
  consultant: 'Consultant',
  prestataire: 'Prestataire',
};

const statutLabels: Record<StatutMembre, string> = {
  actif: 'Actif',
  conge: 'En congé',
  formation: 'En formation',
  mission: 'En mission',
  inactif: 'Inactif',
};

const statutColors: Record<StatutMembre, string> = {
  actif: 'bg-success/10 text-success',
  conge: 'bg-info/10 text-info',
  formation: 'bg-warning/10 text-warning',
  mission: 'bg-purple-100 text-purple-700',
  inactif: 'bg-error/10 text-error',
};

const niveauLabels: Record<NiveauCompetence, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  confirme: 'Confirmé',
  expert: 'Expert',
};

const niveauColors: Record<NiveauCompetence, string> = {
  debutant: 'bg-gray-100 text-gray-700',
  intermediaire: 'bg-blue-100 text-blue-700',
  confirme: 'bg-green-100 text-green-700',
  expert: 'bg-purple-100 text-purple-700',
};

const defaultFormData: Omit<MembreEquipe, 'id' | 'createdAt' | 'updatedAt'> = {
  centreId: '',
  matricule: '',
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  poste: '',
  departement: 'administration',
  typeContrat: 'cdi',
  dateEmbauche: format(new Date(), 'yyyy-MM-dd'),
  statut: 'actif',
  devise: 'XOF',
  competences: [],
  formations: [],
  absences: [],
  objectifs: [],
};

export function Equipe() {
  const { centreId } = useParams<{ centreId: string }>();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const { addToast } = useAppStore();
  const {
    membres,
    loadMembres,
    addMembre,
    updateMembre,
    deleteMembre,
    getMembresByCentre,
    getStatistiques,
    getOrganigramme,
    addCompetence,
    removeCompetence,
    addFormation,
    removeFormation,
    addAbsence,
    removeAbsence,
    isLoading,
  } = useEquipeStore();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartement, setFilterDepartement] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterContrat, setFilterContrat] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMembre, setSelectedMembre] = useState<MembreEquipe | null>(null);
  const [formTab, setFormTab] = useState<FormTab>('info');
  const [formData, setFormData] = useState(defaultFormData);

  // États pour les sous-formulaires
  const [newCompetence, setNewCompetence] = useState({ nom: '', niveau: 'intermediaire' as NiveauCompetence });
  const [newFormation, setNewFormation] = useState({ titre: '', organisme: '', dateDebut: '', enCours: false });
  const [newAbsence, setNewAbsence] = useState({ type: 'conge_paye' as const, dateDebut: '', dateFin: '', motif: '' });

  useEffect(() => {
    if (centreId) {
      loadMembres(centreId);
    }
  }, [centreId]);

  const centreMembres = getMembresByCentre(centreId || '');
  const stats = getStatistiques(centreId || '');
  const organigramme = getOrganigramme(centreId || '');

  // Filtrage
  const filteredMembres = useMemo(() => {
    return centreMembres.filter((m) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !m.nom.toLowerCase().includes(query) &&
          !m.prenom.toLowerCase().includes(query) &&
          !m.poste.toLowerCase().includes(query) &&
          !m.matricule.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (filterDepartement !== 'all' && m.departement !== filterDepartement) return false;
      if (filterStatut !== 'all' && m.statut !== filterStatut) return false;
      if (filterContrat !== 'all' && m.typeContrat !== filterContrat) return false;
      return true;
    });
  }, [centreMembres, searchQuery, filterDepartement, filterStatut, filterContrat]);

  const resetForm = () => {
    setFormData({ ...defaultFormData, centreId: centreId || '' });
    setSelectedMembre(null);
    setFormTab('info');
    setNewCompetence({ nom: '', niveau: 'intermediaire' });
    setNewFormation({ titre: '', organisme: '', dateDebut: '', enCours: false });
    setNewAbsence({ type: 'conge_paye', dateDebut: '', dateFin: '', motif: '' });
  };

  const handleOpenModal = (membre?: MembreEquipe) => {
    if (membre) {
      setSelectedMembre(membre);
      setFormData({
        centreId: membre.centreId,
        matricule: membre.matricule,
        nom: membre.nom,
        prenom: membre.prenom,
        photo: membre.photo,
        email: membre.email,
        telephone: membre.telephone,
        telephoneUrgence: membre.telephoneUrgence,
        dateNaissance: membre.dateNaissance,
        adresse: membre.adresse,
        poste: membre.poste,
        departement: membre.departement,
        typeContrat: membre.typeContrat,
        dateEmbauche: membre.dateEmbauche,
        dateFinContrat: membre.dateFinContrat,
        managerId: membre.managerId,
        statut: membre.statut,
        salaireBase: membre.salaireBase,
        devise: membre.devise,
        competences: membre.competences,
        formations: membre.formations,
        absences: membre.absences,
        objectifs: membre.objectifs,
        notes: membre.notes,
      });
    } else {
      resetForm();
    }
    setFormTab('info');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!centreId) return;

    if (!formData.nom.trim() || !formData.prenom.trim()) {
      addToast({ type: 'error', title: 'Erreur', message: 'Le nom et le prénom sont obligatoires' });
      return;
    }

    try {
      if (selectedMembre) {
        await updateMembre(selectedMembre.id, formData);
        addToast({ type: 'success', title: 'Membre modifié' });
      } else {
        // Générer un matricule si vide
        const matricule = formData.matricule || `EMP-${Date.now().toString(36).toUpperCase()}`;
        await addMembre({ ...formData, centreId, matricule });
        addToast({ type: 'success', title: 'Membre ajouté' });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleDelete = async () => {
    if (!selectedMembre) return;
    try {
      await deleteMembre(selectedMembre.id);
      addToast({ type: 'success', title: 'Membre supprimé' });
      setIsDeleteModalOpen(false);
      setSelectedMembre(null);
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  // Helpers pour compétences/formations/absences dans le formulaire
  const handleAddCompetence = () => {
    if (!newCompetence.nom.trim()) return;
    const comp: Competence = { id: uuidv4(), ...newCompetence };
    setFormData({ ...formData, competences: [...formData.competences, comp] });
    setNewCompetence({ nom: '', niveau: 'intermediaire' });
  };

  const handleRemoveCompetence = (id: string) => {
    setFormData({ ...formData, competences: formData.competences.filter((c) => c.id !== id) });
  };

  const handleAddFormation = () => {
    if (!newFormation.titre.trim()) return;
    const form: Formation = { id: uuidv4(), ...newFormation };
    setFormData({ ...formData, formations: [...formData.formations, form] });
    setNewFormation({ titre: '', organisme: '', dateDebut: '', enCours: false });
  };

  const handleRemoveFormation = (id: string) => {
    setFormData({ ...formData, formations: formData.formations.filter((f) => f.id !== id) });
  };

  const handleAddAbsence = () => {
    if (!newAbsence.dateDebut || !newAbsence.dateFin) return;
    const abs: Absence = { id: uuidv4(), ...newAbsence, validee: false };
    setFormData({ ...formData, absences: [...formData.absences, abs] });
    setNewAbsence({ type: 'conge_paye', dateDebut: '', dateFin: '', motif: '' });
  };

  const handleRemoveAbsence = (id: string) => {
    setFormData({ ...formData, absences: formData.absences.filter((a) => a.id !== id) });
  };

  // Calcul ancienneté
  const getAnciennete = (dateEmbauche: string) => {
    const years = differenceInYears(new Date(), new Date(dateEmbauche));
    const months = differenceInMonths(new Date(), new Date(dateEmbauche)) % 12;
    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''} ${months > 0 ? `${months} mois` : ''}`;
    }
    return `${months} mois`;
  };

  // Liste des managers potentiels
  const managersOptions = [
    { value: '', label: 'Aucun manager' },
    ...centreMembres
      .filter((m) => m.id !== selectedMembre?.id)
      .map((m) => ({ value: m.id, label: `${m.prenom} ${m.nom} - ${m.poste}` })),
  ];

  // Composant carte membre
  const MembreCard = ({ membre }: { membre: MembreEquipe }) => {
    const manager = centreMembres.find((m) => m.id === membre.managerId);

    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOpenModal(membre)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
              {membre.prenom[0]}{membre.nom[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-primary-900 truncate">
                  {membre.prenom} {membre.nom}
                </h3>
                <Badge className={statutColors[membre.statut]} size="sm">
                  {statutLabels[membre.statut]}
                </Badge>
              </div>
              <p className="text-sm text-primary-600">{membre.poste}</p>
              <Badge className={`mt-1 ${departementColors[membre.departement]}`} size="sm">
                {departementLabels[membre.departement]}
              </Badge>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-primary-100 space-y-2">
            <div className="flex items-center gap-2 text-sm text-primary-500">
              <Mail className="w-4 h-4" />
              <span className="truncate">{membre.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-500">
              <Phone className="w-4 h-4" />
              <span>{membre.telephone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-500">
              <Calendar className="w-4 h-4" />
              <span>Ancienneté: {getAnciennete(membre.dateEmbauche)}</span>
            </div>
            {manager && (
              <div className="flex items-center gap-2 text-sm text-primary-500">
                <UserCircle className="w-4 h-4" />
                <span>Manager: {manager.prenom} {manager.nom}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Badge size="sm">{typeContratLabels[membre.typeContrat]}</Badge>
            <span className="text-xs text-primary-400">{membre.matricule}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Composant organigramme
  const OrgNode = ({ membre, subordinates, level = 0 }: { membre: MembreEquipe; subordinates: MembreEquipe[]; level?: number }) => {
    const [expanded, setExpanded] = useState(true);
    const subOrgData = subordinates.map((sub) => ({
      membre: sub,
      subordinates: centreMembres.filter((m) => m.managerId === sub.id),
    }));

    return (
      <div className={`${level > 0 ? 'ml-8 border-l-2 border-primary-200 pl-4' : ''}`}>
        <div
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-primary-200 hover:border-accent cursor-pointer mb-2"
          onClick={() => handleOpenModal(membre)}
        >
          {subordinates.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="p-1 hover:bg-primary-100 rounded"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
            {membre.prenom[0]}{membre.nom[0]}
          </div>
          <div className="flex-1">
            <p className="font-medium text-primary-900">{membre.prenom} {membre.nom}</p>
            <p className="text-sm text-primary-500">{membre.poste}</p>
          </div>
          <Badge className={departementColors[membre.departement]} size="sm">
            {departementLabels[membre.departement]}
          </Badge>
        </div>

        {expanded && subordinates.length > 0 && (
          <div className="space-y-2">
            {subOrgData.map((data) => (
              <OrgNode key={data.membre.id} membre={data.membre} subordinates={data.subordinates} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Équipe</h1>
          <p className="text-primary-500 mt-1">{centre?.nom}</p>
        </div>
        <Button leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
          Nouveau membre
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-900">{stats.totalMembres}</p>
                <p className="text-sm text-primary-500">Total</p>
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
                <p className="text-2xl font-bold text-success">{stats.parStatut.actif}</p>
                <p className="text-sm text-primary-500">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <Briefcase className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-info">{stats.parTypeContrat.cdi}</p>
                <p className="text-sm text-primary-500">CDI</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{stats.ancienneteMovenne.toFixed(1)}</p>
                <p className="text-sm text-primary-500">Anc. moy. (ans)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{stats.tauxPresence.toFixed(0)}%</p>
                <p className="text-sm text-primary-500">Présence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.masseSalariale ? (stats.masseSalariale / 1000000).toFixed(1) + 'M' : '-'}
                </p>
                <p className="text-sm text-primary-500">Masse sal.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et vues */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 border border-primary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <Select
          options={[
            { value: 'all', label: 'Tous les départements' },
            ...Object.entries(departementLabels).map(([value, label]) => ({ value, label })),
          ]}
          value={filterDepartement}
          onChange={(e) => setFilterDepartement(e.target.value)}
          className="w-44"
        />

        <Select
          options={[
            { value: 'all', label: 'Tous les statuts' },
            ...Object.entries(statutLabels).map(([value, label]) => ({ value, label })),
          ]}
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="w-36"
        />

        <Select
          options={[
            { value: 'all', label: 'Tous les contrats' },
            ...Object.entries(typeContratLabels).map(([value, label]) => ({ value, label })),
          ]}
          value={filterContrat}
          onChange={(e) => setFilterContrat(e.target.value)}
          className="w-36"
        />

        <div className="flex border border-primary-200 rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-primary-900 text-white' : 'bg-white text-primary-600 hover:bg-primary-50'}`}
            title="Vue Grille"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-primary-900 text-white' : 'bg-white text-primary-600 hover:bg-primary-50'}`}
            title="Vue Liste"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('organigramme')}
            className={`p-2 ${viewMode === 'organigramme' ? 'bg-primary-900 text-white' : 'bg-white text-primary-600 hover:bg-primary-50'}`}
            title="Organigramme"
          >
            <GitBranch className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenu */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembres.map((membre) => (
            <MembreCard key={membre.id} membre={membre} />
          ))}
          {filteredMembres.length === 0 && (
            <div className="col-span-full text-center py-12 text-primary-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun membre trouvé</p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-primary-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700">Membre</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700">Poste</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700">Département</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700">Contrat</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-700">Ancienneté</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredMembres.map((membre) => (
                  <tr
                    key={membre.id}
                    className="border-b border-primary-100 hover:bg-primary-50 cursor-pointer"
                    onClick={() => handleOpenModal(membre)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                          {membre.prenom[0]}{membre.nom[0]}
                        </div>
                        <div>
                          <p className="font-medium text-primary-900">{membre.prenom} {membre.nom}</p>
                          <p className="text-xs text-primary-500">{membre.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-primary-700">{membre.poste}</td>
                    <td className="py-3 px-4">
                      <Badge className={departementColors[membre.departement]} size="sm">
                        {departementLabels[membre.departement]}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge size="sm">{typeContratLabels[membre.typeContrat]}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={statutColors[membre.statut]} size="sm">
                        {statutLabels[membre.statut]}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-primary-600">
                      {getAnciennete(membre.dateEmbauche)}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMembre(membre);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-error" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {viewMode === 'organigramme' && (
        <div className="space-y-4">
          {organigramme.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GitBranch className="w-12 h-12 mx-auto mb-4 text-primary-300" />
                <p className="text-primary-500">Aucun membre dans l'équipe</p>
              </CardContent>
            </Card>
          ) : (
            organigramme.map((data) => (
              <OrgNode key={data.membre.id} membre={data.membre} subordinates={data.subordinates} />
            ))
          )}
        </div>
      )}

      {/* Modal Création/Édition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={selectedMembre ? `${selectedMembre.prenom} ${selectedMembre.nom}` : 'Nouveau membre'}
        size="xl"
        footer={
          <>
            {selectedMembre && (
              <Button
                variant="ghost"
                onClick={() => { setIsModalOpen(false); setIsDeleteModalOpen(true); }}
                className="text-error mr-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            )}
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>{selectedMembre ? 'Enregistrer' : 'Créer'}</Button>
          </>
        }
      >
        {/* Tabs */}
        <div className="flex border-b border-primary-200 mb-4 -mt-2">
          {[
            { id: 'info', label: 'Informations', icon: UserCircle },
            { id: 'contrat', label: 'Contrat', icon: Briefcase },
            { id: 'competences', label: 'Compétences', icon: Award },
            { id: 'formations', label: 'Formations', icon: GraduationCap },
            { id: 'absences', label: 'Absences', icon: Calendar },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFormTab(id as FormTab)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                formTab === id ? 'border-accent text-accent' : 'border-transparent text-primary-500 hover:text-primary-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Informations */}
        {formTab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Matricule"
                value={formData.matricule}
                onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                placeholder="Auto-généré si vide"
              />
              <Input
                label="Prénom *"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
              />
              <Input
                label="Nom *"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="Téléphone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date de naissance"
                type="date"
                value={formData.dateNaissance || ''}
                onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
              />
              <Input
                label="Téléphone d'urgence"
                value={formData.telephoneUrgence || ''}
                onChange={(e) => setFormData({ ...formData, telephoneUrgence: e.target.value })}
              />
            </div>

            <Textarea
              label="Adresse"
              rows={2}
              value={formData.adresse || ''}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
            />

            <Textarea
              label="Notes"
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes internes..."
            />
          </div>
        )}

        {/* Tab: Contrat */}
        {formTab === 'contrat' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Poste"
                value={formData.poste}
                onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
              />
              <Select
                label="Département"
                options={Object.entries(departementLabels).map(([value, label]) => ({ value, label }))}
                value={formData.departement}
                onChange={(e) => setFormData({ ...formData, departement: e.target.value as Departement })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Type de contrat"
                options={Object.entries(typeContratLabels).map(([value, label]) => ({ value, label }))}
                value={formData.typeContrat}
                onChange={(e) => setFormData({ ...formData, typeContrat: e.target.value as TypeContrat })}
              />
              <Select
                label="Statut"
                options={Object.entries(statutLabels).map(([value, label]) => ({ value, label }))}
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as StatutMembre })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date d'embauche"
                type="date"
                value={formData.dateEmbauche}
                onChange={(e) => setFormData({ ...formData, dateEmbauche: e.target.value })}
              />
              {(formData.typeContrat === 'cdd' || formData.typeContrat === 'stage' || formData.typeContrat === 'interim') && (
                <Input
                  label="Date de fin de contrat"
                  type="date"
                  value={formData.dateFinContrat || ''}
                  onChange={(e) => setFormData({ ...formData, dateFinContrat: e.target.value })}
                />
              )}
            </div>

            <Select
              label="Manager"
              options={managersOptions}
              value={formData.managerId || ''}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value || undefined })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Salaire de base"
                type="number"
                value={formData.salaireBase || ''}
                onChange={(e) => setFormData({ ...formData, salaireBase: Number(e.target.value) || undefined })}
                leftIcon={<DollarSign className="w-4 h-4" />}
              />
              <Select
                label="Devise"
                options={[
                  { value: 'XOF', label: 'XOF (FCFA)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'USD', label: 'USD ($)' },
                ]}
                value={formData.devise}
                onChange={(e) => setFormData({ ...formData, devise: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Tab: Compétences */}
        {formTab === 'competences' && (
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <Input
                  label="Compétence"
                  value={newCompetence.nom}
                  onChange={(e) => setNewCompetence({ ...newCompetence, nom: e.target.value })}
                  placeholder="Ex: Excel, Management..."
                />
                <Select
                  label="Niveau"
                  options={Object.entries(niveauLabels).map(([value, label]) => ({ value, label }))}
                  value={newCompetence.niveau}
                  onChange={(e) => setNewCompetence({ ...newCompetence, niveau: e.target.value as NiveauCompetence })}
                />
              </div>
              <Button onClick={handleAddCompetence} disabled={!newCompetence.nom.trim()} className="w-full">
                <Plus className="w-4 h-4 mr-1" /> Ajouter
              </Button>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {formData.competences.length === 0 ? (
                <p className="text-center py-6 text-primary-400">Aucune compétence</p>
              ) : (
                formData.competences.map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between p-3 bg-white border border-primary-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-primary-400" />
                      <span className="font-medium text-primary-900">{comp.nom}</span>
                      <Badge className={niveauColors[comp.niveau]} size="sm">{niveauLabels[comp.niveau]}</Badge>
                    </div>
                    <button onClick={() => handleRemoveCompetence(comp.id)} className="p-1 text-primary-400 hover:text-error">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Formations */}
        {formTab === 'formations' && (
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Titre de la formation"
                  value={newFormation.titre}
                  onChange={(e) => setNewFormation({ ...newFormation, titre: e.target.value })}
                />
                <Input
                  label="Organisme"
                  value={newFormation.organisme}
                  onChange={(e) => setNewFormation({ ...newFormation, organisme: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date de début"
                  type="date"
                  value={newFormation.dateDebut}
                  onChange={(e) => setNewFormation({ ...newFormation, dateDebut: e.target.value })}
                />
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="enCours"
                    checked={newFormation.enCours}
                    onChange={(e) => setNewFormation({ ...newFormation, enCours: e.target.checked })}
                    className="rounded border-primary-300"
                  />
                  <label htmlFor="enCours" className="text-sm text-primary-700">En cours</label>
                </div>
              </div>
              <Button onClick={handleAddFormation} disabled={!newFormation.titre.trim()} className="w-full">
                <Plus className="w-4 h-4 mr-1" /> Ajouter
              </Button>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {formData.formations.length === 0 ? (
                <p className="text-center py-6 text-primary-400">Aucune formation</p>
              ) : (
                formData.formations.map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-3 bg-white border border-primary-200 rounded-lg">
                    <div>
                      <p className="font-medium text-primary-900">{form.titre}</p>
                      <p className="text-sm text-primary-500">{form.organisme} - {form.dateDebut}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {form.enCours && <Badge size="sm" className="bg-info/10 text-info">En cours</Badge>}
                      <button onClick={() => handleRemoveFormation(form.id)} className="p-1 text-primary-400 hover:text-error">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Absences */}
        {formTab === 'absences' && (
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Type d'absence"
                  options={[
                    { value: 'conge_paye', label: 'Congé payé' },
                    { value: 'maladie', label: 'Maladie' },
                    { value: 'formation', label: 'Formation' },
                    { value: 'mission', label: 'Mission' },
                    { value: 'autre', label: 'Autre' },
                  ]}
                  value={newAbsence.type}
                  onChange={(e) => setNewAbsence({ ...newAbsence, type: e.target.value as any })}
                />
                <Input
                  label="Motif"
                  value={newAbsence.motif}
                  onChange={(e) => setNewAbsence({ ...newAbsence, motif: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date de début"
                  type="date"
                  value={newAbsence.dateDebut}
                  onChange={(e) => setNewAbsence({ ...newAbsence, dateDebut: e.target.value })}
                />
                <Input
                  label="Date de fin"
                  type="date"
                  value={newAbsence.dateFin}
                  onChange={(e) => setNewAbsence({ ...newAbsence, dateFin: e.target.value })}
                />
              </div>
              <Button onClick={handleAddAbsence} disabled={!newAbsence.dateDebut || !newAbsence.dateFin} className="w-full">
                <Plus className="w-4 h-4 mr-1" /> Ajouter
              </Button>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {formData.absences.length === 0 ? (
                <p className="text-center py-6 text-primary-400">Aucune absence enregistrée</p>
              ) : (
                formData.absences.map((abs) => (
                  <div key={abs.id} className="flex items-center justify-between p-3 bg-white border border-primary-200 rounded-lg">
                    <div>
                      <p className="font-medium text-primary-900">
                        {abs.type === 'conge_paye' ? 'Congé payé' : abs.type === 'maladie' ? 'Maladie' : abs.type}
                      </p>
                      <p className="text-sm text-primary-500">
                        Du {format(new Date(abs.dateDebut), 'dd/MM/yyyy')} au {format(new Date(abs.dateFin), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge size="sm" className={abs.validee ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                        {abs.validee ? 'Validée' : 'En attente'}
                      </Badge>
                      <button onClick={() => handleRemoveAbsence(abs.id)} className="p-1 text-primary-400 hover:text-error">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Suppression */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le membre"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedMembre?.prenom} ${selectedMembre?.nom} de l'équipe ?`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
