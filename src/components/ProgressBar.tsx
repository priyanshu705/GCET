'use client';

interface ProgressBarProps {
    value: number;
    max?: number;
    label?: string;
    showPercentage?: boolean;
    variant?: 'default' | 'gradient' | 'success' | 'warning' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
}

export default function ProgressBar({
    value,
    max = 100,
    label,
    showPercentage = true,
    variant = 'gradient',
    size = 'md',
    animated = true,
}: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    const variantClasses = {
        default: 'bg-purple-600',
        gradient: 'bg-gradient-to-r from-purple-600 to-pink-600',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        danger: 'bg-red-500',
    };

    return (
        <div className="w-full">
            {(label || showPercentage) && (
                <div className="flex justify-between items-center mb-1.5">
                    {label && <span className="text-sm text-gray-300">{label}</span>}
                    {showPercentage && (
                        <span className="text-sm font-medium text-white">{Math.round(percentage)}%</span>
                    )}
                </div>
            )}
            <div className={`w-full bg-white/10 rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full transition-all duration-500 ease-out ${animated ? 'animate-pulse-subtle' : ''
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

// Profile completion progress
interface ProfileProgressProps {
    user: {
        name?: string;
        bio?: string;
        photos?: string[];
        interests?: string[];
        department?: string;
        year?: number | string;
        isEmailVerified?: boolean;
        isPhoneVerified?: boolean;
        isPhotoVerified?: boolean;
    };
}

export function ProfileProgress({ user }: ProfileProgressProps) {
    const checks = [
        { label: 'Name', complete: !!user.name },
        { label: 'Bio', complete: !!user.bio && user.bio.length > 10 },
        { label: 'Photo', complete: !!user.photos && user.photos.length > 0 },
        { label: 'Interests', complete: !!user.interests && user.interests.length >= 3 },
        { label: 'Department', complete: !!user.department },
        { label: 'Year', complete: !!user.year },
        { label: 'Email verified', complete: !!user.isEmailVerified },
        { label: 'Phone verified', complete: !!user.isPhoneVerified },
    ];

    const completed = checks.filter(c => c.complete).length;
    const percentage = Math.round((completed / checks.length) * 100);

    return (
        <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Profile Completion</h3>
                <span className={`text-sm font-bold ${percentage < 50 ? 'text-red-400' :
                        percentage < 80 ? 'text-yellow-400' :
                            'text-green-400'
                    }`}>
                    {percentage}%
                </span>
            </div>

            <ProgressBar
                value={percentage}
                showPercentage={false}
                variant={percentage < 50 ? 'danger' : percentage < 80 ? 'warning' : 'success'}
            />

            <div className="mt-4 grid grid-cols-2 gap-2">
                {checks.map((check) => (
                    <div
                        key={check.label}
                        className={`flex items-center gap-2 text-xs ${check.complete ? 'text-green-400' : 'text-gray-500'
                            }`}
                    >
                        <span>{check.complete ? '✓' : '○'}</span>
                        <span>{check.label}</span>
                    </div>
                ))}
            </div>

            {percentage < 100 && (
                <p className="mt-4 text-xs text-gray-400">
                    Complete your profile to increase your visibility and get more matches!
                </p>
            )}
        </div>
    );
}
