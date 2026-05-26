import { NextRequest } from 'next/server';
import { AIService } from '@/server/services/ai.service';
import { DocumentRepository } from '@/server/repositories/document.repository';
import Quiz from '@/models/Quiz';
import { sendSuccess, sendError } from '@/lib/server/response';
import connectDB from '@/lib/server/db';
import { assertUserHasFeature } from '@/lib/server/planAccess';

const aiService = new AIService();
const documentRepository = new DocumentRepository();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { documentId } = await params;
    const { count = 5, difficulty = 'mixed' } = await req.json();

    await assertUserHasFeature(userId, 'Quiz generation');

    const document = await documentRepository.findById(documentId, userId);
    if (!document) return sendError('Document not found', 'RESOURCE_NOT_FOUND', 404);

    const quizData = await aiService.generateQuiz(document, count, difficulty);
    
    await connectDB();
    const savedQuiz = await Quiz.create({
      userId,
      documentId,
      title: `Quiz for ${document.title}`,
      questions: quizData,
      totalQuestions: quizData.length
    });

    return sendSuccess('Quiz generated and saved successfully', savedQuiz);
  } catch (error: unknown) {
    const isFeatureBlocked = error instanceof Error && error.name === 'FEATURE_NOT_AVAILABLE';
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return sendError(message, isFeatureBlocked ? 'FORBIDDEN' : 'INTERNAL_ERROR', isFeatureBlocked ? 403 : 500);
  }
}
