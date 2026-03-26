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
    const { concept, level = 'simple' } = await req.json();

    if (!concept) return sendError('Concept is required', 'VALIDATION_ERROR', 400);

    const document = await documentRepository.findById(documentId, userId);
    if (!document) return sendError('Document not found', 'RESOURCE_NOT_FOUND', 404);

    const explanation = await aiService.explainConcept(document, concept, level);
    return sendSuccess('Concept explained successfully', { documentId, concept, level, explanation });
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
