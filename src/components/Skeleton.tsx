interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'title' | 'avatar' | 'card' | 'custom';
    count?: number;
}

export default function Skeleton({ className = '', variant = 'text', count = 1 }: SkeletonProps) {
    const variantClasses = {
        text: 'skeleton skeleton-text w-full',
        title: 'skeleton skeleton-title',
        avatar: 'skeleton skeleton-avatar',
        card: 'skeleton skeleton-card w-full',
        custom: 'skeleton',
    };

    const items = Array.from({ length: count }, (_, i) => i);

    return (
        <>
            {items.map(i => (
                <div key={i} className={`${variantClasses[variant]} ${className}`} />
            ))}
        </>
    );
}

// Preset skeleton components
export function SkeletonCard() {
    return (
        <div className="glass rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
                <Skeleton variant="avatar" />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="title" />
                    <Skeleton variant="text" className="w-1/2" />
                </div>
            </div>
            <Skeleton variant="text" count={2} className="mt-4" />
        </div>
    );
}

export function SkeletonChatItem() {
    return (
        <div className="flex items-center gap-3 p-3">
            <Skeleton variant="avatar" className="w-12 h-12" />
            <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="w-1/3" />
                <Skeleton variant="text" className="w-2/3" />
            </div>
        </div>
    );
}

export function SkeletonProfile() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center">
                <Skeleton variant="avatar" className="w-24 h-24 mb-4" />
                <Skeleton variant="title" className="w-1/3" />
                <Skeleton variant="text" className="w-1/4 mt-2" />
            </div>
            <Skeleton variant="card" />
            <Skeleton variant="card" />
        </div>
    );
}

export function SkeletonSwipeCard() {
    return (
        <div className="glass rounded-3xl overflow-hidden w-full max-w-sm aspect-[3/4]">
            <Skeleton variant="custom" className="w-full h-full rounded-none" />
        </div>
    );
}
