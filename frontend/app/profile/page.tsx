'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

function ProfileRedirect() {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (user?.id) {
            router.replace(`/profile/${user.id}`);
        }
    }, [user?.id, router]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfileRedirect />
        </ProtectedRoute>
    );
}
