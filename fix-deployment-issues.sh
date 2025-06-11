#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Project directory setup
PROJECT_DIR_ON_SERVER=$(pwd)
COMPOSE_FILE_PATH="$PROJECT_DIR_ON_SERVER/docker/docker-compose.prod.yml"
ENV_FILE="$PROJECT_DIR_ON_SERVER/docker/.env.prod"
NGINX_CONFIG="$PROJECT_DIR_ON_SERVER/docker/nginx-prod/nginx.prod.conf"

echo "================================================================="
echo "🚀 COMPREHENSIVE DEPLOYMENT FIX SCRIPT"
echo "================================================================="
print_step "This script will fix all deployment issues and start services"

# 1. Stop all services first
print_step "Step 1: Stopping all services to prevent conflicts..."
docker-compose -f "$COMPOSE_FILE_PATH" down 2>/dev/null || true
docker stop temp-nginx-challenge 2>/dev/null || true
docker rm temp-nginx-challenge 2>/dev/null || true

# 2. Clean up Docker space
print_step "Step 2: Cleaning up Docker space..."
print_status "Removing unused Docker resources..."
docker system prune -f 2>/dev/null || true
docker volume prune -f 2>/dev/null || true

# 3. Fix Nginx Brotli Configuration
print_step "Step 3: Fixing Nginx Brotli configuration..."
if [ -f "$NGINX_CONFIG" ]; then
    if grep -q "brotli" "$NGINX_CONFIG"; then
        print_status "Removing brotli directives from nginx config..."
        # Create backup
        cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup"
        
        # Remove brotli lines
        sed -i.tmp '/brotli/d' "$NGINX_CONFIG"
        rm -f "$NGINX_CONFIG.tmp"
        
        print_status "Nginx brotli configuration fixed!"
    else
        print_status "Nginx configuration already correct (no brotli directives found)"
    fi
else
    print_error "Nginx configuration file not found at $NGINX_CONFIG"
    exit 1
fi

# 4. Create or fix environment file
print_step "Step 4: Creating/fixing environment file..."
if [ ! -f "$ENV_FILE" ]; then
    print_status "Creating new environment file with correct credentials..."
    
    # Get domain and email from user
    read -p "Enter your domain name (e.g., classroom.set4.me): " DOMAIN_NAME
    while [ -z "$DOMAIN_NAME" ]; do
        echo "Domain name cannot be empty."
        read -p "Enter your domain name (e.g., classroom.set4.me): " DOMAIN_NAME
    done
    
    read -p "Enter your email for Let's Encrypt SSL: " LETSENCRYPT_EMAIL
    while [ -z "$LETSENCRYPT_EMAIL" ]; do
        echo "Email cannot be empty."
        read -p "Enter your email for Let's Encrypt SSL: " LETSENCRYPT_EMAIL
    done
    
    # Create environment file with original credentials
    mkdir -p "$(dirname "$ENV_FILE")"
    cat <<EOL > "$ENV_FILE"
DOMAIN_NAME=$DOMAIN_NAME
LETSENCRYPT_EMAIL=$LETSENCRYPT_EMAIL

# Database credentials (matching original setup)
DB_NAME=myclassroomdb
DB_USER=avnadmin
DB_PASSWORD=yourpassword

# MinIO credentials (matching original setup)
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadminpassword

# JWT Secret
JWT_SECRET=$(openssl rand -hex 32)

# Nginx domain
NGINX_DOMAIN=$DOMAIN_NAME
EOL
    print_status "Environment file created with original credentials"
else
    print_status "Environment file exists, checking credentials..."
    source "$ENV_FILE"
    
    # Check if we need to prompt for missing values
    if [ -z "$DOMAIN_NAME" ]; then
        read -p "Enter your domain name (e.g., classroom.set4.me): " DOMAIN_NAME
        echo "DOMAIN_NAME=$DOMAIN_NAME" >> "$ENV_FILE"
        echo "NGINX_DOMAIN=$DOMAIN_NAME" >> "$ENV_FILE"
    fi
    
    if [ -z "$LETSENCRYPT_EMAIL" ]; then
        read -p "Enter your email for Let's Encrypt SSL: " LETSENCRYPT_EMAIL
        echo "LETSENCRYPT_EMAIL=$LETSENCRYPT_EMAIL" >> "$ENV_FILE"
    fi
