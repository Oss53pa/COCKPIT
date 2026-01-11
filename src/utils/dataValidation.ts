// ============================================
// DATA VALIDATION - Validation des Données Importées
// ============================================

import type {
  CategorieImport,
  ColonneMapping,
  ValidationErreur,
  QualiteDonnees,
} from '../types/bi';

// ===========================================
// TYPES
// ===========================================

export interface RegleValidation {
  champ: string;
  type: 'obligatoire' | 'type' | 'format' | 'plage' | 'unique' | 'reference' | 'custom';
  message: string;
  params?: Record<string, unknown>;
  validateur?: (valeur: unknown, ligne: Record<string, unknown>, index: number) => boolean;
}

export interface ResultatValidation {
  valide: boolean;
  erreurs: ValidationErreur[];
  avertissements: ValidationErreur[];
  lignesValides: number;
  lignesErreur: number;
  scoreQualite: number;
  qualite: QualiteDonnees;
  statistiques: StatistiquesValidation;
}

export interface StatistiquesValidation {
  champsRemplis: Record<string, number>;
  valeursUniques: Record<string, number>;
  valeursManquantes: Record<string, number>;
  typesDetectes: Record<string, string>;
}

// ===========================================
// REGLES PAR CATEGORIE
// ===========================================

const REGLES_VALIDATION: Record<CategorieImport, RegleValidation[]> = {
  etat_locatif: [
    { champ: 'lotReference', type: 'obligatoire', message: 'La référence du lot est obligatoire' },
    { champ: 'lotReference', type: 'unique', message: 'La référence du lot doit être unique' },
    { champ: 'locataireEnseigne', type: 'obligatoire', message: 'L\'enseigne du locataire est obligatoire' },
    { champ: 'surfaceGLA', type: 'obligatoire', message: 'La surface GLA est obligatoire' },
    { champ: 'surfaceGLA', type: 'type', message: 'La surface doit être un nombre', params: { typeAttendu: 'number' } },
    { champ: 'surfaceGLA', type: 'plage', message: 'La surface doit être positive', params: { min: 0 } },
    { champ: 'loyerMinimumGaranti', type: 'type', message: 'Le loyer doit être un nombre', params: { typeAttendu: 'number' } },
    { champ: 'loyerMinimumGaranti', type: 'plage', message: 'Le loyer doit être positif', params: { min: 0 } },
    { champ: 'bailDebut', type: 'format', message: 'La date de début doit être une date valide', params: { format: 'date' } },
    { champ: 'bailFin', type: 'format', message: 'La date de fin doit être une date valide', params: { format: 'date' } },
    {
      champ: 'bailFin',
      type: 'custom',
      message: 'La date de fin doit être postérieure à la date de début',
      validateur: (_, ligne) => {
        const debut = ligne.bailDebut as string;
        const fin = ligne.bailFin as string;
        if (!debut || !fin) return true;
        return new Date(fin) > new Date(debut);
      },
    },
  ],
  loyers: [
    { champ: 'lotId', type: 'obligatoire', message: 'L\'identifiant du lot est obligatoire' },
    { champ: 'periodeAnnee', type: 'obligatoire', message: 'L\'année est obligatoire' },
    { champ: 'periodeAnnee', type: 'plage', message: 'L\'année doit être valide', params: { min: 2000, max: 2100 } },
    { champ: 'periodeMois', type: 'obligatoire', message: 'Le mois est obligatoire' },
    { champ: 'periodeMois', type: 'plage', message: 'Le mois doit être entre 1 et 12', params: { min: 1, max: 12 } },
    { champ: 'loyerAppele', type: 'type', message: 'Le loyer appelé doit être un nombre', params: { typeAttendu: 'number' } },
    { champ: 'loyerEncaisse', type: 'type', message: 'Le loyer encaissé doit être un nombre', params: { typeAttendu: 'number' } },
  ],
  frequentation: [
    { champ: 'date', type: 'obligatoire', message: 'La date est obligatoire' },
    { champ: 'date', type: 'format', message: 'La date doit être valide', params: { format: 'date' } },
    { champ: 'entreesTotal', type: 'obligatoire', message: 'Le nombre d\'entrées est obligatoire' },
    { champ: 'entreesTotal', type: 'type', message: 'Le nombre d\'entrées doit être un nombre', params: { typeAttendu: 'number' } },
    { champ: 'entreesTotal', type: 'plage', message: 'Le nombre d\'entrées doit être positif', params: { min: 0 } },
  ],
  chiffre_affaires: [
    { champ: 'lotId', type: 'obligatoire', message: 'L\'identifiant du lot est obligatoire' },
    { champ: 'locataireEnseigne', type: 'obligatoire', message: 'L\'enseigne est obligatoire' },
    { champ: 'periodeAnnee', type: 'obligatoire', message: 'L\'année est obligatoire' },
    { champ: 'periodeMois', type: 'obligatoire', message: 'Le mois est obligatoire' },
    { champ: 'caDeclare', type: 'obligatoire', message: 'Le CA déclaré est obligatoire' },
    { champ: 'caDeclare', type: 'type', message: 'Le CA doit être un nombre', params: { typeAttendu: 'number' } },
  ],
  charges: [
    { champ: 'periodeAnnee', type: 'obligatoire', message: 'L\'année est obligatoire' },
    { champ: 'categorieCharge', type: 'obligatoire', message: 'La catégorie de charge est obligatoire' },
    { champ: 'montantReel', type: 'obligatoire', message: 'Le montant réel est obligatoire' },
    { champ: 'montantReel', type: 'type', message: 'Le montant doit être un nombre', params: { typeAttendu: 'number' } },
  ],
  bail: [
    { champ: 'lotId', type: 'obligatoire', message: 'L\'identifiant du lot est obligatoire' },
    { champ: 'locataireEnseigne', type: 'obligatoire', message: 'L\'enseigne est obligatoire' },
    { champ: 'dateDebut', type: 'obligatoire', message: 'La date de début est obligatoire' },
    { champ: 'dateDebut', type: 'format', message: 'La date de début doit être valide', params: { format: 'date' } },
    { champ: 'dateFin', type: 'obligatoire', message: 'La date de fin est obligatoire' },
    { champ: 'dateFin', type: 'format', message: 'La date de fin doit être valide', params: { format: 'date' } },
    { champ: 'loyerAnnuel', type: 'obligatoire', message: 'Le loyer annuel est obligatoire' },
    { champ: 'loyerAnnuel', type: 'type', message: 'Le loyer doit être un nombre', params: { typeAttendu: 'number' } },
    { champ: 'loyerAnnuel', type: 'plage', message: 'Le loyer doit être positif', params: { min: 0 } },
  ],
  travaux: [
    { champ: 'reference', type: 'obligatoire', message: 'La référence est obligatoire' },
    { champ: 'libelle', type: 'obligatoire', message: 'Le libellé est obligatoire' },
    { champ: 'categorie', type: 'obligatoire', message: 'La catégorie est obligatoire' },
    { champ: 'montantBudget', type: 'type', message: 'Le budget doit être un nombre', params: { typeAttendu: 'number' } },
  ],
  budget: [
    { champ: 'poste', type: 'obligatoire', message: 'Le poste est obligatoire' },
    { champ: 'annee', type: 'obligatoire', message: 'L\'année est obligatoire' },
    { champ: 'montant', type: 'obligatoire', message: 'Le montant est obligatoire' },
    { champ: 'montant', type: 'type', message: 'Le montant doit être un nombre', params: { typeAttendu: 'number' } },
  ],
  valorisation: [
    { champ: 'dateValorisation', type: 'obligatoire', message: 'La date de valorisation est obligatoire' },
    { champ: 'dateValorisation', type: 'format', message: 'La date doit être valide', params: { format: 'date' } },
    { champ: 'valeurVenale', type: 'obligatoire', message: 'La valeur vénale est obligatoire' },
    { champ: 'valeurVenale', type: 'type', message: 'La valeur doit être un nombre', params: { typeAttendu: 'number' } },
    { champ: 'valeurVenale', type: 'plage', message: 'La valeur doit être positive', params: { min: 0 } },
  ],
  surface: [
    { champ: 'lotId', type: 'obligatoire', message: 'L\'identifiant du lot est obligatoire' },
    { champ: 'surface', type: 'obligatoire', message: 'La surface est obligatoire' },
    { champ: 'surface', type: 'type', message: 'La surface doit être un nombre', params: { typeAttendu: 'number' } },
    { champ: 'surface', type: 'plage', message: 'La surface doit être positive', params: { min: 0 } },
  ],
  energie: [
    { champ: 'periodeAnnee', type: 'obligatoire', message: 'L\'année est obligatoire' },
    { champ: 'periodeMois', type: 'obligatoire', message: 'Le mois est obligatoire' },
    { champ: 'typeEnergie', type: 'obligatoire', message: 'Le type d\'énergie est obligatoire' },
    { champ: 'consommation', type: 'obligatoire', message: 'La consommation est obligatoire' },
    { champ: 'consommation', type: 'type', message: 'La consommation doit être un nombre', params: { typeAttendu: 'number' } },
  ],
  satisfaction: [
    { champ: 'date', type: 'obligatoire', message: 'La date est obligatoire' },
    { champ: 'date', type: 'format', message: 'La date doit être valide', params: { format: 'date' } },
    { champ: 'scoreGlobal', type: 'obligatoire', message: 'Le score global est obligatoire' },
    { champ: 'scoreGlobal', type: 'type', message: 'Le score doit être un nombre', params: { typeAttendu: 'number' } },
    { champ: 'scoreGlobal', type: 'plage', message: 'Le score doit être entre 0 et 100', params: { min: 0, max: 100 } },
  ],
};

