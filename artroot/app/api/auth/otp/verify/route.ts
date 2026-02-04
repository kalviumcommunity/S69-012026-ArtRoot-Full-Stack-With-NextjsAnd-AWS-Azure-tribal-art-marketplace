import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/services/userService';
import { generateToken } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, otp } = body;

        if (!email || !otp) {
            return NextResponse.json({ success: false, error: 'Email and OTP are required' }, { status: 400 });
        }

        // Verify OTP
        const user = await verifyOTP(email, otp);
        if (!user) {
            logger.warn('AUTH', 'OTP verification failed', { email });
            return NextResponse.json({
                success: false,
                error: 'Invalid or expired OTP'
            }, { status: 401 });
        }

        // Generate token
        const token = generateToken(user.id.toString(), user.email, user.role);

        logger.info('AUTH', 'OTP verified successfully', { userId: user.id, email: user.email });

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error: any) {
        logger.error('API', 'OTP verify error', { error: error.message });
        return NextResponse.json({
            success: false,
            error: 'Server error during OTP verification'
        }, { status: 500 });
    }
}
