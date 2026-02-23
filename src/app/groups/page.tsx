'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

interface Group {
    id: string;
    name: string;
    description: string;
    type: string;
    campus: string | null;
    memberCount: number;
    maxMembers: number;
    isPublic: boolean;
    isJoined: boolean;
    isCreator: boolean;
    creatorName: string;
    creatorVerified: boolean;
}

export default function GroupsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('All');
    const [joinedFilter, setJoinedFilter] = useState<'all' | 'joined'>('all');
    const [joining, setJoining] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchGroups();
        }
    }, [status, typeFilter, joinedFilter]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (typeFilter !== 'All') params.set('type', typeFilter);
            if (joinedFilter === 'joined') params.set('joined', 'true');

            const res = await fetch(`/api/groups?${params}`);
            if (res.ok) {
                const data = await res.json();
                setGroups(data.groups || []);
            }
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (groupId: string, currentlyJoined: boolean) => {
        setJoining(groupId);
        try {
            const res = await fetch(`/api/groups/${groupId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: currentlyJoined ? 'leave' : 'join' }),
            });

            if (res.ok) {
                setGroups(groups.map(g =>
                    g.id === groupId
                        ? { ...g, isJoined: !currentlyJoined, memberCount: g.memberCount + (currentlyJoined ? -1 : 1) }
                        : g
                ));
            }
        } catch (error) {
            console.error('Failed to join/leave:', error);
        } finally {
            setJoining(null);
        }
    };

    const typeColors: Record<string, string> = {
        STUDY: 'from-blue-500 to-cyan-500',
        SOCIAL: 'from-purple-500 to-pink-500',
        EVENT: 'from-orange-500 to-red-500',
        CLUB: 'from-green-500 to-emerald-500',
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-pulse mb-4">👥</div>
                    <p className="text-gray-400">Loading groups...</p>
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
                        <h1 className="text-2xl font-bold gradient-text">Groups</h1>
                        <p className="text-gray-400 text-sm">Join communities, find study partners</p>
                    </div>
                    <Link href="/groups/create">
                        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-medium hover-glow">
                            + Create Group
                        </button>
                    </Link>
                </div>

                {/* Type Filters */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {['All', 'Study', 'Social', 'Event', 'Club'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${typeFilter === type
                                    ? 'bg-purple-600/30 text-purple-300'
                                    : 'glass text-gray-400 hover:text-white'
                                }`}
                        >
                            {type === 'Study' && '📚 '}
                            {type === 'Social' && '🎉 '}
                            {type === 'Event' && '🎯 '}
                            {type === 'Club' && '🎭 '}
                            {type}
                        </button>
                    ))}
                </div>

                {/* Joined/All Filter */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setJoinedFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm ${joinedFilter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400'
                            }`}
                    >
                        All Groups
                    </button>
                    <button
                        onClick={() => setJoinedFilter('joined')}
                        className={`px-4 py-2 rounded-full text-sm ${joinedFilter === 'joined' ? 'bg-white/10 text-white' : 'text-gray-400'
                            }`}
                    >
                        My Groups
                    </button>
                </div>

                {/* Groups Grid */}
                {groups.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groups.map((group) => (
                            <div key={group.id} className="glass rounded-2xl overflow-hidden hover:bg-white/5 transition-all">
                                {/* Header */}
                                <div className={`h-20 bg-gradient-to-r ${typeColors[group.type] || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                                    <span className="text-4xl">
                                        {group.type === 'STUDY' && '📚'}
                                        {group.type === 'SOCIAL' && '🎉'}
                                        {group.type === 'EVENT' && '🎯'}
                                        {group.type === 'CLUB' && '🎭'}
                                    </span>
                                </div>

                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-white">{group.name}</h3>
                                        {group.isCreator && (
                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                                                Admin
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{group.description}</p>

                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                        <span>👥 {group.memberCount}/{group.maxMembers}</span>
                                        <span>{group.campus || 'Cross-Campus'}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/groups/${group.id}`} className="flex-1">
                                            <button className="w-full py-2 glass rounded-xl font-medium hover:bg-white/10">
                                                View
                                            </button>
                                        </Link>
                                        {!group.isCreator && (
                                            <button
                                                onClick={() => handleJoin(group.id, group.isJoined)}
                                                disabled={joining === group.id}
                                                className={`flex-1 py-2 rounded-xl font-medium transition-all ${group.isJoined
                                                        ? 'bg-gray-700/50 text-gray-300 hover:bg-red-600/30 hover:text-red-300'
                                                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90'
                                                    }`}
                                            >
                                                {joining === group.id ? '...' : group.isJoined ? 'Leave' : 'Join'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">👥</div>
                        <h2 className="text-xl font-semibold text-white mb-2">No Groups Found</h2>
                        <p className="text-gray-400 mb-6">Create a group or adjust your filters</p>
                        <Link href="/groups/create">
                            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover-glow">
                                Create Group
                            </button>
                        </Link>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
