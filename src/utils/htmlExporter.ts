// ============================================
// GÉNÉRATEUR D'EXPORTS HTML
// Conformément au Cahier des Charges v1.1
// ============================================

import type {
  DashboardExportOptions,
  RapportExportOptions,
  ExportPersonalisation,
  HtmlExportResult,
  HtmlHeader,
  HtmlFooter,
  ExportTemplate,
} from '../types';

/**
 * Génère un export HTML du dashboard
 */
export async function exportDashboardToHtml(
  options: DashboardExportOptions,
  data: DashboardData,
  personalisation?: Partial<ExportPersonalisation>
): Promise<HtmlExportResult> {
  try {
    const config = getPersonalisationDefaults(personalisation);
    const templateStyles = getTemplateStyles(options.template);

    const header = generateHeader({
      titre: `Dashboard - ${data.centreName}`,
      sousTitre: formatPeriode(options.periode),
      logo: config.logo,
      date: new Date().toLocaleDateString('fr-FR'),
      auteur: data.auteur || 'COCKPIT',
      organisation: config.organisation,
      centreNom: data.centreName,
      periodeTexte: formatPeriode(options.periode),
    });

    const footer = generateFooter({
      texte: `Généré le ${new Date().toLocaleDateString('fr-FR')} par ${data.auteur || 'COCKPIT'}`,
      mentionsLegales: config.mentionsLegales,
    });

    // Construire le contenu HTML
    let content = '';

    // Section KPIs
    content += generateKPIsSection(data.kpis, templateStyles);

    // Section Graphiques
    if (data.charts && data.charts.length > 0) {
      content += generateChartsSection(
        data.charts,
        options.graphiquesInteractifs,
        templateStyles
      );
    }

    // Section Alertes
    if (options.inclureAlertes && data.alertes && data.alertes.length > 0) {
      content += generateAlertesSection(data.alertes, templateStyles);
    }

    // Section Tendances
    if (options.inclureTendances && data.tendances) {
      content += generateTendancesSection(data.tendances, templateStyles);
    }

    // Assembler le HTML final
    const html = generateFullHtml({
      title: `Dashboard ${data.centreName} - ${formatPeriode(options.periode)}`,
      styles: generateStyles(config, templateStyles),
      header,
      content,
      footer,
      scripts: options.graphiquesInteractifs ? getChartJsScript() : '',
      watermark: options.watermark ? config.watermark : undefined,
    });

    return {
      success: true,
      html,
      filename: `dashboard_${data.centreName.replace(/\s+/g, '_')}_${formatDateForFilename(new Date())}.html`,
      tailleMo: new Blob([html]).size / (1024 * 1024),
    };
  } catch (error) {
    return {
      success: false,
      filename: '',
      tailleMo: 0,
      erreurs: [String(error)],
    };
  }
}

/**
 * Génère un export HTML d'un rapport
 */
export async function exportRapportToHtml(
  options: RapportExportOptions,
  data: RapportData,
  personalisation?: Partial<ExportPersonalisation>
): Promise<HtmlExportResult> {
  try {
    const config = getPersonalisationDefaults(personalisation);
    const templateStyles = getTemplateStyles(options.template);

    const header = generateHeader({
      titre: data.titre,
      sousTitre: data.sousTitre,
      logo: config.logo,
      date: new Date().toLocaleDateString('fr-FR'),
      auteur: data.auteur,
      organisation: config.organisation,
    });

    const footer = generateFooter({
      texte: config.piedDePage.texte || `Généré par COCKPIT`,
      mentionsLegales: config.mentionsLegales,
    });

    // Table des matières
    let toc = '';
    if (options.tableDesMatieres && data.sections) {
      toc = generateTableOfContents(data.sections);
    }

    // Contenu des sections
    let content = toc;
    if (data.sections) {
      for (const section of data.sections) {
        content += generateSection(section, templateStyles);
      }
    }

    // Données brutes JSON
    let dataJson = '';
    if (options.donneesBrutesJson && data.rawData) {
      dataJson = `
        <script id="raw-data" type="application/json">
          ${JSON.stringify(data.rawData)}
        </script>
      `;
    }

    // Assembler le HTML final
    const html = generateFullHtml({
      title: data.titre,
      styles: generateStyles(config, templateStyles, options.optimiserImpression),
      header,
      content,
      footer,
      scripts: dataJson,
    });

    return {
      success: true,
      html,
      filename: `rapport_${formatDateForFilename(new Date())}.html`,
      tailleMo: new Blob([html]).size / (1024 * 1024),
    };
  } catch (error) {
    return {
      success: false,
      filename: '',
      tailleMo: 0,
      erreurs: [String(error)],
    };
  }
}

