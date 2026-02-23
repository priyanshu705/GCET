'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import ProfileCard from '@/components/ProfileCard';
import Link from 'next/link';

interface User {
    id: string;
    name: string;
    campus: string;
    department: string | null;
    year: number | null;
    bio: string | null;
    skills: string[];
    clubs: string[];
    photos: string[];
    isPhotoVerified: boolean;
    mutualSkills: string[];
    mutualClubs: string[];
}

export default function FriendsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [campusFilter, setCampusFilter] = useState('All');
    const [connecting, setConnecting] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchUsers();
        }
    }, [status, campusFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (campusFilter !== 'All') params.set('campus', campusFilter);
            if (searchQuery) params.set('search', searchQuery);

            const res = await fetch(`/api/friends/browse?${params}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchUsers();
    };

    const handleConnect = async (userId: string) => {
        setConnecting(userId);
        try {
            const res = await fetch('/api/friends/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId: userId }),
            });

            if (res.ok) {
                // Remove user from list after sending request
                setUsers(users.filter(u => u.id !== userId));
            }
        } catch (error) {
            console.error('Failed to connect:', error);
        } finally {
            setConnecting(null);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-pulse mb-4">🤝</div>
                    <p className="text-gray-400">Finding people...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <Navbar userName={session?.user?.name || 'User'} />

            <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold gradient-text">Find Friends</h1>
                        <p className="text-gray-400 text-sm">Connect with students from your campus</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/friends/requests">
                            <button className="px-4 py-2 glass rounded-full text-sm font-medium hover:bg-white/10">
                                📬 Requests
                            </button>
                        </Link>
                        <Link href="/friends/connections">
                            <button className="px-4 py-2 glass rounded-full text-sm font-medium hover:bg-white/10">
                                👥 My Friends
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-4">
                    <div className="relative flex gap-2">
                        <input
                            type="text"
                            placeholder="Search by name, skill, or club..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1 px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-medium hover-glow"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['All', 'GCET', 'GU', 'GCOP'].map((campus) => (
                        <button
                            key={campus}
                            onClick={() => setCampusFilter(campus)}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${campusFilter === campus
                                    ? 'bg-cyan-600/30 text-cyan-300'
                                    : 'glass text-gray-400 hover:text-white'
                                }`}
                        >
                            📍 {campus}
                        </button>
                    ))}
                </div>

                {/* Users Grid */}
                {users.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {users.map((user) => (
                            <div key={user.id} className="glass rounded-2xl p-5 hover:bg-white/5 transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-xl font-bold">
                                        {user.photos?.[0] ? (
                                            <img src={user.photos[0]} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-white truncate">{user.name}</h3>
                                            {user.isPhotoVerified && <span className="text-blue-400">✓</span>}
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            {user.campus} • {user.department || 'Student'}
                                        </p>
                                    </div>
                                </div>

                                {/* Bio */}
                                {user.bio && (
                                    <p className="text-sm text-gray-300 mt-3 line-clamp-2">{user.bio}</p>
                                )}

                                {/* Skills */}
                                <div className="mt-3">
                                    <div className="flex flex-wrap gap-1">
                                        {user.skills.slice(0, 4).map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className={`px-2 py-0.5 rounded-full text-xs ${user.mutualSkills.includes(skill)
                                                        ? 'bg-cyan-500/30 text-cyan-300'
                                                        : 'bg-white/5 text-gray-400'
                                                    }`}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Mutual info */}
                                {(user.mutualSkills.length > 0 || user.mutualClubs.length > 0) && (
                                    <p className="text-xs text-cyan-400 mt-2">
                                        {user.mutualSkills.length} mutual skills • {user.mutualClubs.length} mutual clubs
                                    </p>
                                )}

                                {/* Connect Button */}
                                <button
                                    onClick={() => handleConnect(user.id)}
                                    disabled={connecting === user.id}
                                    className={`w-full mt-4 py-2 rounded-xl font-medium transition-all ${connecting === user.id
                                            ? 'bg-gray-700 text-gray-500'
                                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover-glow'
                                        }`}
                                >
                                    {connecting === user.id ? 'Sending...' : '🤝 Connect'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">🔍</div>
                        <h2 className="text-xl font-semibold text-white mb-2">No Users Found</h2>
                        <p className="text-gray-400">Try adjusting your search or filters</p>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
