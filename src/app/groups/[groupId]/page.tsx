'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

interface Member {
    id: string;
    name: string;
    photo: string | null;
    role: string;
    isVerified: boolean;
    isOnline: boolean;
}

interface GroupData {
    id: string;
    name: string;
    description: string;
    type: string;
    campus: string | null;
    maxMembers: number;
    memberCount: number;
    members: Member[];
    isMember: boolean;
    isCreator: boolean;
    isAdmin: boolean;
    myRole: string | null;
    creator: {
        id: string;
        name: string;
        isPhotoVerified: boolean;
    };
}

export default function GroupDetailPage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const router = useRouter();
    const groupId = params.groupId as string;

    const [group, setGroup] = useState<GroupData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'members'>('info');
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated' && groupId) {
            fetchGroup();
        }
    }, [status, groupId]);

    const fetchGroup = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/groups/${groupId}`);
            if (res.ok) {
                const data = await res.json();
                setGroup(data);
            } else if (res.status === 404) {
                router.push('/groups');
            }
        } catch (error) {
            console.error('Failed to fetch group:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!group) return;
        setJoining(true);
        try {
            const res = await fetch(`/api/groups/${groupId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: group.isMember ? 'leave' : 'join' }),
            });

            if (res.ok) {
                fetchGroup();
            }
        } catch (error) {
            console.error('Join/leave failed:', error);
        } finally {
            setJoining(false);
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
                    <p className="text-gray-400">Loading group...</p>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400">Group not found</p>
                    <Link href="/groups" className="text-purple-400 mt-2 block">← Back to groups</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <Navbar userName={session?.user?.name || 'User'} />

            <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
                {/* Header */}
                <div className={`h-32 rounded-2xl bg-gradient-to-r ${typeColors[group.type] || 'from-gray-500 to-gray-600'} flex items-center justify-center mb-4`}>
                    <span className="text-6xl">
                        {group.type === 'STUDY' && '📚'}
                        {group.type === 'SOCIAL' && '🎉'}
                        {group.type === 'EVENT' && '🎯'}
                        {group.type === 'CLUB' && '🎭'}
                    </span>
                </div>

                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">{group.name}</h1>
                        <p className="text-gray-400 text-sm">
                            {group.campus || 'Cross-Campus'} • {group.memberCount}/{group.maxMembers} members
                        </p>
                        {group.myRole && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                                {group.myRole}
                            </span>
                        )}
                    </div>
                    {!group.isCreator && (
                        <button
                            onClick={handleJoin}
                            disabled={joining}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${group.isMember
                                ? 'glass hover:bg-red-600/30 hover:text-red-300'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover-glow'
                                }`}
                        >
                            {joining ? '...' : group.isMember ? 'Leave Group' : 'Join Group'}
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['info', 'members', 'chat'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                if (tab === 'chat') {
                                    window.location.href = `/groups/${group.id}/chat`;
                                } else {
                                    setActiveTab(tab as 'info' | 'members');
                                }
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === tab
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab === 'info' && '📋 Info'}
                            {tab === 'members' && `👥 Members (${group.memberCount})`}
                            {tab === 'chat' && '💬 Chat'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'info' && (
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                        <p className="text-gray-300 mb-6">{group.description}</p>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-white/5 rounded-xl">
                                <span className="text-gray-400">Type:</span>
                                <span className="ml-2 text-white">{group.type}</span>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl">
                                <span className="text-gray-400">Created by:</span>
                                <span className="ml-2 text-white">{group.creator.name}</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="space-y-2">
                        {group.members.map((member) => (
                            <div key={member.id} className="glass rounded-xl p-4 flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold">
                                        {member.photo ? (
                                            <img src={member.photo} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : member.name.charAt(0)}
                                    </div>
                                    {member.isOnline && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-white">{member.name}</span>
                                        {member.isVerified && <span className="text-blue-400">✓</span>}
                                    </div>
                                    <span className="text-xs text-gray-400">{member.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
