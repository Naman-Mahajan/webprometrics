# 🐳 Docker Deployment Guide

## Overview

WebProMetrics includes Docker support for containerized deployments. This guide covers:
- Local development with Docker
- Production deployment with Docker
- Docker Compose setup
- Kubernetes deployment (optional)

---

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git (for version control)

### Install Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# macOS (using Homebrew)
brew install docker docker-compose

# Windows
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
```

### Verify Installation
```bash
docker --version
docker-compose --version
docker run hello-world
```

---

## Quick Start (Local Development)

### Build Image
```bash
docker build -t webprometrics:latest .
```

### Run Container
```bash
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret-here \
  -e ALLOWED_ORIGINS=http://localhost:8080 \
  webprometrics:latest
```

### Access Application
```
http://localhost:8080
```

---

## Docker Compose (Recommended for Local Dev)

### Start Services
```bash
# Start with environment variables
JWT_SECRET=$(openssl rand -base64 32) docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f webprometrics
```

### Stop Services
```bash
docker-compose down
```

### View Running Containers
```bash
docker-compose ps
```

---

## Production Deployment with Docker

### Step 1: Set Environment Variables
```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=8080
JWT_SECRET=$(openssl rand -base64 32)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
EOF
```

### Step 2: Build Image
```bash
docker build -t webprometrics:1.0.0 .
docker tag webprometrics:1.0.0 your-registry.com/webprometrics:1.0.0
```

### Step 3: Push to Registry (if using remote registry)
```bash
docker push your-registry.com/webprometrics:1.0.0
```

### Step 4: Create Production docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    image: webprometrics:1.0.0
    container_name: webprometrics-prod
    ports:
      - "8080:8080"
    environment:
      NODE_ENV: production
      PORT: 8080
      JWT_SECRET: ${JWT_SECRET}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: always
    networks:
      - webprometrics-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:latest
    container_name: webprometrics-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - webprometrics-network
    restart: always

networks:
  webprometrics-network:
    driver: bridge

volumes:
  app-data:
  nginx-logs:
```

### Step 5: Deploy
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Step 6: Verify
```bash
docker-compose ps
docker-compose logs -f app
```

---

## Docker Registry Deployment

### Option 1: Docker Hub
```bash
# Login
docker login

# Build and push
docker build -t yourusername/webprometrics:1.0.0 .
docker push yourusername/webprometrics:1.0.0

# Pull on server
docker pull yourusername/webprometrics:1.0.0
docker run -d yourusername/webprometrics:1.0.0
```

### Option 2: Private Registry (AWS ECR)
```bash
# Authenticate with ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t webprometrics:1.0.0 .
docker tag webprometrics:1.0.0 123456789012.dkr.ecr.us-east-1.amazonaws.com/webprometrics:1.0.0
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/webprometrics:1.0.0
```

---

## Kubernetes Deployment (Optional)

### Create Deployment Manifest
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webprometrics
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webprometrics
  template:
    metadata:
      labels:
        app: webprometrics
    spec:
      containers:
      - name: webprometrics
        image: your-registry.com/webprometrics:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: webprometrics-secrets
              key: jwt-secret
        - name: ALLOWED_ORIGINS
          value: "https://yourdomain.com"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
```

### Deploy to Kubernetes
```bash
# Create secret
kubectl create secret generic webprometrics-secrets \
  --from-literal=jwt-secret=$(openssl rand -base64 32)

# Apply deployment
kubectl apply -f k8s-deployment.yaml

# Verify
kubectl get pods
kubectl logs -l app=webprometrics
```

---

## Container Management

### View Logs
```bash
# Real-time logs
docker-compose logs -f webprometrics

# Last N lines
docker-compose logs --tail=100 webprometrics

# Specific service
docker logs webprometrics-app
```

### Exec into Container
```bash
docker-compose exec webprometrics sh
```

### Backup Data
```bash
# Backup database file
docker-compose exec -T webprometrics cp /app/db.json /app/data/db-backup-$(date +%Y%m%d).json

# Copy to host
docker cp webprometrics-app:/app/data ./backups
```

### Update Container
```bash
# Pull new image
docker pull your-registry.com/webprometrics:2.0.0

# Stop old container
docker-compose down

# Update docker-compose.yml with new image tag
nano docker-compose.yml

# Start new container
docker-compose up -d
```

---

## Monitoring

### Container Stats
```bash
docker stats webprometrics-app
```

### Container Inspection
```bash
docker inspect webprometrics-app
```

### Health Check Status
```bash
docker inspect --format='{{.State.Health.Status}}' webprometrics-app
```

---

## Performance Tuning

### Memory Limits
```yaml
resources:
  limits:
    memory: 1Gi
  requests:
    memory: 512Mi
```

### CPU Limits
```yaml
resources:
  limits:
    cpus: '1'
  requests:
    cpus: '0.5'
```

### Restart Policy
```yaml
restart_policy:
  condition: on-failure
  delay: 5s
  max_attempts: 3
  window: 120s
```

---

## Security Best Practices

### 1. Use Non-Root User
```dockerfile
RUN useradd -m app
USER app
```

### 2. Read-Only File System
```yaml
security_context:
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 1000
```

### 3. Network Security
```yaml
networks:
  webprometrics-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.25.0.0/16
```

### 4. Secrets Management
```bash
# Use Docker Secrets (Swarm)
echo "your-secret" | docker secret create jwt_secret -

# Or environment variables from file
docker-compose --env-file .env.prod up -d
```

### 5. Image Scanning
```bash
# Scan for vulnerabilities
docker scan webprometrics:latest

# Or use Trivy
trivy image webprometrics:latest
```

---

## Troubleshooting

### Container Won't Start
```bash
docker-compose logs webprometrics
docker-compose events --filter type=container
```

### Port Already in Use
```bash
# Check which container is using port
sudo lsof -i :8080

# Change port in docker-compose.yml
ports:
  - "9080:8080"  # Use 9080 instead of 8080
```

### High Memory Usage
```bash
# Check container memory
docker stats

# Increase memory limit
# Edit docker-compose.yml:
resources:
  limits:
    memory: 2Gi
```

### Database File Permissions
```bash
# Fix volume permissions
docker-compose exec webprometrics chown -R app:app /app/data
```

---

## Docker Commands Reference

```bash
# Build
docker build -t webprometrics:1.0.0 .

# Run
docker run -d -p 8080:8080 webprometrics:1.0.0

# List images
docker images

# List containers
docker ps

# View logs
docker logs -f <container_id>

# Stop container
docker stop <container_id>

# Remove container
docker rm <container_id>

# Push to registry
docker push <registry>/<image>:<tag>

# Pull from registry
docker pull <registry>/<image>:<tag>

# Docker Compose
docker-compose up -d          # Start
docker-compose down           # Stop
docker-compose logs -f        # View logs
docker-compose ps             # List services
docker-compose exec <svc> sh  # Shell access
```

---

## Production Checklist

- [ ] Dockerfile optimized (multi-stage build)
- [ ] Base image from trusted source
- [ ] Non-root user configured
- [ ] Health checks configured
- [ ] Resource limits set
- [ ] Restart policy configured
- [ ] Volumes for data persistence
- [ ] Network security configured
- [ ] Secrets stored securely
- [ ] Logging configured
- [ ] Monitoring in place
- [ ] Backup strategy defined

---

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Docker Deployment Status:** ✅ Ready for Production
