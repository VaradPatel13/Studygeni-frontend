import { useState, useEffect, useRef } from 'react';
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

export default function DocumentViewer({ documentId, onBack }: DocumentViewerProps) {
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
                } catch (error) {
                    console.error('Error fetching flashcards:', error);
                    // Don't show error toast here as it might just mean no flashcards exist yet
                }
            }
        };

        fetchFlashcards();
    }, [activeTab, documentId]);

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
                                content: msg.content || msg.message
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
                            content: msg.content || msg.message
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
            setMessages(prev => [...prev, { role: 'ai', content: aiMessage }]);
        } catch (error) {
            toast.error('Failed to send message');
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error." }]);
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
            <div className="flex-1 bg-[#fdfbf7] p-8 flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold">Loading Document...</p>
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
        <div className="flex-1 bg-[#fdfbf7] flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b-2 border-black p-4 shrink-0">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-black font-bold mb-2 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Documents
                </button>
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-black line-clamp-1">{document.title}</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b-2 border-black px-4 shrink-0 overflow-x-auto">
                <div className="flex gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-4 font-bold border-b-4 transition-colors ${activeTab === tab.id
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-black'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-hidden">
                {activeTab === 'content' && (
                    <div className="h-full flex flex-col border-2 border-black bg-white rounded-lg overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="bg-gray-50 border-b-2 border-gray-100 p-3 flex items-center justify-between shrink-0">
                            <span className="font-bold text-sm text-gray-700 flex items-center gap-2">
                                Document Viewer
                                <div className="flex bg-gray-200 rounded p-1 ml-4 gap-1">
                                    <button
                                        onClick={() => setViewMode('pdf')}
                                        className={`p-1 rounded ${viewMode === 'pdf' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
                                        title="PDF View"
                                    >
                                        <FileText className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('text')}
                                        className={`p-1 rounded ${viewMode === 'text' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
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
                                className="flex items-center gap-1 text-blue-600 font-bold text-sm hover:underline"
                            >
                                <ExternalLink className="w-4 h-4" /> Open in new tab
                            </a>
                        </div>
                        <div className="flex-1 bg-gray-100 relative overflow-hidden">
                            {viewMode === 'pdf' ? (
                                <iframe
                                    src={document.fileType === 'application/pdf' ? (document.fileUrl || document.filepath) : `https://docs.google.com/viewer?url=${encodeURIComponent(document.fileUrl || document.filepath)}&embedded=true`}
                                    className="w-full h-full"
                                    title="Document Viewer"
                                />
                            ) : (
                                <div className="h-full overflow-y-auto p-8 bg-white max-w-4xl mx-auto shadow-sm">
                                    {document.chunks && document.chunks.length > 0 ? (
                                        <div className="space-y-6">
                                            {document.chunks.map((chunk: any) => (
                                                <div key={chunk._id} className="prose max-w-none">
                                                    <p className="text-gray-800 leading-relaxed">{chunk.content}</p>
                                                    <span className="text-xs text-gray-400 font-mono">Page {chunk.pageNumber}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
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
                    <div className="h-full flex flex-col bg-white border-2 border-black rounded-lg overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                            {isHistoryLoading ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-50" />
                                    <p className="font-bold">Loading conversation...</p>
                                </div>
                            ) : (
                                <>
                                    {messages.length === 0 && (
                                        <div className="text-center text-gray-500 mt-20">
                                            <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <h3 className="font-bold text-lg">Chat with {document.title}</h3>
                                            <p>Ask questions about specific sections, summaries, or concepts.</p>
                                        </div>
                                    )}
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-lg p-4 border-2 ${msg.role === 'user' ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-800'}`}>
                                                <div className="flex items-center gap-2 mb-1 opacity-70 text-xs font-bold uppercase">
                                                    {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                                    {msg.role === 'user' ? 'You' : 'StudyGeni AI'}
                                                </div>
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                            {isChatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm font-bold text-gray-500">AI is thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-4 bg-white border-t-2 border-gray-100">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask something about this document..."
                                    className="flex-1 border-2 border-black p-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all rounded"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isChatLoading || !chatInput.trim()}
                                    className="brutal-btn bg-black text-white p-3 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}



                {activeTab === 'summary' && (
                    <div className="h-full flex flex-col gap-4 overflow-y-auto max-w-4xl mx-auto w-full pb-4">
                        <div className="brutal-card bg-purple-50 p-8 text-center shrink-0">
                            <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center border-4 border-black mx-auto mb-4">
                                <Zap className="w-8 h-8 text-purple-700" />
                            </div>
                            <h3 className="text-2xl font-black mb-2">Summarize Document</h3>
                            <p className="text-gray-600 mb-6 font-medium max-w-lg mx-auto">Get a concise summary of the entire document to grasp key points quickly.</p>
                            <button
                                onClick={handleSummarize}
                                disabled={isSummarizing}
                                className="brutal-btn bg-purple-600 text-white px-8 py-4 font-bold text-lg flex items-center justify-center gap-2 mx-auto"
                            >
                                {isSummarizing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                                {isSummarizing ? 'Generating Summary...' : 'Generate Summary'}
                            </button>
                        </div>
                        {summary && (
                            <div className="brutal-card bg-white p-8 animate-in slide-in-from-bottom-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black rounded-lg">
                                <h4 className="font-bold border-b-2 border-gray-100 pb-2 mb-4 text-xl">Summary Result</h4>
                                <div className="prose max-w-none">
                                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{summary}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'explain' && (
                    <div className="h-full flex flex-col gap-4 overflow-y-auto max-w-4xl mx-auto w-full pb-4">
                        <div className="brutal-card bg-orange-50 p-8 text-center shrink-0">
                            <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center border-4 border-black mx-auto mb-4">
                                <Lightbulb className="w-8 h-8 text-orange-700" />
                            </div>
                            <h3 className="text-2xl font-black mb-2">Explain Concept</h3>
                            <p className="text-gray-600 mb-6 font-medium max-w-lg mx-auto">Confused about a topic? Ask AI to explain it in simple terms.</p>
                            <div className="max-w-xl mx-auto w-full flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="e.g., Quantum Entanglement"
                                    value={explainConceptStr}
                                    onChange={(e) => setExplainConceptStr(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
                                    className="w-full border-2 border-black p-4 font-bold text-lg focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-lg"
                                />
                                <button
                                    onClick={handleExplain}
                                    disabled={isExplaining || !explainConceptStr.trim()}
                                    className="brutal-btn bg-orange-600 text-white px-8 py-4 font-bold text-lg flex items-center justify-center gap-2 w-full"
                                >
                                    {isExplaining ? <Loader2 className="w-6 h-6 animate-spin" /> : <Brain className="w-6 h-6" />}
                                    {isExplaining ? 'Explaining...' : 'Explain It'}
                                </button>
                            </div>
                        </div>
                        {explanation && (
                            <div className="brutal-card bg-white p-8 animate-in slide-in-from-bottom-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black rounded-lg">
                                <h4 className="font-bold border-b-2 border-gray-100 pb-2 mb-4 text-xl">Explanation: <span className="text-orange-600 capitalize">{explainConceptStr}</span></h4>
                                <div className="prose max-w-none">
                                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{explanation}</p>
                                </div>
                            </div>
                        )}

                        {pastExplanations.length > 0 && (
                            <div className="mt-8 border-t-2 border-gray-100 pt-8">
                                <h4 className="font-bold text-xl mb-6 text-gray-400 uppercase tracking-widest text-center">History</h4>
                                <div className="space-y-6">
                                    {pastExplanations.filter(e => e.explanation !== explanation).map((expl, idx) => (
                                        <details key={idx} className="bg-white border-2 border-gray-200 rounded-lg group overflow-hidden">
                                            <summary className="p-4 cursor-pointer flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors list-none select-none">
                                                <div className="flex flex-col gap-1">
                                                    <h5 className="font-bold text-lg capitalize text-gray-800">{expl.concept}</h5>
                                                    <span className="text-xs text-gray-400 font-medium">{new Date(expl.timestamp).toLocaleString()}</span>
                                                </div>
                                                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-300" />
                                            </summary>
                                            <div className="p-4 border-t-2 border-gray-100 bg-white animate-in slide-in-from-top-2">
                                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{expl.explanation}</p>
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
                        <div className="h-full flex flex-col items-center justify-center overflow-y-auto w-full p-4">
                            {flashcards.length === 0 ? (
                                <div className="w-full max-w-4xl h-full flex flex-col">
                                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 shrink-0">
                                        <div>
                                            <h2 className="text-3xl font-black mb-1">Flashcard Decks</h2>
                                            <p className="text-gray-600 font-medium">Select a deck or generate a new one.</p>
                                        </div>
                                        <button
                                            onClick={handleGenerateFlashcards}
                                            disabled={isGeneratingDecks}
                                            className="brutal-btn bg-green-600 text-white px-6 py-3 font-bold text-lg flex items-center justify-center gap-2 whitespace-nowrap"
                                        >
                                            {isGeneratingDecks ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                                            {isGeneratingDecks ? 'Generating...' : 'New Deck'}
                                        </button>
                                    </div>

                                    {flashcardsList.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-gray-300">
                                                <BookOpen className="w-10 h-10 text-gray-400" />
                                            </div>
                                            <p className="font-bold text-xl text-gray-500">No flashcards yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 overflow-y-auto">
                                            {flashcardsList.map((deck) => {
                                                const cards = deck.cards || [];
                                                const total = cards.length;
                                                const reviewedCount = cards.filter((c: any) => c.reviewCount > 0).length;
                                                const progress = total > 0 ? Math.round((reviewedCount / total) * 100) : 0;
                                                const starredCount = cards.filter((c: any) => c.isStarred).length;

                                                return (
                                                    <div key={deck._id} className="bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all flex flex-col justify-between h-64">
                                                        <div>
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div className="w-10 h-10 bg-green-100 border-2 border-black flex items-center justify-center rounded">
                                                                    <BookOpen className="w-6 h-6 text-green-700" />
                                                                </div>
                                                                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                                                    {new Date(deck.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-black text-xl mb-1 line-clamp-1" title={deck.title}>{deck.title || `Flashcard Deck`}</h3>

                                                            <div className="flex items-center gap-4 text-sm font-bold text-gray-600 mt-2 mb-4">
                                                                <div className="flex items-center gap-1">
                                                                    <BookOpen className="w-3 h-3" /> {total} Cards
                                                                </div>
                                                                {starredCount > 0 && (
                                                                    <div className="flex items-center gap-1 text-orange-500">
                                                                        <Star className="w-3 h-3 fill-current" /> {starredCount}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="mb-4">
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

                                                            <button
                                                                onClick={() => handleSelectFlashcardSet(deck)}
                                                                className="brutal-btn w-full py-2 font-bold text-sm border-2 border-black flex items-center justify-center gap-2 bg-white text-black hover:bg-green-50"
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
                                <div className="w-full max-w-2xl flex flex-col items-center">
                                    <div className="flex justify-between w-full mb-4 items-center">
                                        <span className="font-bold text-gray-500">Card {currentCardIndex + 1} of {flashcards.length}</span>
                                        <button
                                            onClick={() => { setFlashcards([]); setCurrentCardIndex(0); }}
                                            className="text-red-500 font-bold hover:underline text-sm"
                                        >
                                            New Deck
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
                                            <div className="absolute w-full h-full backface-hidden bg-white border-2 border-black rounded-xl p-8 flex flex-col items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
                                                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                                                    <span className="text-xs font-black uppercase text-gray-400">Question</span>
                                                    <button
                                                        onClick={handleToggleStar}
                                                        className="hover:scale-110 transition-transform p-1 rounded-full hover:bg-yellow-50"
                                                    >
                                                        <Star
                                                            className={`w-6 h-6 ${flashcards[currentCardIndex]?.isStarred ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'}`}
                                                        />
                                                    </button>
                                                </div>
                                                <p className="text-2xl font-bold text-center leading-relaxed">
                                                    {flashcards[currentCardIndex]?.front || flashcards[currentCardIndex]?.question}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-4 font-bold absolute bottom-4">Click to flip</p>
                                            </div>

                                            {/* Back */}
                                            <div className="absolute w-full h-full backface-hidden bg-black text-white border-2 border-black rounded-xl p-8 flex flex-col items-center justify-center shadow-[8px_8px_0px_0px_rgba(74,222,128,1)] rotate-y-180">
                                                <span className="text-xs font-black uppercase text-gray-400 absolute top-4 left-4">Answer</span>
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
                                            className="brutal-btn bg-white px-6 py-3 font-bold disabled:opacity-50"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrentCardIndex(prev => Math.min(flashcards.length - 1, prev + 1));
                                                setIsFlipped(false);
                                            }}
                                            disabled={currentCardIndex === flashcards.length - 1}
                                            className="brutal-btn bg-black text-white px-6 py-3 font-bold disabled:opacity-50"
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
                    <div className="h-full flex flex-col items-center justify-center overflow-y-auto w-full p-4">
                        {!quiz ? (
                            <div className="w-full max-w-4xl h-full flex flex-col">
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 shrink-0">
                                    <div>
                                        <h2 className="text-3xl font-black mb-1">Practice Quizzes</h2>
                                        <p className="text-gray-600 font-medium">Select a quiz to review or start a new one.</p>
                                    </div>
                                    <button
                                        onClick={handleGenerateQuiz}
                                        disabled={isGeneratingQuiz}
                                        className="brutal-btn bg-blue-600 text-white px-6 py-3 font-bold text-lg flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        {isGeneratingQuiz ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                                        {isGeneratingQuiz ? 'Generating...' : 'New Quiz'}
                                    </button>
                                </div>

                                {quizzesList.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-gray-300">
                                            <Brain className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <p className="font-bold text-xl text-gray-500">No quizzes generated yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 overflow-y-auto">
                                        {quizzesList.map((q) => {
                                            const isCompleted = q.completedAt || (q.userAnswers && q.userAnswers.length > 0);
                                            const score = q.score || 0;
                                            const total = q.totalQuestions || q.questions?.length || 0;
                                            const pct = total > 0 ? Math.round((score / total) * 100) : 0;

                                            return (
                                                <div key={q._id} className="bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all flex flex-col justify-between h-48">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            {isCompleted ? (
                                                                <span className="bg-green-100 text-green-800 text-xs font-black px-2 py-1 uppercase tracking-wider rounded border border-black flex items-center gap-1">
                                                                    <Check className="w-3 h-3" /> Completed
                                                                </span>
                                                            ) : (
                                                                <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-2 py-1 uppercase tracking-wider rounded border border-black">
                                                                    Pending
                                                                </span>
                                                            )}
                                                            <span className="text-xs font-bold text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <h3 className="font-black text-xl mb-1 line-clamp-1 truncate" title={q.title}>{q.title || `Quiz`}</h3>
                                                        {isCompleted && (
                                                            <p className="font-bold text-gray-600">Score: {score}/{total} ({pct}%)</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleSelectQuiz(q)}
                                                        className={`brutal-btn w-full py-2 font-bold text-sm border-2 border-black flex items-center justify-center gap-2 ${isCompleted ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-50'}`}
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
                            <div className="w-full max-w-3xl h-full flex flex-col bg-white border-2 border-black rounded-lg overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-4">
                                <div className="p-8 border-b-2 border-gray-100 flex flex-col items-center justify-center bg-gray-50">
                                    <h3 className="text-2xl font-black mb-4">Quiz Results</h3>
                                    <div className="text-6xl font-black mb-4 flex justify-center items-center gap-2">
                                        <span className={quizResult.percentage >= 70 ? 'text-green-600' : 'text-orange-600'}>
                                            {quizResult.percentage}%
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-600 mb-6">
                                        You got {quizResult.score} out of {quizResult.total} correct.
                                    </p>
                                    <div className="flex gap-4 w-full max-w-sm">
                                        <button
                                            onClick={() => {
                                                setQuizResult(null);
                                                setQuizAnswers({});
                                            }}
                                            className="brutal-btn bg-black text-white px-6 py-3 flex-1 font-bold flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw className="w-4 h-4" /> Retake
                                        </button>
                                        <button
                                            onClick={() => {
                                                setQuiz(null);
                                                setQuizResult(null);
                                                setQuizAnswers({});
                                            }}
                                            className="brutal-btn bg-white px-6 py-3 flex-1 font-bold border-2 border-black"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
                                    <h4 className="font-bold text-xl mb-4 border-b pb-2">Answer Review</h4>
                                    {quiz.questions?.map((q: any, qIdx: number) => {
                                        const userAnswerIdx = quizAnswers[qIdx] !== undefined ? quizAnswers[qIdx] : -1;
                                        // Determine correct answer index: api might return '1' (string) or 1 (number)
                                        // safely parse q.correctAnswer
                                        const correctIdx = parseInt(q.correctAnswer);
                                        const isCorrect = userAnswerIdx === correctIdx;

                                        return (
                                            <div key={qIdx} className={`p-6 rounded-lg border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                                <p className="font-bold text-lg mb-4 flex gap-2">
                                                    <span className="text-gray-500">0{qIdx + 1}.</span>
                                                    {q.question}
                                                </p>

                                                <div className="grid grid-cols-1 gap-2 mb-4">
                                                    {q.options?.map((opt: string, optIdx: number) => {
                                                        let itemClass = "p-3 rounded border-2 ";
                                                        if (optIdx === correctIdx) {
                                                            itemClass += "bg-green-500 text-white border-green-600 font-bold";
                                                        } else if (optIdx === userAnswerIdx && !isCorrect) {
                                                            itemClass += "bg-red-500 text-white border-red-600 font-bold";
                                                        } else {
                                                            itemClass += "bg-white border-transparent text-gray-500 opacity-60";
                                                        }

                                                        return (
                                                            <div key={optIdx} className={itemClass}>
                                                                {opt} {optIdx === correctIdx && "(Correct Answer)"} {optIdx === userAnswerIdx && !isCorrect && "(Your Answer)"}
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                {!isCorrect && q.explanation && (
                                                    <div className="bg-white p-4 rounded border-l-4 border-blue-500 text-sm">
                                                        <span className="font-bold text-blue-600 block mb-1">Explanation:</span>
                                                        {q.explanation}
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
                                    <h2 className="text-2xl font-black">Quiz Time</h2>
                                    <button onClick={() => setQuiz(null)} className="text-red-500 font-bold hover:underline">Exit Quiz</button>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-8 pr-2">
                                    {quiz.questions?.map((q: any, qIdx: number) => (
                                        <div key={qIdx} className="bg-white border-2 border-gray-200 p-6 rounded-lg">
                                            <p className="font-bold text-lg mb-4 flex gap-2">
                                                <span className="text-gray-400">0{qIdx + 1}.</span>
                                                {q.question}
                                            </p>
                                            <div className="grid grid-cols-1 gap-3">
                                                {q.options?.map((opt: string, optIdx: number) => (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                                                        className={`p-4 text-left border-2 rounded-lg font-medium transition-all ${quizAnswers[qIdx] === optIdx
                                                            ? 'bg-black text-white border-black'
                                                            : 'bg-white border-gray-200 hover:border-black'
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 mt-6 border-t-2 border-gray-200">
                                    <button
                                        onClick={handleSubmitQuiz}
                                        disabled={isSubmittingQuiz || Object.keys(quizAnswers).length !== quiz.questions?.length}
                                        className="brutal-btn bg-blue-600 text-white w-full py-4 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmittingQuiz ? 'Submitting...' : 'Submit Answers'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
                }
            </div >
        </div >
    );
}

// Add these utility styles to your global CSS or just rely on Tailwind
// .backface-hidden { backface-visibility: hidden; }
// .transform-style-3d { transform-style: preserve-3d; }
// .rotate-y-180 { transform: rotateY(180deg); }
// .perspective-1000 { perspective: 1000px; }
