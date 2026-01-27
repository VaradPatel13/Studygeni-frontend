'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('App Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center p-4 text-center animate-fade-in relative overflow-hidden text-[var(--text-primary)]">
            {/* Background Decorations */}
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[var(--color-brand-red)]/5 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '0s' }}></div>
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[var(--color-brand-yellow)]/5 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '1s' }}></div>

            <div className="app-card p-12 max-w-lg w-full flex flex-col items-center border-[var(--color-brand-red)]/20 shadow-red-500/5">
                <div className="w-24 h-24 bg-[var(--color-brand-red)]/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-12 h-12 text-[var(--color-brand-red)]" />
                </div>

                <h1 className="app-title text-3xl font-medium text-[var(--text-primary)] mb-2">Something went wrong!</h1>
                <p className="text-[var(--text-secondary)] mb-2">
                    An unexpected error has occurred.
                </p>
                {/* Optional: Show error message in dev mode, or generic in prod */}
                <div className="p-4 bg-[var(--bg-surface-highlight)] rounded-xl w-full mb-8 text-sm text-[var(--text-secondary)] font-mono overflow-auto max-h-32 border border-[var(--border-subtle)]">
                    {error.message || "Unknown error occurred"}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button
                        onClick={reset}
                        className="btn-app btn-primary h-12 px-8 rounded-full text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" /> Try Again
                    </button>
                    <Link
                        href="/"
                        className="btn-app btn-outline h-12 px-8 rounded-full text-base flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" /> Go Home
                    </Link>
                </div>
            </div>

            <div className="mt-12 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-help">
                ErrorCode: {error.digest || 'UNKNOWN'}
            </div>
        </div>
    );
}
