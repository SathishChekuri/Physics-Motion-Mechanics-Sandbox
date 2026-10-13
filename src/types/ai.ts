import { z } from 'zod';

export const AiTutorModeSchema = z.enum([
  'explain_concept',
  'step_by_step_equations',
  'interpret_results',
  'parameter_relationships',
  'suggest_experiments',
  'practice_questions',
  'problem_hints',
  'custom_query',
]);

export type AiTutorMode = z.infer<typeof AiTutorModeSchema>;

export const AiTutorRequestSchema = z.object({
  mode: AiTutorModeSchema,
  userQuestion: z.string().max(1000).optional(),
  parameters: z.object({
    initialVelocity: z.number().min(0).max(1000),
    launchAngle: z.number().min(-90).max(90),
    gravity: z.number().min(0.01).max(100),
    initialHeight: z.number().min(0).max(10000),
    airResistanceEnabled: z.boolean(),
  }),
  results: z.object({
    flightTime: z.number(),
    maxHeight: z.number(),
    range: z.number(),
    impactVelocity: z.number(),
    impactAngle: z.number(),
    timeToMaxHeight: z.number(),
    initialVx: z.number(),
    initialVy: z.number(),
  }),
});

export type AiTutorRequest = z.infer<typeof AiTutorRequestSchema>;

export const AiReportSummaryRequestSchema = z.object({
  experimentName: z.string().max(150),
  motionType: z.enum(['ideal', 'air_resistance']),
  parameters: z.object({
    initialVelocity: z.number(),
    launchAngle: z.number(),
    gravity: z.number(),
    initialHeight: z.number(),
    airResistanceEnabled: z.boolean(),
  }),
  results: z.object({
    flightTime: z.number(),
    maxHeight: z.number(),
    range: z.number(),
    impactVelocity: z.number(),
    impactAngle: z.number(),
  }),
  userObservations: z.string().max(2000).optional(),
});

export type AiReportSummaryRequest = z.infer<typeof AiReportSummaryRequestSchema>;

export interface AiTutorResponse {
  success: boolean;
  content: string;
  suggestedFollowUps?: string[];
  practiceQuestions?: {
    question: string;
    options?: string[];
    answer: string;
    explanation: string;
  }[];
  isMockOrConfigWarning?: boolean;
  error?: string;
}
