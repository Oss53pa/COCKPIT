import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type {
  Rapport,
  ModeleRapport,
  SectionRapport,
  BlocRapport,
  StatutRapport,
  TypeRapportCode,
  VersionRapport,
  CommentaireRevision,
  ExportGenere,
  FormatExport,
  ConfigExportRapport,
  BlocParagraphe,
  BlocTableau,
  BlocGraphique,
  BlocKPICard,
  BlocKPIGrid,
  BlocTitre,
  BlocSeparateur,
  TypeBloc,
} from '../types/bi';
import { CATALOGUE_RAPPORTS } from '../data/catalogueRapports';

// ===========================================
// TYPES
// ===========================================

interface RapportEdition {
  rapport: Rapport | null;
  sectionSelectionnee: string | null;
  blocSelectionne: string | null;
  historiqueUndo: Rapport[];
  historiqueRedo: Rapport[];
  isDirty: boolean;
  isSaving: boolean;
}

interface RapportState {
  // Rapports
  rapports: Rapport[];
  rapportsParCentre: Record<string, Rapport[]>;

  // Modèles
  modeles: ModeleRapport[];

  // Édition
  edition: RapportEdition;

  // State
  isLoading: boolean;
  error: string | null;

  // Actions - Chargement
  loadRapports: (centreId: string) => Promise<void>;
  loadModeles: () => Promise<void>;
  loadRapport: (id: string) => Promise<Rapport | null>;

  // Actions - CRUD Rapports
  creerRapport: (data: {
    centreId: string;
    typeRapportCode: TypeRapportCode;
    titre: string;
    periodeDebut: string;
    periodeFin: string;
    auteur: string;
  }) => Promise<Rapport>;
  dupliquerRapport: (id: string) => Promise<Rapport | null>;
  supprimerRapport: (id: string) => Promise<void>;

  // Actions - Édition
  ouvrirRapport: (id: string) => Promise<void>;
  fermerRapport: () => void;
  sauvegarderRapport: () => Promise<void>;

  // Actions - Sections
  ajouterSection: (titre: string, index?: number) => void;
  modifierSection: (sectionId: string, updates: Partial<SectionRapport>) => void;
  supprimerSection: (sectionId: string) => void;
  deplacerSection: (sectionId: string, direction: 'up' | 'down') => void;
  selectionnerSection: (sectionId: string | null) => void;

  // Actions - Blocs
  ajouterBloc: (sectionId: string, type: TypeBloc, index?: number) => void;
  modifierBloc: (sectionId: string, blocId: string, updates: Partial<BlocRapport>) => void;
  supprimerBloc: (sectionId: string, blocId: string) => void;
  deplacerBloc: (sectionId: string, blocId: string, direction: 'up' | 'down') => void;
  deplacerBlocVersSection: (blocId: string, sourceSectionId: string, targetSectionId: string) => void;
  selectionnerBloc: (blocId: string | null) => void;

  // Actions - Undo/Redo
  undo: () => void;
  redo: () => void;

  // Actions - Workflow
  changerStatut: (id: string, statut: StatutRapport) => Promise<void>;
  soumettreRevision: (id: string) => Promise<void>;
  approuver: (id: string, approbateur: string) => Promise<void>;
  publier: (id: string) => Promise<void>;
  archiver: (id: string) => Promise<void>;

  // Actions - Commentaires
  ajouterCommentaire: (rapportId: string, commentaire: Omit<CommentaireRevision, 'id' | 'dateCreation'>) => Promise<void>;
  resoudreCommentaire: (rapportId: string, commentaireId: string) => Promise<void>;

  // Actions - Versions
  creerVersion: (commentaire?: string) => Promise<void>;
  restaurerVersion: (versionId: string) => Promise<void>;

  // Actions - Modèles
  sauvegarderCommeModele: (nom: string, description?: string, estPublic?: boolean) => Promise<ModeleRapport | null>;
  appliquerModele: (modeleId: string) => void;
  supprimerModele: (id: string) => Promise<void>;

  // Actions - Export
  genererExport: (format: FormatExport, config?: Partial<ConfigExportRapport>) => Promise<ExportGenere | null>;

  // Helpers
  getRapport: (id: string) => Rapport | undefined;
  getRapportsParStatut: (centreId: string, statut: StatutRapport) => Rapport[];
}

// ===========================================
// INITIAL STATE
// ===========================================

