import { NextRequest } from 'next/server';
import { DocumentService } from '@/server/services/document.service';
import { sendSuccess, sendError } from '@/lib/server/response';

const documentService = new DocumentService();

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return sendError('Not authorized', 'AUTH_ERROR', 401);

    const documents = await documentService.getDocuments(userId);
    return sendSuccess('Documents retrieved successfully', { count: documents.length, documents });
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