// ============================================
// FONCTIONS DE GÉNÉRATION HTML
// ============================================

interface FullHtmlOptions {
  title: string;
  styles: string;
  header: string;
  content: string;
  footer: string;
  scripts?: string;
  watermark?: ExportPersonalisation['watermark'];
}

function generateFullHtml(options: FullHtmlOptions): string {
  const watermarkStyle = options.watermark?.actif
    ? `
      .watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(${options.watermark.rotation || -45}deg);
        font-size: 8rem;
        color: rgba(0, 0, 0, ${options.watermark.opacite || 0.05});
        pointer-events: none;
        z-index: 1000;
        white-space: nowrap;
      }
    `
    : '';

  const watermarkHtml = options.watermark?.actif
    ? `<div class="watermark">${options.watermark.texte}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="COCKPIT - Pilotage Stratégique">
  <title>${escapeHtml(options.title)}</title>
  <style>
    ${options.styles}
    ${watermarkStyle}
  </style>
</head>
<body>
  ${watermarkHtml}
  <header class="document-header">
    ${options.header}
  </header>

  <main class="document-content">
    ${options.content}
  </main>

  <footer class="document-footer">
    ${options.footer}
  </footer>

  ${options.scripts || ''}
</body>
</html>`;
}

function generateHeader(header: HtmlHeader): string {
  return `
    <div class="header-content">
      ${header.logo ? `<img src="${header.logo}" alt="Logo" class="header-logo">` : ''}
      <div class="header-text">
        <h1 class="header-title">${escapeHtml(header.titre)}</h1>
        ${header.sousTitre ? `<p class="header-subtitle">${escapeHtml(header.sousTitre)}</p>` : ''}
        <p class="header-meta">
          ${header.organisation} | ${header.date}
          ${header.centreNom ? ` | ${escapeHtml(header.centreNom)}` : ''}
        </p>
      </div>
    </div>
  `;
}

function generateFooter(footer: HtmlFooter): string {
  return `
    <div class="footer-content">
      <p class="footer-text">${escapeHtml(footer.texte)}</p>
      ${footer.mentionsLegales ? `<p class="footer-legal">${escapeHtml(footer.mentionsLegales)}</p>` : ''}
      <p class="footer-signature">Document confidentiel - Généré par COCKPIT</p>
    </div>
  `;
}

function generateKPIsSection(kpis: KPIData[], styles: TemplateStyles): string {
  if (!kpis || kpis.length === 0) return '';

  const kpiCards = kpis.map(kpi => `
    <div class="kpi-card kpi-${kpi.statut}">
      <div class="kpi-icon">${kpi.icone || '📊'}</div>
      <div class="kpi-value">${formatNumber(kpi.valeur)} ${kpi.unite || ''}</div>
      <div class="kpi-label">${escapeHtml(kpi.nom)}</div>
      ${kpi.tendance ? `<div class="kpi-trend kpi-trend-${kpi.tendance > 0 ? 'up' : 'down'}">${kpi.tendance > 0 ? '↑' : '↓'} ${Math.abs(kpi.tendance)}%</div>` : ''}
    </div>
  `).join('');

  return `
    <section class="section section-kpis">
      <h2 class="section-title">Indicateurs Clés</h2>
      <div class="kpi-grid">${kpiCards}</div>
    </section>
  `;
}

function generateChartsSection(charts: ChartData[], interactive: boolean, styles: TemplateStyles): string {
  const chartElements = charts.map((chart, index) => {
    if (interactive) {
      return `
        <div class="chart-container">
          <h3 class="chart-title">${escapeHtml(chart.titre)}</h3>
          <canvas id="chart-${index}"></canvas>
          <script>
            (function() {
              const ctx = document.getElementById('chart-${index}').getContext('2d');
              new Chart(ctx, ${JSON.stringify(chart.config)});
            })();
          </script>
        </div>
      `;
    } else {
      // Image statique
      return `
        <div class="chart-container">
          <h3 class="chart-title">${escapeHtml(chart.titre)}</h3>
          ${chart.imageBase64 ? `<img src="${chart.imageBase64}" alt="${escapeHtml(chart.titre)}" class="chart-image">` : '<p class="no-chart">Graphique non disponible</p>'}
        </div>
      `;
    }
  }).join('');

  return `
    <section class="section section-charts">
      <h2 class="section-title">Graphiques</h2>
      <div class="charts-grid">${chartElements}</div>
    </section>
  `;
}

