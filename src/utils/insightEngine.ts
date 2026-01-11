// ============================================
// INSIGHT ENGINE - Détection de Patterns
// ============================================

import { v4 as uuidv4 } from 'uuid';
import type {
  Insight,
  TypeInsight,
  SeveriteInsight,
  ResultatKPI,
  EtatLocatif,
  DonneesBail,
  DonneesLoyer,
  DonneesChiffreAffaires,
  DonneesFrequentation,
} from '../types/bi';

// ===========================================
// TYPES
// ===========================================

export interface SeuilsInsight {
  concentrationTop5Critique: number;
  concentrationTop5Alerte: number;
  vacanceCritique: number;
  vacanceAlerte: number;
  waultCritique: number;
  waultAlerte: number;
  effortCritique: number;
  effortAlerte: number;
  recouvrementCritique: number;
  recouvrementAlerte: number;
  variationCACritique: number;
  variationCAAlerte: number;
  variationFreqCritique: number;
  variationFreqAlerte: number;
}

export interface DonneesInsight {
  centreId: string;
  resultatsKPI: ResultatKPI[];
  etatsLocatifs: EtatLocatif[];
  baux: DonneesBail[];
  loyers: DonneesLoyer[];
  chiffresAffaires: DonneesChiffreAffaires[];
  frequentation: DonneesFrequentation[];
  resultatsN1?: ResultatKPI[];
}

// ===========================================
// SEUILS PAR DEFAUT
// ===========================================

export const SEUILS_DEFAUT: SeuilsInsight = {
  concentrationTop5Critique: 60,
  concentrationTop5Alerte: 50,
  vacanceCritique: 15,
  vacanceAlerte: 10,
  waultCritique: 1.5,
  waultAlerte: 2.5,
  effortCritique: 15,
  effortAlerte: 12,
  recouvrementCritique: 90,
  recouvrementAlerte: 95,
  variationCACritique: -15,
  variationCAAlerte: -10,
  variationFreqCritique: -20,
  variationFreqAlerte: -10,
};

// ===========================================
// HELPER - Créer Insight
// ===========================================

function creerInsight(
  centreId: string,
  type: TypeInsight,
  severite: SeveriteInsight,
  titre: string,
  description: string,
  valeurActuelle: number,
  seuilReference: number,
  recommandations: string[],
  entitesImpactees: string[] = []
): Insight {
  const now = new Date().toISOString();

  const impact: 'faible' | 'moyen' | 'eleve' | 'critique' =
    severite === 'critique' ? 'critique' :
    severite === 'alerte' ? 'eleve' :
    severite === 'attention' ? 'moyen' : 'faible';

  return {
    id: uuidv4(),
    centreId,
    type,
    severite,
    titre,
    description,
    valeurActuelle,
    seuilReference,
    ecartPourcentage: seuilReference !== 0
      ? ((valeurActuelle - seuilReference) / Math.abs(seuilReference)) * 100
      : 0,
    entitesImpactees,
    impact,
    recommandations,
    dateDetection: now,
    traitee: false,
    createdAt: now,
    updatedAt: now,
  };
}

// ===========================================
// DETECTION - Concentration Risque
// ===========================================

export function detecterConcentrationRisque(
  donnees: DonneesInsight,
  seuils: SeuilsInsight = SEUILS_DEFAUT
): Insight | null {
  const kpi = donnees.resultatsKPI.find(r => r.typeKPI === 'CONCENTRATION_TOP5');
  if (!kpi) return null;

  if (kpi.valeur >= seuils.concentrationTop5Critique) {
    return creerInsight(
      donnees.centreId,
      'concentration_risque',
      'critique',
      'Concentration locataire critique',
      `Les 5 premiers locataires représentent ${kpi.valeurFormatee} des revenus locatifs. Risque de dépendance majeur.`,
      kpi.valeur,
      seuils.concentrationTop5Critique,
      [
        'Diversifier immédiatement le mix locatif',
        'Négocier des durées de bail plus longues avec les top locataires',
        'Identifier et prospecter des enseignes alternatives',
        'Évaluer le risque de départ de chaque top locataire',
      ],
      (kpi.details as { topLocataires?: { enseigne: string }[] })?.topLocataires?.map(l => l.enseigne) || []
    );
  }

  if (kpi.valeur >= seuils.concentrationTop5Alerte) {
    return creerInsight(
      donnees.centreId,
      'concentration_risque',
      'alerte',
      'Concentration locataire élevée',
      `Les 5 premiers locataires représentent ${kpi.valeurFormatee} des revenus. Une vigilance accrue est recommandée.`,
      kpi.valeur,
      seuils.concentrationTop5Alerte,
      [
        'Surveiller les performances des top locataires',
        'Anticiper les renouvellements de bail',
        'Diversifier progressivement le mix locatif',
      ]
    );
  }

  return null;
}

