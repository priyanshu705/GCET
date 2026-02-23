'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

export default function SettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState({
        // Privacy
        showOnline: true,
        showLastActive: true,
        showProfileToMatches: true,
        allowMessages: 'everyone', // everyone, matches, friends

        // Notifications
        pushNotifications: true,
        emailNotifications: false,
        matchNotifications: true,
        messageNotifications: true,
        groupNotifications: true,

        // Match Preferences
        ageRange: [18, 25],
        campusOnly: false,
        verifiedOnly: false,
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
    };

    const handleDeleteAccount = () => {
        console.log('Deleting account...');
        // API call would go here
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <Navbar userName="User" />

            <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold gradient-text">Settings</h1>
                </div>

                {/* Privacy Settings */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">🔒 Privacy</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white">Show Online Status</p>
                                <p className="text-xs text-gray-400">Let others see when you're online</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, showOnline: !settings.showOnline })}
                                className={`w-12 h-6 rounded-full transition-colors ${settings.showOnline ? 'bg-purple-600' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.showOnline ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white">Show Last Active</p>
                                <p className="text-xs text-gray-400">Show when you were last online</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, showLastActive: !settings.showLastActive })}
                                className={`w-12 h-6 rounded-full transition-colors ${settings.showLastActive ? 'bg-purple-600' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.showLastActive ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>

                        <div>
                            <p className="text-white mb-2">Who can message you</p>
                            <div className="flex gap-2">
                                {['everyone', 'matches', 'friends'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setSettings({ ...settings, allowMessages: option })}
                                        className={`px-4 py-2 rounded-full text-sm capitalize ${settings.allowMessages === option
                                                ? 'bg-purple-600/30 text-purple-300'
                                                : 'bg-white/5 text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">🔔 Notifications</h2>

                    <div className="space-y-4">
                        {[
                            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive app notifications' },
                            { key: 'matchNotifications', label: 'New Matches', desc: 'When someone matches with you' },
                            { key: 'messageNotifications', label: 'Messages', desc: 'When you receive a message' },
                            { key: 'groupNotifications', label: 'Group Activity', desc: 'Updates from your groups' },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between">
                                <div>
                                    <p className="text-white">{item.label}</p>
                                    <p className="text-xs text-gray-400">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
                                    className={`w-12 h-6 rounded-full transition-colors ${settings[item.key as keyof typeof settings] ? 'bg-purple-600' : 'bg-gray-600'
                                        }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Match Preferences */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">💕 Match Preferences</h2>

                    <div className="space-y-4">
                        <div>
                            <p className="text-white mb-2">Age Range: {settings.ageRange[0]} - {settings.ageRange[1]}</p>
                            <input
                                type="range"
                                min={18}
                                max={30}
                                value={settings.ageRange[1]}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    ageRange: [settings.ageRange[0], parseInt(e.target.value)]
                                })}
                                className="w-full accent-purple-600"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white">My Campus Only</p>
                                <p className="text-xs text-gray-400">Only show profiles from your campus</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, campusOnly: !settings.campusOnly })}
                                className={`w-12 h-6 rounded-full transition-colors ${settings.campusOnly ? 'bg-purple-600' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.campusOnly ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white">Verified Users Only</p>
                                <p className="text-xs text-gray-400">Only show verified profiles</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, verifiedOnly: !settings.verifiedOnly })}
                                className={`w-12 h-6 rounded-full transition-colors ${settings.verifiedOnly ? 'bg-purple-600' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.verifiedOnly ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">👤 Account</h2>

                    <div className="space-y-3">
                        <button className="w-full py-3 text-left text-gray-300 hover:text-white hover:bg-white/5 rounded-lg px-3 transition-colors">
                            🔑 Change Password
                        </button>
                        <button className="w-full py-3 text-left text-gray-300 hover:text-white hover:bg-white/5 rounded-lg px-3 transition-colors">
                            📧 Update Email
                        </button>
                        <button className="w-full py-3 text-left text-gray-300 hover:text-white hover:bg-white/5 rounded-lg px-3 transition-colors">
                            📱 Update Phone
                        </button>
                        <hr className="border-white/10" />
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 text-left text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg px-3 transition-colors"
                        >
                            🚪 Logout
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg px-3 transition-colors"
                        >
                            ⚠️ Delete Account
                        </button>
                    </div>
                </div>
            </main>

            <BottomNav />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-2xl p-6 max-w-sm w-full">
                        <h2 className="text-xl font-bold text-white mb-2">Delete Account?</h2>
                        <p className="text-gray-400 mb-6">
                            This action cannot be undone. All your data, matches, and messages will be permanently deleted.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 glass rounded-full font-medium hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="flex-1 py-3 bg-red-600 rounded-full font-medium hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
