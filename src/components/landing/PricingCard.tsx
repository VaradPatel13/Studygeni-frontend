'use client';

import { PricingPlan } from '@/lib/pricingPlans';
import formatPrice from '@/lib/formatCurrency';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface PricingCardProps {
  plan: PricingPlan;
}

export default function PricingCard({ plan }: PricingCardProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);
  return (
    <div
      className={`rounded-lg transition-all duration-200 hover:shadow-lg ${
        plan.isPopular
          ? 'border-2 border-[var(--color-brand-blue)] bg-white dark:bg-[#1a1b1e] shadow-md'
          : 'border border-[#e0e0e0] dark:border-[#2c2c2c] bg-white dark:bg-[#1a1b1e]'
      }`}
    >
      {plan.isPopular && (
        <div className="bg-[var(--color-brand-blue)] text-white px-4 py-2 text-sm font-medium text-center">
          Most Popular
        </div>
      )}

      <div className="p-8">
        {/* Plan Name */}
        <h3 className="text-xl font-medium text-[var(--text-primary)] mb-1">
          {plan.name}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          {plan.description}
        </p>

        {/* Pricing */}
        <div className="mb-6 pb-6 border-b border-[#e0e0e0] dark:border-[#2c2c2c]">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-medium text-[var(--text-primary)]">
              {formatPrice(plan.price, plan.currency)}
            </span>
            <span className="text-[var(--text-secondary)] text-sm">{plan.period}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            {plan.documentsLimit && plan.documentsLimit > 999999
              ? 'Unlimited documents'
              : `${plan.documentsLimit} documents`}
            {plan.freeDocuments && (
              <span> + {plan.freeDocuments} free</span>
            )}
          </p>
        </div>

        {/* CTA Button */}
        <Link
          href={isLoggedIn ? '/dashboard?tab=billing' : plan.ctaLink}
          className={`block w-full py-2.5 px-4 rounded-md font-medium text-center transition-all duration-200 mb-8 text-sm ${
            plan.isPopular
              ? 'bg-[var(--color-brand-blue)] text-white hover:bg-blue-700'
              : 'border border-[#dadce0] dark:border-[#3c3c3c] text-[var(--text-primary)] hover:bg-[#f8f9fa] dark:hover:bg-[#2a2a2a]'
          }`}
        >
          {plan.ctaText}
        </Link>

        {/* Features */}
        <div className="space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              {feature.included ? (
                <Check className="w-5 h-5 flex-shrink-0 text-[var(--color-brand-blue)] mt-0.5" />
              ) : (
                <div className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <span
                className={`text-sm ${
                  !feature.included
                    ? 'text-[#9ca3af] dark:text-[#6b7280] line-through'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
