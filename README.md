# Project Plan – 4-Week Simulated Work Sprint

## Project Title
**ArtRoot – A Fair-Trade Tribal & Rural Art Marketplace**

---

## Technical Architecture & Setup

### Structure
The project is split into two distinct services:
- **Frontend (`artroot/`)**: Next.js 13+ application (App Router) running on port 3000.
- **Backend (`backend/`)**: Express.js application running on port 5000.

### Setup Instructions

#### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server runs at http://localhost:5000
```

#### 2. Frontend Setup
```bash
cd artroot
npm install
npm run dev
# App runs at http://localhost:3000
```

### Environment Variables
**Frontend (`artroot/.env.local`)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Backend (`backend/.env`)**
```
PORT=5000
JWT_SECRET=your-secret-key
```

---

## 1. Problem Statement & Solution Overview

### Problem Statement
Tribal and rural artists often lose the true value of their artwork due to middlemen who control pricing, market access, and distribution. These intermediaries reduce artist earnings, obscure authenticity, and disconnect buyers from the cultural significance of the art.

This issue is especially prominent in rural and indigenous communities that lack digital access and global reach, leading to economic inequality and cultural erosion.

### Solution Overview
**ArtRoot** is a full-stack web platform that directly connects tribal and rural artists with global buyers. The platform eliminates middlemen, allows artists to set fair prices, and builds trust through verified artist profiles and authenticity indicators.

### Checklist
- **Why is this problem relevant?**  
  Artists lose income and recognition; buyers lack authenticity assurance.
- **Who faces it (target users)?**  
  Tribal & rural artists, global buyers, cultural organizations.
- **What value does your solution bring?**  
  Fair trade, transparency, authenticity, cultural preservation.

---

## 2. Scope & Boundaries

### ✅ In Scope (MVP)
- User authentication (Artist & Buyer)
- Artwork listing and browsing
- Artist profile pages
- Artwork detail pages with stories
- Verified authenticity badge (manual/admin-based)
- Secure REST APIs
- Cloud deployment (AWS/Azure + Vercel)

### ❌ Out of Scope
- Real payment gateway integration
- Blockchain/NFT certificates
- Mobile application
- Logistics & shipping integration
- Advanced analytics

---

## 3. Roles & Responsibilities

| Role | Team Member | Key Responsibilities |
|----|----|----|
| Frontend Lead | **Yashuwant John M Vijay** | Next.js UI, routing, API integration, responsive design |
| Backend Lead | **Konetisetty Venkateswara** | API design, authentication, business logic, DB integration |
| Cloud + Integration Lead | **Naorem Nganthoiba Singh** | AWS/Azure deployment, CI/CD, integration |

---

## 4. Sprint Timeline (4 Weeks)

### Week 1 – Setup & Design  
**Focus:** Architecture & planning  
**Deliverables:**
- Project repo setup
- Frontend & backend boilerplate
- GitHub workflow
- HLD & LLD
- Database schema (Users, Artists, Artworks)
- Environment variable strategy

---

### Week 2 – Backend & Database  
**Focus:** Core backend development  
**Deliverables:**
- Database setup
- Auth APIs (Signup/Login)
- Artwork CRUD APIs
- Artist profile APIs
- Validation & error handling
- Seed demo data

---

### Week 3 – Frontend & Integration  
**Focus:** UI & API integration  
**Deliverables:**
- Public & protected routes
- Homepage & marketplace
- Artwork listing & detail pages
- Artist profiles
- Loading & error states

---

### Week 4 – Deployment & Finalization  
**Focus:** Production readiness  
**Deliverables:**
- Cloud deployment
- Environment & secrets management
- End-to-end testing
- Final documentation
- MVP demo preparation

---

## 5. Deployment and Testing Plan

### Testing Strategy
- Unit testing for backend APIs
- Manual API testing (Postman)
- End-to-end testing:
  - Browse artworks
  - View artwork details
  - Upload artwork

### Deployment Strategy
- Frontend: Vercel
- Backend: AWS EC2 / Azure App Service
- Database: MongoDB Atlas
- Secrets: Environment variables

---

## 6. MVP (Minimum Viable Product)

### Core MVP Features
- User signup & login
- Browse artworks
- View artwork details
- Artist profile & storytelling
- Verified authenticity indicator
- Fully deployed application

---

## 7. Core Project Components

### Authentication
- Sign Up
- Sign In
- JWT-based authentication

### Core Application
- Marketplace dashboard
- Artist profile management
- Artwork upload (artist)

### General Pages
- Home page (fair-trade mission)
- Navbar & footer
- Error & loading pages

---

## 8. Functional Requirements
- Secure user authentication
- Artists can add/manage artworks
- Buyers can browse/view artworks
- Artwork shows artist story & region
- Verified authenticity indicator

---

## 9. Non-Functional Requirements
- Performance: API response < 500ms
- Scalability: 100+ concurrent users
- Security: Hashed passwords, protected APIs
- Reliability: Stable cloud deployment

---

## 10. Success Metrics
- Fully deployed MVP
- End-to-end integration
- Clear fair-trade value demonstration
- Positive mentor/demo feedback

---

## 11. Risks & Mitigation

| Risk | Impact | Mitigation |
|----|----|----|
| Limited time | Incomplete features | Strict MVP scope |
| Integration delays | Demo issues | Early API contracts |
| Cloud issues | Downtime | Local + cloud testing |

---

## 12. RESTful API Documentation

### API Route Hierarchy

All API endpoints follow RESTful design principles with resource-based naming conventions. The base URL for all endpoints is `/api/`.

```
app/api/
├── artists/
│   ├── route.ts          (GET, POST)
│   └── [id]/
│       └── route.ts      (GET, PUT, DELETE)
├── artworks/
│   ├── route.ts          (GET, POST)
│   └── [id]/
│       └── route.ts      (GET, PUT, DELETE)
├── users/
│   ├── route.ts          (GET, POST)
│   └── [id]/
│       └── route.ts      (GET, PUT, DELETE)
└── orders/
    ├── route.ts          (GET, POST)
    └── [id]/
        └── route.ts      (GET, PUT, DELETE)
