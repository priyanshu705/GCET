import { useState } from 'react';
import ReportModal from './ReportModal';

interface ProfileCardProps {
    id: string;
    name: string;
    age?: number;
    gender?: string;
    campus?: string;
    department?: string;
    bio?: string;
    interests?: string[];
    skills?: string[];
    photos?: string[];
    isAnonymous?: boolean;
    revealLevel?: number; // 0-5
    isVerified?: boolean;
    mode?: 'dating' | 'friend';
    onConnect?: (id: string) => void;
    onMessage?: (id: string) => void;
    compact?: boolean;
}

const REVEAL_STAGES = [
    'Anonymous',
    'Interests Revealed',
    'Bio Revealed',
    'Name Revealed',
    'Photos Revealed',
    'Fully Revealed',
];

export default function ProfileCard({
    id,
    name,
    age,
    gender,
    campus,
    department,
    bio,
    interests = [],
    skills = [],
    photos = [],
    isAnonymous = false,
    revealLevel = 5,
    isVerified = false,
    mode = 'dating',
    onConnect,
    onMessage,
    compact = false,
}: ProfileCardProps) {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Determine what to show based on reveal level
    const showName = !isAnonymous && revealLevel >= 3;
    const showBio = !isAnonymous && revealLevel >= 2;
    const showInterests = !isAnonymous && revealLevel >= 1;
    const showPhotos = !isAnonymous && revealLevel >= 4;

    const displayName = showName ? name : `Stranger #${id.slice(-4).toUpperCase()}`;
    const displayPhoto = showPhotos && photos.length > 0 ? photos[0] : null;

    if (compact) {
        return (
            <div className="glass rounded-xl p-4 hover:scale-[1.02] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        {displayPhoto ? (
                            <img src={displayPhoto} alt={displayName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-xl">{isAnonymous ? '🎭' : '👤'}</span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white truncate">{displayName}</h3>
                            {isVerified && <span className="text-blue-400 text-sm">✓</span>}
                        </div>
                        <p className="text-sm text-gray-400 truncate">
                            {showInterests && interests.length > 0
                                ? interests.slice(0, 2).join(', ')
                                : campus || 'Campus student'}
                        </p>
                    </div>

                    {/* Action */}
                    {onMessage && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMessage(id);
                            }}
                            className="p-2 bg-purple-600/30 rounded-full hover:bg-purple-600/50 transition-colors"
                        >
                            💬
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl overflow-hidden hover:scale-[1.01] transition-all">
            {/* Photo / Avatar Section */}
            <div className="relative h-48 bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center">
                {displayPhoto ? (
                    <img src={displayPhoto} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-6xl">{isAnonymous ? '🎭' : '👤'}</div>
                )}

                {/* Reveal Level Badge */}
                {isAnonymous && (
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-xs text-purple-300">{REVEAL_STAGES[revealLevel]}</span>
                    </div>
                )}

                {/* Verified Badge */}
                {isVerified && (
                    <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-xl font-bold text-white">{displayName}</h3>
                        <p className="text-sm text-gray-400">
                            {showName && age && `${age} • `}
                            {campus || 'GCET'}
                            {showName && department && ` • ${department}`}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${mode === 'dating'
                            ? 'bg-pink-500/20 text-pink-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                            }`}>
                            {mode === 'dating' ? '💕 Dating' : '🤝 Friend'}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsReportModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                            title="Report User"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                        </button>
                    </div>
                </div>

                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    reportedUserId={id}
                    userName={displayName}
                />

                {/* Bio */}
                {showBio && bio && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{bio}</p>
                )}

                {/* Interests/Skills */}
                {showInterests && (interests.length > 0 || skills.length > 0) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {(mode === 'dating' ? interests : skills).slice(0, 4).map((item, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300">
                                {item}
                            </span>
                        ))}
                        {(mode === 'dating' ? interests : skills).length > 4 && (
                            <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400">
                                +{(mode === 'dating' ? interests : skills).length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Reveal Progress */}
                {isAnonymous && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Reveal Progress</span>
                            <span>{revealLevel}/5</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                style={{ width: `${(revealLevel / 5) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    {onConnect && (
                        <button
                            onClick={() => onConnect(id)}
                            className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-semibold hover-glow transition-all"
                        >
                            {mode === 'dating' ? '💕 Match' : '🤝 Connect'}
                        </button>
                    )}
                    {onMessage && (
                        <button
                            onClick={() => onMessage(id)}
                            className="px-4 py-2 glass rounded-full text-sm font-medium hover:bg-white/10 transition-all"
                        >
                            💬 Message
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
