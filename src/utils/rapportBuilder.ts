/**
 * Rapport Builder - Construction de structure de rapports
 * Génère des rapports à partir de templates et de données
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  RapportGenere,
  SectionRapport,
  BlocContenu,
  TypeBloc,
  TypeRapport,
  ConfigRapport,
  ResultatKPI,
  Insight,
  AlerteDeclenche,
  Prediction
} from '../types/bi';
import { CATALOGUE_RAPPORTS, PACKS_RAPPORTS } from '../data/catalogueRapports';
import { calculerKPI, calculerTousKPIs } from './kpiCalculations';

// ============================================================================
// TYPES BUILDER
// ============================================================================

interface DonneesRapport {
  centreId: string;
  centreNom: string;
  periode: {
    debut: Date;
    fin: Date;
  };
  etatLocatif?: EtatLocatifData[];
  loyers?: LoyerData[];
  frequentation?: FrequentationData[];
  chiffreAffaires?: CAData[];
  charges?: ChargeData[];
  baux?: BailData[];
  travaux?: TravauxData[];
  valorisation?: ValorisationData[];
  kpis?: ResultatKPI[];
  insights?: Insight[];
  alertes?: AlerteDeclenche[];
  predictions?: Prediction[];
}

interface EtatLocatifData {
  locataire: string;
  lot: string;
  surface: number;
  loyerAnnuel: number;
  chargesAnnuelles: number;
  dateDebut: Date;
  dateFin: Date;
  statut: string;
}

interface LoyerData {
  mois: string;
  montantFacture: number;
  montantEncaisse: number;
  ecart: number;
}

interface FrequentationData {
  date: Date;
  visiteurs: number;
  tauxConversion?: number;
}

interface CAData {
  enseigne: string;
  mois: string;
  montant: number;
  variation?: number;
}

interface ChargeData {
  categorie: string;
  montant: number;
  budget: number;
  ecart: number;
}

interface BailData {
  locataire: string;
  dateEcheance: Date;
  typeEcheance: string;
  surface: number;
  loyerActuel: number;
}

interface TravauxData {
  projet: string;
  statut: string;
  budget: number;
  depense: number;
  dateFinPrevue: Date;
}

interface ValorisationData {
  date: Date;
  valeur: number;
  methode: string;
}

interface OptionsBuilder {
  inclureKPIs?: boolean;
  inclureGraphiques?: boolean;
  inclureInsights?: boolean;
  inclureAlertes?: boolean;
  incluirePredictions?: boolean;
  inclureTableauxDetailles?: boolean;
  niveauDetail?: 'resume' | 'standard' | 'detaille';
}

// ============================================================================
// BUILDER PRINCIPAL
// ============================================================================

/**
 * Construit un rapport complet à partir d'un type et de données
 */
export function construireRapport(
  typeRapport: TypeRapport,
  donnees: DonneesRapport,
  options: OptionsBuilder = {}
): RapportGenere {
  const configCatalogue = CATALOGUE_RAPPORTS[typeRapport];

  if (!configCatalogue) {
    throw new Error(`Type de rapport inconnu: ${typeRapport}`);
  }

  const optionsDefaut: OptionsBuilder = {
    inclureKPIs: true,
    inclureGraphiques: true,
    inclureInsights: true,
    inclureAlertes: true,
    incluirePredictions: false,
    inclureTableauxDetailles: true,
    niveauDetail: 'standard',
    ...options
  };

  // Construire les sections
  const sections = construireSections(configCatalogue, donnees, optionsDefaut);

  const rapport: RapportGenere = {
    id: uuidv4(),
    titre: `${configCatalogue.nom} - ${donnees.centreNom}`,
    typeRapport,
    centreId: donnees.centreId,
    periode: donnees.periode,
    sections,
    statut: 'brouillon',
    version: 1,
    dateCreation: new Date(),
    dateModification: new Date(),
    auteurId: 'system'
  };

  return rapport;
}

