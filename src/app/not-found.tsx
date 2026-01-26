'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
    const [homeLink, setHomeLink] = useState('/');

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
            setHomeLink('/dashboard');
        }
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center p-4 text-center animate-fade-in relative overflow-hidden text-[var(--text-primary)]">
            {/* Background Decorations */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--color-google-blue)]/5 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '0s' }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[var(--color-google-red)]/5 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '1s' }}></div>

            <div className="g-card p-12 max-w-lg w-full flex flex-col items-center">
                <div className="w-24 h-24 bg-[var(--bg-surface-highlight)] rounded-full flex items-center justify-center mb-6">
                    <FileQuestion className="w-12 h-12 text-[var(--color-google-yellow)]" />
                </div>

                <h1 className="google-title text-8xl font-medium text-[var(--text-primary)] mb-2 tracking-tighter">404</h1>
                <h2 className="text-2xl font-medium text-[var(--text-primary)] mb-4">Page Not Found</h2>
                <p className="text-[var(--text-secondary)] mb-8 max-w-md">
                    The page you are looking for doesn't exist or has been moved. Check the URL or go back home.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Link
                        href={homeLink}
                        className="btn-google btn-google-primary h-12 px-8 rounded-full text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" /> Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="btn-google btn-google-outline h-12 px-8 rounded-full text-base flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>
                </div>
            </div>

            <div className="mt-12 text-sm text-[var(--text-tertiary)] flex justify-center gap-6">
                <span className="flex items-center gap-1.5 before:w-2 before:h-2 before:rounded-full before:bg-[var(--color-google-green)]">
                    System Operational
                </span>
                <span>StudyGeni v2.4.0</span>
            </div>
        </div>
    );
}
