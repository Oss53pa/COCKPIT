/**
 * Export Helpers - Génération PDF/Excel/Word pour Rapport Studio
 * Utilise jsPDF et xlsx (déjà disponibles dans le projet)
 */

import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import type {
  RapportGenere,
  SectionRapport,
  BlocContenu,
  FormatExport,
  OptionsExport,
  ResultatKPI
} from '../types/bi';

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface StylePDF {
  fontSize: number;
  fontStyle: 'normal' | 'bold' | 'italic';
  textColor: [number, number, number];
  marginLeft: number;
}

interface TableauData {
  headers: string[];
  rows: (string | number)[][];
}

interface ChartData {
  type: string;
  data: unknown;
  options?: unknown;
}

// ============================================================================
// CONSTANTES DE STYLE
// ============================================================================

const STYLES_PDF: Record<string, StylePDF> = {
  titre: {
    fontSize: 24,
    fontStyle: 'bold',
    textColor: [33, 37, 41],
    marginLeft: 20
  },
  sousTitre: {
    fontSize: 18,
    fontStyle: 'bold',
    textColor: [52, 58, 64],
    marginLeft: 20
  },
  sectionTitre: {
    fontSize: 14,
    fontStyle: 'bold',
    textColor: [73, 80, 87],
    marginLeft: 20
  },
  paragraphe: {
    fontSize: 11,
    fontStyle: 'normal',
    textColor: [33, 37, 41],
    marginLeft: 20
  },
  tableHeader: {
    fontSize: 10,
    fontStyle: 'bold',
    textColor: [255, 255, 255],
    marginLeft: 20
  },
  tableCell: {
    fontSize: 9,
    fontStyle: 'normal',
    textColor: [33, 37, 41],
    marginLeft: 20
  }
};

const COULEURS = {
  primaire: [59, 130, 246] as [number, number, number],
  secondaire: [100, 116, 139] as [number, number, number],
  succes: [34, 197, 94] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  fond: [248, 250, 252] as [number, number, number],
  bordure: [226, 232, 240] as [number, number, number]
};

const MARGES = {
  haut: 20,
  bas: 20,
  gauche: 20,
  droite: 20
};

// ============================================================================
// GÉNÉRATION PDF
// ============================================================================

/**
 * Génère un document PDF à partir d'un rapport
 */
export function genererPDF(
  rapport: RapportGenere,
  options: OptionsExport = {}
): Blob {
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'mm',
    format: options.format || 'a4'
  });

  let positionY = MARGES.haut;
  const largeurPage = doc.internal.pageSize.getWidth();
  const hauteurPage = doc.internal.pageSize.getHeight();
  const largeurUtile = largeurPage - MARGES.gauche - MARGES.droite;

  // En-tête avec logo (si fourni)
  if (options.inclureLogo) {
    positionY = ajouterEnTetePDF(doc, rapport, positionY, largeurUtile);
  }

  // Titre du rapport
  positionY = ajouterTitrePDF(doc, rapport.titre, positionY);

  // Sous-titre avec période
  if (rapport.periode) {
    const periode = `Période: ${formatDate(rapport.periode.debut)} - ${formatDate(rapport.periode.fin)}`;
    positionY = ajouterTextePDF(doc, periode, positionY, STYLES_PDF.sousTitre);
  }

  // Date de génération
  const dateGen = `Généré le ${formatDate(new Date())}`;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(dateGen, largeurPage - MARGES.droite, MARGES.haut, { align: 'right' });

  positionY += 10;

  // Parcourir les sections
  for (const section of rapport.sections) {
    // Vérifier si nouvelle page nécessaire
    if (positionY > hauteurPage - 60) {
      doc.addPage();
      positionY = MARGES.haut;
      if (options.inclureEntete) {
        positionY = ajouterEnTetePagePDF(doc, rapport, positionY);
      }
    }

    positionY = ajouterSectionPDF(doc, section, positionY, largeurUtile, options);
  }

  // Pied de page si demandé
  if (options.inclurePiedPage) {
    ajouterPiedPagePDF(doc, rapport);
  }

  // Numérotation des pages
  if (options.inclureNumeroPage !== false) {
    ajouterNumerotationPagesPDF(doc);
  }

  return doc.output('blob');
}

