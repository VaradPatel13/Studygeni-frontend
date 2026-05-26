import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface CreateOrderParams {
  amount: number; // in paise (amount * 100)
  currency: string;
  receipt: string;
  notes?: {
    userId: string;
    plan: string;
    email: string;
    couponCode?: string;
    baseAmount?: string;
    discountAmount?: string;
    displayAmount?: string;
    displayCurrency?: string;
  };
}

export class RazorpayService {

  static async createOrder(params: CreateOrderParams) {
    try {
      const order = await razorpay.orders.create({
        amount: params.amount,
        currency: params.currency,
        receipt: params.receipt,
        notes: params.notes,
      });
      return order;
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw error;
    }
  }


  static verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    try {
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }


  static async fetchPayment(paymentId: string) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Razorpay payment fetch error:', error);
      throw error;
    }
  }


  static async createRefund(paymentId: string, amount?: number) {
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount,
      });
      return refund;
    } catch (error) {
      console.error('Razorpay refund error:', error);
      throw error;
    }
  }


  static async createSubscriptionPlan(params: {
    period: string;
    interval: number;
    period_count?: number;
    notes?: Record<string, any>;
  }) {
    try {
      const plan = await razorpay.plans.create(params as any);
      return plan;
    } catch (error) {
      console.error('Razorpay plan creation error:', error);
      throw error;
    }
  }


  static async createSubscription(params: {
    plan_id: string;
    customer_notify: number;
    quantity?: number;
    total_count?: number;
    notes?: Record<string, any>;
  }) {
    try {
      const subscription = await razorpay.subscriptions.create(params as any);
      return subscription;
    } catch (error) {
      console.error('Razorpay subscription creation error:', error);
      throw error;
    }
  }


  static async fetchSubscription(subscriptionId: string) {
    try {
      const subscription = await razorpay.subscriptions.fetch(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Razorpay subscription fetch error:', error);
      throw error;
    }
  }
}

export default razorpay;
