import { NextRequest } from 'next/server';
import { ChatRepository } from '@/server/repositories/chat.repository';
import { sendSuccess, sendError } from '@/lib/server/response';

const chatRepository = new ChatRepository();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { documentId } = await params;
    
    const chatHistory = await chatRepository.findByDocument(documentId, userId);
    
    if (!chatHistory) return sendSuccess('No chat history found', { documentId, messages: [] });
    return sendSuccess('Chat history retrieved successfully', chatHistory);
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
