export type MotionType = 'ideal' | 'air_resistance';

export interface AirResistanceParams {
  dragCoefficient: number; // Dimensionless (e.g., 0.47 for sphere)
  mass: number; // kg
  crossSectionalArea: number; // m^2
  airDensity: number; // kg/m^3 (e.g., 1.225 for air at sea level)
}

export interface SimulatorParameters {
  initialVelocity: number; // m/s (u >= 0)
  launchAngle: number; // degrees (-90 to 90)
  gravity: number; // m/s^2 (g > 0)
  initialHeight: number; // meters (h0 >= 0)
  airResistanceEnabled: boolean;
  airParams?: AirResistanceParams;
}

export interface CalculatedResults {
  flightTime: number; // seconds
  maxHeight: number; // meters from ground (y_max)
  range: number; // horizontal distance at landing (meters)
  impactVelocity: number; // m/s magnitude at landing
  impactAngle: number; // degrees relative to horizontal at landing
  timeToMaxHeight: number; // seconds
  initialVx: number; // m/s
  initialVy: number; // m/s
}

export interface TrajectoryPoint {
  t: number; // time (s)
  x: number; // horizontal distance (m)
  y: number; // vertical height (m)
  vx: number; // horizontal velocity (m/s)
  vy: number; // vertical velocity (m/s)
  speed: number; // velocity magnitude (m/s)
}

export interface SimulationState {
  status: 'idle' | 'running' | 'paused' | 'completed';
  currentTime: number;
  currentX: number;
  currentY: number;
  currentVx: number;
  currentVy: number;
  currentSpeed: number;
}

export interface Experiment {
  id: string;
  user_id?: string;
  name: string;
  motion_type: MotionType;
  parameters: SimulatorParameters;
  results: CalculatedResults;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface PresetExperiment {
  id: string;
  name: string;
  description: string;
  parameters: SimulatorParameters;
}
