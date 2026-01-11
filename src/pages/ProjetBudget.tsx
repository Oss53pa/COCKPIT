import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Plus,
  X,
  Edit2,
  Wallet,
  CreditCard,
  Banknote,
  MessageSquare,
  Paperclip,
  FileText,
  Trash2,
  Upload,
  Eye,
  Receipt,
  Calendar,
  Building2,
  Hash,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useProjetStore, useAppStore } from '../store';
import type { PhaseProjet } from '../types';

type ViewMode = 'synthese' | 'detail' | 'overview' | 'phases';

interface LigneBudget {
  id: string;
  phaseId: string;
  categorie: string;
  libelle: string;
  montantPrevu: number;
  montantEngage: number;
  montantConsomme: number;
}

// Pièce jointe
interface PieceJointe {
  id: string;
  nom: string;
  type: string;
  taille: number;
  dateAjout: string;
  url?: string;
}

// Ligne de dépense individuelle
interface LigneDepense {
  id: string;
  date: string;
  description: string;
  fournisseur: string;
  reference?: string; // Numéro de facture, bon de commande, etc.
  montant: number;
  statut: 'prevu' | 'engage' | 'paye';
  pieceJointe?: PieceJointe;
}

// Structure du Budget Mobilisation (PAS construction)
interface PosteBudget {
  id: string;
  poste: string;
  description: string;
  montantPrevu: number;
  montantEngage: number;
  montantConsomme: number;
  commentaire?: string;
  piecesJointes?: PieceJointe[];
  lignesDepenses?: LigneDepense[];
  dateModification?: string;
}

