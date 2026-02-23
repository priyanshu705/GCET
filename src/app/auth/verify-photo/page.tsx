'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

export default function VerifyPhotoPage() {
    const router = useRouter();
    const { data: session, update: updateSession } = useSession();
    const [selfie, setSelfie] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelfie(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!selfie) {
            setError('Please provide a selfie for verification');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/auth/verify-photo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selfieUrl: selfie // In real app, upload to storage first
                }),
            });

            if (response.ok) {
                setSuccess('Verification request submitted! You now have the blue tick.');
                await updateSession();
                setTimeout(() => {
                    router.push('/profile');
                }, 2000);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to submit verification');
            }
        } catch (err) {
            console.error('Photo verification error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 overflow-hidden">
            <Navbar userName={session?.user?.name || 'User'} />

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12 pb-32">
                <div className="w-full max-w-md">
                    <div className="glass rounded-3xl p-8 space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-2">
                                <span className="text-3xl">🛡️</span>
                            </div>
                            <h1 className="text-3xl font-bold gradient-text">Photo Verification</h1>
                            <p className="text-gray-400">
                                Get a <span className="text-blue-400 font-semibold inline-flex items-center gap-1">blue tick <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.3 1.248.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></span> by verifying your identity.
                            </p>
                        </div>

                        {/* Instructions */}
                        <div className="bg-white/5 rounded-2xl p-4 text-sm text-gray-300 space-y-2 border border-white/10">
                            <p className="font-semibold text-white">How it works:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Take a selfie clearly showing your face</li>
                                <li>Ensure lighting is good and no filters used</li>
                                <li>Your photo is only used for verification</li>
                            </ul>
                        </div>

                        {/* Selfie Preview/Input */}
                        <div className="relative aspect-square w-full max-w-[240px] mx-auto group">
                            <div className={`w-full h-full rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center overflow-hidden transition-all ${selfie ? 'border-purple-500/50' : 'hover:border-purple-500/30'}`}>
                                {selfie ? (
                                    <img src={selfie} alt="Selfie preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-6">
                                        <div className="text-4xl mb-2 opacity-50">📸</div>
                                        <p className="text-sm text-gray-400">Upload or take a selfie</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-4 right-4 bg-purple-600 p-3 rounded-full shadow-xl hover:scale-110 transition-transform active:scale-95"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !selfie}
                                className="w-full px-6 py-4 text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit for Verification'}
                            </button>

                            <Link href="/profile" className="block text-center px-6 py-2 text-sm text-gray-500 hover:text-white transition-colors">
                                Skip for now
                            </Link>
                        </div>

                        {/* Feedback */}
                        {error && (
                            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-shake">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="text-green-400 text-sm text-center bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                {success}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