// ===========================================
// VALIDATEURS
// ===========================================

function validerObligatoire(valeur: unknown): boolean {
  if (valeur === null || valeur === undefined) return false;
  if (typeof valeur === 'string' && valeur.trim() === '') return false;
  return true;
}

function validerType(valeur: unknown, typeAttendu: string): boolean {
  if (!validerObligatoire(valeur)) return true; // Les valeurs vides sont gérées par 'obligatoire'

  switch (typeAttendu) {
    case 'number':
      if (typeof valeur === 'number') return !isNaN(valeur);
      if (typeof valeur === 'string') {
        const num = parseFloat(valeur.replace(/\s/g, '').replace(',', '.'));
        return !isNaN(num) && isFinite(num);
      }
      return false;

    case 'string':
      return typeof valeur === 'string';

    case 'boolean':
      return typeof valeur === 'boolean' ||
        ['true', 'false', 'oui', 'non', '1', '0'].includes(String(valeur).toLowerCase());

    case 'date':
      return validerFormatDate(valeur);

    default:
      return true;
  }
}

function validerFormatDate(valeur: unknown): boolean {
  if (!validerObligatoire(valeur)) return true;

  const strVal = String(valeur).trim();

  // Patterns de date courants
  const patterns = [
    /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
  ];

  for (const pattern of patterns) {
    if (pattern.test(strVal)) {
      const date = new Date(strVal);
      return !isNaN(date.getTime());
    }
  }

  // Tentative avec Date.parse
  const parsed = Date.parse(strVal);
  return !isNaN(parsed);
}

