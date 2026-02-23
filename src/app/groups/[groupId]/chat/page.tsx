'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

interface Member {
    id: string;
    name: string;
    photo: string | null;
    role: string;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    senderPhoto?: string;
    createdAt: string;
}

interface GroupInfo {
    id: string;
    name: string;
    memberCount: number;
}

export default function GroupChatPage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const router = useRouter();
    const groupId = params.groupId as string;

    const [group, setGroup] = useState<GroupInfo | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated' && groupId) {
            fetchGroupInfo();
            fetchMessages();
        }
    }, [status, groupId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchGroupInfo = async () => {
        try {
            const res = await fetch(`/api/groups/${groupId}`);
            if (res.ok) {
                const data = await res.json();
                setGroup({
                    id: data.id,
                    name: data.name,
                    memberCount: data.memberCount,
                });
            }
        } catch (error) {
            console.error('Failed to fetch group:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/groups/${groupId}/chat`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const content = newMessage;
        setNewMessage('');

        // Optimistic update
        const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            content,
            senderId: session?.user?.id || '',
            senderName: session?.user?.name || 'You',
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            const res = await fetch(`/api/groups/${groupId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });

            if (!res.ok) {
                // Remove optimistic message on failure
                setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
                setNewMessage(content);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
            setNewMessage(content);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex flex-col">
            {/* Header */}
            <div className="glass border-b border-white/10 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link
                        href={`/groups/${groupId}`}
                        className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                    >
                        ←
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-semibold text-white truncate">{group?.name || 'Group Chat'}</h1>
                        <p className="text-xs text-gray-400">{group?.memberCount || 0} members</p>
                    </div>
                    <Link
                        href={`/groups/${groupId}`}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        ℹ️
                    </Link>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 max-w-4xl mx-auto w-full">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <span className="text-5xl mb-4">💬</span>
                        <h3 className="text-lg font-semibold text-white mb-2">No messages yet</h3>
                        <p className="text-gray-400 text-sm">Be the first to say something!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => {
                            const isOwn = message.senderId === session?.user?.id;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[75%] ${isOwn ? 'order-2' : ''}`}>
                                        {!isOwn && (
                                            <p className="text-xs text-gray-500 mb-1 ml-3">
                                                {message.senderName}
                                            </p>
                                        )}
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl ${isOwn
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 rounded-br-md'
                                                    : 'glass rounded-bl-md'
                                                }`}
                                        >
                                            <p className="text-white text-sm">{message.content}</p>
                                            <p className={`text-xs mt-1 ${isOwn ? 'text-white/60' : 'text-gray-500'}`}>
                                                {formatTime(message.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="glass border-t border-white/10 p-4">
                <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            '→'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
