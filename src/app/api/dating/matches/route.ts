import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// GET /api/dating/matches - Get all matches
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

        // Get all accepted matches
        const matches = await prisma.match.findMany({
            where: {
                OR: [
                    { userId, status: 'ACCEPTED' },
                    { matchedUserId: userId, status: 'ACCEPTED' },
                ],
                mode: 'DATING',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        age: true,
                        campus: true,
                        department: true,
                        bio: true,
                        interests: true,
                        photos: true,
                        isPhotoVerified: true,
                    },
                },
                matchedUser: {
                    select: {
                        id: true,
                        name: true,
                        age: true,
                        campus: true,
                        department: true,
                        bio: true,
                        interests: true,
                        photos: true,
                        isPhotoVerified: true,
                    },
                },
                chat: {
                    include: {
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            select: {
                                content: true,
                                createdAt: true,
                                senderId: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Format response with appropriate data based on reveal level
        const formattedMatches = matches.map(match => {
            const otherUser = match.userId === userId ? match.matchedUser : match.user;
            const revealLevel = match.chat?.revealLevel || 0;

            // Progressive reveal based on level
            // Level 0: Anonymous (just interests)
            // Level 1: Bio revealed
            // Level 2: Age revealed
            // Level 3: Name revealed
            // Level 4: Photos revealed
            // Level 5: Full profile

            return {
                matchId: match.id,
                chatId: match.chatId,
                createdAt: match.createdAt,
                revealLevel,
                isNew: !match.chat?.messages?.length,

                // Revealed data based on level
                user: {
                    id: otherUser.id,
                    anonymousName: `Stranger #${otherUser.id.slice(-4).toUpperCase()}`,
                    campus: otherUser.campus,
                    interests: otherUser.interests,
                    isVerified: otherUser.isPhotoVerified,

                    // Progressive reveals
                    bio: revealLevel >= 1 ? otherUser.bio : null,
                    age: revealLevel >= 2 ? otherUser.age : null,
                    name: revealLevel >= 3 ? otherUser.name : null,
                    photos: revealLevel >= 4 ? otherUser.photos : [],
                    department: revealLevel >= 5 ? otherUser.department : null,
                },

                // Last message preview
                lastMessage: match.chat?.messages?.[0] ? {
                    content: match.chat.messages[0].content.substring(0, 50) +
                        (match.chat.messages[0].content.length > 50 ? '...' : ''),
                    time: match.chat.messages[0].createdAt,
                    isOwn: match.chat.messages[0].senderId === userId,
                } : null,
            };
        });

        return NextResponse.json({
            matches: formattedMatches,
            count: formattedMatches.length,
        });
    } catch (error) {
        console.error('Get matches error:', error);
        return NextResponse.json(
            { error: 'Failed to get matches' },
            { status: 500 }
        );
    }
}
