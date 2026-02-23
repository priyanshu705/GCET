import { User, Mode, Campus, Gender } from '@/generated/prisma';

export interface MatchingPreferences {
    mode: Mode;
    campus: Campus;
    allowCrossCampus: boolean;
    onlyVerifiedUsers: boolean;
    seekingGender: Gender[];
    ageRangeMin: number;
    ageRangeMax: number;
}

/**
 * Calculate compatibility score between two users
 * Returns a score between 0-100
 */
export function calculateCompatibility(
    user1: User,
    user2: User,
    mode: Mode
): number {
    let score = 0;
    let totalWeight = 0;

    // Common interests matching (30 points)
    const commonInterests = user1.interests.filter(
        (interest: string) => user2.interests.includes(interest)
    ).length;
    const interestScore = Math.min((commonInterests / Math.max(user1.interests.length, 1)) * 30, 30);
    score += interestScore;
    totalWeight += 30;

    if (mode === Mode.DATING) {
        // Dating mode specific matching

        // Relationship goals alignment (20 points)
        if (user1.relationshipGoals === user2.relationshipGoals) {
            score += 20;
        }
        totalWeight += 20;

        // Personality compatibility (15 points)
        if (user1.personalityType && user2.personalityType) {
            // Simple matching - in production, use MBTI compatibility matrix
            if (user1.personalityType === user2.personalityType) {
                score += 10;
            } else {
                score += 5;
            }
        }
        totalWeight += 15;
    } else {
        // Friend mode specific matching

        // Same department bonus (20 points)
        if (user1.department === user2.department) {
            score += 20;
        }
        totalWeight += 20;

        // Same year bonus (10 points)
        if (user1.year === user2.year) {
            score += 10;
        }
        totalWeight += 10;

        // Shared skills (15 points)
        const commonSkills = user1.skills.filter(
            (skill: string) => user2.skills.includes(skill)
        ).length;
        const skillScore = Math.min((commonSkills / Math.max(user1.skills.length, 1)) * 15, 15);
        score += skillScore;
        totalWeight += 15;

        // Shared study interests (10 points)
        const commonStudyInterests = user1.studyInterests.filter(
            (interest: string) => user2.studyInterests.includes(interest)
        ).length;
        const studyScore = Math.min((commonStudyInterests / Math.max(user1.studyInterests.length, 1)) * 10, 10);
        score += studyScore;
        totalWeight += 10;
    }

    // Same campus bonus (15 points)
    if (user1.campus === user2.campus) {
        score += 15;
    }
    totalWeight += 15;

    // Age proximity (10 points)
    const ageDiff = Math.abs(user1.age - user2.age);
    const ageScore = Math.max(0, 10 - ageDiff * 2);
    score += ageScore;
    totalWeight += 10;

    // Normalize score to 0-100
    return Math.round((score / totalWeight) * 100);
}

/**
 * Filter potential matches based on user preferences
 */
export function filterByPreferences(
    candidate: User,
    userPreferences: MatchingPreferences
): boolean {
    // Campus filter
    if (!userPreferences.allowCrossCampus && candidate.campus !== userPreferences.campus) {
        return false;
    }

    // Verified users filter
    if (userPreferences.onlyVerifiedUsers && !candidate.isPhotoVerified) {
        return false;
    }

    // Gender preference filter
    if (userPreferences.seekingGender.length > 0 &&
        !userPreferences.seekingGender.includes(candidate.gender)) {
        return false;
    }

    // Age range filter
    if (candidate.age < userPreferences.ageRangeMin ||
        candidate.age > userPreferences.ageRangeMax) {
        return false;
    }

    // Mode filter - ensure both users are in the same mode
    if (candidate.currentMode !== userPreferences.mode) {
        return false;
    }

    return true;
}

/**
 * Sort matches by compatibility score
 */
export function rankMatches(
    user: User,
    candidates: User[],
    mode: Mode
): Array<{ user: User; score: number }> {
    return candidates
        .map(candidate => ({
            user: candidate,
            score: calculateCompatibility(user, candidate, mode)
        }))
        .sort((a, b) => b.score - a.score);
}
