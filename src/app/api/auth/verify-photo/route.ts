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
        const { selfieUrl } = body;

        if (!selfieUrl) {
            return NextResponse.json(
                { error: 'Selfie URL is required' },
                { status: 400 }
            );
        }

        // In a real app, this would trigger an admin review or AI verification
        // For now, we'll mark it as verified for demonstration
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                verificationSelfie: selfieUrl,
                isPhotoVerified: true,
            },
        });

        return NextResponse.json(
            { message: 'Photo verification request submitted' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Photo verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
