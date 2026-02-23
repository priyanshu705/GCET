'use client';

import { useState, useRef, KeyboardEvent, ClipboardEvent, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { getFirebaseAuth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
        confirmationResult: ConfirmationResult;
    }
}

export default function VerifyPhonePage() {
    const router = useRouter();
    const firebaseAuth = useMemo(() => getFirebaseAuth(), []);
    const { data: session, update: updateSession } = useSession();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [otpSent, setOtpSent] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const recaptchaRef = useRef<HTMLDivElement>(null);

    // Initialize reCAPTCHA when component mounts
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
                    size: 'invisible',
                    callback: () => {
                        console.log('reCAPTCHA verified');
                    },
                    'expired-callback': () => {
                        setError('reCAPTCHA expired. Please try again.');
                    }
                });
            } catch (err) {
                console.error('reCAPTCHA initialization error:', err);
            }
        }
    }, [firebaseAuth]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value.slice(0, 1);
        }

        if (!/^\d*$/.test(value)) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all fields are filled
        if (index === 5 && value && newOtp.every(digit => digit)) {
            verifyOTP(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);

        if (!/^\d+$/.test(pastedData)) {
            return;
        }

        const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
        setOtp(newOtp);

        // Focus last filled input
        const lastIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastIndex]?.focus();

        // Auto-submit if complete
        if (pastedData.length === 6) {
            verifyOTP(pastedData);
        }
    };

    const formatPhoneForFirebase = (phone: string): string => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `+91${cleaned}`;
        } else if (cleaned.startsWith('91') && cleaned.length === 12) {
            return `+${cleaned}`;
        }
        return `+91${cleaned}`;
    };

    const sendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const formattedPhone = formatPhoneForFirebase(phoneNumber);

            if (!window.recaptchaVerifier) {
                setError('reCAPTCHA not initialized. Please refresh the page.');
                return;
            }

            const confirmationResult = await signInWithPhoneNumber(
                firebaseAuth,
                formattedPhone,
                window.recaptchaVerifier
            );

            window.confirmationResult = confirmationResult;
            setOtpSent(true);
            setSuccess('OTP sent successfully! Check your phone.');
            startCountdown();

            // Focus first OTP input
            setTimeout(() => inputRefs.current[0]?.focus(), 100);

        } catch (err: unknown) {
            console.error('Send OTP error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';

            if (errorMessage.includes('too-many-requests')) {
                setError('Too many attempts. Please try again later.');
            } else if (errorMessage.includes('invalid-phone-number')) {
                setError('Invalid phone number format.');
            } else {
                setError(errorMessage);
            }

            // Reset reCAPTCHA on error
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
                    size: 'invisible',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async (otpCode: string) => {
        if (!window.confirmationResult) {
            setError('Please send OTP first');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Verify OTP with Firebase
            await window.confirmationResult.confirm(otpCode);

            // Update phone verification in database
            const response = await fetch('/api/auth/verify-phone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: phoneNumber,
                    verified: true
                }),
            });

            if (response.ok) {
                setSuccess('Phone verified successfully! Redirecting...');
                await updateSession();
                setTimeout(() => {
                    router.push('/auth/profile-setup');
                }, 2000);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to update verification status');
            }
        } catch (err: unknown) {
            console.error('Verify OTP error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Invalid OTP';

            if (errorMessage.includes('invalid-verification-code')) {
                setError('Invalid OTP. Please try again.');
            } else {
                setError(errorMessage);
            }

            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const startCountdown = () => {
        setCountdown(60);
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const clearOTP = () => {
        setOtp(['', '', '', '', '', '']);
        setError('');
        setSuccess('');
        inputRefs.current[0]?.focus();
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Invisible reCAPTCHA container */}
            <div id="recaptcha-container" ref={recaptchaRef}></div>

            {/* Main content */}
            <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="glass rounded-2xl p-8 space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold gradient-text">Phone Verification</h1>
                            <p className="text-gray-400">
                                {otpSent
                                    ? 'Enter the 6-digit code sent to your phone'
                                    : 'Enter your phone number to receive OTP'}
                            </p>
                        </div>

                        {!otpSent ? (
                            /* Phone Number Input */
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <div className="flex items-center px-4 bg-white/5 border-2 border-white/10 rounded-lg text-gray-400">
                                        +91
                                    </div>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="Enter 10-digit number"
                                        className="flex-1 px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                                        disabled={loading}
                                    />
                                </div>

                                <button
                                    onClick={sendOTP}
                                    disabled={loading || phoneNumber.length !== 10}
                                    className="w-full px-6 py-3 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </div>
                        ) : (
                            /* OTP Input */
                            <div className="space-y-4">
                                <p className="text-center text-white font-medium">
                                    OTP sent to +91 {phoneNumber.slice(0, 2)}****{phoneNumber.slice(-4)}
                                </p>

                                <div className="flex gap-2 justify-center">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={el => { inputRefs.current[index] = el }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={e => handleOtpChange(index, e.target.value)}
                                            onKeyDown={e => handleKeyDown(index, e)}
                                            onPaste={handlePaste}
                                            className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border-2 border-white/10 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                                            disabled={loading}
                                        />
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => verifyOTP(otp.join(''))}
                                        disabled={loading || otp.some(d => !d)}
                                        className="w-full px-6 py-3 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Verifying...' : 'Verify OTP'}
                                    </button>

                                    <button
                                        onClick={clearOTP}
                                        className="w-full px-6 py-3 text-sm font-medium glass rounded-full hover:bg-white/10 transition-all"
                                    >
                                        Clear
                                    </button>
                                </div>

                                {/* Resend OTP */}
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-gray-400">Didn't receive the code?</p>
                                    {countdown > 0 ? (
                                        <p className="text-sm text-purple-400">
                                            Resend OTP in {countdown}s
                                        </p>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setOtpSent(false);
                                                setOtp(['', '', '', '', '', '']);
                                            }}
                                            disabled={loading}
                                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                                        >
                                            Change Number / Resend OTP
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="text-green-400 text-sm text-center bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                {success}
                            </div>
                        )}

                        {/* Back link */}
                        <div className="text-center">
                            <Link href="/auth/verify-email" className="text-sm text-gray-400 hover:text-white transition-colors">
                                ← Back to Email Verification
                            </Link>
                        </div>
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
