#!/bin/bash
# Generate a self-signed SSL certificate for development

set -e

# Change to the root project directory assuming the script is run from project root
# or change this script to use absolute paths based on script location.
# Let's ensure we put them in the correct spot relative to project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "$PROJECT_ROOT/nginx/ssl"

echo "Generating self-signed SSL certificate for 365 days..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$PROJECT_ROOT/nginx/ssl/privkey.pem" \
    -out "$PROJECT_ROOT/nginx/ssl/fullchain.pem" \
    -subj "/C=AE/ST=Dubai/L=Dubai/O=Luxery/CN=showroom.ae" \
    -addext "subjectAltName=DNS:localhost,DNS:showroom.ae,DNS:www.showroom.ae"

echo "Success! Self-signed certificate and key generated in nginx/ssl:"
echo " - nginx/ssl/fullchain.pem"
echo " - nginx/ssl/privkey.pem"
