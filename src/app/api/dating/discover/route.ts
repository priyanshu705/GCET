import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// GET /api/dating/discover - Get potential matches for swiping
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        // Get current user with their preferences
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                campus: true,
                gender: true,
                seekingGender: true,
                ageRangeMin: true,
                ageRangeMax: true,
                allowCrossCampus: true,
                onlyVerifiedUsers: true,
                sentMatches: { select: { matchedUserId: true } },
            },
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get IDs of users already swiped on
        const swipedUserIds = currentUser.sentMatches.map(m => m.matchedUserId);

        // Build filter criteria
        const whereClause: any = {
            id: {
                notIn: [...swipedUserIds, currentUser.id]
            },
            currentMode: 'DATING',
            isSuspended: false,
            age: {
                gte: currentUser.ageRangeMin,
                lte: currentUser.ageRangeMax,
            },
        };

        // Filter by seeking gender
        if (currentUser.seekingGender && currentUser.seekingGender.length > 0) {
            whereClause.gender = { in: currentUser.seekingGender };
        }

        // Campus filter
        if (!currentUser.allowCrossCampus) {
            whereClause.campus = currentUser.campus;
        }

        // Only verified users filter
        if (currentUser.onlyVerifiedUsers) {
            whereClause.isPhotoVerified = true;
        }

        // Fetch potential matches
        const potentialMatches = await prisma.user.findMany({
            where: whereClause,
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
                isEmailVerified: true,
                isPhoneVerified: true,
            },
            take: limit,
            orderBy: { lastActive: 'desc' },
        });

        // For blind dating, we hide personal info initially
        const anonymizedMatches = potentialMatches.map(user => ({
            id: user.id,
            campus: user.campus,
            age: user.age,
            interests: user.interests,
            isVerified: user.isPhotoVerified,
            // Name and photos are hidden until reveal
        }));

        return NextResponse.json({
            profiles: anonymizedMatches,
            count: anonymizedMatches.length,
        });
    } catch (error) {
        console.error('Discover error:', error);
        return NextResponse.json(
            { error: 'Failed to get profiles' },
            { status: 500 }
        );
    }
}
