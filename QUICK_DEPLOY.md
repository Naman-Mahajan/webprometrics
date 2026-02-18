# Quick Start - Production Deployment

## 🚀 Fastest Way to Deploy (5 minutes)

### Prerequisites
- Linux/Ubuntu server with SSH access
- Domain name pointing to server IP
- sudo access on server

### Step 1: Prepare Server (SSH into your server)
```bash
sudo mkdir -p /opt/webprometrics
sudo chown $USER:$USER /opt/webprometrics
cd /opt/webprometrics
```

### Step 2: Copy Application Files
```bash
# From your local machine:
scp -r ./* user@yourserver.com:/opt/webprometrics/
```

### Step 3: Install & Build
```bash
# SSH into server
ssh user@yourserver.com
cd /opt/webprometrics

# Install dependencies
npm install

# Build frontend
npm run build

# Create environment file
cat > .env << 'EOF'
NODE_ENV=production
PORT=8080
JWT_SECRET=7oPS78NJKNRXiZzTJLp231vz0RAEcGfVfnBiK7egLTQ=
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
EOF

# Replace yourdomain.com with your actual domain
nano .env
```

### Step 4: Install PM2 & Start
```bash
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 5: Setup Nginx (SSL)
```bash
# Install Nginx & Certbot
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# Copy Nginx config
sudo cp /opt/webprometrics/nginx.conf /etc/nginx/sites-available/webprometrics
sudo sed -i 's/yourdomain.com/your-actual-domain.com/g' /etc/nginx/sites-available/webprometrics

# Enable site
sudo ln -s /etc/nginx/sites-available/webprometrics /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null

# Test Nginx
sudo nginx -t

# Get SSL certificate
sudo certbot certonly --nginx -d your-actual-domain.com -d www.your-actual-domain.com

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 6: Verify
```bash
# Check application
pm2 status
pm2 logs webprometrics

# Check HTTPS (from local machine)
curl -I https://yourdomain.com

# Check health endpoint
curl https://yourdomain.com/health
```

## ✅ Done! Your app is live at https://yourdomain.com

---

## 🔧 Common Commands

```bash
# View logs
pm2 logs webprometrics

# Monitor
pm2 monit

# Restart
pm2 restart webprometrics

# Stop
pm2 stop webprometrics

# Update app
cd /opt/webprometrics
git pull  # if using Git
npm run build
pm2 restart webprometrics
```

## 🆘 Troubleshooting

**App won't start?**
```bash
pm2 logs webprometrics --err
# Check: .env file exists, JWT_SECRET is set, dist/ folder exists
```

**SSL certificate issues?**
```bash
sudo certbot certificates
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

**Port already in use?**
```bash
sudo lsof -i :8080
sudo kill -9 <PID>
```

---

## 📖 Full Documentation

- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Complete step-by-step guide
- [PRODUCTION_READY_GUIDE.md](PRODUCTION_READY_GUIDE.md) - Features & limitations
- [nginx.conf](nginx.conf) - Nginx configuration template

---

**Need help?** Check the logs: `pm2 logs webprometrics`
