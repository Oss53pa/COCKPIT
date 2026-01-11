// ============================================
// GÉNÉRATEUR DE TEMPLATES D'IMPORT EXCEL
// Conformément au Cahier des Charges v1.1
// ============================================

import * as XLSX from 'xlsx';
import type {
  ImportTemplate,
  ImportTemplateType,
  TemplateColumn,
  ALL_IMPORT_TEMPLATES,
  TEMPLATE_ETAT_LOCATIF,
  TEMPLATE_CA_LOCATAIRES,
  TEMPLATE_FREQUENTATION,
  TEMPLATE_CHARGES,
  TEMPLATE_ENERGIE,
  TEMPLATE_ENCAISSEMENTS,
} from '../types';

// Interface pour les données d'exemple
interface ExampleData {
  [key: string]: string | number | boolean | null;
}

/**
 * Génère et télécharge un template Excel
 */
export function downloadTemplate(templateType: ImportTemplateType): void {
  const template = getTemplateByType(templateType);
  if (!template) {
    throw new Error(`Template ${templateType} non trouvé`);
  }

  const workbook = generateTemplateWorkbook(template);
  const filename = template.nomFichier;

  // Télécharger le fichier
  XLSX.writeFile(workbook, filename);
}

/**
 * Génère un workbook Excel pour un template
 */
export function generateTemplateWorkbook(template: ImportTemplate): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  // 1. Onglet Instructions
  if (template.onglets.instructions) {
    const instructionsSheet = createInstructionsSheet(template);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
  }

  // 2. Onglet Données (template principal)
  const dataSheet = createDataSheet(template);
  XLSX.utils.book_append_sheet(workbook, dataSheet, 'Données');

  // 3. Onglet Listes de référence
  if (template.onglets.listes) {
    const listsSheet = createListsSheet(template);
    XLSX.utils.book_append_sheet(workbook, listsSheet, 'Listes');
  }

  // 4. Onglet Exemple
  if (template.onglets.exemple) {
    const exampleSheet = createExampleSheet(template);
    XLSX.utils.book_append_sheet(workbook, exampleSheet, 'Exemple');
  }

  return workbook;
}

/**
 * Crée l'onglet Instructions
 */
function createInstructionsSheet(template: ImportTemplate): XLSX.WorkSheet {
  const instructions = [
    [`TEMPLATE: ${template.nom}`],
    [''],
    ['DESCRIPTION'],
    [template.description],
    [''],
    ['INSTRUCTIONS D\'UTILISATION'],
    ['1. Remplissez l\'onglet "Données" avec vos informations'],
    ['2. Respectez les formats indiqués pour chaque colonne'],
    ['3. Les colonnes marquées * sont obligatoires'],
    ['4. Consultez l\'onglet "Listes" pour les valeurs autorisées'],
    ['5. L\'onglet "Exemple" montre des données de démonstration'],
    [''],
    ['COLONNES DISPONIBLES'],
    [''],
    ['Nom', 'Type', 'Obligatoire', 'Description', 'Format'],
  ];

  // Ajouter les détails de chaque colonne
  template.colonnes.forEach((col) => {
    instructions.push([
      col.nom,
      col.type,
      col.obligatoire ? 'Oui' : 'Non',
      col.description,
      col.format || '-',
    ]);
  });

  // Ajouter les règles de validation
  if (template.reglesValidation.length > 0) {
    instructions.push(['']);
    instructions.push(['RÈGLES DE VALIDATION']);
    instructions.push(['']);
    template.reglesValidation.forEach((rule) => {
      instructions.push([`- ${rule.nom}: ${rule.description}`]);
    });
  }

  // Ajouter les KPIs calculés
  if (template.kpisCalcules.length > 0) {
    instructions.push(['']);
    instructions.push(['KPIs CALCULÉS AUTOMATIQUEMENT']);
    instructions.push([template.kpisCalcules.join(', ')]);
  }

  const sheet = XLSX.utils.aoa_to_sheet(instructions);

  // Définir les largeurs de colonnes
  sheet['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 50 },
    { wch: 20 },
  ];

  return sheet;
}

/**
 * Crée l'onglet Données (template vide avec en-têtes)
 */
function createDataSheet(template: ImportTemplate): XLSX.WorkSheet {
  // Créer les en-têtes avec indication des champs obligatoires
  const headers = template.colonnes.map((col) =>
    col.obligatoire ? `${col.nom} *` : col.nom
  );

  // Créer une feuille avec juste les en-têtes
  const sheet = XLSX.utils.aoa_to_sheet([headers]);

  // Définir les largeurs de colonnes
  sheet['!cols'] = template.colonnes.map((col) => ({
    wch: Math.max(col.nom.length + 2, 15),
  }));

  // Ajouter des validations de données pour les colonnes de type 'liste'
  // Note: La validation des listes Excel est complexe avec XLSX,
  // on peut ajouter des commentaires ou utiliser une autre approche

  return sheet;
}

