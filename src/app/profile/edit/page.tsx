'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Mode, Gender } from '@/generated/prisma';

interface UserProfile {
    name: string;
    bio: string | null;
    interests: string[];
    skills: string[];
    clubs: string[];
    studyInterests: string[];
    relationshipGoals: string | null;
    personalityType: string | null;
    seekingGender: Gender[];
    ageRangeMin: number;
    ageRangeMax: number;
    currentMode: Mode;
    allowCrossCampus: boolean;
    onlyVerifiedUsers: boolean;
}

export default function EditProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentTag, setCurrentTag] = useState('');

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

    const handleSave = async () => {
        if (!profile) return;

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });

            if (res.ok) {
                setSuccess('Profile updated successfully!');
                setTimeout(() => {
                    router.push('/profile');
                }, 1500);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update profile');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const addTag = (field: 'skills' | 'clubs' | 'studyInterests' | 'interests') => {
        if (!profile || !currentTag.trim()) return;
        if (!profile[field].includes(currentTag.trim())) {
            setProfile({
                ...profile,
                [field]: [...profile[field], currentTag.trim()],
            });
        }
        setCurrentTag('');
    };

    const removeTag = (field: 'skills' | 'clubs' | 'studyInterests' | 'interests', tag: string) => {
        if (!profile) return;
        setProfile({
            ...profile,
            [field]: profile[field].filter(t => t !== tag),
        });
    };

    const toggleGender = (gender: Gender) => {
        if (!profile) return;
        const current = profile.seekingGender;
        if (current.includes(gender)) {
            setProfile({
                ...profile,
                seekingGender: current.filter(g => g !== gender),
            });
        } else {
            setProfile({
                ...profile,
                seekingGender: [...current, gender],
            });
        }
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
                <p className="text-gray-400">Profile not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <Navbar userName={session?.user?.name || 'User'} />

            <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold gradient-text">Edit Profile</h1>
                        <p className="text-gray-400 text-sm">Update your profile information</p>
                    </div>
                    <Link href="/profile">
                        <button className="px-4 py-2 glass rounded-full text-sm font-medium hover:bg-white/10 transition-all">
                            Cancel
                        </button>
                    </Link>
                </div>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Basic Info</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                                <textarea
                                    value={profile.bio || ''}
                                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                                    placeholder="Tell others about yourself..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mode Selection */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Current Mode</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setProfile({ ...profile, currentMode: Mode.DATING })}
                                className={`p-4 rounded-xl border-2 transition-all ${profile.currentMode === Mode.DATING
                                        ? 'border-pink-500 bg-pink-500/10'
                                        : 'border-white/10 hover:border-pink-500/50'
                                    }`}
                            >
                                <div className="text-2xl mb-2">💕</div>
                                <p className="font-medium text-white">Dating</p>
                            </button>
                            <button
                                onClick={() => setProfile({ ...profile, currentMode: Mode.FRIEND })}
                                className={`p-4 rounded-xl border-2 transition-all ${profile.currentMode === Mode.FRIEND
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : 'border-white/10 hover:border-purple-500/50'
                                    }`}
                            >
                                <div className="text-2xl mb-2">🤝</div>
                                <p className="font-medium text-white">Friend</p>
                            </button>
                        </div>
                    </div>

                    {/* Interests */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Interests & Skills</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Interests</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={currentTag}
                                        onChange={e => setCurrentTag(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && addTag('interests')}
                                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                        placeholder="Add interest..."
                                    />
                                    <button
                                        onClick={() => addTag('interests')}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.interests.map(interest => (
                                        <span key={interest} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm flex items-center gap-2">
                                            {interest}
                                            <button onClick={() => removeTag('interests', interest)} className="text-purple-300 hover:text-white">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-sm flex items-center gap-2">
                                            {skill}
                                            <button onClick={() => removeTag('skills', skill)} className="text-cyan-300 hover:text-white">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Matching Preferences */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Matching Preferences</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Looking for</label>
                                <div className="flex flex-wrap gap-2">
                                    {[Gender.MALE, Gender.FEMALE, Gender.NON_BINARY].map(gender => (
                                        <button
                                            key={gender}
                                            onClick={() => toggleGender(gender)}
                                            className={`px-4 py-2 rounded-full border-2 transition-all ${profile.seekingGender.includes(gender)
                                                    ? 'border-purple-500 bg-purple-500/20 text-white'
                                                    : 'border-white/10 text-gray-400 hover:border-purple-500/50'
                                                }`}
                                        >
                                            {gender === Gender.MALE && 'Male'}
                                            {gender === Gender.FEMALE && 'Female'}
                                            {gender === Gender.NON_BINARY && 'Non-Binary'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Age Range</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <input
                                            type="number"
                                            min="18"
                                            max="30"
                                            value={profile.ageRangeMin || ''}
                                            onChange={e => setProfile({ ...profile, ageRangeMin: parseInt(e.target.value) || 18 })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Min age</p>
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            min="18"
                                            max="30"
                                            value={profile.ageRangeMax || ''}
                                            onChange={e => setProfile({ ...profile, ageRangeMax: parseInt(e.target.value) || 30 })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Max age</p>
                                    </div>
                                </div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={profile.allowCrossCampus}
                                    onChange={e => setProfile({ ...profile, allowCrossCampus: e.target.checked })}
                                    className="w-5 h-5 rounded border-white/10 bg-white/5"
                                />
                                <div>
                                    <p className="text-white font-medium">Allow cross-campus matching</p>
                                    <p className="text-sm text-gray-400">Connect with students from other campuses</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={profile.onlyVerifiedUsers}
                                    onChange={e => setProfile({ ...profile, onlyVerifiedUsers: e.target.checked })}
                                    className="w-5 h-5 rounded border-white/10 bg-white/5"
                                />
                                <div>
                                    <p className="text-white font-medium">Only verified users</p>
                                    <p className="text-sm text-gray-400">Match only with photo-verified students</p>
                                </div>
                            </label>
                        </div>
                    </div>

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

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all hover-glow disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </main>
        </div>
    );
}
