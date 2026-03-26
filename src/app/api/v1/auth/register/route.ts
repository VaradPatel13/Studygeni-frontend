import { NextRequest } from 'next/server';
import { AuthService } from '@/server/services/auth.service';
import { registerSchema } from '@/server/validations/auth.schema';
import { sendSuccess, sendError } from '@/lib/server/response';

const authService = new AuthService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return sendError('Validation error', 'VALIDATION_ERROR', 400, result.error.format());
    }

    const { token, user } = await authService.registerUser(result.data);

    const response = sendSuccess('User registered successfully', { token, user }, 201);

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    if (error.message === 'User already exists') {
      return sendError(error.message, 'DUPLICATE_USER', 400);
    }
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
