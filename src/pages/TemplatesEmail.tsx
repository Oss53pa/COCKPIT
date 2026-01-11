import React, { useState } from 'react';
import {
  Mail,
  Eye,
  Send,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  Target,
  Download,
  HardDrive,
  Clock,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
  Badge,
  Modal,
} from '../components/ui';
import { useAppStore } from '../store';
import { useNotificationStore } from '../store/notificationStore';
import {
  EMAIL_TEMPLATES,
  renderTemplate,
  TEMPLATE_VARIABLES,
  type EmailTemplateName,
} from '../templates';

// Configuration des templates pour l'affichage
const TEMPLATES_CONFIG: {
  id: EmailTemplateName;
  nom: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  exampleData: Record<string, string>;
}[] = [
  {
    id: 'alerte_critique',
    nom: 'Alerte Critique',
    description: 'Alertes urgentes nécessitant une action immédiate',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-danger',
    bgColor: 'bg-danger/10',
    exampleData: {
      titre: 'Taux d\'occupation critique',
      message: 'Le taux d\'occupation du centre est passé sous le seuil critique de 70%. Une action immédiate est requise pour identifier les causes et mettre en place des mesures correctives.',
      centre: 'Centre Commercial Plateau',
      date: '11 janvier 2026 à 14:30',
      lien: '#',
      unsubscribe_link: '#',
    },
  },
  {
    id: 'alerte_importante',
    nom: 'Alerte Importante',
    description: 'Alertes importantes avec actions suggérées',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    exampleData: {
      titre: 'Retard de paiement détecté',
      message: 'Le locataire FASHION STORE a un retard de paiement de 15 jours sur son loyer de janvier. Pensez à effectuer une relance.',
      centre: 'Centre Commercial Cocody',
      date: '11 janvier 2026 à 09:00',
      lien: '#',
      unsubscribe_link: '#',
    },
  },
  {
    id: 'alerte_info',
    nom: 'Notification Info',
    description: 'Notifications informatives générales',
    icon: <Info className="w-5 h-5" />,
    color: 'text-info',
    bgColor: 'bg-info/10',
    exampleData: {
      titre: 'Nouvelle mise à jour disponible',
      message: 'Une nouvelle version de Cockpit est disponible avec de nouvelles fonctionnalités. Consultez les notes de version pour plus de détails.',
      centre: 'Global',
      date: '11 janvier 2026 à 08:00',
      lien: '#',
      unsubscribe_link: '#',
    },
  },
  {
    id: 'digest_hebdomadaire',
    nom: 'Digest Hebdomadaire',
    description: 'Résumé complet de la semaine',
    icon: <Calendar className="w-5 h-5" />,
    color: 'text-primary-600',
    bgColor: 'bg-primary-100',
    exampleData: {
      dateDebut: '06 janvier 2026',
      dateFin: '12 janvier 2026',
      nbAlertesCritiques: '2',
      nbAlertesImportantes: '5',
      nbObjectifsVerts: '8',
      alertesHtml: `
        <div style="padding: 10px; margin: 5px 0; background: #FEF2F2; border-radius: 4px;">
          🚨 Taux d'occupation critique - Centre Plateau
        </div>
        <div style="padding: 10px; margin: 5px 0; background: #FFFBEB; border-radius: 4px;">
          ⚠️ Retard paiement FASHION STORE
        </div>
      `,
      echeancesHtml: `
        <div style="padding: 10px; margin: 5px 0; background: #F3F4F6; border-radius: 4px;">
          📅 Renouvellement bail ORANGE CI - <strong>15/01/2026</strong>
        </div>
        <div style="padding: 10px; margin: 5px 0; background: #F3F4F6; border-radius: 4px;">
          📅 Audit sécurité annuel - <strong>20/01/2026</strong>
        </div>
      `,
      kpisHtml: `
        <div style="display: inline-block; padding: 10px; margin: 5px; background: #D1FAE5; border-radius: 4px; min-width: 120px;">
          <div style="font-size: 12px; color: #6B7280;">Taux occupation</div>
          <div style="font-size: 18px; font-weight: bold; color: #065F46;">92%</div>
        </div>
        <div style="display: inline-block; padding: 10px; margin: 5px; background: #FEF3C7; border-radius: 4px; min-width: 120px;">
          <div style="font-size: 12px; color: #6B7280;">Recouvrement</div>
          <div style="font-size: 18px; font-weight: bold; color: #92400E;">78%</div>
        </div>
      `,
      lien: '#',
      unsubscribe_link: '#',
    },
  },
  {
    id: 'rappel_bail',
    nom: 'Rappel Expiration Bail',
    description: 'Rappel avant expiration d\'un bail',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    exampleData: {
      locataire: 'ORANGE CI',
      local: 'Boutique A-15 (150 m²)',
      centre: 'Centre Commercial Plateau',
      loyerMensuel: '2 500 000 XOF',
      dateExpiration: '31 mars 2026',
      joursRestants: '79',
      lien: '#',
      unsubscribe_link: '#',
    },
  },
  {
    id: 'objectif_atteint',
    nom: 'Objectif Atteint',
    description: 'Notification de succès avec célébration',
    icon: <Target className="w-5 h-5" />,
    color: 'text-success',
    bgColor: 'bg-success/10',
    exampleData: {
      axe: 'Performance Commerciale',
      objectif: 'Taux d\'occupation > 90%',
      valeur: '92.5%',
      centre: 'Centre Commercial Cocody',
      progression: '+2.5% vs mois dernier',
      messageMotivation: 'Excellente performance, votre équipe fait un travail remarquable !',
      lien: '#',
      unsubscribe_link: '#',
    },
  },
  {
    id: 'import_termine',
    nom: 'Import Terminé',
    description: 'Résultat d\'import de données',
    icon: <Download className="w-5 h-5" />,
    color: 'text-info',
    bgColor: 'bg-info/10',
    exampleData: {
      fichier: 'etat_locatif_janvier_2026.xlsx',
      typeImport: 'État Locatif',
      lignesImportees: '45',
      lignesErreur: '2',
      scoreQualite: '95',
      statutBg: '#D1FAE5',
      statutColor: '#065F46',
      statutIcon: '✅',
      statutTexte: 'Import réussi',
      erreursColor: '#DC2626',
      scoreColor: '#059669',
      scoreGradient: '#059669, #10B981',
      erreursHtml: `
        <div style="background-color: #FEF2F2; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #991B1B; font-size: 14px;">
            ⚠️ 2 ligne(s) n'ont pas pu être importées. Consultez le détail pour corriger les erreurs.
          </p>
        </div>
      `,
      lien: '#',
      unsubscribe_link: '#',
    },
  },
  {
    id: 'backup_effectue',
    nom: 'Sauvegarde Effectuée',
    description: 'Confirmation de sauvegarde réussie',
    icon: <HardDrive className="w-5 h-5" />,
    color: 'text-success',
    bgColor: 'bg-success/10',
    exampleData: {
      date: '11 janvier 2026 à 03:00',
      nbTables: '24',
      nbEnregistrements: '15 847',
      taille: '4.2 Mo',
      lien: '#',
      unsubscribe_link: '#',
    },
  },
  {
    id: 'test_bienvenue',
    nom: 'Test / Bienvenue',
    description: 'Email de test de configuration',
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'text-success',
    bgColor: 'bg-success/10',
    exampleData: {
      date: '11 janvier 2026 à 10:30',
      email: 'directeur@centre-commercial.ci',
      notificationsActives: `
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
          <span style="color: #059669; font-size: 16px; margin-right: 10px;">✅</span>
          <span style="color: #065F46; font-size: 14px;">🚨 Alertes critiques</span>
        </td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
          <span style="color: #059669; font-size: 16px; margin-right: 10px;">✅</span>
          <span style="color: #065F46; font-size: 14px;">⚠️ Alertes importantes</span>
        </td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
          <span style="color: #059669; font-size: 16px; margin-right: 10px;">✅</span>
          <span style="color: #065F46; font-size: 14px;">📊 Digest hebdomadaire</span>
        </td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
          <span style="color: #DC2626; font-size: 16px; margin-right: 10px;">❌</span>
          <span style="color: #6B7280; font-size: 14px;">📰 Digest quotidien</span>
        </td></tr>
      `,
      lien: '#',
    },
  },
  {
    id: 'echeance_action',
    nom: 'Échéance Action',
    description: 'Rappel d\'échéance d\'action',
    icon: <Clock className="w-5 h-5" />,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    exampleData: {
      titreAction: 'Renégociation bail FASHION STORE',
      description: 'Préparer et soumettre la proposition de renouvellement de bail avec les nouvelles conditions tarifaires.',
      centre: 'Centre Commercial Plateau',
      responsable: 'Jean Kouassi',
      priorite: 'Haute',
      prioriteBg: '#FEF3C7',
      prioriteColor: '#92400E',
      dateEcheance: '20 janvier 2026',
      joursRestants: '9',
      avancement: '65',
      lien: '#',
      unsubscribe_link: '#',
    },
  },
];

