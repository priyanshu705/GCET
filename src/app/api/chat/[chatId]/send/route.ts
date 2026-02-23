import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// POST /api/chat/[chatId]/send - Send a message
export async function POST(
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
        const { content } = await request.json();
        const userId = session.user.id;

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Message content is required' },
                { status: 400 }
            );
        }

        // Verify user is participant
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                participants: { some: { userId } },
            },
        });

        if (!chat) {
            return NextResponse.json(
                { error: 'Chat not found or access denied' },
                { status: 404 }
            );
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                chatId,
                senderId: userId,
                content: content.trim(),
                isAnonymous: chat.isAnonymous,
            },
        });

        // Update chat's updatedAt
        await prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() },
        });

        // Update user's lastActive
        await prisma.user.update({
            where: { id: userId },
            data: { lastActive: new Date() },
        });

        return NextResponse.json({
            success: true,
            message: {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                createdAt: message.createdAt,
                isAnonymous: message.isAnonymous,
            },
        });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