function ajouterEnTetePDF(
  doc: jsPDF,
  rapport: RapportGenere,
  positionY: number,
  _largeurUtile: number
): number {
  // Rectangle d'en-tête
  doc.setFillColor(...COULEURS.primaire);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 15, 'F');

  // Nom du centre si disponible
  if (rapport.centreId) {
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(rapport.centreId, MARGES.gauche, 10);
  }

  return positionY + 10;
}

function ajouterEnTetePagePDF(
  doc: jsPDF,
  rapport: RapportGenere,
  positionY: number
): number {
  doc.setFontSize(9);
  doc.setTextColor(...COULEURS.secondaire);
  doc.text(rapport.titre, MARGES.gauche, positionY);
  doc.setDrawColor(...COULEURS.bordure);
  doc.line(MARGES.gauche, positionY + 2, doc.internal.pageSize.getWidth() - MARGES.droite, positionY + 2);
  return positionY + 10;
}

function ajouterTitrePDF(doc: jsPDF, titre: string, positionY: number): number {
  const style = STYLES_PDF.titre;
  doc.setFontSize(style.fontSize);
  doc.setFont('helvetica', style.fontStyle);
  doc.setTextColor(...style.textColor);
  doc.text(titre, style.marginLeft, positionY);
  return positionY + 12;
}

function ajouterTextePDF(
  doc: jsPDF,
  texte: string,
  positionY: number,
  style: StylePDF
): number {
  doc.setFontSize(style.fontSize);
  doc.setFont('helvetica', style.fontStyle);
  doc.setTextColor(...style.textColor);

  const largeurUtile = doc.internal.pageSize.getWidth() - MARGES.gauche - MARGES.droite;
  const lignes = doc.splitTextToSize(texte, largeurUtile);

  doc.text(lignes, style.marginLeft, positionY);
  return positionY + (lignes.length * style.fontSize * 0.4) + 4;
}

function ajouterSectionPDF(
  doc: jsPDF,
  section: SectionRapport,
  positionY: number,
  largeurUtile: number,
  options: OptionsExport
): number {
  // Titre de section
  positionY = ajouterTextePDF(doc, section.titre, positionY, STYLES_PDF.sectionTitre);
  positionY += 2;

  // Parcourir les blocs
  for (const bloc of section.blocs) {
    // Vérifier nouvelle page
    if (positionY > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      positionY = MARGES.haut;
    }

    positionY = ajouterBlocPDF(doc, bloc, positionY, largeurUtile, options);
  }

  return positionY + 8;
}

function ajouterBlocPDF(
  doc: jsPDF,
  bloc: BlocContenu,
  positionY: number,
  largeurUtile: number,
  _options: OptionsExport
): number {
  switch (bloc.type) {
    case 'paragraphe':
      return ajouterParagraphePDF(doc, bloc, positionY);

    case 'tableau':
      return ajouterTableauPDF(doc, bloc, positionY, largeurUtile);

    case 'graphique':
      return ajouterGraphiquePDF(doc, bloc, positionY, largeurUtile);

    case 'kpi_card':
      return ajouterKPICardPDF(doc, bloc, positionY, largeurUtile);

    case 'liste':
      return ajouterListePDF(doc, bloc, positionY);

    case 'separateur':
      return ajouterSeparateurPDF(doc, positionY, largeurUtile);

    case 'citation':
      return ajouterCitationPDF(doc, bloc, positionY, largeurUtile);

    case 'alerte':
      return ajouterAlertePDF(doc, bloc, positionY, largeurUtile);

    default:
      return positionY;
  }
}

