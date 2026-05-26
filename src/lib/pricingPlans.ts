export interface PricingFeature {
  name: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  documentsLimit: number;
  freeDocuments?: number;
  features: PricingFeature[];
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: '$',
    period: '/month',
    description: 'Try StudyGeni with a small set of documents',
    documentsLimit: 3,
    features: [
      { name: 'Up to 3 documents', included: true },
      { name: 'AI-powered summaries (limited)', included: true },
      { name: 'Email support (limited)', included: true },
    ],
    ctaText: 'Get Started',
    ctaLink: '/register?plan=free',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 4.99,
    currency: '$',
    period: '/month',
    description: 'Perfect for students just getting started',
    documentsLimit: 30,
    features: [
      { name: 'Up to 30 documents', included: true },
      { name: 'AI-powered summaries', included: true },
      { name: 'Flashcard generation', included: true },
      { name: 'Basic document processing', included: true },
      { name: 'Email support', included: true },
      { name: 'Quiz generation', included: false },
      { name: 'Chat with documents', included: false },
      { name: 'Advanced analytics', included: false },
      { name: 'Concept explanations', included: false },
      { name: 'YouTube summaries', included: false },
    ],
    ctaText: 'Get Started',
    ctaLink: '/register?plan=starter',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 7.99,
    currency: '$',
    period: '/month',
    description: 'For serious learners who want more',
    documentsLimit: 150,
    freeDocuments: 1,
    isPopular: true,
    features: [
      { name: 'Up to 150 documents + 1 free', included: true },
      { name: 'AI-powered summaries', included: true },
      { name: 'Flashcard generation', included: true },
      { name: 'Basic document processing', included: true },
      { name: 'Email support', included: true },
      { name: 'Quiz generation', included: true },
      { name: 'Chat with documents', included: true },
      { name: 'Document organization & tagging', included: true },
      { name: 'Concept explanations', included: true },
      { name: 'YouTube summaries', included: false },
    ],
    ctaText: 'Upgrade to Pro',
    ctaLink: '/register?plan=professional',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29.99,
    currency: '$',
    period: '/month',
    description: 'Unlimited learning with all features',
    documentsLimit: 1000,
    freeDocuments: 10,
    features: [
      { name: 'Unlimited documents + 10 free', included: true },
      { name: 'AI-powered summaries', included: true },
      { name: 'Flashcard generation', included: true },
      { name: 'Basic document processing', included: true },
      { name: 'Email support', included: true },
      { name: 'Quiz generation', included: true },
      { name: 'Chat with documents', included: true },
      { name: 'Document organization & tagging', included: true },
      { name: 'Advanced concept explanations', included: true },
      { name: 'YouTube & text summaries', included: true },
    ],
    ctaText: 'Go Enterprise',
    ctaLink: '/register?plan=enterprise',
  },
];
