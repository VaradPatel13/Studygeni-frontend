import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/server/response';
import { BillingService } from '@/server/services/billing.service';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!BillingService.verifyWebhookSignature(rawBody, signature)) {
      return sendError('Invalid webhook signature', 'INVALID_SIGNATURE', 400);
    }

    const payload = JSON.parse(rawBody);
    const event = payload?.event || 'payment.captured';
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderEntity = payload?.payload?.order?.entity;

    const paymentId = paymentEntity?.id || orderEntity?.payment_id;
    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const userId = paymentEntity?.notes?.userId || orderEntity?.notes?.userId;
    const planId = paymentEntity?.notes?.plan || orderEntity?.notes?.plan;
    const couponCode = paymentEntity?.notes?.couponCode || orderEntity?.notes?.couponCode || null;

    if (!userId || !orderId || !paymentId) {
      return sendError('Webhook payload missing payment identifiers', 'INVALID_WEBHOOK', 400);
    }

    const result = await BillingService.verifyAndFinalizePayment({
      userId,
      orderId,
      paymentId,
      planId,
      couponCode,
      source: 'webhook',
      signatureVerified: true,
      rawPayload: payload,
      eventType: event,
    });

    return sendSuccess('Webhook processed successfully', {
      subscription: result.subscription,
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (error: unknown) {
    console.error('Webhook processing error:', error);
    return sendError(
      error instanceof Error ? error.message : 'Webhook processing failed',
      'WEBHOOK_ERROR',
      500
    );
  }
}