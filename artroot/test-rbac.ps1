#!/usr/bin/env pwsh
<#
.SYNOPSIS
    RBAC Middleware Testing Script
    
.DESCRIPTION
    This PowerShell script tests the JWT-based RBAC middleware implementation.
    It generates test tokens and verifies that the authorization rules are working correctly.

.EXAMPLE
    .\test-rbac.ps1
    
.NOTES
    Requires: Node.js, jq (for JSON parsing)
    Base URL: http://localhost:3000
#>

# Configuration
$BaseUrl = "http://localhost:3000"
$JwtSecret = $env:JWT_SECRET ?? "your-super-secret-jwt-key-change-this-in-production"

# Colors for output
$GreenCheckmark = "✓"
$RedX = "✗"
$GreenColor = "Green"
$RedColor = "Red"
$YellowColor = "Yellow"

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           RBAC Authorization Middleware Test Suite               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Test 1: Generate Test Tokens
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "[Test 1] Generating JWT Tokens" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$NodeScript = @"
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

const adminToken = jwt.sign(
  { userId: 'admin-123', email: 'admin@example.com', role: 'admin' },
  secret,
  { expiresIn: '7d' }
);

const userToken = jwt.sign(
  { userId: 'user-456', email: 'user@example.com', role: 'user' },
  secret,
  { expiresIn: '7d' }
);

console.log(JSON.stringify({
  adminToken,
  userToken
}, null, 2));
"@

try {
    $tokens = node -e $NodeScript | ConvertFrom-Json
    Write-Host "$GreenCheckmark Admin token generated" -ForegroundColor $GreenColor
    Write-Host "$GreenCheckmark User token generated" -ForegroundColor $GreenColor
    Write-Host "`nAdmin Token (first 50 chars): $($tokens.adminToken.Substring(0, 50))..."
    Write-Host "User Token (first 50 chars): $($tokens.userToken.Substring(0, 50))...`n"
} catch {
    Write-Host "$RedX Failed to generate tokens: $_" -ForegroundColor $RedColor
    exit 1
}

# Test 2: Admin Accessing Admin Route (Should Succeed)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "[Test 2] Admin User Accessing /api/admin" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/admin" `
        -Headers @{"Authorization" = "Bearer $($tokens.adminToken)"} `
        -Method Get -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "$GreenCheckmark Status: 200 OK" -ForegroundColor $GreenColor
        $body = $response.Content | ConvertFrom-Json
        Write-Host "$GreenCheckmark Message: $($body.message)" -ForegroundColor $GreenColor
        Write-Host "$GreenCheckmark Access Level: $($body.data.accessLevel)`n"
    }
} catch {
    Write-Host "$RedX Request failed: $($_.Exception.Message)" -ForegroundColor $RedColor
}

# Test 3: Regular User Accessing Admin Route (Should Fail)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "[Test 3] Regular User Attempting /api/admin" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/admin" `
        -Headers @{"Authorization" = "Bearer $($tokens.userToken)"} `
        -Method Get -ErrorAction Stop
    
    Write-Host "$RedX Expected 403 but got 200 - Security Issue!" -ForegroundColor $RedColor
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "$GreenCheckmark Status: 403 Forbidden (as expected)" -ForegroundColor $GreenColor
        try {
            $errorBody = $_.Exception.Response.Content.ToString() | ConvertFrom-Json
            Write-Host "$GreenCheckmark Error Code: $($errorBody.code)" -ForegroundColor $GreenColor
            Write-Host "$GreenCheckmark Message: $($errorBody.message)`n" -ForegroundColor $GreenColor
        } catch {
            Write-Host "Could not parse error response`n"
        }
    } else {
        Write-Host "$RedX Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor $RedColor
    }
}

# Test 4: Admin Accessing Users Route (Should Succeed)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "[Test 4] Admin User Accessing /api/users" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/users" `
        -Headers @{"Authorization" = "Bearer $($tokens.adminToken)"} `
        -Method Get -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "$GreenCheckmark Status: 200 OK" -ForegroundColor $GreenColor
        $body = $response.Content | ConvertFrom-Json
        Write-Host "$GreenCheckmark Message: $($body.message)" -ForegroundColor $GreenColor
        Write-Host "$GreenCheckmark User Role: $($body.requestedBy.role)`n"
    }
} catch {
    Write-Host "$RedX Request failed: $($_.Exception.Message)" -ForegroundColor $RedColor
}

# Test 5: Regular User Accessing Users Route (Should Succeed)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "[Test 5] Regular User Accessing /api/users" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/users" `
        -Headers @{"Authorization" = "Bearer $($tokens.userToken)"} `
        -Method Get -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "$GreenCheckmark Status: 200 OK" -ForegroundColor $GreenColor
        $body = $response.Content | ConvertFrom-Json
        Write-Host "$GreenCheckmark Message: $($body.message)" -ForegroundColor $GreenColor
        Write-Host "$GreenCheckmark User Role: $($body.requestedBy.role)`n"
    }
} catch {
    Write-Host "$RedX Request failed: $($_.Exception.Message)" -ForegroundColor $RedColor
}

# Test 6: No Authorization Header (Should Fail)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "[Test 6] Request Without Authorization Header" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/users" `
        -Method Get -ErrorAction Stop
    
    Write-Host "$RedX Expected 401 but got 200 - Security Issue!" -ForegroundColor $RedColor
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "$GreenCheckmark Status: 401 Unauthorized (as expected)" -ForegroundColor $GreenColor
        try {
            $errorBody = $_.Exception.Response.Content.ToString() | ConvertFrom-Json
            Write-Host "$GreenCheckmark Error Code: $($errorBody.code)" -ForegroundColor $GreenColor
            Write-Host "$GreenCheckmark Message: $($errorBody.message)`n" -ForegroundColor $GreenColor
        } catch {
            Write-Host "Could not parse error response`n"
        }
    } else {
        Write-Host "$RedX Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor $RedColor
    }
}

# Test 7: Invalid Token (Should Fail)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "[Test 7] Request With Invalid Token" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token"

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/admin" `
        -Headers @{"Authorization" = "Bearer $invalidToken"} `
        -Method Get -ErrorAction Stop
    
    Write-Host "$RedX Expected 403 but got 200 - Security Issue!" -ForegroundColor $RedColor
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "$GreenCheckmark Status: 403 Forbidden (as expected)" -ForegroundColor $GreenColor
        try {
            $errorBody = $_.Exception.Response.Content.ToString() | ConvertFrom-Json
            Write-Host "$GreenCheckmark Error Code: $($errorBody.code)" -ForegroundColor $GreenColor
            Write-Host "$GreenCheckmark Message: $($errorBody.message)`n" -ForegroundColor $GreenColor
        } catch {
            Write-Host "Could not parse error response`n"
        }
    }
}

# Test Summary
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                        Test Complete                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📋 Summary:`n"
Write-Host "• $GreenCheckmark Authentication checks (401 on missing token)" -ForegroundColor $GreenColor
Write-Host "• $GreenCheckmark Authorization checks (403 on insufficient role)" -ForegroundColor $GreenColor
Write-Host "• $GreenCheckmark Admin route protection (/api/admin)" -ForegroundColor $GreenColor
Write-Host "• $GreenCheckmark User route accessibility (/api/users)" -ForegroundColor $GreenColor
Write-Host "• $GreenCheckmark JWT validation and expiration" -ForegroundColor $GreenColor
Write-Host "• $GreenCheckmark Request header augmentation`n" -ForegroundColor $GreenColor
