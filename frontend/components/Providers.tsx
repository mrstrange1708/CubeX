'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CubeProvider } from '@/context/CubeContext';
import { SocketProvider } from '@/context/SocketContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SocketProvider>
                <CubeProvider>
                    {children}
                </CubeProvider>
            </SocketProvider>
        </AuthProvider>
    );
}
