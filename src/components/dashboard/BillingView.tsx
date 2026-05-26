'use client';

import { useEffect, useState } from 'react';
import UpgradePlanModal from './UpgradePlanModal';
import api from '@/lib/api';

type SubscriptionInfo = {
  plan: string;
  planName?: string;
  documentsLimit?: number;
  documentsUsed?: number;
  documentsRemaining?: number;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
};

export default function BillingView() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingEmail, setBillingEmail] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const fetchSubscription = async () => {
      try {
        const res = await api.get('/subscriptions/current');
        const data = res.data?.data;
        if (!mounted) return;
        setSubscription({
          plan: data?.plan || 'free',
          planName: data?.planName || (data?.plan || 'free'),
          documentsLimit: data?.documentsLimit,
          documentsUsed: data?.documentsUsed,
          documentsRemaining: data?.documentsRemaining,
          status: data?.status,
          startDate: data?.startDate || null,
          endDate: data?.endDate || null,
        });
      } catch {
        // silent fail, subscription will remain null
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSubscription();

    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('email') || '';
      if (mounted) setBillingEmail(email);
    }

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-(--bg-page)" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--text-tertiary)">
            Billing
          </p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-(--text-primary)">
            Billing & Subscription
          </h1>
          <p className="max-w-2xl text-sm md:text-base leading-6 text-(--text-secondary)">
            Review your current plan, document quota, and payment details in one place.
          </p>
        </div>

        <section className="app-card p-5 md:p-6 space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-tertiary)">
                Current Plan
              </p>
              <h2 className="text-2xl font-medium text-(--text-primary) capitalize">
                {loading ? 'Loading plan' : subscription?.planName || subscription?.plan || 'Free'}
              </h2>
              <p className="text-sm text-(--text-secondary)">
                {subscription?.status
                  ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
                  : 'Active'}
              </p>
            </div>

            <div className="inline-flex items-center self-start rounded-full border border-(--border-subtle) bg-(--bg-surface-highlight) px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-(--text-secondary)">
              {subscription?.plan === 'free' ? 'Free Tier' : 'Paid Tier'}
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-(--text-secondary)">Loading current plan…</div>
          ) : subscription ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-(--border-subtle) bg-(--bg-surface) p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-tertiary)">Used</p>
                <p className="mt-2 text-2xl font-medium text-(--text-primary)">
                  {typeof subscription.documentsUsed === 'number' ? subscription.documentsUsed : 0}
                </p>
              </div>

              <div className="rounded-2xl border border-(--border-subtle) bg-(--bg-surface) p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-tertiary)">Limit</p>
                <p className="mt-2 text-2xl font-medium text-(--text-primary)">
                  {typeof subscription.documentsLimit === 'number' ? subscription.documentsLimit : '—'}
                </p>
              </div>

              <div className="rounded-2xl border border-(--border-subtle) bg-(--bg-surface) p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-tertiary)">Remaining</p>
                <p className="mt-2 text-2xl font-medium text-(--text-primary)">
                  {typeof subscription.documentsRemaining === 'number' ? subscription.documentsRemaining : '—'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-(--text-secondary)">No subscription information available.</div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-medium text-(--text-primary)">Subscription Plans</h2>
            <p className="text-sm text-(--text-secondary) mt-1">
              Compare plans and upgrade when you need more documents or features.
            </p>
          </div>
          <div className="app-card p-4 md:p-5">
            <UpgradePlanModal />
          </div>
        </section>

        {subscription?.plan && subscription.plan !== 'free' && (
          <section className="app-card p-5 md:p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-medium text-(--text-primary)">Billing Information</h2>
                <p className="text-sm text-(--text-secondary) mt-1">
                  Keep your billing details and renewal date in view.
                </p>
              </div>
            </div>

            <div className="divide-y divide-(--border-subtle)/80">
              <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-(--text-secondary)">Billing Email</span>
                <span className="text-sm font-medium text-(--text-primary)">
                  {billingEmail || '—'}
                </span>
              </div>
              <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-(--text-secondary)">Renewal Date</span>
                <span className="text-sm font-medium text-(--text-primary)">
                  {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'Coming Soon'}
                </span>
              </div>
              <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-(--text-secondary)">Payment Method</span>
                <span className="text-sm font-medium text-(--text-primary)">Card ending in ****</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
