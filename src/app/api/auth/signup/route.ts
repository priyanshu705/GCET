import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateVerificationToken, isValidEmail, isValidPhone, validatePassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/verification';
import { Campus, Gender } from '@/generated/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, phone, campus, name, age, gender } = body;

        // Validate required fields
        if (!email || !password || !phone || !campus || !name || !age || !gender) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate phone format
        if (!isValidPhone(phone)) {
            return NextResponse.json(
                { error: 'Invalid phone number. Must be a 10-digit Indian mobile number' },
                { status: 400 }
            );
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { error: passwordValidation.errors.join(', ') },
                { status: 400 }
            );
        }

        // Note: College email is optional - any valid email works
        // Users with college emails get a verification badge bonus

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone }],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email or phone already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                phone,
                passwordHash,
                campus: campus as Campus,
                name,
                age: parseInt(age),
                gender: gender as Gender,
                verificationToken,
                seekingGender: [], // Will be set during profile setup
                interests: [],
                skills: [],
                clubs: [],
                studyInterests: [],
                photos: [],
            },
        });

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        return NextResponse.json({
            message: 'User created successfully. Please verify your email.',
            token: verificationToken,
            userId: user.id,
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Failed to create account. Please try again.' },
            { status: 500 }
        );
    }
}
