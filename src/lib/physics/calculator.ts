import {
  AirResistanceParams,
  CalculatedResults,
  SimulatorParameters,
  TrajectoryPoint,
} from '@/types/physics';

export const DEFAULT_AIR_PARAMS: AirResistanceParams = {
  dragCoefficient: 0.47, // Spherical projectile
  mass: 0.5, // 0.5 kg
  crossSectionalArea: 0.00785, // Radius 5 cm => pi * r^2 ~ 0.00785 m^2
  airDensity: 1.225, // kg/m^3 standard sea level air density at 15°C
};

export const DEFAULT_PARAMETERS: SimulatorParameters = {
  initialVelocity: 25, // 25 m/s
  launchAngle: 45, // 45 degrees
  gravity: 9.81, // Earth gravity
  initialHeight: 0, // Ground level
  airResistanceEnabled: false,
  airParams: DEFAULT_AIR_PARAMS,
};

/**
 * Validates and normalizes parameters, clamping or throwing on invalid inputs.
 */
export function validateParameters(params: SimulatorParameters): SimulatorParameters {
  const gravity = Math.max(0.01, Number(params.gravity) || 9.81);
  const initialVelocity = Math.max(0, Number(params.initialVelocity) || 0);
  const initialHeight = Math.max(0, Number(params.initialHeight) || 0);
  // launch angle clamped between -90 and 90 degrees
  const launchAngle = Math.min(90, Math.max(-90, Number(params.launchAngle) || 0));

  let airParams = params.airParams;
  if (params.airResistanceEnabled) {
    airParams = {
      dragCoefficient: Math.max(0.01, params.airParams?.dragCoefficient ?? DEFAULT_AIR_PARAMS.dragCoefficient),
      mass: Math.max(0.001, params.airParams?.mass ?? DEFAULT_AIR_PARAMS.mass),
      crossSectionalArea: Math.max(0.0001, params.airParams?.crossSectionalArea ?? DEFAULT_AIR_PARAMS.crossSectionalArea),
      airDensity: Math.max(0, params.airParams?.airDensity ?? DEFAULT_AIR_PARAMS.airDensity),
    };
  }

  return {
    initialVelocity,
    launchAngle,
    gravity,
    initialHeight,
    airResistanceEnabled: !!params.airResistanceEnabled,
    airParams,
  };
}

/**
 * Calculate deterministic results for ideal projectile motion (vacuum).
 */
export function calculateIdealResults(params: SimulatorParameters): CalculatedResults {
  const p = validateParameters(params);
  const u = p.initialVelocity;
  const angleRad = (p.launchAngle * Math.PI) / 180;
  const g = p.gravity;
  const h0 = p.initialHeight;

  const vx0 = u * Math.cos(angleRad);
  const vy0 = u * Math.sin(angleRad);

  // If initial velocity is 0 and initial height is 0
  if (u === 0 && h0 === 0) {
    return {
      flightTime: 0,
      maxHeight: 0,
      range: 0,
      impactVelocity: 0,
      impactAngle: 0,
      timeToMaxHeight: 0,
      initialVx: 0,
      initialVy: 0,
    };
  }

  // Flight time calculation:
  // -0.5 * g * t^2 + vy0 * t + h0 = 0
  // t = (vy0 + sqrt(vy0^2 + 2 * g * h0)) / g
  const discriminant = vy0 * vy0 + 2 * g * h0;
  const flightTime = (vy0 + Math.sqrt(Math.max(0, discriminant))) / g;

  // Maximum height above ground:
  // If vy0 > 0, peak is reached at t_peak = vy0 / g
  // H_max = h0 + (vy0^2) / (2 * g)
  // If vy0 <= 0 (horizontal or downward launch), the projectile is highest at launch
  const timeToMaxHeight = vy0 > 0 ? vy0 / g : 0;
  const maxHeight = vy0 > 0 ? h0 + (vy0 * vy0) / (2 * g) : h0;

  // Horizontal range at landing:
  const range = Math.max(0, vx0 * flightTime);

  // Velocity at impact:
  const vyFinal = vy0 - g * flightTime;
  const impactVelocity = Math.sqrt(vx0 * vx0 + vyFinal * vyFinal);
  const impactAngle = Math.abs(Math.atan2(Math.abs(vyFinal), Math.abs(vx0)) * (180 / Math.PI));

  return {
    flightTime: Number(flightTime.toFixed(4)),
    maxHeight: Number(maxHeight.toFixed(4)),
    range: Number(range.toFixed(4)),
    impactVelocity: Number(impactVelocity.toFixed(4)),
    impactAngle: Number(impactAngle.toFixed(2)),
    timeToMaxHeight: Number(timeToMaxHeight.toFixed(4)),
    initialVx: Number(vx0.toFixed(4)),
    initialVy: Number(vy0.toFixed(4)),
  };
}

/**
 * Runge-Kutta 4th Order (RK4) numerical integrator for projectile motion with quadratic air resistance.
 * Drag Force F_d = 0.5 * rho * C_d * A * v^2
 * a_x = -k * v * vx
 * a_y = -g - k * v * vy
 * where k = (rho * C_d * A) / (2 * m)
 */
