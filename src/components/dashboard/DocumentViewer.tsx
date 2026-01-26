import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { documentService } from '@/services/documentService';
import { aiService } from '@/services/aiService';
import { flashcardService } from '@/services/flashcardService';
import { quizService } from '@/services/quizService';
import { ArrowLeft, MessageSquare, Zap, BookOpen, Brain, FileText, ExternalLink, Send, Bot, User, RotateCcw, Check, X, ChevronLeft, ChevronRight, ChevronDown, Loader2, Play, AlignLeft, Lightbulb, Star } from 'lucide-react';
import { getCachedChatHistory, cacheChatHistory, getCachedSummary, cacheSummary, getCachedExplanation, cacheExplanation, getExplanationsByDocument } from '@/lib/cacheDB';
import toast from 'react-hot-toast';

interface DocumentViewerProps {
    documentId: string;
    onBack: () => void;
}

import ReactMarkdown from 'react-markdown';

// ... (existing imports)

const TypingMarkdown = ({ content, shouldAnimate }: { content: string, shouldAnimate?: boolean }) => {
    const [displayedContent, setDisplayedContent] = useState(shouldAnimate ? '' : content);
    const hasAnimatedRef = useRef(!shouldAnimate);

    useEffect(() => {
        if (!shouldAnimate || hasAnimatedRef.current) {
            setDisplayedContent(content);
            return;
        }

        let currentIndex = 0;
        const intervalId = setInterval(() => {
            if (currentIndex >= content.length) {
                clearInterval(intervalId);
                hasAnimatedRef.current = true;
                return;
            }
            // Add a chunk of characters to speed up long texts
            const chunk = Math.max(1, Math.floor(content.length / 200));
            const nextIndex = Math.min(currentIndex + chunk, content.length);
            setDisplayedContent(content.slice(0, nextIndex));
            currentIndex = nextIndex;
        }, 15);

        return () => clearInterval(intervalId);
    }, [content, shouldAnimate]);

    return (
        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4">
            <ReactMarkdown>{displayedContent}</ReactMarkdown>
        </div>
    );
};

