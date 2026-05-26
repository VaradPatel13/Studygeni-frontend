import mongoose from 'mongoose';

const paymentEventSchema = new mongoose.Schema(
  {
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      default: 'razorpay',
    },
    source: {
      type: String,
      enum: ['order', 'callback', 'webhook'],
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      required: true,
    },
    orderId: {
      type: String,
      index: true,
    },
    paymentId: {
      type: String,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    couponCode: {
      type: String,
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['created', 'verified', 'processed', 'failed'],
      default: 'created',
    },
    signatureVerified: {
      type: Boolean,
      default: false,
    },
    processedAt: {
      type: Date,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
    },
    errorMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PaymentEvent || mongoose.model('PaymentEvent', paymentEventSchema);