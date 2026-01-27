import type { Metadata } from 'next';
import DashboardAuthGuard from '@/components/dashboard/DashboardAuthGuard';

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Manage your documents, quizzes, and flashcards.',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardAuthGuard>{children}</DashboardAuthGuard>;
}
