import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// GET /api/friends/suggestions - Get friend suggestions
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Get current user's info for matching
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                campus: true,
                department: true,
                year: true,
                interests: true,
                skills: true,
                studyInterests: true,
            },
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find users with similar attributes, excluding already connected users
        const existingConnections = await prisma.match.findMany({
            where: {
                OR: [
                    { userId, mode: 'FRIEND' },
                    { matchedUserId: userId, mode: 'FRIEND' },
                ],
            },
            select: {
                userId: true,
                matchedUserId: true,
            },
        });

        const connectedIds = new Set([
            userId,
            ...existingConnections.map(c => c.userId),
            ...existingConnections.map(c => c.matchedUserId),
        ]);

        // Get suggestions prioritizing same campus, department, and shared interests
        const suggestions = await prisma.user.findMany({
            where: {
                id: { notIn: Array.from(connectedIds) },
                isSuspended: false,
            },
            select: {
                id: true,
                name: true,
                campus: true,
                department: true,
                year: true,
                interests: true,
                skills: true,
                photos: true,
                isPhotoVerified: true,
                lastActive: true,
                bio: true,
            },
            take: 20,
        });

        // Score and sort suggestions
        const scoredSuggestions = suggestions.map(user => {
            let score = 0;
            const reasons: string[] = [];

            // Same campus
            if (user.campus === currentUser.campus) {
                score += 20;
                reasons.push('Same campus');
            }

            // Same department
            if (user.department && user.department === currentUser.department) {
                score += 15;
                reasons.push('Same department');
            }

            // Same year
            if (user.year && user.year === currentUser.year) {
                score += 10;
                reasons.push('Same year');
            }

            // Shared interests
            const sharedInterests = user.interests.filter(i =>
                currentUser.interests.some(ci => ci.toLowerCase() === i.toLowerCase())
            );
            score += sharedInterests.length * 5;
            if (sharedInterests.length > 0) {
                reasons.push(`${sharedInterests.length} shared interests`);
            }

            // Shared skills
            const sharedSkills = user.skills.filter(s =>
                currentUser.skills.some(cs => cs.toLowerCase() === s.toLowerCase())
            );
            score += sharedSkills.length * 5;
            if (sharedSkills.length > 0) {
                reasons.push(`${sharedSkills.length} shared skills`);
            }

            // Verified boost
            if (user.isPhotoVerified) {
                score += 5;
            }

            // Recently active boost
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const isOnline = user.lastActive > fiveMinutesAgo;

            return {
                id: user.id,
                name: user.name,
                campus: user.campus,
                department: user.department,
                year: user.year,
                interests: user.interests.slice(0, 5),
                photo: user.photos[0] || null,
                isVerified: user.isPhotoVerified,
                isOnline,
                bio: user.bio,
                score,
                matchReasons: reasons.slice(0, 3),
                sharedInterests,
            };
        });

        // Sort by score descending
        scoredSuggestions.sort((a, b) => b.score - a.score);

        return NextResponse.json({
            suggestions: scoredSuggestions.slice(0, 10),
        });
    } catch (error) {
        console.error('Friend suggestions error:', error);
        return NextResponse.json(
            { error: 'Failed to get suggestions' },
            { status: 500 }
        );
    }
}
