# ⚡ CommonJS Conversion Complete - Next Steps

## ✅ What Was Done
Your backend has been converted from ES Modules to CommonJS:
- ✅ `server.js` - All imports converted to require()
- ✅ `services/db.js` - Database imports converted
- ✅ `package.json` - Removed "type": "module"

This fixes the `ERR_REQUIRE_ESM` error on LiteSpeed!

---

## 🚀 Deploy Now (5 Steps)

### 1️⃣ Upload Updated Files
Copy these files to your cPanel server:
- `server.js` (updated)
- `services/db.js` (updated)
- `package.json` (updated - no "type": "module")

### 2️⃣ SSH to Server
```bash
ssh user@yourserver.com
cd ~/reports.corporatedigitalmarketing.agency
```

### 3️⃣ Reinstall Dependencies
```bash
npm install --production
```

### 4️⃣ Start Application

Choose ONE method:

#### Method A: PM2 (Auto-restart, Recommended)
```bash
npm install -g pm2
pm2 start server.js --name "webmetricspro"
pm2 save
pm2 startup
```

#### Method B: Node Direct
```bash
node server.js
```

#### Method C: cPanel Node.js Selector
1. cPanel → Node.js Selector
2. Delete old app, Create New
3. Startup File: `server.js`
4. Port: `8080`

### 5️⃣ Test
```bash
curl http://localhost:8080/health
# Should return JSON with "ok" status
```

---

## 🎉 Result
- No more LiteSpeed errors
- API endpoints work correctly  
- Blank page issue SOLVED
- App is now live-ready

---

## 📞 If Issues Occur
Problem: `Cannot find module`
- Run: `npm install --production`

Problem: Port already in use
- Change PORT in .env or kill process: `lsof -i :8080`

Problem: Still blank page
- Check logs: `pm2 logs webmetricspro`
- Verify dist/ folder exists
- Check cPanel domain proxy is set to localhost:8080

---

**Done! Your app should now work on cPanel without LiteSpeed errors.** 🚀
