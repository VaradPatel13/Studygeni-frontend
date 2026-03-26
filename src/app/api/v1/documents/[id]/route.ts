import { NextRequest } from 'next/server';
import { DocumentService } from '@/server/services/document.service';
import { sendSuccess, sendError } from '@/lib/server/response';

const documentService = new DocumentService();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return sendError('Not authorized', 'AUTH_ERROR', 401);

    const { id } = await params;
    const document = await documentService.getDocumentById(id, userId);
    return sendSuccess('Document retrieved successfully', document);
  } catch (error: any) {
    if (error.message === 'Document not found') {
      return sendError(error.message, 'RESOURCE_NOT_FOUND', 404);
    }
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return sendError('Not authorized', 'AUTH_ERROR', 401);

    const { id } = await params;
    const body = await req.json();
    const document = await documentService.updateDocument(id, userId, body);
    return sendSuccess('Document updated successfully', document);
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return sendError('Not authorized', 'AUTH_ERROR', 401);

    const { id } = await params;
    await documentService.deleteDocument(id, userId);
    return sendSuccess('Document deleted successfully');
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
