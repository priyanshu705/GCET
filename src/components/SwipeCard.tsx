'use client';

import { useState, useRef, useMemo } from 'react';

interface SwipeCardProps {
    id: string;
    name?: string;
    age?: number;
    campus?: string;
    department?: string;
    bio?: string;
    interests?: string[];
    photos?: string[];
    photo?: string;
    isAnonymous?: boolean;
    revealLevel?: number;
    isVerified?: boolean;
    userInterests?: string[]; // Current user's interests for compatibility
    onLike: (id: string) => void;
    onDislike: (id: string) => void;
    onSuperLike?: (id: string) => void;
}

export default function SwipeCard({
    id,
    name = 'Anonymous',
    age,
    campus,
    department,
    bio,
    interests = [],
    photos = [],
    photo,
    isAnonymous = true,
    revealLevel = 0,
    isVerified = false,
    userInterests = [],
    onLike,
    onDislike,
    onSuperLike,
}: SwipeCardProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const startPos = useRef({ x: 0, y: 0 });

    const displayName = isAnonymous ? `Stranger #${id.slice(-4).toUpperCase()}` : name;
    const allPhotos = photos.length > 0 ? photos : photo ? [photo] : [];

    // Calculate compatibility score
    const compatibilityScore = useMemo(() => {
        if (interests.length === 0 || userInterests.length === 0) return null;
        const matches = interests.filter(i =>
            userInterests.some(ui => ui.toLowerCase() === i.toLowerCase())
        );
        return Math.round((matches.length / Math.max(interests.length, userInterests.length)) * 100);
    }, [interests, userInterests]);

    const handleDragStart = (clientX: number, clientY: number) => {
        setIsDragging(true);
        startPos.current = { x: clientX, y: clientY };
    };

    const handleDragMove = (clientX: number, clientY: number) => {
        if (!isDragging) return;

        const deltaX = clientX - startPos.current.x;
        const deltaY = clientY - startPos.current.y;
        setPosition({ x: deltaX, y: deltaY });

        if (deltaX > 80) setSwipeDirection('right');
        else if (deltaX < -80) setSwipeDirection('left');
        else if (deltaY < -80) setSwipeDirection('up');
        else setSwipeDirection(null);
    };

    const handleDragEnd = () => {
        if (swipeDirection) {
            // Animate exit
            setIsExiting(true);
            const exitX = swipeDirection === 'right' ? 500 : swipeDirection === 'left' ? -500 : 0;
            const exitY = swipeDirection === 'up' ? -500 : 0;
            setPosition({ x: exitX, y: exitY });

            setTimeout(() => {
                if (swipeDirection === 'right') onLike(id);
                else if (swipeDirection === 'left') onDislike(id);
                else if (swipeDirection === 'up' && onSuperLike) onSuperLike(id);
            }, 200);
        } else {
            setPosition({ x: 0, y: 0 });
        }
        setIsDragging(false);
        setSwipeDirection(null);
    };

    const handleAction = (action: 'like' | 'dislike' | 'superlike') => {
        setIsExiting(true);
        const exitX = action === 'like' ? 500 : action === 'dislike' ? -500 : 0;
        const exitY = action === 'superlike' ? -500 : 0;
        setPosition({ x: exitX, y: exitY });

        setTimeout(() => {
            if (action === 'like') onLike(id);
            else if (action === 'dislike') onDislike(id);
            else if (action === 'superlike' && onSuperLike) onSuperLike(id);
        }, 200);
    };

    const rotation = position.x * 0.08;
    const likeOpacity = Math.min(1, Math.max(0, position.x / 100));
    const nopeOpacity = Math.min(1, Math.max(0, -position.x / 100));
    const superOpacity = Math.min(1, Math.max(0, -position.y / 100));

    return (
        <div
            ref={cardRef}
            className="relative w-full max-w-sm mx-auto touch-none select-none cursor-grab active:cursor-grabbing"
            style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${isExiting ? 0.95 : 1})`,
                opacity: isExiting ? 0 : 1,
                transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
            onMouseUp={handleDragEnd}
            onMouseLeave={() => isDragging && handleDragEnd()}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handleDragEnd}
        >
            {/* Card */}
            <div className="glass rounded-3xl overflow-hidden shadow-2xl">
                {/* Photo Area */}
                <div className="relative h-96 bg-gradient-to-br from-purple-600/40 to-pink-600/40">
                    {allPhotos.length > 0 && !isAnonymous ? (
                        <>
                            <img
                                src={allPhotos[currentPhotoIndex]}
                                alt={displayName}
                                className="w-full h-full object-cover"
                            />
                            {/* Photo indicators */}
                            {allPhotos.length > 1 && (
                                <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 px-4">
                                    {allPhotos.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(idx); }}
                                            className={`h-1 rounded-full flex-1 max-w-8 transition-all ${idx === currentPhotoIndex
                                                    ? 'bg-white'
                                                    : 'bg-white/40 hover:bg-white/60'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-8xl opacity-50 animate-float">🎭</span>
                        </div>
                    )}

                    {/* LIKE Overlay */}
                    <div
                        className="swipe-like-overlay"
                        style={{ opacity: likeOpacity }}
                    >
                        LIKE
                    </div>

                    {/* NOPE Overlay */}
                    <div
                        className="swipe-nope-overlay"
                        style={{ opacity: nopeOpacity }}
                    >
                        NOPE
                    </div>

                    {/* SUPER LIKE Overlay */}
                    <div
                        className="swipe-superlike-overlay"
                        style={{ opacity: superOpacity }}
                    >
                        ⭐ SUPER LIKE
                    </div>

                    {/* Anonymous Badge */}
                    {isAnonymous && (
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2">
                            <span className="text-sm">🎭</span>
                            <span className="text-xs text-purple-300 font-medium">Anonymous</span>
                        </div>
                    )}

                    {/* Verified Badge */}
                    {isVerified && (
                        <div className="absolute top-4 right-4 bg-blue-500 rounded-full p-2 shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}

                    {/* Compatibility Score */}
                    {compatibilityScore !== null && compatibilityScore > 0 && (
                        <div className="absolute bottom-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-3 py-1.5 shadow-lg">
                            <span className="text-white text-sm font-bold">{compatibilityScore}% Match</span>
                        </div>
                    )}

                    {/* Gradient overlay for text readability */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5 -mt-16 relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {displayName}
                                {isVerified && <span className="text-blue-400">✓</span>}
                            </h2>
                            <p className="text-gray-400 text-sm">
                                {!isAnonymous && age && `${age} • `}
                                {campus}
                                {!isAnonymous && department && ` • ${department}`}
                            </p>
                        </div>
                    </div>

                    {bio && !isAnonymous && (
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{bio}</p>
                    )}

                    {/* Interests */}
                    {interests.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {interests.slice(0, 5).map((interest, idx) => {
                                const isMatch = userInterests.some(
                                    ui => ui.toLowerCase() === interest.toLowerCase()
                                );
                                return (
                                    <span
                                        key={idx}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${isMatch
                                                ? 'bg-green-500/30 text-green-300 ring-1 ring-green-500/50'
                                                : 'bg-purple-500/20 text-purple-300'
                                            }`}
                                    >
                                        {isMatch && '✓ '}{interest}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* Reveal hint for Anonymous */}
                    {isAnonymous && (
                        <div className="text-center py-2">
                            <p className="text-xs text-gray-500">
                                💬 Chat more to reveal their identity
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-5 mt-6">
                <button
                    onClick={() => handleAction('dislike')}
                    className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center text-2xl text-red-400 hover:bg-red-500 hover:text-white hover:scale-110 hover:border-red-500 active:scale-95 transition-all shadow-lg"
                >
                    ✕
                </button>

                {onSuperLike && (
                    <button
                        onClick={() => handleAction('superlike')}
                        className="w-14 h-14 rounded-full bg-blue-500/10 border-2 border-blue-500/50 flex items-center justify-center text-xl text-blue-400 hover:bg-blue-500 hover:text-white hover:scale-110 hover:border-blue-500 active:scale-95 transition-all shadow-lg"
                    >
                        ⭐
                    </button>
                )}

                <button
                    onClick={() => handleAction('like')}
                    className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/50 flex items-center justify-center text-2xl text-green-400 hover:bg-green-500 hover:text-white hover:scale-110 hover:border-green-500 active:scale-95 transition-all shadow-lg"
                >
                    💚
                </button>
            </div>
        </div>
    );
}
