'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

interface Conversation {
    id: string;
    isAnonymous: boolean;
    revealLevel: number;
    mode: 'DATING' | 'FRIEND';
    recipient: {
        id: string;
        name: string;
        photo: string | null;
        isOnline: boolean;
        isVerified: boolean;
    };
    lastMessage: {
        content: string;
        time: string;
        isOwn: boolean;
    } | null;
    unreadCount: number;
    updatedAt: string;
}

export default function ChatListPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [chats, setChats] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'dating' | 'friends'>('all');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchChats();
        }
    }, [status]);

    const fetchChats = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/chat');
            if (res.ok) {
                const data = await res.json();
                setChats(data.chats || []);
            }
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredChats = chats.filter(chat => {
        if (filter === 'dating') return chat.mode === 'DATING';
        if (filter === 'friends') return chat.mode === 'FRIEND';
        return true;
    });

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
        return date.toLocaleDateString();
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-pulse mb-4">💬</div>
                    <p className="text-gray-400">Loading chats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <Navbar userName={session?.user?.name || 'User'} />

            <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold gradient-text">Messages</h1>
                    <p className="text-gray-400 text-sm">{chats.length} conversations</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['all', 'dating', 'friends'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f
                                    ? f === 'dating' ? 'bg-pink-600/30 text-pink-300' :
                                        f === 'friends' ? 'bg-cyan-600/30 text-cyan-300' :
                                            'bg-purple-600/30 text-purple-300'
                                    : 'glass text-gray-400 hover:text-white'
                                }`}
                        >
                            {f === 'all' && '✨ All'}
                            {f === 'dating' && '💕 Dating'}
                            {f === 'friends' && '🤝 Friends'}
                        </button>
                    ))}
                </div>

                {/* Chat List */}
                {filteredChats.length > 0 ? (
                    <div className="space-y-2">
                        {filteredChats.map((chat) => (
                            <Link key={chat.id} href={`/chat/${chat.id}`}>
                                <div className="glass rounded-2xl p-4 hover:bg-white/5 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className="relative">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${chat.mode === 'DATING'
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                                }`}>
                                                {chat.recipient.photo ? (
                                                    <img src={chat.recipient.photo} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : chat.isAnonymous ? '🎭' : chat.recipient.name?.charAt(0) || '?'}
                                            </div>
                                            {chat.recipient.isOnline && (
                                                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-white truncate">
                                                        {chat.recipient.name}
                                                    </h3>
                                                    {chat.recipient.isVerified && <span className="text-blue-400 text-sm">✓</span>}
                                                    {chat.isAnonymous && (
                                                        <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                                                            Lv.{chat.revealLevel}
                                                        </span>
                                                    )}
                                                </div>
                                                {chat.lastMessage && (
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(chat.lastMessage.time)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-400 truncate">
                                                    {chat.lastMessage
                                                        ? `${chat.lastMessage.isOwn ? 'You: ' : ''}${chat.lastMessage.content}`
                                                        : 'Start a conversation!'}
                                                </p>
                                                {chat.unreadCount > 0 && (
                                                    <span className="ml-2 px-2 py-0.5 bg-purple-500 text-white rounded-full text-xs font-medium">
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">💬</div>
                        <h2 className="text-xl font-semibold text-white mb-2">No Conversations Yet</h2>
                        <p className="text-gray-400 mb-6">Match with someone or connect with friends to start chatting!</p>
                        <div className="flex gap-3 justify-center">
                            <Link href="/dating">
                                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover-glow">
                                    💕 Find Dates
                                </button>
                            </Link>
                            <Link href="/friends">
                                <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full font-semibold hover-glow">
                                    🤝 Find Friends
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
