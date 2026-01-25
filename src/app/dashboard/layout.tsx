'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    return <>{children}</>;
}
