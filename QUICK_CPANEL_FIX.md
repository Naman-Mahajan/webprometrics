# ⚡ QUICK FIX - Blank Page on cPanel

## The Problem in 10 seconds
Your Node.js app is not serving the React frontend properly because:
1. **dist/ folder** might not be deployed to cPanel
2. **node_modules** might not be installed  
3. **Environment variables** are misconfigured
4. **Port** is not properly configured in cPanel proxy

---

## The Fix in 5 Steps

### **Step 1: SSH to cPanel Server**
```bash
ssh user@yourserver.com
cd ~/public_html/webmetricspro
```

### **Step 2: Install Dependencies (2 minutes)**
```bash
npm install --production
```

### **Step 3: Verify dist/ Folder**
```bash
# Check if dist/index.html exists
ls -la dist/index.html

# If NOT FOUND, you need to:
# 1. Build on your local machine: npm run build
# 2. Upload dist/ folder to cPanel
```

### **Step 4: Create .env.production**
```bash
cat > .env.production << 'EOF'
PORT=8080
NODE_ENV=production
JWT_SECRET=super-secret-key-change-this-123456789
TOKEN_ENCRYPTION_KEY=another-secret-key-987654321
ALLOWED_ORIGINS=https://your-domain.com
DATABASE_URL="mysql://corpora5_webprometrics:5eJF)*QROqRTisR@102.130.123.241:3306/corpora5_webprometricske?connection_limit=5&pool_timeout=15"
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=SecurePassword123
EOF
```

### **Step 5: Start the App**
```bash
# Install PM2 if you don't have it
npm install -g pm2

# Start app
pm2 start server.js --name "webmetricspro"
pm2 save

# Check if it's running
pm2 status

# View logs
pm2 logs webmetricspro
```

---

## Verify It's Working

```bash
# Should respond with JSON
curl http://localhost:8080/health

# Should respond with HTML
curl http://localhost:8080 | head -5

# Should show JSON
curl http://localhost:8080/api/packages
```

---

## Configure cPanel

1. **Go to:** cPanel → Domains
2. **Select your domain**
3. **Add Proxy:** `http://127.0.0.1:8080`
4. **Save & wait 5 minutes for DNS propagation**

---

## Still Blank? Run This:

```bash
# Check logs
pm2 logs webmetricspro

# Look for any errors like:
# - "Error:", "EADDRINUSE", "Cannot find module", "EACCES"

# If you see errors, post them to the troubleshooting guide above
```

---

## Common Issues

### ❌ "dist/index.html not found"
**Fix:** Build frontend: `npm run build` (on your local machine, then upload dist/ to cPanel)

### ❌ "Module not found: express"  
**Fix:** Run `npm install --production`

### ❌ "Address already in use :8080"
**Fix:** Change PORT=3001 in .env.production and restart

### ❌ "Cannot GET /"
**Fix:** Restart server: `pm2 restart webmetricspro` (make sure dist/ exists)

### ❌ "CORS error in console"
**Fix:** Update ALLOWED_ORIGINS in .env.production to your domain, then restart

---

## One-Line Deployment (if everything is set up)

```bash
cd ~/public_html/webmetricspro && npm install --production && pm2 start server.js --name "webmetricspro" && pm2 save
```

---

## How It Works

```
Your Domain (https://yoursite.com)
        ↓
cPanel Reverse Proxy (port 8080)
        ↓
Node.js Server (server.js on port 8080)
        ├→ Serves dist/index.html + assets (React Frontend)
        └→ API routes (/api/...) return JSON
```

---

**That's it! Your app should now be working.**

If you get any error messages, check the detailed troubleshooting guide: [BLANK_PAGE_TROUBLESHOOTING.md](BLANK_PAGE_TROUBLESHOOTING.md)
