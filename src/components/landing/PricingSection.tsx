'use client';

import { pricingPlans } from '@/lib/pricingPlans';
import PricingCard from './PricingCard';

export default function PricingSection() {
  return (
    <section className="py-20 px-4 bg-white dark:bg-[#121212]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-medium text-[var(--text-primary)] mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Choose the right plan for your learning needs. Change anytime.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans
            .filter((p) => p.id !== 'free')
            .map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
        </div>

        {/* FAQ Section */}
        <div className="border-t border-[#e0e0e0] dark:border-[#2c2c2c] pt-16">
          <h3 className="text-2xl font-medium text-[var(--text-primary)] mb-8 text-center">
            Frequently asked questions
          </h3>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-3">
                Can I change my plan?
              </h4>
              <p className="text-sm text-[var(--text-secondary)]">
                Yes. You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-3">
                Is there a free trial?
              </h4>
              <p className="text-sm text-[var(--text-secondary)]">
                Yes, get started with our Starter plan and upgrade whenever you need more features.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-3">
                What if I exceed my document limit?
              </h4>
              <p className="text-sm text-[var(--text-secondary)]">
                You will get a notification when you are close to your limit. Upgrade anytime to add more documents.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-3">
                Do you offer refunds?
              </h4>
              <p className="text-sm text-[var(--text-secondary)]">
                We offer a 30-day money-back guarantee on all paid plans. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
