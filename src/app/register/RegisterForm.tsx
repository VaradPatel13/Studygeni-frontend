'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

export default function RegisterForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        mobileNumber: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authService.register({
                ...formData,
                profileImage: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' // Default avatar
            });
            toast.success('ACCOUNT CREATED_');
            router.push('/'); // Redirect on success
        } catch (err: any) {
            console.error('Registration error:', err);
            const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(msg.toUpperCase());
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 bg-[length:40px_40px]">
            <div className="margin-line" />

            <div className="w-full max-w-md mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 font-bold mb-8 hover:text-blue-600 transition-colors">
                    ← Back to Home
                </Link>

                <div className="brutal-card shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                    <div className="inline-block bg-yellow-300 border-2 border-black px-2 py-1 font-bold text-xs mb-4 mono">
                        START_FREE
                    </div>
                    <h1 className="text-4xl font-black mb-2">JOIN_US</h1>
                    <p className="text-gray-600 font-medium mb-8">Stop failing. Start studying smarter.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block font-bold mono text-sm mb-2" htmlFor="username">FULL NAME</label>
                            <input
                                type="text"
                                id="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full border-2 border-black p-3 font-medium focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block font-bold mono text-sm mb-2" htmlFor="email">EMAIL</label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
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
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full border-2 border-black p-3 font-medium focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block font-bold mono text-sm mb-2" htmlFor="mobileNumber">MOBILE NUMBER</label>
                            <input
                                type="tel"
                                id="mobileNumber"
                                value={formData.mobileNumber}
                                onChange={handleChange}
                                required
                                pattern="[0-9]{10}"
                                title="Please enter a valid 10-digit mobile number"
                                className="w-full border-2 border-black p-3 font-medium focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow"
                                placeholder="9876543210"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-4 text-lg hover:bg-blue-700 transition-colors brutal-border flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> CREATING...
                                </>
                            ) : (
                                <>
                                    CREATE ACCOUNT <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t-2 border-black text-center text-sm font-bold">
                        <span className="mr-2">Already have an account?</span>
                        <Link href="/login" className="hover:text-blue-600 underline">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
