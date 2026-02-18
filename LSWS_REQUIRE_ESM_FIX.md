# 🔴 LiteSpeed ERR_REQUIRE_ESM Fix

## The Problem

LiteSpeed Web Server (LSWS) is trying to use CommonJS `require()` to load your ES Module file:

```
[Error [ERR_REQUIRE_ESM]: require() of ES Module /home/corpora5/reports.corporatedigitalmarketing.agency/backend/server.js
```

**Why:** 
- Your `server.js` uses `import` statements (ES Modules)
- LiteSpeed's Node.js handler uses CommonJS `require()`
- These are incompatible

---

## Solutions (Choose One)

### ✅ **SOLUTION 1: Use PM2 Instead of LiteSpeed (RECOMMENDED)**

PM2 is a Node.js process manager that works perfectly with ES Modules and auto-restarts your app.

#### Step 1: SSH to Your Server
```bash
ssh user@yourserver.com
cd ~/reports.corporatedigitalmarketing.agency
```

#### Step 2: Install PM2
```bash
sudo npm install -g pm2
```

#### Step 3: Start Your App with PM2
```bash
pm2 start server.js --name "webmetricspro" --max-memory-restart 1G
pm2 save
pm2 startup
```

#### Step 4: Disable LiteSpeed Node.js Manager

In cPanel:
1. Go to **cPanel > Node.js Selector**
2. If there's an existing app entry, **Uninstall** it
3. Delete any LiteSpeed node.js configuration

#### Step 5: Configure cPanel Domain to Use Port 8080

1. Go to **cPanel > Domains**
2. Select your domain
3. Under **Proxy URL**, enter: `http://127.0.0.1:8080`
4. **Save** and wait 5 minutes for DNS

#### Step 6: Test
```bash
curl http://localhost:8080/health
# Should return: {"status":"ok",...}

curl https://your-domain.com/health
# Should also work
```

**Advantages:**
- ✅ Works perfectly with ES Modules
- ✅ Auto-restart on crashes
- ✅ Clustering support
- ✅ Built-in process management
- ✅ View logs easily: `pm2 logs`

---

### ✅ **SOLUTION 2: Convert server.js to CommonJS**

Convert all `import` statements to `require()` to make it compatible with LiteSpeed.

**Create a conversion script:**

```bash
# Install ts-node to help convert
npm install --save-dev esbuild

# Run conversion
npx esbuild server.js --bundle --platform=node --target=node18 --outfile=server-cjs.js --external:prisma
```

Then configure LiteSpeed to use `server-cjs.js` instead.

**Drawback:** Requires manual conversion of all imports

---

### ✅ **SOLUTION 3: Create a CommonJS Wrapper**

This lets LiteSpeed load your ESM via a wrapper.

#### File: `/home/corpora5/reports.corporatedigitalmarketing.agency/index.js`

```javascript
/**
 * CommonJS Wrapper for LiteSpeed
 * Allows LiteSpeed to load ES Module via require()
 */

(async () => {
    try {
        const { default: app } = await import('./server.js');
        return app;
    } catch (error) {
        console.error('Failed to load server:', error);
        process.exit(1);
    }
})();
```

#### Configure LiteSpeed

1. In cPanel > Node.js Selector
2. Set **Application Root** to: `/home/corpora5/reports.corporatedigitalmarketing.agency`
3. Set **Application Startup File** to: `index.js`
4. Set **Port**: `8080`

**Note:** This method is less reliable. Use PM2 instead.

---

### ⚠️ **SOLUTION 4: Disable LiteSpeed Node.js & Use Standalone Node**

Run Node.js directly without LiteSpeed's handler:

```bash
# SSH to server
ssh user@yourserver.com
cd ~/reports.corporatedigitalmarketing.agency

# Install dependencies
npm install --production

# Start with Node directly
nohup node server.js > logs/server.log 2>&1 &
```

Then configure cPanel domainProxy to port 8080.

**Note:** No auto-restart on crash. Use PM2 for production.

---

## 🎯 Quick Fix (5 minutes)

```bash
# 1. SSH to server
ssh user@yourserver.com
cd ~/reports.corporatedigitalmarketing.agency

# 2. Install PM2 globally
sudo npm install -g pm2

# 3. Start your app
pm2 start server.js --name "webmetricspro" --max-memory-restart 1G
pm2 save
pm2 startup

# 4. Test it works
sleep 3
curl http://localhost:8080/health

# 5. View logs if needed
pm2 logs webmetricspro
```

Then go to cPanel and:
1. **Uninstall** any Node.js app from Node.js Selector
2. Set up domain proxy to `http://127.0.0.1:8080`

---

## 📋 Recommended Setup

| Component | Configuration |
|-----------|---|
| **Process Manager** | PM2 |
| **Port** | 8080 |
| **cPanel Proxy** | http://127.0.0.1:8080 |
| **Node Version** | 18+ |
| **Module Type** | ES Modules (keep `"type": "module"` in package.json) |
| **Auto-restart** | pm2 startup |
| **Logs** | pm2 logs webmetricspro |

---

## ✅ Verify Everything Works

```bash
# Check if PM2 is managing the process
pm2 status

# Check if port 8080 is listening
lsof -i :8080
# or
netstat -tulpn | grep 8080

# Test API directly
curl http://localhost:8080/health
curl http://localhost:8080/api/packages

# Test via domain (after cPanel proxy configured)
curl -L https://reports.corporatedigitalmarketing.agency/health
```

---

## 🆘 Troubleshooting

#### PM2 says "command not found"
```bash
sudo npm install -g pm2
pm2 update
```

#### App keeps crashing
```bash
# View detailed logs
pm2 logs webmetricspro --err

# Check error logs
cat logs/server.log

# Restart with verbose output
pm2 restart webmetricspro --verbose
```

#### Port 8080 in use
```bash
# Find what's using it
lsof -i :8080

# Kill the process
sudo kill -9 <PID>

# Or change port in .env.production
PORT=3001
```

#### LiteSpeed still trying to start Node.js
1. Go to cPanel > Node.js Selector
2. Click the trash icon to delete the application
3. Clear browser cache and restart cPanel

---

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
- [LiteSpeed Node.js Integration](https://openlitespeed.org/kb/node-js/)

---

## Summary

| Solution | Difficulty | Reliability | Recommended |
|----------|-----------|------------|---|
| **PM2** | ⭐ Easy | ⭐⭐⭐⭐⭐ | **✅ YES** |
| **CommonJS Wrapper** | ⭐⭐ Medium | ⭐⭐⭐ | ⭐ Maybe |
| **Convert to CommonJS** | ⭐⭐⭐ Hard | ⭐⭐⭐⭐ | ⭐ Only if needed |
| **Standalone Node** | ⭐ Easy | ⭐⭐ Poor | ❌ No |

**🎯 Use PM2. It's the best solution.**
