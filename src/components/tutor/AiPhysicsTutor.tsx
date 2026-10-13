'use client';

import React, { useState, useMemo } from 'react';
import { AiTutorMode, AiTutorResponse } from '@/types/ai';
import { SimulatorParameters } from '@/types/physics';
import { DEFAULT_PARAMETERS, calculatePhysics } from '@/lib/physics/calculator';
import { PHYSICS_PRESETS } from '@/lib/physics/presets';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Compass,
  FileQuestion,
  Calculator,
  Send,
  CheckCircle,
  Copy,
  Info,
} from 'lucide-react';

export function AiPhysicsTutor() {
  const [parameters, setParameters] = useState<SimulatorParameters>(DEFAULT_PARAMETERS);
  const results = useMemo(() => calculatePhysics(parameters), [parameters]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiTutorResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Trigger tutor API with specific mode
  const askTutor = async (mode: AiTutorMode, question?: string) => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          userQuestion: question || customQuestion,
          parameters,
          results,
        }),
      });

      const data: AiTutorResponse = await res.json();
      setResponse(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setResponse({
        success: false,
        error: msg,
        content: `### ⚠️ Connection Error\n\nFailed to contact AI Tutor endpoint: ${msg}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts: { label: string; mode: AiTutorMode; icon: React.ElementType; desc: string }[] = [
    {
      label: 'Explain Physics Concepts',
      mode: 'explain_concept',
      icon: BookOpen,
      desc: 'Understand why parabolic trajectory forms and how gravity acts solely on the vertical axis.',
    },
    {
      label: 'Step-by-Step Equations',
      mode: 'step_by_step_equations',
      icon: Calculator,
      desc: 'Step-by-step mathematical breakdown of kinematic equations and landing roots.',
    },
    {
      label: 'Interpret Calculated Results',
      mode: 'interpret_results',
      icon: Lightbulb,
      desc: 'Analyze energy conservation and physical significance of the measured values.',
    },
    {
      label: 'Parameter Sensitivity',
      mode: 'parameter_relationships',
      icon: Compass,
      desc: 'Discover how velocity, angle, and elevation impact flight duration and range.',
    },
    {
      label: 'Suggest Experiments',
      mode: 'suggest_experiments',
      icon: Sparkles,
      desc: 'Discover counter-intuitive scenarios like cliff launches and air drag terminal velocity.',
    },
    {
      label: 'Practice Exam Questions',
      mode: 'practice_questions',
      icon: FileQuestion,
      desc: 'Test your mechanics knowledge with numerical and conceptual physics questions.',
    },
    {
      label: 'Problem Solving Hints',
      mode: 'problem_hints',
      icon: HelpCircle,
      desc: 'Key rules of thumb and strategies for tackling projectile motion problems.',
    },
  ];

  const handleCopy = () => {
    if (response?.content) {
      navigator.clipboard.writeText(response.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            AI Physics Laboratory Tutor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Server-side Google Gemini 2.5 integration with step-by-step derivations, concepts, and practice problems
          </p>
        </div>

        {/* Setup context indicator */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 font-mono">
          <span>Active Context: </span>
          <span className="text-cyan-400">{parameters.initialVelocity} m/s</span> @{' '}
          <span className="text-indigo-400">{parameters.launchAngle}°</span>, g={' '}
          <span className="text-emerald-400">{parameters.gravity} m/s²</span>
        </div>
      </div>

      {/* Simulator parameters quick editor */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-cyan-400" />
            Active Simulation Context Fed to AI Tutor
          </h3>
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400 text-[11px]">Load Scenario:</span>
            <select
              onChange={(e) => {
                const found = PHYSICS_PRESETS.find((p) => p.id === e.target.value);
                if (found) setParameters(found.parameters);
              }}
              defaultValue=""
              className="rounded border border-slate-700 bg-slate-950 px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="" disabled>
                Select preset scenario...
              </option>
              {PHYSICS_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          The AI Tutor uses these exact numbers to ground all mathematical explanations and verify formulas against deterministic simulator values.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs font-mono">
          <div className="rounded border border-slate-800 bg-slate-950 p-2">
            <span className="text-slate-500 block text-[10px]">Velocity (u)</span>
            <span className="text-cyan-300 font-bold">{parameters.initialVelocity} m/s</span>
          </div>
          <div className="rounded border border-slate-800 bg-slate-950 p-2">
            <span className="text-slate-500 block text-[10px]">Angle (θ)</span>
            <span className="text-cyan-300 font-bold">{parameters.launchAngle}°</span>
          </div>
          <div className="rounded border border-slate-800 bg-slate-950 p-2">
            <span className="text-slate-500 block text-[10px]">Gravity (g)</span>
            <span className="text-slate-300 font-bold">{parameters.gravity} m/s²</span>
          </div>
          <div className="rounded border border-slate-800 bg-slate-950 p-2">
            <span className="text-slate-500 block text-[10px]">Elevation (h₀)</span>
            <span className="text-slate-300 font-bold">{parameters.initialHeight} m</span>
          </div>
          <div className="rounded border border-slate-800 bg-slate-950 p-2">
            <span className="text-slate-500 block text-[10px]">Range (R)</span>
            <span className="text-cyan-400 font-bold">{results.range} m</span>
          </div>
          <div className="rounded border border-slate-800 bg-slate-950 p-2">
            <span className="text-slate-500 block text-[10px]">Peak (H_max)</span>
            <span className="text-indigo-400 font-bold">{results.maxHeight} m</span>
          </div>
        </div>
      </div>

      {/* Quick Prompt Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {quickPrompts.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.mode}
              onClick={() => askTutor(p.mode)}
              disabled={loading}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-left transition hover:border-cyan-500/40 hover:bg-slate-900 group disabled:opacity-50"
            >
              <div>
                <div className="flex items-center space-x-2 text-cyan-400 mb-1.5 group-hover:text-cyan-300">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold text-slate-100">{p.label}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
              <div className="mt-3 text-[10px] text-cyan-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Ask AI</span> →
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Question Form */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <label className="block text-xs font-semibold text-slate-200 mb-2">
          Ask Custom Physics Question
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customQuestion.trim() && !loading) {
                askTutor('custom_query', customQuestion.trim());
              }
            }}
            placeholder="e.g. Why is the landing speed higher than the launch speed when launching from 30m cliff?"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => askTutor('custom_query', customQuestion.trim())}
            disabled={!customQuestion.trim() || loading}
            loading={loading}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Ask</span>
          </Button>
        </div>
      </div>

      {/* AI Response Panel */}
      {loading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-300">
            Consulting Gemini 2.5 Physics Engine & formulating step-by-step response...
          </p>
        </div>
      )}

      {response && (
        <div className="rounded-xl border border-indigo-500/30 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-100">AI Tutor Analysis & Derivation</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 transition"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Formatted Content */}
          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
            {response.content}
          </div>

          {/* Suggested Follow-ups */}
          {response.suggestedFollowUps && response.suggestedFollowUps.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 mb-2">
                Suggested Follow-up Inquiries:
              </h4>
              <div className="flex flex-wrap gap-2">
                {response.suggestedFollowUps.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCustomQuestion(prompt);
                      askTutor('custom_query', prompt);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-indigo-300 hover:bg-indigo-950/40 hover:border-indigo-500/40 transition"
                  >
                    {prompt} →
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
