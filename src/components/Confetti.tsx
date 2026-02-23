'use client';

import { useEffect, useState } from 'react';

interface ConfettiPiece {
    id: number;
    x: number;
    color: string;
    delay: number;
    size: number;
}

interface ConfettiProps {
    active: boolean;
    duration?: number;
    pieceCount?: number;
}

const colors = [
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#22c55e', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#3b82f6', // blue
];

export default function Confetti({ active, duration = 3000, pieceCount = 50 }: ConfettiProps) {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (active) {
            setIsVisible(true);
            const newPieces: ConfettiPiece[] = Array.from({ length: pieceCount }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 0.5,
                size: Math.random() * 8 + 4,
            }));
            setPieces(newPieces);

            const timer = setTimeout(() => {
                setIsVisible(false);
                setPieces([]);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [active, duration, pieceCount]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="absolute top-0"
                    style={{
                        left: `${piece.x}%`,
                        width: piece.size,
                        height: piece.size,
                        backgroundColor: piece.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '0',
                        animation: `confetti-fall ${duration / 1000}s ease-out forwards`,
                        animationDelay: `${piece.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}

// Heart burst animation component
export function HeartBurst({ active }: { active: boolean }) {
    const [hearts, setHearts] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (active) {
            setIsVisible(true);
            const newHearts = Array.from({ length: 12 }, (_, i) => ({
                id: i,
                x: 50 + (Math.random() - 0.5) * 40,
                y: 50 + (Math.random() - 0.5) * 40,
                size: Math.random() * 20 + 16,
                delay: Math.random() * 0.3,
            }));
            setHearts(newHearts);

            const timer = setTimeout(() => {
                setIsVisible(false);
                setHearts([]);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [active]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute animate-heart-burst"
                    style={{
                        left: `${heart.x}%`,
                        top: `${heart.y}%`,
                        fontSize: heart.size,
                        animationDelay: `${heart.delay}s`,
                    }}
                >
                    💕
                </div>
            ))}
        </div>
    );
}