/**
 * Construit un rapport à partir d'un pack prédéfini
 */
export function construireRapportPack(
  packId: string,
  donnees: DonneesRapport,
  options: OptionsBuilder = {}
): RapportGenere[] {
  const pack = PACKS_RAPPORTS.find(p => p.id === packId);

  if (!pack) {
    throw new Error(`Pack de rapports inconnu: ${packId}`);
  }

  return pack.rapportsInclus.map(typeRapport =>
    construireRapport(typeRapport, donnees, options)
  );
}

// ============================================================================
// CONSTRUCTION DES SECTIONS
// ============================================================================

function construireSections(
  config: ConfigRapport,
  donnees: DonneesRapport,
  options: OptionsBuilder
): SectionRapport[] {
  const sections: SectionRapport[] = [];

  // Section résumé exécutif
  sections.push(construireSectionResume(config, donnees, options));

  // Sections spécifiques au type de rapport
  for (const sectionConfig of config.sections) {
    const section = construireSection(sectionConfig, donnees, options);
    if (section.blocs.length > 0) {
      sections.push(section);
    }
  }

  // Section insights et alertes si demandé
  if (options.inclureInsights || options.inclureAlertes) {
    const sectionAnalyse = construireSectionAnalyse(donnees, options);
    if (sectionAnalyse.blocs.length > 0) {
      sections.push(sectionAnalyse);
    }
  }

  // Section prédictions si demandé
  if (options.incluirePredictions && donnees.predictions?.length) {
    sections.push(construireSectionPredictions(donnees));
  }

  return sections;
}

function construireSectionResume(
  config: ConfigRapport,
  donnees: DonneesRapport,
  options: OptionsBuilder
): SectionRapport {
  const blocs: BlocContenu[] = [];

  // Paragraphe d'introduction
  blocs.push(creerBlocParagraphe(
    `Ce rapport présente ${config.description.toLowerCase()} pour ${donnees.centreNom} ` +
    `sur la période du ${formatDate(donnees.periode.debut)} au ${formatDate(donnees.periode.fin)}.`
  ));

  // KPIs principaux
  if (options.inclureKPIs && config.kpisPrincipaux.length > 0) {
    const kpisCalcules = donnees.kpis || calculerKPIsPourRapport(config.kpisPrincipaux, donnees);
    const kpisPrincipaux = kpisCalcules.filter(k => config.kpisPrincipaux.includes(k.code));

    if (kpisPrincipaux.length > 0) {
      blocs.push(creerBlocKPICard(kpisPrincipaux.slice(0, 4)));
    }
  }

  // Alertes critiques
  if (options.inclureAlertes && donnees.alertes?.length) {
    const alertesCritiques = donnees.alertes.filter(a => a.severite === 'critique');
    if (alertesCritiques.length > 0) {
      blocs.push(creerBlocAlerte('error', `${alertesCritiques.length} alerte(s) critique(s) détectée(s)`));
    }
  }

  return {
    id: uuidv4(),
    titre: 'Résumé Exécutif',
    ordre: 0,
    blocs
  };
}

function construireSection(
  sectionConfig: { titre: string; contenu: string[] },
  donnees: DonneesRapport,
  options: OptionsBuilder
): SectionRapport {
  const blocs: BlocContenu[] = [];

  for (const contenuType of sectionConfig.contenu) {
    const blocsContenu = genererBlocsContenu(contenuType, donnees, options);
    blocs.push(...blocsContenu);
  }

  return {
    id: uuidv4(),
    titre: sectionConfig.titre,
    ordre: 0,
    blocs
  };
}