function ajouterParagraphePDF(
  doc: jsPDF,
  bloc: BlocContenu,
  positionY: number
): number {
  const contenu = bloc.contenu as { texte: string };
  if (!contenu.texte) return positionY;

  return ajouterTextePDF(doc, contenu.texte, positionY, STYLES_PDF.paragraphe);
}

function ajouterTableauPDF(
  doc: jsPDF,
  bloc: BlocContenu,
  positionY: number,
  largeurUtile: number
): number {
  const contenu = bloc.contenu as TableauData;
  if (!contenu.headers || !contenu.rows) return positionY;

  const nbColonnes = contenu.headers.length;
  const largeurColonne = largeurUtile / nbColonnes;
  const hauteurLigne = 8;

  // En-têtes
  doc.setFillColor(...COULEURS.primaire);
  doc.rect(MARGES.gauche, positionY, largeurUtile, hauteurLigne, 'F');

  doc.setFontSize(STYLES_PDF.tableHeader.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);

  contenu.headers.forEach((header, index) => {
    const x = MARGES.gauche + (index * largeurColonne) + 2;
    doc.text(String(header), x, positionY + 5.5);
  });

  positionY += hauteurLigne;

  // Lignes de données
  doc.setFontSize(STYLES_PDF.tableCell.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...STYLES_PDF.tableCell.textColor);

  contenu.rows.forEach((row, rowIndex) => {
    // Vérifier nouvelle page
    if (positionY > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      positionY = MARGES.haut;
    }

    // Fond alterné
    if (rowIndex % 2 === 0) {
      doc.setFillColor(...COULEURS.fond);
      doc.rect(MARGES.gauche, positionY, largeurUtile, hauteurLigne, 'F');
    }

    // Bordure
    doc.setDrawColor(...COULEURS.bordure);
    doc.rect(MARGES.gauche, positionY, largeurUtile, hauteurLigne, 'S');

    row.forEach((cell, colIndex) => {
      const x = MARGES.gauche + (colIndex * largeurColonne) + 2;
      const texte = formaterValeurTableau(cell);
      doc.text(texte, x, positionY + 5.5);
    });

    positionY += hauteurLigne;
  });

  return positionY + 4;
}

function ajouterGraphiquePDF(
  doc: jsPDF,
  bloc: BlocContenu,
  positionY: number,
  largeurUtile: number
): number {
  const contenu = bloc.contenu as ChartData;

  // Placeholder pour graphique (les vrais graphiques nécessitent html2canvas)
  const hauteurGraphique = 60;

  doc.setFillColor(...COULEURS.fond);
  doc.setDrawColor(...COULEURS.bordure);
  doc.roundedRect(MARGES.gauche, positionY, largeurUtile, hauteurGraphique, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setTextColor(...COULEURS.secondaire);
  const texteGraphique = `[Graphique: ${contenu.type || 'bar'}]`;
  doc.text(texteGraphique, MARGES.gauche + largeurUtile / 2, positionY + hauteurGraphique / 2, { align: 'center' });

  return positionY + hauteurGraphique + 6;
}

function ajouterKPICardPDF(
  doc: jsPDF,
  bloc: BlocContenu,
  positionY: number,
  largeurUtile: number
): number {
  const contenu = bloc.contenu as { kpis: ResultatKPI[] };
  if (!contenu.kpis || contenu.kpis.length === 0) return positionY;

  const nbKPIs = Math.min(contenu.kpis.length, 4);
  const largeurKPI = (largeurUtile - (nbKPIs - 1) * 4) / nbKPIs;
  const hauteurKPI = 30;

  contenu.kpis.slice(0, 4).forEach((kpi, index) => {
    const x = MARGES.gauche + index * (largeurKPI + 4);

    // Fond de la carte
    const couleurFond = getCouleurStatut(kpi.statut);
    doc.setFillColor(...couleurFond);
    doc.roundedRect(x, positionY, largeurKPI, hauteurKPI, 2, 2, 'F');

    // Valeur
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 37, 41);
    const valeurTexte = formaterValeurKPI(kpi.valeur, kpi.unite);
    doc.text(valeurTexte, x + largeurKPI / 2, positionY + 12, { align: 'center' });

    // Nom du KPI
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.nom, x + largeurKPI / 2, positionY + 22, { align: 'center' });

    // Variation si disponible
    if (kpi.variation !== undefined) {
      doc.setFontSize(7);
      const variationTexte = `${kpi.variation >= 0 ? '+' : ''}${kpi.variation.toFixed(1)}%`;
      doc.setTextColor(kpi.variation >= 0 ? 34 : 239, kpi.variation >= 0 ? 197 : 68, kpi.variation >= 0 ? 94 : 68);
      doc.text(variationTexte, x + largeurKPI / 2, positionY + 27, { align: 'center' });
    }
  });

  return positionY + hauteurKPI + 6;
}

