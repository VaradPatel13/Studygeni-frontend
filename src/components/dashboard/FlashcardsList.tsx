import { useState, useEffect } from 'react';
import { flashcardService } from '@/services/flashcardService';
import { BookOpen, Search, Loader2, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import FlashcardSetCard from '@/components/dashboard/FlashcardSetCard';
import { Skeleton } from '@/components/ui/Skeleton';
import FlashcardPlayer from '@/components/dashboard/FlashcardPlayer';

export default function FlashcardsList() {
    const router = useRouter();
    const [sets, setSets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSet, setActiveSet] = useState<any>(null);

    useEffect(() => {
        fetchSets();
    }, []);

    const fetchSets = async () => {
        try {
            const res = await flashcardService.getAllFlashcardSets();
            const list = res.data?.flashcardSets || res.flashcardSets || (Array.isArray(res) ? res : []);
            setSets(list);
        } catch (error) {
            console.error('Failed to fetch flashcard sets', error);
            toast.error('Failed to load flashcards');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredSets = sets.filter(set =>
        (set.documentId?.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (set.documentId?.filename?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 bg-[var(--bg-page)] p-8 overflow-y-auto h-full">
            <div className="max-w-6xl mx-auto h-full">
                {activeSet ? (
                    <FlashcardPlayer
                        cards={activeSet.cards || activeSet.flashcards || []}
                        setId={activeSet._id}
                        onClose={() => setActiveSet(null)}
                    />
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl app-title font-medium mb-1 text-[var(--text-primary)] flex items-center gap-3">
                                    <Brain className="w-8 h-8 text-[var(--color-brand-blue)]" />
                                    Flashcard Sets
                                </h1>
                                <p className="text-[var(--text-secondary)] font-normal">Review your progress and master your subjects.</p>
                            </div>
                            {/* Search */}
                            <div className="w-full md:w-96">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                    <input
                                        type="text"
                                        placeholder="Search decks..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-12 pl-12 pr-6 rounded-full bg-[var(--bg-surface-highlight)] border-transparent focus:bg-[var(--bg-page)] focus:border-[var(--color-brand-blue)] focus:ring-4 focus:ring-[var(--color-brand-blue)]/10 transition-all outline-none font-medium placeholder-[var(--text-tertiary)] text-[var(--text-primary)] shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="app-card p-6 h-64 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <Skeleton className="w-10 h-10 rounded-xl" />
                                                <Skeleton className="w-20 h-6 rounded-md" />
                                            </div>
                                            <Skeleton className="h-6 w-3/4 mb-2" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                        <div className="space-y-4">
                                            <Skeleton className="h-4 w-1/3" />
                                            <div>
                                                <div className="flex justify-between mb-1.5">
                                                    <Skeleton className="h-3 w-12" />
                                                    <Skeleton className="h-3 w-8" />
                                                </div>
                                                <Skeleton className="w-full h-1.5 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredSets.length === 0 ? (
                            <div className="text-center py-20 bg-[var(--bg-page)] border border-dashed border-[var(--border-subtle)] rounded-3xl">
                                <div className="w-20 h-20 bg-[var(--bg-surface-highlight)] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BookOpen className="w-10 h-10 text-[var(--text-tertiary)]" />
                                </div>
                                <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">No flashcard sets found</h3>
                                <p className="text-[var(--text-secondary)]">Generate flashcards from your documents to see them here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                                {filteredSets.map((set) => (
                                    <FlashcardSetCard
                                        key={set._id}
                                        set={set}
                                        onClick={() => setActiveSet(set)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
