import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// POST /api/dating/swipe - Record swipe action
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { targetUserId, action } = await request.json();

        if (!targetUserId || !['like', 'dislike', 'superlike'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid request. Required: targetUserId, action (like/dislike/superlike)' },
                { status: 400 }
            );
        }

        const userId = session.user.id;

        // Check if already swiped on this user
        const existingSwipe = await prisma.match.findFirst({
            where: {
                userId,
                matchedUserId: targetUserId,
            },
        });

        if (existingSwipe) {
            return NextResponse.json(
                { error: 'Already swiped on this user' },
                { status: 400 }
            );
        }

        // Create the swipe record
        const match = await prisma.match.create({
            data: {
                userId,
                matchedUserId: targetUserId,
                mode: 'DATING',
                status: action === 'dislike' ? 'REJECTED' : 'PENDING',
                isAnonymous: true,
                revealLevel: 0,
            },
        });

        // Check if it's a mutual match (other person liked you)
        let isMatch = false;
        let chatId = null;

        if (action !== 'dislike') {
            const mutualMatch = await prisma.match.findFirst({
                where: {
                    userId: targetUserId,
                    matchedUserId: userId,
                    status: 'PENDING',
                },
            });

            if (mutualMatch) {
                isMatch = true;

                // Create a chat for the matched users
                const chat = await prisma.chat.create({
                    data: {
                        isAnonymous: true,
                        revealLevel: 0,
                        participants: {
                            create: [
                                {
                                    userId,
                                    anonymousName: `Stranger #${userId.slice(-4).toUpperCase()}`,
                                },
                                {
                                    userId: targetUserId,
                                    anonymousName: `Stranger #${targetUserId.slice(-4).toUpperCase()}`,
                                },
                            ],
                        },
                    },
                });

                chatId = chat.id;

                // Update both matches to ACCEPTED and link to chat
                await prisma.match.update({
                    where: { id: match.id },
                    data: { status: 'ACCEPTED', chatId: chat.id },
                });

                await prisma.match.update({
                    where: { id: mutualMatch.id },
                    data: { status: 'ACCEPTED', chatId: chat.id },
                });
            }
        }

        return NextResponse.json({
            success: true,
            action,
            isMatch,
            chatId,
            message: isMatch
                ? '🎉 It\'s a match! You can now chat.'
                : action === 'superlike'
                    ? '⭐ Super Like sent!'
                    : action === 'like'
                        ? '💚 Liked!'
                        : '👋 Passed',
        });
    } catch (error) {
        console.error('Swipe error:', error);
        return NextResponse.json(
            { error: 'Failed to record swipe' },
            { status: 500 }
        );
    }
}