// ===========================================
// DETECTION - Vacance
// ===========================================

export function detecterVacanceAnormale(
  donnees: DonneesInsight,
  seuils: SeuilsInsight = SEUILS_DEFAUT
): Insight | null {
  const kpi = donnees.resultatsKPI.find(r => r.typeKPI === 'TAUX_VACANCE');
  if (!kpi) return null;

  const lotsVacants = donnees.etatsLocatifs
    .filter(e => e.statutOccupation === 'vacant')
    .map(e => e.lotReference);

  if (kpi.valeur >= seuils.vacanceCritique) {
    return creerInsight(
      donnees.centreId,
      'vacance_anormale',
      'critique',
      'Taux de vacance critique',
      `Le taux de vacance atteint ${kpi.valeurFormatee}. Action commerciale urgente requise.`,
      kpi.valeur,
      seuils.vacanceCritique,
      [
        'Revoir immédiatement la stratégie de commercialisation',
        'Ajuster la politique tarifaire',
        'Identifier les causes structurelles de la vacance',
        'Envisager des travaux d\'amélioration des lots',
        'Proposer des conditions d\'entrée attractives',
      ],
      lotsVacants
    );
  }

  if (kpi.valeur >= seuils.vacanceAlerte) {
    return creerInsight(
      donnees.centreId,
      'vacance_anormale',
      'alerte',
      'Taux de vacance élevé',
      `Le taux de vacance de ${kpi.valeurFormatee} dépasse le seuil d'alerte.`,
      kpi.valeur,
      seuils.vacanceAlerte,
      [
        'Accélérer la commercialisation des lots vacants',
        'Analyser le positionnement tarifaire',
        'Renforcer les actions marketing',
      ],
      lotsVacants
    );
  }

  return null;
}

// ===========================================
// DETECTION - Vacance Prolongée
// ===========================================

export function detecterVacanceProlongee(
  donnees: DonneesInsight
): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();

  // Identifier les lots vacants depuis plus de 6 mois
  const lotsVacantsProblematiques = donnees.etatsLocatifs
    .filter(e => e.statutOccupation === 'vacant')
    .filter(e => {
      // Estimer la durée de vacance (simplifié)
      const bailFin = new Date(e.bailFin);
      const moisVacance = (now.getTime() - bailFin.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return moisVacance > 6;
    });

  if (lotsVacantsProblematiques.length > 0) {
    insights.push(creerInsight(
      donnees.centreId,
      'vacance_prolongee',
      lotsVacantsProblematiques.length > 3 ? 'critique' : 'attention',
      `${lotsVacantsProblematiques.length} lot(s) vacant(s) depuis plus de 6 mois`,
      `Des lots restent vacants de manière prolongée, impactant significativement les revenus.`,
      lotsVacantsProblematiques.length,
      0,
      [
        'Analyser les raisons de la non-commercialisation',
        'Envisager une restructuration des lots',
        'Revoir le positionnement prix',
        'Cibler de nouvelles activités',
      ],
      lotsVacantsProblematiques.map(l => l.lotReference)
    ));
  }

  return insights;
}

// ===========================================
// DETECTION - Échéances Groupées
// ===========================================

export function detecterEcheancesGroupees(
  donnees: DonneesInsight,
  seuils: SeuilsInsight = SEUILS_DEFAUT
): Insight | null {
  const kpi = donnees.resultatsKPI.find(r => r.typeKPI === 'WAULT');
  if (!kpi) return null;

  if (kpi.valeur <= seuils.waultCritique) {
    return creerInsight(
      donnees.centreId,
      'echeances_groupees',
      'critique',
      'WAULT critique - Risque d\'échéances massives',
      `La durée moyenne pondérée des baux n'est que de ${kpi.valeurFormatee}. Risque majeur de vacance à court terme.`,
      kpi.valeur,
      seuils.waultCritique,
      [
        'Identifier immédiatement tous les baux à échéance < 12 mois',
        'Engager des négociations de renouvellement anticipées',
        'Préparer un plan de commercialisation de secours',
        'Provisionner pour la vacance potentielle',
      ]
    );
  }

  if (kpi.valeur <= seuils.waultAlerte) {
    return creerInsight(
      donnees.centreId,
      'echeances_groupees',
      'alerte',
      'WAULT faible - Échéances à anticiper',
      `La durée moyenne des baux de ${kpi.valeurFormatee} nécessite une gestion proactive des renouvellements.`,
      kpi.valeur,
      seuils.waultAlerte,
      [
        'Cartographier les échéances sur 24 mois',
        'Prioriser les renouvellements des locataires clés',
        'Négocier des extensions de durée',
      ]
    );
  }

  return null;
}

