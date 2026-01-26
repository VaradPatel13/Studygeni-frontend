'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, X, RotateCcw } from 'lucide-react';
import { flashcardService } from '@/services/flashcardService';
import toast from 'react-hot-toast';

interface Flashcard {
    _id: string;
    front: string;
    back: string;
    question?: string; // fallback
    answer?: string;   // fallback
    isStarred?: boolean;
    reviewCount?: number;
}

interface FlashcardPlayerProps {
    cards: Flashcard[];
    setId: string;
    onClose: () => void;
    title?: string;
}

export default function FlashcardPlayer({ cards, setId, onClose, title }: FlashcardPlayerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [localCards, setLocalCards] = useState<Flashcard[]>(cards);

    useEffect(() => {
        setLocalCards(cards);
        setCurrentIndex(0);
        setIsFlipped(false);
    }, [cards]);

    const currentCard = localCards[currentIndex];

    // Handlers from DocumentViewer logic
    const handleToggleStar = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentCard || !currentCard._id) return;

        try {
            // Optimistic update
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
            // Ideally update local state or just show toast
            // toast.success('Marked as reviewed');
        } catch (error) {
            // silent fail or toast
        }
    };

    const handleNext = () => {
        setCurrentIndex(prev => Math.min(localCards.length - 1, prev + 1));
        setIsFlipped(false);
    };

    const handlePrev = () => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
        setIsFlipped(false);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (!isFlipped) {
            handleMarkReview();
        }
    };

    if (!currentCard) return null;

    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto items-center animate-fade-in">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-8 px-4 md:px-0">
                <div>
                    <h2 className="text-2xl google-title font-medium text-[var(--text-primary)] mb-1">
                        {title || 'Studying Flashcards'}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Card {currentIndex + 1} of {localCards.length}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-[var(--color-google-red)] font-semibold hover:bg-[var(--color-google-red)]/10 px-4 py-2 rounded-full transition-colors"
                >
                    <X className="w-4 h-4" /> Close
                </button>
            </div>

            {/* Card Area */}
            <div
                className="perspective-1000 w-full max-w-2xl h-96 cursor-pointer group mb-8"
                onClick={handleFlip}
            >
                <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-3xl p-10 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all">
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                            <span className="text-xs font-bold uppercase text-[var(--text-tertiary)] tracking-widest">Question</span>
                            <button
                                onClick={handleToggleStar}
                                className="hover:scale-110 transition-transform p-2 rounded-full hover:bg-[var(--bg-surface-highlight)]"
                            >
                                <Star
                                    className={`w-6 h-6 ${currentCard.isStarred ? 'fill-[var(--color-google-yellow)] text-[var(--color-google-yellow)]' : 'text-[var(--text-tertiary)]'}`}
                                />
                            </button>
                        </div>
                        <p className="text-2xl md:text-3xl font-medium text-center leading-relaxed text-[var(--text-primary)] max-h-60 overflow-y-auto w-full px-4 scrollbar-thin">
                            {currentCard.front || currentCard.question}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] font-bold absolute bottom-6 uppercase tracking-wider">Click to flip</p>
                    </div>

                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden bg-[#202124] text-white rounded-3xl p-10 flex flex-col items-center justify-center shadow-lg rotate-y-180 border border-transparent">
                        <span className="text-xs font-bold uppercase text-gray-400 absolute top-6 left-6 tracking-widest">Answer</span>
                        <p className="text-xl md:text-2xl font-medium text-center leading-relaxed max-h-60 overflow-y-auto w-full px-4 scrollbar-thin">
                            {currentCard.back || currentCard.answer}
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    disabled={currentIndex === 0}
                    className="w-14 h-14 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-page)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface-highlight)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    disabled={currentIndex === localCards.length - 1}
                    className="w-14 h-14 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] flex items-center justify-center hover:bg-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mt-8 flex items-center gap-4">
                <span className="text-xs font-bold text-[var(--text-tertiary)]">0%</span>
                <div className="flex-1 h-1.5 bg-[var(--bg-surface-highlight)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--color-google-blue)] transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / localCards.length) * 100}%` }}
                    />
                </div>
                <span className="text-xs font-bold text-[var(--text-tertiary)]">100%</span>
            </div>
        </div>
    );
}
