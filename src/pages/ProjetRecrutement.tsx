import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Users,
  Plus,
  ChevronLeft,
  UserPlus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  Save,
  Briefcase,
  Calendar,
  DollarSign,
  ChevronRight,
  FileText,
  GraduationCap,
  Target,
  Star,
  Package,
  BookOpen,
  X,
  User,
  Mail,
  Phone,
  Link,
  Globe,
  Award,
  Laptop,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Modal, Select, Textarea } from '../components/ui';
import { useCentresStore, useProjetStore, useAppStore } from '../store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type {
  VagueRecrutement,
  PosteARecruter,
  StatutRecrutement,
  TypeContratRecrutement,
  SourceRecrutement,
  NiveauEtudes,
  CompetenceRequise,
  CandidatRecrutement,
  EquipementIntegration,
  FormationIntegration,
} from '../types';

// Couleurs par statut
const statutColors: Record<StatutRecrutement, { bg: string; text: string; label: string }> = {
  a_lancer: { bg: 'bg-primary-100', text: 'text-primary-600', label: 'À lancer' },
  en_cours: { bg: 'bg-info/20', text: 'text-info', label: 'En cours' },
  shortlist: { bg: 'bg-purple-100', text: 'text-purple-600', label: 'Shortlist' },
  offre_envoyee: { bg: 'bg-warning/20', text: 'text-warning', label: 'Offre envoyée' },
  negocie: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Négociation' },
  accepte: { bg: 'bg-success/20', text: 'text-success', label: 'Accepté' },
  integre: { bg: 'bg-success', text: 'text-white', label: 'Intégré' },
  annule: { bg: 'bg-error/20', text: 'text-error', label: 'Annulé' },
};

// Pipeline de recrutement (colonnes Kanban)
const pipelineStages: StatutRecrutement[] = [
  'a_lancer',
  'en_cours',
  'shortlist',
  'offre_envoyee',
  'negocie',
  'accepte',
  'integre',
];

// Labels pour les types
const typeContratLabels: Record<TypeContratRecrutement, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  stage: 'Stage',
  interim: 'Intérim',
  consultant: 'Consultant',
};

const sourceLabels: Record<SourceRecrutement, string> = {
  interne: 'Mobilité interne',
  cabinet: 'Cabinet de recrutement',
  jobboard: 'Jobboard',
  cooptation: 'Cooptation',
  linkedin: 'LinkedIn',
  spontanee: 'Candidature spontanée',
  autre: 'Autre',
};

const niveauEtudesLabels: Record<NiveauEtudes, string> = {
  bac: 'Bac',
  bac2: 'Bac +2',
  bac3: 'Bac +3 (Licence)',
  bac5: 'Bac +5 (Master)',
  doctorat: 'Doctorat',
  autre: 'Autre',
};

const niveauCompetenceLabels: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  confirme: 'Confirmé',
  expert: 'Expert',
};

const candidatStatutLabels: Record<string, { label: string; color: string }> = {
  recu: { label: 'CV reçu', color: 'bg-gray-100 text-gray-700' },
  preselectionne: { label: 'Présélectionné', color: 'bg-blue-100 text-blue-700' },
  entretien_planifie: { label: 'Entretien planifié', color: 'bg-purple-100 text-purple-700' },
  entretien_realise: { label: 'Entretien réalisé', color: 'bg-orange-100 text-orange-700' },
  retenu: { label: 'Retenu', color: 'bg-success/20 text-success' },
  refuse: { label: 'Refusé', color: 'bg-error/20 text-error' },
  desiste: { label: 'Désisté', color: 'bg-gray-200 text-gray-500' },
};

type PosteFormTab = 'poste' | 'recrutement' | 'candidats' | 'integration';

// Valeurs par défaut du formulaire
const getDefaultFormData = (vagues: VagueRecrutement[], projetId: string): Partial<PosteARecruter> => ({
  vagueId: vagues[0]?.id || '',
  projetId,
  titre: '',
  departement: '',
  typeContrat: 'cdi',
  missions: '',
  competencesRequises: [],
  experienceRequise: 0,
  niveauEtudes: 'bac3',
  languesRequises: [],
  salaireMensuel: 0,
  devise: 'XOF',
  dateEntreePrevue: format(new Date(), 'yyyy-MM-dd'),
  priorite: 'moyenne',
  statut: 'a_lancer',
  candidats: [],
  equipementsNecessaires: [],
  formationsAPlanifier: [],
  commentaire: '',
});

