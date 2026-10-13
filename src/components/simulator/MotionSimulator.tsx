'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  SimulatorParameters,
  TrajectoryPoint,
} from '@/types/physics';
import {
  calculatePhysics,
  DEFAULT_PARAMETERS,
  generateTrajectoryPoints,
  getProjectileStateAtTime,
} from '@/lib/physics/calculator';
import { CanvasVisualizer } from './CanvasVisualizer';
import { SimulatorControls } from './SimulatorControls';
import { TelemetryPanel } from './TelemetryPanel';
import { TrajectoryCharts } from './TrajectoryCharts';
import { SaveExperimentModal } from './SaveExperimentModal';
import { Sparkles, FileText } from 'lucide-react';
import Link from 'next/link';

export function MotionSimulator() {
  const [parameters, setParameters] = useState<SimulatorParameters>(DEFAULT_PARAMETERS);

  // Derive deterministic results and trajectory points directly
  const results = useMemo(() => calculatePhysics(parameters), [parameters]);
  const points = useMemo<TrajectoryPoint[]>(
    () => generateTrajectoryPoints(parameters, 120),
    [parameters]
  );

  // Playback & animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Animation frame reference
  const lastFrameTimeRef = useRef<number | null>(null);

  const handleUpdateParameters = (newParams: SimulatorParameters) => {
    setParameters(newParams);
    setCurrentTime(0);
    setIsPlaying(false);
    lastFrameTimeRef.current = null;
  };

  // Main animation loop
  useEffect(() => {
    if (!isPlaying) {
      lastFrameTimeRef.current = null;
      return;
    }

    let frameId: number;

    const loop = (time: number) => {
      if (lastFrameTimeRef.current !== null) {
        const delta = (time - lastFrameTimeRef.current) / 1000;
        setCurrentTime((prev) => {
          const next = prev + delta * simSpeed;
          if (next >= results.flightTime && results.flightTime > 0) {
            setIsPlaying(false);
            return results.flightTime;
          }
          return next;
        });
      }
      lastFrameTimeRef.current = time;
      frameId = requestAnimationFrame(loop);
    };

    lastFrameTimeRef.current = null;
    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isPlaying, simSpeed, results.flightTime]);

  // Get live telemetry for current time
  const liveState = getProjectileStateAtTime(parameters, currentTime);

  const handlePlay = () => {
    if (currentTime >= results.flightTime && results.flightTime > 0) {
      setCurrentTime(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleReset = () => {
    handleUpdateParameters(DEFAULT_PARAMETERS);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Interactive Motion Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time deterministic Newtonian kinematic mechanics laboratory with live vectors & charts
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/tutor"
            className="flex items-center space-x-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/20 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-900/40 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask AI Tutor</span>
          </Link>
          <Link
            href="/reports"
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>View Reports</span>
          </Link>
        </div>
      </div>

      {/* Main Simulation Viewport (Canvas Visualizer) */}
      <CanvasVisualizer
        parameters={parameters}
        results={results}
        points={points}
        currentTime={currentTime}
        isPlaying={isPlaying}
      />

      {/* Telemetry Readouts and Calculated Summary */}
      <TelemetryPanel
        parameters={parameters}
        results={results}
        currentTime={currentTime}
        currentX={liveState.x}
        currentY={liveState.y}
        currentVx={liveState.vx}
        currentVy={liveState.vy}
        currentSpeed={liveState.speed}
      />

      {/* Interactive Controls & Parameters */}
      <SimulatorControls
        parameters={parameters}
        onChangeParameters={handleUpdateParameters}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        onReset={handleReset}
        onRestart={handleRestart}
        simSpeed={simSpeed}
        onChangeSpeed={setSimSpeed}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
      />

      {/* Kinematic Charts (Recharts) */}
      <TrajectoryCharts points={points} />

      {/* Save Experiment Modal */}
      <SaveExperimentModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        parameters={parameters}
        results={results}
        onSaved={(newExp) => {
          console.log('Experiment saved successfully:', newExp);
        }}
      />
    </div>
  );
}
