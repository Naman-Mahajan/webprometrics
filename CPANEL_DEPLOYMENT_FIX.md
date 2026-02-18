# cPanel Blank Page Fix - Complete Setup Guide

## Issues Identified
1. Frontend built with development API URL
2. Missing critical environment variables
3. Node modules not uploaded
4. Incorrect production configuration

## Step-by-Step Fix

### 1. SSH into cPanel and Navigate to Your App Directory
```bash
ssh user@yourserver.com
cd ~/public_html/webmetricspro  # or your app path
```

### 2. Install Dependencies
```bash
npm install --production
```

### 3. Create/Update .env.production File
```bash
cat > .env.production << 'EOF'
# Server Configuration
PORT=8080
NODE_ENV=production

# Security Keys (CHANGE THESE)
JWT_SECRET=your-secure-jwt-secret-key-here
TOKEN_ENCRYPTION_KEY=your-secure-token-encryption-key-here

# Database (from your .env)
DATABASE_URL="mysql://corpora5_webprometrics:5eJF)*QROqRTisR@102.130.123.241:3306/corpora5_webprometricske?connection_limit=5&pool_timeout=15"

# API Configuration
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Admin Credentials
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=change-this-password

# Google OAuth (Optional - get from Google Cloud)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://your-domain.com/api/oauth/google/callback

# Leave commented unless needed
# DATABASE_URL=your-prisma-connection-string
# VITE_API_URL=https://your-domain.com/api
EOF
```

### 4. Check dist/ Folder
Ensure the dist folder has the built frontend:
```bash
ls -la dist/
# Should show: index.html and assets/ folder
```

If dist/ is missing or empty, rebuild locally:
```bash
npm run build
# Then upload dist/ folder to cPanel
```

### 5. Start Node.js Application with PM2
```bash
npm install -g pm2  # Install PM2 if not already

pm2 start server.js --name "webmetricspro"
pm2 save
pm2 startup
```

Or with Node directly:
```bash
node server.js
```

### 6. Configure cPanel to Point to Your App

#### Option A: Direct Node.js (Recommended)
1. Go to cPanel > Domains
2. Point your domain to port 8080
3. Configure reverse proxy if needed

#### Option B: Using cPanel's Node.js App Manager
1. Go to cPanel > Node.js Selector
2. Create new application
3. Select your folder
4. Set startup file to `server.js`
5. Set port to `8080`
6. Start the application

### 7. Test the Application
```bash
# Check if server is running
curl http://localhost:8080

# Check logs
pm2 logs webmetricspro
# Or
tail -f server-output.txt
```

### 8. Common Issues & Fixes

#### Blank Page but Console has Errors
- Check `.env` variables
- Ensure `dist/` folder exists
- Check browser console for JS errors

#### 404 on API Calls
- Verify `ALLOWED_ORIGINS` matches your domain
- Check CORS configuration in server.js

#### Database Connection Errors
- Test MySQL connection:
  ```bash
  mysql -u corpora5_webprometrics -p -h 102.130.123.241 corpora5_webprometricske
  ```

#### Port Already in Use
```bash
lsof -i :8080
kill -9 <PID>
```

#### Premium Support Direct Fix
If still not working:
1. SSH into server
2. Check actual error: `tail -100 server-output.txt`
3. Verify dist/index.html exists
4. Check that node_modules is installed
5. Confirm PORT environment variable

## Testing URLs
- **Main App**: https://your-domain.com
- **API Health**: https://your-domain.com/health
- **API Ping**: https://your-domain.com/api

## What Should Happen
1. Browser loads https://your-domain.com
2. Server serves dist/index.html
3. React app loads and makes API call to /api endpoints
4. Dashboard appears with login screen
5. After login, full app is visible
