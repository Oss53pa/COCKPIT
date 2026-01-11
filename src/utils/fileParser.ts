// ============================================
// FILE PARSER - Parsing Excel/CSV/JSON
// ============================================

import * as XLSX from 'xlsx';
import type {
  FormatFichier,
  ColonneMapping,
  CategorieImport,
} from '../types/bi';

// ===========================================
// TYPES
// ===========================================

export interface FichierParse {
  nom: string;
  format: FormatFichier;
  taille: number;
  contenuBase64: string;
  colonnes: string[];
  lignes: Record<string, unknown>[];
  lignesTotal: number;
  apercu: Record<string, unknown>[];
  typesDetectes: Record<string, 'string' | 'number' | 'date' | 'boolean'>;
  erreurParsing?: string;
}

export interface OptionsParser {
  maxLignes?: number;
  ignoreColonnesVides?: boolean;
  trimValeurs?: boolean;
  detecterTypes?: boolean;
  separateurCSV?: string;
  encodageCSV?: string;
  feuilleExcel?: number | string;
}

const OPTIONS_DEFAUT: OptionsParser = {
  maxLignes: 50000,
  ignoreColonnesVides: true,
  trimValeurs: true,
  detecterTypes: true,
  separateurCSV: ';',
  encodageCSV: 'UTF-8',
  feuilleExcel: 0,
};

// ===========================================
// DETECTION FORMAT
// ===========================================

export function detecterFormat(nomFichier: string): FormatFichier | null {
  const extension = nomFichier.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'xlsx':
    case 'xls':
    case 'xlsm':
      return 'excel';
    case 'csv':
    case 'txt':
      return 'csv';
    case 'json':
      return 'json';
    case 'pdf':
      return 'pdf';
    default:
      return null;
  }
}

// ===========================================
// CONVERSION BASE64
// ===========================================

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Retirer le préfixe data:...;base64,
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// ===========================================
// DETECTION TYPES
// ===========================================

export function detecterType(valeurs: unknown[]): 'string' | 'number' | 'date' | 'boolean' {
  const valeursNonVides = valeurs.filter(v => v !== null && v !== undefined && v !== '');

  if (valeursNonVides.length === 0) return 'string';

  let nombreCount = 0;
  let dateCount = 0;
  let booleanCount = 0;

  for (const valeur of valeursNonVides) {
    const strVal = String(valeur).trim().toLowerCase();

    // Test boolean
    if (['true', 'false', 'oui', 'non', '1', '0', 'yes', 'no'].includes(strVal)) {
      booleanCount++;
      continue;
    }

    // Test nombre
    const numVal = parseFloat(strVal.replace(/\s/g, '').replace(',', '.'));
    if (!isNaN(numVal) && isFinite(numVal)) {
      nombreCount++;
      continue;
    }

    // Test date (formats courants)
    if (estDate(strVal)) {
      dateCount++;
      continue;
    }
  }

  const total = valeursNonVides.length;
  const seuil = 0.8; // 80% des valeurs doivent correspondre

  if (nombreCount / total >= seuil) return 'number';
  if (dateCount / total >= seuil) return 'date';
  if (booleanCount / total >= seuil) return 'boolean';

  return 'string';
}

function estDate(valeur: string): boolean {
  // Formats courants de date
  const patternsDate = [
    /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    /^\d{2}\.\d{2}\.\d{4}$/, // DD.MM.YYYY
    /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
  ];

  for (const pattern of patternsDate) {
    if (pattern.test(valeur)) {
      const date = new Date(valeur);
      if (!isNaN(date.getTime())) return true;
    }
  }

  // Test avec Date.parse
  const parsed = Date.parse(valeur);
  if (!isNaN(parsed) && valeur.length > 6) {
    return true;
  }

  return false;
}

// ===========================================
// PARSER EXCEL
// ===========================================

