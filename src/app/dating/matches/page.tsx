'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

interface Match {
    matchId: string;
    chatId: string;
    createdAt: string;
    revealLevel: number;
    isNew: boolean;
    user: {
        id: string;
        anonymousName: string;
        campus: string;
        interests: string[];
        isVerified: boolean;
        bio: string | null;
        age: number | null;
        name: string | null;
        photos: string[];
    };
    lastMessage: {
        content: string;
        time: string;
        isOwn: boolean;
    } | null;
}

export default function MatchesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'new' | 'active'>('all');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchMatches();
        }
    }, [status]);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/dating/matches');
            if (res.ok) {
                const data = await res.json();
                setMatches(data.matches || []);
            }
        } catch (error) {
            console.error('Failed to fetch matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMatches = matches.filter((match) => {
        if (filter === 'new') return match.isNew;
        if (filter === 'active') return match.lastMessage !== null;
        return true;
    });

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-pulse mb-4">💕</div>
                    <p className="text-gray-400">Loading matches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <Navbar userName={session?.user?.name || 'User'} />

            <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold gradient-text">Your Matches</h1>
                        <p className="text-gray-400 text-sm">{matches.length} connections made</p>
                    </div>
                    <Link href="/dating">
                        <button className="px-4 py-2 glass rounded-full text-sm font-medium hover:bg-white/10">
                            ← Back to Swiping
                        </button>
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['all', 'new', 'active'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f
                                    ? 'bg-purple-600/30 text-purple-300'
                                    : 'glass text-gray-400 hover:text-white'
                                }`}
                        >
                            {f === 'all' && `✨ All (${matches.length})`}
                            {f === 'new' && `🆕 New (${matches.filter(m => m.isNew).length})`}
                            {f === 'active' && `💬 Active (${matches.filter(m => m.lastMessage).length})`}
                        </button>
                    ))}
                </div>

                {/* Matches Grid */}
                {filteredMatches.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMatches.map((match) => (
                            <Link key={match.matchId} href={`/chat/${match.chatId}`}>
                                <div className="glass rounded-2xl p-4 hover:bg-white/5 transition-all cursor-pointer">
                                    {/* Avatar */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                                            {match.revealLevel >= 4 && match.user.photos?.[0] ? (
                                                <img
                                                    src={match.user.photos[0]}
                                                    alt=""
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : '🎭'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-white truncate">
                                                    {match.revealLevel >= 3 ? match.user.name : match.user.anonymousName}
                                                </h3>
                                                {match.user.isVerified && (
                                                    <span className="text-blue-400 text-sm">✓</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400">{match.user.campus}</p>
                                        </div>
                                        {match.isNew && (
                                            <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs">
                                                New!
                                            </span>
                                        )}
                                    </div>

                                    {/* Reveal Progress */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Reveal Level</span>
                                            <span>{match.revealLevel}/5</span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                                style={{ width: `${(match.revealLevel / 5) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Interests */}
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {match.user.interests.slice(0, 3).map((interest, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-white/5 text-gray-400 rounded-full text-xs">
                                                {interest}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Last Message */}
                                    {match.lastMessage ? (
                                        <p className="text-sm text-gray-400 truncate">
                                            {match.lastMessage.isOwn ? 'You: ' : ''}{match.lastMessage.content}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-purple-400">Send the first message! 💬</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">💕</div>
                        <h2 className="text-xl font-semibold text-white mb-2">No Matches Yet</h2>
                        <p className="text-gray-400 mb-6">Keep swiping to find your perfect match!</p>
                        <Link href="/dating">
                            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover-glow">
                                Start Swiping
                            </button>
                        </Link>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
