'use client';

interface ChatBubbleProps {
    message: string;
    timestamp: string;
    isOwn: boolean;
    senderName?: string;
    isAnonymous?: boolean;
    isRead?: boolean;
    showAvatar?: boolean;
}

export default function ChatBubble({
    message,
    timestamp,
    isOwn,
    senderName,
    isAnonymous = false,
    isRead = false,
    showAvatar = false,
}: ChatBubbleProps) {
    return (
        <div className={`flex gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            {showAvatar && (
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isOwn
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}>
                    <span className="text-sm">{isAnonymous ? '🎭' : (senderName?.charAt(0).toUpperCase() || '?')}</span>
                </div>
            )}

            <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {/* Sender Name (for group chats or when showing) */}
                {!isOwn && senderName && (
                    <p className="text-xs text-gray-500 mb-1 ml-1">
                        {isAnonymous ? `Stranger #${senderName.slice(-4).toUpperCase()}` : senderName}
                    </p>
                )}

                {/* Message Bubble */}
                <div className={`px-4 py-2 rounded-2xl ${isOwn
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
                        : 'glass text-gray-200 rounded-bl-md'
                    }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
                </div>

                {/* Timestamp & Read Receipt */}
                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-500">{timestamp}</span>
                    {isOwn && (
                        <span className={`text-xs ${isRead ? 'text-blue-400' : 'text-gray-500'}`}>
                            {isRead ? '✓✓' : '✓'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
