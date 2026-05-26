import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'active',
    },
    documentsLimit: {
      type: Number,
      required: true,
    },
    documentsUsed: {
      type: Number,
      default: 0,
    },
    baseAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: null,
    },
    razorpaySubscriptionId: {
      type: String,
      sparse: true,
    },
    razorpayCustomerId: {
      type: String,
      sparse: true,
    },
    paymentId: {
      type: String,
      sparse: true,
    },
    orderId: {
      type: String,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    renewalDate: {
      type: Date,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    paymentHistory: [
      {
        paymentId: String,
        orderId: String,
        amount: Number,
        status: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
