import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// GET /api/friends/requests - Get pending friend requests
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

        // Get current user for calculating mutual interests
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { skills: true, clubs: true, interests: true },
        });

        // Get pending requests where current user is the target
        const pendingRequests = await prisma.match.findMany({
            where: {
                matchedUserId: userId,
                mode: 'FRIEND',
                status: 'PENDING',
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
                        interests: true,
                        photos: true,
                        isPhotoVerified: true,
                        lastActive: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const formattedRequests = pendingRequests.map(req => ({
            requestId: req.id,
            createdAt: req.createdAt,
            user: {
                ...req.user,
                mutualSkills: req.user.skills.filter(s => currentUser?.skills.includes(s)),
                mutualClubs: req.user.clubs.filter(c => currentUser?.clubs.includes(c)),
                mutualInterests: req.user.interests.filter(i => currentUser?.interests.includes(i)),
            },
        }));

        return NextResponse.json({
            requests: formattedRequests,
            count: formattedRequests.length,
        });
    } catch (error) {
        console.error('Get requests error:', error);
        return NextResponse.json(
            { error: 'Failed to get requests' },
            { status: 500 }
        );
    }
}
