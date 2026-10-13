'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  FlaskConical,
  Sparkles,
  FileText,
  Settings,
  Menu,
  X,
  Atom,
  Database,
  Cpu,
} from 'lucide-react';

interface NavbarProps {
  supabaseConfigured?: boolean;
  geminiConfigured?: boolean;
}

export function Navbar({ supabaseConfigured = false, geminiConfigured = false }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/simulator', label: 'Motion Simulator', icon: Compass },
    { href: '/experiments', label: 'Experiment History', icon: FlaskConical },
    { href: '/tutor', label: 'AI Physics Tutor', icon: Sparkles },
    { href: '/reports', label: 'Reports & Export', icon: FileText },
    { href: '/settings', label: 'Settings & Profile', icon: Settings },
  ];

  return (
    <nav className="no-print sticky top-0 z-50 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Atom className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  Physics Motion
                  <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                    LAB
                  </span>
                </span>
                <span className="block text-[10px] text-slate-400 -mt-0.5 tracking-wide">
                  Mechanics Sandbox
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800/90 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-300 hover:bg-slate-850 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Status Badges & Quick Action */}
          <div className="hidden lg:flex lg:items-center lg:space-x-3">
            {/* Supabase status badge */}
            <div
              title={
                supabaseConfigured
                  ? 'Supabase PostgreSQL connected'
                  : 'Supabase credentials pending (Demo preview active)'
              }
              className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border ${
                supabaseConfigured
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                  : 'border-slate-700 bg-slate-900 text-slate-400'
              }`}
            >
              <Database className="h-3 w-3" />
              <span>{supabaseConfigured ? 'DB Connected' : 'DB Demo Mode'}</span>
            </div>

            {/* Gemini status badge */}
            <div
              title={
                geminiConfigured
                  ? 'Google Gemini AI Tutor Online'
                  : 'GEMINI_API_KEY required for live AI responses'
              }
              className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border ${
                geminiConfigured
                  ? 'border-indigo-500/30 bg-indigo-950/20 text-indigo-400'
                  : 'border-slate-700 bg-slate-900 text-slate-400'
              }`}
            >
              <Cpu className="h-3 w-3" />
              <span>{geminiConfigured ? 'Gemini 2.5 Active' : 'AI Offline'}</span>
            </div>

            <Link
              href="/simulator"
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:brightness-110 transition"
            >
              Launch Lab
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-cyan-400" />
                Database:
              </span>
              <span className={supabaseConfigured ? 'text-emerald-400' : 'text-slate-400'}>
                {supabaseConfigured ? 'Connected' : 'Demo Mode'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                Gemini AI:
              </span>
              <span className={geminiConfigured ? 'text-indigo-400' : 'text-slate-400'}>
                {geminiConfigured ? 'Active' : 'Key Needed'}
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
