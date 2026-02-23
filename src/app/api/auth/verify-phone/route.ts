import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// In production, you'd store OTPs in Redis or a database table
// For now, we'll use a simple in-memory store (not production-ready)
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, otp } = body;

        if (!phone || !otp) {
            return NextResponse.json(
                { error: 'Phone and OTP are required' },
                { status: 400 }
            );
        }

        // Check OTP
        const storedOTP = otpStore.get(phone);
        if (!storedOTP) {
            return NextResponse.json(
                { error: 'OTP not found or expired' },
                { status: 400 }
            );
        }

        if (storedOTP.expiresAt < new Date()) {
            otpStore.delete(phone);
            return NextResponse.json(
                { error: 'OTP expired. Please request a new one' },
                { status: 400 }
            );
        }

        if (storedOTP.otp !== otp) {
            return NextResponse.json(
                { error: 'Invalid OTP' },
                { status: 400 }
            );
        }

        // Find user and mark phone as verified
        const user = await prisma.user.findUnique({
            where: { phone },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isPhoneVerified: true,
            },
        });

        // Clear OTP
        otpStore.delete(phone);

        return NextResponse.json(
            { message: 'Phone verified successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Phone verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Endpoint to send/resend OTP
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const phone = searchParams.get('phone');

        if (!phone) {
            return NextResponse.json(
                { error: 'Phone number is required' },
                { status: 400 }
            );
        }

        // Generate random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with 10 minute expiry
        otpStore.set(phone, {
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

        // In production, send OTP via SMS service
        console.log(`OTP for ${phone}: ${otp}`);

        return NextResponse.json(
            { message: 'OTP sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
