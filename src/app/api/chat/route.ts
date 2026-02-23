import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// GET /api/chat - List all conversations
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Get all chats where user is a participant
        const chats = await prisma.chat.findMany({
            where: {
                participants: {
                    some: { userId },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                photos: true,
                                lastActive: true,
                                isPhotoVerified: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                match: {
                    select: {
                        mode: true,
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // Count unread messages
        const unreadCounts = await Promise.all(
            chats.map(async (chat) => {
                const count = await prisma.message.count({
                    where: {
                        chatId: chat.id,
                        senderId: { not: userId },
                        readAt: null,
                    },
                });
                return { chatId: chat.id, count };
            })
        );

        const formattedChats = chats.map(chat => {
            const otherParticipant = chat.participants.find(p => p.userId !== userId);
            const otherUser = otherParticipant?.user;
            const unread = unreadCounts.find(u => u.chatId === chat.id)?.count || 0;
            const isOnline = otherUser && otherUser.lastActive > fiveMinutesAgo;

            return {
                id: chat.id,
                isAnonymous: chat.isAnonymous,
                revealLevel: chat.revealLevel,
                mode: chat.match?.mode || 'FRIEND',

                // Recipient info
                recipient: {
                    id: otherUser?.id,
                    name: chat.isAnonymous
                        ? otherParticipant?.anonymousName || `Stranger #${otherUser?.id.slice(-4).toUpperCase()}`
                        : otherUser?.name,
                    photo: chat.isAnonymous ? null : otherUser?.photos?.[0] || null,
                    isOnline,
                    isVerified: otherUser?.isPhotoVerified,
                },

                // Last message
                lastMessage: chat.messages[0] ? {
                    content: chat.messages[0].content,
                    time: chat.messages[0].createdAt,
                    isOwn: chat.messages[0].senderId === userId,
                } : null,

                unreadCount: unread,
                updatedAt: chat.updatedAt,
            };
        });

        return NextResponse.json({
            chats: formattedChats,
            count: formattedChats.length,
            totalUnread: unreadCounts.reduce((sum, u) => sum + u.count, 0),
        });
    } catch (error) {
        console.error('Get chats error:', error);
        return NextResponse.json(
            { error: 'Failed to get chats' },
            { status: 500 }
        );
    }
}
