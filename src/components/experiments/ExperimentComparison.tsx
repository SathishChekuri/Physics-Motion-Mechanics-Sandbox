'use client';

import React from 'react';
import { Experiment } from '@/types/physics';
import { generateTrajectoryPoints } from '@/lib/physics/calculator';
import { exportExperimentsToCsv, generateExportFilename, triggerCsvDownload } from '@/lib/export/csv';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Download, X, GitCompare, Compass } from 'lucide-react';

interface ExperimentComparisonProps {
  experiments: Experiment[];
  onClose: () => void;
}

export function ExperimentComparison({ experiments, onClose }: ExperimentComparisonProps) {
  if (experiments.length === 0) return null;

  // Build merged trajectory data points for chart
  // Sample 80 points per experiment
  const trajectorySeries = experiments.map((exp, idx) => ({
    name: exp.name,
    points: generateTrajectoryPoints(exp.parameters, 80),
    color: ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ec4899'][idx % 5],
  }));

  // Find max range among experiments to create unified x grid
  const maxRange = Math.max(...experiments.map((e) => e.results.range), 10);
  const chartPointsCount = 60;
  const mergedChartData = [];

  for (let i = 0; i < chartPointsCount; i++) {
    const x = (i / (chartPointsCount - 1)) * maxRange;
    const entry: Record<string, number> = { x: Number(x.toFixed(2)) };

    experiments.forEach((exp, expIdx) => {
      // Find y corresponding to x
      const pts = trajectorySeries[expIdx].points;
      let yVal = 0;
      if (x <= exp.results.range) {
        for (let j = 0; j < pts.length - 1; j++) {
          if (x >= pts[j].x && x <= pts[j + 1].x) {
            const dx = pts[j + 1].x - pts[j].x;
            const frac = dx > 0 ? (x - pts[j].x) / dx : 0;
            yVal = pts[j].y + frac * (pts[j + 1].y - pts[j].y);
            break;
          }
        }
      }
      entry[`exp_${expIdx}`] = Number(Math.max(0, yVal).toFixed(2));
    });

    mergedChartData.push(entry);
  }

  const handleExportComparison = () => {
    const csv = exportExperimentsToCsv(experiments);
    const filename = generateExportFilename('experiment_comparison');
    triggerCsvDownload(csv, filename);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <GitCompare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Comparative Physics Analysis ({experiments.length} Experiments)
            </h3>
            <p className="text-xs text-slate-400">
              Direct kinematic cross-examination and trajectory overlay
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportComparison}>
            <Download className="h-3.5 w-3.5" />
            <span>Export Comparison CSV</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
            <span>Close Comparison</span>
          </Button>
        </div>
      </div>

      {/* Trajectory Overlay Chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-cyan-400" />
          Superimposed Trajectories (y vs x)
        </h4>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="x"
                stroke="#64748b"
                unit=" m"
                tick={{ fontSize: 11 }}
                label={{ value: 'Distance x (m)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                unit=" m"
                tick={{ fontSize: 11 }}
                label={{ value: 'Height y (m)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              {experiments.map((exp, idx) => (
                <Line
                  key={exp.id}
                  type="monotone"
                  dataKey={`exp_${idx}`}
                  name={exp.name}
                  stroke={trajectorySeries[idx].color}
                  strokeWidth={2.5}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-side Metrics Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3 font-semibold">Parameter / Metric</th>
              {experiments.map((exp) => (
                <th key={exp.id} className="p-3 font-semibold text-slate-200">
                  {exp.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-300">
            <tr>
              <td className="p-3 font-medium text-slate-400">Motion Model</td>
              {experiments.map((exp) => (
                <td key={exp.id} className="p-3 font-mono">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                      exp.motion_type === 'air_resistance'
                        ? 'border-amber-500/30 bg-amber-950/20 text-amber-400'
                        : 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400'
                    }`}
                  >
                    {exp.motion_type === 'air_resistance' ? 'Quadratic Drag' : 'Vacuum Ideal'}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-400">Initial Velocity (u)</td>
              {experiments.map((exp) => (
                <td key={exp.id} className="p-3 font-mono text-cyan-300">
                  {exp.parameters.initialVelocity} m/s
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-400">Launch Angle (θ)</td>
              {experiments.map((exp) => (
                <td key={exp.id} className="p-3 font-mono text-cyan-300">
                  {exp.parameters.launchAngle}°
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-400">Gravity (g)</td>
              {experiments.map((exp) => (
                <td key={exp.id} className="p-3 font-mono">
                  {exp.parameters.gravity} m/s²
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-400">Initial Height (h₀)</td>
              {experiments.map((exp) => (
                <td key={exp.id} className="p-3 font-mono">
                  {exp.parameters.initialHeight} m
                </td>
              ))}
            </tr>
            <tr className="bg-slate-950/40 font-semibold">
              <td className="p-3 text-cyan-400">Horizontal Range (R)</td>
              {experiments.map((exp) => (
                <td key={exp.id} className="p-3 font-mono text-cyan-300 font-bold text-sm">
                  {exp.results.range} m
                </td>
              ))}
            </tr>
            <tr className="bg-slate-950/40 font-semibold">
              <td className="p-3 text-indigo-400">Max Height (H_max)</td>
              {experiments.map((exp) => (
                <td key={exp.id} className="p-3 font-mono text-indigo-300 font-bold text-sm">
                  {exp.results.maxHeight} m
                </td>
              ))}
            </tr>
            <tr className="bg-slate-950/40 font-semibold">
              <td className="p-3 text-emerald-400">Flight Time (T)</td>
              {experiments.map((exp) => (
                <td key={exp.id} className="p-3 font-mono text-emerald-300 font-bold text-sm">
                  {exp.results.flightTime} s
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-400">Impact Velocity</td>
              {experiments.map((exp) => (
                <td key={exp.id} className="p-3 font-mono text-amber-300">
                  {exp.results.impactVelocity} m/s @ {exp.results.impactAngle}°
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
