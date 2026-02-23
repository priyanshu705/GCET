import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a password with a hash
 */
export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a random token for email verification
 */
export function generateVerificationToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Generate a random anonymous name for chat participants
 */
export function generateAnonymousName(): string {
    const adjectives = [
        'Mysterious', 'Secret', 'Hidden', 'Anonymous', 'Unknown',
        'Curious', 'Enigmatic', 'Veiled', 'Shadowy', 'Cryptic'
    ];

    const nouns = [
        'Stranger', 'Person', 'Individual', 'Friend', 'Soul',
        'Spirit', 'Being', 'Wanderer', 'Seeker', 'Explorer'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 100);

    return `${adjective} ${noun} ${number}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

/**
 * Validate password strength
 */
export interface PasswordValidation {
    isValid: boolean;
    errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
