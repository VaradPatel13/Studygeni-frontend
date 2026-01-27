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

import LoginForm from './LoginForm';

export default function LoginPage() {
    return <LoginForm />;
}
