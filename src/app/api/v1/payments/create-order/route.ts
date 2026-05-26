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
    const { plan, couponCode, currency } = body;

    const result = await BillingService.createCheckoutOrder({
      userId,
      planId: plan,
      couponCode,
      email: req.headers.get('x-user-email') || '',
      currency: currency || 'USD',
    });

    return sendSuccess('Order created successfully', {
      orderId: result.orderId,
      amount: result.amount,
      keyId: result.keyId,
    });
  } catch (error: unknown) {
    console.error('Create order error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create order';
    const code = message.includes('plan')
      ? 'INVALID_PLAN'
      : message.includes('coupon')
      ? 'INVALID_COUPON'
      : message.includes('User not found')
      ? 'RESOURCE_NOT_FOUND'
      : 'ORDER_ERROR';
    const status = code === 'ORDER_ERROR' ? 500 : 400;
    return sendError(message, code, status);
  }
}
