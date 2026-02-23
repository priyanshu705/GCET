import { User } from '@/generated/prisma';

/**
 * Calculate revelation level based on message count and mutual agreement
 * Level 0: Complete anonymity
 * Level 1: Basic info (10+ messages)
 * Level 2: Interests (25+ messages)
 * Level 3: First name (50+ messages)
 * Level 4: Profile photo (100+ messages)
 * Level 5: Full profile (mutual agreement)
 */
export function calculateRevealLevel(
    messageCount: number,
    mutualAgreement: boolean
): number {
    if (mutualAgreement) return 5;
    if (messageCount >= 100) return 4;
    if (messageCount >= 50) return 3;
    if (messageCount >= 25) return 2;
    if (messageCount >= 10) return 1;
    return 0;
}

export interface RevealedProfile {
    anonymousName?: string;
    year?: number;
    department?: string;
    ageRange?: string;
    interests?: string[];
    bio?: string;
    firstName?: string;
    blurredPhoto?: string;
    photos?: string[];
    fullName?: string;
    email?: string;
    phone?: string;
}

/**
 * Return appropriate user data based on revelation level
 */
export function getRevealedProfile(
    user: User,
    level: number,
    anonymousName: string
): RevealedProfile {
    const profile: RevealedProfile = {};

    // Level 0 - Complete anonymity
    if (level === 0) {
        profile.anonymousName = anonymousName;
        return profile;
    }

    // Level 1 - Basic info
    if (level >= 1) {
        profile.year = user.year || undefined;
        profile.department = user.department || undefined;
        profile.ageRange = `${Math.floor(user.age / 5) * 5}-${Math.floor(user.age / 5) * 5 + 4}`;
    }

    // Level 2 - Interests
    if (level >= 2) {
        profile.interests = user.interests;
        profile.bio = user.bio || undefined;
    }

    // Level 3 - First name
    if (level >= 3) {
        profile.firstName = user.name.split(' ')[0];
        profile.blurredPhoto = user.photos[0]; // In production, apply blur filter
    }

    // Level 4 - Profile photo
    if (level >= 4) {
        profile.photos = user.photos;
        profile.fullName = user.name;
    }

    // Level 5 - Full profile
    if (level >= 5) {
        profile.email = user.email;
        profile.phone = user.phone;
    }

    return profile;
}

export function getRevealLevelDescription(level: number): string {
    const descriptions = [
        'Complete anonymity',
        'Basic info revealed',
        'Interests revealed',
        'First name revealed',
        'Profile photo revealed',
        'Full profile revealed'
    ];
    return descriptions[level] || 'Unknown level';
}
