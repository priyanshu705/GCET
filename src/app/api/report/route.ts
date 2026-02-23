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
        const { reportedUserId, reason, description, chatId } = body;

        if (!reportedUserId || !reason) {
            return NextResponse.json(
                { error: 'Reported user ID and reason are required' },
                { status: 400 }
            );
        }

        // Create the report
        const report = await prisma.report.create({
            data: {
                reporterId: session.user.id,
                reportedUserId,
                reason,
                description,
                chatId,
            },
        });

        // Increment the user's report count
        await prisma.user.update({
            where: { id: reportedUserId },
            data: {
                reportCount: { increment: 1 },
            },
        });

        return NextResponse.json(
            { message: 'Report submitted successfully', reportId: report.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Report submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
