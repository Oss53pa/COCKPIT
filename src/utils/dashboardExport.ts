/**
 * Dashboard Export - Export PDF amélioré avec capture de graphiques
 */

import jsPDF from 'jspdf';
import type { CentreCommercial, Mesure, PlanAction } from '../types';

// Colors
const COLORS = {
  primary: [23, 23, 23] as [number, number, number],
  secondary: [115, 115, 115] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  error: [239, 68, 68] as [number, number, number],
  border: [229, 229, 229] as [number, number, number],
  background: [250, 250, 250] as [number, number, number],
};

interface DashboardExportData {
  centres: CentreCommercial[];
  mesures: Mesure[];
  actions: PlanAction[];
  dateExport: Date;
}

interface CentrePerformance {
  centre: CentreCommercial;
  performance: number;
  mesuresVertes: number;
  mesuresOranges: number;
  mesuresRouges: number;
  totalMesures: number;
}

/**
 * Calcule les performances pour chaque centre
 */
function calculerPerformances(data: DashboardExportData): CentrePerformance[] {
  return data.centres.map((centre) => {
    const centreMesures = data.mesures.filter((m) => m.centreId === centre.id);
    const mesuresVertes = centreMesures.filter((m) => m.statut === 'vert').length;
    const mesuresOranges = centreMesures.filter((m) => m.statut === 'orange').length;
    const mesuresRouges = centreMesures.filter((m) => m.statut === 'rouge').length;
    const performance =
      centreMesures.length > 0
        ? Math.round((mesuresVertes / centreMesures.length) * 100)
        : 0;

    return {
      centre,
      performance,
      mesuresVertes,
      mesuresOranges,
      mesuresRouges,
      totalMesures: centreMesures.length,
    };
  });
}

/**
 * Génère un résumé exécutif
 */
function genererResumeExecutif(performances: CentrePerformance[]): string[] {
  const resume: string[] = [];

  // Performance globale
  const performanceMoyenne =
    performances.length > 0
      ? Math.round(
          performances.reduce((sum, p) => sum + p.performance, 0) / performances.length
        )
      : 0;

  resume.push(`Performance globale moyenne: ${performanceMoyenne}%`);

  // Centres performants
  const centresPerformants = performances.filter((p) => p.performance >= 80);
  if (centresPerformants.length > 0) {
    resume.push(
      `${centresPerformants.length} centre(s) en excellente performance (>80%): ${centresPerformants.map((p) => p.centre.code).join(', ')}`
    );
  }

  // Centres en difficulté
  const centresEnDifficulte = performances.filter((p) => p.performance < 60);
  if (centresEnDifficulte.length > 0) {
    resume.push(
      `${centresEnDifficulte.length} centre(s) nécessitent une attention particulière (<60%): ${centresEnDifficulte.map((p) => p.centre.code).join(', ')}`
    );
  }

  // KPIs critiques
  const totalRouges = performances.reduce((sum, p) => sum + p.mesuresRouges, 0);
  if (totalRouges > 0) {
    resume.push(`${totalRouges} KPI(s) en zone critique à traiter en priorité`);
  }

  return resume;
}

/**
 * Exporte le dashboard en PDF
 */