export async function parserExcel(
  contenuBase64: string,
  options: OptionsParser = {}
): Promise<{ colonnes: string[]; lignes: Record<string, unknown>[] }> {
  const opts = { ...OPTIONS_DEFAUT, ...options };

  try {
    const arrayBuffer = base64ToArrayBuffer(contenuBase64);
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

    // Sélectionner la feuille
    let sheetName: string;
    if (typeof opts.feuilleExcel === 'number') {
      sheetName = workbook.SheetNames[opts.feuilleExcel] || workbook.SheetNames[0];
    } else {
      sheetName = opts.feuilleExcel || workbook.SheetNames[0];
    }

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Feuille "${sheetName}" non trouvée`);
    }

    // Convertir en JSON
    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
    }) as unknown[][];

    if (jsonData.length === 0) {
      return { colonnes: [], lignes: [] };
    }

    // Première ligne = en-têtes
    const colonnes = (jsonData[0] as unknown[]).map((col, index) => {
      const colStr = String(col || '').trim();
      return colStr || `Colonne_${index + 1}`;
    });

    // Lignes de données
    const lignes: Record<string, unknown>[] = [];
    const maxLignes = Math.min(jsonData.length - 1, opts.maxLignes || 50000);

    for (let i = 1; i <= maxLignes; i++) {
      const row = jsonData[i] as unknown[];
      if (!row) continue;

      const ligne: Record<string, unknown> = {};
      let hasData = false;

      for (let j = 0; j < colonnes.length; j++) {
        let valeur = row[j];

        // Trim si string
        if (opts.trimValeurs && typeof valeur === 'string') {
          valeur = valeur.trim();
        }

        // Convertir les dates Excel
        if (valeur instanceof Date) {
          valeur = valeur.toISOString().split('T')[0];
        }

        ligne[colonnes[j]] = valeur;

        if (valeur !== '' && valeur !== null && valeur !== undefined) {
          hasData = true;
        }
      }

      if (hasData) {
        lignes.push(ligne);
      }
    }

    // Filtrer colonnes vides si demandé
    let colonnesFinales = colonnes;
    if (opts.ignoreColonnesVides) {
      colonnesFinales = colonnes.filter(col => {
        return lignes.some(ligne => {
          const val = ligne[col];
          return val !== '' && val !== null && val !== undefined;
        });
      });
    }

    return { colonnes: colonnesFinales, lignes };
  } catch (error) {
    throw new Error(`Erreur parsing Excel: ${error}`);
  }
}

// ===========================================
// PARSER CSV
// ===========================================

export async function parserCSV(
  contenuBase64: string,
  options: OptionsParser = {}
): Promise<{ colonnes: string[]; lignes: Record<string, unknown>[] }> {
  const opts = { ...OPTIONS_DEFAUT, ...options };

  try {
    // Décoder base64
    const contenu = atob(contenuBase64);

    // Détecter le séparateur si non spécifié
    const separateur = opts.separateurCSV || detecterSeparateurCSV(contenu);

    // Parser les lignes
    const lignesTexte = contenu.split(/\r?\n/).filter(l => l.trim());

    if (lignesTexte.length === 0) {
      return { colonnes: [], lignes: [] };
    }

    // Parser les colonnes (première ligne)
    const colonnes = parserLigneCSV(lignesTexte[0], separateur).map((col, index) => {
      const colStr = col.trim();
      return colStr || `Colonne_${index + 1}`;
    });

    // Parser les lignes de données
    const lignes: Record<string, unknown>[] = [];
    const maxLignes = Math.min(lignesTexte.length - 1, opts.maxLignes || 50000);

    for (let i = 1; i <= maxLignes; i++) {
      if (!lignesTexte[i]) continue;

      const valeurs = parserLigneCSV(lignesTexte[i], separateur);
      const ligne: Record<string, unknown> = {};
      let hasData = false;

      for (let j = 0; j < colonnes.length; j++) {
        let valeur: string | number = valeurs[j] || '';

        if (opts.trimValeurs) {
          valeur = valeur.trim();
        }

        // Tenter de convertir en nombre
        if (valeur !== '') {
          const numVal = parseFloat(valeur.replace(/\s/g, '').replace(',', '.'));
          if (!isNaN(numVal) && isFinite(numVal)) {
            valeur = numVal;
          }
        }

        ligne[colonnes[j]] = valeur;

        if (valeur !== '' && valeur !== null) {
          hasData = true;
        }
      }

      if (hasData) {
        lignes.push(ligne);
      }
    }

    return { colonnes, lignes };
  } catch (error) {
    throw new Error(`Erreur parsing CSV: ${error}`);
  }
}

function detecterSeparateurCSV(contenu: string): string {
  const premiereLigne = contenu.split(/\r?\n/)[0] || '';

  const separateurs = [';', ',', '\t', '|'];
  let meilleurSeparateur = ';';
  let maxCount = 0;

  for (const sep of separateurs) {
    const count = (premiereLigne.match(new RegExp(sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      meilleurSeparateur = sep;
    }
  }

  return meilleurSeparateur;
}

function parserLigneCSV(ligne: string, separateur: string): string[] {
  const resultat: string[] = [];
  let valeurCourante = '';
  let dansGuillemets = false;

  for (let i = 0; i < ligne.length; i++) {
    const char = ligne[i];

    if (char === '"') {
      if (dansGuillemets && ligne[i + 1] === '"') {
        // Double guillemet = guillemet échappé
        valeurCourante += '"';
        i++;
      } else {
        dansGuillemets = !dansGuillemets;
      }
    } else if (char === separateur && !dansGuillemets) {
      resultat.push(valeurCourante);
      valeurCourante = '';
    } else {
      valeurCourante += char;
    }
  }

  resultat.push(valeurCourante);
  return resultat;
}

// ===========================================
// PARSER JSON
// ===========================================

export async function parserJSON(
  contenuBase64: string,
  options: OptionsParser = {}
): Promise<{ colonnes: string[]; lignes: Record<string, unknown>[] }> {
  const opts = { ...OPTIONS_DEFAUT, ...options };

  try {
    const contenu = atob(contenuBase64);
    const data = JSON.parse(contenu);

    let lignes: Record<string, unknown>[];

    // Gérer différentes structures JSON
    if (Array.isArray(data)) {
      lignes = data;
    } else if (data.data && Array.isArray(data.data)) {
      lignes = data.data;
    } else if (data.results && Array.isArray(data.results)) {
      lignes = data.results;
    } else if (typeof data === 'object') {
      // Objet unique -> tableau d'un élément
      lignes = [data];
    } else {
      throw new Error('Format JSON non supporté');
    }

    // Limiter le nombre de lignes
    if (opts.maxLignes && lignes.length > opts.maxLignes) {
      lignes = lignes.slice(0, opts.maxLignes);
    }

    // Extraire les colonnes (union de toutes les clés)
    const colonnesSet = new Set<string>();
    for (const ligne of lignes) {
      if (typeof ligne === 'object' && ligne !== null) {
        Object.keys(ligne).forEach(key => colonnesSet.add(key));
      }
    }

    const colonnes = Array.from(colonnesSet);

    // Normaliser les lignes
    const lignesNormalisees = lignes.map(ligne => {
      const ligneNormalisee: Record<string, unknown> = {};
      for (const col of colonnes) {
        ligneNormalisee[col] = (ligne as Record<string, unknown>)[col] ?? '';
      }
      return ligneNormalisee;
    });

    return { colonnes, lignes: lignesNormalisees };
  } catch (error) {
    throw new Error(`Erreur parsing JSON: ${error}`);
  }
}

// ===========================================
// FONCTION PRINCIPALE - PARSER FICHIER
// ===========================================

export async function parserFichier(
  file: File,
  options: OptionsParser = {}
): Promise<FichierParse> {
  const format = detecterFormat(file.name);

  if (!format) {
    return {
      nom: file.name,
      format: 'csv',
      taille: file.size,
      contenuBase64: '',
      colonnes: [],
      lignes: [],
      lignesTotal: 0,
      apercu: [],
      typesDetectes: {},
      erreurParsing: 'Format de fichier non supporté',
    };
  }

  if (format === 'pdf') {
    return {
      nom: file.name,
      format: 'pdf',
      taille: file.size,
      contenuBase64: await fileToBase64(file),
      colonnes: [],
      lignes: [],
      lignesTotal: 0,
      apercu: [],
      typesDetectes: {},
      erreurParsing: 'Le parsing PDF n\'est pas encore supporté',
    };
  }

  try {
    const contenuBase64 = await fileToBase64(file);
    let colonnes: string[];
    let lignes: Record<string, unknown>[];

    switch (format) {
      case 'excel':
        ({ colonnes, lignes } = await parserExcel(contenuBase64, options));
        break;
      case 'csv':
        ({ colonnes, lignes } = await parserCSV(contenuBase64, options));
        break;
      case 'json':
        ({ colonnes, lignes } = await parserJSON(contenuBase64, options));
        break;
      default:
        throw new Error(`Format ${format} non supporté`);
    }

    // Détecter les types de colonnes
    const typesDetectes: Record<string, 'string' | 'number' | 'date' | 'boolean'> = {};

    if (options.detecterTypes !== false) {
      for (const colonne of colonnes) {
        const valeurs = lignes.map(l => l[colonne]);
        typesDetectes[colonne] = detecterType(valeurs);
      }
    }

    // Aperçu (premières lignes)
    const apercu = lignes.slice(0, 10);

    return {
      nom: file.name,
      format,
      taille: file.size,
      contenuBase64,
      colonnes,
      lignes,
      lignesTotal: lignes.length,
      apercu,
      typesDetectes,
    };
  } catch (error) {
    return {
      nom: file.name,
      format,
      taille: file.size,
      contenuBase64: '',
      colonnes: [],
      lignes: [],
      lignesTotal: 0,
      apercu: [],
      typesDetectes: {},
      erreurParsing: String(error),
    };
  }
}

// ===========================================
// MAPPING COLONNES AUTOMATIQUE
// ===========================================

export interface MappingConfig {
  categorie: CategorieImport;
  champsCibles: { champ: string; labels: string[]; obligatoire: boolean }[];
}

const MAPPINGS_CATEGORIES: Record<CategorieImport, MappingConfig> = {
  etat_locatif: {
    categorie: 'etat_locatif',
    champsCibles: [
      { champ: 'lotReference', labels: ['lot', 'local', 'reference', 'ref', 'code local', 'n° lot'], obligatoire: true },
      { champ: 'locataireEnseigne', labels: ['enseigne', 'locataire', 'preneur', 'nom locataire'], obligatoire: true },
      { champ: 'surfaceGLA', labels: ['surface', 'gla', 'm2', 'm²', 'surface gla'], obligatoire: true },
      { champ: 'loyerMinimumGaranti', labels: ['loyer', 'lmg', 'loyer annuel', 'loyer minimum'], obligatoire: true },
      { champ: 'bailDebut', labels: ['debut bail', 'date debut', 'debut', 'date entrée'], obligatoire: false },
      { champ: 'bailFin', labels: ['fin bail', 'date fin', 'echeance', 'terme'], obligatoire: false },
      { champ: 'activiteCode', labels: ['activite', 'code activite', 'secteur'], obligatoire: false },
      { champ: 'statutOccupation', labels: ['statut', 'occupation', 'etat'], obligatoire: false },
    ],
  },
  loyers: {
    categorie: 'loyers',
    champsCibles: [
      { champ: 'lotId', labels: ['lot', 'local', 'reference'], obligatoire: true },
      { champ: 'locataireEnseigne', labels: ['enseigne', 'locataire'], obligatoire: true },
      { champ: 'periodeAnnee', labels: ['annee', 'année', 'year'], obligatoire: true },
      { champ: 'periodeMois', labels: ['mois', 'month', 'periode'], obligatoire: true },
      { champ: 'loyerAppele', labels: ['loyer appele', 'appel', 'facturation'], obligatoire: true },
      { champ: 'loyerEncaisse', labels: ['loyer encaisse', 'encaissement', 'paiement'], obligatoire: true },
      { champ: 'chargesAppelees', labels: ['charges appelees', 'charges'], obligatoire: false },
      { champ: 'chargesEncaissees', labels: ['charges encaissees'], obligatoire: false },
    ],
  },
  frequentation: {
    categorie: 'frequentation',
    champsCibles: [
      { champ: 'date', labels: ['date', 'jour', 'day'], obligatoire: true },
      { champ: 'entreesTotal', labels: ['entrees', 'visiteurs', 'frequentation', 'comptage'], obligatoire: true },
      { champ: 'zone', labels: ['zone', 'entree', 'porte'], obligatoire: false },
    ],
  },
  chiffre_affaires: {
    categorie: 'chiffre_affaires',
    champsCibles: [
      { champ: 'lotId', labels: ['lot', 'local'], obligatoire: true },
      { champ: 'locataireEnseigne', labels: ['enseigne', 'locataire'], obligatoire: true },
      { champ: 'periodeAnnee', labels: ['annee', 'année'], obligatoire: true },
      { champ: 'periodeMois', labels: ['mois'], obligatoire: true },
      { champ: 'caDeclare', labels: ['ca', 'chiffre affaires', 'ca declare', 'ca mensuel'], obligatoire: true },
    ],
  },
  charges: {
    categorie: 'charges',
    champsCibles: [
      { champ: 'periodeAnnee', labels: ['annee', 'année'], obligatoire: true },
      { champ: 'categorieCharge', labels: ['categorie', 'poste', 'nature'], obligatoire: true },
      { champ: 'montantBudget', labels: ['budget', 'montant budget'], obligatoire: false },
      { champ: 'montantReel', labels: ['reel', 'montant reel', 'realise'], obligatoire: true },
      { champ: 'montantRefacturable', labels: ['refacturable', 'recuperable'], obligatoire: false },
    ],
  },
  bail: {
    categorie: 'bail',
    champsCibles: [
      { champ: 'lotId', labels: ['lot', 'local'], obligatoire: true },
      { champ: 'locataireEnseigne', labels: ['enseigne', 'locataire'], obligatoire: true },
      { champ: 'dateDebut', labels: ['debut', 'date debut', 'prise effet'], obligatoire: true },
      { champ: 'dateFin', labels: ['fin', 'date fin', 'echeance', 'terme'], obligatoire: true },
      { champ: 'loyerAnnuel', labels: ['loyer', 'loyer annuel'], obligatoire: true },
      { champ: 'dateBreak', labels: ['break', 'option sortie', 'date break'], obligatoire: false },
    ],
  },
  travaux: {
    categorie: 'travaux',
    champsCibles: [
      { champ: 'reference', labels: ['reference', 'numero', 'id'], obligatoire: true },
      { champ: 'libelle', labels: ['libelle', 'description', 'intitule'], obligatoire: true },
      { champ: 'categorie', labels: ['categorie', 'type'], obligatoire: true },
      { champ: 'montantBudget', labels: ['budget', 'montant'], obligatoire: true },
      { champ: 'statut', labels: ['statut', 'etat'], obligatoire: false },
    ],
  },
  budget: {
    categorie: 'budget',
    champsCibles: [
      { champ: 'poste', labels: ['poste', 'ligne', 'compte'], obligatoire: true },
      { champ: 'annee', labels: ['annee', 'exercice'], obligatoire: true },
      { champ: 'montant', labels: ['montant', 'budget', 'prevision'], obligatoire: true },
    ],
  },
  valorisation: {
    categorie: 'valorisation',
    champsCibles: [
      { champ: 'dateValorisation', labels: ['date', 'date valorisation'], obligatoire: true },
      { champ: 'valeurVenale', labels: ['valeur', 'valeur venale', 'estimation'], obligatoire: true },
      { champ: 'tauxCapitalisation', labels: ['taux', 'taux capi', 'yield'], obligatoire: false },
    ],
  },
  surface: {
    categorie: 'surface',
    champsCibles: [
      { champ: 'lotId', labels: ['lot', 'local'], obligatoire: true },
      { champ: 'surface', labels: ['surface', 'm2', 'gla'], obligatoire: true },
      { champ: 'type', labels: ['type', 'nature'], obligatoire: false },
    ],
  },
  energie: {
    categorie: 'energie',
    champsCibles: [
      { champ: 'periodeAnnee', labels: ['annee'], obligatoire: true },
      { champ: 'periodeMois', labels: ['mois'], obligatoire: true },
      { champ: 'typeEnergie', labels: ['type', 'energie', 'fluide'], obligatoire: true },
      { champ: 'consommation', labels: ['consommation', 'quantite', 'volume'], obligatoire: true },
      { champ: 'cout', labels: ['cout', 'montant', 'prix'], obligatoire: false },
    ],
  },
  satisfaction: {
    categorie: 'satisfaction',
    champsCibles: [
      { champ: 'date', labels: ['date'], obligatoire: true },
      { champ: 'scoreGlobal', labels: ['score', 'note', 'satisfaction'], obligatoire: true },
      { champ: 'nps', labels: ['nps', 'net promoter'], obligatoire: false },
      { champ: 'nombreRepondants', labels: ['repondants', 'participants', 'n'], obligatoire: false },
    ],
  },
};

export function genererMappingAutomatique(
  colonnesFichier: string[],
  categorie: CategorieImport
): ColonneMapping[] {
  const config = MAPPINGS_CATEGORIES[categorie];
  if (!config) return [];

  const mappings: ColonneMapping[] = [];
  const colonnesUtilisees = new Set<string>();

  for (const champCible of config.champsCibles) {
    let meilleurMatch: string | null = null;
    let meilleurScore = 0;

    for (const colonne of colonnesFichier) {
      if (colonnesUtilisees.has(colonne)) continue;

      const colonneNormalisee = colonne.toLowerCase().replace(/[_\-\s]+/g, ' ').trim();

      for (const label of champCible.labels) {
        const labelNormalise = label.toLowerCase().replace(/[_\-\s]+/g, ' ').trim();

        // Match exact
        if (colonneNormalisee === labelNormalise) {
          meilleurMatch = colonne;
          meilleurScore = 100;
          break;
        }

        // Match partiel
        if (colonneNormalisee.includes(labelNormalise) || labelNormalise.includes(colonneNormalisee)) {
          const score = labelNormalise.length / Math.max(colonneNormalisee.length, labelNormalise.length) * 80;
          if (score > meilleurScore) {
            meilleurScore = score;
            meilleurMatch = colonne;
          }
        }
      }

      if (meilleurScore === 100) break;
    }

    if (meilleurMatch && meilleurScore > 50) {
      colonnesUtilisees.add(meilleurMatch);
      mappings.push({
        colonneSource: meilleurMatch,
        colonneDestination: champCible.champ,
        typeDetecte: 'string',
      });
    }
  }

  return mappings;
}

// ===========================================
// OBTENIR LES FEUILLES EXCEL
// ===========================================

export async function getFeuillesExcel(contenuBase64: string): Promise<string[]> {
  try {
    const arrayBuffer = base64ToArrayBuffer(contenuBase64);
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    return workbook.SheetNames;
  } catch {
    return [];
  }
}

// ===========================================
// EXPORT
// ===========================================

export { MAPPINGS_CATEGORIES };
