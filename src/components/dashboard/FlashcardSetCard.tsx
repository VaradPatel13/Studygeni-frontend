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
        <div
            onClick={onClick}
            className="g-card p-6 flex flex-col justify-between h-64 cursor-pointer hover:-translate-y-1 transition-transform duration-300"
        >
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-[var(--color-google-green)]/10 flex items-center justify-center rounded-xl text-[var(--color-google-green)]">
                        <Brain className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--bg-surface-highlight)] px-2 py-1 rounded-md uppercase tracking-wide">
                        {new Date(set.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <h3 className="text-xl font-medium mb-1 line-clamp-1 leading-tight text-[var(--text-primary)] group-hover:text-[var(--color-google-blue)] transition-colors">
                    {docTitle}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] font-normal mb-6 line-clamp-1">
                    {set.documentId?.filename}
                </p>
            </div>

            <div className="space-y-4">
                {/* Stats */}
                <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> {total} Cards
                    </div>
                    {starredCount > 0 && (
                        <div className="flex items-center gap-1.5 text-[var(--color-google-yellow)]">
                            <Star className="w-3.5 h-3.5 fill-current" /> {starredCount}
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5 text-[var(--text-secondary)] tracking-wider">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--bg-surface-highlight)] rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${progress === 100 ? 'bg-[var(--color-google-green)]' : 'bg-[var(--color-google-yellow)]'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