export function calculateAirResistanceResults(params: SimulatorParameters): {
  results: CalculatedResults;
  points: TrajectoryPoint[];
} {
  const p = validateParameters(params);
  const u = p.initialVelocity;
  const angleRad = (p.launchAngle * Math.PI) / 180;
  const g = p.gravity;
  const h0 = p.initialHeight;

  const vx0 = u * Math.cos(angleRad);
  const vy0 = u * Math.sin(angleRad);

  if (u === 0 && h0 === 0) {
    const emptyResults: CalculatedResults = {
      flightTime: 0,
      maxHeight: 0,
      range: 0,
      impactVelocity: 0,
      impactAngle: 0,
      timeToMaxHeight: 0,
      initialVx: 0,
      initialVy: 0,
    };
    return {
      results: emptyResults,
      points: [{ t: 0, x: 0, y: 0, vx: 0, vy: 0, speed: 0 }],
    };
  }

  const air = p.airParams || DEFAULT_AIR_PARAMS;
  const k = (air.airDensity * air.dragCoefficient * air.crossSectionalArea) / (2 * air.mass);

  const accel = (vx: number, vy: number): [number, number] => {
    const speed = Math.sqrt(vx * vx + vy * vy);
    const ax = -k * speed * vx;
    const ay = -g - k * speed * vy;
    return [ax, ay];
  };

  const dt = 0.005; // 5ms step for high precision
  let t = 0;
  let x = 0;
  let y = h0;
  let vx = vx0;
  let vy = vy0;

  let maxHeight = h0;
  let timeToMaxHeight = 0;

  const points: TrajectoryPoint[] = [
    { t: 0, x: 0, y: h0, vx, vy, speed: Math.sqrt(vx * vx + vy * vy) },
  ];

  let prevT = 0;
  let prevX = 0;
  let prevY = h0;
  let prevVx = vx;
  let prevVy = vy;

  const maxSteps = 200000; // Safeguard against infinite loops (up to 1000s)
  let steps = 0;

  while (y >= 0 && steps < maxSteps) {
    steps++;
    prevT = t;
    prevX = x;
    prevY = y;
    prevVx = vx;
    prevVy = vy;

    // RK4 integration
    // k1
    const [ax1, ay1] = accel(vx, vy);
    const k1_vx = ax1 * dt;
    const k1_vy = ay1 * dt;
    const k1_x = vx * dt;
    const k1_y = vy * dt;

    // k2
    const [ax2, ay2] = accel(vx + 0.5 * k1_vx, vy + 0.5 * k1_vy);
    const k2_vx = ax2 * dt;
    const k2_vy = ay2 * dt;
    const k2_x = (vx + 0.5 * k1_vx) * dt;
    const k2_y = (vy + 0.5 * k1_vy) * dt;

    // k3
    const [ax3, ay3] = accel(vx + 0.5 * k2_vx, vy + 0.5 * k2_vy);
    const k3_vx = ax3 * dt;
    const k3_vy = ay3 * dt;
    const k3_x = (vx + 0.5 * k2_vx) * dt;
    const k3_y = (vy + 0.5 * k2_vy) * dt;

    // k4
    const [ax4, ay4] = accel(vx + k3_vx, vy + k3_vy);
    const k4_vx = ax4 * dt;
    const k4_vy = ay4 * dt;
    const k4_x = (vx + k3_vx) * dt;
    const k4_y = (vy + k3_vy) * dt;

    x += (k1_x + 2 * k2_x + 2 * k3_x + k4_x) / 6;
    y += (k1_y + 2 * k2_y + 2 * k3_y + k4_y) / 6;
    vx += (k1_vx + 2 * k2_vx + 2 * k3_vx + k4_vx) / 6;
    vy += (k1_vy + 2 * k2_vy + 2 * k3_vy + k4_vy) / 6;
    t += dt;

    if (y > maxHeight) {
      maxHeight = y;
      timeToMaxHeight = t;
    }

    // Keep points recorded every ~0.02s to keep memory light and chart responsive
    if (steps % 4 === 0 && y >= 0) {
      points.push({
        t: Number(t.toFixed(4)),
        x: Number(x.toFixed(4)),
        y: Number(y.toFixed(4)),
        vx: Number(vx.toFixed(4)),
        vy: Number(vy.toFixed(4)),
        speed: Number(Math.sqrt(vx * vx + vy * vy).toFixed(4)),
      });
    }
  }

  // Linear interpolation for exact landing moment when y crosses 0
  let flightTime = t;
  let range = x;
  let finalVx = vx;
  let finalVy = vy;

  if (y < 0 && prevY > 0) {
    const fraction = prevY / (prevY - y);
    flightTime = prevT + fraction * (t - prevT);
    range = prevX + fraction * (x - prevX);
    finalVx = prevVx + fraction * (vx - prevVx);
    finalVy = prevVy + fraction * (vy - prevVy);
  }

  const impactVelocity = Math.sqrt(finalVx * finalVx + finalVy * finalVy);
  const impactAngle = Math.abs(Math.atan2(Math.abs(finalVy), Math.abs(finalVx)) * (180 / Math.PI));

  // Add the exact final landing point
  points.push({
    t: Number(flightTime.toFixed(4)),
    x: Number(range.toFixed(4)),
    y: 0,
    vx: Number(finalVx.toFixed(4)),
    vy: Number(finalVy.toFixed(4)),
    speed: Number(impactVelocity.toFixed(4)),
  });

  const results: CalculatedResults = {
    flightTime: Number(flightTime.toFixed(4)),
    maxHeight: Number(maxHeight.toFixed(4)),
    range: Number(range.toFixed(4)),
    impactVelocity: Number(impactVelocity.toFixed(4)),
    impactAngle: Number(impactAngle.toFixed(2)),
    timeToMaxHeight: Number(timeToMaxHeight.toFixed(4)),
    initialVx: Number(vx0.toFixed(4)),
    initialVy: Number(vy0.toFixed(4)),
  };

  return { results, points };
}

