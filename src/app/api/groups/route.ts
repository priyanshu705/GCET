import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// GET /api/groups - List groups
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
        const type = searchParams.get('type');
        const campus = searchParams.get('campus');
        const joined = searchParams.get('joined'); // 'true' for joined only
        const limit = parseInt(searchParams.get('limit') || '20');

        const userId = session.user.id;

        // Build filter
        const whereClause: any = {};

        if (type && type !== 'All') {
            whereClause.type = type.toUpperCase();
        }

        if (campus && campus !== 'All') {
            whereClause.campus = campus;
        }

        if (joined === 'true') {
            whereClause.members = { some: { userId } };
        }

        const groups = await prisma.group.findMany({
            where: whereClause,
            include: {
                creator: {
                    select: { name: true, isPhotoVerified: true },
                },
                members: {
                    select: { userId: true },
                },
                _count: {
                    select: { members: true },
                },
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        const formattedGroups = groups.map(group => ({
            id: group.id,
            name: group.name,
            description: group.description,
            type: group.type,
            campus: group.campus,
            campusScope: group.campusScope,
            maxMembers: group.maxMembers,
            isPublic: group.isPublic,
            memberCount: group._count.members,
            isJoined: group.members.some(m => m.userId === userId),
            isCreator: group.creatorId === userId,
            creatorName: group.creator.name,
            creatorVerified: group.creator.isPhotoVerified,
            createdAt: group.createdAt,
        }));

        return NextResponse.json({
            groups: formattedGroups,
            count: formattedGroups.length,
        });
    } catch (error) {
        console.error('Get groups error:', error);
        return NextResponse.json(
            { error: 'Failed to get groups' },
            { status: 500 }
        );
    }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name, description, type, campus, isPublic, maxMembers } = await request.json();
        const userId = session.user.id;

        if (!name || !description || !type) {
            return NextResponse.json(
                { error: 'Name, description, and type are required' },
                { status: 400 }
            );
        }

        // Create group with creator as admin member
        const group = await prisma.group.create({
            data: {
                name,
                description,
                type: type.toUpperCase(),
                campus: campus || null,
                campusScope: campus ? 'CAMPUS_SPECIFIC' : 'CROSS_CAMPUS',
                isPublic: isPublic ?? true,
                maxMembers: maxMembers || 50,
                creatorId: userId,
                members: {
                    create: {
                        userId,
                        role: 'ADMIN',
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Group created successfully!',
            group: {
                id: group.id,
                name: group.name,
            },
        });
    } catch (error) {
        console.error('Create group error:', error);
        return NextResponse.json(
            { error: 'Failed to create group' },
            { status: 500 }
        );
    }
}
