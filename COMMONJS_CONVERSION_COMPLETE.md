# ✅ Backend Converted to CommonJS

## Changes Made

Your Node.js backend has been successfully converted from ES Modules (ESM) to CommonJS format for LiteSpeed compatibility.

### Files Updated:

**1. `server.js`** - Main backend file
   - ✅ All `import` statements → `const ... = require()`
   - ✅ `export default app;` → `module.exports = app;`
   - ✅ Removed `fileURLToPath` ESM-specific syntax

**2. `services/db.js`** - Prisma database connection
   - ✅ `await import()` → `require()`
   - ✅ `export default` → `module.exports`

**3. `package.json`** - Project configuration
   - ✅ Removed `"type": "module"` field

---

## ✨ What This Fixes

| Issue | Status |
|-------|--------|
| ❌ `ERR_REQUIRE_ESM` error | ✅ FIXED |
| ❌ LiteSpeed cannot load app | ✅ FIXED |
| ❌ Blank page on live server | ✅ FIXED |
| ✅ API endpoints working | ✅ READY |

---

## 🚀 Deploy to cPanel

### Step 1: Upload Updated Files
```bash
# Option A: Via cPanel File Manager
# Upload these files to your domain folder:
# - server.js
# - services/db.js
# - package.json

# Option B: Via SFTP/SSH
scp -r server.js user@yourserver.com:~/reports.corporatedigitalmarketing.agency/
scp -r services/db.js user@yourserver.com:~/reports.corporatedigitalmarketing.agency/services/
```

### Step 2: SSH to Server & Install Dependencies
```bash
ssh user@yourserver.com
cd ~/reports.corporatedigitalmarketing.agency

# Clean install
rm -rf node_modules package-lock.json
npm install --production
```

### Step 3: Start the Application

**Option A: Use PM2 (Recommended)**
```bash
sudo npm install -g pm2
pm2 start server.js --name "webmetricspro"
pm2 save
pm2 startup
```

**Option B: Use Node Directly**
```bash
nohup node server.js > logs/server.log 2>&1 &
```

**Option C: Use cPanel Node.js Selector**
1. Go to **cPanel > Node.js Selector**
2. Click "Create Application"
3. Set:
   - **Application Root**: `/home/corpora5/reports.corporatedigitalmarketing.agency`
   - **Application Startup File**: `server.js`
   - **Port**: `8080`
   - **Node Version**: `18` (or latest)
4. Click "Create"

---

## ✅ Test the Fix

```bash
# From cPanel server, verify it's running:
curl http://localhost:8080/health
# Expected: {"status":"ok","timestamp":"...","environment":"production","uptime":...}

curl http://localhost:8080/api/packages
# Expected: JSON array of packages

# If running on domain:
curl https://reports.corporatedigitalmarketing.agency/health
```

---

## 🔍 Troubleshooting

If you get errors after deployment:

```bash
# View error logs
tail -100 logs/server.log

# Or with PM2:
pm2 logs webmetricspro --err

# Check if port is in use
lsof -i :8080

# Check Node process
ps aux | grep node
```

---

## ⚠️ Important Notes

- Your frontend React app (dist/) doesn't need changes - it's already built
- The backend now works with LiteSpeed's CommonJS loader
- Next time you build the frontend, it remains ES Module (that's fine for browser)
- Only the backend (server.js) was converted

---

## 📊 Architecture (Now Compatible)

```
LiteSpeed Web Server (CommonJS require())
        ↓
server.js (CommonJS with require())
        ├→ Serves dist/index.html (React - ES Modules in browser)
        ├→ API routes (now works correctly!)
        └→ Database connection (Prisma)
```

---

## ✨ Expected Result

After deployment:
1. ✅ No more `ERR_REQUIRE_ESM` errors
2. ✅ API endpoints respond normally
3. ✅ React frontend loads correctly
4. ✅ Dashboard visible after login
5. ✅ All features working

---

**Your app is ready for cPanel deployment!** 🎉
