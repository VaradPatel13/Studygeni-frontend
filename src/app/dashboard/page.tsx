import { Suspense } from 'react';
import DashboardPageClient from '@/components/dashboard/DashboardPageClient';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-page)]" />}>
      <DashboardPageClient />
    </Suspense>
  );
}
