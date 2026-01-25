'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { User, Lock, Mail, Phone, Camera, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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
            <div className="flex-1 bg-[#fdfbf7] p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#fdfbf7] p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-black flex items-center gap-3">
                    <User className="w-10 h-10" /> Profile Settings
                </h1>

                {/* Profile Information Card */}
                <Card>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <User className="w-6 h-6" /> Personal Information
                    </h2>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-24 h-24 bg-gray-100 rounded-full border-2 border-black overflow-hidden flex items-center justify-center flex-shrink-0">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="font-bold text-sm text-gray-600 mb-2 block">Profile Image URL</label>
                                <Input
                                    icon={Camera}
                                    placeholder="https://example.com/avatar.jpg"
                                    value={profileImage}
                                    onChange={(e) => setProfileImage(e.target.value)}
                                    className="bg-gray-50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="font-bold text-sm text-gray-600">Username</label>
                                <Input
                                    icon={User}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-gray-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-bold text-sm text-gray-600">Email Address</label>
                                <Input
                                    icon={Mail}
                                    value={email}
                                    disabled
                                    className="bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-bold text-sm text-gray-600">Mobile Number</label>
                                <Input
                                    icon={Phone}
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="Mobile Number"
                                    className="bg-gray-50"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                isLoading={isSaving}
                                className="px-8"
                            >
                                <Save className="w-4 h-4" /> Save Changes
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Security Card */}
                <Card>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Lock className="w-6 h-6" /> Security
                    </h2>

                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="font-bold text-sm text-gray-600">Current Password</label>
                                <Input
                                    type="password"
                                    icon={Lock}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-bold text-sm text-gray-600">New Password</label>
                                <Input
                                    type="password"
                                    icon={Lock}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={isSaving}
                                isLoading={isSaving}
                                className="px-8"
                            >
                                <Lock className="w-4 h-4" /> Change Password
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
