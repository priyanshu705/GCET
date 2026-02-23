'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
    unreadMessages?: number;
    newMatches?: number;
}

export default function BottomNav({ unreadMessages = 0, newMatches = 0 }: BottomNavProps) {
    const pathname = usePathname();

    const tabs = [
        { href: '/dashboard', label: 'Home', icon: '🏠', activeIcon: '🏡' },
        { href: '/dating', label: 'Dating', icon: '💕', activeIcon: '❤️‍🔥', badge: newMatches },
        { href: '/friends', label: 'Friends', icon: '🤝', activeIcon: '🫂' },
        { href: '/chat', label: 'Chat', icon: '💬', activeIcon: '💭', badge: unreadMessages },
        { href: '/profile', label: 'Profile', icon: '👤', activeIcon: '😊' },
    ];

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

    return (
        <nav className="fixed bottom-0 left-0 right-0 md:hidden glass border-t border-white/10 z-50 safe-area-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {tabs.map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex flex-col items-center justify-center flex-1 py-2 relative transition-all ${isActive(tab.href)
                                ? 'text-purple-400'
                                : 'text-gray-500 active:scale-95'
                            }`}
                    >
                        <span className="text-xl mb-1">
                            {isActive(tab.href) ? tab.activeIcon : tab.icon}
                        </span>
                        <span className={`text-xs font-medium ${isActive(tab.href) ? 'text-purple-400' : 'text-gray-500'}`}>
                            {tab.label}
                        </span>

                        {/* Badge */}
                        {tab.badge && tab.badge > 0 && (
                            <span className="absolute top-1 right-1/4 bg-pink-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                {tab.badge > 99 ? '99+' : tab.badge}
                            </span>
                        )}

                        {/* Active indicator */}
                        {isActive(tab.href) && (
                            <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                        )}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
