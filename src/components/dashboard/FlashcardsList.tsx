import { useState, useEffect } from 'react';
import { flashcardService } from '@/services/flashcardService';
import { BookOpen, Search, Loader2, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import FlashcardSetCard from '@/components/dashboard/FlashcardSetCard';

export default function FlashcardsList() {
    const router = useRouter();
    const [sets, setSets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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
        <div className="flex-1 bg-[#fdfbf7] p-8 overflow-y-auto h-full">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <Brain className="w-10 h-10" />
                            Flashcard Sets
                        </h1>
                        <p className="text-gray-600 font-medium">Review your progress and master your subjects.</p>
                    </div>
                    {/* Search */}
                    <div className="w-full md:w-96">
                        <Input
                            icon={Search}
                            placeholder="Search decks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="brutal-card bg-white h-64 animate-pulse flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                            </div>
                        ))}
                    </div>
                ) : filteredSets.length === 0 ? (
                    <div className="text-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-600">No flashcard sets found</h3>
                        <p className="text-gray-400">Generate flashcards from your documents to see them here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                        {filteredSets.map((set) => (
                            <FlashcardSetCard
                                key={set._id}
                                set={set}
                                onClick={() => router.push(`/dashboard/document/${set.documentId._id || set.documentId}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
