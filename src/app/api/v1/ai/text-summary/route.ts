import { NextRequest } from 'next/server';
import { AIService } from '@/server/services/ai.service';
import { sendSuccess, sendError } from '@/lib/server/response';

const aiService = new AIService();

export async function POST(req: NextRequest) {
  try {
    const { text, length = 'medium' } = await req.json();
    if (!text) return sendError('Text content is required', 'VALIDATION_ERROR', 400);

    const summary = await aiService.generateTextSummary(text, length); 
    return sendSuccess('Text summary generated successfully', { summary });
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
