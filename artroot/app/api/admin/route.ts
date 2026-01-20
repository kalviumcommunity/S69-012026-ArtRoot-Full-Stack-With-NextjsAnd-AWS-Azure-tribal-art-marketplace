import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin Route Handler
 * 
 * Route: GET /api/admin
 * 
 * Access Control:
 * - Required Role: "admin" only
 * - Enforced by: app/middleware.ts
 * 
 * This route is protected by the RBAC middleware.
 * Only users with the "admin" role will reach this handler.
 * The middleware validates the JWT and checks the role before forwarding the request.
 */

export async function GET(request: NextRequest) {
  // Extract authenticated user info from headers (set by middleware)
  const userEmail = request.headers.get('x-user-email');
  const userRole = request.headers.get('x-user-role');
  const userId = request.headers.get('x-user-id');

  return NextResponse.json(
    {
      success: true,
      message: 'Welcome Admin! You have full access.',
      data: {
        accessLevel: 'admin',
        authenticatedUser: {
          id: userId,
          email: userEmail,
          role: userRole,
        },
      },
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  // Extract authenticated user info from headers (set by middleware)
  const userEmail = request.headers.get('x-user-email');
  const userRole = request.headers.get('x-user-role');

  try {
    const body = await request.json();

    return NextResponse.json(
      {
        success: true,
        message: 'Admin operation completed successfully',
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
