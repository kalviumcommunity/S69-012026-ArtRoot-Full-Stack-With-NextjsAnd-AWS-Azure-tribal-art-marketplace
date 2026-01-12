# Project Plan – 4-Week Simulated Work Sprint

## Project Title
**ArtRoot – A Fair-Trade Tribal & Rural Art Marketplace**

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

## 13. Conclusion
ArtRoot empowers tribal and rural artists by providing direct digital access to global buyers. This 4-week sprint delivers a clean, scalable MVP that highlights transparency, fairness, and cultural preservation.
