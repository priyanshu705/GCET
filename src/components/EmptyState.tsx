'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    children?: ReactNode;
}

export default function EmptyState({
    icon = '📭',
    title,
    description,
    action,
    children
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
            <span className="text-6xl mb-4 animate-float">{icon}</span>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            {description && (
                <p className="text-gray-400 text-sm max-w-sm mb-6">{description}</p>
            )}
            {action && (
                action.href ? (
                    <Link
                        href={action.href}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-medium hover-glow transition-all"
                    >
                        {action.label}
                    </Link>
                ) : (
                    <button
                        onClick={action.onClick}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-medium hover-glow transition-all"
                    >
                        {action.label}
                    </button>
                )
            )}
            {children}
        </div>
    );
}

// Preset empty states
export function NoMatches() {
    return (
        <EmptyState
            icon="💕"
            title="No matches yet"
            description="Start swiping to find your perfect match. They could be just a swipe away!"
            action={{ label: 'Start Swiping', href: '/dating' }}
        />
    );
}

export function NoMessages() {
    return (
        <EmptyState
            icon="💬"
            title="No messages yet"
            description="When you match with someone, you can start chatting here."
            action={{ label: 'Find Matches', href: '/dating' }}
        />
    );
}

export function NoFriends() {
    return (
        <EmptyState
            icon="🤝"
            title="No friends yet"
            description="Switch to friend mode and start connecting with fellow students!"
            action={{ label: 'Find Friends', href: '/friends' }}
        />
    );
}

export function NoGroups() {
    return (
        <EmptyState
            icon="👥"
            title="No groups yet"
            description="Join study groups, event meetups, or create your own group!"
            action={{ label: 'Browse Groups', href: '/groups' }}
        />
    );
}

export function NoNotifications() {
    return (
        <EmptyState
            icon="🔔"
            title="No notifications"
            description="You're all caught up! New notifications will appear here."
        />
    );
}

export function NoProfiles() {
    return (
        <EmptyState
            icon="😢"
            title="No more profiles"
            description="You've seen everyone! Check back later for new people."
        />
    );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
    return (
        <EmptyState
            icon="⚠️"
            title="Something went wrong"
            description={message || "We couldn't load this content. Please try again."}
            action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
        />
    );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
            </div>
            <p className="text-gray-400 text-sm">{message}</p>
        </div>
    );
}
