import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Account',
    description: 'Create a free StudyMate.io account. Turn documents into flashcards and quizzes instantly.',
    openGraph: {
        title: 'Join StudyMate.io - Start Studying Smarter',
        description: 'Stop failing. Start studying smarter. Create your free account today.',
        url: 'https://studymate.io/register',
        siteName: 'StudyMate.io',
        type: 'website',
    },
    twitter: {
        title: 'Join StudyMate.io',
        description: 'Create a free account and start learning faster.',
        card: 'summary',
    },
};

import RegisterForm from './RegisterForm';

export default function RegisterPage() {
    return <RegisterForm />;
}
