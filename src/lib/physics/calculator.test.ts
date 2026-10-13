import { describe, it, expect } from 'vitest';
import {
  calculateIdealResults,
  calculateAirResistanceResults,
  calculatePhysics,
  generateTrajectoryPoints,
  getProjectileStateAtTime,
  validateParameters,
} from './calculator';

describe('Physics Calculation Engine', () => {
  describe('Ideal Projectile Motion', () => {
    it('calculates ground-level launch at 45 degrees correctly', () => {
      // u = 20 m/s, theta = 45 deg, g = 9.8 m/s^2, h0 = 0
      const results = calculateIdealResults({
        initialVelocity: 20,
        launchAngle: 45,
        gravity: 9.8,
        initialHeight: 0,
        airResistanceEnabled: false,
      });

      // Range = u^2 * sin(90) / g = 400 / 9.8 = 40.8163
      expect(results.range).toBeCloseTo(40.8163, 2);

      // Max height = (u * sin(45))^2 / (2 * g) = 200 / 19.6 = 10.2041
      expect(results.maxHeight).toBeCloseTo(10.2041, 2);

      // Flight time = 2 * u * sin(45) / g = 2 * 14.1421 / 9.8 = 2.8861
      expect(results.flightTime).toBeCloseTo(2.8861, 2);

      // Time to max height = flight time / 2
      expect(results.timeToMaxHeight).toBeCloseTo(results.flightTime / 2, 2);

      // Impact velocity should equal initial velocity by conservation of energy
      expect(results.impactVelocity).toBeCloseTo(20, 2);
    });

    it('calculates horizontal launch from an elevated height', () => {
      // u = 20 m/s, theta = 0 deg, g = 10 m/s^2, h0 = 45 m
      const results = calculateIdealResults({
        initialVelocity: 20,
        launchAngle: 0,
        gravity: 10,
        initialHeight: 45,
        airResistanceEnabled: false,
      });

      // t = sqrt(2 * 45 / 10) = 3 seconds
      expect(results.flightTime).toBeCloseTo(3, 2);

      // Range = 20 * 3 = 60 m
      expect(results.range).toBeCloseTo(60, 2);

      // Max height should remain initial height (45m)
      expect(results.maxHeight).toBeCloseTo(45, 2);

      // Impact velocity = sqrt(20^2 + (10 * 3)^2) = sqrt(400 + 900) = sqrt(1300) = 36.0555
      expect(results.impactVelocity).toBeCloseTo(Math.sqrt(1300), 2);
    });

    it('handles vertical launch (90 degrees) correctly', () => {
      // u = 30 m/s, theta = 90 deg, g = 10 m/s^2, h0 = 0
      const results = calculateIdealResults({
        initialVelocity: 30,
        launchAngle: 90,
        gravity: 10,
        initialHeight: 0,
        airResistanceEnabled: false,
      });

      // Range must be zero
      expect(results.range).toBeCloseTo(0, 2);

      // Flight time = 2 * 30 / 10 = 6 s
      expect(results.flightTime).toBeCloseTo(6, 2);

      // Max height = 30^2 / 20 = 45 m
      expect(results.maxHeight).toBeCloseTo(45, 2);
      expect(results.timeToMaxHeight).toBeCloseTo(3, 2);
    });

    it('handles zero velocity drop from height', () => {
      // u = 0, theta = 0, g = 10, h0 = 20
      const results = calculateIdealResults({
        initialVelocity: 0,
        launchAngle: 0,
        gravity: 10,
        initialHeight: 20,
        airResistanceEnabled: false,
      });

      // Flight time = sqrt(2 * 20 / 10) = 2.0 s
      expect(results.flightTime).toBeCloseTo(2.0, 2);
      expect(results.range).toBe(0);
      expect(results.maxHeight).toBe(20);
    });

    it('handles zero velocity and zero height edge case', () => {
      const results = calculateIdealResults({
        initialVelocity: 0,
        launchAngle: 0,
        gravity: 9.81,
        initialHeight: 0,
        airResistanceEnabled: false,
      });

      expect(results.flightTime).toBe(0);
      expect(results.range).toBe(0);
      expect(results.maxHeight).toBe(0);
    });
  });

  describe('Air Resistance Numerical Model', () => {
    it('shows reduced range and max height compared to vacuum trajectory', () => {
      const idealParams = {
        initialVelocity: 40,
        launchAngle: 45,
        gravity: 9.81,
        initialHeight: 0,
        airResistanceEnabled: false,
      };

      const dragParams = {
        ...idealParams,
        airResistanceEnabled: true,
      };

      const idealResults = calculateIdealResults(idealParams);
      const dragResults = calculateAirResistanceResults(dragParams).results;

      // With air drag, range and max height must be strictly less than ideal
      expect(dragResults.range).toBeLessThan(idealResults.range);
      expect(dragResults.maxHeight).toBeLessThan(idealResults.maxHeight);
      expect(dragResults.impactVelocity).toBeLessThan(idealResults.impactVelocity);
    });
  });

  describe('Trajectory Point Generation', () => {
    it('generates points with correct start and end conditions', () => {
      const points = generateTrajectoryPoints({
        initialVelocity: 25,
        launchAngle: 45,
        gravity: 9.81,
        initialHeight: 10,
        airResistanceEnabled: false,
      }, 50);

      expect(points.length).toBe(50);
      // First point at t = 0, x = 0, y = 10
      expect(points[0].t).toBe(0);
      expect(points[0].x).toBe(0);
      expect(points[0].y).toBe(10);

      // Last point lands at y = 0
      const last = points[points.length - 1];
      expect(last.y).toBeCloseTo(0, 1);
      expect(last.x).toBeGreaterThan(0);
    });
  });

  describe('State Evaluation at arbitrary time', () => {
    it('correctly reports landed status after flight time', () => {
      const params = {
        initialVelocity: 20,
        launchAngle: 45,
        gravity: 10,
        initialHeight: 0,
        airResistanceEnabled: false,
      };
      const results = calculatePhysics(params);

      const midState = getProjectileStateAtTime(params, results.flightTime / 2);
      expect(midState.landed).toBe(false);
      expect(midState.y).toBeGreaterThan(0);

      const postState = getProjectileStateAtTime(params, results.flightTime + 1);
      expect(postState.landed).toBe(true);
      expect(postState.y).toBe(0);
      expect(postState.x).toBe(results.range);
    });
  });

  describe('Parameter Validation', () => {
    it('clamps negative gravity, velocity, height, and out-of-range angles', () => {
      const validated = validateParameters({
        initialVelocity: -10,
        launchAngle: 120,
        gravity: -5,
        initialHeight: -2,
        airResistanceEnabled: false,
      });

      expect(validated.initialVelocity).toBe(0);
      expect(validated.launchAngle).toBe(90);
      expect(validated.gravity).toBe(0.01);
      expect(validated.initialHeight).toBe(0);
    });
  });
});
