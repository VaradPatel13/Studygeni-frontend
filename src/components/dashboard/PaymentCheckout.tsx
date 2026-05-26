'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import CouponInput from './CouponInput';
import { AppliedCoupon } from '@/types/coupon';
import { pricingPlans, PricingPlan } from '@/lib/pricingPlans';
import formatPrice from '@/lib/formatCurrency';

interface PaymentCheckoutProps {
  planId: string;
  onSuccess: () => void;
  onClose: () => void;
}

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => Promise<void> | void;
  prefill?: { email?: string };
  notes?: Record<string, unknown>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

type RazorpayConstructor = new (options: RazorpayOptions) => { open: () => void };

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export default function PaymentCheckout({
  planId,
  onSuccess,
  onClose,
}: PaymentCheckoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [orderAmount, setOrderAmount] = useState(0);
  const [planDetails, setPlanDetails] = useState<PricingPlan | null>(null);
  const [billingEmail, setBillingEmail] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.email) setBillingEmail(user.email);
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  useEffect(() => {
    const initializeCheckout = async () => {
    try {
      // Get plan details
      const plan = pricingPlans.find((p) => p.id === planId);
      if (!plan) {
        toast.error('Invalid plan');
        onClose();
        return;
      }

      setPlanDetails(plan);
      setOrderAmount(plan.price);

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setIsLoading(false);
      };
      document.body.appendChild(script);
    } catch (error: unknown) {
      console.error('Failed to initialize checkout:', error);
      const msg = error instanceof Error ? error.message : 'Failed to initialize payment';
      toast.error(msg);
      onClose();
    }
    };

    initializeCheckout();
  }, [planId, onClose]);

  const handleCouponApplied = (coupon: AppliedCoupon) => {
    setAppliedCoupon(coupon);
    setOrderAmount(coupon.finalAmount);
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
    setOrderAmount(planDetails?.price || 0);
  };

  const createOrder = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/payments/create-order', {
        plan: planId,
        couponCode: appliedCoupon?.code,
        currency: 'USD',
      });

      const { orderId, amount, keyId } = response.data.data;
      handlePayment(orderId, amount, keyId);
    } catch (error: unknown) {
      console.error('Failed to create order:', error);
      const msg =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null
          ? JSON.stringify(error)
          : String(error);
      toast.error(msg);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = (orderId: string, amount: number, keyId: string) => {
    if (!window.Razorpay) {
      toast.error('Razorpay not loaded');
      return;
    }

    const options = {
      key: keyId,
      amount: amount,
      currency: 'INR',
      name: 'StudyMate.io',
      description: `Upgrade to ${planId} plan`,
      order_id: orderId,
      handler: async (response: RazorpayHandlerResponse) => {
        await verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
      },
      prefill: {
        email: localStorage.getItem('userEmail') || '',
      },
      notes: {
        couponCode: appliedCoupon?.code || '',
        discountAmount: appliedCoupon?.discountAmount || 0,
      },
      theme: {
        color: '#4f46e5',
      },
      modal: {
        ondismiss: () => {
          setIsLoading(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const verifyPayment = async (orderId: string, paymentId: string, signature: string) => {
    try {
      setIsLoading(true);
      const response = await api.post('/payments/verify', {
        orderId,
        paymentId,
        signature,
        couponCode: appliedCoupon?.code,
      });

      if (response.data.success) {
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (error: unknown) {
      console.error('Payment verification failed:', error);
      const msg =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null
          ? JSON.stringify(error)
          : String(error);
      toast.error(msg);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !planDetails) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div className="app-card w-full max-w-3xl mx-4 p-8 text-center shadow-2xl">
          <div className="mx-auto w-12 h-12 rounded-2xl border border-(--border-subtle) bg-(--bg-surface-highlight) flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-brand-blue border-t-transparent animate-spin" />
          </div>
          <p className="text-(--text-secondary) mt-4 font-medium">Preparing checkout...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="app-card max-w-3xl w-full p-5 md:p-6 shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-tertiary)">
              Secure checkout
            </p>
            <h3 className="text-xl md:text-2xl font-medium tracking-tight text-(--text-primary)">
              Complete Your Purchase
            </h3>
            <p className="text-sm text-(--text-secondary)">
              Upgrade to {planDetails?.name} plan
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-app h-10 w-10 rounded-full border border-(--border-subtle) bg-(--bg-surface-highlight) text-(--text-secondary) hover:text-(--text-primary) disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Two Columns Grid Layout on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Column: Plan Summary and Coupon */}
          <div className="space-y-4">
            {/* Plan Summary */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-sm relative overflow-hidden">
              {/* Subtle design gradient glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-brand-blue)]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
                    Selected Plan
                  </p>
                  <div className="space-y-1">
                    <span className="block text-base font-bold text-[var(--text-primary)]">{planDetails?.name} Plan</span>
                    <span className="block text-xs text-[var(--text-secondary)] font-medium">
                      {planDetails?.documentsLimit && planDetails.documentsLimit > 999999
                        ? 'Unlimited documents included'
                        : `Exactly ${planDetails?.documentsLimit} documents included`}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-[var(--color-brand-blue)]/20 bg-[var(--color-brand-blue)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-blue)] shadow-sm">
                  {planDetails ? formatPrice(planDetails.price, planDetails.currency) + `/${planDetails.period}` : ''}
                </span>
              </div>
            </div>

            {/* Coupon Input */}
            <CouponInput
              planId={planId}
              originalAmount={planDetails?.price || 0}
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
            />
          </div>

          {/* Right Column: Price Breakdown and Proceed Button */}
          <div className="space-y-4">
            {/* Price Breakdown */}
            <div className="space-y-4 p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] block">
                Order Summary
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
                  <span>Subtotal</span>
                  <span className="text-[var(--text-primary)] font-semibold">{formatPrice(planDetails?.price)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10 animate-fade-in">
                    <span>
                      Promo Discount ({appliedCoupon.discountType === 'percentage'
                        ? `${appliedCoupon.discountValue}%`
                        : formatPrice(appliedCoupon.discountValue)})
                    </span>
                    <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                  </div>
                )}

                <div className="h-px bg-[var(--border-subtle)] my-1"></div>
                
                <div className="flex items-center justify-between text-sm font-bold text-[var(--text-primary)]">
                  <span>Total Amount</span>
                  <span className="text-base text-[var(--color-brand-blue)]">{formatPrice(orderAmount)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={createOrder}
              disabled={isLoading}
              className="btn-app btn-primary w-full h-12 rounded-full px-5 text-sm font-bold shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2 bg-[var(--color-brand-blue)] text-white hover:bg-blue-600"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Pay & Start Learning</span>
                  <span className="opacity-40">•</span>
                  <span>{formatPrice(orderAmount)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
