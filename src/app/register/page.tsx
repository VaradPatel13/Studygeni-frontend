import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Register - StudyGeni',
    description: 'Create a free StudyGeni account. Turn documents into flashcards and quizzes instantly.',
    openGraph: {
        title: 'Join StudyGeni - Start Studying Smarter',
        description: 'Stop failing. Start studying smarter. Create your free account today.',
        url: 'https://studygeni.com/register',
        siteName: 'StudyGeni',
        type: 'website',
    },
    twitter: {
        title: 'Join StudyGeni',
        description: 'Create a free account and start learning faster.',
        card: 'summary',
    },
};

import RegisterForm from './RegisterForm';

export default function RegisterPage() {
    return <RegisterForm />;
}
