#!/bin/bash

# --- Function for error handling ---
handle_error() {
  echo -e "\n\n*******************************************************"
  echo "Error: $1"
  echo "*******************************************************"
  exit 1
}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# =============================================================================
# Step 0: Check Google Cloud Authentication
# =============================================================================
echo "Checking Google Cloud authentication..."

if ! gcloud auth print-access-token > /dev/null 2>&1; then
    echo -e "${RED}Error: Not authenticated with Google Cloud.${NC}"
    echo "Please run: gcloud auth login"
    exit 1
fi

echo -e "${GREEN}✓ Authenticated${NC}"

# =============================================================================
# Step 1: Create a New Google Cloud Project
# =============================================================================
PROJECT_FILE="$HOME/project_id.txt"
CODELAB_PROJECT_PREFIX="waybackhome"
PREFIX_LEN=${#CODELAB_PROJECT_PREFIX}
MAX_SUFFIX_LEN=$(( 30 - PREFIX_LEN - 1 ))

echo ""
echo -e "${YELLOW}Creating a new Google Cloud project...${NC}"

# Generate a random project ID
RANDOM_SUFFIX=$(LC_ALL=C tr -dc 'a-z0-9' < /dev/urandom | head -c "$MAX_SUFFIX_LEN")
RANDOM_PROJECT_ID="${CODELAB_PROJECT_PREFIX}-${RANDOM_SUFFIX}"

echo -e "Attempting to create project: ${CYAN}${RANDOM_PROJECT_ID}${NC}"

if gcloud projects create "$RANDOM_PROJECT_ID" --labels=environment=development --quiet; then
    echo -e "${GREEN}✓ Successfully created project '${RANDOM_PROJECT_ID}'.${NC}"
    FINAL_PROJECT_ID="$RANDOM_PROJECT_ID"
else
    echo -e "${RED}Auto-creation failed. Falling back to manual selection.${NC}"

    # Fallback: let user pick or retry with a new random ID
    while true; do
        RANDOM_SUFFIX=$(LC_ALL=C tr -dc 'a-z0-9' < /dev/urandom | head -c "$MAX_SUFFIX_LEN")
        SUGGESTED_ID="${CODELAB_PROJECT_PREFIX}-${RANDOM_SUFFIX}"

        echo ""
        echo "Select a Project ID:"
        echo "  1. Press Enter to CREATE a new project: $SUGGESTED_ID"
        echo "  2. Or type a custom Project ID to create."
        read -p "Project ID: " USER_INPUT

        TARGET_ID="${USER_INPUT:-$SUGGESTED_ID}"

        if [ -z "$TARGET_ID" ]; then
            echo -e "${RED}Project ID cannot be empty.${NC}"
            continue
        fi

        echo "Attempting to create '$TARGET_ID'..."
        if gcloud projects create "$TARGET_ID" --labels=environment=development --quiet; then
            echo -e "${GREEN}✓ Successfully created project '$TARGET_ID'.${NC}"
            FINAL_PROJECT_ID="$TARGET_ID"
            break
        else
            echo -e "${RED}Failed to create '$TARGET_ID'. Please try a different ID.${NC}"
        fi
    done
fi

# =============================================================================
# Step 2: Set Active Project and Save Project ID
# =============================================================================
echo -e "\n--- Configuring project: ${CYAN}${FINAL_PROJECT_ID}${NC} ---"

gcloud config set project "$FINAL_PROJECT_ID" --quiet || handle_error "Failed to set active project."

# Save project ID for reuse across levels
echo "$FINAL_PROJECT_ID" > "$PROJECT_FILE"
echo -e "${GREEN}✓ Project ID saved to ${PROJECT_FILE}${NC}"
echo -e "  Verify with: ${CYAN}gcloud config set project \$(cat ~/project_id.txt) --quiet${NC}"

# =============================================================================
# Step 3: Check and Enable Billing
# =============================================================================
echo ""
echo -e "${YELLOW}Setting up billing for the new project...${NC}"

# Pre-install billing library (needed by billing-enablement.py)
pip install --quiet --user google-cloud-billing 2>/dev/null || true

# Resolve path to billing-enablement.py (same directory as this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! python3 "${SCRIPT_DIR}/billing-enablement.py"; then
    echo ""
    echo -e "${RED}Billing setup incomplete. Please configure billing and try again.${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Setup complete! Project '${FINAL_PROJECT_ID}' is ready.${NC}"
exit 0