export function TemplatesEmail() {
  const { addToast } = useAppStore();
  const { config, isConfigured } = useNotificationStore();

  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateName | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<EmailTemplateName | null>(null);

  // Obtenir le HTML du template prévisualisé
  const getPreviewHtml = (templateId: EmailTemplateName) => {
    const templateConfig = TEMPLATES_CONFIG.find(t => t.id === templateId);
    if (!templateConfig) return '';
    return renderTemplate(templateId, templateConfig.exampleData);
  };

  // Copier le HTML dans le presse-papier
  const copyHtml = (templateId: EmailTemplateName) => {
    const html = getPreviewHtml(templateId);
    navigator.clipboard.writeText(html);
    addToast({
      type: 'success',
      title: 'HTML copié',
      message: 'Le code HTML a été copié dans le presse-papier',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-900">Templates Email</h1>
        <p className="text-primary-500 mt-1">
          Prévisualisez les modèles d'emails envoyés par Cockpit
        </p>
      </div>

      {/* Statut configuration */}
      {!isConfigured && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium text-primary-900">Configuration requise</p>
                <p className="text-sm text-primary-500">
                  Configurez EmailJS dans la page <a href="/notifications" className="text-info hover:underline">Notifications</a> pour envoyer des emails.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des templates */}
      <div className="grid grid-cols-2 gap-4">
        {TEMPLATES_CONFIG.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${template.bgColor}`}>
                    <span className={template.color}>{template.icon}</span>
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.nom}</CardTitle>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Aperçu miniature */}
              <div
                className="border border-primary-200 rounded-lg overflow-hidden mb-3 cursor-pointer hover:border-primary-400 transition-colors"
                onClick={() => setPreviewTemplate(template.id)}
                style={{ height: '120px' }}
              >
                <div
                  className="transform scale-[0.15] origin-top-left"
                  style={{ width: '666%', height: '666%' }}
                >
                  <iframe
                    srcDoc={getPreviewHtml(template.id)}
                    title={template.nom}
                    className="w-full h-full border-0 pointer-events-none"
                    sandbox=""
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                  className="text-xs text-primary-500 hover:text-primary-700 flex items-center gap-1"
                >
                  {expandedTemplate === template.id ? (
                    <>Variables <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Variables <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyHtml(template.id)}
                    leftIcon={<Copy className="w-3 h-3" />}
                  >
                    Copier
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPreviewTemplate(template.id)}
                    leftIcon={<Eye className="w-3 h-3" />}
                  >
                    Aperçu
                  </Button>
                </div>
              </div>

              {/* Variables du template */}
              {expandedTemplate === template.id && (
                <div className="mt-3 pt-3 border-t border-primary-100">
                  <p className="text-xs text-primary-500 mb-2">Variables requises:</p>
                  <div className="flex flex-wrap gap-1">
                    {TEMPLATE_VARIABLES[template.id].map((variable) => (
                      <code
                        key={variable}
                        className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded"
                      >
                        {`{{${variable}}}`}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de prévisualisation */}
      <Modal
        isOpen={previewTemplate !== null}
        onClose={() => setPreviewTemplate(null)}
        title={`Aperçu: ${TEMPLATES_CONFIG.find(t => t.id === previewTemplate)?.nom || ''}`}
        size="xl"
      >
        {previewTemplate && (
          <div className="space-y-4">
            {/* Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-primary-100">
              <div className="flex items-center gap-2">
                <Badge variant="info">Prévisualisation</Badge>
                <span className="text-sm text-primary-500">
                  Exemple avec données fictives
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyHtml(previewTemplate)}
                  leftIcon={<Copy className="w-4 h-4" />}
                >
                  Copier HTML
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const html = getPreviewHtml(previewTemplate);
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                      newWindow.document.write(html);
                      newWindow.document.close();
                    }
                  }}
                  leftIcon={<ExternalLink className="w-4 h-4" />}
                >
                  Ouvrir
                </Button>
              </div>
            </div>

            {/* Preview iframe */}
            <div className="border border-primary-200 rounded-lg overflow-hidden bg-white">
              <iframe
                srcDoc={getPreviewHtml(previewTemplate)}
                title="Email Preview"
                className="w-full border-0"
                style={{ height: '600px' }}
                sandbox=""
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
