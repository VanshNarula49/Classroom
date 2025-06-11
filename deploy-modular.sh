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

# Function to prompt for input
prompt_for_input() {
    local prompt_message="$1"
    local variable_name="$2"
    local default_value="$3"
    local input_value

    if [ -n "$default_value" ]; then
        read -p "$prompt_message [$default_value]: " input_value
        eval $variable_name=\'${input_value:-$default_value}\'
    else
        read -p "$prompt_message: " input_value
        while [ -z "$input_value" ]; do
            echo "This field cannot be empty."
            read -p "$prompt_message: " input_value
        done
        eval $variable_name=\'${input_value}\'
    fi
}

# Function to check if .env.prod exists and load it
load_env_if_exists() {
    local env_file="$1"
    if [ -f "$env_file" ]; then
        print_status "Loading existing environment from $env_file"
        source "$env_file"
        return 0
    else
        return 1
    fi
}

# Project directory setup
PROJECT_DIR_ON_SERVER=$(pwd)
COMPOSE_FILE_PATH="$PROJECT_DIR_ON_SERVER/docker/docker-compose.prod.yml"
NGINX_CONFIG_DIR="$PROJECT_DIR_ON_SERVER/docker/nginx-prod"
FRONTEND_DIR="$PROJECT_DIR_ON_SERVER/Frontend"
ENV_FILE="$PROJECT_DIR_ON_SERVER/docker/.env.prod"

# Function to configure environment
configure_environment() {
    print_step "Configuring environment variables..."
    
    # Try to load existing env file
    if load_env_if_exists "$ENV_FILE"; then
        echo "Current configuration loaded. Press Enter to keep existing values or type new ones:"
        echo "Domain: $DOMAIN_NAME"
        echo "Email: $LETSENCRYPT_EMAIL"
        echo ""
    fi

    prompt_for_input "Enter your domain name (e.g., example.com)" DOMAIN_NAME "${DOMAIN_NAME:-}"
    prompt_for_input "Enter your email for Let's Encrypt SSL" LETSENCRYPT_EMAIL "${LETSENCRYPT_EMAIL:-}"

    prompt_for_input "Enter Database Name" DB_NAME "${DB_NAME:-myclassroomdb}"
    prompt_for_input "Enter Database User" DB_USER "${DB_USER:-avnadmin}"
    prompt_for_input "Enter Database Password" DB_PASSWORD "${DB_PASSWORD:-yourpassword}"

    prompt_for_input "Enter MinIO Root User" MINIO_ROOT_USER "${MINIO_ROOT_USER:-minioadmin}"
    prompt_for_input "Enter MinIO Root Password" MINIO_ROOT_PASSWORD "${MINIO_ROOT_PASSWORD:-minioadminpassword}"

    prompt_for_input "Enter a strong JWT Secret for the API" JWT_SECRET "${JWT_SECRET:-$(openssl rand -hex 32)}"

    # Write environment file
    print_status "Writing production environment variables to $ENV_FILE..."
    cat <<EOL > "$ENV_FILE"
DOMAIN_NAME=$DOMAIN_NAME
LETSENCRYPT_EMAIL=$LETSENCRYPT_EMAIL

DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

MINIO_ROOT_USER=$MINIO_ROOT_USER
MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD

JWT_SECRET=$JWT_SECRET

# Nginx will use this from the compose file directly
NGINX_DOMAIN=$DOMAIN_NAME
EOL

    print_status ".env.prod file created/updated."
}

# Function to build frontend
build_frontend() {
    print_step "Building frontend application using Docker..."
    
    if [ -d "$FRONTEND_DIR" ]; then
        print_status "Found frontend directory: $FRONTEND_DIR"
        
        # Check if dist already exists and ask user
        if [ -d "$FRONTEND_DIR/dist" ] && [ "$(ls -A $FRONTEND_DIR/dist 2>/dev/null)" ]; then
            echo "Frontend dist directory already exists with content."
            read -p "Do you want to rebuild the frontend? (y/N): " rebuild_frontend
            if [[ ! "$rebuild_frontend" =~ ^[Yy]$ ]]; then
                print_status "Skipping frontend build."
                return 0
            fi
        fi
        
        print_status "Building frontend with Docker..."
        docker run --rm \
            -v "$FRONTEND_DIR":/usr/src/app \
            -w /usr/src/app \
            --user $(id -u):$(id -g) \
            node:18-alpine sh -c "npm install && npm run build"
        
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
}

# Function to setup dummy certificates
setup_dummy_certs() {
    print_step "Setting up dummy certificates for initial Nginx startup..."
    
    # Load environment
    source "$ENV_FILE"
    
    sudo mkdir -p "$NGINX_CONFIG_DIR/dummy_certs"
    sudo mkdir -p /var/www/certbot
    
    PATH_CERT="$NGINX_CONFIG_DIR/dummy_certs/live/${DOMAIN_NAME}/fullchain.pem"
    PATH_KEY="$NGINX_CONFIG_DIR/dummy_certs/live/${DOMAIN_NAME}/privkey.pem"
    
    if [ ! -f "$PATH_CERT" ] || [ ! -f "$PATH_KEY" ]; then 
        print_status "Generating dummy certificate for $DOMAIN_NAME..."
        sudo mkdir -p "$(dirname "$PATH_CERT")"
        sudo openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
            -keyout "$PATH_KEY" \
            -out "$PATH_CERT" \
            -subj "/CN=localhost"
    else
        print_status "Dummy certificate already exists."
    fi
}

