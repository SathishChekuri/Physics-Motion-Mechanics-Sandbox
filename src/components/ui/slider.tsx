import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  symbol?: string;
  description?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function ParameterSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  symbol,
  description,
  onChange,
  disabled = false,
}: SliderProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <label className="font-medium text-slate-300 flex items-center gap-1.5">
          <span>{label}</span>
          {symbol && (
            <span className="font-mono text-[11px] text-cyan-400 font-semibold">({symbol})</span>
          )}
        </label>
        <div className="flex items-center space-x-1 font-mono">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) onChange(val);
            }}
            className="w-16 rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-right text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none"
          />
          <span className="text-[11px] text-slate-400">{unit}</span>
        </div>
      </div>

      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400 focus:outline-none disabled:opacity-50"
          style={{
            background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${percentage}%, #1e293b ${percentage}%, #1e293b 100%)`,
          }}
        />
      </div>

      {description && <p className="text-[10px] text-slate-400 leading-tight">{description}</p>}
    </div>
  );
}
