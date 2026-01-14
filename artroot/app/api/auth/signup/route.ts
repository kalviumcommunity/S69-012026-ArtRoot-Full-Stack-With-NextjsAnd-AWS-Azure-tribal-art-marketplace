import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}