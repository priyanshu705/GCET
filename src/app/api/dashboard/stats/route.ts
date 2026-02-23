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

        // Get new matches (accepted matches in last 7 days)
        const newMatches = await prisma.match.count({
            where: {
                OR: [
                    { userId: user.id },
                    { matchedUserId: user.id },
                ],
                status: 'ACCEPTED',
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
        });

        // Get unread messages
        const unreadMessages = await prisma.message.count({
            where: {
                chat: {
                    participants: {
                        some: { userId: user.id },
                    },
                },
                senderId: { not: user.id },
                readAt: null,
            },
        });

        // Get pending friend requests (where user is the matched user and status is pending)
        const friendRequests = await prisma.match.count({
            where: {
                matchedUserId: user.id,
                mode: 'FRIEND',
                status: 'PENDING',
            },
        });

        // Get profile views (approximate - count of times user appeared in discover)
        const profileViews = 0; // Would need a separate tracking table for this

        return NextResponse.json({
            newMatches,
            unreadMessages,
            friendRequests,
            profileViews,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
