import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-6">
            <div className="glass max-w-md w-full rounded-3xl p-10 text-center space-y-8">
                <div className="relative">
                    <div className="text-9xl font-black text-white/5 select-none">404</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl animate-float">🕵️</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
                    <p className="text-gray-400">
                        The page you're looking for doesn't exist or has been moved to another campus.
                    </p>
                </div>

                <Link
                    href="/dashboard"
                    className="block w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold hover-glow transition-all hover:scale-105 active:scale-95"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
