 'use client';

import { useState } from 'react';
import { AppliedCoupon } from '@/types/coupon';
import { couponService } from '@/services/couponService';
import toast from 'react-hot-toast';
import formatPrice from '@/lib/formatCurrency';

interface CouponInputProps {
  planId: string;
  originalAmount: number;
  onCouponApplied: (coupon: AppliedCoupon) => void;
  onCouponRemoved: () => void;
}

export default function CouponInput({
  planId,
  originalAmount,
  onCouponApplied,
  onCouponRemoved,
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [showInput, setShowInput] = useState(true);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsLoading(true);

    try {
      const result = await couponService.validateCoupon(
        couponCode,
        planId,
        originalAmount
      );

      if (result.valid && result.discountAmount !== undefined && result.finalAmount !== undefined) {
        const coupon: AppliedCoupon = {
          code: result.code!,
          discountType: result.discountType!,
          discountValue: result.discountValue!,
          discountAmount: result.discountAmount,
          finalAmount: result.finalAmount,
        };

        setAppliedCoupon(coupon);
        onCouponApplied(coupon);
        setShowInput(false);
        toast.success(`Coupon applied! You saved ${formatPrice(result.discountAmount)}`);
      } else {
        toast.error(result.error || 'Invalid coupon code');
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error('Failed to validate coupon');
      console.error('Coupon validation error:', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setShowInput(true);
    onCouponRemoved();
    toast.success('Coupon removed');
  };

  if (appliedCoupon) {
    return (
      <div className="space-y-2 animate-fade-in">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--text-tertiary) block">
          Coupon Code
        </label>
        <div className="flex items-center justify-between h-11 px-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono font-bold tracking-wider text-xs uppercase bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">{appliedCoupon.code}</span>
            <span className="text-xs font-semibold">({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : formatPrice(appliedCoupon.discountValue)} OFF) applied</span>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline transition-all"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  if (!showInput) {
    return null;
  }

  return (
    <div className="space-y-2 animate-fade-in">
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--text-tertiary) block">
        Coupon Code
      </label>
      <form onSubmit={handleApplyCoupon} className="relative flex items-center w-full">
        <input
          type="text"
          placeholder="Promo / Coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          disabled={isLoading}
          className="w-full h-11 pr-24 rounded-2xl border border-(--border-subtle) bg-(--bg-surface-highlight) pl-4 text-sm font-medium text-(--text-primary) placeholder:text-(--text-tertiary) outline-none transition-all focus:border-(--border-focus) focus:bg-(--bg-page) focus:ring-4 focus:ring-(--border-focus)/10 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-1.5 top-1.5 bottom-1.5 h-8 px-4 rounded-xl text-xs font-bold bg-[var(--color-brand-blue)] hover:bg-blue-600 text-white disabled:opacity-60 transition-all active:scale-95 shadow-sm"
        >
          {isLoading ? '...' : 'Apply'}
        </button>
      </form>
    </div>
  );
}
