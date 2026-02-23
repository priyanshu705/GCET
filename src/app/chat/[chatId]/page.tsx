'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
    id: string;
    content: string;
    senderId: string;
    isAnonymous: boolean;
    createdAt: string;
    readAt: string | null;
}

interface ChatData {
    chatId: string;
    isAnonymous: boolean;
    revealLevel: number;
    recipient: {
        id: string;
        name: string;
        photo: string | null;
        isOnline: boolean;
        isVerified: boolean;
    };
    me: {
        anonymousName: string;
    };
    messages: Message[];
    hasMore: boolean;
}

export default function ChatPage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const router = useRouter();
    const chatId = params.chatId as string;

    const [chatData, setChatData] = useState<ChatData | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [revealing, setRevealing] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated' && chatId) {
            fetchChat();
        }
    }, [status, chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchChat = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/chat/${chatId}`);
            if (res.ok) {
                const data = await res.json();
                setChatData(data);
                setMessages(data.messages || []);
            } else if (res.status === 404) {
                router.push('/chat');
            }
        } catch (error) {
            console.error('Failed to fetch chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await fetch(`/api/chat/${chatId}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage.trim() }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages([...messages, data.message]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const requestReveal = async () => {
        setRevealing(true);
        try {
            const res = await fetch(`/api/chat/${chatId}/reveal`, {
                method: 'POST',
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && chatData) {
                    setChatData({
                        ...chatData,
                        revealLevel: data.newLevel,
                        isAnonymous: !data.isFullyRevealed,
                    });
                }
                alert(data.message);
            }
        } catch (error) {
            console.error('Reveal failed:', error);
        } finally {
            setRevealing(false);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-pulse mb-4">💬</div>
                    <p className="text-gray-400">Loading chat...</p>
                </div>
            </div>
        );
    }

    if (!chatData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400">Chat not found</p>
                    <Link href="/chat" className="text-purple-400 mt-2 block">← Back to chats</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex flex-col">
            {/* Header */}
            <header className="glass border-b border-white/10 p-4 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Link href="/chat" className="p-2 glass rounded-full hover:bg-white/10">
                        ←
                    </Link>

                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            {chatData.recipient.photo ? (
                                <img src={chatData.recipient.photo} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : chatData.isAnonymous ? '🎭' : chatData.recipient.name?.charAt(0)}
                        </div>
                        {chatData.recipient.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="font-semibold text-white">{chatData.recipient.name}</h1>
                            {chatData.recipient.isVerified && <span className="text-blue-400 text-sm">✓</span>}
                        </div>
                        <p className="text-xs text-gray-400">
                            {chatData.recipient.isOnline ? 'Online' : 'Offline'}
                            {chatData.isAnonymous && ` • Reveal Level ${chatData.revealLevel}/5`}
                        </p>
                    </div>

                    {chatData.isAnonymous && (
                        <button
                            onClick={requestReveal}
                            disabled={revealing}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-medium hover:opacity-90"
                        >
                            {revealing ? '...' : '🔓 Reveal'}
                        </button>
                    )}
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
                {/* Reveal Progress */}
                {chatData.isAnonymous && (
                    <div className="glass rounded-xl p-3 mb-4 text-center">
                        <p className="text-xs text-gray-400 mb-2">Reveal Progress</p>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                style={{ width: `${(chatData.revealLevel / 5) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            Keep chatting to unlock more about each other!
                        </p>
                    </div>
                )}

                {/* Message List */}
                <div className="space-y-3">
                    {messages.map((msg) => {
                        const isOwn = msg.senderId === session?.user?.id;
                        return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] ${isOwn
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl rounded-br-md'
                                        : 'glass rounded-2xl rounded-bl-md'
                                    } px-4 py-2`}>
                                    <p className="text-white">{msg.content}</p>
                                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                                        <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                                        {isOwn && msg.readAt && <span className="text-xs text-blue-400">✓✓</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input */}
            <footer className="glass border-t border-white/10 p-4 sticky bottom-0">
                <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex gap-3">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {sending ? '...' : '➤'}
                    </button>
                </form>
            </footer>
        </div>
    );
}
