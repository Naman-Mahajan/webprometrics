# 🚀 Live Deployment Checklist for WebProMetrics

**Date:** December 18, 2025  
**Version:** 1.0  
**Status:** Ready for Deployment

---

## Prerequisites

- [ ] Node.js 18+ installed on server
- [ ] npm or yarn package manager
- [ ] Nginx or Apache web server
- [ ] SSL certificate (Let's Encrypt recommended)
- [ ] Git installed (for version control)
- [ ] Domain name and DNS configured
- [ ] Server with minimum 1GB RAM, 10GB storage

---

## Step 1: Server Setup (15 minutes)

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Node.js (if not already installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verify
npm --version   # Verify
```

### 1.3 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 --version  # Verify
```

### 1.4 Create Application Directory
```bash
sudo mkdir -p /opt/webprometrics
sudo chown $USER:$USER /opt/webprometrics
cd /opt/webprometrics
```

---

## Step 2: Clone and Setup Application (10 minutes)

### 2.1 Clone Repository
```bash
# If using Git
git clone https://github.com/yourusername/webprometrics.git .

# Or copy files directly
# scp -r ./webprometrics/* user@server:/opt/webprometrics/
```

### 2.2 Install Dependencies
```bash
cd /opt/webprometrics
npm install
```

### 2.3 Configure Environment Variables
```bash
# Create production .env file
nano .env

# Add these values:
NODE_ENV=production
PORT=8080
JWT_SECRET=7oPS78NJKNRXiZzTJLp231vz0RAEcGfVfnBiK7egLTQ=
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
GEMINI_API_KEY=your-api-key-if-needed
```

**Important:** 
- Replace `yourdomain.com` with your actual domain
- Generate a new JWT_SECRET for production: `openssl rand -base64 32`
- Keep `.env` file secure (never commit to Git)

### 2.4 Build Frontend
```bash
npm run build
# This creates the dist/ folder with optimized frontend
```

### 2.5 Verify Build
```bash
ls -la dist/
# Should see: index.html, assets/ folder, etc.
```

---

## Step 3: Set Up Process Manager (PM2) (10 minutes)

### 3.1 Start Application with PM2
```bash
cd /opt/webprometrics
pm2 start ecosystem.config.js
```

### 3.2 Verify Application is Running
```bash
pm2 status
# Should show webprometrics as "online"

pm2 logs  # Check logs
# Should see: "🚀 Server running on port 8080"
```

### 3.3 Enable Auto-Start on Server Reboot
```bash
pm2 startup
# Follow the command it outputs
pm2 save
```

### 3.4 Verify Logs
```bash
pm2 logs webprometrics --lines 50
```

---

## Step 4: Configure Nginx Reverse Proxy (15 minutes)

### 4.1 Install Nginx (if not already installed)
```bash
sudo apt install -y nginx
```

### 4.2 Configure Nginx
```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/webprometrics

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/webprometrics /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Verify configuration
sudo nginx -t
# Should output: "nginx: configuration file test is successful"
```

### 4.3 Update Domain in Nginx Config
```bash
sudo nano /etc/nginx/sites-available/webprometrics

# Replace all occurrences of "yourdomain.com" with your actual domain
# Find: yourdomain.com
# Replace: yourdomain.com
```

### 4.4 Restart Nginx
```bash
sudo systemctl restart nginx
sudo systemctl enable nginx  # Auto-start on reboot
```

### 4.5 Verify Nginx
```bash
sudo systemctl status nginx
curl http://localhost  # Should return Nginx welcome page or your app
```

---

## Step 5: SSL/TLS Certificate (Let's Encrypt) (10 minutes)

### 5.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 Get Certificate
```bash
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Answer the prompts:
# - Enter email address
# - Agree to terms (yes)
# - Share email? (your choice)
```

### 5.3 Update Nginx Config with Certificate Paths
```bash
sudo nano /etc/nginx/sites-available/webprometrics

# The paths should be:
# ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

### 5.4 Restart Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 5.5 Verify HTTPS
```bash
curl https://yourdomain.com
# Should return your app content
```

### 5.6 Enable Auto-Renewal
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
sudo certbot renew --dry-run  # Test renewal
```

---

## Step 6: Database & Backups (5 minutes)

### 6.1 Create Backup Directory
```bash
mkdir -p /opt/webprometrics/backups
mkdir -p /opt/webprometrics/logs
```

### 6.2 Set Up Automatic Backups
```bash
# Server creates automatic backups every 6 hours
# Backups are stored in: /opt/webprometrics/backups/

# Optional: Set up daily backup to external storage
crontab -e

# Add this line:
0 2 * * * tar -czf /opt/webprometrics/backups/app-backup-$(date +\%Y\%m\%d).tar.gz /opt/webprometrics/db.json /opt/webprometrics/backups/*.json
```

---

## Step 7: Verification & Testing (10 minutes)

### 7.1 Test Application Access
```bash
# HTTPS access
curl -I https://yourdomain.com
# Should return: 200 OK

# Health check
curl https://yourdomain.com/health
# Should return: {"status":"ok", ...}
```

### 7.2 Test API Endpoints
```bash
# Signup test
curl -X POST https://yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123",
    "companyName": "Test Company"
  }'

# Should return: {"token": "...", "refreshToken": "...", "user": {...}}
```

### 7.3 Check PM2 Status
```bash
pm2 status
pm2 monit  # Real-time monitoring

# Check if processes are restarting frequently (indicate errors)
pm2 logs webprometrics --err
```

### 7.4 Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/webprometrics-access.log
sudo tail -f /var/log/nginx/webprometrics-error.log
```

---

## Step 8: Security Hardening (15 minutes)

### 8.1 Firewall Setup
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
sudo ufw status
```

### 8.2 Disable SSH Root Login (if using root)
```bash
sudo nano /etc/ssh/sshd_config
# Change: PermitRootLogin no
sudo systemctl restart sshd
```

### 8.3 Set File Permissions
```bash
cd /opt/webprometrics
chmod 600 .env  # Restrict .env to owner only
chmod 644 *.json
chmod 755 node_modules
```

### 8.4 Check Security Headers
```bash
curl -I https://yourdomain.com | grep -i "Strict-Transport-Security\|X-Frame-Options\|X-Content-Type-Options"
# Should show security headers
```

---

## Step 9: Monitoring & Maintenance (Ongoing)

### 9.1 Monitor Application
```bash
# Real-time monitoring
pm2 monit

# Email alerts (optional - requires additional setup)
pm2 install pm2-auto-pull  # Auto-pull from Git
pm2 install pm2-logrotate  # Rotate logs

# Check disk space
df -h
du -sh /opt/webprometrics

# Check memory usage
free -h
```

### 9.2 Update Application (when needed)
```bash
cd /opt/webprometrics
git pull origin main
npm install
npm run build
pm2 restart webprometrics
pm2 save
```

### 9.3 Backup Strategy
```bash
# View backups
ls -la /opt/webprometrics/backups/

# Manual backup
cd /opt/webprometrics && npm run backup

# Restore from backup
cp /opt/webprometrics/backups/db-backup-*.json /opt/webprometrics/db.json
pm2 restart webprometrics
```

### 9.4 Certificate Renewal (Automatic)
```bash
# Check renewal status
sudo certbot certificates

# Manual renewal if needed
sudo certbot renew
```

---

## Troubleshooting

### Application not starting
```bash
pm2 logs webprometrics --err
# Check error messages
# Common: JWT_SECRET not set, port already in use, wrong Node.js version
```

### Port 8080 already in use
```bash
sudo lsof -i :8080
sudo kill -9 <PID>
# Or change PORT in .env and ecosystem.config.js
```

### SSL certificate errors
```bash
sudo certbot certificates
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

### Nginx not serving frontend
```bash
sudo nginx -t  # Test config
sudo systemctl restart nginx
# Check: npm run build completed successfully
# Check: dist/ folder exists with index.html
```

### Database locked or corrupted
```bash
# Restore from backup
cd /opt/webprometrics
cp backups/db-backup-*.json db.json
pm2 restart webprometrics
```

---

## Performance Optimization

### 1. Enable Gzip Compression in Nginx
```nginx
gzip on;
gzip_types text/plain text/css text/javascript application/json;
gzip_min_length 1000;
```

### 2. Configure Node.js Clustering (Optional)
Edit `ecosystem.config.js`:
```javascript
instances: 'max',  // Use all CPU cores
exec_mode: 'cluster',
```

### 3. Set Up CDN (Optional)
For static assets, use CloudFlare or similar to cache frontend files.

### 4. Database Optimization
- Archive old audit logs periodically
- Implement data retention policies
- Keep backups on separate storage

---

## Post-Deployment Checklist

- [ ] Application is accessible at https://yourdomain.com
- [ ] HTTPS certificate is valid (no browser warnings)
- [ ] Health check endpoint responds (`/health`)
- [ ] Signup/Login working correctly
- [ ] Database backups are created automatically
- [ ] PM2 auto-restart is configured
- [ ] Nginx is proxying requests correctly
- [ ] Logs are being written to `/var/log/nginx/`
- [ ] Security headers are present
- [ ] Firewall is configured
- [ ] Monitoring is in place (pm2 monit)

---

## Support & Issues

For issues or questions:
1. Check `/opt/webprometrics/logs/pm2-error.log`
2. Check `/var/log/nginx/webprometrics-error.log`
3. Run `pm2 logs webprometrics`
4. Verify `.env` file configuration
5. Check firewall and network settings

---

**Deployment Date:** [Insert Date]  
**Deployed By:** [Insert Name]  
**Contact:** [Insert Contact Info]
