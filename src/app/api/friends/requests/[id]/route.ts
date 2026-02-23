import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// POST /api/friends/requests/[id]/respond - Accept or decline request
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const { action } = await request.json();

        if (!['accept', 'decline'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Use: accept or decline' },
                { status: 400 }
            );
        }

        const userId = session.user.id;

        // Find the request
        const friendRequest = await prisma.match.findFirst({
            where: {
                id,
                matchedUserId: userId,
                mode: 'FRIEND',
                status: 'PENDING',
            },
        });

        if (!friendRequest) {
            return NextResponse.json(
                { error: 'Friend request not found' },
                { status: 404 }
            );
        }

        if (action === 'accept') {
            // Create chat for the new friends
            const chat = await prisma.chat.create({
                data: {
                    isAnonymous: false,
                    revealLevel: 5,
                    participants: {
                        create: [
                            { userId, anonymousName: '' },
                            { userId: friendRequest.userId, anonymousName: '' },
                        ],
                    },
                },
            });

            // Update request to accepted
            await prisma.match.update({
                where: { id },
                data: {
                    status: 'ACCEPTED',
                    chatId: chat.id,
                },
            });

            return NextResponse.json({
                success: true,
                message: '🎉 Friend request accepted!',
                chatId: chat.id,
            });
        } else {
            // Decline - update status
            await prisma.match.update({
                where: { id },
                data: { status: 'REJECTED' },
            });

            return NextResponse.json({
                success: true,
                message: 'Request declined',
            });
        }
    } catch (error) {
        console.error('Respond to request error:', error);
        return NextResponse.json(
            { error: 'Failed to respond to request' },
            { status: 500 }
        );
    }
}
