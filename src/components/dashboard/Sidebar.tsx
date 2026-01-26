'use client';

import Link from 'next/link';
import { LayoutGrid, BookOpen, Brain, User, Zap, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen = false, onClose }: SidebarProps) {
    const router = useRouter();

    const handleLogout = () => {
        authService.logout();
        toast.success('Logged out');
        router.push('/login');
    };

    const navItems = [
        { id: 'home', label: 'Dashboard', icon: LayoutGrid },
        { id: 'documents', label: 'Documents', icon: BookOpen },
        { id: 'flashcards', label: 'Flashcards', icon: Brain },
        { id: 'profile', label: 'Settings', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                w-[280px] md:w-[256px] 
                bg-[var(--bg-page)] border-r border-[var(--border-subtle)] 
                h-screen flex flex-col py-4 
                fixed md:sticky top-0 left-0 z-50 
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                shrink-0
            `}>
                {/* Logo Area */}
                <div className="px-6 mb-8 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex gap-1 group-hover:scale-110 transition-transform duration-300">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-google-blue)]"></span>
                            <span className="w-2 h-2 rounded-full bg-[var(--color-google-red)]"></span>
                            <span className="w-2 h-2 rounded-full bg-[var(--color-google-yellow)]"></span>
                            <span className="w-2 h-2 rounded-full bg-[var(--color-google-green)]"></span>
                        </div>
                        <span className="google-title text-xl ml-1 text-[var(--text-primary)]">StudyGeni</span>
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 -mr-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 pr-3">
                    <div className="px-6 mb-3 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Workspace
                    </div>
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-4 px-6 py-3 text-sm font-medium rounded-r-full transition-colors relative
                                    ${isActive
                                        ? 'bg-[var(--color-google-blue)]/10 text-[var(--color-google-blue)]'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-highlight)] hover:text-[var(--text-primary)]'
                                    }`
                                }
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-current' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'}`} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] mx-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-2 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-highlight)] rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Log out</span>
                    </button>

                    <div className="mt-4 px-2 flex justify-between text-[10px] text-[var(--text-tertiary)]">
                        <span>v2.4.0</span>
                        <span>Pro Plan</span>
                    </div>
                </div>
            </aside>
        </>
    );
}
