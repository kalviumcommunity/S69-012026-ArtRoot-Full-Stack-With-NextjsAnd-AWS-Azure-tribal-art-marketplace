import { NextResponse } from 'next/server';

// Mock database - in production, replace with actual database
let users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'buyer', createdAt: '2026-01-01' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'buyer', createdAt: '2026-01-05' },
  { id: 3, name: 'Ramesh Kumar', email: 'ramesh@artroot.com', role: 'artist', createdAt: '2026-01-10' },
];

/**
 * GET /api/users/:id
 * Get user by ID
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const user = users.find(u => u.id === id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/:id
 * Update user by ID
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await req.json();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Email validation if email is being updated
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Check for duplicate email (excluding current user)
      const existingUser = users.find(u => u.email === data.email && u.id !== id);
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Role validation if role is being updated
    if (data.role && !['buyer', 'artist', 'admin'].includes(data.role.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Role must be buyer, artist, or admin' },
        { status: 400 }
      );
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...data,
      id, // Ensure ID doesn't change
    };

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: users[userIndex],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/:id
 * Delete user by ID
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const deletedUser = users.splice(userIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      data: deletedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
