import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// GET /api/notifications - Fetch user notifications
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Get pending matches (people who liked you)
        const pendingMatches = await prisma.match.findMany({
            where: {
                matchedUserId: userId,
                status: 'ACCEPTED',
            },
            include: {
                user: {
                    select: { name: true, photos: true, isPhotoVerified: true },
                },
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
        });

        // Get unread messages
        const unreadMessages = await prisma.message.findMany({
            where: {
                chat: {
                    participants: { some: { userId } },
                },
                senderId: { not: userId },
                readAt: null,
            },
            include: {
                sender: { select: { name: true } },
                chat: { select: { id: true, isAnonymous: true } },
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
        });

        // Get group invites (members in groups you're admin of)
        const groupActivity = await prisma.groupMember.findMany({
            where: {
                group: {
                    creatorId: userId,
                },
                userId: { not: userId },
            },
            include: {
                user: { select: { name: true } },
                group: { select: { name: true } },
            },
            take: 3,
            orderBy: { joinedAt: 'desc' },
        });

        // Format notifications
        const notifications = [
            ...pendingMatches.map(m => ({
                id: `match-${m.id}`,
                type: 'match' as const,
                title: 'New Match!',
                message: `You matched with someone!`,
                icon: '💕',
                read: false,
                createdAt: m.createdAt,
                link: '/dating/matches',
            })),
            ...unreadMessages.map(m => ({
                id: `msg-${m.id}`,
                type: 'message' as const,
                title: 'New Message',
                message: m.chat.isAnonymous ? 'You have a new message' : `Message from ${m.sender.name}`,
                icon: '💬',
                read: false,
                createdAt: m.createdAt,
                link: `/chat/${m.chat.id}`,
            })),
            ...groupActivity.map(g => ({
                id: `group-${g.id}`,
                type: 'group' as const,
                title: 'New Member',
                message: `${g.user.name} joined ${g.group.name}`,
                icon: '👥',
                read: true,
                createdAt: g.joinedAt,
                link: '/groups',
            })),
        ];

        // Sort by date
        notifications.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const unreadCount = notifications.filter(n => !n.read).length;

        return NextResponse.json({
            notifications: notifications.slice(0, 10),
            unreadCount,
        });
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Mark all messages as read for this user's chats
        await prisma.message.updateMany({
            where: {
                chat: {
                    participants: { some: { userId } },
                },
                senderId: { not: userId },
                readAt: null,
            },
            data: {
                readAt: new Date(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to mark notifications as read:', error);
        return NextResponse.json(
            { error: 'Failed to update notifications' },
            { status: 500 }
        );
    }
}
