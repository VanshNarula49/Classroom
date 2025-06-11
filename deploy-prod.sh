#!/bin/bash

# Modular Production Deployment Script for Classroom App
# Exit immediately if a command exits with a non-zero status.
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables
PROJECT_DIR_ON_SERVER=$(pwd)
COMPOSE_FILE_PATH="$PROJECT_DIR_ON_SERVER/docker/docker-compose.prod.yml"
NGINX_CONFIG_DIR="$PROJECT_DIR_ON_SERVER/docker/nginx-prod"
FRONTEND_DIR="$PROJECT_DIR_ON_SERVER/Frontend"
ENV_FILE="$PROJECT_DIR_ON_SERVER/docker/.env.prod"

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
load_env_file() {
    if [ -f "$ENV_FILE" ]; then
        print_status "Loading existing environment configuration from $ENV_FILE"
        source "$ENV_FILE"
        return 0
    else
        print_warning "No existing .env.prod file found. You'll need to configure environment variables."
        return 1
    fi
}

# Step 1: Configure environment variables
configure_environment() {
    print_step "Step 1: Configuring Environment Variables"
    
    if load_env_file; then
        echo "Current configuration:"
        echo "  Domain: $DOMAIN_NAME"
        echo "  Email: $LETSENCRYPT_EMAIL"
        echo "  DB Name: $DB_NAME"
        echo "  DB User: $DB_USER"
        echo ""
        read -p "Do you want to reconfigure? (y/N): " reconfigure
        if [[ ! $reconfigure =~ ^[Yy]$ ]]; then
            print_status "Using existing configuration."
            return 0
        fi
    fi

    prompt_for_input "Enter your domain name (e.g., example.com)" DOMAIN_NAME
    prompt_for_input "Enter your email for Let's Encrypt SSL" LETSENCRYPT_EMAIL
    prompt_for_input "Enter Database Name" DB_NAME "myclassroomdb_prod"
    prompt_for_input "Enter Database User" DB_USER "classroom_user"
    prompt_for_input "Enter Database Password" DB_PASSWORD "$(openssl rand -hex 12)"
    prompt_for_input "Enter MinIO Root User" MINIO_ROOT_USER "minioadmin_prod"
    prompt_for_input "Enter MinIO Root Password" MINIO_ROOT_PASSWORD "$(openssl rand -hex 12)"
    prompt_for_input "Enter a strong JWT Secret for the API" JWT_SECRET "$(openssl rand -hex 32)"

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

    print_status ".env.prod file created successfully!"
}

# Step 2: Build frontend
build_frontend() {
    print_step "Step 2: Building Frontend Application"
    
    if [ -d "$FRONTEND_DIR/dist" ] && [ "$(ls -A $FRONTEND_DIR/dist)" ]; then
        print_status "Frontend dist directory exists and is not empty."
        read -p "Do you want to rebuild the frontend? (y/N): " rebuild
        if [[ ! $rebuild =~ ^[Yy]$ ]]; then
            print_status "Skipping frontend build."
            return 0
        fi
    fi

    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Frontend directory $FRONTEND_DIR not found."
        exit 1
    fi

    print_status "Building frontend using Docker..."
    docker run --rm \
        -v "$FRONTEND_DIR":/usr/src/app \
        -w /usr/src/app \
        --user $(id -u):$(id -g) \
        node:18-alpine sh -c "npm install && npm run build"
    
    if [ ! -d "$FRONTEND_DIR/dist" ] || [ -z "$(ls -A $FRONTEND_DIR/dist)" ]; then
        print_error "Frontend build failed - no dist directory or empty dist directory."
        exit 1
    fi
    
    print_status "Frontend build completed successfully!"
}

