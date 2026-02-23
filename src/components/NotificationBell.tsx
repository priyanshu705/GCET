'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Notification {
    id: string;
    type: 'match' | 'message' | 'group';
    title: string;
    message: string;
    icon: string;
    read: boolean;
    createdAt: string;
    link: string;
}

interface NotificationBellProps {
    className?: string;
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // Poll for notifications
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Every 30s
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mark as read when dropdown opens
    const handleOpen = async () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            setLoading(true);
            try {
                await fetch('/api/notifications', { method: 'PATCH' });
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            } catch (error) {
                console.error('Failed to mark as read:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={handleOpen}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce-in">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 glass rounded-xl shadow-xl border border-white/10 overflow-hidden animate-slide-down z-50">
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        {loading && (
                            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <span className="text-3xl mb-2 block">🔔</span>
                                <p className="text-gray-400 text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <Link
                                    key={notification.id}
                                    href={notification.link}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-4 py-3 hover:bg-white/5 transition-colors ${!notification.read ? 'bg-purple-500/5' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">{notification.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white text-sm">
                                                {notification.title}
                                            </p>
                                            <p className="text-gray-400 text-xs truncate">
                                                {notification.message}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                {formatTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <span className="w-2 h-2 bg-pink-500 rounded-full mt-2" />
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <Link
                            href="/notifications"
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-3 text-center text-sm text-purple-400 hover:text-purple-300 border-t border-white/10"
                        >
                            View All Notifications
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
