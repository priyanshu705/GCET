import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/nextauth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get recent activity
        const recentMatches = await prisma.match.findMany({
            where: {
                OR: [
                    { userId: user.id },
                    { matchedUserId: user.id },
                ],
                status: 'ACCEPTED',
            },
            orderBy: { createdAt: 'desc' },
            take: 2,
            select: {
                id: true,
                mode: true,
                createdAt: true,
            },
        });

        const recentMessages = await prisma.message.findMany({
            where: {
                chat: {
                    participants: {
                        some: { userId: user.id },
                    },
                },
                senderId: { not: user.id },
            },
            orderBy: { createdAt: 'desc' },
            take: 2,
            select: {
                id: true,
                createdAt: true,
                chat: {
                    select: {
                        id: true,
                        isAnonymous: true,
                    },
                },
            },
        });

        // Combine and format activity
        const activity = [
            ...recentMatches.map(m => ({
                id: m.id,
                type: m.mode === 'DATING' ? 'match' : 'friend',
                text: m.mode === 'DATING'
                    ? `You matched with someone new!`
                    : `New friend connection!`,
                time: getTimeAgo(m.createdAt),
                icon: m.mode === 'DATING' ? '💕' : '🤝',
            })),
            ...recentMessages.map(m => ({
                id: m.id,
                type: 'message',
                text: m.chat.isAnonymous
                    ? `New message from a stranger`
                    : `You have a new message`,
                time: getTimeAgo(m.createdAt),
                icon: '💬',
            })),
        ].sort((a, b) => 0).slice(0, 4); // Already sorted by time from DB

        return NextResponse.json({ activity });
    } catch (error) {
        console.error('Dashboard activity error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
}
