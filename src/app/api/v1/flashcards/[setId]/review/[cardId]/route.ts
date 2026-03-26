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
    const { difficulty } = await req.json();

    await connectDB();
    const updatedFlashcardSet = await Flashcard.findOneAndUpdate(
      { _id: setId, userId, 'cards._id': cardId },
      {
        $set: {
          'cards.$.lastReviewed': new Date(),
          ...(difficulty && { 'cards.$.difficulty': difficulty })
        },
        $inc: { 'cards.$.reviewCount': 1 }
      },
      { new: true }
    );

    if (!updatedFlashcardSet) return sendError('Flashcard set or card not found', 'RESOURCE_NOT_FOUND', 404);

    const updatedCard = updatedFlashcardSet.cards.find((card: any) => card._id.toString() === cardId);
    return sendSuccess('Flashcard reviewed successfully', updatedCard);
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
