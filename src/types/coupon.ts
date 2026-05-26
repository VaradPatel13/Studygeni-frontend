// Coupon Types and Interfaces
export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percentage (0-100) or fixed amount
  maxUses: number;
  usedCount: number;
  applicablePlans: string[]; // ['starter', 'professional', 'enterprise']
  minPlanPrice?: number; // minimum plan price to apply
  expiryDate: Date;
  active: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponValidationRequest {
  couponCode: string;
  planId: string;
  originalAmount: number;
}

export interface CouponValidationResponse {
  valid: boolean;
  code?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount?: number;
  finalAmount?: number;
  message?: string;
  error?: string;
}

export interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
}
