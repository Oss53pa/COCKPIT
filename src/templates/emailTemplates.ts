// ============================================
// TEMPLATES HTML POUR EMAILS
// Collection complète de templates professionnels
// Compatible EmailJS et autres services d'envoi
// ============================================

/**
 * Styles communs pour tous les templates
 */
const COMMON_STYLES = {
  // Couleurs de la charte graphique Cockpit
  colors: {
    primary: '#1E3A5F',      // Bleu marine principal
    primaryLight: '#2D5A8A',
    primaryDark: '#0F1F33',
    accent: '#C4A052',       // Or/Bronze
    success: '#059669',      // Vert
    warning: '#D97706',      // Orange
    danger: '#DC2626',       // Rouge
    info: '#0284C7',         // Bleu clair
    gray: '#6B7280',
    grayLight: '#F3F4F6',
    white: '#FFFFFF',
  },
  // Polices
  fonts: {
    primary: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    heading: "'Segoe UI Semibold', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
};

/**
 * En-tête commun pour tous les emails
 */
const getEmailHeader = (title: string, emoji: string, bgColor: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    td { padding: 0; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: ${COMMON_STYLES.fonts.primary};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F3F4F6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header avec logo -->
          <tr>
            <td style="background: linear-gradient(135deg, ${bgColor} 0%, ${COMMON_STYLES.colors.primaryDark} 100%); padding: 30px 40px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    <span style="font-size: 48px;">${emoji}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px; text-align: center;">
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 600; font-family: ${COMMON_STYLES.fonts.heading};">
                      ${title}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
`;

/**
 * Pied de page commun pour tous les emails
 */
const getEmailFooter = (showUnsubscribe = true) => `
          <!-- Footer -->
          <tr>
            <td style="background-color: ${COMMON_STYLES.colors.grayLight}; padding: 30px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 15px;">
                    <img src="https://via.placeholder.com/120x40/1E3A5F/FFFFFF?text=COCKPIT" alt="Cockpit" style="height: 40px;" />
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; color: ${COMMON_STYLES.colors.gray}; font-size: 12px; line-height: 1.6;">
                    <p style="margin: 0 0 10px 0;">
                      Cockpit - Plateforme de Pilotage Immobilier Commercial
                    </p>
                    <p style="margin: 0 0 10px 0;">
                      Cet email a été envoyé automatiquement. Ne pas répondre directement.
                    </p>
                    ${showUnsubscribe ? `
                    <p style="margin: 0;">
                      <a href="{{unsubscribe_link}}" style="color: ${COMMON_STYLES.colors.info}; text-decoration: none;">
                        Gérer mes préférences de notification
                      </a>
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Bouton CTA (Call-to-Action)
 */
const getButton = (text: string, url: string, color: string = COMMON_STYLES.colors.primary) => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
  <tr>
    <td style="border-radius: 6px; background-color: ${color};">
      <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 14px; font-family: ${COMMON_STYLES.fonts.primary};">
        ${text}
      </a>
    </td>
  </tr>
</table>
`;

/**
 * Carte d'information
 */
const getInfoCard = (icon: string, label: string, value: string, bgColor: string = '#F9FAFB') => `
<td style="padding: 12px; background-color: ${bgColor}; border-radius: 6px; border: 1px solid #E5E7EB;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="font-size: 20px; padding-right: 10px; vertical-align: top;">${icon}</td>
      <td style="vertical-align: top;">
        <p style="margin: 0; color: ${COMMON_STYLES.colors.gray}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${label}</p>
        <p style="margin: 4px 0 0 0; color: ${COMMON_STYLES.colors.primaryDark}; font-size: 16px; font-weight: 600;">${value}</p>
      </td>
    </tr>
  </table>
</td>
`;

// ============================================
// TEMPLATE 1: ALERTE CRITIQUE
// ============================================
export const TEMPLATE_ALERTE_CRITIQUE = `
${getEmailHeader('Alerte Critique', '🚨', COMMON_STYLES.colors.danger)}
          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px;">
              <!-- Badge de priorité -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <span style="display: inline-block; background-color: #FEE2E2; color: ${COMMON_STYLES.colors.danger}; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      ⚠️ Action Immédiate Requise
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Titre de l'alerte -->
              <h2 style="margin: 0 0 20px 0; color: ${COMMON_STYLES.colors.danger}; font-size: 22px; font-weight: 600; text-align: center; font-family: ${COMMON_STYLES.fonts.heading};">
                {{titre}}
              </h2>

              <!-- Message -->
              <div style="background-color: #FEF2F2; border-left: 4px solid ${COMMON_STYLES.colors.danger}; padding: 20px; border-radius: 0 6px 6px 0; margin-bottom: 30px;">
                <p style="margin: 0; color: #991B1B; font-size: 15px; line-height: 1.6;">
                  {{message}}
                </p>
              </div>

              <!-- Informations -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  ${getInfoCard('🏢', 'Centre', '{{centre}}')}
                  <td style="width: 20px;"></td>
                  ${getInfoCard('📅', 'Date', '{{date}}')}
                </tr>
              </table>

              <!-- Bouton CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    ${getButton('Voir dans Cockpit →', '{{lien}}', COMMON_STYLES.colors.danger)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
${getEmailFooter()}
`;

// ============================================
// TEMPLATE 2: ALERTE IMPORTANTE
// ============================================
export const TEMPLATE_ALERTE_IMPORTANTE = `
${getEmailHeader('Alerte Importante', '⚠️', COMMON_STYLES.colors.warning)}
          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px;">
              <!-- Badge -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <span style="display: inline-block; background-color: #FEF3C7; color: ${COMMON_STYLES.colors.warning}; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                      Attention Requise
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Titre -->
              <h2 style="margin: 0 0 20px 0; color: #92400E; font-size: 22px; font-weight: 600; text-align: center;">
                {{titre}}
              </h2>

              <!-- Message -->
              <div style="background-color: #FFFBEB; border-left: 4px solid ${COMMON_STYLES.colors.warning}; padding: 20px; border-radius: 0 6px 6px 0; margin-bottom: 30px;">
                <p style="margin: 0; color: #78350F; font-size: 15px; line-height: 1.6;">
                  {{message}}
                </p>
              </div>

              <!-- Détails -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  ${getInfoCard('🏢', 'Centre', '{{centre}}')}
                  <td style="width: 20px;"></td>
                  ${getInfoCard('📅', 'Date', '{{date}}')}
                </tr>
              </table>

              <!-- Actions suggérées -->
              <div style="background-color: #F9FAFB; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                <h4 style="margin: 0 0 12px 0; color: ${COMMON_STYLES.colors.primaryDark}; font-size: 14px; font-weight: 600;">
                  💡 Actions suggérées:
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: ${COMMON_STYLES.colors.gray}; font-size: 14px; line-height: 1.8;">
                  <li>Vérifiez les données concernées dans le tableau de bord</li>
                  <li>Consultez l'historique pour identifier la cause</li>
                  <li>Prenez les mesures correctives nécessaires</li>
                </ul>
              </div>

              <!-- Bouton -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    ${getButton('Consulter dans Cockpit', '{{lien}}', COMMON_STYLES.colors.warning)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
${getEmailFooter()}
`;

// ============================================
// TEMPLATE 3: ALERTE INFO
// ============================================
export const TEMPLATE_ALERTE_INFO = `
${getEmailHeader('Information', 'ℹ️', COMMON_STYLES.colors.info)}
          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: ${COMMON_STYLES.colors.primaryDark}; font-size: 22px; font-weight: 600; text-align: center;">
                {{titre}}
              </h2>

              <div style="background-color: #EFF6FF; border-left: 4px solid ${COMMON_STYLES.colors.info}; padding: 20px; border-radius: 0 6px 6px 0; margin-bottom: 30px;">
                <p style="margin: 0; color: #1E40AF; font-size: 15px; line-height: 1.6;">
                  {{message}}
                </p>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  ${getInfoCard('🏢', 'Centre', '{{centre}}')}
                  <td style="width: 20px;"></td>
                  ${getInfoCard('🕐', 'Date', '{{date}}')}
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    ${getButton('En savoir plus', '{{lien}}', COMMON_STYLES.colors.info)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
${getEmailFooter()}
`;

// ============================================
// TEMPLATE 4: DIGEST HEBDOMADAIRE
// ============================================
export const TEMPLATE_DIGEST_HEBDOMADAIRE = `
${getEmailHeader('Résumé Hebdomadaire', '📊', COMMON_STYLES.colors.primary)}
          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px;">
              <!-- Période -->
              <p style="text-align: center; color: ${COMMON_STYLES.colors.gray}; font-size: 14px; margin: 0 0 30px 0;">
                Semaine du <strong>{{dateDebut}}</strong> au <strong>{{dateFin}}</strong>
              </p>

              <!-- Résumé rapide -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #FEF2F2; border-radius: 8px; text-align: center; width: 33%;">
                    <p style="margin: 0; font-size: 32px; font-weight: 700; color: ${COMMON_STYLES.colors.danger};">{{nbAlertesCritiques}}</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: ${COMMON_STYLES.colors.gray}; text-transform: uppercase;">Critiques</p>
                  </td>
                  <td style="width: 10px;"></td>
                  <td style="padding: 20px; background-color: #FEF3C7; border-radius: 8px; text-align: center; width: 33%;">
                    <p style="margin: 0; font-size: 32px; font-weight: 700; color: ${COMMON_STYLES.colors.warning};">{{nbAlertesImportantes}}</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: ${COMMON_STYLES.colors.gray}; text-transform: uppercase;">Importantes</p>
                  </td>
                  <td style="width: 10px;"></td>
                  <td style="padding: 20px; background-color: #D1FAE5; border-radius: 8px; text-align: center; width: 33%;">
                    <p style="margin: 0; font-size: 32px; font-weight: 700; color: ${COMMON_STYLES.colors.success};">{{nbObjectifsVerts}}</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: ${COMMON_STYLES.colors.gray}; text-transform: uppercase;">Objectifs ✓</p>
                  </td>
                </tr>
              </table>

              <!-- Section Alertes -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; color: ${COMMON_STYLES.colors.primaryDark}; font-size: 16px; font-weight: 600; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">
                  🔔 Alertes de la semaine
                </h3>
                {{alertesHtml}}
              </div>

              <!-- Section Échéances -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; color: ${COMMON_STYLES.colors.primaryDark}; font-size: 16px; font-weight: 600; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">
                  📅 Échéances à venir
                </h3>
                {{echeancesHtml}}
              </div>

              <!-- Section KPIs -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; color: ${COMMON_STYLES.colors.primaryDark}; font-size: 16px; font-weight: 600; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">
                  📈 Performance des KPIs
                </h3>
                {{kpisHtml}}
              </div>

              <!-- Bouton -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    ${getButton('Accéder au tableau de bord', '{{lien}}')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
${getEmailFooter()}
`;

// ============================================
// TEMPLATE 5: RAPPEL EXPIRATION BAIL
// ============================================
export const TEMPLATE_RAPPEL_BAIL = `
${getEmailHeader('Rappel Expiration Bail', '📋', '#7C3AED')}
          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px;">
              <!-- Urgence -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <span style="display: inline-block; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); color: #92400E; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: 700;">
                      ⏰ {{joursRestants}} jours restants
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Message introductif -->
              <p style="text-align: center; color: ${COMMON_STYLES.colors.gray}; font-size: 15px; margin: 0 0 30px 0; line-height: 1.6;">
                Le bail suivant arrive à expiration. Pensez à préparer le renouvellement ou la relocation.
              </p>

              <!-- Détails du bail -->
              <div style="background-color: #F9FAFB; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 30px; font-size: 18px;">👤</td>
                          <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 13px;">Locataire</td>
                          <td style="text-align: right; color: ${COMMON_STYLES.colors.primaryDark}; font-weight: 600; font-size: 15px;">{{locataire}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 30px; font-size: 18px;">🏪</td>
                          <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 13px;">Local</td>
                          <td style="text-align: right; color: ${COMMON_STYLES.colors.primaryDark}; font-weight: 600; font-size: 15px;">{{local}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 30px; font-size: 18px;">🏢</td>
                          <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 13px;">Centre</td>
                          <td style="text-align: right; color: ${COMMON_STYLES.colors.primaryDark}; font-weight: 600; font-size: 15px;">{{centre}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 30px; font-size: 18px;">💰</td>
                          <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 13px;">Loyer mensuel</td>
                          <td style="text-align: right; color: ${COMMON_STYLES.colors.primaryDark}; font-weight: 600; font-size: 15px;">{{loyerMensuel}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 30px; font-size: 18px;">📅</td>
                          <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 13px;">Date d'expiration</td>
                          <td style="text-align: right; color: ${COMMON_STYLES.colors.danger}; font-weight: 700; font-size: 15px;">{{dateExpiration}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Actions suggérées -->
              <div style="background-color: #EFF6FF; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h4 style="margin: 0 0 12px 0; color: #1E40AF; font-size: 14px; font-weight: 600;">
                  📝 Prochaines étapes recommandées:
                </h4>
                <ol style="margin: 0; padding-left: 20px; color: #1E40AF; font-size: 14px; line-height: 2;">
                  <li>Contacter le locataire pour connaître ses intentions</li>
                  <li>Préparer une proposition de renouvellement</li>
                  <li>Mettre à jour le dossier locataire</li>
                </ol>
              </div>

              <!-- Bouton -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    ${getButton('Gérer ce bail', '{{lien}}', '#7C3AED')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
${getEmailFooter()}
`;

// ============================================
// TEMPLATE 6: OBJECTIF ATTEINT
// ============================================
export const TEMPLATE_OBJECTIF_ATTEINT = `
${getEmailHeader('Objectif Atteint !', '🎯', COMMON_STYLES.colors.success)}
          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px;">
              <!-- Célébration -->
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="font-size: 64px;">🎉</span>
                <h2 style="margin: 20px 0 0 0; color: ${COMMON_STYLES.colors.success}; font-size: 28px; font-weight: 700;">
                  Félicitations !
                </h2>
                <p style="margin: 10px 0 0 0; color: ${COMMON_STYLES.colors.gray}; font-size: 16px;">
                  Un objectif vient de passer au vert
                </p>
              </div>

              <!-- Détails de l'objectif -->
              <div style="background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: ${COMMON_STYLES.colors.success}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                  {{axe}}
                </p>
                <h3 style="margin: 0 0 15px 0; color: #065F46; font-size: 22px; font-weight: 700;">
                  {{objectif}}
                </h3>
                <div style="display: inline-block; background-color: #FFFFFF; padding: 15px 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <p style="margin: 0; color: ${COMMON_STYLES.colors.gray}; font-size: 12px;">Valeur atteinte</p>
                  <p style="margin: 5px 0 0 0; color: ${COMMON_STYLES.colors.success}; font-size: 28px; font-weight: 700;">{{valeur}}</p>
                </div>
              </div>

              <!-- Progression -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  ${getInfoCard('🏢', 'Centre', '{{centre}}', '#F0FDF4')}
                  <td style="width: 20px;"></td>
                  ${getInfoCard('📈', 'Progression', '{{progression}}', '#F0FDF4')}
                </tr>
              </table>

              <!-- Message motivant -->
              <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
                <p style="margin: 0; color: ${COMMON_STYLES.colors.gray}; font-size: 14px; font-style: italic;">
                  "{{messageMotivation}}"
                </p>
              </div>

              <!-- Bouton -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    ${getButton('Voir le détail', '{{lien}}', COMMON_STYLES.colors.success)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
${getEmailFooter()}
`;

// ============================================
// TEMPLATE 7: IMPORT TERMINÉ
// ============================================
export const TEMPLATE_IMPORT_TERMINE = `
${getEmailHeader('Import Terminé', '📥', COMMON_STYLES.colors.info)}
          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px;">
              <!-- Statut -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 25px;">
                    <span style="display: inline-block; background-color: {{statutBg}}; color: {{statutColor}}; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: 600;">
                      {{statutIcon}} {{statutTexte}}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Titre -->
              <h2 style="margin: 0 0 25px 0; color: ${COMMON_STYLES.colors.primaryDark}; font-size: 22px; font-weight: 600; text-align: center;">
                Import de données terminé
              </h2>

              <!-- Résumé -->
              <div style="background-color: #F9FAFB; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 14px;">📁 Fichier</td>
                          <td style="text-align: right; color: ${COMMON_STYLES.colors.primaryDark}; font-weight: 600;">{{fichier}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 14px;">📊 Type d'import</td>
                          <td style="text-align: right; color: ${COMMON_STYLES.colors.primaryDark}; font-weight: 600;">{{typeImport}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 14px;">✅ Lignes importées</td>
                          <td style="text-align: right; color: ${COMMON_STYLES.colors.success}; font-weight: 600;">{{lignesImportees}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 14px;">❌ Erreurs</td>
                          <td style="text-align: right; color: {{erreursColor}}; font-weight: 600;">{{lignesErreur}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 14px;">⭐ Score qualité</td>
                          <td style="text-align: right; color: {{scoreColor}}; font-weight: 700; font-size: 18px;">{{scoreQualite}}%</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Barre de progression -->
              <div style="margin-bottom: 30px;">
                <p style="margin: 0 0 8px 0; color: ${COMMON_STYLES.colors.gray}; font-size: 12px;">Qualité de l'import</p>
                <div style="background-color: #E5E7EB; border-radius: 10px; height: 12px; overflow: hidden;">
                  <div style="background: linear-gradient(90deg, {{scoreGradient}}); width: {{scoreQualite}}%; height: 100%; border-radius: 10px;"></div>
                </div>
              </div>

              <!-- Erreurs si présentes -->
              {{erreursHtml}}

              <!-- Bouton -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    ${getButton('Voir le détail de l\'import', '{{lien}}', COMMON_STYLES.colors.info)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
${getEmailFooter()}
`;

// ============================================
// TEMPLATE 8: SAUVEGARDE EFFECTUÉE
// ============================================
export const TEMPLATE_BACKUP_EFFECTUE = `
${getEmailHeader('Sauvegarde Effectuée', '💾', COMMON_STYLES.colors.success)}
          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px;">
              <!-- Confirmation -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: #D1FAE5; border-radius: 50%; padding: 20px;">
                  <span style="font-size: 40px;">✅</span>
                </div>
                <h2 style="margin: 20px 0 0 0; color: ${COMMON_STYLES.colors.success}; font-size: 24px; font-weight: 600;">
                  Sauvegarde réussie
                </h2>
                <p style="margin: 10px 0 0 0; color: ${COMMON_STYLES.colors.gray}; font-size: 15px;">
                  Vos données ont été sauvegardées avec succès
                </p>
              </div>

              <!-- Détails -->
              <div style="background-color: #F0FDF4; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #A7F3D0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: #065F46; font-size: 14px;">📅 Date</td>
                          <td style="text-align: right; color: #065F46; font-weight: 600;">{{date}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #A7F3D0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: #065F46; font-size: 14px;">📊 Tables</td>
                          <td style="text-align: right; color: #065F46; font-weight: 600;">{{nbTables}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #A7F3D0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: #065F46; font-size: 14px;">📝 Enregistrements</td>
                          <td style="text-align: right; color: #065F46; font-weight: 600;">{{nbEnregistrements}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: #065F46; font-size: 14px;">💽 Taille</td>
                          <td style="text-align: right; color: #065F46; font-weight: 600;">{{taille}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Rappel sécurité -->
              <div style="background-color: #FEF3C7; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #92400E; font-size: 13px;">
                  💡 <strong>Conseil:</strong> Conservez régulièrement une copie de vos sauvegardes sur un support externe (cloud, disque dur).
                </p>
              </div>

              <!-- Bouton -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    ${getButton('Gérer mes sauvegardes', '{{lien}}', COMMON_STYLES.colors.success)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
${getEmailFooter()}
`;

// ============================================
// TEMPLATE 9: EMAIL DE TEST / BIENVENUE
// ============================================
export const TEMPLATE_TEST_BIENVENUE = `
${getEmailHeader('Configuration Réussie', '✅', COMMON_STYLES.colors.success)}
          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px;">
              <!-- Message de succès -->
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="font-size: 64px;">🎊</span>
                <h2 style="margin: 20px 0 10px 0; color: ${COMMON_STYLES.colors.success}; font-size: 26px; font-weight: 700;">
                  Félicitations !
                </h2>
                <p style="margin: 0; color: ${COMMON_STYLES.colors.gray}; font-size: 16px;">
                  Votre configuration email fonctionne parfaitement
                </p>
              </div>

              <!-- Récapitulatif des notifications actives -->
              <div style="background-color: #F9FAFB; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <h4 style="margin: 0 0 15px 0; color: ${COMMON_STYLES.colors.primaryDark}; font-size: 15px; font-weight: 600;">
                  🔔 Notifications activées:
                </h4>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  {{notificationsActives}}
                </table>
              </div>

              <!-- Prochaines étapes -->
              <div style="margin-bottom: 30px;">
                <h4 style="margin: 0 0 15px 0; color: ${COMMON_STYLES.colors.primaryDark}; font-size: 15px; font-weight: 600;">
                  🚀 Prochaines étapes:
                </h4>
                <ol style="margin: 0; padding-left: 20px; color: ${COMMON_STYLES.colors.gray}; font-size: 14px; line-height: 2;">
                  <li>Explorez votre tableau de bord Cockpit</li>
                  <li>Importez vos premières données</li>
                  <li>Configurez vos objectifs et KPIs</li>
                  <li>Les alertes vous seront envoyées automatiquement</li>
                </ol>
              </div>

              <!-- Info test -->
              <div style="background-color: #EFF6FF; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
                <p style="margin: 0; color: #1E40AF; font-size: 13px;">
                  📧 Cet email a été envoyé le <strong>{{date}}</strong> à <strong>{{email}}</strong>
                </p>
              </div>

              <!-- Bouton -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    ${getButton('Accéder à Cockpit', '{{lien}}')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
${getEmailFooter(false)}
`;

// ============================================
// TEMPLATE 10: ÉCHÉANCE ACTION
// ============================================
export const TEMPLATE_ECHEANCE_ACTION = `
${getEmailHeader('Rappel Échéance', '⏰', COMMON_STYLES.colors.warning)}
          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px;">
              <!-- Urgence -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 25px;">
                    <span style="display: inline-block; background-color: #FEF3C7; color: #92400E; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: 600;">
                      📅 Échéance dans {{joursRestants}} jour(s)
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Titre action -->
              <h2 style="margin: 0 0 20px 0; color: ${COMMON_STYLES.colors.primaryDark}; font-size: 22px; font-weight: 600; text-align: center;">
                {{titreAction}}
              </h2>

              <!-- Description -->
              <div style="background-color: #FFFBEB; border-left: 4px solid ${COMMON_STYLES.colors.warning}; padding: 20px; border-radius: 0 6px 6px 0; margin-bottom: 30px;">
                <p style="margin: 0; color: #78350F; font-size: 15px; line-height: 1.6;">
                  {{description}}
                </p>
              </div>

              <!-- Détails -->
              <div style="background-color: #F9FAFB; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 14px;">🏢 Centre</td>
                          <td style="text-align: right; color: ${COMMON_STYLES.colors.primaryDark}; font-weight: 600;">{{centre}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 14px;">👤 Responsable</td>
                          <td style="text-align: right; color: ${COMMON_STYLES.colors.primaryDark}; font-weight: 600;">{{responsable}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 14px;">🎯 Priorité</td>
                          <td style="text-align: right;">
                            <span style="background-color: {{prioriteBg}}; color: {{prioriteColor}}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                              {{priorite}}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 14px;">📅 Date échéance</td>
                          <td style="text-align: right; color: ${COMMON_STYLES.colors.danger}; font-weight: 700;">{{dateEcheance}}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Progression -->
              <div style="margin-bottom: 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="color: ${COMMON_STYLES.colors.gray}; font-size: 13px;">Avancement</td>
                    <td style="text-align: right; color: ${COMMON_STYLES.colors.primaryDark}; font-weight: 600;">{{avancement}}%</td>
                  </tr>
                </table>
                <div style="background-color: #E5E7EB; border-radius: 10px; height: 10px; overflow: hidden; margin-top: 8px;">
                  <div style="background-color: ${COMMON_STYLES.colors.info}; width: {{avancement}}%; height: 100%; border-radius: 10px;"></div>
                </div>
              </div>

              <!-- Bouton -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    ${getButton('Voir l\'action', '{{lien}}', COMMON_STYLES.colors.warning)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
${getEmailFooter()}
`;

// ============================================
// EXPORT DE TOUS LES TEMPLATES
// ============================================
export const EMAIL_TEMPLATES = {
  alerte_critique: TEMPLATE_ALERTE_CRITIQUE,
  alerte_importante: TEMPLATE_ALERTE_IMPORTANTE,
  alerte_info: TEMPLATE_ALERTE_INFO,
  digest_hebdomadaire: TEMPLATE_DIGEST_HEBDOMADAIRE,
  rappel_bail: TEMPLATE_RAPPEL_BAIL,
  objectif_atteint: TEMPLATE_OBJECTIF_ATTEINT,
  import_termine: TEMPLATE_IMPORT_TERMINE,
  backup_effectue: TEMPLATE_BACKUP_EFFECTUE,
  test_bienvenue: TEMPLATE_TEST_BIENVENUE,
  echeance_action: TEMPLATE_ECHEANCE_ACTION,
};

/**
 * Type pour les noms de templates
 */
export type EmailTemplateName = keyof typeof EMAIL_TEMPLATES;

/**
 * Remplace les variables dans un template
 */
export function renderTemplate(
  templateName: EmailTemplateName,
  variables: Record<string, string>
): string {
  let html = EMAIL_TEMPLATES[templateName];

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value);
  }

  return html;
}

/**
 * Variables requises pour chaque template
 */
export const TEMPLATE_VARIABLES: Record<EmailTemplateName, string[]> = {
  alerte_critique: ['titre', 'message', 'centre', 'date', 'lien'],
  alerte_importante: ['titre', 'message', 'centre', 'date', 'lien'],
  alerte_info: ['titre', 'message', 'centre', 'date', 'lien'],
  digest_hebdomadaire: ['dateDebut', 'dateFin', 'nbAlertesCritiques', 'nbAlertesImportantes', 'nbObjectifsVerts', 'alertesHtml', 'echeancesHtml', 'kpisHtml', 'lien'],
  rappel_bail: ['locataire', 'local', 'centre', 'loyerMensuel', 'dateExpiration', 'joursRestants', 'lien'],
  objectif_atteint: ['axe', 'objectif', 'valeur', 'centre', 'progression', 'messageMotivation', 'lien'],
  import_termine: ['fichier', 'typeImport', 'lignesImportees', 'lignesErreur', 'scoreQualite', 'statutBg', 'statutColor', 'statutIcon', 'statutTexte', 'erreursColor', 'scoreColor', 'scoreGradient', 'erreursHtml', 'lien'],
  backup_effectue: ['date', 'nbTables', 'nbEnregistrements', 'taille', 'lien'],
  test_bienvenue: ['date', 'email', 'notificationsActives', 'lien'],
  echeance_action: ['titreAction', 'description', 'centre', 'responsable', 'priorite', 'prioriteBg', 'prioriteColor', 'dateEcheance', 'joursRestants', 'avancement', 'lien'],
};