const editionInitiale: RapportEdition = {
  rapport: null,
  sectionSelectionnee: null,
  blocSelectionne: null,
  historiqueUndo: [],
  historiqueRedo: [],
  isDirty: false,
  isSaving: false,
};

// ===========================================
// HELPERS
// ===========================================

function creerBlocVide(type: TypeBloc): BlocRapport {
  const base = { id: uuidv4(), ordre: 0 };

  switch (type) {
    case 'paragraphe':
      return { ...base, type: 'paragraphe', contenu: '' } as BlocParagraphe;
    case 'titre':
      return { ...base, type: 'titre', niveau: 2, texte: 'Nouveau titre' } as BlocTitre;
    case 'tableau':
      return {
        ...base,
        type: 'tableau',
        colonnes: [{ key: 'col1', label: 'Colonne 1' }],
        donnees: [],
      } as BlocTableau;
    case 'graphique':
      return {
        ...base,
        type: 'graphique',
        typeGraphique: 'barre',
        donnees: [],
        configuration: { series: [] },
      } as BlocGraphique;
    case 'kpi_card':
      return {
        ...base,
        type: 'kpi_card',
        kpiCode: '',
        valeur: 0,
        unite: '',
      } as BlocKPICard;
    case 'kpi_grid':
      return {
        ...base,
        type: 'kpi_grid',
        kpis: [],
        colonnes: 3,
      } as BlocKPIGrid;
    case 'separateur':
      return { ...base, type: 'separateur', variante: 'ligne' } as BlocSeparateur;
    case 'saut_page':
      return { ...base, type: 'saut_page' };
    case 'sommaire':
      return { ...base, type: 'sommaire', niveauMax: 2 };
    case 'image':
      return { ...base, type: 'image', src: '', largeur: '100%' };
    default:
      return { ...base, type: 'paragraphe', contenu: '' } as BlocParagraphe;
  }
}

function creerSectionsParDefaut(typeCode: TypeRapportCode): SectionRapport[] {
  const typeRapport = CATALOGUE_RAPPORTS[typeCode];
  if (!typeRapport) return [];

  return typeRapport.sections.map((section, index) => ({
    id: uuidv4(),
    titre: section.titre,
    ordre: index,
    blocs: [],
  }));
}

// ===========================================
// STORE
// ===========================================

