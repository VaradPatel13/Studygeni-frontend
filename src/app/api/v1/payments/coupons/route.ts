import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/server/response';
import connectDB from '@/lib/server/db';
import Coupon from '@/models/Coupon';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get active coupons only
    const coupons = await Coupon.find({ active: true });

    return sendSuccess('Coupons retrieved successfully', {
      count: coupons.length,
      coupons,
    });
  } catch (error: any) {
    console.error('Failed to fetch coupons:', error);
    return sendError(
      error.message || 'Failed to fetch coupons',
      'FETCH_ERROR',
      500
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      maxUses,
      applicablePlans,
      minPlanPrice,
      expiryDate,
      description,
    } = body;

    // Validate required fields
    if (!code || !discountType || discountValue === undefined) {
      return sendError(
        'Code, discount type, and discount value are required',
        'VALIDATION_ERROR',
        400
      );
    }

    if (!['percentage', 'fixed'].includes(discountType)) {
      return sendError(
        'Discount type must be percentage or fixed',
        'INVALID_TYPE',
        400
      );
    }

    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return sendError(
        'Percentage discount must be between 0 and 100',
        'INVALID_VALUE',
        400
      );
    }

    await connectDB();

    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (existingCoupon) {
      return sendError('Coupon code already exists', 'DUPLICATE_CODE', 400);
    }

    // Create new coupon
    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxUses: maxUses || -1,
      applicablePlans: applicablePlans || [],
      minPlanPrice: minPlanPrice || 0,
      expiryDate,
      description,
      active: true,
    });

    return sendSuccess('Coupon created successfully', newCoupon);
  } catch (error: any) {
    console.error('Failed to create coupon:', error);
    return sendError(
      error.message || 'Failed to create coupon',
      'CREATE_ERROR',
      500
    );
  }
}
