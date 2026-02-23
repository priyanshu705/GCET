import { Filter } from 'bad-words';

const profanityFilter = new Filter();

/**
 * Tier 1: Automated Profanity Filter
 * Filters out profanity and inappropriate language
 */
export function filterProfanity(message: string): string {
    return profanityFilter.clean(message);
}

export function containsProfanity(message: string): boolean {
    return profanityFilter.isProfane(message);
}

/**
 * Tier 2: Report Threshold System
 * Auto-suspends users after receiving multiple reports
 */
export interface ReportCheck {
    shouldSuspend: boolean;
    reportCount: number;
    threshold: number;
}

export async function checkReportThreshold(
    userId: string,
    getReportsLast24Hours: (userId: string) => Promise<number>
): Promise<ReportCheck> {
    const threshold = 3;
    const recentReports = await getReportsLast24Hours(userId);

    return {
        shouldSuspend: recentReports >= threshold,
        reportCount: recentReports,
        threshold
    };
}

/**
 * Tier 3: AI Sentiment Analysis
 * Placeholder for AI-based content moderation
 * In production, integrate with services like Google Perspective API, OpenAI Moderation API
 */
export interface SentimentAnalysis {
    isAggressive: boolean;
    isHarassing: boolean;
    toxicityScore: number;
    flagged: boolean;
}

export async function analyzeMessageSentiment(
    message: string
): Promise<SentimentAnalysis> {
    // TODO: Integrate with AI moderation API
    // For now, implement basic keyword detection

    const aggressiveKeywords = [
        'hate', 'kill', 'attack', 'hurt', 'stupid', 'idiot'
    ];

    const harassingKeywords = [
        'stalk', 'follow', 'obsessed', 'creep'
    ];

    const lowerMessage = message.toLowerCase();

    const isAggressive = aggressiveKeywords.some(keyword =>
        lowerMessage.includes(keyword)
    );

    const isHarassing = harassingKeywords.some(keyword =>
        lowerMessage.includes(keyword)
    );

    const toxicityScore = (isAggressive ? 50 : 0) + (isHarassing ? 50 : 0);

    return {
        isAggressive,
        isHarassing,
        toxicityScore,
        flagged: isAggressive || isHarassing
    };
}

/**
 * Combined moderation check for messages
 */
export interface ModerationResult {
    allowed: boolean;
    filtered: boolean;
    filteredMessage?: string;
    flagged: boolean;
    reason?: string;
}

export async function moderateMessage(message: string): Promise<ModerationResult> {
    // Check profanity
    const hasProfanity = containsProfanity(message);
    let filteredMessage = message;

    if (hasProfanity) {
        filteredMessage = filterProfanity(message);
    }

    // Check sentiment
    const sentiment = await analyzeMessageSentiment(message);

    if (sentiment.flagged && sentiment.toxicityScore > 70) {
        return {
            allowed: false,
            filtered: false,
            flagged: true,
            reason: 'Message contains aggressive or harassing content'
        };
    }

    if (sentiment.flagged) {
        return {
            allowed: true,
            filtered: hasProfanity,
            filteredMessage: hasProfanity ? filteredMessage : undefined,
            flagged: true,
            reason: 'Message flagged for review'
        };
    }

    return {
        allowed: true,
        filtered: hasProfanity,
        filteredMessage: hasProfanity ? filteredMessage : undefined,
        flagged: false
    };
}
