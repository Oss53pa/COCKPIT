import React, { useState } from 'react';
import {
  Download,
  Info,
  Package,
  Building2,
  Users,
  DollarSign,
  Zap,
  Receipt,
  BarChart3,
  Star,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
  Badge,
} from '../components/ui';
import { useAppStore } from '../store';
import { downloadTemplate, downloadAllTemplates } from '../utils/templateGenerator';
import type { ImportTemplateType } from '../types';
import {
  TEMPLATE_ETAT_LOCATIF,
  TEMPLATE_CA_LOCATAIRES,
  TEMPLATE_FREQUENTATION,
  TEMPLATE_CHARGES,
  TEMPLATE_ENERGIE,
  TEMPLATE_ENCAISSEMENTS,
} from '../types';

// Configuration des templates avec métadonnées UI
const TEMPLATES_CONFIG: {
  type: ImportTemplateType;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  priority: 'essentiel' | 'recommande' | 'optionnel';
}[] = [
  {
    type: 'etat_locatif',
    icon: <Building2 className="w-6 h-6" />,
    color: 'text-primary-600',
    bgColor: 'bg-primary-100',
    priority: 'essentiel',
  },
  {
    type: 'encaissements',
    icon: <DollarSign className="w-6 h-6" />,
    color: 'text-success',
    bgColor: 'bg-success/10',
    priority: 'essentiel',
  },
  {
    type: 'ca_locataires',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    priority: 'recommande',
  },
  {
    type: 'frequentation',
    icon: <Users className="w-6 h-6" />,
    color: 'text-info',
    bgColor: 'bg-info/10',
    priority: 'recommande',
  },
  {
    type: 'charges',
    icon: <Receipt className="w-6 h-6" />,
    color: 'text-danger',
    bgColor: 'bg-danger/10',
    priority: 'essentiel',
  },
  {
    type: 'energie',
    icon: <Zap className="w-6 h-6" />,
    color: 'text-accent-500',
    bgColor: 'bg-accent-100',
    priority: 'optionnel',
  },
];

// Map des templates
const TEMPLATES_MAP: Record<ImportTemplateType, typeof TEMPLATE_ETAT_LOCATIF> = {
  etat_locatif: TEMPLATE_ETAT_LOCATIF,
  ca_locataires: TEMPLATE_CA_LOCATAIRES,
  frequentation: TEMPLATE_FREQUENTATION,
  charges: TEMPLATE_CHARGES,
  energie: TEMPLATE_ENERGIE,
  encaissements: TEMPLATE_ENCAISSEMENTS,
};

export function Templates() {
  const { addToast } = useAppStore();
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Télécharger un template
  const handleDownloadTemplate = (type: ImportTemplateType) => {
    try {
      downloadTemplate(type);
      addToast({
        type: 'success',
        title: 'Template téléchargé',
        message: `Le fichier ${TEMPLATES_MAP[type].nomFichier} a été téléchargé`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erreur de téléchargement',
        message: String(err),
      });
    }
  };

  // Télécharger tous les templates
  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      await downloadAllTemplates();
      addToast({
        type: 'success',
        title: 'Templates téléchargés',
        message: 'Tous les templates ont été téléchargés',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: String(err),
      });
    } finally {
      setIsDownloadingAll(false);
    }
  };

  // Badge de priorité
  const getPriorityBadge = (priority: 'essentiel' | 'recommande' | 'optionnel') => {
    switch (priority) {
      case 'essentiel':
        return <Badge variant="danger" icon={<Star className="w-3 h-3" />}>Essentiel</Badge>;
      case 'recommande':
        return <Badge variant="warning">Recommandé</Badge>;
      case 'optionnel':
        return <Badge variant="secondary">Optionnel</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Templates d'Import</h1>
          <p className="text-primary-500 mt-1">
            Téléchargez les modèles Excel pour importer vos données
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleDownloadAll}
          disabled={isDownloadingAll}
          leftIcon={<Package className="w-4 h-4" />}
        >
          {isDownloadingAll ? 'Téléchargement...' : 'Télécharger tous'}
        </Button>
      </div>

      {/* Information */}
      <Card className="border-info/30 bg-info/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-info mt-0.5" />
            <div>
              <p className="font-medium text-primary-900">Comment utiliser les templates</p>
              <ul className="text-sm text-primary-600 mt-2 space-y-1">
                <li>1. Téléchargez le template correspondant à vos données</li>
                <li>2. Ouvrez le fichier Excel et consultez l'onglet "Instructions"</li>
                <li>3. Remplissez l'onglet "Données" en respectant les formats indiqués</li>
                <li>4. Importez le fichier via le module "Import des données" de votre centre</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des templates - Grille compacte */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES_CONFIG.map((config) => {
          const template = TEMPLATES_MAP[config.type];

          return (
            <Card key={config.type} className="overflow-hidden flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${config.bgColor} flex-shrink-0`}>
                    <span className={config.color}>{config.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{template.nom}</CardTitle>
                      {getPriorityBadge(config.priority)}
                    </div>
                    <CardDescription className="mt-1 text-xs line-clamp-2">{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 mt-auto">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDownloadTemplate(config.type)}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Télécharger
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Notes SYSCOHADA - Compacte */}
      <Card className="border-accent-200 bg-accent-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            <Receipt className="w-5 h-5 text-accent-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-accent-700 mb-1">Conformité SYSCOHADA</h4>
              <p className="text-sm text-primary-600">
                Les templates de charges utilisent les codes du Plan Comptable OHADA (Classes 6 & 7) pour la conformité UEMOA/CEMAC.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
