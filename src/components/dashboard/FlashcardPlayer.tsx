'use client';

import { useState, useRef, useEffect } from 'react';
import {
    MdClose as X,
    MdChevronLeft as ChevronLeft,
    MdChevronRight as ChevronRight,
    MdOutlineStar as Star
} from 'react-icons/md';
import { flashcardService } from '@/services/flashcardService';
import toast from 'react-hot-toast';

interface Flashcard {
    _id: string;
    front: string;
    back: string;
    question?: string;
    answer?: string;
    isStarred?: boolean;
    reviewCount?: number;
}

interface FlashcardPlayerProps {
    cards: Flashcard[];
    setId: string;
    onClose: () => void;
}

export default function FlashcardPlayer({ cards, setId, onClose }: FlashcardPlayerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [localCards, setLocalCards] = useState<Flashcard[]>(cards);

    // Sync props to local state if cards change (e.g. from api reload)
    useEffect(() => {
        setLocalCards(cards);
        // If cards change drastically, maybe reset index? 
        // For now, if cards array length changes, let's reset to be safe.
        if (cards.length !== localCards.length) {
            setCurrentIndex(0);
            setIsFlipped(false);
        }
    }, [cards]);

    const currentCard = localCards[currentIndex];

    // Touch handling for swipe
    const touchStart = useRef<number | null>(null);
    const touchEnd = useRef<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        touchEnd.current = null;
        touchStart.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEnd.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;
        const distance = touchStart.current - touchEnd.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && currentIndex < localCards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        }
        if (isRightSwipe && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const handleToggleStar = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentCard || !currentCard._id) return;

        try {
            const updatedCards = [...localCards];
            updatedCards[currentIndex] = {
                ...currentCard,
                isStarred: !currentCard.isStarred
            };
            setLocalCards(updatedCards);
            await flashcardService.toggleStar(setId, currentCard._id);
        } catch (error) {
            toast.error('Failed to update star');
            const revertedCards = [...localCards];
            revertedCards[currentIndex] = currentCard;
            setLocalCards(revertedCards);
        }
    };

    const handleMarkReview = async () => {
        if (!currentCard || !currentCard._id) return;
        try {
            await flashcardService.reviewCard(setId, currentCard._id, { review: true });
        } catch (error) {
            console.error(error);
        }
    };

    if (!currentCard) return null;

    return (
        <div className="w-full h-full relative">
            <button
                onClick={onClose}
                className="absolute top-0 right-0 text-[var(--color-brand-red)] hover:bg-[var(--color-brand-red)]/10 px-4 py-2 rounded-full transition-all flex items-center gap-2 font-medium"
                title="Close"
            >
                <span>Close</span>
                <X className="w-5 h-5" />
            </button>

            <div className="w-full max-w-md flex flex-col items-center mx-auto h-full justify-center">
                {/* Header */}
                <div className="w-full mb-8 text-center shrink-0">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Studying Flashcards</h2>
                    <p className="text-sm font-medium text-[var(--text-tertiary)]">Card {currentIndex + 1} of {localCards.length}</p>
                </div>

                {/* Card */}
                <div
                    className="perspective-1000 w-full aspect-[4/5] max-h-[500px] cursor-pointer group mb-8"
                    onClick={() => {
                        setIsFlipped(!isFlipped);
                        if (!isFlipped) handleMarkReview();
                    }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        {/* Front */}
                        <div className="absolute w-full h-full backface-hidden bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-[2rem] p-8 flex flex-col shadow-2xl transition-all">
                            <div className="flex justify-between items-center mb-4 shrink-0">
                                <span className="text-[10px] font-bold uppercase text-[var(--text-tertiary)] tracking-[0.2em]">Question</span>
                                <button
                                    onClick={handleToggleStar}
                                    className="hover:scale-110 transition-transform p-2 rounded-full hover:bg-[var(--bg-surface-highlight)]"
                                >
                                    <Star
                                        className={`w-5 h-5 ${currentCard.isStarred ? 'fill-[var(--color-brand-yellow)] text-[var(--color-brand-yellow)]' : 'text-[var(--text-tertiary)]'}`}
                                    />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto flex items-center justify-center py-4 scrollbar-hide">
                                <p className="text-2xl font-semibold text-center leading-relaxed text-[var(--text-primary)] w-full font-sans">
                                    {currentCard.front || currentCard.question}
                                </p>
                            </div>
                            <p className="text-[10px] text-[var(--text-tertiary)] font-bold text-center uppercase tracking-[0.2em] shrink-0 mt-4 opacity-60">Click to flip</p>
                        </div>

                        {/* Back */}
                        <div className="absolute w-full h-full backface-hidden bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-[2rem] p-8 flex flex-col shadow-2xl rotate-y-180">
                            <div className="flex justify-between items-center mb-4 shrink-0">
                                <span className="text-[10px] font-bold uppercase text-[var(--color-brand-green)] tracking-[0.2em]">Answer</span>
                            </div>
                            <div className="flex-1 overflow-y-auto flex items-center justify-center py-4 scrollbar-hide">
                                <p className="text-xl font-medium text-center leading-relaxed text-[var(--text-primary)] w-full">
                                    {currentCard.back || currentCard.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-6 mb-8 shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(prev => Math.max(0, prev - 1));
                            setIsFlipped(false);
                        }}
                        disabled={currentIndex === 0}
                        className="w-14 h-14 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-page)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface-highlight)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(prev => Math.min(localCards.length - 1, prev + 1));
                            setIsFlipped(false);
                        }}
                        disabled={currentIndex === localCards.length - 1}
                        className="w-14 h-14 rounded-full bg-[#202124] text-white flex items-center justify-center hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress */}
                <div className="w-full flex items-center gap-4 text-xs font-bold text-[var(--text-tertiary)] shrink-0">
                    <span>0%</span>
                    <div className="flex-1 h-1.5 bg-[var(--bg-surface-highlight)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--color-brand-blue)] rounded-full transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / localCards.length) * 100}%` }}
                        />
                    </div>
                    <span>100%</span>
                </div>
            </div>
        </div>
    );
}
