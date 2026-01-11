/**
 * Report Studio TypeScript Types
 * Based on EasyView-BI Specification
 */

// ============================================================================
// SECTION: Block Types
// ============================================================================

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'chart'
  | 'table'
  | 'image'
  | 'callout'
  | 'quote'
  | 'divider'
  | 'pagebreak'
  | 'list'
  | 'kpi_card';

export interface BaseBlock {
  id: string;
  type: BlockType;
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    aiGenerated?: boolean;
  };
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  content: string;
  formatting?: TextFormatting;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
}

export interface ChartBlock extends BaseBlock {
  type: 'chart';
  chartType: ChartType;
  data: ChartData;
  config: ChartConfig;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  headers: TableHeader[];
  rows: TableRow[];
  config: TableConfig;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  alignment?: 'left' | 'center' | 'right';
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  variant: 'info' | 'warning' | 'success' | 'error' | 'tip';
  title?: string;
  content: string;
  icon?: string;
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  content: string;
  source?: string;
  author?: string;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface PagebreakBlock extends BaseBlock {
  type: 'pagebreak';
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  listType: 'bullet' | 'numbered';
  items: ListItem[];
}

export interface ListItem {
  id: string;
  content: string;
  children?: ListItem[];
}

export interface KPICardBlock extends BaseBlock {
  type: 'kpi_card';
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  sparkline?: number[];
}

export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | ChartBlock
  | TableBlock
  | ImageBlock
  | CalloutBlock
  | QuoteBlock
  | DividerBlock
  | PagebreakBlock
  | ListBlock
  | KPICardBlock;

// ============================================================================
// SECTION: Text Formatting
// ============================================================================

export interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

// ============================================================================
// SECTION: Charts
// ============================================================================

export type ChartType =
  | 'line'
  | 'bar'
  | 'horizontal_bar'
  | 'stacked_bar'
  | 'pie'
  | 'donut'
  | 'area'
  | 'radar'
  | 'scatter'
  | 'gauge'
  | 'funnel'
  | 'treemap'
  | 'heatmap'
  | 'waterfall'
  | 'combo'
  | 'kpi_card'
  | 'sparkline';

export interface ChartData {
  labels?: string[];
  datasets: ChartDataset[];
  raw?: Record<string, any>[];
}

export interface ChartDataset {
  label: string;
  data: (number | null)[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  fill?: boolean;
}

export interface ChartConfig {
  title?: string;
  subtitle?: string;
  source?: string;
  width?: number;
  height?: number;
  colorScheme?: 'corporate' | 'vibrant' | 'pastel' | 'monochrome' | 'custom';
  colors?: string[];
  legend?: {
    show: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  gridLines?: boolean;
  tooltips?: boolean;
  animations?: boolean;
}

export interface AxisConfig {
  title?: string;
  min?: number;
  max?: number;
  format?: string;
  gridLines?: boolean;
}

// ============================================================================
// SECTION: Tables
// ============================================================================

export interface TableHeader {
  id: string;
  label: string;
  key: string;
  sortable?: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: 'text' | 'number' | 'currency' | 'percentage' | 'date';
}

export type TableRow = Record<string, TableCell>;

export interface TableCell {
  value: string | number | null;
  formatted?: string;
  style?: {
    backgroundColor?: string;
    color?: string;
    fontWeight?: string;
  };
}

export interface TableConfig {
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
}

// ============================================================================
// SECTION: Document Structure
// ============================================================================

export type SectionStatus = 'generated' | 'edited' | 'manual';

export interface Section {
  id: string;
  type: 'section';
  title: string;
  icon?: string;
  level: number;
  blocks: ContentBlock[];
  children: Section[];
  status: SectionStatus;
  isLocked: boolean;
  isCollapsed?: boolean;
  metadata?: {
    completionStatus?: 'complete' | 'draft' | 'needs_review';
    hasComments?: boolean;
    aiConfidence?: number;
  };
}

export interface ContentTree {
  sections: Section[];
}

// ============================================================================
// SECTION: Report
// ============================================================================

export type ReportStatus =
  | 'draft'
  | 'generating'
  | 'review'
  | 'approved'
  | 'published'
  | 'archived';

export interface StudioReport {
  id: string;
  centreId: string;
  title: string;
  description?: string;
  type: string;
  status: ReportStatus;
  author: string;

