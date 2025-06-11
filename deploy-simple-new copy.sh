#!/bin/bash

# Production Deployment Script with SSL (Certbot) - HTTP First Approach

set -e # Exit on any error

# --- Configuration ---
LETSENCRYPT_EMAIL="vansh100.narula@gmail.com" # !!! REPLACE THIS !!!
DOMAIN_NAME="classroom.set4.me"
MAIN_DOCKER_COMPOSE_FILE="docker/docker-compose.simple.yml"
NGINX_HTTP_ONLY_COMPOSE_OVERRIDE="docker/docker-compose.nginx-http-only.override.yml"
# Flag file to indicate that initial certificates have been obtained
CERTS_OBTAINED_FLAG=".certs_obtained_flag_$(echo $DOMAIN_NAME | sed 's/\./_/g')"


# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {    echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() {   echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() {   echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() {     echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# --- Main Script ---
print_status "🚀 Starting Production Deployment with SSL for $DOMAIN_NAME (HTTP First Approach)..."

# Step 1: Build frontend
print_status "Step 1: Building frontend..."
if [ -d "Frontend" ]; then
    print_status "Building frontend using Docker..."
    docker run --rm \
        -v "$(pwd)/Frontend:/app" \
        -w /app \
        node:18-alpine \
        sh -c "npm install && npm run build"
    
    if [ -d "Frontend/dist" ]; then
        print_success "Frontend built successfully."
    else
        print_error "Frontend build failed - dist folder not found."
    fi
else
    print_error "Frontend directory not found!"
fi

# Step 2: Build/Pull Docker images for services
print_status "Step 2: Building/Pulling Docker images for services..."
docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" pull # Pull base images
docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" build api # Build your API image
print_success "Docker images ready."

# Step 3: Handle SSL Certificate Acquisition with Certbot
if [ ! -f "$CERTS_OBTAINED_FLAG" ]; then
    print_status "Step 3: Initial SSL setup for $DOMAIN_NAME..."
    print_warning "IMPORTANT: Ensure DNS for $DOMAIN_NAME points to this server's IP and ports 80/443 are open."

    # First, clean up any existing containers and volumes that might have bad certs
    print_status "Cleaning up any existing containers and volumes..."
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" down --remove-orphans --volumes || true
    
    # Back up the original nginx config and replace it temporarily with HTTP-only version
    print_status "Temporarily replacing Nginx config with HTTP-only version..."
    mv docker/nginx-simple/nginx.conf docker/nginx-simple/nginx.conf.ssl-backup
    cp docker/nginx-simple/nginx-http-only.conf docker/nginx-simple/nginx.conf

    print_status "Starting Nginx in HTTP-only mode for ACME challenge..."
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" up -d nginx

    print_status "Waiting for HTTP-only Nginx to be ready..."
    sleep 15

    # Test that HTTP is working
    if curl -f "http://$DOMAIN_NAME" > /dev/null 2>&1; then
        print_success "HTTP endpoint is accessible."
    else
        print_warning "HTTP endpoint may not be accessible. Continuing anyway..."
    fi

    print_status "🔑 Ready for SSL certificate acquisition..."
    echo ""
    echo "================================================================"
    echo "🚀 INTERACTIVE CERTBOT MODE"
    echo "================================================================"
    echo "The HTTP-only Nginx is running and accessible at http://$DOMAIN_NAME"
    echo "You can now run Certbot commands interactively."
    echo ""
    echo "🎯 RECOMMENDED COMMAND:"
    echo "docker-compose -f $MAIN_DOCKER_COMPOSE_FILE run --rm --no-deps certbot certonly \\"
    echo "  --webroot -w /var/www/certbot \\"
    echo "  --email $LETSENCRYPT_EMAIL \\"
    echo "  -d $DOMAIN_NAME \\"
    echo "  --agree-tos \\"
    echo "  --no-eff-email \\"
    echo "  --force-renewal"
    echo ""
    echo "🔧 OTHER USEFUL COMMANDS:"
    echo "# Test mode (dry run):"
    echo "docker-compose -f $MAIN_DOCKER_COMPOSE_FILE run --rm --no-deps certbot certonly \\"
    echo "  --webroot -w /var/www/certbot --dry-run -d $DOMAIN_NAME"
    echo ""
    echo "# Interactive mode (you answer questions):"
    echo "docker-compose -f $MAIN_DOCKER_COMPOSE_FILE run --rm --no-deps certbot certonly \\"
    echo "  --webroot -w /var/www/certbot -d $DOMAIN_NAME"
    echo ""
    echo "# Check existing certificates:"
    echo "docker-compose -f $MAIN_DOCKER_COMPOSE_FILE run --rm --no-deps certbot certificates"
    echo ""
    echo "# Debug with verbose output:"
    echo "docker-compose -f $MAIN_DOCKER_COMPOSE_FILE run --rm --no-deps certbot certonly \\"
    echo "  --webroot -w /var/www/certbot -d $DOMAIN_NAME --verbose"
    echo ""
    echo "================================================================"
    
    # Wait for user to run certbot manually
    print_warning "⏳ Waiting for you to run Certbot..."
    echo "Press ENTER after you've successfully obtained the SSL certificates"
    echo "Or type 'skip' to continue without certificates (for testing)"
    read -p "Ready to continue? " user_input
    
    if [ "$user_input" = "skip" ]; then
        print_warning "⚠️  Skipping SSL certificate acquisition"
        # Don't create the flag file, so certificates can be obtained later
    else
        print_success "✅ Proceeding with assumption that certificates were obtained"
        # Create flag file assuming certificates were obtained
        touch "$CERTS_OBTAINED_FLAG"
    fi
    
    print_status "Stopping HTTP-only Nginx and restoring SSL config..."
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" stop nginx
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" rm -f nginx
    
    # Restore the original SSL nginx config
    mv docker/nginx-simple/nginx.conf.ssl-backup docker/nginx-simple/nginx.conf

    print_status "Creating flag file: $CERTS_OBTAINED_FLAG"
    touch "$CERTS_OBTAINED_FLAG"
