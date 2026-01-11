/**
 * Report Export Utilities
 * Generates exports in various formats: PDF, DOCX, XLSX, HTML, Markdown
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';
import type {
  StudioReport,
  ContentTree,
  Section,
  ContentBlock,
  ExportFormat,
  ExportOptions,
  ChartBlock,
  TableBlock,
  ListBlock,
  KPICardBlock,
} from '../types/reportStudio';
import type {
  Rapport,
  SectionRapport,
  BlocRapport,
} from '../types/bi';

// ============================================================================
// Types
// ============================================================================

export interface ExportResult {
  success: boolean;
  blob?: Blob;
  filename?: string;
  error?: string;
}

// ============================================================================
// Page Size Constants
// ============================================================================

const PAGE_SIZES = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 216, height: 279 },
};

const MARGINS = {
  normal: { top: 25, right: 25, bottom: 25, left: 25 },
  narrow: { top: 15, right: 15, bottom: 15, left: 15 },
  wide: { top: 35, right: 35, bottom: 35, left: 35 },
};

// ============================================================================
// Main Export Function
// ============================================================================

export async function exportReport(
  report: StudioReport,
  content: ContentTree,
  format: ExportFormat,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    switch (format) {
      case 'pdf':
        return await exportToPDF(report, content, options);
      case 'docx':
        return await exportToDOCX(report, content, options);
      case 'xlsx':
        return exportToXLSX(report, content, options);
      case 'html':
        return exportToHTML(report, content, options);
      case 'markdown':
        return exportToMarkdown(report, content, options);
      case 'pptx':
        return await exportToPPTX(report, content, options);
      default:
        return { success: false, error: `Format non supporté: ${format}` };
    }
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'export',
    };
  }
}

// ============================================================================
// PDF Export
// ============================================================================

// Design theme helper
interface DesignTheme {
  primaryColor: [number, number, number];
  textColor: [number, number, number];
  backgroundColor: [number, number, number];
  baseFontSize: number;
}

function getDesignTheme(report: StudioReport): DesignTheme {
  const settings = report.designSettings;

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [28, 49, 99]; // Default primary
  };

  return {
    primaryColor: settings?.colors?.primary
      ? hexToRgb(settings.colors.primary)
      : [28, 49, 99],
    textColor: settings?.colors?.text
      ? hexToRgb(settings.colors.text)
      : [51, 51, 51],
    backgroundColor: settings?.colors?.background
      ? hexToRgb(settings.colors.background)
      : [255, 255, 255],
    baseFontSize: settings?.typography?.baseFontSize || 11,
  };
}

async function exportToPDF(
  report: StudioReport,
  content: ContentTree,
  options: ExportOptions
): Promise<ExportResult> {
  const settings = report.designSettings;
  const pageSize = PAGE_SIZES[settings?.pageFormat?.size || options.pageSize || 'A4'];
  const margins = MARGINS[settings?.pageFormat?.margins || options.margins || 'normal'];
  const orientation = settings?.pageFormat?.orientation || options.orientation || 'portrait';
  const isLandscape = orientation === 'landscape';

  const theme = getDesignTheme(report);

  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: (settings?.pageFormat?.size || options.pageSize || 'A4').toLowerCase(),
  });

  const pageWidth = isLandscape ? pageSize.height : pageSize.width;
  const pageHeight = isLandscape ? pageSize.width : pageSize.height;
  const contentWidth = pageWidth - margins.left - margins.right;

  let yPosition = margins.top;

  // Cover page
  const includeCover = settings?.cover?.enabled ?? options.includeCoverPage;
  if (includeCover) {
    yPosition = addCoverPage(doc, report, pageWidth, pageHeight, margins, theme);
    doc.addPage();
    yPosition = margins.top;
  }

  // Table of contents
  const includeToc = settings?.tableOfContents?.enabled ?? options.includeTableOfContents;
  if (includeToc) {
    yPosition = addTableOfContents(doc, content, pageWidth, margins, yPosition, theme);
    doc.addPage();
    yPosition = margins.top;
  }

  // Content
  for (const section of content.sections) {
    yPosition = await addSectionToPDF(
      doc,
      section,
      contentWidth,
      pageHeight,
      margins,
      yPosition,
      theme
    );
  }

  // Add page numbers and footer
  addPageNumbers(doc, margins, pageWidth, pageHeight, settings?.branding?.footerText);

  const blob = doc.output('blob');
  const filename = `${sanitizeFilename(report.title)}.pdf`;

  return { success: true, blob, filename };
}

function addCoverPage(
  doc: jsPDF,
  report: StudioReport,
  pageWidth: number,
  pageHeight: number,
  margins: typeof MARGINS.normal,
  theme: DesignTheme
): number {
  const settings = report.designSettings;
  const coverTitle = settings?.cover?.title || report.title;
  const coverSubtitle = settings?.cover?.subtitle || report.description;

  // Background color
  doc.setFillColor(theme.primaryColor[0], theme.primaryColor[1], theme.primaryColor[2]);
  doc.rect(0, 0, pageWidth, pageHeight / 3, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(coverTitle, pageWidth / 2, pageHeight / 6, { align: 'center' });

  // Subtitle/Description
  if (coverSubtitle) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(coverSubtitle, pageWidth / 2, pageHeight / 6 + 20, {
      align: 'center',
      maxWidth: pageWidth - 60,
    });
  }

  // Period
  doc.setTextColor(theme.textColor[0], theme.textColor[1], theme.textColor[2]);
  doc.setFontSize(12);
  if (report.periodLabel) {
    doc.text(`Période: ${report.periodLabel}`, margins.left, pageHeight / 2);
  }

  // Author
  doc.text(`Auteur: ${report.author}`, margins.left, pageHeight / 2 + 10);

  // Date
  const date = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Généré le: ${date}`, margins.left, pageHeight / 2 + 20);

  return margins.top;
}

function addTableOfContents(
  doc: jsPDF,
  content: ContentTree,
  pageWidth: number,
  margins: typeof MARGINS.normal,
  yPosition: number,
  theme: DesignTheme
): number {
  doc.setTextColor(theme.primaryColor[0], theme.primaryColor[1], theme.primaryColor[2]);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Table des matières', margins.left, yPosition);
  yPosition += 15;

  doc.setTextColor(theme.textColor[0], theme.textColor[1], theme.textColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  content.sections.forEach((section, index) => {
    const indent = (section.level - 1) * 5;
    doc.text(
      `${index + 1}. ${section.title}`,
      margins.left + indent,
      yPosition
    );
    yPosition += 8;
  });

  return yPosition;
}

async function addSectionToPDF(
  doc: jsPDF,
  section: Section,
  contentWidth: number,
  pageHeight: number,
  margins: typeof MARGINS.normal,
  yPosition: number,
  theme: DesignTheme
): Promise<number> {
  // Check if we need a new page
  if (yPosition > pageHeight - margins.bottom - 30) {
    doc.addPage();
    yPosition = margins.top;
  }

  // Section title
  doc.setTextColor(theme.primaryColor[0], theme.primaryColor[1], theme.primaryColor[2]);
  const fontSize = Math.max(20 - (section.level - 1) * 4, 12);
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(section.title, margins.left, yPosition);
  yPosition += fontSize / 2 + 5;

  // Reset text color for content
  doc.setTextColor(theme.textColor[0], theme.textColor[1], theme.textColor[2]);
  doc.setFont('helvetica', 'normal');

  // Blocks
  for (const block of section.blocks) {
    yPosition = addBlockToPDF(doc, block, contentWidth, pageHeight, margins, yPosition, theme);
  }

  // Children sections
  for (const child of section.children) {
    yPosition = await addSectionToPDF(doc, child, contentWidth, pageHeight, margins, yPosition, theme);
  }

  return yPosition + 10;
}

function addBlockToPDF(
  doc: jsPDF,
  block: ContentBlock,
  contentWidth: number,
  pageHeight: number,
  margins: typeof MARGINS.normal,
  yPosition: number,
  theme: DesignTheme
): number {
  // Check if we need a new page
  if (yPosition > pageHeight - margins.bottom - 20) {
    doc.addPage();
    yPosition = margins.top;
  }

  switch (block.type) {
    case 'paragraph':
      doc.setFontSize(theme.baseFontSize);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(block.content, contentWidth);
      doc.text(lines, margins.left, yPosition);
      yPosition += lines.length * 5 + 5;
      break;

    case 'heading':
      const headingSize = Math.max(18 - (block.level - 1) * 2, 12);
      doc.setFontSize(headingSize);
      doc.setFont('helvetica', 'bold');
      doc.text(block.content, margins.left, yPosition);
      yPosition += headingSize / 2 + 8;
      break;

    case 'list':
      yPosition = addListToPDF(doc, block, margins, yPosition);
      break;

    case 'table':
      yPosition = addTableToPDF(doc, block, contentWidth, margins, yPosition, pageHeight);
      break;

    case 'kpi_card':
      yPosition = addKPIToPDF(doc, block, margins, yPosition);
      break;

    case 'callout':
      yPosition = addCalloutToPDF(doc, block, contentWidth, margins, yPosition);
      break;

    case 'divider':
      doc.setDrawColor(200, 200, 200);
      doc.line(margins.left, yPosition, margins.left + contentWidth, yPosition);
      yPosition += 10;
      break;

    case 'pagebreak':
      doc.addPage();
      yPosition = margins.top;
      break;

    case 'quote':
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      const quoteLines = doc.splitTextToSize(`"${block.content}"`, contentWidth - 20);
      doc.text(quoteLines, margins.left + 10, yPosition);
      yPosition += quoteLines.length * 5;
      if (block.author) {
        doc.setFont('helvetica', 'normal');
        doc.text(`— ${block.author}`, margins.left + 10, yPosition + 5);
        yPosition += 10;
      }
      doc.setTextColor(0, 0, 0);
      yPosition += 5;
      break;

    case 'chart':
      // For charts, we add a placeholder text
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const chartTitle = block.config?.title || 'Graphique';
      doc.text(`[Graphique: ${chartTitle}]`, margins.left, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 40;
      break;

    case 'image':
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`[Image: ${block.alt || block.caption || 'Image'}]`, margins.left, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 20;
      break;
  }

  return yPosition;
}

function addListToPDF(
  doc: jsPDF,
  block: ListBlock,
  margins: typeof MARGINS.normal,
  yPosition: number
): number {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  block.items.forEach((item, index) => {
    const bullet = block.listType === 'numbered' ? `${index + 1}.` : '•';
    doc.text(`${bullet} ${item.content}`, margins.left + 5, yPosition);
    yPosition += 6;
  });

  return yPosition + 5;
}

function addTableToPDF(
  doc: jsPDF,
  block: TableBlock,
  contentWidth: number,
  margins: typeof MARGINS.normal,
  yPosition: number,
  pageHeight: number
): number {
  const cellPadding = 3;
  const colWidth = contentWidth / block.headers.length;
  const rowHeight = 8;

  // Header
  doc.setFillColor(28, 49, 99);
  doc.rect(margins.left, yPosition - 5, contentWidth, rowHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  block.headers.forEach((header, index) => {
    doc.text(header.label, margins.left + index * colWidth + cellPadding, yPosition);
  });

  yPosition += rowHeight;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  // Rows
  block.rows.forEach((row, rowIndex) => {
    if (yPosition > pageHeight - margins.bottom - 20) {
      doc.addPage();
      yPosition = margins.top;
    }

    if (rowIndex % 2 === 1) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margins.left, yPosition - 5, contentWidth, rowHeight, 'F');
    }

    block.headers.forEach((header, colIndex) => {
      const cell = row[header.key];
      const value = cell?.formatted || String(cell?.value || '');
      doc.text(value.substring(0, 20), margins.left + colIndex * colWidth + cellPadding, yPosition);
    });

    yPosition += rowHeight;
  });

  return yPosition + 5;
}

function addKPIToPDF(
  doc: jsPDF,
  block: KPICardBlock,
  margins: typeof MARGINS.normal,
  yPosition: number
): number {
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(block.label, margins.left, yPosition);
  yPosition += 6;

  doc.setFontSize(18);
  doc.setTextColor(28, 49, 99);
  doc.setFont('helvetica', 'bold');
  doc.text(`${block.value}${block.unit || ''}`, margins.left, yPosition);

  if (block.change !== undefined) {
    const changeColor =
      block.changeType === 'positive'
        ? [34, 197, 94]
        : block.changeType === 'negative'
        ? [239, 68, 68]
        : [100, 100, 100];
    doc.setTextColor(changeColor[0], changeColor[1], changeColor[2]);
    doc.setFontSize(10);
    const sign = block.change >= 0 ? '+' : '';
    doc.text(`${sign}${block.change}%`, margins.left + 50, yPosition);
  }

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  return yPosition + 15;
}

function addCalloutToPDF(
  doc: jsPDF,
  block: ContentBlock & { type: 'callout'; variant: string; title?: string; content: string },
  contentWidth: number,
  margins: typeof MARGINS.normal,
  yPosition: number
): number {
  const colors: Record<string, [number, number, number]> = {
    info: [59, 130, 246],
    warning: [245, 158, 11],
    success: [34, 197, 94],
    error: [239, 68, 68],
    tip: [168, 85, 247],
  };

  const color = colors[block.variant] || colors.info;

  // Background
  doc.setFillColor(color[0], color[1], color[2], 0.1);
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.roundedRect(margins.left, yPosition - 5, contentWidth, 25, 2, 2, 'FD');

  // Title
  if (block.title) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(block.title, margins.left + 5, yPosition + 2);
    yPosition += 8;
  }

  // Content
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const lines = doc.splitTextToSize(block.content, contentWidth - 10);
  doc.text(lines, margins.left + 5, yPosition + 2);

  return yPosition + 25;
}

function addPageNumbers(
  doc: jsPDF,
  margins: typeof MARGINS.normal,
  pageWidth: number,
  pageHeight: number,
  footerText?: string
): void {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);

    // Page number
    doc.text(
      `Page ${i} / ${totalPages}`,
      pageWidth / 2,
      pageHeight - margins.bottom / 2,
      { align: 'center' }
    );

    // Footer text if provided
    if (footerText) {
      doc.text(
        footerText,
        pageWidth / 2,
        pageHeight - margins.bottom / 2 + 5,
        { align: 'center' }
      );
    }
  }
}

// ============================================================================
// DOCX Export
// ============================================================================

async function exportToDOCX(
  report: StudioReport,
  content: ContentTree,
  options: ExportOptions
): Promise<ExportResult> {
  // Generate HTML content
  const htmlContent = generateHTMLContent(report, content, options, true);

  // Create DOCX-compatible HTML
  const docxContent = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${report.title}</title>
  <style>
    @page { size: ${options.pageSize || 'A4'} ${options.orientation || 'portrait'}; margin: 2.5cm; }
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
    h1 { font-size: 24pt; color: #1C3163; margin-top: 24pt; }
    h2 { font-size: 18pt; color: #1C3163; margin-top: 18pt; }
    h3 { font-size: 14pt; color: #1C3163; margin-top: 14pt; }
    table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
    th { background-color: #1C3163; color: white; padding: 8pt; text-align: left; }
    td { border: 1px solid #ddd; padding: 8pt; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .callout { padding: 12pt; margin: 12pt 0; border-left: 4px solid #1C3163; background: #f5f5f5; }
    .kpi { display: inline-block; padding: 12pt; margin: 6pt; background: #f5f5f5; border-radius: 8pt; }
    blockquote { font-style: italic; color: #666; border-left: 3px solid #ddd; padding-left: 12pt; margin: 12pt 0; }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

  const blob = new Blob([docxContent], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const filename = `${sanitizeFilename(report.title)}.doc`;

  return { success: true, blob, filename };
}

// ============================================================================
// XLSX Export
// ============================================================================

function exportToXLSX(
  report: StudioReport,
  content: ContentTree,
  _options: ExportOptions
): ExportResult {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Rapport', report.title],
    ['Description', report.description || ''],
    ['Auteur', report.author],
    ['Période', report.periodLabel || ''],
    ['Statut', report.status],
    ['Version', report.version],
    ['Créé le', new Date(report.createdAt).toLocaleDateString('fr-FR')],
    ['Modifié le', new Date(report.updatedAt).toLocaleDateString('fr-FR')],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');

  // Extract tables from sections
  let tableCount = 0;
  content.sections.forEach((section) => {
    section.blocks.forEach((block) => {
      if (block.type === 'table') {
        tableCount++;
        const tableSheet = createTableSheet(block);
        const sheetName = `Tableau ${tableCount}`.substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, tableSheet, sheetName);
      }

      if (block.type === 'chart' && block.data) {
        tableCount++;
        const chartDataSheet = createChartDataSheet(block);
        const sheetName = `Données ${tableCount}`.substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, chartDataSheet, sheetName);
      }

      if (block.type === 'kpi_card') {
        // Collect KPIs for a dedicated sheet
      }
    });
  });

  // KPI sheet
  const kpiData = extractKPIs(content);
  if (kpiData.length > 1) {
    const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(workbook, kpiSheet, 'Indicateurs');
  }

  const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([xlsxBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const filename = `${sanitizeFilename(report.title)}.xlsx`;

  return { success: true, blob, filename };
}

function createTableSheet(block: TableBlock): XLSX.WorkSheet {
  const headers = block.headers.map((h) => h.label);
  const rows = block.rows.map((row) =>
    block.headers.map((h) => {
      const cell = row[h.key];
      return cell?.formatted || cell?.value || '';
    })
  );

  return XLSX.utils.aoa_to_sheet([headers, ...rows]);
}

function createChartDataSheet(block: ChartBlock): XLSX.WorkSheet {
  const data: (string | number | null)[][] = [];

  // Headers
  const headers = ['Label', ...block.data.datasets.map((d) => d.label)];
  data.push(headers);

  // Data rows
  if (block.data.labels) {
    block.data.labels.forEach((label, index) => {
      const row: (string | number | null)[] = [label];
      block.data.datasets.forEach((dataset) => {
        row.push(dataset.data[index]);
      });
      data.push(row);
    });
  }

  return XLSX.utils.aoa_to_sheet(data);
}

function extractKPIs(content: ContentTree): (string | number)[][] {
  const data: (string | number)[][] = [['Indicateur', 'Valeur', 'Unité', 'Variation', 'Tendance']];

  content.sections.forEach((section) => {
    section.blocks.forEach((block) => {
      if (block.type === 'kpi_card') {
        data.push([
          block.label,
          block.value,
          block.unit || '',
          block.change || 0,
          block.changeType || 'neutral',
        ]);
      }
    });
  });

  return data;
}

// ============================================================================
// PPTX Export
// ============================================================================

async function exportToPPTX(
  report: StudioReport,
  content: ContentTree,
  options: ExportOptions
): Promise<ExportResult> {
  const pptx = new PptxGenJS();

  // Configure presentation
  pptx.author = report.author;
  pptx.title = report.title;
  pptx.subject = report.description || '';
  pptx.company = 'EasyView-BI';

  // Define master slide colors
  const PRIMARY_COLOR = '1C3163';
  const TEXT_COLOR = '333333';
  const LIGHT_BG = 'F5F5F5';

  // Cover slide
  if (options.includeCoverPage) {
    const coverSlide = pptx.addSlide();

    // Background shape
    coverSlide.addShape('rect', {
      x: 0,
      y: 0,
      w: '100%',
      h: '40%',
      fill: { color: PRIMARY_COLOR },
    });

    // Title
    coverSlide.addText(report.title, {
      x: 0.5,
      y: 1.5,
      w: '90%',
      h: 1,
      fontSize: 36,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
    });

    // Description
    if (report.description) {
      coverSlide.addText(report.description, {
        x: 0.5,
        y: 2.5,
        w: '90%',
        h: 0.5,
        fontSize: 16,
        color: 'FFFFFF',
        align: 'center',
      });
    }

    // Metadata
    const metaText = [
      report.periodLabel ? `Période: ${report.periodLabel}` : '',
      `Auteur: ${report.author}`,
      `Date: ${new Date().toLocaleDateString('fr-FR')}`,
    ].filter(Boolean).join('\n');

    coverSlide.addText(metaText, {
      x: 0.5,
      y: 4,
      w: '90%',
      h: 1,
      fontSize: 14,
      color: TEXT_COLOR,
      align: 'center',
    });
  }

  // Table of contents slide
  if (options.includeTableOfContents && content.sections.length > 0) {
    const tocSlide = pptx.addSlide();

    tocSlide.addText('Table des matières', {
      x: 0.5,
      y: 0.3,
      w: '90%',
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: PRIMARY_COLOR,
    });

    const tocItems = content.sections.map((section, index) => ({
      text: `${index + 1}. ${section.title}`,
      options: { bullet: false, fontSize: 16, color: TEXT_COLOR },
    }));

    tocSlide.addText(tocItems, {
      x: 0.5,
      y: 1.2,
      w: '90%',
      h: 4,
      valign: 'top',
    });
  }

  // Content slides
  for (const section of content.sections) {
    await addSectionToPPTX(pptx, section, PRIMARY_COLOR, TEXT_COLOR, LIGHT_BG);
  }

  // Generate blob
  const pptxBlob = await pptx.write({ outputType: 'blob' }) as Blob;
  const filename = `${sanitizeFilename(report.title)}.pptx`;

  return { success: true, blob: pptxBlob, filename };
}

async function addSectionToPPTX(
  pptx: PptxGenJS,
  section: Section,
  primaryColor: string,
  textColor: string,
  lightBg: string
): Promise<void> {
  // Section title slide
  const titleSlide = pptx.addSlide();

  titleSlide.addShape('rect', {
    x: 0,
    y: 2,
    w: '100%',
    h: 1.5,
    fill: { color: primaryColor },
  });

  titleSlide.addText(section.title, {
    x: 0.5,
    y: 2.2,
    w: '90%',
    h: 1,
    fontSize: 32,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });

  // Content slides for blocks
  let currentSlide: PptxGenJS.Slide | null = null;
  let yPosition = 1;
  const maxY = 5;

  for (const block of section.blocks) {
    // Check if we need a new slide
    if (!currentSlide || yPosition >= maxY || block.type === 'pagebreak') {
      if (block.type === 'pagebreak') continue;

      currentSlide = pptx.addSlide();

      // Add section title as header
      currentSlide.addText(section.title, {
        x: 0.3,
        y: 0.2,
        w: '95%',
        h: 0.5,
        fontSize: 14,
        color: primaryColor,
        bold: true,
      });

      yPosition = 1;
    }

    yPosition = addBlockToPPTXSlide(currentSlide, block, yPosition, primaryColor, textColor, lightBg);
  }

  // Process children sections
  for (const child of section.children) {
    await addSectionToPPTX(pptx, child, primaryColor, textColor, lightBg);
  }
}

function addBlockToPPTXSlide(
  slide: PptxGenJS.Slide,
  block: ContentBlock,
  yPosition: number,
  primaryColor: string,
  textColor: string,
  lightBg: string
): number {
  const leftMargin = 0.5;
  const contentWidth = 9;

  switch (block.type) {
    case 'paragraph':
      slide.addText(block.content, {
        x: leftMargin,
        y: yPosition,
        w: contentWidth,
        h: 0.5,
        fontSize: 14,
        color: textColor,
        valign: 'top',
      });
      return yPosition + 0.6;

    case 'heading':
      const headingSizes: Record<number, number> = { 1: 28, 2: 24, 3: 20, 4: 18, 5: 16, 6: 14 };
      slide.addText(block.content, {
        x: leftMargin,
        y: yPosition,
        w: contentWidth,
        h: 0.6,
        fontSize: headingSizes[block.level] || 18,
        bold: true,
        color: primaryColor,
      });
      return yPosition + 0.8;

    case 'list':
      const listItems = block.items.map((item, index) => ({
        text: block.listType === 'numbered' ? `${index + 1}. ${item.content}` : item.content,
        options: {
          bullet: block.listType === 'bullet',
          fontSize: 14,
          color: textColor,
        },
      }));
      slide.addText(listItems, {
        x: leftMargin,
        y: yPosition,
        w: contentWidth,
        h: block.items.length * 0.35,
        valign: 'top',
      });
      return yPosition + block.items.length * 0.35 + 0.2;

    case 'table':
      const tableData: PptxGenJS.TableRow[] = [];

      // Headers
      tableData.push(
        block.headers.map((h) => ({
          text: h.label,
          options: {
            fill: { color: primaryColor },
            color: 'FFFFFF',
            bold: true,
            fontSize: 11,
            align: 'center' as const,
          },
        }))
      );

      // Rows (limit to 8 rows for presentation)
      const displayRows = block.rows.slice(0, 8);
      displayRows.forEach((row, rowIndex) => {
        tableData.push(
          block.headers.map((h) => {
            const cell = row[h.key];
            return {
              text: String(cell?.formatted || cell?.value || ''),
              options: {
                fill: { color: rowIndex % 2 === 0 ? 'FFFFFF' : lightBg },
                fontSize: 10,
                align: 'left' as const,
              },
            };
          })
        );
      });

      if (block.rows.length > 8) {
        tableData.push(
          block.headers.map((_, i) => ({
            text: i === 0 ? `... et ${block.rows.length - 8} lignes supplémentaires` : '',
            options: { fontSize: 9, italic: true, color: '666666' },
          }))
        );
      }

      slide.addTable(tableData, {
        x: leftMargin,
        y: yPosition,
        w: contentWidth,
        colW: block.headers.map(() => contentWidth / block.headers.length),
        border: { pt: 0.5, color: 'CCCCCC' },
      });

      return yPosition + Math.min(displayRows.length + 2, 10) * 0.35 + 0.3;

    case 'chart':
      // Create chart data for pptxgenjs
      if (block.data?.labels && block.data?.datasets?.length > 0) {
        const chartType = getChartTypeForPPTX(block.chartType);

        const chartData = block.data.datasets.map((dataset) => ({
          name: dataset.label,
          labels: block.data.labels || [],
          values: dataset.data.map((v) => v ?? 0),
        }));

        try {
          slide.addChart(chartType, chartData, {
            x: leftMargin,
            y: yPosition,
            w: contentWidth,
            h: 2.5,
            showTitle: !!block.config?.title,
            title: block.config?.title || '',
            titleFontSize: 12,
            titleColor: primaryColor,
            showLegend: block.config?.legend?.show ?? true,
            legendPos: block.config?.legend?.position === 'bottom' ? 'b' : 't',
          });
        } catch {
          // Fallback: add text placeholder if chart fails
          slide.addText(`[Graphique: ${block.config?.title || 'Données'}]`, {
            x: leftMargin,
            y: yPosition,
            w: contentWidth,
            h: 1,
            fontSize: 12,
            color: '666666',
            italic: true,
            align: 'center',
          });
          return yPosition + 1.2;
        }
      } else {
        slide.addText(`[Graphique: ${block.config?.title || 'Graphique'}]`, {
          x: leftMargin,
          y: yPosition,
          w: contentWidth,
          h: 1,
          fontSize: 12,
          color: '666666',
          italic: true,
          align: 'center',
        });
        return yPosition + 1.2;
      }
      return yPosition + 2.8;

    case 'kpi_card':
      slide.addShape('roundRect', {
        x: leftMargin,
        y: yPosition,
        w: 3,
        h: 1.2,
        fill: { color: lightBg },
        line: { color: 'DDDDDD', pt: 1 },
      });

      slide.addText(block.label, {
        x: leftMargin + 0.15,
        y: yPosition + 0.1,
        w: 2.7,
        h: 0.3,
        fontSize: 10,
        color: '666666',
      });

      slide.addText(`${block.value}${block.unit || ''}`, {
        x: leftMargin + 0.15,
        y: yPosition + 0.4,
        w: 2.7,
        h: 0.5,
        fontSize: 24,
        bold: true,
        color: primaryColor,
      });

      if (block.change !== undefined) {
        const changeColor = block.changeType === 'positive' ? '22C55E' : block.changeType === 'negative' ? 'EF4444' : '666666';
        const sign = block.change >= 0 ? '+' : '';
        slide.addText(`${sign}${block.change}%`, {
          x: leftMargin + 0.15,
          y: yPosition + 0.85,
          w: 2.7,
          h: 0.25,
          fontSize: 11,
          color: changeColor,
        });
      }

      return yPosition + 1.4;

    case 'callout':
      const calloutColors: Record<string, string> = {
        info: '3B82F6',
        warning: 'F59E0B',
        success: '22C55E',
        error: 'EF4444',
        tip: 'A855F7',
      };
      const calloutColor = calloutColors[block.variant] || calloutColors.info;

      slide.addShape('rect', {
        x: leftMargin,
        y: yPosition,
        w: contentWidth,
        h: 0.8,
        fill: { color: calloutColor, transparency: 90 },
        line: { color: calloutColor, pt: 2 },
      });

      const calloutText = block.title ? `${block.title}: ${block.content}` : block.content;
      slide.addText(calloutText, {
        x: leftMargin + 0.15,
        y: yPosition + 0.15,
        w: contentWidth - 0.3,
        h: 0.5,
        fontSize: 12,
        color: textColor,
      });

      return yPosition + 1;

    case 'quote':
      slide.addText(`"${block.content}"`, {
        x: leftMargin + 0.3,
        y: yPosition,
        w: contentWidth - 0.6,
        h: 0.6,
        fontSize: 14,
        italic: true,
        color: '666666',
      });

      if (block.author) {
        slide.addText(`— ${block.author}`, {
          x: leftMargin + 0.3,
          y: yPosition + 0.5,
          w: contentWidth - 0.6,
          h: 0.3,
          fontSize: 11,
          color: '888888',
        });
        return yPosition + 0.9;
      }
      return yPosition + 0.7;

    case 'divider':
      slide.addShape('line', {
        x: leftMargin,
        y: yPosition + 0.15,
        w: contentWidth,
        h: 0,
        line: { color: 'CCCCCC', pt: 1, dashType: block.style === 'dashed' ? 'dash' : 'solid' },
      });
      return yPosition + 0.4;

    case 'image':
      if (block.src && block.src.startsWith('data:')) {
        try {
          slide.addImage({
            data: block.src,
            x: leftMargin,
            y: yPosition,
            w: 4,
            h: 2.5,
          });
          if (block.caption) {
            slide.addText(block.caption, {
              x: leftMargin,
              y: yPosition + 2.5,
              w: 4,
              h: 0.3,
              fontSize: 10,
              italic: true,
              color: '666666',
              align: 'center',
            });
          }
          return yPosition + 2.9;
        } catch {
          // Fallback if image fails
        }
      }
      slide.addText(`[Image: ${block.alt || block.caption || 'Image'}]`, {
        x: leftMargin,
        y: yPosition,
        w: contentWidth,
        h: 0.5,
        fontSize: 12,
        color: '666666',
        italic: true,
        align: 'center',
      });
      return yPosition + 0.6;

    default:
      return yPosition;
  }
}

function getChartTypeForPPTX(chartType: string): PptxGenJS.CHART_NAME {
  const chartTypeMap: Record<string, PptxGenJS.CHART_NAME> = {
    bar: 'bar',
    horizontal_bar: 'bar',
    stacked_bar: 'bar',
    line: 'line',
    area: 'area',
    pie: 'pie',
    donut: 'doughnut',
  };
  return chartTypeMap[chartType] || 'bar';
}

// ============================================================================
// HTML Export
// ============================================================================

function exportToHTML(
  report: StudioReport,
  content: ContentTree,
  options: ExportOptions
): ExportResult {
  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(report.title)}</title>
  <style>
    :root {
      --primary: #1C3163;
      --primary-light: #2a4a8c;
      --text: #333;
      --text-light: #666;
      --border: #e5e5e5;
      --bg-light: #f9fafb;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: var(--text);
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .cover { text-align: center; padding: 60px 0; margin-bottom: 40px; border-bottom: 2px solid var(--primary); }
    .cover h1 { font-size: 2.5rem; color: var(--primary); margin-bottom: 16px; }
    .cover p { color: var(--text-light); }
    .toc { margin: 40px 0; padding: 24px; background: var(--bg-light); border-radius: 8px; }
    .toc h2 { margin-bottom: 16px; color: var(--primary); }
    .toc ul { list-style: none; }
    .toc li { padding: 8px 0; border-bottom: 1px solid var(--border); }
    .toc a { color: var(--primary); text-decoration: none; }
    .toc a:hover { text-decoration: underline; }
    .section { margin: 40px 0; }
    h1, h2, h3, h4, h5, h6 { color: var(--primary); margin: 24px 0 16px; }
    h2 { font-size: 1.75rem; padding-bottom: 8px; border-bottom: 2px solid var(--primary); }
    h3 { font-size: 1.5rem; }
    h4 { font-size: 1.25rem; }
    p { margin: 12px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: var(--primary); color: white; padding: 12px; text-align: left; }
    td { border: 1px solid var(--border); padding: 12px; }
    tr:nth-child(even) { background: var(--bg-light); }
    .callout { padding: 16px 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid; }
    .callout.info { background: #eff6ff; border-color: #3b82f6; }
    .callout.warning { background: #fefce8; border-color: #f59e0b; }
    .callout.success { background: #f0fdf4; border-color: #22c55e; }
    .callout.error { background: #fef2f2; border-color: #ef4444; }
    .callout.tip { background: #faf5ff; border-color: #a855f7; }
    .callout-title { font-weight: 600; margin-bottom: 8px; }
    .kpi-card { display: inline-block; padding: 20px; margin: 10px; background: var(--bg-light); border-radius: 12px; min-width: 180px; }
    .kpi-label { font-size: 0.875rem; color: var(--text-light); }
    .kpi-value { font-size: 2rem; font-weight: 700; color: var(--primary); }
    .kpi-change { font-size: 0.875rem; }
    .kpi-change.positive { color: #22c55e; }
    .kpi-change.negative { color: #ef4444; }
    blockquote { font-style: italic; color: var(--text-light); border-left: 3px solid var(--border); padding-left: 16px; margin: 20px 0; }
    .divider { border: none; border-top: 1px solid var(--border); margin: 30px 0; }
    .chart-placeholder { background: var(--bg-light); padding: 40px; text-align: center; border-radius: 8px; color: var(--text-light); margin: 20px 0; }
    ul, ol { margin: 12px 0; padding-left: 24px; }
    li { margin: 6px 0; }
    @media print {
      body { max-width: 100%; padding: 0; }
      .pagebreak { page-break-after: always; }
    }
  </style>
</head>
<body>
${options.includeCoverPage ? generateCoverHTML(report) : ''}
${options.includeTableOfContents ? generateTOCHTML(content) : ''}
${generateHTMLContent(report, content, options, false)}
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const filename = `${sanitizeFilename(report.title)}.html`;

  return { success: true, blob, filename };
}

function generateCoverHTML(report: StudioReport): string {
  return `
<div class="cover">
  <h1>${escapeHTML(report.title)}</h1>
  ${report.description ? `<p>${escapeHTML(report.description)}</p>` : ''}
  <p style="margin-top: 24px;">
    ${report.periodLabel ? `<strong>Période:</strong> ${escapeHTML(report.periodLabel)}<br>` : ''}
    <strong>Auteur:</strong> ${escapeHTML(report.author)}<br>
    <strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
  </p>
</div>`;
}

function generateTOCHTML(content: ContentTree): string {
  const items = content.sections
    .map((section, index) => `<li><a href="#section-${index}">${index + 1}. ${escapeHTML(section.title)}</a></li>`)
    .join('\n');

  return `
<div class="toc">
  <h2>Table des matières</h2>
  <ul>${items}</ul>
</div>`;
}

function generateHTMLContent(
  _report: StudioReport,
  content: ContentTree,
  _options: ExportOptions,
  forWord: boolean
): string {
  return content.sections
    .map((section, index) => generateSectionHTML(section, index, forWord))
    .join('\n');
}

function generateSectionHTML(section: Section, index: number, forWord: boolean): string {
  const headingTag = `h${Math.min(section.level + 1, 6)}`;
  const blocksHTML = section.blocks.map((block) => generateBlockHTML(block, forWord)).join('\n');
  const childrenHTML = section.children
    .map((child, i) => generateSectionHTML(child, i, forWord))
    .join('\n');

  return `
<div class="section" id="section-${index}">
  <${headingTag}>${escapeHTML(section.title)}</${headingTag}>
  ${blocksHTML}
  ${childrenHTML}
</div>`;
}

function generateBlockHTML(block: ContentBlock, forWord: boolean): string {
  switch (block.type) {
    case 'paragraph':
      return `<p>${escapeHTML(block.content)}</p>`;

    case 'heading':
      const tag = `h${Math.min(block.level + 1, 6)}`;
      return `<${tag}>${escapeHTML(block.content)}</${tag}>`;

    case 'list':
      const listTag = block.listType === 'numbered' ? 'ol' : 'ul';
      const items = block.items.map((item) => `<li>${escapeHTML(item.content)}</li>`).join('\n');
      return `<${listTag}>${items}</${listTag}>`;

    case 'table':
      const headers = block.headers.map((h) => `<th>${escapeHTML(h.label)}</th>`).join('');
      const rows = block.rows
        .map((row) => {
          const cells = block.headers
            .map((h) => {
              const cell = row[h.key];
              return `<td>${escapeHTML(String(cell?.formatted || cell?.value || ''))}</td>`;
            })
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .join('\n');
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;

    case 'callout':
      return `
<div class="callout ${block.variant}">
  ${block.title ? `<div class="callout-title">${escapeHTML(block.title)}</div>` : ''}
  <div>${escapeHTML(block.content)}</div>
</div>`;

    case 'kpi_card':
      const changeClass = block.changeType === 'positive' ? 'positive' : block.changeType === 'negative' ? 'negative' : '';
      const changeSign = block.change !== undefined && block.change >= 0 ? '+' : '';
      return `
<div class="kpi-card">
  <div class="kpi-label">${escapeHTML(block.label)}</div>
  <div class="kpi-value">${escapeHTML(String(block.value))}${block.unit ? escapeHTML(block.unit) : ''}</div>
  ${block.change !== undefined ? `<div class="kpi-change ${changeClass}">${changeSign}${block.change}%</div>` : ''}
</div>`;

    case 'quote':
      return `
<blockquote>
  "${escapeHTML(block.content)}"
  ${block.author ? `<footer>— ${escapeHTML(block.author)}</footer>` : ''}
</blockquote>`;

    case 'divider':
      return '<hr class="divider">';

    case 'pagebreak':
      return forWord ? '<br clear="all" style="page-break-before: always;">' : '<div class="pagebreak"></div>';

    case 'chart':
      return `<div class="chart-placeholder">[Graphique: ${escapeHTML(block.config?.title || 'Graphique')}]</div>`;

    case 'image':
      if (block.src) {
        return `
<figure>
  <img src="${escapeHTML(block.src)}" alt="${escapeHTML(block.alt || '')}" style="max-width: 100%; height: auto;">
  ${block.caption ? `<figcaption>${escapeHTML(block.caption)}</figcaption>` : ''}
</figure>`;
      }
      return `<div class="chart-placeholder">[Image: ${escapeHTML(block.alt || block.caption || 'Image')}]</div>`;

    default:
      return '';
  }
}

// ============================================================================
// Markdown Export
// ============================================================================

function exportToMarkdown(
  report: StudioReport,
  content: ContentTree,
  options: ExportOptions
): ExportResult {
  let markdown = '';

  // Cover
  if (options.includeCoverPage) {
    markdown += `# ${report.title}\n\n`;
    if (report.description) {
      markdown += `> ${report.description}\n\n`;
    }
    markdown += `**Auteur:** ${report.author}  \n`;
    if (report.periodLabel) {
      markdown += `**Période:** ${report.periodLabel}  \n`;
    }
    markdown += `**Date:** ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    markdown += '---\n\n';
  }

  // Table of contents
  if (options.includeTableOfContents) {
    markdown += '## Table des matières\n\n';
    content.sections.forEach((section, index) => {
      const indent = '  '.repeat(section.level - 1);
      markdown += `${indent}${index + 1}. [${section.title}](#${slugify(section.title)})\n`;
    });
    markdown += '\n---\n\n';
  }

  // Content
  content.sections.forEach((section) => {
    markdown += generateSectionMarkdown(section);
  });

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const filename = `${sanitizeFilename(report.title)}.md`;

  return { success: true, blob, filename };
}

function generateSectionMarkdown(section: Section): string {
  let md = '';
  const headingPrefix = '#'.repeat(Math.min(section.level + 1, 6));
  md += `${headingPrefix} ${section.title}\n\n`;

  section.blocks.forEach((block) => {
    md += generateBlockMarkdown(block);
  });

  section.children.forEach((child) => {
    md += generateSectionMarkdown(child);
  });

  return md;
}

function generateBlockMarkdown(block: ContentBlock): string {
  switch (block.type) {
    case 'paragraph':
      return `${block.content}\n\n`;

    case 'heading':
      const prefix = '#'.repeat(Math.min(block.level + 1, 6));
      return `${prefix} ${block.content}\n\n`;

    case 'list':
      return block.items
        .map((item, index) => {
          const bullet = block.listType === 'numbered' ? `${index + 1}.` : '-';
          return `${bullet} ${item.content}`;
        })
        .join('\n') + '\n\n';

    case 'table':
      let table = '| ' + block.headers.map((h) => h.label).join(' | ') + ' |\n';
      table += '| ' + block.headers.map(() => '---').join(' | ') + ' |\n';
      block.rows.forEach((row) => {
        const cells = block.headers.map((h) => {
          const cell = row[h.key];
          return String(cell?.formatted || cell?.value || '');
        });
        table += '| ' + cells.join(' | ') + ' |\n';
      });
      return table + '\n';

    case 'callout':
      const icons: Record<string, string> = {
        info: 'ℹ️',
        warning: '⚠️',
        success: '✅',
        error: '❌',
        tip: '💡',
      };
      const icon = icons[block.variant] || 'ℹ️';
      let callout = `> ${icon} **${block.title || block.variant.toUpperCase()}**\n`;
      callout += `> \n> ${block.content}\n\n`;
      return callout;

    case 'kpi_card':
      const changeSign = block.change !== undefined && block.change >= 0 ? '+' : '';
      return `**${block.label}:** ${block.value}${block.unit || ''}${block.change !== undefined ? ` (${changeSign}${block.change}%)` : ''}\n\n`;

    case 'quote':
      let quote = `> "${block.content}"\n`;
      if (block.author) {
        quote += `> — *${block.author}*\n`;
      }
      return quote + '\n';

    case 'divider':
      return '---\n\n';

    case 'pagebreak':
      return '\n---\n<div style="page-break-after: always;"></div>\n\n';

    case 'chart':
      return `*[Graphique: ${block.config?.title || 'Graphique'}]*\n\n`;

    case 'image':
      if (block.src) {
        return `![${block.alt || 'Image'}](${block.src})\n${block.caption ? `*${block.caption}*\n` : ''}\n`;
      }
      return `*[Image: ${block.alt || block.caption || 'Image'}]*\n\n`;

    default:
      return '';
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

function escapeHTML(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ============================================================================
// Download Helper
// ============================================================================

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Rapport (bi.ts) to StudioReport Adapter
// ============================================================================

/**
 * Convert a Rapport (from bi.ts) to StudioReport format for export
 */
