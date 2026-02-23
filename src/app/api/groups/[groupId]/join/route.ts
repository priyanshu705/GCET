import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import prisma from '@/lib/prisma';

// POST /api/groups/[groupId]/join - Join or leave a group
export async function POST(
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
        const { action } = await request.json(); // 'join' or 'leave'
        const userId = session.user.id;

        if (!['join', 'leave'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Use: join or leave' },
                { status: 400 }
            );
        }

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                members: { select: { userId: true } },
                _count: { select: { members: true } },
            },
        });

        if (!group) {
            return NextResponse.json(
                { error: 'Group not found' },
                { status: 404 }
            );
        }

        const isMember = group.members.some(m => m.userId === userId);
        const isCreator = group.creatorId === userId;

        if (action === 'join') {
            if (isMember) {
                return NextResponse.json(
                    { error: 'Already a member' },
                    { status: 400 }
                );
            }

            if (group._count.members >= group.maxMembers) {
                return NextResponse.json(
                    { error: 'Group is full' },
                    { status: 400 }
                );
            }

            await prisma.groupMember.create({
                data: {
                    groupId,
                    userId,
                    role: 'MEMBER',
                },
            });

            return NextResponse.json({
                success: true,
                message: `Welcome to ${group.name}! 🎉`,
                isMember: true,
            });
        } else {
            // Leave
            if (!isMember) {
                return NextResponse.json(
                    { error: 'Not a member' },
                    { status: 400 }
                );
            }

            if (isCreator) {
                return NextResponse.json(
                    { error: 'Creators cannot leave. Transfer ownership or delete the group.' },
                    { status: 400 }
                );
            }

            await prisma.groupMember.deleteMany({
                where: {
                    groupId,
                    userId,
                },
            });

            return NextResponse.json({
                success: true,
                message: 'Left the group',
                isMember: false,
            });
        }
    } catch (error) {
        console.error('Join/leave group error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
