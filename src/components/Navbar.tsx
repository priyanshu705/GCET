'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import NotificationBell from './NotificationBell';

interface NavbarProps {
    userName?: string;
    userAvatar?: string;
    notificationCount?: number;
}

export default function Navbar({ userName = 'User', userAvatar }: NavbarProps) {
    const pathname = usePathname();
    const [showDropdown, setShowDropdown] = useState(false);

    const navLinks = [
        { href: '/dashboard', label: 'Home', icon: '🏠' },
        { href: '/dating', label: 'Dating', icon: '💕' },
        { href: '/friends', label: 'Friends', icon: '🤝' },
        { href: '/groups', label: 'Groups', icon: '👥' },
        { href: '/chat', label: 'Chat', icon: '💬' },
    ];

    const handleLogout = async () => {
        setShowDropdown(false);
        await signOut({ callbackUrl: '/auth/login' });
    };

    return (
        <nav className="glass border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <span className="text-2xl font-bold gradient-text group-hover:opacity-80 transition-opacity">
                            GCET Campus
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${pathname === link.href || pathname?.startsWith(link.href + '/')
                                        ? 'bg-purple-600/30 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="mr-2">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side - Notifications & Profile */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <NotificationBell />

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors"
                            >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold ring-2 ring-white/10 hover:ring-purple-500/50 transition-all">
                                    {userAvatar ? (
                                        <img
                                            src={userAvatar}
                                            alt={userName}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        userName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <svg
                                    className={`w-4 h-4 text-gray-400 hidden sm:block transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-56 glass rounded-xl py-2 shadow-xl border border-white/10 animate-slide-down">
                                    <div className="px-4 py-3 border-b border-white/10">
                                        <p className="font-semibold text-white truncate">{userName}</p>
                                        <p className="text-xs text-gray-400">View Profile</p>
                                    </div>

                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <span>👤</span>
                                        My Profile
                                    </Link>

                                    <Link
                                        href="/profile/edit"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <span>✏️</span>
                                        Edit Profile
                                    </Link>

                                    <Link
                                        href="/profile/settings"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <span>⚙️</span>
                                        Settings
                                    </Link>

                                    <hr className="my-2 border-white/10" />

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <span>🚪</span>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
