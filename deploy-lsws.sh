#!/bin/bash
# LiteSpeed Deployment Script for WebMetricsPro
# This handles the ES Module issue with LiteSpeed

echo "🚀 WebMetricsPro LiteSpeed Deployment"
echo "===================================="

# Stop existing process
echo "Stopping existing Node.js process..."
pkill -f "node server.js"
pkill -f "lsnode"
sleep 2

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Option 1: Use PM2 as process manager (RECOMMENDED)
echo ""
echo "Installing PM2 for process management..."
npm install -g pm2

# Configure PM2 for LiteSpeed
pm2 start server.js --name "webmetricspro" --interpreter "node" --max-memory-restart 1G

# Make PM2 auto-start with system
pm2 startup
pm2 save

# Check status
echo ""
echo "✅ Application started with PM2"
pm2 status
pm2 logs webmetricspro --lines 20

# Test the app
echo ""
echo "Testing application..."
sleep 3
curl http://localhost:8080/health

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps in cPanel:"
echo "1. Go to cPanel > Node.js Selector"
echo "2. Uninstall any existing Node.js app"
echo "3. Alternatively, use cPanel > Restart PHP-FPM (if causes issues)"
echo ""
echo "To manage the app:"
echo "  pm2 logs webmetricspro    (view logs)"
echo "  pm2 restart webmetricspro (restart)"
echo "  pm2 stop webmetricspro    (stop)"
echo "  pm2 start webmetricspro   (start)"
