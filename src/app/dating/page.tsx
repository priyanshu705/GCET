'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import SwipeCard from '@/components/SwipeCard';
import Confetti, { HeartBurst } from '@/components/Confetti';
import Link from 'next/link';

interface Profile {
    id: string;
    campus: string;
    age: number | null;
    interests: string[];
    isVerified: boolean;
}

export default function DatingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showMatch, setShowMatch] = useState(false);
    const [matchData, setMatchData] = useState<{ chatId: string; message: string } | null>(null);
    const [campusFilter, setCampusFilter] = useState<string>('All');
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    // Fetch profiles
    useEffect(() => {
        if (status === 'authenticated') {
            fetchProfiles();
        }
    }, [status, campusFilter, verifiedOnly]);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/dating/discover?limit=10');
            if (res.ok) {
                const data = await res.json();
                setProfiles(data.profiles || []);
                setCurrentIndex(0);
            }
        } catch (error) {
            console.error('Failed to fetch profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentProfile = profiles[currentIndex];

    const handleSwipe = async (action: 'like' | 'dislike' | 'superlike') => {
        if (!currentProfile) return;

        try {
            const res = await fetch('/api/dating/swipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId: currentProfile.id,
                    action,
                }),
            });

            if (res.ok) {
                const data = await res.json();

                if (data.isMatch) {
                    setMatchData({
                        chatId: data.chatId,
                        message: data.message,
                    });
                    setShowMatch(true);
                }
            }
        } catch (error) {
            console.error('Swipe failed:', error);
        }

        goToNext();
    };

    const handleLike = (id: string) => handleSwipe('like');
    const handleDislike = (id: string) => handleSwipe('dislike');
    const handleSuperLike = (id: string) => handleSwipe('superlike');

    const goToNext = () => {
        if (currentIndex < profiles.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(-1);
        }
    };

    const closeMatch = () => {
        setShowMatch(false);
        setMatchData(null);
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-pulse mb-4">💕</div>
                    <p className="text-gray-400">Loading profiles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <Navbar userName={session?.user?.name || 'User'} />

            <main className="max-w-lg mx-auto px-4 py-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold gradient-text">Dating Mode</h1>
                        <p className="text-gray-400 text-sm">Swipe to find your match</p>
                    </div>
                    <Link href="/dating/matches">
                        <button className="px-4 py-2 glass rounded-full text-sm font-medium hover:bg-white/10 transition-all">
                            💕 Matches
                        </button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['All', 'GCET', 'GU', 'GCOP'].map((campus) => (
                        <button
                            key={campus}
                            onClick={() => setCampusFilter(campus)}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${campusFilter === campus
                                ? 'bg-purple-600/30 text-purple-300'
                                : 'glass text-gray-400 hover:text-white'
                                }`}
                        >
                            {campus === 'All' ? 'All Campuses' : campus}
                        </button>
                    ))}
                    <button
                        onClick={() => setVerifiedOnly(!verifiedOnly)}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${verifiedOnly
                            ? 'bg-blue-600/30 text-blue-300'
                            : 'glass text-gray-400 hover:text-white'
                            }`}
                    >
                        ✓ Verified Only
                    </button>
                </div>

                {/* Swipe Card Stack */}
                <div className="relative min-h-[500px] flex items-center justify-center">
                    {currentIndex >= 0 && currentProfile ? (
                        <SwipeCard
                            id={currentProfile.id}
                            campus={currentProfile.campus}
                            interests={currentProfile.interests}
                            isVerified={currentProfile.isVerified}
                            isAnonymous={true}
                            onLike={handleLike}
                            onDislike={handleDislike}
                            onSuperLike={handleSuperLike}
                        />
                    ) : (
                        <div className="text-center">
                            <div className="text-6xl mb-4">🎭</div>
                            <h2 className="text-xl font-semibold text-white mb-2">No More Profiles</h2>
                            <p className="text-gray-400 mb-6">Check back later for new matches!</p>
                            <button
                                onClick={fetchProfiles}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover-glow"
                            >
                                Refresh Profiles
                            </button>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                {currentIndex >= 0 && (
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Swipe right to like • Swipe left to pass • Swipe up for super like
                        </p>
                    </div>
                )}
            </main>

            <BottomNav />

            {/* Match Popup with Confetti */}
            <Confetti active={showMatch} />
            <HeartBurst active={showMatch} />
            {showMatch && matchData && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-3xl p-8 max-w-sm w-full text-center animate-bounce-in">
                        <div className="text-7xl mb-4 animate-heart-burst">💕</div>
                        <h2 className="text-3xl font-bold gradient-text mb-2">It's a Match!</h2>
                        <p className="text-gray-400 mb-6">{matchData.message}</p>

                        <div className="flex gap-3">
                            <button
                                onClick={closeMatch}
                                className="flex-1 py-3 glass rounded-full font-medium hover:bg-white/10 transition-all"
                            >
                                Keep Swiping
                            </button>
                            <Link href={`/chat/${matchData.chatId}`} className="flex-1">
                                <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-medium hover-glow">
                                    Send Message
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