export const useRapportStore = create<RapportState>((set, get) => ({
  // Initial state
  rapports: [],
  rapportsParCentre: {},
  modeles: [],
  edition: { ...editionInitiale },
  isLoading: false,
  error: null,

  // ===========================================
  // CHARGEMENT
  // ===========================================

  loadRapports: async (centreId) => {
    set({ isLoading: true, error: null });
    try {
      const rapports = await db.rapports
        .where('centreId')
        .equals(centreId)
        .reverse()
        .sortBy('dateCreation');

      set((state) => ({
        rapports,
        rapportsParCentre: {
          ...state.rapportsParCentre,
          [centreId]: rapports,
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: `Erreur chargement rapports: ${error}`, isLoading: false });
    }
  },

  loadModeles: async () => {
    try {
      const modeles = await db.modelesRapport.toArray();
      set({ modeles });
    } catch (error) {
      console.error('Erreur chargement modèles:', error);
    }
  },

  loadRapport: async (id) => {
    try {
      const rapport = await db.rapports.get(id);
      return rapport || null;
    } catch (error) {
      console.error('Erreur chargement rapport:', error);
      return null;
    }
  },

  // ===========================================
  // CRUD RAPPORTS
  // ===========================================

  creerRapport: async (data) => {
    const now = new Date().toISOString();
    const sections = creerSectionsParDefaut(data.typeRapportCode);

    const rapport: Rapport = {
      id: uuidv4(),
      centreId: data.centreId,
      typeRapportCode: data.typeRapportCode,
      titre: data.titre,
      statut: 'brouillon',
      auteur: data.auteur,
      periodeDebut: data.periodeDebut,
      periodeFin: data.periodeFin,
      periodeLabel: `${data.periodeDebut} - ${data.periodeFin}`,
      sourcesDonneesIds: [],
      sections,
      versions: [],
      versionActuelle: 1,
      commentairesRevision: [],
      exportsGeneres: [],
      dateCreation: now,
      dateModification: now,
      createdAt: now,
      updatedAt: now,
    };

    await db.rapports.add(rapport);

    set((state) => ({
      rapports: [rapport, ...state.rapports],
      rapportsParCentre: {
        ...state.rapportsParCentre,
        [data.centreId]: [rapport, ...(state.rapportsParCentre[data.centreId] || [])],
      },
    }));

    return rapport;
  },

  dupliquerRapport: async (id) => {
    const original = get().getRapport(id);
    if (!original) return null;

    const now = new Date().toISOString();
    const rapport: Rapport = {
      ...original,
      id: uuidv4(),
      titre: `${original.titre} (copie)`,
      statut: 'brouillon',
      versions: [],
      versionActuelle: 1,
      commentairesRevision: [],
      exportsGeneres: [],
      dateCreation: now,
      dateModification: now,
      dateSoumission: undefined,
      dateApprobation: undefined,
      datePublication: undefined,
      createdAt: now,
      updatedAt: now,
    };

    await db.rapports.add(rapport);

    set((state) => ({
      rapports: [rapport, ...state.rapports],
    }));

    return rapport;
  },

  supprimerRapport: async (id) => {
    await db.rapports.delete(id);
    set((state) => ({
      rapports: state.rapports.filter(r => r.id !== id),
    }));
  },

  // ===========================================
  // EDITION
  // ===========================================

  ouvrirRapport: async (id) => {
    const rapport = await get().loadRapport(id);
    if (rapport) {
      set({
        edition: {
          rapport,
          sectionSelectionnee: rapport.sections[0]?.id || null,
          blocSelectionne: null,
          historiqueUndo: [],
          historiqueRedo: [],
          isDirty: false,
          isSaving: false,
        },
      });
    }
  },

  fermerRapport: () => {
    set({ edition: { ...editionInitiale } });
  },

  sauvegarderRapport: async () => {
    const { rapport } = get().edition;
    if (!rapport) return;

    set((state) => ({
      edition: { ...state.edition, isSaving: true },
    }));

    try {
      const updatedAt = new Date().toISOString();
      const rapportMisAJour = {
        ...rapport,
        dateModification: updatedAt,
        updatedAt,
      };

      await db.rapports.put(rapportMisAJour);

      set((state) => ({
        edition: {
          ...state.edition,
          rapport: rapportMisAJour,
          isDirty: false,
          isSaving: false,
        },
        rapports: state.rapports.map(r => r.id === rapport.id ? rapportMisAJour : r),
      }));
    } catch (error) {
      set((state) => ({
        edition: { ...state.edition, isSaving: false },
        error: `Erreur sauvegarde: ${error}`,
      }));
    }
  },

  // ===========================================
  // SECTIONS
  // ===========================================

  ajouterSection: (titre, index) => {
    const { rapport, historiqueUndo } = get().edition;
    if (!rapport) return;

    const nouvelleSection: SectionRapport = {
      id: uuidv4(),
      titre,
      ordre: index ?? rapport.sections.length,
      blocs: [],
    };

    const sections = [...rapport.sections];
    const insertIndex = index ?? sections.length;
    sections.splice(insertIndex, 0, nouvelleSection);

    // Réordonner
    sections.forEach((s, i) => { s.ordre = i; });

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: { ...rapport, sections },
        historiqueUndo: [...historiqueUndo, rapport],
        historiqueRedo: [],
        isDirty: true,
        sectionSelectionnee: nouvelleSection.id,
      },
    }));
  },

  modifierSection: (sectionId, updates) => {
    const { rapport, historiqueUndo } = get().edition;
    if (!rapport) return;

    const sections = rapport.sections.map(s =>
      s.id === sectionId ? { ...s, ...updates } : s
    );

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: { ...rapport, sections },
        historiqueUndo: [...historiqueUndo, rapport],
        historiqueRedo: [],
        isDirty: true,
      },
    }));
  },

  supprimerSection: (sectionId) => {
    const { rapport, historiqueUndo } = get().edition;
    if (!rapport) return;

    const sections = rapport.sections.filter(s => s.id !== sectionId);
    sections.forEach((s, i) => { s.ordre = i; });

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: { ...rapport, sections },
        historiqueUndo: [...historiqueUndo, rapport],
        historiqueRedo: [],
        isDirty: true,
        sectionSelectionnee: sections[0]?.id || null,
      },
    }));
  },

  deplacerSection: (sectionId, direction) => {
    const { rapport, historiqueUndo } = get().edition;
    if (!rapport) return;

    const sections = [...rapport.sections];
    const index = sections.findIndex(s => s.id === sectionId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    sections.forEach((s, i) => { s.ordre = i; });

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: { ...rapport, sections },
        historiqueUndo: [...historiqueUndo, rapport],
        historiqueRedo: [],
        isDirty: true,
      },
    }));
  },

  selectionnerSection: (sectionId) => {
    set((state) => ({
      edition: {
        ...state.edition,
        sectionSelectionnee: sectionId,
        blocSelectionne: null,
      },
    }));
  },

  // ===========================================
  // BLOCS
  // ===========================================

  ajouterBloc: (sectionId, type, index) => {
    const { rapport, historiqueUndo } = get().edition;
    if (!rapport) return;

    const bloc = creerBlocVide(type);

    const sections = rapport.sections.map(s => {
      if (s.id !== sectionId) return s;

      const blocs = [...s.blocs];
      const insertIndex = index ?? blocs.length;
      bloc.ordre = insertIndex;
      blocs.splice(insertIndex, 0, bloc);

      // Réordonner
      blocs.forEach((b, i) => { b.ordre = i; });

      return { ...s, blocs };
    });

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: { ...rapport, sections },
        historiqueUndo: [...historiqueUndo, rapport],
        historiqueRedo: [],
        isDirty: true,
        blocSelectionne: bloc.id,
      },
    }));
  },

  modifierBloc: (sectionId, blocId, updates) => {
    const { rapport, historiqueUndo } = get().edition;
    if (!rapport) return;

    const sections = rapport.sections.map(s => {
      if (s.id !== sectionId) return s;

      const blocs = s.blocs.map(b =>
        b.id === blocId ? { ...b, ...updates } as BlocRapport : b
      );

      return { ...s, blocs };
    });

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: { ...rapport, sections },
        historiqueUndo: [...historiqueUndo, rapport],
        historiqueRedo: [],
        isDirty: true,
      },
    }));
  },

  supprimerBloc: (sectionId, blocId) => {
    const { rapport, historiqueUndo } = get().edition;
    if (!rapport) return;

    const sections = rapport.sections.map(s => {
      if (s.id !== sectionId) return s;

      const blocs = s.blocs.filter(b => b.id !== blocId);
      blocs.forEach((b, i) => { b.ordre = i; });

      return { ...s, blocs };
    });

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: { ...rapport, sections },
        historiqueUndo: [...historiqueUndo, rapport],
        historiqueRedo: [],
        isDirty: true,
        blocSelectionne: null,
      },
    }));
  },

  deplacerBloc: (sectionId, blocId, direction) => {
    const { rapport, historiqueUndo } = get().edition;
    if (!rapport) return;

    const sections = rapport.sections.map(s => {
      if (s.id !== sectionId) return s;

      const blocs = [...s.blocs];
      const index = blocs.findIndex(b => b.id === blocId);
      if (index === -1) return s;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocs.length) return s;

      [blocs[index], blocs[newIndex]] = [blocs[newIndex], blocs[index]];
      blocs.forEach((b, i) => { b.ordre = i; });

      return { ...s, blocs };
    });

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: { ...rapport, sections },
        historiqueUndo: [...historiqueUndo, rapport],
        historiqueRedo: [],
        isDirty: true,
      },
    }));
  },

  deplacerBlocVersSection: (blocId, sourceSectionId, targetSectionId) => {
    const { rapport, historiqueUndo } = get().edition;
    if (!rapport) return;

    let blocADeplacer: BlocRapport | null = null;

    // Retirer de la source
    let sections = rapport.sections.map(s => {
      if (s.id !== sourceSectionId) return s;

      const bloc = s.blocs.find(b => b.id === blocId);
      if (bloc) blocADeplacer = bloc;

      const blocs = s.blocs.filter(b => b.id !== blocId);
      blocs.forEach((b, i) => { b.ordre = i; });

      return { ...s, blocs };
    });

    if (!blocADeplacer) return;

    // Ajouter à la cible
    sections = sections.map(s => {
      if (s.id !== targetSectionId) return s;

      const blocs = [...s.blocs, { ...blocADeplacer!, ordre: s.blocs.length }];
      return { ...s, blocs };
    });

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: { ...rapport, sections },
        historiqueUndo: [...historiqueUndo, rapport],
        historiqueRedo: [],
        isDirty: true,
      },
    }));
  },

  selectionnerBloc: (blocId) => {
    set((state) => ({
      edition: {
        ...state.edition,
        blocSelectionne: blocId,
      },
    }));
  },

  // ===========================================
  // UNDO/REDO
  // ===========================================

  undo: () => {
    const { historiqueUndo, rapport } = get().edition;
    if (historiqueUndo.length === 0 || !rapport) return;

    const previousState = historiqueUndo[historiqueUndo.length - 1];

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: previousState,
        historiqueUndo: historiqueUndo.slice(0, -1),
        historiqueRedo: [rapport, ...state.edition.historiqueRedo],
        isDirty: true,
      },
    }));
  },

  redo: () => {
    const { historiqueRedo, rapport } = get().edition;
    if (historiqueRedo.length === 0 || !rapport) return;

    const nextState = historiqueRedo[0];

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: nextState,
        historiqueRedo: historiqueRedo.slice(1),
        historiqueUndo: [...state.edition.historiqueUndo, rapport],
        isDirty: true,
      },
    }));
  },

  // ===========================================
  // WORKFLOW
  // ===========================================

  changerStatut: async (id, statut) => {
    const now = new Date().toISOString();
    await db.rapports.update(id, { statut, updatedAt: now });

    set((state) => ({
      rapports: state.rapports.map(r =>
        r.id === id ? { ...r, statut, updatedAt: now } : r
      ),
    }));
  },

  soumettreRevision: async (id) => {
    const now = new Date().toISOString();
    await db.rapports.update(id, {
      statut: 'en_revision',
      dateSoumission: now,
      updatedAt: now,
    });

    set((state) => ({
      rapports: state.rapports.map(r =>
        r.id === id ? { ...r, statut: 'en_revision', dateSoumission: now, updatedAt: now } : r
      ),
    }));
  },

  approuver: async (id, approbateur) => {
    const now = new Date().toISOString();
    await db.rapports.update(id, {
      statut: 'approuve',
      approbateur,
      dateApprobation: now,
      updatedAt: now,
    });

    set((state) => ({
      rapports: state.rapports.map(r =>
        r.id === id ? { ...r, statut: 'approuve', approbateur, dateApprobation: now, updatedAt: now } : r
      ),
    }));
  },

  publier: async (id) => {
    const now = new Date().toISOString();
    await db.rapports.update(id, {
      statut: 'publie',
      datePublication: now,
      updatedAt: now,
    });

    set((state) => ({
      rapports: state.rapports.map(r =>
        r.id === id ? { ...r, statut: 'publie', datePublication: now, updatedAt: now } : r
      ),
    }));
  },

  archiver: async (id) => {
    await get().changerStatut(id, 'archive');
  },

  // ===========================================
  // COMMENTAIRES
  // ===========================================

  ajouterCommentaire: async (rapportId, commentaireData) => {
    const rapport = get().getRapport(rapportId);
    if (!rapport) return;

    const commentaire: CommentaireRevision = {
      ...commentaireData,
      id: uuidv4(),
      dateCreation: new Date().toISOString(),
    };

    const commentaires = [...rapport.commentairesRevision, commentaire];
    await db.rapports.update(rapportId, { commentairesRevision: commentaires });

    set((state) => ({
      rapports: state.rapports.map(r =>
        r.id === rapportId ? { ...r, commentairesRevision: commentaires } : r
      ),
    }));
  },

  resoudreCommentaire: async (rapportId, commentaireId) => {
    const rapport = get().getRapport(rapportId);
    if (!rapport) return;

    const commentaires = rapport.commentairesRevision.map(c =>
      c.id === commentaireId ? { ...c, resolu: true } : c
    );

    await db.rapports.update(rapportId, { commentairesRevision: commentaires });

    set((state) => ({
      rapports: state.rapports.map(r =>
        r.id === rapportId ? { ...r, commentairesRevision: commentaires } : r
      ),
    }));
  },

  // ===========================================
  // VERSIONS
  // ===========================================

  creerVersion: async (commentaire) => {
    const { rapport } = get().edition;
    if (!rapport) return;

    const version: VersionRapport = {
      id: uuidv4(),
      numero: rapport.versionActuelle,
      contenu: JSON.parse(JSON.stringify(rapport.sections)),
      auteur: rapport.auteur,
      commentaire,
      dateCreation: new Date().toISOString(),
    };

    const versions = [...rapport.versions, version];
    const versionActuelle = rapport.versionActuelle + 1;

    await db.rapports.update(rapport.id, { versions, versionActuelle });

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: { ...rapport, versions, versionActuelle },
      },
    }));
  },

  restaurerVersion: async (versionId) => {
    const { rapport } = get().edition;
    if (!rapport) return;

    const version = rapport.versions.find(v => v.id === versionId);
    if (!version) return;

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: {
          ...rapport,
          sections: JSON.parse(JSON.stringify(version.contenu)),
        },
        isDirty: true,
      },
    }));
  },

  // ===========================================
  // MODELES
  // ===========================================

  sauvegarderCommeModele: async (nom, description, estPublic = false) => {
    const { rapport } = get().edition;
    if (!rapport) return null;

    const now = new Date().toISOString();
    const modele: ModeleRapport = {
      id: uuidv4(),
      typeRapportCode: rapport.typeRapportCode,
      nom,
      description,
      sections: JSON.parse(JSON.stringify(rapport.sections)),
      estPublic,
      auteur: rapport.auteur,
      nombreUtilisations: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.modelesRapport.add(modele);

    set((state) => ({
      modeles: [...state.modeles, modele],
    }));

    return modele;
  },

  appliquerModele: (modeleId) => {
    const modele = get().modeles.find(m => m.id === modeleId);
    const { rapport, historiqueUndo } = get().edition;

    if (!modele || !rapport) return;

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: {
          ...rapport,
          sections: JSON.parse(JSON.stringify(modele.sections)),
        },
        historiqueUndo: [...historiqueUndo, rapport],
        historiqueRedo: [],
        isDirty: true,
      },
    }));

    // Incrémenter le compteur d'utilisation
    db.modelesRapport.update(modeleId, {
      nombreUtilisations: modele.nombreUtilisations + 1,
    });
  },

  supprimerModele: async (id) => {
    await db.modelesRapport.delete(id);
    set((state) => ({
      modeles: state.modeles.filter(m => m.id !== id),
    }));
  },

  // ===========================================
  // EXPORT
  // ===========================================

  genererExport: async (format, config) => {
    const { rapport } = get().edition;
    if (!rapport) return null;

    const now = new Date().toISOString();

    // Import dynamically to avoid circular dependencies
    const { exportRapport, downloadBlob } = await import('../utils/reportExport');

    // Convert format to ExportFormat type
    const formatMap: Record<FormatExport, 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'html' | 'markdown'> = {
      pdf: 'pdf',
      docx: 'docx',
      pptx: 'pptx',
      xlsx: 'xlsx',
      html: 'html',
    };

    const exportFormat = formatMap[format] || 'pdf';

    // Generate the export
    const result = await exportRapport(rapport, exportFormat, {
      format: exportFormat,
      quality: config?.qualite || 'standard',
      pageSize: config?.taillePage || 'A4',
      orientation: config?.orientation || 'portrait',
      includeTableOfContents: config?.inclureSommaire ?? true,
      includeCoverPage: config?.inclureCouverture ?? true,
      includeComments: false,
    });

    if (!result.success || !result.blob || !result.filename) {
      console.error('Export failed:', result.error);
      return null;
    }

    // Download the file
    downloadBlob(result.blob, result.filename);

    const exportGenere: ExportGenere = {
      id: uuidv4(),
      format,
      dateGeneration: now,
      genereePar: rapport.auteur,
      nombreTelechargements: 1,
    };

    const exports = [...rapport.exportsGeneres, exportGenere];
    await db.rapports.update(rapport.id, { exportsGeneres: exports });

    set((state) => ({
      edition: {
        ...state.edition,
        rapport: { ...rapport, exportsGeneres: exports },
      },
    }));

    return exportGenere;
  },

  // ===========================================
  // HELPERS
  // ===========================================

  getRapport: (id) => {
    return get().rapports.find(r => r.id === id);
  },

  getRapportsParStatut: (centreId, statut) => {
    const rapports = get().rapportsParCentre[centreId] || [];
    return rapports.filter(r => r.statut === statut);
  },
}));

// ===========================================
// SELECTORS
// ===========================================

export const selectEdition = (state: RapportState) => state.edition;
export const selectRapportEnEdition = (state: RapportState) => state.edition.rapport;
export const selectSectionSelectionnee = (state: RapportState) => state.edition.sectionSelectionnee;
export const selectBlocSelectionne = (state: RapportState) => state.edition.blocSelectionne;
export const selectIsDirty = (state: RapportState) => state.edition.isDirty;
export const selectCanUndo = (state: RapportState) => state.edition.historiqueUndo.length > 0;
export const selectCanRedo = (state: RapportState) => state.edition.historiqueRedo.length > 0;
