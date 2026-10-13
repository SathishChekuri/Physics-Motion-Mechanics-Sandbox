import { Experiment } from '@/types/physics';

/**
 * Escapes an individual field according to RFC 4180 specification.
 */
export function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  // If string contains comma, quote, or newline, escape quotes and wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert a single experiment or multiple experiments to a formatted CSV string.
 */
export function exportExperimentsToCsv(experiments: Experiment[]): string {
  const headers = [
    'ID',
    'Experiment Name',
    'Motion Type',
    'Launch Velocity (m/s)',
    'Launch Angle (deg)',
    'Gravity (m/s^2)',
    'Initial Height (m)',
    'Air Resistance Enabled',
    'Drag Coeff Cd',
    'Mass (kg)',
    'Area (m^2)',
    'Air Density (kg/m^3)',
    'Flight Time (s)',
    'Max Height (m)',
    'Horizontal Range (m)',
    'Impact Velocity (m/s)',
    'Impact Angle (deg)',
    'Time to Max Height (s)',
    'Initial Vx (m/s)',
    'Initial Vy (m/s)',
    'Notes',
    'Created At',
  ];

  const rows = experiments.map((exp) => {
    const p = exp.parameters;
    const r = exp.results;
    const air = p.airParams;

    return [
      exp.id,
      exp.name,
      exp.motion_type,
      p.initialVelocity,
      p.launchAngle,
      p.gravity,
      p.initialHeight,
      p.airResistanceEnabled ? 'Yes' : 'No',
      air?.dragCoefficient ?? 'N/A',
      air?.mass ?? 'N/A',
      air?.crossSectionalArea ?? 'N/A',
      air?.airDensity ?? 'N/A',
      r.flightTime,
      r.maxHeight,
      r.range,
      r.impactVelocity,
      r.impactAngle,
      r.timeToMaxHeight,
      r.initialVx,
      r.initialVy,
      exp.notes ?? '',
      exp.created_at,
    ].map(escapeCsvField).join(',');
  });

  return [headers.map(escapeCsvField).join(','), ...rows].join('\r\n');
}

/**
 * Generates an exported filename with timestamp.
 */
export function generateExportFilename(prefix: string = 'physics_experiment'): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const sanitized = prefix
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return `${sanitized || 'physics_experiment'}_${dateStr}.csv`;
}

/**
 * Browser-side download trigger for CSV content.
 */
export function triggerCsvDownload(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