function ajouterListePDF(
  doc: jsPDF,
  bloc: BlocContenu,
  positionY: number
): number {
  const contenu = bloc.contenu as { items: string[]; style?: 'bullet' | 'number' };
  if (!contenu.items) return positionY;

  doc.setFontSize(STYLES_PDF.paragraphe.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...STYLES_PDF.paragraphe.textColor);

  contenu.items.forEach((item, index) => {
    const prefix = contenu.style === 'number' ? `${index + 1}. ` : '• ';
    doc.text(prefix + item, MARGES.gauche + 5, positionY);
    positionY += 6;
  });

  return positionY + 2;
}

function ajouterSeparateurPDF(
  doc: jsPDF,
  positionY: number,
  largeurUtile: number
): number {
  doc.setDrawColor(...COULEURS.bordure);
  doc.setLineWidth(0.5);
  doc.line(MARGES.gauche, positionY, MARGES.gauche + largeurUtile, positionY);
  return positionY + 6;
}

function ajouterCitationPDF(
  doc: jsPDF,
  bloc: BlocContenu,
  positionY: number,
  largeurUtile: number
): number {
  const contenu = bloc.contenu as { texte: string; auteur?: string };
  if (!contenu.texte) return positionY;

  // Barre latérale
  doc.setFillColor(...COULEURS.primaire);
  doc.rect(MARGES.gauche, positionY, 3, 20, 'F');

  // Texte en italique
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...STYLES_PDF.paragraphe.textColor);

  const lignes = doc.splitTextToSize(contenu.texte, largeurUtile - 10);
  doc.text(lignes, MARGES.gauche + 8, positionY + 4);

  const hauteur = lignes.length * 5 + 6;

  if (contenu.auteur) {
    doc.setFontSize(9);
    doc.setTextColor(...COULEURS.secondaire);
    doc.text(`— ${contenu.auteur}`, MARGES.gauche + 8, positionY + hauteur);
  }

  return positionY + hauteur + 8;
}

