'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHome from '@/components/dashboard/DashboardHome';
import DocumentViewer from '@/components/dashboard/DocumentViewer';
import DocumentsList from '@/components/dashboard/DocumentsList';
import FlashcardsList from '@/components/dashboard/FlashcardsList';
import ProfileView from '@/components/dashboard/ProfileView';
import BillingView from '@/components/dashboard/BillingView';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import api from '@/lib/api';

export default function DashboardPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get('tab');
  const activeTab = activeTabParam && ['home', 'documents', 'flashcards', 'billing', 'profile'].includes(activeTabParam)
    ? activeTabParam
    : 'home';
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('Free Plan');

  useEffect(() => {
    let mounted = true;
    const fetchSubscription = async () => {
      try {
        const res = await api.get('/subscriptions/current');
        const data = res.data?.data;
        if (!mounted) return;
        const rawPlanName = data?.planName || data?.plan || 'free';
        const capitalized = rawPlanName.charAt(0).toUpperCase() + rawPlanName.slice(1);
        setCurrentPlan(`${capitalized} Plan`);
      } catch (err) {
        console.error('Error fetching subscription in dashboard:', err);
      }
    };
    fetchSubscription();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSetActiveTab = (tab: string) => {
    setSelectedDocumentId(null);
    setIsSidebarOpen(false);
    router.replace(`/dashboard${tab ? `?tab=${tab}` : ''}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-page)] transition-colors duration-300">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPlan={currentPlan}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'home' && (
            <DashboardHome 
              onViewAllDocuments={() => handleSetActiveTab('documents')} 
              onUpgradeClick={() => handleSetActiveTab('billing')}
              currentPlan={currentPlan}
            />
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

          {activeTab === 'flashcards' && <FlashcardsList />}

          {activeTab === 'billing' && <BillingView />}

          {activeTab === 'profile' && <ProfileView />}
        </main>
      </div>
    </div>
  );
}
