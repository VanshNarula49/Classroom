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
DEFAULT_DOMAIN="your.subdomain.com"
DEFAULT_EMAIL="admin@your.subdomain.com"

# Get domain name and email from user
read -p "Enter your subdomain (e.g., app.example.com, default: $DEFAULT_DOMAIN): " DOMAIN_NAME
DOMAIN_NAME=${DOMAIN_NAME:-$DEFAULT_DOMAIN}

read -p "Enter your email for Let\'s Encrypt (default: $DEFAULT_EMAIL): " EMAIL
EMAIL=${EMAIL:-$DEFAULT_EMAIL}

# Validate domain format (simple check for subdomain)
if [[ ! $DOMAIN_NAME =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]{1,253}[a-zA-Z0-9]$ ]]; then
    print_error "Invalid domain format: $DOMAIN_NAME. Please use a valid subdomain like 'app.example.com'"
    exit 1
fi
if [[ ! $EMAIL =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    print_error "Invalid email format: $EMAIL."
    exit 1
fi

print_status "Domain: $DOMAIN_NAME"
print_status "Email: $EMAIL"

# Set environment variables
export DOMAIN_NAME
export EMAIL

# Step 1: Clean up Docker system
print_status "Step 1: Cleaning up Docker system..."
docker system prune -af || print_warning "Docker system prune failed, continuing..."
docker volume prune -f || print_warning "Docker volume prune failed, continuing..."
print_success "Docker cleanup completed"

# Step 2: Stop any existing containers
print_status "Step 2: Stopping existing containers defined in docker-compose.prod.yml..."
if [ -f docker/docker-compose.prod.yml ]; then
    docker-compose -f docker/docker-compose.prod.yml down --remove-orphans || print_warning "Failed to stop some containers or no containers were running."
else
    print_error "docker/docker-compose.prod.yml not found. Cannot stop containers."
    exit 1
fi
print_success "Existing containers stopped"

# Step 3: Create necessary volumes
print_status "Step 3: Creating Docker volumes..."
docker volume create certbot_certs || true
docker volume create certbot_www || true
docker volume create postgres_data_prod || true
docker volume create minio_data_prod || true
print_success "Docker volumes created/ensured"

# Step 4: Create Docker network if it doesn't exist
print_status "Step 4: Creating Docker network 'classroom-network'..."
docker network create classroom-network || print_warning "Network 'classroom-network' already exists or could not be created."
print_success "Docker network ready"

# Step 5: Build and prepare frontend
print_status "Step 5: Building frontend..."
if [ -d "Frontend" ]; then
    if [ ! -d "Frontend/dist" ]; then
        print_status "Building frontend with Docker..."
        if docker run --rm -v "$(pwd)/Frontend:/app" -w /app node:18-alpine sh -c "npm install && npm run build"; then
            print_success "Frontend built successfully"
        else
            print_error "Frontend build failed. Please check Frontend directory and Docker setup."
            exit 1
        fi
    else
        print_status "Frontend/dist directory already exists. Skipping build."
    fi
else
    print_error "Frontend directory not found. Cannot build frontend."
    exit 1
fi


# Step 6: Create environment file
print_status "Step 6: Creating .env file..."
cat > .env << EOF
DOMAIN_NAME=$DOMAIN_NAME
EMAIL=$EMAIL
DB_NAME=myclassroomdb
DB_USER=avnadmin
DB_PASSWORD=yourpassword
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadminpassword
JWT_SECRET=your-production-jwt-secret-$(date +%s | sha256sum | base64 | head -c 32)
NODE_ENV=production
EOF
print_success ".env file created"

# Step 7: Start with HTTP-only nginx configuration for Let\'s Encrypt Challenge
print_status "Step 7: Preparing HTTP-only Nginx configuration..."
if [ ! -f "docker/nginx-prod/nginx.http-only.conf" ]; then
    print_error "HTTP-only Nginx template (docker/nginx-prod/nginx.http-only.conf) not found!"
    exit 1
fi
cp docker/nginx-prod/nginx.http-only.conf docker/nginx-prod/default.conf.temp

print_status "Substituting domain in HTTP-only Nginx configuration..."
# The template nginx.http-only.conf uses ${NGINX_DOMAIN}
if docker run --rm \\
    -e NGINX_DOMAIN="$DOMAIN_NAME" \\
    -v "$(pwd)/docker/nginx-prod/default.conf.temp:/tmp/default.conf.template:ro" \\
    nginx:latest \\
    sh -c "envsubst '\\$NGINX_DOMAIN' < /tmp/default.conf.template" > "$(pwd)/docker/nginx-prod/default.conf"; then
    print_success "HTTP-only Nginx configuration (default.conf) prepared."
else
    print_error "Failed to prepare HTTP-only Nginx configuration."
    rm -f docker/nginx-prod/default.conf.temp
    exit 1
fi
rm -f docker/nginx-prod/default.conf.temp # Clean up the intermediate temp file

# Create a temporary docker-compose file that uses the HTTP-only config
# Ensure the source path in docker-compose.prod.yml for nginx config is what we expect to replace
# Typically: ./nginx-prod/nginx.prod.conf:/etc/nginx/conf.d/default.conf
# We are replacing it with: ./nginx-prod/default.conf:/etc/nginx/conf.d/default.conf
sed 's|./nginx-prod/nginx.prod.conf:/etc/nginx/conf.d/default.conf|./nginx-prod/default.conf:/etc/nginx/conf.d/default.conf|' docker/docker-compose.prod.yml > docker/docker-compose.temp.yml

print_status "Starting services with HTTP-only Nginx configuration..."
docker-compose -f docker/docker-compose.temp.yml up -d nginx-proxy api minio db
print_success "Services (nginx-proxy, api, minio, db) started with HTTP-only configuration."

# Step 8: Wait for Nginx to be ready for challenge
print_status "Step 8: Waiting for Nginx to be ready for Let's Encrypt challenge..."
sleep 15 # Initial wait for services to start
MAX_RETRIES=10
RETRY_COUNT=0
NGINX_READY=false
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    # Test with a unique file to ensure it's not cached and Nginx is serving the challenge directory
    TEST_TOKEN_FILE="test_token_$(date +%s)"
    docker exec classroom-nginx-proxy sh -c "echo 'test' > /var/www/certbot/$TEST_TOKEN_FILE"
    
    if curl -s --head "http://$DOMAIN_NAME/.well-known/acme-challenge/$TEST_TOKEN_FILE" | grep "200 OK" > /dev/null; then
        print_success "Nginx is responding and serving from /var/www/certbot."
        NGINX_READY=true
        docker exec classroom-nginx-proxy rm "/var/www/certbot/$TEST_TOKEN_FILE" # Clean up test file
        break
    elif curl -s --head "http://localhost/.well-known/acme-challenge/$TEST_TOKEN_FILE" | grep "200 OK" > /dev/null; then
        print_success "Nginx (localhost) is responding and serving from /var/www/certbot."
        NGINX_READY=true
        docker exec classroom-nginx-proxy rm "/var/www/certbot/$TEST_TOKEN_FILE" # Clean up test file
        break
    else
        RETRY_COUNT=$((RETRY_COUNT+1))
        print_warning "Attempt $RETRY_COUNT/$MAX_RETRIES: Nginx not ready yet or not serving challenge directory correctly. Waiting 10s..."
        docker exec classroom-nginx-proxy rm -f "/var/www/certbot/$TEST_TOKEN_FILE" # Clean up test file on failure too
        sleep 10
    fi
done

if [ "$NGINX_READY" = false ]; then
    print_error "Nginx did not become ready for Let's Encrypt challenge. Check Nginx logs: docker-compose -f docker/docker-compose.temp.yml logs nginx-proxy"
    print_error "Ensure your domain $DOMAIN_NAME points to this server's IP and port 80 is accessible."
    # Optionally stop services if Nginx isn't ready
    # docker-compose -f docker/docker-compose.temp.yml down
    exit 1
fi


# Step 9: Generate SSL certificates
print_status "Step 9: Generating SSL certificates for $DOMAIN_NAME..."
STAGING_SUCCESSFUL=false

# Try Let's Encrypt staging first
print_status "Attempting certificate generation with Let's Encrypt (Staging)..."
# Note: For subdomains, Certbot handles them like any other domain. No special flags needed unless it's a wildcard.
if docker run --rm \
    -v certbot_certs:/etc/letsencrypt \
    -v certbot_www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    --email "$EMAIL" --agree-tos --no-eff-email \
    --staging --force-renewal \
    -d "$DOMAIN_NAME"; then
    print_success "Staging certificate generation successful for $DOMAIN_NAME."
    STAGING_SUCCESSFUL=true
else
    print_error "Staging certificate generation failed for $DOMAIN_NAME. Check Certbot logs above."
    print_warning "Ensure your subdomain $DOMAIN_NAME correctly points to this server IP and port 80 is open."
fi

CERTIFICATE_GENERATED=false
if [ "$STAGING_SUCCESSFUL" = true ]; then
    print_status "Attempting certificate generation with Let's Encrypt (Production) for $DOMAIN_NAME..."
    if docker run --rm \
        -v certbot_certs:/etc/letsencrypt \
        -v certbot_www:/var/www/certbot \
        certbot/certbot certonly \
        --webroot --webroot-path=/var/www/certbot \
        --email "$EMAIL" --agree-tos --no-eff-email \
        --force-renewal \
        -d "$DOMAIN_NAME"; then
        print_success "Production certificate generation successful for $DOMAIN_NAME."
        CERTIFICATE_GENERATED=true
    else
        print_warning "Production certificate generation failed for $DOMAIN_NAME. Staging certificates might be used if available from the successful staging run. Check /etc/letsencrypt/live/$DOMAIN_NAME on the certbot_certs volume."
        # Check if staging certs exist as a fallback
        if docker run --rm -v certbot_certs:/etc/letsencrypt alpine ls "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" > /dev/null 2>&1; then
             print_warning "Using previously generated staging certificate for $DOMAIN_NAME for now."
             CERTIFICATE_GENERATED=true # Staging certs are there
        fi
    fi
fi

if [ "$CERTIFICATE_GENERATED" = false ]; then
    print_warning "Let's Encrypt certificate generation failed for $DOMAIN_NAME (either staging or production). Attempting to create self-signed certificates..."
    # Create self-signed certificate
    docker run --rm \
        -v certbot_certs:/etc/letsencrypt \
        alpine/openssl sh -c "\
            mkdir -p /etc/letsencrypt/live/$DOMAIN_NAME && \
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem \
                -out /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem \
                -subj '/C=US/ST=CA/L=SanFrancisco/O=MyOrg/CN=$DOMAIN_NAME' \
        "
    if [ $? -eq 0 ]; then
        print_success "Self-signed certificate created successfully for $DOMAIN_NAME."
        print_warning "Your site will use a self-signed certificate, which will cause browser warnings."
        CERTIFICATE_GENERATED=true # Self-signed is a form of generated cert
    else
        print_error "Failed to create self-signed certificate for $DOMAIN_NAME. SSL will likely not work."
        # No certs available, Nginx SSL config will fail.
    fi
fi

if [ "$CERTIFICATE_GENERATED" = false ]; then
    print_error "No SSL certificates (Let's Encrypt or self-signed) could be configured for $DOMAIN_NAME. Nginx SSL setup will fail."
    print_status "Stopping services that were started for HTTP challenge..."
    docker-compose -f docker/docker-compose.temp.yml down
    exit 1
fi
print_success "SSL certificate preparation step completed for $DOMAIN_NAME."


# Step 10: Create SSL DH parameters
print_status "Step 10: Creating SSL DH parameters (ssl-dhparams.pem)..."
# Generate DH parameters if they don't exist (can take a few minutes)
if ! docker run --rm -v certbot_certs:/etc/letsencrypt alpine test -f /etc/letsencrypt/ssl-dhparams.pem; then
    print_status "Generating new ssl-dhparams.pem (2048 bit). This may take a few minutes..."
    if docker run --rm -v certbot_certs:/etc/letsencrypt alpine/openssl sh -c "openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048"; then
        print_success "ssl-dhparams.pem generated successfully."
    else
        print_error "Failed to generate ssl-dhparams.pem. Nginx might have issues with some SSL ciphers."
    fi
else
    print_status "ssl-dhparams.pem already exists. Skipping generation."
fi
print_success "SSL DH parameters prepared."

# Step 11: Switch to SSL Nginx configuration
print_status "Step 11: Switching to SSL Nginx configuration for $DOMAIN_NAME..."

# Stop HTTP-only services first
print_status "Stopping HTTP-only services..."
docker-compose -f docker/docker-compose.temp.yml down
rm -f docker/docker-compose.temp.yml

print_status "Preparing SSL Nginx configuration (default.conf)..."
if [ ! -f "docker/nginx-prod/nginx.prod.conf" ]; then
    print_error "SSL Nginx template (docker/nginx-prod/nginx.prod.conf) not found!"
    exit 1
fi
# The template nginx.prod.conf uses ${NGINX_DOMAIN}
if docker run --rm \\
    -e NGINX_DOMAIN="$DOMAIN_NAME" \\
    -v "$(pwd)/docker/nginx-prod/nginx.prod.conf:/tmp/nginx.prod.template:ro" \\
    nginx:latest \\
    sh -c "envsubst '\\$NGINX_DOMAIN' < /tmp/nginx.prod.template" > "$(pwd)/docker/nginx-prod/default.conf"; then
    print_success "SSL Nginx configuration (default.conf) prepared."
else
    print_error "Failed to prepare SSL Nginx configuration."
    exit 1
fi

print_status "Starting all services with SSL configuration using docker-compose.prod.yml..."
# Ensure docker-compose.prod.yml now correctly points to the final default.conf for nginx
# The sed command in step 7 made docker-compose.temp.yml point to default.conf
# The main docker-compose.prod.yml should already be pointing to the correct final location
# if its original nginx config mount was to /etc/nginx/conf.d/default.conf and we are writing to docker/nginx-prod/default.conf
# Let's verify the volume mount in docker-compose.prod.yml for nginx-proxy service:
# It should be: - ./nginx-prod/default.conf:/etc/nginx/conf.d/default.conf
# OR the script needs to ensure the original docker-compose.prod.yml is used but with the correct file.
# The current script uses the original docker-compose.prod.yml.
# The `sed` command in step 7 creates `docker-compose.temp.yml`.
# The `docker-compose.prod.yml` itself is NOT modified by `sed`.
# So, if `docker-compose.prod.yml` originally has:
#  volumes:
#    - ./nginx-prod/nginx.prod.conf:/etc/nginx/conf.d/default.conf
# Then this will be used in the final `docker-compose up`.
# The script correctly writes the processed SSL config to `$(pwd)/docker/nginx-prod/default.conf`.
# So, the docker-compose.prod.yml *must* mount `docker/nginx-prod/default.conf` not `docker/nginx-prod/nginx.prod.conf`.

# Let's assume docker-compose.prod.yml is already set to mount default.conf, or we adjust it.
# The `sed` command in step 7 implies the original docker-compose.prod.yml mounts nginx.prod.conf.
# This means for the final step, we need to ensure the main docker-compose.prod.yml also uses the generated default.conf
# The script currently does:
# NGINX_DOMAIN_VALUE=$DOMAIN_NAME docker run ... > "$(pwd)/docker/nginx-prod/default.conf"
# docker-compose -f docker/docker-compose.prod.yml up -d
# This is correct IF docker-compose.prod.yml mounts default.conf.
# If it mounts nginx.prod.conf, then the output of envsubst should go to nginx.prod.conf,
# OR docker-compose.prod.yml should be modified.
# The current script writes to default.conf and the sed command was only for the .temp.yml.
# This means the main docker-compose.prod.yml must be changed to use the generated default.conf.
# I will add a step to ensure this.

# Create a final docker-compose.prod.ssl.yml that points to the generated default.conf
sed 's|./nginx-prod/nginx.prod.conf:/etc/nginx/conf.d/default.conf|./nginx-prod/default.conf:/etc/nginx/conf.d/default.conf|' docker/docker-compose.prod.yml > docker/docker-compose.prod.ssl.yml

docker-compose -f docker/docker-compose.prod.ssl.yml up -d
print_success "All services started with SSL configuration."

# Step 12: Wait for services and test
print_status "Step 12: Finalizing deployment and testing for $DOMAIN_NAME..."
print_status "Waiting for services to stabilize (45 seconds)..."
sleep 45

print_status "Testing service connectivity..."
# Test HTTP redirect (should redirect to HTTPS)
HTTP_STATUS_CODE=$(curl -o /dev/null -s -w "%{http_code}" "http://$DOMAIN_NAME")
if [[ "$HTTP_STATUS_CODE" == "301" || "$HTTP_STATUS_CODE" == "302" ]]; then
    print_success "HTTP to HTTPS redirect is working for $DOMAIN_NAME (Status: $HTTP_STATUS_CODE)."
else
    print_warning "HTTP to HTTPS redirect may not be working as expected for $DOMAIN_NAME (Status: $HTTP_STATUS_CODE). Expected 301 or 302."
    curl -Iks "http://$DOMAIN_NAME" # Show headers for debugging
fi

# Test HTTPS
if curl -kfsS "https://$DOMAIN_NAME" > /dev/null; then
    print_success "HTTPS is responding on https://$DOMAIN_NAME"
else
    print_warning "HTTPS may not be responding on https://$DOMAIN_NAME. Check Nginx logs: docker-compose -f docker/docker-compose.prod.ssl.yml logs nginx-proxy"
fi

# Test API
if curl -kfsS "https://$DOMAIN_NAME/api/health" > /dev/null; then
    print_success "API is responding at https://$DOMAIN_NAME/api/health"
else
    print_warning "API may not be responding at https://$DOMAIN_NAME/api/health. Check API logs: docker-compose -f docker/docker-compose.prod.ssl.yml logs api"
fi

# Step 13: Display final status
print_status "Step 13: Deployment Summary for $DOMAIN_NAME"
echo ""
echo "=== DEPLOYMENT SUMMARY ==="
echo "Domain: https://$DOMAIN_NAME (and http://$DOMAIN_NAME should redirect)"
echo "Email for SSL: $EMAIL"
echo ""
echo "Services Status:"
docker-compose -f docker/docker-compose.prod.ssl.yml ps
echo ""
echo "=== NEXT STEPS ==="
echo "1. VERIFY DNS: Ensure $DOMAIN_NAME correctly points to this server's public IP address."
    echo "   If you are using a www variant (e.g. www.$DOMAIN_NAME), ensure it also points to this server's IP."
    echo "   The current Nginx configuration is set up for $DOMAIN_NAME only (no www)."
echo "2. TEST THOROUGHLY: Open https://$DOMAIN_NAME in your browser and test all application functionalities."
echo "3. CHECK LOGS: If any issues, check logs: docker-compose -f docker/docker-compose.prod.ssl.yml logs <service_name>"
echo "4. SSL RENEWAL: The 'certbot' service in docker-compose.prod.yml is configured to attempt renewal automatically."
echo "   You can check its logs: docker-compose -f docker/docker-compose.prod.ssl.yml logs certbot"
echo "   To manually renew (if needed): docker-compose -f docker/docker-compose.prod.ssl.yml run --rm certbot renew"
echo ""

# Cleanup temporary files
rm -f docker/nginx-prod/default.conf.temp
# rm -f docker/docker-compose.prod.ssl.yml # Keep this file as it's now the primary one for running state

print_success "Deployment script completed! 🎉"
echo ""
print_status "Application should be accessible at: https://$DOMAIN_NAME"
print_status "View logs with: docker-compose -f docker/docker-compose.prod.ssl.yml logs -f [service_name]"
echo ""
print_status "To stop services: docker-compose -f docker/docker-compose.prod.ssl.yml down"
print_status "To restart services: docker-compose -f docker/docker-compose.prod.ssl.yml restart"

exit 0
