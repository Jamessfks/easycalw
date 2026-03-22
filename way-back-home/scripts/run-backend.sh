#!/bin/bash
# Way Back Home - Local Development Server
# Runs the backend API locally for development

set -e

# Colors
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}🚀 Way Back Home - Local Development Server${NC}"
echo ""

# Change to backend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "${PROJECT_ROOT}/dashboard/backend"

# Check for virtual environment
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pip install -r requirements.txt -q

# Load environment from .env file if it exists
if [ -f ".env" ]; then
    echo -e "${GREEN}Loading configuration from .env${NC}"
    set -a  # Export all variables
    source .env
    set +a
else
    echo -e "${YELLOW}No .env file found, using defaults${NC}"
    echo -e "Create one with: ${CYAN}cp .env.template .env${NC}"
fi

# Set defaults for any unset variables
export GOOGLE_CLOUD_PROJECT="${GOOGLE_CLOUD_PROJECT:-way-back-home-dev}"
export FIREBASE_STORAGE_BUCKET="${FIREBASE_STORAGE_BUCKET:-${GOOGLE_CLOUD_PROJECT}.firebasestorage.app}"
export API_BASE_URL="${API_BASE_URL:-http://localhost:8080}"
export MAP_BASE_URL="${MAP_BASE_URL:-http://localhost:3000}"

echo ""
echo -e "${GREEN}Environment:${NC}"
echo -e "  GOOGLE_CLOUD_PROJECT:    ${CYAN}${GOOGLE_CLOUD_PROJECT}${NC}"
echo -e "  FIREBASE_STORAGE_BUCKET: ${CYAN}${FIREBASE_STORAGE_BUCKET}${NC}"
echo -e "  API_BASE_URL:            ${CYAN}${API_BASE_URL}${NC}"
echo -e "  MAP_BASE_URL:            ${CYAN}${MAP_BASE_URL}${NC}"
echo ""

# Check for Google Cloud credentials
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo -e "${YELLOW}Note: Using default Google Cloud credentials${NC}"
    echo -e "Make sure you're authenticated: ${CYAN}gcloud auth application-default login${NC}"
    echo ""
fi

echo -e "${GREEN}Starting server at http://localhost:8080${NC}"
echo -e "API docs available at ${CYAN}http://localhost:8080/docs${NC}"
echo ""

# Run the server with hot reload
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
