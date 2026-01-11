import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  Trash2,
  Filter,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Select,
} from '../components/ui';
import { useAlertesStore, useCentresStore } from '../store';
import type { Alerte, AlertePriorite } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Alertes() {
  const { alertes, loadAlertes, marquerCommeLue, marquerCommeTraitee, supprimerAlerte, supprimerAlertesTraitees } = useAlertesStore();
  const { centres } = useCentresStore();

  const [filterPriorite, setFilterPriorite] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');

  useEffect(() => {
    loadAlertes();
  }, []);

  const filteredAlertes = alertes.filter((alerte) => {
    if (filterPriorite !== 'all' && alerte.priorite !== filterPriorite) return false;
    if (filterStatut === 'non_lues' && alerte.lue) return false;
    if (filterStatut === 'non_traitees' && alerte.traitee) return false;
    if (filterStatut === 'traitees' && !alerte.traitee) return false;
    return true;
  });

  const alertesNonLues = alertes.filter((a) => !a.lue).length;
  const alertesNonTraitees = alertes.filter((a) => !a.traitee).length;

  const getPrioriteIcon = (priorite: AlertePriorite) => {
    switch (priorite) {
      case 'critique':
        return <AlertCircle className="w-5 h-5 text-error" />;
      case 'haute':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'normale':
        return <Info className="w-5 h-5 text-info" />;
      default:
        return <Bell className="w-5 h-5 text-primary-400" />;
    }
  };

  const getPrioriteVariant = (priorite: AlertePriorite) => {
    switch (priorite) {
      case 'critique':
        return 'error';
      case 'haute':
        return 'warning';
      case 'normale':
        return 'info';
      default:
        return 'default';
    }
  };

  const getCentreName = (centreId?: string) => {
    if (!centreId) return 'Global';
    const centre = centres.find((c) => c.id === centreId);
    return centre?.code || 'Inconnu';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Alertes</h1>
          <p className="text-primary-500 mt-1">
            {alertesNonLues} non lue(s) · {alertesNonTraitees} à traiter
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={supprimerAlertesTraitees}
            disabled={!alertes.some((a) => a.traitee)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer traitées
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-4">
        <Select
          options={[
            { value: 'all', label: 'Toutes les priorités' },
            { value: 'critique', label: 'Critique' },
            { value: 'haute', label: 'Haute' },
            { value: 'normale', label: 'Normale' },
            { value: 'info', label: 'Info' },
          ]}
          value={filterPriorite}
          onChange={(e) => setFilterPriorite(e.target.value)}
          className="w-48"
        />
        <Select
          options={[
            { value: 'all', label: 'Tous les statuts' },
            { value: 'non_lues', label: 'Non lues' },
            { value: 'non_traitees', label: 'Non traitées' },
            { value: 'traitees', label: 'Traitées' },
          ]}
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Liste des alertes */}
      {filteredAlertes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary-900 mb-2">
              Aucune alerte
            </h3>
            <p className="text-primary-500">
              {filterStatut !== 'all' || filterPriorite !== 'all'
                ? 'Aucune alerte ne correspond aux filtres sélectionnés'
                : 'Toutes les alertes ont été traitées'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAlertes.map((alerte) => (
            <Card
              key={alerte.id}
              className={`transition-all ${
                !alerte.lue ? 'border-l-4 border-l-info bg-info/5' : ''
              } ${alerte.traitee ? 'opacity-60' : ''}`}
            >
              <CardContent className="flex items-start gap-4 py-4">
                {/* Icône */}
                <div className="mt-1">{getPrioriteIcon(alerte.priorite)}</div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium ${!alerte.lue ? 'text-primary-900' : 'text-primary-700'}`}>
                      {alerte.titre}
                    </h3>
                    <Badge variant={getPrioriteVariant(alerte.priorite) as any}>
                      {alerte.priorite}
                    </Badge>
                    {alerte.centreId && (
                      <Badge>{getCentreName(alerte.centreId)}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-primary-500">{alerte.message}</p>
                  <p className="text-xs text-primary-400 mt-2">
                    {format(new Date(alerte.dateCreation), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    {alerte.dateTraitement && (
                      <span className="ml-2">
                        · Traitée le {format(new Date(alerte.dateTraitement), 'dd/MM/yyyy')}
                      </span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!alerte.lue && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => marquerCommeLue(alerte.id)}
                      title="Marquer comme lue"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  {!alerte.traitee && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => marquerCommeTraitee(alerte.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Traiter
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => supprimerAlerte(alerte.id)}
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4 text-error" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
