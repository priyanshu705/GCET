'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

interface Stats {
    newMatches: number;
    unreadMessages: number;
    friendRequests: number;
    profileViews: number;
}

interface Activity {
    id: string;
    type: string;
    text: string;
    time: string;
    icon: string;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [stats, setStats] = useState<Stats>({
        newMatches: 0,
        unreadMessages: 0,
        friendRequests: 0,
        profileViews: 0,
    });
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchDashboardData();
        }
    }, [status]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, activityRes] = await Promise.all([
                fetch('/api/dashboard/stats'),
                fetch('/api/dashboard/activity'),
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (activityRes.ok) {
                const activityData = await activityRes.json();
                setRecentActivity(activityData.activity || []);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const userName = session?.user?.name || 'User';

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <Navbar
                userName={userName}
                notificationCount={stats.newMatches + stats.unreadMessages}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
                {/* Welcome Section */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                                Welcome back, {userName}! 👋
                            </h1>
                            <p className="text-gray-400">Ready to make new connections today?</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/dating">
                                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-semibold hover-glow transition-all">
                                    💕 Start Matching
                                </button>
                            </Link>
                            <Link href="/friends">
                                <button className="px-4 py-2 glass rounded-full text-sm font-semibold hover:bg-white/10 transition-all">
                                    🤝 Find Friends
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Link href="/dating/matches" className="glass rounded-xl p-4 hover:scale-[1.02] transition-all">
                        <div className="text-3xl mb-2">💕</div>
                        <div className="text-2xl font-bold text-white">{stats.newMatches}</div>
                        <div className="text-sm text-gray-400">New Matches</div>
                    </Link>
                    <Link href="/chat" className="glass rounded-xl p-4 hover:scale-[1.02] transition-all">
                        <div className="text-3xl mb-2">💬</div>
                        <div className="text-2xl font-bold text-white">{stats.unreadMessages}</div>
                        <div className="text-sm text-gray-400">Unread Messages</div>
                    </Link>
                    <Link href="/friends/requests" className="glass rounded-xl p-4 hover:scale-[1.02] transition-all">
                        <div className="text-3xl mb-2">🤝</div>
                        <div className="text-2xl font-bold text-white">{stats.friendRequests}</div>
                        <div className="text-sm text-gray-400">Friend Requests</div>
                    </Link>
                    <div className="glass rounded-xl p-4">
                        <div className="text-3xl mb-2">👀</div>
                        <div className="text-2xl font-bold text-white">{stats.profileViews}</div>
                        <div className="text-sm text-gray-400">Profile Views</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link href="/dating" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 flex items-center justify-center text-2xl">
                                    🎭
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-white">Blind Dating</p>
                                    <p className="text-sm text-gray-400">Swipe to find your match</p>
                                </div>
                                <span className="text-gray-500">→</span>
                            </Link>
                            <Link href="/friends" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 flex items-center justify-center text-2xl">
                                    🤝
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-white">Find Friends</p>
                                    <p className="text-sm text-gray-400">Connect with like-minded students</p>
                                </div>
                                <span className="text-gray-500">→</span>
                            </Link>
                            <Link href="/groups" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-600/30 to-teal-600/30 flex items-center justify-center text-2xl">
                                    👥
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-white">Join Groups</p>
                                    <p className="text-sm text-gray-400">Study groups, events & more</p>
                                </div>
                                <span className="text-gray-500">→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                        <div className="space-y-3">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-3 p-2">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg">
                                        {activity.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{activity.text}</p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                            View All Activity →
                        </button>
                    </div>
                </div>

                {/* Verification Status */}
                {session?.user && (
                    <div className="glass rounded-2xl p-6 mt-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Verification Status</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className={`p-4 rounded-xl ${session.user.isEmailVerified ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                                <p className={`text-sm font-medium ${session.user.isEmailVerified ? 'text-green-400' : 'text-yellow-400'}`}>Email</p>
                                <p className="text-white font-bold">{session.user.isEmailVerified ? '✓ Verified' : '⚠ Pending'}</p>
                            </div>
                            <div className={`p-4 rounded-xl ${session.user.isPhoneVerified ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                                <p className={`text-sm font-medium ${session.user.isPhoneVerified ? 'text-green-400' : 'text-yellow-400'}`}>Phone</p>
                                <p className="text-white font-bold">{session.user.isPhoneVerified ? '✓ Verified' : '⚠ Pending'}</p>
                            </div>
                            <div className={`p-4 rounded-xl ${session.user.isPhotoVerified ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-gray-500/10 border border-gray-500/30'}`}>
                                <p className={`text-sm font-medium ${session.user.isPhotoVerified ? 'text-blue-400' : 'text-gray-400'}`}>Photo</p>
                                <p className="text-white font-bold">{session.user.isPhotoVerified ? '✓ Blue Tick' : '○ Optional'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <BottomNav unreadMessages={stats.unreadMessages} newMatches={stats.newMatches} />
        </div>
    );
}
