'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-6">
            <div className="glass max-w-md w-full rounded-3xl p-8 text-center space-y-6">
                <div className="text-6xl animate-bounce">⚠️</div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Something went wrong!</h2>
                    <p className="text-gray-400 text-sm">
                        An unexpected error occurred. Don't worry, we've logged it and are looking into it.
                    </p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <button
                        onClick={() => reset()}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold hover-glow transition-all active:scale-95"
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="w-full py-4 glass rounded-2xl font-semibold hover:bg-white/10 transition-all text-sm"
                    >
                        Go back home
                    </Link>
                </div>
            </div>
        </div>
    );
}
