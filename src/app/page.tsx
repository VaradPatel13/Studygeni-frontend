import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'StudyMate.io | AI Study Companion - Summaries, Flashcards & Quizzes',
  description: 'Boost your grades with the ultimate AI study tool. Instantly convert lectures, PDF notes, and research papers into smart summaries, interactive flashcards, practice quizzes, and chat directly with your sources.',
  keywords: [
    'study AI',
    'AI study companion',
    'AI study tools',
    'AI summary generator',
    'AI flashcards',
    'create quizzes with AI',
    'PDF to flashcards AI',
    'active recall study app',
    'spaced repetition companion',
    'chat with documents',
    'AI lecture notes summarizer',
    'intelligent studying assistant',
    'grade booster AI',
    'exam prep tool'
  ],
  openGraph: {
    title: 'StudyMate.io | AI Study Companion - Summaries, Flashcards & Quizzes',
    description: 'Boost your grades with the ultimate AI study tool. Instantly convert lectures, PDF notes, and research papers into smart summaries, interactive flashcards, practice quizzes, and chat directly with your sources.',
    url: 'https://studymate-io.vercel.app/',
    siteName: 'StudyMate.io',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'StudyMate.io - AI Study Companion Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'StudyMate.io | AI Study Companion',
    description: 'Stop failing. Start studying smarter. Instantly convert study materials into flashcards, quizzes, and summaries with our advanced AI suite.',
    images: ['/logo.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  'name': 'StudyMate.io',
  'url': 'https://studymate-io.vercel.app/',
  'applicationCategory': 'EducationalApplication',
  'operatingSystem': 'All',
  'description': 'The ultimate AI-powered study companion. Instantly convert lectures, PDF notes, and research papers into smart summaries, interactive flashcards, practice quizzes, and chat directly with your sources.',
  'offers': {
    '@type': 'AggregateOffer',
    'priceCurrency': 'USD',
    'lowPrice': '0.00',
    'highPrice': '29.99',
    'offerCount': '3'
  },
  'featureList': [
    'AI Document Summarization',
    'Interactive 3D Spaced Repetition Flashcards',
    'AI Quiz Generation with Automatic Grading',
    'Interactive Source-Cited Document Chat'
  ]
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