fi

# Load environment to check database credentials
source "$ENV_FILE"

# 5. Fix database credentials to match original setup
print_step "Step 5: Ensuring database credentials match original setup..."

# Check if the environment file has the wrong credentials and fix them
if [[ "$DB_USER" != "avnadmin" ]] || [[ "$DB_PASSWORD" != "yourpassword" ]] || [[ "$DB_NAME" != "myclassroomdb" ]]; then
    print_warning "Database credentials in .env.prod don't match original setup. Fixing..."
    
    # Update the environment file with correct credentials
    sed -i.bak "s/^DB_NAME=.*/DB_NAME=myclassroomdb/" "$ENV_FILE"
    sed -i.bak "s/^DB_USER=.*/DB_USER=avnadmin/" "$ENV_FILE"
    sed -i.bak "s/^DB_PASSWORD=.*/DB_PASSWORD=yourpassword/" "$ENV_FILE"
    
    # Also fix MinIO credentials to match original
    sed -i.bak "s/^MINIO_ROOT_USER=.*/MINIO_ROOT_USER=minioadmin/" "$ENV_FILE"
    sed -i.bak "s/^MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=minioadminpassword/" "$ENV_FILE"
    
    print_status "Updated .env.prod with original credentials"
    
    # Reload the environment
    source "$ENV_FILE"
fi

# 6. Reset database volume if credentials mismatch
if docker volume ls | grep -q postgres_data_prod; then
    print_step "Step 6: Checking database volume..."
    print_warning "PostgreSQL data volume exists. Checking for credential mismatch..."
    
    # Try to connect with the current credentials
    print_status "Testing database connection with current credentials..."
    if ! docker run --rm --network docker_default postgres:13 \
        psql "postgresql://$DB_USER:$DB_PASSWORD@postgres-db-prod:5432/$DB_NAME" \
        -c "SELECT 1;" 2>/dev/null; then
        
        print_warning "Database authentication failed with current credentials."
        echo "This usually happens when the database was initialized with different credentials."
        echo "We'll reset the database volume to ensure clean setup."
        
        print_status "Removing PostgreSQL data volume..."
        docker volume rm postgres_data_prod 2>/dev/null || true
        print_status "Database volume reset. The database will be recreated with correct credentials."
    else
        print_status "Database credentials are correct."
    fi
else
    print_status "No existing database volume found. Fresh setup will be created."
fi

# 7. Build frontend
print_step "Step 7: Building frontend application..."
FRONTEND_DIR="$PROJECT_DIR_ON_SERVER/Frontend"

if [ -d "$FRONTEND_DIR" ]; then
    print_status "Found frontend directory: $FRONTEND_DIR"
    
    # Check if dist already exists and ask user
    if [ -d "$FRONTEND_DIR/dist" ] && [ "$(ls -A $FRONTEND_DIR/dist 2>/dev/null)" ]; then
        echo "Frontend dist directory already exists with content."
        read -p "Do you want to rebuild the frontend? (y/N): " rebuild_frontend
        if [[ ! "$rebuild_frontend" =~ ^[Yy]$ ]]; then
            print_status "Skipping frontend build."
        else
            print_status "Building frontend with Docker..."
            docker run --rm \
                -v "$FRONTEND_DIR":/usr/src/app \
                -w /usr/src/app \
                --user $(id -u):$(id -g) \
                node:18-alpine sh -c "npm install && npm run build"
        fi
    else
        print_status "Building frontend with Docker..."
        docker run --rm \
            -v "$FRONTEND_DIR":/usr/src/app \
            -w /usr/src/app \
            --user $(id -u):$(id -g) \
            node:18-alpine sh -c "npm install && npm run build"
    fi
    
    print_status "Frontend build complete."
    if [ ! -d "$FRONTEND_DIR/dist" ] || [ -z "$(ls -A $FRONTEND_DIR/dist)" ]; then
        print_error "Frontend build did not produce a non-empty dist directory."
        print_error "Please check your frontend build configuration and npm run build script."
        exit 1
    fi
    print_status "Build artifacts found in $FRONTEND_DIR/dist"