function ajouterAlertePDF(
  doc: jsPDF,
  bloc: BlocContenu,
  positionY: number,
  largeurUtile: number
): number {
  const contenu = bloc.contenu as { type: 'info' | 'warning' | 'error' | 'success'; message: string };
  if (!contenu.message) return positionY;

  const couleursAlerte: Record<string, [number, number, number]> = {
    info: [219, 234, 254],
    warning: [254, 243, 199],
    error: [254, 226, 226],
    success: [220, 252, 231]
  };

  const couleur = couleursAlerte[contenu.type] || couleursAlerte.info;

  doc.setFillColor(...couleur);
  doc.roundedRect(MARGES.gauche, positionY, largeurUtile, 15, 2, 2, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(33, 37, 41);
  doc.text(contenu.message, MARGES.gauche + 5, positionY + 9);

  return positionY + 20;
}

function ajouterPiedPagePDF(doc: jsPDF, rapport: RapportGenere): void {
  const nombrePages = doc.getNumberOfPages();
  const hauteurPage = doc.internal.pageSize.getHeight();
  const largeurPage = doc.internal.pageSize.getWidth();

  for (let i = 1; i <= nombrePages; i++) {
    doc.setPage(i);

    doc.setDrawColor(...COULEURS.bordure);
    doc.line(MARGES.gauche, hauteurPage - 15, largeurPage - MARGES.droite, hauteurPage - 15);

    doc.setFontSize(8);
    doc.setTextColor(...COULEURS.secondaire);
    doc.text(rapport.titre, MARGES.gauche, hauteurPage - 8);
    doc.text(`Confidentiel`, largeurPage - MARGES.droite, hauteurPage - 8, { align: 'right' });
  }
}

function ajouterNumerotationPagesPDF(doc: jsPDF): void {
  const nombrePages = doc.getNumberOfPages();
  const largeurPage = doc.internal.pageSize.getWidth();
  const hauteurPage = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= nombrePages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(...COULEURS.secondaire);
    doc.text(`${i} / ${nombrePages}`, largeurPage / 2, hauteurPage - 8, { align: 'center' });
  }
}

// ============================================================================
// GÉNÉRATION EXCEL
// ============================================================================

/**
 * Génère un fichier Excel à partir d'un rapport
 */
