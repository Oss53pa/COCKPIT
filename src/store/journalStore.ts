import { create } from 'zustand';
import { db } from '../db/database';
import type {
  JournalEntry,
  JournalDetails,
  ActionJournal,
  PeriodeCloturee,
  JournalFilters,
  JournalStats,
  ConfigurationCloture,
  DEFAULT_CLOTURE_CONFIG,
} from '../types';

interface JournalState {
  // État
  entries: JournalEntry[];
  periodesCloturees: PeriodeCloturee[];
  clotureConfig: ConfigurationCloture;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadEntries: (filters?: JournalFilters) => Promise<void>;
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => Promise<string>;
  loadPeriodesCloturees: (centreId: string) => Promise<void>;
  cloturerPeriode: (centreId: string, annee: number, mois: number, justification?: string) => Promise<boolean>;
  deverrouillerPeriode: (periodeId: string, justification: string, dureeHeures: number) => Promise<boolean>;
  isPeriodeCloturee: (centreId: string, annee: number, mois: number) => boolean;
  getStats: (filters?: JournalFilters) => Promise<JournalStats>;
  setClotureConfig: (config: Partial<ConfigurationCloture>) => void;

  // Utilitaires
  logImport: (centreId: string, table: string, fichierSource: string, lignes: number, erreurs: string[], scoreQualite: number) => Promise<void>;
  logModification: (centreId: string, table: string, entiteId: string, champ: string, ancienneValeur: unknown, nouvelleValeur: unknown, justification?: string) => Promise<void>;
  logSuppression: (centreId: string, table: string, entiteId: string, details?: string) => Promise<void>;
}

// Configuration par défaut
const defaultClotureConfig: ConfigurationCloture = {
  clotureAutomatiqueActive: true,
  jourClotureAuto: 15,
  notifierAvantCloture: true,
  joursNotificationAvance: 3,
  permettreDeverrouillage: true,
  justificationObligatoire: true,
};

