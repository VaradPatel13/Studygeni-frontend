'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { MdRefresh as Loader2, MdArrowForward as ArrowRight } from 'react-icons/md';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authService.login({ email, password });
            toast.success('Welcome back!');
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);
            const msg = err?.response?.data?.message || 'Invalid email or password.';
            toast.error(msg);
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
            <motion.div
                className="w-full max-w-[448px] bg-white dark:bg-[#1a1b1e] rounded-[28px] p-10 md:p-12 shadow-sm border border-[var(--border-subtle)] relative z-10"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
                <div className="flex flex-col items-center mb-10">
                    <Link href="/" className="mb-8 group">
                        <div className="flex items-center gap-3">
                            <Image src="/logo.png" alt="StudyMate Logo" width={48} height={48} className="w-12 h-12" />
                            <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                                StudyMate.io
                            </span>
                        </div>
                    </Link>

                    <h1 className="text-[24px] font-normal text-[var(--text-primary)] mb-2">Sign in</h1>
                    <p className="text-[var(--text-secondary)] text-base">to continue to StudyMate.io</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-50 dark:bg-red-900/20 text-[#D93025] dark:text-[#F28B82] p-3 rounded-lg text-sm flex items-center gap-2"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-6">
                        <div className="relative group">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="peer w-full h-[56px] px-4 rounded-[4px] border border-[var(--border-subtle)] bg-transparent text-[var(--text-primary)] placeholder-transparent focus:outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue)]/20 transition-all"
                                placeholder="Email"
                            />
                            {/* Label BG must match CARD BG (white or #1a1b1e) to cover the border correctly */}
                            <label
                                htmlFor="email"
                                className="absolute left-3 top-4 text-[var(--text-secondary)] text-base transition-all 
                                peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[var(--color-brand-blue)] peer-focus:px-1
                                peer-focus:bg-white dark:peer-focus:bg-[#1a1b1e]
                                peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:px-1
                                peer-not-placeholder-shown:bg-white dark:peer-not-placeholder-shown:bg-[#1a1b1e]
                                pointer-events-none"
                            >
                                Email
                            </label>
                        </div>

                        <div className="relative group">
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="peer w-full h-[56px] px-4 rounded-[4px] border border-[var(--border-subtle)] bg-transparent text-[var(--text-primary)] placeholder-transparent focus:outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue)]/20 transition-all"
                                placeholder="Password"
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-3 top-4 text-[var(--text-secondary)] text-base transition-all 
                                peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[var(--color-brand-blue)] peer-focus:px-1
                                peer-focus:bg-white dark:peer-focus:bg-[#1a1b1e]
                                peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:px-1
                                peer-not-placeholder-shown:bg-white dark:peer-not-placeholder-shown:bg-[#1a1b1e]
                                pointer-events-none"
                            >
                                Password
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-start text-sm">
                        <a href="#" className="font-medium text-[var(--color-brand-blue)] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-1 -ml-1 py-1 transition-colors">Forgot password?</a>
                    </div>

                    <div className="flex justify-between items-center mt-12 pt-4">
                        <Link href="/register" className="btn-app btn-outline border-none text-[var(--color-brand-blue)] hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 h-10 text-sm font-medium transition-all">
                            Create account
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-app btn-primary px-6 h-10 text-sm font-medium shadow-none hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Next'
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>

            <footer className="mt-6 text-xs text-[var(--text-secondary)] flex gap-6 z-10 w-full max-w-[448px] px-4">
                <div className="flex-1">
                    <a href="#" className="hover:text-[var(--text-primary)] p-2 rounded hover:bg-[var(--bg-surface-highlight)] -ml-2">English (United States)</a>
                </div>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-[var(--text-primary)] p-2 rounded hover:bg-[var(--bg-surface-highlight)]">Help</a>
                    <a href="#" className="hover:text-[var(--text-primary)] p-2 rounded hover:bg-[var(--bg-surface-highlight)]">Privacy</a>
                    <a href="#" className="hover:text-[var(--text-primary)] p-2 rounded hover:bg-[var(--bg-surface-highlight)]">Terms</a>
                </div>
            </footer>
        </div>
    );
}
