'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { documentService } from '@/services/documentService';
import { ArrowLeft, MessageSquare, Zap, BookOpen, Brain, FileText, ExternalLink, Download, Printer, MoreVertical, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DocumentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [document, setDocument] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('content');
    const [viewMode, setViewMode] = useState<'pdf' | 'text'>('pdf');

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const doc = await documentService.getDocumentById(id);
                setDocument(doc);
            } catch (error) {
                console.error('Error fetching document:', error);
                toast.error('Failed to load document');
                router.push('/dashboard/documents');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchDocument();
        }
    }, [id, router]);

    if (isLoading) {
        return (
            <div className="flex-1 bg-[#fdfbf7] p-8 flex items-center justify-center h-screen">
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
        { id: 'actions', label: 'AI Actions', icon: Zap },
        { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
        { id: 'quizzes', label: 'Quizzes', icon: Brain },
    ];

    return (
        <div className="flex-1 bg-[#fdfbf7] flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b-2 border-black p-4 shrink-0">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-black font-bold mb-2 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Documents
                </button>
                <h1 className="text-2xl font-black">{document.title}</h1>
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
                        {/* Viewer Header */}
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
                                href={document.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 font-bold text-sm hover:underline"
                            >
                                <ExternalLink className="w-4 h-4" /> Open in new tab
                            </a>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 bg-gray-100 relative overflow-hidden">
                            {viewMode === 'pdf' ? (
                                <iframe
                                    src={document.fileType === 'application/pdf' ? document.fileUrl : `https://docs.google.com/viewer?url=${encodeURIComponent(document.fileUrl)}&embedded=true`}
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
                    <div className="h-full flex flex-col items-center justify-center bg-white border-2 border-black rounded-lg p-8 text-center">
                        <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                        <h2 className="text-2xl font-black mb-2">Chat with PDF</h2>
                        <p className="text-gray-500 mb-6">Ask questions and get answers directly from your document.</p>
                        <button className="brutal-btn bg-black text-white px-6 py-3 font-bold">Start Chatting</button>
                    </div>
                )}

                {activeTab === 'actions' && (
                    <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                        <div className="brutal-card bg-purple-50 p-6 flex flex-col items-center text-center">
                            <Zap className="w-12 h-12 text-purple-600 mb-4" />
                            <h3 className="text-xl font-bold mb-2">Summarize</h3>
                            <p className="text-gray-600 mb-4">Get a quick summary of the key points.</p>
                            <button className="brutal-btn bg-purple-600 text-white px-4 py-2 font-bold w-full">Generate Summary</button>
                        </div>
                        <div className="brutal-card bg-orange-50 p-6 flex flex-col items-center text-center">
                            <Brain className="w-12 h-12 text-orange-600 mb-4" />
                            <h3 className="text-xl font-bold mb-2">Explain Concepts</h3>
                            <p className="text-gray-600 mb-4">Simplify complex topics from the text.</p>
                            <button className="brutal-btn bg-orange-600 text-white px-4 py-2 font-bold w-full">Explain</button>
                        </div>
                    </div>
                )}

                {activeTab === 'flashcards' && (
                    <div className="h-full flex flex-col items-center justify-center bg-white border-2 border-black rounded-lg p-8 text-center">
                        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                        <h2 className="text-2xl font-black mb-2">AI Flashcards</h2>
                        <p className="text-gray-500 mb-6">Automatically generate study flashcards from this document.</p>
                        <button className="brutal-btn bg-green-600 text-white px-6 py-3 font-bold">Generate Deck</button>
                    </div>
                )}

                {activeTab === 'quizzes' && (
                    <div className="h-full flex flex-col items-center justify-center bg-white border-2 border-black rounded-lg p-8 text-center">
                        <Brain className="w-16 h-16 text-gray-300 mb-4" />
                        <h2 className="text-2xl font-black mb-2">Practice Quiz</h2>
                        <p className="text-gray-500 mb-6">Test your knowledge with an AI-generated quiz.</p>
                        <button className="brutal-btn bg-blue-600 text-white px-6 py-3 font-bold">Start Quiz</button>
                    </div>
                )}
            </div>
        </div>
    );
}
