// ============================================
// TYPES CONFORMITÉ SYSCOHADA
// Plan Comptable Système OHADA
// Conformément au Cahier des Charges v1.1
// ============================================

// --- Classe de compte ---
export type ClasseCompte = '6' | '7';

// --- Structure d'un compte SYSCOHADA ---
export interface CompteSYSCOHADA {
  code: string;
  libelle: string;
  classe: ClasseCompte;
  nature: 'charge' | 'produit';
  type: 'exploitation' | 'personnel' | 'financier' | 'hao';
  parent?: string; // Code du compte parent
  niveau: 1 | 2 | 3 | 4; // Niveau dans la hiérarchie
  usageCockpit?: string; // Description de l'usage dans le contexte centres commerciaux
}

// --- Plan comptable SYSCOHADA - Classe 6 (Charges) ---
export const COMPTES_CHARGES: CompteSYSCOHADA[] = [
  // Achats
  { code: '60', libelle: 'Achats', classe: '6', nature: 'charge', type: 'exploitation', niveau: 1 },
  { code: '601', libelle: 'Achats stockés', classe: '6', nature: 'charge', type: 'exploitation', parent: '60', niveau: 2, usageCockpit: 'Consommables, fournitures' },
  { code: '604', libelle: "Achats d'études et prestations", classe: '6', nature: 'charge', type: 'exploitation', parent: '60', niveau: 2, usageCockpit: 'Études, consulting' },
  { code: '605', libelle: 'Autres achats', classe: '6', nature: 'charge', type: 'exploitation', parent: '60', niveau: 2, usageCockpit: 'Achats divers' },
  { code: '6051', libelle: 'Fournitures non stockables', classe: '6', nature: 'charge', type: 'exploitation', parent: '605', niveau: 3, usageCockpit: 'Eau, électricité, carburant' },
  { code: '6052', libelle: "Fournitures d'entretien", classe: '6', nature: 'charge', type: 'exploitation', parent: '605', niveau: 3, usageCockpit: 'Produits nettoyage' },
  { code: '6056', libelle: 'Achats de petit matériel', classe: '6', nature: 'charge', type: 'exploitation', parent: '605', niveau: 3, usageCockpit: 'Équipements < seuil' },

  // Transports
  { code: '61', libelle: 'Transports', classe: '6', nature: 'charge', type: 'exploitation', niveau: 1 },
  { code: '612', libelle: 'Transports sur achats', classe: '6', nature: 'charge', type: 'exploitation', parent: '61', niveau: 2, usageCockpit: 'Livraisons' },
  { code: '613', libelle: 'Transports pour le compte de tiers', classe: '6', nature: 'charge', type: 'exploitation', parent: '61', niveau: 2, usageCockpit: 'Transport clients' },

  // Services extérieurs A
  { code: '62', libelle: 'Services extérieurs A', classe: '6', nature: 'charge', type: 'exploitation', niveau: 1 },
  { code: '621', libelle: 'Sous-traitance', classe: '6', nature: 'charge', type: 'exploitation', parent: '62', niveau: 2 },
  { code: '6211', libelle: 'Sous-traitance générale', classe: '6', nature: 'charge', type: 'exploitation', parent: '621', niveau: 3, usageCockpit: 'Maintenance externalisée' },
  { code: '622', libelle: 'Locations et charges locatives', classe: '6', nature: 'charge', type: 'exploitation', parent: '62', niveau: 2, usageCockpit: 'Locations équipements' },
  { code: '623', libelle: 'Publicité, publications, relations publiques', classe: '6', nature: 'charge', type: 'exploitation', parent: '62', niveau: 2 },
  { code: '6231', libelle: 'Publicité, publications', classe: '6', nature: 'charge', type: 'exploitation', parent: '623', niveau: 3, usageCockpit: 'Marketing' },
  { code: '624', libelle: 'Entretien et réparations', classe: '6', nature: 'charge', type: 'exploitation', parent: '62', niveau: 2, usageCockpit: 'Maintenance' },
  { code: '625', libelle: "Primes d'assurance", classe: '6', nature: 'charge', type: 'exploitation', parent: '62', niveau: 2, usageCockpit: 'Assurances' },
  { code: '626', libelle: 'Études, recherches', classe: '6', nature: 'charge', type: 'exploitation', parent: '62', niveau: 2, usageCockpit: 'Études marché' },
  { code: '627', libelle: 'Publicité, relations publiques', classe: '6', nature: 'charge', type: 'exploitation', parent: '62', niveau: 2, usageCockpit: 'Communication' },
  { code: '628', libelle: 'Frais divers', classe: '6', nature: 'charge', type: 'exploitation', parent: '62', niveau: 2, usageCockpit: 'Autres services' },

  // Services extérieurs B
  { code: '63', libelle: 'Services extérieurs B', classe: '6', nature: 'charge', type: 'exploitation', niveau: 1 },
  { code: '631', libelle: 'Frais bancaires', classe: '6', nature: 'charge', type: 'exploitation', parent: '63', niveau: 2, usageCockpit: 'Services bancaires' },

  // Impôts et taxes
  { code: '64', libelle: 'Impôts et taxes', classe: '6', nature: 'charge', type: 'exploitation', niveau: 1 },
  { code: '641', libelle: 'Impôts et taxes directs', classe: '6', nature: 'charge', type: 'exploitation', parent: '64', niveau: 2, usageCockpit: 'Patente, foncier' },
  { code: '646', libelle: "Droits d'enregistrement", classe: '6', nature: 'charge', type: 'exploitation', parent: '64', niveau: 2, usageCockpit: 'Droits légaux' },

  // Autres charges
  { code: '65', libelle: 'Autres charges', classe: '6', nature: 'charge', type: 'exploitation', niveau: 1 },

  // Charges de personnel
  { code: '66', libelle: 'Charges de personnel', classe: '6', nature: 'charge', type: 'personnel', niveau: 1 },
  { code: '661', libelle: 'Rémunérations du personnel', classe: '6', nature: 'charge', type: 'personnel', parent: '66', niveau: 2, usageCockpit: 'Salaires' },
  { code: '664', libelle: 'Charges sociales', classe: '6', nature: 'charge', type: 'personnel', parent: '66', niveau: 2, usageCockpit: 'CNPS, etc.' },
  { code: '668', libelle: 'Autres charges sociales', classe: '6', nature: 'charge', type: 'personnel', parent: '66', niveau: 2, usageCockpit: 'Avantages' },

  // Charges financières
  { code: '67', libelle: 'Frais financiers', classe: '6', nature: 'charge', type: 'financier', niveau: 1 },
  { code: '671', libelle: 'Intérêts des emprunts', classe: '6', nature: 'charge', type: 'financier', parent: '67', niveau: 2, usageCockpit: 'Frais financiers' },

  // Charges HAO
  { code: '68', libelle: 'Dotations aux amortissements', classe: '6', nature: 'charge', type: 'hao', niveau: 1 },
];

