#!/bin/bash

# WebMetricsPro cPanel Deployment Fix Script
# Run this on your cPanel server to fix the blank page issue

echo "🚀 WebMetricsPro cPanel Deployment Fix"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on cPanel
if [ -z "$HOME" ]; then
    echo -e "${RED}❌ Error: Cannot determine home directory${NC}"
    exit 1
fi

APP_DIR="$HOME/public_html/webmetricspro"

echo -e "${YELLOW}📁 App Directory: $APP_DIR${NC}"

# 1. Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ App directory not found at $APP_DIR${NC}"
    exit 1
fi

cd "$APP_DIR"
echo -e "${GREEN}✓ Changed to app directory${NC}"

# 2. Check Node.js installation
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not installed${NC}"
    echo "   Install Node.js from cPanel > Software > Node.js Selector"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version: $(node -v)${NC}"
echo -e "${GREEN}✓ npm version: $(npm -v)${NC}"

# 3. Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# 4. Check dist folder
if [ ! -f "dist/index.html" ]; then
    echo -e "${YELLOW}⚠️  dist/index.html not found, building frontend...${NC}"
    npm run build
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to build frontend${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
else
    echo -e "${GREEN}✓ dist/index.html found${NC}"
fi

# 5. Create .env.production if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚙️  Creating .env.production...${NC}"
    cat > .env.production << 'ENVEOF'
PORT=8080
NODE_ENV=production
JWT_SECRET=change-this-to-a-secure-key-12345
TOKEN_ENCRYPTION_KEY=change-this-to-a-secure-key-67890
ALLOWED_ORIGINS=https://your-domain.com
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
DATABASE_URL="mysql://corpora5_webprometrics:5eJF)*QROqRTisR@102.130.123.241:3306/corpora5_webprometricske?connection_limit=5&pool_timeout=15"
ENVEOF
    echo -e "${YELLOW}⚠️  Created .env.production with defaults${NC}"
    echo -e "${YELLOW}   🔴 UPDATE THIS FILE WITH YOUR ACTUAL VALUES${NC}"
else
    echo -e "${GREEN}✓ .env.production exists${NC}"
fi

# 6. Kill any existing Node processes
echo -e "\n${YELLOW}🔄 Stopping existing Node processes...${NC}"
pkill -f "node server.js" 2>/dev/null
sleep 2
echo -e "${GREEN}✓ Cleaned up processes${NC}"

# 7. Install PM2 && Start app
echo -e "\n${YELLOW}🚀 Starting application with PM2...${NC}"

npm install -g pm2 2>/dev/null

pm2 delete webmetricspro 2>/dev/null
sleep 1

pm2 start server.js --name "webmetricspro" --instances max --exec-mode cluster

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Application started successfully${NC}"
    pm2 save
else
    echo -e "${RED}❌ Failed to start application${NC}"
    exit 1
fi

# 8. Run startup
echo -e "${YELLOW}⚙️  Setting up PM2 startup...${NC}"
pm2 startup > /dev/null 2>&1
pm2 save

# 9. Verify application is running
sleep 3
echo -e "\n${YELLOW}⏳ Verifying application startup...${NC}"

if pm2 status | grep -q "online"; then
    echo -e "${GREEN}✓ Application is running${NC}"
else
    echo -e "${RED}❌ Application failed to start${NC}"
    pm2 logs webmetricspro
    exit 1
fi

# 10. Test API
echo -e "\n${YELLOW}🧪 Testing API...${NC}"
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API responding on port 8080${NC}"
else
    echo -e "${YELLOW}⚠️  API not responding yet (may still be starting)${NC}"
fi

# Summary
echo -e "\n${GREEN}✅ Deployment Complete!${NC}"
echo "======================================"
echo -e "\n📋 Next Steps:"
echo "1. Update .env.production with your domain and real secrets"
echo "2. Configure cPanel to proxy requests to port 8080"
echo "3. Visit https://your-domain.com to test"
echo ""
echo "📊 Monitor application:"
echo "   pm2 logs webmetricspro"
echo "   pm2 status"
echo ""
echo "🔧 Restart application if needed:"
echo "   pm2 restart webmetricspro"
echo ""
echo "❌ If still blank page:"
echo "   1. Check .env.production is set correctly"
echo "   2. Run: pm2 logs webmetricspro"
echo "   3. Verify dist/index.html exists"
echo "   4. Check cPanel domain configuration"
echo ""
