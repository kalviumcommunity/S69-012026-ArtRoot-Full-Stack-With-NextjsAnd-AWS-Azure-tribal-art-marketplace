# API Testing Guide

## Quick Start

### 1. Start the Development Server

```bash
cd artroot
npm install
npm run dev
```

The server will start at `http://localhost:3000`

---

## Testing with curl

### Artists Endpoints

```bash
# Get all artists
curl -X GET "http://localhost:3000/api/artists"

# Get artists with pagination and filters
curl -X GET "http://localhost:3000/api/artists?page=1&limit=10&tribe=Warli&verified=true"

# Get artist by ID
curl -X GET "http://localhost:3000/api/artists/1"

# Create new artist
curl -X POST http://localhost:3000/api/artists \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sita Sharma",
    "tribe": "Gond",
    "location": "Madhya Pradesh, India",
    "verified": false
  }'

# Update artist
curl -X PUT http://localhost:3000/api/artists/1 \
  -H "Content-Type: application/json" \
  -d '{"verified": true}'

# Delete artist
curl -X DELETE http://localhost:3000/api/artists/1
```

### Artworks Endpoints

```bash
# Get all artworks
curl -X GET "http://localhost:3000/api/artworks"

# Get artworks with filters
curl -X GET "http://localhost:3000/api/artworks?tribe=Warli&minPrice=5000&maxPrice=10000&available=true"

# Get artwork by ID
curl -X GET "http://localhost:3000/api/artworks/1"

# Create new artwork
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

# Update artwork
curl -X PUT http://localhost:3000/api/artworks/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 9000, "available": false}'

# Delete artwork
curl -X DELETE http://localhost:3000/api/artworks/1
```

### Users Endpoints

```bash
# Get all users
curl -X GET "http://localhost:3000/api/users"

# Get users by role
curl -X GET "http://localhost:3000/api/users?role=artist"

# Get user by ID
curl -X GET "http://localhost:3000/api/users/1"

# Create new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie Brown",
    "email": "charlie@example.com",
    "role": "buyer"
  }'

# Update user
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie Brown Jr."}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/1
```

### Orders Endpoints

```bash
# Get all orders
curl -X GET "http://localhost:3000/api/orders"

# Get orders by user and status
curl -X GET "http://localhost:3000/api/orders?userId=1&status=pending"

# Get order by ID
curl -X GET "http://localhost:3000/api/orders/1"

# Create new order
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

# Update order status
curl -X PUT http://localhost:3000/api/orders/2 \
  -H "Content-Type: application/json" \
  -d '{"status": "processing"}'

# Delete order
curl -X DELETE http://localhost:3000/api/orders/2
```

---

## Testing with Postman

### Import Collection

1. Open Postman
2. Click **Import** button
3. Select `ArtRoot_API_Collection.postman_collection.json`
4. All endpoints will be organized in folders

### Test All Endpoints

The collection includes:
- **Artists**: 6 requests (GET all, GET filtered, GET by ID, POST, PUT, DELETE)
- **Artworks**: 6 requests (GET all, GET filtered, GET by ID, POST, PUT, DELETE)
- **Users**: 6 requests (GET all, GET filtered, GET by ID, POST, PUT, DELETE)
- **Orders**: 6 requests (GET all, GET filtered, GET by ID, POST, PUT, DELETE)

### Environment Setup (Optional)

Create a Postman environment with:
- `baseUrl`: `http://localhost:3000`
- `artistId`: `1`
- `artworkId`: `1`
- `userId`: `1`
- `orderId`: `1`

---

## Expected Responses

### Success Response (GET)
```json
{
  "success": true,
  "data": { ... }
}
```

### Success Response (GET with pagination)
```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3,
  "data": [ ... ]
}
```

### Success Response (POST)
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Testing Checklist

- [ ] All GET endpoints return data successfully
- [ ] Pagination works (page and limit parameters)
- [ ] Filtering works (tribe, verified, role, status, price range)
- [ ] POST creates new resources with valid data
- [ ] POST returns 400 for missing required fields
- [ ] POST returns 400 for invalid data
- [ ] PUT updates existing resources
- [ ] PUT returns 404 for non-existent resources
- [ ] DELETE removes resources
- [ ] DELETE returns 404 for non-existent resources
- [ ] Error responses include meaningful messages
- [ ] Status codes are appropriate (200, 201, 400, 404, 500)

---

## Common Issues

### Issue: Connection Refused
**Solution**: Make sure the dev server is running (`npm run dev`)

### Issue: 404 Not Found
**Solution**: Check the URL path and endpoint spelling

### Issue: 400 Bad Request
**Solution**: Verify required fields are included in POST/PUT requests

### Issue: Empty Response
**Solution**: Check if mock data is properly initialized in route files

---

## Next Steps

1. Test all endpoints using curl or Postman
2. Take screenshots of successful requests
3. Document any issues or edge cases found
4. Add authentication middleware (Week 2 deliverable)
5. Connect to actual database (replace mock data)
