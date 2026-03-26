import { NextRequest } from 'next/server';
import { AIService } from '@/server/services/ai.service';
import { DocumentRepository } from '@/server/repositories/document.repository';
import Flashcard from '@/models/Flashcard';
import { sendSuccess, sendError } from '@/lib/server/response';
import connectDB from '@/lib/server/db';

const aiService = new AIService();
const documentRepository = new DocumentRepository();

export async function POST(
  req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { documentId } = await params;
    const { count = 10 } = await req.json();

    const document = await documentRepository.findById(documentId, userId);
    if (!document) return sendError('Document not found', 'RESOURCE_NOT_FOUND', 404);

    await connectDB();
    let flashcardSet = await Flashcard.findOne({ documentId, userId });
    if (flashcardSet) return sendSuccess('Flashcards already exist', flashcardSet);

    const generatedCards = await aiService.generateFlashcards(document, count);
    
    flashcardSet = await Flashcard.create({
      userId,
      documentId,
      cards: generatedCards.map((card: any) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty || 'medium'
      }))
    });

    return sendSuccess('Flashcards generated successfully', flashcardSet, 201);
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
