import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/server/response';
import connectDB from '@/lib/server/db';
import Subscription from '@/models/Subscription';
import Document from '@/models/Document';
import User from '@/models/User';

const DEFAULT_FREE_LIMIT = 3;

async function getDocumentUsage(userId: string, subscription?: any, activePlan?: string) {
  let documentsUsed = 0;
  
  if (activePlan && activePlan !== 'free' && subscription && subscription.status === 'active' && subscription.startDate) {
    documentsUsed = await Document.countDocuments({
      userId,
      uploadDate: { $gte: subscription.startDate },
    });
  } else {
    documentsUsed = await Document.countDocuments({ userId });
  }

  return documentsUsed;
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;

    await connectDB();

    const [user, subscription] = await Promise.all([
      User.findById(userId).select('subscriptionPlan'),
      Subscription.findOne({ userId }).sort({ updatedAt: -1 }),
    ]);

    const activePlan = user?.subscriptionPlan || 'free';
    const activePlanDetails = activePlan === 'free'
      ? { plan: 'free', planName: 'Free', documentsLimit: DEFAULT_FREE_LIMIT }
      : subscription && subscription.status === 'active'
        ? {
            plan: subscription.plan,
            planName: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1),
            documentsLimit: subscription.documentsLimit,
          }
        : {
            plan: activePlan,
            planName: activePlan.charAt(0).toUpperCase() + activePlan.slice(1),
            documentsLimit: DEFAULT_FREE_LIMIT,
          };

    const documentsUsed = await getDocumentUsage(userId, subscription, activePlanDetails.plan);
    const pendingPlan = subscription && subscription.status === 'pending' ? subscription.plan : null;

    return sendSuccess('Subscription fetched', {
      plan: activePlanDetails.plan,
      planName: activePlanDetails.planName,
      status: 'active',
      documentsLimit: activePlanDetails.documentsLimit,
      documentsUsed: documentsUsed,
      documentsRemaining: Math.max(activePlanDetails.documentsLimit - documentsUsed, 0),
      pendingPlan,
      pendingStatus: subscription?.status === 'pending' ? 'pending' : null,
      pendingOrderId: subscription?.status === 'pending' ? subscription.orderId : null,
      pendingAmount: subscription?.status === 'pending' ? subscription.amount : null,
      pendingCouponCode: subscription?.status === 'pending' ? subscription.couponCode : null,
    });
  } catch (error: unknown) {
    console.error('Get subscription error:', error);
    return sendError(
      error instanceof Error ? error.message : 'Failed to fetch subscription',
      'FETCH_ERROR',
      500
    );
  }
}