// Modal d'édition de poste
function PosteModal({
  isOpen,
  onClose,
  poste,
  vagues,
  projetId,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  poste?: PosteARecruter;
  vagues: VagueRecrutement[];
  projetId: string;
  onSave: (data: Partial<PosteARecruter>) => void;
}) {
  const { addToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<PosteFormTab>('poste');
  const [formData, setFormData] = useState<Partial<PosteARecruter>>(getDefaultFormData(vagues, projetId));

  // États pour les sous-formulaires
  const [newCompetence, setNewCompetence] = useState({ nom: '', niveau: 'intermediaire', obligatoire: true });
  const [newLangue, setNewLangue] = useState('');
  const [newCandidat, setNewCandidat] = useState<Partial<CandidatRecrutement>>({
    nom: '', prenom: '', email: '', telephone: '', sourceCandidat: 'jobboard', statut: 'recu',
    dateReception: format(new Date(), 'yyyy-MM-dd'),
  });
  const [newEquipement, setNewEquipement] = useState({ type: 'materiel' as const, description: '' });
  const [newFormation, setNewFormation] = useState({ titre: '', type: 'interne' as const, duree: '', obligatoire: true });

  useEffect(() => {
    if (poste) {
      setFormData({
        ...poste,
        dateEntreePrevue: format(new Date(poste.dateEntreePrevue), 'yyyy-MM-dd'),
        datePublication: poste.datePublication ? format(new Date(poste.datePublication), 'yyyy-MM-dd') : undefined,
        dateLimite: poste.dateLimite ? format(new Date(poste.dateLimite), 'yyyy-MM-dd') : undefined,
      });
    } else {
      setFormData(getDefaultFormData(vagues, projetId));
    }
    setActiveTab('poste');
  }, [poste, vagues, projetId, isOpen]);

  const handleSubmit = () => {
    if (!formData.titre?.trim()) {
      addToast({ type: 'error', title: 'Erreur', message: 'Le titre du poste est obligatoire' });
      return;
    }
    if (!formData.departement?.trim()) {
      addToast({ type: 'error', title: 'Erreur', message: 'Le département est obligatoire' });
      return;
    }

    onSave({
      ...formData,
      dateEntreePrevue: formData.dateEntreePrevue ? new Date(formData.dateEntreePrevue).toISOString() : new Date().toISOString(),
      datePublication: formData.datePublication ? new Date(formData.datePublication).toISOString() : undefined,
      dateLimite: formData.dateLimite ? new Date(formData.dateLimite).toISOString() : undefined,
      projetId,
    });
    onClose();
  };

  // Helpers compétences
  const addCompetence = () => {
    if (!newCompetence.nom.trim()) return;
    const comp: CompetenceRequise = {
      id: uuidv4(),
      nom: newCompetence.nom,
      niveau: newCompetence.niveau as any,
      obligatoire: newCompetence.obligatoire,
    };
    setFormData({ ...formData, competencesRequises: [...(formData.competencesRequises || []), comp] });
    setNewCompetence({ nom: '', niveau: 'intermediaire', obligatoire: true });
  };

  const removeCompetence = (id: string) => {
    setFormData({ ...formData, competencesRequises: formData.competencesRequises?.filter((c) => c.id !== id) || [] });
  };

  // Helpers langues
  const addLangue = () => {
    if (!newLangue.trim() || formData.languesRequises?.includes(newLangue.trim())) return;
    setFormData({ ...formData, languesRequises: [...(formData.languesRequises || []), newLangue.trim()] });
    setNewLangue('');
  };

  const removeLangue = (langue: string) => {
    setFormData({ ...formData, languesRequises: formData.languesRequises?.filter((l) => l !== langue) || [] });
  };

  // Helpers candidats
  const addCandidat = () => {
    if (!newCandidat.nom?.trim() || !newCandidat.prenom?.trim()) return;
    const candidat: CandidatRecrutement = {
      id: uuidv4(),
      nom: newCandidat.nom!,
      prenom: newCandidat.prenom!,
      email: newCandidat.email,
      telephone: newCandidat.telephone,
      sourceCandidat: newCandidat.sourceCandidat || 'jobboard',
      dateReception: newCandidat.dateReception || new Date().toISOString(),
      statut: newCandidat.statut || 'recu',
      pretentionSalariale: newCandidat.pretentionSalariale,
    };
    setFormData({ ...formData, candidats: [...(formData.candidats || []), candidat] });
    setNewCandidat({ nom: '', prenom: '', email: '', telephone: '', sourceCandidat: 'jobboard', statut: 'recu', dateReception: format(new Date(), 'yyyy-MM-dd') });
  };

  const removeCandidat = (id: string) => {
    setFormData({ ...formData, candidats: formData.candidats?.filter((c) => c.id !== id) || [] });
  };

  const updateCandidatStatut = (id: string, statut: string) => {
    setFormData({
      ...formData,
      candidats: formData.candidats?.map((c) => c.id === id ? { ...c, statut: statut as any } : c) || [],
    });
  };

  // Helpers équipements
  const addEquipement = () => {
    if (!newEquipement.description.trim()) return;
    const equip: EquipementIntegration = {
      id: uuidv4(),
      type: newEquipement.type,
      description: newEquipement.description,
      commande: false,
      recu: false,
    };
    setFormData({ ...formData, equipementsNecessaires: [...(formData.equipementsNecessaires || []), equip] });
    setNewEquipement({ type: 'materiel', description: '' });
  };

  const removeEquipement = (id: string) => {
    setFormData({ ...formData, equipementsNecessaires: formData.equipementsNecessaires?.filter((e) => e.id !== id) || [] });
  };

  // Helpers formations
  const addFormationIntegration = () => {
    if (!newFormation.titre.trim()) return;
    const form: FormationIntegration = {
      id: uuidv4(),
      titre: newFormation.titre,
      type: newFormation.type,
      duree: newFormation.duree,
      planifiee: false,
      obligatoire: newFormation.obligatoire,
    };
    setFormData({ ...formData, formationsAPlanifier: [...(formData.formationsAPlanifier || []), form] });
    setNewFormation({ titre: '', type: 'interne', duree: '', obligatoire: true });
  };

  const removeFormationIntegration = (id: string) => {
    setFormData({ ...formData, formationsAPlanifier: formData.formationsAPlanifier?.filter((f) => f.id !== id) || [] });
  };

  const tabs = [
    { id: 'poste', label: 'Poste', icon: Briefcase },
    { id: 'recrutement', label: 'Recrutement', icon: Target },
    { id: 'candidats', label: 'Candidats', icon: Users, badge: formData.candidats?.length },
    { id: 'integration', label: 'Intégration', icon: Package },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={poste ? `Modifier: ${poste.titre}` : 'Nouveau poste'}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} leftIcon={<Save className="w-4 h-4" />}>
            {poste ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      {/* Tabs */}
      <div className="flex border-b border-primary-200 mb-4 -mt-2">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id as PosteFormTab)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id ? 'border-accent text-accent' : 'border-transparent text-primary-500 hover:text-primary-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {badge !== undefined && badge > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">{badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Poste */}
      {activeTab === 'poste' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Titre du poste *"
              value={formData.titre || ''}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              placeholder="Ex: Center Manager"
              required
            />
            <Input
              label="Département *"
              value={formData.departement || ''}
              onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
              placeholder="Ex: Direction"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Type de contrat"
              options={Object.entries(typeContratLabels).map(([value, label]) => ({ value, label }))}
              value={formData.typeContrat || 'cdi'}
              onChange={(e) => setFormData({ ...formData, typeContrat: e.target.value as TypeContratRecrutement })}
            />
            {(formData.typeContrat === 'cdd' || formData.typeContrat === 'stage') && (
              <Input
                label="Durée (mois)"
                type="number"
                value={formData.dureeContrat || ''}
                onChange={(e) => setFormData({ ...formData, dureeContrat: Number(e.target.value) })}
              />
            )}
            <Select
              label="Niveau d'études"
              options={Object.entries(niveauEtudesLabels).map(([value, label]) => ({ value, label }))}
              value={formData.niveauEtudes || 'bac3'}
              onChange={(e) => setFormData({ ...formData, niveauEtudes: e.target.value as NiveauEtudes })}
            />
            <Input
              label="Expérience (années)"
              type="number"
              min={0}
              value={formData.experienceRequise || 0}
              onChange={(e) => setFormData({ ...formData, experienceRequise: Number(e.target.value) })}
            />
          </div>

          <Textarea
            label="Missions principales"
            rows={4}
            value={formData.missions || ''}
            onChange={(e) => setFormData({ ...formData, missions: e.target.value })}
            placeholder="Décrivez les missions et responsabilités du poste..."
          />

          {/* Compétences requises */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              <Award className="w-4 h-4 inline mr-1" />
              Compétences requises
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.competencesRequises?.map((comp) => (
                <Badge key={comp.id} className={`flex items-center gap-1 ${comp.obligatoire ? 'bg-accent/10 text-accent' : 'bg-primary-100 text-primary-700'}`}>
                  {comp.nom} ({niveauCompetenceLabels[comp.niveau]})
                  {comp.obligatoire && <Star className="w-3 h-3" />}
                  <button type="button" onClick={() => removeCompetence(comp.id)} className="ml-1 hover:text-error">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <Input
                value={newCompetence.nom}
                onChange={(e) => setNewCompetence({ ...newCompetence, nom: e.target.value })}
                placeholder="Compétence..."
                className="flex-1"
              />
              <Select
                options={Object.entries(niveauCompetenceLabels).map(([value, label]) => ({ value, label }))}
                value={newCompetence.niveau}
                onChange={(e) => setNewCompetence({ ...newCompetence, niveau: e.target.value })}
                className="w-36"
              />
              <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={newCompetence.obligatoire}
                  onChange={(e) => setNewCompetence({ ...newCompetence, obligatoire: e.target.checked })}
                  className="rounded"
                />
                Obligatoire
              </label>
              <Button type="button" size="sm" onClick={addCompetence} disabled={!newCompetence.nom.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Langues */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Langues requises
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.languesRequises?.map((langue) => (
                <Badge key={langue} className="bg-primary-100 text-primary-700 flex items-center gap-1">
                  {langue}
                  <button type="button" onClick={() => removeLangue(langue)} className="hover:text-error">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLangue}
                onChange={(e) => setNewLangue(e.target.value)}
                placeholder="Ex: Français, Anglais..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLangue())}
              />
              <Button type="button" size="sm" onClick={addLangue} disabled={!newLangue.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Textarea
            label="Avantages proposés"
            rows={2}
            value={formData.avantages || ''}
            onChange={(e) => setFormData({ ...formData, avantages: e.target.value })}
            placeholder="Ex: Mutuelle, tickets restaurant, télétravail..."
          />
        </div>
      )}

      {/* Tab: Recrutement */}
      {activeTab === 'recrutement' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Vague de recrutement"
              options={vagues.map((v) => ({ value: v.id, label: `Vague ${v.numero} - ${v.nom}` }))}
              value={formData.vagueId || ''}
              onChange={(e) => setFormData({ ...formData, vagueId: e.target.value })}
            />
            <Select
              label="Priorité"
              options={[
                { value: 'critique', label: 'Critique' },
                { value: 'haute', label: 'Haute' },
                { value: 'moyenne', label: 'Moyenne' },
                { value: 'basse', label: 'Basse' },
              ]}
              value={formData.priorite || 'moyenne'}
              onChange={(e) => setFormData({ ...formData, priorite: e.target.value as any })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Statut"
              options={Object.entries(statutColors).map(([key, { label }]) => ({ value: key, label }))}
              value={formData.statut || 'a_lancer'}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value as StatutRecrutement })}
            />
            <Input
              label="Date d'entrée prévue"
              type="date"
              value={formData.dateEntreePrevue || ''}
              onChange={(e) => setFormData({ ...formData, dateEntreePrevue: e.target.value })}
            />
          </div>

          <div className="p-4 bg-primary-50 rounded-lg">
            <h4 className="font-medium text-primary-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Rémunération
            </h4>
            <div className="grid grid-cols-4 gap-4">
              <Input
                label="Salaire mensuel"
                type="number"
                value={formData.salaireMensuel || 0}
                onChange={(e) => setFormData({ ...formData, salaireMensuel: Number(e.target.value) })}
              />
              <Input
                label="Salaire min"
                type="number"
                value={formData.salaireMin || ''}
                onChange={(e) => setFormData({ ...formData, salaireMin: Number(e.target.value) })}
                placeholder="Fourchette basse"
              />
              <Input
                label="Salaire max"
                type="number"
                value={formData.salaireMax || ''}
                onChange={(e) => setFormData({ ...formData, salaireMax: Number(e.target.value) })}
                placeholder="Fourchette haute"
              />
              <Input
                label="Variable prévu"
                type="number"
                value={formData.variablePrevu || ''}
                onChange={(e) => setFormData({ ...formData, variablePrevu: Number(e.target.value) })}
                placeholder="Bonus annuel"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Source de recrutement"
              options={[
                { value: '', label: 'Non définie' },
                ...Object.entries(sourceLabels).map(([value, label]) => ({ value, label })),
              ]}
              value={formData.sourceRecrutement || ''}
              onChange={(e) => setFormData({ ...formData, sourceRecrutement: e.target.value as SourceRecrutement })}
            />
            <Input
              label="Responsable recrutement"
              value={formData.responsableRecrutement || ''}
              onChange={(e) => setFormData({ ...formData, responsableRecrutement: e.target.value })}
              placeholder="Nom du recruteur"
            />
          </div>

          {formData.sourceRecrutement === 'cabinet' && (
            <Input
              label="Cabinet de recrutement"
              value={formData.cabinetRecrutement || ''}
              onChange={(e) => setFormData({ ...formData, cabinetRecrutement: e.target.value })}
              placeholder="Nom du cabinet"
            />
          )}

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="URL de l'annonce"
              value={formData.urlAnnonce || ''}
              onChange={(e) => setFormData({ ...formData, urlAnnonce: e.target.value })}
              placeholder="https://..."
              leftIcon={<Link className="w-4 h-4" />}
            />
            <Input
              label="Date de publication"
              type="date"
              value={formData.datePublication || ''}
              onChange={(e) => setFormData({ ...formData, datePublication: e.target.value })}
            />
            <Input
              label="Date limite candidature"
              type="date"
              value={formData.dateLimite || ''}
              onChange={(e) => setFormData({ ...formData, dateLimite: e.target.value })}
            />
          </div>

          <Textarea
            label="Commentaires"
            rows={2}
            value={formData.commentaire || ''}
            onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
            placeholder="Notes sur le recrutement..."
          />
        </div>
      )}

      {/* Tab: Candidats */}
      {activeTab === 'candidats' && (
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 rounded-lg">
            <h4 className="font-medium text-primary-900 mb-3">Ajouter un candidat</h4>
            <div className="grid grid-cols-4 gap-3 mb-3">
              <Input
                label="Prénom"
                value={newCandidat.prenom || ''}
                onChange={(e) => setNewCandidat({ ...newCandidat, prenom: e.target.value })}
              />
              <Input
                label="Nom"
                value={newCandidat.nom || ''}
                onChange={(e) => setNewCandidat({ ...newCandidat, nom: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={newCandidat.email || ''}
                onChange={(e) => setNewCandidat({ ...newCandidat, email: e.target.value })}
              />
              <Input
                label="Téléphone"
                value={newCandidat.telephone || ''}
                onChange={(e) => setNewCandidat({ ...newCandidat, telephone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Select
                label="Source"
                options={Object.entries(sourceLabels).map(([value, label]) => ({ value, label }))}
                value={newCandidat.sourceCandidat || 'jobboard'}
                onChange={(e) => setNewCandidat({ ...newCandidat, sourceCandidat: e.target.value as SourceRecrutement })}
              />
              <Input
                label="Prétention salariale"
                type="number"
                value={newCandidat.pretentionSalariale || ''}
                onChange={(e) => setNewCandidat({ ...newCandidat, pretentionSalariale: Number(e.target.value) })}
                placeholder="FCFA/mois"
              />
              <div className="flex items-end">
                <Button type="button" onClick={addCandidat} disabled={!newCandidat.nom?.trim() || !newCandidat.prenom?.trim()} className="w-full">
                  <Plus className="w-4 h-4 mr-1" /> Ajouter
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {(!formData.candidats || formData.candidats.length === 0) ? (
              <div className="text-center py-8 text-primary-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucun candidat enregistré</p>
              </div>
            ) : (
              formData.candidats.map((candidat) => {
                const statutConfig = candidatStatutLabels[candidat.statut];
                return (
                  <div key={candidat.id} className="flex items-center gap-3 p-3 bg-white border border-primary-200 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                      {candidat.prenom[0]}{candidat.nom[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-primary-900">{candidat.prenom} {candidat.nom}</p>
                      <div className="flex items-center gap-3 text-xs text-primary-500">
                        {candidat.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{candidat.email}</span>}
                        {candidat.telephone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{candidat.telephone}</span>}
                        {candidat.pretentionSalariale && <span>{candidat.pretentionSalariale.toLocaleString()} XOF</span>}
                      </div>
                    </div>
                    <Select
                      options={Object.entries(candidatStatutLabels).map(([value, { label }]) => ({ value, label }))}
                      value={candidat.statut}
                      onChange={(e) => updateCandidatStatut(candidat.id, e.target.value)}
                      className="w-40"
                    />
                    <button type="button" onClick={() => removeCandidat(candidat.id)} className="p-1 text-primary-400 hover:text-error">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {formData.candidats && formData.candidats.length > 0 && (
            <div className="p-3 bg-info/10 rounded-lg">
              <p className="text-sm text-info">
                <strong>{formData.candidats.filter((c) => c.statut === 'retenu').length}</strong> candidat(s) retenu(s) sur{' '}
                <strong>{formData.candidats.length}</strong> candidatures
              </p>
            </div>
          )}

          {(formData.statut === 'accepte' || formData.statut === 'integre') && (
            <Input
              label="Candidat final retenu"
              value={formData.candidatRetenu || ''}
              onChange={(e) => setFormData({ ...formData, candidatRetenu: e.target.value })}
              placeholder="Nom complet du candidat retenu"
              leftIcon={<CheckCircle2 className="w-4 h-4 text-success" />}
            />
          )}
        </div>
      )}

      {/* Tab: Intégration */}
      {activeTab === 'integration' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date d'entrée réelle"
              type="date"
              value={formData.dateEntreeReelle ? format(new Date(formData.dateEntreeReelle), 'yyyy-MM-dd') : ''}
              onChange={(e) => setFormData({ ...formData, dateEntreeReelle: e.target.value })}
            />
            <Input
              label="Tuteur d'intégration"
              value={formData.tuteurIntegration || ''}
              onChange={(e) => setFormData({ ...formData, tuteurIntegration: e.target.value })}
              placeholder="Nom du tuteur"
            />
          </div>

          <Textarea
            label="Parcours d'intégration"
            rows={3}
            value={formData.parcoursDintegration || ''}
            onChange={(e) => setFormData({ ...formData, parcoursDintegration: e.target.value })}
            placeholder="Description du parcours d'intégration prévu..."
          />

          {/* Équipements */}
          <div className="p-4 bg-primary-50 rounded-lg">
            <h4 className="font-medium text-primary-900 mb-3 flex items-center gap-2">
              <Laptop className="w-4 h-4" />
              Équipements à prévoir
            </h4>
            <div className="flex gap-2 mb-3">
              <Select
                options={[
                  { value: 'materiel', label: 'Matériel' },
                  { value: 'logiciel', label: 'Logiciel' },
                  { value: 'acces', label: 'Accès' },
                  { value: 'mobilier', label: 'Mobilier' },
                  { value: 'autre', label: 'Autre' },
                ]}
                value={newEquipement.type}
                onChange={(e) => setNewEquipement({ ...newEquipement, type: e.target.value as any })}
                className="w-32"
              />
              <Input
                value={newEquipement.description}
                onChange={(e) => setNewEquipement({ ...newEquipement, description: e.target.value })}
                placeholder="Description de l'équipement..."
                className="flex-1"
              />
              <Button type="button" size="sm" onClick={addEquipement} disabled={!newEquipement.description.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.equipementsNecessaires?.map((equip) => (
                <div key={equip.id} className="flex items-center gap-2 p-2 bg-white rounded border border-primary-200">
                  <Badge size="sm">{equip.type}</Badge>
                  <span className="flex-1 text-sm text-primary-700">{equip.description}</span>
                  <button type="button" onClick={() => removeEquipement(equip.id)} className="p-1 text-primary-400 hover:text-error">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Formations */}
          <div className="p-4 bg-primary-50 rounded-lg">
            <h4 className="font-medium text-primary-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Formations à planifier
            </h4>
            <div className="flex gap-2 mb-3">
              <Input
                value={newFormation.titre}
                onChange={(e) => setNewFormation({ ...newFormation, titre: e.target.value })}
                placeholder="Titre de la formation..."
                className="flex-1"
              />
              <Select
                options={[
                  { value: 'interne', label: 'Interne' },
                  { value: 'externe', label: 'Externe' },
                  { value: 'elearning', label: 'E-learning' },
                ]}
                value={newFormation.type}
                onChange={(e) => setNewFormation({ ...newFormation, type: e.target.value as any })}
                className="w-28"
              />
              <Input
                value={newFormation.duree}
                onChange={(e) => setNewFormation({ ...newFormation, duree: e.target.value })}
                placeholder="Durée"
                className="w-24"
              />
              <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={newFormation.obligatoire}
                  onChange={(e) => setNewFormation({ ...newFormation, obligatoire: e.target.checked })}
                  className="rounded"
                />
                Obligatoire
              </label>
              <Button type="button" size="sm" onClick={addFormationIntegration} disabled={!newFormation.titre.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.formationsAPlanifier?.map((form) => (
                <div key={form.id} className="flex items-center gap-2 p-2 bg-white rounded border border-primary-200">
                  <Badge size="sm" className={form.obligatoire ? 'bg-accent/10 text-accent' : ''}>{form.type}</Badge>
                  <span className="flex-1 text-sm text-primary-700">{form.titre}</span>
                  {form.duree && <span className="text-xs text-primary-500">{form.duree}</span>}
                  {form.obligatoire && <Star className="w-3 h-3 text-accent" />}
                  <button type="button" onClick={() => removeFormationIntegration(form.id)} className="p-1 text-primary-400 hover:text-error">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function ProjetRecrutement() {
  const { centreId } = useParams<{ centreId: string }>();
  const navigate = useNavigate();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const {
    projets,
    vaguesRecrutement,
    postesARecruter,
    loadProjet,
    addPoste,
    updatePoste,
  } = useProjetStore();

  const [viewMode, setViewMode] = useState<'pipeline' | 'vagues'>('pipeline');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPoste, setSelectedPoste] = useState<PosteARecruter | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVague, setFilterVague] = useState<string>('all');

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

  const projetVagues = vaguesRecrutement
    .filter((v) => v.projetId === projet.id)
    .sort((a, b) => a.numero - b.numero);

  const projetPostes = postesARecruter.filter((p) => p.projetId === projet.id);

  // Filtrer les postes
  const filteredPostes = projetPostes.filter((poste) => {
    const matchSearch = poste.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       poste.departement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchVague = filterVague === 'all' || poste.vagueId === filterVague;
    return matchSearch && matchVague;
  });

  // Statistiques
  const stats = {
    total: projetPostes.length,
    integres: projetPostes.filter((p) => p.statut === 'integre').length,
    enCours: projetPostes.filter((p) => !['integre', 'annule', 'a_lancer'].includes(p.statut)).length,
    aLancer: projetPostes.filter((p) => p.statut === 'a_lancer').length,
    masseSalariale: projetPostes.reduce((sum, p) => sum + p.salaireMensuel, 0),
  };

  const handleSave = async (data: Partial<PosteARecruter>) => {
    if (selectedPoste) {
      await updatePoste(selectedPoste.id, data);
    } else {
      await addPoste(data as any);
    }
    setSelectedPoste(undefined);
  };

  const handleStatusChange = async (posteId: string, newStatut: StatutRecrutement) => {
    await updatePoste(posteId, { statut: newStatut });
  };

  const openEditModal = (poste: PosteARecruter) => {
    setSelectedPoste(poste);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedPoste(undefined);
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
            <h1 className="text-2xl font-bold text-primary-900">Recrutement</h1>
            <p className="text-primary-500">{centre.nom}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-primary-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'pipeline' ? 'bg-white shadow text-primary-900' : 'text-primary-600'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('vagues')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'vagues' ? 'bg-white shadow text-primary-900' : 'text-primary-600'
              }`}
            >
              Par vagues
            </button>
          </div>
          <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            Nouveau poste
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-900">{stats.total}</p>
                <p className="text-xs text-primary-500">Postes total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{stats.integres}</p>
                <p className="text-xs text-primary-500">Intégrés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{stats.enCours}</p>
                <p className="text-xs text-primary-500">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-900">{stats.aLancer}</p>
                <p className="text-xs text-primary-500">À lancer</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-primary-900">{(stats.masseSalariale / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-primary-500">Masse salariale</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un poste..."
            className="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={filterVague}
          onChange={(e) => setFilterVague(e.target.value)}
          className="px-3 py-2 border border-primary-300 rounded-lg"
        >
          <option value="all">Toutes les vagues</option>
          {projetVagues.map((vague) => (
            <option key={vague.id} value={vague.id}>
              Vague {vague.numero} - {vague.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Vue Pipeline (Kanban) */}
      {viewMode === 'pipeline' && (
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-[1200px] pb-4">
            {pipelineStages.map((stage) => {
              const stageConfig = statutColors[stage];
              const stagePostes = filteredPostes.filter((p) => p.statut === stage);

              return (
                <div key={stage} className="flex-1 min-w-[200px]">
                  <div className={`p-3 rounded-t-xl ${stageConfig.bg}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${stageConfig.text}`}>{stageConfig.label}</span>
                      <span className={`text-sm ${stageConfig.text}`}>{stagePostes.length}</span>
                    </div>
                  </div>
                  <div className="bg-primary-50 rounded-b-xl p-2 min-h-[400px] space-y-2">
                    {stagePostes.map((poste) => {
                      const vague = projetVagues.find((v) => v.id === poste.vagueId);
                      return (
                        <div
                          key={poste.id}
                          className="bg-white p-3 rounded-lg shadow-sm border border-primary-100 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => openEditModal(poste)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Badge
                              variant={
                                poste.priorite === 'critique' ? 'error' :
                                poste.priorite === 'haute' ? 'warning' : 'default'
                              }
                              size="sm"
                            >
                              {poste.priorite}
                            </Badge>
                            {vague && (
                              <span className="text-xs text-primary-500">V{vague.numero}</span>
                            )}
                          </div>
                          <p className="font-medium text-primary-900 text-sm mb-1">{poste.titre}</p>
                          <p className="text-xs text-primary-500 mb-2">{poste.departement}</p>
                          <div className="flex items-center justify-between text-xs text-primary-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(poste.dateEntreePrevue), 'dd/MM', { locale: fr })}
                            </span>
                            {poste.candidatRetenu && (
                              <span className="text-success font-medium truncate max-w-[80px]">
                                {poste.candidatRetenu}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vue par vagues */}
      {viewMode === 'vagues' && (
        <div className="space-y-6">
          {projetVagues.map((vague) => {
            const vaguePostes = filteredPostes.filter((p) => p.vagueId === vague.id);
            const integres = vaguePostes.filter((p) => p.statut === 'integre').length;

            return (
              <Card key={vague.id}>
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        vague.priorite === 'critique' ? 'bg-error/10' :
                        vague.priorite === 'haute' ? 'bg-warning/10' : 'bg-info/10'
                      }`}>
                        <span className={`font-bold ${
                          vague.priorite === 'critique' ? 'text-error' :
                          vague.priorite === 'haute' ? 'text-warning' : 'text-info'
                        }`}>
                          V{vague.numero}
                        </span>
                      </div>
                      <div>
                        <CardTitle>{vague.nom}</CardTitle>
                        <p className="text-sm text-primary-500">
                          Deadline: {format(new Date(vague.deadline), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-900">{integres}/{vaguePostes.length}</p>
                        <p className="text-xs text-primary-500">recrutés</p>
                      </div>
                      <div className="w-32 h-2 bg-primary-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success rounded-full"
                          style={{ width: `${vaguePostes.length > 0 ? (integres / vaguePostes.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {vaguePostes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vaguePostes.map((poste) => {
                        const statusConfig = statutColors[poste.statut];
                        return (
                          <div
                            key={poste.id}
                            className={`p-4 rounded-xl border ${statusConfig.bg} cursor-pointer hover:shadow-md transition-all`}
                            onClick={() => openEditModal(poste)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-primary-900">{poste.titre}</p>
                                <p className="text-sm text-primary-500">{poste.departement}</p>
                              </div>
                              <Badge
                                variant={
                                  poste.priorite === 'critique' ? 'error' :
                                  poste.priorite === 'haute' ? 'warning' : 'default'
                                }
                                size="sm"
                              >
                                {poste.priorite}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <span className={`text-sm font-medium ${statusConfig.text}`}>
                                {statusConfig.label}
                              </span>
                              <span className="text-xs text-primary-500">
                                {format(new Date(poste.dateEntreePrevue), 'dd/MM/yy')}
                              </span>
                            </div>
                            {poste.candidatRetenu && (
                              <div className="mt-2 pt-2 border-t border-primary-200">
                                <p className="text-sm text-success font-medium">{poste.candidatRetenu}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-primary-500 py-4">Aucun poste dans cette vague</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <PosteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPoste(undefined);
        }}
        poste={selectedPoste}
        vagues={projetVagues}
        projetId={projet.id}
        onSave={handleSave}
      />
    </div>
  );
}
