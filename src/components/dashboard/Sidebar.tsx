'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, BookOpen, Library, Upload, FileText, Youtube, PenTool, ChevronRight, LogOut, User, Brain, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
    const router = useRouter();

    const handleLogout = () => {
        authService.logout();
        toast.success('LOGGED OUT_');
        router.push('/login');
    };

    return (
        <aside className="w-64 bg-white border-r-2 border-black h-screen flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b-2 border-black">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-bold mono">SG</div>
                    <span className="font-bold text-xl tracking-tight">studygenie</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <button
                    onClick={() => setActiveTab('home')}
                    className={`w-full flex items-center gap-3 px-4 py-3 mb-2 font-bold transition-colors ${activeTab === 'home'
                        ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600'
                        : 'hover:bg-gray-100'
                        }`}
                >
                    <Home className="w-5 h-5" />
                    Home
                </button>

                <button
                    onClick={() => setActiveTab('documents')}
                    className={`w-full flex items-center gap-3 px-4 py-3 mb-2 font-bold transition-colors ${activeTab === 'documents'
                        ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600'
                        : 'hover:bg-gray-100'
                        }`}
                >
                    <BookOpen className="w-5 h-5" />
                    Documents
                </button>

                <button
                    onClick={() => setActiveTab('flashcards')}
                    className={`w-full flex items-center gap-3 px-4 py-3 mb-2 font-bold transition-colors ${activeTab === 'flashcards'
                        ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600'
                        : 'hover:bg-gray-100'
                        }`}
                >
                    <Brain className="w-5 h-5" />
                    Flashcards
                </button>



                <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 mb-2 font-bold transition-colors ${activeTab === 'profile'
                        ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600'
                        : 'hover:bg-gray-100'
                        }`}
                >
                    <User className="w-5 h-5" />
                    Profile
                </button>
            </nav>

            {/* Upgrade Button */}
            <div className="p-4 border-t-2 border-black">
                <button className="w-full bg-blue-600 text-white font-bold py-3 px-4 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    ⚡ Upgrade
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full mt-2 border-2 border-black font-bold py-3 px-4 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
