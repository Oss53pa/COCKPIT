// ============================================
// CONFIGURATION EMAIL & NOTIFICATIONS
// Système de notifications par email pour Cockpit
// ============================================

/**
 * Services d'envoi d'email supportés
 * - EmailJS: Service gratuit côté client (recommandé)
 * - SMTP: Configuration SMTP directe (nécessite proxy/backend)
 * - Resend: API moderne d'envoi d'emails
 */
export type EmailService = 'emailjs' | 'smtp' | 'resend' | 'none';

/**
 * Configuration EmailJS
 * Service gratuit: https://www.emailjs.com/
 * - 200 emails/mois gratuits
 * - Fonctionne entièrement côté client
 */
export interface EmailJSConfig {
  serviceId: string;      // ID du service email (ex: 'service_xxx')
  templateId: string;     // ID du template pour notifications
  templateIdAlerte: string; // ID du template pour alertes urgentes
  publicKey: string;      // Clé publique EmailJS
}

/**
 * Configuration SMTP (pour usage avancé)
 */
export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

/**
 * Configuration Resend
 */
export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

/**
 * Configuration complète des emails
 */
export interface EmailConfiguration {
  enabled: boolean;
  service: EmailService;

  // Configuration spécifique au service
  emailjs?: EmailJSConfig;
  smtp?: SMTPConfig;
  resend?: ResendConfig;

  // Destinataire par défaut
  destinataireEmail: string;
  destinataireNom: string;

  // Options de notification
  options: NotificationOptions;

  // Métadonnées
  configuredAt?: string;
  lastTestAt?: string;
  lastTestSuccess?: boolean;
}

/**
 * Options de notification
 */
export interface NotificationOptions {
  // Types de notifications activées
  alertesCritiques: boolean;
  alertesImportantes: boolean;
  alertesInfo: boolean;

  // Rapports périodiques
  digestQuotidien: boolean;
  digestHebdomadaire: boolean;
  heureDigest: string; // Format HH:MM
  jourDigestHebdo: number; // 0=Dimanche, 1=Lundi, etc.

  // Événements spécifiques
  nouvelleEcheance: boolean;
  baillExpiration: boolean;
  objectifAtteint: boolean;
  importTermine: boolean;
  backupEffectue: boolean;

  // Délais de rappel (en jours)
  rappelEcheanceJours: number;
  rappelBailJours: number;
}

/**
 * Template d'email
 */
export interface EmailTemplate {
  id: string;
  nom: string;
  sujet: string;
  contenuHtml: string;
  contenuTexte: string;
  variables: string[]; // Variables disponibles: {{nom}}, {{date}}, etc.
}

/**
 * Email à envoyer
 */