export default function DocumentViewer({ documentId, onBack }: DocumentViewerProps) {
    const searchParams = useSearchParams();
    const [document, setDocument] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('content');
    const [viewMode, setViewMode] = useState<'pdf' | 'text'>('pdf');

    // --- Chat State ---
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const historyLoadedRef = useRef(false);

    // --- AI Actions State ---
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null); // Current one
    const [pastExplanations, setPastExplanations] = useState<any[]>([]); // History
    const [explainConceptStr, setExplainConceptStr] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);

    // ...

    // Fetch cached Summary
    useEffect(() => {
        const fetchSummary = async () => {
            if (activeTab === 'summary' && documentId) {
                try {
                    const cachedSummary = await getCachedSummary(documentId);
                    if (cachedSummary) {
                        setSummary(cachedSummary);
                    }
                } catch (error) {
                    console.error('Error fetching summary cache:', error);
                }
            }
        };

        fetchSummary();
    }, [activeTab, documentId]);

    // Fetch cached Explanations
    useEffect(() => {
        const fetchExplanations = async () => {
            if (activeTab === 'explain' && documentId) {
                try {
                    const expls = await getExplanationsByDocument(documentId);
                    setPastExplanations(expls);
                } catch (error) {
                    console.error('Error fetching explanation cache:', error);
                }
            }
        };

        fetchExplanations();
    }, [activeTab, documentId]);

    // ...

    const handleSummarize = async () => {
        setIsSummarizing(true);
        try {
            const res = await aiService.generateSummary(documentId);
            // Handle { success: true, data: { summary: "..." } }
            const summaryText = res.data?.summary || res.summary;
            setSummary(summaryText);
            if (summaryText) {
                await cacheSummary(documentId, summaryText);
            }
        } catch (error) {
            toast.error('Failed to generate summary');
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleExplain = async () => {
        if (!explainConceptStr.trim()) return;

        // Check cache first for immediate display
        try {
            const cachedExpl = await getCachedExplanation(documentId, explainConceptStr);
            if (cachedExpl) {
                setExplanation(cachedExpl);
                // Also refresh the list to ensure it's at top (though timestamp sort handles it)
                // Actually cachedExpl is just string.
                // We'll just show it in the main view for now.
                // But user wants list.
                // Re-fetch list? Or unshift?
            }
        } catch (e) {
            console.error(e);
        }

        setIsExplaining(true);
        try {
            const res = await aiService.explainConcept(documentId, explainConceptStr);
            const explanationText = res.data?.explanation || res.explanation;

            setExplanation(explanationText);
            if (explanationText) {
                await cacheExplanation(documentId, explainConceptStr, explanationText);
                // Refresh list
                const expls = await getExplanationsByDocument(documentId);
                setPastExplanations(expls);
            }
        } catch (error) {
            toast.error('Failed to explain concept');
        } finally {
            setIsExplaining(false);
        }
    };

    // --- Flashcards State ---
    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [flashcardsList, setFlashcardsList] = useState<any[]>([]); // List of decks
    const [flashcardSetId, setFlashcardSetId] = useState<string | null>(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isGeneratingDecks, setIsGeneratingDecks] = useState(false);

    // --- Quiz State ---
    const [quiz, setQuiz] = useState<any>(null);
    const [quizzesList, setQuizzesList] = useState<any[]>([]);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({}); // questionIndex -> optionIndex
    const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
    const [quizResult, setQuizResult] = useState<any>(null);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const doc = await documentService.getDocumentById(documentId);
                setDocument(doc);
                // Reset history loaded state when document changes
                historyLoadedRef.current = false;
                setMessages([]);
            } catch (error) {
                console.error('Error fetching document:', error);
                toast.error('Failed to load document');
                onBack();
            } finally {
                setIsLoading(false);
            }
        };

        if (documentId) {
            fetchDocument();
        }
    }, [documentId, onBack]);

    // Fetch existing Flashcards
    useEffect(() => {
        const fetchFlashcards = async () => {
            if (activeTab === 'flashcards' && documentId) {
                try {
                    const res = await flashcardService.getFlashcardsByDocument(documentId);

                    let list: any[] = [];
                    if (res.data) {
                        list = Array.isArray(res.data) ? res.data : [res.data];
                    } else if (res.cards) {
                        list = [res];
                    } else if (Array.isArray(res)) {
                        list = res;
                    }

                    setFlashcardsList(list);
                } catch (error: any) {
                    if (error.response && error.response.status === 404) {
                        // No flashcards found, just set empty list
                        setFlashcardsList([]);
                    } else {
                        console.error('Error fetching flashcards:', error);
                    }
                }
            }
        };

        fetchFlashcards();
        fetchFlashcards();
    }, [activeTab, documentId]);

    // Auto-select flashcard set from URL
    useEffect(() => {
        const setId = searchParams.get('setId');
        if (setId && flashcardsList.length > 0 && !flashcardSetId) {
            const targetSet = flashcardsList.find(s => s._id === setId);
            if (targetSet) {
                handleSelectFlashcardSet(targetSet);
            }
        }
    }, [flashcardsList, searchParams, flashcardSetId]);

    // Fetch existing Quizzes
    useEffect(() => {
        const fetchQuizzes = async () => {
            if (activeTab === 'quizzes' && documentId) {
                try {
                    const res = await quizService.getQuizzesByDocument(documentId);
                    // Handle response structure: { success: true, data: { count: 3, quizzes: [...] } }
                    let quizzes = [];
                    if (res.data && res.data.quizzes) {
                        quizzes = res.data.quizzes;
                    } else if (res.quizzes) {
                        quizzes = res.quizzes;
                    } else if (Array.isArray(res)) {
                        quizzes = res;
                    } else if (res.data && Array.isArray(res.data)) {
                        quizzes = res.data;
                    }

                    if (Array.isArray(quizzes) && quizzes.length > 0) {
                        setQuizzesList(quizzes);
                    }
                } catch (error) {
                    console.error('Error fetching quizzes:', error);
                }
            }
        };

        fetchQuizzes();
    }, [activeTab, documentId]);

    // Fetch cached Summary
    useEffect(() => {
        const fetchSummary = async () => {
            if (activeTab === 'summary' && documentId && !summary) {
                try {
                    const cachedSummary = await getCachedSummary(documentId);
                    if (cachedSummary) {
                        setSummary(cachedSummary);
                    }
                } catch (error) {
                    console.error('Error fetching summary cache:', error);
                }
            }
        };

        fetchSummary();
    }, [activeTab, documentId]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeTab]);

    // ... (rest of useEffects) ...



    const handleToggleStar = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent flipping
        if (!flashcardSetId) return;
        const currentCard = flashcards[currentCardIndex];
        if (!currentCard || !currentCard._id) return;

        try {
            // Optimistic update
            const updatedCards = [...flashcards];
            updatedCards[currentCardIndex] = {
                ...currentCard,
                isStarred: !currentCard.isStarred // Assuming API supports/returns this
            };
            setFlashcards(updatedCards);

            await flashcardService.toggleStar(flashcardSetId, currentCard._id);
        } catch (error) {
            toast.error('Failed to update star');
            // Revert on error
            const revertedCards = [...flashcards];
            revertedCards[currentCardIndex] = currentCard;
            setFlashcards(revertedCards);
        }
    };

    const handleMarkReview = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!flashcardSetId) return;
        const currentCard = flashcards[currentCardIndex];
        if (!currentCard || !currentCard._id) return;

        try {
            await flashcardService.reviewCard(flashcardSetId, currentCard._id, { review: true });
            toast.success('Card marked as reviewed');
        } catch (error) {
            toast.error('Failed to mark review');
        }
    }



    // Fetch chat history
    useEffect(() => {
        const fetchHistory = async () => {
            if (activeTab === 'chat' && documentId) {
                // 1. Try to load from cache first for instant UI
                try {
                    const cachedData = await getCachedChatHistory(documentId);
                    if (cachedData) {
                        const history = cachedData.messages || cachedData;
                        if (Array.isArray(history)) {
                            setMessages(history.map((msg: any) => ({
                                role: msg.role === 'user' ? 'user' : 'ai',
                                content: msg.content || msg.message,
                                animate: false
                            })));
                        }
                    } else {
                        // Only show loading spinner if we don't have cached data
                        setIsHistoryLoading(true);
                    }
                } catch (err) {
                    console.error('Cache read error', err);
                    setIsHistoryLoading(true);
                }

                // 2. Fetch fresh data from API (Stale-While-Revalidate)
                try {
                    const res = await aiService.getChatHistory(documentId);
                    // Handle different possible response structures based on real API response
                    // Structure: { success: true, data: { messages: [...] } }
                    const rawData = res.data?.messages || res.messages || res.history || (Array.isArray(res) ? res : []);

                    if (Array.isArray(rawData)) {
                        // Update UI with fresh data
                        setMessages(rawData.map((msg: any) => ({
                            role: msg.role === 'user' ? 'user' : 'ai',
                            content: msg.content || msg.message,
                            animate: false
                        })));

                        // Update cache with fresh data
                        // We store the specific array or structure we want to retrieve later
                        await cacheChatHistory(documentId, { messages: rawData });
                    }
                } catch (error) {
                    console.error('Failed to fetch chat history', error);
                } finally {
                    setIsHistoryLoading(false);
                }
            }
        };

        fetchHistory();
    }, [activeTab, documentId]);

    // --- Handlers ---

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;
        const userMsg = chatInput;
        setChatInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsChatLoading(true);

        try {
            const response = await aiService.chatWithDocument(documentId, userMsg);
            const aiMessage = response.data?.response?.message ||
                response.data?.message ||
                response.response ||
                response.message ||
                "I couldn't generate a response.";
            setMessages(prev => [...prev, { role: 'ai', content: aiMessage, animate: true }]);
        } catch (error) {
            toast.error('Failed to send message');
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error.", animate: true }]);
        } finally {
            setIsChatLoading(false);
        }
    };





    const handleSelectQuiz = (selectedQuiz: any) => {
        setQuiz(selectedQuiz);
        // Check if completed
        if (selectedQuiz.completedAt || (selectedQuiz.userAnswers && selectedQuiz.userAnswers.length > 0)) {
            // Reconstruct result
            const correct = selectedQuiz.score || 0;
            const total = selectedQuiz.totalQuestions || selectedQuiz.questions?.length || 0;
            const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

            setQuizResult({
                score: correct,
                total: total,
                percentage: selectedQuiz.percentage !== undefined ? selectedQuiz.percentage : pct,
                userAnswers: selectedQuiz.userAnswers // Pass this through for review
            });

            // Populate answers map for review view
            const answerMap: Record<string, number> = {};
            selectedQuiz.userAnswers?.forEach((ans: any) => {
                answerMap[ans.questionIndex] = parseInt(ans.selectedAnswer);
            });
            setQuizAnswers(answerMap);
        } else {
            // New or pending quiz
            setQuizResult(null);
            setQuizAnswers({});
        }
    };

    const handleSelectFlashcardSet = (set: any) => {
        setFlashcardSetId(set._id);
        const cards = set.cards || set.flashcards || []; // Handle variations
        setFlashcards(cards);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    };

    const handleGenerateFlashcards = async () => {
        setIsGeneratingDecks(true);
        try {
            const res = await aiService.generateFlashcards(documentId);
            const newSet = res.data || res;
            // Update list and select it
            setFlashcardsList(prev => [newSet, ...prev]);
            setFlashcards(newSet.cards || []);
            setFlashcardSetId(newSet._id);
            setCurrentCardIndex(0);
        } catch (error) {
            toast.error('Failed to generate flashcards');
        } finally {
            setIsGeneratingDecks(false);
        }
    };

    const handleGenerateQuiz = async () => {
        setIsGeneratingQuiz(true);
        setQuiz(null);
        setQuizResult(null);
        setQuizAnswers({});
        try {
            const res = await aiService.generateQuiz(documentId);
            setQuiz(res.quiz || res.data); // Adjust based on actual API response structure
        } catch (error) {
            toast.error('Failed to generate quiz');
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!quiz) return;
        setIsSubmittingQuiz(true);
        try {
            if (quiz._id) {
                // Submit to API
                // Format answers as expected by backend: array of { questionIndex, selectedAnswer }
                const formattedAnswers = Object.entries(quizAnswers).map(([key, value]) => ({
                    questionIndex: parseInt(key),
                    selectedAnswer: value.toString() // Ensure string if backend expects it
                }));

                const res = await quizService.submitQuiz(quiz._id, formattedAnswers);
                // Assuming res structure matches expected result or we format it
                const resultData = res.data || res;
                const score = resultData.score;
                const total = resultData.totalQuestions || resultData.total;
                const percentage = resultData.percentage !== undefined
                    ? resultData.percentage
                    : Math.round((score / total) * 100);

                setQuizResult({
                    score,
                    total,
                    percentage
                });
                toast.success('Quiz submitted successfully!');
            } else {
                // Local calculation (fallback for non-persisted quizzes)
                let correctCount = 0;
                const questions = quiz.questions || [];
                questions.forEach((q: any, idx: number) => {
                    // Check loosely for string/number match
                    if (quizAnswers[idx] == q.correctAnswer) {
                        correctCount++;
                    }
                });
                setQuizResult({
                    score: correctCount,
                    total: questions.length,
                    percentage: Math.round((correctCount / questions.length) * 100)
                });
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit quiz');
        } finally {
            setIsSubmittingQuiz(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 bg-[var(--bg-page)] p-8 flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[var(--color-google-blue)]" />
                    <p className="font-medium text-[var(--text-secondary)]">Loading Document...</p>
                </div>
            </div>
        );
    }

    if (!document) return null;

    const tabs = [
        { id: 'content', label: 'Content', icon: FileText },
        { id: 'chat', label: 'Chat', icon: MessageSquare },
        { id: 'summary', label: 'Summary', icon: Zap },
        { id: 'explain', label: 'Explain', icon: Lightbulb },
        { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
        { id: 'quizzes', label: 'Quizzes', icon: Brain },
    ];

    return (
        <div className="flex-1 bg-[var(--bg-page)] flex flex-col h-full overflow-hidden transition-colors duration-300">
            {/* Header */}
            <div className="bg-[var(--bg-page)] border-b border-[var(--border-subtle)] p-4 shrink-0 shadow-sm z-10">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium mb-3 transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Documents
                </button>
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-medium google-title text-[var(--text-primary)] line-clamp-1">{document.title}</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-[var(--bg-page)] border-b border-[var(--border-subtle)] px-4 shrink-0 overflow-x-auto">
                <div className="flex gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-4 font-medium border-b-2 transition-all text-sm ${activeTab === tab.id
                                ? 'border-[var(--color-google-blue)] text-[var(--color-google-blue)]'
                                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-hidden">
                {activeTab === 'content' && (
                    <div className="h-full flex flex-col border border-[var(--border-subtle)] bg-[var(--bg-page)] rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-[var(--bg-surface-highlight)] border-b border-[var(--border-subtle)] p-3 flex items-center justify-between shrink-0">
                            <span className="font-medium text-sm text-[var(--text-secondary)] flex items-center gap-2">
                                Document Viewer
                                <div className="flex bg-[var(--border-subtle)]/30 rounded-lg p-1 ml-4 gap-1">
                                    <button
                                        onClick={() => setViewMode('pdf')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'pdf' ? 'bg-[var(--bg-page)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                                        title="PDF View"
                                    >
                                        <FileText className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('text')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'text' ? 'bg-[var(--bg-page)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                                        title="Text View"
                                    >
                                        <AlignLeft className="w-4 h-4" />
                                    </button>
                                </div>
                            </span>
                            <a
                                href={document.fileUrl || document.filepath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[var(--color-google-blue)] font-medium text-sm hover:underline"
                            >
                                <ExternalLink className="w-4 h-4" /> Open in new tab
                            </a>
                        </div>
                        <div className="flex-1 bg-[var(--bg-surface-highlight)]/30 relative overflow-hidden">
                            {viewMode === 'pdf' ? (
                                document.fileType?.startsWith('image/') ? (
                                    <div className="w-full h-full flex items-center justify-center p-4">
                                        <img
                                            src={document.fileUrl || document.filepath}
                                            alt={document.title}
                                            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg-surface-highlight)] text-center p-8">
                                        {(() => {
                                            const url = document.fileUrl || document.filepath;
                                            const isLocal = url.includes('localhost') || url.includes('127.0.0.1');

                                            if (isLocal) {
                                                return (
                                                    <div className="max-w-md">
                                                        <FileText className="w-16 h-16 mx-auto mb-4 text-[var(--text-tertiary)]" />
                                                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Preview Unavailable in Development</h3>
                                                        <p className="text-sm text-[var(--text-secondary)] mb-6">
                                                            We cannot use external viewers (like Google Docs) to preview files hosted on localhost.
                                                            This feature will work correctly in production.
                                                        </p>
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn-google btn-google-primary px-6 py-2 rounded-full inline-flex items-center gap-2"
                                                        >
                                                            <ExternalLink className="w-4 h-4" /> Download File
                                                        </a>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="w-full h-full relative group">
                                                    <iframe
                                                        src={(() => {
                                                            const type = document.fileType || '';
                                                            // Handle Office Documents
                                                            if (
                                                                type.includes('word') ||
                                                                type.includes('presentation') ||
                                                                type.includes('spreadsheet') ||
                                                                type.includes('msword') ||
                                                                type.includes('powerpoint') ||
                                                                type.includes('excel') ||
                                                                url.endsWith('.doc') ||
                                                                url.endsWith('.docx') ||
                                                                url.endsWith('.ppt') ||
                                                                url.endsWith('.pptx') ||
                                                                url.endsWith('.xls') ||
                                                                url.endsWith('.xlsx')
                                                            ) {
                                                                return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
                                                            }
                                                            // Handle PDF (Native)
                                                            if (type === 'application/pdf' || url.endsWith('.pdf')) {
                                                                return url;
                                                            }
                                                            // Fallback to Google Docs Viewer
                                                            return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
                                                        })()}
                                                        className="w-full h-full"
                                                        title="Document Viewer"
                                                    />
                                                    {/* Fallback Overlay for potential failures */}
                                                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-[var(--bg-page)] z-[5] opacity-0 group-hover:opacity-100 transition-opacity delay-1000 duration-500 hidden">
                                                        {/* This simplistic overlay approach helps if the frame is completely empty, 
                                                            but catching iframe internal errors is hard. 
                                                            Instead, we provide a persistent footer or 'Help' action? 
                                                            Let's just stick to the iframe. Use the below message if needed.
                                                         */}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )
                            ) : (
                                <div className="h-full overflow-y-auto p-8 bg-[var(--bg-page)] max-w-4xl mx-auto shadow-sm my-4 rounded-xl border border-[var(--border-subtle)]">
                                    {document.chunks && document.chunks.length > 0 ? (
                                        <div className="space-y-6">
                                            {document.chunks.map((chunk: any) => (
                                                <div key={chunk._id} className="prose dark:prose-invert max-w-none">
                                                    <p className="text-[var(--text-primary)] leading-relaxed">{chunk.content}</p>
                                                    <span className="text-xs text-[var(--text-tertiary)] font-mono">Page {chunk.pageNumber}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)]">
                                            <AlignLeft className="w-12 h-12 mb-4 opacity-20" />
                                            <p>No extracted text available for this document.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="h-full flex flex-col bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[var(--bg-surface-highlight)]/30">
                            {isHistoryLoading ? (
                                <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)]">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-50" />
                                    <p className="font-medium">Loading conversation...</p>
                                </div>
                            ) : (
                                <>
                                    {messages.length === 0 && (
                                        <div className="text-center text-[var(--text-tertiary)] mt-20">
                                            <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <h3 className="font-bold text-lg text-[var(--text-secondary)]">Chat with {document.title}</h3>
                                            <p className="text-sm">Ask questions about specific sections, summaries, or concepts.</p>
                                        </div>
                                    )}


                                    {messages.map((msg: any, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-[var(--color-google-blue)] text-white rounded-tr-sm'
                                                : 'bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm'
                                                }`}>
                                                <div className={`flex items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-blue-100' : 'text-[var(--text-tertiary)]'
                                                    }`}>
                                                    {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                                    {msg.role === 'user' ? 'You' : 'StudyGeni AI'}
                                                </div>
                                                <div className="whitespace-pre-wrap">
                                                    {msg.role === 'user' ? (
                                                        msg.content
                                                    ) : (
                                                        <TypingMarkdown content={msg.content} shouldAnimate={msg.animate} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                            {isChatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 shadow-sm">
                                        <Loader2 className="w-4 h-4 animate-spin text-[var(--color-google-blue)]" />
                                        <span className="text-sm font-medium text-[var(--text-secondary)]">AI is thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-4 bg-[var(--bg-page)] border-t border-[var(--border-subtle)]">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask something about this document..."
                                    className="flex-1 h-12 px-4 rounded-xl bg-[var(--bg-surface-highlight)] border-none focus:ring-2 focus:ring-[var(--border-focus)]/20 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-all"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isChatLoading || !chatInput.trim()}
                                    className="btn-google btn-google-primary w-12 h-12 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}



                {activeTab === 'summary' && (
                    <div className="h-full flex flex-col gap-6 overflow-y-auto max-w-4xl mx-auto w-full pb-8">
                        <div className="g-card p-8 text-center shrink-0 flex flex-col items-center">
                            <div className="w-16 h-16 bg-[var(--color-google-yellow)]/10 rounded-full flex items-center justify-center mb-6">
                                <Zap className="w-8 h-8 text-[var(--color-google-yellow)]" />
                            </div>
                            <h3 className="text-2xl google-title font-medium mb-2 text-[var(--text-primary)]">Summarize Document</h3>
                            <p className="text-[var(--text-secondary)] mb-8 font-normal max-w-lg mx-auto">Get a concise summary of the entire document to grasp key points quickly.</p>
                            <button
                                onClick={handleSummarize}
                                disabled={isSummarizing}
                                className="btn-google btn-google-primary h-12 px-8 rounded-full text-base shadow-lg"
                            >
                                {isSummarizing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                                {isSummarizing ? 'Generating Summary...' : 'Generate Summary'}
                            </button>
                        </div>
                        {summary && (
                            <div className="bg-[var(--bg-page)] border border-[var(--border-subtle)] p-8 rounded-3xl shadow-sm animate-in slide-in-from-bottom-4">
                                <h4 className="font-medium border-b border-[var(--border-subtle)] pb-4 mb-6 text-xl google-title text-[var(--text-primary)]">Summary Result</h4>
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{summary}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'explain' && (
                    <div className="h-full flex flex-col gap-6 overflow-y-auto max-w-4xl mx-auto w-full pb-8">
                        <div className="g-card p-8 text-center shrink-0 flex flex-col items-center">
                            <div className="w-16 h-16 bg-[var(--color-google-yellow)]/10 rounded-full flex items-center justify-center mb-6">
                                <Lightbulb className="w-8 h-8 text-[var(--color-google-yellow)]" />
                            </div>
                            <h3 className="text-2xl google-title font-medium mb-2 text-[var(--text-primary)]">Explain Concept</h3>
                            <p className="text-[var(--text-secondary)] mb-8 font-normal max-w-lg mx-auto">Confused about a topic? Ask AI to explain it in simple terms.</p>
                            <div className="max-w-xl mx-auto w-full flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="e.g., Quantum Entanglement"
                                    value={explainConceptStr}
                                    onChange={(e) => setExplainConceptStr(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
                                    className="w-full h-14 px-6 rounded-2xl bg-[var(--bg-surface-highlight)] border-none text-[var(--text-primary)] text-lg placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--border-focus)]/20 transition-all text-center"
                                />
                                <button
                                    onClick={handleExplain}
                                    disabled={isExplaining || !explainConceptStr.trim()}
                                    className="btn-google btn-google-primary h-12 px-8 rounded-full text-base shadow-lg w-full"
                                >
                                    {isExplaining ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Brain className="w-5 h-5 mr-2" />}
                                    {isExplaining ? 'Explaining...' : 'Explain It'}
                                </button>
                            </div>
                        </div>
                        {explanation && (
                            <div className="bg-[var(--bg-page)] border border-[var(--border-subtle)] p-8 rounded-3xl shadow-sm animate-in slide-in-from-bottom-4">
                                <h4 className="font-medium border-b border-[var(--border-subtle)] pb-4 mb-6 text-xl google-title text-[var(--text-primary)]">Explanation: <span className="text-[var(--color-google-blue)] capitalize">{explainConceptStr}</span></h4>
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{explanation}</p>
                                </div>
                            </div>
                        )}

                        {pastExplanations.length > 0 && (
                            <div className="mt-4 pt-4">
                                <h4 className="font-bold text-xs mb-6 text-[var(--text-tertiary)] uppercase tracking-widest text-center">History</h4>
                                <div className="space-y-4">
                                    {pastExplanations.filter(e => e.explanation !== explanation).map((expl, idx) => (
                                        <details key={idx} className="bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-2xl group overflow-hidden shadow-sm">
                                            <summary className="p-4 cursor-pointer flex justify-between items-center bg-[var(--bg-surface-highlight)]/30 hover:bg-[var(--bg-surface-highlight)] transition-colors list-none select-none">
                                                <div className="flex flex-col gap-0.5">
                                                    <h5 className="font-medium text-base capitalize text-[var(--text-primary)]">{expl.concept}</h5>
                                                    <span className="text-xs text-[var(--text-tertiary)] font-medium">{new Date(expl.timestamp).toLocaleString()}</span>
                                                </div>
                                                <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)] group-open:rotate-180 transition-transform duration-300" />
                                            </summary>
                                            <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-page)] animate-in slide-in-from-top-2">
                                                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap text-sm">{expl.explanation}</p>
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {
                    activeTab === 'flashcards' && (
                        <div className="h-full flex flex-col w-full p-6 overflow-hidden">
                            {flashcards.length === 0 ? (
                                <div className="w-full h-full flex flex-col">
                                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 shrink-0">
                                        <div>
                                            <h2 className="text-2xl google-title font-medium mb-1 text-[var(--text-primary)]">Flashcard Decks</h2>
                                            <p className="text-[var(--text-secondary)]">Select a deck or generate a new one.</p>
                                        </div>
                                        <button
                                            onClick={handleGenerateFlashcards}
                                            disabled={isGeneratingDecks}
                                            className="btn-google btn-google-primary h-11 px-6 rounded-full text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
                                        >
                                            {isGeneratingDecks ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                                            {isGeneratingDecks ? 'Generating...' : 'New Deck'}
                                        </button>
                                    </div>

                                    {flashcardsList.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                                            <div className="w-20 h-20 bg-[var(--bg-surface-highlight)] rounded-full flex items-center justify-center mb-4">
                                                <BookOpen className="w-10 h-10 text-[var(--text-tertiary)]" />
                                            </div>
                                            <p className="font-medium text-lg text-[var(--text-secondary)]">No flashcards yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20 overflow-y-auto">
                                            {flashcardsList.map((deck) => {
                                                const cards = deck.cards || [];
                                                const total = cards.length;
                                                const reviewedCount = cards.filter((c: any) => c.reviewCount > 0).length;
                                                const progress = total > 0 ? Math.round((reviewedCount / total) * 100) : 0;
                                                const starredCount = cards.filter((c: any) => c.isStarred).length;

                                                return (
                                                    <div key={deck._id} className="g-card p-6 flex flex-col justify-between h-64 hover:-translate-y-1 transition-transform duration-300">
                                                        <div>
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div className="w-10 h-10 bg-[var(--color-google-green)]/10 flex items-center justify-center rounded-xl text-[var(--color-google-green)]">
                                                                    <BookOpen className="w-6 h-6" />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--bg-surface-highlight)] px-2 py-1 rounded-md uppercase tracking-wide">
                                                                    {new Date(deck.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-medium text-lg mb-1 line-clamp-1 text-[var(--text-primary)]" title={deck.title}>{deck.title || `Flashcard Deck`}</h3>

                                                            <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-secondary)] mt-2 mb-4 uppercase tracking-wide">
                                                                <div className="flex items-center gap-1.5">
                                                                    <BookOpen className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> {total} Cards
                                                                </div>
                                                                {starredCount > 0 && (
                                                                    <div className="flex items-center gap-1.5 text-[var(--color-google-yellow)]">
                                                                        <Star className="w-3.5 h-3.5 fill-current" /> {starredCount}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="mb-5">
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

                                                            <button
                                                                onClick={() => handleSelectFlashcardSet(deck)}
                                                                className="w-full py-2.5 font-medium text-sm rounded-lg border border-[var(--border-subtle)] hover:border-[var(--color-google-blue)] hover:text-[var(--color-google-blue)] hover:bg-[var(--color-google-blue)]/5 transition-all text-[var(--text-secondary)]"
                                                            >
                                                                Start Studying
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full max-w-2xl flex flex-col items-center mb-8">
                                    <div className="flex justify-between w-full mb-6 items-center">
                                        <span className="font-bold text-[var(--text-secondary)] text-sm uppercase tracking-wider">Card {currentCardIndex + 1} / {flashcards.length}</span>
                                        <button
                                            onClick={() => { setFlashcards([]); setCurrentCardIndex(0); }}
                                            className="text-[var(--color-google-red)] font-semibold hover:bg-[var(--color-google-red)]/10 px-3 py-1.5 rounded-lg transition-colors text-sm"
                                        >
                                            Close Deck
                                        </button>
                                    </div>

                                    <div
                                        className="perspective-1000 w-full h-80 cursor-pointer group"
                                        onClick={() => {
                                            setIsFlipped(!isFlipped)
                                            if (!isFlipped) handleMarkReview({ stopPropagation: () => { } } as React.MouseEvent);
                                        }}
                                    >
                                        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                                            {/* Front */}
                                            <div className="absolute w-full h-full backface-hidden bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all">
                                                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                                                    <span className="text-xs font-bold uppercase text-[var(--text-tertiary)] tracking-widest">Question</span>
                                                    <button
                                                        onClick={handleToggleStar}
                                                        className="hover:scale-110 transition-transform p-2 rounded-full hover:bg-[var(--bg-surface-highlight)]"
                                                    >
                                                        <Star
                                                            className={`w-5 h-5 ${flashcards[currentCardIndex]?.isStarred ? 'fill-[var(--color-google-yellow)] text-[var(--color-google-yellow)]' : 'text-[var(--text-tertiary)]'}`}
                                                        />
                                                    </button>
                                                </div>
                                                <p className="text-2xl font-medium text-center leading-relaxed text-[var(--text-primary)]">
                                                    {flashcards[currentCardIndex]?.front || flashcards[currentCardIndex]?.question}
                                                </p>
                                                <p className="text-xs text-[var(--text-tertiary)] font-bold absolute bottom-6 uppercase tracking-wider">Click to reveal</p>
                                            </div>

                                            {/* Back */}
                                            <div className="absolute w-full h-full backface-hidden bg-[#202124] text-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-lg rotate-y-180">
                                                <span className="text-xs font-bold uppercase text-gray-500 absolute top-6 left-6 tracking-widest">Answer</span>
                                                <p className="text-xl font-medium text-center leading-relaxed">
                                                    {flashcards[currentCardIndex]?.back || flashcards[currentCardIndex]?.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="flex gap-4 mt-8">
                                        <button
                                            onClick={() => {
                                                setCurrentCardIndex(prev => Math.max(0, prev - 1));
                                                setIsFlipped(false);
                                            }}
                                            disabled={currentCardIndex === 0}
                                            className="w-14 h-14 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-page)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface-highlight)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrentCardIndex(prev => Math.min(flashcards.length - 1, prev + 1));
                                                setIsFlipped(false);
                                            }}
                                            disabled={currentCardIndex === flashcards.length - 1}
                                            className="w-14 h-14 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] flex items-center justify-center hover:bg-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }

                {activeTab === 'quizzes' && (
                    <div className="h-full flex flex-col items-center justify-center overflow-y-auto w-full p-4 mb-4">
                        {!quiz ? (
                            <div className="w-full max-w-4xl h-full flex flex-col">
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 shrink-0">
                                    <div>
                                        <h2 className="text-2xl google-title font-medium mb-1 text-[var(--text-primary)]">Practice Quizzes</h2>
                                        <p className="text-[var(--text-secondary)]">Select a quiz to review or start a new one.</p>
                                    </div>
                                    <button
                                        onClick={handleGenerateQuiz}
                                        disabled={isGeneratingQuiz}
                                        className="btn-google btn-google-primary h-11 px-6 rounded-full text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
                                    >
                                        {isGeneratingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                                        {isGeneratingQuiz ? 'Generating...' : 'New Quiz'}
                                    </button>
                                </div>

                                {quizzesList.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                                        <div className="w-20 h-20 bg-[var(--bg-surface-highlight)] rounded-full flex items-center justify-center mb-4">
                                            <Brain className="w-10 h-10 text-[var(--text-tertiary)]" />
                                        </div>
                                        <p className="font-medium text-lg text-[var(--text-secondary)]">No quizzes generated yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 overflow-y-auto">
                                        {quizzesList.map((q) => {
                                            const isCompleted = q.completedAt || (q.userAnswers && q.userAnswers.length > 0);
                                            const score = q.score || 0;
                                            const total = q.totalQuestions || q.questions?.length || 0;
                                            const pct = total > 0 ? Math.round((score / total) * 100) : 0;

                                            return (
                                                <div key={q._id} className="g-card p-6 flex flex-col justify-between h-48 hover:-translate-y-1 transition-transform duration-300">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            {isCompleted ? (
                                                                <span className="bg-[#34A853]/10 text-[#34A853] text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-md flex items-center gap-1">
                                                                    <Check className="w-3 h-3" /> Completed
                                                                </span>
                                                            ) : (
                                                                <span className="bg-[#FBBC05]/10 text-[#f29900] text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-md">
                                                                    Pending
                                                                </span>
                                                            )}
                                                            <span className="text-xs font-bold text-[var(--text-tertiary)]">{new Date(q.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <h3 className="font-medium text-lg leading-snug line-clamp-1 truncate text-[var(--text-primary)] mb-1" title={q.title}>{q.title || `Quiz`}</h3>
                                                        {isCompleted && (
                                                            <p className="font-medium text-sm text-[var(--text-secondary)]">Score: <span className="text-[var(--text-primary)]">{score}/{total}</span> ({pct}%)</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleSelectQuiz(q)}
                                                        className={`w-full py-2.5 font-medium text-sm rounded-lg transition-all ${isCompleted
                                                            ? 'bg-[var(--bg-surface-highlight)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                                                            : 'bg-[var(--color-google-blue)] text-white hover:bg-[#3367d6] shadow-md hover:shadow-lg'
                                                            }`}
                                                    >
                                                        {isCompleted ? 'View Results' : 'Start Quiz'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : quizResult ? (
                            <div className="w-full max-w-3xl h-full flex flex-col bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-4">
                                <div className="p-8 border-b border-[var(--border-subtle)] flex flex-col items-center justify-center bg-[var(--bg-surface-highlight)]/20">
                                    <h3 className="text-2xl google-title font-medium mb-4 text-[var(--text-primary)]">Quiz Results</h3>
                                    <div className="text-6xl font-light mb-4 flex justify-center items-center gap-2 tracking-tighter">
                                        <span className={quizResult.percentage >= 70 ? 'text-[var(--color-google-green)]' : 'text-[var(--color-google-yellow)]'}>
                                            {quizResult.percentage}%
                                        </span>
                                    </div>
                                    <p className="text-lg font-medium text-[var(--text-secondary)] mb-6">
                                        You got {quizResult.score} out of {quizResult.total} correct.
                                    </p>
                                    <div className="flex gap-4 w-full max-w-sm">
                                        <button
                                            onClick={() => {
                                                setQuizResult(null);
                                                setQuizAnswers({});
                                            }}
                                            className="btn-google btn-google-primary flex-1 h-11 rounded-full flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw className="w-4 h-4" /> Retake
                                        </button>
                                        <button
                                            onClick={() => {
                                                setQuiz(null);
                                                setQuizResult(null);
                                                setQuizAnswers({});
                                            }}
                                            className="btn-google btn-google-outline flex-1 h-11 rounded-full"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[var(--bg-page)]">
                                    <h4 className="font-bold text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-4 pb-2 border-b border-[var(--border-subtle)]">Answer Review</h4>
                                    {quiz.questions?.map((q: any, qIdx: number) => {
                                        const userAnswerIdx = quizAnswers[qIdx] !== undefined ? quizAnswers[qIdx] : -1;
                                        const correctIdx = parseInt(q.correctAnswer);
                                        const isCorrect = userAnswerIdx === correctIdx;

                                        return (
                                            <div key={qIdx} className={`p-6 rounded-2xl border ${isCorrect ? 'border-[var(--color-google-green)]/20 bg-[var(--color-google-green)]/5' : 'border-[var(--color-google-red)]/20 bg-[var(--color-google-red)]/5'}`}>
                                                <p className="font-medium text-lg mb-4 flex gap-3 text-[var(--text-primary)]">
                                                    <span className="text-[var(--text-tertiary)] font-mono text-base pt-0.5">0{qIdx + 1}.</span>
                                                    {q.question}
                                                </p>

                                                <div className="grid grid-cols-1 gap-2 mb-4">
                                                    {q.options?.map((opt: string, optIdx: number) => {
                                                        let itemClass = "p-3 rounded-lg border text-sm transition-all ";
                                                        if (optIdx === correctIdx) {
                                                            itemClass += "bg-[var(--color-google-green)] text-white border-[var(--color-google-green)] font-semibold shadow-sm";
                                                        } else if (optIdx === userAnswerIdx && !isCorrect) {
                                                            itemClass += "bg-[var(--color-google-red)] text-white border-[var(--color-google-red)] font-semibold shadow-sm";
                                                        } else {
                                                            itemClass += "bg-[var(--bg-page)] border-transparent text-[var(--text-secondary)] opacity-80";
                                                        }

                                                        return (
                                                            <div key={optIdx} className={itemClass}>
                                                                {opt} {optIdx === correctIdx && <span className="ml-2 text-xs opacity-80 font-normal">(Correct)</span>} {optIdx === userAnswerIdx && !isCorrect && <span className="ml-2 text-xs opacity-80 font-normal">(Your Answer)</span>}
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                {!isCorrect && q.explanation && (
                                                    <div className="bg-[var(--bg-page)] p-4 rounded-xl border-l-4 border-[var(--color-google-blue)] text-sm shadow-sm">
                                                        <span className="font-bold text-[var(--color-google-blue)] block mb-1 text-xs uppercase tracking-wide">Explanation</span>
                                                        <span className="text-[var(--text-secondary)] leading-relaxed">{q.explanation}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full max-w-3xl h-full flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl google-title font-medium text-[var(--text-primary)]">Quiz Time</h2>
                                    <button onClick={() => setQuiz(null)} className="text-[var(--color-google-red)] font-semibold hover:bg-[var(--color-google-red)]/10 px-4 py-2 rounded-full transition-colors">Exit Quiz</button>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-8 pr-2 pb-8">
                                    {quiz.questions?.map((q: any, qIdx: number) => (
                                        <div key={qIdx} className="bg-[var(--bg-page)] border border-[var(--border-subtle)] p-8 rounded-3xl shadow-sm">
                                            <p className="font-medium text-lg mb-6 flex gap-3 text-[var(--text-primary)]">
                                                <span className="text-[var(--text-tertiary)] font-mono text-base pt-0.5">0{qIdx + 1}.</span>
                                                {q.question}
                                            </p>
                                            <div className="grid grid-cols-1 gap-3">
                                                {q.options?.map((opt: string, optIdx: number) => (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                                                        className={`p-4 text-left border rounded-xl font-medium transition-all text-sm ${quizAnswers[qIdx] === optIdx
                                                            ? 'bg-[var(--text-primary)] text-[var(--bg-page)] border-[var(--text-primary)] shadow-md transform scale-[1.01]'
                                                            : 'bg-[var(--bg-page)] border-[var(--border-subtle)] hover:border-[var(--text-primary)] text-[var(--text-secondary)]'
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 mt-6 border-t border-[var(--border-subtle)]">
                                    <button
                                        onClick={handleSubmitQuiz}
                                        disabled={isSubmittingQuiz || Object.keys(quizAnswers).length !== quiz.questions?.length}
                                        className="btn-google btn-google-primary w-full h-14 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        {isSubmittingQuiz ? 'Submitting...' : 'Submit Answers'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div >
        </div >
    );
}

// Add these utility styles to your global CSS or just rely on Tailwind
// .backface-hidden { backface-visibility: hidden; }
// .transform-style-3d { transform-style: preserve-3d; }
// .rotate-y-180 { transform: rotateY(180deg); }
// .perspective-1000 { perspective: 1000px; }
