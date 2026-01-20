import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '@/lib/auth';

// JWT Secret (should match the one in lib/auth.ts)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * MIDDLEWARE: Role-Based Access Control (RBAC) Authorization
 * 
 * This middleware enforces authorization rules for protected API routes:
 * - /api/admin/* → Only users with "admin" role can access
 * - /api/users/* → Any authenticated user can access
 * 
 * AUTHENTICATION vs AUTHORIZATION:
 * - Authentication: Verifies WHO you are (checking JWT validity)
 * - Authorization: Verifies WHAT you can do (checking user role against route)
 * 
 * The middleware follows the Least Privilege Principle:
 * - By default, all routes are denied unless explicitly allowed
 * - Users get only the minimum permissions needed for their role
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========================================
  // STEP 1: Identify protected routes
  // ========================================
  const isAdminRoute = pathname.startsWith('/api/admin');
  const isUsersRoute = pathname.startsWith('/api/users');

  // Routes that don't require authentication
  const publicRoutes = ['/api/auth/login', '/api/auth/signup'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Only protect specific API routes
  const isProtectedRoute = isAdminRoute || isUsersRoute;
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // ========================================
  // STEP 2: Extract and validate JWT token
  // ========================================
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // AUTHENTICATION FAILURE: No token provided
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header. Expected: Authorization: Bearer <token>',
        code: 'MISSING_TOKEN'
      },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  let payload: JWTPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    // AUTHENTICATION FAILURE: Token is invalid or expired
    const isExpired = error instanceof jwt.TokenExpiredError;
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: isExpired ? 'Token has expired' : 'Invalid token',
        code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
      },
      { status: 403 }
    );
  }

  // ========================================
  // STEP 3: Check role-based authorization
  // ========================================
  
  // Admin routes require admin role (Least Privilege: restrict to minimum needed role)
  if (isAdminRoute && payload.role !== 'admin') {
    // AUTHORIZATION FAILURE: User lacks required role
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: `Access denied. This route requires 'admin' role. Your role: '${payload.role}'`,
        code: 'INSUFFICIENT_PERMISSIONS'
      },
      { status: 403 }
    );
  }

  // Users route is accessible to any authenticated user with valid role
  if (isUsersRoute && !['admin', 'user'].includes(payload.role)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: `Invalid user role: '${payload.role}'`,
        code: 'INVALID_ROLE'
      },
      { status: 403 }
    );
  }

  // ========================================
  // STEP 4: Attach user info to request headers
  // ========================================
  // Forward user context to route handlers via headers
  // This allows routes to access authenticated user information
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-id', payload.userId);

  // ========================================
  // STEP 5: Grant access - forward to route handler
  // ========================================
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Configure which routes the middleware applies to.
 * Matcher patterns determine which requests trigger the middleware.
 */
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
};
