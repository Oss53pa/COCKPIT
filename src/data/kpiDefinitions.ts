// ============================================
// DEFINITIONS KPIs - Immobilier Commercial
// ============================================

import type { KPIDefinition, CategorieImport } from '../types/bi';

// ===========================================
// KPIs - PERFORMANCE FINANCIERE
// ===========================================

export const KPI_NOI: KPIDefinition = {
  code: 'NOI',
  nom: 'Net Operating Income',
  nomCourt: 'NOI',
  description: 'Revenu net d\'exploitation = Revenus locatifs - Charges d\'exploitation',
  formule: 'NOI = Revenus_Locatifs - Charges_Exploitation',
  unite: 'EUR',
  formatAffichage: '0,0 €',
  categoriesRequises: ['loyers', 'charges'] as CategorieImport[],
  seuilVert: 0,
  tendancePositive: 'hausse',
  icone: 'TrendingUp',
};

export const KPI_NOI_M2: KPIDefinition = {
  code: 'NOI_M2',
  nom: 'NOI par m²',
  nomCourt: 'NOI/m²',
  description: 'Net Operating Income rapporté à la surface locative',
  formule: 'NOI_M2 = NOI / Surface_Locative',
  unite: 'EUR/m2',
  formatAffichage: '0,0 €/m²',
  categoriesRequises: ['loyers', 'charges', 'surface'] as CategorieImport[],
  tendancePositive: 'hausse',
  icone: 'LayoutGrid',
};

export const KPI_YIELD_BRUT: KPIDefinition = {
  code: 'YIELD_BRUT',
  nom: 'Rendement Brut',
  nomCourt: 'Yield Brut',
  description: 'Taux de rendement brut = Loyers annuels / Valeur d\'acquisition',
  formule: 'YIELD_BRUT = (Loyers_Annuels / Valeur_Actif) × 100',
  unite: '%',
  formatAffichage: '0.00%',
  categoriesRequises: ['loyers', 'valorisation'] as CategorieImport[],
  seuilVert: 6,
  seuilOrange: 4,
  seuilRouge: 3,
  tendancePositive: 'hausse',
  icone: 'Percent',
};

export const KPI_YIELD_NET: KPIDefinition = {
  code: 'YIELD_NET',
  nom: 'Rendement Net',
  nomCourt: 'Yield Net',
  description: 'Taux de rendement net = NOI / Valeur d\'acquisition',
  formule: 'YIELD_NET = (NOI / Valeur_Actif) × 100',
  unite: '%',
  formatAffichage: '0.00%',
  categoriesRequises: ['loyers', 'charges', 'valorisation'] as CategorieImport[],
  seuilVert: 5,
  seuilOrange: 3.5,
  seuilRouge: 2.5,
  tendancePositive: 'hausse',
  icone: 'Percent',
};

// ===========================================
// KPIs - BAUX ET DUREES
// ===========================================

export const KPI_WAULT: KPIDefinition = {
  code: 'WAULT',
  nom: 'Weighted Average Unexpired Lease Term',
  nomCourt: 'WAULT',
  description: 'Durée moyenne pondérée restante des baux jusqu\'à leur terme',
  formule: 'WAULT = Σ(Durée_Restante × Loyer_Annuel) / Σ(Loyers_Annuels)',
  unite: 'annees',
  formatAffichage: '0.0 ans',
  categoriesRequises: ['bail', 'loyers'] as CategorieImport[],
  seuilVert: 4,
  seuilOrange: 2.5,
  seuilRouge: 1.5,
  tendancePositive: 'hausse',
  icone: 'Calendar',
};

export const KPI_WALB: KPIDefinition = {
  code: 'WALB',
  nom: 'Weighted Average Lease to Break',
  nomCourt: 'WALB',
  description: 'Durée moyenne pondérée jusqu\'à la prochaine option de sortie',
  formule: 'WALB = Σ(Durée_to_Break × Loyer_Annuel) / Σ(Loyers_Annuels)',
  unite: 'annees',
  formatAffichage: '0.0 ans',
  categoriesRequises: ['bail', 'loyers'] as CategorieImport[],
  seuilVert: 3,
  seuilOrange: 2,
  seuilRouge: 1,
  tendancePositive: 'hausse',
  icone: 'CalendarX',
};

// ===========================================
// KPIs - OCCUPATION ET VACANCE
// ===========================================

