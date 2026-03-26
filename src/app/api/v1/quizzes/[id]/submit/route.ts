import { NextRequest } from 'next/server';
import { QuizRepository } from '@/server/repositories/quiz.repository';
import { sendSuccess, sendError } from '@/lib/server/response';

const quizRepository = new QuizRepository();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { id } = await params;
    const { answers } = await req.json();

    const quiz = await quizRepository.findById(id, userId);
    if (!quiz) return sendError('Quiz not found', 'RESOURCE_NOT_FOUND', 404);

    let score = 0;
    const userAnswers: any[] = [];

    answers.forEach((ans: any) => {
      const question = quiz.questions[ans.questionIndex];
      if (question) {
        const isCorrect = question.correctAnswer === ans.selectedAnswer;
        if (isCorrect) score++;

        userAnswers.push({
          questionIndex: ans.questionIndex,
          selectedAnswer: ans.selectedAnswer,
          isCorrect,
          answeredAt: new Date()
        });
      }
    });

    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.completedAt = new Date();

    await quiz.save();

    return sendSuccess('Quiz submitted successfully', { score, totalQuestions: quiz.totalQuestions, quiz });
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
