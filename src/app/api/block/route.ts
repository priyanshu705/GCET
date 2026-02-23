import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { blockedUserId } = body;

        if (!blockedUserId) {
            return NextResponse.json(
                { error: 'Blocked user ID is required' },
                { status: 400 }
            );
        }

        // We use the Match model to handle blocking (updating status to BLOCKED)
        // Check if a match already exists
        const existingMatch = await prisma.match.findFirst({
            where: {
                OR: [
                    { userId: session.user.id, matchedUserId: blockedUserId },
                    { userId: blockedUserId, matchedUserId: session.user.id },
                ],
            },
        });

        if (existingMatch) {
            await prisma.match.update({
                where: { id: existingMatch.id },
                data: { status: 'BLOCKED' },
            });
        } else {
            // Create a blocked "match" to prevent future interactions
            await prisma.match.create({
                data: {
                    userId: session.user.id,
                    matchedUserId: blockedUserId,
                    mode: 'FRIEND', // Default mode
                    status: 'BLOCKED',
                },
            });
        }

        return NextResponse.json(
            { message: 'User blocked successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Block user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