// --- Plan comptable SYSCOHADA - Classe 7 (Produits) ---
export const COMPTES_PRODUITS: CompteSYSCOHADA[] = [
  // Ventes
  { code: '70', libelle: 'Ventes', classe: '7', nature: 'produit', type: 'exploitation', niveau: 1 },
  { code: '704', libelle: 'Prestations de services', classe: '7', nature: 'produit', type: 'exploitation', parent: '70', niveau: 2, usageCockpit: 'Revenus marketing, services' },
  { code: '707', libelle: 'Produits accessoires', classe: '7', nature: 'produit', type: 'exploitation', parent: '70', niveau: 2 },
  { code: '7071', libelle: 'Locations', classe: '7', nature: 'produit', type: 'exploitation', parent: '707', niveau: 3, usageCockpit: 'Loyers perçus' },
  { code: '7073', libelle: 'Charges locatives refacturées', classe: '7', nature: 'produit', type: 'exploitation', parent: '707', niveau: 3, usageCockpit: 'Charges récupérées' },

  // Autres produits
  { code: '75', libelle: 'Autres produits', classe: '7', nature: 'produit', type: 'exploitation', niveau: 1 },
  { code: '758', libelle: 'Produits divers', classe: '7', nature: 'produit', type: 'exploitation', parent: '75', niveau: 2, usageCockpit: 'Recettes diverses' },

  // Produits financiers
  { code: '77', libelle: 'Produits financiers', classe: '7', nature: 'produit', type: 'financier', niveau: 1 },
  { code: '771', libelle: 'Intérêts de prêts', classe: '7', nature: 'produit', type: 'financier', parent: '77', niveau: 2, usageCockpit: 'Produits financiers' },
];

// --- Tous les comptes ---
export const TOUS_COMPTES_SYSCOHADA: CompteSYSCOHADA[] = [
  ...COMPTES_CHARGES,
  ...COMPTES_PRODUITS,
];

// --- Mapping automatique catégorie → compte ---
export interface MappingCategorieCompte {
  categorie: string;
  codeCompte: string;
  confiance: number; // 0-100
}

