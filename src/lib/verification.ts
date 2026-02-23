import { Campus } from '@/generated/prisma';
import nodemailer from 'nodemailer';

export const CAMPUS_EMAIL_DOMAINS = {
    GCET: ['gcet.ac.in', 'gcet.edu.in'],
    GU: ['gu.ac.in', 'galgotiasuniversity.edu.in'],
    GCOP: ['gcop.ac.in', 'gcop.edu.in']
};

// Check if email is a college domain (for bonus verification badge)
export function isCollegeEmail(email: string, campus: Campus): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return CAMPUS_EMAIL_DOMAINS[campus]?.includes(domain) || false;
}

// Allow any valid email - college email is now optional
export async function verifyEmail(email: string, campus: Campus): Promise<boolean> {
    // Accept any email format - no domain restriction
    return email.includes('@') && email.split('@')[1]?.includes('.');
}

// Create reusable transporter using Gmail SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, NOT your regular password
        },
    });
};

export async function sendVerificationEmail(email: string, token: string) {
    const transporter = createTransporter();

    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?email=${encodeURIComponent(email)}&token=${token}`;

    const mailOptions = {
        from: `"GCET Campus" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: '🎓 Verify Your GCET Campus Email',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎓 GCET Campus</h1>
                    <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Verify Your Email Address</p>
                </div>
                
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Welcome to GCET Campus! Please click the button below to verify your email address and complete your registration.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; 
                                  padding: 14px 32px; 
                                  text-decoration: none; 
                                  border-radius: 8px; 
                                  font-weight: 600;
                                  display: inline-block;
                                  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);">
                            ✓ Verify Email Address
                        </a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4b5563;">
                        ${verificationUrl}
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                    
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        If you didn't create an account on GCET Campus, you can safely ignore this email.
                    </p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
        console.error('❌ Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
}

// ============================================
// FIREBASE PHONE AUTH
// ============================================
// Firebase Phone Auth is handled CLIENT-SIDE using:
// - RecaptchaVerifier for spam protection
// - signInWithPhoneNumber() to send OTP
// - confirmationResult.confirm(otp) to verify
//
// See: src/app/auth/verify-phone/page.tsx for implementation
// ============================================

// Server-side helper to format phone number for Firebase
export function formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Ensure it starts with +91 for India
    if (cleaned.startsWith('91') && cleaned.length === 12) {
        return `+${cleaned}`;
    } else if (cleaned.length === 10) {
        return `+91${cleaned}`;
    }
    return `+91${cleaned}`;
}

// Validate phone number format
export function isValidIndianPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    // Indian mobile numbers are 10 digits starting with 6-9
    if (cleaned.length === 10) {
        return /^[6-9]\d{9}$/.test(cleaned);
    }
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return /^91[6-9]\d{9}$/.test(cleaned);
    }
    return false;
}

export const VERIFICATION_GESTURES = [
    'peace_sign',
    'thumbs_up',
    'ok_sign'
];

export function getRandomGesture(): string {
    return VERIFICATION_GESTURES[
        Math.floor(Math.random() * VERIFICATION_GESTURES.length)
    ];
}
