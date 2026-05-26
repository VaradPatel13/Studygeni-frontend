import { NextRequest } from 'next/server';
import { AIService } from '@/server/services/ai.service';
import { ChatRepository } from '@/server/repositories/chat.repository';
import { DocumentRepository } from '@/server/repositories/document.repository';
import { sendSuccess, sendError } from '@/lib/server/response';
import { assertUserHasFeature } from '@/lib/server/planAccess';

const aiService = new AIService();
const chatRepository = new ChatRepository();
const documentRepository = new DocumentRepository();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { documentId } = await params;
    const { message } = await req.json();

    await assertUserHasFeature(userId, 'Chat with documents');

    if (!message) return sendError('Message is required', 'VALIDATION_ERROR', 400);

    const document = await documentRepository.findById(documentId, userId);
    if (!document) return sendError('Document not found', 'RESOURCE_NOT_FOUND', 404);

    const chatHistory = await chatRepository.findByDocument(documentId, userId);
    const messages = chatHistory?.messages || [];

    const aiResponse = await aiService.chat(document, message, messages);
    
    await chatRepository.saveMessage(
      documentId,
      userId,
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: aiResponse.message, timestamp: aiResponse.timestamp }
    );

    return sendSuccess('Chat response generated successfully', { documentId, response: aiResponse });
  } catch (error: unknown) {
    const isFeatureBlocked = error instanceof Error && error.name === 'FEATURE_NOT_AVAILABLE';
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return sendError(message, isFeatureBlocked ? 'FORBIDDEN' : 'INTERNAL_ERROR', isFeatureBlocked ? 403 : 500);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { documentId } = await params;
    await assertUserHasFeature(userId, 'Chat with documents');
    const chatHistory = await chatRepository.findByDocument(documentId, userId);
    
    if (!chatHistory) return sendSuccess('No chat history found', { documentId, messages: [] });
    return sendSuccess('Chat history retrieved successfully', chatHistory);
  } catch (error: unknown) {
    const isFeatureBlocked = error instanceof Error && error.name === 'FEATURE_NOT_AVAILABLE';
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return sendError(message, isFeatureBlocked ? 'FORBIDDEN' : 'INTERNAL_ERROR', isFeatureBlocked ? 403 : 500);
  }
}