export function genererExcel(
  rapport: RapportGenere,
  options: OptionsExport = {}
): Blob {
  const workbook = XLSX.utils.book_new();

  // Feuille de résumé
  const resumeData = creerFeuilleResume(rapport);
  const wsResume = XLSX.utils.aoa_to_sheet(resumeData);
  appliquerStylesExcel(wsResume, 'resume');
  XLSX.utils.book_append_sheet(workbook, wsResume, 'Résumé');

  // Une feuille par section
  rapport.sections.forEach((section, index) => {
    const sectionData = creerFeuilleSection(section);
    const wsSection = XLSX.utils.aoa_to_sheet(sectionData);
    appliquerStylesExcel(wsSection, 'section');

    // Nom de feuille valide (max 31 caractères, pas de caractères spéciaux)
    const nomFeuille = sanitizeSheetName(section.titre, index);
    XLSX.utils.book_append_sheet(workbook, wsSection, nomFeuille);
  });

  // Feuille de données brutes si demandée
  if (options.inclureDonneesBrutes) {
    const donneesData = creerFeuilleDonneesBrutes(rapport);
    if (donneesData.length > 0) {
      const wsDonnees = XLSX.utils.aoa_to_sheet(donneesData);
      XLSX.utils.book_append_sheet(workbook, wsDonnees, 'Données');
    }
  }

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function creerFeuilleResume(rapport: RapportGenere): (string | number)[][] {
  const data: (string | number)[][] = [];

  // Titre
  data.push([rapport.titre]);
  data.push([]);

  // Métadonnées
  data.push(['Informations du rapport']);
  data.push(['Type', rapport.typeRapport || '']);

  if (rapport.periode) {
    data.push(['Période début', formatDate(rapport.periode.debut)]);
    data.push(['Période fin', formatDate(rapport.periode.fin)]);
  }

  data.push(['Date de génération', formatDate(new Date())]);
  data.push(['Statut', rapport.statut]);
  data.push(['Version', rapport.version]);
  data.push([]);

  // Résumé des sections
  data.push(['Sections du rapport']);
  data.push(['#', 'Titre', 'Nombre de blocs']);

  rapport.sections.forEach((section, index) => {
    data.push([index + 1, section.titre, section.blocs.length]);
  });

  return data;
}

function creerFeuilleSection(section: SectionRapport): (string | number)[][] {
  const data: (string | number)[][] = [];

  // Titre de la section
  data.push([section.titre]);
  data.push([]);

  // Parcourir les blocs
  for (const bloc of section.blocs) {
    const blocData = extraireDonneesBlocExcel(bloc);
    if (blocData.length > 0) {
      data.push(...blocData);
      data.push([]);
    }
  }

  return data;
}

function extraireDonneesBlocExcel(bloc: BlocContenu): (string | number)[][] {
  const data: (string | number)[][] = [];

  switch (bloc.type) {
    case 'paragraphe': {
      const contenu = bloc.contenu as { texte: string };
      if (contenu.texte) {
        data.push([contenu.texte]);
      }
      break;
    }

    case 'tableau': {
      const contenu = bloc.contenu as TableauData;
      if (contenu.headers && contenu.rows) {
        data.push(contenu.headers);
        contenu.rows.forEach(row => {
          data.push(row.map(cell => cell));
        });
      }
      break;
    }

    case 'kpi_card': {
      const contenu = bloc.contenu as { kpis: ResultatKPI[] };
      if (contenu.kpis && contenu.kpis.length > 0) {
        data.push(['KPI', 'Valeur', 'Unité', 'Statut', 'Variation']);
        contenu.kpis.forEach(kpi => {
          data.push([
            kpi.nom,
            kpi.valeur,
            kpi.unite || '',
            kpi.statut,
            kpi.variation !== undefined ? `${kpi.variation}%` : ''
          ]);
        });
      }
      break;
    }

    case 'liste': {
      const contenu = bloc.contenu as { items: string[] };
      if (contenu.items) {
        contenu.items.forEach((item, index) => {
          data.push([`${index + 1}. ${item}`]);
        });
      }
      break;
    }

    case 'alerte': {
      const contenu = bloc.contenu as { type: string; message: string };
      if (contenu.message) {
        data.push([`[${contenu.type?.toUpperCase()}] ${contenu.message}`]);
      }
      break;
    }
  }

  return data;
}

function creerFeuilleDonneesBrutes(rapport: RapportGenere): (string | number)[][] {
  const data: (string | number)[][] = [];
  let premierTableau = true;

  // Extraire tous les tableaux du rapport
  for (const section of rapport.sections) {
    for (const bloc of section.blocs) {
      if (bloc.type === 'tableau') {
        const contenu = bloc.contenu as TableauData;
        if (contenu.headers && contenu.rows) {
          if (!premierTableau) {
            data.push([]);
            data.push([`--- ${section.titre} ---`]);
          }
          data.push(contenu.headers);
          contenu.rows.forEach(row => data.push(row.map(c => c)));
          premierTableau = false;
        }
      }
    }
  }

  return data;
}

function appliquerStylesExcel(worksheet: XLSX.WorkSheet, _type: 'resume' | 'section'): void {
  // xlsx library a un support limité pour les styles
  // On définit au moins les largeurs de colonnes
  if (!worksheet['!cols']) {
    worksheet['!cols'] = [];
  }

  // Largeurs de colonnes par défaut
  for (let i = 0; i < 10; i++) {
    worksheet['!cols'][i] = { wch: 20 };
  }
}

function sanitizeSheetName(name: string, index: number): string {
  // Caractères invalides pour les noms de feuilles Excel
  const invalidChars = /[\\/*?:\[\]]/g;
  let sanitized = name.replace(invalidChars, '').trim();

  // Maximum 31 caractères
  if (sanitized.length > 28) {
    sanitized = sanitized.substring(0, 28);
  }

  // Ajouter index si nécessaire pour unicité
  return `${index + 1}. ${sanitized}`;
}

// ============================================================================
// GÉNÉRATION WORD (RTF simplifié)
// ============================================================================

/**
 * Génère un document Word (format RTF) à partir d'un rapport
 */
export function genererWord(
  rapport: RapportGenere,
  _options: OptionsExport = {}
): Blob {
  let rtf = '{\\rtf1\\ansi\\deff0\n';

  // Définition des polices
  rtf += '{\\fonttbl{\\f0\\fswiss Helvetica;}{\\f1\\fmodern Courier New;}}\n';

  // Définition des couleurs
  rtf += '{\\colortbl;\\red59\\green130\\blue246;\\red100\\green116\\blue139;\\red33\\green37\\blue41;}\n';

  // Titre
  rtf += `\\f0\\fs48\\b ${escapeRTF(rapport.titre)}\\b0\\par\\par\n`;

  // Période
  if (rapport.periode) {
    rtf += `\\fs24\\cf2 Période: ${formatDate(rapport.periode.debut)} - ${formatDate(rapport.periode.fin)}\\cf0\\par\\par\n`;
  }

  // Date de génération
  rtf += `\\fs20\\cf2 Généré le ${formatDate(new Date())}\\cf0\\par\\par\n`;

  // Sections
  for (const section of rapport.sections) {
    rtf += genererSectionRTF(section);
  }

  rtf += '}';

  return new Blob([rtf], { type: 'application/rtf' });
}

function genererSectionRTF(section: SectionRapport): string {
  let rtf = '';

  // Titre de section
  rtf += `\\fs32\\b ${escapeRTF(section.titre)}\\b0\\par\\par\n`;

  // Blocs
  for (const bloc of section.blocs) {
    rtf += genererBlocRTF(bloc);
  }

  rtf += '\\par\n';
  return rtf;
}

function genererBlocRTF(bloc: BlocContenu): string {
  let rtf = '';

  switch (bloc.type) {
    case 'paragraphe': {
      const contenu = bloc.contenu as { texte: string };
      if (contenu.texte) {
        rtf += `\\fs22 ${escapeRTF(contenu.texte)}\\par\\par\n`;
      }
      break;
    }

    case 'tableau': {
      const contenu = bloc.contenu as TableauData;
      if (contenu.headers && contenu.rows) {
        rtf += genererTableauRTF(contenu);
      }
      break;
    }

    case 'kpi_card': {
      const contenu = bloc.contenu as { kpis: ResultatKPI[] };
      if (contenu.kpis) {
        contenu.kpis.forEach(kpi => {
          const valeur = formaterValeurKPI(kpi.valeur, kpi.unite);
          rtf += `\\fs28\\b ${valeur}\\b0 - ${escapeRTF(kpi.nom)}\\par\n`;
        });
        rtf += '\\par\n';
      }
      break;
    }

    case 'liste': {
      const contenu = bloc.contenu as { items: string[] };
      if (contenu.items) {
        contenu.items.forEach((item, index) => {
          rtf += `\\fs22 ${index + 1}. ${escapeRTF(item)}\\par\n`;
        });
        rtf += '\\par\n';
      }
      break;
    }

    case 'separateur':
      rtf += '\\par\\pard\\brdrb\\brdrs\\brdrw10\\brsp20 \\par\\pard\\par\n';
      break;

    case 'citation': {
      const contenu = bloc.contenu as { texte: string; auteur?: string };
      if (contenu.texte) {
        rtf += `\\fs22\\i ${escapeRTF(contenu.texte)}\\i0\\par\n`;
        if (contenu.auteur) {
          rtf += `\\fs20\\cf2 — ${escapeRTF(contenu.auteur)}\\cf0\\par\n`;
        }
        rtf += '\\par\n';
      }
      break;
    }

    case 'alerte': {
      const contenu = bloc.contenu as { type: string; message: string };
      if (contenu.message) {
        rtf += `\\fs22\\b [${contenu.type?.toUpperCase()}]\\b0  ${escapeRTF(contenu.message)}\\par\\par\n`;
      }
      break;
    }
  }

  return rtf;
}

function genererTableauRTF(tableau: TableauData): string {
  let rtf = '';
  const nbCols = tableau.headers.length;
  const largeurCol = Math.floor(9000 / nbCols); // ~9 pouces de largeur totale

  // En-têtes
  rtf += '\\trowd\n';
  for (let i = 0; i < nbCols; i++) {
    rtf += `\\cellx${(i + 1) * largeurCol}\n`;
  }

  tableau.headers.forEach(header => {
    rtf += `\\intbl\\b ${escapeRTF(String(header))}\\b0\\cell\n`;
  });
  rtf += '\\row\n';

  // Lignes de données
  tableau.rows.forEach(row => {
    rtf += '\\trowd\n';
    for (let i = 0; i < nbCols; i++) {
      rtf += `\\cellx${(i + 1) * largeurCol}\n`;
    }

    row.forEach(cell => {
      rtf += `\\intbl ${escapeRTF(String(cell))}\\cell\n`;
    });
    rtf += '\\row\n';
  });

  rtf += '\\par\n';
  return rtf;
}

function escapeRTF(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\n/g, '\\par ')
    .replace(/[^\x00-\x7F]/g, char => `\\u${char.charCodeAt(0)}?`);
}

// ============================================================================
// FONCTION PRINCIPALE D'EXPORT
// ============================================================================

/**
 * Exporte un rapport dans le format demandé
 */
export async function exporterRapport(
  rapport: RapportGenere,
  format: FormatExport,
  options: OptionsExport = {}
): Promise<{ blob: Blob; nomFichier: string }> {
  let blob: Blob;
  let extension: string;

  switch (format) {
    case 'pdf':
      blob = genererPDF(rapport, options);
      extension = 'pdf';
      break;

    case 'excel':
      blob = genererExcel(rapport, options);
      extension = 'xlsx';
      break;

    case 'word':
      blob = genererWord(rapport, options);
      extension = 'rtf';
      break;

    default:
      throw new Error(`Format d'export non supporté: ${format}`);
  }

  // Générer le nom de fichier
  const dateStr = new Date().toISOString().slice(0, 10);
  const titreNormalise = rapport.titre
    .toLowerCase()
    .replace(/[^a-z0-9àâäéèêëïîôùûüç]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 50);

  const nomFichier = `${titreNormalise}_${dateStr}.${extension}`;

  return { blob, nomFichier };
}

/**
 * Télécharge un rapport exporté
 */
export function telechargerRapport(blob: Blob, nomFichier: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomFichier;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export et téléchargement combinés
 */
export async function exporterEtTelecharger(
  rapport: RapportGenere,
  format: FormatExport,
  options: OptionsExport = {}
): Promise<void> {
  const { blob, nomFichier } = await exporterRapport(rapport, format, options);
  telechargerRapport(blob, nomFichier);
}

// ============================================================================
// UTILITAIRES
// ============================================================================

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formaterValeurTableau(valeur: string | number): string {
  if (typeof valeur === 'number') {
    if (Number.isInteger(valeur)) {
      return valeur.toLocaleString('fr-FR');
    }
    return valeur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(valeur);
}

function formaterValeurKPI(valeur: number, unite?: string): string {
  let formatted: string;

  if (unite === '%') {
    formatted = `${valeur.toFixed(1)}%`;
  } else if (unite === '€' || unite === '€/m²') {
    formatted = `${valeur.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${unite}`;
  } else if (unite === 'ans' || unite === 'mois') {
    formatted = `${valeur.toFixed(1)} ${unite}`;
  } else {
    formatted = valeur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (unite) {
      formatted += ` ${unite}`;
    }
  }

  return formatted;
}

function getCouleurStatut(statut: string): [number, number, number] {
  switch (statut) {
    case 'excellent':
      return [220, 252, 231]; // vert clair
    case 'bon':
      return [219, 234, 254]; // bleu clair
    case 'attention':
      return [254, 243, 199]; // jaune clair
    case 'alerte':
      return [254, 226, 226]; // rouge clair
    default:
      return [248, 250, 252]; // gris clair
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  STYLES_PDF,
  COULEURS,
  MARGES
};
