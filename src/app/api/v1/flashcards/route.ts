import { NextRequest } from 'next/server';
import Flashcard from '@/models/Flashcard';
import { sendSuccess, sendError } from '@/lib/server/response';
import connectDB from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    await connectDB();

    const flashcardSets = await Flashcard.find({ userId })
      .populate('documentId', 'title filename')
      .sort({ createdAt: -1 });

    return sendSuccess('All flashcard sets retrieved', { count: flashcardSets.length, flashcardSets });
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
