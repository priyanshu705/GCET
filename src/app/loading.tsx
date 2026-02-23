import Link from 'next/link';

export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex flex-col items-center justify-center">
            <div className="relative">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl animate-pulse"></div>

                {/* Spinner */}
                <div className="w-16 h-16 border-4 border-white/5 border-t-purple-500 rounded-full animate-spin"></div>

                {/* Icon in Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl animate-bounce">🎓</span>
                </div>
            </div>

            <p className="mt-8 text-gray-400 font-medium animate-pulse tracking-widest text-sm">
                LOADING GCET CAMPUS...
            </p>
        </div>
    );
}
