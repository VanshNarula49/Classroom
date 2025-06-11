#!/bin/bash

# Super Simple Deployment Script with Nginx Proxy Manager

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

print_status "🚀 Starting Simple Deployment with Nginx Proxy Manager..."

# Step 1: Build frontend
print_status "Building frontend..."
if [ -d "Frontend" ]; then
    cd Frontend
    npm install
    npm run build
    cd ..
    print_success "Frontend built successfully"
else
    print_error "Frontend directory not found!"
fi

# Step 2: Stop any existing containers
print_status "Stopping existing containers..."
docker-compose -f docker/docker-compose.npm.yml down --remove-orphans || true

# Step 3: Start all services
print_status "Starting all services..."
docker-compose -f docker/docker-compose.npm.yml up -d --build

# Step 4: Wait for services
print_status "Waiting for services to start..."
sleep 30

# Step 5: Show status
print_status "Checking service status..."
docker-compose -f docker/docker-compose.npm.yml ps

print_success "🎉 Deployment completed!"
echo ""
echo "=== NEXT STEPS ==="
echo "1. 🌐 Open http://localhost:81 for Nginx Proxy Manager admin panel"
echo "   Default login: admin@example.com / changeme"
echo ""
echo "2. 📝 In Nginx Proxy Manager, add proxy hosts:"
echo "   - Domain: classroom.set4.me"
echo "   - Forward to: frontend:80 (for main site)"
echo "   - Add another for API: classroom.set4.me/api -> api:3000"
echo "   - Add another for MinIO: classroom.set4.me/minio -> minio:9000"
echo ""
echo "3. 🔒 Enable SSL in Nginx Proxy Manager (automatic with Let's Encrypt)"
echo ""
echo "4. 🛑 To stop: docker-compose -f docker/docker-compose.npm.yml down"
echo ""
print_status "Your app will be available at: https://classroom.set4.me (after NPM setup)"