export interface EmailMessage {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

/**
 * Pièce jointe
 */
export interface EmailAttachment {
  filename: string;
  content: string; // Base64
  contentType: string;
}

/**
 * Résultat d'envoi
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
}

/**
 * Historique des notifications
 */
export interface NotificationHistoryEntry {
  id: string;
  type: 'alerte' | 'digest' | 'rappel' | 'info';
  sujet: string;
  destinataire: string;
  envoyeAt: string;
  statut: 'envoye' | 'echec' | 'en_attente';
  erreur?: string;
  alerteId?: string; // Référence à l'alerte si applicable
}

/**
 * Statistiques des notifications
 */
export interface NotificationStats {
  totalEnvoyes: number;
  totalEchecs: number;
  dernierEnvoi?: string;
  parType: {
    alertes: number;
    digests: number;
    rappels: number;
    infos: number;
  };
  parJour: { date: string; count: number }[];
}

// Configuration par défaut
export const DEFAULT_EMAIL_CONFIG: EmailConfiguration = {
  enabled: false,
  service: 'none',
  destinataireEmail: '',
  destinataireNom: '',
  options: {
    alertesCritiques: true,
    alertesImportantes: true,
    alertesInfo: false,
    digestQuotidien: false,
    digestHebdomadaire: true,
    heureDigest: '08:00',
    jourDigestHebdo: 1, // Lundi
    nouvelleEcheance: true,
    baillExpiration: true,
    objectifAtteint: true,
    importTermine: false,
    backupEffectue: false,
    rappelEcheanceJours: 7,
    rappelBailJours: 90,
  },
};

// Templates par défaut
export const EMAIL_TEMPLATES: Record<string, Omit<EmailTemplate, 'id'>> = {
  alerte_critique: {
    nom: 'Alerte Critique',
    sujet: '🚨 [COCKPIT] Alerte Critique: {{titre}}',
    contenuHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🚨 Alerte Critique</h1>
        </div>
        <div style="padding: 20px; background: #FEF2F2; border: 1px solid #FECACA;">
          <h2 style="color: #991B1B; margin-top: 0;">{{titre}}</h2>
          <p style="color: #7F1D1D;">{{message}}</p>
          <p><strong>Centre:</strong> {{centre}}</p>
          <p><strong>Date:</strong> {{date}}</p>
        </div>
        <div style="padding: 20px; text-align: center;">
          <a href="{{lien}}" style="background: #1E3A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Voir dans Cockpit
          </a>
        </div>
        <div style="padding: 10px; text-align: center; color: #6B7280; font-size: 12px;">
          Envoyé par Cockpit - Plateforme de Pilotage Immobilier
        </div>
      </div>
    `,
    contenuTexte: `
ALERTE CRITIQUE - {{titre}}

{{message}}

Centre: {{centre}}
Date: {{date}}

Voir dans Cockpit: {{lien}}
    `,
    variables: ['titre', 'message', 'centre', 'date', 'lien'],
  },

  alerte_importante: {
    nom: 'Alerte Importante',
    sujet: '⚠️ [COCKPIT] {{titre}}',
    contenuHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #F59E0B; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">⚠️ Alerte Importante</h1>
        </div>
        <div style="padding: 20px; background: #FFFBEB; border: 1px solid #FDE68A;">
          <h2 style="color: #92400E; margin-top: 0;">{{titre}}</h2>
          <p style="color: #78350F;">{{message}}</p>
          <p><strong>Centre:</strong> {{centre}}</p>
          <p><strong>Date:</strong> {{date}}</p>
        </div>
        <div style="padding: 20px; text-align: center;">
          <a href="{{lien}}" style="background: #1E3A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Voir dans Cockpit
          </a>
        </div>
      </div>
    `,
    contenuTexte: `
ALERTE IMPORTANTE - {{titre}}

{{message}}

Centre: {{centre}}
Date: {{date}}
    `,
    variables: ['titre', 'message', 'centre', 'date', 'lien'],
  },

  digest_hebdomadaire: {
    nom: 'Digest Hebdomadaire',
    sujet: '📊 [COCKPIT] Résumé Hebdomadaire - Semaine du {{dateDebut}}',
    contenuHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1E3A5F; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">📊 Résumé Hebdomadaire</h1>
          <p style="margin: 5px 0 0 0;">Semaine du {{dateDebut}} au {{dateFin}}</p>
        </div>

        <div style="padding: 20px;">
          <h3 style="color: #1E3A5F; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">
            🔔 Alertes ({{nbAlertes}})
          </h3>
          {{alertesHtml}}

          <h3 style="color: #1E3A5F; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-top: 20px;">
            📅 Échéances à venir
          </h3>
          {{echeancesHtml}}

          <h3 style="color: #1E3A5F; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-top: 20px;">
            📈 KPIs clés
          </h3>
          {{kpisHtml}}
        </div>

        <div style="padding: 20px; text-align: center; background: #F3F4F6;">
          <a href="{{lien}}" style="background: #1E3A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Accéder à Cockpit
          </a>
        </div>
      </div>
    `,
    contenuTexte: `
RÉSUMÉ HEBDOMADAIRE - Semaine du {{dateDebut}} au {{dateFin}}

ALERTES ({{nbAlertes}})
{{alertesTexte}}

ÉCHÉANCES À VENIR
{{echeancesTexte}}

KPIs CLÉS
{{kpisTexte}}
    `,
    variables: ['dateDebut', 'dateFin', 'nbAlertes', 'alertesHtml', 'alertesTexte', 'echeancesHtml', 'echeancesTexte', 'kpisHtml', 'kpisTexte', 'lien'],
  },

  rappel_bail: {
    nom: 'Rappel Expiration Bail',
    sujet: '📋 [COCKPIT] Rappel: Bail {{locataire}} expire dans {{joursRestants}} jours',
    contenuHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #7C3AED; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">📋 Rappel Expiration Bail</h1>
        </div>
        <div style="padding: 20px;">
          <p>Le bail suivant arrive à expiration prochainement:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #F3F4F6;">
              <td style="padding: 10px; border: 1px solid #E5E7EB;"><strong>Locataire</strong></td>
              <td style="padding: 10px; border: 1px solid #E5E7EB;">{{locataire}}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #E5E7EB;"><strong>Local</strong></td>
              <td style="padding: 10px; border: 1px solid #E5E7EB;">{{local}}</td>
            </tr>
            <tr style="background: #F3F4F6;">
              <td style="padding: 10px; border: 1px solid #E5E7EB;"><strong>Centre</strong></td>
              <td style="padding: 10px; border: 1px solid #E5E7EB;">{{centre}}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #E5E7EB;"><strong>Date d'expiration</strong></td>
              <td style="padding: 10px; border: 1px solid #E5E7EB;">{{dateExpiration}}</td>
            </tr>
            <tr style="background: #FEF3C7;">
              <td style="padding: 10px; border: 1px solid #E5E7EB;"><strong>Jours restants</strong></td>
              <td style="padding: 10px; border: 1px solid #E5E7EB; color: #92400E; font-weight: bold;">{{joursRestants}} jours</td>
            </tr>
          </table>
        </div>
        <div style="padding: 20px; text-align: center;">
          <a href="{{lien}}" style="background: #1E3A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Gérer ce bail
          </a>
        </div>
      </div>
    `,
    contenuTexte: `
RAPPEL EXPIRATION BAIL

Locataire: {{locataire}}
Local: {{local}}
Centre: {{centre}}
Date d'expiration: {{dateExpiration}}
Jours restants: {{joursRestants}}
    `,
    variables: ['locataire', 'local', 'centre', 'dateExpiration', 'joursRestants', 'lien'],
  },
};
