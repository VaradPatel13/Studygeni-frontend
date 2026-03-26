import { NextRequest } from 'next/server';
import { QuizRepository } from '@/server/repositories/quiz.repository';
import { sendSuccess, sendError } from '@/lib/server/response';

const quizRepository = new QuizRepository();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { id } = await params;

    const quiz = await quizRepository.findById(id, userId);
    if (!quiz) return sendError('Quiz not found', 'RESOURCE_NOT_FOUND', 404);

    return sendSuccess('Quiz retrieved successfully', quiz);
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { id } = await params;

    const deletedQuiz = await quizRepository.delete(id, userId);
    if (!deletedQuiz) return sendError('Quiz not found', 'RESOURCE_NOT_FOUND', 404);

    return sendSuccess('Quiz deleted successfully');
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