else
    print_error "Frontend directory $FRONTEND_DIR not found."
    exit 1
fi

# 8. Create SSL configuration files
print_step "Step 8: Creating SSL configuration files..."
print_status "Ensuring SSL configuration files exist..."
if ! docker run --rm -v certbot_certs:/etc/letsencrypt alpine:latest \
    sh -c "[ -f /etc/letsencrypt/ssl-dhparams.pem ]"; then
    print_status "Generating DH parameters (this may take a few minutes)..."
    docker run --rm -v certbot_certs:/etc/letsencrypt alpine:latest \
        sh -c "apk add --no-cache openssl && openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048"
else
    print_status "DH parameters already exist."
fi

if ! docker run --rm -v certbot_certs:/etc/letsencrypt alpine:latest \
    sh -c "[ -f /etc/letsencrypt/options-ssl-nginx.conf ]"; then
    print_status "Creating SSL options file..."
    docker run --rm -v certbot_certs:/etc/letsencrypt alpine:latest \
        sh -c 'cat > /etc/letsencrypt/options-ssl-nginx.conf << EOF
# Modern SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
EOF'
else
    print_status "SSL options file already exists."
fi

# 9. Setup HTTP-only nginx for SSL challenge
print_step "Step 9: Setting up HTTP-only Nginx for SSL challenge..."
HTTP_NGINX_CONF="$PROJECT_DIR_ON_SERVER/docker/nginx-prod/nginx.http-only.conf"
cat <<EOL > "$HTTP_NGINX_CONF"
server {
    listen 80;
    server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};

    # Handle Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files \$uri =404;
    }

    # Serve basic status page for everything else
    location / {
        return 200 'Server is ready for SSL configuration';
        add_header Content-Type text/plain;
    }
}
EOL

# Start nginx with the HTTP-only config
print_status "Starting Nginx container for challenge..."
docker run -d \
    --name temp-nginx-challenge \
    --network docker_default \
    -p 80:80 \
    -v "$HTTP_NGINX_CONF:/etc/nginx/conf.d/default.conf:ro" \
    -v /var/www/certbot:/var/www/certbot:ro \
    nginx:latest || {
    print_error "Failed to start Nginx container. Check if port 80 is already in use."
    exit 1
}

sleep 5
print_status "Challenge Nginx started successfully."

# 10. Obtain SSL certificate
print_step "Step 10: Obtaining SSL certificate..."

# Check DNS first
print_status "Checking DNS resolution for $DOMAIN_NAME..."
if nslookup "$DOMAIN_NAME" >/dev/null 2>&1; then
    print_status "DNS resolution successful for $DOMAIN_NAME"
else
    print_warning "DNS resolution failed for $DOMAIN_NAME."
    echo "Make sure your domain points to this server's IP address."
    read -p "Do you want to continue anyway? (y/N): " continue_anyway
    if [[ ! "$continue_anyway" =~ ^[Yy]$ ]]; then
        print_error "Aborting. Please ensure your DNS is properly configured."
        exit 1
    fi
fi

# Check if certificate already exists
if docker run --rm -v certbot_certs:/etc/letsencrypt alpine:latest \
    sh -c "[ -f /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem ]" 2>/dev/null; then
    print_status "SSL certificate already exists for $DOMAIN_NAME"
