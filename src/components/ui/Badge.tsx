import React from 'react';
import type { StatutKPI, StatutAction, PrioriteAction } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-primary-100 text-primary-700',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    info: 'bg-info/10 text-info',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Badge pour les statuts KPI
export function StatutKPIBadge({ statut }: { statut: StatutKPI }) {
  const config = {
    vert: { label: 'Atteint', variant: 'success' as const },
    orange: { label: 'Attention', variant: 'warning' as const },
    rouge: { label: 'Critique', variant: 'error' as const },
  };

  const { label, variant } = config[statut];
  return <Badge variant={variant}>{label}</Badge>;
}

// Badge pour les statuts d'action
export function StatutActionBadge({ statut }: { statut: StatutAction }) {
  const config: Record<StatutAction, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
    a_faire: { label: 'À faire', variant: 'default' },
    en_cours: { label: 'En cours', variant: 'info' },
    en_attente: { label: 'En attente', variant: 'warning' },
    termine: { label: 'Terminé', variant: 'success' },
    annule: { label: 'Annulé', variant: 'error' },
  };

  const { label, variant } = config[statut];
  return <Badge variant={variant}>{label}</Badge>;
}

// Badge pour les priorités
export function PrioriteBadge({ priorite }: { priorite: PrioriteAction }) {
  const config: Record<PrioriteAction, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
    critique: { label: 'Critique', variant: 'error' },
    haute: { label: 'Haute', variant: 'warning' },
    moyenne: { label: 'Moyenne', variant: 'info' },
    basse: { label: 'Basse', variant: 'default' },
  };

  const { label, variant } = config[priorite];
  return <Badge variant={variant}>{label}</Badge>;
}
