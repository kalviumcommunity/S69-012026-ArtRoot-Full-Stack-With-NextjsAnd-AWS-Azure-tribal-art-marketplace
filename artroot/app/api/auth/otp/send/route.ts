import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, saveOTP } from '@/lib/services/userService';
import { sendOTPEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        // Check if user exists
        const user = await getUserByEmail(email);
        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'Account not found. Please sign up first.'
            }, { status: 404 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to DB
        await saveOTP(email, otp);

        // Send email
        await sendOTPEmail(email, otp);

        logger.info('AUTH', 'OTP sent', { email });

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully to your email'
        });

    } catch (error: any) {
        logger.error('API', 'Failed to send OTP', { error: error.message });
        return NextResponse.json({
            success: false,
            error: 'Failed to send OTP. Please try again later.'
        }, { status: 500 });
    }
}
