import { PresetExperiment } from '@/types/physics';
import { DEFAULT_AIR_PARAMS } from './calculator';

export const PHYSICS_PRESETS: PresetExperiment[] = [
  {
    id: 'standard-cannon',
    name: 'Classic 45° Projectile (Earth)',
    description: 'Standard 45-degree launch at 25 m/s on Earth for theoretical maximum horizontal range.',
    parameters: {
      initialVelocity: 25,
      launchAngle: 45,
      gravity: 9.81,
      initialHeight: 0,
      airResistanceEnabled: false,
    },
  },
  {
    id: 'cliff-launch',
    name: 'Elevated Cliff Launch',
    description: 'Launch from a 35m sea cliff at 30° angle and 20 m/s, demonstrating non-zero initial height dynamics.',
    parameters: {
      initialVelocity: 20,
      launchAngle: 30,
      gravity: 9.81,
      initialHeight: 35,
      airResistanceEnabled: false,
    },
  },
  {
    id: 'horizontal-cliff',
    name: 'Horizontal Projectile (0°)',
    description: 'Pure horizontal launch from a 50m building at 30 m/s, showing independence of horizontal and vertical motion.',
    parameters: {
      initialVelocity: 30,
      launchAngle: 0,
      gravity: 9.81,
      initialHeight: 50,
      airResistanceEnabled: false,
    },
  },
  {
    id: 'vertical-ascent',
    name: 'Vertical Launch (90°)',
    description: 'Vertical rocket flight at 35 m/s, reaching maximum possible peak altitude with zero horizontal displacement.',
    parameters: {
      initialVelocity: 35,
      launchAngle: 90,
      gravity: 9.81,
      initialHeight: 0,
      airResistanceEnabled: false,
    },
  },
  {
    id: 'lunar-trajectory',
    name: 'Moon Gravity (1.62 m/s²)',
    description: 'Experimenting with lunar gravity where flight times and ranges are drastically magnified.',
    parameters: {
      initialVelocity: 20,
      launchAngle: 45,
      gravity: 1.62,
      initialHeight: 0,
      airResistanceEnabled: false,
    },
  },
  {
    id: 'mars-trajectory',
    name: 'Mars Surface (3.72 m/s²)',
    description: 'Trajectory simulation on Mars with 0.38 Earth gravity.',
    parameters: {
      initialVelocity: 22,
      launchAngle: 45,
      gravity: 3.72,
      initialHeight: 0,
      airResistanceEnabled: false,
    },
  },
  {
    id: 'air-drag-sphere',
    name: 'Quadratic Air Drag (Sphere)',
    description: 'Realistic atmosphere drag with standard spherical drag coefficient Cd=0.47 and sea level air density.',
    parameters: {
      initialVelocity: 40,
      launchAngle: 50,
      gravity: 9.81,
      initialHeight: 0,
      airResistanceEnabled: true,
      airParams: DEFAULT_AIR_PARAMS,
    },
  },
];
