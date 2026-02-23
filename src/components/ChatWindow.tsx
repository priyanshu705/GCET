'use client';

import { useState, useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';

interface Message {
    id: string;
    content: string;
    senderId: string;
    senderName?: string;
    timestamp: string;
    isRead?: boolean;
}

interface ChatWindowProps {
    chatId: string;
    recipientName: string;
    recipientAvatar?: string;
    isAnonymous?: boolean;
    revealLevel?: number;
    isOnline?: boolean;
    messages: Message[];
    currentUserId: string;
    onSendMessage: (message: string) => void;
    onRequestReveal?: () => void;
}

export default function ChatWindow({
    chatId,
    recipientName,
    recipientAvatar,
    isAnonymous = false,
    revealLevel = 0,
    isOnline = false,
    messages,
    currentUserId,
    onSendMessage,
    onRequestReveal,
}: ChatWindowProps) {
    const [inputMessage, setInputMessage] = useState('');
    const [showEmojiHint, setShowEmojiHint] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const displayName = isAnonymous
        ? `Stranger #${chatId.slice(-4).toUpperCase()}`
        : recipientName;

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (inputMessage.trim()) {
            onSendMessage(inputMessage.trim());
            setInputMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickEmojis = ['👋', '😊', '💕', '🔥', '😂', '❤️', '👍', '✨'];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="glass border-b border-white/10 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                {recipientAvatar && !isAnonymous ? (
                                    <img src={recipientAvatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span className="text-lg">{isAnonymous ? '🎭' : displayName.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            {isOnline && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
                            )}
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">{displayName}</h2>
                            <p className="text-xs text-gray-400">
                                {isOnline ? '🟢 Online' : '⚪ Offline'}
                                {isAnonymous && ` • Level ${revealLevel}/5`}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {isAnonymous && onRequestReveal && revealLevel < 5 && (
                            <button
                                onClick={onRequestReveal}
                                className="px-3 py-1 text-xs bg-purple-600/30 text-purple-300 rounded-full hover:bg-purple-600/50 transition-colors"
                            >
                                🔓 Request Reveal
                            </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Reveal Progress */}
                {isAnonymous && (
                    <div className="mt-2">
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                style={{ width: `${(revealLevel / 5) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {/* Safety Reminder for Anonymous Chats */}
                {isAnonymous && (
                    <div className="text-center mb-4">
                        <div className="inline-block bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2">
                            <p className="text-xs text-yellow-400">
                                🔒 This is an anonymous chat. Keep chatting to unlock reveal levels!
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <ChatBubble
                        key={msg.id}
                        message={msg.content}
                        timestamp={msg.timestamp}
                        isOwn={msg.senderId === currentUserId}
                        senderName={msg.senderName}
                        isAnonymous={isAnonymous}
                        isRead={msg.isRead}
                        showAvatar={idx === 0 || messages[idx - 1]?.senderId !== msg.senderId}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="glass border-t border-white/10 p-3">
                {/* Quick Emojis */}
                {showEmojiHint && (
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                        {quickEmojis.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => setInputMessage(prev => prev + emoji)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-end gap-2">
                    {/* Emoji Toggle */}
                    <button
                        onClick={() => setShowEmojiHint(!showEmojiHint)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        😊
                    </button>

                    {/* Input */}
                    <div className="flex-1 relative">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500 transition-colors"
                            style={{ maxHeight: '120px' }}
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={!inputMessage.trim()}
                        className={`p-3 rounded-full transition-all ${inputMessage.trim()
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover-glow'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