/**
 * Crée l'onglet Listes de référence
 */
function createListsSheet(template: ImportTemplate): XLSX.WorkSheet {
  const listsData: (string | null)[][] = [];

  // Collecter toutes les colonnes avec des valeurs autorisées
  const columnsWithLists = template.colonnes.filter(
    (col) => col.valeursAutorisees && col.valeursAutorisees.length > 0
  );

  if (columnsWithLists.length === 0) {
    return XLSX.utils.aoa_to_sheet([['Aucune liste de référence pour ce template']]);
  }

  // Créer les en-têtes
  const headers = columnsWithLists.map((col) => col.nom);
  listsData.push(headers);

  // Trouver le nombre maximum de valeurs
  const maxValues = Math.max(
    ...columnsWithLists.map((col) => col.valeursAutorisees?.length || 0)
  );

  // Ajouter les valeurs
  for (let i = 0; i < maxValues; i++) {
    const row = columnsWithLists.map(
      (col) => col.valeursAutorisees?.[i] || null
    );
    listsData.push(row);
  }

  const sheet = XLSX.utils.aoa_to_sheet(listsData);

  // Définir les largeurs de colonnes
  sheet['!cols'] = columnsWithLists.map(() => ({ wch: 25 }));

  return sheet;
}

/**
 * Crée l'onglet Exemple avec des données de démonstration
 */
function createExampleSheet(template: ImportTemplate): XLSX.WorkSheet {
  const exampleData = getExampleData(template.type);

  // Créer les en-têtes
  const headers = template.colonnes.map((col) => col.nom);

  // Créer le tableau de données
  const data = [headers];

  exampleData.forEach((row) => {
    const rowData = template.colonnes.map((col) => row[col.nom] ?? '');
    data.push(rowData as string[]);
  });

  const sheet = XLSX.utils.aoa_to_sheet(data);

  // Définir les largeurs de colonnes
  sheet['!cols'] = template.colonnes.map((col) => ({
    wch: Math.max(col.nom.length + 2, 15),
  }));

  return sheet;
}

/**
 * Retourne des données d'exemple selon le type de template
 */
function getExampleData(templateType: ImportTemplateType): ExampleData[] {
  switch (templateType) {
    case 'etat_locatif':
      return [
        {
          code_local: 'L-001',
          designation: 'Local angle nord',
          niveau: 'RDC',
          zone: 'Zone A',
          surface_m2: 150,
          locataire: 'ORANGE CI',
          activite: 'Téléphonie',
          statut: 'Occupé',
          date_debut_bail: '01/01/2024',
          date_fin_bail: '31/12/2026',
          loyer_mensuel: 2500000,
          charges_mensuelles: 150000,
        },
        {
          code_local: 'L-002',
          designation: 'Local central',
          niveau: 'RDC',
          zone: 'Zone A',
          surface_m2: 80,
          locataire: '',
          activite: '',
          statut: 'Vacant',
          date_debut_bail: '',
          date_fin_bail: '',
          loyer_mensuel: 0,
          charges_mensuelles: 0,
        },
        {
          code_local: 'L-003',
          designation: 'Boutique R+1',
          niveau: 'R+1',
          zone: 'Zone B',
          surface_m2: 45,
          locataire: 'FASHION STORE',
          activite: 'Prêt-à-porter',
          statut: 'Occupé',
          date_debut_bail: '15/06/2023',
          date_fin_bail: '14/06/2028',
          loyer_mensuel: 850000,
          charges_mensuelles: 50000,
        },
      ];

    case 'ca_locataires':
      return [
        { code_local: 'L-001', locataire: 'ORANGE CI', mois: '01/2026', ca_declare: 45000000, ca_certifie: true, source: 'Comptable' },
        { code_local: 'L-003', locataire: 'FASHION STORE', mois: '01/2026', ca_declare: 8500000, ca_certifie: false, source: 'Déclaratif' },
        { code_local: 'L-001', locataire: 'ORANGE CI', mois: '12/2025', ca_declare: 52000000, ca_certifie: true, source: 'Comptable' },
      ];

    case 'frequentation':
      return [
        { date: '01/01/2026', entree_principale: 3500, entree_parking: 1200, entree_secondaire: 300, total_visiteurs: 5000, evenement: '' },
        { date: '02/01/2026', entree_principale: 4200, entree_parking: 1500, entree_secondaire: 350, total_visiteurs: 6050, evenement: '' },
        { date: '03/01/2026', entree_principale: 5800, entree_parking: 2100, entree_secondaire: 500, total_visiteurs: 8400, evenement: 'Soldes' },
      ];

    case 'charges':
      return [
        { mois: '01/2026', categorie: '6051', sous_categorie: 'Électricité', fournisseur: 'CIE', reference_facture: 'FAC-2026-001', montant_ht: 12500000, tva: 2250000, montant_ttc: 14750000, date_paiement: '15/01/2026', statut: 'Payé' },
        { mois: '01/2026', categorie: '6211', sous_categorie: 'Nettoyage', fournisseur: 'CLEAN SERVICES', reference_facture: 'FAC-2026-002', montant_ht: 3500000, tva: 630000, montant_ttc: 4130000, date_paiement: '', statut: 'À payer' },
        { mois: '01/2026', categorie: '625', sous_categorie: 'Multirisque', fournisseur: 'NSIA Assurances', reference_facture: 'FAC-2026-003', montant_ht: 8000000, tva: 0, montant_ttc: 8000000, date_paiement: '10/01/2026', statut: 'Payé' },
      ];

    case 'energie':
      return [
        { mois: '01/2026', type_energie: 'Électricité', compteur: 'CPT-ELEC-001', index_debut: 125000, index_fin: 142500, consommation: 17500, montant_facture: 12500000, fournisseur: 'CIE' },
        { mois: '01/2026', type_energie: 'Eau', compteur: 'CPT-EAU-001', index_debut: 5200, index_fin: 5450, consommation: 250, montant_facture: 375000, fournisseur: 'SODECI' },
        { mois: '01/2026', type_energie: 'Climatisation', compteur: 'CPT-CLIM-001', index_debut: 45000, index_fin: 52000, consommation: 7000, montant_facture: 5600000, fournisseur: 'CIE' },
      ];

    case 'encaissements':
      return [
        { code_local: 'L-001', locataire: 'ORANGE CI', periode: '01/2026', loyer_du: 2650000, loyer_encaisse: 2650000, date_encaissement: '05/01/2026', mode_paiement: 'Virement', reference: 'VIR-2026-001' },
        { code_local: 'L-003', locataire: 'FASHION STORE', periode: '01/2026', loyer_du: 900000, loyer_encaisse: 900000, date_encaissement: '10/01/2026', mode_paiement: 'Chèque', reference: 'CHQ-2026-015' },
        { code_local: 'L-005', locataire: 'SUPERETTE PLUS', periode: '01/2026', loyer_du: 1200000, loyer_encaisse: 800000, date_encaissement: '12/01/2026', mode_paiement: 'Mobile Money', reference: 'MM-2026-042' },
      ];

    default:
      return [];
  }
}

