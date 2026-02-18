# 🔴 Blank Page Fix - Complete Troubleshooting Guide

## Why Your Node.js App Shows a Blank Page on cPanel

Your application displays a blank page because one of these issues is occurring:

### **Common Causes**

| Issue | Symptom | Fix |
|-------|---------|-----|
| **dist/ folder not uploaded** | Completely blank | Upload dist/ folder |
| **dist/ folder is empty** | Blank with no JS errors | Run `npm run build` then upload |
| **Missing node_modules** | API calls fail, 404 errors | Run `npm install --production` |
| **Wrong environment variables** | Blank or JS console errors | Update .env.production |
| **Port misconfiguration** | Cannot reach server at all | Update PORT in .env |
| **CORS blocked** | Console shows CORS error | Add your domain to ALLOWED_ORIGINS |
| **API URL wrong** | Frontend cannot reach backend | Set VITE_API_URL=/api |
| **Security/SSL issues** | Mixed content warning | Ensure HTTPS configured |

---

## 🚨 Quick Diagnosis

### **Check 1: Is the Server Running?**
```bash
# SSH to your server, then run:
curl http://localhost:8080
curl http://localhost:8080/health

# Expected response:
# {"status":"ok","timestamp":"...","environment":"production","uptime":...}
```

**If this fails:** Server isn't running or wrong port
- SSH to server: `ps aux | grep node`
- Check if Node process exists
- Check logs: `tail -100 error.log`

---

### **Check 2: Does dist/index.html Exist?**
```bash
# On cPanel server:
ls -la dist/index.html

# Should output file info, NOT "No such file"
```

**If missing:** 
1. Build locally: `npm run build`
2. Upload `dist/` folder to cPanel
3. Test again

---

### **Check 3: Check Browser Console for Errors**

1. Open your domain in browser
2. Right-click → "Inspect" or press F12
3. Click "Console" tab
4. Look for RED error messages

#### **Common Console Errors & Fixes**

**Error: `Failed to fetch /api/...`**
- Fix: Update ALLOWED_ORIGINS in .env.production
- Restart: `pm2 restart webmetricspro`

**Error: `Uncaught ReferenceError: process is not defined`**
- Fix: Rebuild frontend: `npm run build`
- Ensure build completes without errors

**Error: `Mixed content warning`**
- Fix: Ensure all URLs use HTTPS, not HTTP

**Error: `Cannot GET /`**
- Fix: dist/index.html not being served
- Check that `express.static` middleware works

---

### **Check 4: Check Server Logs**

```bash
# If using PM2:
pm2 logs webmetricspro

# If using Node directly:
tail -100 server-output.txt

# Look for errors that start with:
# - "Error:"
# - "EADDRINUSE" (port in use)
# - "EACCES" (permission denied)
# - "Cannot find module" (missing dependency)
```

---

## ✅ Complete Fix Procedure (Step by Step)

### **Step 1: Prepare Locally (on your computer)**

```bash
# Make sure everything builds successfully
npm install
npm run build

# Check if dist/ was created
ls dist/index.html  # or dir dist/index.html on Windows
```

**If build fails:**
- Fix TypeScript errors shown
- Fix React component errors
- Run `npm run build` again

---

### **Step 2: Prepare Deployment Package**

Create a clean `deployment.zip` containing:
```
webmetricspro/
├── server.js
├── package.json
├── package-lock.json
├── .env.production          ← Create/update this
├── dist/                    ← Must exist and be built
├── components/
├── services/
├── routes/
├── controllers/
├── models/
├── backend/
└── (other files)
```

**Important: DO NOT include:**
- `node_modules/` (too large, install on server)
- `.git/` (not needed)
- `node_modules/` folder

---

### **Step 3: Upload to cPanel**

1. Log into cPanel File Manager
2. Navigate to `public_html/`
3. Create folder: `webmetricspro/`
4. Upload `deployment.zip` there
5. Extract the ZIP file
6. Delete the ZIP file

---

### **Step 4: Install & Configure on Server**

SSH to server:

```bash
cd ~/public_html/webmetricspro

# Install production dependencies
npm install --production

# Create production configuration
cat > .env.production << 'EOF'
PORT=8080
NODE_ENV=production
JWT_SECRET=YOUR_SECURE_JWT_SECRET_HERE_MIN_32_CHARS
TOKEN_ENCRYPTION_KEY=YOUR_SECURE_TOKEN_KEY_HERE_MIN_32_CHARS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
DATABASE_URL="mysql://corpora5_webprometrics:5eJF)*QROqRTisR@102.130.123.241:3306/corpora5_webprometricske?connection_limit=5&pool_timeout=15"
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=CHOOSE_A_STRONG_PASSWORD
NODE_ENV=production
EOF

# Verify dist folder
ls -la dist/index.html
```

---

### **Step 5: Start Application**

```bash
# Option A: Using PM2 (Recommended - auto-restart, clustering)
npm install -g pm2
pm2 start server.js --name "webmetricspro" --instances max
pm2 save
pm2 startup

# Option B: Using Node directly
nohup node server.js > server.log 2>&1 &

# Or use cPanel's Node.js application manager
```