  // Période
  periodStart?: string;
  periodEnd?: string;
  periodLabel?: string;

  // Contenu
  contentTree: ContentTree;

  // Métadonnées
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;

  // Design
  designSettings?: ReportDesignSettings;
}

// ============================================================================
// SECTION: Design Settings
// ============================================================================

export interface ReportDesignSettings {
  pageFormat: {
    size: 'A4' | 'Letter' | 'A3';
    orientation: 'portrait' | 'landscape';
    margins: 'normal' | 'narrow' | 'wide';
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  branding: {
    showLogo: boolean;
    logoUrl?: string;
    showFooter: boolean;
    footerText?: string;
  };
  cover: {
    enabled: boolean;
    template: string;
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
  };
  tableOfContents: {
    enabled: boolean;
    depth: number;
    showPageNumbers: boolean;
  };
}

// ============================================================================
// SECTION: Export
// ============================================================================

export type ExportFormat = 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'html' | 'markdown';

export interface ExportOptions {
  format: ExportFormat;
  quality?: 'draft' | 'standard' | 'high';
  pageSize?: 'A4' | 'Letter' | 'A3';
  orientation?: 'portrait' | 'landscape';
  margins?: 'normal' | 'narrow' | 'wide';
  includeTableOfContents?: boolean;
  includeCoverPage?: boolean;
  includeComments?: boolean;
  watermark?: string;
  password?: string;
  selectedSections?: string[];
}

// ============================================================================
// SECTION: AI & Insights
// ============================================================================

export interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'warning' | 'info' | 'opportunity';
  title: string;
  description: string;
  value?: string;
  change?: number;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  status: 'pending' | 'accepted' | 'rejected';
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: AIAction[];
}

export interface AIAction {
  type: 'insert' | 'replace' | 'create_section' | 'update_chart';
  label: string;
  data: any;
}

// ============================================================================
// SECTION: Version Control
// ============================================================================

export interface ReportVersion {
  id: string;
  reportId: string;
  versionNumber: number;
  name?: string;
  description?: string;
  contentSnapshot: ContentTree;
  createdAt: string;
  createdBy: string;
}

// ============================================================================
// SECTION: Comments
// ============================================================================

export interface ReportComment {
  id: string;
  reportId: string;
  blockId: string;
  content: string;
  parentId?: string;
  replies?: ReportComment[];
  isResolved: boolean;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// SECTION: Editor State
// ============================================================================

export interface EditorState {
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  isEditing: boolean;
  isDragging: boolean;
  zoomLevel: number;
  showGrid: boolean;
  showComments: boolean;
}

export interface AIPanelState {
  isOpen: boolean;
  activeTab: 'summary' | 'insights' | 'recommendations' | 'chat' | 'activity' | 'comments';
  isLoading: boolean;
  chatMessages: AIMessage[];
}

export interface UIState {
  isSaving: boolean;
  isGenerating: boolean;
  isPublishing: boolean;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  sidebarCollapsed: boolean;
  aiPanelCollapsed: boolean;
}

// ============================================================================
// SECTION: Report Templates
// ============================================================================

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  types: string[]; // Types de rapport inclus
  centreId?: string; // Si spécifique à un centre

  // Structure du template
  contentTree: ContentTree;
  designSettings?: ReportDesignSettings;

  // Métadonnées
  category: 'mensuel' | 'trimestriel' | 'annuel' | 'ponctuel' | 'custom';
  isDefault: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;

  // Configuration des données
  dataConfig: {
    requiredDataSources: string[];
    refreshOnOpen: boolean;
    defaultPeriodType: 'month' | 'quarter' | 'year' | 'custom';
  };
}

export interface ReportPeriod {
  type: 'month' | 'quarter' | 'year' | 'custom';
  start: string;
  end: string;
  label: string;
  comparison?: {
    enabled: boolean;
    type: 'previous_period' | 'same_period_last_year';
  };
}

export interface DataSourceBinding {
  id: string;
  blockId: string;
  sourceType: 'kpi' | 'chart' | 'table';
  dataSource: string; // ID de la source de données
  mapping: Record<string, string>;
  refreshable: boolean;
  lastRefreshed?: string;
}