# Step 3: Setup basic nginx for certbot
setup_nginx_for_certbot() {
    print_step "Step 3: Setting up Nginx for Certbot Challenge"
    
    if ! load_env_file; then
        print_error "Environment file not found. Please run step 1 first."
        exit 1
    fi

    # Create directories
    sudo mkdir -p "$NGINX_CONFIG_DIR"
    sudo mkdir -p /var/www/certbot

    # Create a simple nginx config for HTTP challenge
    cat <<EOL > "$NGINX_CONFIG_DIR/certbot-challenge.conf"
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files \$uri =404;
    }

    location / {
        return 200 'Nginx is ready for Certbot challenge';
        add_header Content-Type text/plain;
    }
}
EOL

    # Update docker-compose to use the challenge config temporarily
    print_status "Starting Nginx with challenge configuration..."
    
    # Stop any existing nginx
    docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" stop nginx-proxy 2>/dev/null || true
    
    # Start nginx with challenge config
    docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" run -d \
        --name nginx-challenge \
        -p 80:80 \
        -v "$NGINX_CONFIG_DIR/certbot-challenge.conf:/etc/nginx/conf.d/default.conf" \
        -v /var/www/certbot:/var/www/certbot \
        nginx:latest

    sleep 5
    print_status "Nginx ready for Certbot challenge!"
}

# Step 4: Get SSL certificate
get_ssl_certificate() {
    print_step "Step 4: Obtaining SSL Certificate"
    
    if ! load_env_file; then
        print_error "Environment file not found. Please run step 1 first."
        exit 1
    fi

    # Check if certificate already exists
    if docker run --rm -v certbot_certs:/etc/letsencrypt certbot/certbot:latest \
        sh -c "[ -d /etc/letsencrypt/live/$DOMAIN_NAME ]"; then
        print_status "Certificate for $DOMAIN_NAME already exists."
        read -p "Do you want to renew it? (y/N): " renew
        if [[ $renew =~ ^[Yy]$ ]]; then
            docker run --rm \
                -v certbot_certs:/etc/letsencrypt \
                -v /var/www/certbot:/var/www/certbot \
                certbot/certbot:latest renew --webroot --webroot-path=/var/www/certbot
        fi
        return 0
    fi

    print_status "Requesting new SSL certificate..."
    
    # First try with staging server (dry run)
    print_status "Testing with Let's Encrypt staging server..."
    if docker run --rm \
        -v certbot_certs:/etc/letsencrypt \
        -v /var/www/certbot:/var/www/certbot \
        certbot/certbot:latest certonly \
        --webroot --webroot-path=/var/www/certbot \
        -d $DOMAIN_NAME -d www.$DOMAIN_NAME \
        --email $LETSENCRYPT_EMAIL \
        --agree-tos \
        --staging \
        --non-interactive; then
        
        print_status "Staging test successful! Now getting real certificate..."
        
        # Get real certificate
        docker run --rm \
            -v certbot_certs:/etc/letsencrypt \
            -v /var/www/certbot:/var/www/certbot \
            certbot/certbot:latest certonly \
            --webroot --webroot-path=/var/www/certbot \
            -d $DOMAIN_NAME -d www.$DOMAIN_NAME \
            --email $LETSENCRYPT_EMAIL \
            --agree-tos \
            --force-renewal \
            --non-interactive
        
        print_status "SSL certificate obtained successfully!"
    else
        print_error "Certbot staging test failed. Check your DNS settings and firewall."
        print_error "Make sure $DOMAIN_NAME and www.$DOMAIN_NAME point to this server."
        exit 1
    fi

    # Stop challenge nginx
    docker stop nginx-challenge 2>/dev/null || true
    docker rm nginx-challenge 2>/dev/null || true
}

