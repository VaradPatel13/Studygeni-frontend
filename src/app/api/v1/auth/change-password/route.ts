import { NextRequest } from 'next/server';
import { AuthService } from '@/server/services/auth.service';
import { changePasswordSchema } from '@/server/validations/auth.schema';
import { sendSuccess, sendError } from '@/lib/server/response';

const authService = new AuthService();

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const body = await req.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) return sendError('Validation error', 'VALIDATION_ERROR', 400, result.error.format());

    await authService.changePassword(userId, result.data);
    return sendSuccess('Password changed successfully');
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
