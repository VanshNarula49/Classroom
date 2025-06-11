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

print_step "Fixing deployment issues..."

# 1. Stop all services first
print_status "Stopping all services to prevent conflicts..."
docker-compose -f "$COMPOSE_FILE_PATH" down 2>/dev/null || true

# 2. Create SSL configuration files if they don't exist
print_status "Ensuring SSL configuration files exist..."
if ! docker run --rm -v certbot_certs:/etc/letsencrypt alpine:latest \
    sh -c "[ -f /etc/letsencrypt/ssl-dhparams.pem ]"; then
    print_status "Generating DH parameters..."
    docker run --rm -v certbot_certs:/etc/letsencrypt alpine:latest \
        sh -c "apk add --no-cache openssl && openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048"
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
fi

# 3. Check if environment file exists and has correct format
if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file $ENV_FILE not found!"
    echo "Please run the deployment script step 1 (Configure Environment) first."
    exit 1
fi

# Load environment to check database credentials
source "$ENV_FILE"

# 4. Check if database credentials match between env file and any existing database
if docker volume ls | grep -q postgres_data_prod; then
    print_warning "PostgreSQL data volume exists. Checking for credential mismatch..."
    
    # Try to connect with the current credentials
    print_status "Testing database connection with current credentials..."
    if ! docker run --rm --network docker_default postgres:13 \
        psql "postgresql://$DB_USER:$DB_PASSWORD@postgres-db-prod:5432/$DB_NAME" \
        -c "SELECT 1;" 2>/dev/null; then
        
        print_error "Database authentication failed with current credentials."
        echo "This usually happens when:"
        echo "1. The database was initialized with different credentials"
        echo "2. The .env.prod file has been changed after database creation"
        echo ""
        echo "Options to fix this:"
        echo "1. Reset the database (WILL DELETE ALL DATA): docker volume rm postgres_data_prod"
        echo "2. Update the environment file with the correct existing credentials"
        echo "3. Manually reset the database password"
        echo ""
        read -p "Do you want to reset the database volume? (y/N): " reset_db
        if [[ "$reset_db" =~ ^[Yy]$ ]]; then
            print_status "Removing PostgreSQL data volume..."
            docker volume rm postgres_data_prod 2>/dev/null || true
            print_status "Database volume reset. The database will be recreated on next startup."
        else
            print_warning "Database issue not resolved. Please check your credentials manually."
        fi
    else
        print_status "Database credentials are correct."
    fi
fi

# 5. Clean up any old nginx containers that might be interfering
print_status "Cleaning up any temporary nginx containers..."
docker stop temp-nginx-challenge 2>/dev/null || true
docker rm temp-nginx-challenge 2>/dev/null || true

# 6. Check certificate status
if docker run --rm -v certbot_certs:/etc/letsencrypt alpine:latest \
    sh -c "[ -f /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem ]" 2>/dev/null; then
    print_status "SSL certificate exists for $DOMAIN_NAME"
else
    print_warning "No SSL certificate found for $DOMAIN_NAME"
    echo "You may need to run the SSL certificate step (step 5) in the deployment script."
fi

print_status "Issue fixing completed. You can now try to start the services again."
echo ""
echo "Recommended next steps:"
echo "1. Run: docker-compose -f $COMPOSE_FILE_PATH --env-file $ENV_FILE up -d"
echo "2. Check logs: docker-compose -f $COMPOSE_FILE_PATH --env-file $ENV_FILE logs"
echo "3. If issues persist, run the deployment script step by step."
