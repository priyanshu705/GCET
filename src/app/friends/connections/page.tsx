'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

interface Connection {
    connectionId: string;
    chatId: string;
    connectedAt: string;
    friend: {
        id: string;
        name: string;
        campus: string;
        department: string | null;
        bio: string | null;
        skills: string[];
        photos: string[];
        isPhotoVerified: boolean;
        isOnline: boolean;
        lastActiveFormatted: string;
    };
    lastMessage: {
        content: string;
        createdAt: string;
    } | null;
}

export default function ConnectionsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchConnections();
        }
    }, [status]);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/friends/connections');
            if (res.ok) {
                const data = await res.json();
                setConnections(data.connections || []);
            }
        } catch (error) {
            console.error('Failed to fetch connections:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConnections = connections.filter(conn =>
        conn.friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.friend.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-pulse mb-4">👥</div>
                    <p className="text-gray-400">Loading friends...</p>
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
                        <h1 className="text-2xl font-bold gradient-text">My Friends</h1>
                        <p className="text-gray-400 text-sm">
                            {connections.length} connections • {connections.filter(c => c.friend.isOnline).length} online
                        </p>
                    </div>
                    <Link href="/friends">
                        <button className="px-4 py-2 glass rounded-full text-sm font-medium hover:bg-white/10">
                            ← Back
                        </button>
                    </Link>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search friends..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                </div>

                {/* Connections List */}
                {filteredConnections.length > 0 ? (
                    <div className="space-y-3">
                        {filteredConnections.map((conn) => (
                            <div key={conn.connectionId} className="glass rounded-2xl p-4">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-xl font-bold">
                                            {conn.friend.photos?.[0] ? (
                                                <img src={conn.friend.photos[0]} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : conn.friend.name.charAt(0)}
                                        </div>
                                        {conn.friend.isOnline && (
                                            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="font-semibold text-white truncate">{conn.friend.name}</h3>
                                            {conn.friend.isPhotoVerified && <span className="text-blue-400">✓</span>}
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            {conn.friend.campus} • {conn.friend.lastActiveFormatted}
                                        </p>
                                        {conn.lastMessage && (
                                            <p className="text-xs text-gray-500 truncate mt-1">
                                                💬 {conn.lastMessage.content}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link href={`/chat/${conn.chatId}`}>
                                            <button className="p-3 glass rounded-full hover:bg-white/10">
                                                💬
                                            </button>
                                        </Link>
                                        <button className="p-3 glass rounded-full hover:bg-white/10">
                                            👤
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">👥</div>
                        <h2 className="text-xl font-semibold text-white mb-2">No Friends Yet</h2>
                        <p className="text-gray-400 mb-6">Start connecting with people from your campus!</p>
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
