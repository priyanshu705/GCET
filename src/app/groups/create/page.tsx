'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

export default function CreateGroupPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'STUDY',
        campus: '',
        isPublic: true,
        maxMembers: 50,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.description) {
            setError('Name and description are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/groups/${data.group.id}`);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create group');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'unauthenticated') {
        router.push('/auth/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <Navbar userName={session?.user?.name || 'User'} />

            <main className="max-w-xl mx-auto px-4 py-6 pb-24 md:pb-8">
                <h1 className="text-2xl font-bold gradient-text mb-6">Create Group</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Group Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., DSA Study Group"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="What is this group about?"
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'STUDY', label: '📚 Study', desc: 'Academic focus' },
                                { value: 'SOCIAL', label: '🎉 Social', desc: 'Fun & hangout' },
                                { value: 'EVENT', label: '🎯 Event', desc: 'Specific event' },
                                { value: 'CLUB', label: '🎭 Club', desc: 'Interest group' },
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: type.value })}
                                    className={`p-3 rounded-xl text-left transition-all ${formData.type === type.value
                                            ? 'bg-purple-600/30 border border-purple-500'
                                            : 'glass hover:bg-white/10'
                                        }`}
                                >
                                    <div className="font-medium">{type.label}</div>
                                    <div className="text-xs text-gray-400">{type.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Campus */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Campus (optional)</label>
                        <select
                            value={formData.campus}
                            onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="">Cross-Campus (All campuses)</option>
                            <option value="GCET">GCET Only</option>
                            <option value="GU">GU Only</option>
                            <option value="GCOP">GCOP Only</option>
                        </select>
                    </div>

                    {/* Max Members */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Max Members: {formData.maxMembers}</label>
                        <input
                            type="range"
                            min="5"
                            max="100"
                            value={formData.maxMembers}
                            onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                            className="w-full"
                        />
                    </div>

                    {/* Privacy */}
                    <div className="flex items-center justify-between p-4 glass rounded-xl">
                        <div>
                            <div className="font-medium text-white">Public Group</div>
                            <div className="text-xs text-gray-400">Anyone can find and join</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                            className={`w-12 h-7 rounded-full transition-all ${formData.isPublic ? 'bg-green-500' : 'bg-gray-600'
                                }`}
                        >
                            <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover-glow disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : '🚀 Create Group'}
                    </button>
                </form>
            </main>

            <BottomNav />
        </div>
    );
}
