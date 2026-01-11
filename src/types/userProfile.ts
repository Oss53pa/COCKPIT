// ============================================
// TYPES PROFIL UTILISATEUR ET PRÉFÉRENCES
// Conformément au Cahier des Charges v1.1
// ============================================

// --- Préférences Utilisateur ---
export interface UserPreferences {
  langue: 'fr' | 'en';
  theme: 'light' | 'dark' | 'system';
  formatDate: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
  formatNombre: 'fr-FR' | 'en-US' | 'de-DE';
  deviseDefaut: string; // 'XOF', 'EUR', 'USD'
  centreParDefaut?: string; // UUID du centre affiché au démarrage
  dashboardWidgets: string[]; // IDs des widgets affichés sur dashboard
  notificationsEmail: boolean;
  digestFrequence: 'quotidien' | 'hebdomadaire' | 'jamais';
  exportQualite: 'standard' | 'haute';
  autoSaveInterval: number; // Secondes (défaut: 30)
}

// --- Profil Utilisateur Local ---
export interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string; // Pour signature des rapports
  fonction: string; // Ex: "Directrice Générale Adjointe"
  organisation: string; // Ex: "CRMC"
  avatar?: string; // Photo base64 (optionnel)
  signature?: string; // Signature numérisée base64
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

// --- Configuration par défaut ---
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  langue: 'fr',
  theme: 'system',
  formatDate: 'DD/MM/YYYY',
  formatNombre: 'fr-FR',
  deviseDefaut: 'XOF',
  centreParDefaut: undefined,
  dashboardWidgets: [
    'kpi-summary',
    'alerts-recent',
    'actions-progress',
    'centres-overview',
  ],
  notificationsEmail: false,
  digestFrequence: 'hebdomadaire',
  exportQualite: 'haute',
  autoSaveInterval: 30,
};

export const DEFAULT_USER_PROFILE: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
  nom: '',
  prenom: '',
  email: '',
  fonction: '',
  organisation: 'CRMC',
  preferences: DEFAULT_USER_PREFERENCES,
};

// --- Widgets disponibles pour le Dashboard ---
export interface DashboardWidget {
  id: string;
  nom: string;
  description: string;
  icone: string;
  categorie: 'kpi' | 'alerts' | 'actions' | 'centres' | 'projet' | 'bi';
  taille: 'small' | 'medium' | 'large';
}

export const DASHBOARD_WIDGETS: DashboardWidget[] = [
  {
    id: 'kpi-summary',
    nom: 'Synthèse KPIs',
    description: 'Vue d\'ensemble des indicateurs clés',
    icone: 'BarChart3',
    categorie: 'kpi',
    taille: 'large',
  },
  {
    id: 'alerts-recent',
    nom: 'Alertes Récentes',
    description: 'Dernières alertes générées',
    icone: 'Bell',
    categorie: 'alerts',
    taille: 'medium',
  },
  {
    id: 'actions-progress',
    nom: 'Actions en Cours',
    description: 'Suivi des plans d\'action',
    icone: 'CheckSquare',
    categorie: 'actions',
    taille: 'medium',
  },
  {
    id: 'centres-overview',
    nom: 'Vue Centres',
    description: 'Statut de tous les centres',
    icone: 'Building2',
    categorie: 'centres',
    taille: 'large',
  },
  {
    id: 'projet-countdown',
    nom: 'Compte à Rebours Projet',
    description: 'Délais projets en cours',
    icone: 'Clock',
    categorie: 'projet',
    taille: 'small',
  },
  {
    id: 'bi-highlights',
    nom: 'Points Saillants BI',
    description: 'Insights et tendances',
    icone: 'TrendingUp',
    categorie: 'bi',
    taille: 'medium',
  },
];

// --- Devises supportées ---
export interface DeviseInfo {
  code: string;
  nom: string;
  symbole: string;
  decimales: number;
}

export const DEVISES_SUPPORTEES: DeviseInfo[] = [
  { code: 'XOF', nom: 'Franc CFA (BCEAO)', symbole: 'F CFA', decimales: 0 },
  { code: 'XAF', nom: 'Franc CFA (BEAC)', symbole: 'F CFA', decimales: 0 },
  { code: 'EUR', nom: 'Euro', symbole: '€', decimales: 2 },
  { code: 'USD', nom: 'Dollar US', symbole: '$', decimales: 2 },
  { code: 'GBP', nom: 'Livre Sterling', symbole: '£', decimales: 2 },
  { code: 'MAD', nom: 'Dirham Marocain', symbole: 'DH', decimales: 2 },
  { code: 'TND', nom: 'Dinar Tunisien', symbole: 'DT', decimales: 3 },
];

// --- Langues supportées ---
export interface LangueInfo {
  code: 'fr' | 'en';
  nom: string;
  locale: string;
}

export const LANGUES_SUPPORTEES: LangueInfo[] = [
  { code: 'fr', nom: 'Français', locale: 'fr-FR' },
  { code: 'en', nom: 'English', locale: 'en-US' },
];
