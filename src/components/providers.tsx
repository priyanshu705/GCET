'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { ReactNode, useState } from 'react';
import { ToastProvider } from '@/lib/ToastContext';
import ToastContainer from '@/components/Toast';

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    {children}
                    <ToastContainer />
                </ToastProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}

