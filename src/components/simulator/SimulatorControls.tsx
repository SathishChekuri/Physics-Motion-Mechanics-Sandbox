'use client';

import React, { useState } from 'react';
import { SimulatorParameters } from '@/types/physics';
import { ParameterSlider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { PHYSICS_PRESETS } from '@/lib/physics/presets';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  BookmarkPlus,
  Wind,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

interface SimulatorControlsProps {
  parameters: SimulatorParameters;
  onChangeParameters: (newParams: SimulatorParameters) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onRestart: () => void;
  simSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onOpenSaveModal: () => void;
}

export function SimulatorControls({
  parameters,
  onChangeParameters,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onRestart,
  simSpeed,
  onChangeSpeed,
  onOpenSaveModal,
}: SimulatorControlsProps) {
  const [showAdvancedAir, setShowAdvancedAir] = useState(false);

  const handleUpdate = (field: keyof SimulatorParameters, value: unknown) => {
    onChangeParameters({
      ...parameters,
      [field]: value,
    });
  };

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    const found = PHYSICS_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onChangeParameters(found.parameters);
    }
  };

  const speedOptions = [0.25, 0.5, 1.0, 2.0];

  return (
    <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
      {/* Top action row: Playback & Speed & Save */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          {isPlaying ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onPause}
              className="border-amber-500/40 text-amber-300 hover:bg-amber-950/30"
            >
              <Pause className="h-4 w-4" />
              <span>Pause</span>
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={onPlay}>
              <Play className="h-4 w-4" />
              <span>Launch / Play</span>
            </Button>
          )}

          <Button variant="secondary" size="sm" onClick={onRestart} title="Restart from t=0">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restart</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={onReset} title="Reset to standard defaults">
            <span>Reset</span>
          </Button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <FastForward className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Speed:</span>
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5">
            {speedOptions.map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`rounded px-2 py-0.5 font-mono text-[11px] transition ${
                  simSpeed === spd
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Save to experiments button */}
        <Button variant="accent" size="sm" onClick={onOpenSaveModal}>
          <BookmarkPlus className="h-4 w-4" />
          <span>Save Experiment</span>
        </Button>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          Physics Lab Presets:
        </label>
        <select
          onChange={handleSelectPreset}
          defaultValue=""
          className="w-full max-w-xs rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
        >
          <option value="" disabled>
            Select a physical scenario...
          </option>
          {PHYSICS_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Parameters Sliders */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ParameterSlider
          label="Initial Velocity"
          symbol="u"
          value={parameters.initialVelocity}
          min={0}
          max={100}
          step={0.5}
          unit="m/s"
          description="Magnitude of initial launch velocity vector."
          onChange={(val) => handleUpdate('initialVelocity', val)}
        />

        <ParameterSlider
          label="Launch Angle"
          symbol="θ"
          value={parameters.launchAngle}
          min={-90}
          max={90}
          step={1}
          unit="°"
          description="Angle above horizontal (45° gives maximum theoretical vacuum range)."
          onChange={(val) => handleUpdate('launchAngle', val)}
        />

        <ParameterSlider
          label="Gravitational Acceleration"
          symbol="g"
          value={parameters.gravity}
          min={0.5}
          max={30}
          step={0.1}
          unit="m/s²"
          description="Downward acceleration (Earth: 9.81, Moon: 1.62, Mars: 3.72)."
          onChange={(val) => handleUpdate('gravity', val)}
        />

        <ParameterSlider
          label="Initial Height"
          symbol="h₀"
          value={parameters.initialHeight}
          min={0}
          max={100}
          step={1}
          unit="m"
          description="Launch elevation above ground (cliff / tower launch)."
          onChange={(val) => handleUpdate('initialHeight', val)}
        />
      </div>

      {/* Air Resistance Accordion / Toggle */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wind
              className={`h-4 w-4 ${
                parameters.airResistanceEnabled ? 'text-cyan-400' : 'text-slate-500'
              }`}
            />
            <div>
              <span className="text-xs font-semibold text-slate-200">
                Quadratic Air Resistance (Aerodynamic Drag)
              </span>
              <p className="text-[11px] text-slate-400">
                Solves Runge-Kutta RK4 differential equations with quadratic air resistance F_d = ½ρCdAv²
              </p>
            </div>
          </div>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={parameters.airResistanceEnabled}
              onChange={(e) => handleUpdate('airResistanceEnabled', e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-5 w-9 rounded-full bg-slate-800 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-slate-400 after:transition-all after:content-[''] peer-checked:bg-cyan-500 peer-checked:after:translate-x-full peer-checked:after:bg-white peer-focus:outline-none" />
          </label>
        </div>

        {parameters.airResistanceEnabled && (
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">Fluid Mechanics Parameters:</span>
              <button
                onClick={() => setShowAdvancedAir(!showAdvancedAir)}
                className="text-cyan-400 hover:underline text-[11px] flex items-center gap-1"
              >
                <SlidersHorizontal className="h-3 w-3" />
                {showAdvancedAir ? 'Collapse' : 'Customize Fluid Properties'}
              </button>
            </div>

            {showAdvancedAir && (
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <ParameterSlider
                  label="Drag Coefficient"
                  symbol="Cd"
                  value={parameters.airParams?.dragCoefficient ?? 0.47}
                  min={0.05}
                  max={1.5}
                  step={0.01}
                  unit=""
                  description="0.47 for sphere, 0.04 for streamlined airfoil."
                  onChange={(val) =>
                    onChangeParameters({
                      ...parameters,
                      airParams: {
                        ...(parameters.airParams || {
                          mass: 0.5,
                          crossSectionalArea: 0.00785,
                          airDensity: 1.225,
                        }),
                        dragCoefficient: val,
                      },
                    })
                  }
                />

                <ParameterSlider
                  label="Projectile Mass"
                  symbol="m"
                  value={parameters.airParams?.mass ?? 0.5}
                  min={0.05}
                  max={10}
                  step={0.05}
                  unit="kg"
                  description="Mass of projectile body in kilograms."
                  onChange={(val) =>
                    onChangeParameters({
                      ...parameters,
                      airParams: {
                        ...(parameters.airParams || {
                          dragCoefficient: 0.47,
                          crossSectionalArea: 0.00785,
                          airDensity: 1.225,
                        }),
                        mass: val,
                      },
                    })
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
