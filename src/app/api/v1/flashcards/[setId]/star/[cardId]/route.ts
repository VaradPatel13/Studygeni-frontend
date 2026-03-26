import { NextRequest } from 'next/server';
import Flashcard from '@/models/Flashcard';
import { sendSuccess, sendError } from '@/lib/server/response';
import connectDB from '@/lib/server/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ setId: string; cardId: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { setId, cardId } = await params;

    await connectDB();
    const flashcardSet = await Flashcard.findOne({ _id: setId, userId });
    if (!flashcardSet) return sendError('Flashcard set not found', 'RESOURCE_NOT_FOUND', 404);

    const cardIndex = flashcardSet.cards.findIndex((card: any) => card._id.toString() === cardId);
    if (cardIndex === -1) return sendError('Card not found in set', 'RESOURCE_NOT_FOUND', 404);

    const newStatus = !flashcardSet.cards[cardIndex].isStarred;
    flashcardSet.cards[cardIndex].isStarred = newStatus;
    await flashcardSet.save();

    return sendSuccess(newStatus ? 'Card starred' : 'Card unstarred', { isStarred: newStatus });
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
