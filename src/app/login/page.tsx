import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login',
    description: 'Access your StudyMate.io account to continue your AI-powered study sessions.',
    openGraph: {
        title: 'Login - StudyMate.io',
        description: 'Access your StudyMate.io account.',
        url: 'https://studymate.io/login',
        siteName: 'StudyMate.io',
        type: 'website',
    },
    twitter: {
        title: 'Login - StudyMate.io',
        description: 'Access your StudyMate.io account.',
        card: 'summary',
    },
};

import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center text-sm text-[var(--text-secondary)]">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
