'use client';

import React, { useState } from 'react';
import { CalculatedResults, Experiment, SimulatorParameters } from '@/types/physics';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Bookmark, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SaveExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parameters: SimulatorParameters;
  results: CalculatedResults;
  onSaved: (experiment: Experiment) => void;
}

function createUniqueExperimentId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `exp-${Math.random().toString(36).substring(2, 10)}`;
}

export function SaveExperimentModal({
  isOpen,
  onClose,
  parameters,
  results,
  onSaved,
}: SaveExperimentModalProps) {
  const [name, setName] = useState(
    `Experiment: ${parameters.initialVelocity}m/s @ ${parameters.launchAngle}°`
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setStatusMessage(null);

    const experimentData: Experiment = {
      id: createUniqueExperimentId(),
      name: name.trim(),
      motion_type: parameters.airResistanceEnabled ? 'air_resistance' : 'ideal',
      parameters,
      results,
      notes: notes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    const supabase = createClient();

    if (supabase) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          experimentData.user_id = user.id;
          const { error } = await supabase.from('experiments').insert({
            id: experimentData.id,
            user_id: user.id,
            name: experimentData.name,
            motion_type: experimentData.motion_type,
            parameters: experimentData.parameters,
            results: experimentData.results,
            notes: experimentData.notes,
          });

          if (error) {
            throw error;
          }

          setStatusMessage({
            type: 'success',
            text: 'Experiment successfully saved to Supabase cloud database!',
          });
          onSaved(experimentData);
          setTimeout(() => {
            onClose();
            setStatusMessage(null);
          }, 1200);
          setLoading(false);
          return;
        } else {
          // Supabase configured but user not signed in
          setStatusMessage({
            type: 'info',
            text: 'Saved to local session. Sign in to sync across devices.',
          });
          saveToLocalStorage(experimentData);
          onSaved(experimentData);
          setTimeout(() => {
            onClose();
            setStatusMessage(null);
          }, 1400);
          setLoading(false);
          return;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Database error';
        setStatusMessage({
          type: 'error',
          text: `Supabase save error: ${msg}. Stored locally for this session.`,
        });
        saveToLocalStorage(experimentData);
        onSaved(experimentData);
        setLoading(false);
        return;
      }
    }

    // Supabase credentials not provided
    setStatusMessage({
      type: 'info',
      text: 'Saved to lab session storage (Supabase cloud sync pending setup).',
    });
    saveToLocalStorage(experimentData);
    onSaved(experimentData);
    setTimeout(() => {
      onClose();
      setStatusMessage(null);
    }, 1300);
    setLoading(false);
  };

  const saveToLocalStorage = (exp: Experiment) => {
    try {
      const existing = JSON.parse(localStorage.getItem('saved_experiments') || '[]');
      existing.unshift(exp);
      localStorage.setItem('saved_experiments', JSON.stringify(existing));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Experiment to Laboratory"
      description="Record parameters, calculated results, and notes for reports and comparison."
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Experiment Title *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            placeholder="e.g. 45-degree optimal angle trial"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Student Notes & Observations (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            placeholder="Key observations, hypotheses, or laboratory conclusions..."
          />
        </div>

        {/* Summary snapshot */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase">
            Captured Metrics Snapshot:
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
            <div>Velocity: {parameters.initialVelocity} m/s</div>
            <div>Angle: {parameters.launchAngle}°</div>
            <div>Range: {results.range} m</div>
            <div>Max Height: {results.maxHeight} m</div>
            <div>Flight Time: {results.flightTime} s</div>
            <div>Model: {parameters.airResistanceEnabled ? 'Air Drag' : 'Ideal Vacuum'}</div>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`flex items-start space-x-2 rounded-lg p-2.5 text-xs ${
              statusMessage.type === 'success'
                ? 'border border-emerald-500/30 bg-emerald-950/30 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'border border-red-500/30 bg-red-950/30 text-red-300'
                : 'border border-cyan-500/30 bg-cyan-950/30 text-cyan-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            <Bookmark className="h-4 w-4" />
            <span>Confirm & Save</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
