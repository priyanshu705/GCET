import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// GET /api/groups/[groupId]/chat - Get group messages
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ groupId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { groupId } = await params;
        const userId = session.user.id;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const before = searchParams.get('before'); // For pagination

        // Verify user is a member
        const membership = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: { groupId, userId },
            },
        });

        if (!membership) {
            return NextResponse.json(
                { error: 'You must be a member to view chat' },
                { status: 403 }
            );
        }

        // For now, we'll simulate group messages since we don't have a GroupMessage model
        // In a real implementation, you'd have a GroupMessage model
        const messages: any[] = [];

        return NextResponse.json({
            messages,
            hasMore: false,
        });
    } catch (error) {
        console.error('Get group chat error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// POST /api/groups/[groupId]/chat - Send message to group
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ groupId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { groupId } = await params;
        const { content } = await request.json();
        const userId = session.user.id;

        if (!content?.trim()) {
            return NextResponse.json(
                { error: 'Message content is required' },
                { status: 400 }
            );
        }

        // Verify user is a member
        const membership = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: { groupId, userId },
            },
        });

        if (!membership) {
            return NextResponse.json(
                { error: 'You must be a member to send messages' },
                { status: 403 }
            );
        }

        // In a real implementation, you'd create a GroupMessage record
        // For now, return success
        return NextResponse.json({
            success: true,
            message: {
                id: Math.random().toString(36).slice(2),
                content,
                senderId: userId,
                senderName: session.user.name,
                createdAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Send group message error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