```

---

### Artists API

#### `GET /api/artists`
**Description:** Get all artists with pagination and filtering  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `tribe` (optional): Filter by tribe name
- `verified` (optional): Filter by verification status (true/false)

**Sample Request:**
```bash
curl -X GET "http://localhost:3000/api/artists?page=1&limit=10&verified=true"
```

**Sample Response:**
```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 2,
  "totalPages": 1,
  "data": [
    {
      "id": 1,
      "name": "Ramesh Kumar",
      "tribe": "Warli",
      "location": "Maharashtra, India",
      "verified": true,
      "artworks": 12
    }
  ]
}
```

#### `POST /api/artists`
**Description:** Create a new artist  
**Required Fields:** `name`, `tribe`, `location`

**Sample Request:**
```bash
curl -X POST http://localhost:3000/api/artists \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sita Sharma",
    "tribe": "Gond",
    "location": "Madhya Pradesh, India",
    "verified": false
  }'
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Artist created successfully",
  "data": {
    "id": 4,
    "name": "Sita Sharma",
    "tribe": "Gond",
    "location": "Madhya Pradesh, India",
    "verified": false,
    "artworks": 0
  }
}
```

#### `GET /api/artists/:id`
**Description:** Get artist by ID

**Sample Request:**
```bash
curl -X GET http://localhost:3000/api/artists/1
```

#### `PUT /api/artists/:id`
**Description:** Update artist by ID

**Sample Request:**
```bash
curl -X PUT http://localhost:3000/api/artists/1 \
  -H "Content-Type: application/json" \
  -d '{"verified": true}'
