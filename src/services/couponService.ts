import api, { cleanErrorMessage } from '@/lib/api';
import { CouponValidationResponse } from '@/types/coupon';

export const couponService = {
 
  async validateCoupon(
    couponCode: string,
    planId: string,
    originalAmount: number
  ): Promise<CouponValidationResponse> {
    try {
      const response = await api.post('/payments/validate-coupon', {
        couponCode,
        planId,
        originalAmount,
      }, {
        headers: { 'x-skip-global-error': 'true' }
      });
      return response.data?.data || response.data;
    } catch (error: unknown) {
      const message = cleanErrorMessage(error, 'Invalid coupon code');
      return {
        valid: false,
        error: message,
      };
    }
  },

  
  async getAvailableCoupons() {
    try {
      const response = await api.get('/payments/coupons');
      return response.data?.data || [];
    } catch (error: unknown) {
      console.error('Failed to fetch coupons:', error);
      return [];
    }
  },

  async createCoupon(couponData: Record<string, unknown>) {
    try {
      const response = await api.post('/payments/coupons', couponData);
      return response.data?.data;
    } catch (error: unknown) {
      throw error;
    }
  },


  calculateDiscount(
    originalAmount: number,
    discountType: 'percentage' | 'fixed',
    discountValue: number
  ): { discountAmount: number; finalAmount: number } {
    let discountAmount = 0;

    if (discountType === 'percentage') {
      discountAmount = (originalAmount * discountValue) / 100;
    } else if (discountType === 'fixed') {
      discountAmount = Math.min(discountValue, originalAmount); // Cannot exceed original amount
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return {
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100,
    };
  },

 
  formatCouponInfo(coupon: { discountType: string; discountValue: number }): string {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    }
    return `$${coupon.discountValue} OFF`;
  },
};
