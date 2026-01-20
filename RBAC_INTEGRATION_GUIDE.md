# RBAC Authorization Integration Guide

This guide explains how to update the Postman collection and test the RBAC authorization middleware.

## Prerequisites

- Node.js 18+
- Next.js development server running: `npm run dev`
- `.env.local` configured with `JWT_SECRET`

## Step 1: Set JWT_SECRET

Create or update `.env.local` in the `artroot/` directory:

```bash
JWT_SECRET=your-super-strong-random-key-minimum-32-characters-recommended
```

For development, you can use:
```bash
JWT_SECRET=dev-secret-key-for-local-testing-only
```

⚠️ **Production**: Use a strong, randomly generated key (min 32 characters).

## Step 2: Test Authorization Flow

### Using PowerShell Test Script

Navigate to the `artroot/` directory and run:

```powershell
.\test-rbac.ps1
```

This script will:
- Generate admin and user tokens
- Test admin access to `/api/admin`
- Test user access restrictions
- Verify error responses

### Using cURL

Generate tokens manually:

```bash
# Generate Admin Token
node -e "
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'dev-secret-key-for-local-testing-only';
const token = jwt.sign(
  { userId: 'admin-123', email: 'admin@example.com', role: 'admin' },
  secret,
  { expiresIn: '7d' }
);
console.log('Admin Token:', token);
"

# Generate User Token
node -e "
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'dev-secret-key-for-local-testing-only';
const token = jwt.sign(
  { userId: 'user-456', email: 'user@example.com', role: 'user' },
  secret,
  { expiresIn: '7d' }
);
console.log('User Token:', token);
"
```

Test endpoints:

```bash
# Admin accessing admin route (success)
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# User accessing users route (success)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <USER_TOKEN>"

# User accessing admin route (denied)
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <USER_TOKEN>"
```

## Step 3: Update Postman Collection

### Option A: Manual Updates

1. **Prepare tokens** using one of the methods above
2. **In Postman**, create a new folder: `RBAC Tests`
3. **Create requests:**

```
POST /api/auth/login
├── Body (JSON)
├── Admin login request
├── User login request

GET /api/admin
├── Authorization: Bearer {admin_token}
├── Test: Admin can access

GET /api/users
├── Authorization: Bearer {user_token}
├── Test: User can access

POST /api/users
├── Authorization: Bearer {admin_token}
├── Body (JSON)
├── Test: Admin can post

DELETE /api/admin
├── Authorization: Bearer {user_token}
├── Test: User denied access
```

### Option B: Use Pre-request Scripts

Add this pre-request script to generate tokens dynamically:

```javascript
// Pre-request Script for RBAC Test Collection
const jwt = require('jsonwebtoken');

// Get secret from environment variable or use default
const secret = pm.environment.get('JWT_SECRET') || 'dev-secret-key-for-local-testing-only';

// Determine role from request URL
let role = 'user';
if (pm.request.url.includes('/api/admin')) {
  role = 'admin';
}

// Generate token
const token = jwt.sign(
  {
    userId: role === 'admin' ? 'admin-123' : 'user-456',
    email: role === 'admin' ? 'admin@example.com' : 'user@example.com',
    role: role
  },
  secret,
  { expiresIn: '7d' }
);

// Set token in environment variable
pm.environment.set('jwt_token', token);

// Add Authorization header
pm.request.headers.add({
  key: 'Authorization',
  value: 'Bearer ' + token
});

console.log(`Generated ${role} token for ${pm.request.url}`);
```

### Setting Environment Variables in Postman

1. Click **Environments** → **Create Environment**
2. Name it: `ArtRoot RBAC`
3. Add variables:

```
JWT_SECRET: your-dev-secret-key
BASE_URL: http://localhost:3000
ADMIN_TOKEN: (will be auto-generated)
USER_TOKEN: (will be auto-generated)
```

## Step 4: Test Access Control Rules

### Test Matrix

| User Role | Route | Expected | Status |
|-----------|-------|----------|--------|
| admin | GET /api/admin | Allow | 200 |
| admin | GET /api/users | Allow | 200 |
| admin | POST /api/users | Allow | 200 |
| user | GET /api/admin | Deny | 403 |
| user | GET /api/users | Allow | 200 |
| user | POST /api/users | Allow | 200 |
| none | GET /api/users | Deny | 401 |

### Postman Test Scripts

