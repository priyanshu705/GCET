import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// GET /api/groups/[groupId] - Get group details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ groupId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { groupId } = await params;
        const userId = session.user.id;
        const { searchParams } = new URL(request.url);
        const includeMessages = searchParams.get('messages') === 'true';
        const messageLimit = parseInt(searchParams.get('messageLimit') || '50');

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                creator: {
                    select: { id: true, name: true, isPhotoVerified: true },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                photos: true,
                                isPhotoVerified: true,
                                lastActive: true,
                            },
                        },
                    },
                    orderBy: { joinedAt: 'asc' },
                },
            },
        });

        if (!group) {
            return NextResponse.json(
                { error: 'Group not found' },
                { status: 404 }
            );
        }

        const isMember = group.members.some(m => m.userId === userId);
        const myMembership = group.members.find(m => m.userId === userId);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const formattedMembers = group.members.map(member => ({
            id: member.userId,
            name: member.user.name,
            photo: member.user.photos?.[0] || null,
            role: member.role,
            isVerified: member.user.isPhotoVerified,
            isOnline: member.user.lastActive > fiveMinutesAgo,
            joinedAt: member.joinedAt,
        }));

        return NextResponse.json({
            id: group.id,
            name: group.name,
            description: group.description,
            type: group.type,
            campus: group.campus,
            campusScope: group.campusScope,
            maxMembers: group.maxMembers,
            isPublic: group.isPublic,
            createdAt: group.createdAt,

            creator: group.creator,
            memberCount: group.members.length,
            members: formattedMembers,

            isMember,
            isCreator: group.creatorId === userId,
            isAdmin: myMembership?.role === 'ADMIN' || myMembership?.role === 'MODERATOR',
            myRole: myMembership?.role || null,
        });
    } catch (error) {
        console.error('Get group error:', error);
        return NextResponse.json(
            { error: 'Failed to get group' },
            { status: 500 }
        );
    }
}