# Step 5: Deploy application
deploy_application() {
    print_step "Step 5: Deploying Application with SSL"
    
    if ! load_env_file; then
        print_error "Environment file not found. Please run step 1 first."
        exit 1
    fi

    # Check if frontend is built
    if [ ! -d "$FRONTEND_DIR/dist" ] || [ -z "$(ls -A $FRONTEND_DIR/dist)" ]; then
        print_error "Frontend not built. Please run step 2 first."
        exit 1
    fi

    # Check if certificate exists
    if ! docker run --rm -v certbot_certs:/etc/letsencrypt certbot/certbot:latest \
        sh -c "[ -f /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem ]"; then
        print_error "SSL certificate not found. Please run step 4 first."
        exit 1
    fi

    print_status "Starting all services..."
    docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" down 2>/dev/null || true
    docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" up -d --build

    print_status "Waiting for services to start..."
    sleep 10

    # Check service health
    if docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" ps | grep -q "Up"; then
        print_status "Services started successfully!"
        echo ""
        echo "🎉 Deployment completed!"
        echo "📱 Your application should be accessible at: https://$DOMAIN_NAME"
        echo "🔒 SSL certificate is configured and active"
        echo ""
        print_status "Useful commands:"
        echo "  View logs: docker-compose -f docker/docker-compose.prod.yml --env-file docker/.env.prod logs [service]"
        echo "  Check status: docker-compose -f docker/docker-compose.prod.yml --env-file docker/.env.prod ps"
        echo "  Stop services: docker-compose -f docker/docker-compose.prod.yml --env-file docker/.env.prod down"
    else
        print_error "Some services failed to start. Check logs with:"
        echo "docker-compose -f docker/docker-compose.prod.yml --env-file docker/.env.prod logs"
    fi
}

# Step 6: View logs
view_logs() {
    print_step "Step 6: Viewing Service Logs"
    
    if ! load_env_file; then
        print_error "Environment file not found."
        exit 1
    fi

    echo "Available services:"
    echo "  1. nginx-proxy"
    echo "  2. api (classroom-api-prod)"
    echo "  3. db (postgres-db-prod)"
    echo "  4. minio (minio-prod)"
    echo "  5. certbot (classroom-certbot)"
    echo "  6. all"
    echo ""
    read -p "Which service logs do you want to view? (1-6): " choice

    case $choice in
        1) docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" logs -f nginx-proxy ;;
        2) docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" logs -f api ;;
        3) docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" logs -f db ;;
        4) docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" logs -f minio ;;
        5) docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" logs -f certbot ;;
        6) docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" logs -f ;;
        *) print_error "Invalid choice" ;;
    esac
}

# Step 7: Check status
check_status() {
    print_step "Step 7: Checking Service Status"
    
    if ! load_env_file; then
        print_error "Environment file not found."
        exit 1
    fi

    echo "=== Docker Compose Services ==="
    docker-compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" ps
    
    echo ""
    echo "=== SSL Certificate Status ==="
    if docker run --rm -v certbot_certs:/etc/letsencrypt certbot/certbot:latest \
        sh -c "[ -f /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem ]"; then
        print_status "SSL certificate exists for $DOMAIN_NAME"
        docker run --rm -v certbot_certs:/etc/letsencrypt certbot/certbot:latest \
            certbot certificates
    else
        print_warning "No SSL certificate found for $DOMAIN_NAME"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "🚀 Classroom App Production Deployment"
    echo "======================================="
    echo "1. Configure Environment Variables"
    echo "2. Build Frontend"
    echo "3. Setup Nginx for Certbot"
    echo "4. Get SSL Certificate"
    echo "5. Deploy Application"
    echo "6. View Logs"
    echo "7. Check Status"
    echo "8. Full Deployment (Steps 1-5)"
    echo "9. Exit"
    echo ""
}

# Full deployment
full_deployment() {
    print_step "Full Deployment Starting..."
    configure_environment
    build_frontend
    setup_nginx_for_certbot
    get_ssl_certificate
    deploy_application
    print_status "Full deployment completed!"
}

# Main script
main() {
    # Check if Docker and Docker Compose are available
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi

    # Check if required files exist
    if [ ! -f "$COMPOSE_FILE_PATH" ]; then
        print_error "Docker Compose file not found: $COMPOSE_FILE_PATH"
        exit 1
    fi

    if [ ! -f "$NGINX_CONFIG_DIR/nginx.prod.conf" ]; then
        print_error "Nginx config not found: $NGINX_CONFIG_DIR/nginx.prod.conf"
        exit 1
    fi

    while true; do
        show_menu
        read -p "Please select an option (1-9): " choice
        
        case $choice in
            1) configure_environment ;;
            2) build_frontend ;;
            3) setup_nginx_for_certbot ;;
            4) get_ssl_certificate ;;
            5) deploy_application ;;
            6) view_logs ;;
            7) check_status ;;
            8) full_deployment ;;
            9) 
                print_status "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option. Please select 1-9."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main "$@"
