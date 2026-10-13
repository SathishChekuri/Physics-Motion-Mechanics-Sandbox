import { describe, it, expect } from 'vitest';
import { escapeCsvField, exportExperimentsToCsv, generateExportFilename } from './csv';
import { Experiment } from '@/types/physics';

describe('CSV Export Utility', () => {
  it('correctly escapes standard fields, quotes, and commas', () => {
    expect(escapeCsvField('hello')).toBe('hello');
    expect(escapeCsvField('hello, world')).toBe('"hello, world"');
    expect(escapeCsvField('say "hello"')).toBe('"say ""hello"""');
    expect(escapeCsvField('multiline\ntext')).toBe('"multiline\ntext"');
    expect(escapeCsvField(42)).toBe('42');
    expect(escapeCsvField(null)).toBe('');
  });

  it('exports experiments array to RFC 4180 CSV correctly', () => {
    const mockExperiments: Experiment[] = [
      {
        id: 'exp-1',
        name: '45 Degree Cannon, High Power',
        motion_type: 'ideal',
        parameters: {
          initialVelocity: 25,
          launchAngle: 45,
          gravity: 9.81,
          initialHeight: 0,
          airResistanceEnabled: false,
        },
        results: {
          flightTime: 3.6,
          maxHeight: 15.9,
          range: 63.7,
          impactVelocity: 25,
          impactAngle: 45,
          timeToMaxHeight: 1.8,
          initialVx: 17.68,
          initialVy: 17.68,
        },
        notes: 'Notice how theoretical angle of 45° maximizes "range".',
        created_at: '2026-10-13T10:00:00Z',
      },
    ];

    const csv = exportExperimentsToCsv(mockExperiments);
    const lines = csv.split('\r\n');

    expect(lines.length).toBe(2);
    expect(lines[0]).toContain('Experiment Name');
    expect(lines[0]).toContain('Horizontal Range (m)');

    // Line 1 should have escaped quotes for the name and notes
    expect(lines[1]).toContain('"45 Degree Cannon, High Power"');
    expect(lines[1]).toContain('"Notice how theoretical angle of 45° maximizes ""range""."');
    expect(lines[1]).toContain('63.7');
  });

  it('generates a clean timestamped export filename', () => {
    const filename = generateExportFilename('My Cool Experiment!');
    expect(filename).toMatch(/^my_cool_experiment_[0-9]{4}-[0-9]{2}-[0-9]{2}\.csv$/);
  });
});
