import { NextRequest } from 'next/server';
import { AuthService } from '@/server/services/auth.service';
import { loginSchema } from '@/server/validations/auth.schema';
import { sendSuccess, sendError } from '@/lib/server/response';

const authService = new AuthService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return sendError('Validation error', 'VALIDATION_ERROR', 400, result.error.format());
    }

    const { token, user } = await authService.loginUser(result.data);

    const response = sendSuccess('Login successful', { token, user });

    // Set cookie for browser-based auth
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      return sendError(error.message, 'AUTH_ERROR', 401);
    }
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
