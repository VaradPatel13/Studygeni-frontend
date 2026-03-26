import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// Routes that require authentication
const PROTECTED_ROUTES = ['/api/v1/documents', '/api/v1/flashcards', '/api/v1/ai', '/api/v1/quizzes', '/dashboard'];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if current route is protected (ignoring login/register)
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) || 
                     (pathname.startsWith('/api/v1/auth') && (pathname.includes('/profile') || pathname.includes('/change-password')));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Extract token from header or cookie
  const authHeader = req.headers.get('authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    token = req.cookies.get('token')?.value || null;
  }

  if (!token) {
    return NextResponse.json({ success: false, message: 'Not authorized, no token' }, { status: 401 });
  }

  try {
    // Verify JWT in Edge Middleware
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jose.jwtVerify(token, secret);

    // Add user ID to headers for access in route handlers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.id as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware Auth Error:', error);
    return NextResponse.json({ success: false, message: 'Not authorized, invalid token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/v1/:path*', '/dashboard/:path*'],
};
