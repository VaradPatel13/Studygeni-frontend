import { NextRequest } from 'next/server';
import { AuthService } from '@/server/services/auth.service';
import { updateProfileSchema } from '@/server/validations/auth.schema';
import { sendSuccess, sendError } from '@/lib/server/response';

const authService = new AuthService();

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return sendError('Not authorized', 'AUTH_ERROR', 401);

    const user = await authService.getProfile(userId);
    return sendSuccess('Profile retrieved successfully', { user });
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return sendError('Not authorized', 'AUTH_ERROR', 401);

    const body = await req.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return sendError('Validation error', 'VALIDATION_ERROR', 400, result.error.format());
    }

    const user = await authService.updateProfile(userId, result.data);
    return sendSuccess('Profile updated successfully', { user });
  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