export const KPI_TAUX_OCCUPATION_PHYSIQUE: KPIDefinition = {
  code: 'TAUX_OCCUPATION_PHYSIQUE',
  nom: 'Taux d\'Occupation Physique',
  nomCourt: 'TOP',
  description: 'Ratio de la surface occupée sur la surface totale',
  formule: 'TOP = (Surface_Louée / GLA_Total) × 100',
  unite: '%',
  formatAffichage: '0.0%',
  categoriesRequises: ['etat_locatif'] as CategorieImport[],
  seuilVert: 95,
  seuilOrange: 90,
  seuilRouge: 85,
  tendancePositive: 'hausse',
  icone: 'Building',
};

export const KPI_TAUX_OCCUPATION_FINANCIER: KPIDefinition = {
  code: 'TAUX_OCCUPATION_FINANCIER',
  nom: 'Taux d\'Occupation Financier',
  nomCourt: 'TOF',
  description: 'Ratio des loyers perçus sur les loyers théoriques',
  formule: 'TOF = (Loyers_Perçus / Loyers_Théoriques) × 100',
  unite: '%',
  formatAffichage: '0.0%',
  categoriesRequises: ['loyers', 'etat_locatif'] as CategorieImport[],
  seuilVert: 95,
  seuilOrange: 90,
  seuilRouge: 85,
  tendancePositive: 'hausse',
  icone: 'Wallet',
};

export const KPI_TAUX_VACANCE: KPIDefinition = {
  code: 'TAUX_VACANCE',
  nom: 'Taux de Vacance',
  nomCourt: 'Vacance',
  description: 'Ratio de la surface vacante sur la surface totale',
  formule: 'VACANCE = (Surface_Vacante / GLA_Total) × 100',
  unite: '%',
  formatAffichage: '0.0%',
  categoriesRequises: ['etat_locatif'] as CategorieImport[],
  seuilVert: 5,
  seuilOrange: 10,
  seuilRouge: 15,
  tendancePositive: 'baisse',
  icone: 'Building2',
};

// ===========================================
// KPIs - LOYERS ET CA
// ===========================================

export const KPI_TAUX_EFFORT: KPIDefinition = {
  code: 'TAUX_EFFORT',
  nom: 'Taux d\'Effort',
  nomCourt: 'Effort',
  description: 'Ratio du loyer annuel sur le chiffre d\'affaires du locataire',
  formule: 'TAUX_EFFORT = (Loyer_Annuel / CA_Locataire) × 100',
  unite: '%',
  formatAffichage: '0.0%',
  categoriesRequises: ['loyers', 'chiffre_affaires'] as CategorieImport[],
  seuilVert: 8,
  seuilOrange: 12,
  seuilRouge: 15,
  tendancePositive: 'baisse',
  icone: 'Activity',
};

export const KPI_TAUX_EFFORT_MOYEN: KPIDefinition = {
  code: 'TAUX_EFFORT_MOYEN',
  nom: 'Taux d\'Effort Moyen',
  nomCourt: 'Effort Moy.',
  description: 'Moyenne pondérée des taux d\'effort par surface',
  formule: 'EFFORT_MOY = Σ(Taux_Effort × Surface) / Σ(Surfaces)',
  unite: '%',
  formatAffichage: '0.0%',
  categoriesRequises: ['loyers', 'chiffre_affaires', 'etat_locatif'] as CategorieImport[],
  seuilVert: 8,
  seuilOrange: 12,
  seuilRouge: 15,
  tendancePositive: 'baisse',
  icone: 'Activity',
};

export const KPI_REVERSION: KPIDefinition = {
  code: 'REVERSION',
  nom: 'Potentiel de Réversion',
  nomCourt: 'Réversion',
  description: 'Écart entre loyer de marché et loyer en place',
  formule: 'REVERSION = ((Loyer_Marché - Loyer_Place) / Loyer_Place) × 100',
  unite: '%',
  formatAffichage: '+0.0%',
  categoriesRequises: ['loyers', 'etat_locatif'] as CategorieImport[],
  tendancePositive: 'hausse',
  icone: 'ArrowUpRight',
};

export const KPI_LOYER_MOYEN_M2: KPIDefinition = {
  code: 'LOYER_MOYEN_M2',
  nom: 'Loyer Moyen par m²',
  nomCourt: 'Loyer/m²',
  description: 'Loyer annuel moyen rapporté à la surface',
  formule: 'LOYER_M2 = Loyers_Annuels / Surface_Louée',
  unite: 'EUR/m2/an',
  formatAffichage: '0 €/m²/an',
  categoriesRequises: ['loyers', 'etat_locatif'] as CategorieImport[],
  tendancePositive: 'hausse',
  icone: 'Euro',
};

