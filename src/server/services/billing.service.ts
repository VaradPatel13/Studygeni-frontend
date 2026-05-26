import crypto from 'crypto';
import connectDB from '@/lib/server/db';
import { pricingPlans } from '@/lib/pricingPlans';
import Coupon from '@/models/Coupon';
import PaymentEvent from '@/models/PaymentEvent';
import Subscription from '@/models/Subscription';
import User from '@/models/User';
import { RazorpayService } from './razorpay.service';

export type BillingPlanId = 'starter' | 'professional' | 'enterprise';

export type BillingQuote = {
  planId: BillingPlanId;
  planName: string;
  documentsLimit: number;
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string | null;
  currency: string;
};

export type CheckoutOrderResult = {
  orderId: string;
  amount: number;
  keyId: string | undefined;
  quote: BillingQuote;
};

export type FinalizePaymentInput = {
  userId: string;
  orderId: string;
  paymentId: string;
  planId?: BillingPlanId;
  couponCode?: string | null;
  source: 'callback' | 'webhook';
  signatureVerified?: boolean;
  signature?: string;
  rawPayload?: unknown;
  eventType?: string;
};

function buildReceipt(userId: string, planId: string) {
  const shortUserId = userId.slice(-6);
  const shortTime = Date.now().toString().slice(-6);
  return `sub_${shortUserId}_${planId}_${shortTime}`;
}

function normalizePlanId(planId: string): BillingPlanId {
  if (planId === 'starter' || planId === 'professional' || planId === 'enterprise') {
    return planId;
  }

  throw new Error('Invalid plan');
}

function getPlanDetails(planId: BillingPlanId) {
  const plan = pricingPlans.find((item) => item.id === planId);
  if (!plan) {
    throw new Error('Invalid plan');
  }
  return plan;
}

async function ensureUserExists(userId: string) {
  const user = await User.findById(userId).select('_id subscriptionPlan');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

async function validateCoupon(planId: BillingPlanId, couponCode?: string | null) {
  if (!couponCode) {
    return { coupon: null, discountAmount: 0 };
  }

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    active: true,
  });

  if (!coupon) {
    throw new Error('Invalid coupon code');
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    throw new Error('Coupon has expired');
  }

  if (coupon.maxUses !== -1 && coupon.usedCount >= coupon.maxUses) {
    throw new Error('Coupon usage limit reached');
  }

  if (
    coupon.applicablePlans?.length > 0 &&
    !coupon.applicablePlans.includes('all') &&
    !coupon.applicablePlans.includes(planId)
  ) {
    throw new Error('Coupon is not applicable to this plan');
  }

  const planDetails = getPlanDetails(planId);
  if (coupon.minPlanPrice && planDetails.price < coupon.minPlanPrice) {
    throw new Error(`Coupon requires minimum plan price of $${coupon.minPlanPrice}`);
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (planDetails.price * coupon.discountValue) / 100;
  } else {
    discountAmount = Math.min(coupon.discountValue, planDetails.price);
  }

  return {
    coupon,
    discountAmount: Math.round(discountAmount * 100) / 100,
  };
}

async function logPaymentEvent(input: {
  idempotencyKey: string;
  source: 'order' | 'callback' | 'webhook';
  eventType: string;
  userId: string;
  plan: BillingPlanId;
  orderId?: string;
  paymentId?: string;
  amount: number;
  currency?: string;
  couponCode?: string | null;
  discountAmount?: number;
  status?: 'created' | 'verified' | 'processed' | 'failed';
  signatureVerified?: boolean;
  processedAt?: Date;
  payload?: unknown;
  errorMessage?: string;
}) {
  return PaymentEvent.findOneAndUpdate(
    { idempotencyKey: input.idempotencyKey },
    {
      ...input,
      currency: input.currency || 'INR',
    },
    { upsert: true, new: true }
  );
}

async function syncSubscriptionAndUser(params: {
  userId: string;
  plan: BillingPlanId;
  orderId: string;
  paymentId: string;
  amount: number;
  couponCode?: string | null;
  discountAmount?: number;
  currency?: string;
  status: 'pending' | 'active' | 'cancelled' | 'expired';
  paymentHistoryEntry?: {
    paymentId: string;
    orderId: string;
    amount: number;
    status: string;
  };
  endDate?: Date;
  startDate?: Date;
  syncUserPlan?: boolean;
}) {
  const planDetails = getPlanDetails(params.plan);

  const subscription = await Subscription.findOneAndUpdate(
    { userId: params.userId },
    {
      userId: params.userId,
      plan: params.plan,
      status: params.status,
      orderId: params.orderId,
      paymentId: params.paymentId,
      amount: params.amount,
      baseAmount: params.amount + (params.discountAmount || 0),
      discountAmount: params.discountAmount || 0,
      couponCode: params.couponCode || null,
      currency: params.currency || 'INR',
      documentsLimit: planDetails.documentsLimit,
      startDate: params.startDate,
      endDate: params.endDate,
      paymentHistory: params.paymentHistoryEntry ? [params.paymentHistoryEntry] : undefined,
    },
    { upsert: true, new: true }
  );

  if (params.syncUserPlan !== false) {
    await User.findByIdAndUpdate(params.userId, {
      subscriptionPlan: params.plan,
    });
  }

  return subscription;
}

