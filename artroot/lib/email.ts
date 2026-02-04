import { logger } from './logger';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@artroot.com';

export async function sendOTPEmail(email: string, otp: string) {
    if (!BREVO_API_KEY) {
        logger.warn('BREVO', 'Brevo API key missing. Email not sent.', { email, otp });
        // In local dev, we might want to just log it
        console.log(`[OTP DEBUG] Sent to ${email}: ${otp}`);
        return true;
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'ArtRoot Marketplace', email: BREVO_SENDER_EMAIL },
                to: [{ email }],
                subject: 'Your ArtRoot Login Code',
                htmlContent: `
                    <div style="font-family: serif; padding: 20px; border: 1px solid #D2691E; border-radius: 8px;">
                        <h2 style="color: #2B2B2B;">ArtRoot Tribal Art Marketplace</h2>
                        <p style="font-size: 16px;">Hello,</p>
                        <p style="font-size: 16px;">Use the code below to log in to your account. This code will expire in 10 minutes.</p>
                        <div style="background: #E6E1DC; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #D2691E; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #999;">ArtRoot - Celebrating Tribal Heritage</p>
                    </div>
                `
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send email via Brevo');
        }

        logger.info('BREVO', 'OTP email sent successfully', { email });
        return true;
    } catch (error: any) {
        logger.error('BREVO', 'Failed to send OTP email', { email, error: error.message });
        // In dev, we might want to continue even if email fails
        if (process.env.NODE_ENV === 'development') {
            console.log(`[OTP DEV FALLBACK] Code for ${email}: ${otp}`);
            return true;
        }
        throw error;
    }
}
