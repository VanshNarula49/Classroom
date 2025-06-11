#!/bin/bash

# Simple Production Deployment Script
# This script deploys your classroom app without SSL (for testing)

set -e  # Exit on any error

echo "🚀 Starting Simple Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
print_status "Step 1: Cleaning up Docker..."
docker system prune -f || true
docker-compose -f docker/docker-compose.simple.yml down --remove-orphans || true
print_success "Cleanup completed"

# Step 2: Build frontend
print_status "Step 2: Building frontend..."
if [ -d "Frontend" ]; then
    cd Frontend
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    print_status "Building frontend for production..."
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
print_success "Services started"

# Step 4: Wait and test
print_status "Step 4: Waiting for services to be ready..."
sleep 30

print_status "Testing services..."

# Test nginx
if curl -f "http://localhost" > /dev/null 2>&1; then
    print_success "✅ Frontend is accessible at http://localhost"
else
    print_warning "❌ Frontend may not be accessible"
fi

# Test API
if curl -f "http://localhost/api/health" > /dev/null 2>&1; then
    print_success "✅ API is responding at http://localhost/api/health"
else
    print_warning "❌ API may not be responding"
fi

# Test MinIO
if curl -f "http://localhost/minio/health/live" > /dev/null 2>&1; then
    print_success "✅ MinIO is accessible at http://localhost/minio/"
else
    print_warning "❌ MinIO may not be accessible"
fi

# Step 5: Show status
print_status "Step 5: Deployment Summary"
echo ""
echo "=== SERVICES STATUS ==="
docker-compose -f docker/docker-compose.simple.yml ps
echo ""
echo "=== NEXT STEPS ==="
echo "1. 🌐 Open http://localhost in your browser"
echo "2. 🔧 If using a domain, point it to this server's IP"
echo "3. 📝 Check logs: docker-compose -f docker/docker-compose.simple.yml logs -f"
echo "4. 🛑 Stop services: docker-compose -f docker/docker-compose.simple.yml down"
echo ""

print_success "🎉 Simple deployment completed!"
print_status "Your app should be running at: http://localhost"

exit 0