# Function to start basic nginx for challenge
start_challenge_nginx() {
    print_step "Starting HTTP-only Nginx for Let's Encrypt challenge..."
    
    # Load environment
    source "$ENV_FILE"
    
    # Use the HTTP-only config if it exists, otherwise create it
    HTTP_NGINX_CONF="$NGINX_CONFIG_DIR/nginx.http-only.conf"
    if [ ! -f "$HTTP_NGINX_CONF" ]; then
        print_warning "HTTP-only config not found. Creating it now..."
        create_http_only_nginx_config
    fi

    # Stop any existing nginx containers
    docker stop temp-nginx-challenge 2>/dev/null || true
    docker rm temp-nginx-challenge 2>/dev/null || true
    
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
        return 1
    }
    
    sleep 5
    print_status "Challenge Nginx started. Testing accessibility..."
    
    # Test if nginx is responding
    if curl -f "http://localhost/" >/dev/null 2>&1; then
        print_status "Nginx is responding correctly."
    else
        print_warning "Nginx might not be responding. Check the logs if SSL challenge fails."
    fi
}

# Function to obtain SSL certificate
obtain_ssl_certificate() {
    print_step "Obtaining Let's Encrypt SSL certificate..."
    
    # Load environment
    source "$ENV_FILE"
    
    # Check DNS first
    print_status "Checking DNS resolution for $DOMAIN_NAME..."
    if nslookup "$DOMAIN_NAME" >/dev/null 2>&1; then
        print_status "DNS resolution successful for $DOMAIN_NAME"
    else
        print_warning "DNS resolution failed for $DOMAIN_NAME. This might cause certificate issuance to fail."
        read -p "Do you want to continue anyway? (y/N): " continue_anyway
        if [[ ! "$continue_anyway" =~ ^[Yy]$ ]]; then
            print_error "Aborting. Please ensure your DNS is properly configured."
            return 1
        fi
    fi
    
    # Check if certificate already exists
    if docker volume ls | grep -q certbot_certs; then
        print_status "Checking for existing certificates..."
        # Create a temporary container to check certificates
        existing_cert=$(docker run --rm \
            -v certbot_certs:/etc/letsencrypt \
            alpine:latest \
            sh -c "ls -la /etc/letsencrypt/live/ 2>/dev/null || echo 'no certs'" | grep "$DOMAIN_NAME" || echo "")
        
        if [ -n "$existing_cert" ]; then
            print_status "Certificate for $DOMAIN_NAME already exists."
            read -p "Do you want to renew it? (y/N): " renew_cert
            if [[ "$renew_cert" =~ ^[Yy]$ ]]; then
                print_status "Attempting certificate renewal..."
                docker run --rm \
                    -v certbot_certs:/etc/letsencrypt \
                    -v /var/www/certbot:/var/www/certbot \
                    certbot/certbot renew
            else
                print_status "Skipping certificate renewal."
                return 0
            fi
        fi
    fi
    
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
        
        print_error "Certificate issuance failed or timed out."
        print_status "Let's try a dry run to diagnose the issue..."
        
        # Try dry run for diagnosis
        docker run --rm \
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
            --dry-run \
            --verbose || print_error "Dry run also failed. Check DNS and firewall settings."
        
        read -p "Do you want to continue deployment without SSL? (y/N): " continue_no_ssl
        if [[ ! "$continue_no_ssl" =~ ^[Yy]$ ]]; then
            exit 1
        fi
        
        return 1
    }
    
    print_status "SSL certificate obtained successfully!"
}

# Function to stop challenge nginx
stop_challenge_nginx() {
    print_step "Stopping challenge Nginx..."
    docker stop temp-nginx-challenge 2>/dev/null || true
    docker rm temp-nginx-challenge 2>/dev/null || true
    rm -f "$NGINX_CONFIG_DIR/challenge_nginx.conf"
}

# Function to create SSL configuration files
create_ssl_config_files() {
    print_step "Creating SSL configuration files..."
    
    # Create SSL DH parameters if they don't exist
    if ! docker run --rm -v certbot_certs:/etc/letsencrypt alpine:latest \
        sh -c "[ -f /etc/letsencrypt/ssl-dhparams.pem ]"; then
        print_status "Generating DH parameters (this may take a few minutes)..."
        docker run --rm -v certbot_certs:/etc/letsencrypt alpine:latest \
            sh -c "apk add --no-cache openssl && openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048"
    else
        print_status "DH parameters already exist."
    fi
    
    # Create basic SSL options file if it doesn't exist
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
    
    print_status "SSL configuration files ready."
}

