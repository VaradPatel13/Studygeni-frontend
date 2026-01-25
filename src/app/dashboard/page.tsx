'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHome from '@/components/dashboard/DashboardHome';
import DocumentViewer from '@/components/dashboard/DocumentViewer';
import DocumentsList from '@/components/dashboard/DocumentsList';
import FlashcardsList from '@/components/dashboard/FlashcardsList';
import ProfileView from '@/components/dashboard/ProfileView';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('home');
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar activeTab={activeTab} setActiveTab={(tab) => {
                setActiveTab(tab);
                setSelectedDocumentId(null); // Reset selection when changing tabs
            }} />

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
        </div>
    );
}
