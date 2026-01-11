// ============================================
// SERVICE D'ENVOI D'EMAILS
// Utilise EmailJS pour l'envoi côté client
// Documentation: https://www.emailjs.com/docs/
// ============================================

import type {
  EmailConfiguration,
  EmailMessage,
  EmailSendResult,
  EmailJSConfig,
} from '../types';

import {
  renderTemplate,
  EMAIL_TEMPLATES,
  type EmailTemplateName,
} from '../templates';

/**
 * Service d'envoi d'emails via EmailJS
 * EmailJS permet d'envoyer des emails directement depuis le navigateur
 * sans avoir besoin d'un serveur backend.
 *
 * Configuration requise:
 * 1. Créer un compte sur emailjs.com
 * 2. Créer un service email (Gmail, Outlook, etc.)
 * 3. Créer un template d'email
 * 4. Récupérer les IDs et clé publique
 */
class EmailService {
  private static instance: EmailService;
  private config: EmailConfiguration | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Configure le service avec les paramètres EmailJS
   */
  configure(config: EmailConfiguration): void {
    this.config = config;
    this.initialized = config.enabled && config.service === 'emailjs' && !!config.emailjs?.publicKey;
  }

  /**
   * Vérifie si le service est configuré
   */
  isConfigured(): boolean {
    return this.initialized && this.config?.enabled === true;
  }

  /**
   * Récupère la configuration actuelle
   */
  getConfig(): EmailConfiguration | null {
    return this.config;
  }