export function convertRapportToStudioReport(rapport: Rapport): { report: StudioReport; content: ContentTree } {
  const report: StudioReport = {
    id: rapport.id,
    centreId: rapport.centreId,
    title: rapport.titre,
    description: rapport.description,
    type: rapport.typeRapportCode,
    status: convertStatus(rapport.statut),
    author: rapport.auteur,
    periodStart: rapport.periodeDebut,
    periodEnd: rapport.periodeFin,
    periodLabel: rapport.periodeLabel,
    contentTree: { sections: [] },
    version: rapport.versionActuelle,
    createdAt: rapport.dateCreation,
    updatedAt: rapport.dateModification,
    publishedAt: rapport.datePublication,
  };

  const content: ContentTree = {
    sections: rapport.sections.map((section, index) => convertSection(section, index)),
  };

  return { report, content };
}

function convertStatus(statut: string): 'draft' | 'generating' | 'review' | 'approved' | 'published' | 'archived' {
  const statusMap: Record<string, 'draft' | 'generating' | 'review' | 'approved' | 'published' | 'archived'> = {
    brouillon: 'draft',
    en_generation: 'generating',
    en_revision: 'review',
    approuve: 'approved',
    publie: 'published',
    archive: 'archived',
  };
  return statusMap[statut] || 'draft';
}

