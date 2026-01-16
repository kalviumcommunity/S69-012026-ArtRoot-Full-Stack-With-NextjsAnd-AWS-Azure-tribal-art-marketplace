import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateToken, signupSchema } from '@/lib/auth';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const { name, email, password } = signupSchema.parse(body);

    // Hash password
    const hashedPassword = await hashPassword(password);

    // TODO: Save user to database
    // For now, we'll simulate a user ID
    const userId = Date.now().toString();

    // Generate JWT token
    const token = generateToken(userId, email);

    return NextResponse.json({
      message: 'User created successfully',
      token,
      user: { id: userId, name, email }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}