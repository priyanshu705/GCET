import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/nextauth';

export async function POST(request: NextRequest) {
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
            age,
            gender,
            department,
            year,
            currentMode,
            relationshipGoals,
            personalityType,
            skills,
            clubs,
            studyInterests,
            interests,
            seekingGender,
            ageRangeMin,
            ageRangeMax,
            allowCrossCampus,
            onlyVerifiedUsers,
        } = body;

        // Validate required fields
        if (!name || !age || !gender || !department || !year || !currentMode) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (age < 18 || age > 30) {
            return NextResponse.json(
                { error: 'Age must be between 18 and 30' },
                { status: 400 }
            );
        }

        if (!seekingGender || seekingGender.length === 0) {
            return NextResponse.json(
                { error: 'Please select at least one gender preference' },
                { status: 400 }
            );
        }

        // Update user profile
        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name,
                age,
                gender,
                department,
                year,
                currentMode,
                relationshipGoals,
                personalityType,
                skills: skills || [],
                clubs: clubs || [],
                studyInterests: studyInterests || [],
                interests: interests || [],
                seekingGender,
                ageRangeMin: ageRangeMin || 18,
                ageRangeMax: ageRangeMax || 30,
                allowCrossCampus: allowCrossCampus || false,
                onlyVerifiedUsers: onlyVerifiedUsers || false,
            },
        });

        return NextResponse.json(
            {
                message: 'Profile updated successfully',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Profile setup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