// ===========================================
// DETECTION - Échéances Proches
// ===========================================

export function detecterEcheancesProches(
  donnees: DonneesInsight,
  horizonMois = 12
): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();
  const horizon = new Date(now.getTime() + horizonMois * 30 * 24 * 60 * 60 * 1000);

  // Baux arrivant à échéance
  const bauxProches = donnees.baux.filter(b => {
    const dateFin = new Date(b.dateFin);
    return dateFin <= horizon && dateFin > now;
  });

  // Regrouper par trimestre
  const parTrimestre: Record<string, typeof bauxProches> = {};
  for (const bail of bauxProches) {
    const date = new Date(bail.dateFin);
    const trimestre = `T${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`;
    parTrimestre[trimestre] = parTrimestre[trimestre] || [];
    parTrimestre[trimestre].push(bail);
  }

  // Détecter les trimestres avec beaucoup d'échéances
  for (const [trimestre, baux] of Object.entries(parTrimestre)) {
    const loyerTotal = baux.reduce((sum, b) => sum + b.loyerAnnuel, 0);
    const totalLoyers = donnees.baux.reduce((sum, b) => sum + b.loyerAnnuel, 0);
    const pourcentage = totalLoyers > 0 ? (loyerTotal / totalLoyers) * 100 : 0;

    if (baux.length >= 3 || pourcentage > 15) {
      insights.push(creerInsight(
        donnees.centreId,
        'echeance_majeure',
        pourcentage > 25 ? 'critique' : 'attention',
        `${baux.length} baux arrivent à échéance en ${trimestre}`,
        `Ces baux représentent ${pourcentage.toFixed(1)}% des revenus locatifs.`,
        pourcentage,
        15,
        [
          'Anticiper les négociations de renouvellement',
          'Préparer des alternatives commerciales',
          'Évaluer l\'impact cash-flow',
        ],
        baux.map(b => b.locataireEnseigne)
      ));
    }
  }

  return insights;
}

// ===========================================
// DETECTION - Taux d'Effort Excessif
// ===========================================

export function detecterEffortExcessif(
  donnees: DonneesInsight,
  seuils: SeuilsInsight = SEUILS_DEFAUT
): Insight | null {
  const kpi = donnees.resultatsKPI.find(r => r.typeKPI === 'TAUX_EFFORT_MOYEN');
  if (!kpi) return null;

  const details = kpi.details as { detailsParLocataire?: { enseigne: string; tauxEffort: number }[] };
  const locatairesEnDifficulte = details?.detailsParLocataire
    ?.filter(l => l.tauxEffort > seuils.effortCritique)
    .map(l => l.enseigne) || [];

  if (kpi.valeur >= seuils.effortCritique) {
    return creerInsight(
      donnees.centreId,
      'effort_excessif',
      'critique',
      'Taux d\'effort critique',
      `Le taux d'effort moyen de ${kpi.valeurFormatee} indique un risque d'impayés significatif.`,
      kpi.valeur,
      seuils.effortCritique,
      [
        'Identifier les locataires les plus à risque',
        'Envisager des aménagements de loyer préventifs',
        'Renforcer le suivi des encaissements',
        'Provisionner pour créances douteuses',
      ],
      locatairesEnDifficulte
    );
  }

  if (kpi.valeur >= seuils.effortAlerte) {
    return creerInsight(
      donnees.centreId,
      'effort_excessif',
      'attention',
      'Taux d\'effort élevé',
      `Le taux d'effort moyen de ${kpi.valeurFormatee} mérite une attention particulière.`,
      kpi.valeur,
      seuils.effortAlerte,
      [
        'Surveiller les performances des locataires',
        'Anticiper les difficultés potentielles',
      ],
      locatairesEnDifficulte
    );
  }

  return null;
}

