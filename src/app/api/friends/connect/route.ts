import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// POST /api/friends/connect - Send friend request
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { targetUserId } = await request.json();

        if (!targetUserId) {
            return NextResponse.json(
                { error: 'targetUserId is required' },
                { status: 400 }
            );
        }

        const userId = session.user.id;

        // Check if already connected or pending
        const existingConnection = await prisma.match.findFirst({
            where: {
                OR: [
                    { userId, matchedUserId: targetUserId, mode: 'FRIEND' },
                    { userId: targetUserId, matchedUserId: userId, mode: 'FRIEND' },
                ],
            },
        });

        if (existingConnection) {
            if (existingConnection.status === 'ACCEPTED') {
                return NextResponse.json(
                    { error: 'Already friends' },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { error: 'Connection request already exists' },
                { status: 400 }
            );
        }

        // Create friend request
        const friendRequest = await prisma.match.create({
            data: {
                userId,
                matchedUserId: targetUserId,
                mode: 'FRIEND',
                status: 'PENDING',
                isAnonymous: false,
                revealLevel: 5, // Full reveal for friends
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Friend request sent!',
            requestId: friendRequest.id,
        });
    } catch (error) {
        console.error('Connect error:', error);
        return NextResponse.json(
            { error: 'Failed to send request' },
            { status: 500 }
        );
    }
}
