# RBAC Middleware - Quick Reference

## Setup Checklist

- [x] Install `jsonwebtoken` and `@types/jsonwebtoken` (already installed)
- [x] Create `app/middleware.ts` with JWT validation
- [x] Create example routes (`/api/admin`, `/api/users`)
- [ ] Set `JWT_SECRET` in `.env.local`
- [ ] Update login route to assign roles to users

## Environment Setup

Create `.env.local`:
```
JWT_SECRET=your-super-strong-random-key-minimum-32-characters-recommended
```

## Quick API Tests

### 1. Login (Get Token)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

Response: `{ "token": "eyJhbGc...", "user": {...} }`

### 2. Access Admin Route

```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <token_from_login>"
```

Expected: `200 OK` (if admin), `403 Forbidden` (if not admin)

### 3. Access Users Route

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <token_from_login>"
```

Expected: `200 OK` (any authenticated user)

## Role Assignment

Currently roles are assigned in the login flow. To set user roles:

1. In your database schema, add a `role` column:
```typescript
interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'user'; // Add this
}
```

2. Update login route to fetch and assign role:
```typescript
import { generateToken } from '@/lib/auth';

// In login handler
const user = await fetchUserFromDatabase(email);
const token = generateToken(user.id, user.email, user.role);
```

3. For signup, assign default role:
```typescript
// Default new users to 'user' role
const token = generateToken(newUser.id, newUser.email, 'user');
```

## Error Status Codes

| Status | Meaning | Cause |
|--------|---------|-------|
| 401 | Unauthorized | Missing/invalid Authorization header |
| 403 | Forbidden | Invalid token, expired token, or insufficient role |
| 200 | OK | Successful request |

## Middleware Flow

```
Request → Extract JWT → Verify JWT → Check Role → Add Headers → Route Handler → Response
```

## Common Issues

### 401 Unauthorized
**Problem:** Missing or malformed Authorization header
**Fix:** Include `Authorization: Bearer <token>` header

### 403 Forbidden (Invalid Token)
**Problem:** JWT is invalid or expired
**Fix:** Generate new token or check JWT_SECRET matches

### 403 Forbidden (Insufficient Permissions)
**Problem:** User role doesn't match route requirements
**Fix:** Use admin token for `/api/admin`, any token for `/api/users`

## File Structure

```
artroot/
├── app/
│   ├── middleware.ts ← RBAC authorization logic
│   ├── api/
│   │   ├── admin/route.ts ← admin-only endpoint
│   │   ├── users/route.ts ← authenticated users
│   │   └── auth/
│   │       ├── login/route.ts
│   │       └── signup/route.ts
│   └── ...
├── lib/
│   └── auth.ts ← JWT generation, verification, types
└── RBAC_AUTHORIZATION.md ← Full documentation
```

## Next Steps

1. **Set JWT_SECRET** in `.env.local`
2. **Test with Postman** - Import [ArtRoot_API_Collection.postman_collection.json](../ArtRoot_API_Collection.postman_collection.json)
3. **Add Database Role Assignment** - Connect user table to role column
4. **Implement Rate Limiting** - Protect `/api/auth/login` from brute force
5. **Add More Roles** - Follow guide in RBAC_AUTHORIZATION.md "Extending Roles" section
