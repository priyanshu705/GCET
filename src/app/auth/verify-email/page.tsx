'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your email...');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        const emailParam = searchParams.get('email');

        if (emailParam) {
            setEmail(emailParam);
        }

        if (!token || !emailParam) {
            setStatus('error');
            setMessage('Invalid verification link. Please check your email for the correct link.');
            return;
        }

        // Verify email
        verifyEmail(emailParam, token);
    }, [searchParams]);

    const verifyEmail = async (email: string, token: string) => {
        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Email verified successfully! Redirecting to profile setup...');

                // Redirect to profile setup after 2 seconds
                setTimeout(() => {
                    router.push('/auth/profile-setup');
                }, 2000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Verification failed. Please try again.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('An error occurred. Please try again.');
        }
    };

    const resendEmail = async () => {
        if (!email) {
            setMessage('Email address not found. Please sign up again.');
            return;
        }

        try {
            setStatus('verifying');
            setMessage('Sending verification email...');

            const response = await fetch(`/api/auth/verify-email?email=${encodeURIComponent(email)}`);
            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Verification email sent! Please check your inbox.');
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to send email. Please try again.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Main content */}
            <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="glass rounded-2xl p-8 space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold gradient-text">Email Verification</h1>
                            <p className="text-gray-400">
                                {status === 'verifying' && 'Please wait while we verify your email...'}
                                {status === 'success' && 'Your email has been verified!'}
                                {status === 'error' && 'Verification failed'}
                            </p>
                        </div>

                        {/* Status Icon */}
                        <div className="flex justify-center">
                            {status === 'verifying' && (
                                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            )}
                            {status === 'success' && (
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Message */}
                        <div className="text-center">
                            <p className="text-white">{message}</p>
                        </div>

                        {/* Actions */}
                        {status === 'error' && (
                            <div className="space-y-3">
                                <button
                                    onClick={resendEmail}
                                    className="w-full px-6 py-3 text-sm font-medium bg-purple-600 hover:bg-purple-700 rounded-full transition-all hover-glow"
                                >
                                    Resend Verification Email
                                </button>
                                <Link href="/auth/signup">
                                    <button className="w-full px-6 py-3 text-sm font-medium glass rounded-full hover:bg-white/10 transition-all">
                                        Back to Sign Up
                                    </button>
                                </Link>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="text-center">
                                <Link href="/auth/profile-setup">
                                    <button className="px-6 py-3 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all hover-glow">
                                        Continue to Profile Setup →
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Help text */}
                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Need help? Contact support at support@gcetcampus.com</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
