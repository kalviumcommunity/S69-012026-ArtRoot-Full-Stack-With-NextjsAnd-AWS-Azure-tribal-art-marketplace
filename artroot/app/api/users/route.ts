import { NextRequest, NextResponse } from 'next/server';

/**
 * Users Route Handler
 * 
 * Route: GET/POST /api/users
 * 
 * Access Control:
 * - Required Role: "user" or "admin" (any authenticated user)
 * - Enforced by: app/middleware.ts
 * 
 * This route is protected by the RBAC middleware.
 * Any user with a valid JWT (regardless of role) can access this endpoint.
 * The middleware validates the JWT and confirms the role is recognized before forwarding.
 */

// Mock database - in production, replace with actual database
let users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'buyer', createdAt: '2026-01-01' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'buyer', createdAt: '2026-01-05' },
  { id: 3, name: 'Ramesh Kumar', email: 'ramesh@artroot.com', role: 'artist', createdAt: '2026-01-10' },
];

export async function GET(request: NextRequest) {
  try {
    // Extract authenticated user info from headers (set by middleware)
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const roleFilter = searchParams.get('role');

    // Filter users
    let filteredUsers = [...users];
    
    if (roleFilter) {
      filteredUsers = filteredUsers.filter(
        user => user.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      message: 'User route accessible to all authenticated users.',
      requestedBy: {
        email: userEmail,
        role: userRole,
      },
      data: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
        users: paginatedUsers,
      },
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract authenticated user info from headers (set by middleware)
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');

    const body = await request.json();

    return NextResponse.json(
      {
        success: true,
        message: 'User operation completed successfully',
        data: {
          performedBy: {
            email: userEmail,
            role: userRole,
          },
          operation: body,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request body',
        message: 'Request body must be valid JSON',
      },
      { status: 400 }
    );
  }
}
