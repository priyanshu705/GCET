'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Mode, Gender } from '@/generated/prisma';

type ProfileData = {
    name: string;
    age: number;
    gender: Gender;
    department: string;
    year: number;
    currentMode: Mode;
    relationshipGoals?: string;
    personalityType?: string;
    skills: string[];
    clubs: string[];
    studyInterests: string[];
    interests: string[];
    seekingGender: Gender[];
    ageRangeMin: number;
    ageRangeMax: number;
    allowCrossCampus: boolean;
    onlyVerifiedUsers: boolean;
};

export default function ProfileSetupPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [profileData, setProfileData] = useState<ProfileData>({
        name: '',
        age: 18,
        gender: Gender.PREFER_NOT_TO_SAY,
        department: '',
        year: 1,
        currentMode: Mode.FRIEND,
        skills: [],
        clubs: [],
        studyInterests: [],
        interests: [],
        seekingGender: [],
        ageRangeMin: 18,
        ageRangeMax: 30,
        allowCrossCampus: false,
        onlyVerifiedUsers: false,
    });

    const [currentTag, setCurrentTag] = useState('');

    const departments = [
        'Computer Science', 'Information Technology', 'Electronics', 'Mechanical',
        'Civil', 'Electrical', 'Chemical', 'Biotechnology', 'MBA', 'Other'
    ];

    const commonInterests = [
        'Music', 'Movies', 'Sports', 'Reading', 'Gaming', 'Coding', 'Art',
        'Photography', 'Travel', 'Fitness', 'Cooking', 'Dancing'
    ];

    const handleNext = () => {
        if (validateStep()) {
            setStep(step + 1);
            setError('');
        }
    };

    const handleBack = () => {
        setStep(step - 1);
        setError('');
    };

    const validateStep = () => {
        switch (step) {
            case 1:
                if (!profileData.name || !profileData.department) {
                    setError('Please fill in all required fields');
                    return false;
                }
                if (profileData.age < 18 || profileData.age > 30) {
                    setError('Age must be between 18 and 30');
                    return false;
                }
                return true;
            case 3:
                if (profileData.currentMode === Mode.DATING && !profileData.relationshipGoals) {
                    setError('Please select your relationship goals');
                    return false;
                }
                return true;
            case 5:
                if (profileData.seekingGender.length === 0) {
                    setError('Please select at least one gender preference');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/auth/profile-setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/dashboard');
            } else {
                setError(data.error || 'Failed to save profile');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const addTag = (field: 'skills' | 'clubs' | 'studyInterests' | 'interests') => {
        if (currentTag.trim() && !profileData[field].includes(currentTag.trim())) {
            setProfileData({
                ...profileData,
                [field]: [...profileData[field], currentTag.trim()]
            });
            setCurrentTag('');
        }
    };

    const removeTag = (field: 'skills' | 'clubs' | 'studyInterests' | 'interests', tag: string) => {
        setProfileData({
            ...profileData,
            [field]: profileData[field].filter(t => t !== tag)
        });
    };

    const toggleGender = (gender: Gender) => {
        const current = profileData.seekingGender;
        if (current.includes(gender)) {
            setProfileData({
                ...profileData,
                seekingGender: current.filter(g => g !== gender)
            });
        } else {
            setProfileData({
                ...profileData,
                seekingGender: [...current, gender]
            });
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Main content */}
            <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-2xl">
                    <div className="glass rounded-2xl p-8 space-y-6">
                        {/* Progress bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Step {step} of 5</span>
                                <span>{Math.round((step / 5) * 100)}% Complete</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                                    style={{ width: `${(step / 5) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold gradient-text">Basic Information</h2>
                                    <p className="text-gray-400">Tell us about yourself</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Age *</label>
                                            <input
                                                type="number"
                                                min="18"
                                                max="30"
                                                value={profileData.age || ''}
                                                onChange={e => setProfileData({ ...profileData, age: parseInt(e.target.value) || 18 })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Gender *</label>
                                            <select
                                                value={profileData.gender}
                                                onChange={e => setProfileData({ ...profileData, gender: e.target.value as Gender })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                            >
                                                <option value={Gender.MALE}>Male</option>
                                                <option value={Gender.FEMALE}>Female</option>
                                                <option value={Gender.NON_BINARY}>Non-Binary</option>
                                                <option value={Gender.PREFER_NOT_TO_SAY}>Prefer not to say</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Department *</label>
                                            <select
                                                value={profileData.department}
                                                onChange={e => setProfileData({ ...profileData, department: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                            >
                                                <option value="">Select department</option>
                                                {departments.map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Year *</label>
                                            <select
                                                value={profileData.year}
                                                onChange={e => setProfileData({ ...profileData, year: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                            >
                                                <option value={1}>1st Year</option>
                                                <option value={2}>2nd Year</option>
                                                <option value={3}>3rd Year</option>
                                                <option value={4}>4th Year</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Mode Selection */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold gradient-text">Choose Your Mode</h2>
                                    <p className="text-gray-400">How would you like to connect?</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setProfileData({ ...profileData, currentMode: Mode.DATING })}
                                        className={`p-6 rounded-xl border-2 transition-all ${profileData.currentMode === Mode.DATING
                                            ? 'border-pink-500 bg-pink-500/10'
                                            : 'border-white/10 hover:border-pink-500/50'
                                            }`}
                                    >
                                        <div className="text-4xl mb-3">💕</div>
                                        <h3 className="text-lg font-semibold text-white mb-2">Dating Mode</h3>
                                        <p className="text-sm text-gray-400">Find romantic connections with progressive profile revelation</p>
                                    </button>

                                    <button
                                        onClick={() => setProfileData({ ...profileData, currentMode: Mode.FRIEND })}
                                        className={`p-6 rounded-xl border-2 transition-all ${profileData.currentMode === Mode.FRIEND
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-white/10 hover:border-purple-500/50'
                                            }`}
                                    >
                                        <div className="text-4xl mb-3">🤝</div>
                                        <h3 className="text-lg font-semibold text-white mb-2">Friend Mode</h3>
                                        <p className="text-sm text-gray-400">Connect with students who share your interests and goals</p>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Interests & Preferences */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold gradient-text">
                                        {profileData.currentMode === Mode.DATING ? 'Dating Preferences' : 'Your Interests'}
                                    </h2>
                                    <p className="text-gray-400">Help us find your perfect match</p>
                                </div>

                                {profileData.currentMode === Mode.DATING ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Relationship Goals</label>
                                            <select
                                                value={profileData.relationshipGoals || ''}
                                                onChange={e => setProfileData({ ...profileData, relationshipGoals: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                            >
                                                <option value="">Select your goals</option>
                                                <option value="Serious">Serious Relationship</option>
                                                <option value="Casual">Casual Dating</option>
                                                <option value="Friendship First">Friendship First</option>
                                                <option value="Open to Anything">Open to Anything</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Personality Type (Optional)</label>
                                            <input
                                                type="text"
                                                value={profileData.personalityType || ''}
                                                onChange={e => setProfileData({ ...profileData, personalityType: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                                placeholder="e.g., INTJ, Extrovert, Ambivert"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={currentTag}
                                                    onChange={e => setCurrentTag(e.target.value)}
                                                    onKeyPress={e => e.key === 'Enter' && addTag('skills')}
                                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                                    placeholder="e.g., Python, Guitar, Photography"
                                                />
                                                <button
                                                    onClick={() => addTag('skills')}
                                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {profileData.skills.map(skill => (
                                                    <span key={skill} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm flex items-center gap-2">
                                                        {skill}
                                                        <button onClick={() => removeTag('skills', skill)} className="text-purple-300 hover:text-white">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Clubs</label>
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={currentTag}
                                                    onChange={e => setCurrentTag(e.target.value)}
                                                    onKeyPress={e => e.key === 'Enter' && addTag('clubs')}
                                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                                    placeholder="e.g., Coding Club, Music Society"
                                                />
                                                <button
                                                    onClick={() => addTag('clubs')}
                                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {profileData.clubs.map(club => (
                                                    <span key={club} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm flex items-center gap-2">
                                                        {club}
                                                        <button onClick={() => removeTag('clubs', club)} className="text-purple-300 hover:text-white">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Study Interests</label>
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={currentTag}
                                                    onChange={e => setCurrentTag(e.target.value)}
                                                    onKeyPress={e => e.key === 'Enter' && addTag('studyInterests')}
                                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                                    placeholder="e.g., AI/ML, Web Dev, Data Science"
                                                />
                                                <button
                                                    onClick={() => addTag('studyInterests')}
                                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {profileData.studyInterests.map(interest => (
                                                    <span key={interest} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm flex items-center gap-2">
                                                        {interest}
                                                        <button onClick={() => removeTag('studyInterests', interest)} className="text-purple-300 hover:text-white">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Common Interests */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold gradient-text">Your Interests</h2>
                                    <p className="text-gray-400">Select what you're passionate about</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {commonInterests.map(interest => (
                                        <button
                                            key={interest}
                                            onClick={() => {
                                                if (profileData.interests.includes(interest)) {
                                                    removeTag('interests', interest);
                                                } else {
                                                    setProfileData({
                                                        ...profileData,
                                                        interests: [...profileData.interests, interest]
                                                    });
                                                }
                                            }}
                                            className={`px-4 py-2 rounded-full border-2 transition-all ${profileData.interests.includes(interest)
                                                ? 'border-purple-500 bg-purple-500/20 text-white'
                                                : 'border-white/10 text-gray-400 hover:border-purple-500/50'
                                                }`}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Add Custom Interest</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={currentTag}
                                            onChange={e => setCurrentTag(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && addTag('interests')}
                                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                            placeholder="Add your own interest"
                                        />
                                        <button
                                            onClick={() => addTag('interests')}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Matching Preferences */}
                        {step === 5 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold gradient-text">Matching Preferences</h2>
                                    <p className="text-gray-400">Who would you like to connect with?</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Looking for *</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[Gender.MALE, Gender.FEMALE, Gender.NON_BINARY].map(gender => (
                                                <button
                                                    key={gender}
                                                    onClick={() => toggleGender(gender)}
                                                    className={`px-4 py-2 rounded-full border-2 transition-all ${profileData.seekingGender.includes(gender)
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
                                                    value={profileData.ageRangeMin || ''}
                                                    onChange={e => setProfileData({ ...profileData, ageRangeMin: parseInt(e.target.value) || 18 })}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Min age</p>
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    min="18"
                                                    max="30"
                                                    value={profileData.ageRangeMax || ''}
                                                    onChange={e => setProfileData({ ...profileData, ageRangeMax: parseInt(e.target.value) || 30 })}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Max age</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={profileData.allowCrossCampus}
                                                onChange={e => setProfileData({ ...profileData, allowCrossCampus: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/10 bg-white/5 checked:bg-purple-600"
                                            />
                                            <div>
                                                <p className="text-white font-medium">Allow cross-campus matching</p>
                                                <p className="text-sm text-gray-400">Connect with students from other campuses</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={profileData.onlyVerifiedUsers}
                                                onChange={e => setProfileData({ ...profileData, onlyVerifiedUsers: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/10 bg-white/5 checked:bg-purple-600"
                                            />
                                            <div>
                                                <p className="text-white font-medium">Only verified users</p>
                                                <p className="text-sm text-gray-400">Match only with photo-verified students</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                {error}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-3">
                            {step > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="flex-1 px-6 py-3 text-sm font-medium glass rounded-full hover:bg-white/10 transition-all"
                                >
                                    Back
                                </button>
                            )}
                            {step < 5 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex-1 px-6 py-3 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all hover-glow"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all hover-glow disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Complete Profile'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