export const KPI_LOYER_TOTAL: KPIDefinition = {
  code: 'LOYER_TOTAL',
  nom: 'Loyers Totaux',
  nomCourt: 'Loyers',
  description: 'Somme des loyers annuels facturés',
  formule: 'LOYERS_TOTAL = Σ(Loyers_Annuels)',
  unite: 'EUR',
  formatAffichage: '0,0 €',
  categoriesRequises: ['loyers'] as CategorieImport[],
  tendancePositive: 'hausse',
  icone: 'Banknote',
};

// ===========================================
// KPIs - CHARGES
// ===========================================

export const KPI_CHARGES_TOTALES: KPIDefinition = {
  code: 'CHARGES_TOTALES',
  nom: 'Charges Totales',
  nomCourt: 'Charges',
  description: 'Somme des charges d\'exploitation',
  formule: 'CHARGES_TOTAL = Σ(Charges)',
  unite: 'EUR',
  formatAffichage: '0,0 €',
  categoriesRequises: ['charges'] as CategorieImport[],
  tendancePositive: 'baisse',
  icone: 'Receipt',
};

export const KPI_CHARGES_M2: KPIDefinition = {
  code: 'CHARGES_M2',
  nom: 'Charges par m²',
  nomCourt: 'Charges/m²',
  description: 'Charges annuelles rapportées à la surface',
  formule: 'CHARGES_M2 = Charges_Totales / Surface_Locative',
  unite: 'EUR/m2',
  formatAffichage: '0 €/m²',
  categoriesRequises: ['charges', 'surface'] as CategorieImport[],
  tendancePositive: 'baisse',
  icone: 'LayoutGrid',
};

export const KPI_TAUX_REFACTURATION: KPIDefinition = {
  code: 'TAUX_REFACTURATION',
  nom: 'Taux de Refacturation',
  nomCourt: 'Refact.',
  description: 'Ratio des charges refacturées sur les charges totales',
  formule: 'TAUX_REFACT = (Charges_Refacturées / Charges_Totales) × 100',
  unite: '%',
  formatAffichage: '0.0%',
  categoriesRequises: ['charges'] as CategorieImport[],
  seuilVert: 85,
  seuilOrange: 75,
  seuilRouge: 65,
  tendancePositive: 'hausse',
  icone: 'Repeat',
};

// ===========================================
// KPIs - CHIFFRE D'AFFAIRES
// ===========================================

export const KPI_CA_TOTAL: KPIDefinition = {
  code: 'CA_TOTAL',
  nom: 'Chiffre d\'Affaires Total',
  nomCourt: 'CA Total',
  description: 'Somme des CA déclarés par les locataires',
  formule: 'CA_TOTAL = Σ(CA_Locataires)',
  unite: 'EUR',
  formatAffichage: '0,0 €',
  categoriesRequises: ['chiffre_affaires'] as CategorieImport[],
  tendancePositive: 'hausse',
  icone: 'ShoppingCart',
};

export const KPI_CA_M2: KPIDefinition = {
  code: 'CA_M2',
  nom: 'CA par m²',
  nomCourt: 'CA/m²',
  description: 'Chiffre d\'affaires rapporté à la surface',
  formule: 'CA_M2 = CA_Total / Surface_Louée',
  unite: 'EUR/m2',
  formatAffichage: '0 €/m²',
  categoriesRequises: ['chiffre_affaires', 'etat_locatif'] as CategorieImport[],
  tendancePositive: 'hausse',
  icone: 'LayoutGrid',
};

export const KPI_CA_VISITEUR: KPIDefinition = {
  code: 'CA_VISITEUR',
  nom: 'CA par Visiteur',
  nomCourt: 'CA/Visit.',
  description: 'Chiffre d\'affaires moyen par visiteur (panier moyen centre)',
  formule: 'CA_VISITEUR = CA_Total / Nombre_Visiteurs',
  unite: 'EUR',
  formatAffichage: '0.00 €',
  categoriesRequises: ['chiffre_affaires', 'frequentation'] as CategorieImport[],
  tendancePositive: 'hausse',
  icone: 'Users',
};

// ===========================================
// KPIs - FREQUENTATION
// ===========================================

