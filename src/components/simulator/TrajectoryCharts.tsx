'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrajectoryPoint } from '@/types/physics';
import { Activity, Compass, Gauge } from 'lucide-react';

interface TrajectoryChartsProps {
  points: TrajectoryPoint[];
}

export function TrajectoryCharts({ points }: TrajectoryChartsProps) {
  const [activeTab, setActiveTab] = useState<'trajectory' | 'position' | 'velocity'>('trajectory');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-2.5 text-xs shadow-xl backdrop-blur-md">
          <p className="font-mono font-semibold text-slate-300 border-b border-slate-800 pb-1 mb-1.5">
            {activeTab === 'trajectory' ? `Horizontal Dist: ${label} m` : `Time: ${label} s`}
          </p>
          <div className="space-y-1">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {payload.map((entry: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-mono font-medium text-slate-100">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          Kinematic Motion Graphs
        </h4>

        <div className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
          <button
            onClick={() => setActiveTab('trajectory')}
            className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              activeTab === 'trajectory'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Trajectory (y vs x)</span>
          </button>

          <button
            onClick={() => setActiveTab('position')}
            className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              activeTab === 'position'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Position vs Time</span>
          </button>

          <button
            onClick={() => setActiveTab('velocity')}
            className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              activeTab === 'velocity'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="h-3.5 w-3.5" />
            <span>Velocity vs Time</span>
          </button>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'trajectory' ? (
            <LineChart data={points} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="x"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit=" m"
                label={{ value: 'Horizontal Distance x (m)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit=" m"
                label={{ value: 'Height y (m)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip content={customTooltip} />
              <Line
                type="monotone"
                dataKey="y"
                name="Height y"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#22d3ee' }}
              />
            </LineChart>
          ) : activeTab === 'position' ? (
            <LineChart data={points} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="t"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit=" s"
                label={{ value: 'Time t (s)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit=" m"
                label={{ value: 'Displacement (m)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip content={customTooltip} />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Line
                type="monotone"
                dataKey="x"
                name="Horizontal x(t)"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="y"
                name="Vertical y(t)"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          ) : (
            <LineChart data={points} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="t"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit=" s"
                label={{ value: 'Time t (s)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit=" m/s"
                label={{ value: 'Velocity (m/s)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip content={customTooltip} />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Line
                type="monotone"
                dataKey="vx"
                name="vx(t) Horizontal"
                stroke="#818cf8"
                strokeWidth={1.8}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="vy"
                name="vy(t) Vertical"
                stroke="#f59e0b"
                strokeWidth={1.8}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="speed"
                name="|v(t)| Speed"
                stroke="#10b981"
                strokeWidth={2.2}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
