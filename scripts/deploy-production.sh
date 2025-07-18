#!/bin/bash

# Production Deployment Script for SavionRay Content Lab
# This script sets up and deploys the entire application stack

set -e  # Exit on any error

echo "🚀 Starting production deployment for SavionRay Content Lab..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p nginx/ssl
    mkdir -p nginx/logs
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    mkdir -p scripts
    
    print_success "Directories created"
}

# Generate SSL certificates (self-signed for development)
generate_ssl_certificates() {
    print_status "Generating SSL certificates..."
    
    if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        
        print_success "SSL certificates generated"
    else
        print_warning "SSL certificates already exist, skipping generation"
    fi
}

# Create environment file
create_env_file() {
    print_status "Creating environment file..."
    
    if [ ! -f .env.production ]; then
        cat > .env.production << EOF
# Database Configuration
POSTGRES_PASSWORD=your_secure_postgres_password
REDIS_PASSWORD=your_secure_redis_password

# Application Secrets
JWT_SECRET=your_jwt_secret_key_here
NEXTAUTH_SECRET=your_nextauth_secret_key_here
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
AWS_S3_BUCKET=your_s3_bucket_name

# Monitoring
GRAFANA_PASSWORD=your_grafana_password

# Database URL (will be set by Docker Compose)
DATABASE_URL=postgresql://postgres:your_secure_postgres_password@postgres:5432/savionray_content_lab
REDIS_URL=redis://:your_secure_redis_password@redis:6379
EOF
        
        print_warning "Created .env.production file. Please update it with your actual values before deployment."
    else
        print_warning ".env.production file already exists"
    fi
}

# Create monitoring configuration
create_monitoring_config() {
    print_status "Creating monitoring configuration..."
    
    # Prometheus configuration
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'nextjs-app'
    static_configs:
      - targets: ['nextjs-app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'socket-server'
    static_configs:
      - targets: ['socket-server:4001']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'
    scrape_interval: 30s
EOF

    # Grafana datasource
    mkdir -p monitoring/grafana/datasources
    cat > monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

    print_success "Monitoring configuration created"
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Build images
    docker-compose build
    
    # Start services
    docker-compose up -d
    
    print_success "Services deployed successfully"
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    # Wait for database
    print_status "Waiting for PostgreSQL..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
            break
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    if [ $timeout -eq 0 ]; then
        print_error "PostgreSQL failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    timeout=30
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
            break
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    if [ $timeout -eq 0 ]; then
        print_error "Redis failed to start within 30 seconds"
        exit 1
    fi
    
    # Wait for Socket.IO server
    print_status "Waiting for Socket.IO server..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:4001/health > /dev/null 2>&1; then
            break
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    if [ $timeout -eq 0 ]; then
        print_error "Socket.IO server failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for Next.js app
    print_status "Waiting for Next.js application..."
    timeout=120
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            break
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    if [ $timeout -eq 0 ]; then
        print_error "Next.js application failed to start within 120 seconds"
        exit 1
    fi
    
    print_success "All services are healthy"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    docker-compose exec -T nextjs-app npx prisma migrate deploy
    
    print_success "Database migrations completed"
}

# Seed database if needed
seed_database() {
    print_status "Seeding database..."
    
    docker-compose exec -T nextjs-app npx prisma db seed
    
    print_success "Database seeding completed"
}

# Show deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""
    
    # Show running containers
    docker-compose ps
    
    echo ""
    print_status "Service URLs:"
    echo "  🌐 Main Application: https://localhost"
    echo "  🔌 Socket.IO Server: https://localhost/socket.io/"
    echo "  📊 Grafana Dashboard: http://localhost:3001 (admin/admin123)"
    echo "  📈 Prometheus Metrics: http://localhost:9090"
    echo "  💚 Health Check: https://localhost/health"
    
    echo ""
    print_status "Next Steps:"
    echo "  1. Update your DNS to point to this server"
    echo "  2. Replace self-signed SSL certificates with real ones"
    echo "  3. Update environment variables in .env.production"
    echo "  4. Configure monitoring alerts in Grafana"
    echo "  5. Set up automated backups for the database"
}

# Main deployment function
main() {
    echo "=========================================="
    echo "  SavionRay Content Lab - Production Deployment"
    echo "=========================================="
    echo ""
    
    check_dependencies
    create_directories
    generate_ssl_certificates
    create_env_file
    create_monitoring_config
    deploy_services
    wait_for_services
    run_migrations
    seed_database
    show_status
    
    echo ""
    print_success "🎉 Production deployment completed successfully!"
    echo ""
    print_warning "Remember to:"
    echo "  - Update .env.production with real values"
    echo "  - Replace SSL certificates with real ones"
    echo "  - Configure your domain and DNS"
    echo "  - Set up monitoring alerts"
    echo "  - Configure automated backups"
}

# Run main function
main "$@" 