---

### **Step 6: Configure cPanel Proxy**

1. **cPanel → Domains**
2. Select your domain
3. Configure proxy to port 8080:
   - Enter proxy URL: `http://127.0.0.1:8080`

OR use nginx/Apache reverse proxy configuration

---

### **Step 7: Test Application**

```bash
# Test server is responding
curl http://localhost:8080

# Test health endpoint
curl http://localhost:8080/health

# If both work, your domain should work too!
```

---

## 🔍 Detailed Troubleshooting

### **Problem: Server starts but page is blank**

**Solution:**
```bash
# 1. Verify dist/index.html exists and has content
wc -l dist/index.html    # Should be 70+ lines
head -20 dist/index.html  # Should show <!DOCTYPE html>

# 2. Check if JS is being loaded (browser DevTools → Network)
# - Should see index.html load
# - Should see assets/ files loading

# 3. If index.html loads but no JS:
# Re-build frontend
npm run build

# 4. If still blank after re-build, check index.html:
cat dist/index.html | head -5
# Should show:
# <!DOCTYPE html>
# <html>
# <head>
```

---

### **Problem: Getting "Cannot GET /" Error**

**Solution:**
```bash
# This means express.static isn't serving dist/

# Check server.js has this middleware:
grep "express.static" server.js

# Should find:
# app.use(express.static(path.join(__dirname, 'dist')));

# If not found, add it near the end of server.js before route handlers:
# app.use(express.static(path.join(__dirname, 'dist')));

# Then restart:
pm2 restart webmetricspro
```

---

### **Problem: API calls failing (status 404 or CORS error)**

**Solution A - CORS Error:**
```bash
# Check ALLOWED_ORIGINS in .env.production
grep ALLOWED_ORIGINS .env.production

# Should list your domain:
# ALLOWED_ORIGINS=https://your-domain.com

# If wrong, update it:
nano .env.production  # or use text editor

# Save and restart:
pm2 restart webmetricspro
```

**Solution B - 404 Error:**
```bash
# Check if API route exists in server.js
grep -n "app.get('/api/health" server.js

# Should find the route
# If missing, endpoints aren't properly set up

# Restart with logs to see error:
pm2 restart webmetricspro
sleep 2
pm2 logs webmetricspro
```

---

### **Problem: NodeJS Module not found**

**Solution:**
```bash
# Full reinstall of dependencies
rm -rf node_modules package-lock.json
npm install --production

# Or just install missing module:
npm install express

# Check if module installs successfully
npm list express
```

---

### **Problem: Port 8080 Already in Use**

**Solution:**
```bash
# Find what's using port 8080
lsof -i :8080
# or
netstat -tulpn | grep 8080

# Kill the process
kill -9 <PID>

# Change port in .env.production if conflict can't be resolved
PORT=3001  # Try a different port
```

---

## 📊 Testing Checklist

Before considering deployment complete, verify:

```bash
# ✅ 1. Server responds
curl http://localhost:8080/health
# Expected: {"status":"ok",...}

# ✅ 2. Frontend loads
curl http://localhost:8080 | head -20
# Expected: <!DOCTYPE html>

# ✅ 3. API endpoint works
curl http://localhost:8080/api/packages
# Expected: JSON array of packages

# ✅ 4. Static assets load
curl http://localhost:8080/assets/index-*.js
# Expected: JavaScript file

# ✅ 5. Domain points correctly
curl https://your-domain.com
# Expected: Same as localhost:8080
```

---

## 🆘 If Still Showing Blank Page

Run this diagnostic:

```bash
#!/bin/bash

echo "=== DIAGNOSTIC REPORT ==="

echo "1. Server status:"
pm2 status

echo "2. Recent logs:"
pm2 logs webmetricspro --lines 50

echo "3. dist/ contents:"
ls -lah dist/

echo "4. Environment:"
cat .env.production | grep -E "PORT|NODE_ENV|ALLOWED_ORIGINS"

echo "5. Node process:"
ps aux | grep node

echo "6. Port listening:"
netstat -tulpn | grep 8080

echo "7. index.html size:"
wc -c dist/index.html
```

---

## 📞 Quick Support Commands

**Restart app after changes:**
```bash
pm2 restart webmetricspro
```

**Stop app:**
```bash
pm2 stop webmetricspro
```

**View real-time logs:**
```bash
pm2 logs webmetricspro --lines 0 --follow
```

**Delete PM2 app:**
```bash
pm2 delete webmetricspro
```

**Clean start:**
```bash
pm2 kill
npm install -g pm2
cd ~/public_html/webmetricspro
npm install --production
pm2 start server.js --name "webmetricspro"
pm2 save
```

---

## Final Notes

- Your `dist/` folder contains the built React app
- `server.js` serves both API and frontend
- Port 8080 is standard for cPanel
- cPanel proxies domain to localhost:8080
- Always update `.env.production` with real values
- Use PM2 for auto-restart and clustering
- Check logs regularly: `pm2 logs webmetricspro`
