import { NextRequest } from 'next/server';
import { AIService } from '@/server/services/ai.service';
import { sendSuccess, sendError } from '@/lib/server/response';
import { assertUserHasFeature } from '@/lib/server/planAccess';

const aiService = new AIService();

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { videoUrl, length = 'medium' } = await req.json();

    await assertUserHasFeature(userId, 'YouTube summaries');

    if (!videoUrl) return sendError('Video URL is required', 'VALIDATION_ERROR', 400);

    const result = await aiService.generateYoutubeSummary(videoUrl, length);
    return sendSuccess('YouTube summary generated successfully', result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    if (message.includes('TRANSCRIPT_UNAVAILABLE')) {
        return sendError('Unable to generate summary. No captions available.', 'TRANSCRIPT_UNAVAILABLE', 400);
    }
    const isFeatureBlocked = error instanceof Error && error.name === 'FEATURE_NOT_AVAILABLE';
    return sendError(message, isFeatureBlocked ? 'FORBIDDEN' : 'INTERNAL_ERROR', isFeatureBlocked ? 403 : 500);
  }
}