function construireSectionAnalyse(
  donnees: DonneesRapport,
  options: OptionsBuilder
): SectionRapport {
  const blocs: BlocContenu[] = [];

  // Insights
  if (options.inclureInsights && donnees.insights?.length) {
    blocs.push(creerBlocParagraphe('Points d\'attention identifiés automatiquement :'));

    const insightsItems = donnees.insights
      .sort((a, b) => {
        const priorites = { haute: 0, moyenne: 1, basse: 2 };
        return priorites[a.priorite] - priorites[b.priorite];
      })
      .slice(0, 5)
      .map(i => `[${i.priorite.toUpperCase()}] ${i.titre}: ${i.description}`);

    blocs.push(creerBlocListe(insightsItems));
  }

  // Alertes
  if (options.inclureAlertes && donnees.alertes?.length) {
    blocs.push(creerBlocSeparateur());
    blocs.push(creerBlocParagraphe('Alertes actives :'));

    for (const alerte of donnees.alertes.slice(0, 5)) {
      const typeAlerte = alerte.severite === 'critique' ? 'error' :
        alerte.severite === 'haute' ? 'warning' : 'info';
      blocs.push(creerBlocAlerte(typeAlerte, `${alerte.titre}: ${alerte.message}`));
    }
  }

  return {
    id: uuidv4(),
    titre: 'Analyse et Alertes',
    ordre: 99,
    blocs
  };
}

function construireSectionPredictions(donnees: DonneesRapport): SectionRapport {
  const blocs: BlocContenu[] = [];

  blocs.push(creerBlocParagraphe(
    'Projections basées sur les tendances historiques. Ces prévisions sont indicatives ' +
    'et doivent être interprétées avec précaution.'
  ));

  if (donnees.predictions) {
    const tableauData = {
      headers: ['Indicateur', 'Valeur actuelle', 'Prévision 3 mois', 'Tendance', 'Confiance'],
      rows: donnees.predictions.map(p => [
        p.indicateur,
        formaterValeur(p.valeurActuelle),
        formaterValeur(p.valeursPredites[2] || p.valeursPredites[0]),
        p.tendance,
        `${(p.confiance * 100).toFixed(0)}%`
      ])
    };

    blocs.push(creerBlocTableau(tableauData.headers, tableauData.rows));
  }

  return {
    id: uuidv4(),
    titre: 'Prévisions',
    ordre: 100,
    blocs
  };
}

// ============================================================================
// GÉNÉRATION DE CONTENU
// ============================================================================

function genererBlocsContenu(
  contenuType: string,
  donnees: DonneesRapport,
  options: OptionsBuilder
): BlocContenu[] {
  const blocs: BlocContenu[] = [];

  switch (contenuType) {
    case 'etat_locatif':
      blocs.push(...genererBlocsEtatLocatif(donnees, options));
      break;

    case 'loyers':
      blocs.push(...genererBlocsLoyers(donnees, options));
      break;

    case 'frequentation':
      blocs.push(...genererBlocsFrequentation(donnees, options));
      break;

    case 'chiffre_affaires':
      blocs.push(...genererBlocsCA(donnees, options));
      break;

    case 'charges':
      blocs.push(...genererBlocsCharges(donnees, options));
      break;

    case 'echeances_baux':
      blocs.push(...genererBlocsEcheancesBaux(donnees, options));
      break;

    case 'travaux':
      blocs.push(...genererBlocsTravaux(donnees, options));
      break;

    case 'valorisation':
      blocs.push(...genererBlocsValorisation(donnees, options));
      break;

    case 'kpis':
      blocs.push(...genererBlocsKPIs(donnees, options));
      break;

    case 'graphique_evolution':
      if (options.inclureGraphiques) {
        blocs.push(creerBlocGraphique('line', { label: 'Évolution' }));
      }
      break;

    case 'graphique_repartition':
      if (options.inclureGraphiques) {
        blocs.push(creerBlocGraphique('pie', { label: 'Répartition' }));
      }
      break;

    case 'graphique_comparaison':
      if (options.inclureGraphiques) {
        blocs.push(creerBlocGraphique('bar', { label: 'Comparaison' }));
      }
      break;
  }

  return blocs;
}