function generateAlertesSection(alertes: AlerteData[], styles: TemplateStyles): string {
  const alerteItems = alertes.map(alerte => `
    <div class="alerte-item alerte-${alerte.priorite}">
      <span class="alerte-badge">${alerte.priorite.toUpperCase()}</span>
      <span class="alerte-titre">${escapeHtml(alerte.titre)}</span>
      <span class="alerte-date">${alerte.date}</span>
    </div>
  `).join('');

  return `
    <section class="section section-alertes">
      <h2 class="section-title">Alertes Actives</h2>
      <div class="alertes-list">${alerteItems}</div>
    </section>
  `;
}

function generateTendancesSection(tendances: TendanceData, styles: TemplateStyles): string {
  return `
    <section class="section section-tendances">
      <h2 class="section-title">Tendances</h2>
      <div class="tendances-content">
        ${tendances.resume ? `<p class="tendances-resume">${escapeHtml(tendances.resume)}</p>` : ''}
      </div>
    </section>
  `;
}

function generateTableOfContents(sections: SectionData[]): string {
  const items = sections.map((section, index) => `
    <li class="toc-item toc-level-${section.niveau}">
      <a href="#section-${index}">${escapeHtml(section.titre)}</a>
    </li>
  `).join('');

  return `
    <nav class="table-of-contents">
      <h2>Table des matières</h2>
      <ol class="toc-list">${items}</ol>
    </nav>
  `;
}

function generateSection(section: SectionData, styles: TemplateStyles, index: number = 0): string {
  return `
    <section id="section-${index}" class="section section-level-${section.niveau}">
      <h${section.niveau + 1} class="section-title">${escapeHtml(section.titre)}</h${section.niveau + 1}>
      <div class="section-content">${section.contenu}</div>
    </section>
  `;
}

// ============================================
// STYLES
// ============================================

interface TemplateStyles {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerHeight: string;
}

function getTemplateStyles(template: ExportTemplate): TemplateStyles {
  const styles: Record<ExportTemplate, TemplateStyles> = {
    executif: {
      primaryColor: '#1a1a2e',
      secondaryColor: '#16213e',
      accentColor: '#0f3460',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      headerHeight: '80px',
    },
    operationnel: {
      primaryColor: '#2d3436',
      secondaryColor: '#636e72',
      accentColor: '#00b894',
      fontFamily: '"Roboto", system-ui, sans-serif',
      headerHeight: '60px',
    },
    investisseur: {
      primaryColor: '#0c2461',
      secondaryColor: '#1e3799',
      accentColor: '#4a69bd',
      fontFamily: '"Georgia", serif',
      headerHeight: '100px',
    },
    presentation: {
      primaryColor: '#2c3e50',
      secondaryColor: '#3498db',
      accentColor: '#e74c3c',
      fontFamily: '"Arial", sans-serif',
      headerHeight: '120px',
    },
  };
  return styles[template];
}

