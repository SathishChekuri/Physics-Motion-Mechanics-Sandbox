'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Experiment } from '@/types/physics';
import { SAMPLE_EXPERIMENTS } from '@/lib/experiments/sample-data';
import { createClient } from '@/lib/supabase/client';
import { ProgressChecklist } from '@/components/layout/ProgressChecklist';
import { Button } from '@/components/ui/button';
import {
  Compass,
  FlaskConical,
  Sparkles,
  Activity,
  ArrowRight,
  Target,
  Wind,
  Zap,
} from 'lucide-react';

interface DashboardOverviewProps {
  supabaseConfigured: boolean;
  geminiConfigured: boolean;
}

export function DashboardOverview({
  supabaseConfigured,
  geminiConfigured,
}: DashboardOverviewProps) {
  const [experiments, setExperiments] = useState<Experiment[]>(SAMPLE_EXPERIMENTS);
  const [isDemoData, setIsDemoData] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchLabData() {
      const supabase = createClient();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('experiments')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0 && active) {
            setExperiments(data as Experiment[]);
            setIsDemoData(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase load error:', e);
        }
      }

      if (typeof window !== 'undefined') {
        try {
          const local = localStorage.getItem('saved_experiments');
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0 && active) {
              setExperiments(parsed);
              setIsDemoData(false);
            }
          }
        } catch {}
      }
    }

    fetchLabData();

    return () => {
      active = false;
    };
  }, []);

  const totalExperiments = experiments.length;
  const idealCount = experiments.filter((e) => e.motion_type === 'ideal').length;
  const dragCount = experiments.filter((e) => e.motion_type === 'air_resistance').length;
  const maxRangeEver = Math.max(...experiments.map((e) => e.results.range), 0);

  const labChallenges = [
    {
      title: 'Maximum Range Validation',
      difficulty: 'Introductory',
      desc: 'Verify that 45 degrees yields maximum horizontal range in a vacuum, but not in elevated launches.',
      velocity: 25,
      angle: 45,
      height: 0,
    },
    {
      title: 'Cliff Drop Independence',
      difficulty: 'Intermediate',
      desc: 'Prove that horizontal launch velocity has zero impact on vertical fall time from elevated cliffs.',
      velocity: 30,
      angle: 0,
      height: 50,
    },
    {
      title: 'Quadratic Drag Asymmetry',
      difficulty: 'Advanced',
      desc: 'Observe how aerodynamic drag distorts the parabola into a steep asymmetric plunge.',
      velocity: 40,
      angle: 50,
      height: 0,
      drag: true,
    },
    {
      title: 'Lunar vs Earth Kinematics',
      difficulty: 'Conceptual',
      desc: 'Compare flight times on the Moon (g = 1.62 m/s²) where gravity is 6 times weaker.',
      velocity: 20,
      angle: 45,
      height: 0,
      gravity: 1.62,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 5-Milestone Project Progress Checklist */}
      <ProgressChecklist
        supabaseConfigured={supabaseConfigured}
        geminiConfigured={geminiConfigured}
      />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span>Interactive Educational Physics Laboratory</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Physics Motion Mechanics Sandbox
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Simulate 2D projectile mechanics in real time, analyze kinematic equations, compare experiments, generate print-ready laboratory reports, and receive step-by-step guidance from the AI Tutor.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/simulator">
              <Button variant="primary" size="md">
                <Compass className="h-4 w-4" />
                <span>Open Motion Simulator</span>
              </Button>
            </Link>

            <Link href="/tutor">
              <Button variant="secondary" size="md">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>Consult AI Tutor</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Experiments</span>
            <FlaskConical className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-100">
            {totalExperiments}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {isDemoData ? 'Sample Lab Library' : 'Saved in Database'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Motion Models</span>
            <Wind className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-100">
            {idealCount} <span className="text-xs font-normal text-slate-500">ideal</span> / {dragCount} <span className="text-xs font-normal text-slate-500">drag</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Vacuum vs Quadratic Drag
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Max Range Recorded</span>
            <Target className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-400">
            {maxRangeEver.toFixed(1)} <span className="text-xs font-normal text-slate-400">m</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Longest horizontal trajectory
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Physics Tutor</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-100">
            {geminiConfigured ? 'Gemini 2.5' : 'Ready'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {geminiConfigured ? 'Live AI explanations active' : 'Key configured via server route'}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Experiments & Recommended Lab Challenges */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Experiments (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <FlaskConical className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-100">Recent Laboratory Trials</h3>
              {isDemoData && (
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-700">
                  Demo Library
                </span>
              )}
            </div>

            <Link href="/experiments" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {experiments.slice(0, 4).map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-200">{exp.name}</span>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-semibold border ${
                        exp.motion_type === 'air_resistance'
                          ? 'border-amber-500/30 bg-amber-950/20 text-amber-400'
                          : 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400'
                      }`}
                    >
                      {exp.motion_type === 'air_resistance' ? 'Drag' : 'Vacuum'}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 flex items-center space-x-2">
                    <span>u = {exp.parameters.initialVelocity} m/s</span>
                    <span>•</span>
                    <span>θ = {exp.parameters.launchAngle}°</span>
                    <span>•</span>
                    <span>Range = {exp.results.range} m</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link href={`/reports?id=${exp.id}`}>
                    <Button variant="ghost" size="sm" className="text-[11px]">
                      Report
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guided Physics Challenges (1 Col) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan-400" />
              Educational Challenges
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Guided laboratory investigations designed to verify mechanics principles
            </p>
          </div>

          <div className="space-y-3">
            {labChallenges.map((c, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 hover:border-cyan-500/30 transition group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                    {c.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {c.difficulty}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{c.desc}</p>
                <div className="mt-2 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>
                    u={c.velocity}m/s, θ={c.angle}°
                  </span>
                  <Link
                    href={`/simulator`}
                    className="text-cyan-400 font-sans font-medium hover:underline flex items-center gap-0.5"
                  >
                    Load in Lab →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
