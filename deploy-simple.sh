#!/bin/bash

# Simple Production Deployment Script
# No SSL, no complicated templating - just works!

set -e

echo "🚀 Starting Simple Production Deployment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Step 1: Clean up
print_status "Step 1: Cleaning up existing containers..."
docker-compose -f docker/docker-compose.simple.yml down --remove-orphans || true
docker system prune -f || true
print_success "Cleanup completed"

# Step 2: Build frontend
print_status "Step 2: Building frontend..."
if [ -d "Frontend" ]; then
    print_status "Building frontend with npm..."
    cd Frontend
    npm install
    npm run build
    cd ..
    print_success "Frontend built successfully"
else
    print_error "Frontend directory not found!"
    exit 1
fi

# Step 3: Start services
print_status "Step 3: Starting all services..."
docker-compose -f docker/docker-compose.simple.yml up -d --build
print_success "All services started"

# Step 4: Wait and test
print_status "Step 4: Waiting for services to be ready..."
sleep 30

# Test if services are running
print_status "Testing services..."

# Test nginx
if curl -f http://localhost > /dev/null 2>&1; then
    print_success "Frontend is accessible at http://localhost"
else
    print_warning "Frontend may not be accessible"
fi

# Test API
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    print_success "API is accessible at http://localhost/api/health"
else
    print_warning "API may not be accessible"
fi

# Step 5: Show status
print_status "Step 5: Deployment Summary"
echo ""
echo "=== SERVICES STATUS ==="
docker-compose -f docker/docker-compose.simple.yml ps
echo ""
echo "=== ACCESS URLS ==="
echo "Frontend: http://localhost"
echo "API: http://localhost/api/"
echo "MinIO: http://localhost/minio/"
echo ""
echo "=== LOGS ==="
echo "View logs: docker-compose -f docker/docker-compose.simple.yml logs -f [service_name]"
echo "Stop services: docker-compose -f docker/docker-compose.simple.yml down"
echo ""

print_success "Simple deployment completed! 🎉"
print_status "Your application should be running at http://localhost"

# Show any container issues
failed_containers=$(docker-compose -f docker/docker-compose.simple.yml ps --services --filter "status=exited")
if [ ! -z "$failed_containers" ]; then
    print_warning "Some containers failed to start:"
    for container in $failed_containers; do
        print_error "Failed: $container"
        print_status "Logs for $container:"
        docker-compose -f docker/docker-compose.simple.yml logs --tail=10 $container
    done
fi

exit 0
