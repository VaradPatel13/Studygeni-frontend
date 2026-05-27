'use client';

import { useState, useEffect } from 'react';
import {
    MdOutlineCloudUpload as Upload,
    MdOutlineDescription as FileText,
    MdOutlineSmartDisplay as Youtube,
    MdChevronRight as ChevronRight,
    MdOutlineSearch as Search,
    MdAdd as Plus,
    MdOutlineMenuBook as BookOpen,
    MdOutlinePsychology as Brain,
    MdOutlineTrackChanges as Target,
    MdOutlineBolt as Zap,
    MdMoreHoriz as MoreHorizontal,
    MdOutlineAccessTime as Clock,
    MdOutlineCalendarToday as Calendar,
    MdOutlineImage as Image
} from 'react-icons/md';
import { documentService } from '@/services/documentService';
import { progressService } from '@/services/progressService';
import { flashcardService } from '@/services/flashcardService';
import { paymentService } from '@/services/paymentService';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface DashboardHomeProps {
    onViewAllDocuments: () => void;
    onUpgradeClick?: () => void;
    currentPlan?: string;
}

import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardHome({ onViewAllDocuments, onUpgradeClick, currentPlan }: DashboardHomeProps) {
    const router = useRouter();
    const [userName, setUserName] = useState('User');
    const [recentDocuments, setRecentDocuments] = useState<any[]>([]); // Keep for backwards compatibility if needed, or remove
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [totalDocCount, setTotalDocCount] = useState(0);
    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [youtubeSummaryResult, setYoutubeSummaryResult] = useState<any>(null);
    const [isYoutubeLoading, setIsYoutubeLoading] = useState(false);

    const [isTextModalOpen, setIsTextModalOpen] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [textSummaryResult, setTextSummaryResult] = useState<string | null>(null);
    const [isTextLoading, setIsTextLoading] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserName(user.username || 'User');
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [progressStats, docs] = await Promise.all([
                progressService.getStats(),
                documentService.getAllDocuments()
            ]);

            setStats(progressStats);

            // Set Recent Activity from the new endpoint structure
            if (progressStats?.data?.recentActivity) {
                setRecentActivity(progressStats.data.recentActivity);
            } else if (progressStats?.recentActivity) {
                setRecentActivity(progressStats.recentActivity);
            } else {
                setRecentActivity([]);
            }

            // Set Total Document Count
            if (Array.isArray(docs)) {
                setTotalDocCount(docs.length);
            }

            // Keep recentDocuments logic just in case other parts use it, or fallback
            if (progressStats?.recentData?.documents) {
                setRecentDocuments(progressStats.recentData.documents);
            } else {
                setRecentDocuments([]);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // toast.error('Failed to load dashboard data'); // Optional: suppress error to avoid noise
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
            // Auto-fill title if empty
            if (!uploadTitle) {
                setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
            }
        }
    };

    const handleUploadSubmit = async () => {
        if (!uploadFile) {
            toast.error('Please select a file');
            return;
        }
        if (!uploadTitle.trim()) {
            toast.error('Please enter a title');
            return;
        }

        try {
            toast.loading('Checking upload limits...');
            const subscription = await paymentService.getCurrentSubscription();
            toast.dismiss();

            if (subscription) {
                const used = subscription.documentsUsed ?? 0;
                const limit = subscription.documentsLimit ?? 3;
                if (used >= limit) {
                    toast.error(`Upload limit reached (${used}/${limit} used). Please upgrade your plan.`);
                    return;
                }
            }
        } catch (error) {
            toast.dismiss();
            console.error('Failed to verify subscription limits:', error);
        }

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('title', uploadTitle);

        try {
            toast.loading('Uploading...');
            await documentService.uploadDocument(formData);
            toast.dismiss();
            toast.success('Document uploaded successfully');
            setIsUploadModalOpen(false);
            setUploadTitle('');
            setUploadFile(null);
            fetchDashboardData();
        } catch (error: any) {
            toast.dismiss();
            toast.error(error?.response?.data?.message || 'Upload failed');
        }
    };

    const handleYoutubeSubmit = async () => {
        if (!youtubeUrl.trim()) return;
        setIsYoutubeLoading(true);
        setYoutubeSummaryResult(null);
        try {
            // Dynamic import to avoid circular dependency if any, or just standard import
            // Assuming aiService is imported at top. Wait, need to add import.
            const { aiService } = await import('@/services/aiService');
            const res = await aiService.generateYoutubeSummary(youtubeUrl);
            // expected res: { success: true, data: { summary: "...", transcript: "..." } } or just data
            setYoutubeSummaryResult(res.data || res);
            toast.success('Summary generated!');
        } catch (error: any) {
            console.error(error);
            const errorMessage = error?.response?.data?.message || 'Failed to generate summary';
            toast.error(errorMessage);
        } finally {
            setIsYoutubeLoading(false);
        }
    };

    const handleTextSubmit = async () => {
        if (!textInput.trim()) return;
        setIsTextLoading(true);
        setTextSummaryResult(null);
        try {
            const { aiService } = await import('@/services/aiService');
            const res = await aiService.generateTextSummary(textInput);
            // expected res: { success: true, data: { summary: "..." } }
            setTextSummaryResult(res.data?.summary || res.summary || res.data); // Adjust based on return
            toast.success('Summary generated!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate summary');
        } finally {
            setIsTextLoading(false);
        }
    };

    return (
        <div className="flex-1 bg-[var(--bg-page)] p-4 md:p-8 overflow-y-auto transition-colors duration-300 relative">
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">

                {/* Upgrade Banner */}
                {stats?.featureUnavailable && (!currentPlan || !currentPlan.toLowerCase().includes('pro')) && (
                    <div className="bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 border border-blue-500/10 rounded-2xl p-4 flex items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)] rounded-xl">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-[var(--text-primary)]">Upgrade to Professional Plan</h4>
                                <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium hidden md:block">Unlock study streaks, average quiz accuracy, and detailed material insights.</p>
                            </div>
                        </div>
                        <button
                            onClick={onUpgradeClick}
                            className="shrink-0 h-9 px-4 text-xs font-semibold rounded-full bg-[var(--color-brand-blue)] hover:bg-blue-600 text-white transition-all shadow-md shadow-blue-500/25 active:scale-95"
                        >
                            Upgrade to Pro
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-[var(--border-subtle)] gap-4">
                    <div>
                        <h1 className="app-title text-3xl text-[var(--text-primary)] tracking-tight">Overview</h1>
                        <p className="text-sm text-[var(--text-secondary)] mt-2 font-medium">Welcome back, {userName} 👋</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => toast('Feedback feature coming soon!', { icon: '🚧' })}
                            className="h-10 px-5 text-sm font-medium rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-highlight)] hover:text-[var(--text-primary)] transition-all"
                        >
                            Feedback
                        </button>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="h-10 px-5 text-sm font-medium rounded-full bg-[var(--color-brand-blue)] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> New Upload
                        </button>
                    </div>
                </div>

                {/* Stats Grid - Premium Bento Style */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Skeleton Streak */}
                        <div className="app-card p-6 flex flex-col justify-between h-36 rounded-3xl">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                            <div>
                                <Skeleton className="h-8 w-12 mb-2" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>

                        {/* Skeleton Accuracy */}
                        <div className="app-card p-6 flex flex-col justify-between h-36 rounded-3xl">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                            <div>
                                <Skeleton className="h-8 w-16" />
                            </div>
                        </div>

                        {/* Skeleton Summary */}
                        <div className="col-span-1 md:col-span-2 app-card p-0 flex rounded-3xl overflow-hidden">
                            <div className="flex-1 p-6 border-r border-[var(--border-subtle)] flex flex-col justify-between">
                                <Skeleton className="h-3 w-12 mb-4" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                            <div className="flex-1 p-6 border-r border-[var(--border-subtle)] flex flex-col justify-between">
                                <Skeleton className="h-3 w-20 mb-4" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <Skeleton className="h-3 w-16 mb-4" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Streak */}
                        <div className="relative overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 flex flex-col justify-between h-36 rounded-3xl hover:shadow-md transition-all group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Zap className="w-24 h-24 rotate-12" />
                            </div>
                            <div className="flex justify-between items-start relative z-10">
                                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                                    Daily Streak {stats?.featureUnavailable && <span className="text-[10px]">🔒</span>}
                                </span>
                                <div className="p-2 bg-[var(--color-brand-yellow)]/10 rounded-2xl">
                                    <Zap className="w-5 h-5 text-[var(--color-brand-yellow)]" />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                                        {stats?.featureUnavailable ? '—' : (stats?.stats?.streak?.current || 0)}
                                    </span>
                                    <span className="text-sm text-[var(--text-secondary)] font-medium">days</span>
                                </div>
                                <p className="text-xs text-[var(--text-tertiary)] mt-1">Keep it up! 🔥</p>
                            </div>
                        </div>

                        {/* Accuracy */}
                        <div className="relative overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 flex flex-col justify-between h-36 rounded-3xl hover:shadow-md transition-all group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Target className="w-24 h-24 -rotate-12" />
                            </div>
                            <div className="flex justify-between items-start relative z-10">
                                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                                    Avg Accuracy {stats?.featureUnavailable && <span className="text-[10px]">🔒</span>}
                                </span>
                                <div className="p-2 bg-[var(--color-brand-blue)]/10 rounded-2xl">
                                    <Target className="w-5 h-5 text-[var(--color-brand-blue)]" />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                                        {stats?.featureUnavailable ? '—' : `${stats?.stats?.quizzes?.avgScore || 0}%`}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--text-tertiary)] mt-1">Quiz Performance</p>
                            </div>
                        </div>

                        {/* Expanded Stats */}
                        <div className="col-span-1 md:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-0 flex rounded-3xl overflow-hidden hover:shadow-md transition-all">
                            <div className="flex-1 p-6 border-r border-[var(--border-subtle)] flex flex-col justify-center items-center text-center gap-2 hover:bg-[var(--bg-surface-highlight)] transition-colors">
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl mb-1">
                                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{totalDocCount}</span>
                                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Documents</span>
                            </div>
                            <div className="flex-1 p-6 border-r border-[var(--border-subtle)] flex flex-col justify-center items-center text-center gap-2 hover:bg-[var(--bg-surface-highlight)] transition-colors">
                                <div className="p-3 bg-[var(--color-brand-yellow)]/10 rounded-2xl mb-1">
                                    <Brain className="w-6 h-6 text-[var(--color-brand-yellow)]" />
                                </div>
                                <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                                    {stats?.featureUnavailable ? '—' : (stats?.stats?.flashcards?.totalSets || 0)}
                                </span>
                                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1 justify-center">
                                    Flashcards {stats?.featureUnavailable && <span className="text-[10px]">🔒</span>}
                                </span>
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center gap-2 hover:bg-[var(--bg-surface-highlight)] transition-colors">
                                <div className="p-3 bg-[var(--color-brand-green)]/10 rounded-2xl mb-1">
                                    <Zap className="w-6 h-6 text-[var(--color-brand-green)]" />
                                </div>
                                <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                                    {stats?.featureUnavailable ? '—' : (stats?.stats?.quizzes?.taken || 0)}
                                </span>
                                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1 justify-center">
                                    Quizzes {stats?.featureUnavailable && <span className="text-[10px]">🔒</span>}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 rounded-3xl cursor-pointer hover:border-[var(--color-brand-blue)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-row items-center gap-5 text-left w-full h-32"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-blue)]/10 flex items-center justify-center text-[var(--color-brand-blue)] group-hover:bg-[var(--color-brand-blue)] group-hover:text-white transition-colors duration-300 shadow-sm">
                            <Upload className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Upload</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">Docs to Quiz & Flashcards</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setIsTextModalOpen(true)}
                        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 rounded-3xl cursor-pointer hover:border-[var(--color-brand-red)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-row items-center gap-5 text-left w-full h-32"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-red)]/10 flex items-center justify-center text-[var(--color-brand-red)] group-hover:bg-[var(--color-brand-red)] group-hover:text-white transition-colors duration-300 shadow-sm">
                            <FileText className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Paste Text</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">Summarize raw content</p>
                        </div>
                    </button>

                    <button
                        onClick={() => toast.error('Service temporarily unavailable. Please try again in a few minutes')}
                        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 rounded-3xl cursor-pointer hover:border-[var(--color-brand-yellow)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-row items-center gap-5 text-left w-full h-32"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-yellow)]/10 flex items-center justify-center text-[var(--color-brand-yellow)] group-hover:bg-[var(--color-brand-yellow)] group-hover:text-white transition-colors duration-300 shadow-sm">
                            <Youtube className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">YouTube</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">Video summarization</p>
                        </div>
                    </button>
                </div>

                {/* ... existing content ... */}

                {/* Recent Activity List */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-medium text-[var(--text-primary)]">Recent Activity</h2>
                    </div>

                    <div className="app-card p-0 overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[var(--bg-surface-highlight)] border-b border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                            <div className="col-span-6">Activity</div>
                            <div className="col-span-3">Date</div>
                            <div className="col-span-3 text-right">Details</div>
                        </div>

                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="p-12 text-center text-sm text-[var(--text-secondary)]">
                                No recent activity found.
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--border-subtle)]">
                                {recentActivity.map((activity: any, idx: number) => {
                                    // Determine icon and color based on type
                                    let Icon = FileText;
                                    let colorClass = 'text-[var(--color-brand-blue)]';
                                    let bgColorClass = 'bg-[var(--color-brand-blue)]/10';
                                    let actionText = 'Uploaded Document';
                                    let detailText = activity.details || '-';

                                    if (activity.type === 'document_upload') {
                                        // Format MIME types to readable names
                                        if (detailText.includes('wordprocessingml') || detailText.includes('msword')) {
                                            detailText = 'Word';
                                        } else if (detailText.includes('presentationml') || detailText.includes('powerpoint')) {
                                            detailText = 'PowerPoint';
                                        } else if (detailText.includes('spreadsheetml') || detailText.includes('excel')) {
                                            detailText = 'Excel';
                                        } else if (detailText.includes('pdf')) {
                                            detailText = 'PDF';
                                        } else if (detailText.includes('image')) {
                                            detailText = 'Image';
                                        } else if (detailText.length > 20) {
                                            detailText = 'Document';
                                        }
                                    } else if (activity.type === 'flashcard_set_created') {
                                        Icon = BookOpen;
                                        colorClass = 'text-[var(--color-brand-yellow)]';
                                        bgColorClass = 'bg-[var(--color-brand-yellow)]/10';
                                        actionText = 'Created Flashcards';
                                    } else if (activity.type === 'quiz_completed') {
                                        Icon = Brain; // or Trophy/Target
                                        colorClass = 'text-[var(--color-brand-green)]';
                                        bgColorClass = 'bg-[var(--color-brand-green)]/10';
                                        actionText = 'Completed Quiz';
                                    }

                                    return (
                                        <div key={activity.id || idx}
                                            onClick={() => {
                                                if (activity.type === 'document_upload' && activity.id) {
                                                    router.push(`/dashboard/document/${activity.id}`);
                                                }
                                                // Add other navigations if needed
                                            }}
                                            className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[var(--bg-surface-highlight)] transition-colors group ${activity.type === 'document_upload' ? 'cursor-pointer' : ''}`}>
                                            <div className="col-span-6 flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded ${bgColorClass} flex items-center justify-center ${colorClass}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-[var(--text-primary)] block group-hover:text-[var(--color-brand-blue)] transition-colors">{activity.title}</span>
                                                    <span className="text-xs text-[var(--text-secondary)]">{actionText}</span>
                                                </div>
                                            </div>
                                            <div className="col-span-3 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                                <Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                                                {new Date(activity.date).toLocaleDateString()}
                                            </div>
                                            <div className="col-span-3 text-right">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-surface-highlight)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                                                    {detailText}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-3xl animate-fade-in">
                    <div className="bg-[var(--bg-surface)] dark:bg-[var(--bg-surface-highlight)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up ring-1 ring-black/5">

                        <div className="p-8 pb-6">
                            <h2 className="text-2xl font-bold app-title text-[var(--text-primary)]">Upload Document</h2>
                            <p className="text-sm text-[var(--text-secondary)] mt-2">Upload a PDF or Doc to generate quizzes and flashcards.</p>
                        </div>

                        <div className="px-8 pb-8 space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Document Title</label>
                                <input
                                    type="text"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    placeholder="e.g., Biology Chapter 1"
                                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] dark:bg-[var(--bg-surface-highlight)] text-[var(--text-primary)] text-base focus:ring-2 focus:ring-[var(--border-focus)]/20 focus:border-[var(--border-focus)] transition-all outline-none placeholder:text-[var(--text-tertiary)] shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">File</label>
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[var(--border-subtle)] rounded-3xl cursor-pointer bg-[var(--bg-page)]/50 hover:bg-[var(--bg-surface-highlight)] hover:border-[var(--color-brand-blue)] transition-all group relative overflow-hidden">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">

                                        {/* 1. Large Blue Upload Icon */}
                                        <div className="mb-4 p-3 bg-[var(--color-brand-blue)]/10 rounded-full group-hover:scale-110 transition-transform duration-300 text-[var(--color-brand-blue)]">
                                            <Upload className="w-8 h-8" />
                                        </div>

                                        {/* 2. Text */}
                                        <p className="mb-6 text-lg text-[var(--text-secondary)] font-medium">
                                            <span className="font-bold text-[var(--color-brand-blue)]">Click to upload</span> or drag and drop
                                        </p>

                                        {/* 3. Small Icons Row */}
                                        <div className="flex items-center gap-6 opacity-70 group-hover:opacity-100 transition-opacity">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                    <FileText className="w-5 h-5 text-red-500" />
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">PDF</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <FileText className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">DOCX</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                                    <Image className="w-5 h-5 text-purple-500" />
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">IMG</span>
                                            </div>
                                        </div>

                                    </div>
                                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileSelect} />

                                    {/* Success State Overlay */}
                                    {uploadFile && (
                                        <div className="absolute inset-0 bg-[var(--bg-page)]/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-fade-in">
                                            <div className="w-16 h-16 rounded-full bg-[var(--color-brand-green)]/10 flex items-center justify-center mb-4 text-[var(--color-brand-green)] shadow-sm">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <p className="text-lg font-semibold text-[var(--text-primary)] max-w-[80%] truncate px-4">{uploadFile.name}</p>
                                            <p className="text-sm text-[var(--text-secondary)] mt-1">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            <button
                                                onClick={(e) => { e.preventDefault(); setUploadFile(null); }}
                                                className="mt-6 text-sm font-semibold text-[var(--color-brand-red)] hover:text-[#C5221F] transition-colors bg-[var(--color-brand-red)]/10 px-4 py-2 rounded-full hover:bg-[var(--color-brand-red)]/20"
                                            >
                                                Remove file
                                            </button>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="p-6 pt-0 flex justify-end gap-3">
                            <button
                                onClick={() => { setIsUploadModalOpen(false); setUploadFile(null); setUploadTitle(''); }}
                                className="btn-app btn-outline h-11 px-6 rounded-xl text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUploadSubmit}
                                className="btn-app btn-primary h-11 px-8 rounded-xl text-sm shadow-md hover:shadow-lg"
                            >
                                Upload Document
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* YouTube Modal */}
            {isYoutubeModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-3xl animate-fade-in">
                    <div className="bg-[var(--bg-surface)] dark:bg-[var(--bg-surface-highlight)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up ring-1 ring-black/5 max-h-[85vh]">
                        <div className="p-8 pb-6 shrink-0">
                            <h2 className="text-2xl font-bold app-title text-[var(--text-primary)]">YouTube Summary</h2>
                            <p className="text-sm text-[var(--text-secondary)] mt-2">Paste a YouTube URL to get an AI-generated summary.</p>
                        </div>

                        <div className="px-8 pb-6 flex-1 overflow-y-auto">
                            {!youtubeSummaryResult ? (
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">YouTube URL</label>
                                    <input
                                        type="text"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="w-full h-12 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] dark:bg-[var(--bg-surface-highlight)] text-[var(--text-primary)] text-base focus:ring-2 focus:ring-[var(--border-focus)]/20 focus:border-[var(--border-focus)] transition-all outline-none placeholder:text-[var(--text-tertiary)] shadow-sm"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="prose dark:prose-invert max-w-none">
                                        <h3 className="font-medium text-lg text-[var(--text-primary)] mb-2">Summary</h3>
                                        <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{youtubeSummaryResult.summary || youtubeSummaryResult.data?.summary}</p>
                                    </div>
                                    {/* Optional: Show Transcript */}
                                    {/* <div className="bg-[var(--bg-page)] p-4 rounded-xl border border-[var(--border-subtle)]">
                                        <h4 className="text-sm font-semibold mb-2">Transcript Snippet</h4>
                                        <p className="text-xs text-[var(--text-secondary)] line-clamp-3">
                                            {youtubeSummaryResult.transcript || youtubeSummaryResult.data?.transcript}
                                        </p>
                                    </div> */}
                                </div>
                            )}
                        </div>

                        <div className="p-6 pt-0 shrink-0 flex justify-between items-center bg-[var(--bg-surface)] dark:bg-[var(--bg-surface-highlight)]">
                            {youtubeSummaryResult && (
                                <button
                                    onClick={() => { setYoutubeSummaryResult(null); setYoutubeUrl(''); }}
                                    className="text-sm text-[var(--color-brand-blue)] hover:underline"
                                >
                                    Summarize Another
                                </button>
                            )}
                            <div className="flex justify-end gap-3 ml-auto">
                                <button
                                    onClick={() => { setIsYoutubeModalOpen(false); setYoutubeUrl(''); setYoutubeSummaryResult(null); }}
                                    className="btn-app btn-outline h-11 px-6 rounded-xl text-sm"
                                >
                                    {youtubeSummaryResult ? 'Close' : 'Cancel'}
                                </button>
                                {!youtubeSummaryResult && (
                                    <button
                                        onClick={handleYoutubeSubmit}
                                        disabled={isYoutubeLoading || !youtubeUrl.trim()}
                                        className="btn-app btn-primary h-11 px-8 rounded-xl text-sm shadow-md hover:shadow-lg flex items-center gap-2"
                                    >
                                        {isYoutubeLoading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                                        {isYoutubeLoading ? 'Processing...' : 'Summarize'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Paste Text Modal */}
            {isTextModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-3xl animate-fade-in">
                    <div className="bg-[var(--bg-surface)] dark:bg-[var(--bg-surface-highlight)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up ring-1 ring-black/5 max-h-[85vh]">
                        <div className="p-8 pb-6 shrink-0">
                            <h2 className="text-2xl font-bold app-title text-[var(--text-primary)]">Text Summarization</h2>
                            <p className="text-sm text-[var(--text-secondary)] mt-2">Paste raw text to get a concise summary.</p>
                        </div>

                        <div className="px-8 pb-6 flex-1 overflow-y-auto">
                            {!textSummaryResult ? (
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Content</label>
                                    <textarea
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Paste your text here..."
                                        className="w-full h-64 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] dark:bg-[var(--bg-surface-highlight)] text-[var(--text-primary)] text-base focus:ring-2 focus:ring-[var(--border-focus)]/20 focus:border-[var(--border-focus)] transition-all outline-none placeholder:text-[var(--text-tertiary)] shadow-sm resize-none"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="prose dark:prose-invert max-w-none">
                                        <h3 className="font-medium text-lg text-[var(--text-primary)] mb-2">Summary</h3>
                                        <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{textSummaryResult}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 pt-0 shrink-0 flex justify-between items-center bg-[var(--bg-surface)] dark:bg-[var(--bg-surface-highlight)]">
                            {textSummaryResult && (
                                <button
                                    onClick={() => { setTextSummaryResult(null); setTextInput(''); }}
                                    className="text-sm text-[var(--color-brand-blue)] hover:underline"
                                >
                                    Summarize Another
                                </button>
                            )}
                            <div className="flex justify-end gap-3 ml-auto">
                                <button
                                    onClick={() => { setIsTextModalOpen(false); setTextInput(''); setTextSummaryResult(null); }}
                                    className="btn-app btn-outline h-11 px-6 rounded-xl text-sm"
                                >
                                    {textSummaryResult ? 'Close' : 'Cancel'}
                                </button>
                                {!textSummaryResult && (
                                    <button
                                        onClick={handleTextSubmit}
                                        disabled={isTextLoading || !textInput.trim()}
                                        className="btn-app btn-primary h-11 px-8 rounded-xl text-sm shadow-md hover:shadow-lg flex items-center gap-2"
                                    >
                                        {isTextLoading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                                        {isTextLoading ? 'Processing...' : 'Summarize'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
