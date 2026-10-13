'use client';

import React from 'react';
import Link from 'next/link';
import { Atom, Shield, BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="no-print mt-auto border-t border-slate-800 bg-slate-950 py-8 text-xs text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3 items-center">
          <div>
            <div className="flex items-center space-x-2 text-slate-200 font-semibold mb-1">
              <Atom className="h-4 w-4 text-cyan-400" />
              <span>Physics Motion Mechanics Sandbox</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Interactive educational physics laboratory for projectile dynamics, real-time kinematics, and AI-assisted physics tutoring.
            </p>
          </div>

          <div className="flex justify-start md:justify-center space-x-6 text-slate-400">
            <Link href="/simulator" className="hover:text-cyan-400 transition">
              Simulator
            </Link>
            <Link href="/experiments" className="hover:text-cyan-400 transition">
              Experiments
            </Link>
            <Link href="/tutor" className="hover:text-cyan-400 transition">
              AI Tutor
            </Link>
            <Link href="/reports" className="hover:text-cyan-400 transition">
              Reports
            </Link>
            <Link href="/settings" className="hover:text-cyan-400 transition">
              Settings
            </Link>
          </div>

          <div className="flex flex-col md:items-end space-y-1 text-slate-400 text-[11px]">
            <div className="flex items-center space-x-2">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>PostgreSQL RLS Security & Server-side AI</span>
            </div>
            <div>Designed for Vercel Deployment & STEM Education</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <div>© 2026 Physics Motion Mechanics Sandbox. Deterministic SI calculations.</div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-cyan-400" />
              Next.js 16 + Tailwind CSS + Recharts
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
