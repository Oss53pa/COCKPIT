import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  ChevronLeft,
  Store,
  FileSignature,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  DollarSign,
  LayoutGrid,
  List,
  Save,
  X,
  Star,
  ChevronRight,
  Hammer,
  BarChart3,
  Eye,
  Percent,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Modal } from '../components/ui';
import { useCentresStore, useProjetStore } from '../store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ProspectCommercial, SuiviBEFA, StatutProspect, Contact, Interaction } from '../types';

// Couleurs par statut prospect
const statutColors: Record<StatutProspect, { bg: string; text: string; label: string }> = {
  identifie: { bg: 'bg-primary-100', text: 'text-primary-600', label: 'Identifié' },
  contacte: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Contacté' },
  interesse: { bg: 'bg-purple-100', text: 'text-purple-600', label: 'Intéressé' },
  negociation: { bg: 'bg-warning/20', text: 'text-warning', label: 'Négociation' },
  offre_envoyee: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Offre envoyée' },
  bail_signe: { bg: 'bg-success/20', text: 'text-success', label: 'Bail signé' },
  perdu: { bg: 'bg-error/20', text: 'text-error', label: 'Perdu' },
  en_pause: { bg: 'bg-primary-200', text: 'text-primary-600', label: 'En pause' },
};

// Pipeline des prospects
const pipelineStages: StatutProspect[] = [
  'identifie',
  'contacte',
  'interesse',
  'negociation',
  'offre_envoyee',
  'bail_signe',
];

// Catégories de commerces
const categories = [
  'Restauration',
  'Mode & Accessoires',
  'Beauté & Bien-être',
  'Services',
  'Alimentation',
  'Loisirs & Culture',
  'Maison & Déco',
  'High-Tech',
  'Locomotive',
  'Autre',
];

// Types pour les projets en cours (travaux aménagement)
interface ProjetTravaux {
  id: string;
  enseigne: string;
  local: string;
  surface: number;
  dateDebut: string;
  dateFinPrevue: string;
  dateFinReelle?: string;
  avancement: number;
  statut: 'a_demarrer' | 'en_cours' | 'termine' | 'bloque';
  responsable: string;
  notes?: string;
}

// Données de démonstration - Projets travaux en cours
const projetTravauxDemo: ProjetTravaux[] = [
  { id: '1', enseigne: 'Carrefour Market', local: 'A01', surface: 2500, dateDebut: '2025-11-01', dateFinPrevue: '2026-02-15', avancement: 75, statut: 'en_cours', responsable: 'Cabinet AXA' },
  { id: '2', enseigne: 'Zara', local: 'B12', surface: 850, dateDebut: '2025-12-01', dateFinPrevue: '2026-01-31', avancement: 45, statut: 'en_cours', responsable: 'Entreprise BTP+' },
  { id: '3', enseigne: 'Orange Money', local: 'C03', surface: 120, dateDebut: '2025-12-15', dateFinPrevue: '2026-01-15', avancement: 90, statut: 'en_cours', responsable: 'Artisan Local' },
  { id: '4', enseigne: 'KFC', local: 'D08', surface: 280, dateDebut: '2026-01-10', dateFinPrevue: '2026-03-01', avancement: 0, statut: 'a_demarrer', responsable: 'Sodexo Build' },
  { id: '5', enseigne: 'Pharmacie Nouvelle', local: 'A15', surface: 180, dateDebut: '2025-10-01', dateFinPrevue: '2025-12-15', dateFinReelle: '2025-12-20', avancement: 100, statut: 'termine', responsable: 'PharmaBuild' },
  { id: '6', enseigne: 'Nike', local: 'B05', surface: 320, dateDebut: '2025-11-15', dateFinPrevue: '2026-01-20', avancement: 30, statut: 'bloque', responsable: 'Sports Fit-Out', notes: 'Attente validation plans MOE' },
];

// Types pour le suivi commercialisation (état locatif détaillé)
interface SuiviLocataire {
  id: string;
  locataire: string;
  nomCommercial: string;
  activite: string;
  mixCategorie: string;
  local: string;
  statut: 'signé' | 'en_nego' | 'prospect' | 'résilié';
  relocating: boolean;
  gla: number;
  pctSurface: number;
  prixGla: number;
  loyerAnnuel: number;
  loyerBail: number;
  seuilMin?: number;
  palier?: number;
  chargesAnnuelles: number;
  loyerCharges: number;
  encaisseMensuel: number;
  encaisseFinMois: number;
  tauxRecouvrement: number;
  impaye: number;
  echeanceProchaine?: string;
  motifEcheance?: string;
  etatRecouvrement: 'ok' | 'relance' | 'contentieux' | 'négociation';
  lastUpdate: string;
  comments?: string;
}

