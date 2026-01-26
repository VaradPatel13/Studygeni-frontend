'use client';

import { useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DocumentViewer from '@/components/dashboard/DocumentViewer';

export default function DocumentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    if (!id) return null;

    return (
        <div className="h-screen w-full bg-[var(--bg-page)]">
            <DocumentViewer
                documentId={id}
                onBack={handleBack}
            />
        </div>
    );
}
