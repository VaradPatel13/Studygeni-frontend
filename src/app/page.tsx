import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'StudyMate.io - Intelligent Studying',
  description: 'Turn your notes into top grades. The AI study companion for serious students.',
};

export default function Home() {
  return <LandingPage />;
}
