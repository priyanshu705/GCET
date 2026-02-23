import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// GET /api/friends/browse - Browse users for friendship
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
        const campus = searchParams.get('campus');
        const skill = searchParams.get('skill');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '20');

        const userId = session.user.id;

        // Get users already connected with
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

        const connectedUserIds = existingConnections.flatMap(c =>
            c.userId === userId ? [c.matchedUserId] : [c.userId]
        );

        // Build filter
        const whereClause: any = {
            id: { notIn: [...connectedUserIds, userId] },
            currentMode: 'FRIEND',
            isSuspended: false,
        };

        if (campus && campus !== 'All') {
            whereClause.campus = campus;
        }

        if (skill) {
            whereClause.skills = { has: skill };
        }

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { skills: { hasSome: [search] } },
                { clubs: { hasSome: [search] } },
            ];
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                campus: true,
                department: true,
                year: true,
                bio: true,
                skills: true,
                clubs: true,
                studyInterests: true,
                photos: true,
                isPhotoVerified: true,
                isEmailVerified: true,
                lastActive: true,
            },
            take: limit,
            orderBy: { lastActive: 'desc' },
        });

        // Calculate mutual interests/skills with current user
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { skills: true, clubs: true, studyInterests: true },
        });

        const usersWithMutual = users.map(user => ({
            ...user,
            mutualSkills: user.skills.filter(s => currentUser?.skills.includes(s)),
            mutualClubs: user.clubs.filter(c => currentUser?.clubs.includes(c)),
            mutualInterests: user.studyInterests.filter(i => currentUser?.studyInterests.includes(i)),
        }));

        return NextResponse.json({
            users: usersWithMutual,
            count: usersWithMutual.length,
        });
    } catch (error) {
        console.error('Browse friends error:', error);
        return NextResponse.json(
            { error: 'Failed to browse users' },
            { status: 500 }
        );
    }
}
