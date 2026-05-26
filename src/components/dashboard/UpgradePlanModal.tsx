'use client';

import { useState, useEffect } from 'react';
import { pricingPlans } from '@/lib/pricingPlans';
import formatPrice from '@/lib/formatCurrency';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import PaymentCheckout from './PaymentCheckout';

export default function UpgradePlanModal() {
  const [currentPlan, setCurrentPlan] = useState<string>('starter');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/current');
      setCurrentPlan(response.data?.data?.plan || 'starter');
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    if (planId === currentPlan) {
      toast.error('You are already on this plan');
      return;
    }
    setSelectedPlan(planId);
  };

  const handleClose = () => {
    setSelectedPlan(null);
  };

  const getPlanIndex = (planId: string) => {
    return pricingPlans.findIndex((p) => p.id === planId);
  };

  const canUpgrade = (planId: string) => {
    return getPlanIndex(planId) > getPlanIndex(currentPlan);
  };

  if (isLoading) return null;

  const visiblePlans = pricingPlans.filter((p) => p.id !== 'free');

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        {visiblePlans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan;
          const canUpgradePlan = canUpgrade(plan.id);

          return (
            <article
              key={plan.id}
              className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-(--bg-surface) transition-all duration-200 ${
                plan.isPopular
                  ? 'border-(--color-brand-blue) shadow-[0_10px_30px_-24px_var(--color-brand-blue)]'
                  : isCurrentPlan
                  ? 'border-(--color-brand-blue)/60'
                  : 'border-(--border-subtle) hover:border-(--border-focus)'
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute right-4 top-4 rounded-full border border-(--border-subtle) bg-(--bg-surface-highlight) px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-(--text-secondary)">
                  Current plan
                </div>
              )}
              {plan.isPopular && (
                <div className="bg-(--color-brand-blue) px-4 py-2 text-center text-xs font-semibold tracking-[0.2em] text-white">
                  Most Popular
                </div>
              )}

              <div className="flex h-full flex-col p-6 md:p-7">
                <div className="min-h-[200px] space-y-4">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-(--text-primary) md:text-3xl md:leading-tight">
                      {plan.name}
                    </h3>
                    <p className="mt-2 max-w-[26ch] text-sm leading-6 text-(--text-secondary)">{plan.description}</p>
                  </div>

                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-(--text-primary) md:text-5xl">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="pb-1 text-base font-medium text-(--text-secondary)">{plan.period}</span>
                  </div>

                  <p className="text-sm text-(--text-secondary)">
                    {plan.documentsLimit > 999999
                      ? 'Unlimited documents'
                      : `${plan.documentsLimit} documents`}
                    {plan.freeDocuments ? ` + ${plan.freeDocuments} free` : ''}
                  </p>
                </div>

                <div className="mt-5 border-t border-(--border-subtle) pt-4">
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full rounded-xl border border-(--border-subtle) bg-(--bg-surface-highlight) px-4 py-2.5 text-sm font-semibold text-(--text-secondary)"
                    >
                      Your Plan
                    </button>
                  ) : canUpgradePlan ? (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      className="w-full rounded-xl bg-(--color-brand-blue) px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      {plan.ctaText}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full rounded-xl border border-(--border-subtle) bg-(--bg-surface-highlight) px-4 py-2.5 text-sm font-semibold text-(--text-secondary)"
                    >
                      Downgrade
                    </button>
                  )}
                </div>

                <ul className="mt-5 space-y-2.5 pt-1">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-(--color-brand-blue)" />
                      ) : (
                        <div className="mt-0.5 h-4 w-4 shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? 'text-(--text-secondary)'
                            : 'text-(--text-tertiary) line-through opacity-70'
                        }`}
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>

      {/* Razorpay Checkout */}
      {selectedPlan && (
        <PaymentCheckout
          planId={selectedPlan}
          onSuccess={() => {
            setCurrentPlan(selectedPlan);
            setSelectedPlan(null);
            toast.success('Subscription updated successfully!');
            fetchCurrentSubscription();
          }}
          onClose={handleClose}
        />
      )}
    </>
  );
}
