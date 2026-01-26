'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { User, Lock, Mail, Phone, Camera, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ProfileView() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form states
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState(''); // Read-only usually
    const [mobileNumber, setMobileNumber] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await authService.getProfile();
            const userData = res.data?.user || res.data || res.user || res; // Adjust based on API structure
            setUser(userData);
            setUsername(userData.username || '');
            setEmail(userData.email || '');
            setMobileNumber(userData.mobileNumber || '');
            setProfileImage(userData.profileImage || '');
        } catch (error) {
            console.error('Failed to fetch profile', error);
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await authService.updateProfile({ username, mobileNumber, profileImage });
            toast.success('Profile updated successfully');
            // Update local user state
            const updatedData = res.data?.user || res.data || res;
            setUser((prev: any) => ({ ...prev, ...updatedData }));

            // Update localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                localStorage.setItem('user', JSON.stringify({ ...parsed, ...updatedData }));
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) {
            toast.error('Please fill in both password fields');
            return;
        }

        setIsSaving(true);
        try {
            await authService.changePassword({ currentPassword, newPassword });
            toast.success('Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to change password');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 bg-[var(--bg-page)] p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="h-8 w-48" />
                    </div>

                    <div className="g-card p-8">
                        <Skeleton className="h-6 w-48 mb-8" />
                        <div className="flex items-center gap-8 mb-8">
                            <Skeleton className="w-24 h-24 rounded-full" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-32 mb-2" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="g-card p-8">
                        <Skeleton className="h-6 w-32 mb-8" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[var(--bg-page)] p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl google-title font-medium flex items-center gap-3 text-[var(--text-primary)]">
                    <User className="w-8 h-8 text-[var(--color-google-blue)]" /> Profile Settings
                </h1>

                {/* Profile Information Card */}
                <div className="g-card p-8">
                    <h2 className="text-xl google-title font-medium mb-8 flex items-center gap-2 text-[var(--text-primary)]">
                        Personal Information
                    </h2>

                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                        <div className="flex items-center gap-8 mb-8">
                            <div className="w-24 h-24 bg-[var(--bg-surface-highlight)] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 relative group cursor-pointer">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-[var(--text-tertiary)]" />
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="font-medium text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2 block">Profile Image URL</label>
                                <div className="relative">
                                    <Camera className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                    <input
                                        placeholder="https://example.com/avatar.jpg"
                                        value={profileImage}
                                        onChange={(e) => setProfileImage(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-[var(--bg-surface-highlight)] border-transparent focus:bg-[var(--bg-page)] focus:border-[var(--color-google-blue)] focus:ring-4 focus:ring-[var(--color-google-blue)]/10 transition-all outline-none text-[var(--text-primary)] font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="font-medium text-xs uppercase tracking-wide text-[var(--text-secondary)]">Username</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                    <input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-[var(--bg-surface-highlight)] border-transparent focus:bg-[var(--bg-page)] focus:border-[var(--color-google-blue)] focus:ring-4 focus:ring-[var(--color-google-blue)]/10 transition-all outline-none text-[var(--text-primary)] font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-medium text-xs uppercase tracking-wide text-[var(--text-secondary)]">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                    <input
                                        value={email}
                                        disabled
                                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-[var(--bg-surface-highlight)]/50 border-transparent text-[var(--text-tertiary)] cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-medium text-xs uppercase tracking-wide text-[var(--text-secondary)]">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                    <input
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        placeholder="Mobile Number"
                                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-[var(--bg-surface-highlight)] border-transparent focus:bg-[var(--bg-page)] focus:border-[var(--color-google-blue)] focus:ring-4 focus:ring-[var(--color-google-blue)]/10 transition-all outline-none text-[var(--text-primary)] font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                isLoading={isSaving}
                                className="btn-google btn-google-primary h-11 px-6 rounded-full text-sm font-medium shadow-md"
                            >
                                <Save className="w-4 h-4 mr-2" /> Save Changes
                            </Button>
                        </div>
                    </form>

                </div>

                {/* Security Card */}
                <div className="g-card p-8">
                    <h2 className="text-xl google-title font-medium mb-8 flex items-center gap-2 text-[var(--text-primary)]">
                        Security
                    </h2>

                    <form onSubmit={handleChangePassword} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="font-medium text-xs uppercase tracking-wide text-[var(--text-secondary)]">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-[var(--bg-surface-highlight)] border-transparent focus:bg-[var(--bg-page)] focus:border-[var(--color-google-blue)] focus:ring-4 focus:ring-[var(--color-google-blue)]/10 transition-all outline-none text-[var(--text-primary)] font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-medium text-xs uppercase tracking-wide text-[var(--text-secondary)]">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-[var(--bg-surface-highlight)] border-transparent focus:bg-[var(--bg-page)] focus:border-[var(--color-google-blue)] focus:ring-4 focus:ring-[var(--color-google-blue)]/10 transition-all outline-none text-[var(--text-primary)] font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                isLoading={isSaving}
                                className="h-11 px-6 rounded-full text-sm font-medium shadow-md bg-[var(--color-google-red)] hover:bg-[#d93025] text-white"
                            >
                                <Lock className="w-4 h-4 mr-2" /> Change Password
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div >
    );
}
