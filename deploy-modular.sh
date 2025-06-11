#!/bin/bash

# Modular Production Deployment Script with SSL (Certbot)
# Usage: ./deploy-modular.sh [step1] [step2] ... or ./deploy-modular.sh all

set -e # Exit on any error

# --- Configuration ---
LETSENCRYPT_EMAIL="vansh100.narula@gmail.com"
DOMAIN_NAME="classroom.set4.me"
MAIN_DOCKER_COMPOSE_FILE="docker/docker-compose.simple.yml"
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

# --- Individual Step Functions ---

step_cleanup() {
    print_status "🧹 Step: Cleanup - Removing all containers and volumes..."
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" down --remove-orphans --volumes || true
    docker system prune -f || true
    rm -f "$CERTS_OBTAINED_FLAG" || true
    
    # Restore nginx config if backup exists
    if [ -f "docker/nginx-simple/nginx.conf.ssl-backup" ]; then
        mv docker/nginx-simple/nginx.conf.ssl-backup docker/nginx-simple/nginx.conf
        print_status "Restored nginx SSL config from backup"
    fi
    
    print_success "✅ Cleanup completed"
}

step_build_frontend() {
    print_status "🏗️  Step: Build Frontend..."
    if [ -d "Frontend" ]; then
        print_status "Building frontend using Docker..."
        docker run --rm \
            -v "$(pwd)/Frontend:/app" \
            -w /app \
            node:18-alpine \
            sh -c "npm install && npm run build"
        
        if [ -d "Frontend/dist" ]; then
            print_success "✅ Frontend built successfully"
        else
            print_error "❌ Frontend build failed - dist folder not found"
        fi
    else
        print_error "❌ Frontend directory not found!"
    fi
}

step_build_images() {
    print_status "🐳 Step: Build/Pull Docker Images..."
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" pull
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" build api
    print_success "✅ Docker images ready"
}

step_get_ssl() {
    print_status "🔒 Step: SSL Certificate Acquisition..."
    
    if [ -f "$CERTS_OBTAINED_FLAG" ]; then
        print_warning "⚠️  SSL certificates already obtained (flag file exists)"
        print_status "To force renewal, run: $0 cleanup get_ssl"
        return 0
    fi
    
    print_warning "⚠️  IMPORTANT: Ensure DNS for $DOMAIN_NAME points to this server's IP and ports 80/443 are open"
    
    # Clean up any existing containers
    print_status "Cleaning up any existing containers..."
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" down --remove-orphans --volumes || true
    
    # Back up the original nginx config and replace it with HTTP-only version
    print_status "Temporarily replacing Nginx config with HTTP-only version..."
    if [ ! -f "docker/nginx-simple/nginx.conf.ssl-backup" ]; then
        cp docker/nginx-simple/nginx.conf docker/nginx-simple/nginx.conf.ssl-backup
    fi
    cp docker/nginx-simple/nginx-http-only.conf docker/nginx-simple/nginx.conf

    print_status "Starting Nginx in HTTP-only mode for ACME challenge..."
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" up -d nginx

    print_status "Waiting for HTTP-only Nginx to be ready..."
    sleep 15

    # Test that HTTP is working
    if curl -f "http://$DOMAIN_NAME" > /dev/null 2>&1; then
        print_success "✅ HTTP endpoint is accessible"
    else
        print_warning "⚠️  HTTP endpoint may not be accessible. Continuing anyway..."
    fi

    print_status "Requesting Let's Encrypt certificate for $DOMAIN_NAME..."
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" run --rm certbot certonly \
      --webroot -w /var/www/certbot \
      --email "$LETSENCRYPT_EMAIL" \
      -d "$DOMAIN_NAME" \
      --agree-tos \
      --no-eff-email \
      --non-interactive \
      --force-renewal

    print_success "✅ Certificate acquisition process finished"
    
    print_status "Stopping HTTP-only Nginx and restoring SSL config..."
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" stop nginx
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" rm -f nginx
    
    # Restore the original SSL nginx config
    mv docker/nginx-simple/nginx.conf.ssl-backup docker/nginx-simple/nginx.conf

    print_status "Creating flag file: $CERTS_OBTAINED_FLAG"
    touch "$CERTS_OBTAINED_FLAG"
    
    print_success "✅ SSL certificates obtained and nginx config restored"
}

step_start_services() {
    print_status "🚀 Step: Start All Services..."
    
    # Ensure any previous instances are down
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" down --remove-orphans > /dev/null 2>&1 || true
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" up -d

    print_success "✅ All services started"
}

