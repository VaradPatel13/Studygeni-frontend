'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

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
            toast.success('LOGIN SUCCESSFUL_');
            router.push('/'); // Redirect to dashboard or home
        } catch (err: any) {
            console.error('Login error:', err);
            const msg = err?.response?.data?.message || 'Invalid email or password.';
            toast.error(msg.toUpperCase());
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 bg-[length:40px_40px]">
            <div className="margin-line" />

            {/* Pattern Background Overlay from globals */}
            <div className="absolute inset-0 pointer-events-none z-[-1]" />

            <div className="w-full max-w-md mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 font-bold mb-8 hover:text-blue-600 transition-colors">
                    ← Back to Home
                </Link>

                <div className="brutal-card shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                    <h1 className="text-4xl font-black mb-2">WELCOME_BACK</h1>
                    <p className="text-gray-600 font-medium mb-8">Enter your credentials to access your workspace.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 font-bold text-sm">
                                {error.toUpperCase()}
                            </div>
                        )}

                        <div>
                            <label className="block font-bold mono text-sm mb-2" htmlFor="email">EMAIL</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full border-2 border-black p-3 font-medium focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow"
                                placeholder="student@university.edu"
                            />
                        </div>

                        <div>
                            <label className="block font-bold mono text-sm mb-2" htmlFor="password">PASSWORD</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full border-2 border-black p-3 font-medium focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white font-bold py-4 text-lg hover:bg-neutral-800 transition-colors brutal-border flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> LOGGING IN...
                                </>
                            ) : (
                                <>
                                    LOG IN <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t-2 border-black flex justify-between items-center text-sm font-bold">
                        <a href="#" className="hover:text-blue-600 underline">Forgot Pass?</a>
                        <Link href="/register" className="hover:text-blue-600 underline">Create Account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
