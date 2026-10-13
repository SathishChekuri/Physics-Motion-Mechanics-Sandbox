'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle, AlertCircle, ChevronDown, ChevronUp, Layers } from 'lucide-react';

export interface Milestone {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  verificationDetails: string;
}

interface ProgressChecklistProps {
  supabaseConfigured?: boolean;
  geminiConfigured?: boolean;
}

export function ProgressChecklist({
  supabaseConfigured = false,
  geminiConfigured = false,
}: ProgressChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const milestones: Milestone[] = [
    {
      id: 1,
      title: 'Understand requirements & architecture',
      description: 'Requirements mapped: Projectile mechanics, Supabase persistence, Gemini AI integration, Vercel readiness.',
      status: 'completed',
      verificationDetails: 'Physics formulas mapped, TypeScript interfaces defined, unit tests passing.',
    },
    {
      id: 2,
      title: 'Set up Next.js and Tailwind frontend UI',
      description: 'App shell, responsive navigation, scientific dark theme, Recharts, and Canvas simulation visualizer.',
      status: 'completed',
      verificationDetails: 'Next.js 16 App Router configured, Tailwind CSS styling verified, responsive dashboard active.',
    },
    {
      id: 3,
      title: 'Connect Supabase database persistence',
      description: 'PostgreSQL schema with profiles & experiments tables, Row Level Security (RLS) policies, and CRUD operations.',
      status: supabaseConfigured ? 'completed' : 'in_progress',
      verificationDetails: supabaseConfigured
        ? 'Connected to live Supabase project with authenticated RLS policies.'
        : 'Schema & client prepared (supabase/schema.sql). Ready for Supabase credentials.',
    },
    {
      id: 4,
      title: 'Include AI model for automated generation',
      description: 'Google Gemini SDK (@google/genai) integration with server-side API routes, Zod validation, and tutoring features.',
      status: geminiConfigured ? 'completed' : 'in_progress',
      verificationDetails: geminiConfigured
        ? 'Connected to Gemini API model for physics tutoring and report summarization.'
        : 'API routes and Zod validation implemented. Awaiting GEMINI_API_KEY.',
    },
    {
      id: 5,
      title: 'Deploy application to Vercel',
      description: 'Production build verification, Vercel configuration, environment variables documentation.',
      status: 'pending',
      verificationDetails: 'Build compiles cleanly. Ready for Vercel deployment with documented steps.',
    },
  ];

  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  return (
    <div className="no-print mb-6 rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-slate-100">Project Progress Checklist</h3>
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-300 border border-cyan-500/20">
                {completedCount} / {milestones.length} Milestones ({progressPercent}%)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Mandatory 5-stage engineering lifecycle tracking
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:block w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Milestones'}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg border p-3 flex flex-col justify-between ${
                m.status === 'completed'
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : m.status === 'in_progress'
                  ? 'border-amber-500/30 bg-amber-950/10'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-400">Milestone {m.id}</span>
                  {m.status === 'completed' ? (
                    <span className="flex items-center text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Done
                    </span>
                  ) : m.status === 'in_progress' ? (
                    <span className="flex items-center text-xs text-amber-400 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-slate-500 font-medium">
                      <Circle className="h-3.5 w-3.5 mr-1" /> Pending
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-slate-200 mb-1">{m.title}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{m.description}</p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 italic">
                {m.verificationDetails}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