function validerPlage(valeur: unknown, min?: number, max?: number): boolean {
  if (!validerObligatoire(valeur)) return true;

  let numVal: number;
  if (typeof valeur === 'number') {
    numVal = valeur;
  } else if (typeof valeur === 'string') {
    numVal = parseFloat(valeur.replace(/\s/g, '').replace(',', '.'));
  } else {
    return false;
  }

  if (isNaN(numVal)) return false;
  if (min !== undefined && numVal < min) return false;
  if (max !== undefined && numVal > max) return false;

  return true;
}

function validerUnique(valeurs: unknown[]): Set<number> {
  const vus = new Map<string, number>();
  const doublons = new Set<number>();

  valeurs.forEach((valeur, index) => {
    if (!validerObligatoire(valeur)) return;

    const key = String(valeur).toLowerCase().trim();
    const indexExistant = vus.get(key);

    if (indexExistant !== undefined) {
      doublons.add(indexExistant);
      doublons.add(index);
    } else {
      vus.set(key, index);
    }
  });

  return doublons;
}

// ===========================================
// FONCTION PRINCIPALE - VALIDER DONNEES
// ===========================================

export function validerDonnees(
  lignes: Record<string, unknown>[],
  mapping: ColonneMapping[],
  categorie: CategorieImport
): ResultatValidation {
  const regles = REGLES_VALIDATION[categorie] || [];
  const erreurs: ValidationErreur[] = [];
  const avertissements: ValidationErreur[] = [];
  const lignesAvecErreur = new Set<number>();

  // Construire le mapping inverse (destination -> source)
  const mapDestToSource: Record<string, string> = {};
  for (const m of mapping) {
    mapDestToSource[m.colonneDestination] = m.colonneSource;
  }

  // Statistiques
  const statistiques: StatistiquesValidation = {
    champsRemplis: {},
    valeursUniques: {},
    valeursManquantes: {},
    typesDetectes: {},
  };

  // Préparer les données pour validation unicité
  const valeursParChamp: Record<string, unknown[]> = {};
  const reglesUnicite = regles.filter(r => r.type === 'unique');

  for (const regle of reglesUnicite) {
    const colonneSource = mapDestToSource[regle.champ];
    if (colonneSource) {
      valeursParChamp[regle.champ] = lignes.map(l => l[colonneSource]);
    }
  }

  // Vérifier l'unicité
  const doublonsParChamp: Record<string, Set<number>> = {};
  for (const [champ, valeurs] of Object.entries(valeursParChamp)) {
    doublonsParChamp[champ] = validerUnique(valeurs);
  }

  // Valider chaque ligne
  for (let i = 0; i < lignes.length; i++) {
    const ligne = lignes[i];
    const ligneNumero = i + 2; // +2 car ligne 1 = en-têtes, index commence à 0

    for (const regle of regles) {
      const colonneSource = mapDestToSource[regle.champ];
      if (!colonneSource && regle.type !== 'custom') continue;

      const valeur = colonneSource ? ligne[colonneSource] : undefined;
      let valide = true;
      const severite: 'erreur' | 'avertissement' = regle.type === 'obligatoire' ? 'erreur' : 'avertissement';

      switch (regle.type) {
        case 'obligatoire':
          valide = validerObligatoire(valeur);
          break;

        case 'type':
          valide = validerType(valeur, regle.params?.typeAttendu as string);
          break;

        case 'format':
          if (regle.params?.format === 'date') {
            valide = validerFormatDate(valeur);
          }
          break;

        case 'plage':
          valide = validerPlage(
            valeur,
            regle.params?.min as number | undefined,
            regle.params?.max as number | undefined
          );
          break;

        case 'unique':
          valide = !doublonsParChamp[regle.champ]?.has(i);
          break;

        case 'custom':
          if (regle.validateur) {
            valide = regle.validateur(valeur, ligne, i);
          }
          break;
      }

      if (!valide) {
        const erreur: ValidationErreur = {
          ligne: ligneNumero,
          colonne: colonneSource || regle.champ,
          valeur: String(valeur ?? ''),
          erreur: regle.message,
          severite,
        };

        if (severite === 'erreur') {
          erreurs.push(erreur);
          lignesAvecErreur.add(i);
        } else {
          avertissements.push(erreur);
        }
      }
    }

    // Calculer les statistiques
    for (const m of mapping) {
      const valeur = ligne[m.colonneSource];
      statistiques.champsRemplis[m.colonneDestination] =
        (statistiques.champsRemplis[m.colonneDestination] || 0) + (validerObligatoire(valeur) ? 1 : 0);
      statistiques.valeursManquantes[m.colonneDestination] =
        (statistiques.valeursManquantes[m.colonneDestination] || 0) + (validerObligatoire(valeur) ? 0 : 1);
    }
  }

  // Calculer valeurs uniques
  for (const m of mapping) {
    const valeurs = new Set(lignes.map(l => String(l[m.colonneSource] ?? '')).filter(v => v !== ''));
    statistiques.valeursUniques[m.colonneDestination] = valeurs.size;
  }

  // Calculer le score de qualité
  const lignesValides = lignes.length - lignesAvecErreur.size;
  const scoreQualite = lignes.length > 0
    ? Math.round((lignesValides / lignes.length) * 100)
    : 100;

  // Déterminer le niveau de qualité
  let qualite: QualiteDonnees;
  if (scoreQualite >= 95) qualite = 'excellent';
  else if (scoreQualite >= 85) qualite = 'bon';
  else if (scoreQualite >= 70) qualite = 'moyen';
  else qualite = 'faible';

  return {
    valide: erreurs.length === 0,
    erreurs,
    avertissements,
    lignesValides,
    lignesErreur: lignesAvecErreur.size,
    scoreQualite,
    qualite,
    statistiques,
  };
}