export async function exporterDashboardPDF(data: DashboardExportData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Calculer les performances
  const performances = calculerPerformances(data);

  // === PAGE 1: TITRE ET RÉSUMÉ ===

  // En-tête
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Tableau de Bord', margin, 25);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Vue consolidée multi-centres', margin, 33);

  // Date
  doc.setFontSize(10);
  doc.text(
    `Généré le ${data.dateExport.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}`,
    pageWidth - margin,
    33,
    { align: 'right' }
  );

  yPos = 55;

  // Résumé exécutif
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Résumé exécutif', margin, yPos);
  yPos += 10;

  const resume = genererResumeExecutif(performances);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.secondary);

  resume.forEach((ligne) => {
    const lignes = doc.splitTextToSize(ligne, pageWidth - margin * 2);
    doc.text(lignes, margin, yPos);
    yPos += lignes.length * 5 + 3;
  });

  yPos += 10;

  // Statistiques globales
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Statistiques globales', margin, yPos);
  yPos += 10;

  // Cartes de statistiques
  const cardWidth = (pageWidth - margin * 2 - 15) / 4;
  const cardHeight = 30;

  const stats = [
    {
      label: 'Centres actifs',
      value: data.centres.filter((c) => c.statut === 'actif').length.toString(),
      total: data.centres.length.toString(),
    },
    {
      label: 'Performance moy.',
      value:
        performances.length > 0
          ? Math.round(
              performances.reduce((sum, p) => sum + p.performance, 0) / performances.length
            ).toString() + '%'
          : 'N/A',
    },
    {
      label: 'KPIs verts',
      value: performances.reduce((sum, p) => sum + p.mesuresVertes, 0).toString(),
    },
    {
      label: 'KPIs critiques',
      value: performances.reduce((sum, p) => sum + p.mesuresRouges, 0).toString(),
    },
  ];

  stats.forEach((stat, index) => {
    const x = margin + index * (cardWidth + 5);

    // Fond de carte
    doc.setFillColor(...COLORS.background);
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(x, yPos, cardWidth, cardHeight, 3, 3, 'FD');

    // Valeur
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const valueText = stat.total ? `${stat.value}/${stat.total}` : stat.value;
    doc.text(valueText, x + cardWidth / 2, yPos + 13, { align: 'center' });

    // Label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.secondary);
    doc.text(stat.label, x + cardWidth / 2, yPos + 22, { align: 'center' });
  });

  yPos += cardHeight + 15;

  // === TABLEAU DES CENTRES ===

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance par centre', margin, yPos);
  yPos += 10;

  // En-têtes du tableau
  const colWidths = [30, 60, 25, 25, 25, 25];
  const headers = ['Code', 'Nom', 'Perf.', 'Verts', 'Orange', 'Rouges'];

  doc.setFillColor(...COLORS.primary);
  doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  let xPos = margin + 2;
  headers.forEach((header, index) => {
    doc.text(header, xPos, yPos + 5.5);
    xPos += colWidths[index];
  });

  yPos += 8;

  // Lignes du tableau
  doc.setFont('helvetica', 'normal');
  performances.forEach((perf, rowIndex) => {
    // Nouvelle page si nécessaire
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = margin;
    }

    // Fond alterné
    if (rowIndex % 2 === 0) {
      doc.setFillColor(...COLORS.background);
      doc.rect(margin, yPos, pageWidth - margin * 2, 7, 'F');
    }

    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(9);

    xPos = margin + 2;
    const rowData = [
      perf.centre.code,
      perf.centre.nom.substring(0, 25),
      `${perf.performance}%`,
      perf.mesuresVertes.toString(),
      perf.mesuresOranges.toString(),
      perf.mesuresRouges.toString(),
    ];

    rowData.forEach((cell, index) => {
      // Colorer selon le type
      if (index === 2) {
        // Performance
        if (perf.performance >= 80) doc.setTextColor(...COLORS.success);
        else if (perf.performance >= 60) doc.setTextColor(...COLORS.warning);
        else doc.setTextColor(...COLORS.error);
      } else if (index === 3) {
        doc.setTextColor(...COLORS.success);
      } else if (index === 4) {
        doc.setTextColor(...COLORS.warning);
      } else if (index === 5) {
        doc.setTextColor(...COLORS.error);
      } else {
        doc.setTextColor(...COLORS.primary);
      }

      doc.text(cell, xPos, yPos + 5);
      xPos += colWidths[index];
    });

    yPos += 7;
  });

  yPos += 10;

  // === ACTIONS EN RETARD ===

  const actionsEnRetard = data.actions.filter((a) => {
    if (a.statut === 'termine' || a.statut === 'annule') return false;
    return new Date(a.dateEcheance) < new Date();
  });

  if (actionsEnRetard.length > 0) {
    // Nouvelle page si nécessaire
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Actions en retard (${actionsEnRetard.length})`, margin, yPos);
    yPos += 10;

    actionsEnRetard.slice(0, 10).forEach((action) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }

      const centre = data.centres.find((c) => c.id === action.centreId);
      const retardJours = Math.floor(
        (new Date().getTime() - new Date(action.dateEcheance).getTime()) / (1000 * 60 * 60 * 24)
      );

      doc.setFillColor(254, 226, 226);
      doc.rect(margin, yPos, pageWidth - margin * 2, 12, 'F');

      doc.setTextColor(...COLORS.error);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${retardJours}j`, margin + 3, yPos + 5);

      doc.setTextColor(...COLORS.primary);
      doc.setFont('helvetica', 'normal');
      doc.text(action.titre.substring(0, 50), margin + 20, yPos + 5);

      doc.setTextColor(...COLORS.secondary);
      doc.text(centre?.code || 'N/A', pageWidth - margin - 20, yPos + 5);

      yPos += 12;
    });
  }

  // Pied de page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.secondary);
    doc.text(
      `Page ${i}/${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text('Cockpit CRMC - Confidentiel', margin, pageHeight - 10);
  }

  return doc.output('blob');
}

/**
 * Télécharge le PDF du dashboard
 */
export async function telechargerDashboardPDF(data: DashboardExportData): Promise<void> {
  const blob = await exporterDashboardPDF(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const dateStr = data.dateExport.toISOString().slice(0, 10);
  link.href = url;
  link.download = `dashboard_cockpit_${dateStr}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
