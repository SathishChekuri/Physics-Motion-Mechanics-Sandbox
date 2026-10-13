import { describe, it, expect } from 'vitest';
import { AiTutorRequestSchema, AiReportSummaryRequestSchema } from '@/types/ai';

describe('AI Validation Schemas', () => {
  it('validates a correct AiTutorRequest payload', () => {
    const validPayload = {
      mode: 'explain_concept',
      userQuestion: 'Why does launch angle 45 maximize range?',
      parameters: {
        initialVelocity: 25,
        launchAngle: 45,
        gravity: 9.81,
        initialHeight: 0,
        airResistanceEnabled: false,
      },
      results: {
        flightTime: 3.6,
        maxHeight: 15.9,
        range: 63.7,
        impactVelocity: 25,
        impactAngle: 45,
        timeToMaxHeight: 1.8,
        initialVx: 17.68,
        initialVy: 17.68,
      },
    };

    const res = AiTutorRequestSchema.safeParse(validPayload);
    expect(res.success).toBe(true);
  });

  it('rejects an invalid payload with out-of-range launch angle or negative gravity', () => {
    const invalidPayload = {
      mode: 'explain_concept',
      parameters: {
        initialVelocity: 25,
        launchAngle: 120, // max is 90
        gravity: -9.81, // min is 0.01
        initialHeight: 0,
        airResistanceEnabled: false,
      },
      results: {
        flightTime: 3.6,
        maxHeight: 15.9,
        range: 63.7,
        impactVelocity: 25,
        impactAngle: 45,
        timeToMaxHeight: 1.8,
        initialVx: 17.68,
        initialVy: 17.68,
      },
    };

    const res = AiTutorRequestSchema.safeParse(invalidPayload);
    expect(res.success).toBe(false);
  });

  it('validates AiReportSummaryRequest payload', () => {
    const validSummary = {
      experimentName: 'Lab 1 - Cannonball Launch',
      motionType: 'ideal' as const,
      parameters: {
        initialVelocity: 20,
        launchAngle: 30,
        gravity: 9.81,
        initialHeight: 10,
        airResistanceEnabled: false,
      },
      results: {
        flightTime: 2.5,
        maxHeight: 15.1,
        range: 43.3,
        impactVelocity: 24.4,
        impactAngle: 44.8,
      },
      userObservations: 'Observed clean parabolic arc with non-zero landing height.',
    };

    const res = AiReportSummaryRequestSchema.safeParse(validSummary);
    expect(res.success).toBe(true);
  });
});