// Table Budget Mobilisation - Budget de lancement/démarrage
const budgetMobilisationInitial: PosteBudget[] = [
  // RH - Recrutement et Intégration
  {
    id: 'rh-1',
    poste: 'Recrutement',
    description: 'Frais de recrutement (annonces, cabinets, tests)',
    montantPrevu: 25000000,
    montantEngage: 22000000,
    montantConsomme: 18000000,
    commentaire: 'Cabinet RH sélectionné: Talent Africa. 3 postes clés en cours.',
    piecesJointes: [
      { id: 'pj-1', nom: 'Contrat_Cabinet_RH.pdf', type: 'application/pdf', taille: 245000, dateAjout: '2024-01-15' },
      { id: 'pj-2', nom: 'Grille_Salaires.xlsx', type: 'application/xlsx', taille: 45000, dateAjout: '2024-01-20' },
    ],
    lignesDepenses: [
      { id: 'dep-1', date: '2024-01-10', description: 'Acompte cabinet Talent Africa', fournisseur: 'Talent Africa', reference: 'FA-2024-001', montant: 8000000, statut: 'paye' },
      { id: 'dep-2', date: '2024-01-25', description: 'Publication annonces LinkedIn Premium', fournisseur: 'LinkedIn', reference: 'INV-45678', montant: 1500000, statut: 'paye' },
      { id: 'dep-3', date: '2024-02-01', description: 'Tests psychométriques (lot 1)', fournisseur: 'AssessFirst', reference: 'AF-2024-123', montant: 2500000, statut: 'paye' },
      { id: 'dep-4', date: '2024-02-05', description: 'Frais de déplacement candidats', fournisseur: 'Divers', montant: 1200000, statut: 'paye' },
      { id: 'dep-5', date: '2024-02-10', description: 'Honoraires recrutement poste DG', fournisseur: 'Talent Africa', reference: 'FA-2024-015', montant: 4800000, statut: 'paye' },
      { id: 'dep-6', date: '2024-02-20', description: 'Solde cabinet Talent Africa', fournisseur: 'Talent Africa', reference: 'FA-2024-022', montant: 4000000, statut: 'engage' },
    ],
    dateModification: '2024-02-10'
  },
  {
    id: 'rh-2',
    poste: 'Recrutement',
    description: 'Salaires pré-ouverture (équipe pilote)',
    montantPrevu: 85000000,
    montantEngage: 85000000,
    montantConsomme: 60000000,
    commentaire: 'Équipe pilote de 8 personnes recrutée. Salaires versés M-3 à M-1.',
    dateModification: '2024-02-01'
  },
  { id: 'rh-3', poste: 'Recrutement', description: 'Déplacements et hébergement candidats', montantPrevu: 8000000, montantEngage: 5000000, montantConsomme: 3500000 },

  // Formation
  {
    id: 'form-1',
    poste: 'Formation',
    description: 'Formation initiale équipe (interne)',
    montantPrevu: 15000000,
    montantEngage: 12000000,
    montantConsomme: 8000000,
    commentaire: 'Programme formation 3 semaines validé. Démarrage prévu S-6.',
    piecesJointes: [
      { id: 'pj-3', nom: 'Programme_Formation.pdf', type: 'application/pdf', taille: 520000, dateAjout: '2024-01-25' },
    ]
  },
  { id: 'form-2', poste: 'Formation', description: 'Formation externe (prestataires spécialisés)', montantPrevu: 20000000, montantEngage: 18000000, montantConsomme: 10000000 },
  { id: 'form-3', poste: 'Formation', description: 'Supports et documentation', montantPrevu: 5000000, montantEngage: 5000000, montantConsomme: 5000000 },

  // Marketing & Communication
  {
    id: 'mkt-1',
    poste: 'Marketing',
    description: 'Identité visuelle et charte graphique',
    montantPrevu: 12000000,
    montantEngage: 12000000,
    montantConsomme: 12000000,
    commentaire: 'Charte graphique finalisée et validée par le siège.',
    piecesJointes: [
      { id: 'pj-4', nom: 'Charte_Graphique_V2.pdf', type: 'application/pdf', taille: 8500000, dateAjout: '2024-02-01' },
      { id: 'pj-5', nom: 'Logo_Vectoriel.ai', type: 'application/illustrator', taille: 2500000, dateAjout: '2024-02-01' },
    ]
  },
  { id: 'mkt-2', poste: 'Marketing', description: 'Site web et réseaux sociaux', montantPrevu: 8000000, montantEngage: 8000000, montantConsomme: 6000000 },
  {
    id: 'mkt-3',
    poste: 'Marketing',
    description: 'Campagne pré-ouverture (média, affichage)',
    montantPrevu: 65000000,
    montantEngage: 45000000,
    montantConsomme: 25000000,
    commentaire: 'Campagne radio + affichage 4x3. Démarrage J-30.',
    piecesJointes: [
      { id: 'pj-6', nom: 'Plan_Media.xlsx', type: 'application/xlsx', taille: 125000, dateAjout: '2024-02-05' },
    ]
  },
  { id: 'mkt-4', poste: 'Marketing', description: 'Relations presse et RP', montantPrevu: 15000000, montantEngage: 10000000, montantConsomme: 5000000 },

  // Événements
  { id: 'evt-1', poste: 'Événements', description: 'Soft Opening (événement VIP)', montantPrevu: 25000000, montantEngage: 15000000, montantConsomme: 0 },
  { id: 'evt-2', poste: 'Événements', description: 'Inauguration officielle', montantPrevu: 45000000, montantEngage: 20000000, montantConsomme: 0, commentaire: 'Présence ministre confirmée. Traiteur en cours de sélection.' },
  { id: 'evt-3', poste: 'Événements', description: 'Animations ouverture (1er mois)', montantPrevu: 30000000, montantEngage: 10000000, montantConsomme: 0 },

  // IT & Équipements
  { id: 'it-1', poste: 'IT & Équipements', description: 'Systèmes informatiques (ERP, caisse)', montantPrevu: 35000000, montantEngage: 35000000, montantConsomme: 28000000, commentaire: 'ERP Sage X3 installé. Formation utilisateurs en cours.' },
  { id: 'it-2', poste: 'IT & Équipements', description: 'Matériel bureautique et téléphonie', montantPrevu: 12000000, montantEngage: 12000000, montantConsomme: 10000000 },
  { id: 'it-3', poste: 'IT & Équipements', description: 'Signalétique et PLV', montantPrevu: 25000000, montantEngage: 20000000, montantConsomme: 15000000 },

  // Aménagement espaces gestion
  { id: 'amgt-1', poste: 'Aménagement', description: 'Mobilier bureaux et espaces staff', montantPrevu: 18000000, montantEngage: 18000000, montantConsomme: 18000000 },
  { id: 'amgt-2', poste: 'Aménagement', description: 'Aménagement accueil et direction', montantPrevu: 15000000, montantEngage: 15000000, montantConsomme: 12000000 },

  // Frais généraux
  { id: 'fg-1', poste: 'Frais généraux', description: 'Déplacements et missions', montantPrevu: 20000000, montantEngage: 15000000, montantConsomme: 10000000 },
  { id: 'fg-2', poste: 'Frais généraux', description: 'Fournitures et consommables', montantPrevu: 8000000, montantEngage: 5000000, montantConsomme: 3000000 },
  { id: 'fg-3', poste: 'Frais généraux', description: 'Assurances pré-ouverture', montantPrevu: 12000000, montantEngage: 12000000, montantConsomme: 12000000 },

  // Provisions
  { id: 'prov-1', poste: 'Provisions', description: 'Imprévus et aléas', montantPrevu: 45000000, montantEngage: 0, montantConsomme: 0 },
  { id: 'prov-2', poste: 'Provisions', description: 'Réserve de trésorerie', montantPrevu: 20500000, montantEngage: 0, montantConsomme: 0 },
];

// Données de démonstration pour les lignes de budget détaillées
const ligneBudgetDemo: LigneBudget[] = [
  { id: '1', phaseId: '1', categorie: 'RH', libelle: 'Recrutement Center Manager', montantPrevu: 15000000, montantEngage: 15000000, montantConsomme: 15000000 },
  { id: '2', phaseId: '1', categorie: 'RH', libelle: 'Recrutement équipe management', montantPrevu: 25000000, montantEngage: 20000000, montantConsomme: 12000000 },
  { id: '3', phaseId: '1', categorie: 'Marketing', libelle: 'Identité visuelle', montantPrevu: 8000000, montantEngage: 8000000, montantConsomme: 8000000 },
  { id: '4', phaseId: '1', categorie: 'Marketing', libelle: 'Site web', montantPrevu: 5000000, montantEngage: 5000000, montantConsomme: 3500000 },
  { id: '5', phaseId: '1', categorie: 'Technique', libelle: 'Équipements IT', montantPrevu: 12000000, montantEngage: 0, montantConsomme: 0 },
  { id: '6', phaseId: '2', categorie: 'Formation', libelle: 'Formation équipe', montantPrevu: 18000000, montantEngage: 10000000, montantConsomme: 5000000 },
  { id: '7', phaseId: '2', categorie: 'Communication', libelle: 'Campagne pré-opening', montantPrevu: 45000000, montantEngage: 30000000, montantConsomme: 15000000 },
  { id: '8', phaseId: '2', categorie: 'Communication', libelle: 'Événement inauguration', montantPrevu: 35000000, montantEngage: 0, montantConsomme: 0 },
  { id: '9', phaseId: '2', categorie: 'Aménagement', libelle: 'Mobilier espaces communs', montantPrevu: 85000000, montantEngage: 85000000, montantConsomme: 60000000 },
  { id: '10', phaseId: '3', categorie: 'Animation', libelle: 'Animation opening weekend', montantPrevu: 25000000, montantEngage: 15000000, montantConsomme: 0 },
];

