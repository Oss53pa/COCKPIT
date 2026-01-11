import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  X,
  Users,
  Target,
  ClipboardList,
  Calendar,
  TrendingUp,
  Building2,
  Briefcase,
  UserPlus,
  Milestone,
  FileText,
  DollarSign,
  BarChart3,
  Zap,
  ShieldAlert,
  Store,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Modal,
  Select,
} from '../components/ui';
import { useCentresStore, useAppStore } from '../store';
import { db } from '../db/database';

// ===========================================
// DEFINITIONS DES TABLES IMPORTABLES
// ===========================================

interface TableDefinition {
  id: string;
  nom: string;
  description: string;
  icon: React.ReactNode;
  categorie: 'gestion' | 'bi' | 'projet';
  colonnes: ColonneDefinition[];
  tableName: string;
}

interface ColonneDefinition {
  id: string;
  nom: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  obligatoire: boolean;
  description?: string;
  options?: string[]; // Pour les selects
  exemple?: string;
}

const TABLES_IMPORTABLES: TableDefinition[] = [
  // === GESTION ===
  {
    id: 'equipe',
    nom: 'Membres d\'équipe',
    description: 'Liste des collaborateurs du centre',
    icon: <Users className="w-5 h-5" />,
    categorie: 'gestion',
    tableName: 'membresEquipe',
    colonnes: [
      { id: 'nom', nom: 'Nom', type: 'string', obligatoire: true, exemple: 'Dupont' },
      { id: 'prenom', nom: 'Prénom', type: 'string', obligatoire: true, exemple: 'Jean' },
      { id: 'email', nom: 'Email', type: 'string', obligatoire: true, exemple: 'jean.dupont@email.com' },
      { id: 'telephone', nom: 'Téléphone', type: 'string', obligatoire: false, exemple: '+33612345678' },
      { id: 'poste', nom: 'Poste', type: 'string', obligatoire: true, exemple: 'Directeur' },
      { id: 'departement', nom: 'Département', type: 'string', obligatoire: false, exemple: 'Direction' },
      { id: 'dateEntree', nom: 'Date d\'entrée', type: 'date', obligatoire: false, exemple: '2024-01-15' },
      { id: 'statut', nom: 'Statut', type: 'select', obligatoire: true, options: ['actif', 'inactif', 'conge'], exemple: 'actif' },
    ],
  },
  {
    id: 'objectifs',
    nom: 'Objectifs',
    description: 'Objectifs stratégiques et opérationnels',
    icon: <Target className="w-5 h-5" />,
    categorie: 'gestion',
    tableName: 'objectifs',
    colonnes: [
      { id: 'code', nom: 'Code', type: 'string', obligatoire: true, exemple: 'OBJ-001' },
      { id: 'titre', nom: 'Titre', type: 'string', obligatoire: true, exemple: 'Augmenter la fréquentation' },
      { id: 'description', nom: 'Description', type: 'string', obligatoire: false, exemple: 'Atteindre 1M visiteurs/an' },
      { id: 'axeCode', nom: 'Code Axe', type: 'string', obligatoire: true, exemple: 'AXE-COM' },
      { id: 'responsable', nom: 'Responsable (email)', type: 'string', obligatoire: false, exemple: 'jean.dupont@email.com' },
      { id: 'cible', nom: 'Cible', type: 'number', obligatoire: true, exemple: '1000000' },
      { id: 'unite', nom: 'Unité', type: 'string', obligatoire: true, exemple: 'visiteurs' },
      { id: 'frequenceMesure', nom: 'Fréquence', type: 'select', obligatoire: true, options: ['mensuel', 'trimestriel', 'annuel'], exemple: 'mensuel' },
    ],
  },
  {
    id: 'actions',
    nom: 'Plans d\'actions',
    description: 'Actions et tâches à réaliser',
    icon: <ClipboardList className="w-5 h-5" />,
    categorie: 'gestion',
    tableName: 'actions',
    colonnes: [
      { id: 'titre', nom: 'Titre', type: 'string', obligatoire: true, exemple: 'Organiser événement portes ouvertes' },
      { id: 'description', nom: 'Description', type: 'string', obligatoire: false, exemple: 'Événement grand public' },
      { id: 'responsable', nom: 'Responsable (email)', type: 'string', obligatoire: false, exemple: 'jean.dupont@email.com' },
      { id: 'dateEcheance', nom: 'Date échéance', type: 'date', obligatoire: true, exemple: '2024-06-30' },
      { id: 'priorite', nom: 'Priorité', type: 'select', obligatoire: true, options: ['haute', 'moyenne', 'basse'], exemple: 'haute' },
      { id: 'statut', nom: 'Statut', type: 'select', obligatoire: true, options: ['a_faire', 'en_cours', 'termine', 'annule'], exemple: 'a_faire' },
      { id: 'objectifCode', nom: 'Code Objectif', type: 'string', obligatoire: false, exemple: 'OBJ-001' },
    ],
  },
  {
    id: 'reunions',
    nom: 'Réunions',
    description: 'Réunions et comités',
    icon: <Calendar className="w-5 h-5" />,
    categorie: 'gestion',
    tableName: 'reunions',
    colonnes: [
      { id: 'titre', nom: 'Titre', type: 'string', obligatoire: true, exemple: 'Comité de direction' },
      { id: 'type', nom: 'Type', type: 'select', obligatoire: true, options: ['comite_direction', 'revue_performance', 'reunion_equipe', 'autre'], exemple: 'comite_direction' },
      { id: 'date', nom: 'Date', type: 'date', obligatoire: true, exemple: '2024-03-15' },
      { id: 'heureDebut', nom: 'Heure début', type: 'string', obligatoire: false, exemple: '09:00' },
      { id: 'heureFin', nom: 'Heure fin', type: 'string', obligatoire: false, exemple: '11:00' },
      { id: 'lieu', nom: 'Lieu', type: 'string', obligatoire: false, exemple: 'Salle de réunion A' },
      { id: 'organisateur', nom: 'Organisateur (email)', type: 'string', obligatoire: false, exemple: 'jean.dupont@email.com' },
    ],
  },

  // === BI / EXPLOITATION ===
  {
    id: 'etats_locatifs',
    nom: 'États locatifs',
    description: 'Liste des lots et locataires',
    icon: <Building2 className="w-5 h-5" />,
    categorie: 'bi',
    tableName: 'etatsLocatifs',
    colonnes: [
      { id: 'lotId', nom: 'ID Lot', type: 'string', obligatoire: true, exemple: 'LOT-001' },
      { id: 'lotNumero', nom: 'Numéro lot', type: 'string', obligatoire: true, exemple: 'A-101' },
      { id: 'niveau', nom: 'Niveau', type: 'string', obligatoire: false, exemple: 'RDC' },
      { id: 'locataireEnseigne', nom: 'Enseigne', type: 'string', obligatoire: true, exemple: 'Zara' },
      { id: 'locataireRaisonSociale', nom: 'Raison sociale', type: 'string', obligatoire: false, exemple: 'ZARA FRANCE SAS' },
      { id: 'activite', nom: 'Activité', type: 'string', obligatoire: true, exemple: 'Prêt-à-porter' },
      { id: 'surfaceGLA', nom: 'Surface GLA (m²)', type: 'number', obligatoire: true, exemple: '450' },
      { id: 'loyerMinimumGaranti', nom: 'Loyer annuel (€)', type: 'number', obligatoire: true, exemple: '120000' },
      { id: 'statutOccupation', nom: 'Statut', type: 'select', obligatoire: true, options: ['occupe', 'vacant', 'pre_loue', 'travaux'], exemple: 'occupe' },
      { id: 'bailDebut', nom: 'Début bail', type: 'date', obligatoire: false, exemple: '2022-01-01' },
      { id: 'bailFin', nom: 'Fin bail', type: 'date', obligatoire: false, exemple: '2031-12-31' },
    ],
  },
  {
    id: 'loyers',
    nom: 'Loyers',
    description: 'Quittancement et encaissements',
    icon: <DollarSign className="w-5 h-5" />,
    categorie: 'bi',
    tableName: 'donneesLoyers',
    colonnes: [
      { id: 'lotId', nom: 'ID Lot', type: 'string', obligatoire: true, exemple: 'LOT-001' },
      { id: 'periode', nom: 'Période (YYYY-MM)', type: 'string', obligatoire: true, exemple: '2024-01' },
      { id: 'loyerAppele', nom: 'Loyer appelé', type: 'number', obligatoire: true, exemple: '10000' },
      { id: 'loyerEncaisse', nom: 'Loyer encaissé', type: 'number', obligatoire: true, exemple: '10000' },
      { id: 'chargesAppelees', nom: 'Charges appelées', type: 'number', obligatoire: false, exemple: '2000' },
      { id: 'chargesEncaissees', nom: 'Charges encaissées', type: 'number', obligatoire: false, exemple: '2000' },
      { id: 'dateEncaissement', nom: 'Date encaissement', type: 'date', obligatoire: false, exemple: '2024-01-05' },
    ],
  },
  {
    id: 'frequentation',
    nom: 'Fréquentation',
    description: 'Comptages visiteurs',
    icon: <TrendingUp className="w-5 h-5" />,
    categorie: 'bi',
    tableName: 'donneesFrequentation',
    colonnes: [
      { id: 'date', nom: 'Date', type: 'date', obligatoire: true, exemple: '2024-01-15' },
      { id: 'entreesTotal', nom: 'Entrées totales', type: 'number', obligatoire: true, exemple: '15000' },
      { id: 'entreesPrincipale', nom: 'Entrée principale', type: 'number', obligatoire: false, exemple: '8000' },
      { id: 'entreesSecondaires', nom: 'Entrées secondaires', type: 'number', obligatoire: false, exemple: '7000' },
      { id: 'tauxTransformation', nom: 'Taux transformation (%)', type: 'number', obligatoire: false, exemple: '45' },
    ],
  },
  {
    id: 'chiffre_affaires',
    nom: 'Chiffre d\'affaires',
    description: 'CA déclarés par enseignes',
    icon: <BarChart3 className="w-5 h-5" />,
    categorie: 'bi',
    tableName: 'donneesChiffreAffaires',
    colonnes: [
      { id: 'lotId', nom: 'ID Lot', type: 'string', obligatoire: true, exemple: 'LOT-001' },
      { id: 'periode', nom: 'Période (YYYY-MM)', type: 'string', obligatoire: true, exemple: '2024-01' },
      { id: 'caDeclare', nom: 'CA déclaré', type: 'number', obligatoire: true, exemple: '250000' },
      { id: 'caEstime', nom: 'CA estimé', type: 'number', obligatoire: false, exemple: '260000' },
      { id: 'variationN1', nom: 'Variation N-1 (%)', type: 'number', obligatoire: false, exemple: '5.2' },
    ],
  },
  {
    id: 'charges',
    nom: 'Charges',
    description: 'Charges d\'exploitation',
    icon: <Zap className="w-5 h-5" />,
    categorie: 'bi',
    tableName: 'donneesCharges',
    colonnes: [
      { id: 'periode', nom: 'Période (YYYY-MM)', type: 'string', obligatoire: true, exemple: '2024-01' },
      { id: 'categorie', nom: 'Catégorie', type: 'select', obligatoire: true, options: ['energie', 'securite', 'nettoyage', 'maintenance', 'assurance', 'taxes', 'marketing', 'autre'], exemple: 'energie' },
      { id: 'libelle', nom: 'Libellé', type: 'string', obligatoire: true, exemple: 'Électricité parties communes' },
      { id: 'montantBudget', nom: 'Budget', type: 'number', obligatoire: false, exemple: '15000' },
      { id: 'montantReel', nom: 'Réel', type: 'number', obligatoire: true, exemple: '14500' },
      { id: 'fournisseur', nom: 'Fournisseur', type: 'string', obligatoire: false, exemple: 'EDF' },
    ],
  },
  {
    id: 'baux',
    nom: 'Baux',
    description: 'Détails des contrats de bail',
    icon: <FileText className="w-5 h-5" />,
    categorie: 'bi',
    tableName: 'donneesBaux',
    colonnes: [
      { id: 'lotId', nom: 'ID Lot', type: 'string', obligatoire: true, exemple: 'LOT-001' },
      { id: 'numeroBail', nom: 'N° Bail', type: 'string', obligatoire: true, exemple: 'BAIL-2022-001' },
      { id: 'locataire', nom: 'Locataire', type: 'string', obligatoire: true, exemple: 'ZARA FRANCE SAS' },
      { id: 'dateDebut', nom: 'Date début', type: 'date', obligatoire: true, exemple: '2022-01-01' },
      { id: 'dateFin', nom: 'Date fin', type: 'date', obligatoire: true, exemple: '2031-12-31' },
      { id: 'dateBreak', nom: 'Date break', type: 'date', obligatoire: false, exemple: '2025-12-31' },
      { id: 'loyerAnnuel', nom: 'Loyer annuel', type: 'number', obligatoire: true, exemple: '120000' },
      { id: 'chargesAnnuelles', nom: 'Charges annuelles', type: 'number', obligatoire: false, exemple: '24000' },
      { id: 'indexation', nom: 'Indexation', type: 'string', obligatoire: false, exemple: 'ILC' },
      { id: 'tauxVariable', nom: 'Taux variable (%)', type: 'number', obligatoire: false, exemple: '8' },
    ],
  },

  // === PROJET ===
  {
    id: 'jalons',
    nom: 'Jalons projet',
    description: 'Jalons du planning projet',
    icon: <Milestone className="w-5 h-5" />,
    categorie: 'projet',
    tableName: 'jalons',
    colonnes: [
      { id: 'code', nom: 'Code', type: 'string', obligatoire: true, exemple: 'JAL-001' },
      { id: 'titre', nom: 'Titre', type: 'string', obligatoire: true, exemple: 'Livraison structure' },
      { id: 'description', nom: 'Description', type: 'string', obligatoire: false, exemple: 'Fin des travaux gros oeuvre' },
      { id: 'phase', nom: 'Phase', type: 'select', obligatoire: true, options: ['conception', 'construction', 'amenagement', 'commercialisation', 'ouverture'], exemple: 'construction' },
      { id: 'datePrevue', nom: 'Date prévue', type: 'date', obligatoire: true, exemple: '2024-06-30' },
      { id: 'dateReelle', nom: 'Date réelle', type: 'date', obligatoire: false, exemple: '' },
      { id: 'statut', nom: 'Statut', type: 'select', obligatoire: true, options: ['a_venir', 'en_cours', 'atteint', 'retard', 'annule'], exemple: 'a_venir' },
      { id: 'responsable', nom: 'Responsable', type: 'string', obligatoire: false, exemple: 'Chef de projet' },
    ],
  },
  {
    id: 'prospects',
    nom: 'Prospects commerciaux',
    description: 'Pipeline de commercialisation',
    icon: <Store className="w-5 h-5" />,
    categorie: 'projet',
    tableName: 'prospectsCommerciaux',
    colonnes: [
      { id: 'enseigne', nom: 'Enseigne', type: 'string', obligatoire: true, exemple: 'Nike' },
      { id: 'contact', nom: 'Contact', type: 'string', obligatoire: false, exemple: 'M. Martin' },
      { id: 'email', nom: 'Email', type: 'string', obligatoire: false, exemple: 'contact@nike.fr' },
      { id: 'telephone', nom: 'Téléphone', type: 'string', obligatoire: false, exemple: '+33145678900' },
      { id: 'activite', nom: 'Activité', type: 'string', obligatoire: true, exemple: 'Sport' },
      { id: 'surfaceDemandee', nom: 'Surface demandée (m²)', type: 'number', obligatoire: false, exemple: '300' },
      { id: 'lotCible', nom: 'Lot ciblé', type: 'string', obligatoire: false, exemple: 'A-201' },
      { id: 'statut', nom: 'Statut', type: 'select', obligatoire: true, options: ['prospect', 'contact', 'negociation', 'offre', 'signe', 'perdu'], exemple: 'prospect' },
      { id: 'probabilite', nom: 'Probabilité (%)', type: 'number', obligatoire: false, exemple: '30' },
      { id: 'loyerCible', nom: 'Loyer cible', type: 'number', obligatoire: false, exemple: '90000' },
    ],
  },
  {
    id: 'postes_recruter',
    nom: 'Postes à recruter',
    description: 'Plan de recrutement',
    icon: <UserPlus className="w-5 h-5" />,
    categorie: 'projet',
    tableName: 'postesARecruter',
    colonnes: [
      { id: 'titre', nom: 'Titre du poste', type: 'string', obligatoire: true, exemple: 'Responsable sécurité' },
      { id: 'departement', nom: 'Département', type: 'string', obligatoire: true, exemple: 'Sécurité' },
      { id: 'nombrePostes', nom: 'Nombre de postes', type: 'number', obligatoire: true, exemple: '2' },
      { id: 'dateCible', nom: 'Date cible', type: 'date', obligatoire: true, exemple: '2024-09-01' },
      { id: 'priorite', nom: 'Priorité', type: 'select', obligatoire: true, options: ['critique', 'haute', 'moyenne', 'basse'], exemple: 'haute' },
      { id: 'statut', nom: 'Statut', type: 'select', obligatoire: true, options: ['a_ouvrir', 'ouvert', 'en_cours', 'pourvu', 'annule'], exemple: 'a_ouvrir' },
      { id: 'typeContrat', nom: 'Type contrat', type: 'select', obligatoire: false, options: ['CDI', 'CDD', 'Interim', 'Stage'], exemple: 'CDI' },
      { id: 'salairePrevisionnel', nom: 'Salaire prévu', type: 'number', obligatoire: false, exemple: '45000' },
    ],
  },
  {
    id: 'risques_projet',
    nom: 'Risques projet',
    description: 'Registre des risques',
    icon: <ShieldAlert className="w-5 h-5" />,
    categorie: 'projet',
    tableName: 'risquesProjet',
    colonnes: [
      { id: 'code', nom: 'Code', type: 'string', obligatoire: true, exemple: 'RSQ-001' },
      { id: 'titre', nom: 'Titre', type: 'string', obligatoire: true, exemple: 'Retard livraison structure' },
      { id: 'description', nom: 'Description', type: 'string', obligatoire: false, exemple: 'Risque de retard sur le gros oeuvre' },
      { id: 'categorie', nom: 'Catégorie', type: 'select', obligatoire: true, options: ['technique', 'financier', 'planning', 'commercial', 'juridique', 'autre'], exemple: 'planning' },
      { id: 'probabilite', nom: 'Probabilité (1-5)', type: 'number', obligatoire: true, exemple: '3' },
      { id: 'impact', nom: 'Impact (1-5)', type: 'number', obligatoire: true, exemple: '4' },
      { id: 'statut', nom: 'Statut', type: 'select', obligatoire: true, options: ['identifie', 'en_traitement', 'resolu', 'clos'], exemple: 'identifie' },
      { id: 'responsable', nom: 'Responsable', type: 'string', obligatoire: false, exemple: 'Chef de projet' },
      { id: 'planMitigation', nom: 'Plan mitigation', type: 'string', obligatoire: false, exemple: 'Suivi hebdomadaire avec entreprise' },
    ],
  },
];

