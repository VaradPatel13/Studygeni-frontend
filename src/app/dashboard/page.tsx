'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHome from '@/components/dashboard/DashboardHome';
import DocumentViewer from '@/components/dashboard/DocumentViewer';
import DocumentsList from '@/components/dashboard/DocumentsList';
import FlashcardsList from '@/components/dashboard/FlashcardsList';
import ProfileView from '@/components/dashboard/ProfileView';

import DashboardNavbar from '@/components/dashboard/DashboardNavbar';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('home');
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--bg-page)] transition-colors duration-300">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setSelectedDocumentId(null);
                    // On mobile, close sidebar when navigating
                    setIsSidebarOpen(false);
                }}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
                <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 overflow-hidden relative flex flex-col">
                    {activeTab === 'home' && (
                        <DashboardHome onViewAllDocuments={() => setActiveTab('documents')} />
                    )}

                    {activeTab === 'documents' && (
                        selectedDocumentId ? (
                            <DocumentViewer
                                documentId={selectedDocumentId}
                                onBack={() => setSelectedDocumentId(null)}
                            />
                        ) : (
                            <DocumentsList onSelectDocument={setSelectedDocumentId} />
                        )
                    )}

                    {activeTab === 'flashcards' && (
                        <FlashcardsList />
                    )}

                    {activeTab === 'profile' && (
                        <ProfileView />
                    )}
                </main>
            </div>
        </div>
    );
}
