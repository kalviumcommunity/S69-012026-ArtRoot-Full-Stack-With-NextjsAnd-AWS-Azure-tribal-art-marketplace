import { NextRequest } from 'next/server';
import { verifyPassword, generateToken, loginSchema } from '@/lib/auth';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';
import { ZodError } from 'zod';

/**
 * LOGIN ENDPOINT
 * POST /api/auth/login
 * 
 * Handles user authentication and JWT token generation.
 * After successful login, returns a JWT token that must be included
 * in subsequent requests: Authorization: Bearer <token>
 * 
 * The JWT includes the user's role, which is checked by the
 * RBAC middleware in app/middleware.ts to enforce access control.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const { email, password } = loginSchema.parse(body);

    // TODO: Fetch user from database with role information
    // For demo, simulating a stored user with role
    // In production, query from: SELECT id, email, password, role FROM users WHERE email = ?
    const storedUser = {
      id: '123',
      email: email,
      password: '$2b$10$example', // This would be from database
      name: 'Test User',
      role: email.includes('admin') ? ('admin' as const) : ('user' as const), // Determine role
    };

    // Verify password
    const isValid = await verifyPassword(password, storedUser.password);

    if (!isValid) {
      return sendError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    /**
     * ROLE-BASED TOKEN GENERATION
     * 
     * The third parameter to generateToken specifies the user's role.
     * This role is embedded in the JWT payload and later verified by the
     * middleware in app/middleware.ts to enforce authorization rules.
     * 
     * Roles:
     * - "admin": Full system access to /api/admin/* and /api/users/*
     * - "user": Limited access to /api/users/* only
     */
    const token = generateToken(storedUser.id, storedUser.email, storedUser.role);

    return sendSuccess(
      {
        token,
        user: {
          id: storedUser.id,
          name: storedUser.name,
          email: storedUser.email,
          role: storedUser.role, // Include role in response for client awareness
        },
      },
      'Login successful',
      200
    );

  } catch (error) {
    if (error instanceof ZodError) {
      return sendError(error.issues[0].message, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    return sendError('Internal server error', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}