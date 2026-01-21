# Testing the APIs - PowerShell Commands

# Step 1: Start the development server (in a separate terminal)
# cd "c:\Users\venka\OneDrive\Desktop\WorkInt\S69-012026-ArtRoot-Full-Stack-With-NextjsAnd-AWS-Azure-tribal-art-marketplace\artroot"
# npm run dev

# Step 2: Wait for server to start, then test endpoints

# ========================================
# ARTISTS API TESTS
# ========================================

# Test 1: Get all artists
Write-Host "`n=== Test 1: GET /api/artists ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:5000/api/artists" -Method GET | ConvertTo-Json -Depth 5

# Test 2: Get artists with pagination
Write-Host "`n=== Test 2: GET /api/artists with pagination ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:5000/api/artists?page=1&limit=2" -Method GET | ConvertTo-Json -Depth 5

# Test 3: Get verified artists
Write-Host "`n=== Test 3: GET /api/artists?verified=true ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:5000/api/artists?verified=true" -Method GET | ConvertTo-Json -Depth 5

# Test 4: Get artist by ID
Write-Host "`n=== Test 4: GET /api/artists/1 ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:5000/api/artists/1" -Method GET | ConvertTo-Json -Depth 5

# Test 5: Create new artist
Write-Host "`n=== Test 5: POST /api/artists ===" -ForegroundColor Cyan
$newArtist = @{
    name = "Sita Sharma"
    tribe = "Gond"
    location = "Madhya Pradesh, India"
    verified = $false
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/artists" -Method POST -Body $newArtist -ContentType "application/json" | ConvertTo-Json -Depth 5

# Test 6: Update artist
Write-Host "`n=== Test 6: PUT /api/artists/4 ===" -ForegroundColor Cyan
$updateArtist = @{
    verified = $true
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/artists/4" -Method PUT -Body $updateArtist -ContentType "application/json" | ConvertTo-Json -Depth 5

# ========================================
# ARTWORKS API TESTS
# ========================================

# Test 7: Get all artworks
Write-Host "`n=== Test 7: GET /api/artworks ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:5000/api/artworks" -Method GET | ConvertTo-Json -Depth 5

# Test 8: Get artworks with filters
Write-Host "`n=== Test 8: GET /api/artworks with filters ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:5000/api/artworks?tribe=Warli&minPrice=5000&maxPrice=8000" -Method GET | ConvertTo-Json -Depth 5

# Test 9: Get artwork by ID
Write-Host "`n=== Test 9: GET /api/artworks/1 ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:5000/api/artworks/1" -Method GET | ConvertTo-Json -Depth 5

# Test 10: Create new artwork
Write-Host "`n=== Test 10: POST /api/artworks ===" -ForegroundColor Cyan
$newArtwork = @{
    title = "Sunset Dance"
    artistId = 1
    artistName = "Ramesh Kumar"
    price = 8500
    tribe = "Warli"
    medium = "Natural pigments on cloth"
    size = "30x42 inches"
    description = "Dancers celebrating the sunset ritual"
    verified = $true
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/artworks" -Method POST -Body $newArtwork -ContentType "application/json" | ConvertTo-Json -Depth 5

# Test 11: Update artwork
Write-Host "`n=== Test 11: PUT /api/artworks/1 ===" -ForegroundColor Cyan
$updateArtwork = @{
    price = 5500
    available = $true
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/artworks/1" -Method PUT -Body $updateArtwork -ContentType "application/json" | ConvertTo-Json -Depth 5

# ========================================
# USERS API TESTS
# ========================================

# Test 12: Get all users
Write-Host "`n=== Test 12: GET /api/users ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method GET | ConvertTo-Json -Depth 5

# Test 13: Get users by role
Write-Host "`n=== Test 13: GET /api/users?role=artist ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:5000/api/users?role=artist" -Method GET | ConvertTo-Json -Depth 5

# Test 14: Get user by ID
Write-Host "`n=== Test 14: GET /api/users/1 ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:5000/api/users/1" -Method GET | ConvertTo-Json -Depth 5

# Test 15: Create new user
Write-Host "`n=== Test 15: POST /api/users ===" -ForegroundColor Cyan
$newUser = @{
    name = "Charlie Brown"
    email = "charlie@example.com"
    role = "buyer"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method POST -Body $newUser -ContentType "application/json" | ConvertTo-Json -Depth 5

# Test 16: Update user
Write-Host "`n=== Test 16: PUT /api/users/1 ===" -ForegroundColor Cyan
$updateUser = @{
    name = "Alice Johnson Updated"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/users/1" -Method PUT -Body $updateUser -ContentType "application/json" | ConvertTo-Json -Depth 5

# ========================================
# ORDERS API TESTS
# ========================================

# Test 17: Get all orders
Write-Host "`n=== Test 17: GET /api/orders ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:5000/api/orders" -Method GET | ConvertTo-Json -Depth 5

# Test 18: Get orders by user
Write-Host "`n=== Test 18: GET /api/orders?userId=1 ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:5000/api/orders?userId=1" -Method GET | ConvertTo-Json -Depth 5

# Test 19: Get order by ID
Write-Host "`n=== Test 19: GET /api/orders/1 ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:5000/api/orders/1" -Method GET | ConvertTo-Json -Depth 5

# Test 20: Create new order
Write-Host "`n=== Test 20: POST /api/orders ===" -ForegroundColor Cyan
$newOrder = @{
    userId = 1
    userName = "Alice Johnson"
    artworkId = 2
    artworkTitle = "Sacred Tree"
    artistId = 1
    price = 7500
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/orders" -Method POST -Body $newOrder -ContentType "application/json" | ConvertTo-Json -Depth 5

# Test 21: Update order status
Write-Host "`n=== Test 21: PUT /api/orders/2 ===" -ForegroundColor Cyan
$updateOrder = @{
    status = "processing"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/orders/2" -Method PUT -Body $updateOrder -ContentType "application/json" | ConvertTo-Json -Depth 5

Write-Host "`n=== All Tests Complete ===" -ForegroundColor Green
