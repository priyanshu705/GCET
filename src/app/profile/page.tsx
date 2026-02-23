'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    campus: string;
    age: number;
    gender: string;
    department: string | null;
    year: number | null;
    bio: string | null;
    photos: string[];
    interests: string[];
    skills: string[];
    clubs: string[];
    studyInterests: string[];
    relationshipGoals: string | null;
    personalityType: string | null;
    currentMode: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isPhotoVerified: boolean;
    createdAt: string;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchProfile();
        }
    }, [status]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                setProfile(data.user);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/auth/login' });
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400">Profile not found</p>
                </div>
            </div>
        );
    }

    const genderLabels: Record<string, string> = {
        MALE: 'Male',
        FEMALE: 'Female',
        NON_BINARY: 'Non-Binary',
        PREFER_NOT_TO_SAY: 'Not Specified',
    };

    const modeLabels: Record<string, string> = {
        DATING: '💕 Dating Mode',
        FRIEND: '🤝 Friend Mode',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <Navbar userName={profile.name} />

            <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">
                {/* Profile Header */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-3xl">
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                                    {profile.isPhotoVerified && (
                                        <span className="text-blue-400" title="Verified">✓</span>
                                    )}
                                </div>
                                <p className="text-gray-400">{profile.age} • {genderLabels[profile.gender] || profile.gender}</p>
                                <p className="text-purple-400 text-sm">{profile.campus}</p>
                            </div>
                        </div>
                        <Link href="/profile/edit">
                            <button className="px-4 py-2 glass rounded-full text-sm font-medium hover:bg-white/10 transition-all">
                                Edit Profile
                            </button>
                        </Link>
                    </div>

                    {profile.bio && (
                        <p className="text-gray-300 mb-4">{profile.bio}</p>
                    )}

                    {/* Mode Badge */}
                    <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30">
                        <span className="text-white font-medium">{modeLabels[profile.currentMode]}</span>
                    </div>
                </div>

                {/* Verification Status */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Verification Status</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className={`p-4 rounded-xl text-center ${profile.isEmailVerified ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                            <p className="text-2xl mb-1">{profile.isEmailVerified ? '✓' : '⚠'}</p>
                            <p className={`text-sm font-medium ${profile.isEmailVerified ? 'text-green-400' : 'text-yellow-400'}`}>Email</p>
                        </div>
                        <div className={`p-4 rounded-xl text-center ${profile.isPhoneVerified ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-500/10 border border-gray-500/30'}`}>
                            <p className="text-2xl mb-1">{profile.isPhoneVerified ? '✓' : '○'}</p>
                            <p className={`text-sm font-medium ${profile.isPhoneVerified ? 'text-green-400' : 'text-gray-400'}`}>Phone</p>
                        </div>
                        <div className={`p-4 rounded-xl text-center ${profile.isPhotoVerified ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-gray-500/10 border border-gray-500/30'}`}>
                            <p className="text-2xl mb-1">{profile.isPhotoVerified ? '✓' : '○'}</p>
                            <p className={`text-sm font-medium ${profile.isPhotoVerified ? 'text-blue-400' : 'text-gray-400'}`}>Photo</p>
                        </div>
                    </div>
                </div>

                {/* Academic Info */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Academic Info</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-400">Department</p>
                            <p className="text-white font-medium">{profile.department || 'Not set'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Year</p>
                            <p className="text-white font-medium">{profile.year ? `${profile.year}${['st', 'nd', 'rd', 'th'][Math.min(profile.year - 1, 3)]} Year` : 'Not set'}</p>
                        </div>
                    </div>
                </div>

                {/* Interests & Skills */}
                {(profile.interests.length > 0 || profile.skills.length > 0) && (
                    <div className="glass rounded-2xl p-6 mb-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Interests & Skills</h2>

                        {profile.interests.length > 0 && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-400 mb-2">Interests</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.interests.map((interest) => (
                                        <span key={interest} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {profile.skills.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-400 mb-2">Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill) => (
                                        <span key={skill} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-sm text-cyan-300">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Account Actions */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                            <span className="text-gray-300">Email</span>
                            <span className="text-gray-400">{profile.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-gray-300">Phone</span>
                            <span className="text-gray-400">{profile.phone}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-gray-300">Member since</span>
                            <span className="text-gray-400">{new Date(profile.createdAt).toLocaleDateString()}</span>
                        </div>
                        <hr className="border-white/10" />
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
