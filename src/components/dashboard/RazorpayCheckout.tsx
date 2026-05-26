'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface RazorpayCheckoutProps {
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
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

type RazorpayConstructor = new (options: RazorpayOptions) => { open: () => void };

export default function RazorpayCheckout({
  planId,
  onSuccess,
  onClose,
}: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        createOrder();
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('Failed to load Razorpay:', error);
      toast.error('Failed to initialize payment');
      onClose();
    }
  };

  const createOrder = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/payments/create-order', { plan: planId, currency: 'USD' });
      const { orderId, amount, keyId } = response.data.data;

      handlePayment(orderId, amount, keyId);
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error?.response?.data?.message || 'Failed to create order');
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
      theme: {
        color: '#4f46e5',
      },
      modal: {
        ondismiss: () => {
          onClose();
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const verifyPayment = async (
    orderId: string,
    paymentId: string,
    signature: string
  ) => {
    try {
      setIsLoading(true);
      const response = await api.post('/payments/verify', {
        orderId,
        paymentId,
        signature,
      });

      if (response.data.success) {
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Payment verification failed:', error);
      toast.error(error?.response?.data?.message || 'Payment verification failed');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-[#1a1b1e] rounded-lg p-6 text-center">
          <div className="w-8 h-8 border-4 border-[var(--color-brand-blue)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[var(--text-secondary)] mt-3">Processing payment...</p>
        </div>
      </div>
    );
  }

  return null;
}
