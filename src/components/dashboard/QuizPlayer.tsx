'use client';

import { useState } from 'react';
import {
    MdClose as X,
    MdRefresh as RotateCcw,
    MdCheck as Check,
    MdOutlineRefresh as Loader2,
    MdChevronLeft as ChevronLeft,
    MdChevronRight as ChevronRight
} from 'react-icons/md';
import { toast } from 'react-hot-toast'; // Assuming usage
import confetti from 'canvas-confetti';

interface Question {
    question: string;
    options: string[];
    correctAnswer: string; // "0", "1", etc.
    explanation?: string;
}

interface Quiz {
    _id: string;
    title: string;
    questions: Question[];
    createdAt: string;
    completedAt?: string;
    score?: number;
    totalQuestions?: number;
    percentage?: number;
    userAnswers?: Array<{ questionIndex: number, selectedAnswer: string }>;
}

interface QuizPlayerProps {
    quiz: Quiz;
    onClose: () => void;
    onSubmit: (answers: Record<string, number>) => Promise<any>; // Returns result object
}

export default function QuizPlayer({ quiz, onClose, onSubmit }: QuizPlayerProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showAnswersMode, setShowAnswersMode] = useState(false);

    // If quiz is already completed (passed in props), we might want to start in result mode?
    // The parent logic in DocumentViewer handles "selecting" a quiz. 
    // If it has a score/completedAt, they pass it in.
    // BUT current DocumentViewer logic constructs 'quizResult' state separately.
    // Let's assume this player handles the *active* taking or *reviewing* of a single quiz session.

    // Initialize state from props if it's a review
    /* 
       Actually, `DocumentViewer` had complex logic: 
       - `handleSelectQuiz` sets `quiz` state AND `quizResult` state if completed.
       - We should replicate that or let `quiz` prop carry the history.
    */

    const questions = quiz.questions || [];
    const totalQuestions = questions.length;
    const currentQuestion = questions[currentQuestionIndex];

    const handleOptionSelect = (optIdx: number) => {
        if (result && !showAnswersMode) return; // Locked if finished
        if (showAnswersMode) return; // Locked in review

        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: optIdx
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await onSubmit(answers);
            setResult(res);
            // Trigger confetti if good score
            if (res.percentage > 35) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335']
                });
            }
        } catch (error) {
            // Toast handled by parent usually, but we can safely ignore here
        } finally {
            setIsSubmitting(false);
        }
    };

    // If result exists, we show Results View
    if (result) {
        return (
            <div className="w-full max-w-md flex flex-col items-center mx-auto h-full justify-center animate-fade-in">
                {/* Header */}
                <div className="w-full flex justify-between items-center mb-8 px-4 md:px-0">
                    <div>
                        <h2 className="text-2xl app-title font-medium text-[var(--text-primary)] mb-1">Quiz Results</h2>
                        <p className="text-sm text-[var(--text-secondary)]">{quiz.title || 'Untitled Quiz'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-[var(--color-brand-red)] font-semibold hover:bg-[var(--color-brand-red)]/10 px-4 py-2 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" /> Close
                    </button>
                </div>

                {!showAnswersMode ? (
                    <div className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-[2rem] p-10 flex flex-col items-center shadow-2xl">
                        <div className="text-6xl font-light mb-6 flex justify-center items-center gap-2 tracking-tighter">
                            <span className={result.percentage >= 70 ? 'text-[var(--color-brand-green)]' : 'text-[var(--color-brand-yellow)]'}>
                                {result.percentage}%
                            </span>
                        </div>
                        <p className="text-lg font-medium text-[var(--text-secondary)] mb-8 text-center">
                            You got <span className="text-[var(--text-primary)] font-bold">{result.score}</span> out of <span className="text-[var(--text-primary)] font-bold">{result.total}</span> correct.
                        </p>

                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={() => {
                                    setResult(null);
                                    setAnswers({});
                                    setCurrentQuestionIndex(0);
                                }}
                                className="w-full py-3 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] font-bold shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" /> Retake Quiz
                            </button>
                            <button
                                onClick={() => setShowAnswersMode(true)}
                                className="w-full py-3 rounded-full border border-[var(--border-subtle)] font-bold hover:bg-[var(--bg-surface-highlight)] transition-colors"
                            >
                                Review Answers
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Review Mode Re-using the card UI but scrolling or paginated? 
                       Let's stick to paginated for consistency with the nice UI. */
                    <div className="w-full flex flex-col items-center h-full justify-center">
                        {/* We render the card below but with 'isResult' context */}
                    </div>
                )}
            </div>
        );
    }

    // Active Quiz View (or Review View if showAnswersMode is true)

    // Determine content for Review Mode
    let isCorrect = false;
    let explanation = '';
    let selectedAnswer = -1;
    let correctAnswer = -1;

    if (showAnswersMode || result) { // If result is present and we are here, implies showAnswersMode might be needed. 
        // Wait, if result is set, we return early above UNLESS showAnswersMode is true.
        // So if we are here and `result` is truthy, `showAnswersMode` MUST be true.

        // Actually, let's restructure:
        // Render the Main Card View.
        // If result & !showAnswersMode -> Result Card (handled above).
        // If !result or showAnswersMode -> Question Card.
    }

    if (showAnswersMode && result) {
        correctAnswer = parseInt(currentQuestion.correctAnswer);
        // Find user answer from 'answers' state which should still be intact?
        // Or from result.userAnswers if passed back? 
        // Let's rely on 'answers' state being preserved.
        selectedAnswer = answers[currentQuestionIndex] ?? -1;
        isCorrect = selectedAnswer === correctAnswer;
        explanation = currentQuestion.explanation || '';
    }

    return (
        <div className="w-full max-w-md flex flex-col items-center mx-auto h-full justify-center animate-fade-in">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-8 px-4 md:px-0">
                <div>
                    <h2 className="text-2xl app-title font-medium text-[var(--text-primary)] mb-1">
                        {showAnswersMode ? 'Reviewing Quiz' : 'Taking Quiz'}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-[var(--color-brand-red)] font-semibold hover:bg-[var(--color-brand-red)]/10 px-4 py-2 rounded-full transition-colors"
                >
                    <X className="w-4 h-4" /> {showAnswersMode ? 'Close' : 'Exit'}
                </button>
            </div>

            {/* Question Card */}
            <div className={`w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-[2rem] p-8 flex flex-col shadow-2xl transition-all mb-8 relative overflow-hidden ${showAnswersMode ? (isCorrect ? 'border-[var(--color-brand-green)]/30' : 'border-[var(--color-brand-red)]/30') : ''}`}>
                {showAnswersMode && (
                    <div className={`absolute top-0 left-0 w-full h-1.5 ${isCorrect ? 'bg-[var(--color-brand-green)]' : 'bg-[var(--color-brand-red)]'}`} />
                )}

                <div className="flex-1 overflow-y-auto scrollbar-hide mb-6 max-h-[200px]">
                    <h3 className="text-xl font-semibold leading-relaxed text-[var(--text-primary)] font-sans">
                        {currentQuestion.question}
                    </h3>
                </div>

                <div className="flex flex-col gap-3">
                    {currentQuestion.options.map((option, idx) => {
                        let btnClass = "w-full p-4 rounded-xl border text-sm font-medium text-left transition-all relative overflow-hidden ";

                        if (showAnswersMode) {
                            if (idx === correctAnswer) {
                                btnClass += "bg-[var(--color-brand-green)]/10 border-[var(--color-brand-green)] text-[var(--color-brand-green)] font-bold";
                            } else if (idx === selectedAnswer && !isCorrect) {
                                btnClass += "bg-[var(--color-brand-red)]/5 border-[var(--color-brand-red)] text-[var(--color-brand-red)]";
                            } else {
                                btnClass += "border-[var(--border-subtle)] text-[var(--text-secondary)] opacity-50";
                            }
                        } else {
                            if (answers[currentQuestionIndex] === idx) {
                                btnClass += "bg-[var(--color-brand-blue)]/5 border-[var(--color-brand-blue)] text-[var(--color-brand-blue)] shadow-inner";
                            } else {
                                btnClass += "border-[var(--border-subtle)] hover:border-[var(--text-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-highlight)]";
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(idx)}
                                disabled={showAnswersMode}
                                className={btnClass}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${showAnswersMode
                                        ? (idx === correctAnswer ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)] text-white' : (idx === selectedAnswer ? 'border-[var(--color-brand-red)] bg-[var(--color-brand-red)] text-white' : 'border-[var(--text-tertiary)]'))
                                        : (answers[currentQuestionIndex] === idx ? 'border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]' : 'border-[var(--text-tertiary)]')
                                        }`}>
                                        {(showAnswersMode ? (idx === correctAnswer || idx === selectedAnswer) : answers[currentQuestionIndex] === idx) && (
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                    </div>
                                    {option}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {showAnswersMode && explanation && (
                    <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] animate-fade-in">
                        <span className="text-xs font-bold uppercase text-[var(--text-tertiary)] tracking-wider mb-2 block">Explanation</span>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{explanation}</p>
                    </div>
                )}
            </div>

            {/* Navigation / Actions */}
            <div className="flex justify-between items-center w-full gap-4 shrink-0 mb-8">
                <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="w-12 h-12 rounded-full border border-[var(--border-subtle)] flex items-center justify-center hover:bg-[var(--bg-surface-highlight)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft className="w-6 h-6 text-[var(--text-secondary)]" />
                </button>

                {!showAnswersMode ? (
                    currentQuestionIndex === totalQuestions - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || Object.keys(answers).length !== totalQuestions}
                            className="flex-1 h-12 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Submit Quiz
                        </button>
                    ) : (
                        <div className="flex-1" /> // Spacer
                    )
                ) : (
                    // In review mode, maybe a "Back to Results" button in middle?
                    <button
                        onClick={() => setShowAnswersMode(false)}
                        className="px-6 h-12 rounded-full border border-[var(--border-subtle)] font-medium hover:bg-[var(--bg-surface-highlight)] transition-colors"
                    >
                        Back to Results
                    </button>
                )}

                <button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${currentQuestionIndex === totalQuestions - 1 ? 'opacity-30 cursor-not-allowed border border-[var(--border-subtle)]' : 'bg-[#202124] text-white hover:bg-black dark:bg-white dark:text-black'}`}
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
                        style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                    />
                </div>
                <span>100%</span>
            </div>
        </div>
    );
}
