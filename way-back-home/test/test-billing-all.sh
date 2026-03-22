#!/bin/bash
#
# test-billing-all.sh - Automated verification for billing-enablement.py scripts
#
# This script iterates through all billing-enablement.py files,
# creates a temporary project for each, runs the script, and verifies success.
#
# WARNING: This script creates and deletes real Google Cloud projects.
# 

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BILLING_SCRIPTS=$(find "$PROJECT_ROOT" -name "billing-enablement.py" | grep -v "solutions" | grep -v "venv")

# Backup existing project_id.txt
PROJECT_FILE="$HOME/project_id.txt"
PROJECT_FILE_BAK="${PROJECT_FILE}.bak"
if [ -f "$PROJECT_FILE" ]; then
    echo -e "${YELLOW}Backing up existing project_id.txt...${NC}"
    cp "$PROJECT_FILE" "$PROJECT_FILE_BAK"
fi

cleanup() {
    local project_id=$1
    if [ -n "$project_id" ]; then
        echo -e "${YELLOW}Cleaning up project $project_id...${NC}"
        gcloud projects delete "$project_id" --quiet || true
    fi
}

# Restore project_id.txt on exit
trap 'if [ -f "$PROJECT_FILE_BAK" ]; then mv "$PROJECT_FILE_BAK" "$PROJECT_FILE"; fi' EXIT

results=()
failed=0

echo -e "${CYAN}Starting billing enablement test suite...${NC}"
echo "Found scripts:"
echo "$BILLING_SCRIPTS"
echo ""

for script in $BILLING_SCRIPTS; do
    echo -e "${CYAN}Testing script: ${NC}$script"
    
    # Generate random project ID
    TEST_PROJECT="test-billing-$(LC_ALL=C tr -dc 'a-z0-9' < /dev/urandom | head -c 8)"
    
    echo -e "   Creating test project: ${YELLOW}$TEST_PROJECT${NC}"
    if ! gcloud projects create "$TEST_PROJECT" --quiet; then
        echo -e "   ${RED}FAILED: Could not create project.${NC}"
        results+=("FAILED (Create): $script")
        ((failed++))
        continue
    fi
    
    # Set active project
    gcloud config set project "$TEST_PROJECT" --quiet
    echo "$TEST_PROJECT" > "$PROJECT_FILE"
    
    # Run the script
    echo -e "   Running script..."
    if python3 "$script"; then
        echo -e "   ${GREEN}SUCCESS: Billing enabled for $TEST_PROJECT${NC}"
        results+=("SUCCESS: $script")
    else
        echo -e "   ${RED}FAILED: Script returned non-zero exit code.${NC}"
        results+=("FAILED (Run): $script")
        ((failed++))
    fi
    
    # Cleanup
    cleanup "$TEST_PROJECT"
    echo ""
done

echo -e "${CYAN}Test Summary:${NC}"
for res in "${results[@]}"; do
    if [[ $res == FAILED* ]]; then
        echo -e "${RED}$res${NC}"
    else
        echo -e "${GREEN}$res${NC}"
    fi
done

if [ $failed -gt 0 ]; then
    echo -e "\n${RED}Tests failed: $failed${NC}"
    exit 1
else
    echo -e "\n${GREEN}All billing scripts verified successfully!${NC}"
    exit 0
fi
