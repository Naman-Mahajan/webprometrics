# WebMetricsPro cPanel Deployment - Verification Checklist
# Run these commands to verify your deployment and identify issues

# Before you deploy, run these locally to make sure everything works

Write-Host "🔍 WebMetricsPro Deployment Verification Checklist" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# 1. Check Node.js
Write-Host "`n✓ Checking Node.js..." -ForegroundColor Yellow
node --version
npm --version

# 2. Check dist folder
Write-Host "`n✓ Checking dist/ folder..." -ForegroundColor Yellow
if (Test-Path "dist/index.html") {
    Write-Host "✅ dist/index.html exists" -ForegroundColor Green
    Get-Item "dist/index.html" | Select-Object Length
} else {
    Write-Host "❌ dist/index.html NOT FOUND - Build frontend first!" -ForegroundColor Red
    Write-Host "   Run: npm run build" -ForegroundColor Yellow
}

# 3. Check .env files
Write-Host "`n✓ Checking environment files..." -ForegroundColor Yellow
$envFiles = @(".env", ".env.production", ".env.example")
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $file missing" -ForegroundColor Yellow
    }
}

# 4. Check server.js
Write-Host "`n✓ Checking server files..." -ForegroundColor Yellow
if (Test-Path "server.js") {
    Write-Host "✅ server.js exists" -ForegroundColor Green
} else {
    Write-Host "❌ server.js NOT FOUND!" -ForegroundColor Red
}

# 5. Check package.json
Write-Host "`n✓ Checking package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "✅ package.json exists" -ForegroundColor Green
    $packageJson = Get-Content package.json | ConvertFrom-Json
    Write-Host "   Main: $($packageJson.main)" -ForegroundColor Gray
} else {
    Write-Host "❌ package.json NOT FOUND!" -ForegroundColor Red
}

# 6. List node_modules
Write-Host "`n✓ Checking node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    $modulesCount = (Get-ChildItem "node_modules" -Directory | Measure-Object).Count
    Write-Host "✅ node_modules exists with approximately $modulesCount packages" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules NOT FOUND - Run: npm install" -ForegroundColor Red
}

# 7. Check backend services
Write-Host "`n✓ Checking backend services..." -ForegroundColor Yellow
$services = @("services/db.js", "backend/server.js", "routes", "controllers", "models")
foreach ($service in $services) {
    if (Test-Path $service) {
        Write-Host "   ✅ $service" -ForegroundColor Green
    }
}

# 8. Test build command
Write-Host "`n✓ Testing build command..." -ForegroundColor Yellow
Write-Host "   npm run build output:" -ForegroundColor Gray

# Summary
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "📋 Deployment Checklist" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$checks = @(
    @{ Name = "Node.js installed"; Check = (Get-Command node -ErrorAction SilentlyContinue) -ne $null },
    @{ Name = "npm installed"; Check = (Get-Command npm -ErrorAction SilentlyContinue) -ne $null },
    @{ Name = "dist/index.html exists"; Check = Test-Path "dist/index.html" },
    @{ Name = ".env file exists"; Check = Test-Path ".env" },
    @{ Name = "server.js exists"; Check = Test-Path "server.js" },
    @{ Name = "package.json exists"; Check = Test-Path "package.json" },
    @{ Name = "node_modules exists"; Check = Test-Path "node_modules" }
)

$allPassed = $true
foreach ($check in $checks) {
    if ($check.Check) {
        Write-Host "✅ $($check.Name)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($check.Name)" -ForegroundColor Red
        $allPassed = $false
    }
}

# Final step
Write-Host "`n================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "✅ All checks passed! Ready to deploy to cPanel" -ForegroundColor Green
    Write-Host "`n📤 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Create .zip file of entire project" -ForegroundColor Yellow
    Write-Host "2. Upload to cPanel" -ForegroundColor Yellow
    Write-Host "3. Extract files" -ForegroundColor Yellow
    Write-Host "4. Run: npm install --production" -ForegroundColor Yellow
    Write-Host "5. Start with Node.js app manager or PM2" -ForegroundColor Yellow
    Write-Host "6. Update .env.production with real values" -ForegroundColor Yellow
} else {
    Write-Host "❌ Some checks failed. Fix the issues above before deploying." -ForegroundColor Red
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "🔐 Security Reminder:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Before deploying to cPanel, update these in .env.production:" -ForegroundColor Yellow
Write-Host "  • JWT_SECRET (use a random 32+ character string)" -ForegroundColor Gray
Write-Host "  • TOKEN_ENCRYPTION_KEY (use a random 32+ character string)" -ForegroundColor Gray
Write-Host "  • ADMIN_PASSWORD (use a strong password)" -ForegroundColor Gray
Write-Host "  • ALLOWED_ORIGINS (set to your actual domain)" -ForegroundColor Gray
Write-Host "  • DATABASE_URL (set to your cPanel MySQL)" -ForegroundColor Gray