/**
 * Obtient un template par son type
 */
function getTemplateByType(type: ImportTemplateType): ImportTemplate | undefined {
  const templates: Record<ImportTemplateType, ImportTemplate> = {
    etat_locatif: TEMPLATE_ETAT_LOCATIF,
    ca_locataires: TEMPLATE_CA_LOCATAIRES,
    frequentation: TEMPLATE_FREQUENTATION,
    charges: TEMPLATE_CHARGES,
    energie: TEMPLATE_ENERGIE,
    encaissements: TEMPLATE_ENCAISSEMENTS,
  };
  return templates[type];
}

/**
 * Vérifie si un fichier correspond à un template
 */
export function detectTemplateType(workbook: XLSX.WorkBook): ImportTemplateType | null {
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) return null;

  const headers = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })[0] as string[];
  if (!headers || !Array.isArray(headers)) return null;

  // Normaliser les en-têtes
  const normalizedHeaders = headers.map((h) =>
    String(h).toLowerCase().replace(/\s*\*\s*$/, '').trim()
  );

  // Vérifier chaque template
  const templates: ImportTemplateType[] = [
    'etat_locatif',
    'ca_locataires',
    'frequentation',
    'charges',
    'energie',
    'encaissements',
  ];

  for (const type of templates) {
    const template = getTemplateByType(type);
    if (!template) continue;

    const requiredColumns = template.colonnes
      .filter((c) => c.obligatoire)
      .map((c) => c.nom.toLowerCase());

    const matchCount = requiredColumns.filter((col) =>
      normalizedHeaders.includes(col)
    ).length;

    // Si au moins 70% des colonnes obligatoires sont présentes
    if (matchCount / requiredColumns.length >= 0.7) {
      return type;
    }
  }

  return null;
}

/**
 * Génère tous les templates dans un fichier ZIP
 */
export async function downloadAllTemplates(): Promise<void> {
  // Pour l'instant, télécharger chaque template séparément
  // TODO: Implémenter le ZIP avec jszip
  const types: ImportTemplateType[] = [
    'etat_locatif',
    'ca_locataires',
    'frequentation',
    'charges',
    'energie',
    'encaissements',
  ];

  for (const type of types) {
    downloadTemplate(type);
    // Attendre un peu entre chaque téléchargement
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
