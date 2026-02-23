import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/verification';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, token } = body;

        if (!email || !token) {
            return NextResponse.json(
                { error: 'Email and token are required' },
                { status: 400 }
            );
        }

        // Find user with matching email and token
        const user = await prisma.user.findFirst({
            where: {
                email,
                verificationToken: token,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid verification link' },
                { status: 400 }
            );
        }

        // Mark email as verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                verificationToken: null, // Clear the token
            },
        });

        return NextResponse.json(
            { message: 'Email verified successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET: Send/resend verification email
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (user.isEmailVerified) {
            return NextResponse.json(
                { message: 'Email already verified' },
                { status: 200 }
            );
        }

        // Generate verification token
        const token = generateVerificationToken();

        // Update user with token
        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken: token },
        });

        // Send verification email
        await sendVerificationEmail(email, token);

        return NextResponse.json(
            { message: 'Verification email sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Send verification email error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

