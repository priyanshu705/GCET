'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const errorDetails: Record<string, { title: string; message: string }> = {
        Configuration: {
            title: 'Server Configuration Error',
            message: 'There is a problem with the server configuration. This usually happens when environment variables like NEXTAUTH_SECRET are missing on the hosting platform.',
        },
        AccessDenied: {
            title: 'Access Denied',
            message: 'You do not have permission to sign in.',
        },
        Verification: {
            title: 'Verification Error',
            message: 'The verification link has expired or has already been used.',
        },
        Default: {
            title: 'Authentication Error',
            message: 'An unexpected error occurred during authentication.',
        },
    };

    const { title, message } = errorDetails[error as string] || errorDetails.Default;

    return (
        <div className="glass p-8 rounded-3xl border border-white/10 max-w-md w-full text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
                {message}
            </p>
            <div className="flex flex-col gap-3">
                <Link
                    href="/auth/login"
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:opacity-90 transition-all shadow-lg shadow-purple-500/25"
                >
                    Try Signing In Again
                </Link>
                <Link
                    href="/"
                    className="w-full py-3 glass rounded-xl font-semibold text-white hover:bg-white/10 transition-all"
                >
                    Back to Home
                </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Error Code</p>
                <code className="px-2 py-1 bg-white/5 rounded text-pink-400 text-sm">{error || 'Unknown'}</code>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <ErrorContent />
            </Suspense>
        </div>
    );
}