// ===========================================
// COMPOSANT PRINCIPAL
// ===========================================

export function ImportData() {
  const { centreId } = useParams<{ centreId: string }>();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const { addToast } = useAppStore();

  const [categorieFiltre, setCategorieFiltre] = useState<'all' | 'gestion' | 'bi' | 'projet'>('all');
  const [tableSelectionnee, setTableSelectionnee] = useState<TableDefinition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fichierCharge, setFichierCharge] = useState<File | null>(null);
  const [donneesPreview, setDonneesPreview] = useState<Record<string, unknown>[]>([]);
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);

  // Filtrer les tables par catégorie
  const tablesFiltrees = TABLES_IMPORTABLES.filter(
    (t) => categorieFiltre === 'all' || t.categorie === categorieFiltre
  );

  // Télécharger un template vide
  const telechargerTemplate = (table: TableDefinition) => {
    const wb = XLSX.utils.book_new();

    // Créer les headers
    const headers = table.colonnes.map((c) => c.nom);
    const exemples = table.colonnes.map((c) => c.exemple || '');
    const descriptions = table.colonnes.map((c) => {
      let desc = c.obligatoire ? '(Obligatoire) ' : '(Optionnel) ';
      desc += c.description || '';
      if (c.type === 'select' && c.options) {
        desc += ` Valeurs: ${c.options.join(', ')}`;
      }
      if (c.type === 'date') {
        desc += ' Format: YYYY-MM-DD';
      }
      return desc;
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, exemples, descriptions]);

    // Ajuster la largeur des colonnes
    ws['!cols'] = headers.map(() => ({ wch: 20 }));

    XLSX.utils.book_append_sheet(wb, ws, table.nom.substring(0, 31));
    XLSX.writeFile(wb, `template_${table.id}.xlsx`);

    addToast({ type: 'success', title: 'Template téléchargé', message: `Template ${table.nom} téléchargé` });
  };

  // Ouvrir le modal d'import
  const ouvrirImport = (table: TableDefinition) => {
    setTableSelectionnee(table);
    setFichierCharge(null);
    setDonneesPreview([]);
    setErreurs([]);
    setImportResult(null);
    setIsModalOpen(true);
  };

  // Gérer l'upload de fichier
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tableSelectionnee) return;

    setFichierCharge(file);
    setErreurs([]);
    setImportResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

      if (jsonData.length < 2) {
        setErreurs(['Le fichier doit contenir au moins une ligne de données (en plus des en-têtes)']);
        return;
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1).filter((row) => (row as unknown[]).some((cell) => cell !== '' && cell !== null && cell !== undefined));

      // Mapper les colonnes
      const mappedData: Record<string, unknown>[] = [];
      const validationErrors: string[] = [];

      rows.forEach((row, rowIndex) => {
        const rowData: Record<string, unknown> = {};
        const rowArray = row as unknown[];

        tableSelectionnee.colonnes.forEach((col) => {
          const headerIndex = headers.findIndex(
            (h) => h?.toLowerCase().trim() === col.nom.toLowerCase().trim()
          );

          if (headerIndex !== -1) {
            let value = rowArray[headerIndex];

            // Convertir selon le type
            if (col.type === 'number' && value !== undefined && value !== '') {
              value = Number(value);
              if (isNaN(value as number)) {
                validationErrors.push(`Ligne ${rowIndex + 2}: "${col.nom}" doit être un nombre`);
              }
            } else if (col.type === 'date' && value) {
              // Excel peut stocker les dates comme nombres
              if (typeof value === 'number') {
                const date = XLSX.SSF.parse_date_code(value);
                value = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
              }
            } else if (col.type === 'boolean') {
              value = value === true || value === 'true' || value === 'oui' || value === '1';
            } else if (col.type === 'select' && value && col.options) {
              const strValue = String(value).toLowerCase().trim();
              if (!col.options.some((opt) => opt.toLowerCase() === strValue)) {
                validationErrors.push(
                  `Ligne ${rowIndex + 2}: "${col.nom}" doit être une des valeurs: ${col.options.join(', ')}`
                );
              }
            }

            rowData[col.id] = value;
          } else if (col.obligatoire) {
            validationErrors.push(`Colonne obligatoire manquante: "${col.nom}"`);
          }
        });

        // Vérifier les champs obligatoires
        tableSelectionnee.colonnes
          .filter((c) => c.obligatoire)
          .forEach((col) => {
            if (rowData[col.id] === undefined || rowData[col.id] === '' || rowData[col.id] === null) {
              validationErrors.push(`Ligne ${rowIndex + 2}: "${col.nom}" est obligatoire`);
            }
          });

        mappedData.push(rowData);
      });

      setDonneesPreview(mappedData.slice(0, 5)); // Preview des 5 premières lignes
      setErreurs([...new Set(validationErrors)]); // Erreurs uniques

      if (validationErrors.length === 0) {
        addToast({ type: 'success', title: 'Fichier valide', message: `${mappedData.length} lignes prêtes à importer` });
      }
    } catch (error) {
      setErreurs([`Erreur de lecture du fichier: ${error}`]);
    }
  }, [tableSelectionnee, addToast]);

  // Importer les données
  const importerDonnees = async () => {
    if (!tableSelectionnee || !fichierCharge || !centreId || erreurs.length > 0) return;

    setIsImporting(true);
    let success = 0;
    let errors = 0;

    try {
      const data = await fichierCharge.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1).filter((row) => (row as unknown[]).some((cell) => cell !== '' && cell !== null && cell !== undefined));

      for (const row of rows) {
        try {
          const rowArray = row as unknown[];
          const rowData: Record<string, unknown> = {
            id: uuidv4(),
            centreId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          tableSelectionnee.colonnes.forEach((col) => {
            const headerIndex = headers.findIndex(
              (h) => h?.toLowerCase().trim() === col.nom.toLowerCase().trim()
            );

            if (headerIndex !== -1) {
              let value = rowArray[headerIndex];

              if (col.type === 'number' && value !== undefined && value !== '') {
                value = Number(value);
              } else if (col.type === 'date' && value && typeof value === 'number') {
                const date = XLSX.SSF.parse_date_code(value);
                value = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
              } else if (col.type === 'boolean') {
                value = value === true || value === 'true' || value === 'oui' || value === '1';
              }

              rowData[col.id] = value;
            }
          });

          // Insérer dans la table appropriée
          const table = db.table(tableSelectionnee.tableName);
          await table.add(rowData);
          success++;
        } catch (err) {
          console.error('Erreur insertion ligne:', err);
          errors++;
        }
      }

      setImportResult({ success, errors });
      addToast({
        type: errors > 0 ? 'warning' : 'success',
        title: 'Import terminé',
        message: `${success} lignes importées, ${errors} erreurs`,
      });
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: `Erreur d'import: ${error}` });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Import de données</h1>
          <p className="text-primary-500 mt-1">
            {centre?.nom} - Importez des données depuis des fichiers Excel
          </p>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-primary-500">Filtrer:</span>
        {[
          { value: 'all', label: 'Toutes' },
          { value: 'gestion', label: 'Gestion' },
          { value: 'bi', label: 'Exploitation / BI' },
          { value: 'projet', label: 'Projet' },
        ].map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategorieFiltre(cat.value as typeof categorieFiltre)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              categorieFiltre === cat.value
                ? 'bg-accent text-white'
                : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grille des tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tablesFiltrees.map((table) => (
          <Card key={table.id} className="hover:border-accent transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    table.categorie === 'gestion'
                      ? 'bg-accent/10 text-accent'
                      : table.categorie === 'bi'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {table.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-primary-900">{table.nom}</h3>
                  <p className="text-sm text-primary-500 mt-0.5">{table.description}</p>
                  <p className="text-xs text-primary-400 mt-1">
                    {table.colonnes.length} colonnes ({table.colonnes.filter((c) => c.obligatoire).length} obligatoires)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={() => telechargerTemplate(table)}
                  className="flex-1"
                >
                  Template
                </Button>
                <Button
                  size="sm"
                  leftIcon={<Upload className="w-4 h-4" />}
                  onClick={() => ouvrirImport(table)}
                  className="flex-1"
                >
                  Importer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal d'import */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Importer - ${tableSelectionnee?.nom}`}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Fermer
            </Button>
            <Button
              onClick={importerDonnees}
              disabled={!fichierCharge || erreurs.length > 0 || isImporting || !!importResult}
              leftIcon={isImporting ? <Upload className="w-4 h-4 animate-pulse" /> : <CheckCircle className="w-4 h-4" />}
            >
              {isImporting ? 'Import en cours...' : 'Importer'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Zone d'upload */}
          <div className="border-2 border-dashed border-primary-200 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileSpreadsheet className="w-12 h-12 text-primary-300 mx-auto mb-2" />
              <p className="text-primary-600 font-medium">
                {fichierCharge ? fichierCharge.name : 'Cliquez pour sélectionner un fichier'}
              </p>
              <p className="text-sm text-primary-400 mt-1">Excel (.xlsx, .xls) ou CSV</p>
            </label>
          </div>

          {/* Colonnes attendues */}
          {tableSelectionnee && (
            <div>
              <h4 className="text-sm font-medium text-primary-700 mb-2">Colonnes attendues:</h4>
              <div className="flex flex-wrap gap-1">
                {tableSelectionnee.colonnes.map((col) => (
                  <Badge
                    key={col.id}
                    className={col.obligatoire ? 'bg-accent/10 text-accent' : 'bg-primary-100 text-primary-600'}
                  >
                    {col.nom}
                    {col.obligatoire && ' *'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Erreurs */}
          {erreurs.length > 0 && (
            <div className="p-3 bg-error/10 rounded-lg">
              <div className="flex items-center gap-2 text-error font-medium mb-2">
                <AlertTriangle className="w-4 h-4" />
                {erreurs.length} erreur(s) détectée(s)
              </div>
              <ul className="text-sm text-error space-y-1 max-h-32 overflow-y-auto">
                {erreurs.slice(0, 10).map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
                {erreurs.length > 10 && <li>... et {erreurs.length - 10} autres erreurs</li>}
              </ul>
            </div>
          )}

          {/* Preview */}
          {donneesPreview.length > 0 && erreurs.length === 0 && (
            <div>
              <h4 className="text-sm font-medium text-primary-700 mb-2">
                Aperçu ({donneesPreview.length} premières lignes):
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-primary-50">
                      {tableSelectionnee?.colonnes.slice(0, 5).map((col) => (
                        <th key={col.id} className="px-2 py-1 text-left text-primary-600">
                          {col.nom}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {donneesPreview.map((row, i) => (
                      <tr key={i} className="border-t border-primary-100">
                        {tableSelectionnee?.colonnes.slice(0, 5).map((col) => (
                          <td key={col.id} className="px-2 py-1 text-primary-700">
                            {String(row[col.id] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Résultat */}
          {importResult && (
            <div className={`p-4 rounded-lg ${importResult.errors > 0 ? 'bg-warning/10' : 'bg-success/10'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-5 h-5 ${importResult.errors > 0 ? 'text-warning' : 'text-success'}`} />
                <span className="font-medium">Import terminé</span>
              </div>
              <p className="text-sm mt-1">
                {importResult.success} lignes importées avec succès
                {importResult.errors > 0 && `, ${importResult.errors} erreurs`}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
