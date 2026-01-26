'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, User as UserIcon, Menu } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface DashboardNavbarProps {
    onMenuClick?: () => void;
}

export default function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState<{ username: string; email: string; profileImage?: string }>({
        username: 'Alex',
        email: 'alex@studygeni.com',
        profileImage: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUser({
                    username: userData.username || 'Alex',
                    email: userData.email || 'alex@studygeni.com',
                    profileImage: userData.profileImage || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                });
            } catch (e) {
                console.error('Error parsing user data', e);
            }
        }
    }, []);

    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="h-[70px] md:h-[80px] px-4 md:px-8 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-page)] shrink-0 z-30 transition-colors duration-300">
            {/* Left: Menu & Search */}
            <div className="flex items-center gap-4 flex-1">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-[var(--text-secondary)] hover:bg-[var(--bg-surface-highlight)] rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Search Bar - Hidden on small mobile, visible on desktop */}
                <div className="hidden md:block relative w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full h-11 pl-11 pr-4 rounded-xl bg-[var(--bg-surface-highlight)] text-[var(--text-primary)] text-sm border-none focus:ring-2 focus:ring-[var(--border-focus)]/20 transition-all placeholder-[var(--text-tertiary)]"
                    />
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-2 md:gap-4">

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 md:p-2.5 rounded-full hover:bg-[var(--bg-surface-highlight)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>

                {/* Notification */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 md:p-2.5 rounded-full hover:bg-[var(--bg-surface-highlight)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors relative"
                        title="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        {/* <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#EA4335] rounded-full border-2 border-[var(--bg-page)]"></span> */}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-72 bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-xl shadow-lg p-4 z-50">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-[var(--text-primary)]">Notifications</h3>
                            </div>
                            <div className="py-8 text-center text-[var(--text-secondary)] text-sm">
                                <p>No notifications yet</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-8 w-[1px] bg-[var(--border-subtle)] mx-2 hidden md:block"></div>

                {/* Profile Widget */}
                <div className="flex items-center gap-3 cursor-pointer group">
                    {/* Avatar Image - Circle */}
                    <div className="w-[36px] h-[36px] md:w-[42px] md:h-[42px] rounded-full overflow-hidden shadow-sm border border-[var(--border-subtle)] group-hover:border-[var(--border-focus)] transition-colors">
                        <img
                            src={user.profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Text Info - Hidden on mobile */}
                    <div className="flex flex-col hidden md:flex">
                        <span className="text-sm font-bold text-[var(--text-primary)] leading-none mb-1 group-hover:text-[#1A73E8] transition-colors">
                            {user.username}
                        </span>
                        <span className="text-xs font-medium text-[var(--text-secondary)]">
                            {user.email}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