Add Tests to verify responses:

```javascript
// Test 1: Verify admin access
pm.test("Admin can access /api/admin", function () {
    pm.expect(pm.response.code).to.equal(200);
    pm.expect(pm.response.json().success).to.equal(true);
    pm.expect(pm.response.json().data.accessLevel).to.equal('admin');
});

// Test 2: Verify access denied
pm.test("User denied access to /api/admin", function () {
    pm.expect(pm.response.code).to.equal(403);
    pm.expect(pm.response.json().success).to.equal(false);
    pm.expect(pm.response.json().code).to.equal('INSUFFICIENT_PERMISSIONS');
});

// Test 3: Verify user can access users route
pm.test("User can access /api/users", function () {
    pm.expect(pm.response.code).to.equal(200);
    pm.expect(pm.response.json().success).to.equal(true);
});

// Test 4: Missing token
pm.test("Missing token returns 401", function () {
    pm.expect(pm.response.code).to.equal(401);
    pm.expect(pm.response.json().code).to.equal('MISSING_TOKEN');
});

// Test 5: Invalid token
pm.test("Invalid token returns 403", function () {
    pm.expect(pm.response.code).to.equal(403);
    pm.expect(pm.response.json().code).to.be.oneOf(['INVALID_TOKEN', 'TOKEN_EXPIRED']);
});
```

## Step 5: Verify Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Missing or invalid Authorization header. Expected: Authorization: Bearer <token>",
  "code": "MISSING_TOKEN"
}
```

### 403 Forbidden - Invalid Token
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Invalid token",
  "code": "INVALID_TOKEN"
}
```

### 403 Forbidden - Insufficient Permissions
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Access denied. This route requires 'admin' role. Your role: 'user'",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

## Step 6: Extend with Additional Routes

### Pattern for New Protected Routes

```typescript
// File: app/api/editor/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Editor Route Handler
 * Access: admin and editor roles
 */
export async function GET(request: NextRequest) {
  const userRole = request.headers.get('x-user-role');

  if (!['admin', 'editor'].includes(userRole || '')) {
    return NextResponse.json({
      success: false,
      error: 'Forbidden',
      message: `This route requires 'admin' or 'editor' role`,
      code: 'INSUFFICIENT_PERMISSIONS'
    }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    message: 'Editor route accessed successfully',
    role: userRole
  });
}
```

Update middleware.ts:

```typescript
const isEditorRoute = pathname.startsWith('/api/editor');
const isProtectedRoute = isAdminRoute || isUsersRoute || isEditorRoute;

// ... authorization checks
if (isEditorRoute && !['admin', 'editor'].includes(payload.role)) {
  return NextResponse.json({
    success: false,
    error: 'Forbidden',
    code: 'INSUFFICIENT_PERMISSIONS'
  }, { status: 403 });
}
```

## Troubleshooting

### Issue: Token Generation Fails
**Solution**: Ensure Node.js and jsonwebtoken are installed
```bash
npm list jsonwebtoken
npm install jsonwebtoken @types/jsonwebtoken
```

### Issue: JWT_SECRET Not Found
**Solution**: Set JWT_SECRET in `.env.local`
```bash
echo "JWT_SECRET=your-secret-key" > .env.local
```

### Issue: 401 Unauthorized on All Requests
**Solution**: Verify Authorization header format
```bash
# ✓ Correct
Authorization: Bearer eyJhbGc...

# ✗ Incorrect
Authorization: eyJhbGc...
Authorization: Token eyJhbGc...
```

### Issue: 403 Forbidden on Valid Admin Token
**Solution**: Check JWT_SECRET matches between generation and verification
- Token generated with: `secret-A`
- Middleware verifying with: `secret-B` ← Mismatch!

Fix: Ensure same `JWT_SECRET` environment variable is used everywhere

## Next Steps

1. ✅ Set `JWT_SECRET` in `.env.local`
2. ✅ Run `npm run dev` to start development server
3. ✅ Run `.\test-rbac.ps1` to verify middleware works
4. ✅ Update Postman collection with RBAC tests
5. ✅ Integrate with your frontend to use JWT tokens
6. ✅ Add database role assignment in login/signup routes

## Additional Resources

- [Complete RBAC Documentation](RBAC_AUTHORIZATION.md)
- [Quick Reference](RBAC_QUICK_REFERENCE.md)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [JWT.io Debugger](https://jwt.io)
