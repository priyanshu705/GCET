import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from './prisma';
import { verifyPassword } from './auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            campus: string;
            isEmailVerified: boolean;
            isPhoneVerified: boolean;
            isPhotoVerified: boolean;
        };
    }

    interface User {
        id: string;
        email: string;
        name: string;
        campus: string;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
        isPhotoVerified: boolean;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error('No user found with this email');
                }

                const isPasswordValid = await verifyPassword(
                    credentials.password,
                    user.passwordHash
                );

                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                // Check if user is suspended
                if (user.isSuspended) {
                    if (user.suspendedUntil && user.suspendedUntil > new Date()) {
                        throw new Error('Account is temporarily suspended');
                    } else {
                        // Unsuspend the user if suspension period is over
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { isSuspended: false, suspendedUntil: null },
                        });
                    }
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    campus: user.campus,
                    isEmailVerified: user.isEmailVerified,
                    isPhoneVerified: user.isPhoneVerified,
                    isPhotoVerified: user.isPhotoVerified,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/auth/login',
        signOut: '/auth/logout',
        error: '/auth/error',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.campus = user.campus;
                token.isEmailVerified = user.isEmailVerified;
                token.isPhoneVerified = user.isPhoneVerified;
                token.isPhotoVerified = user.isPhotoVerified;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.campus = token.campus as string;
                session.user.isEmailVerified = token.isEmailVerified as boolean;
                session.user.isPhoneVerified = token.isPhoneVerified as boolean;
                session.user.isPhotoVerified = token.isPhotoVerified as boolean;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