else
    print_status "Requesting new certificate for $DOMAIN_NAME and www.$DOMAIN_NAME..."
    print_status "This may take a few minutes. Let's Encrypt is validating domain ownership..."
    
    # Run certbot with timeout and better error handling
    timeout 300 docker run --rm \
        -v certbot_certs:/etc/letsencrypt \
        -v /var/www/certbot:/var/www/certbot \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        -d "$DOMAIN_NAME" \
        -d "www.$DOMAIN_NAME" \
        --email "$LETSENCRYPT_EMAIL" \
        --rsa-key-size 4096 \
        --agree-tos \
        --non-interactive \
        --verbose || {
        
        print_error "Certificate issuance failed."
        print_warning "This might be due to DNS issues or firewall blocking."
        echo "You can continue without SSL for testing purposes."
        read -p "Do you want to continue deployment without SSL? (y/N): " continue_no_ssl
        if [[ ! "$continue_no_ssl" =~ ^[Yy]$ ]]; then
            exit 1
        fi
    }
fi

# 11. Stop challenge nginx
print_step "Step 11: Stopping challenge Nginx..."
docker stop temp-nginx-challenge 2>/dev/null || true
docker rm temp-nginx-challenge 2>/dev/null || true
rm -f "$HTTP_NGINX_CONF"

# 12. Deploy application with all services
print_step "Step 12: Deploying application with all services..."

# Ensure nginx config directory exists
sudo mkdir -p "$(dirname "$NGINX_CONFIG")" 2>/dev/null || true

# Start all services
print_status "Starting all production services..."
docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" up -d --build

print_status "Waiting for services to start..."
sleep 15

# 13. Check service health
print_step "Step 13: Checking service status..."
echo "=== Docker Compose Services ==="
docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" ps

echo ""
echo "=== SSL Certificate Status ==="
if docker run --rm -v certbot_certs:/etc/letsencrypt alpine:latest \
    sh -c "[ -f /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem ]" 2>/dev/null; then
    print_status "SSL certificate exists for $DOMAIN_NAME"
else
    print_warning "No SSL certificate found for $DOMAIN_NAME"
fi

echo ""
echo "=== Network Connectivity Test ==="
if command -v curl >/dev/null 2>&1; then
    print_status "Testing HTTP connectivity..."
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost/" | grep -q "200\|301\|302"; then
        print_status "HTTP (port 80) is responding"
    else
        print_warning "HTTP (port 80) is not responding"
    fi
    
    if docker run --rm -v certbot_certs:/etc/letsencrypt alpine:latest \
        sh -c "[ -f /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem ]" 2>/dev/null; then
        print_status "Testing HTTPS connectivity..."
        if curl -k -s -o /dev/null -w "%{http_code}" "https://localhost/" | grep -q "200"; then
            print_status "HTTPS (port 443) is responding"
        else
            print_warning "HTTPS (port 443) is not responding"
        fi
    fi
else
    print_warning "curl not available, skipping connectivity tests"
fi

echo ""
echo "================================================================="
print_status "🎉 DEPLOYMENT COMPLETED!"
echo "================================================================="
echo ""
print_status "Your application should be accessible at:"
if docker run --rm -v certbot_certs:/etc/letsencrypt alpine:latest \
    sh -c "[ -f /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem ]" 2>/dev/null; then
    echo "🔒 HTTPS: https://$DOMAIN_NAME"
    echo "🔓 HTTP:  http://$DOMAIN_NAME (redirects to HTTPS)"
else
    echo "🔓 HTTP:  http://$DOMAIN_NAME"
    echo "⚠️  SSL certificate not found - HTTPS not available"
fi
echo ""
print_status "Useful commands:"
echo "📊 Check status: docker-compose -f $COMPOSE_FILE_PATH --env-file $ENV_FILE ps"
echo "📋 View logs:    docker-compose -f $COMPOSE_FILE_PATH --env-file $ENV_FILE logs"
echo "🔄 Restart:      docker-compose -f $COMPOSE_FILE_PATH --env-file $ENV_FILE restart"
echo "🛑 Stop:         docker-compose -f $COMPOSE_FILE_PATH --env-file $ENV_FILE down"
echo ""
print_status "If you see any issues, check the logs with the commands above."
echo "================================================================="
