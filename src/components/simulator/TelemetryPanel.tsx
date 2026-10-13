'use client';

import React from 'react';
import { CalculatedResults, SimulatorParameters } from '@/types/physics';
import { Clock, ArrowRight, ArrowUp, Compass, Target } from 'lucide-react';

interface TelemetryPanelProps {
  parameters: SimulatorParameters;
  results: CalculatedResults;
  currentTime: number;
  currentX: number;
  currentY: number;
  currentVx: number;
  currentVy: number;
  currentSpeed: number;
}

export function TelemetryPanel({
  results,
  currentTime,
  currentX,
  currentY,
  currentVx,
  currentVy,
  currentSpeed,
}: TelemetryPanelProps) {
  return (
    <div className="space-y-4">
      {/* Live Telemetry Readout Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-md">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>Sim Time t</span>
          </div>
          <div className="mt-1 font-mono text-base sm:text-lg font-bold text-cyan-300">
            {currentTime.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">s</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-md">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
            <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
            <span>Position x(t)</span>
          </div>
          <div className="mt-1 font-mono text-base sm:text-lg font-bold text-indigo-300">
            {currentX.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">m</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-md">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
            <ArrowUp className="h-3.5 w-3.5 text-cyan-400" />
            <span>Height y(t)</span>
          </div>
          <div className="mt-1 font-mono text-base sm:text-lg font-bold text-cyan-300">
            {currentY.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">m</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-md">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>Speed |v(t)|</span>
          </div>
          <div className="mt-1 font-mono text-base sm:text-lg font-bold text-emerald-300">
            {currentSpeed.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">m/s</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-md">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
            <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
            <span>Vel vx(t)</span>
          </div>
          <div className="mt-1 font-mono text-base sm:text-lg font-bold text-blue-300">
            {currentVx.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">m/s</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-md">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
            <ArrowUp className="h-3.5 w-3.5 text-amber-400" />
            <span>Vel vy(t)</span>
          </div>
          <div className="mt-1 font-mono text-base sm:text-lg font-bold text-amber-300">
            {currentVy.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">m/s</span>
          </div>
        </div>
      </div>

      {/* Calculated Deterministic Final Summary */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-cyan-400" />
          Deterministic Calculated Output
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border-l-2 border-cyan-500 pl-3">
            <div className="text-[11px] text-slate-400">Horizontal Range (R)</div>
            <div className="font-mono text-lg font-bold text-cyan-300">
              {results.range}{' '}
              <span className="text-xs font-normal text-slate-400">m</span>
            </div>
            <div className="text-[10px] text-slate-400">vx₀ · t_land</div>
          </div>

          <div className="border-l-2 border-indigo-500 pl-3">
            <div className="text-[11px] text-slate-400">Max Height (H_max)</div>
            <div className="font-mono text-lg font-bold text-indigo-300">
              {results.maxHeight}{' '}
              <span className="text-xs font-normal text-slate-400">m</span>
            </div>
            <div className="text-[10px] text-slate-400">h₀ + vy₀² / (2g)</div>
          </div>

          <div className="border-l-2 border-emerald-500 pl-3">
            <div className="text-[11px] text-slate-400">Total Flight Time (T)</div>
            <div className="font-mono text-lg font-bold text-emerald-300">
              {results.flightTime}{' '}
              <span className="text-xs font-normal text-slate-400">s</span>
            </div>
            <div className="text-[10px] text-slate-400">Root of y(t) = 0</div>
          </div>

          <div className="border-l-2 border-amber-500 pl-3">
            <div className="text-[11px] text-slate-400">Impact Speed (v_land)</div>
            <div className="font-mono text-lg font-bold text-amber-300">
              {results.impactVelocity}{' '}
              <span className="text-xs font-normal text-slate-400">m/s</span>
            </div>
            <div className="text-[10px] text-slate-400">@ {results.impactAngle}° angle</div>
          </div>
        </div>
      </div>
    </div>
  );
}
