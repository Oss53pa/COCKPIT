// ============================================
// CALCULS KPIs - Immobilier Commercial
// ============================================

import type {
  EtatLocatif,
  DonneesLoyer,
  DonneesChiffreAffaires,
  DonneesCharges,
  DonneesBail,
  DonneesFrequentation,
  DonneesValorisation,
  TypeKPICalcule,
  ResultatKPI,
} from '../types/bi';
import { ALL_KPI_DEFINITIONS, getStatutFromValue } from '../data/kpiDefinitions';
import { v4 as uuidv4 } from 'uuid';

// ===========================================
// TYPES POUR LES DONNEES D'ENTREE
// ===========================================

export interface DonneesCalculKPI {
  centreId: string;
  periodeDebut: string;
  periodeFin: string;
  etatsLocatifs?: EtatLocatif[];
  loyers?: DonneesLoyer[];
  chiffresAffaires?: DonneesChiffreAffaires[];
  charges?: DonneesCharges[];
  baux?: DonneesBail[];
  frequentation?: DonneesFrequentation[];
  valorisation?: DonneesValorisation;
  surfaceTotale?: number;
  valeurActif?: number;
}

export interface ResultatCalcul {
  valeur: number;
  valeurFormatee: string;
  details?: Record<string, unknown>;
  sourcesDonnees: string[];
}

// ===========================================
// HELPERS - Formatage
// ===========================================

export function formatMontant(valeur: number, devise = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: devise,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valeur);
}

export function formatPourcentage(valeur: number, decimales = 1): string {
  return `${valeur.toFixed(decimales)}%`;
}

export function formatNombre(valeur: number, decimales = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valeur);
}

// ===========================================
// CALCULS - PERFORMANCE FINANCIERE
// ===========================================

/**
 * NOI - Net Operating Income
 * NOI = Loyers Encaissés - Charges d'Exploitation
 * Note: Les charges encaissées (refacturées aux locataires) ne sont PAS incluses
 * car elles sont neutres (refacturation = remboursement des charges réelles)
 */
export function calculerNOI(donnees: DonneesCalculKPI): ResultatCalcul {
  const { loyers = [], charges = [] } = donnees;

  // Loyers encaissés uniquement (sans les charges refacturées)
  const totalLoyers = loyers.reduce((sum, l) => sum + l.loyerEncaisse, 0);
  const totalCharges = charges.reduce((sum, c) => sum + c.montantReel, 0);

  const noi = totalLoyers - totalCharges;

  return {
    valeur: noi,
    valeurFormatee: formatMontant(noi),
    details: {
      totalLoyers,
      totalCharges,
      chargesRefacturees: loyers.reduce((sum, l) => sum + l.chargesEncaissees, 0),
    },
    sourcesDonnees: ['loyers', 'charges'],
  };
}

/**
 * NOI par m²
 */
export function calculerNOIM2(donnees: DonneesCalculKPI): ResultatCalcul {
  const { surfaceTotale = 0 } = donnees;
  const { valeur: noi } = calculerNOI(donnees);

  const noiM2 = surfaceTotale > 0 ? noi / surfaceTotale : 0;

  return {
    valeur: noiM2,
    valeurFormatee: `${formatNombre(noiM2, 0)} /m²`,
    sourcesDonnees: ['loyers', 'charges', 'surface'],
  };
}

/**
 * Yield Brut
 * Rendement = (Loyers Annuels / Valeur Actif) * 100
 */
export function calculerYieldBrut(donnees: DonneesCalculKPI): ResultatCalcul {
  const { loyers = [], valeurActif = 0 } = donnees;

  const totalLoyers = loyers.reduce((sum, l) => sum + l.loyerEncaisse, 0);
  const loyersAnnualises = totalLoyers * (12 / (loyers.length || 1)); // Annualiser si données partielles

  const yieldBrut = valeurActif > 0 ? (loyersAnnualises / valeurActif) * 100 : 0;

  return {
    valeur: yieldBrut,
    valeurFormatee: formatPourcentage(yieldBrut, 2),
    details: {
      loyersAnnuels: loyersAnnualises,
      valeurActif,
    },
    sourcesDonnees: ['loyers', 'valorisation'],
  };
}