export const KPI_FREQUENTATION_TOTALE: KPIDefinition = {
  code: 'FREQUENTATION_TOTALE',
  nom: 'Fréquentation Totale',
  nomCourt: 'Fréquent.',
  description: 'Nombre total de visiteurs sur la période',
  formule: 'FREQ_TOTAL = Σ(Entrées)',
  unite: 'visiteurs',
  formatAffichage: '0,0',
  categoriesRequises: ['frequentation'] as CategorieImport[],
  tendancePositive: 'hausse',
  icone: 'Users',
};

export const KPI_FREQUENTATION_JOUR_MOYEN: KPIDefinition = {
  code: 'FREQUENTATION_JOUR_MOYEN',
  nom: 'Fréquentation Journalière Moyenne',
  nomCourt: 'Fréq./Jour',
  description: 'Nombre moyen de visiteurs par jour',
  formule: 'FREQ_JOUR = Fréquentation_Totale / Nombre_Jours',
  unite: 'visiteurs',
  formatAffichage: '0,0',
  categoriesRequises: ['frequentation'] as CategorieImport[],
  tendancePositive: 'hausse',
  icone: 'UserCheck',
};

export const KPI_TAUX_TRANSFORMATION: KPIDefinition = {
  code: 'TAUX_TRANSFORMATION',
  nom: 'Taux de Transformation',
  nomCourt: 'Transform.',
  description: 'Ratio d\'acheteurs sur le nombre de visiteurs',
  formule: 'TRANSFO = (Nombre_Tickets / Nombre_Visiteurs) × 100',
  unite: '%',
  formatAffichage: '0.0%',
  categoriesRequises: ['frequentation', 'chiffre_affaires'] as CategorieImport[],
  seuilVert: 30,
  seuilOrange: 20,
  seuilRouge: 15,
  tendancePositive: 'hausse',
  icone: 'ShoppingBag',
};

export const KPI_PANIER_MOYEN: KPIDefinition = {
  code: 'PANIER_MOYEN',
  nom: 'Panier Moyen',
  nomCourt: 'Panier',
  description: 'Montant moyen par transaction',
  formule: 'PANIER = CA_Total / Nombre_Tickets',
  unite: 'EUR',
  formatAffichage: '0.00 €',
  categoriesRequises: ['chiffre_affaires'] as CategorieImport[],
  tendancePositive: 'hausse',
  icone: 'ShoppingCart',
};

// ===========================================
// KPIs - RECOUVREMENT
// ===========================================

export const KPI_TAUX_RECOUVREMENT: KPIDefinition = {
  code: 'TAUX_RECOUVREMENT',
  nom: 'Taux de Recouvrement',
  nomCourt: 'Recouv.',
  description: 'Ratio des loyers encaissés sur les loyers appelés',
  formule: 'RECOUV = (Loyers_Encaissés / Loyers_Appelés) × 100',
  unite: '%',
  formatAffichage: '0.0%',
  categoriesRequises: ['loyers'] as CategorieImport[],
  seuilVert: 98,
  seuilOrange: 95,
  seuilRouge: 90,
  tendancePositive: 'hausse',
  icone: 'CheckCircle',
};

export const KPI_DSO: KPIDefinition = {
  code: 'DSO',
  nom: 'Days Sales Outstanding',
  nomCourt: 'DSO',
  description: 'Délai moyen de paiement en jours',
  formule: 'DSO = (Créances / Loyers_Annuels) × 365',
  unite: 'nombre',
  formatAffichage: '0 jours',
  categoriesRequises: ['loyers'] as CategorieImport[],
  seuilVert: 15,
  seuilOrange: 30,
  seuilRouge: 45,
  tendancePositive: 'baisse',
  icone: 'Clock',
};

// ===========================================
// KPIs - CONCENTRATION ET DIVERSITE
// ===========================================

export const KPI_CONCENTRATION_TOP5: KPIDefinition = {
  code: 'CONCENTRATION_TOP5',
  nom: 'Concentration Top 5',
  nomCourt: 'Top 5',
  description: 'Part des 5 premiers locataires dans les revenus',
  formule: 'TOP5 = (Loyers_Top5 / Loyers_Totaux) × 100',
  unite: '%',
  formatAffichage: '0.0%',
  categoriesRequises: ['loyers', 'etat_locatif'] as CategorieImport[],
  seuilVert: 25,
  seuilOrange: 35,
  seuilRouge: 50,
  tendancePositive: 'baisse',
  icone: 'PieChart',
};