step_test() {
    print_status "🧪 Step: Test Endpoints..."
    
    print_status "Waiting for services to stabilize..."
    sleep 20

    print_status "Testing HTTPS endpoint for $DOMAIN_NAME..."
    if curl -ksSf "https://$DOMAIN_NAME" > /dev/null 2>&1; then
        print_success "✅ HTTPS site is accessible at https://$DOMAIN_NAME"
    else
        print_warning "❌ HTTPS site may not be accessible at https://$DOMAIN_NAME"
        print_status "Nginx logs:"
        docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" logs nginx --tail 10
    fi

    if curl -ksSf "https://$DOMAIN_NAME/api/health" > /dev/null 2>&1; then
        print_success "✅ API is responding at https://$DOMAIN_NAME/api/health"
    else
        print_warning "❌ API may not be responding at https://$DOMAIN_NAME/api/health"
        print_status "API logs:"
        docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" logs api --tail 10
    fi
}

step_status() {
    print_status "📊 Step: Show Status..."
    echo ""
    echo "=== SERVICES STATUS ==="
    docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" ps
    echo ""
    echo "=== SSL CERTIFICATE STATUS ==="
    if [ -f "$CERTS_OBTAINED_FLAG" ]; then
        print_success "✅ SSL certificates obtained"
        if docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" exec nginx ls /etc/letsencrypt/live/$DOMAIN_NAME/ > /dev/null 2>&1; then
            print_success "✅ SSL certificate files exist in nginx container"
        else
            print_warning "⚠️  SSL certificate files may not be accessible in nginx container"
        fi
    else
        print_warning "⚠️  SSL certificates not obtained yet"
    fi
    echo ""
    echo "=== USEFUL COMMANDS ==="
    echo "Check logs: docker-compose -f $MAIN_DOCKER_COMPOSE_FILE logs -f [service_name]"
    echo "Stop services: docker-compose -f $MAIN_DOCKER_COMPOSE_FILE down"
    echo "Restart service: docker-compose -f $MAIN_DOCKER_COMPOSE_FILE restart [service_name]"
    echo ""
}

step_logs() {
    local service="${1:-}"
    if [ -z "$service" ]; then
        print_status "📝 Showing logs for all services..."
        docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" logs --tail 20
    else
        print_status "📝 Showing logs for $service..."
        docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" logs --tail 50 "$service"
    fi
}

# --- Help Function ---
show_help() {
    echo "🚀 Modular Deployment Script for $DOMAIN_NAME"
    echo ""
    echo "Usage: $0 [step1] [step2] ... [stepN]"
    echo ""
    echo "Available steps:"
    echo "  cleanup          - Remove all containers, volumes, and reset state"
    echo "  build_frontend   - Build the React frontend"
    echo "  build_images     - Build/pull Docker images"
    echo "  get_ssl         - Obtain SSL certificates from Let's Encrypt"
    echo "  start_services  - Start all services with HTTPS"
    echo "  test            - Test HTTPS endpoints"
    echo "  status          - Show current status"
    echo "  logs [service]  - Show logs (optionally for specific service)"
    echo ""
    echo "Special commands:"
    echo "  all             - Run all steps in order (except cleanup)"
    echo "  fresh           - cleanup + all steps"
    echo "  ssl_only        - Only SSL-related steps (get_ssl + start_services + test)"
    echo "  restart         - Stop and start services"
    echo ""
    echo "Examples:"
    echo "  $0 all                    # Full deployment"
    echo "  $0 fresh                  # Clean deployment from scratch"
    echo "  $0 build_frontend start_services  # Just rebuild frontend and restart"
    echo "  $0 get_ssl test          # Get SSL certificates and test"
    echo "  $0 logs nginx            # Show nginx logs"
    echo "  $0 status                # Show current status"
    echo ""
}

# --- Main Script Logic ---

if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

# Process command line arguments
for arg in "$@"; do
    case $arg in
        cleanup)
            step_cleanup
            ;;
        build_frontend)
            step_build_frontend
            ;;
        build_images)
            step_build_images
            ;;
        get_ssl)
            step_get_ssl
            ;;
        start_services)
            step_start_services
            ;;
        test)
            step_test
            ;;
        status)
            step_status
            ;;
        logs)
            shift # Remove 'logs' from arguments
            step_logs "$1"
            shift # Remove service name if provided
            ;;
        all)
            step_build_frontend
            step_build_images
            step_get_ssl
            step_start_services
            step_test
            step_status
            ;;
        fresh)
            step_cleanup
            step_build_frontend
            step_build_images
            step_get_ssl
            step_start_services
            step_test
            step_status
            ;;
        ssl_only)
            step_get_ssl
            step_start_services
            step_test
            ;;
        restart)
            docker-compose -f "$MAIN_DOCKER_COMPOSE_FILE" down
            step_start_services
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "❌ Unknown step: $arg. Use '$0 help' to see available steps."
            ;;
    esac
done

print_success "🎉 Deployment operations completed!"
echo "Your app should be running at: https://$DOMAIN_NAME"
