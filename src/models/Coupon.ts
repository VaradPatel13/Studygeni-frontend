import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxUses: {
      type: Number,
      default: -1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    applicablePlans: [
      {
        type: String,
        enum: ['starter', 'professional', 'enterprise', 'all'],
      },
    ],
    minPlanPrice: {
      type: Number,
      default: 0,
    },
    expiryDate: Date,
    active: {
      type: Boolean,
      default: true,
    },
    description: String,
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);