export const KPI_CONCENTRATION_TOP10: KPIDefinition = {
  code: 'CONCENTRATION_TOP10',
  nom: 'Concentration Top 10',
  nomCourt: 'Top 10',
  description: 'Part des 10 premiers locataires dans les revenus',
  formule: 'TOP10 = (Loyers_Top10 / Loyers_Totaux) × 100',
  unite: '%',
  formatAffichage: '0.0%',
  categoriesRequises: ['loyers', 'etat_locatif'] as CategorieImport[],
  seuilVert: 40,
  seuilOrange: 55,
  seuilRouge: 70,
  tendancePositive: 'baisse',
  icone: 'PieChart',
};

export const KPI_DIVERSITE_ACTIVITES: KPIDefinition = {
  code: 'DIVERSITE_ACTIVITES',
  nom: 'Diversité des Activités',
  nomCourt: 'Diversité',
  description: 'Nombre de catégories d\'activités représentées',
  formule: 'DIVERSITE = Count(Distinct(Activités))',
  unite: 'nombre',
  formatAffichage: '0',
  categoriesRequises: ['etat_locatif'] as CategorieImport[],
  tendancePositive: 'hausse',
  icone: 'Layers',
};

export const KPI_RATIO_ANCRES: KPIDefinition = {
  code: 'RATIO_ANCRES',
  nom: 'Ratio Locomotives',
  nomCourt: 'Locomotives',
  description: 'Part des locomotives dans la surface totale',
  formule: 'ANCRES = (Surface_Locomotives / GLA_Total) × 100',
  unite: '%',
  formatAffichage: '0.0%',
  categoriesRequises: ['etat_locatif'] as CategorieImport[],
  tendancePositive: 'hausse',
  icone: 'Store',
};

// ===========================================
// KPIs - VALORISATION
// ===========================================

export const KPI_VALEUR_ACTIF: KPIDefinition = {
  code: 'VALEUR_ACTIF',
  nom: 'Valeur de l\'Actif',
  nomCourt: 'Valeur',
  description: 'Valeur vénale estimée de l\'actif',
  formule: 'VALEUR = Dernière_Valorisation',
  unite: 'EUR',
  formatAffichage: '0,0 €',
  categoriesRequises: ['valorisation'] as CategorieImport[],
  tendancePositive: 'hausse',
  icone: 'Landmark',
};

export const KPI_VALEUR_M2: KPIDefinition = {
  code: 'VALEUR_M2',
  nom: 'Valeur par m²',
  nomCourt: 'Valeur/m²',
  description: 'Valeur de l\'actif rapportée à la surface',
  formule: 'VALEUR_M2 = Valeur_Actif / GLA_Total',
  unite: 'EUR/m2',
  formatAffichage: '0 €/m²',
  categoriesRequises: ['valorisation', 'surface'] as CategorieImport[],
  tendancePositive: 'hausse',
  icone: 'LayoutGrid',
};

// ===========================================
// EXPORT - Toutes les definitions
// ===========================================

export const ALL_KPI_DEFINITIONS: Record<string, KPIDefinition> = {
  // Performance Financière
  NOI: KPI_NOI,
  NOI_M2: KPI_NOI_M2,
  YIELD_BRUT: KPI_YIELD_BRUT,
  YIELD_NET: KPI_YIELD_NET,
  // Baux et Durées
  WAULT: KPI_WAULT,
  WALB: KPI_WALB,
  // Occupation
  TAUX_OCCUPATION_PHYSIQUE: KPI_TAUX_OCCUPATION_PHYSIQUE,
  TAUX_OCCUPATION_FINANCIER: KPI_TAUX_OCCUPATION_FINANCIER,
  TAUX_VACANCE: KPI_TAUX_VACANCE,
  // Loyers et CA
  TAUX_EFFORT: KPI_TAUX_EFFORT,
  TAUX_EFFORT_MOYEN: KPI_TAUX_EFFORT_MOYEN,
  REVERSION: KPI_REVERSION,
  LOYER_MOYEN_M2: KPI_LOYER_MOYEN_M2,
  LOYER_TOTAL: KPI_LOYER_TOTAL,
  // Charges
  CHARGES_TOTALES: KPI_CHARGES_TOTALES,
  CHARGES_M2: KPI_CHARGES_M2,
  TAUX_REFACTURATION: KPI_TAUX_REFACTURATION,
  // Chiffre d'Affaires
  CA_TOTAL: KPI_CA_TOTAL,
  CA_M2: KPI_CA_M2,
  CA_VISITEUR: KPI_CA_VISITEUR,
  // Fréquentation
  FREQUENTATION_TOTALE: KPI_FREQUENTATION_TOTALE,
  FREQUENTATION_JOUR_MOYEN: KPI_FREQUENTATION_JOUR_MOYEN,
  TAUX_TRANSFORMATION: KPI_TAUX_TRANSFORMATION,
  PANIER_MOYEN: KPI_PANIER_MOYEN,
  // Recouvrement
  TAUX_RECOUVREMENT: KPI_TAUX_RECOUVREMENT,
  DSO: KPI_DSO,
  // Concentration
  CONCENTRATION_TOP5: KPI_CONCENTRATION_TOP5,
  CONCENTRATION_TOP10: KPI_CONCENTRATION_TOP10,
  DIVERSITE_ACTIVITES: KPI_DIVERSITE_ACTIVITES,
  RATIO_ANCRES: KPI_RATIO_ANCRES,
  // Valorisation
  VALEUR_ACTIF: KPI_VALEUR_ACTIF,
  VALEUR_M2: KPI_VALEUR_M2,
};