// ===========================================
// DETECTION - Impayés
// ===========================================

export function detecterImpayes(
  donnees: DonneesInsight,
  seuils: SeuilsInsight = SEUILS_DEFAUT
): Insight | null {
  const kpi = donnees.resultatsKPI.find(r => r.typeKPI === 'TAUX_RECOUVREMENT');
  if (!kpi) return null;

  // Identifier les locataires en retard
  const loyersImpayes = donnees.loyers.filter(l => l.statut === 'impaye' || l.statut === 'partiel');
  const locatairesImpayes = [...new Set(loyersImpayes.map(l => l.locataireEnseigne))];

  if (kpi.valeur <= seuils.recouvrementCritique) {
    return creerInsight(
      donnees.centreId,
      'impaye_critique',
      'critique',
      'Taux de recouvrement dégradé',
      `Le taux de recouvrement de ${kpi.valeurFormatee} révèle des difficultés d'encaissement majeures.`,
      kpi.valeur,
      seuils.recouvrementCritique,
      [
        'Relancer immédiatement les impayés',
        'Mettre en place un plan de recouvrement amiable',
        'Évaluer les procédures contentieuses',
        'Ajuster les provisions pour créances douteuses',
      ],
      locatairesImpayes
    );
  }

  if (kpi.valeur <= seuils.recouvrementAlerte) {
    return creerInsight(
      donnees.centreId,
      'impaye_critique',
      'alerte',
      'Retards de paiement détectés',
      `Le taux de recouvrement de ${kpi.valeurFormatee} nécessite un suivi renforcé.`,
      kpi.valeur,
      seuils.recouvrementAlerte,
      [
        'Relancer les locataires en retard',
        'Analyser les causes des retards',
        'Renforcer les procédures de relance',
      ],
      locatairesImpayes
    );
  }

  return null;
}

// ===========================================
// DETECTION - Tendances CA
// ===========================================

export function detecterTendanceCA(
  donnees: DonneesInsight,
  seuils: SeuilsInsight = SEUILS_DEFAUT
): Insight | null {
  const kpi = donnees.resultatsKPI.find(r => r.typeKPI === 'CA_TOTAL');
  if (!kpi || kpi.variationPourcentage === undefined) return null;

  if (kpi.variationPourcentage <= seuils.variationCACritique) {
    return creerInsight(
      donnees.centreId,
      'tendance_ca_baisse',
      'critique',
      'Chute significative du CA',
      `Le chiffre d'affaires est en baisse de ${Math.abs(kpi.variationPourcentage).toFixed(1)}% vs N-1.`,
      kpi.variationPourcentage,
      seuils.variationCACritique,
      [
        'Analyser les causes par enseigne',
        'Identifier les secteurs en difficulté',
        'Renforcer les actions d\'animation commerciale',
        'Évaluer l\'impact sur les loyers variables',
      ]
    );
  }

  if (kpi.variationPourcentage <= seuils.variationCAAlerte) {
    return creerInsight(
      donnees.centreId,
      'tendance_ca_baisse',
      'attention',
      'CA en baisse',
      `Le chiffre d'affaires recule de ${Math.abs(kpi.variationPourcentage).toFixed(1)}% vs N-1.`,
      kpi.variationPourcentage,
      seuils.variationCAAlerte,
      [
        'Surveiller les performances par enseigne',
        'Intensifier les animations commerciales',
      ]
    );
  }

  // Détection tendance positive
  if (kpi.variationPourcentage >= 10) {
    return creerInsight(
      donnees.centreId,
      'tendance_ca_hausse',
      'info',
      'Forte croissance du CA',
      `Le chiffre d'affaires progresse de ${kpi.variationPourcentage.toFixed(1)}% vs N-1.`,
      kpi.variationPourcentage,
      10,
      [
        'Capitaliser sur cette dynamique',
        'Identifier les leviers de croissance',
        'Évaluer les opportunités de revalorisation locative',
      ]
    );
  }

  return null;
}

// ===========================================
// DETECTION - Tendances Fréquentation
// ===========================================

