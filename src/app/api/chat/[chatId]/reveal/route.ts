import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// POST /api/chat/[chatId]/reveal - Request or accept reveal level increase
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
        const userId = session.user.id;

        // Verify user is participant and chat is anonymous
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                participants: { some: { userId } },
                isAnonymous: true,
            },
            include: {
                participants: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });

        if (!chat) {
            return NextResponse.json(
                { error: 'Chat not found, not anonymous, or access denied' },
                { status: 404 }
            );
        }

        const currentLevel = chat.revealLevel;
        const maxLevel = 5;

        if (currentLevel >= maxLevel) {
            // Fully revealed, convert to non-anonymous
            await prisma.chat.update({
                where: { id: chatId },
                data: {
                    isAnonymous: false,
                    revealLevel: maxLevel,
                },
            });

            return NextResponse.json({
                success: true,
                message: '🎉 Fully revealed! You can now see each other\'s complete profiles.',
                newLevel: maxLevel,
                isFullyRevealed: true,
            });
        }

        // Calculate reveal requirements based on message count
        const messageCount = await prisma.message.count({
            where: { chatId },
        });

        const requiredMessages: Record<number, number> = {
            0: 10,  // Level 0 -> 1: 10 messages
            1: 25,  // Level 1 -> 2: 25 messages
            2: 50,  // Level 2 -> 3: 50 messages
            3: 75,  // Level 3 -> 4: 75 messages
            4: 100, // Level 4 -> 5: 100 messages
        };

        const required = requiredMessages[currentLevel] || 10;

        if (messageCount < required) {
            return NextResponse.json({
                success: false,
                message: `Keep chatting! ${required - messageCount} more messages needed for next reveal.`,
                currentLevel,
                required,
                current: messageCount,
            });
        }

        // Increase reveal level
        const newLevel = currentLevel + 1;
        await prisma.chat.update({
            where: { id: chatId },
            data: { revealLevel: newLevel },
        });

        // Also update the associated match
        await prisma.match.updateMany({
            where: { chatId },
            data: { revealLevel: newLevel },
        });

        const revealDescriptions: Record<number, string> = {
            1: '🎭 Bio revealed!',
            2: '🎂 Age revealed!',
            3: '📛 Name revealed!',
            4: '📸 Photos revealed!',
            5: '🎉 Full profile revealed!',
        };

        return NextResponse.json({
            success: true,
            message: revealDescriptions[newLevel] || 'Reveal level increased!',
            newLevel,
            isFullyRevealed: newLevel >= maxLevel,
        });
    } catch (error) {
        console.error('Reveal error:', error);
        return NextResponse.json(
            { error: 'Failed to process reveal' },
            { status: 500 }
        );
    }
}