function genererBlocsEtatLocatif(
  donnees: DonneesRapport,
  options: OptionsBuilder
): BlocContenu[] {
  const blocs: BlocContenu[] = [];

  if (!donnees.etatLocatif?.length) {
    blocs.push(creerBlocAlerte('info', 'Aucune donnée d\'état locatif disponible'));
    return blocs;
  }

  // Résumé
  const totalSurface = donnees.etatLocatif.reduce((sum, e) => sum + e.surface, 0);
  const surfaceOccupee = donnees.etatLocatif
    .filter(e => e.statut === 'occupe')
    .reduce((sum, e) => sum + e.surface, 0);
  const tauxOccupation = (surfaceOccupee / totalSurface) * 100;

  blocs.push(creerBlocParagraphe(
    `Surface totale: ${totalSurface.toLocaleString('fr-FR')} m² | ` +
    `Taux d'occupation: ${tauxOccupation.toFixed(1)}% | ` +
    `${donnees.etatLocatif.length} lots`
  ));

  // Tableau détaillé
  if (options.inclureTableauxDetailles) {
    const headers = ['Locataire', 'Lot', 'Surface (m²)', 'Loyer annuel (€)', 'Fin bail', 'Statut'];
    const rows = donnees.etatLocatif.map(e => [
      e.locataire,
      e.lot,
      e.surface,
      e.loyerAnnuel.toLocaleString('fr-FR'),
      formatDate(e.dateFin),
      e.statut
    ]);
    blocs.push(creerBlocTableau(headers, rows));
  }

  return blocs;
}

function genererBlocsLoyers(
  donnees: DonneesRapport,
  options: OptionsBuilder
): BlocContenu[] {
  const blocs: BlocContenu[] = [];

  if (!donnees.loyers?.length) {
    blocs.push(creerBlocAlerte('info', 'Aucune donnée de loyers disponible'));
    return blocs;
  }

  // Résumé
  const totalFacture = donnees.loyers.reduce((sum, l) => sum + l.montantFacture, 0);
  const totalEncaisse = donnees.loyers.reduce((sum, l) => sum + l.montantEncaisse, 0);
  const tauxRecouvrement = (totalEncaisse / totalFacture) * 100;

  blocs.push(creerBlocParagraphe(
    `Total facturé: ${totalFacture.toLocaleString('fr-FR')} € | ` +
    `Total encaissé: ${totalEncaisse.toLocaleString('fr-FR')} € | ` +
    `Taux de recouvrement: ${tauxRecouvrement.toFixed(1)}%`
  ));

  // Graphique évolution
  if (options.inclureGraphiques) {
    blocs.push(creerBlocGraphique('bar', {
      labels: donnees.loyers.map(l => l.mois),
      datasets: [
        { label: 'Facturé', data: donnees.loyers.map(l => l.montantFacture) },
        { label: 'Encaissé', data: donnees.loyers.map(l => l.montantEncaisse) }
      ]
    }));
  }

  // Tableau
  if (options.inclureTableauxDetailles) {
    const headers = ['Mois', 'Facturé (€)', 'Encaissé (€)', 'Écart (€)'];
    const rows = donnees.loyers.map(l => [
      l.mois,
      l.montantFacture.toLocaleString('fr-FR'),
      l.montantEncaisse.toLocaleString('fr-FR'),
      l.ecart.toLocaleString('fr-FR')
    ]);
    blocs.push(creerBlocTableau(headers, rows));
  }

  return blocs;
}