export function detecterTendanceFrequentation(
  donnees: DonneesInsight,
  seuils: SeuilsInsight = SEUILS_DEFAUT
): Insight | null {
  const kpi = donnees.resultatsKPI.find(r => r.typeKPI === 'FREQUENTATION_TOTALE');
  if (!kpi || kpi.variationPourcentage === undefined) return null;

  if (kpi.variationPourcentage <= seuils.variationFreqCritique) {
    return creerInsight(
      donnees.centreId,
      'tendance_frequentation_baisse',
      'critique',
      'Chute de la fréquentation',
      `La fréquentation est en baisse de ${Math.abs(kpi.variationPourcentage).toFixed(1)}% vs N-1.`,
      kpi.variationPourcentage,
      seuils.variationFreqCritique,
      [
        'Analyser les causes (concurrence, accessibilité, mix...)',
        'Renforcer les actions marketing et événementielles',
        'Évaluer l\'attractivité du mix commercial',
        'Revoir la stratégie de communication',
      ]
    );
  }

  if (kpi.variationPourcentage <= seuils.variationFreqAlerte) {
    return creerInsight(
      donnees.centreId,
      'tendance_frequentation_baisse',
      'attention',
      'Fréquentation en baisse',
      `La fréquentation recule de ${Math.abs(kpi.variationPourcentage).toFixed(1)}% vs N-1.`,
      kpi.variationPourcentage,
      seuils.variationFreqAlerte,
      [
        'Surveiller les tendances hebdomadaires',
        'Renforcer les animations',
      ]
    );
  }

  if (kpi.variationPourcentage >= 10) {
    return creerInsight(
      donnees.centreId,
      'tendance_frequentation_hausse',
      'info',
      'Forte hausse de la fréquentation',
      `La fréquentation progresse de ${kpi.variationPourcentage.toFixed(1)}% vs N-1.`,
      kpi.variationPourcentage,
      10,
      [
        'Capitaliser sur cette dynamique',
        'Analyser les facteurs de succès',
      ]
    );
  }

  return null;
}

// ===========================================
// DETECTION - Opportunité Réversion
// ===========================================

export function detecterOpportuniteReversion(
  donnees: DonneesInsight
): Insight | null {
  const kpi = donnees.resultatsKPI.find(r => r.typeKPI === 'REVERSION');
  if (!kpi) return null;

  if (kpi.valeur >= 15) {
    return creerInsight(
      donnees.centreId,
      'opportunite_reversion',
      'info',
      'Potentiel de réversion significatif',
      `Les loyers en place sont inférieurs de ${kpi.valeurFormatee} aux valeurs de marché.`,
      kpi.valeur,
      15,
      [
        'Identifier les baux avec potentiel de revalorisation',
        'Préparer les arguments pour les renégociations',
        'Cibler les renouvellements avec fort potentiel',
      ]
    );
  }

  return null;
}

// ===========================================
// FONCTION PRINCIPALE - Détecter tous les insights
// ===========================================

export function detecterTousInsights(
  donnees: DonneesInsight,
  seuils: SeuilsInsight = SEUILS_DEFAUT
): Insight[] {
  const insights: Insight[] = [];

  // Concentration
  const concentration = detecterConcentrationRisque(donnees, seuils);
  if (concentration) insights.push(concentration);

  // Vacance
  const vacance = detecterVacanceAnormale(donnees, seuils);
  if (vacance) insights.push(vacance);

  const vacanceProlongee = detecterVacanceProlongee(donnees);
  insights.push(...vacanceProlongee);

  // Échéances
  const echeances = detecterEcheancesGroupees(donnees, seuils);
  if (echeances) insights.push(echeances);

  const echeancesProches = detecterEcheancesProches(donnees);
  insights.push(...echeancesProches);

  // Effort
  const effort = detecterEffortExcessif(donnees, seuils);
  if (effort) insights.push(effort);

  // Impayés
  const impayes = detecterImpayes(donnees, seuils);
  if (impayes) insights.push(impayes);

  // Tendances
  const tendanceCA = detecterTendanceCA(donnees, seuils);
  if (tendanceCA) insights.push(tendanceCA);

  const tendanceFreq = detecterTendanceFrequentation(donnees, seuils);
  if (tendanceFreq) insights.push(tendanceFreq);

  // Opportunités
  const reversion = detecterOpportuniteReversion(donnees);
  if (reversion) insights.push(reversion);

  // Trier par sévérité
  const ordreSeverite: Record<SeveriteInsight, number> = {
    critique: 0,
    alerte: 1,
    attention: 2,
    info: 3,
  };

  return insights.sort((a, b) => ordreSeverite[a.severite] - ordreSeverite[b.severite]);
}
