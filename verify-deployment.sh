#!/bin/bash

# Production Build & Deployment Verification Script
# This script verifies that all deployment requirements are met

echo "🔍 WebProMetrics Production Readiness Check"
echo "==========================================="
echo ""

PASSED=0
FAILED=0

# Check 1: Node.js Version
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node --version)
if [[ $NODE_VERSION == v1[89]* ]] || [[ $NODE_VERSION == v2* ]]; then
    echo "  ✅ Node.js $NODE_VERSION (Required: v18+)"
    ((PASSED++))
else
    echo "  ❌ Node.js $NODE_VERSION (Required: v18+)"
    ((FAILED++))
fi

# Check 2: npm Packages
echo ""
echo "✓ Checking npm dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✅ node_modules directory exists"
    ((PASSED++))
else
    echo "  ❌ node_modules directory missing - Run: npm install"
    ((FAILED++))
fi

# Check 3: Build files
echo ""
echo "✓ Checking build configuration..."
if [ -f "vite.config.ts" ]; then
    echo "  ✅ vite.config.ts found"
    ((PASSED++))
else
    echo "  ❌ vite.config.ts not found"
    ((FAILED++))
fi

# Check 4: Server files
echo ""
echo "✓ Checking server files..."
if [ -f "server.js" ]; then
    echo "  ✅ server.js found"
    ((PASSED++))
else
    echo "  ❌ server.js not found"
    ((FAILED++))
fi

# Check 5: Package.json
echo ""
echo "✓ Checking package.json..."
if [ -f "package.json" ]; then
    echo "  ✅ package.json found"
    if grep -q '"build"' package.json; then
        echo "  ✅ build script configured"
        ((PASSED++))
    else
        echo "  ❌ build script missing"
        ((FAILED++))
    fi
else
    echo "  ❌ package.json not found"
    ((FAILED++))
fi

# Check 6: Environment setup
echo ""
echo "✓ Checking environment configuration..."
if [ -f ".env" ]; then
    echo "  ✅ .env file exists"
    if grep -q "JWT_SECRET" .env; then
        echo "  ✅ JWT_SECRET configured"
        ((PASSED++))
    else
        echo "  ⚠️  JWT_SECRET not set - Run: node setup-env.js"
        ((FAILED++))
    fi
else
    echo "  ⚠️  .env file not found - Creating template..."
    cat > .env << 'EOF'
NODE_ENV=production
PORT=8080
JWT_SECRET=
ALLOWED_ORIGINS=https://yourdomain.com
EOF
    echo "  ℹ️  .env template created - Fill in your values"
    ((FAILED++))
fi

# Check 7: PM2 configuration
echo ""
echo "✓ Checking PM2 configuration..."
if [ -f "ecosystem.config.js" ]; then
    echo "  ✅ ecosystem.config.js found"
    ((PASSED++))
else
    echo "  ❌ ecosystem.config.js not found"
    ((FAILED++))
fi

# Check 8: Nginx configuration
echo ""
echo "✓ Checking Nginx configuration..."
if [ -f "nginx.conf" ]; then
    echo "  ✅ nginx.conf found"
    ((PASSED++))
else
    echo "  ❌ nginx.conf not found"
    ((FAILED++))
fi

# Check 9: Frontend dist folder
echo ""
echo "✓ Checking frontend build..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "  ✅ dist/ folder with index.html found"
    echo "  ✅ Frontend is built"
    ((PASSED++))
else
    echo "  ⚠️  dist/ folder not found - Run: npm run build"
    ((FAILED++))
fi

# Check 10: Security requirements
echo ""
echo "✓ Checking security requirements..."
if [ -f ".gitignore" ] && grep -q ".env" .gitignore; then
    echo "  ✅ .env file in .gitignore"
    ((PASSED++))
else
    echo "  ⚠️  .env might be committed to Git"
    ((FAILED++))
fi

# Summary
echo ""
echo "==========================================="
echo "📊 Results: ✅ $PASSED passed | ❌ $FAILED failed"
echo "==========================================="

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "🎉 Application is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Review the .env file and update with your domain"
    echo "2. Upload files to server"
    echo "3. Run: npm install on the server"
    echo "4. Run: npm run build on the server"
    echo "5. Run: pm2 start ecosystem.config.js"
    echo ""
    exit 0
else
    echo ""
    echo "⚠️  Please fix the issues above before deploying"
    echo ""
    exit 1
fi