/**
 * Yield Net
 * Rendement Net = (NOI / Valeur Actif) * 100
 */
export function calculerYieldNet(donnees: DonneesCalculKPI): ResultatCalcul {
  const { valeurActif = 0 } = donnees;
  const { valeur: noi } = calculerNOI(donnees);

  const noiAnnualise = noi * (12 / Math.max(donnees.loyers?.length || 1, 1));
  const yieldNet = valeurActif > 0 ? (noiAnnualise / valeurActif) * 100 : 0;

  return {
    valeur: yieldNet,
    valeurFormatee: formatPourcentage(yieldNet, 2),
    details: {
      noiAnnuel: noiAnnualise,
      valeurActif,
    },
    sourcesDonnees: ['loyers', 'charges', 'valorisation'],
  };
}

// ===========================================
// CALCULS - BAUX ET DUREES
// ===========================================

/**
 * WAULT - Weighted Average Unexpired Lease Term
 * Durée moyenne pondérée des baux jusqu'au terme
 */
export function calculerWAULT(donnees: DonneesCalculKPI): ResultatCalcul {
  const { baux = [], etatsLocatifs = [] } = donnees;
  const now = new Date();

  let sommeLoyers = 0;
  let sommePonderee = 0;

  const source = baux.length > 0 ? baux : etatsLocatifs;

  for (const item of source) {
    const dateFin = new Date('dateFin' in item ? item.dateFin : (item as EtatLocatif).bailFin);
    const loyer = 'loyerAnnuel' in item ? item.loyerAnnuel : (item as EtatLocatif).loyerMinimumGaranti;

    const dureeRestanteAnnees = Math.max(0, (dateFin.getTime() - now.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    sommeLoyers += loyer;
    sommePonderee += dureeRestanteAnnees * loyer;
  }

  const wault = sommeLoyers > 0 ? sommePonderee / sommeLoyers : 0;

  return {
    valeur: wault,
    valeurFormatee: `${wault.toFixed(1)} ans`,
    details: {
      nombreBaux: source.length,
      sommeLoyers,
    },
    sourcesDonnees: ['bail', 'etat_locatif'],
  };
}

/**
 * WALB - Weighted Average Lease to Break
 * Durée moyenne pondérée jusqu'à l'option de break
 * Pondération par la surface (GLA) et non par les loyers
 */
export function calculerWALB(donnees: DonneesCalculKPI): ResultatCalcul {
  const { baux = [], etatsLocatifs = [] } = donnees;
  const now = new Date();

  let sommeSurfaces = 0;
  let sommePonderee = 0;

  for (const bail of baux) {
    // Si pas de date break, utiliser date fin
    const dateBreak = bail.dateBreak ? new Date(bail.dateBreak) : new Date(bail.dateFin);
    const dureeToBreak = Math.max(0, (dateBreak.getTime() - now.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    // Trouver la surface associée au bail via l'état locatif
    const etatLocatif = etatsLocatifs.find(e => e.lotId === bail.lotId);
    const surface = etatLocatif?.surfaceGLA || bail.surface || 0;

    sommeSurfaces += surface;
    sommePonderee += dureeToBreak * surface;
  }

  const walb = sommeSurfaces > 0 ? sommePonderee / sommeSurfaces : 0;

  return {
    valeur: walb,
    valeurFormatee: `${walb.toFixed(1)} ans`,
    details: {
      nombreBaux: baux.length,
      surfaceTotale: sommeSurfaces,
    },
    sourcesDonnees: ['bail', 'etat_locatif'],
  };
}

// ===========================================
// CALCULS - OCCUPATION
// ===========================================

/**
 * Taux d'Occupation Physique
 * TOP = (Surface Louée / Surface Totale) * 100
 */
export function calculerTauxOccupationPhysique(donnees: DonneesCalculKPI): ResultatCalcul {
  const { etatsLocatifs = [], surfaceTotale = 0 } = donnees;

  const surfaceLouee = etatsLocatifs
    .filter(e => e.statutOccupation === 'occupe' || e.statutOccupation === 'pre_loue')
    .reduce((sum, e) => sum + e.surfaceGLA, 0);

  const surface = surfaceTotale > 0 ? surfaceTotale : etatsLocatifs.reduce((sum, e) => sum + e.surfaceGLA, 0);

  const tauxOccupation = surface > 0 ? (surfaceLouee / surface) * 100 : 0;

  return {
    valeur: tauxOccupation,
    valeurFormatee: formatPourcentage(tauxOccupation),
    details: {
      surfaceLouee,
      surfaceTotale: surface,
      nombreLotsOccupes: etatsLocatifs.filter(e => e.statutOccupation === 'occupe').length,
    },
    sourcesDonnees: ['etat_locatif'],
  };
}

/**
 * Taux d'Occupation Financier
 * TOF = (Loyers Perçus / Loyers Théoriques) * 100
 */
export function calculerTauxOccupationFinancier(donnees: DonneesCalculKPI): ResultatCalcul {
  const { loyers = [], etatsLocatifs = [] } = donnees;

  const loyersPercus = loyers.reduce((sum, l) => sum + l.loyerEncaisse, 0);
  const loyersTheoriques = etatsLocatifs.reduce((sum, e) => sum + e.loyerMinimumGaranti / 12, 0) * (loyers.length || 1);

  const tof = loyersTheoriques > 0 ? (loyersPercus / loyersTheoriques) * 100 : 0;

  return {
    valeur: tof,
    valeurFormatee: formatPourcentage(tof),
    details: {
      loyersPercus,
      loyersTheoriques,
    },
    sourcesDonnees: ['loyers', 'etat_locatif'],
  };
}

/**
 * Taux de Vacance
 * Vacance = 100 - Taux Occupation Physique
 */
export function calculerTauxVacance(donnees: DonneesCalculKPI): ResultatCalcul {
  const { valeur: tauxOccupation, details } = calculerTauxOccupationPhysique(donnees);
  const vacance = 100 - tauxOccupation;

  const surfaceVacante = donnees.etatsLocatifs
    ?.filter(e => e.statutOccupation === 'vacant')
    .reduce((sum, e) => sum + e.surfaceGLA, 0) || 0;

  return {
    valeur: vacance,
    valeurFormatee: formatPourcentage(vacance),
    details: {
      ...details,
      surfaceVacante,
      nombreLotsVacants: donnees.etatsLocatifs?.filter(e => e.statutOccupation === 'vacant').length || 0,
    },
    sourcesDonnees: ['etat_locatif'],
  };
}

// ===========================================
// CALCULS - LOYERS ET TAUX D'EFFORT
// ===========================================

/**
 * Taux d'Effort Moyen
 * Effort = (Loyer Annuel / CA Locataire) * 100
 */
export function calculerTauxEffortMoyen(donnees: DonneesCalculKPI): ResultatCalcul {
  const { etatsLocatifs = [], chiffresAffaires = [] } = donnees;

  let sommeTauxEffort = 0;
  let surfaceTotale = 0;
  const tauxEffortParLocataire: { enseigne: string; tauxEffort: number; surface: number }[] = [];

  for (const etat of etatsLocatifs) {
    const ca = chiffresAffaires
      .filter(c => c.lotId === etat.lotId)
      .reduce((sum, c) => sum + c.caDeclare, 0);

    if (ca > 0) {
      const loyerAnnuel = etat.loyerMinimumGaranti;
      const caAnnualise = ca * (12 / chiffresAffaires.filter(c => c.lotId === etat.lotId).length);
      const tauxEffort = (loyerAnnuel / caAnnualise) * 100;

      tauxEffortParLocataire.push({
        enseigne: etat.locataireEnseigne,
        tauxEffort,
        surface: etat.surfaceGLA,
      });

      sommeTauxEffort += tauxEffort * etat.surfaceGLA;
      surfaceTotale += etat.surfaceGLA;
    }
  }

  const tauxEffortMoyen = surfaceTotale > 0 ? sommeTauxEffort / surfaceTotale : 0;

  return {
    valeur: tauxEffortMoyen,
    valeurFormatee: formatPourcentage(tauxEffortMoyen),
    details: {
      nombreLocataires: tauxEffortParLocataire.length,
      detailsParLocataire: tauxEffortParLocataire,
    },
    sourcesDonnees: ['loyers', 'chiffre_affaires', 'etat_locatif'],
  };
}

/**
 * Potentiel de Réversion
 * Réversion = ((Loyer Marché - Loyer Place) / Loyer Place) * 100
 */
export function calculerReversion(donnees: DonneesCalculKPI, loyerMarcheM2 = 300): ResultatCalcul {
  const { etatsLocatifs = [] } = donnees;

  let loyerPlace = 0;
  let loyerMarche = 0;

  for (const etat of etatsLocatifs) {
    if (etat.statutOccupation === 'occupe') {
      loyerPlace += etat.loyerMinimumGaranti;
      loyerMarche += etat.surfaceGLA * loyerMarcheM2;
    }
  }

  const reversion = loyerPlace > 0 ? ((loyerMarche - loyerPlace) / loyerPlace) * 100 : 0;

  return {
    valeur: reversion,
    valeurFormatee: `${reversion >= 0 ? '+' : ''}${formatPourcentage(reversion)}`,
    details: {
      loyerPlace,
      loyerMarche,
      ecartAbsolu: loyerMarche - loyerPlace,
    },
    sourcesDonnees: ['loyers', 'etat_locatif'],
  };
}

/**
 * Loyer Moyen par m²
 */
export function calculerLoyerMoyenM2(donnees: DonneesCalculKPI): ResultatCalcul {
  const { etatsLocatifs = [] } = donnees;

  const lotsOccupes = etatsLocatifs.filter(e => e.statutOccupation === 'occupe');
  const totalLoyers = lotsOccupes.reduce((sum, e) => sum + e.loyerMinimumGaranti, 0);
  const totalSurface = lotsOccupes.reduce((sum, e) => sum + e.surfaceGLA, 0);

  const loyerM2 = totalSurface > 0 ? totalLoyers / totalSurface : 0;

  return {
    valeur: loyerM2,
    valeurFormatee: `${formatNombre(loyerM2, 0)} /m²/an`,
    details: {
      totalLoyers,
      totalSurface,
    },
    sourcesDonnees: ['loyers', 'etat_locatif'],
  };
}

// ===========================================
// CALCULS - FREQUENTATION
// ===========================================

/**
 * Fréquentation Totale
 */
export function calculerFrequentationTotale(donnees: DonneesCalculKPI): ResultatCalcul {
  const { frequentation = [] } = donnees;

  const total = frequentation.reduce((sum, f) => sum + f.entreesTotal, 0);

  return {
    valeur: total,
    valeurFormatee: formatNombre(total),
    details: {
      nombreJours: frequentation.length,
    },
    sourcesDonnees: ['frequentation'],
  };
}

/**
 * Fréquentation Journalière Moyenne
 */
export function calculerFrequentationJourMoyen(donnees: DonneesCalculKPI): ResultatCalcul {
  const { frequentation = [] } = donnees;

  const total = frequentation.reduce((sum, f) => sum + f.entreesTotal, 0);
  const moyenne = frequentation.length > 0 ? total / frequentation.length : 0;

  return {
    valeur: moyenne,
    valeurFormatee: formatNombre(moyenne, 0),
    sourcesDonnees: ['frequentation'],
  };
}

// ===========================================
// CALCULS - CHIFFRE D'AFFAIRES
// ===========================================

/**
 * CA Total
 */
export function calculerCATotal(donnees: DonneesCalculKPI): ResultatCalcul {
  const { chiffresAffaires = [] } = donnees;

  const total = chiffresAffaires.reduce((sum, c) => sum + c.caDeclare, 0);

  return {
    valeur: total,
    valeurFormatee: formatMontant(total),
    sourcesDonnees: ['chiffre_affaires'],
  };
}

/**
 * CA par m²
 */
export function calculerCAM2(donnees: DonneesCalculKPI): ResultatCalcul {
  const { chiffresAffaires = [], etatsLocatifs = [] } = donnees;

  const totalCA = chiffresAffaires.reduce((sum, c) => sum + c.caDeclare, 0);
  const surfaceLouee = etatsLocatifs
    .filter(e => e.statutOccupation === 'occupe')
    .reduce((sum, e) => sum + e.surfaceGLA, 0);

  const caM2 = surfaceLouee > 0 ? totalCA / surfaceLouee : 0;

  return {
    valeur: caM2,
    valeurFormatee: `${formatNombre(caM2, 0)} /m²`,
    sourcesDonnees: ['chiffre_affaires', 'etat_locatif'],
  };
}

/**
 * CA par Visiteur
 */
export function calculerCAVisiteur(donnees: DonneesCalculKPI): ResultatCalcul {
  const { chiffresAffaires = [], frequentation = [] } = donnees;

  const totalCA = chiffresAffaires.reduce((sum, c) => sum + c.caDeclare, 0);
  const totalVisiteurs = frequentation.reduce((sum, f) => sum + f.entreesTotal, 0);

  const caVisiteur = totalVisiteurs > 0 ? totalCA / totalVisiteurs : 0;

  return {
    valeur: caVisiteur,
    valeurFormatee: formatMontant(caVisiteur),
    sourcesDonnees: ['chiffre_affaires', 'frequentation'],
  };
}

// ===========================================
// CALCULS - CHARGES
// ===========================================

/**
 * Charges par m²
 * CHARGES_M2 = Total Charges / Surface Totale
 */
export function calculerChargesM2(donnees: DonneesCalculKPI): ResultatCalcul {
  const { charges = [], surfaceTotale = 0, etatsLocatifs = [] } = donnees;

  const totalCharges = charges.reduce((sum, c) => sum + c.montantReel, 0);
  const surface = surfaceTotale > 0
    ? surfaceTotale
    : etatsLocatifs.reduce((sum, e) => sum + e.surfaceGLA, 0);

  const chargesM2 = surface > 0 ? totalCharges / surface : 0;

  return {
    valeur: chargesM2,
    valeurFormatee: `${formatNombre(chargesM2, 2)} /m²`,
    details: {
      totalCharges,
      surfaceTotale: surface,
    },
    sourcesDonnees: ['charges', 'etat_locatif'],
  };
}

// ===========================================
// CALCULS - COMMERCIALISATION
// ===========================================

/**
 * Taux de Transformation
 * TAUX_TRANSFORMATION = (Visiteurs ayant acheté / Total Visiteurs) * 100
 * Approximé par: (Tickets / Fréquentation) * 100 si disponible
 * Ou: (CA / Panier moyen estimé) / Fréquentation * 100
 */
export function calculerTauxTransformation(donnees: DonneesCalculKPI): ResultatCalcul {
  const { frequentation = [], chiffresAffaires = [] } = donnees;

  const totalVisiteurs = frequentation.reduce((sum, f) => sum + f.entreesTotal, 0);

  // Calculer le nombre estimé de transactions
  // Si on a le nombre de tickets, on l'utilise directement
  // Sinon on estime via CA / panier moyen (50€ par défaut)
  const totalCA = chiffresAffaires.reduce((sum, c) => sum + c.caDeclare, 0);
  const panierMoyenEstime = 50; // Panier moyen par défaut en €

  // Nombre de tickets estimé
  const nombreTransactions = chiffresAffaires.reduce((sum, c) => {
    // Si le nombre de tickets est disponible dans les données
    if ('nombreTickets' in c && typeof c.nombreTickets === 'number') {
      return sum + c.nombreTickets;
    }
    // Sinon estimation via CA / panier moyen
    return sum + (c.caDeclare / panierMoyenEstime);
  }, 0);

  const tauxTransformation = totalVisiteurs > 0
    ? (nombreTransactions / totalVisiteurs) * 100
    : 0;

  return {
    valeur: tauxTransformation,
    valeurFormatee: formatPourcentage(tauxTransformation, 1),
    details: {
      totalVisiteurs,
      nombreTransactions: Math.round(nombreTransactions),
      totalCA,
      panierMoyenUtilise: panierMoyenEstime,
    },
    sourcesDonnees: ['frequentation', 'chiffre_affaires'],
  };
}

// ===========================================
// CALCULS - RECOUVREMENT
// ===========================================

/**
 * Taux de Recouvrement
 * = Loyers Encaissés / Loyers Appelés * 100
 */
export function calculerTauxRecouvrement(donnees: DonneesCalculKPI): ResultatCalcul {
  const { loyers = [] } = donnees;

  const loyersAppeles = loyers.reduce((sum, l) => sum + l.loyerAppele + l.chargesAppelees, 0);
  const loyersEncaisses = loyers.reduce((sum, l) => sum + l.loyerEncaisse + l.chargesEncaissees, 0);

  const tauxRecouvrement = loyersAppeles > 0 ? (loyersEncaisses / loyersAppeles) * 100 : 100;

  return {
    valeur: tauxRecouvrement,
    valeurFormatee: formatPourcentage(tauxRecouvrement),
    details: {
      loyersAppeles,
      loyersEncaisses,
      impayes: loyersAppeles - loyersEncaisses,
    },
    sourcesDonnees: ['loyers'],
  };
}

/**
 * DSO - Days Sales Outstanding
 * = (Créances / CA) * 365
 */
export function calculerDSO(donnees: DonneesCalculKPI): ResultatCalcul {
  const { loyers = [] } = donnees;

  const loyersAppeles = loyers.reduce((sum, l) => sum + l.loyerAppele, 0);
  const loyersEncaisses = loyers.reduce((sum, l) => sum + l.loyerEncaisse, 0);
  const creances = loyersAppeles - loyersEncaisses;

  const nombreMois = loyers.length || 1;
  const loyersAnnuels = (loyersAppeles / nombreMois) * 12;

  const dso = loyersAnnuels > 0 ? (creances / loyersAnnuels) * 365 : 0;

  return {
    valeur: dso,
    valeurFormatee: `${Math.round(dso)} jours`,
    details: {
      creances,
      loyersAnnuels,
    },
    sourcesDonnees: ['loyers'],
  };
}

// ===========================================
// CALCULS - CONCENTRATION
// ===========================================

/**
 * Concentration Top N locataires
 */
export function calculerConcentrationTopN(donnees: DonneesCalculKPI, n: number): ResultatCalcul {
  const { etatsLocatifs = [] } = donnees;

  // Grouper par enseigne
  const loyersParEnseigne: Record<string, number> = {};
  for (const etat of etatsLocatifs) {
    if (etat.statutOccupation === 'occupe') {
      loyersParEnseigne[etat.locataireEnseigne] =
        (loyersParEnseigne[etat.locataireEnseigne] || 0) + etat.loyerMinimumGaranti;
    }
  }

  // Trier et prendre les top N
  const enseignesSorted = Object.entries(loyersParEnseigne)
    .sort((a, b) => b[1] - a[1]);

  const totalLoyers = enseignesSorted.reduce((sum, [, loyer]) => sum + loyer, 0);
  const topN = enseignesSorted.slice(0, n);
  const loyersTopN = topN.reduce((sum, [, loyer]) => sum + loyer, 0);

  const concentration = totalLoyers > 0 ? (loyersTopN / totalLoyers) * 100 : 0;

  return {
    valeur: concentration,
    valeurFormatee: formatPourcentage(concentration),
    details: {
      topLocataires: topN.map(([enseigne, loyer]) => ({
        enseigne,
        loyer,
        part: (loyer / totalLoyers) * 100,
      })),
    },
    sourcesDonnees: ['loyers', 'etat_locatif'],
  };
}

// ===========================================
// FONCTION PRINCIPALE - CALCULER UN KPI
// ===========================================

export function calculerKPI(
  type: TypeKPICalcule,
  donnees: DonneesCalculKPI
): ResultatCalcul {
  switch (type) {
    case 'NOI':
      return calculerNOI(donnees);
    case 'NOI_M2':
      return calculerNOIM2(donnees);
    case 'YIELD_BRUT':
      return calculerYieldBrut(donnees);
    case 'YIELD_NET':
      return calculerYieldNet(donnees);
    case 'WAULT':
      return calculerWAULT(donnees);
    case 'WALB':
      return calculerWALB(donnees);
    case 'TAUX_OCCUPATION_PHYSIQUE':
      return calculerTauxOccupationPhysique(donnees);
    case 'TAUX_OCCUPATION_FINANCIER':
      return calculerTauxOccupationFinancier(donnees);
    case 'TAUX_VACANCE':
      return calculerTauxVacance(donnees);
    case 'TAUX_EFFORT_MOYEN':
      return calculerTauxEffortMoyen(donnees);
    case 'REVERSION':
      return calculerReversion(donnees);
    case 'LOYER_MOYEN_M2':
      return calculerLoyerMoyenM2(donnees);
    case 'FREQUENTATION_TOTALE':
      return calculerFrequentationTotale(donnees);
    case 'FREQUENTATION_JOUR_MOYEN':
      return calculerFrequentationJourMoyen(donnees);
    case 'CA_TOTAL':
      return calculerCATotal(donnees);
    case 'CA_M2':
      return calculerCAM2(donnees);
    case 'CA_VISITEUR':
      return calculerCAVisiteur(donnees);
    case 'TAUX_RECOUVREMENT':
      return calculerTauxRecouvrement(donnees);
    case 'DSO':
      return calculerDSO(donnees);
    case 'CONCENTRATION_TOP5':
      return calculerConcentrationTopN(donnees, 5);
    case 'CONCENTRATION_TOP10':
      return calculerConcentrationTopN(donnees, 10);
    case 'CHARGES_M2':
      return calculerChargesM2(donnees);
    case 'TAUX_TRANSFORMATION':
      return calculerTauxTransformation(donnees);
    default:
      return {
        valeur: 0,
        valeurFormatee: 'N/A',
        sourcesDonnees: [],
      };
  }
}

// ===========================================
// CREATION RESULTAT KPI COMPLET
// ===========================================

export function creerResultatKPI(
  type: TypeKPICalcule,
  donnees: DonneesCalculKPI,
  valeurN1?: number
): ResultatKPI {
  const definition = ALL_KPI_DEFINITIONS[type];
  const calcul = calculerKPI(type, donnees);

  let variationAbsolue: number | undefined;
  let variationPourcentage: number | undefined;
  let tendance: 'hausse' | 'baisse' | 'stable' = 'stable';

  if (valeurN1 !== undefined && valeurN1 !== 0) {
    variationAbsolue = calcul.valeur - valeurN1;
    variationPourcentage = (variationAbsolue / valeurN1) * 100;

    if (variationPourcentage > 1) tendance = 'hausse';
    else if (variationPourcentage < -1) tendance = 'baisse';
  }

  const statut = definition
    ? getStatutFromValue(definition, calcul.valeur)
    : 'vert';

  return {
    id: uuidv4(),
    centreId: donnees.centreId,
    typeKPI: type,
    valeur: calcul.valeur,
    valeurFormatee: calcul.valeurFormatee,
    unite: definition?.unite || '',
    periodeDebut: donnees.periodeDebut,
    periodeFin: donnees.periodeFin,
    periodeLabel: `${donnees.periodeDebut} - ${donnees.periodeFin}`,
    valeurN1,
    variationAbsolue,
    variationPourcentage,
    tendance,
    statut,
    details: calcul.details,
    sourcesDonnees: calcul.sourcesDonnees,
    dateCalcul: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

// ===========================================
// CALCULER TOUS LES KPIs DISPONIBLES
// ===========================================

export function calculerTousKPIs(donnees: DonneesCalculKPI): ResultatKPI[] {
  const typesKPI: TypeKPICalcule[] = [
    'NOI',
    'NOI_M2',
    'YIELD_BRUT',
    'YIELD_NET',
    'WAULT',
    'WALB',
    'TAUX_OCCUPATION_PHYSIQUE',
    'TAUX_OCCUPATION_FINANCIER',
    'TAUX_VACANCE',
    'TAUX_EFFORT_MOYEN',
    'REVERSION',
    'LOYER_MOYEN_M2',
    'CHARGES_M2',
    'FREQUENTATION_TOTALE',
    'FREQUENTATION_JOUR_MOYEN',
    'CA_TOTAL',
    'CA_M2',
    'CA_VISITEUR',
    'TAUX_TRANSFORMATION',
    'TAUX_RECOUVREMENT',
    'DSO',
    'CONCENTRATION_TOP5',
    'CONCENTRATION_TOP10',
  ];

  return typesKPI.map(type => creerResultatKPI(type, donnees));
}