function genererBlocsFrequentation(
  donnees: DonneesRapport,
  options: OptionsBuilder
): BlocContenu[] {
  const blocs: BlocContenu[] = [];

  if (!donnees.frequentation?.length) {
    blocs.push(creerBlocAlerte('info', 'Aucune donnée de fréquentation disponible'));
    return blocs;
  }

  // Résumé
  const totalVisiteurs = donnees.frequentation.reduce((sum, f) => sum + f.visiteurs, 0);
  const moyenneJour = totalVisiteurs / donnees.frequentation.length;

  blocs.push(creerBlocParagraphe(
    `Total visiteurs: ${totalVisiteurs.toLocaleString('fr-FR')} | ` +
    `Moyenne journalière: ${Math.round(moyenneJour).toLocaleString('fr-FR')}`
  ));

  // Graphique évolution
  if (options.inclureGraphiques) {
    blocs.push(creerBlocGraphique('line', {
      labels: donnees.frequentation.map(f => formatDate(f.date)),
      datasets: [{ label: 'Visiteurs', data: donnees.frequentation.map(f => f.visiteurs) }]
    }));
  }

  return blocs;
}

function genererBlocsCA(
  donnees: DonneesRapport,
  options: OptionsBuilder
): BlocContenu[] {
  const blocs: BlocContenu[] = [];

  if (!donnees.chiffreAffaires?.length) {
    blocs.push(creerBlocAlerte('info', 'Aucune donnée de chiffre d\'affaires disponible'));
    return blocs;
  }

  // Résumé par enseigne
  const caParEnseigne = new Map<string, number>();
  donnees.chiffreAffaires.forEach(ca => {
    const total = caParEnseigne.get(ca.enseigne) || 0;
    caParEnseigne.set(ca.enseigne, total + ca.montant);
  });

  const totalCA = Array.from(caParEnseigne.values()).reduce((a, b) => a + b, 0);

  blocs.push(creerBlocParagraphe(
    `Chiffre d'affaires total: ${totalCA.toLocaleString('fr-FR')} € | ` +
    `${caParEnseigne.size} enseignes`
  ));

  // Graphique répartition
  if (options.inclureGraphiques) {
    blocs.push(creerBlocGraphique('pie', {
      labels: Array.from(caParEnseigne.keys()),
      data: Array.from(caParEnseigne.values())
    }));
  }

  // Tableau
  if (options.inclureTableauxDetailles) {
    const headers = ['Enseigne', 'CA Total (€)', '% du total'];
    const rows = Array.from(caParEnseigne.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([enseigne, ca]) => [
        enseigne,
        ca.toLocaleString('fr-FR'),
        `${((ca / totalCA) * 100).toFixed(1)}%`
      ]);
    blocs.push(creerBlocTableau(headers, rows));
  }

  return blocs;
}

function genererBlocsCharges(
  donnees: DonneesRapport,
  options: OptionsBuilder
): BlocContenu[] {
  const blocs: BlocContenu[] = [];

  if (!donnees.charges?.length) {
    blocs.push(creerBlocAlerte('info', 'Aucune donnée de charges disponible'));
    return blocs;
  }

  // Résumé
  const totalCharges = donnees.charges.reduce((sum, c) => sum + c.montant, 0);
  const totalBudget = donnees.charges.reduce((sum, c) => sum + c.budget, 0);
  const ecartTotal = totalCharges - totalBudget;

  blocs.push(creerBlocParagraphe(
    `Total charges: ${totalCharges.toLocaleString('fr-FR')} € | ` +
    `Budget: ${totalBudget.toLocaleString('fr-FR')} € | ` +
    `Écart: ${ecartTotal >= 0 ? '+' : ''}${ecartTotal.toLocaleString('fr-FR')} €`
  ));

  // Alerte si dépassement
  if (ecartTotal > totalBudget * 0.1) {
    blocs.push(creerBlocAlerte('warning', `Dépassement budgétaire de ${((ecartTotal / totalBudget) * 100).toFixed(1)}%`));
  }

  // Tableau
  if (options.inclureTableauxDetailles) {
    const headers = ['Catégorie', 'Réel (€)', 'Budget (€)', 'Écart (€)', 'Écart (%)'];
    const rows = donnees.charges.map(c => [
      c.categorie,
      c.montant.toLocaleString('fr-FR'),
      c.budget.toLocaleString('fr-FR'),
      c.ecart.toLocaleString('fr-FR'),
      `${((c.ecart / c.budget) * 100).toFixed(1)}%`
    ]);
    blocs.push(creerBlocTableau(headers, rows));
  }

  return blocs;
}

