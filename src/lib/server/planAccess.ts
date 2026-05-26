import { pricingPlans } from '@/lib/pricingPlans';
import User from '@/models/User';

export type PremiumFeature =
  | 'Quiz generation'
  | 'Chat with documents'
  | 'Advanced analytics'
  | 'Concept explanations'
  | 'YouTube summaries';

export type PlanId = 'free' | 'starter' | 'professional' | 'enterprise';

function getPlan(planId: PlanId) {
  const plan = pricingPlans.find((item) => item.id === planId);
  return plan || pricingPlans.find((item) => item.id === 'free')!;
}

export function planHasFeature(planId: PlanId, featureName: PremiumFeature) {
  const plan = getPlan(planId);
  return plan.features.some((feature) => feature.name === featureName && feature.included);
}

export async function getUserPlan(userId: string): Promise<PlanId> {
  const user = await User.findById(userId).select('subscriptionPlan');
  return (user?.subscriptionPlan || 'free') as PlanId;
}

export async function assertUserHasFeature(userId: string, featureName: PremiumFeature) {
  const planId = await getUserPlan(userId);

  if (!planHasFeature(planId, featureName)) {
    const message = `Upgrade required to access ${featureName.toLowerCase()}`;
    const error = new Error(message);
    error.name = 'FEATURE_NOT_AVAILABLE';
    throw error;
  }

  return planId;
}
