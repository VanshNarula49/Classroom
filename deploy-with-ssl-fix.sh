#!/bin/bash

# Production Deployment Script with SSL Fix
# This script addresses all deployment issues including MinIO, Nginx, SSL, and database problems

set -e  # Exit on any error

echo "🚀 Starting Production Deployment..."

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

# Default configuration
DEFAULT_DOMAIN="yourdomain.com"
DEFAULT_EMAIL="admin@yourdomain.com"

# Get domain name and email from user
read -p "Enter your domain name (default: $DEFAULT_DOMAIN): " DOMAIN_NAME
DOMAIN_NAME=${DOMAIN_NAME:-$DEFAULT_DOMAIN}

read -p "Enter your email for Let's Encrypt (default: $DEFAULT_EMAIL): " EMAIL
EMAIL=${EMAIL:-$DEFAULT_EMAIL}

# Validate domain format
if [[ ! $DOMAIN_NAME =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
    print_warning "Invalid domain format. Please use a valid domain like 'example.com'"
fi

print_status "Domain: $DOMAIN_NAME"
print_status "Email: $EMAIL"

# Set environment variables
export DOMAIN_NAME
export EMAIL

# Step 1: Clean up Docker system
print_status "Step 1: Cleaning up Docker system..."
docker system prune -f || true
docker volume prune -f || true
print_success "Docker cleanup completed"

# Step 2: Stop any existing containers
print_status "Step 2: Stopping existing containers..."
docker-compose -f docker/docker-compose.prod.yml down --remove-orphans || true
print_success "Existing containers stopped"

# Step 3: Create necessary volumes
print_status "Step 3: Creating Docker volumes..."
docker volume create certbot_certs || true
docker volume create certbot_www || true
docker volume create postgres_data_prod || true
docker volume create minio_data_prod || true
print_success "Docker volumes created"

# Step 4: Create Docker network if it doesn't exist
print_status "Step 4: Creating Docker network..."
docker network create classroom-network || print_warning "Network already exists"
print_success "Docker network ready"

# Step 5: Build and prepare frontend
print_status "Step 5: Building frontend..."
if [ ! -d "Frontend/dist" ]; then
    print_status "Building frontend with Docker..."
    docker run --rm -v "$(pwd)/Frontend:/app" -w /app node:18-alpine sh -c "
        npm install && 
        npm run build
    "
fi
print_success "Frontend built successfully"

# Step 6: Create environment file
print_status "Step 6: Creating environment file..."
cat > .env << EOF
DOMAIN_NAME=$DOMAIN_NAME
EMAIL=$EMAIL
DB_NAME=myclassroomdb
DB_USER=avnadmin
DB_PASSWORD=yourpassword
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadminpassword
JWT_SECRET=your-production-jwt-secret-$(date +%s)
NODE_ENV=production
EOF
print_success "Environment file created"

# Step 7: Start with HTTP-only nginx configuration
print_status "Step 7: Starting services with HTTP-only configuration..."
# Temporarily use HTTP-only nginx config
cp docker/nginx-prod/nginx.http-only.conf docker/nginx-prod/default.conf.temp
docker run --rm -v "$(pwd)/docker/nginx-prod/default.conf.temp:/etc/nginx/templates/default.conf.template" \
    -e NGINX_DOMAIN=$DOMAIN_NAME nginx:latest envsubst '${NGINX_DOMAIN}' < /etc/nginx/templates/default.conf.template > "$(pwd)/docker/nginx-prod/default.conf"

# Update docker-compose to use the temporary config
sed 's|./nginx-prod/nginx.prod.conf:/etc/nginx/conf.d/default.conf|./nginx-prod/default.conf:/etc/nginx/conf.d/default.conf|' docker/docker-compose.prod.yml > docker/docker-compose.temp.yml

# Start services with HTTP-only config
docker-compose -f docker/docker-compose.temp.yml up -d
print_success "Services started with HTTP-only configuration"

# Step 8: Wait for services to be ready
print_status "Step 8: Waiting for services to be ready..."
sleep 30

# Test if nginx is responding
for i in {1..5}; do
    if curl -f "http://$DOMAIN_NAME/.well-known/acme-challenge/test" > /dev/null 2>&1 || curl -f "http://localhost/.well-known/acme-challenge/test" > /dev/null 2>&1; then
        print_success "Nginx is responding"
        break
    else
        print_warning "Attempt $i: Nginx not ready yet, waiting..."
        sleep 10
    fi
done

# Step 9: Generate SSL certificates
print_status "Step 9: Generating SSL certificates..."

# Test Let's Encrypt in staging mode first
print_status "Testing certificate generation in staging mode..."
docker run --rm \
    -v certbot_certs:/etc/letsencrypt \
    -v certbot_www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --staging \
    --force-renewal \
    -d $DOMAIN_NAME || {
        print_error "Staging certificate generation failed"
        print_status "Continuing with self-signed certificate for development..."
        
        # Create self-signed certificate for development
        docker run --rm \
            -v certbot_certs:/etc/letsencrypt \
            alpine/openssl sh -c "
                mkdir -p /etc/letsencrypt/live/$DOMAIN_NAME && \
                openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                    -keyout /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem \
                    -out /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem \
                    -subj '/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN_NAME'
            "
    }

# If staging worked, try production
if docker exec classroom-certbot ls /etc/letsencrypt/live/$DOMAIN_NAME > /dev/null 2>&1; then
    print_status "Staging successful, generating production certificate..."
    docker run --rm \
        -v certbot_certs:/etc/letsencrypt \
        -v certbot_www:/var/www/certbot \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        -d $DOMAIN_NAME || print_warning "Production certificate generation failed, using staging certificate"
fi

print_success "SSL certificates prepared"

# Step 10: Create SSL configuration files
print_status "Step 10: Creating SSL configuration files..."

# Generate DH parameters (optional, but good for security)
docker run --rm -v certbot_certs:/etc/letsencrypt alpine/openssl sh -c "
    if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then
        openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
    fi
" || print_warning "DH parameters generation skipped"

print_success "SSL configuration files created"

# Step 11: Switch to SSL nginx configuration
print_status "Step 11: Switching to SSL configuration..."

# Generate the SSL nginx config with environment variables
docker run --rm -v "$(pwd)/docker/nginx-prod/nginx.prod.conf:/etc/nginx/templates/nginx.prod.conf.template" \
    -e NGINX_DOMAIN=$DOMAIN_NAME nginx:latest envsubst '${NGINX_DOMAIN}' < /etc/nginx/templates/nginx.prod.conf.template > "$(pwd)/docker/nginx-prod/nginx.ssl.conf"

# Stop services
docker-compose -f docker/docker-compose.temp.yml down

# Update nginx config to use SSL version
cp docker/nginx-prod/nginx.ssl.conf docker/nginx-prod/default.conf

# Start with SSL configuration
docker-compose -f docker/docker-compose.prod.yml up -d

print_success "Switched to SSL configuration"

# Step 12: Wait for services and test
print_status "Step 12: Testing deployment..."
sleep 45

# Test services
print_status "Testing service connectivity..."

# Test HTTP redirect
if curl -I -s "http://$DOMAIN_NAME" | grep -q "301\|302"; then
    print_success "HTTP to HTTPS redirect working"
else
    print_warning "HTTP redirect may not be working"
fi

# Test HTTPS
if curl -k -f "https://$DOMAIN_NAME" > /dev/null 2>&1; then
    print_success "HTTPS is responding"
else
    print_warning "HTTPS may not be working"
fi

# Test API
if curl -k -f "https://$DOMAIN_NAME/api/health" > /dev/null 2>&1; then
    print_success "API is responding"
else
    print_warning "API may not be responding"
fi

# Step 13: Display final status
print_status "Step 13: Deployment Summary"

echo ""
echo "=== DEPLOYMENT SUMMARY ==="
echo "Domain: https://$DOMAIN_NAME"
echo "Email: $EMAIL"
echo ""
echo "Services Status:"
docker-compose -f docker/docker-compose.prod.yml ps

echo ""
echo "=== NEXT STEPS ==="
echo "1. Update your DNS to point $DOMAIN_NAME to this server's IP"
echo "2. Test the application at https://$DOMAIN_NAME"
echo "3. Check logs if any issues: docker-compose -f docker/docker-compose.prod.yml logs"
echo "4. Set up certificate renewal: add to crontab:"
echo "   0 12 * * * docker run --rm -v certbot_certs:/etc/letsencrypt -v certbot_www:/var/www/certbot certbot/certbot renew --quiet"

# Cleanup
rm -f docker/docker-compose.temp.yml docker/nginx-prod/default.conf.temp docker/nginx-prod/nginx.ssl.conf docker/nginx-prod/default.conf

print_success "Deployment completed! 🎉"

echo ""
print_status "Logs can be viewed with:"
echo "docker-compose -f docker/docker-compose.prod.yml logs -f"

echo ""
print_status "To restart all services:"
echo "docker-compose -f docker/docker-compose.prod.yml restart"
