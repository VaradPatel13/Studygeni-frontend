import { NextRequest } from 'next/server';
import { AIService } from '@/server/services/ai.service';
import { DocumentRepository } from '@/server/repositories/document.repository';
import { sendSuccess, sendError } from '@/lib/server/response';

const aiService = new AIService();
const documentRepository = new DocumentRepository();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { documentId } = await params;
    const { length = 'medium' } = await req.json();

    const document = await documentRepository.findById(documentId, userId);
    if (!document) return sendError('Document not found', 'RESOURCE_NOT_FOUND', 404);

    const summary = await aiService.generateSummary(document, length);
    return sendSuccess('Summary generated successfully', { documentId, summary });
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
