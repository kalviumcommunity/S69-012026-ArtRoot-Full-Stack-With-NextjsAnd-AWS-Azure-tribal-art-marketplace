import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, updateLastLogin } from '@/lib/services/userService';
import { verifyPassword, generateToken, loginSchema } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                error: validation.error.issues[0].message
            }, { status: 400 });
        }

        const { email, password } = validation.data;

        // Find user
        const user = await getUserByEmail(email);
        if (!user) {
            logger.warn('AUTH', 'Login failed: User not found', { email });
            return NextResponse.json({
                success: false,
                error: 'Invalid email or password'
            }, { status: 401 });
        }

        // Verify password
        const isMatch = await verifyPassword(password, user.password_hash);
        if (!isMatch) {
            logger.warn('AUTH', 'Login failed: Invalid password', { email });
            return NextResponse.json({
                success: false,
                error: 'Invalid email or password'
            }, { status: 401 });
        }

        // Generate token
        const token = generateToken(user.id.toString(), user.email, user.role);

        // Update last login
        await updateLastLogin(user.id);

        logger.info('AUTH', 'User logged in successfully', { userId: user.id, email: user.email });

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
        logger.error('API', 'Login error', { error: error.message });
        return NextResponse.json({
            success: false,
            error: 'Server error during login'
        }, { status: 500 });
    }
}
