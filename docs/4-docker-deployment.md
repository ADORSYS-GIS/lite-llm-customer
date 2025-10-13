# Docker Deployment Guide

This guide provides comprehensive instructions for deploying the LiteLLM Customer Management application using Docker and Docker Compose.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker**: Version 20.10 or higher
  ```bash
  docker --version
  ```

- **Docker Compose**: Version 2.0 or higher
  ```bash
  docker compose version
  ```

- **Git**: For cloning the repository
  ```bash
  git --version
  ```

### System Requirements

- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 10GB free space (for images and volumes)
- **OS**: Linux, macOS, or Windows with WSL2

---

## Quick Start

Get up and running in 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/lite-llm-customer.git
cd lite-llm-customer

# 2. Copy environment template
cp .env.docker.example .env

# 3. Generate NextAuth secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env

# 4. Copy docker-compose template
cp docker-compose.example.yml docker-compose.yml

# 5. Copy LiteLLM config template (if not exists)
cp litellm-config.example.yaml litellm-config.yaml

# 6. Start all services
docker compose up -d

# 7. Pull Ollama models (if using Ollama)
docker exec -it ollama ollama pull llama3.2

# 8. Access the application
# Open http://localhost:3000 in your browser
```

**Default Login Credentials:**
- Email: `admin@example.com`
- Password: `password`

⚠️ **Important**: Change these credentials in production!

---

## Detailed Setup

### Step 1: Clone and Navigate

```bash
git clone https://github.com/your-org/lite-llm-customer.git
cd lite-llm-customer
```

### Step 2: Configure Environment Variables

Copy the environment template:

```bash
cp .env.docker.example .env
```

Edit `.env` and configure the following:

```bash
# Generate a secure NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Set your admin credentials
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-secure-password

# Configure LiteLLM connection
LITELLM_PROXY_URL=http://litellm:4000
LITELLM_API_KEY=sk-1234

# Set the application URL
NEXTAUTH_URL=http://localhost:3000
```

### Step 3: Configure Docker Compose

Copy the docker-compose template:

```bash
cp docker-compose.example.yml docker-compose.yml
```

**Optional**: Edit `docker-compose.yml` to customize:
- Port mappings
- Resource limits
- Volume configurations
- Network settings

### Step 4: Configure LiteLLM (if using full stack)

Create `litellm-config.yaml`:

```yaml
model_list:
  - model_name: "llama3.2"
    litellm_params:
      model: "ollama_chat/llama3.2"
      api_base: "http://ollama:11434"

  - model_name: "codellama"
    litellm_params:
      model: "ollama_chat/codellama"
      api_base: "http://ollama:11434"

general_settings:
  master_key: sk-1234
  database_url: postgresql://litellm:secret@db:5432/litellm
```

### Step 5: Build and Start Services

```bash
# Build the application image
docker compose build

# Start all services in detached mode
docker compose up -d

# View logs
docker compose logs -f
```

### Step 6: Initialize Ollama Models (if using Ollama)

```bash
# Pull the llama3.2 model
docker exec -it ollama ollama pull llama3.2

# Pull additional models (optional)
docker exec -it ollama ollama pull codellama
docker exec -it ollama ollama pull mistral

# List available models
docker exec -it ollama ollama list
```

### Step 7: Verify Deployment

```bash
# Check service health
docker compose ps

# Test health endpoint
curl http://localhost:3000/api/health

# Test LiteLLM connection
curl http://localhost:4000/health \
  -H "Authorization: Bearer sk-1234"
```

### Step 8: Access the Application

Open your browser and navigate to:
- **Application**: http://localhost:3000
- **LiteLLM Admin**: http://localhost:4000

Login with your configured admin credentials.

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `LITELLM_PROXY_URL` | LiteLLM proxy endpoint | `http://litellm:4000` |
| `LITELLM_API_KEY` | LiteLLM master key | `sk-1234` |
| `NEXTAUTH_SECRET` | NextAuth session secret | `<random-32-char-string>` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `ADMIN_EMAIL` | Admin login email | `admin@example.com` |
| `ADMIN_PASSWORD` | Admin login password | `password` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `HOSTNAME` | Bind hostname | `0.0.0.0` |
| `SKIP_ENV_VALIDATION` | Skip env validation during build | `1` (in Dockerfile) |

