import { NextRequest } from 'next/server';
import { AIService } from '@/server/services/ai.service';
import { sendSuccess, sendError } from '@/lib/server/response';

const aiService = new AIService();

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, length = 'medium' } = await req.json();

    if (!videoUrl) return sendError('Video URL is required', 'VALIDATION_ERROR', 400);

    const result = await aiService.generateYoutubeSummary(videoUrl, length);
    return sendSuccess('YouTube summary generated successfully', result);
  } catch (error: any) {
    if (error.message.includes('TRANSCRIPT_UNAVAILABLE')) {
        return sendError('Unable to generate summary. No captions available.', 'TRANSCRIPT_UNAVAILABLE', 400);
    }
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
