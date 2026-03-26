import { NextRequest } from 'next/server';
import Flashcard from '@/models/Flashcard';
import { sendSuccess, sendError } from '@/lib/server/response';
import connectDB from '@/lib/server/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { documentId } = await params;
    await connectDB();

    const flashcardSet = await Flashcard.findOne({ documentId, userId })
      .populate('documentId', 'title filename');

    if (!flashcardSet) return sendError('Flashcards not found', 'RESOURCE_NOT_FOUND', 404);

    return sendSuccess('Flashcards retrieved successfully', flashcardSet);
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
