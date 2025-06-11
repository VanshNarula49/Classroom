#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

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

# --- Configuration --- 
prompt_for_input "Enter your domain name (e.g., example.com)" DOMAIN_NAME
prompt_for_input "Enter your email for Let's Encrypt SSL" LETSENCRYPT_EMAIL

prompt_for_input "Enter Database Name" DB_NAME "myclassroomdb_prod"
prompt_for_input "Enter Database User" DB_USER "classroom_user"
prompt_for_input "Enter Database Password" DB_PASSWORD "$(openssl rand -hex 12)"

prompt_for_input "Enter MinIO Root User" MINIO_ROOT_USER "minioadmin_prod"
prompt_for_input "Enter MinIO Root Password" MINIO_ROOT_PASSWORD "$(openssl rand -hex 12)"

prompt_for_input "Enter a strong JWT Secret for the API" JWT_SECRET "$(openssl rand -hex 32)"

# Project directory on the server (assuming script is run from project root's parent)
# Or adjust this to be the absolute path to your project on the server
PROJECT_DIR_ON_SERVER=$(pwd)/Classroom # Assuming script is in 'Backend' and you cd into it
COMPOSE_FILE_PATH="$PROJECT_DIR_ON_SERVER/docker/docker-compose.prod.yml"
NGINX_CONFIG_DIR="$PROJECT_DIR_ON_SERVER/docker/nginx-prod"
FRONTEND_DIR="$PROJECT_DIR_ON_SERVER/Frontend"

# --- Output .env file for Docker Compose --- 
ENV_FILE="$PROJECT_DIR_ON_SERVER/docker/.env.prod"
echo "Writing production environment variables to $ENV_FILE..."
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

echo ".env.prod file created."

# --- Build Frontend --- 
echo "Building frontend application..."
if [ -d "$FRONTEND_DIR" ]; then
    (cd "$FRONTEND_DIR" && npm install && npm run build) # Assuming standard npm build
    echo "Frontend build complete."
else
    echo "Error: Frontend directory $FRONTEND_DIR not found." >&2
    exit 1
fi

# --- Initial Certbot Setup (Dummy Certificate for Nginx to start) ---
echo "Starting Nginx with a dummy certificate for initial Certbot challenge..."

# Create dummy cert directories if they don't exist
sudo mkdir -p "$NGINX_CONFIG_DIR/dummy_certs"
sudo mkdir -p /var/www/certbot # Certbot webroot

# Path for dummy certs (used by a temporary Nginx config for first run)
PATH_CERT="$NGINX_CONFIG_DIR/dummy_certs/live/${DOMAIN_NAME}/fullchain.pem"
PATH_KEY="$NGINX_CONFIG_DIR/dummy_certs/live/${DOMAIN_NAME}/privkey.pem"

if [ ! -f "$PATH_CERT" ] || [ ! -f "$PATH_KEY" ]; then 
    echo "Generating dummy certificate for $DOMAIN_NAME..."
    sudo mkdir -p "$(dirname "$PATH_CERT")"
    sudo openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout "$PATH_KEY" \
        -out "$PATH_CERT" \
        -subj "/CN=localhost"
else
    echo "Dummy certificate already exists."
fi

# Temporarily modify Nginx config to use dummy certs for the first run
TEMP_NGINX_CONF="$NGINX_CONFIG_DIR/temp_nginx.conf"
# Create a version of nginx.prod.conf that points to dummy certs and listens on 80 for challenge
# This is a simplified version for the initial challenge
cat <<EOL > "$TEMP_NGINX_CONF"
server {
    listen 80;
    server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOL

# Start Nginx with the temporary config to allow Certbot to run
echo "Starting Nginx temporarily for Certbot..."
docker compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" up -d nginx-proxy

# Wait for Nginx to be up
sleep 10

# --- Obtain Let's Encrypt SSL Certificate ---
echo "Requesting Let's Encrypt certificate for $DOMAIN_NAME..."

# Check if a real certificate already exists
if [ -d "/etc/letsencrypt/live/$DOMAIN_NAME" ]; then
    echo "Certificate for $DOMAIN_NAME already exists. Attempting renewal."
    docker compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" run --rm certbot renew
else 
    echo "No existing certificate found. Requesting a new one."
    docker compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" run --rm certbot certonly \
        --webroot --webroot-path=/var/www/certbot \
        -d $DOMAIN_NAME -d www.$DOMAIN_NAME \
        --email $LETSENCRYPT_EMAIL \
        --rsa-key-size 4096 \
        --agree-tos \
        --force-renewal \
        --non-interactive || echo "Certbot failed. Check logs. Manual intervention might be needed."
fi

# Stop the temporary Nginx
echo "Stopping temporary Nginx..."
docker compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" stop nginx-proxy

# --- Deploy Application with SSL --- 
echo "Deploying application with SSL..."

# Ensure Nginx config directory exists for the main config
sudo mkdir -p "$(dirname "$NGINX_CONFIG_DIR/nginx.prod.conf")"

# The nginx.prod.conf should already be in $NGINX_CONFIG_DIR/nginx.prod.conf
# It will use the real certs now mounted by the certbot service volume

# Start all services
docker compose -f "$COMPOSE_FILE_PATH" --env-file "$ENV_FILE" up -d --build

echo ""
echo "-----------------------------------------------------"
echo "Deployment script finished!"
echo "Your application should be accessible at: https://$DOMAIN_NAME"
echo "And MinIO console (if proxied) might be at https://$DOMAIN_NAME/minio-console/ (check Nginx config)"
echo "Make sure your DNS records for $DOMAIN_NAME and www.$DOMAIN_NAME point to this server's IP address."
echo ""
echo "Important: If Certbot failed, Nginx might not start correctly with the SSL configuration."
echo "Check 'docker compose logs certbot' and 'docker compose logs nginx-proxy' for errors."
echo "You might need to run the certbot command manually or adjust DNS settings."
echo "-----------------------------------------------------"

# Clean up temporary Nginx config
rm -f "$TEMP_NGINX_CONF"

exit 0
