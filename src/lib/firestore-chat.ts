'use client';

import {
    Timestamp,
    arrayUnion,
    collection,
    doc,
    getDoc,
    limit,
    limitToLast,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch,
    type FirestoreError,
    type Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';

type PresenceState = 'online' | 'offline';

interface FirestoreMessageDoc {
    text?: string;
    senderId?: string;
    createdAt?: Timestamp | null;
    deliveredTo?: string[];
    seenBy?: string[];
}

interface FirestoreTypingDoc {
    isTyping?: boolean;
    updatedAt?: Timestamp | null;
}

interface FirestorePresenceDoc {
    state?: PresenceState;
    lastActive?: Timestamp | null;
}

interface FirestoreChatDoc {
    participants?: string[];
    updatedAt?: Timestamp | null;
    lastMessageText?: string;
    lastMessageSenderId?: string;
    lastMessageCreatedAt?: Timestamp | null;
}

export interface ChatMessage {
    id: string;
    text: string;
    senderId: string;
    createdAt: Date | null;
    deliveredTo: string[];
    seenBy: string[];
}

export interface ChatListItem {
    id: string;
    participants: string[];
    updatedAt: Date | null;
    lastMessageText: string | null;
    lastMessageSenderId: string | null;
    lastMessageCreatedAt: Date | null;
}

const chatRef = (chatId: string) => doc(getFirebaseDb(), 'chats', chatId);
const messagesRef = (chatId: string) => collection(getFirebaseDb(), 'chats', chatId, 'messages');
const typingRef = (chatId: string, userId: string) => doc(getFirebaseDb(), 'chats', chatId, 'typing', userId);
const presenceRef = (userId: string) => doc(getFirebaseDb(), 'presence', userId);
const chatsCollectionRef = () => collection(getFirebaseDb(), 'chats');

const normalizeParticipants = (participants: string[]) =>
    [...new Set(participants.filter(Boolean))].sort();

export const ensureChatDocument = async (chatId: string, participants: string[]): Promise<void> => {
    const normalizedParticipants = normalizeParticipants(participants);
    if (normalizedParticipants.length < 2) return;

    const ref = chatRef(chatId);
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
        await updateDoc(ref, {
            updatedAt: serverTimestamp(),
        });
        return;
    }

    await setDoc(ref, {
        participants: normalizedParticipants,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
};

export const sendChatMessage = async (chatId: string, senderId: string, text: string): Promise<void> => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const db = getFirebaseDb();
    const newMessageRef = doc(messagesRef(chatId));
    const batch = writeBatch(db);

    batch.set(newMessageRef, {
        text: trimmedText,
        senderId,
        createdAt: serverTimestamp(),
        deliveredTo: [senderId],
        seenBy: [senderId],
    });

    batch.set(
        chatRef(chatId),
        {
            updatedAt: serverTimestamp(),
            lastMessageText: trimmedText,
            lastMessageSenderId: senderId,
            lastMessageCreatedAt: serverTimestamp(),
        },
        { merge: true }
    );

    await batch.commit();
};

export const listenToMessages = (
    chatId: string,
    onData: (messages: ChatMessage[]) => void,
    onError?: (error: FirestoreError) => void
): Unsubscribe => {
    const messagesQuery = query(messagesRef(chatId), orderBy('createdAt', 'asc'), limitToLast(200));

    return onSnapshot(
        messagesQuery,
        (snapshot) => {
            const mappedMessages: ChatMessage[] = snapshot.docs.map((messageDoc) => {
                const data = messageDoc.data({ serverTimestamps: 'estimate' }) as FirestoreMessageDoc;
                return {
                    id: messageDoc.id,
                    text: data.text ?? '',
                    senderId: data.senderId ?? '',
                    createdAt: data.createdAt ? data.createdAt.toDate() : null,
                    deliveredTo: Array.isArray(data.deliveredTo) ? data.deliveredTo : [],
                    seenBy: Array.isArray(data.seenBy) ? data.seenBy : [],
                };
            });

            onData(mappedMessages);
        },
        onError
    );
};

export const listenToUserChats = (
    userId: string,
    onData: (chats: ChatListItem[]) => void,
    onError?: (error: FirestoreError) => void
): Unsubscribe => {
    const chatsQuery = query(
        chatsCollectionRef(),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc'),
        limit(100)
    );

    return onSnapshot(
        chatsQuery,
        (snapshot) => {
            const chats: ChatListItem[] = snapshot.docs.map((chatDoc) => {
                const data = chatDoc.data({ serverTimestamps: 'estimate' }) as FirestoreChatDoc;
                return {
                    id: chatDoc.id,
                    participants: Array.isArray(data.participants) ? data.participants : [],
                    updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
                    lastMessageText: typeof data.lastMessageText === 'string' ? data.lastMessageText : null,
                    lastMessageSenderId: typeof data.lastMessageSenderId === 'string' ? data.lastMessageSenderId : null,
                    lastMessageCreatedAt: data.lastMessageCreatedAt ? data.lastMessageCreatedAt.toDate() : null,
                };
            });

            onData(chats);
        },
        onError
    );
};

export const acknowledgeMessages = async (
    chatId: string,
    userId: string,
    messageIds: string[],
    markSeen: boolean
): Promise<void> => {
    const uniqueMessageIds = [...new Set(messageIds)];
    if (uniqueMessageIds.length === 0) return;

    const db = getFirebaseDb();
    const batch = writeBatch(db);

    uniqueMessageIds.forEach((messageId) => {
        const ref = doc(getFirebaseDb(), 'chats', chatId, 'messages', messageId);
        if (markSeen) {
            batch.update(ref, {
                deliveredTo: arrayUnion(userId),
                seenBy: arrayUnion(userId),
            });
            return;
        }

        batch.update(ref, {
            deliveredTo: arrayUnion(userId),
        });
    });

    await batch.commit();
};

export const setTypingState = async (chatId: string, userId: string, isTyping: boolean): Promise<void> => {
    await setDoc(
        typingRef(chatId, userId),
        {
            isTyping,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
};

export const listenToTypingState = (
    chatId: string,
    otherUserId: string,
    onData: (isTyping: boolean) => void,
    onError?: (error: FirestoreError) => void
): Unsubscribe =>
    onSnapshot(
        typingRef(chatId, otherUserId),
        (snapshot) => {
            const data = snapshot.data() as FirestoreTypingDoc | undefined;
            const lastUpdate = data?.updatedAt ? data.updatedAt.toDate().getTime() : 0;
            const isFresh = Date.now() - lastUpdate < 10000;
            onData(Boolean(data?.isTyping) && isFresh);
        },
        onError
    );

const updatePresence = async (userId: string, state: PresenceState): Promise<void> => {
    await setDoc(
        presenceRef(userId),
        {
            state,
            lastActive: serverTimestamp(),
            lastChanged: serverTimestamp(),
        },
        { merge: true }
    );
};

export const startPresenceHeartbeat = (userId: string): (() => void) => {
    const markOnline = () => {
        void updatePresence(userId, 'online').catch((error) => {
            console.error('Presence online update failed:', error);
        });
    };

    const markOffline = () => {
        void updatePresence(userId, 'offline').catch((error) => {
            console.error('Presence offline update failed:', error);
        });
    };

    markOnline();

    const heartbeat = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
            markOnline();
        }
    }, 30000);

    const handleVisibility = () => {
        if (document.visibilityState === 'visible') {
            markOnline();
            return;
        }

        markOffline();
    };

    const handleUnload = () => {
        markOffline();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
        window.clearInterval(heartbeat);
        document.removeEventListener('visibilitychange', handleVisibility);
        window.removeEventListener('beforeunload', handleUnload);
        markOffline();
    };
};

export const listenToPresence = (
    userId: string,
    onData: (isOnline: boolean) => void,
    onError?: (error: FirestoreError) => void
): Unsubscribe =>
    onSnapshot(
        presenceRef(userId),
        (snapshot) => {
            const data = snapshot.data() as FirestorePresenceDoc | undefined;
            if (!data) {
                onData(false);
                return;
            }

            const lastActiveMs = data.lastActive ? data.lastActive.toDate().getTime() : 0;
            const activeRecently = Date.now() - lastActiveMs < 90000;
            onData(data.state === 'online' && activeRecently);
        },
        onError
    );