// ===========================================
// TRANSFORMATION DES DONNEES
// ===========================================

export function transformerDonnees(
  lignes: Record<string, unknown>[],
  mapping: ColonneMapping[]
): Record<string, unknown>[] {
  return lignes.map(ligne => {
    const ligneTransformee: Record<string, unknown> = {};

    for (const m of mapping) {
      let valeur = ligne[m.colonneSource];

      // Appliquer les transformations selon le type détecté
      switch (m.typeDetecte) {
        case 'number':
          if (typeof valeur === 'string') {
            valeur = parseFloat(valeur.replace(/\s/g, '').replace(',', '.'));
            if (isNaN(valeur as number)) valeur = null;
          }
          break;

        case 'date':
          if (valeur && typeof valeur === 'string') {
            // Normaliser au format ISO
            const date = parseDate(valeur);
            valeur = date ? date.toISOString().split('T')[0] : valeur;
          }
          break;

        case 'boolean':
          if (typeof valeur === 'string') {
            const lower = valeur.toLowerCase().trim();
            if (['true', 'oui', '1', 'yes'].includes(lower)) valeur = true;
            else if (['false', 'non', '0', 'no'].includes(lower)) valeur = false;
          }
          break;
      }

      // Trim pour les strings
      if (typeof valeur === 'string') {
        valeur = valeur.trim();
      }

      ligneTransformee[m.colonneDestination] = valeur;
    }

    return ligneTransformee;
  });
}