export const MAPPING_CATEGORIES_DEFAUT: MappingCategorieCompte[] = [
  { categorie: 'Électricité', codeCompte: '6051', confiance: 95 },
  { categorie: 'Eau', codeCompte: '6051', confiance: 95 },
  { categorie: 'Nettoyage', codeCompte: '6211', confiance: 90 },
  { categorie: 'Sécurité', codeCompte: '6211', confiance: 90 },
  { categorie: 'Publicité', codeCompte: '6271', confiance: 90 },
  { categorie: 'Marketing', codeCompte: '6231', confiance: 90 },
  { categorie: 'Assurance', codeCompte: '625', confiance: 95 },
  { categorie: 'Entretien technique', codeCompte: '624', confiance: 95 },
  { categorie: 'Maintenance', codeCompte: '624', confiance: 90 },
  { categorie: 'Loyers équipements', codeCompte: '622', confiance: 90 },
  { categorie: 'Frais bancaires', codeCompte: '631', confiance: 95 },
  { categorie: 'Salaires', codeCompte: '661', confiance: 95 },
  { categorie: 'Charges sociales', codeCompte: '664', confiance: 95 },
  { categorie: 'Patente', codeCompte: '641', confiance: 95 },
  { categorie: 'Taxe foncière', codeCompte: '641', confiance: 95 },
  { categorie: 'Études', codeCompte: '626', confiance: 85 },
  { categorie: 'Consulting', codeCompte: '604', confiance: 85 },
  { categorie: 'Intérêts emprunt', codeCompte: '671', confiance: 95 },
];

// --- Configuration comptable centre ---
export interface ConfigurationComptable {
  planComptable: 'syscohada_2017' | 'syscohada_original';
  devise: string;
  exerciceFiscal: {
    moisDebut: number;
    moisFin: number;
  };
  exerciceEnCours: number;
  seuilImmobilisation: number;
  tauxTVA: number;
  gererTVADeductible: boolean;
  mappingsCategoriesPersonnalises: MappingCategorieCompte[];
}

// --- Balance des charges ---
export interface LigneBalance {
  compte: string;
  libelle: string;
  debit: number;
  credit: number;
  solde: number;
}

export interface BalanceCharges {
  periode: {
    debut: string;
    fin: string;
  };
  centreId: string;
  lignes: LigneBalance[];
  totalDebit: number;
  totalCredit: number;
  resultat: number;
}

// --- État des charges par nature ---
export interface EtatChargesNature {
  periode: {
    debut: string;
    fin: string;
  };
  centreId: string;
  chargesExploitation: number; // 60-65
  chargesPersonnel: number; // 66
  chargesFinancieres: number; // 67
  chargesHAO: number; // 68
  totalCharges: number;
  details: Array<{
    code: string;
    libelle: string;
    montant: number;
  }>;
}

// --- Rapprochement comptabilité ---
export interface RapprochementComptable {
  id: string;
  centreId: string;
  periode: string;
  dateRapprochement: string;
  montantCockpit: number;
  montantComptabilite: number;
  ecart: number;
  ecartPourcentage: number;
  statut: 'rapproche' | 'ecart_accepte' | 'ecart_a_analyser';
  commentaire?: string;
  piecesJustificatives: string[];
}

// --- Export comptable ---
export interface ExportComptable {
  format: 'excel' | 'csv' | 'cfonb';
  periode: {
    debut: string;
    fin: string;
  };
  centreId: string;
  inclureDetails: boolean;
  inclureReferences: boolean;
  separateurDecimal: ',' | '.';
  encodage: 'utf-8' | 'iso-8859-1';
}

// --- Fonctions utilitaires ---
export function getCompteByCode(code: string): CompteSYSCOHADA | undefined {
  return TOUS_COMPTES_SYSCOHADA.find(c => c.code === code);
}

export function getComptesParClasse(classe: ClasseCompte): CompteSYSCOHADA[] {
  return TOUS_COMPTES_SYSCOHADA.filter(c => c.classe === classe);
}

export function getComptesParType(type: CompteSYSCOHADA['type']): CompteSYSCOHADA[] {
  return TOUS_COMPTES_SYSCOHADA.filter(c => c.type === type);
}

export function getSousComptes(codeParent: string): CompteSYSCOHADA[] {
  return TOUS_COMPTES_SYSCOHADA.filter(c => c.parent === codeParent);
}

export function getMappingPourCategorie(categorie: string): MappingCategorieCompte | undefined {
  return MAPPING_CATEGORIES_DEFAUT.find(m =>
    m.categorie.toLowerCase() === categorie.toLowerCase()
  );
}
