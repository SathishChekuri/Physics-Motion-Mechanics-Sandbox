import { NextRequest, NextResponse } from 'next/server';
import { AiReportSummaryRequestSchema } from '@/types/ai';
import { generateReportSummary } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const parseResult = AiReportSummaryRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed for report summary payload',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const response = await generateReportSummary(parseResult.data);
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
