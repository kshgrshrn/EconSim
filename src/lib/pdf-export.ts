import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { SimulationResult } from '@/types/simulation';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getImpactLevel(level: string): string {
  const levels: Record<string, string> = {
    'strong_positive': '⬆⬆ Strong Positive',
    'positive': '⬆ Positive',
    'neutral': '→ Neutral',
    'negative': '⬇ Negative',
    'strong_negative': '⬇⬇ Strong Negative',
  };
  return levels[level] || level;
}

export async function generatePDFReport(
  simulationResult: SimulationResult,
  aiOverview: string
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Title
  doc.setFontSize(24);
  doc.setTextColor(33, 33, 33);
  doc.text('EconSim Simulation Report', 20, yPosition);
  yPosition += 12;

  // Header info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${formatDate(simulationResult.timestamp)}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Policy: ${simulationResult.impacts.policyName}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Simulation ID: ${simulationResult.id}`, 20, yPosition);
  yPosition += 15;

  // AI Overview Section
  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text('Executive Summary', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  const overviewLines = doc.splitTextToSize(aiOverview, pageWidth - 40);
  doc.text(overviewLines, 20, yPosition);
  yPosition += overviewLines.length * 5 + 10;

  // Check if we need a new page
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  // Macro Indicators Section
  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text('Key Metrics', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const metrics = [
    {
      label: 'GDP Change',
      value: `${simulationResult.outputs.gdpChange > 0 ? '+' : ''}${simulationResult.outputs.gdpChange.toFixed(2)}%`,
    },
    {
      label: 'Employment Change',
      value: `${simulationResult.outputs.employmentChange > 0 ? '+' : ''}${simulationResult.outputs.employmentChange.toFixed(2)}%`,
    },
    {
      label: 'Inflation Change',
      value: `${simulationResult.outputs.inflationChange > 0 ? '+' : ''}${simulationResult.outputs.inflationChange.toFixed(2)}%`,
    },
    {
      label: 'Government Revenue',
      value: `${simulationResult.outputs.revenueChange > 0 ? '+' : ''}${simulationResult.outputs.revenueChange.toFixed(2)}B$`,
    },
    {
      label: 'Welfare Change',
      value: `${simulationResult.outputs.welfareChange > 0 ? '+' : ''}${simulationResult.outputs.welfareChange.toFixed(2)}%`,
    },
  ];

  metrics.forEach(metric => {
    doc.text(`${metric.label}:`, 20, yPosition);
    doc.setFont(undefined, 'bold');
    doc.text(metric.value, pageWidth - 40, yPosition, { align: 'right' });
    doc.setFont(undefined, 'normal');
    yPosition += 7;
  });

  yPosition += 5;

  // Impact Analysis Section
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text('Impact Analysis', 20, yPosition);
  yPosition += 8;

  const sections = [
    simulationResult.impacts.consumer,
    simulationResult.impacts.producer,
    simulationResult.impacts.worker,
    simulationResult.impacts.macro,
  ];

  sections.forEach(section => {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);
    doc.text(section.title, 20, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);

    section.items.forEach(item => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      const level = getImpactLevel(item.level);
      const itemLines = doc.splitTextToSize(`${level}: ${item.effect}`, pageWidth - 50);
      doc.text(itemLines, 25, yPosition);
      yPosition += itemLines.length * 4 + 2;
    });

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'italic');
    const recLines = doc.splitTextToSize(`Insight: ${section.recommendation}`, pageWidth - 50);
    doc.text(recLines, 25, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += recLines.length * 4 + 8;
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`EconSim_Report_${new Date().getTime()}.pdf`);
}