else
    print_status "Step 3: SSL certificates flag found ($CERTS_OBTAINED_FLAG). Skipping initial acquisition."
    print_status "Certbot container (if running) will handle renewals."
fi

# Step 4: Start all services with the final Nginx configuration (HTTPS enabled)
print_status "Step 4: Bringing up all services with final HTTPS Nginx configuration..."
# Ensure any previous instances are down before starting with the main compose file
docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" down --remove-orphans > /dev/null 2>&1 || true
docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" up -d

print_success "All services should be starting with HTTPS enabled."

# Step 5: Wait and test
print_status "Step 5: Waiting for services to stabilize..."
sleep 20

print_status "Testing HTTPS endpoint for $DOMAIN_NAME..."
if curl -ksSf "https://$DOMAIN_NAME" > /dev/null 2>&1; then
    print_success "✅ HTTPS site is accessible at https://$DOMAIN_NAME"
else
    print_warning "❌ HTTPS site may not be accessible at https://$DOMAIN_NAME. Check Nginx logs."
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" logs nginx --tail 20
fi

if curl -ksSf "https://$DOMAIN_NAME/api/health" > /dev/null 2>&1; then
    print_success "✅ API is responding at https://$DOMAIN_NAME/api/health"
else
    print_warning "❌ API may not be responding at https://$DOMAIN_NAME/api/health. Check API logs."
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" logs api --tail 20
fi

# Step 6: Show status
print_status "Step 6: Deployment Summary"
echo ""
echo "=== SERVICES STATUS ==="
docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" ps
echo ""
echo "=== NEXT STEPS ==="
echo "1. 🌐 Open https://$DOMAIN_NAME in your browser"
echo "2. 📝 Check logs: docker-compose -f $MAIN_DOCKER_COMPOSE_FILE logs -f [service_name]"
echo "3. 🛑 Stop services: docker-compose -f $MAIN_DOCKER_COMPOSE_FILE down"
echo ""

print_success "🎉 Deployment with SSL completed for $DOMAIN_NAME!"
print_status "Your app should be running at: https://$DOMAIN_NAME"

exit 0