export function ProjetBudget() {
  const { centreId } = useParams<{ centreId: string }>();
  const { setCurrentCentre, addToast } = useAppStore();
  const { projets, phases, loadProjet, updateProjet, updatePhase } = useProjetStore();

  const [viewMode, setViewMode] = useState<ViewMode>('synthese');
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<PhaseProjet | null>(null);
  const [lignesBudget] = useState<LigneBudget[]>(ligneBudgetDemo);
  const [budgetMobilisation, setBudgetMobilisation] = useState<PosteBudget[]>(budgetMobilisationInitial);
  const [categorieFilter, setCategorieFilter] = useState<string>('all');
  const [posteFilter, setPosteFilter] = useState<string>('all');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedBudgetLine, setSelectedBudgetLine] = useState<PosteBudget | null>(null);
  const [isNewLine, setIsNewLine] = useState(false);

  useEffect(() => {
    if (centreId) {
      setCurrentCentre(centreId);
      loadProjet(centreId);
    }
  }, [centreId, setCurrentCentre, loadProjet]);

  const projet = projets.find((p) => p.centreId === centreId);
  const projetPhases = phases.filter((p) => projet && p.projetId === projet.id);

  // Calculs globaux
  const budgetTotal = projet?.budgetTotal || 0;
  const provisions = projet?.provisions || 0;
  const budgetEngage = projetPhases.reduce((sum, p) => sum + p.budgetEngage, 0);
  const budgetConsomme = projetPhases.reduce((sum, p) => sum + p.budgetConsomme, 0);
  const budgetRestant = budgetTotal - budgetConsomme;
  const tauxEngagement = budgetTotal > 0 ? (budgetEngage / budgetTotal) * 100 : 0;
  const tauxConsommation = budgetTotal > 0 ? (budgetConsomme / budgetTotal) * 100 : 0;

  // Catégories uniques
  const categories = [...new Set(lignesBudget.map((l) => l.categorie))];

  // Postes uniques pour le budget mobilisation
  const postes = [...new Set(budgetMobilisation.map((b) => b.poste))];

  // Filtrage des lignes
  const filteredLignes = lignesBudget.filter(
    (ligne) => categorieFilter === 'all' || ligne.categorie === categorieFilter
  );

  // Filtrage budget mobilisation
  const filteredBudgetMobilisation = budgetMobilisation.filter(
    (ligne) => posteFilter === 'all' || ligne.poste === posteFilter
  );

  // Totaux budget mobilisation par poste
  const totauxParPoste = postes.map((poste) => {
    const lignesPoste = budgetMobilisation.filter((b) => b.poste === poste);
    return {
      poste,
      prevu: lignesPoste.reduce((sum, l) => sum + l.montantPrevu, 0),
      engage: lignesPoste.reduce((sum, l) => sum + l.montantEngage, 0),
      consomme: lignesPoste.reduce((sum, l) => sum + l.montantConsomme, 0),
    };
  });

  // Total global budget mobilisation
  const totalBudgetMobilisation = {
    prevu: budgetMobilisation.reduce((sum, l) => sum + l.montantPrevu, 0),
    engage: budgetMobilisation.reduce((sum, l) => sum + l.montantEngage, 0),
    consomme: budgetMobilisation.reduce((sum, l) => sum + l.montantConsomme, 0),
  };

  // Données pour le graphique par phase
  const chartDataPhases = projetPhases.map((phase) => ({
    name: phase.nom,
    Prévu: phase.budget / 1000000,
    Engagé: phase.budgetEngage / 1000000,
    Consommé: phase.budgetConsomme / 1000000,
  }));

  // Données pour le camembert par catégorie
  const categoryTotals = categories.map((cat) => ({
    name: cat,
    value: lignesBudget
      .filter((l) => l.categorie === cat)
      .reduce((sum, l) => sum + l.montantPrevu, 0),
  }));

  const COLORS = ['#1e3a5f', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Evolution simulée
  const evolutionData = [
    { mois: 'M-6', prevu: 0, reel: 0 },
    { mois: 'M-5', prevu: 50, reel: 45 },
    { mois: 'M-4', prevu: 120, reel: 110 },
    { mois: 'M-3', prevu: 200, reel: 185 },
    { mois: 'M-2', prevu: 320, reel: 290 },
    { mois: 'M-1', prevu: 450, reel: 420 },
    { mois: 'Actuel', prevu: budgetEngage / 1000000, reel: budgetConsomme / 1000000 },
  ];

  const formatMontant = (montant: number) => {
    if (montant >= 1000000000) {
      return `${(montant / 1000000000).toFixed(1)} Md`;
    }
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)} M`;
    }
    if (montant >= 1000) {
      return `${(montant / 1000).toFixed(0)} K`;
    }
    return montant.toFixed(0);
  };

  // Ouvrir le modal pour éditer une ligne budget
  const openBudgetModal = (ligne: PosteBudget) => {
    setSelectedBudgetLine(ligne);
    setIsNewLine(false);
    setShowBudgetModal(true);
  };

  // Ouvrir le modal pour ajouter une nouvelle ligne
  const openNewBudgetModal = () => {
    setSelectedBudgetLine({
      id: `new-${Date.now()}`,
      poste: postes[0] || 'Recrutement',
      description: '',
      montantPrevu: 0,
      montantEngage: 0,
      montantConsomme: 0,
      commentaire: '',
      piecesJointes: [],
      dateModification: new Date().toISOString().split('T')[0],
    });
    setIsNewLine(true);
    setShowBudgetModal(true);
  };

  // Sauvegarder une ligne budget
  const saveBudgetLine = (ligne: PosteBudget) => {
    if (isNewLine) {
      setBudgetMobilisation([...budgetMobilisation, ligne]);
    } else {
      setBudgetMobilisation(
        budgetMobilisation.map((l) => (l.id === ligne.id ? ligne : l))
      );
    }
    setShowBudgetModal(false);
    setSelectedBudgetLine(null);
    addToast({ type: 'success', title: isNewLine ? 'Ligne ajoutée' : 'Ligne mise à jour' });
  };

  // Supprimer une ligne budget
  const deleteBudgetLine = (id: string) => {
    setBudgetMobilisation(budgetMobilisation.filter((l) => l.id !== id));
    setShowBudgetModal(false);
    setSelectedBudgetLine(null);
    addToast({ type: 'success', title: 'Ligne supprimée' });
  };

  // Formater la taille des fichiers
  const formatFileSize = (bytes: number) => {
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} Mo`;
    if (bytes >= 1000) return `${(bytes / 1000).toFixed(0)} Ko`;
    return `${bytes} o`;
  };

  // Modal Budget Line
  const BudgetLineModal = () => {
    const [formData, setFormData] = useState<PosteBudget>(
      selectedBudgetLine || {
        id: '',
        poste: '',
        description: '',
        montantPrevu: 0,
        montantEngage: 0,
        montantConsomme: 0,
        commentaire: '',
        piecesJointes: [],
        dateModification: new Date().toISOString().split('T')[0],
      }
    );

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const newPieces: PieceJointe[] = Array.from(files).map((file) => ({
        id: `pj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nom: file.name,
        type: file.type,
        taille: file.size,
        dateAjout: new Date().toISOString().split('T')[0],
      }));

      setFormData({
        ...formData,
        piecesJointes: [...(formData.piecesJointes || []), ...newPieces],
      });
    };

    const removePieceJointe = (id: string) => {
      setFormData({
        ...formData,
        piecesJointes: (formData.piecesJointes || []).filter((p) => p.id !== id),
      });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      saveBudgetLine({
        ...formData,
        dateModification: new Date().toISOString().split('T')[0],
      });
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="border-b border-primary-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-primary-900">
              {isNewLine ? 'Nouvelle ligne budgétaire' : 'Modifier la ligne budgétaire'}
            </h2>
            <button
              onClick={() => {
                setShowBudgetModal(false);
                setSelectedBudgetLine(null);
              }}
              className="p-2 hover:bg-primary-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Infos principales */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Poste budgétaire
                </label>
                <select
                  value={formData.poste}
                  onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                  required
                >
                  {postes.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                  placeholder="Description de la ligne"
                  required
                />
              </div>
            </div>

            {/* Montants */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Montant prévu (FCFA)
                </label>
                <input
                  type="number"
                  value={formData.montantPrevu}
                  onChange={(e) => setFormData({ ...formData, montantPrevu: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg font-mono"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Montant engagé (FCFA)
                </label>
                <input
                  type="number"
                  value={formData.montantEngage}
                  onChange={(e) => setFormData({ ...formData, montantEngage: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg font-mono"
                  min="0"
                  max={formData.montantPrevu}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Montant consommé (FCFA)
                </label>
                <input
                  type="number"
                  value={formData.montantConsomme}
                  onChange={(e) => setFormData({ ...formData, montantConsomme: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg font-mono"
                  min="0"
                  max={formData.montantEngage}
                />
              </div>
            </div>

            {/* Indicateurs */}
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-600">Taux d'engagement</span>
                  <span className="font-medium text-info">
                    {formData.montantPrevu > 0
                      ? ((formData.montantEngage / formData.montantPrevu) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Taux de consommation</span>
                  <span className="font-medium text-success">
                    {formData.montantPrevu > 0
                      ? ((formData.montantConsomme / formData.montantPrevu) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Disponible</span>
                  <span className={`font-medium ${formData.montantPrevu - formData.montantConsomme >= 0 ? 'text-primary-700' : 'text-error'}`}>
                    {formatMontant(formData.montantPrevu - formData.montantConsomme)} FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Détail des lignes de dépenses */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-primary-700">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Détail des dépenses ({(formData.lignesDepenses || []).length})
                  </div>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const newDepense: LigneDepense = {
                      id: `dep-${Date.now()}`,
                      date: new Date().toISOString().split('T')[0],
                      description: '',
                      fournisseur: '',
                      montant: 0,
                      statut: 'prevu',
                    };
                    setFormData({
                      ...formData,
                      lignesDepenses: [...(formData.lignesDepenses || []), newDepense],
                    });
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter une dépense
                </button>
              </div>

              {(formData.lignesDepenses || []).length > 0 ? (
                <div className="border border-primary-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-primary-50 border-b border-primary-200">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-medium text-primary-500">Date</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-primary-500">Description</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-primary-500">Fournisseur</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-primary-500">Réf.</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-primary-500">Montant</th>
                        <th className="text-center px-3 py-2 text-xs font-medium text-primary-500">Statut</th>
                        <th className="text-center px-3 py-2 text-xs font-medium text-primary-500 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-100">
                      {(formData.lignesDepenses || []).map((dep, index) => (
                        <tr key={dep.id} className="hover:bg-primary-50">
                          <td className="px-3 py-2">
                            <input
                              type="date"
                              value={dep.date}
                              onChange={(e) => {
                                const updated = [...(formData.lignesDepenses || [])];
                                updated[index] = { ...dep, date: e.target.value };
                                setFormData({ ...formData, lignesDepenses: updated });
                              }}
                              className="w-full px-2 py-1 text-xs border border-primary-200 rounded"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={dep.description}
                              onChange={(e) => {
                                const updated = [...(formData.lignesDepenses || [])];
                                updated[index] = { ...dep, description: e.target.value };
                                setFormData({ ...formData, lignesDepenses: updated });
                              }}
                              placeholder="Description"
                              className="w-full px-2 py-1 text-xs border border-primary-200 rounded"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={dep.fournisseur}
                              onChange={(e) => {
                                const updated = [...(formData.lignesDepenses || [])];
                                updated[index] = { ...dep, fournisseur: e.target.value };
                                setFormData({ ...formData, lignesDepenses: updated });
                              }}
                              placeholder="Fournisseur"
                              className="w-full px-2 py-1 text-xs border border-primary-200 rounded"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={dep.reference || ''}
                              onChange={(e) => {
                                const updated = [...(formData.lignesDepenses || [])];
                                updated[index] = { ...dep, reference: e.target.value };
                                setFormData({ ...formData, lignesDepenses: updated });
                              }}
                              placeholder="N° facture"
                              className="w-20 px-2 py-1 text-xs border border-primary-200 rounded"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={dep.montant}
                              onChange={(e) => {
                                const updated = [...(formData.lignesDepenses || [])];
                                updated[index] = { ...dep, montant: Number(e.target.value) };
                                setFormData({ ...formData, lignesDepenses: updated });
                              }}
                              className="w-24 px-2 py-1 text-xs border border-primary-200 rounded text-right font-mono"
                              min="0"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={dep.statut}
                              onChange={(e) => {
                                const updated = [...(formData.lignesDepenses || [])];
                                updated[index] = { ...dep, statut: e.target.value as 'prevu' | 'engage' | 'paye' };
                                setFormData({ ...formData, lignesDepenses: updated });
                              }}
                              className={`w-full px-2 py-1 text-xs rounded border-0 font-medium ${
                                dep.statut === 'paye' ? 'bg-success/10 text-success' :
                                dep.statut === 'engage' ? 'bg-info/10 text-info' :
                                'bg-primary-100 text-primary-600'
                              }`}
                            >
                              <option value="prevu">Prévu</option>
                              <option value="engage">Engagé</option>
                              <option value="paye">Payé</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.lignesDepenses || []).filter((_, i) => i !== index);
                                setFormData({ ...formData, lignesDepenses: updated });
                              }}
                              className="p-1 hover:bg-error/10 rounded text-error"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-primary-50 border-t border-primary-200">
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-xs font-medium text-primary-700">
                          Total des dépenses
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-xs font-bold text-primary-900">
                          {formatMontant((formData.lignesDepenses || []).reduce((sum, d) => sum + d.montant, 0))}
                        </td>
                        <td colSpan={2} className="px-3 py-2">
                          <div className="flex gap-2 text-xs">
                            <span className="text-success">
                              Payé: {formatMontant((formData.lignesDepenses || []).filter(d => d.statut === 'paye').reduce((sum, d) => sum + d.montant, 0))}
                            </span>
                            <span className="text-info">
                              Engagé: {formatMontant((formData.lignesDepenses || []).filter(d => d.statut === 'engage').reduce((sum, d) => sum + d.montant, 0))}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="border-2 border-dashed border-primary-200 rounded-lg p-6 text-center">
                  <Receipt className="w-8 h-8 text-primary-300 mx-auto mb-2" />
                  <p className="text-sm text-primary-500">Aucune dépense enregistrée</p>
                  <p className="text-xs text-primary-400 mt-1">
                    Cliquez sur "Ajouter une dépense" pour détailler les paiements
                  </p>
                </div>
              )}
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Commentaire
                </div>
              </label>
              <textarea
                value={formData.commentaire || ''}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg resize-none"
                rows={3}
                placeholder="Ajoutez un commentaire ou des notes sur cette ligne budgétaire..."
              />
            </div>

            {/* Pièces jointes */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Pièces jointes ({(formData.piecesJointes || []).length})
                </div>
              </label>

              {/* Liste des pièces jointes */}
              {(formData.piecesJointes || []).length > 0 && (
                <div className="space-y-2 mb-3">
                  {(formData.piecesJointes || []).map((pj) => (
                    <div
                      key={pj.id}
                      className="flex items-center justify-between p-3 bg-primary-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary-500" />
                        <div>
                          <p className="text-sm font-medium text-primary-900">{pj.nom}</p>
                          <p className="text-xs text-primary-500">
                            {formatFileSize(pj.taille)} • Ajouté le {pj.dateAjout}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1.5 hover:bg-primary-200 rounded-lg text-primary-500"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removePieceJointe(pj.id)}
                          className="p-1.5 hover:bg-error/10 rounded-lg text-error"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload */}
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-primary-200 rounded-lg cursor-pointer hover:bg-primary-50 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-6 h-6 text-primary-400 mb-1" />
                  <p className="text-sm text-primary-500">
                    Cliquez pour ajouter des fichiers
                  </p>
                  <p className="text-xs text-primary-400">PDF, Excel, Word, Images</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                />
              </label>
            </div>

            {/* Date modification */}
            {formData.dateModification && !isNewLine && (
              <p className="text-xs text-primary-400 text-right">
                Dernière modification : {formData.dateModification}
              </p>
            )}
          </form>

          <div className="border-t border-primary-200 px-6 py-4 flex justify-between">
            {!isNewLine && (
              <button
                type="button"
                onClick={() => deleteBudgetLine(formData.id)}
                className="px-4 py-2 text-error hover:bg-error/10 rounded-lg flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            )}
            <div className={`flex gap-3 ${isNewLine ? 'ml-auto' : ''}`}>
              <button
                type="button"
                onClick={() => {
                  setShowBudgetModal(false);
                  setSelectedBudgetLine(null);
                }}
                className="px-4 py-2 text-primary-700 hover:bg-primary-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => saveBudgetLine({
                  ...formData,
                  dateModification: new Date().toISOString().split('T')[0],
                })}
                className="px-4 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800"
              >
                {isNewLine ? 'Ajouter' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal Phase
  const PhaseModal = () => {
    const [formData, setFormData] = useState({
      budget: selectedPhase?.budget || 0,
      budgetEngage: selectedPhase?.budgetEngage || 0,
      budgetConsomme: selectedPhase?.budgetConsomme || 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPhase) return;

      try {
        await updatePhase(selectedPhase.id, formData);
        addToast({ type: 'success', title: 'Budget mis à jour' });
        setShowPhaseModal(false);
        setSelectedPhase(null);
      } catch {
        addToast({ type: 'error', title: 'Erreur lors de la mise à jour' });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full">
          <div className="border-b border-primary-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-primary-900">
              Budget - {selectedPhase?.nom}
            </h2>
            <button
              onClick={() => {
                setShowPhaseModal(false);
                setSelectedPhase(null);
              }}
              className="p-2 hover:bg-primary-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Budget prévu (FCFA)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Budget engagé (FCFA)
              </label>
              <input
                type="number"
                value={formData.budgetEngage}
                onChange={(e) => setFormData({ ...formData, budgetEngage: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                min="0"
                max={formData.budget}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Budget consommé (FCFA)
              </label>
              <input
                type="number"
                value={formData.budgetConsomme}
                onChange={(e) =>
                  setFormData({ ...formData, budgetConsomme: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                min="0"
                max={formData.budgetEngage}
              />
            </div>

            {/* Indicateurs */}
            <div className="bg-primary-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-primary-600">Taux d'engagement</span>
                <span className="font-medium">
                  {formData.budget > 0
                    ? ((formData.budgetEngage / formData.budget) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-600">Taux de consommation</span>
                <span className="font-medium">
                  {formData.budget > 0
                    ? ((formData.budgetConsomme / formData.budget) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowPhaseModal(false);
                  setSelectedPhase(null);
                }}
                className="px-4 py-2 text-primary-700 hover:bg-primary-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800"
              >
                Mettre à jour
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
            <h1 className="text-2xl font-display font-bold text-primary-900">Budget Mobilisation</h1>
            <p className="text-primary-500">Budget de lancement et démarrage (hors construction)</p>
          </div>
        </div>
        <div className="bg-info/10 text-info px-3 py-1.5 rounded-lg text-sm font-medium">
          Budget Opérationnel
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-primary-200">
          <div className="flex items-center gap-2 text-primary-500 mb-1">
            <Wallet className="w-4 h-4" />
            <span className="text-xs">Budget total</span>
          </div>
          <p className="text-2xl font-bold text-primary-900">{formatMontant(budgetTotal)}</p>
          <p className="text-xs text-primary-400">FCFA</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-primary-200">
          <div className="flex items-center gap-2 text-primary-500 mb-1">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs">Engagé</span>
          </div>
          <p className="text-2xl font-bold text-info">{formatMontant(budgetEngage)}</p>
          <p className="text-xs text-primary-400">{tauxEngagement.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-primary-200">
          <div className="flex items-center gap-2 text-primary-500 mb-1">
            <Banknote className="w-4 h-4" />
            <span className="text-xs">Consommé</span>
          </div>
          <p className="text-2xl font-bold text-success">{formatMontant(budgetConsomme)}</p>
          <p className="text-xs text-primary-400">{tauxConsommation.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-primary-200">
          <div className="flex items-center gap-2 text-primary-500 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Restant</span>
          </div>
          <p className={`text-2xl font-bold ${budgetRestant >= 0 ? 'text-success' : 'text-error'}`}>
            {formatMontant(budgetRestant)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-primary-200">
          <div className="flex items-center gap-2 text-primary-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">Provisions</span>
          </div>
          <p className="text-2xl font-bold text-warning">{formatMontant(provisions)}</p>
          <p className="text-xs text-primary-400">{((provisions / budgetTotal) * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-primary-200">
          <div className="flex items-center gap-2 text-primary-500 mb-1">
            {budgetConsomme <= budgetEngage ? (
              <TrendingDown className="w-4 h-4 text-success" />
            ) : (
              <TrendingUp className="w-4 h-4 text-error" />
            )}
            <span className="text-xs">Écart</span>
          </div>
          <p
            className={`text-2xl font-bold ${
              budgetConsomme <= budgetEngage ? 'text-success' : 'text-error'
            }`}
          >
            {budgetConsomme <= budgetEngage ? '-' : '+'}
            {formatMontant(Math.abs(budgetConsomme - budgetEngage))}
          </p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-xl border border-primary-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('synthese')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'synthese'
                ? 'bg-primary-900 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Synthèse
          </button>
          <button
            onClick={() => setViewMode('detail')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'detail'
                ? 'bg-primary-900 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Détail
          </button>
          <button
            onClick={() => setViewMode('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'overview'
                ? 'bg-primary-900 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Graphiques
          </button>
          <button
            onClick={() => setViewMode('phases')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'phases'
                ? 'bg-primary-900 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Par phase
          </button>
        </div>
      </div>

      {/* Content */}
      {/* Vue Synthèse */}
      {viewMode === 'synthese' && (
        <div className="bg-white rounded-xl border border-primary-200 overflow-hidden">
          <div className="p-4 border-b border-primary-200 bg-primary-50">
            <h3 className="text-lg font-semibold text-primary-900">Synthèse Budget Mobilisation</h3>
            <p className="text-sm text-primary-500 mt-1">Récapitulatif par poste budgétaire</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50 border-b border-primary-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Poste
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Budget Prévu
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Engagé
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Consommé
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    Disponible
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                    % Conso.
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {totauxParPoste.map((item) => {
                  const disponible = item.prevu - item.consomme;
                  const tauxConso = item.prevu > 0 ? (item.consomme / item.prevu) * 100 : 0;
                  return (
                    <tr
                      key={item.poste}
                      className="hover:bg-primary-50 cursor-pointer"
                      onClick={() => {
                        setPosteFilter(item.poste);
                        setViewMode('detail');
                      }}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-primary-900">{item.poste}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        {formatMontant(item.prevu)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-info">
                        {formatMontant(item.engage)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-success">
                        {formatMontant(item.consomme)}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-sm ${disponible >= 0 ? 'text-primary-600' : 'text-error'}`}>
                        {formatMontant(disponible)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-primary-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${tauxConso > 100 ? 'bg-error' : tauxConso > 80 ? 'bg-warning' : 'bg-success'}`}
                              style={{ width: `${Math.min(tauxConso, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-primary-600 w-10">{tauxConso.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-primary-100 border-t-2 border-primary-300 font-bold">
                <tr>
                  <td className="px-4 py-3 text-primary-900">TOTAL</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatMontant(totalBudgetMobilisation.prevu)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-info">
                    {formatMontant(totalBudgetMobilisation.engage)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-success">
                    {formatMontant(totalBudgetMobilisation.consomme)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatMontant(totalBudgetMobilisation.prevu - totalBudgetMobilisation.consomme)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm">
                      {((totalBudgetMobilisation.consomme / totalBudgetMobilisation.prevu) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Vue Détail */}
      {viewMode === 'detail' && (
        <div className="bg-white rounded-xl border border-primary-200 overflow-hidden">
            <div className="p-4 border-b border-primary-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900">Détail des lignes budgétaires</h3>
                <p className="text-sm text-primary-500 mt-1">Suivi ligne par ligne du budget mobilisation</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={posteFilter}
                  onChange={(e) => setPosteFilter(e.target.value)}
                  className="px-3 py-2 border border-primary-200 rounded-lg text-sm"
                >
                  <option value="all">Tous les postes</option>
                  {postes.map((poste) => (
                    <option key={poste} value={poste}>{poste}</option>
                  ))}
                </select>
                <button
                  onClick={openNewBudgetModal}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-50 border-b border-primary-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                      Poste
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                      Description
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                      Prévu
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                      Engagé
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                      Consommé
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                      Reste
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                      Avancement
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                      Infos
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-primary-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {filteredBudgetMobilisation.map((ligne) => {
                    const reste = ligne.montantPrevu - ligne.montantConsomme;
                    const tauxConso = ligne.montantPrevu > 0 ? (ligne.montantConsomme / ligne.montantPrevu) * 100 : 0;
                    const hasComment = ligne.commentaire && ligne.commentaire.length > 0;
                    const hasAttachments = ligne.piecesJointes && ligne.piecesJointes.length > 0;
                    return (
                      <tr key={ligne.id} className="hover:bg-primary-50 group">
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                            {ligne.poste}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-primary-900">
                          <div>
                            {ligne.description}
                            {hasComment && (
                              <p className="text-xs text-primary-400 mt-1 line-clamp-1" title={ligne.commentaire}>
                                {ligne.commentaire}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {formatMontant(ligne.montantPrevu)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-info">
                          {formatMontant(ligne.montantEngage)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-success">
                          {formatMontant(ligne.montantConsomme)}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono text-sm ${reste >= 0 ? 'text-primary-600' : 'text-error font-bold'}`}>
                          {formatMontant(reste)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 h-2 bg-primary-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${tauxConso >= 100 ? 'bg-success' : tauxConso > 80 ? 'bg-warning' : 'bg-info'}`}
                                style={{ width: `${Math.min(tauxConso, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-primary-500 w-8">{tauxConso.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {ligne.lignesDepenses && ligne.lignesDepenses.length > 0 && (
                              <span className="p-1 rounded bg-success/10 text-success flex items-center gap-0.5" title={`${ligne.lignesDepenses.length} ligne(s) de dépense`}>
                                <Receipt className="w-3.5 h-3.5" />
                                <span className="text-xs">{ligne.lignesDepenses.length}</span>
                              </span>
                            )}
                            {hasComment && (
                              <span className="p-1 rounded bg-info/10 text-info" title={ligne.commentaire}>
                                <MessageSquare className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {hasAttachments && (
                              <span className="p-1 rounded bg-warning/10 text-warning flex items-center gap-0.5" title={`${ligne.piecesJointes?.length} pièce(s) jointe(s)`}>
                                <Paperclip className="w-3.5 h-3.5" />
                                <span className="text-xs">{ligne.piecesJointes?.length}</span>
                              </span>
                            )}
                            {!hasComment && !hasAttachments && (!ligne.lignesDepenses || ligne.lignesDepenses.length === 0) && (
                              <span className="text-xs text-primary-300">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openBudgetModal(ligne)}
                            className="p-2 hover:bg-primary-100 rounded-lg text-primary-500 hover:text-primary-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-primary-50 border-t border-primary-200 font-medium">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-sm text-primary-700">
                      Total {posteFilter !== 'all' ? `(${posteFilter})` : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {formatMontant(filteredBudgetMobilisation.reduce((sum, l) => sum + l.montantPrevu, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-info">
                      {formatMontant(filteredBudgetMobilisation.reduce((sum, l) => sum + l.montantEngage, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-success">
                      {formatMontant(filteredBudgetMobilisation.reduce((sum, l) => sum + l.montantConsomme, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {formatMontant(filteredBudgetMobilisation.reduce((sum, l) => sum + (l.montantPrevu - l.montantConsomme), 0))}
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
      )}

      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique par phase */}
          <div className="bg-white rounded-xl border border-primary-200 p-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Budget par phase</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataPhases}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}M`} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)} M FCFA`, '']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar dataKey="Prévu" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Engagé" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Consommé" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Répartition par catégorie */}
          <div className="bg-white rounded-xl border border-primary-200 p-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Répartition par catégorie</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={categoryTotals}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryTotals.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatMontant(value) + ' FCFA', 'Budget']}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Évolution budgétaire */}
          <div className="bg-white rounded-xl border border-primary-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Évolution budgétaire</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}M`} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)} M FCFA`, '']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="prevu"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                    name="Engagé (prévu)"
                  />
                  <Line
                    type="monotone"
                    dataKey="reel"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                    name="Consommé (réel)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'phases' && (
        <div className="space-y-4">
          {projetPhases.map((phase) => {
            const tauxEng = phase.budget > 0 ? (phase.budgetEngage / phase.budget) * 100 : 0;
            const tauxCons = phase.budget > 0 ? (phase.budgetConsomme / phase.budget) * 100 : 0;
            const ecart = phase.budgetConsomme - phase.budgetEngage;

            return (
              <div
                key={phase.id}
                className="bg-white rounded-xl border border-primary-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          phase.statut === 'termine'
                            ? 'bg-success/10 text-success'
                            : phase.statut === 'en_cours'
                              ? 'bg-info/10 text-info'
                              : 'bg-primary-100 text-primary-500'
                        }`}
                      >
                        {phase.numero}
                      </span>
                      <h3 className="text-lg font-semibold text-primary-900">{phase.nom}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          phase.statut === 'termine'
                            ? 'bg-success/10 text-success'
                            : phase.statut === 'en_cours'
                              ? 'bg-info/10 text-info'
                              : 'bg-primary-100 text-primary-500'
                        }`}
                      >
                        {phase.statut === 'termine'
                          ? 'Terminé'
                          : phase.statut === 'en_cours'
                            ? 'En cours'
                            : 'À venir'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPhase(phase);
                      setShowPhaseModal(true);
                    }}
                    className="p-2 hover:bg-primary-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4 text-primary-500" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-primary-500">Budget prévu</p>
                    <p className="text-xl font-bold text-primary-900">
                      {formatMontant(phase.budget)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-500">Engagé</p>
                    <p className="text-xl font-bold text-info">
                      {formatMontant(phase.budgetEngage)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-500">Consommé</p>
                    <p className="text-xl font-bold text-success">
                      {formatMontant(phase.budgetConsomme)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-500">Écart</p>
                    <p
                      className={`text-xl font-bold ${
                        ecart <= 0 ? 'text-success' : 'text-error'
                      }`}
                    >
                      {ecart <= 0 ? '' : '+'}
                      {formatMontant(ecart)}
                    </p>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-primary-600">Engagement</span>
                      <span className="font-medium">{tauxEng.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-info rounded-full transition-all"
                        style={{ width: `${Math.min(tauxEng, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-primary-600">Consommation</span>
                      <span className="font-medium">{tauxCons.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          tauxCons > 100 ? 'bg-error' : 'bg-success'
                        }`}
                        style={{ width: `${Math.min(tauxCons, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showPhaseModal && selectedPhase && <PhaseModal />}
      {showBudgetModal && selectedBudgetLine && <BudgetLineModal />}
    </div>
  );
}