function parseDate(valeur: string): Date | null {
  const strVal = valeur.trim();

  // DD/MM/YYYY
  let match = strVal.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
  }

  // YYYY-MM-DD
  match = strVal.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }

  // DD-MM-YYYY
  match = strVal.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (match) {
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
  }

  // Tentative générique
  const parsed = new Date(strVal);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// ===========================================
// NETTOYAGE DES DONNEES
// ===========================================

export function nettoyerDonnees(
  lignes: Record<string, unknown>[]
): Record<string, unknown>[] {
  return lignes
    .filter(ligne => {
      // Supprimer les lignes complètement vides
      return Object.values(ligne).some(v => v !== null && v !== undefined && v !== '');
    })
    .map(ligne => {
      const ligneNettoyee: Record<string, unknown> = {};

      for (const [key, valeur] of Object.entries(ligne)) {
        // Trim les strings
        if (typeof valeur === 'string') {
          const trimmed = valeur.trim();
          // Remplacer les valeurs vides par null
          ligneNettoyee[key] = trimmed === '' ? null : trimmed;
        } else {
          ligneNettoyee[key] = valeur;
        }
      }

      return ligneNettoyee;
    });
}

// ===========================================
// DETECTION DE DOUBLONS
// ===========================================

export function detecterDoublons(
  lignes: Record<string, unknown>[],
  champsComparaison: string[]
): { index: number; doublonDe: number }[] {
  const doublons: { index: number; doublonDe: number }[] = [];
  const vues = new Map<string, number>();

  for (let i = 0; i < lignes.length; i++) {
    const ligne = lignes[i];
    const cle = champsComparaison
      .map(champ => String(ligne[champ] ?? '').toLowerCase().trim())
      .join('|');

    const indexExistant = vues.get(cle);
    if (indexExistant !== undefined) {
      doublons.push({ index: i, doublonDe: indexExistant });
    } else {
      vues.set(cle, i);
    }
  }

  return doublons;
}

// ===========================================
// EXPORT DES REGLES
// ===========================================

export function getReglesValidation(categorie: CategorieImport): RegleValidation[] {
  return REGLES_VALIDATION[categorie] || [];
}

export function getChampsObligatoires(categorie: CategorieImport): string[] {
  const regles = REGLES_VALIDATION[categorie] || [];
  return regles
    .filter(r => r.type === 'obligatoire')
    .map(r => r.champ);
}