```

#### `DELETE /api/artists/:id`
**Description:** Delete artist by ID

**Sample Request:**
```bash
curl -X DELETE http://localhost:3000/api/artists/1
```

---

### Artworks API

#### `GET /api/artworks`
**Description:** Get all artworks with pagination and filtering  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `artistId` (optional): Filter by artist ID
- `tribe` (optional): Filter by tribe name
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `available` (optional): Filter by availability (true/false)

**Sample Request:**
```bash
curl -X GET "http://localhost:3000/api/artworks?tribe=Warli&minPrice=5000&maxPrice=10000"
```

**Sample Response:**
```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 2,
  "totalPages": 1,
  "data": [
    {
      "id": 1,
      "title": "Village Harvest",
      "artistId": 1,
      "artistName": "Ramesh Kumar",
      "price": 5000,
      "tribe": "Warli",
      "medium": "Acrylic on Canvas",
      "size": "24x36 inches",
      "description": "Traditional Warli painting depicting the harvest season",
      "verified": true,
      "available": true
    }
  ]
}
```

#### `POST /api/artworks`
**Description:** Create a new artwork  
**Required Fields:** `title`, `artistId`, `price`, `tribe`, `medium`

**Sample Request:**
```bash
curl -X POST http://localhost:3000/api/artworks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sunset Dance",
    "artistId": 1,
    "artistName": "Ramesh Kumar",
    "price": 8500,
    "tribe": "Warli",
    "medium": "Natural pigments on cloth",
    "size": "30x42 inches",
    "description": "Dancers celebrating the sunset ritual",
    "verified": true
  }'
```

#### `GET /api/artworks/:id`
**Description:** Get artwork by ID

#### `PUT /api/artworks/:id`
**Description:** Update artwork by ID

#### `DELETE /api/artworks/:id`
**Description:** Delete artwork by ID

---

### Users API

#### `GET /api/users`
**Description:** Get all users with pagination  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (buyer/artist/admin)

**Sample Request:**
```bash
curl -X GET "http://localhost:3000/api/users?role=artist"
```

#### `POST /api/users`
**Description:** Create a new user  
**Required Fields:** `name`, `email`, `role`  
**Valid Roles:** buyer, artist, admin

**Sample Request:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie Brown",
    "email": "charlie@example.com",
    "role": "buyer"
  }'
```

#### `GET /api/users/:id`
**Description:** Get user by ID

#### `PUT /api/users/:id`
**Description:** Update user by ID

#### `DELETE /api/users/:id`
**Description:** Delete user by ID

---

### Orders API

#### `GET /api/orders`
**Description:** Get all orders with pagination  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `userId` (optional): Filter by user ID
- `status` (optional): Filter by order status

**Sample Request:**
```bash
curl -X GET "http://localhost:3000/api/orders?userId=1&status=pending"
```

**Sample Response:**
```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1,
  "data": [
    {
      "id": 2,
      "userId": 2,
      "userName": "Bob Smith",
      "artworkId": 3,
      "artworkTitle": "Wedding Ceremony",
      "artistId": 2,
      "price": 6500,
      "status": "pending",
      "createdAt": "2026-01-11",
      "updatedAt": "2026-01-11"
    }
  ]
}
```

#### `POST /api/orders`
**Description:** Create a new order  
**Required Fields:** `userId`, `artworkId`, `price`

**Sample Request:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "userName": "Alice Johnson",
    "artworkId": 2,
    "artworkTitle": "Sacred Tree",
    "artistId": 1,
    "price": 7500
  }'
```

#### `GET /api/orders/:id`
**Description:** Get order by ID

#### `PUT /api/orders/:id`
**Description:** Update order by ID (typically for status updates)  
**Valid Statuses:** pending, processing, shipped, completed, cancelled

**Sample Request:**
```bash
curl -X PUT http://localhost:3000/api/orders/2 \
  -H "Content-Type: application/json" \
  -d '{"status": "processing"}'
