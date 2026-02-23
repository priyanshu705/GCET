'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import {
    acknowledgeMessages,
    ensureChatDocument,
    listenToMessages,
    listenToPresence,
    listenToTypingState,
    sendChatMessage,
    setTypingState,
    startPresenceHeartbeat,
    type ChatMessage,
} from '@/lib/firestore-chat';

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
}

type ReceiptStatus = 'sent' | 'delivered' | 'seen';

export default function ChatPage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const router = useRouter();

    const paramValue = params.chatId;
    const chatId = typeof paramValue === 'string' ? paramValue : '';

    const [chatData, setChatData] = useState<ChatData | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [revealing, setRevealing] = useState(false);
    const [isRecipientTyping, setIsRecipientTyping] = useState(false);
    const [recipientOnline, setRecipientOnline] = useState(false);
    const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
    const [isWindowActive, setIsWindowActive] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);

    // Prefer Firebase UID for Firestore rules; fall back to session ID so listeners can still attach.
    const currentUserId = useMemo(
        () => firebaseUid ?? session?.user?.id ?? null,
        [firebaseUid, session?.user?.id]
    );

    useEffect(() => {
        const firebaseAuth = getFirebaseAuth();
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            setFirebaseUid(user?.uid ?? null);
            if (process.env.NODE_ENV !== 'production') {
                console.log('[chat-page] firebase auth state', { uid: user?.uid ?? null });
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production' && firebaseUid && session?.user?.id && firebaseUid !== session.user.id) {
            console.warn('[chat-page] Firebase UID and session user ID differ', {
                firebaseUid,
                sessionUserId: session.user.id,
            });
        }
    }, [firebaseUid, session?.user?.id]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status !== 'authenticated' || !chatId) {
            return;
        }

        let cancelled = false;

        const fetchChatMeta = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/chat/${chatId}`);

                if (!res.ok) {
                    if (res.status === 404 && !cancelled) {
                        router.push('/chat');
                    }
                    return;
                }

                const data = (await res.json()) as ChatData;
                if (cancelled) return;

                setChatData(data);
                setRecipientOnline(Boolean(data.recipient?.isOnline));

            } catch (error) {
                console.error('Failed to fetch chat metadata:', error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void fetchChatMeta();

        return () => {
            cancelled = true;
        };
    }, [status, chatId, router]);

    useEffect(() => {
        if (!chatId || !currentUserId) {
            return;
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log('[chat-page] messages realtime setup start', { chatId, currentUserId });
        }

        const unsubscribeMessages = listenToMessages(
            chatId,
            (nextMessages) => {
                setMessages(nextMessages);
            },
            (error) => {
                console.error('Messages listener error:', error);
            }
        );

        // Keep chat doc freshness in background; do not block listener attachment on this call.
        if (chatData?.recipient?.id) {
            void ensureChatDocument(chatId, [currentUserId, chatData.recipient.id]).catch((error) => {
                console.error('Failed to ensure Firestore chat document:', error);
            });
        }

        const stopHeartbeat = startPresenceHeartbeat(currentUserId);

        return () => {
            if (process.env.NODE_ENV !== 'production') {
                console.log('[chat-page] messages realtime setup cleanup', { chatId, currentUserId });
            }

            unsubscribeMessages();
            stopHeartbeat();

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            if (isTypingRef.current) {
                isTypingRef.current = false;
                void setTypingState(chatId, currentUserId, false).catch((error) => {
                    console.error('Failed to clear typing state:', error);
                });
            }
        };
    }, [chatId, currentUserId, chatData?.recipient?.id]);

    useEffect(() => {
        if (!chatId || !chatData?.recipient?.id) {
            return;
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log('[chat-page] typing/presence realtime setup start', {
                chatId,
                recipientId: chatData.recipient.id,
            });
        }

        const unsubscribeTyping = listenToTypingState(
            chatId,
            chatData.recipient.id,
            (isTyping) => {
                setIsRecipientTyping(isTyping);
            },
            (error) => {
                console.error('Typing listener error:', error);
            }
        );

        const unsubscribePresence = listenToPresence(
            chatData.recipient.id,
            (isOnline) => {
                setRecipientOnline(isOnline);
            },
            (error) => {
                console.error('Presence listener error:', error);
            }
        );

        return () => {
            if (process.env.NODE_ENV !== 'production') {
                console.log('[chat-page] typing/presence realtime setup cleanup', {
                    chatId,
                    recipientId: chatData.recipient.id,
                });
            }
            unsubscribeTyping();
            unsubscribePresence();
        };
    }, [chatId, chatData?.recipient?.id]);

    useEffect(() => {
        const refreshWindowState = () => {
            setIsWindowActive(document.visibilityState === 'visible' && document.hasFocus());
        };

        refreshWindowState();
        window.addEventListener('focus', refreshWindowState);
        window.addEventListener('blur', refreshWindowState);
        document.addEventListener('visibilitychange', refreshWindowState);

        return () => {
            window.removeEventListener('focus', refreshWindowState);
            window.removeEventListener('blur', refreshWindowState);
            document.removeEventListener('visibilitychange', refreshWindowState);
        };
    }, []);

    useEffect(() => {
        if (!chatId || !currentUserId || messages.length === 0) {
            return;
        }

        const incomingMessages = messages.filter((message) => message.senderId !== currentUserId);
        if (incomingMessages.length === 0) return;

        const pendingDelivery = incomingMessages
            .filter((message) => !message.deliveredTo.includes(currentUserId))
            .map((message) => message.id);

        const pendingSeen = isWindowActive
            ? incomingMessages
                  .filter((message) => !message.seenBy.includes(currentUserId))
                  .map((message) => message.id)
            : [];

        const messageIdsToAck = [...new Set([...pendingDelivery, ...pendingSeen])];
        if (messageIdsToAck.length === 0) return;

        void acknowledgeMessages(chatId, currentUserId, messageIdsToAck, isWindowActive).catch((error) => {
            console.error('Failed to update message receipts:', error);
        });
    }, [messages, chatId, currentUserId, isWindowActive]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const updateTypingState = (isTyping: boolean) => {
        if (!chatId || !currentUserId || isTypingRef.current === isTyping) {
            return;
        }

        isTypingRef.current = isTyping;
        void setTypingState(chatId, currentUserId, isTyping).catch((error) => {
            console.error('Typing state update failed:', error);
        });
    };

    const handleTyping = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewMessage(value);

        if (!value.trim()) {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            updateTypingState(false);
            return;
        }

        updateTypingState(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            updateTypingState(false);
        }, 1500);
    };

    const sendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!chatId || !currentUserId || !newMessage.trim() || sending) {
            return;
        }

        const content = newMessage.trim();
        setNewMessage('');
        setSending(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        updateTypingState(false);

        try {
            await sendChatMessage(chatId, currentUserId, content);
        } catch (error) {
            console.error('Failed to send message:', error);
            setNewMessage(content);
        } finally {
            setSending(false);
        }
    };

    const requestReveal = async () => {
        if (!chatId) return;

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

    const formatTime = (value: Date | null) => {
        if (!value) return '';
        return value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getMessageReceiptStatus = (message: ChatMessage): ReceiptStatus => {
        const recipientId = chatData?.recipient.id;
        if (!recipientId) return 'sent';
        if (message.seenBy.includes(recipientId)) return 'seen';
        if (message.deliveredTo.includes(recipientId)) return 'delivered';
        return 'sent';
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
                    <Link href="/chat" className="text-purple-400 mt-2 block">
                        ← Back to chats
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex flex-col">
            <header className="glass border-b border-white/10 p-4 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Link href="/chat" className="p-2 glass rounded-full hover:bg-white/10">
                        ←
                    </Link>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            {chatData.recipient.photo ? (
                                <img src={chatData.recipient.photo} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : chatData.isAnonymous ? (
                                '🎭'
                            ) : (
                                chatData.recipient.name?.charAt(0).toUpperCase()
                            )}
                        </div>
                        {recipientOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="font-semibold text-white">
                                {chatData.isAnonymous
                                    ? `Stranger #${chatData.recipient.id?.slice(-4).toUpperCase()}`
                                    : chatData.recipient.name}
                            </h1>
                            {chatData.recipient.isVerified && <span className="text-blue-400 text-sm">✓</span>}
                        </div>
                        <p className="text-xs text-gray-400">
                            {recipientOnline ? 'Online' : 'Offline'}
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

            <main className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
                {chatData.isAnonymous && (
                    <div className="glass rounded-xl p-3 mb-4 text-center">
                        <p className="text-xs text-gray-400 mb-2">Reveal Progress</p>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                style={{ width: `${(chatData.revealLevel / 5) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500">Keep chatting to unlock more about each other!</p>
                    </div>
                )}

                <div className="space-y-3">
                    {messages.map((message) => {
                        const isOwn = message.senderId === currentUserId;
                        const receiptStatus = isOwn ? getMessageReceiptStatus(message) : null;

                        return (
                            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[75%] ${
                                        isOwn
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl rounded-br-md'
                                            : 'glass rounded-2xl rounded-bl-md'
                                    } px-4 py-2`}
                                >
                                    <p className="text-white whitespace-pre-wrap break-words">{message.text}</p>
                                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                                        <span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>
                                        {isOwn && receiptStatus && (
                                            <span
                                                className={`text-xs ${
                                                    receiptStatus === 'seen'
                                                        ? 'text-blue-400'
                                                        : receiptStatus === 'delivered'
                                                          ? 'text-gray-300'
                                                          : 'text-gray-500'
                                                }`}
                                            >
                                                {receiptStatus === 'sent' ? '✓' : '✓✓'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="glass border-t border-white/10 p-4 sticky bottom-0">
                {isRecipientTyping && (
                    <div className="flex gap-1 items-center mb-2 px-2 animate-in fade-in slide-in-from-bottom-1">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
                            <span
                                className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"
                                style={{ animationDelay: '0.2s' }}
                            ></span>
                            <span
                                className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"
                                style={{ animationDelay: '0.4s' }}
                            ></span>
                        </div>
                        <span className="text-xs text-gray-500">
                            {chatData.isAnonymous ? 'Stranger' : chatData.recipient.name} is typing...
                        </span>
                    </div>
                )}
                <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex gap-3">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={handleTyping}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-lg active:scale-95"
                    >
                        {sending ? '...' : '➤'}
                    </button>
                </form>
            </footer>
        </div>
    );
}
