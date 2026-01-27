'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';


export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState<{ username: string } | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Check for user
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (e) {
                // ignore
            }
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[var(--bg-page)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] py-2' : 'bg-transparent py-4'}`}>
            <div className="app-container h-12 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image src="/logo.png" alt="StudyMate Logo" width={32} height={32} className="w-8 h-8" />
                        <span className="app-title text-xl font-medium tracking-tight text-[var(--text-primary)]">StudyMate.io</span>
                    </Link>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-3 sm:gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-surface-highlight)] transition-colors"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    {user ? (
                        <Link href="/dashboard" className="btn-app btn-primary text-sm h-10 px-6 shadow-md hover:shadow-lg">
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-2">
                                Sign in
                            </Link>
                            <Link href="/register" className="btn-app btn-primary text-sm h-10 px-6 shadow-md hover:shadow-lg">
                                Get Started Free
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="flex items-center gap-4 md:hidden">
                    <button
                        onClick={toggleTheme}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[var(--bg-page)] border-b border-[var(--border-subtle)] p-6 shadow-xl animate-fade-in">
                    <div className="flex flex-col gap-6">
                        <Link href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-[var(--text-primary)] font-medium">How it works</Link>
                        {user ? (
                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="btn-app btn-primary w-full h-12 justify-center">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-[var(--text-secondary)]">Sign in</Link>
                                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn-app btn-primary w-full h-12 justify-center">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