// ===========================================
// GROUPES DE KPIs PAR CATEGORIE
// ===========================================

export const KPI_GROUPS = {
  performance_financiere: ['NOI', 'NOI_M2', 'YIELD_BRUT', 'YIELD_NET'],
  baux_durees: ['WAULT', 'WALB'],
  occupation: ['TAUX_OCCUPATION_PHYSIQUE', 'TAUX_OCCUPATION_FINANCIER', 'TAUX_VACANCE'],
  loyers: ['TAUX_EFFORT', 'TAUX_EFFORT_MOYEN', 'REVERSION', 'LOYER_MOYEN_M2', 'LOYER_TOTAL'],
  charges: ['CHARGES_TOTALES', 'CHARGES_M2', 'TAUX_REFACTURATION'],
  chiffre_affaires: ['CA_TOTAL', 'CA_M2', 'CA_VISITEUR'],
  frequentation: ['FREQUENTATION_TOTALE', 'FREQUENTATION_JOUR_MOYEN', 'TAUX_TRANSFORMATION', 'PANIER_MOYEN'],
  recouvrement: ['TAUX_RECOUVREMENT', 'DSO'],
  concentration: ['CONCENTRATION_TOP5', 'CONCENTRATION_TOP10', 'DIVERSITE_ACTIVITES', 'RATIO_ANCRES'],
  valorisation: ['VALEUR_ACTIF', 'VALEUR_M2'],
} as const;

export const KPI_GROUP_LABELS: Record<keyof typeof KPI_GROUPS, string> = {
  performance_financiere: 'Performance Financière',
  baux_durees: 'Baux et Durées',
  occupation: 'Occupation',
  loyers: 'Loyers',
  charges: 'Charges',
  chiffre_affaires: 'Chiffre d\'Affaires',
  frequentation: 'Fréquentation',
  recouvrement: 'Recouvrement',
  concentration: 'Concentration & Diversité',
  valorisation: 'Valorisation',
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

export function getKPIDefinition(code: string): KPIDefinition | undefined {
  return ALL_KPI_DEFINITIONS[code];
}

export function getKPIsByCategory(category: CategorieImport): KPIDefinition[] {
  return Object.values(ALL_KPI_DEFINITIONS).filter(
    kpi => kpi.categoriesRequises.includes(category)
  );
}

export function getKPIsByGroup(group: keyof typeof KPI_GROUPS): KPIDefinition[] {
  return KPI_GROUPS[group].map(code => ALL_KPI_DEFINITIONS[code]).filter(Boolean);
}

export function getStatutFromValue(
  kpi: KPIDefinition,
  value: number
): 'vert' | 'orange' | 'rouge' {
  if (kpi.seuilVert === undefined) return 'vert';

  if (kpi.tendancePositive === 'hausse') {
    if (value >= kpi.seuilVert) return 'vert';
    if (kpi.seuilOrange && value >= kpi.seuilOrange) return 'orange';
    return 'rouge';
  } else {
    if (value <= kpi.seuilVert) return 'vert';
    if (kpi.seuilOrange && value <= kpi.seuilOrange) return 'orange';
    return 'rouge';
  }
}
