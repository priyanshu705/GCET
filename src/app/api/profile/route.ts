import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/nextauth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                campus: true,
                age: true,
                gender: true,
                department: true,
                year: true,
                bio: true,
                photos: true,
                interests: true,
                skills: true,
                clubs: true,
                studyInterests: true,
                relationshipGoals: true,
                personalityType: true,
                seekingGender: true,
                ageRangeMin: true,
                ageRangeMax: true,
                currentMode: true,
                allowCrossCampus: true,
                onlyVerifiedUsers: true,
                isEmailVerified: true,
                isPhoneVerified: true,
                isPhotoVerified: true,
                createdAt: true,
                lastActive: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            name,
            bio,
            photos,
            interests,
            skills,
            clubs,
            studyInterests,
            relationshipGoals,
            personalityType,
            seekingGender,
            ageRangeMin,
            ageRangeMax,
            currentMode,
            allowCrossCampus,
            onlyVerifiedUsers,
        } = body;

        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                ...(name && { name }),
                ...(bio !== undefined && { bio }),
                ...(photos && { photos }),
                ...(interests && { interests }),
                ...(skills && { skills }),
                ...(clubs && { clubs }),
                ...(studyInterests && { studyInterests }),
                ...(relationshipGoals && { relationshipGoals }),
                ...(personalityType && { personalityType }),
                ...(seekingGender && { seekingGender }),
                ...(ageRangeMin && { ageRangeMin }),
                ...(ageRangeMax && { ageRangeMax }),
                ...(currentMode && { currentMode }),
                ...(allowCrossCampus !== undefined && { allowCrossCampus }),
                ...(onlyVerifiedUsers !== undefined && { onlyVerifiedUsers }),
                lastActive: new Date(),
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        return NextResponse.json({
            message: 'Profile updated successfully',
            user,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