/**
 * Unified calculation function: dispatches between ideal and air resistance models.
 */
export function calculatePhysics(params: SimulatorParameters): CalculatedResults {
  if (params.airResistanceEnabled) {
    return calculateAirResistanceResults(params).results;
  }
  return calculateIdealResults(params);
}

/**
 * Generate sampled trajectory curve points for Recharts and Canvas rendering.
 */
export function generateTrajectoryPoints(
  params: SimulatorParameters,
  numSamples: number = 100
): TrajectoryPoint[] {
  if (params.airResistanceEnabled) {
    const { points } = calculateAirResistanceResults(params);
    if (points.length <= numSamples) return points;
    // Downsample points smoothly while retaining first and last
    const sampled: TrajectoryPoint[] = [];
    const step = (points.length - 1) / (numSamples - 1);
    for (let i = 0; i < numSamples; i++) {
      const idx = Math.min(points.length - 1, Math.round(i * step));
      sampled.push(points[idx]);
    }
    return sampled;
  }

  const results = calculateIdealResults(params);
  const { flightTime, initialVx, initialVy } = results;
  const p = validateParameters(params);
  const g = p.gravity;
  const h0 = p.initialHeight;

  if (flightTime === 0) {
    return [{ t: 0, x: 0, y: h0, vx: 0, vy: 0, speed: 0 }];
  }

  const points: TrajectoryPoint[] = [];
  for (let i = 0; i < numSamples; i++) {
    const t = (i / (numSamples - 1)) * flightTime;
    const x = initialVx * t;
    const y = Math.max(0, h0 + initialVy * t - 0.5 * g * t * t);
    const vx = initialVx;
    const vy = initialVy - g * t;
    const speed = Math.sqrt(vx * vx + vy * vy);

    points.push({
      t: Number(t.toFixed(4)),
      x: Number(x.toFixed(4)),
      y: Number(y.toFixed(4)),
      vx: Number(vx.toFixed(4)),
      vy: Number(vy.toFixed(4)),
      speed: Number(speed.toFixed(4)),
    });
  }

  return points;
}

/**
 * Get the exact state of projectile at any time t >= 0.
 */
export function getProjectileStateAtTime(
  params: SimulatorParameters,
  t: number
): { x: number; y: number; vx: number; vy: number; speed: number; landed: boolean } {
  const p = validateParameters(params);
  const results = calculatePhysics(params);

  if (t >= results.flightTime) {
    return {
      x: results.range,
      y: 0,
      vx: 0,
      vy: 0,
      speed: 0,
      landed: true,
    };
  }

  if (!p.airResistanceEnabled) {
    const vx = p.initialVelocity * Math.cos((p.launchAngle * Math.PI) / 180);
    const vy0 = p.initialVelocity * Math.sin((p.launchAngle * Math.PI) / 180);
    const x = vx * t;
    const y = Math.max(0, p.initialHeight + vy0 * t - 0.5 * p.gravity * t * t);
    const vy = vy0 - p.gravity * t;
    const speed = Math.sqrt(vx * vx + vy * vy);
    return { x, y, vx, vy, speed, landed: false };
  }

  // For air resistance, interpolate from generated points
  const points = generateTrajectoryPoints(params, 200);
  for (let i = 0; i < points.length - 1; i++) {
    if (t >= points[i].t && t <= points[i + 1].t) {
      const dt = points[i + 1].t - points[i].t;
      const frac = dt > 0 ? (t - points[i].t) / dt : 0;
      const x = points[i].x + frac * (points[i + 1].x - points[i].x);
      const y = Math.max(0, points[i].y + frac * (points[i + 1].y - points[i].y));
      const vx = points[i].vx + frac * (points[i + 1].vx - points[i].vx);
      const vy = points[i].vy + frac * (points[i + 1].vy - points[i].vy);
      return { x, y, vx, vy, speed: Math.sqrt(vx * vx + vy * vy), landed: false };
    }
  }

  return {
    x: results.range,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    landed: true,
  };
}
