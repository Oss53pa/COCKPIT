import React, { useState } from 'react';
import {
  Mail,
  Bell,
  BellOff,
  Settings,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  History,
  BarChart3,
  Clock,
  Key,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Trash2,
  Calendar,
  FileText,
  Shield,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
  Input,
  Select,
  Badge,
  Modal,
} from '../components/ui';
import { useNotificationStore } from '../store/notificationStore';
import { useAppStore } from '../store';

export function Notifications() {
  const {
    config,
    isConfigured,
    isSending,
    lastTestResult,
    history,
    updateConfig,
    setEmailJSConfig,
    updateOptions,
    enableNotifications,
    sendTestEmail,
    clearHistory,
    getStats,
  } = useNotificationStore();

  const { addToast } = useAppStore();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // État local pour le formulaire
  const [formData, setFormData] = useState({
    serviceId: config.emailjs?.serviceId || '',
    templateId: config.emailjs?.templateId || '',
    publicKey: config.emailjs?.publicKey || '',
    destinataireEmail: config.destinataireEmail || '',
    destinataireNom: config.destinataireNom || '',
  });

  const stats = getStats();

  // Sauvegarder la configuration
  const handleSaveConfig = () => {
    if (!formData.serviceId || !formData.templateId || !formData.publicKey) {
      addToast({
        type: 'error',
        title: 'Configuration incomplète',
        message: 'Veuillez remplir tous les champs EmailJS',
      });
      return;
    }

    if (!formData.destinataireEmail) {
      addToast({
        type: 'error',
        title: 'Email manquant',
        message: 'Veuillez saisir votre adresse email',
      });
      return;
    }

    // Sauvegarder la config EmailJS
    setEmailJSConfig({
      serviceId: formData.serviceId,
      templateId: formData.templateId,
      templateIdAlerte: formData.templateId, // Utilise le même template
      publicKey: formData.publicKey,
    });

    // Sauvegarder le destinataire
    updateConfig({
      destinataireEmail: formData.destinataireEmail,
      destinataireNom: formData.destinataireNom,
      configuredAt: new Date().toISOString(),
    });

    addToast({
      type: 'success',
      title: 'Configuration sauvegardée',
      message: 'Vous pouvez maintenant envoyer un email de test',
    });
  };

  // Envoyer un email de test
  const handleTestEmail = async () => {
    if (!formData.destinataireEmail) {
      addToast({
        type: 'error',
        title: 'Email manquant',
        message: 'Veuillez d\'abord configurer votre adresse email',
      });
      return;
    }

    // S'assurer que la config est sauvegardée
    handleSaveConfig();

    const success = await sendTestEmail();

    if (success) {
      addToast({
        type: 'success',
        title: 'Email envoyé !',
        message: 'Vérifiez votre boîte de réception',
      });
    } else {
      addToast({
        type: 'error',
        title: 'Échec de l\'envoi',
        message: lastTestResult?.message || 'Vérifiez votre configuration',
      });
    }
  };

  // Formater la date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Notifications Email</h1>
          <p className="text-primary-500 mt-1">
            Configurez l'envoi d'alertes et notifications par email
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowHistory(true)}
            leftIcon={<History className="w-4 h-4" />}
          >
            Historique
          </Button>
          <Button
            variant={config.enabled ? 'danger' : 'primary'}
            onClick={() => enableNotifications(!config.enabled)}
            leftIcon={config.enabled ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          >
            {config.enabled ? 'Désactiver' : 'Activer'}
          </Button>
        </div>
      </div>

      {/* Statut actuel */}
      <Card className={config.enabled && isConfigured ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${config.enabled && isConfigured ? 'bg-success/10' : 'bg-warning/10'}`}>
              {config.enabled && isConfigured ? (
                <CheckCircle2 className="w-8 h-8 text-success" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-warning" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-primary-900">
                {config.enabled && isConfigured
                  ? 'Notifications email activées'
                  : config.enabled
                  ? 'Configuration requise'
                  : 'Notifications désactivées'}
              </p>
              <p className="text-sm text-primary-500">
                {config.enabled && isConfigured
                  ? `Les alertes seront envoyées à ${config.destinataireEmail}`
                  : config.enabled
                  ? 'Configurez EmailJS pour recevoir les notifications'
                  : 'Activez les notifications pour recevoir des alertes par email'}
              </p>
            </div>
            {stats.dernierEnvoi && (
              <div className="text-right">
                <p className="text-xs text-primary-500">Dernier envoi</p>
                <p className="text-sm font-medium text-primary-700">
                  {formatDate(stats.dernierEnvoi)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration EmailJS */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Configuration EmailJS
              </CardTitle>
              <CardDescription>
                Service gratuit pour envoyer des emails depuis le navigateur
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSetupGuide(true)}
              leftIcon={<Info className="w-4 h-4" />}
            >
              Guide de configuration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Lien vers EmailJS */}
            <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-info mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-primary-700">
                    Créez un compte gratuit sur EmailJS pour obtenir vos identifiants.
                    200 emails/mois gratuits.
                  </p>
                  <a
                    href="https://www.emailjs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-info hover:underline mt-2"
                  >
                    Ouvrir EmailJS <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Service ID"
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                placeholder="service_xxxxxxx"
                leftIcon={<Settings className="w-4 h-4" />}
              />
              <Input
                label="Template ID"
                value={formData.templateId}
                onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                placeholder="template_xxxxxxx"
                leftIcon={<FileText className="w-4 h-4" />}
              />
            </div>

            <div className="relative">
              <Input
                label="Clé publique (Public Key)"
                type={showPassword ? 'text' : 'password'}
                value={formData.publicKey}
                onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
                placeholder="xxxxxxxxxxxxxxx"
                leftIcon={<Key className="w-4 h-4" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-primary-400 hover:text-primary-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="border-t border-primary-100 pt-4">
              <h4 className="text-sm font-medium text-primary-900 mb-3">Destinataire</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Votre adresse email"
                  type="email"
                  value={formData.destinataireEmail}
                  onChange={(e) => setFormData({ ...formData, destinataireEmail: e.target.value })}
                  placeholder="votre@email.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                <Input
                  label="Votre nom (optionnel)"
                  value={formData.destinataireNom}
                  onChange={(e) => setFormData({ ...formData, destinataireNom: e.target.value })}
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                {lastTestResult && (
                  <Badge variant={lastTestResult.success ? 'success' : 'danger'}>
                    {lastTestResult.success ? 'Test réussi' : 'Test échoué'}
                  </Badge>
                )}
                {lastTestResult && !lastTestResult.success && (
                  <span className="text-xs text-danger">{lastTestResult.message}</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleSaveConfig}
                  leftIcon={<Shield className="w-4 h-4" />}
                >
                  Sauvegarder
                </Button>
                <Button
                  variant="primary"
                  onClick={handleTestEmail}
                  disabled={isSending || !formData.destinataireEmail}
                  leftIcon={isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                >
                  {isSending ? 'Envoi...' : 'Envoyer un test'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options de notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Types de Notifications
          </CardTitle>
          <CardDescription>
            Choisissez les notifications que vous souhaitez recevoir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Alertes */}
            <div>
              <h4 className="text-sm font-medium text-primary-700 mb-3">Alertes</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🚨</span>
                    <div>
                      <p className="font-medium text-primary-900">Alertes critiques</p>
                      <p className="text-xs text-primary-500">KPIs en rouge, retards importants</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.options.alertesCritiques}
                    onChange={(e) => updateOptions({ alertesCritiques: e.target.checked })}
                    className="w-5 h-5 rounded border-primary-300 text-primary-900 focus:ring-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-medium text-primary-900">Alertes importantes</p>
                      <p className="text-xs text-primary-500">KPIs en orange, échéances proches</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.options.alertesImportantes}
                    onChange={(e) => updateOptions({ alertesImportantes: e.target.checked })}
                    className="w-5 h-5 rounded border-primary-300 text-primary-900 focus:ring-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">ℹ️</span>
                    <div>
                      <p className="font-medium text-primary-900">Notifications informatives</p>
                      <p className="text-xs text-primary-500">Rappels, mises à jour générales</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.options.alertesInfo}
                    onChange={(e) => updateOptions({ alertesInfo: e.target.checked })}
                    className="w-5 h-5 rounded border-primary-300 text-primary-900 focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>

            {/* Rappels */}
            <div className="border-t border-primary-100 pt-4">
              <h4 className="text-sm font-medium text-primary-700 mb-3">Rappels automatiques</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📋</span>
                    <div>
                      <p className="font-medium text-primary-900">Expiration de baux</p>
                      <p className="text-xs text-primary-500">Rappel {config.options.rappelBailJours} jours avant expiration</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.options.baillExpiration}
                    onChange={(e) => updateOptions({ baillExpiration: e.target.checked })}
                    className="w-5 h-5 rounded border-primary-300 text-primary-900 focus:ring-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📅</span>
                    <div>
                      <p className="font-medium text-primary-900">Échéances d'actions</p>
                      <p className="text-xs text-primary-500">Rappel {config.options.rappelEcheanceJours} jours avant l'échéance</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.options.nouvelleEcheance}
                    onChange={(e) => updateOptions({ nouvelleEcheance: e.target.checked })}
                    className="w-5 h-5 rounded border-primary-300 text-primary-900 focus:ring-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎯</span>
                    <div>
                      <p className="font-medium text-primary-900">Objectifs atteints</p>
                      <p className="text-xs text-primary-500">Notification quand un objectif passe au vert</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.options.objectifAtteint}
                    onChange={(e) => updateOptions({ objectifAtteint: e.target.checked })}
                    className="w-5 h-5 rounded border-primary-300 text-primary-900 focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>

            {/* Digest */}
            <div className="border-t border-primary-100 pt-4">
              <h4 className="text-sm font-medium text-primary-700 mb-3">Résumés périodiques</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <div>
                      <p className="font-medium text-primary-900">Digest hebdomadaire</p>
                      <p className="text-xs text-primary-500">Résumé envoyé le lundi à {config.options.heureDigest}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.options.digestHebdomadaire}
                    onChange={(e) => updateOptions({ digestHebdomadaire: e.target.checked })}
                    className="w-5 h-5 rounded border-primary-300 text-primary-900 focus:ring-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📰</span>
                    <div>
                      <p className="font-medium text-primary-900">Digest quotidien</p>
                      <p className="text-xs text-primary-500">Résumé envoyé chaque jour à {config.options.heureDigest}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.options.digestQuotidien}
                    onChange={(e) => updateOptions({ digestQuotidien: e.target.checked })}
                    className="w-5 h-5 rounded border-primary-300 text-primary-900 focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-success">{stats.totalEnvoyes}</p>
            <p className="text-sm text-primary-500">Envoyés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-danger">{stats.totalEchecs}</p>
            <p className="text-sm text-primary-500">Échecs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-warning">{stats.parType.alertes}</p>
            <p className="text-sm text-primary-500">Alertes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-info">{stats.parType.rappels}</p>
            <p className="text-sm text-primary-500">Rappels</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal Historique */}
      <Modal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title="Historique des notifications"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-primary-500">
              {history.length} notification{history.length > 1 ? 's' : ''} dans l'historique
            </p>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearHistory();
                  addToast({ type: 'success', title: 'Historique effacé' });
                }}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Effacer
              </Button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-primary-500">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune notification envoyée</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-primary-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {entry.statut === 'envoye' ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-danger" />
                    )}
                    <div>
                      <p className="font-medium text-primary-900">{entry.sujet}</p>
                      <p className="text-xs text-primary-500">
                        {entry.destinataire} - {formatDate(entry.envoyeAt)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      entry.type === 'alerte' ? 'warning' :
                      entry.type === 'rappel' ? 'info' :
                      'secondary'
                    }
                  >
                    {entry.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Guide de configuration */}
      <Modal
        isOpen={showSetupGuide}
        onClose={() => setShowSetupGuide(false)}
        title="Guide de configuration EmailJS"
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-4 bg-info/10 rounded-lg">
            <p className="text-sm text-primary-700">
              EmailJS permet d'envoyer des emails directement depuis votre navigateur,
              sans avoir besoin d'un serveur backend. Suivez ces étapes pour configurer le service.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-900 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-primary-900">Créer un compte EmailJS</h4>
                <p className="text-sm text-primary-500 mt-1">
                  Rendez-vous sur <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="text-info hover:underline">emailjs.com</a> et créez un compte gratuit.
                  Vous aurez droit à 200 emails/mois.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-900 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-primary-900">Créer un service email</h4>
                <p className="text-sm text-primary-500 mt-1">
                  Dans le dashboard EmailJS, allez dans "Email Services" et ajoutez un service.
                  Choisissez Gmail, Outlook ou tout autre fournisseur compatible.
                  Notez le <strong>Service ID</strong> (ex: service_xxxxxx).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-900 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-primary-900">Créer un template</h4>
                <p className="text-sm text-primary-500 mt-1">
                  Allez dans "Email Templates" et créez un nouveau template.
                  Utilisez ces variables dans votre template:
                </p>
                <div className="mt-2 p-3 bg-primary-50 rounded font-mono text-xs">
                  {"{{to_email}}"} - Email destinataire<br />
                  {"{{to_name}}"} - Nom destinataire<br />
                  {"{{subject}}"} - Sujet de l'email<br />
                  {"{{message_html}}"} - Contenu HTML
                </div>
                <p className="text-sm text-primary-500 mt-2">
                  Notez le <strong>Template ID</strong> (ex: template_xxxxxx).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-900 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-medium text-primary-900">Récupérer la clé publique</h4>
                <p className="text-sm text-primary-500 mt-1">
                  Allez dans "Account" puis "General" pour trouver votre <strong>Public Key</strong>.
                  Cette clé permet à Cockpit d'utiliser votre compte EmailJS.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-success text-white rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-primary-900">Configuration terminée !</h4>
                <p className="text-sm text-primary-500 mt-1">
                  Entrez vos identifiants dans le formulaire ci-dessus et envoyez un email de test
                  pour vérifier que tout fonctionne.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={() => setShowSetupGuide(false)}>
              J'ai compris
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
