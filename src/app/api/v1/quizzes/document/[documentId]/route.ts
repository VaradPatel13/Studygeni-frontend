import { NextRequest } from 'next/server';
import { QuizRepository } from '@/server/repositories/quiz.repository';
import { sendSuccess, sendError } from '@/lib/server/response';

const quizRepository = new QuizRepository();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { documentId } = await params;

    const quizzes = await quizRepository.findByDocument(documentId, userId);
    return sendSuccess('Quizzes retrieved successfully', { count: quizzes.length, quizzes });
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