function genererBlocsEcheancesBaux(
  donnees: DonneesRapport,
  options: OptionsBuilder
): BlocContenu[] {
  const blocs: BlocContenu[] = [];

  if (!donnees.baux?.length) {
    blocs.push(creerBlocAlerte('info', 'Aucune échéance de bail à venir'));
    return blocs;
  }

  // Échéances prochaines (12 mois)
  const maintenant = new Date();
  const dans12Mois = new Date(maintenant);
  dans12Mois.setMonth(dans12Mois.getMonth() + 12);

  const echeancesProches = donnees.baux
    .filter(b => new Date(b.dateEcheance) <= dans12Mois)
    .sort((a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime());

  if (echeancesProches.length === 0) {
    blocs.push(creerBlocParagraphe('Aucune échéance de bail dans les 12 prochains mois.'));
    return blocs;
  }

  const surfaceConcernee = echeancesProches.reduce((sum, b) => sum + b.surface, 0);
  const loyerConcerne = echeancesProches.reduce((sum, b) => sum + b.loyerActuel, 0);

  blocs.push(creerBlocParagraphe(
    `${echeancesProches.length} échéance(s) dans les 12 prochains mois | ` +
    `Surface concernée: ${surfaceConcernee.toLocaleString('fr-FR')} m² | ` +
    `Loyer concerné: ${loyerConcerne.toLocaleString('fr-FR')} €/an`
  ));

  // Alertes pour échéances critiques (3 mois)
  const dans3Mois = new Date(maintenant);
  dans3Mois.setMonth(dans3Mois.getMonth() + 3);
  const echeancesCritiques = echeancesProches.filter(b => new Date(b.dateEcheance) <= dans3Mois);

  if (echeancesCritiques.length > 0) {
    blocs.push(creerBlocAlerte('warning',
      `${echeancesCritiques.length} échéance(s) dans les 3 prochains mois`
    ));
  }

  // Tableau
  if (options.inclureTableauxDetailles) {
    const headers = ['Locataire', 'Type', 'Échéance', 'Surface (m²)', 'Loyer (€/an)'];
    const rows = echeancesProches.map(b => [
      b.locataire,
      b.typeEcheance,
      formatDate(b.dateEcheance),
      b.surface.toLocaleString('fr-FR'),
      b.loyerActuel.toLocaleString('fr-FR')
    ]);
    blocs.push(creerBlocTableau(headers, rows));
  }

  return blocs;
}

function genererBlocsTravaux(
  donnees: DonneesRapport,
  options: OptionsBuilder
): BlocContenu[] {
  const blocs: BlocContenu[] = [];

  if (!donnees.travaux?.length) {
    blocs.push(creerBlocAlerte('info', 'Aucun projet de travaux en cours'));
    return blocs;
  }

  // Résumé
  const totalBudget = donnees.travaux.reduce((sum, t) => sum + t.budget, 0);
  const totalDepense = donnees.travaux.reduce((sum, t) => sum + t.depense, 0);
  const avancement = (totalDepense / totalBudget) * 100;

  blocs.push(creerBlocParagraphe(
    `${donnees.travaux.length} projet(s) | ` +
    `Budget total: ${totalBudget.toLocaleString('fr-FR')} € | ` +
    `Dépensé: ${totalDepense.toLocaleString('fr-FR')} € (${avancement.toFixed(1)}%)`
  ));

  // Tableau
  if (options.inclureTableauxDetailles) {
    const headers = ['Projet', 'Statut', 'Budget (€)', 'Dépensé (€)', 'Avancement', 'Fin prévue'];
    const rows = donnees.travaux.map(t => [
      t.projet,
      t.statut,
      t.budget.toLocaleString('fr-FR'),
      t.depense.toLocaleString('fr-FR'),
      `${((t.depense / t.budget) * 100).toFixed(0)}%`,
      formatDate(t.dateFinPrevue)
    ]);
    blocs.push(creerBlocTableau(headers, rows));
  }

  return blocs;
}

function genererBlocsValorisation(
  donnees: DonneesRapport,
  options: OptionsBuilder
): BlocContenu[] {
  const blocs: BlocContenu[] = [];

  if (!donnees.valorisation?.length) {
    blocs.push(creerBlocAlerte('info', 'Aucune donnée de valorisation disponible'));
    return blocs;
  }

  // Dernière valorisation
  const derniereValo = donnees.valorisation
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  blocs.push(creerBlocParagraphe(
    `Dernière valorisation: ${derniereValo.valeur.toLocaleString('fr-FR')} € ` +
    `(${derniereValo.methode}, ${formatDate(derniereValo.date)})`
  ));

  // Évolution si plusieurs valorisations
  if (donnees.valorisation.length > 1 && options.inclureGraphiques) {
    const valoTriees = [...donnees.valorisation]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    blocs.push(creerBlocGraphique('line', {
      labels: valoTriees.map(v => formatDate(v.date)),
      datasets: [{ label: 'Valorisation (€)', data: valoTriees.map(v => v.valeur) }]
    }));
  }

  return blocs;
}

function genererBlocsKPIs(
  donnees: DonneesRapport,
  _options: OptionsBuilder
): BlocContenu[] {
  const blocs: BlocContenu[] = [];

  const kpis = donnees.kpis || [];

  if (kpis.length === 0) {
    blocs.push(creerBlocAlerte('info', 'Aucun KPI calculé disponible'));
    return blocs;
  }

  // Grouper par catégorie
  const kpisParCategorie = new Map<string, ResultatKPI[]>();
  kpis.forEach(kpi => {
    const cat = kpi.categorie || 'Autres';
    const liste = kpisParCategorie.get(cat) || [];
    liste.push(kpi);
    kpisParCategorie.set(cat, liste);
  });

  // Bloc KPI pour chaque catégorie
  for (const [categorie, kpisCategorie] of kpisParCategorie) {
    blocs.push(creerBlocParagraphe(`**${categorie}**`));
    blocs.push(creerBlocKPICard(kpisCategorie.slice(0, 4)));
  }

  return blocs;
}

// ============================================================================
// CRÉATEURS DE BLOCS
// ============================================================================

function creerBlocParagraphe(texte: string): BlocContenu {
  return {
    id: uuidv4(),
    type: 'paragraphe',
    contenu: { texte },
    ordre: 0
  };
}

function creerBlocTableau(headers: string[], rows: (string | number)[][]): BlocContenu {
  return {
    id: uuidv4(),
    type: 'tableau',
    contenu: { headers, rows },
    ordre: 0
  };
}

function creerBlocGraphique(type: string, data: unknown): BlocContenu {
  return {
    id: uuidv4(),
    type: 'graphique',
    contenu: { type, data },
    ordre: 0
  };
}

function creerBlocKPICard(kpis: ResultatKPI[]): BlocContenu {
  return {
    id: uuidv4(),
    type: 'kpi_card',
    contenu: { kpis },
    ordre: 0
  };
}

function creerBlocListe(items: string[], style: 'bullet' | 'number' = 'bullet'): BlocContenu {
  return {
    id: uuidv4(),
    type: 'liste',
    contenu: { items, style },
    ordre: 0
  };
}

function creerBlocSeparateur(): BlocContenu {
  return {
    id: uuidv4(),
    type: 'separateur',
    contenu: {},
    ordre: 0
  };
}

function creerBlocAlerte(
  type: 'info' | 'warning' | 'error' | 'success',
  message: string
): BlocContenu {
  return {
    id: uuidv4(),
    type: 'alerte',
    contenu: { type, message },
    ordre: 0
  };
}

// ============================================================================
// UTILITAIRES
// ============================================================================

function calculerKPIsPourRapport(
  codesKPIs: string[],
  donnees: DonneesRapport
): ResultatKPI[] {
  const resultats: ResultatKPI[] = [];

  // Construire les données nécessaires pour le calcul
  const dataCalc = {
    etatLocatif: donnees.etatLocatif || [],
    loyers: donnees.loyers || [],
    charges: donnees.charges || [],
    valorisation: donnees.valorisation || []
  };

  for (const code of codesKPIs) {
    try {
      const resultat = calculerKPI(code, dataCalc);
      if (resultat) {
        resultats.push(resultat);
      }
    } catch {
      // KPI non calculable avec les données disponibles
    }
  }

  return resultats;
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formaterValeur(valeur: number): string {
  if (Math.abs(valeur) >= 1000000) {
    return `${(valeur / 1000000).toFixed(1)} M`;
  }
  if (Math.abs(valeur) >= 1000) {
    return `${(valeur / 1000).toFixed(1)} k`;
  }
  return valeur.toFixed(2);
}

// ============================================================================
// TEMPLATES RAPIDES
// ============================================================================

/**
 * Crée un rapport vide avec structure de base
 */
export function creerRapportVide(
  titre: string,
  typeRapport: TypeRapport,
  centreId: string
): RapportGenere {
  return {
    id: uuidv4(),
    titre,
    typeRapport,
    centreId,
    periode: {
      debut: new Date(),
      fin: new Date()
    },
    sections: [
      {
        id: uuidv4(),
        titre: 'Introduction',
        ordre: 0,
        blocs: [
          creerBlocParagraphe('Contenu du rapport à rédiger...')
        ]
      }
    ],
    statut: 'brouillon',
    version: 1,
    dateCreation: new Date(),
    dateModification: new Date(),
    auteurId: 'system'
  };
}

/**
 * Clone un rapport existant
 */
export function clonerRapport(rapport: RapportGenere, nouveauTitre?: string): RapportGenere {
  const clone = JSON.parse(JSON.stringify(rapport));

  // Nouveaux IDs
  clone.id = uuidv4();
  clone.titre = nouveauTitre || `Copie de ${rapport.titre}`;
  clone.statut = 'brouillon';
  clone.version = 1;
  clone.dateCreation = new Date();
  clone.dateModification = new Date();

  // Nouveaux IDs pour sections et blocs
  clone.sections.forEach((section: SectionRapport) => {
    section.id = uuidv4();
    section.blocs.forEach((bloc: BlocContenu) => {
      bloc.id = uuidv4();
    });
  });

  return clone;
}

/**
 * Fusionne plusieurs rapports en un seul
 */
export function fusionnerRapports(
  rapports: RapportGenere[],
  titreConsolide: string
): RapportGenere {
  if (rapports.length === 0) {
    throw new Error('Aucun rapport à fusionner');
  }

  const premier = rapports[0];
  const sections: SectionRapport[] = [];

  rapports.forEach((rapport, index) => {
    // Section de titre pour chaque rapport source
    sections.push({
      id: uuidv4(),
      titre: rapport.titre,
      ordre: index * 100,
      blocs: [
        creerBlocSeparateur(),
        ...rapport.sections.flatMap(s => s.blocs)
      ]
    });
  });

  return {
    id: uuidv4(),
    titre: titreConsolide,
    typeRapport: premier.typeRapport,
    centreId: premier.centreId,
    periode: premier.periode,
    sections,
    statut: 'brouillon',
    version: 1,
    dateCreation: new Date(),
    dateModification: new Date(),
    auteurId: 'system'
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { DonneesRapport, OptionsBuilder };
