#!/bin/bash

# Simple deployment script for Classroom app
set -e

echo "🚀 Starting Classroom deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to project directory
cd "$(dirname "$0")"

echo -e "${YELLOW}📦 Building frontend...${NC}"
cd Frontend
npm ci
npm run build
cd ..

echo -e "${YELLOW}🐳 Starting Docker containers...${NC}"
cd docker
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "🌐 Services are starting up..."
echo "   - Nginx Proxy Manager Admin: http://your-server-ip:81"
echo "   - Default login: admin@example.com / changeme"
echo ""
echo "📋 Next steps:"
echo "   1. Access Nginx Proxy Manager at port 81"
echo "   2. Change default password"
echo "   3. Add proxy hosts for your domains:"
echo "      - Frontend: point to classroom-frontend:80"
echo "      - API: point to classroom-api:3000" 
echo "      - MinIO Console: point to classroom-minio:9090"
echo "   4. Enable SSL certificates"
echo ""
echo "📊 Check status: docker-compose -f docker-compose.prod.yml ps"
echo "📄 View logs: docker-compose -f docker-compose.prod.yml logs -f"
