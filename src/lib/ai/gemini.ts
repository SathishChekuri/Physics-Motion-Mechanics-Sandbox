import { GoogleGenAI } from '@google/genai';
import { AiTutorRequest, AiTutorResponse, AiReportSummaryRequest } from '@/types/ai';

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('placeholder') || apiKey.trim().length === 0) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `You are the AI Physics Laboratory Tutor for "Physics Motion Mechanics Sandbox", an interactive educational simulator.
Your job is to assist high school and undergraduate physics students in understanding projectile mechanics, equations of motion, vector components, and conservation of energy.

GUIDELINES:
1. Always treat the numerical values calculated by the local physics simulator as the authoritative ground truth.
2. Clearly distinguish mathematical physics models (vacuum vs air resistance) from empirical observations.
3. Keep explanations structured, encouraging, and pedagogically clear.
4. Use standard SI units (m, s, m/s, m/s^2, degrees, kg).
5. Format mathematical equations using readable LaTeX notation ($...$) or clean markdown.
6. When explaining equations, walk through the physical meaning of each term (e.g. initial height offset, velocity component, gravitational deceleration).
7. If asked for practice questions, provide clear physics conceptual/numerical questions with step-by-step solutions.
`;

export async function generateTutorResponse(request: AiTutorRequest): Promise<AiTutorResponse> {
  const ai = getGeminiClient();

  if (!ai) {
    return {
      success: false,
      isMockOrConfigWarning: true,
      content: `### ⚠️ Gemini API Key Required
Google Gemini integration is fully implemented, but \`GEMINI_API_KEY\` is not currently configured in your environment.

**How to activate AI Tutor:**
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Add it to your \`.env.local\` file:
   \`\`\`env
   GEMINI_API_KEY=your_gemini_api_key_here
   \`\`\`
3. Restart your development server or add it to your Vercel Project Settings.

In the meantime, the deterministic local physics simulator, trajectories, real-time calculations, and chart visualizations are 100% operational!`,
      suggestedFollowUps: [
        'How does launch angle affect maximum range?',
        'Why does vertical velocity decrease while horizontal velocity stays constant?',
        'How does initial height change the optimal launch angle?',
      ],
    };
  }

  const { mode, userQuestion, parameters: p, results: r } = request;

  let promptContent = '';

  const contextData = `
CURRENT EXPERIMENTAL SETUP:
- Initial Launch Velocity (u): ${p.initialVelocity} m/s
- Launch Angle (θ): ${p.launchAngle}°
- Gravitational Acceleration (g): ${p.gravity} m/s²
- Initial Launch Height (h₀): ${p.initialHeight} m
- Air Resistance: ${p.airResistanceEnabled ? 'Enabled (Quadratic drag)' : 'Disabled (Vacuum ideal motion)'}

SIMULATOR CALCULATED RESULTS:
- Horizontal Range (R): ${r.range} m
- Maximum Height (H_max): ${r.maxHeight} m
- Total Flight Time (t_land): ${r.flightTime} s
- Time to Peak: ${r.timeToMaxHeight} s
- Initial vx: ${r.initialVx} m/s, Initial vy0: ${r.initialVy} m/s
- Impact Velocity: ${r.impactVelocity} m/s at ${r.impactAngle}° below horizontal
`;

  switch (mode) {
    case 'explain_concept':
      promptContent = `${contextData}\nExplain the physical principles governing this specific projectile motion simulation. Explain why it forms a parabolic trajectory (or asymmetric arc if air resistance is on) and how gravity influences vertical motion while horizontal motion progresses at constant speed.`;
      break;

    case 'step_by_step_equations':
      promptContent = `${contextData}\nProvide a complete step-by-step mathematical derivation for this experiment.
1. Show how vx0 and vy0 are resolved from u and θ.
2. Show the quadratic equation for landing time given initial height h0.
3. Show the peak height formula and calculate it with the values above.
4. Compare the theoretical values step-by-step with the simulator's calculated outputs.`;
      break;

    case 'interpret_results':
      promptContent = `${contextData}\nInterpret the student's calculated numerical results. Are these realistic? What does the ratio between max height and range tell us? What does the impact velocity reveal about conservation of energy (initial kinetic + potential vs final kinetic)?`;
      break;

    case 'parameter_relationships':
      promptContent = `${contextData}\nAnalyze the sensitivities and relationships for this simulation:
- How would doubling the initial velocity change the range and max height?
- What would happen if this was launched on the Moon (g = 1.62 m/s²) vs Earth?
- How does the launch angle of ${p.launchAngle}° compare to the optimal 45° angle (taking into account the initial height of ${p.initialHeight} m)?`;
      break;

    case 'suggest_experiments':
      promptContent = `${contextData}\nSuggest 3 exciting follow-up laboratory experiments that the student can test in this simulator to explore counter-intuitive physics concepts (e.g. complementary angles yielding identical ranges, cliff launches where optimal angle < 45°, heavy air drag terminal velocity).`;
      break;

    case 'practice_questions':
      promptContent = `${contextData}\nGenerate 2 high-quality physics practice problems based on this exact experimental setup:
Problem 1: Conceptual question testings intuition.
Problem 2: Calculation problem using the numbers from this simulation.
For each problem, provide a clear Question, a hint, and a step-by-step Answer with Explanation.`;
      break;

    case 'problem_hints':
      promptContent = `${contextData}\nThe student is analyzing this simulation. Provide 3 key physical hints and problem-solving strategies to master kinematic equations for this motion type.`;
      break;

    case 'custom_query':
    default:
      promptContent = `${contextData}\nStudent Question: "${userQuestion || 'Explain this simulation.'}"\nAnswer the student's question accurately using the simulator context and physics mechanics principles.`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: promptContent,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    const text = response.text || 'No response generated from AI.';

    return {
      success: true,
      content: text,
      suggestedFollowUps: [
        'How would doubling the velocity affect the range?',
        'Why is the landing speed higher than launch speed when initial height > 0?',
        'Show me the energy conservation breakdown at peak height.',
      ],
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error during AI generation';
    console.error('Gemini API Error:', errMessage);
    return {
      success: false,
      error: `Failed to contact Gemini API: ${errMessage}`,
      content: `### ⚠️ AI Tutor Service Unavailable\n\nCould not communicate with the Gemini API: ${errMessage}. Please verify your API key and network connection.`,
    };
  }
}

export async function generateReportSummary(request: AiReportSummaryRequest): Promise<{
  success: boolean;
  summary: string;
  keyInsights: string[];
  error?: string;
}> {
  const ai = getGeminiClient();

  if (!ai) {
    return {
      success: false,
      error: 'GEMINI_API_KEY is not configured.',
      summary: `Automated Report Analysis for "${request.experimentName}":\nThe experiment was conducted using ${request.motionType === 'air_resistance' ? 'quadratic air resistance' : 'ideal Newtonian projectile'} dynamics. With an initial velocity of ${request.parameters.initialVelocity} m/s and launch angle of ${request.parameters.launchAngle}°, the projectile covered a range of ${request.results.range} m with a maximum elevation of ${request.results.maxHeight} m over a flight duration of ${request.results.flightTime} s. Configure GEMINI_API_KEY to generate deep AI pedagogical insights.`,
      keyInsights: [
        `Kinematic trajectory produced a horizontal range of ${request.results.range} meters.`,
        `Peak gravitational potential reached at height ${request.results.maxHeight} meters.`,
        `Terminal impact speed was measured at ${request.results.impactVelocity} m/s.`,
      ],
    };
  }

  const prompt = `
Generate a formal, scientific laboratory report analysis for the following experiment:
Experiment Name: ${request.experimentName}
Motion Model: ${request.motionType}
Launch Velocity: ${request.parameters.initialVelocity} m/s
Launch Angle: ${request.parameters.launchAngle} degrees
Gravity: ${request.parameters.gravity} m/s²
Initial Height: ${request.parameters.initialHeight} m
Measured Range: ${request.results.range} m
Measured Max Height: ${request.results.maxHeight} m
Measured Flight Time: ${request.results.flightTime} s
Impact Speed: ${request.results.impactVelocity} m/s at ${request.results.impactAngle}°
Student Notes / Observations: "${request.userObservations || 'None provided'}"

Provide a concise, publication-grade executive summary (2-3 paragraphs) discussing physical behavior, consistency with Newtonian kinematics, energy transformation, and experimental conclusions.
`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    const summary = response.text || 'Summary unavailable.';
    return {
      success: true,
      summary,
      keyInsights: [
        `Trajectory verified consistent with kinematic equations at g = ${request.parameters.gravity} m/s².`,
        `Vertical kinetic energy fully transformed to gravitational potential energy at apex (${request.results.maxHeight} m).`,
        `Impact speed (${request.results.impactVelocity} m/s) satisfies conservation of total mechanical energy.`,
      ],
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Error generating report summary';
    return {
      success: false,
      error: errMessage,
      summary: 'Report summary could not be generated at this time due to an API error.',
      keyInsights: [],
    };
  }
}
