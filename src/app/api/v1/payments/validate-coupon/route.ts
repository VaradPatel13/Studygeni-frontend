import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/server/response';
import connectDB from '@/lib/server/db';
import { pricingPlans } from '@/lib/pricingPlans';
import Coupon from '@/models/Coupon';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { couponCode, planId, originalAmount } = body;

    if (!couponCode || !planId) {
      return sendError('Coupon code and plan are required', 'INVALID_REQUEST', 400);
    }

    await connectDB();

    // Get coupon model
    // Find coupon
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      active: true,
    });

    if (!coupon) {
      return sendError('Invalid coupon code', 'COUPON_NOT_FOUND', 400);
    }

    // Check if coupon is expired
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return sendError('Coupon has expired', 'COUPON_EXPIRED', 400);
    }

    // Check if coupon has reached max uses
    if (coupon.maxUses !== -1 && coupon.usedCount >= coupon.maxUses) {
      return sendError('Coupon usage limit reached', 'COUPON_LIMIT_EXCEEDED', 400);
    }

    // Check if coupon applies to this plan
    if (
      coupon.applicablePlans.length > 0 &&
      !coupon.applicablePlans.includes('all') &&
      !coupon.applicablePlans.includes(planId)
    ) {
      return sendError('Coupon is not applicable to this plan', 'COUPON_NOT_APPLICABLE', 400);
    }

    // Get plan details
    const planDetails = pricingPlans.find((p) => p.id === planId);
    if (!planDetails) {
      return sendError('Invalid plan', 'INVALID_PLAN', 400);
    }

    // Check minimum plan price
    if (coupon.minPlanPrice && planDetails.price < coupon.minPlanPrice) {
      return sendError(
        `Coupon requires minimum plan price of $${coupon.minPlanPrice}`,
        'MINIMUM_PRICE_NOT_MET',
        400
      );
    }

    const baseAmount = originalAmount ?? planDetails.price;

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (baseAmount * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(coupon.discountValue, baseAmount);
    }

    const finalAmount = Math.max(0, baseAmount - discountAmount);

    return sendSuccess('Coupon validated successfully', {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100,
    });
  } catch (error: unknown) {
    console.error('Coupon validation error:', error);
    return sendError(
      error instanceof Error ? error.message : 'Failed to validate coupon',
      'VALIDATION_ERROR',
      500
    );
  }
}