  /**
   * Envoie un email via EmailJS
   */
  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    if (!this.isConfigured() || !this.config?.emailjs) {
      return {
        success: false,
        error: 'Service email non configuré',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const { serviceId, templateId, publicKey } = this.config.emailjs;

      // Préparer les paramètres pour EmailJS
      const templateParams = {
        to_email: message.to,
        to_name: message.toName || message.to,
        subject: message.subject,
        message_html: message.htmlContent,
        message_text: message.textContent || this.stripHtml(message.htmlContent),
        reply_to: message.replyTo || this.config.destinataireEmail,
        from_name: 'Cockpit - Plateforme de Pilotage',
      };

      // Appel à l'API EmailJS
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: templateParams,
        }),
      });

      if (response.ok) {
        return {
          success: true,
          messageId: `emailjs_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
      } else {
        const errorText = await response.text();
        throw new Error(errorText || `Erreur HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Envoie une notification d'alerte
   */
  async sendAlertNotification(
    titre: string,
    message: string,
    priorite: 'critique' | 'haute' | 'normale' | 'info',
    centre?: string,
    lien?: string
  ): Promise<EmailSendResult> {
    if (!this.isConfigured() || !this.config) {
      return {
        success: false,
        error: 'Service email non configuré',
        timestamp: new Date().toISOString(),
      };
    }

    // Vérifier si ce type d'alerte doit être envoyé
    const { options } = this.config;
    if (priorite === 'critique' && !options.alertesCritiques) {
      return { success: false, error: 'Alertes critiques désactivées', timestamp: new Date().toISOString() };
    }
    if ((priorite === 'haute' || priorite === 'normale') && !options.alertesImportantes) {
      return { success: false, error: 'Alertes importantes désactivées', timestamp: new Date().toISOString() };
    }
    if (priorite === 'info' && !options.alertesInfo) {
      return { success: false, error: 'Alertes info désactivées', timestamp: new Date().toISOString() };
    }

    // Choisir le template selon la priorité
    const templateName: EmailTemplateName =
      priorite === 'critique' ? 'alerte_critique' :
      priorite === 'info' ? 'alerte_info' : 'alerte_importante';

    // Générer le HTML avec le nouveau template
    const htmlContent = renderTemplate(templateName, {
      titre,
      message,
      centre: centre || 'Global',
      date: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      lien: lien || window.location.origin,
      unsubscribe_link: `${window.location.origin}/notifications`,
    });

    const emoji = priorite === 'critique' ? '🚨' : priorite === 'haute' ? '⚠️' : 'ℹ️';

    return this.sendEmail({
      to: this.config.destinataireEmail,
      toName: this.config.destinataireNom,
      subject: `${emoji} [COCKPIT] ${titre}`,
      htmlContent,
    });
  }

  /**
   * Envoie un rappel d'expiration de bail
   */
  async sendBailExpirationReminder(
    locataire: string,
    local: string,
    centre: string,
    dateExpiration: string,
    joursRestants: number,
    loyerMensuel?: string
  ): Promise<EmailSendResult> {
    if (!this.isConfigured() || !this.config) {
      return { success: false, error: 'Service non configuré', timestamp: new Date().toISOString() };
    }

    if (!this.config.options.baillExpiration) {
      return { success: false, error: 'Rappels bail désactivés', timestamp: new Date().toISOString() };
    }

    const htmlContent = renderTemplate('rappel_bail', {
      locataire,
      local,
      centre,
      dateExpiration,
      joursRestants: String(joursRestants),
      loyerMensuel: loyerMensuel || 'N/A',
      lien: window.location.origin,
      unsubscribe_link: `${window.location.origin}/notifications`,
    });

    return this.sendEmail({
      to: this.config.destinataireEmail,
      toName: this.config.destinataireNom,
      subject: `📋 [COCKPIT] Rappel: Bail ${locataire} expire dans ${joursRestants} jours`,
      htmlContent,
    });
  }

  /**
   * Envoie le digest hebdomadaire
   */
  async sendWeeklyDigest(
    dateDebut: string,
    dateFin: string,
    alertes: { titre: string; priorite: string }[],
    echeances: { titre: string; date: string }[],
    kpis: { nom: string; valeur: string; statut: string }[]
  ): Promise<EmailSendResult> {
    if (!this.isConfigured() || !this.config) {
      return { success: false, error: 'Service non configuré', timestamp: new Date().toISOString() };
    }

    if (!this.config.options.digestHebdomadaire) {
      return { success: false, error: 'Digest hebdomadaire désactivé', timestamp: new Date().toISOString() };
    }

    // Construire le contenu HTML des alertes
    const alertesHtml = alertes.length > 0
      ? alertes.map(a => `
        <div style="padding: 10px; margin: 5px 0; background: ${a.priorite === 'critique' ? '#FEF2F2' : '#FFFBEB'}; border-radius: 4px;">
          ${a.priorite === 'critique' ? '🚨' : '⚠️'} ${a.titre}
        </div>
      `).join('')
      : '<p style="color: #6B7280;">Aucune alerte cette semaine</p>';

    // Construire le contenu des échéances
    const echeancesHtml = echeances.length > 0
      ? echeances.map(e => `
        <div style="padding: 10px; margin: 5px 0; background: #F3F4F6; border-radius: 4px;">
          📅 ${e.titre} - <strong>${e.date}</strong>
        </div>
      `).join('')
      : '<p style="color: #6B7280;">Aucune échéance proche</p>';

    // Construire le contenu des KPIs
    const kpisHtml = kpis.length > 0
      ? kpis.map(k => {
        const bgColor = k.statut === 'vert' ? '#D1FAE5' : k.statut === 'orange' ? '#FEF3C7' : '#FEE2E2';
        const color = k.statut === 'vert' ? '#065F46' : k.statut === 'orange' ? '#92400E' : '#991B1B';
        return `
          <div style="display: inline-block; padding: 10px; margin: 5px; background: ${bgColor}; border-radius: 4px; min-width: 120px;">
            <div style="font-size: 12px; color: #6B7280;">${k.nom}</div>
            <div style="font-size: 18px; font-weight: bold; color: ${color};">${k.valeur}</div>
          </div>
        `;
      }).join('')
      : '<p style="color: #6B7280;">Aucun KPI à afficher</p>';

    const htmlContent = this.buildEmailFromTemplate('digest_hebdomadaire', {
      dateDebut,
      dateFin,
      nbAlertes: String(alertes.length),
      alertesHtml,
      alertesTexte: alertes.map(a => `- ${a.titre}`).join('\n'),
      echeancesHtml,
      echeancesTexte: echeances.map(e => `- ${e.titre} (${e.date})`).join('\n'),
      kpisHtml,
      kpisTexte: kpis.map(k => `- ${k.nom}: ${k.valeur}`).join('\n'),
      lien: window.location.origin,
    });

    return this.sendEmail({
      to: this.config.destinataireEmail,
      toName: this.config.destinataireNom,
      subject: `📊 [COCKPIT] Résumé Hebdomadaire - Semaine du ${dateDebut}`,
      htmlContent,
    });
  }

  /**
   * Teste la configuration en envoyant un email de test
   */
  async sendTestEmail(): Promise<EmailSendResult> {
    if (!this.config) {
      return { success: false, error: 'Configuration manquante', timestamp: new Date().toISOString() };
    }

    // Construire la liste des notifications actives
    const notificationsActives = [
      { active: this.config.options.alertesCritiques, label: 'Alertes critiques', icon: '🚨' },
      { active: this.config.options.alertesImportantes, label: 'Alertes importantes', icon: '⚠️' },
      { active: this.config.options.alertesInfo, label: 'Notifications info', icon: 'ℹ️' },
      { active: this.config.options.digestHebdomadaire, label: 'Digest hebdomadaire', icon: '📊' },
      { active: this.config.options.digestQuotidien, label: 'Digest quotidien', icon: '📰' },
      { active: this.config.options.baillExpiration, label: 'Rappels expiration baux', icon: '📋' },
      { active: this.config.options.nouvelleEcheance, label: 'Rappels échéances', icon: '📅' },
      { active: this.config.options.objectifAtteint, label: 'Objectifs atteints', icon: '🎯' },
    ].map(n => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
          <span style="color: ${n.active ? '#059669' : '#DC2626'}; font-size: 16px; margin-right: 10px;">
            ${n.active ? '✅' : '❌'}
          </span>
          <span style="color: ${n.active ? '#065F46' : '#6B7280'}; font-size: 14px;">
            ${n.icon} ${n.label}
          </span>
        </td>
      </tr>
    `).join('');

    const htmlContent = renderTemplate('test_bienvenue', {
      date: new Date().toLocaleString('fr-FR'),
      email: this.config.destinataireEmail,
      notificationsActives,
      lien: window.location.origin,
    });

    return this.sendEmail({
      to: this.config.destinataireEmail,
      toName: this.config.destinataireNom,
      subject: '✅ [COCKPIT] Configuration email réussie',
      htmlContent,
    });
  }

  /**
   * Envoie une notification d'objectif atteint
   */
  async sendObjectifAtteintNotification(
    axe: string,
    objectif: string,
    valeur: string,
    centre: string,
    progression: string
  ): Promise<EmailSendResult> {
    if (!this.isConfigured() || !this.config) {
      return { success: false, error: 'Service non configuré', timestamp: new Date().toISOString() };
    }

    if (!this.config.options.objectifAtteint) {
      return { success: false, error: 'Notifications objectifs désactivées', timestamp: new Date().toISOString() };
    }

    const messagesMotivation = [
      'Continuez sur cette lancée, les résultats sont au rendez-vous !',
      'Excellente performance, votre équipe fait un travail remarquable !',
      'Objectif atteint grâce à votre engagement quotidien !',
      'Bravo à toute l\'équipe pour cet accomplissement !',
    ];
    const messageMotivation = messagesMotivation[Math.floor(Math.random() * messagesMotivation.length)];

    const htmlContent = renderTemplate('objectif_atteint', {
      axe,
      objectif,
      valeur,
      centre,
      progression,
      messageMotivation,
      lien: window.location.origin,
      unsubscribe_link: `${window.location.origin}/notifications`,
    });

    return this.sendEmail({
      to: this.config.destinataireEmail,
      toName: this.config.destinataireNom,
      subject: `🎯 [COCKPIT] Objectif atteint: ${objectif}`,
      htmlContent,
    });
  }

  /**
   * Envoie une notification d'import terminé
   */
  async sendImportTermineNotification(
    fichier: string,
    typeImport: string,
    lignesImportees: number,
    lignesErreur: number,
    scoreQualite: number
  ): Promise<EmailSendResult> {
    if (!this.isConfigured() || !this.config) {
      return { success: false, error: 'Service non configuré', timestamp: new Date().toISOString() };
    }

    if (!this.config.options.importTermine) {
      return { success: false, error: 'Notifications import désactivées', timestamp: new Date().toISOString() };
    }

    // Déterminer le statut
    const statut = lignesErreur === 0 ? 'success' : lignesErreur < lignesImportees ? 'partial' : 'error';
    const statutConfig = {
      success: { bg: '#D1FAE5', color: '#065F46', icon: '✅', texte: 'Import réussi' },
      partial: { bg: '#FEF3C7', color: '#92400E', icon: '⚠️', texte: 'Import partiel' },
      error: { bg: '#FEE2E2', color: '#991B1B', icon: '❌', texte: 'Import échoué' },
    }[statut];

    // Couleur du score
    const scoreColor = scoreQualite >= 90 ? '#059669' : scoreQualite >= 70 ? '#D97706' : '#DC2626';
    const scoreGradient = scoreQualite >= 90 ? '#059669, #10B981' : scoreQualite >= 70 ? '#D97706, #F59E0B' : '#DC2626, #EF4444';

    const htmlContent = renderTemplate('import_termine', {
      fichier,
      typeImport,
      lignesImportees: String(lignesImportees),
      lignesErreur: String(lignesErreur),
      scoreQualite: String(scoreQualite),
      statutBg: statutConfig.bg,
      statutColor: statutConfig.color,
      statutIcon: statutConfig.icon,
      statutTexte: statutConfig.texte,
      erreursColor: lignesErreur > 0 ? '#DC2626' : '#059669',
      scoreColor,
      scoreGradient,
      erreursHtml: lignesErreur > 0 ? `
        <div style="background-color: #FEF2F2; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #991B1B; font-size: 14px;">
            ⚠️ ${lignesErreur} ligne(s) n'ont pas pu être importées. Consultez le détail pour corriger les erreurs.
          </p>
        </div>
      ` : '',
      lien: window.location.origin,
      unsubscribe_link: `${window.location.origin}/notifications`,
    });

    return this.sendEmail({
      to: this.config.destinataireEmail,
      toName: this.config.destinataireNom,
      subject: `📥 [COCKPIT] Import terminé: ${fichier}`,
      htmlContent,
    });
  }

  /**
   * Envoie une notification de sauvegarde effectuée
   */
  async sendBackupNotification(
    date: string,
    nbTables: number,
    nbEnregistrements: number,
    taille: string
  ): Promise<EmailSendResult> {
    if (!this.isConfigured() || !this.config) {
      return { success: false, error: 'Service non configuré', timestamp: new Date().toISOString() };
    }

    if (!this.config.options.backupEffectue) {
      return { success: false, error: 'Notifications backup désactivées', timestamp: new Date().toISOString() };
    }

    const htmlContent = renderTemplate('backup_effectue', {
      date,
      nbTables: String(nbTables),
      nbEnregistrements: nbEnregistrements.toLocaleString('fr-FR'),
      taille,
      lien: `${window.location.origin}/sauvegarde`,
      unsubscribe_link: `${window.location.origin}/notifications`,
    });

    return this.sendEmail({
      to: this.config.destinataireEmail,
      toName: this.config.destinataireNom,
      subject: '💾 [COCKPIT] Sauvegarde effectuée avec succès',
      htmlContent,
    });
  }

  /**
   * Envoie une notification de rappel d'échéance d'action
   */
  async sendEcheanceActionNotification(
    titreAction: string,
    description: string,
    centre: string,
    responsable: string,
    priorite: string,
    dateEcheance: string,
    joursRestants: number,
    avancement: number
  ): Promise<EmailSendResult> {
    if (!this.isConfigured() || !this.config) {
      return { success: false, error: 'Service non configuré', timestamp: new Date().toISOString() };
    }

    if (!this.config.options.nouvelleEcheance) {
      return { success: false, error: 'Rappels échéances désactivés', timestamp: new Date().toISOString() };
    }

    // Couleurs selon priorité
    const prioriteConfig: Record<string, { bg: string; color: string }> = {
      critique: { bg: '#FEE2E2', color: '#991B1B' },
      haute: { bg: '#FEF3C7', color: '#92400E' },
      moyenne: { bg: '#DBEAFE', color: '#1E40AF' },
      basse: { bg: '#F3F4F6', color: '#374151' },
    };
    const config = prioriteConfig[priorite] || prioriteConfig.moyenne;

    const htmlContent = renderTemplate('echeance_action', {
      titreAction,
      description,
      centre,
      responsable,
      priorite: priorite.charAt(0).toUpperCase() + priorite.slice(1),
      prioriteBg: config.bg,
      prioriteColor: config.color,
      dateEcheance,
      joursRestants: String(joursRestants),
      avancement: String(avancement),
      lien: window.location.origin,
      unsubscribe_link: `${window.location.origin}/notifications`,
    });

    return this.sendEmail({
      to: this.config.destinataireEmail,
      toName: this.config.destinataireNom,
      subject: `⏰ [COCKPIT] Rappel: ${titreAction} - Échéance dans ${joursRestants} jour(s)`,
      htmlContent,
    });
  }

  /**
   * Supprime les balises HTML d'un texte
   */
  private stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}

// Export de l'instance singleton
export const emailService = EmailService.getInstance();

// Export du type pour les tests
export type { EmailService };
