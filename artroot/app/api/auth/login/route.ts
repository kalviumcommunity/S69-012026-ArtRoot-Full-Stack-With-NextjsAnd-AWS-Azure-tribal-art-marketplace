import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT token
    const token = generateToken(storedUser.id, storedUser.email);

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: { id: storedUser.id, name: storedUser.name, email: storedUser.email }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}