export const BillingService = {
  async createCheckoutOrder(input: {
    userId: string;
    planId: string;
    couponCode?: string | null;
    email?: string;
    currency?: string; // display currency, e.g. 'USD'
  }): Promise<CheckoutOrderResult> {
    await connectDB();
    await ensureUserExists(input.userId);

    const planId = normalizePlanId(input.planId);
    const planDetails = getPlanDetails(planId);
    const couponResult = await validateCoupon(planId, input.couponCode);
    const finalAmount = Math.max(0, planDetails.price - couponResult.discountAmount);

    const displayCurrency = input.currency || 'USD';

    const quote: BillingQuote = {
      planId,
      planName: planDetails.name,
      documentsLimit: planDetails.documentsLimit,
      baseAmount: planDetails.price,
      discountAmount: couponResult.discountAmount,
      finalAmount: Math.round(finalAmount * 100) / 100,
      couponCode: couponResult.coupon?.code || null,
      currency: displayCurrency,
    };
    // Gateway currency (Razorpay) expected in INR; convert from display currency
    const GATEWAY_CURRENCY = process.env.PAYMENT_GATEWAY_CURRENCY || 'INR';
    const FX_USD_TO_INR = Number(process.env.FX_USD_INR || '82.5');

    let gatewayAmountPaise = Math.round(quote.finalAmount * 100); // default if gateway uses same currency
    if (displayCurrency === 'USD' && GATEWAY_CURRENCY === 'INR') {
      gatewayAmountPaise = Math.round(quote.finalAmount * FX_USD_TO_INR * 100);
    }

    const order = await RazorpayService.createOrder({
      amount: gatewayAmountPaise,
      currency: GATEWAY_CURRENCY,
      receipt: buildReceipt(input.userId, planId),
      notes: {
        userId: input.userId,
        plan: planId,
        email: input.email || '',
        couponCode: quote.couponCode || '',
        baseAmount: String(quote.baseAmount),
        discountAmount: String(quote.discountAmount),
        displayAmount: String(quote.finalAmount),
        displayCurrency: displayCurrency,
      },
    });

    await logPaymentEvent({
      idempotencyKey: `order:${order.id}`,
      source: 'order',
      eventType: 'order_created',
      userId: input.userId,
      plan: planId,
      orderId: order.id,
      amount: quote.finalAmount,
      currency: displayCurrency,
      couponCode: quote.couponCode,
      discountAmount: quote.discountAmount,
      status: 'created',
      payload: { order, quote },
    });

    await syncSubscriptionAndUser({
      userId: input.userId,
      plan: planId,
      orderId: order.id,
      paymentId: '',
      amount: quote.finalAmount,
      couponCode: quote.couponCode,
      discountAmount: quote.discountAmount,
      currency: displayCurrency,
      status: 'pending',
      syncUserPlan: false,
    });

    return {
      orderId: order.id,
      amount: Number(order.amount),
      keyId: process.env.RAZORPAY_KEY_ID,
      quote,
    };
  },

  async verifyAndFinalizePayment(input: FinalizePaymentInput) {
    await connectDB();
    await ensureUserExists(input.userId);

    const existing = await PaymentEvent.findOne({
      idempotencyKey: `payment:${input.paymentId}`,
    });

    if (existing?.status === 'processed' && existing.processedAt) {
      const subscription = await Subscription.findOne({ userId: input.userId });
      return { subscription, paymentEvent: existing, alreadyProcessed: true };
    }

    if (input.source === 'callback') {
      if (!input.signature) {
        throw new Error('Missing payment signature');
      }

      const isValid = RazorpayService.verifyPaymentSignature(
        input.orderId,
        input.paymentId,
        input.signature
      );

      if (!isValid) {
        throw new Error('Invalid payment signature');
      }
    }

    const payment = await RazorpayService.fetchPayment(input.paymentId);
    if (payment.status !== 'captured') {
      throw new Error('Payment not captured');
    }

    const subscription = await Subscription.findOne({ userId: input.userId, orderId: input.orderId });
    const planId = (input.planId || subscription?.plan || 'starter') as BillingPlanId;

    // Determine display amounts/currency from pending subscription if present
    const paymentAmount = Number(payment.amount);
    const displayAmount = subscription?.amount ?? Math.round((paymentAmount / 100) * 100) / 100;
    const displayCurrency = subscription?.currency || 'INR';

    // Gateway amount and currency
    const gatewayAmount = paymentAmount / 100;
    const gatewayCurrency = payment.currency || 'INR';

    const finalizedSubscription = await syncSubscriptionAndUser({
      userId: input.userId,
      plan: planId,
      orderId: input.orderId,
      paymentId: input.paymentId,
      amount: displayAmount,
      couponCode: input.couponCode || subscription?.couponCode || null,
      discountAmount: subscription?.discountAmount || 0,
      currency: displayCurrency,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentHistoryEntry: {
        paymentId: input.paymentId,
        orderId: input.orderId,
        amount: gatewayAmount,
        status: 'completed',
      },
    });

    const paymentEvent = await logPaymentEvent({
      idempotencyKey: `payment:${input.paymentId}`,
      source: input.source,
      eventType: input.eventType || 'payment_verified',
      userId: input.userId,
      plan: planId,
      orderId: input.orderId,
      paymentId: input.paymentId,
      amount: displayAmount,
      currency: displayCurrency,
      couponCode: input.couponCode || subscription?.couponCode || null,
      discountAmount: subscription?.discountAmount || 0,
      status: 'processed',
      signatureVerified: input.signatureVerified ?? input.source === 'webhook',
      processedAt: new Date(),
      payload: input.rawPayload || { payment, gatewayAmount, gatewayCurrency },
    });

    return { subscription: finalizedSubscription, paymentEvent, alreadyProcessed: false };
  },

  verifyWebhookSignature(rawBody: string, signature: string | null) {
    if (!signature) {
      return false;
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured');
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return expectedSignature === signature;
  },
};