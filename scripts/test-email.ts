import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmailService() {
    console.log('🔧 Testing Gmail SMTP Connection...\n');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    try {
        // Verify connection
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!\n');

        // Send test email
        console.log('📧 Sending test email...');

        const info = await transporter.sendMail({
            from: `"GCET Campus Test" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER, // Send to yourself
            subject: '🎉 GCET Campus - Email Service Test',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px;">
                    <h2 style="color: #667eea;">✅ Email Service Working!</h2>
                    <p>Your Gmail SMTP is configured correctly.</p>
                    <p style="color: #666;">Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                </div>
            `,
        });

        console.log('✅ Test email sent successfully!');
        console.log(`📬 Message ID: ${info.messageId}`);
        console.log(`\n📥 Check your inbox at: ${process.env.GMAIL_USER}`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testEmailService();
