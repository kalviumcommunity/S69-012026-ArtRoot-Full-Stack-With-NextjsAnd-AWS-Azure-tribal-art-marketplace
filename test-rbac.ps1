# RBAC Testing Script for ArtRoot API
# This script tests Role-Based Access Control implementation

$API_BASE = "http://localhost:5000/api"
$HEADERS = @{"Content-Type" = "application/json"}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "ArtRoot RBAC Testing" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Signup as Artist
Write-Host "TEST 1: Signup as Artist" -ForegroundColor Yellow
$signupArtist = @{
    name = "Test Artist"
    email = "artist@test.com"
    password = "password123"
    role = "artist"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/auth/signup" -Method Post -Body $signupArtist -Headers $HEADERS
    $ARTIST_TOKEN = $response.token
    Write-Host "SUCCESS: Artist signup successful - Role: $($response.user.role)" -ForegroundColor Green
    Write-Host "Token: $ARTIST_TOKEN" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: Artist signup failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Signup as Viewer
Write-Host "TEST 2: Signup as Viewer" -ForegroundColor Yellow
$signupViewer = @{
    name = "Test Viewer"
    email = "viewer@test.com"
    password = "password123"
    role = "viewer"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/auth/signup" -Method Post -Body $signupViewer -Headers $HEADERS
    $VIEWER_TOKEN = $response.token
    Write-Host "SUCCESS: Viewer signup successful - Role: $($response.user.role)" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Viewer signup failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Login as Admin
Write-Host "TEST 3: Login as Admin" -ForegroundColor Yellow
$loginAdmin = @{
    email = "admin@artroot.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method Post -Body $loginAdmin -Headers $HEADERS
    $ADMIN_TOKEN = $response.token
    Write-Host "SUCCESS: Admin login successful - Role: $($response.user.role)" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Artist creates artwork (SHOULD SUCCEED)
Write-Host "TEST 4: Artist creates artwork (ALLOWED)" -ForegroundColor Yellow
$newArtwork = @{
    title = "Test Artwork"
    price = 5000
    tribe = "Warli"
    medium = "Acrylic"
    description = "Test artwork for RBAC"
} | ConvertTo-Json

$artistHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $ARTIST_TOKEN"
}

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/artworks" -Method Post -Body $newArtwork -Headers $artistHeaders
    Write-Host "ALLOWED: Artist successfully created artwork" -ForegroundColor Green
    $ARTWORK_ID = $response.data.id
    Write-Host "Artwork ID: $ARTWORK_ID" -ForegroundColor Gray
} catch {
    Write-Host "DENIED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Viewer tries to create artwork (SHOULD FAIL)
Write-Host "TEST 5: Viewer tries to create artwork (DENIED)" -ForegroundColor Yellow
$viewerHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $VIEWER_TOKEN"
}

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/artworks" -Method Post -Body $newArtwork -Headers $viewerHeaders
    Write-Host "ERROR: Viewer was allowed to create artwork (should be denied)" -ForegroundColor Red
} catch {
    Write-Host "DENIED: Viewer correctly blocked from creating artwork" -ForegroundColor Green
    Write-Host "Error: $($_.ErrorDetails.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 6: Viewer reads artworks (SHOULD SUCCEED)
Write-Host "TEST 6: Viewer reads artworks (ALLOWED)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/artworks" -Method Get
    Write-Host "ALLOWED: Viewer successfully read artworks" -ForegroundColor Green
    Write-Host "Found $($response.data.Count) artworks" -ForegroundColor Gray
} catch {
    Write-Host "DENIED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Artist updates own artwork (SHOULD SUCCEED)
if ($ARTWORK_ID) {
    Write-Host "TEST 7: Artist updates own artwork (ALLOWED)" -ForegroundColor Yellow
    $updateArtwork = @{
        title = "Updated Test Artwork"
        price = 6000
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/artworks/$ARTWORK_ID" -Method Put -Body $updateArtwork -Headers $artistHeaders
        Write-Host "ALLOWED: Artist successfully updated own artwork" -ForegroundColor Green
    } catch {
        Write-Host "DENIED: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 8: Viewer tries to update artwork (SHOULD FAIL)
if ($ARTWORK_ID) {
    Write-Host "TEST 8: Viewer tries to update artwork (DENIED)" -ForegroundColor Yellow
    $updateArtwork = @{
        title = "Hacked Artwork"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/artworks/$ARTWORK_ID" -Method Put -Body $updateArtwork -Headers $viewerHeaders
        Write-Host "ERROR: Viewer was allowed to update artwork (should be denied)" -ForegroundColor Red
    } catch {
        Write-Host "DENIED: Viewer correctly blocked from updating artwork" -ForegroundColor Green
        Write-Host "Error: $($_.ErrorDetails.Message)" -ForegroundColor Gray
    }
    Write-Host ""
}

# Test 9: Admin deletes artwork (SHOULD SUCCEED)
if ($ARTWORK_ID) {
    Write-Host "TEST 9: Admin deletes artwork (ALLOWED)" -ForegroundColor Yellow
    $adminHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $ADMIN_TOKEN"
    }

    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/artworks/$ARTWORK_ID" -Method Delete -Headers $adminHeaders
        Write-Host "ALLOWED: Admin successfully deleted artwork" -ForegroundColor Green
    } catch {
        Write-Host "DENIED: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 10: Attempt admin self-assignment (SHOULD FAIL)
Write-Host "TEST 10: Attempt admin self-assignment (DENIED)" -ForegroundColor Yellow
$signupAdminAttempt = @{
    name = "Hacker"
    email = "hacker@test.com"
    password = "password123"
    role = "admin"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/auth/signup" -Method Post -Body $signupAdminAttempt -Headers $HEADERS
    Write-Host "ERROR: User was allowed to self-assign admin role (security breach!)" -ForegroundColor Red
} catch {
    Write-Host "DENIED: Admin self-assignment correctly blocked" -ForegroundColor Green
    Write-Host "Error: $($_.ErrorDetails.Message)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "RBAC Testing Complete" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