export const useJournalStore = create<JournalState>((set, get) => ({
  // État initial
  entries: [],
  periodesCloturees: [],
  clotureConfig: defaultClotureConfig,
  isLoading: false,
  error: null,

  // Charger les entrées du journal
  loadEntries: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      let query = db.journalModifications.orderBy('date').reverse();

      // Appliquer les filtres
      const entries = await query.toArray();

      let filteredEntries = entries;

      if (filters.dateDebut) {
        filteredEntries = filteredEntries.filter(e => e.date >= filters.dateDebut!);
      }
      if (filters.dateFin) {
        filteredEntries = filteredEntries.filter(e => e.date <= filters.dateFin!);
      }
      if (filters.actions && filters.actions.length > 0) {
        filteredEntries = filteredEntries.filter(e => filters.actions!.includes(e.action));
      }
      if (filters.tables && filters.tables.length > 0) {
        filteredEntries = filteredEntries.filter(e => filters.tables!.includes(e.table));
      }
      if (filters.centreId) {
        filteredEntries = filteredEntries.filter(e => e.details.centreId === filters.centreId);
      }
      if (filters.avecErreurs) {
        filteredEntries = filteredEntries.filter(e => e.erreurs && e.erreurs.length > 0);
      }
      if (filters.recherche) {
        const recherche = filters.recherche.toLowerCase();
        filteredEntries = filteredEntries.filter(e =>
          e.table.toLowerCase().includes(recherche) ||
          e.action.toLowerCase().includes(recherche) ||
          e.details.fichierSource?.toLowerCase().includes(recherche)
        );
      }

      set({ entries: filteredEntries, isLoading: false });
    } catch (error) {
      console.error('Erreur lors du chargement du journal:', error);
      set({ error: String(error), isLoading: false });
    }
  },

  // Ajouter une entrée au journal
  addEntry: async (entry) => {
    const id = crypto.randomUUID();
    const fullEntry: JournalEntry = {
      ...entry,
      id,
      createdAt: new Date().toISOString(),
    };

    try {
      await db.journalModifications.add(fullEntry);
      // Recharger les entrées
      const entries = await db.journalModifications.orderBy('date').reverse().limit(100).toArray();
      set({ entries });
      return id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout au journal:', error);
      throw error;
    }
  },

  // Charger les périodes clôturées
  loadPeriodesCloturees: async (centreId) => {
    try {
      const periodes = await db.periodesCloturees
        .where('centreId')
        .equals(centreId)
        .toArray();
      set({ periodesCloturees: periodes });
    } catch (error) {
      console.error('Erreur lors du chargement des périodes clôturées:', error);
    }
  },

  // Clôturer une période
  cloturerPeriode: async (centreId, annee, mois, justification) => {
    try {
      // Vérifier si déjà clôturée
      const existing = await db.periodesCloturees
        .where('[centreId+annee+mois]')
        .equals([centreId, annee, mois])
        .first();

      if (existing) {
        return false;
      }

      // Compter les enregistrements affectés
      const tables = ['mesures', 'donneesLoyers', 'donneesFrequentation', 'donneesChiffreAffaires', 'donneesCharges'];
      let totalEnregistrements = 0;

      // Créer la période clôturée
      const periode: PeriodeCloturee = {
        id: crypto.randomUUID(),
        centreId,
        annee,
        mois,
        dateCloture: new Date().toISOString(),
        clotureParAuto: false,
        utilisateur: 'Utilisateur', // À remplacer par le profil
        justification,
        donnees: {
          tables,
          enregistrements: totalEnregistrements,
        },
        deverrouillages: [],
      };

      await db.periodesCloturees.add(periode);

      // Ajouter au journal
      await get().addEntry({
        date: new Date().toISOString(),
        action: 'cloture',
        table: 'periodesCloturees',
        enregistrementsAffectes: 1,
        utilisateur: 'Utilisateur',
        details: {
          periode: `${annee}-${String(mois).padStart(2, '0')}`,
          centreId,
          motifCloture: justification,
        },
      });

      await get().loadPeriodesCloturees(centreId);
      return true;
    } catch (error) {
      console.error('Erreur lors de la clôture:', error);
      return false;
    }
  },

  // Déverrouiller une période
  deverrouillerPeriode: async (periodeId, justification, dureeHeures) => {
    const { clotureConfig } = get();
    if (!clotureConfig.permettreDeverrouillage) {
      return false;
    }

    try {
      const periode = await db.periodesCloturees.get(periodeId);
      if (!periode) return false;

      // Ajouter l'entrée de déverrouillage
      periode.deverrouillages.push({
        date: new Date().toISOString(),
        utilisateur: 'Utilisateur',
        justification,
        dureeHeures,
      });

      await db.periodesCloturees.put(periode);

      // Logger dans le journal
      await get().addEntry({
        date: new Date().toISOString(),
        action: 'modification',
        table: 'periodesCloturees',
        enregistrementsAffectes: 1,
        utilisateur: 'Utilisateur',
        details: {
          entiteId: periodeId,
          champModifie: 'deverrouillages',
          justification,
        },
      });

      return true;
    } catch (error) {
      console.error('Erreur lors du déverrouillage:', error);
      return false;
    }
  },

  // Vérifier si une période est clôturée
  isPeriodeCloturee: (centreId, annee, mois) => {
    const { periodesCloturees } = get();
    return periodesCloturees.some(
      p => p.centreId === centreId && p.annee === annee && p.mois === mois
    );
  },

  // Obtenir les statistiques du journal
  getStats: async (filters = {}) => {
    const { entries } = get();

    const stats: JournalStats = {
      periodeDebut: entries[entries.length - 1]?.date || '',
      periodeFin: entries[0]?.date || '',
      totalEntrees: entries.length,
      parAction: {
        import: 0,
        modification: 0,
        suppression: 0,
        creation: 0,
        cloture: 0,
        validation: 0,
        annulation: 0,
        restauration: 0,
      },
      parTable: {},
      erreursTotales: 0,
      avertissementsTotaux: 0,
      scoreQualiteMoyen: 0,
    };

    let totalScores = 0;
    let countScores = 0;

    for (const entry of entries) {
      stats.parAction[entry.action] = (stats.parAction[entry.action] || 0) + 1;
      stats.parTable[entry.table] = (stats.parTable[entry.table] || 0) + 1;
      stats.erreursTotales += entry.erreurs?.length || 0;
      stats.avertissementsTotaux += entry.avertissements?.length || 0;

      if (entry.scoreQualite !== undefined) {
        totalScores += entry.scoreQualite;
        countScores++;
      }
    }

    if (countScores > 0) {
      stats.scoreQualiteMoyen = totalScores / countScores;
    }

    return stats;
  },

  // Configurer les clôtures
  setClotureConfig: (config) => {
    set({ clotureConfig: { ...get().clotureConfig, ...config } });
  },

  // Utilitaire: Logger un import
  logImport: async (centreId, table, fichierSource, lignes, erreurs, scoreQualite) => {
    await get().addEntry({
      date: new Date().toISOString(),
      action: 'import',
      table,
      enregistrementsAffectes: lignes,
      utilisateur: 'Utilisateur',
      details: {
        fichierSource,
        typeImport: table,
        centreId,
      },
      scoreQualite,
      erreurs: erreurs.length > 0 ? erreurs : undefined,
    });
  },

  // Utilitaire: Logger une modification
  logModification: async (centreId, table, entiteId, champ, ancienneValeur, nouvelleValeur, justification) => {
    await get().addEntry({
      date: new Date().toISOString(),
      action: 'modification',
      table,
      enregistrementsAffectes: 1,
      utilisateur: 'Utilisateur',
      details: {
        centreId,
        entiteId,
        entiteType: table,
        champModifie: champ,
        ancienneValeur,
        nouvelleValeur,
        justification,
      },
    });
  },

  // Utilitaire: Logger une suppression
  logSuppression: async (centreId, table, entiteId, details) => {
    await get().addEntry({
      date: new Date().toISOString(),
      action: 'suppression',
      table,
      enregistrementsAffectes: 1,
      utilisateur: 'Utilisateur',
      details: {
        centreId,
        entiteId,
        entiteType: table,
        justification: details,
      },
    });
  },
}));
