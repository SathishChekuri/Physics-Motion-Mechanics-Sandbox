import { NextRequest, NextResponse } from 'next/server';
import { AiTutorRequestSchema } from '@/types/ai';
import { generateTutorResponse } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const parseResult = AiTutorRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed for AI Tutor payload',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const response = await generateTutorResponse(parseResult.data);
    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      {
        success: false,
        error: `Internal server error: ${message}`,
      },
      { status: 500 }
    );
  }
}
