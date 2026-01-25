import { BookOpen, Star, Brain } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface FlashcardSetCardProps {
    set: any;
    onClick: () => void;
}

export default function FlashcardSetCard({ set, onClick }: FlashcardSetCardProps) {
    const cards = set.cards || [];
    const total = cards.length;
    const reviewedCount = cards.filter((c: any) => c.reviewCount > 0).length;
    const starredCount = cards.filter((c: any) => c.isStarred).length;
    const progress = total > 0 ? Math.round((reviewedCount / total) * 100) : 0;
    const docTitle = set.documentId?.title || 'Untitled Document';

    return (
        <Card
            hoverable
            onClick={onClick}
            className="flex flex-col justify-between h-full min-h-[250px] p-0 overflow-hidden" // p-0 because internal padding might vary or I reuse Card styles
        >
            {/* Card actually has padding p-6 in default. I'll stick to default padding. */}
            {/* Note: In original code, I had p-6. My wrapper adds p-6. */}

            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-green-100 border-2 border-black flex items-center justify-center rounded">
                        <Brain className="w-6 h-6 text-green-700" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                        {new Date(set.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <h3 className="text-xl font-black mb-1 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors">
                    {docTitle}
                </h3>
                <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-1">
                    {set.documentId?.filename}
                </p>
            </div>

            <div className="space-y-4">
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm font-bold text-gray-600">
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" /> {total} Cards
                    </div>
                    {starredCount > 0 && (
                        <div className="flex items-center gap-1 text-orange-500">
                            <Star className="w-4 h-4 fill-current" /> {starredCount}
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div>
                    <div className="flex justify-between text-xs font-black uppercase mb-1">
                        <span>Progress</span>
                        <span>{progress}% ({reviewedCount}/{total})</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 border border-black rounded-full overflow-hidden">
                        <div
                            className={`h-full border-r border-black transition-all ${progress === 100 ? 'bg-green-500' : 'bg-yellow-400'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
