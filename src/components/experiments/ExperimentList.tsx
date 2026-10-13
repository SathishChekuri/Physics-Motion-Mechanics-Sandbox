'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Experiment } from '@/types/physics';
import { SAMPLE_EXPERIMENTS } from '@/lib/experiments/sample-data';
import { createClient } from '@/lib/supabase/client';
import { exportExperimentsToCsv, generateExportFilename, triggerCsvDownload } from '@/lib/export/csv';
import { ExperimentComparison } from './ExperimentComparison';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  GitCompare,
  Download,
  PlusCircle,
  AlertTriangle,
  Calendar,
  Compass,
  ArrowUpDown,
} from 'lucide-react';
import Link from 'next/link';

export function ExperimentList() {
  const [experiments, setExperiments] = useState<Experiment[]>(SAMPLE_EXPERIMENTS);
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [motionFilter, setMotionFilter] = useState<'all' | 'ideal' | 'air_resistance'>('all');
  const [sortField, setSortField] = useState<'created_at' | 'range' | 'velocity'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Multi-selection for comparison
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // Modals
  const [detailExp, setDetailExp] = useState<Experiment | null>(null);
  const [editExp, setEditExp] = useState<Experiment | null>(null);
  const [deleteExp, setDeleteExp] = useState<Experiment | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadData() {
      const supabase = createClient();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('experiments')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0 && active) {
            setExperiments(data as Experiment[]);
            return;
          }
        } catch (err) {
          console.warn('Supabase fetch failed:', err);
        }
      }

      if (typeof window !== 'undefined') {
        try {
          const local = localStorage.getItem('saved_experiments');
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0 && active) {
              setExperiments(parsed);
              return;
            }
          }
        } catch {}
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const filteredExperiments = useMemo(() => {
    return experiments
      .filter((exp) => {
        const matchesQuery =
          exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter =
          motionFilter === 'all' || exp.motion_type === motionFilter;
        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;
        if (sortField === 'created_at') {
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
        } else if (sortField === 'range') {
          valA = a.results.range;
          valB = b.results.range;
        } else if (sortField === 'velocity') {
          valA = a.parameters.initialVelocity;
          valB = b.parameters.initialVelocity;
        }
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      });
  }, [experiments, searchQuery, motionFilter, sortField, sortOrder]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredExperiments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredExperiments.map((e) => e.id));
    }
  };

  // Open edit modal
  const openEdit = (exp: Experiment) => {
    setEditExp(exp);
    setEditName(exp.name);
    setEditNotes(exp.notes || '');
  };

  // Save edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExp) return;

    setActionLoading(true);
    const updated: Experiment = {
      ...editExp,
      name: editName.trim(),
      notes: editNotes.trim() || undefined,
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase
          .from('experiments')
          .update({
            name: updated.name,
            notes: updated.notes,
            updated_at: updated.updated_at,
          })
          .eq('id', updated.id);
      } catch (err) {
        console.warn('Supabase update failed:', err);
      }
    }

    // Update in local state & localStorage
    const nextList = experiments.map((item) => (item.id === updated.id ? updated : item));
    setExperiments(nextList);
    try {
      localStorage.setItem('saved_experiments', JSON.stringify(nextList));
    } catch {}

    setActionLoading(false);
    setEditExp(null);
  };

  // Delete experiment
  const handleDelete = async () => {
    if (!deleteExp) return;

    setActionLoading(true);
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from('experiments').delete().eq('id', deleteExp.id);
      } catch (err) {
        console.warn('Supabase delete failed:', err);
      }
    }

    const nextList = experiments.filter((item) => item.id !== deleteExp.id);
    setExperiments(nextList);
    setSelectedIds((prev) => prev.filter((id) => id !== deleteExp.id));
    try {
      localStorage.setItem('saved_experiments', JSON.stringify(nextList));
    } catch {}

    setActionLoading(false);
    setDeleteExp(null);
  };

  // Export to CSV
  const handleExportCsv = (targetExperiments?: Experiment[]) => {
    const listToExport = targetExperiments || (selectedIds.length > 0
      ? experiments.filter((e) => selectedIds.includes(e.id))
      : filteredExperiments);

    if (listToExport.length === 0) return;
    const csv = exportExperimentsToCsv(listToExport);
    const filename = generateExportFilename(
      listToExport.length === 1 ? listToExport[0].name : 'experiments_export'
    );
    triggerCsvDownload(csv, filename);
  };

  const selectedExperiments = experiments.filter((e) => selectedIds.includes(e.id));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Experiment History & Repository
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, compare, edit, and export laboratory trials with deterministic metrics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportCsv()}
            disabled={filteredExperiments.length === 0}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>

          {selectedIds.length >= 2 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsComparing(true)}
              className="bg-indigo-600 hover:bg-indigo-500"
            >
              <GitCompare className="h-3.5 w-3.5" />
              <span>Compare Selected ({selectedIds.length})</span>
            </Button>
          )}

          <Link href="/simulator">
            <Button variant="accent" size="sm">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>New Experiment</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Comparison View if toggled */}
      {isComparing && (
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
          <ExperimentComparison
            experiments={selectedExperiments}
            onClose={() => setIsComparing(false)}
          />
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search experiments by name or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Motion Type Filter */}
        <div className="flex items-center space-x-1.5">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={motionFilter}
            onChange={(e) => setMotionFilter(e.target.value as 'all' | 'ideal' | 'air_resistance')}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Motion Models</option>
            <option value="ideal">Ideal Vacuum (No Drag)</option>
            <option value="air_resistance">Air Resistance (Quadratic Drag)</option>
          </select>
        </div>

        {/* Sort Field */}
        <div className="flex items-center space-x-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={sortField}
            onChange={(e) =>
              setSortField(e.target.value as 'created_at' | 'range' | 'velocity')
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="created_at">Sort by Date</option>
            <option value="range">Sort by Range</option>
            <option value="velocity">Sort by Launch Velocity</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition w-full text-center"
          >
            {sortOrder === 'desc' ? 'Descending (High to Low)' : 'Ascending (Low to High)'}
          </button>
        </div>
      </div>

      {/* Select All Checkbox bar */}
      {filteredExperiments.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={
                selectedIds.length > 0 &&
                selectedIds.length === filteredExperiments.length
              }
              onChange={handleSelectAll}
              className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
            />
            <span>
              Select All ({selectedIds.length} of {filteredExperiments.length} selected)
            </span>
          </label>

          {selectedIds.length > 0 && (
            <span className="text-[11px] text-cyan-400 font-medium">
              Tip: Select 2+ experiments to view superimposed trajectories
            </span>
          )}
        </div>
      )}

      {/* Experiment List Cards / Table */}
      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent mx-auto mb-3" />
          <p className="text-xs">Loading laboratory experiments...</p>
        </div>
      ) : filteredExperiments.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
          <Compass className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-300 mb-1">No experiments found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No saved experiments matched your search or filter criteria. Run a simulation to save your first experiment.
          </p>
          <Link href="/simulator">
            <Button variant="primary" size="sm">
              Launch Simulator
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredExperiments.map((exp) => {
            const isSelected = selectedIds.includes(exp.id);
            const p = exp.parameters;
            const r = exp.results;

            return (
              <div
                key={exp.id}
                className={`rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'border-cyan-500/50 bg-slate-900 shadow-md shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(exp.id)}
                      className="mt-1 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-semibold text-slate-100">{exp.name}</h3>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${
                            exp.motion_type === 'air_resistance'
                              ? 'border-amber-500/30 bg-amber-950/20 text-amber-400'
                              : 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400'
                          }`}
                        >
                          {exp.motion_type === 'air_resistance' ? 'Quadratic Drag' : 'Ideal Vacuum'}
                        </span>
                      </div>

                      {exp.notes && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 italic">
                          &ldquo;{exp.notes}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(exp.created_at).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>g = {p.gravity} m/s²</span>
                        <span>•</span>
                        <span>h₀ = {p.initialHeight} m</span>
                      </div>
                    </div>
                  </div>

                  {/* Calculated metrics badges */}
                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-cyan-300">
                        {r.range} <span className="text-[10px] text-slate-400">m</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Range</div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-indigo-300">
                        {r.maxHeight} <span className="text-[10px] text-slate-400">m</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Peak</div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-emerald-300">
                        {r.flightTime} <span className="text-[10px] text-slate-400">s</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Time</div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
                      <button
                        onClick={() => setDetailExp(exp)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition"
                        title="View Full Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => openEdit(exp)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                        title="Edit Name & Notes"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setDeleteExp(exp)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
                        title="Delete Experiment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {detailExp && (
        <Modal
          isOpen={!!detailExp}
          onClose={() => setDetailExp(null)}
          title={detailExp.name}
          description={`Recorded on ${new Date(detailExp.created_at).toLocaleString()}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {detailExp.notes && (
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-slate-300">
                <span className="font-semibold text-slate-400 block mb-1">Notes:</span>
                {detailExp.notes}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <h4 className="font-semibold text-slate-300 border-b border-slate-800 pb-1">
                  Input Parameters
                </h4>
                <div className="grid grid-cols-2 gap-1 text-slate-400 font-mono">
                  <div>Initial Velocity:</div>
                  <div className="text-cyan-300">{detailExp.parameters.initialVelocity} m/s</div>
                  <div>Launch Angle:</div>
                  <div className="text-cyan-300">{detailExp.parameters.launchAngle}°</div>
                  <div>Gravity:</div>
                  <div className="text-slate-300">{detailExp.parameters.gravity} m/s²</div>
                  <div>Initial Height:</div>
                  <div className="text-slate-300">{detailExp.parameters.initialHeight} m</div>
                  <div>Motion Model:</div>
                  <div className="text-slate-300">{detailExp.motion_type}</div>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <h4 className="font-semibold text-slate-300 border-b border-slate-800 pb-1">
                  Calculated Results
                </h4>
                <div className="grid grid-cols-2 gap-1 text-slate-400 font-mono">
                  <div>Horizontal Range:</div>
                  <div className="text-cyan-300">{detailExp.results.range} m</div>
                  <div>Maximum Height:</div>
                  <div className="text-indigo-300">{detailExp.results.maxHeight} m</div>
                  <div>Total Flight Time:</div>
                  <div className="text-emerald-300">{detailExp.results.flightTime} s</div>
                  <div>Impact Velocity:</div>
                  <div className="text-amber-300">{detailExp.results.impactVelocity} m/s</div>
                  <div>Impact Angle:</div>
                  <div className="text-amber-300">{detailExp.results.impactAngle}°</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCsv([detailExp])}
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </Button>
              <Link href={`/reports?id=${detailExp.id}`}>
                <Button variant="primary" size="sm">
                  View Full Report
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editExp && (
        <Modal
          isOpen={!!editExp}
          onClose={() => setEditExp(null)}
          title="Edit Experiment Details"
          description="Update experiment title and student notes"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Experiment Title
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Notes & Hypotheses
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditExp(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={actionLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteExp && (
        <Modal
          isOpen={!!deleteExp}
          onClose={() => setDeleteExp(null)}
          title="Confirm Deletion"
          description="Are you sure you want to permanently delete this experiment?"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3 rounded-lg border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-300">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
              <div>
                <span className="font-semibold block mb-0.5">Permanent Action:</span>
                Deleting &ldquo;{deleteExp.name}&rdquo; will remove its parameters, trajectory history, and notes.
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteExp(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                loading={actionLoading}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