```

#### `DELETE /api/orders/:id`
**Description:** Delete order by ID (cancel order)  
**Note:** Cannot delete completed or shipped orders

---

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input or validation error |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (e.g., email exists) |
| 500 | Internal Server Error | Unexpected server error |

---

### Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

### Pagination Response Format

All paginated responses include:
- `page`: Current page number
- `limit`: Items per page
- `total`: Total number of items matching filters
- `totalPages`: Total number of pages
- `data`: Array of items for current page

---

### API Design Reflection

#### Naming Consistency
- **Resource-based URLs**: All endpoints use plural nouns (`/artists`, `/artworks`, `/users`, `/orders`) rather than actions, making the API intuitive and predictable
- **Lowercase convention**: Consistent lowercase naming prevents case-sensitivity issues
- **Hierarchical structure**: Clear parent-child relationships (e.g., `/artists/[id]` for specific artist)

#### Benefits of Consistent Naming
1. **Reduced Integration Errors**: Frontend developers can predict endpoint names without documentation
2. **Easier Maintenance**: Clear patterns make it simple to add new resources
3. **Better Developer Experience**: Standardized responses and error formats reduce confusion
4. **Scalability**: Adding new endpoints follows established patterns

#### Error Design Benefits
- **Meaningful Status Codes**: HTTP codes convey operation results before parsing response
- **Consistent Error Format**: All errors follow same structure for easier handling
- **Validation Feedback**: Clear messages help developers fix integration issues quickly
- **Graceful Degradation**: Proper error handling prevents application crashes

#### Pagination Design
- **Performance**: Loading data in chunks prevents memory issues
- **Flexibility**: Query parameters allow filtering without separate endpoints
- **User Experience**: Clients can implement infinite scroll or traditional pagination
- **Metadata**: Response includes all information needed for UI controls

---

## Role-Based Access Control (RBAC)

### Overview
ArtRoot implements a comprehensive Role-Based Access Control system to ensure users only access resources they're authorized to. This security model assigns permissions based on user roles rather than individual identities, making it scalable and maintainable.

### Role Hierarchy

| Role | Permissions | Description |
|------|-------------|-------------|
| **Admin** | create, read, update, delete, manage_users | Full system access including user management |
| **Artist** | create, read, update | Can create and manage own artworks |
| **Viewer** | read | Read-only access to public content |

### Permission Matrix

| Action | Admin | Artist | Viewer |
|--------|-------|--------|--------|
| View artworks | ✓ | ✓ | ✓ |
| Create artwork | ✓ | ✓ | ✗ |
| Update own artwork | ✓ | ✓ | ✗ |
| Update any artwork | ✓ | ✗ | ✗ |
| Delete own artwork | ✓ | ✗ | ✗ |
| Delete any artwork | ✓ | ✗ | ✗ |
| Verify artwork | ✓ | ✗ | ✗ |
| Manage users | ✓ | ✗ | ✗ |

### Implementation Details

#### Backend RBAC
**Location**: `backend/src/config/roles.ts`, `backend/src/middleware/rbac.ts`

**Key Features**:
1. **Centralized Role Configuration**: All roles and permissions defined in one place
2. **JWT-Based Authentication**: User role embedded in JWT token
3. **Permission Middleware**: Reusable middleware checks permissions before allowing access
4. **Ownership Verification**: Artists can only modify their own artworks, admin can modify any
5. **Audit Logging**: All RBAC decisions logged with timestamp, user, and result

**Example Usage**:
```typescript
// Protect route requiring 'create' permission
router.post('/artworks', 
  authenticateToken, 
  requirePermission('create'), 
  createArtworkHandler
);

// Protect route requiring ownership or admin role
router.put('/artworks/:id',
  authenticateToken,
  requirePermission('update'),
  requireOwnershipOrAdmin(getArtworkOwnerId),
  updateArtworkHandler
);
```

#### Frontend RBAC
**Location**: `artroot/lib/rbac.ts`, `artroot/components/Protected.tsx`

**Key Features**:
1. **Role-Based UI Rendering**: Components conditionally render based on user permissions
2. **Permission Hooks**: React hooks for checking permissions in components
3. **Protected Components**: Wrapper components hide/show content based on roles
4. **AuthProvider Context**: Global authentication state management

**Example Usage**:
```tsx
// Conditionally render based on permission
<Protected requirePermission="create">
  <button>Create Artwork</button>
</Protected>

// Conditionally render based on role
<Protected requireRole={['admin', 'artist']}>
  <EditButton />
</Protected>

// Check ownership
<RequireOwnership resourceOwnerId={artwork.artistId}>
  <DeleteButton />