function convertSection(section: SectionRapport, index: number): Section {
  return {
    id: section.id,
    type: 'section',
    title: section.titre,
    level: 1,
    blocks: section.blocs.map(convertBlock),
    children: [],
    status: 'manual',
    isLocked: false,
    isCollapsed: section.repliee,
  };
}

function convertBlock(bloc: BlocRapport): ContentBlock {
  switch (bloc.type) {
    case 'paragraphe':
      return {
        id: bloc.id,
        type: 'paragraph',
        content: bloc.contenu || '',
      };

    case 'titre':
      return {
        id: bloc.id,
        type: 'heading',
        level: (bloc.niveau as 1 | 2 | 3 | 4 | 5 | 6) || 2,
        content: bloc.contenu || '',
      };

    case 'tableau':
      return {
        id: bloc.id,
        type: 'table',
        headers: bloc.colonnes?.map((col, i) => ({
          id: `h-${i}`,
          label: col.titre,
          key: col.cle,
          sortable: col.triable,
          align: col.alignement,
          format: col.format,
        })) || [],
        rows: bloc.donnees?.map((row) => {
          const tableRow: Record<string, { value: string | number | null; formatted?: string }> = {};
          bloc.colonnes?.forEach((col) => {
            tableRow[col.cle] = { value: row[col.cle] };
          });
          return tableRow;
        }) || [],
        config: {
          striped: true,
          bordered: true,
          pagination: bloc.pagination,
          pageSize: bloc.lignesParPage,
        },
      };

    case 'graphique':
      return {
        id: bloc.id,
        type: 'chart',
        chartType: convertChartType(bloc.typeGraphique),
        data: {
          labels: bloc.donnees?.labels || [],
          datasets: bloc.donnees?.datasets?.map((ds) => ({
            label: ds.label,
            data: ds.data,
            backgroundColor: ds.couleur,
          })) || [],
        },
        config: {
          title: bloc.titre,
          subtitle: bloc.sousTitre,
          source: bloc.source,
          legend: { show: bloc.legende?.afficher || false, position: bloc.legende?.position || 'top' },
        },
      };

    case 'kpi_card':
      return {
        id: bloc.id,
        type: 'kpi_card',
        label: bloc.label || '',
        value: bloc.valeur || 0,
        unit: bloc.unite,
        change: bloc.variation,
        changeType: bloc.tendance === 'hausse' ? 'positive' : bloc.tendance === 'baisse' ? 'negative' : 'neutral',
        sparkline: bloc.sparkline,
      };

    case 'kpi_grid':
      // Convert KPI grid to multiple KPI cards (return first one, others should be handled separately)
      const firstKpi = bloc.kpis?.[0];
      if (firstKpi) {
        return {
          id: bloc.id,
          type: 'kpi_card',
          label: firstKpi.label || '',
          value: firstKpi.valeur || 0,
          unit: firstKpi.unite,
          change: firstKpi.variation,
          changeType: firstKpi.tendance === 'hausse' ? 'positive' : firstKpi.tendance === 'baisse' ? 'negative' : 'neutral',
        };
      }
      return {
        id: bloc.id,
        type: 'paragraph',
        content: '[KPI Grid]',
      };

    case 'image':
      return {
        id: bloc.id,
        type: 'image',
        src: bloc.url || '',
        alt: bloc.alt,
        caption: bloc.legende,
      };

    case 'separateur':
      return {
        id: bloc.id,
        type: 'divider',
        style: bloc.style || 'solid',
      };

    case 'saut_page':
      return {
        id: bloc.id,
        type: 'pagebreak',
      };

    case 'sommaire':
      return {
        id: bloc.id,
        type: 'paragraph',
        content: '[Table des matières]',
      };

    default:
      return {
        id: (bloc as { id: string }).id || `block-${Date.now()}`,
        type: 'paragraph',
        content: '',
      };
  }
}

function convertChartType(type: string): 'line' | 'bar' | 'horizontal_bar' | 'stacked_bar' | 'pie' | 'donut' | 'area' {
  const chartTypeMap: Record<string, 'line' | 'bar' | 'horizontal_bar' | 'stacked_bar' | 'pie' | 'donut' | 'area'> = {
    ligne: 'line',
    barres: 'bar',
    barres_horizontales: 'horizontal_bar',
    barres_empilees: 'stacked_bar',
    camembert: 'pie',
    donut: 'donut',
    aire: 'area',
  };
  return chartTypeMap[type] || 'bar';
}

/**
 * Export a Rapport (from bi.ts) directly
 */
export async function exportRapport(
  rapport: Rapport,
  format: ExportFormat,
  options: ExportOptions
): Promise<ExportResult> {
  const { report, content } = convertRapportToStudioReport(rapport);
  return exportReport(report, content, format, options);
}
