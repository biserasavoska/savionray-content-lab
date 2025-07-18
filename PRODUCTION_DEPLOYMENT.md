# Production Deployment Guide

## Overview

This guide covers the complete production deployment of the SavionRay Content Lab application with real-time collaboration features, monitoring, and scaling capabilities.

## Architecture

### Production Stack
- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Node.js with Socket.IO for real-time features
- **Database**: PostgreSQL 15 with Prisma ORM
- **Cache**: Redis 7 for session storage and caching
- **Reverse Proxy**: Nginx with SSL termination
- **Monitoring**: Prometheus + Grafana
- **Containerization**: Docker + Docker Compose

### Services
1. **nextjs-app**: Main Next.js application (port 3000)
2. **socket-server**: Socket.IO real-time server (port 4001)
3. **postgres**: PostgreSQL database (port 5432)
4. **redis**: Redis cache (port 6379)
5. **nginx**: Reverse proxy (ports 80, 443)
6. **prometheus**: Metrics collection (port 9090)
7. **grafana**: Monitoring dashboard (port 3001)

## Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+ recommended) or macOS
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: Minimum 20GB free space
- **CPU**: 2+ cores recommended

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Git
- OpenSSL (for certificate generation)

### Domain & SSL
- Domain name pointing to your server
- SSL certificates (Let's Encrypt recommended)

## Quick Deployment

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd savionray-content-lab

# Make deployment script executable
chmod +x scripts/deploy-production.sh
```

### 2. Configure Environment
```bash
# Copy and edit environment file
cp .env.production.example .env.production
nano .env.production
```

**Required Environment Variables:**
```env
# Database
POSTGRES_PASSWORD=your_secure_password
REDIS_PASSWORD=your_secure_password

# Application Secrets
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://yourdomain.com

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket

# Monitoring
GRAFANA_PASSWORD=your_grafana_password
```

### 3. Deploy
```bash
# Run the deployment script
./scripts/deploy-production.sh
```

The script will:
- Check dependencies
- Create necessary directories
- Generate SSL certificates
- Create monitoring configuration
- Build and start all services
- Run database migrations
- Seed initial data

## Manual Deployment

### 1. Create Directories
```bash
mkdir -p nginx/ssl nginx/logs
mkdir -p monitoring/grafana/{dashboards,datasources}
```

### 2. Generate SSL Certificates
```bash
# Self-signed (development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=yourdomain.com"

# Or use Let's Encrypt (production)
certbot certonly --standalone -d yourdomain.com
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
```

### 3. Build and Start Services
```bash
# Build all images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### 4. Database Setup
```bash
# Run migrations
docker-compose exec nextjs-app npx prisma migrate deploy

# Seed database
docker-compose exec nextjs-app npx prisma db seed
```

## Configuration

### Nginx Configuration
The Nginx configuration includes:
- SSL termination
- Rate limiting
- Gzip compression
- Security headers
- WebSocket proxy
- Static file caching

**Key Features:**
- Rate limiting: 10 req/s for API, 100 req/s for WebSocket
- SSL with modern ciphers
- Security headers (HSTS, XSS protection, etc.)
- WebSocket support for real-time features

### Monitoring Setup
**Prometheus** collects metrics from:
- Next.js application (`/api/metrics`)
- Socket.IO server (`/metrics`)
- Nginx (`/nginx_status`)

**Grafana** provides dashboards for:
- Application performance
- Real-time collaboration metrics
- Database performance
- System resources

### Performance Optimizations
**Socket.IO Server:**
- Rate limiting (100 requests/minute per user)
- Content change throttling (100ms minimum interval)
- Connection pooling
- Performance metrics collection

**Next.js Application:**
- Static file optimization
- API rate limiting
- Database connection pooling
- Caching strategies

## Monitoring & Maintenance

### Health Checks
```bash
# Check all services
docker-compose ps

# Check specific service logs
docker-compose logs socket-server
docker-compose logs nextjs-app

# Health endpoints
curl https://yourdomain.com/health
curl https://yourdomain.com/socket.io/health
```

### Performance Monitoring
```bash
# Access Grafana
open http://yourdomain.com:3001
# Username: admin
# Password: (set in GRAFANA_PASSWORD)

# Access Prometheus
open http://yourdomain.com:9090
```

### Database Maintenance
```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres savionray_content_lab > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres savionray_content_lab < backup.sql

# Run migrations
docker-compose exec nextjs-app npx prisma migrate deploy
```

### Log Management
```bash
# View application logs
docker-compose logs -f nextjs-app

# View Socket.IO logs
docker-compose logs -f socket-server

# View Nginx logs
docker-compose logs -f nginx

# View database logs
docker-compose logs -f postgres
```

## Scaling

### Horizontal Scaling
```bash
# Scale Next.js app
docker-compose up -d --scale nextjs-app=3

# Scale Socket.IO server
docker-compose up -d --scale socket-server=2
```

### Load Balancer Configuration
For production scaling, consider using:
- **HAProxy** for load balancing
- **Redis Cluster** for session sharing
- **PostgreSQL replication** for read scaling

### Auto-scaling
Set up auto-scaling based on:
- CPU usage
- Memory usage
- Connection count
- Response time

## Security

### SSL/TLS
- Use Let's Encrypt for free SSL certificates
- Configure automatic renewal
- Use modern TLS protocols (1.2, 1.3)

### Firewall
```bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### Environment Security
- Use strong, unique passwords
- Rotate secrets regularly
- Use environment-specific configurations
- Never commit secrets to version control

### Application Security
- Input validation and sanitization
- Rate limiting
- SQL injection prevention
- XSS protection
- CSRF protection

## Backup Strategy

### Database Backups
```bash
# Automated daily backup
0 2 * * * docker-compose exec -T postgres pg_dump -U postgres savionray_content_lab | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Backup retention (keep 30 days)
find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

### File Backups
```bash
# Backup uploaded files
rsync -av /app/uploads/ /backups/uploads/

# Backup configuration
cp .env.production /backups/env_$(date +%Y%m%d).backup
```

### Disaster Recovery
1. **Document recovery procedures**
2. **Test backup restoration**
3. **Maintain off-site backups**
4. **Monitor backup success**

## Troubleshooting

### Common Issues

**Service Won't Start:**
```bash
# Check logs
docker-compose logs <service-name>

# Check resource usage
docker stats

# Restart service
docker-compose restart <service-name>
```

**Database Connection Issues:**
```bash
# Check database status
docker-compose exec postgres pg_isready -U postgres

# Check connection string
docker-compose exec nextjs-app env | grep DATABASE_URL
```

**Real-time Features Not Working:**
```bash
# Check Socket.IO server
curl http://localhost:4001/health

# Check WebSocket connection
docker-compose logs socket-server | grep "connection"
```

**Performance Issues:**
```bash
# Check resource usage
docker stats

# Check application metrics
curl http://localhost:4001/metrics

# Check database performance
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

### Performance Tuning

**Database Optimization:**
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_content_drafts_organization_id ON content_drafts(organization_id);
CREATE INDEX idx_comments_content_draft_id ON comments(content_draft_id);

-- Analyze table statistics
ANALYZE content_drafts;
ANALYZE comments;
```

**Application Optimization:**
- Enable Redis caching
- Optimize database queries
- Use connection pooling
- Implement request caching

## Updates & Maintenance

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Run migrations
docker-compose exec nextjs-app npx prisma migrate deploy
```

### Security Updates
```bash
# Update base images
docker-compose pull
docker-compose build --no-cache

# Update dependencies
docker-compose exec nextjs-app npm audit fix
```

### Monitoring Updates
- Review Grafana dashboards
- Update alerting rules
- Monitor performance trends
- Review security logs

## Support

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.IO Documentation](https://socket.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com)

### Monitoring Tools
- **Grafana**: http://yourdomain.com:3001
- **Prometheus**: http://yourdomain.com:9090
- **Health Check**: https://yourdomain.com/health

### Log Locations
- Application logs: `docker-compose logs nextjs-app`
- Socket.IO logs: `docker-compose logs socket-server`
- Nginx logs: `docker-compose logs nginx`
- Database logs: `docker-compose logs postgres`

---

**Last Updated**: July 18, 2025  
**Version**: 1.0.0  
**Status**: Production Ready 