</RequireOwnership>
```

### Security Features

#### 1. Role Assignment
- **Default Role**: New users assigned 'viewer' role by default
- **Artist Role**: Users can request 'artist' role during signup
- **Admin Role**: Cannot be self-assigned; must be set manually for security
- **Attempted Privilege Escalation**: Logged as security event

#### 2. Token-Based Authentication
- **JWT Tokens**: Include userId, email, and role
- **7-Day Expiration**: Tokens expire after 7 days
- **Stateless Verification**: No server-side session storage required
- **Frontend Storage**: Tokens stored in localStorage

#### 3. Multi-Layer Protection
- **API Layer**: All sensitive endpoints protected with middleware
- **Business Logic**: Ownership checks before modifying resources
- **UI Layer**: Conditional rendering prevents unauthorized UI access
- **Database Layer**: (Future) Row-level security policies

#### 4. Audit Trail
All RBAC decisions logged with:
- Timestamp (ISO 8601 format)
- User ID and role
- Requested permission
- Resource path
- Decision (ALLOWED/DENIED)

**Example Log Output**:
```
[RBAC] 2026-01-27T10:15:30.123Z | User: 123 | Role: artist | Permission: create | Resource: /api/artworks | Status: ALLOWED
[RBAC] 2026-01-27T10:16:45.456Z | User: 456 | Role: viewer | Permission: delete | Resource: /api/artworks/5 | Status: DENIED
```

### Testing RBAC

#### Test Script
Run `test-rbac.ps1` to verify RBAC implementation:
```powershell
cd S69-012026-ArtRoot-Full-Stack-With-NextjsAnd-AWS-Azure-tribal-art-marketplace
./test-rbac.ps1
```

#### Test Coverage
1. **Artist Signup**: Verify artist role assignment
2. **Viewer Signup**: Verify viewer role assignment  
3. **Admin Login**: Verify admin role from email pattern
4. **Artist Create**: ALLOWED - Artist creates artwork
5. **Viewer Create**: DENIED - Viewer blocked from creating
6. **Viewer Read**: ALLOWED - Viewer can read artworks
7. **Artist Update Own**: ALLOWED - Artist updates own artwork
8. **Viewer Update**: DENIED - Viewer blocked from updating
9. **Admin Delete**: ALLOWED - Admin deletes any artwork
10. **Admin Self-Assignment**: DENIED - Prevents privilege escalation

### Scalability Considerations

#### Current Design Benefits
1. **Simple Role Model**: Three clear roles easy to understand and maintain
2. **Centralized Configuration**: Single source of truth for permissions
3. **Reusable Middleware**: Same permission checks across all routes
4. **Consistent Logging**: Standardized audit trail format

#### Future Enhancements
For more complex systems, consider:

1. **Policy-Based Access Control (PBAC)**
   - Evaluate permissions based on attributes (time, location, resource state)
   - Example: "Artists can update artworks only before they're sold"

2. **Resource-Level Permissions**
   - Fine-grained permissions per resource type
   - Example: Separate permissions for "artwork.price.update" vs "artwork.description.update"

3. **Permission Inheritance**
   - Hierarchical roles where higher roles inherit lower permissions
   - Example: "Senior Artist" inherits all "Artist" permissions plus extras

4. **Dynamic Role Assignment**
   - Users can have multiple roles based on context
   - Example: User is "Viewer" by default but "Artist" for their own listings

5. **External Authorization Service**
   - Centralized auth service for microservices architecture
   - Tools: Open Policy Agent (OPA), AWS IAM, Azure RBAC

### Reflection

#### What Worked Well
- **Separation of Concerns**: RBAC logic separate from business logic
- **Type Safety**: TypeScript enforces role and permission types
- **Reusability**: Same RBAC logic works for all protected resources
- **Transparency**: Audit logs provide clear visibility into access decisions

#### Challenges Addressed
- **Ownership Verification**: Implemented middleware to check resource ownership
- **Admin Privilege Abuse**: Prevented self-assignment of admin role
- **Consistent Enforcement**: Both frontend and backend enforce same rules
- **Developer Experience**: Simple API makes it easy to protect new routes

#### Lessons Learned
1. **Start Simple**: Three roles cover most use cases; more complexity can be added later
2. **Log Everything**: Audit trail crucial for debugging and security analysis
3. **Fail Secure**: Default to denying access when in doubt
4. **Frontend is Not Security**: Backend must always verify permissions; UI is convenience only

---

## 13. Conclusion
ArtRoot empowers tribal and rural artists by providing direct digital access to global buyers. This 4-week sprint delivers a clean, scalable MVP that highlights transparency, fairness, and cultural preservation.
