# RBAC Authorization Middleware Documentation

## Overview

This document explains the Role-Based Access Control (RBAC) authorization middleware implemented in your Next.js application. The middleware enforces authentication and authorization rules to protect API routes based on user roles.

---

## Table of Contents

1. [Authentication vs Authorization](#authentication-vs-authorization)
2. [Middleware Architecture](#middleware-architecture)
3. [Middleware Flow](#middleware-flow)
4. [Supported Roles](#supported-roles)
5. [Protected Routes](#protected-routes)
6. [JWT Payload Structure](#jwt-payload-structure)
7. [Access Control Examples](#access-control-examples)
8. [Request Headers](#request-headers)
9. [Error Responses](#error-responses)
10. [Extending Roles](#extending-roles)
11. [Security Best Practices](#security-best-practices)
12. [Testing the Middleware](#testing-the-middleware)

---

## Authentication vs Authorization

### Authentication
**"Who are you?"**

Authentication verifies the identity of a user. In this system:
- User logs in with email and password
- System generates a JWT token containing user information
- Middleware validates that the JWT is genuine and not expired

**Process:**
```
User sends: Authorization: Bearer <token>
           ↓
Middleware verifies JWT signature
           ↓
If valid → Continue to authorization check
If invalid/expired → Return 403 Forbidden
```

### Authorization
**"What can you do?"**

Authorization determines what authenticated users are allowed to do. In this system:
- User roles (admin, user) determine route access
- Middleware checks user's role against route requirements
- Routes return different responses based on access level

**Process:**
```
User role = "user"
           ↓
Accessing /api/admin/* → Denied (insufficient role)
Accessing /api/users/* → Allowed (authenticated user)
```

---

## Middleware Architecture

### File Location
```
artroot/
├── app/
│   ├── middleware.ts ← Main RBAC middleware
│   ├── api/
│   │   ├── admin/
│   │   │   └── route.ts (admin-only route)
│   │   ├── users/
│   │   │   └── route.ts (authenticated user route)
│   │   └── auth/
│   │       ├── login/route.ts
│   │       └── signup/route.ts
│   └── ...
└── lib/
    ├── auth.ts (JWT generation, verification)
    └── ...
```

### Middleware Execution Order

```
Request arrives
    ↓
Middleware intercepts (if matches /api/:path*)
    ↓
1. Check if route is public (auth/login, auth/signup)
    ├→ [YES] Allow request through
    └→ [NO] Proceed to authentication
    ↓
2. Extract JWT from Authorization header
    ├→ [MISSING] Return 401 Unauthorized
    └→ [PRESENT] Proceed to validation
    ↓
3. Verify JWT signature and expiration
    ├→ [INVALID/EXPIRED] Return 403 Forbidden
    └→ [VALID] Proceed to authorization
    ↓
4. Check role against route requirements
    ├→ /api/admin/* requires role === "admin"
    │   ├→ [YES] Proceed to route handler
    │   └→ [NO] Return 403 Access Denied
    │
    └→ /api/users/* requires role === "admin" or "user"
        ├→ [YES] Proceed to route handler
        └→ [NO] Return 403 Invalid Role
    ↓
5. Attach user info to request headers
    - x-user-email
    - x-user-role
    - x-user-id
    ↓
6. Forward to route handler
    ↓
Route handler returns response
```

---

## Middleware Flow

### Visual Flow Diagram

```
START: Client sends API request
│
├─→ Is this a public route? (auth/login, auth/signup)
│   ├─→ YES → [✓ ALLOW] → Route Handler → Response
│   └─→ NO
│
├─→ Is this a protected route? (/api/admin/*, /api/users/*)
│   ├─→ NO → [✓ ALLOW] → Route Handler → Response
│   └─→ YES
│
├─→ Has Authorization header with Bearer token?
│   ├─→ NO → [✗ REJECT 401] → {error: "Missing token"}
│   └─→ YES
│
├─→ Is JWT valid & not expired?
│   ├─→ NO → [✗ REJECT 403] → {error: "Invalid token"}
│   └─→ YES (Extract user info)
│
├─→ Does user role match route requirement?
│   ├─→ /api/admin/* && role = "admin" → [✓ ALLOW]
│   ├─→ /api/admin/* && role ≠ "admin" → [✗ REJECT 403]
│   ├─→ /api/users/* && (role = "admin" or "user") → [✓ ALLOW]
│   └─→ /api/users/* && role ∉ ["admin", "user"] → [✗ REJECT 403]
│
├─→ Attach headers: x-user-email, x-user-role, x-user-id
│
└─→ Route Handler → Response
END
```

---

## Supported Roles

| Role | Description | Can Access |
|------|-------------|-----------|
| `admin` | Administrator with full system access | `/api/admin/*`, `/api/users/*` |
| `user` | Regular authenticated user | `/api/users/*` |

### How Roles Are Defined

Roles are stored in the JWT payload and set during token generation:

```typescript
// In lib/auth.ts
export function generateToken(
  userId: string,
  email: string,
  role: 'admin' | 'user' = 'user'  // Default role
): string {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
```

### JWT Payload Example

```json
{
  "userId": "123",
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1642500000,
  "exp": 1643104800
}
```

---

## Protected Routes

### Admin Route (`/api/admin/*`)
- **Access Level**: Admin only
- **Requires**: `role === "admin"`
- **Endpoint**: `GET /api/admin`, `POST /api/admin`

**Example Request:**
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <admin_jwt_token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Welcome Admin! You have full access.",
  "data": {
    "accessLevel": "admin",
    "authenticatedUser": {
      "id": "123",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### Users Route (`/api/users/*`)
- **Access Level**: Any authenticated user
- **Requires**: `role === "admin"` OR `role === "user"`
- **Endpoint**: `GET /api/users`, `POST /api/users`

**Example Request:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <any_valid_jwt_token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User route accessible to all authenticated users.",
  "data": {
    "authenticatedUser": {
      "id": "456",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

---

## JWT Payload Structure

```typescript
interface JWTPayload {
  userId: string;        // Unique user identifier
  email: string;         // User email address
  role: 'admin' | 'user'; // User role for authorization
  iat: number;           // Issued at (timestamp)
  exp: number;           // Expiration (timestamp)
}
```

### Generating Tokens

```typescript
import { generateToken } from '@/lib/auth';

// Generate admin token
const adminToken = generateToken('123', 'admin@example.com', 'admin');

// Generate regular user token (default role)
const userToken = generateToken('456', 'user@example.com');
```

---

## Access Control Examples

### Example 1: Admin User Access

**Scenario**: Admin user accessing admin route

```
Request:
  POST /api/admin
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

JWT Payload: { userId: "123", email: "admin@example.com", role: "admin" }

Middleware Check:
  ✓ Authorization header present
  ✓ JWT is valid and not expired
  ✓ Route is /api/admin (requires admin role)
  ✓ User role is "admin"

Result: [✓ ALLOWED] → Request forwarded to route handler

Response:
  200 OK
  {
    "success": true,
    "message": "Welcome Admin! You have full access.",
    "data": { ... }
  }
```

### Example 2: Regular User Denied Admin Access

**Scenario**: Regular user trying to access admin route

```
Request:
  GET /api/admin
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

JWT Payload: { userId: "456", email: "user@example.com", role: "user" }

Middleware Check:
  ✓ Authorization header present
  ✓ JWT is valid and not expired
  ✓ Route is /api/admin (requires admin role)
  ✗ User role is "user" (not "admin")

Result: [✗ DENIED] → Request rejected by middleware

Response:
  403 Forbidden
  {
    "success": false,
    "error": "Forbidden",
    "message": "Access denied. This route requires 'admin' role. Your role: 'user'",
    "code": "INSUFFICIENT_PERMISSIONS"
  }
```

### Example 3: Regular User Can Access User Route

**Scenario**: Regular user accessing user route

```
Request:
  GET /api/users
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

JWT Payload: { userId: "456", email: "user@example.com", role: "user" }

Middleware Check:
  ✓ Authorization header present
  ✓ JWT is valid and not expired
  ✓ Route is /api/users (allows admin and user roles)
  ✓ User role is "user"

Result: [✓ ALLOWED] → Request forwarded to route handler

Response:
  200 OK
  {
    "success": true,
    "message": "User route accessible to all authenticated users.",
    "data": { ... }
  }
```

### Example 4: Missing Authentication Token

**Scenario**: Request without JWT token

```
Request:
  GET /api/users
  (no Authorization header)

Middleware Check:
  ✗ Authorization header missing

Result: [✗ DENIED] → Request rejected before JWT verification

Response:
  401 Unauthorized
  {
    "success": false,
    "error": "Unauthorized",
    "message": "Missing or invalid Authorization header. Expected: Authorization: Bearer <token>",
    "code": "MISSING_TOKEN"
  }
```

### Example 5: Expired Token

**Scenario**: Request with expired JWT

```
Request:
  GET /api/admin
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
              (token expired 2 days ago)

JWT Payload: { userId: "123", email: "admin@example.com", role: "admin", exp: 1642500000 }

Middleware Check:
  ✓ Authorization header present
  ✗ JWT is expired (current time > exp)

Result: [✗ DENIED] → Token validation failed

Response:
  403 Forbidden
  {
    "success": false,
    "error": "Forbidden",
    "message": "Token has expired",
    "code": "TOKEN_EXPIRED"
  }
```

---

## Request Headers

After successful authorization, the middleware attaches user information to request headers. Route handlers can access this data:

### Header Names

| Header | Value | Example |
|--------|-------|---------|
| `x-user-email` | User's email address | `admin@example.com` |
| `x-user-role` | User's role | `admin` |
| `x-user-id` | User's unique ID | `123` |

### Using Headers in Route Handlers

```typescript
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Extract user info set by middleware
  const userEmail = request.headers.get('x-user-email');
  const userRole = request.headers.get('x-user-role');
  const userId = request.headers.get('x-user-id');

  return NextResponse.json({
    authenticatedUser: {
      id: userId,
      email: userEmail,
      role: userRole,
    }
  });
}
```

---

## Error Responses

### 401 Unauthorized - Missing Token

Returned when no Authorization header or Bearer token is provided.

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Missing or invalid Authorization header. Expected: Authorization: Bearer <token>",
  "code": "MISSING_TOKEN"
}
```

### 403 Forbidden - Invalid Token

Returned when JWT is invalid or malformed.

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Invalid token",
  "code": "INVALID_TOKEN"
}
```

### 403 Forbidden - Token Expired

Returned when JWT has expired.

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Token has expired",
  "code": "TOKEN_EXPIRED"
}
```

### 403 Forbidden - Insufficient Permissions

Returned when user lacks required role for the route.

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Access denied. This route requires 'admin' role. Your role: 'user'",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

### 403 Forbidden - Invalid Role

Returned when user has unrecognized role.

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Invalid user role: 'superuser'",
  "code": "INVALID_ROLE"
}
```

---

## Extending Roles

### Step 1: Update Role Type

Update the role type definition in [lib/auth.ts](lib/auth.ts):

```typescript
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'editor' | 'moderator'; // Add new roles
  iat: number;
  exp: number;
}
```

### Step 2: Update generateToken Function

```typescript
export function generateToken(
  userId: string,
  email: string,
  role: 'admin' | 'user' | 'editor' | 'moderator' = 'user'
): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}
```

### Step 3: Update Middleware Route Protection

In [app/middleware.ts](app/middleware.ts), add new routes with appropriate role checks:

```typescript
// Add editor route protection
const isEditorRoute = pathname.startsWith('/api/editor');

// Define protected routes
const isProtectedRoute = isAdminRoute || isUsersRoute || isEditorRoute;

// Add editor route check after users route check
if (isEditorRoute && !['admin', 'editor'].includes(payload.role)) {
  return NextResponse.json({
    success: false,
    error: 'Forbidden',
    message: `This route requires 'admin' or 'editor' role. Your role: '${payload.role}'`,
    code: 'INSUFFICIENT_PERMISSIONS'
  }, { status: 403 });
}
```

### Step 4: Create New Route Handler

Create [app/api/editor/route.ts](app/api/editor/route.ts):

```typescript
import { NextRequest, NextResponse } from 'next/server';

/**
 * Editor Route Handler
 * Access: admin and editor roles
 */
export async function GET(request: NextRequest) {
  const userRole = request.headers.get('x-user-role');
  const userEmail = request.headers.get('x-user-email');

  return NextResponse.json({
    success: true,
    message: 'Editor route accessed successfully',
    role: userRole,
    editor: userEmail
  });
}
```

### Role Hierarchy (Recommended)

Design roles with least privilege in mind:

```
admin
  ├── Can manage all resources
  ├── Can manage users
  ├── Can access editor features
  └── Can access user features

editor
  ├── Can edit specific content
  ├── Can moderate comments
  └── Can access user features

user (regular)
  ├── Can access personal dashboard
  ├── Can view public content
  └── Can perform basic operations
```

---

## Security Best Practices

### 1. Least Privilege Principle

Grant users only the minimum permissions needed:

```typescript
// ✓ GOOD: Explicit role check, deny by default
if (payload.role === 'admin') {
  // Allow admin operations
}

// ✗ BAD: Overly permissive, allow everything except super-user
if (payload.role !== 'restricted') {
  // Allow operations
}
```

### 2. JWT Secret Management

**Development:**
```typescript
// OK for local development only
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
```

**Production:**
```typescript
// REQUIRED: Use strong, unique secret
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

Set in `.env.local`:
```
JWT_SECRET=your-super-strong-random-key-min-32-chars-recommended
```

### 3. Token Expiration

Keep token expiration short:

```typescript
// ✓ GOOD: 7 days or less
jwt.sign(payload, secret, { expiresIn: '7d' });

// ✗ BAD: No expiration or very long expiration
jwt.sign(payload, secret, { expiresIn: '365d' });
```

### 4. HTTPS Only

Always use HTTPS in production:

```typescript
// In middleware or route handlers
if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https')) {
  return NextResponse.json(
    { error: 'HTTPS required' },
    { status: 403 }
  );
}
```

### 5. Rate Limiting

Implement rate limiting on authentication endpoints:

```typescript
// Prevent brute force attacks on /api/auth/login
// Consider using packages like: express-rate-limit, redis-based limiting
```

### 6. Secure Header Propagation

Never expose sensitive data in headers:

```typescript
// ✓ GOOD: Only user metadata
requestHeaders.set('x-user-email', payload.email);
requestHeaders.set('x-user-role', payload.role);

// ✗ BAD: Never send this in headers
// requestHeaders.set('x-jwt-token', token);
```

### 7. CORS Configuration

Configure CORS properly:

```typescript
// In next.config.ts or route handler
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

---

## Testing the Middleware

### 1. Generate Test Tokens

```bash
# Using curl and jq to test
NODE_ENV=development node -e "
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

const adminToken = jwt.sign(
  { userId: '123', email: 'admin@example.com', role: 'admin' },
  secret,
  { expiresIn: '7d' }
);

const userToken = jwt.sign(
  { userId: '456', email: 'user@example.com', role: 'user' },
  secret,
  { expiresIn: '7d' }
);

console.log('Admin Token:', adminToken);
console.log('User Token:', userToken);
"
```

### 2. Test Admin Route Access

```bash
# Admin accessing admin route (should succeed)
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <admin_token>"

# User accessing admin route (should fail with 403)
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <user_token>"
```

### 3. Test Users Route Access

```bash
# Admin accessing users route (should succeed)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <admin_token>"

# User accessing users route (should succeed)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <user_token>"
```

### 4. Test Without Token

```bash
# Missing authorization header (should fail with 401)
curl -X GET http://localhost:3000/api/users
```

### 5. Test Expired Token

```bash
# Generate an expired token
const expiredToken = jwt.sign(
  { userId: '123', email: 'admin@example.com', role: 'admin' },
  secret,
  { expiresIn: '0s' } // Expires immediately
);

# Try to use expired token (should fail with 403)
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <expired_token>"
```

### 6. Automated Testing

Create [__tests__/middleware.test.ts](__tests__/middleware.test.ts):

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret';

describe('Middleware RBAC', () => {
  it('should allow admin to access /api/admin', () => {
    const token = jwt.sign(
      { userId: '1', email: 'admin@test.com', role: 'admin' },
      JWT_SECRET
    );
    // Add test assertion
  });

  it('should deny user from accessing /api/admin', () => {
    const token = jwt.sign(
      { userId: '2', email: 'user@test.com', role: 'user' },
      JWT_SECRET
    );
    // Add test assertion
  });

  it('should allow user to access /api/users', () => {
    const token = jwt.sign(
      { userId: '2', email: 'user@test.com', role: 'user' },
      JWT_SECRET
    );
    // Add test assertion
  });
});
```

---

## Summary

This RBAC middleware provides:

✓ **JWT-based authentication** - Validates user identity  
✓ **Role-based authorization** - Enforces access control  
✓ **Least privilege** - Deny by default, allow specific roles  
✓ **Request augmentation** - User info available in route handlers  
✓ **Scalable design** - Easy to add new roles and routes  
✓ **Type-safe** - Full TypeScript support  
✓ **Clear error responses** - Meaningful messages for debugging  

### Key Files

- [app/middleware.ts](app/middleware.ts) - Main middleware implementation
- [lib/auth.ts](lib/auth.ts) - JWT generation and verification
- [app/api/admin/route.ts](app/api/admin/route.ts) - Admin-only route example
- [app/api/users/route.ts](app/api/users/route.ts) - User-accessible route example

### Next Steps

1. Set `JWT_SECRET` in `.env.local`
2. Update login/signup routes to assign roles
3. Test with generated tokens
4. Add additional roles as needed
5. Implement rate limiting on auth endpoints
6. Configure CORS for production
