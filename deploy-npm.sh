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
echo "=== NGINX PROXY MANAGER SETUP ==="
echo "1. 🌐 Open http://your-server-ip:81 for Nginx Proxy Manager admin"
echo "   Default login: admin@example.com / changeme"
echo ""
echo "2. 📝 Add proxy hosts in NPM (each gets SSL automatically):"
echo ""
echo "   HOST 1 - Main Frontend:"
echo "   - Domain: classroom.set4.me"
echo "   - Forward to: frontend:80"
echo "   - SSL: ✅ Enable Let's Encrypt"
echo ""
echo "   HOST 2 - API:"
echo "   - Domain: classroom.set4.me"
echo "   - Forward to: api:3000"
echo "   - Advanced → Custom locations:"
echo "     Location: /api/"
echo "     Forward to: http://api:3000/"
echo "   - SSL: ✅ Enable Let's Encrypt"
echo ""
echo "   HOST 3 - MinIO:"
echo "   - Domain: classroom.set4.me"
echo "   - Forward to: minio:9000"
echo "   - Advanced → Custom locations:"
echo "     Location: /minio/"
echo "     Forward to: http://minio:9000/"
echo "   - SSL: ✅ Enable Let's Encrypt"
echo ""
echo "=== FINAL URLS ==="
echo "🌐 Main site: https://classroom.set4.me/"
echo "🔗 API: https://classroom.set4.me/api/"
echo "📁 MinIO: https://classroom.set4.me/minio/"
echo ""
echo "4. 🛑 To stop: docker-compose -f docker/docker-compose.npm.yml down"
echo ""
print_status "NPM handles everything - SSL + path routing!"
