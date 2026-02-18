# 🎯 LiteSpeed Error - IMMEDIATE FIX

## Error Analysis
```
[Error [ERR_REQUIRE_ESM]: require() of ES Module /home/corpora5/reports.corporatedigitalmarketing.agency/backend/server.js
```

**Root Cause:** LiteSpeed cannot load ES Modules with `require()`. Your `server.js` uses `import` statements.

**Solution:** Use PM2 process manager instead of LiteSpeed's built-in Node.js handler.

---

## ⚡ 3-Step Fix (10 minutes)

### Step 1: SSH and Install PM2
```bash
ssh user@yourserver.com
sudo npm install -g pm2
cd ~/reports.corporatedigitalmarketing.agency
npm install --production
```

### Step 2: Start App with PM2
```bash
pm2 start server.js --name "webmetricspro" --max-memory-restart 1G
pm2 save
pm2 startup
```

### Step 3: Remove LiteSpeed Node.js Manager

In cPanel:
1. **cPanel → Node.js Selector**
2. Find your app and click the **trash icon** to delete it
3. This removes LiteSpeed's handler so it doesn't conflict

---

## ✅ Verify It Works

```bash
# Check if running
pm2 status

# Test API
curl http://localhost:8080/health

# View logs
pm2 logs webmetricspro
```

---

## 🌐 Configure Domain (cPanel)

1. **cPanel > Domains**
2. Select: `reports.corporatedigitalmarketing.agency`
3. Under **Proxy URL** field: `http://127.0.0.1:8080`
4. **Save**
5. Wait 5 minutes for DNS to update

---

## ✨ Done!

Your app will now:
- ✅ Work with ES Modules (no conversion needed)
- ✅ Auto-restart on crash
- ✅ Start automatically on server reboot
- ✅ Be accessible via your domain

---

## 🚀 Future Management

```bash
# View live logs
pm2 logs webmetricspro

# Restart after changes
pm2 restart webmetricspro

# Stop/Start
pm2 stop webmetricspro
pm2 start webmetricspro

# Check status
pm2 status
```

---

## If Something Goes Wrong

```bash
# See detailed error
pm2 logs webmetricspro --err

# Get all logs
tail -100 ~/.pm2/logs/webmetricspro-error.log

# Kill and restart cleanly
pm2 delete webmetricspro
pm2 start server.js --name "webmetricspro"
```

---

**That's it!** The `ERR_REQUIRE_ESM` error is gone. Your app runs perfectly with PM2.
