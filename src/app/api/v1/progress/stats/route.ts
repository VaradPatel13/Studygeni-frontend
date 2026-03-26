import { NextRequest } from 'next/server';
import Flashcard from '@/models/Flashcard';
import Quiz from '@/models/Quiz';
import Document from '@/models/Document';
import { sendSuccess, sendError } from '@/lib/server/response';
import connectDB from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    await connectDB();

    const flashcardSets = await Flashcard.find({ userId });
    let totalFlashcards = 0;
    let totalCardsReviewed = 0;
    let flashcardsStarred = 0;

    flashcardSets.forEach(set => {
      totalFlashcards += set.cards.length;
      set.cards.forEach((card: any) => {
        if (card.reviewCount > 0) totalCardsReviewed++;
        if (card.isStarred) flashcardsStarred++;
      });
    });

    const quizzes = await Quiz.find({ userId });
    let totalQuizzesTaken = 0;
    let totalQuizScore = 0;
    let totalQuestionsAnswered = 0;

    quizzes.forEach(quiz => {
      if (quiz.completedAt) {
        totalQuizzesTaken++;
        totalQuizScore += quiz.score;
        totalQuestionsAnswered += quiz.totalQuestions;
      }
    });

    const averageQuizScore = totalQuestionsAnswered > 0
      ? Math.round((totalQuizScore / totalQuestionsAnswered) * 100)
      : 0;

    const recentDocs = await Document.find({ userId }).sort({ uploadDate: -1 }).limit(5).select('title fileType uploadDate');
    const recentQuizzes = await Quiz.find({ userId, completedAt: { $ne: null } }).sort({ completedAt: -1 }).limit(5).populate('documentId', 'title').select('title score totalQuestions completedAt');

    return sendSuccess('Learning stats retrieved', {
      stats: {
        flashcards: { totalSets: flashcardSets.length, totalCards: totalFlashcards, reviewedCount: totalCardsReviewed, starredCount: flashcardsStarred },
        quizzes: { taken: totalQuizzesTaken, avgScore: averageQuizScore, totalQuestionsAnswered }
      },
      recentData: { documents: recentDocs, quizzes: recentQuizzes }
    });
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