// Données de démonstration - Suivi commercialisation détaillé
const suiviLocatairesDemo: SuiviLocataire[] = [
  { id: '1', locataire: 'CFAO', nomCommercial: 'Carrefour Market', activite: 'Alimentation', mixCategorie: 'Locomotive', local: 'A01', statut: 'signé', relocating: false, gla: 2500, pctSurface: 25, prixGla: 15000, loyerAnnuel: 450000000, loyerBail: 450000000, seuilMin: 400000000, chargesAnnuelles: 45000000, loyerCharges: 495000000, encaisseMensuel: 37500000, encaisseFinMois: 37500000, tauxRecouvrement: 100, impaye: 0, etatRecouvrement: 'ok', lastUpdate: '2026-01-03' },
  { id: '2', locataire: 'INDITEX', nomCommercial: 'Zara', activite: 'Mode & Accessoires', mixCategorie: 'Mode', local: 'B12', statut: 'signé', relocating: false, gla: 850, pctSurface: 8.5, prixGla: 18000, loyerAnnuel: 183600000, loyerBail: 183600000, chargesAnnuelles: 25500000, loyerCharges: 209100000, encaisseMensuel: 15300000, encaisseFinMois: 12240000, tauxRecouvrement: 80, impaye: 3060000, etatRecouvrement: 'relance', lastUpdate: '2026-01-02', comments: 'Relance envoyée le 02/01' },
  { id: '3', locataire: 'ORANGE CI', nomCommercial: 'Orange Money', activite: 'Services', mixCategorie: 'Services', local: 'C03', statut: 'signé', relocating: false, gla: 120, pctSurface: 1.2, prixGla: 22000, loyerAnnuel: 31680000, loyerBail: 31680000, chargesAnnuelles: 3600000, loyerCharges: 35280000, encaisseMensuel: 2640000, encaisseFinMois: 2640000, tauxRecouvrement: 100, impaye: 0, etatRecouvrement: 'ok', lastUpdate: '2026-01-03' },
  { id: '4', locataire: 'YUM BRANDS', nomCommercial: 'KFC', activite: 'Restauration', mixCategorie: 'Food Court', local: 'D08', statut: 'en_nego', relocating: false, gla: 280, pctSurface: 2.8, prixGla: 20000, loyerAnnuel: 67200000, loyerBail: 67200000, seuilMin: 50000000, palier: 5, chargesAnnuelles: 8400000, loyerCharges: 75600000, encaisseMensuel: 0, encaisseFinMois: 0, tauxRecouvrement: 0, impaye: 0, etatRecouvrement: 'ok', lastUpdate: '2025-12-28', comments: 'Signature prévue semaine prochaine' },
  { id: '5', locataire: 'PHARMA+', nomCommercial: 'Pharmacie Nouvelle', activite: 'Santé', mixCategorie: 'Services', local: 'A15', statut: 'signé', relocating: false, gla: 180, pctSurface: 1.8, prixGla: 16000, loyerAnnuel: 34560000, loyerBail: 34560000, chargesAnnuelles: 5400000, loyerCharges: 39960000, encaisseMensuel: 2880000, encaisseFinMois: 2880000, tauxRecouvrement: 100, impaye: 0, etatRecouvrement: 'ok', lastUpdate: '2026-01-03' },
  { id: '6', locataire: 'NIKE INC', nomCommercial: 'Nike', activite: 'Mode & Accessoires', mixCategorie: 'Sport', local: 'B05', statut: 'signé', relocating: false, gla: 320, pctSurface: 3.2, prixGla: 17500, loyerAnnuel: 67200000, loyerBail: 67200000, chargesAnnuelles: 9600000, loyerCharges: 76800000, encaisseMensuel: 5600000, encaisseFinMois: 0, tauxRecouvrement: 0, impaye: 5600000, echeanceProchaine: '2026-01-15', motifEcheance: 'Retard travaux', etatRecouvrement: 'négociation', lastUpdate: '2026-01-02', comments: 'Report loyer jusqu\'à ouverture' },
  { id: '7', locataire: 'SEPHORA', nomCommercial: 'Sephora', activite: 'Beauté & Bien-être', mixCategorie: 'Beauté', local: 'B08', statut: 'signé', relocating: false, gla: 250, pctSurface: 2.5, prixGla: 19000, loyerAnnuel: 57000000, loyerBail: 57000000, chargesAnnuelles: 7500000, loyerCharges: 64500000, encaisseMensuel: 4750000, encaisseFinMois: 4750000, tauxRecouvrement: 100, impaye: 0, etatRecouvrement: 'ok', lastUpdate: '2026-01-03' },
  { id: '8', locataire: 'QUICK RST', nomCommercial: 'Quick', activite: 'Restauration', mixCategorie: 'Food Court', local: 'D02', statut: 'signé', relocating: false, gla: 200, pctSurface: 2, prixGla: 21000, loyerAnnuel: 50400000, loyerBail: 50400000, seuilMin: 40000000, chargesAnnuelles: 6000000, loyerCharges: 56400000, encaisseMensuel: 4200000, encaisseFinMois: 2100000, tauxRecouvrement: 50, impaye: 2100000, etatRecouvrement: 'relance', lastUpdate: '2026-01-02', comments: '2ème relance' },
  { id: '9', locataire: 'H&M', nomCommercial: 'H&M', activite: 'Mode & Accessoires', mixCategorie: 'Mode', local: 'B15', statut: 'prospect', relocating: false, gla: 600, pctSurface: 6, prixGla: 16500, loyerAnnuel: 118800000, loyerBail: 0, chargesAnnuelles: 18000000, loyerCharges: 136800000, encaisseMensuel: 0, encaisseFinMois: 0, tauxRecouvrement: 0, impaye: 0, etatRecouvrement: 'ok', lastUpdate: '2025-12-20', comments: 'Offre en cours d\'analyse' },
  { id: '10', locataire: 'FNAC DARTY', nomCommercial: 'Fnac', activite: 'High-Tech', mixCategorie: 'Loisirs', local: 'C10', statut: 'en_nego', relocating: false, gla: 450, pctSurface: 4.5, prixGla: 14000, loyerAnnuel: 75600000, loyerBail: 75600000, chargesAnnuelles: 13500000, loyerCharges: 89100000, encaisseMensuel: 0, encaisseFinMois: 0, tauxRecouvrement: 0, impaye: 0, etatRecouvrement: 'ok', lastUpdate: '2025-12-30', comments: 'Négociation franchise de loyer' },
];