# Function to create HTTP-only nginx config for initial challenge
create_http_only_nginx_config() {
    print_step "Creating HTTP-only Nginx config for SSL challenge..."
    
    # Load environment
    source "$ENV_FILE"
    
    # Create a simplified nginx config for initial challenge
    HTTP_NGINX_CONF="$NGINX_CONFIG_DIR/nginx.http-only.conf"
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

    print_status "HTTP-only config created at $HTTP_NGINX_CONF"
}

# Function to deploy application
deploy_application() {
    print_step "Deploying application with all services..."
    
    # Load environment
    source "$ENV_FILE"
    
    # Ensure nginx config directory exists
    sudo mkdir -p "$(dirname "$NGINX_CONFIG_DIR/nginx.prod.conf")"
    
    # Stop any existing services
    print_status "Stopping any existing services..."
    docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" down 2>/dev/null || true
    
    # Start all services
    print_status "Starting all production services..."
    docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" up -d --build
    
    print_status "Waiting for services to start..."
    sleep 10
    
    # Check service health
    print_status "Checking service status..."
    docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" ps
}

# Function to show logs
show_logs() {
    source "$ENV_FILE"
    echo "Which service logs would you like to see?"
    echo "1) nginx-proxy"
    echo "2) api"
    echo "3) certbot"
    echo "4) minio"
    echo "5) database"
    echo "6) all"
    read -p "Choose (1-6): " log_choice
    
    case $log_choice in
        1) docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" logs nginx-proxy ;;
        2) docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" logs classroom-api-prod ;;
        3) docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" logs classroom-certbot ;;
        4) docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" logs minio-prod ;;
        5) docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" logs postgres-db-prod ;;
        6) docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" logs ;;
        *) print_error "Invalid choice" ;;
    esac
}

# Function to check service status
check_service_status() {
    print_step "Checking service status..."
    
    if ! load_env_if_exists "$ENV_FILE"; then
        print_error "Environment file not found. Please run step 1 first."
        return 1
    fi
    
    echo "=== Docker Compose Services ==="
    docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" ps 2>/dev/null || {
        print_warning "No services running or docker-compose file not found."
    }
    
    echo ""
    echo "=== SSL Certificate Status ==="
    if docker run --rm -v certbot_certs:/etc/letsencrypt alpine:latest \
        sh -c "[ -f /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem ]" 2>/dev/null; then
        print_status "SSL certificate exists for $DOMAIN_NAME"
        docker run --rm -v certbot_certs:/etc/letsencrypt certbot/certbot:latest \
            certbot certificates 2>/dev/null || print_warning "Could not display certificate details"
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
        
        if [ -f /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem ]; then
            print_status "Testing HTTPS connectivity..."
            if curl -s -o /dev/null -w "%{http_code}" "https://localhost/" | grep -q "200"; then
                print_status "HTTPS (port 443) is responding"
            else
                print_warning "HTTPS (port 443) is not responding"
            fi
        fi
    else
        print_warning "curl not available, skipping connectivity tests"
    fi
}

# Main menu function
show_menu() {
    echo ""
    echo "=== Production Deployment Script ==="
    echo "1) Configure Environment (.env.prod)"
    echo "2) Build Frontend"
    echo "3) Create SSL Configuration Files"
    echo "4) Setup HTTP-only Nginx for Challenge"
    echo "5) Obtain SSL Certificate"
    echo "6) Deploy Application with SSL"
    echo "7) Show Service Logs"
    echo "8) Check Service Status"
    echo "9) Complete Deployment (All Steps)"
    echo "0) Exit"
    echo ""
    read -p "Choose an option (0-9): " choice
}

# Main execution
main() {
    while true; do
        show_menu
        case $choice in
            1)
                configure_environment
                ;;
            2)
                build_frontend
                ;;
            3)
                create_ssl_config_files
                ;;
            4)
                create_http_only_nginx_config
                start_challenge_nginx
                ;;
            5)
                obtain_ssl_certificate
                ;;
            6)
                stop_challenge_nginx
                deploy_application
                ;;
            7)
                show_logs
                ;;
            8)
                check_service_status
                ;;
            9)
                print_step "Starting complete deployment process..."
                configure_environment
                build_frontend
                create_ssl_config_files
                create_http_only_nginx_config
                start_challenge_nginx
                obtain_ssl_certificate
                stop_challenge_nginx
                deploy_application
                
                source "$ENV_FILE"
                echo ""
                print_status "=================================================="
                print_status "Deployment completed!"
                print_status "Your application should be accessible at: https://$DOMAIN_NAME"
                print_status "Make sure your DNS records point to this server's IP address."
                print_status "=================================================="
                ;;
            0)
                print_status "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option. Please choose 0-9."
                ;;
        esac
        
        if [ "$choice" != "7" ]; then
            echo ""
            read -p "Press Enter to continue..."
        fi
    done
}

# Check if running as root (for some sudo operations)
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. This script will work but it's recommended to run as a regular user with sudo access."
fi

# Start main function
main
