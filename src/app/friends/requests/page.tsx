'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

interface FriendRequest {
    requestId: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        campus: string;
        department: string | null;
        bio: string | null;
        skills: string[];
        photos: string[];
        isPhotoVerified: boolean;
        mutualSkills: string[];
        mutualClubs: string[];
        mutualInterests: string[];
    };
}

export default function RequestsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [responding, setResponding] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchRequests();
        }
    }, [status]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/friends/requests');
            if (res.ok) {
                const data = await res.json();
                setRequests(data.requests || []);
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (requestId: string, action: 'accept' | 'decline') => {
        setResponding(requestId);
        try {
            const res = await fetch(`/api/friends/requests/${requestId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (res.ok) {
                setRequests(requests.filter(r => r.requestId !== requestId));
            }
        } catch (error) {
            console.error('Failed to respond:', error);
        } finally {
            setResponding(null);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-pulse mb-4">📬</div>
                    <p className="text-gray-400">Loading requests...</p>
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
                        <h1 className="text-2xl font-bold gradient-text">Friend Requests</h1>
                        <p className="text-gray-400 text-sm">{requests.length} pending requests</p>
                    </div>
                    <Link href="/friends">
                        <button className="px-4 py-2 glass rounded-full text-sm font-medium hover:bg-white/10">
                            ← Back
                        </button>
                    </Link>
                </div>

                {/* Requests List */}
                {requests.length > 0 ? (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div key={request.requestId} className="glass rounded-2xl p-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-2xl font-bold">
                                        {request.user.photos?.[0] ? (
                                            <img src={request.user.photos[0]} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : request.user.name.charAt(0)}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-white">{request.user.name}</h3>
                                            {request.user.isPhotoVerified && <span className="text-blue-400">✓</span>}
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">
                                            {request.user.campus} • {request.user.department || 'Student'}
                                        </p>

                                        {request.user.bio && (
                                            <p className="text-sm text-gray-300 mb-3">{request.user.bio}</p>
                                        )}

                                        {/* Mutual Info */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {request.user.mutualSkills.length > 0 && (
                                                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">
                                                    {request.user.mutualSkills.length} mutual skills
                                                </span>
                                            )}
                                            {request.user.mutualClubs.length > 0 && (
                                                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                                                    {request.user.mutualClubs.length} mutual clubs
                                                </span>
                                            )}
                                        </div>

                                        {/* Skills */}
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {request.user.skills.slice(0, 5).map((skill, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-white/5 text-gray-400 rounded-full text-xs">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleRespond(request.requestId, 'accept')}
                                                disabled={responding === request.requestId}
                                                className="flex-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-medium hover:opacity-90"
                                            >
                                                {responding === request.requestId ? '...' : '✓ Accept'}
                                            </button>
                                            <button
                                                onClick={() => handleRespond(request.requestId, 'decline')}
                                                disabled={responding === request.requestId}
                                                className="flex-1 py-2 glass rounded-xl font-medium hover:bg-white/10"
                                            >
                                                ✗ Decline
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📭</div>
                        <h2 className="text-xl font-semibold text-white mb-2">No Pending Requests</h2>
                        <p className="text-gray-400 mb-6">When someone wants to connect, they'll appear here</p>
                        <Link href="/friends">
                            <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full font-semibold hover-glow">
                                Find Friends
                            </button>
                        </Link>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