### Generating Secrets

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate LiteLLM API key
openssl rand -hex 16 | sed 's/^/sk-/'

# Generate PostgreSQL password
openssl rand -base64 24
```

---

## Architecture

### Service Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose Stack                     │
│                                                               │
│  ┌─────────────────┐         ┌──────────────────────────┐  │
│  │   Next.js App   │────────▶│   LiteLLM Proxy          │  │
│  │   (port 3000)   │         │   (port 4000)            │  │
│  │                 │         │                          │  │
│  │ - Admin UI      │         │ - Customer Management    │  │
│  │ - NextAuth      │         │ - Budget Management      │  │
│  │ - tRPC API      │         │ - Usage Tracking         │  │
│  └─────────────────┘         └──────────────────────────┘  │
│                                        │                     │
│                                        ▼                     │
│                              ┌──────────────────┐           │
│                              │   PostgreSQL     │           │
│                              │   (port 5432)    │           │
│                              └──────────────────┘           │
│                                        │                     │
│                                        ▼                     │
│                              ┌──────────────────┐           │
│                              │     Ollama       │           │
│                              │   (port 11434)   │           │
│                              └──────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Container Details

**app (litellm-customer-ui)**
- **Image**: Built from local Dockerfile
- **Purpose**: Web UI for managing LiteLLM customers and budgets
- **Dependencies**: litellm service
- **Health Check**: HTTP GET to `/api/health`

**litellm**
- **Image**: `ghcr.io/berriai/litellm:main-latest`
- **Purpose**: LiteLLM proxy for model management
- **Dependencies**: db, ollama
- **Health Check**: HTTP GET to `/health`

**db (litellm-db)**
- **Image**: `postgres:15-alpine`
- **Purpose**: Database for LiteLLM metadata
- **Health Check**: `pg_isready`

**ollama**
- **Image**: `ollama/ollama:latest`
- **Purpose**: Local LLM runtime
- **Optional**: Can be replaced with external LLM service

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:
```bash
# Check what's using the port
lsof -i :3000

# Kill the process or change the port in docker-compose.yml
ports:
  - "3001:3000"  # Map to different host port
```

#### 2. Cannot Connect to LiteLLM

**Error**: `Failed to list customers` or connection refused

**Solution**:
```bash
# Check if LiteLLM is running
docker compose ps litellm

# Check LiteLLM logs
docker compose logs litellm

# Verify network connectivity
docker exec -it litellm-customer-ui curl http://litellm:4000/health

# Restart LiteLLM
docker compose restart litellm
```

#### 3. Authentication Failures

**Error**: `Invalid credentials` or session errors

**Solution**:
```bash
# Verify environment variables
docker compose exec app env | grep -E 'ADMIN|NEXTAUTH'

# Ensure NEXTAUTH_SECRET is set
# Ensure NEXTAUTH_URL matches your access URL

# Restart the app
docker compose restart app
```

#### 4. Build Failures

**Error**: Build fails with dependency errors

**Solution**:
```bash
# Clear Docker build cache
docker builder prune -a

# Rebuild without cache
docker compose build --no-cache

# Check Node version in Dockerfile (should be 20)
```

#### 5. Database Connection Issues

**Error**: LiteLLM can't connect to PostgreSQL

**Solution**:
```bash
# Check database health
docker compose ps db

# Check database logs
docker compose logs db

# Verify database credentials in docker-compose.yml

# Reset database
docker compose down -v
docker compose up -d
```

#### 6. Ollama Models Not Found

**Error**: Model not available in LiteLLM

**Solution**:
```bash
# Check if model is pulled
docker exec -it ollama ollama list

# Pull the model
docker exec -it ollama ollama pull llama3.2

# Verify model in litellm-config.yaml
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f litellm
docker compose logs -f db
docker compose logs -f ollama

# Last 100 lines
docker compose logs --tail=100 app

# Since specific time
docker compose logs --since 2024-01-01T00:00:00
```

### Debugging Container

```bash
# Execute shell in container
docker compose exec app sh

# Check environment variables
docker compose exec app env

# Test network connectivity
docker compose exec app wget -O- http://litellm:4000/health

# Check file permissions
docker compose exec app ls -la /app
```

---

## Production Deployment

### Security Best Practices

#### 1. Use Strong Secrets

```bash
# Generate strong secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
LITELLM_API_KEY=$(openssl rand -hex 32 | sed 's/^/sk-/')
ADMIN_PASSWORD=$(openssl rand -base64 24)
```

#### 2. Use Docker Secrets

Create `docker-compose.prod.yml`:

```yaml
version: "3.8"

