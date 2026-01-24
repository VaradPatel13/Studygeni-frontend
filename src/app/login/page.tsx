import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login - StudyGeni',
    description: 'Access your StudyGeni account to continue your AI-powered study sessions.',
    openGraph: {
        title: 'Login - StudyGeni',
        description: 'Welcome back. Enter your credentials to access your workspace.',
        url: 'https://studygeni.com/login',
        siteName: 'StudyGeni',
        type: 'website',
    },
    twitter: {
        title: 'Login - StudyGeni',
        description: 'Access your StudyGeni account.',
        card: 'summary',
    },
};

import LoginForm from './LoginForm';

export default function LoginPage() {
    return <LoginForm />;
}
