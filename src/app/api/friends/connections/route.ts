import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// GET /api/friends/connections - Get all friends
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

        // Get all accepted friend connections
        const connections = await prisma.match.findMany({
            where: {
                OR: [
                    { userId, status: 'ACCEPTED', mode: 'FRIEND' },
                    { matchedUserId: userId, status: 'ACCEPTED', mode: 'FRIEND' },
                ],
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        campus: true,
                        department: true,
                        year: true,
                        bio: true,
                        skills: true,
                        clubs: true,
                        photos: true,
                        isPhotoVerified: true,
                        lastActive: true,
                    },
                },
                matchedUser: {
                    select: {
                        id: true,
                        name: true,
                        campus: true,
                        department: true,
                        year: true,
                        bio: true,
                        skills: true,
                        clubs: true,
                        photos: true,
                        isPhotoVerified: true,
                        lastActive: true,
                    },
                },
                chat: {
                    include: {
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            select: { content: true, createdAt: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Check which users are "online" (active in last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const formattedConnections = connections.map(conn => {
            const friend = conn.userId === userId ? conn.matchedUser : conn.user;
            const isOnline = friend.lastActive > fiveMinutesAgo;

            return {
                connectionId: conn.id,
                chatId: conn.chatId,
                connectedAt: conn.createdAt,
                friend: {
                    ...friend,
                    isOnline,
                    lastActiveFormatted: isOnline
                        ? 'Online'
                        : formatLastActive(friend.lastActive),
                },
                lastMessage: conn.chat?.messages?.[0] || null,
            };
        });

        return NextResponse.json({
            connections: formattedConnections,
            count: formattedConnections.length,
        });
    } catch (error) {
        console.error('Get connections error:', error);
        return NextResponse.json(
            { error: 'Failed to get connections' },
            { status: 500 }
        );
    }
}

function formatLastActive(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
