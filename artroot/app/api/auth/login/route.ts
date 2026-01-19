import { NextRequest } from 'next/server';
import { verifyPassword, generateToken, loginSchema } from '@/lib/auth';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const { email, password } = loginSchema.parse(body);

    // TODO: Fetch user from database
    // For now, simulating a stored user
    const storedUser = {
      id: '123',
      email: email,
      password: '$2b$10$example', // This would be from database
      name: 'Test User'
    };

    // Verify password
    const isValid = await verifyPassword(password, storedUser.password);

    if (!isValid) {
      return sendError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    // Generate JWT token
    const token = generateToken(storedUser.id, storedUser.email);

    return sendSuccess(
      { token, user: { id: storedUser.id, name: storedUser.name, email: storedUser.email } },
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