// Couleurs statut travaux
const statutTravauxColors: Record<ProjetTravaux['statut'], { bg: string; text: string; label: string }> = {
  a_demarrer: { bg: 'bg-primary-100', text: 'text-primary-600', label: 'À démarrer' },
  en_cours: { bg: 'bg-info/20', text: 'text-info', label: 'En cours' },
  termine: { bg: 'bg-success/20', text: 'text-success', label: 'Terminé' },
  bloque: { bg: 'bg-error/20', text: 'text-error', label: 'Bloqué' },
};

// Modal d'édition de prospect
function ProspectModal({
  isOpen,
  onClose,
  prospect,
  projetId,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  prospect?: ProspectCommercial;
  projetId: string;
  onSave: (data: Partial<ProspectCommercial>) => void;
}) {
  const [formData, setFormData] = useState({
    enseigne: prospect?.enseigne || '',
    categorie: prospect?.categorie || 'Autre',
    surface: prospect?.surface || 0,
    loyerPropose: prospect?.loyerPropose || 0,
    statut: prospect?.statut || 'identifie' as StatutProspect,
    probabilite: prospect?.probabilite || 50,
    estLocomotive: prospect?.estLocomotive || false,
    dateContact: prospect?.dateContact ? format(new Date(prospect.dateContact), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    contactNom: prospect?.contacts[0]?.nom || '',
    contactFonction: prospect?.contacts[0]?.fonction || '',
    contactTelephone: prospect?.contacts[0]?.telephone || '',
    contactEmail: prospect?.contacts[0]?.email || '',
  });

  useEffect(() => {
    if (prospect) {
      setFormData({
        enseigne: prospect.enseigne,
        categorie: prospect.categorie,
        surface: prospect.surface,
        loyerPropose: prospect.loyerPropose,
        statut: prospect.statut,
        probabilite: prospect.probabilite,
        estLocomotive: prospect.estLocomotive,
        dateContact: format(new Date(prospect.dateContact), 'yyyy-MM-dd'),
        contactNom: prospect.contacts[0]?.nom || '',
        contactFonction: prospect.contacts[0]?.fonction || '',
        contactTelephone: prospect.contacts[0]?.telephone || '',
        contactEmail: prospect.contacts[0]?.email || '',
      });
    }
  }, [prospect]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contacts: Contact[] = formData.contactNom ? [{
      nom: formData.contactNom,
      fonction: formData.contactFonction,
      telephone: formData.contactTelephone,
      email: formData.contactEmail,
    }] : [];

    onSave({
      enseigne: formData.enseigne,
      categorie: formData.categorie,
      surface: formData.surface,
      loyerPropose: formData.loyerPropose,
      statut: formData.statut,
      probabilite: formData.probabilite,
      estLocomotive: formData.estLocomotive,
      dateContact: new Date(formData.dateContact).toISOString(),
      contacts,
      historique: prospect?.historique || [],
      projetId,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={prospect ? 'Modifier le prospect' : 'Nouveau prospect'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Enseigne"
            value={formData.enseigne}
            onChange={(e) => setFormData({ ...formData, enseigne: e.target.value })}
            placeholder="Nom de l'enseigne"
            required
          />
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1.5">Catégorie</label>
            <select
              value={formData.categorie}
              onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
              className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Surface (m²)"
            type="number"
            value={formData.surface}
            onChange={(e) => setFormData({ ...formData, surface: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
          <Input
            label="Loyer proposé (FCFA/m²)"
            type="number"
            value={formData.loyerPropose}
            onChange={(e) => setFormData({ ...formData, loyerPropose: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
          <Input
            label="Probabilité (%)"
            type="number"
            min={0}
            max={100}
            value={formData.probabilite}
            onChange={(e) => setFormData({ ...formData, probabilite: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1.5">Statut</label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value as StatutProspect })}
              className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {Object.entries(statutColors).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Date de contact"
            type="date"
            value={formData.dateContact}
            onChange={(e) => setFormData({ ...formData, dateContact: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="locomotive"
            checked={formData.estLocomotive}
            onChange={(e) => setFormData({ ...formData, estLocomotive: e.target.checked })}
            className="rounded border-primary-300 text-primary-900 focus:ring-primary-500"
          />
          <label htmlFor="locomotive" className="text-sm text-primary-700">
            Enseigne locomotive (ancrage majeur)
          </label>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-medium text-primary-700 mb-3">Contact principal</p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nom"
              value={formData.contactNom}
              onChange={(e) => setFormData({ ...formData, contactNom: e.target.value })}
              placeholder="Nom du contact"
            />
            <Input
              label="Fonction"
              value={formData.contactFonction}
              onChange={(e) => setFormData({ ...formData, contactFonction: e.target.value })}
              placeholder="Fonction"
            />
            <Input
              label="Téléphone"
              value={formData.contactTelephone}
              onChange={(e) => setFormData({ ...formData, contactTelephone: e.target.value })}
              placeholder="+225 XX XX XX XX"
            />
            <Input
              label="Email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="email@exemple.com"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
            {prospect ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function ProjetCommercial() {
  const { centreId } = useParams<{ centreId: string }>();
  const navigate = useNavigate();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const {
    projets,
    prospects,
    suiviBEFA,
    loadProjet,
    addProspect,
    updateProspect,
    deleteProspect,
  } = useProjetStore();

  const [viewMode, setViewMode] = useState<'pipeline' | 'list' | 'befa' | 'travaux' | 'suivi'>('pipeline');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<ProspectCommercial | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategorie, setFilterCategorie] = useState<string>('all');

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

  const projetProspects = prospects.filter((p) => p.projetId === projet.id);
  const projetBEFA = suiviBEFA.filter((b) => b.projetId === projet.id);

  // Filtrer les prospects
  const filteredProspects = projetProspects.filter((prospect) => {
    const matchSearch = prospect.enseigne.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategorie = filterCategorie === 'all' || prospect.categorie === filterCategorie;
    return matchSearch && matchCategorie;
  });

  // Statistiques
  const glaTotale = 10000; // À récupérer du centre
  const glaSignee = projetProspects
    .filter((p) => p.statut === 'bail_signe')
    .reduce((sum, p) => sum + p.surface, 0);
  const glaEnNego = projetProspects
    .filter((p) => ['negociation', 'offre_envoyee'].includes(p.statut))
    .reduce((sum, p) => sum + p.surface, 0);
  const loyerMensuelTotal = projetProspects
    .filter((p) => p.statut === 'bail_signe')
    .reduce((sum, p) => sum + (p.loyerPropose * p.surface), 0);

  const stats = {
    total: projetProspects.length,
    signes: projetProspects.filter((p) => p.statut === 'bail_signe').length,
    enNego: projetProspects.filter((p) => ['negociation', 'offre_envoyee'].includes(p.statut)).length,
    locomotives: projetProspects.filter((p) => p.estLocomotive && p.statut === 'bail_signe').length,
    occupationPourcent: Math.round((glaSignee / glaTotale) * 100),
    befaComplets: projetBEFA.filter((b) => b.statut === 'complet').length,
    befaTotal: projetBEFA.length,
  };

  const handleSave = async (data: Partial<ProspectCommercial>) => {
    if (selectedProspect) {
      await updateProspect(selectedProspect.id, data);
    } else {
      await addProspect(data as any);
    }
    setSelectedProspect(undefined);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer ce prospect ?')) {
      await deleteProspect(id);
    }
  };

  const openEditModal = (prospect: ProspectCommercial) => {
    setSelectedProspect(prospect);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedProspect(undefined);
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
            <h1 className="text-2xl font-bold text-primary-900">Commercialisation</h1>
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
              Prospects
            </button>
            <button
              onClick={() => setViewMode('suivi')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'suivi' ? 'bg-white shadow text-primary-900' : 'text-primary-600'
              }`}
            >
              Suivi des baux
            </button>
            <button
              onClick={() => setViewMode('travaux')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'travaux' ? 'bg-white shadow text-primary-900' : 'text-primary-600'
              }`}
            >
              Projets en cours
            </button>
            <button
              onClick={() => setViewMode('befa')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'befa' ? 'bg-white shadow text-primary-900' : 'text-primary-600'
              }`}
            >
              BEFA
            </button>
          </div>
          <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            Nouveau prospect
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-900">{stats.occupationPourcent}%</p>
              <p className="text-xs text-primary-500">Taux d'occupation</p>
              <div className="w-full h-2 bg-primary-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-success rounded-full"
                  style={{ width: `${stats.occupationPourcent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{glaSignee.toLocaleString()}</p>
              <p className="text-xs text-primary-500">m² signés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{glaEnNego.toLocaleString()}</p>
              <p className="text-xs text-primary-500">m² en négo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-900">{stats.signes}/{stats.total}</p>
              <p className="text-xs text-primary-500">Baux signés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.locomotives}</p>
              <p className="text-xs text-primary-500">Locomotives</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-lg font-bold text-primary-900">{(loyerMensuelTotal / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-primary-500">Loyer mensuel</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche et filtres - Vue Prospects */}
      {viewMode === 'pipeline' && (
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une enseigne..."
              className="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterCategorie}
            onChange={(e) => setFilterCategorie(e.target.value)}
            className="px-3 py-2 border border-primary-300 rounded-lg"
          >
            <option value="all">Toutes catégories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      {/* Vue Prospects - Tableau */}
      {viewMode === 'pipeline' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Liste des Prospects
              </CardTitle>
              <span className="text-sm text-primary-500">{filteredProspects.length} prospect(s)</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-primary-500 border-b bg-primary-50">
                    <th className="px-3 py-3 font-medium">Enseigne</th>
                    <th className="px-3 py-3 font-medium">Catégorie</th>
                    <th className="px-3 py-3 font-medium">Local</th>
                    <th className="px-3 py-3 font-medium text-right">Surface (m²)</th>
                    <th className="px-3 py-3 font-medium text-right">Loyer/m²</th>
                    <th className="px-3 py-3 font-medium text-right">Loyer Annuel</th>
                    <th className="px-3 py-3 font-medium">Statut</th>
                    <th className="px-3 py-3 font-medium text-center">Probabilité</th>
                    <th className="px-3 py-3 font-medium">Locomotive</th>
                    <th className="px-3 py-3 font-medium">Contact</th>
                    <th className="px-3 py-3 font-medium">Téléphone</th>
                    <th className="px-3 py-3 font-medium">Email</th>
                    <th className="px-3 py-3 font-medium">Date Contact</th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProspects.length > 0 ? (
                    filteredProspects.map((prospect) => {
                      const statusConfig = statutColors[prospect.statut];
                      return (
                        <tr
                          key={prospect.id}
                          className="border-b border-primary-100 hover:bg-primary-50"
                        >
                          <td className="px-3 py-3 font-medium text-primary-900">{prospect.enseigne}</td>
                          <td className="px-3 py-3 text-primary-600">{prospect.categorie}</td>
                          <td className="px-3 py-3 font-mono text-primary-600">-</td>
                          <td className="px-3 py-3 text-right">{prospect.surface.toLocaleString()}</td>
                          <td className="px-3 py-3 text-right">{prospect.loyerPropose.toLocaleString()}</td>
                          <td className="px-3 py-3 text-right font-medium">
                            {((prospect.loyerPropose * prospect.surface) / 1000000).toFixed(1)}M
                          </td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-12 h-2 bg-primary-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    prospect.probabilite >= 70 ? 'bg-success' :
                                    prospect.probabilite >= 40 ? 'bg-warning' : 'bg-error'
                                  }`}
                                  style={{ width: `${prospect.probabilite}%` }}
                                />
                              </div>
                              <span className="text-xs">{prospect.probabilite}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {prospect.estLocomotive ? (
                              <Star className="w-4 h-4 text-warning fill-warning mx-auto" />
                            ) : (
                              <span className="text-primary-300">-</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-primary-600">{prospect.contacts[0]?.nom || '-'}</td>
                          <td className="px-3 py-3 text-primary-600">{prospect.contacts[0]?.telephone || '-'}</td>
                          <td className="px-3 py-3 text-primary-600">{prospect.contacts[0]?.email || '-'}</td>
                          <td className="px-3 py-3 text-primary-500">
                            {format(new Date(prospect.dateContact), 'dd/MM/yyyy', { locale: fr })}
                          </td>
                          <td className="px-3 py-3">
                            <button
                              onClick={() => openEditModal(prospect)}
                              className="p-1.5 hover:bg-primary-100 rounded-lg"
                            >
                              <Eye className="w-4 h-4 text-primary-500" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={14} className="px-3 py-8 text-center text-primary-400">
                        Aucun prospect. Cliquez sur "Nouveau prospect" pour en ajouter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vue BEFA */}
      {viewMode === 'befa' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5" />
                  Suivi BEFA & Aménagements
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-900">{stats.befaComplets}/{stats.befaTotal}</p>
                    <p className="text-xs text-primary-500">BEFA complets</p>
                  </div>
                  <div className="w-32 h-2 bg-primary-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full"
                      style={{ width: `${stats.befaTotal > 0 ? (stats.befaComplets / stats.befaTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {projetBEFA.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-primary-500 border-b">
                        <th className="pb-3 font-medium">Enseigne</th>
                        <th className="pb-3 font-medium">Local</th>
                        <th className="pb-3 font-medium">Surface</th>
                        <th className="pb-3 font-medium text-center">BEFA</th>
                        <th className="pb-3 font-medium text-center">Pilote B</th>
                        <th className="pb-3 font-medium text-center">SOCOTEC</th>
                        <th className="pb-3 font-medium text-center">Plans</th>
                        <th className="pb-3 font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projetBEFA.map((befa) => (
                        <tr key={befa.id} className="border-b border-primary-100">
                          <td className="py-3 font-medium text-primary-900">{befa.enseigne}</td>
                          <td className="py-3 text-primary-600">{befa.local}</td>
                          <td className="py-3 text-primary-900">{befa.surface} m²</td>
                          <td className="py-3 text-center">
                            {befa.befaSigne ? (
                              <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
                            ) : (
                              <Clock className="w-5 h-5 text-primary-300 mx-auto" />
                            )}
                          </td>
                          <td className="py-3 text-center">
                            {befa.piloteBSigne ? (
                              <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
                            ) : (
                              <Clock className="w-5 h-5 text-primary-300 mx-auto" />
                            )}
                          </td>
                          <td className="py-3 text-center">
                            {befa.socotecSigne ? (
                              <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
                            ) : (
                              <Clock className="w-5 h-5 text-primary-300 mx-auto" />
                            )}
                          </td>
                          <td className="py-3 text-center">
                            {befa.plansValidesDefinitif ? (
                              <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
                            ) : befa.plansRecus ? (
                              <Clock className="w-5 h-5 text-warning mx-auto" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-primary-300 mx-auto" />
                            )}
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={
                                befa.statut === 'complet' ? 'success' :
                                befa.statut === 'en_cours' ? 'info' :
                                befa.statut === 'bloque' ? 'error' : 'default'
                              }
                            >
                              {befa.statut}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileSignature className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                  <p className="text-primary-500">Aucun suivi BEFA</p>
                  <p className="text-sm text-primary-400 mt-1">
                    Les BEFA seront créés automatiquement lors de la signature des baux
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vue Projets en cours (Travaux) */}
      {viewMode === 'travaux' && (
        <div className="space-y-4">
          {/* Stats travaux */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="py-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-info">{projetTravauxDemo.filter(p => p.statut === 'en_cours').length}</p>
                  <p className="text-xs text-primary-500">En cours</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">{projetTravauxDemo.filter(p => p.statut === 'a_demarrer').length}</p>
                  <p className="text-xs text-primary-500">À démarrer</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{projetTravauxDemo.filter(p => p.statut === 'termine').length}</p>
                  <p className="text-xs text-primary-500">Terminés</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-error">{projetTravauxDemo.filter(p => p.statut === 'bloque').length}</p>
                  <p className="text-xs text-primary-500">Bloqués</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="flex items-center gap-2">
                  <Hammer className="w-5 h-5" />
                  Travaux d'aménagement locataires
                </CardTitle>
                <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />}>
                  Ajouter un projet
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-primary-500 border-b">
                      <th className="pb-3 font-medium">Enseigne</th>
                      <th className="pb-3 font-medium">Local</th>
                      <th className="pb-3 font-medium">Surface</th>
                      <th className="pb-3 font-medium">Date début</th>
                      <th className="pb-3 font-medium">Date fin prévue</th>
                      <th className="pb-3 font-medium">Avancement</th>
                      <th className="pb-3 font-medium">Responsable</th>
                      <th className="pb-3 font-medium">Statut</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projetTravauxDemo.map((projet) => {
                      const statusConfig = statutTravauxColors[projet.statut];
                      const isLate = new Date(projet.dateFinPrevue) < new Date() && projet.statut !== 'termine';

                      return (
                        <tr key={projet.id} className="border-b border-primary-100 hover:bg-primary-50">
                          <td className="py-3 font-medium text-primary-900">{projet.enseigne}</td>
                          <td className="py-3 text-primary-600">{projet.local}</td>
                          <td className="py-3 text-primary-900">{projet.surface} m²</td>
                          <td className="py-3 text-sm text-primary-600">
                            {format(new Date(projet.dateDebut), 'dd MMM yyyy', { locale: fr })}
                          </td>
                          <td className={`py-3 text-sm ${isLate ? 'text-error font-medium' : 'text-primary-600'}`}>
                            {format(new Date(projet.dateFinPrevue), 'dd MMM yyyy', { locale: fr })}
                            {isLate && <span className="ml-1 text-xs">(Retard)</span>}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-primary-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    projet.avancement >= 75 ? 'bg-success' :
                                    projet.avancement >= 40 ? 'bg-warning' : 'bg-info'
                                  }`}
                                  style={{ width: `${projet.avancement}%` }}
                                />
                              </div>
                              <span className="text-xs text-primary-600">{projet.avancement}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-sm text-primary-600">{projet.responsable}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="py-3">
                            <button className="p-1.5 hover:bg-primary-100 rounded-lg">
                              <Eye className="w-4 h-4 text-primary-500" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vue Suivi Commercialisation */}
      {viewMode === 'suivi' && (() => {
        // Calculs des totaux
        const locatairesSigned = suiviLocatairesDemo.filter(l => l.statut === 'signé');
        const totalGLA = suiviLocatairesDemo.reduce((sum, l) => sum + l.gla, 0);
        const glaSignee = locatairesSigned.reduce((sum, l) => sum + l.gla, 0);
        const totalLoyerAnnuel = locatairesSigned.reduce((sum, l) => sum + l.loyerAnnuel, 0);
        const totalCharges = locatairesSigned.reduce((sum, l) => sum + l.chargesAnnuelles, 0);
        const totalEncaisse = locatairesSigned.reduce((sum, l) => sum + l.encaisseFinMois, 0);
        const totalFacture = locatairesSigned.reduce((sum, l) => sum + l.encaisseMensuel, 0);
        const totalImpaye = locatairesSigned.reduce((sum, l) => sum + l.impaye, 0);
        const tauxRecouvrementGlobal = totalFacture > 0 ? Math.round((totalEncaisse / totalFacture) * 100) : 0;

        return (
        <div className="space-y-6">
          {/* KPIs principaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="py-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-900">{glaSignee.toLocaleString()}</p>
                  <p className="text-xs text-primary-500">GLA Signée (m²)</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{(totalLoyerAnnuel / 1000000).toFixed(0)}M</p>
                  <p className="text-xs text-primary-500">Loyer Annuel</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-info">{(totalCharges / 1000000).toFixed(0)}M</p>
                  <p className="text-xs text-primary-500">Charges Annuelles</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${tauxRecouvrementGlobal >= 90 ? 'text-success' : tauxRecouvrementGlobal >= 70 ? 'text-warning' : 'text-error'}`}>
                    {tauxRecouvrementGlobal}%
                  </p>
                  <p className="text-xs text-primary-500">Taux Recouvrement</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-error">{(totalImpaye / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-primary-500">Impayés</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-900">{locatairesSigned.length}</p>
                  <p className="text-xs text-primary-500">Baux Actifs</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau de suivi détaillé */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  État Locatif & Suivi Recouvrement
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    Exporter Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-primary-500 border-b bg-primary-50">
                      <th className="px-2 py-3 font-medium sticky left-0 bg-primary-50">Locataire</th>
                      <th className="px-2 py-3 font-medium">Nom Commercial</th>
                      <th className="px-2 py-3 font-medium">Activité</th>
                      <th className="px-2 py-3 font-medium">Mix</th>
                      <th className="px-2 py-3 font-medium">Local</th>
                      <th className="px-2 py-3 font-medium">Statut</th>
                      <th className="px-2 py-3 font-medium text-right">GLA</th>
                      <th className="px-2 py-3 font-medium text-right">%Surf</th>
                      <th className="px-2 py-3 font-medium text-right">Prix/m²</th>
                      <th className="px-2 py-3 font-medium text-right">Loyer Annuel</th>
                      <th className="px-2 py-3 font-medium text-right">Charges</th>
                      <th className="px-2 py-3 font-medium text-right">Loyer+Ch</th>
                      <th className="px-2 py-3 font-medium text-right">Enc. Mois</th>
                      <th className="px-2 py-3 font-medium text-center">%Rec</th>
                      <th className="px-2 py-3 font-medium text-right">Impayé</th>
                      <th className="px-2 py-3 font-medium">État Rec.</th>
                      <th className="px-2 py-3 font-medium">MAJ</th>
                      <th className="px-2 py-3 font-medium">Commentaires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suiviLocatairesDemo.map((loc) => {
                      const statutColors: Record<string, string> = {
                        'signé': 'bg-success/20 text-success',
                        'en_nego': 'bg-warning/20 text-warning',
                        'prospect': 'bg-info/20 text-info',
                        'résilié': 'bg-error/20 text-error',
                      };
                      const etatRecColors: Record<string, string> = {
                        'ok': 'bg-success/20 text-success',
                        'relance': 'bg-warning/20 text-warning',
                        'contentieux': 'bg-error/20 text-error',
                        'négociation': 'bg-purple-100 text-purple-700',
                      };

                      return (
                        <tr key={loc.id} className="border-b border-primary-100 hover:bg-primary-50">
                          <td className="px-2 py-2 font-medium text-primary-900 sticky left-0 bg-white">{loc.locataire}</td>
                          <td className="px-2 py-2 text-primary-700">{loc.nomCommercial}</td>
                          <td className="px-2 py-2 text-primary-600">{loc.activite}</td>
                          <td className="px-2 py-2">
                            <span className="px-1.5 py-0.5 bg-primary-100 text-primary-600 rounded text-xs">
                              {loc.mixCategorie}
                            </span>
                          </td>
                          <td className="px-2 py-2 font-mono text-primary-700">{loc.local}</td>
                          <td className="px-2 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${statutColors[loc.statut]}`}>
                              {loc.statut}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right font-medium">{loc.gla.toLocaleString()}</td>
                          <td className="px-2 py-2 text-right text-primary-500">{loc.pctSurface}%</td>
                          <td className="px-2 py-2 text-right">{loc.prixGla.toLocaleString()}</td>
                          <td className="px-2 py-2 text-right font-medium">{(loc.loyerAnnuel / 1000000).toFixed(1)}M</td>
                          <td className="px-2 py-2 text-right text-primary-500">{(loc.chargesAnnuelles / 1000000).toFixed(1)}M</td>
                          <td className="px-2 py-2 text-right font-medium">{(loc.loyerCharges / 1000000).toFixed(1)}M</td>
                          <td className="px-2 py-2 text-right">{(loc.encaisseFinMois / 1000000).toFixed(1)}M</td>
                          <td className="px-2 py-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              loc.tauxRecouvrement >= 100 ? 'bg-success/20 text-success' :
                              loc.tauxRecouvrement >= 80 ? 'bg-warning/20 text-warning' :
                              loc.tauxRecouvrement > 0 ? 'bg-error/20 text-error' : 'bg-primary-100 text-primary-400'
                            }`}>
                              {loc.tauxRecouvrement}%
                            </span>
                          </td>
                          <td className={`px-2 py-2 text-right ${loc.impaye > 0 ? 'text-error font-medium' : 'text-primary-400'}`}>
                            {loc.impaye > 0 ? `${(loc.impaye / 1000000).toFixed(1)}M` : '-'}
                          </td>
                          <td className="px-2 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${etatRecColors[loc.etatRecouvrement]}`}>
                              {loc.etatRecouvrement}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-xs text-primary-500">
                            {format(new Date(loc.lastUpdate), 'dd/MM', { locale: fr })}
                          </td>
                          <td className="px-2 py-2 text-xs text-primary-500 max-w-[150px] truncate" title={loc.comments}>
                            {loc.comments || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-primary-100 font-medium">
                    <tr>
                      <td colSpan={6} className="px-2 py-2 text-primary-700">TOTAL</td>
                      <td className="px-2 py-2 text-right">{totalGLA.toLocaleString()}</td>
                      <td className="px-2 py-2 text-right">100%</td>
                      <td className="px-2 py-2"></td>
                      <td className="px-2 py-2 text-right">{(totalLoyerAnnuel / 1000000).toFixed(0)}M</td>
                      <td className="px-2 py-2 text-right">{(totalCharges / 1000000).toFixed(0)}M</td>
                      <td className="px-2 py-2 text-right">{((totalLoyerAnnuel + totalCharges) / 1000000).toFixed(0)}M</td>
                      <td className="px-2 py-2 text-right">{(totalEncaisse / 1000000).toFixed(1)}M</td>
                      <td className="px-2 py-2 text-center">{tauxRecouvrementGlobal}%</td>
                      <td className="px-2 py-2 text-right text-error">{(totalImpaye / 1000000).toFixed(1)}M</td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        );
      })()}

      {/* Modal */}
      <ProspectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProspect(undefined);
        }}
        prospect={selectedProspect}
        projetId={projet.id}
        onSave={handleSave}
      />
    </div>
  );
}
