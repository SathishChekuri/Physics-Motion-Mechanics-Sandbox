'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Database,
  Cpu,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sliders,
  LogOut,
  LogIn,
} from 'lucide-react';

interface SettingsViewProps {
  supabaseConfigured: boolean;
  geminiConfigured: boolean;
}

export function SettingsView({
  supabaseConfigured: initialSupabase,
  geminiConfigured: initialGemini,
}: SettingsViewProps) {
  const supabaseStatus = initialSupabase;
  const geminiStatus = initialGemini;
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authLoading, setAuthLoading] = useState(false);
  const [authFeedback, setAuthFeedback] = useState<string | null>(null);

  // Local preferences initialized lazily without triggering cascading effect renders
  const [defaultGravity, setDefaultGravity] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('pref_gravity') || '9.81';
      } catch {}
    }
    return '9.81';
  });

  const [defaultSpeed, setDefaultSpeed] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('pref_speed') || '1.0';
      } catch {}
    }
    return '1.0';
  });

  const [prefSaved, setPrefSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user && user.email) {
          setUserEmail(user.email);
        }
      }).catch((e) => {
        console.warn('Session check error:', e);
      });
    }
  }, []);

  const refreshUserSession = async () => {
    const supabase = createClient();
    if (supabase) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && user.email) {
          setUserEmail(user.email);
        }
      } catch (e) {
        console.warn('Session check error:', e);
      }
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthFeedback(null);

    const supabase = createClient();
    if (!supabase) {
      setAuthFeedback('Supabase credentials are not yet configured in environment variables.');
      setAuthLoading(false);
      return;
    }

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setAuthFeedback('Account registered! Please check your email for confirmation.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setAuthFeedback('Signed in successfully!');
        refreshUserSession();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setAuthFeedback(`Error: ${msg}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
      setUserEmail(null);
      setAuthFeedback('Signed out successfully.');
    }
  };

  const savePreferences = () => {
    try {
      localStorage.setItem('pref_gravity', defaultGravity);
      localStorage.setItem('pref_speed', defaultSpeed);
      setPrefSaved(true);
      setTimeout(() => setPrefSaved(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-cyan-400" />
          Settings, Profile & System Integration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          System connectivity health, Supabase authentication, Gemini API configuration, and simulator defaults
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Service Integrations Health Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            External Services & Infrastructure Health
          </h3>

          {/* Supabase Status */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Supabase PostgreSQL & RLS
                </span>
              </div>
              <span
                className={`flex items-center text-xs font-medium ${
                  supabaseStatus ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {supabaseStatus ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 mr-1" /> Pending Setup
                  </>
                )}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Provides cloud persistence for experiments, user profiles, and Row-Level Security.
            </p>
            {!supabaseStatus && (
              <div className="rounded border border-slate-800 bg-slate-900 p-2.5 text-[11px] text-slate-400 space-y-1">
                <div className="text-cyan-400 font-medium">To connect Supabase:</div>
                <div>1. Run SQL migration in `supabase/schema.sql`</div>
                <div>2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`</div>
              </div>
            )}
          </div>

          {/* Gemini AI Status */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Google Gemini 2.5 SDK
                </span>
              </div>
              <span
                className={`flex items-center text-xs font-medium ${
                  geminiStatus ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {geminiStatus ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Active
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 mr-1" /> Key Required
                  </>
                )}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Powers AI Physics Laboratory Tutor, equation derivations, and automated report summaries.
            </p>
            {!geminiStatus && (
              <div className="rounded border border-slate-800 bg-slate-900 p-2.5 text-[11px] text-slate-400 space-y-1">
                <div className="text-indigo-400 font-medium">To activate Gemini AI:</div>
                <div>1. Get a free API key from Google AI Studio</div>
                <div>2. Add `GEMINI_API_KEY=your_key` to `.env.local`</div>
              </div>
            )}
          </div>
        </div>

        {/* User Authentication & Profile Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <User className="h-4 w-4 text-cyan-400" />
            User Authentication & Session
          </h3>

          {userEmail ? (
            <div className="space-y-4 rounded-lg border border-emerald-500/30 bg-emerald-950/10 p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-sm">
                  {userEmail.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs text-slate-400">Authenticated Student/Researcher</div>
                  <div className="text-sm font-semibold text-slate-100">{userEmail}</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                All saved experiments and physics data are securely linked to your account via Supabase Row-Level Security.
              </p>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-3">
              <div className="flex items-center space-x-2 text-xs border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`font-semibold pb-1 border-b-2 transition ${
                    authMode === 'signin'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`font-semibold pb-1 border-b-2 transition ${
                    authMode === 'signup'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {authFeedback && (
                <div className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-slate-300">
                  {authFeedback}
                </div>
              )}

              <Button type="submit" variant="primary" size="sm" loading={authLoading}>
                <LogIn className="h-3.5 w-3.5" />
                <span>{authMode === 'signin' ? 'Sign In to Laboratory' : 'Create Free Account'}</span>
              </Button>
            </form>
          )}
        </div>

        {/* Simulator Default Preferences */}
        <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            Simulator Default Preferences
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Default Gravity Acceleration (m/s²)
              </label>
              <select
                value={defaultGravity}
                onChange={(e) => setDefaultGravity(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="9.81">Earth Standard (9.81 m/s²)</option>
                <option value="1.62">Moon (1.62 m/s²)</option>
                <option value="3.72">Mars (3.72 m/s²)</option>
                <option value="24.79">Jupiter (24.79 m/s²)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Default Playback Speed
              </label>
              <select
                value={defaultSpeed}
                onChange={(e) => setDefaultSpeed(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="0.5">0.5x (Slow Motion Analysis)</option>
                <option value="1.0">1.0x (Real-time Physical)</option>
                <option value="2.0">2.0x (Accelerated)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" size="sm" onClick={savePreferences}>
              Save Preferences
            </Button>
            {prefSaved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Preferences saved!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