secrets:
  nextauth_secret:
    file: ./secrets/nextauth_secret.txt
  admin_password:
    file: ./secrets/admin_password.txt

services:
  app:
    secrets:
      - nextauth_secret
      - admin_password
    environment:
      NEXTAUTH_SECRET_FILE: /run/secrets/nextauth_secret
      ADMIN_PASSWORD_FILE: /run/secrets/admin_password
```

#### 3. Enable HTTPS

Use a reverse proxy (Nginx, Traefik, Caddy):

**Nginx Example**:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 4. Restrict Network Access

```yaml
services:
  app:
    networks:
      - frontend
      - backend
  
  litellm:
    networks:
      - backend
    # Don't expose port to host in production
    # ports:
    #   - "4000:4000"

networks:
  frontend:
  backend:
    internal: true
```

#### 5. Set Resource Limits

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Environment Configuration

Update `.env` for production:

```bash
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
LITELLM_PROXY_URL=http://litellm:4000
# Use strong, unique secrets
NEXTAUTH_SECRET=<strong-secret>
ADMIN_PASSWORD=<strong-password>
```

### Backup Strategy

#### Database Backup

```bash
# Backup PostgreSQL
docker exec litellm-db pg_dump -U litellm litellm > backup-$(date +%Y%m%d).sql

# Restore
docker exec -i litellm-db psql -U litellm litellm < backup-20240101.sql
```

#### Volume Backup

```bash
# Backup Ollama models
docker run --rm -v lite-llm-customer_ollama:/data -v $(pwd):/backup \
  alpine tar czf /backup/ollama-backup-$(date +%Y%m%d).tar.gz -C /data .

# Restore
docker run --rm -v lite-llm-customer_ollama:/data -v $(pwd):/backup \
  alpine tar xzf /backup/ollama-backup-20240101.tar.gz -C /data
```

### Automated Backups

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker exec litellm-db pg_dump -U litellm litellm | gzip > \
  "$BACKUP_DIR/db-$DATE.sql.gz"

# Backup volumes
docker run --rm -v lite-llm-customer_ollama:/data -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/ollama-$DATE.tar.gz -C /data .

# Keep only last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/litellm-backup.log 2>&1
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Application health
curl http://localhost:3000/api/health

# LiteLLM health
curl http://localhost:4000/health -H "Authorization: Bearer sk-1234"

# Database health
docker compose exec db pg_isready -U litellm
```

### Resource Monitoring

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Volume usage
docker volume ls
docker volume inspect lite-llm-customer_pgdata
```

### Log Management

Configure log rotation in `docker-compose.yml`:

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Updates and Maintenance

```bash
# Pull latest images
docker compose pull

# Rebuild app
docker compose build --no-cache app

# Restart with new images
docker compose up -d

# Clean up old images
docker image prune -a
```

### Scaling

Run multiple app instances:

```yaml
services:
  app:
    deploy:
      replicas: 3
```

Or use Docker Swarm / Kubernetes for advanced orchestration.

---

## Testing Workflow

Complete testing checklist:

```bash
# 1. Build the image
docker compose build

# 2. Start all services
docker compose up -d

# 3. Wait for services to be healthy
docker compose ps

# 4. Check logs
docker compose logs -f app

# 5. Verify health
curl http://localhost:3000/api/health

# 6. Test login
# Navigate to http://localhost:3000/login
# Login with ADMIN_EMAIL and ADMIN_PASSWORD

# 7. Test LiteLLM integration
# Navigate to http://localhost:3000/admin/customers
# Should display customers from LiteLLM

# 8. Test budget creation
# Navigate to http://localhost:3000/admin/budgets
# Create a new budget

# 9. Test customer assignment
# Assign budget to a customer

# 10. Cleanup
docker compose down -v
```

---

## Additional Resources

- [LiteLLM Documentation](https://docs.litellm.ai/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NextAuth.js Documentation](https://next-auth.js.org/)

---

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-org/lite-llm-customer/issues)
- Documentation: Check other docs in `/docs` directory
- LiteLLM Community: [LiteLLM Discord](https://discord.gg/litellm)

---

**Last Updated**: 2025-10-13
