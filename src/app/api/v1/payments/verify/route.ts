import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/server/response';
import { BillingService } from '@/server/services/billing.service';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return sendError('Not authorized', 'AUTH_ERROR', 401);
    }

    const body = await req.json();
    const { orderId, paymentId, signature, couponCode } = body;

    if (!orderId || !paymentId || !signature) {
      return sendError('Missing required fields', 'VALIDATION_ERROR', 400);
    }

    const result = await BillingService.verifyAndFinalizePayment({
      userId,
      orderId,
      paymentId,
      signature,
      couponCode,
      source: 'callback',
      signatureVerified: true,
      eventType: 'payment_verified',
    });

    return sendSuccess('Payment verified successfully', {
      subscription: result.subscription,
      message: 'Your subscription has been activated',
    });
  } catch (error: unknown) {
    console.error('Verify payment error:', error);
    const message = error instanceof Error ? error.message : 'Payment verification failed';
    const code = message.includes('signature')
      ? 'INVALID_SIGNATURE'
      : message.includes('not captured')
      ? 'PAYMENT_FAILED'
      : message.includes('User not found')
      ? 'RESOURCE_NOT_FOUND'
      : 'VERIFICATION_ERROR';
    const status = code === 'VERIFICATION_ERROR' ? 500 : 400;
    return sendError(message, code, status);
  }
}
