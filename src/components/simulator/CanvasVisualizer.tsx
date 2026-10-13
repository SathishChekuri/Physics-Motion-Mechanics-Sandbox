'use client';

import React, { useRef, useEffect } from 'react';
import { CalculatedResults, SimulatorParameters, TrajectoryPoint } from '@/types/physics';

interface CanvasVisualizerProps {
  parameters: SimulatorParameters;
  results: CalculatedResults;
  points: TrajectoryPoint[];
  currentTime: number;
  isPlaying: boolean;
  onScrubTime?: (time: number) => void;
}

export function CanvasVisualizer({
  parameters,
  results,
  points,
  currentTime,
}: CanvasVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Coordinate mapping
    // Physics bounds:
    const maxRange = Math.max(10, results.range * 1.15, 20);
    const maxHeight = Math.max(10, results.maxHeight * 1.25, parameters.initialHeight * 1.25, 15);

    const paddingLeft = 55;
    const paddingRight = 40;
    const paddingTop = 40;
    const paddingBottom = 45;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    // Scale factors: pixels per meter
    const scaleX = plotWidth / maxRange;
    const scaleY = plotHeight / maxHeight;
    // Choose proportional or fit-to-view
    const scale = Math.min(scaleX, scaleY);

    const originX = paddingLeft;
    const originY = height - paddingBottom;

    const toCanvasX = (x: number) => originX + x * scale;
    const toCanvasY = (y: number) => originY - y * scale;

    // 1. Clear background
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw subtle grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1e293b';
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';

    // X-axis grid step
    const xStep = Math.max(5, Math.pow(10, Math.floor(Math.log10(maxRange))) / 2);
    for (let x = 0; x <= maxRange; x += xStep) {
      const cx = toCanvasX(x);
      if (cx <= width - paddingRight) {
        ctx.beginPath();
        ctx.moveTo(cx, paddingTop);
        ctx.lineTo(cx, originY);
        ctx.stroke();
        ctx.fillText(`${Math.round(x)}m`, cx - 8, originY + 16);
      }
    }

    // Y-axis grid step
    const yStep = Math.max(5, Math.pow(10, Math.floor(Math.log10(maxHeight))) / 2);
    for (let y = 0; y <= maxHeight; y += yStep) {
      const cy = toCanvasY(y);
      if (cy >= paddingTop) {
        ctx.beginPath();
        ctx.moveTo(originX, cy);
        ctx.lineTo(originX + plotWidth, cy);
        ctx.stroke();
        ctx.fillText(`${Math.round(y)}m`, 14, cy + 3);
      }
    }

    // 3. Draw Ground Line & Ground Texture
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX - 10, originY);
    ctx.lineTo(width - paddingRight + 15, originY);
    ctx.stroke();

    // Grass/ground hatch
    ctx.fillStyle = '#10b98122';
    ctx.fillRect(originX - 10, originY, width - paddingRight + 25 - originX, 6);

    // 4. Draw Launch Platform / Cliff if initialHeight > 0
    if (parameters.initialHeight > 0) {
      const cliffX = originX;
      const cliffY = toCanvasY(parameters.initialHeight);
      const cliffW = 24;

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.fillRect(cliffX - cliffW, cliffY, cliffW, originY - cliffY);
      ctx.strokeRect(cliffX - cliffW, cliffY, cliffW, originY - cliffY);

      // Height indicator line
      ctx.strokeStyle = '#f59e0b88';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cliffX - cliffW - 8, originY);
      ctx.lineTo(cliffX - cliffW - 8, cliffY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`h₀=${parameters.initialHeight}m`, 12, (originY + cliffY) / 2);
    }

    // 5. Draw Full Trajectory Path (Dotted or Faint Arc)
    if (points.length > 1) {
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#0284c755';
      ctx.lineWidth = 2;
      points.forEach((pt, idx) => {
        const cx = toCanvasX(pt.x);
        const cy = toCanvasY(pt.y);
        if (idx === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 6. Calculate Current Position at currentTime
    let currentX = 0;
    let currentY = parameters.initialHeight;
    let currentVx = results.initialVx;
    let currentVy = results.initialVy;

    if (currentTime >= results.flightTime && results.flightTime > 0) {
      currentX = results.range;
      currentY = 0;
      currentVx = 0;
      currentVy = 0;
    } else if (currentTime > 0) {
      // Find point or interpolate
      for (let i = 0; i < points.length - 1; i++) {
        if (currentTime >= points[i].t && currentTime <= points[i + 1].t) {
          const dt = points[i + 1].t - points[i].t;
          const frac = dt > 0 ? (currentTime - points[i].t) / dt : 0;
          currentX = points[i].x + frac * (points[i + 1].x - points[i].x);
          currentY = Math.max(0, points[i].y + frac * (points[i + 1].y - points[i].y));
          currentVx = points[i].vx + frac * (points[i + 1].vx - points[i].vx);
          currentVy = points[i].vy + frac * (points[i + 1].vy - points[i].vy);
          break;
        }
      }
    }

    // 7. Draw Traveled Path up to current time (Solid glowing arc)
    ctx.beginPath();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;

    let hasDrawn = false;
    for (let i = 0; i < points.length; i++) {
      if (points[i].t <= currentTime) {
        const cx = toCanvasX(points[i].x);
        const cy = toCanvasY(points[i].y);
        if (!hasDrawn) {
          ctx.moveTo(cx, cy);
          hasDrawn = true;
        } else {
          ctx.lineTo(cx, cy);
        }
      } else {
        break;
      }
    }
    // Connect to current interpolated position
    if (hasDrawn) {
      ctx.lineTo(toCanvasX(currentX), toCanvasY(currentY));
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // 8. Draw Apex Marker (Peak height)
    if (results.maxHeight > parameters.initialHeight) {
      const peakX = toCanvasX(results.initialVx * results.timeToMaxHeight);
      const peakY = toCanvasY(results.maxHeight);

      ctx.fillStyle = '#818cf8';
      ctx.beginPath();
      ctx.arc(peakX, peakY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#c7d2fe';
      ctx.font = '10px monospace';
      ctx.fillText(`Apex: ${results.maxHeight}m`, peakX - 25, peakY - 8);
    }

    // 9. Draw Target Landing Marker
    if (results.range > 0) {
      const landX = toCanvasX(results.range);
      const landY = toCanvasY(0);

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(landX, landY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Flag / marker pin
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(landX, landY);
      ctx.lineTo(landX, landY - 14);
      ctx.lineTo(landX + 8, landY - 10);
      ctx.lineTo(landX, landY - 6);
      ctx.stroke();

      ctx.fillStyle = '#fca5a5';
      ctx.fillText(`R: ${results.range}m`, landX - 15, landY + 16);
    }

    // 10. Draw Velocity Vector Arrow on projectile
    const projX = toCanvasX(currentX);
    const projY = toCanvasY(currentY);

    if (currentTime < results.flightTime && (Math.abs(currentVx) > 0.1 || Math.abs(currentVy) > 0.1)) {
      const vScale = 1.2; // Vector arrow visualization scale
      const vxArrow = currentVx * vScale;
      const vyArrow = -currentVy * vScale; // Inverted Y in canvas

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(projX, projY);
      ctx.lineTo(projX + vxArrow, projY + vyArrow);
      ctx.stroke();

      // Arrow head
      const arrowAngle = Math.atan2(vyArrow, vxArrow);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(projX + vxArrow, projY + vyArrow);
      ctx.lineTo(
        projX + vxArrow - 7 * Math.cos(arrowAngle - Math.PI / 6),
        projY + vyArrow - 7 * Math.sin(arrowAngle - Math.PI / 6)
      );
      ctx.lineTo(
        projX + vxArrow - 7 * Math.cos(arrowAngle + Math.PI / 6),
        projY + vyArrow - 7 * Math.sin(arrowAngle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    }

    // 11. Draw Projectile Sphere with Glow
    ctx.save();
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(projX, projY, 7, 0, Math.PI * 2);
    ctx.fill();

    // Center highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(projX - 2, projY - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 12. Landing Impact Splash Effect
    if (currentTime >= results.flightTime && results.flightTime > 0) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      for (let angle = 0; angle < Math.PI; angle += Math.PI / 5) {
        const sx = projX + Math.cos(angle) * 12;
        const sy = projY - Math.sin(angle) * 10;
        ctx.beginPath();
        ctx.moveTo(projX, projY);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
    }
  }, [parameters, results, points, currentTime]);

  return (
    <div className="relative w-full rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-inner overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span className="rounded-md bg-slate-900/90 px-2.5 py-1 font-mono text-[11px] text-cyan-300 border border-slate-700 backdrop-blur-sm">
          2D Projectile Physics Plane
        </span>
        {parameters.airResistanceEnabled && (
          <span className="rounded-md bg-amber-950/80 px-2 py-0.5 font-mono text-[10px] text-amber-300 border border-amber-800 backdrop-blur-sm">
            Quadratic Drag Active
          </span>
        )}
      </div>

      <canvas
        ref={canvasRef}
        className="h-80 sm:h-96 w-full cursor-crosshair rounded-lg block"
      />
    </div>
  );
}
