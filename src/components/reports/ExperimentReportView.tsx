'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Experiment } from '@/types/physics';
import { SAMPLE_EXPERIMENTS } from '@/lib/experiments/sample-data';
import { createClient } from '@/lib/supabase/client';
import { exportExperimentsToCsv, generateExportFilename, triggerCsvDownload } from '@/lib/export/csv';
import { generateTrajectoryPoints } from '@/lib/physics/calculator';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Printer,
  Download,
  Sparkles,
  FileText,
  CheckCircle2,
  Atom,
} from 'lucide-react';

export function ExperimentReportView() {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get('id');

  const [experiments, setExperiments] = useState<Experiment[]>(SAMPLE_EXPERIMENTS);
  const [selectedExp, setSelectedExp] = useState<Experiment>(SAMPLE_EXPERIMENTS[0]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      let allExps: Experiment[] = [];

      const supabase = createClient();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('experiments')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data && data.length > 0) {
            allExps = data as Experiment[];
          }
        } catch (err) {
          console.warn('Supabase fetch failed:', err);
        }
      }

      if (allExps.length === 0 && typeof window !== 'undefined') {
        try {
          const local = localStorage.getItem('saved_experiments');
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              allExps = parsed;
            }
          }
        } catch {}
      }

      if (allExps.length === 0) {
        allExps = SAMPLE_EXPERIMENTS;
      }

      if (active) {
        setExperiments(allExps);

        if (requestedId) {
          const found = allExps.find((e) => e.id === requestedId);
          if (found) {
            setSelectedExp(found);
          } else {
            setSelectedExp(allExps[0]);
          }
        } else {
          setSelectedExp(allExps[0]);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [requestedId]);

  const handleExportSingleCsv = () => {
    const csv = exportExperimentsToCsv([selectedExp]);
    const filename = generateExportFilename(selectedExp.name);
    triggerCsvDownload(csv, filename);
    setExportNotice(`Exported ${filename} successfully`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateAiSummary = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentName: selectedExp.name,
          motionType: selectedExp.motion_type,
          parameters: selectedExp.parameters,
          results: selectedExp.results,
          userObservations: selectedExp.notes,
        }),
      });

      const data = await res.json();
      if (data.summary) {
        setAiSummary(data.summary);
      }
    } catch (err) {
      console.warn('Failed to generate summary:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const points = generateTrajectoryPoints(selectedExp.parameters, 80);
  const p = selectedExp.parameters;
  const r = selectedExp.results;

  return (
    <div className="space-y-6">
      {/* Action Header (Hidden in Print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-cyan-400" />
            Formal Experiment Reports & Export
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Print-ready publication reports with governing equations, data tables, trajectory graphics, and AI commentary
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Select Experiment Dropdown */}
          <div className="relative">
            <select
              value={selectedExp.id}
              onChange={(e) => {
                const found = experiments.find((exp) => exp.id === e.target.value);
                if (found) {
                  setSelectedExp(found);
                  setAiSummary(null);
                }
              }}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              {experiments.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.name}
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportSingleCsv}>
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button variant="primary" size="sm" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="no-print flex items-center space-x-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Printable Report Document Card */}
      <div className="print-card rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-10 shadow-2xl">
        {/* Report Top Header */}
        <div className="border-b border-slate-800 pb-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md">
                <Atom className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
                  Laboratory Motion Mechanics Report
                </h2>
                <p className="text-xs text-slate-400">
                  Physics Motion Mechanics Sandbox • Deterministic Verification
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 font-mono">
              <div>
                Experiment ID:{' '}
                <span className="text-slate-200 font-bold">{selectedExp.id.slice(0, 12)}</span>
              </div>
              <div>
                Timestamp:{' '}
                <span className="text-slate-300">
                  {new Date(selectedExp.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h1 className="text-2xl font-bold text-white tracking-tight">{selectedExp.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-500/10 px-3 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                Model: {selectedExp.motion_type === 'air_resistance' ? 'Quadratic Aerodynamic Drag' : 'Ideal Newtonian Vacuum'}
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-0.5 text-xs text-slate-300">
                Gravity: {p.gravity} m/s²
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-0.5 text-xs text-slate-300">
                Launch Height: {p.initialHeight} m
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Governing Physical Equations */}
        <div className="mb-6 rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            1. Governing Mathematical Equations
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 text-xs font-mono text-slate-300">
            <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
              <div className="text-cyan-400 font-semibold mb-1">Horizontal Motion:</div>
              <div>vx = u · cos(θ) = {r.initialVx} m/s</div>
              <div>x(t) = vx · t</div>
            </div>
            <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
              <div className="text-cyan-400 font-semibold mb-1">Vertical Motion:</div>
              <div>vy(t) = u · sin(θ) - g · t</div>
              <div>y(t) = h₀ + vy₀ · t - ½g · t²</div>
            </div>
            <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
              <div className="text-indigo-400 font-semibold mb-1">Landing Time Condition (y=0):</div>
              <div>t_land = (vy₀ + √(vy₀² + 2gh₀)) / g = {r.flightTime} s</div>
            </div>
            <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
              <div className="text-indigo-400 font-semibold mb-1">Apex Altitude:</div>
              <div>H_max = h₀ + vy₀² / (2g) = {r.maxHeight} m</div>
            </div>
          </div>
        </div>

        {/* Section 2: Input Parameters & Calculated Metrics */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {/* Input Parameters Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              2. Experimental Input Parameters
            </h3>
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono">
                <tr>
                  <td className="py-2 text-slate-400 font-sans">Initial Launch Velocity (u)</td>
                  <td className="py-2 text-right font-bold text-cyan-300">{p.initialVelocity} m/s</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-sans">Launch Angle (θ)</td>
                  <td className="py-2 text-right font-bold text-cyan-300">{p.launchAngle}°</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-sans">Gravitational Acceleration (g)</td>
                  <td className="py-2 text-right font-bold text-slate-200">{p.gravity} m/s²</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-sans">Initial Elevation (h₀)</td>
                  <td className="py-2 text-right font-bold text-slate-200">{p.initialHeight} m</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-sans">Drag Model</td>
                  <td className="py-2 text-right text-slate-400 font-sans">
                    {p.airResistanceEnabled ? 'Quadratic Air Drag' : 'Vacuum'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Measured Output Results */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              3. Calculated Numerical Metrics
            </h3>
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono">
                <tr>
                  <td className="py-2 text-slate-400 font-sans">Horizontal Range (R)</td>
                  <td className="py-2 text-right font-bold text-cyan-400 text-sm">{r.range} m</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-sans">Maximum Elevation (H_max)</td>
                  <td className="py-2 text-right font-bold text-indigo-400 text-sm">{r.maxHeight} m</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-sans">Total Flight Duration (T)</td>
                  <td className="py-2 text-right font-bold text-emerald-400 text-sm">{r.flightTime} s</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-sans">Time to Peak Altitude</td>
                  <td className="py-2 text-right text-slate-300">{r.timeToMaxHeight} s</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400 font-sans">Impact Velocity Vector</td>
                  <td className="py-2 text-right font-bold text-amber-300">
                    {r.impactVelocity} m/s @ {r.impactAngle}°
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Trajectory Graph */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            4. Projectile Trajectory Profile (y vs x)
          </h3>
          <div className="h-60 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="x"
                  stroke="#64748b"
                  unit=" m"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Horizontal Displacement x (m)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  dataKey="y"
                  stroke="#64748b"
                  unit=" m"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Elevation y (m)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="y"
                  name="Elevation"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 4: Student Observations & Notes */}
        {selectedExp.notes && (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              5. Student Laboratory Observations
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              &ldquo;{selectedExp.notes}&rdquo;
            </p>
          </div>
        )}

        {/* Section 5: AI Executive Summary & Analysis */}
        <div className="rounded-xl border border-indigo-500/30 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              6. AI Physical Mechanics Analysis
            </h3>
            {!aiSummary && (
              <Button
                variant="accent"
                size="sm"
                onClick={handleGenerateAiSummary}
                loading={aiLoading}
                className="no-print"
              >
                Generate Live AI Analysis
              </Button>
            )}
          </div>

          {aiLoading ? (
            <div className="py-4 text-center text-xs text-slate-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent mx-auto mb-2" />
              Generating comprehensive physical report summary...
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {aiSummary ||
                `Kinematic Summary for "${selectedExp.name}":\nThe experimental projectile achieved a total horizontal range of ${r.range} meters with an apex height of ${r.maxHeight} meters over a flight duration of ${r.flightTime} seconds. Launch parameters (u = ${p.initialVelocity} m/s, θ = ${p.launchAngle}°) confirm parabolic motion under uniform gravitational acceleration g = ${p.gravity} m/s². Click "Generate Live AI Analysis" for Gemini 2.5 deep pedagogical breakdown.`}
            </div>
          )}
        </div>

        {/* Sign-off footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono">
          <div>Verified Deterministic Model: Physics Motion Mechanics Sandbox</div>
          <div>Report Sign-off: Automated Educational Lab Generator</div>
        </div>
      </div>
    </div>
  );
}