function generateStyles(
  config: ExportPersonalisation,
  templateStyles: TemplateStyles,
  printOptimized: boolean = false
): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: ${templateStyles.fontFamily};
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 20px;
    }

    .document-header {
      background: ${templateStyles.primaryColor};
      color: white;
      padding: 20px 30px;
      margin: -20px -20px 30px -20px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header-logo {
      height: 60px;
      width: auto;
    }

    .header-title {
      font-size: 1.8rem;
      margin-bottom: 5px;
    }

    .header-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .header-meta {
      font-size: 0.9rem;
      opacity: 0.7;
      margin-top: 5px;
    }

    .document-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .section {
      margin-bottom: 40px;
    }

    .section-title {
      color: ${templateStyles.primaryColor};
      border-bottom: 2px solid ${templateStyles.accentColor};
      padding-bottom: 10px;
      margin-bottom: 20px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .kpi-card {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      border-left: 4px solid #ccc;
    }

    .kpi-vert { border-left-color: #22c55e; }
    .kpi-orange { border-left-color: #f59e0b; }
    .kpi-rouge { border-left-color: #ef4444; }

    .kpi-value {
      font-size: 2rem;
      font-weight: bold;
      color: ${templateStyles.primaryColor};
    }

    .kpi-label {
      color: #666;
      margin-top: 5px;
    }

    .kpi-trend {
      font-size: 0.9rem;
      margin-top: 10px;
    }

    .kpi-trend-up { color: #22c55e; }
    .kpi-trend-down { color: #ef4444; }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 30px;
    }

    .chart-container {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 20px;
    }

    .chart-title {
      color: ${templateStyles.primaryColor};
      margin-bottom: 15px;
      font-size: 1.1rem;
    }

    .chart-image {
      max-width: 100%;
      height: auto;
    }

    .alertes-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .alerte-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 12px 15px;
      background: #fff;
      border-radius: 8px;
      border-left: 4px solid #ccc;
    }

    .alerte-critique { border-left-color: #ef4444; background: #fef2f2; }
    .alerte-haute { border-left-color: #f59e0b; background: #fffbeb; }
    .alerte-normale { border-left-color: #3b82f6; background: #eff6ff; }

    .alerte-badge {
      font-size: 0.7rem;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 4px;
      background: #e5e7eb;
    }

    .alerte-titre { flex: 1; }
    .alerte-date { color: #666; font-size: 0.85rem; }

    .document-footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 0.85rem;
    }

    .footer-legal {
      font-style: italic;
      margin-top: 5px;
    }

    .table-of-contents {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 40px;
    }

    .toc-list {
      margin-left: 20px;
    }

    .toc-item {
      margin: 8px 0;
    }

    .toc-item a {
      color: ${templateStyles.primaryColor};
      text-decoration: none;
    }

    .toc-item a:hover {
      text-decoration: underline;
    }

    ${printOptimized ? `
    @media print {
      body { padding: 0; }
      .document-header { margin: 0; }
      .section { page-break-inside: avoid; }
      .chart-container { break-inside: avoid; }
    }
    ` : ''}
  `;
}

function getChartJsScript(): string {
  return `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`;
}

// ============================================
// UTILITAIRES
// ============================================

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

function formatPeriode(periode: { type: string; valeur: string }): string {
  const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  if (periode.type === 'mois') {
    const [year, month] = periode.valeur.split('-');
    return `${mois[parseInt(month) - 1]} ${year}`;
  } else if (periode.type === 'trimestre') {
    return periode.valeur.replace('Q', 'T');
  }
  return periode.valeur;
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function getPersonalisationDefaults(partial?: Partial<ExportPersonalisation>): ExportPersonalisation {
  return {
    organisation: partial?.organisation || 'CRMC',
    paletteCouleurs: partial?.paletteCouleurs || {
      primaire: '#1a1a2e',
      secondaire: '#16213e',
      accent: '#0f3460',
      succes: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
    enTete: partial?.enTete || {
      afficher: true,
      hauteur: 80,
    },
    piedDePage: partial?.piedDePage || {
      afficher: true,
      inclureDate: true,
      inclureNumeroPage: false,
    },
    watermark: partial?.watermark || {
      actif: false,
      texte: 'CONFIDENTIEL',
      opacite: 0.05,
      rotation: -45,
    },
    mentionsLegales: partial?.mentionsLegales,
  };
}

// ============================================
// INTERFACES DE DONNÉES
// ============================================

interface DashboardData {
  centreName: string;
  auteur?: string;
  kpis: KPIData[];
  charts?: ChartData[];
  alertes?: AlerteData[];
  tendances?: TendanceData;
}

interface KPIData {
  nom: string;
  valeur: number;
  unite?: string;
  statut: 'vert' | 'orange' | 'rouge';
  tendance?: number;
  icone?: string;
}

interface ChartData {
  titre: string;
  config?: object;
  imageBase64?: string;
}

interface AlerteData {
  titre: string;
  priorite: 'critique' | 'haute' | 'normale' | 'info';
  date: string;
}

interface TendanceData {
  resume?: string;
}

interface RapportData {
  titre: string;
  sousTitre?: string;
  auteur: string;
  sections?: SectionData[];
  rawData?: object;
}

interface SectionData {
  titre: string;
  niveau: number;
  contenu: string;
}

// Export des types
export type { DashboardData, KPIData, ChartData, AlerteData, RapportData, SectionData };
