import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// GET /api/chat/[chatId] - Get chat messages
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { chatId } = await params;
        const userId = session.user.id;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const before = searchParams.get('before'); // For pagination

        // Verify user is participant
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                participants: { some: { userId } },
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
            },
        });

        if (!chat) {
            return NextResponse.json(
                { error: 'Chat not found or access denied' },
                { status: 404 }
            );
        }

        // Get messages
        const whereClause: any = { chatId };
        if (before) {
            whereClause.createdAt = { lt: new Date(before) };
        }

        const messages = await prisma.message.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                content: true,
                senderId: true,
                isAnonymous: true,
                createdAt: true,
                readAt: true,
            },
        });

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                chatId,
                senderId: { not: userId },
                readAt: null,
            },
            data: { readAt: new Date() },
        });

        // Get other participant info
        const otherParticipant = chat.participants.find(p => p.userId !== userId);
        const myParticipant = chat.participants.find(p => p.userId === userId);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        return NextResponse.json({
            chatId: chat.id,
            isAnonymous: chat.isAnonymous,
            revealLevel: chat.revealLevel,

            recipient: {
                id: otherParticipant?.user.id,
                name: chat.isAnonymous
                    ? otherParticipant?.anonymousName
                    : otherParticipant?.user.name,
                photo: chat.isAnonymous ? null : otherParticipant?.user.photos?.[0],
                isOnline: otherParticipant?.user.lastActive && otherParticipant.user.lastActive > fiveMinutesAgo,
                isVerified: otherParticipant?.user.isPhotoVerified,
            },

            me: {
                anonymousName: myParticipant?.anonymousName,
            },

            messages: messages.reverse(), // Return oldest to newest
            hasMore: messages.length === limit,
        });
    } catch (error) {
        console.error('Get chat messages error:', error);
        return NextResponse.json(
            { error: 'Failed to get messages' },
            { status: 500 }
        );
    }
}
