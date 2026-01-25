'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, Youtube, PenTool, ChevronRight, Search, TrendingUp, BookOpen, Brain, Target } from 'lucide-react';
import { documentService } from '@/services/documentService';
import { progressService } from '@/services/progressService';
import { flashcardService } from '@/services/flashcardService';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface DashboardHomeProps {
    onViewAllDocuments: () => void;
}

export default function DashboardHome({ onViewAllDocuments }: DashboardHomeProps) {
    const router = useRouter();
    const [userName, setUserName] = useState('User');
    const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get user name from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserName(user.username || 'User');
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }

        // Fetch data
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {


            // Fetch only stats, which includes recent data
            const [progressStats, flashcardsres] = await Promise.all([
                progressService.getStats().catch(err => {
                    console.error('Stats fetch error:', err);
                    return null;
                }),
                flashcardService.getAllFlashcardSets().catch(err => {
                    console.error('Flashcards fetch error:', err);
                    return [];
                })
            ]);

            setStats(progressStats);
            setFlashcards(Array.isArray(flashcardsres) ? flashcardsres : (flashcardsres?.data || []));

            // Use recentData from stats for the documents list and count
            // Note: detailed document info like 'subject' might be missing in simplified recentData
            if (progressStats?.recentData?.documents) {
                setRecentDocuments(progressStats.recentData.documents);
            } else {
                setRecentDocuments([]);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

        try {
            toast.loading('UPLOADING...');
            await documentService.uploadDocument(formData);
            toast.dismiss();
            toast.success('DOCUMENT UPLOADED_');
            fetchDashboardData();
        } catch (error: any) {
            toast.dismiss();
            toast.error(error?.response?.data?.message || 'UPLOAD FAILED');
        }
    };

    return (
        <div className="flex-1 bg-[#fdfbf7] p-8 overflow-y-auto">
            {/* Search Bar */}
            <div className="max-w-6xl mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search for anything"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 font-medium focus:outline-none focus:border-black transition-colors"
                    />
                </div>
            </div>

            <div className="max-w-6xl">
                {/* Welcome Section */}
                <h1 className="text-4xl font-black mb-8">Welcome, {userName}</h1>

                {/* Stats Cards - Always Display */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="brutal-card bg-gray-100 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-300"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-300 rounded mb-2 w-20"></div>
                                        <div className="h-8 bg-gray-300 rounded w-12"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                        <div className="brutal-card bg-blue-50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-600 flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-bold">Documents</p>
                                    <p className="text-2xl font-black">{recentDocuments.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="brutal-card bg-green-50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-600 flex items-center justify-center">
                                    <Brain className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-bold">Flashcard Sets</p>
                                    <p className="text-2xl font-black">{stats?.stats?.flashcards?.totalSets || 0}</p>
                                    <p className="text-xs text-gray-500">{stats?.stats?.flashcards?.totalCards || 0} cards</p>
                                </div>
                            </div>
                        </div>

                        <div className="brutal-card bg-purple-50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-600 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-bold">Quizzes</p>
                                    <p className="text-2xl font-black">{stats?.stats?.quizzes?.taken || 0}</p>
                                    <p className="text-xs text-gray-500">{stats?.stats?.quizzes?.totalQuestionsAnswered || 0} questions</p>
                                </div>
                            </div>
                        </div>

                        <div className="brutal-card bg-yellow-50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-yellow-600 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-bold">Avg Score</p>
                                    <p className="text-2xl font-black">{stats?.stats?.quizzes?.avgScore || 0}%</p>
                                    <p className="text-xs text-gray-500">🔥 {stats?.stats?.streak?.current || 0} day streak</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Section */}
                <h2 className="text-xl font-bold mb-6">Create</h2>

                <div className="grid md:grid-cols-2 gap-4 mb-12">
                    {isLoading ? (
                        [1, 2, 3, 4].map((i) => (
                            <div key={i} className="brutal-card bg-gray-100 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-300"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-gray-300 w-1/3 rounded"></div>
                                        <div className="h-4 bg-gray-300 w-2/3 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            {/* Import From File */}
                            <label className="brutal-card hover:bg-gray-50 cursor-pointer transition-colors group">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 border-2 border-black flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Import From File</h3>
                                            <p className="text-sm text-gray-600">Upload PDF, Word Document, or PowerPoint</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                </div>
                            </label>

                            {/* Paste Text */}
                            <button
                                onClick={() => router.push('/dashboard/create/paste')}
                                className="brutal-card hover:bg-gray-50 transition-colors group text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 border-2 border-black flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Paste Text</h3>
                                            <p className="text-sm text-gray-600">Copy and paste from wherever your content is</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                </div>
                            </button>

                            {/* YouTube Link */}
                            <button
                                onClick={() => router.push('/dashboard/create/youtube')}
                                className="brutal-card hover:bg-gray-50 transition-colors group text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-100 border-2 border-black flex items-center justify-center">
                                            <Youtube className="w-6 h-6 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">YouTube Link</h3>
                                            <p className="text-sm text-gray-600">Simply paste the video link</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                </div>
                            </button>

                            {/* Create Manually */}
                            <button
                                onClick={() => router.push('/dashboard/create/manual')}
                                className="brutal-card hover:bg-gray-50 transition-colors group text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-100 border-2 border-black flex items-center justify-center">
                                            <PenTool className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Create Manually</h3>
                                            <p className="text-sm text-gray-600">Full control. Always unlimited and free.</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                </div>
                            </button>
                        </>
                    )}
                </div>

                {/* Recent Study Sets */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Recent Documents</h2>
                    <button
                        onClick={onViewAllDocuments}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                        View all <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="brutal-card bg-gray-100 animate-pulse h-20"></div>
                        ))}
                    </div>
                ) : Array.isArray(recentDocuments) && recentDocuments.length === 0 ? (
                    <div className="text-center py-12 bg-white border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 font-medium mb-2">No study sets yet</p>
                        <p className="text-sm text-gray-400">Upload your first document to get started!</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {Array.isArray(recentDocuments) && recentDocuments.map((doc) => (
                            <button
                                key={doc._id}
                                onClick={() => router.push(`/dashboard/document/${doc._id}`)}
                                className="brutal-card hover:bg-gray-50 transition-colors text-left group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{doc.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            {doc.subject || 'No subject'} • Created {new Date(doc.createdAt || doc.uploadDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
                {/* Flashcard Sets */}
                <div className="flex items-center justify-between mb-6 mt-12">
                    <h2 className="text-xl font-bold">Recent Flashcard Sets</h2>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="brutal-card bg-gray-100 animate-pulse h-20"></div>
                        ))}
                    </div>
                ) : Array.isArray(flashcards) && flashcards.length === 0 ? (
                    <div className="text-center py-8 bg-white border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 font-medium">No flashcard sets yet</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {Array.isArray(flashcards) && flashcards.slice(0, 5).map((set: any) => (
                            <button
                                key={set._id}
                                onClick={() => router.push(`/dashboard/document/${set.documentId}`)}
                                className="brutal-card hover:bg-green-50 transition-colors text-left group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{set.title || 'Flashcard Set'}</h3>
                                        <p className="text-sm text-gray-600">
                                            {set.cards?.length || 0} cards • Created {new Date(set.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-green-100 text-green-800 text-xs font-black px-2 py-1 uppercase tracking-wider rounded border border-black">
                                            Study
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
