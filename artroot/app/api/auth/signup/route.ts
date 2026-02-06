import { NextRequest, NextResponse } from 'next/server';
import { emailExists, createUser } from '@/lib/services/userService';
import { hashPassword, generateToken, signupSchema } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate input
        const validation = signupSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                error: validation.error.format()._errors?.at(0) || 'Validation failed'
            }, { status: 400 });
        }

        const { name, email, password } = validation.data;
        const { role } = body; // role is optional and not in signupSchema

        // Check if user exists
        const exists = await emailExists(email);
        if (exists) {
            return NextResponse.json({
                success: false,
                error: 'Email already registered'
            }, { status: 409 });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const user = await createUser({
            name,
            email,
            password_hash: passwordHash,
            role: role || 'viewer'
        });

        // Generate token
        const token = generateToken(user.id.toString(), user.email, user.role);

        logger.info('AUTH', 'New user registered', { userId: user.id, email: user.email, role: user.role });

        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        }, { status: 201 });

    } catch (error: any) {
        logger.error('API', 'Signup error', { error: error.message });
        return NextResponse.json({
            success: false,
            error: 'Server error during registration'
        }, { status: 500 });
    }
}
