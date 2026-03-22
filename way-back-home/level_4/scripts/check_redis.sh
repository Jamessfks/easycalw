#!/bin/bash

# ==============================================================================
# Verify Setup Script - Mission Charlie (Level 5)
# 
# Checks that the environment is correctly configured:
# 1. Google Cloud Project is set
# 2. Redis Container 'ozymandias-vault' is running and populated
# 
# Includes: Automatic recovery (start/run) of the Redis container if it's down
#           and automatic data population if lists are missing or incomplete.
# ==============================================================================

# --- Colors for Output ---
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}🚀 Verifying Mission Charlie (Level 5) Infrastructure...${NC}\n"

ALL_PASSED=true

# --- Redis Data Definition ---
# Data is now defined with internal quotes to ensure multi-word components are treated as single list elements.
declare -A REDIS_DATA=(
    ["HYPERION-X"]="'Warp Core' 'Flux Pipe' 'Ion Thruster'"
    ["NOVA-V"]="'Ion Thruster' 'Warp Core' 'Flux Pipe'"
    ["OMEGA-9"]="'Flux Pipe' 'Ion Thruster' 'Warp Core'"
    ["GEMINI-MK1"]="'Coolant Tank' 'Servo' 'Fuel Cell'"
    ["APOLLO-13"]="'Warp Core' 'Coolant Tank' 'Ion Thruster'"
    ["VORTEX-7"]="'Quantum Cell' 'Graviton Coil' 'Plasma Injector'"
    ["CHRONOS-ALPHA"]="'Shield Emitter' 'Data Crystal' 'Quantum Cell'"
    ["NEBULA-Z"]="'Plasma Injector' 'Flux Pipe' 'Graviton Coil'"
    ["PULSAR-B"]="'Data Crystal' 'Servo' 'Shield Emitter'"
    ["TITAN-PRIME"]="'Ion Thruster' 'Quantum Cell' 'Warp Core'"
)
REDIS_KEYS=("${!REDIS_DATA[@]}")
EXPECTED_LENGTH=3 # All lists should have 3 elements

# ------------------------------------------------------------------------------
# 1. Check Google Cloud Project
# ------------------------------------------------------------------------------
# Try to get project from gcloud config, suppress errors
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

# Fallback to environment variable if gcloud config returned nothing or (unset)
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "(unset)" ]; then
    PROJECT_ID=$GOOGLE_CLOUD_PROJECT
fi

if [ -n "$PROJECT_ID" ] && [ "$PROJECT_ID" != "(unset)" ]; then
    echo -e "✅ Google Cloud Project: ${GREEN}${PROJECT_ID}${NC}"
else
    echo -e "❌ Google Cloud Project: ${RED}Not Configured${NC}"
    # Check if the project_id.txt file exists to provide a more specific instruction
    if [ -f "$HOME/project_id.txt" ]; then
        echo "   Run to set project: gcloud config set project \$(cat ~/project_id.txt) --quiet"
    else
        echo "   Run: gcloud config set project YOUR_PROJECT_ID"
    fi
    ALL_PASSED=false
fi

# ------------------------------------------------------------------------------
# 2. Check Redis Container and Data (ozymandias-vault)
# ------------------------------------------------------------------------------
CONTAINER_NAME="ozymandias-vault"
REDIS_PORT="6379"
START_COMMAND="docker run -d --name $CONTAINER_NAME -p $REDIS_PORT:$REDIS_PORT redis:8.6-rc1-alpine"

echo "2. Checking Redis container and data..."

# Check if container is currently RUNNING
CONTAINER_RUNNING_ID=$(docker ps -q -f name="$CONTAINER_NAME")

if [ -z "$CONTAINER_RUNNING_ID" ]; then
    
    # --- Recovery Logic ---
    CONTAINER_EXISTS_ID=$(docker inspect -f '{{.ID}}' "$CONTAINER_NAME" 2>/dev/null)
    
    if [ -n "$CONTAINER_EXISTS_ID" ]; then
        echo -e "   ⚠️  Docker Container '$CONTAINER_NAME': ${YELLOW}Exited. Attempting to restart...${NC}"
        docker start "$CONTAINER_NAME" &>/dev/null
        if [ $? -eq 0 ]; then
            sleep 1
            CONTAINER_RUNNING_ID=$(docker ps -q -f name="$CONTAINER_NAME")
            if [ -n "$CONTAINER_RUNNING_ID" ]; then
                echo -e "   ✅ Docker Container '$CONTAINER_NAME': ${GREEN}Successfully Restarted${NC}"
            else
                echo -e "   ❌ Docker Container '$CONTAINER_NAME': ${RED}Failed to restart${NC}"
                ALL_PASSED=false
            fi
        else
            echo -e "   ❌ Docker Container '$CONTAINER_NAME': ${RED}Failed to execute 'docker start'${NC}"
            ALL_PASSED=false
        fi
    else
        echo -e "   ❌ Docker Container '$CONTAINER_NAME': ${RED}Not Found. Attempting to run new container...${NC}"
        echo -e "      ${YELLOW}Command: $START_COMMAND${NC}"
        
        $START_COMMAND &>/dev/null
        if [ $? -eq 0 ]; then
            sleep 3
            CONTAINER_RUNNING_ID=$(docker ps -q -f name="$CONTAINER_NAME")
            if [ -n "$CONTAINER_RUNNING_ID" ]; then
                echo -e "   ✅ Docker Container '$CONTAINER_NAME': ${GREEN}Successfully Launched${NC}"
            else
                echo -e "   ❌ Docker Container '$CONTAINER_NAME': ${RED}Failed to launch and start${NC}"
                ALL_PASSED=false
            fi
        else
            echo -e "   ❌ Docker Container '$CONTAINER_NAME': ${RED}Failed to execute 'docker run'${NC}"
            ALL_PASSED=false
        fi
    fi
fi

# 4b & 4c. Check and Populate Redis data (only if container is confirmed RUNNING)
if [ -n "$CONTAINER_RUNNING_ID" ]; then
    
    # Check if redis-cli is available
    if ! command -v redis-cli &> /dev/null; then
        echo -e "   ❌ Redis Data: ${RED}redis-cli not found.${NC}"
        echo "      Please ensure redis-cli is installed (e.g., via 'sudo apt install redis-tools')."
        ALL_PASSED=false
    else
        NEEDS_POPULATION=()
        DATA_CHECK_PASSED=true
        
        for KEY in "${REDIS_KEYS[@]}"; do
            LENGTH=$(redis-cli -p "$REDIS_PORT" LLEN "$KEY" 2>/dev/null)
            
            # Check for error or incorrect length
            if [ $? -ne 0 ] || ! [[ "$LENGTH" =~ ^[0-9]+$ ]] || [ "$LENGTH" != "$EXPECTED_LENGTH" ]; then
                NEEDS_POPULATION+=("$KEY")
                DATA_CHECK_PASSED=false
            fi
        done
        
        if [ "$DATA_CHECK_PASSED" = true ]; then
            echo -e "   ✅ Redis Data Structure: ${GREEN}Validated (${#REDIS_KEYS[@]} lists with length $EXPECTED_LENGTH)${NC}"
        else
            # --- Auto-Population Logic ---
            echo -e "   ⚠️  Redis Data Structure: ${YELLOW}Incomplete/Incorrect data found. Attempting to populate missing keys...${NC}"
            
            POPULATION_FAILED=false
            for KEY in "${NEEDS_POPULATION[@]}"; do
                # 1. Delete the existing key to ensure a clean start
                redis-cli -p "$REDIS_PORT" DEL "$KEY" &>/dev/null
                
                # 2. RPUSH the data using 'eval' to correctly parse the quoted arguments
                COMPONENTS="${REDIS_DATA[$KEY]}"
                # The fix is here: 'eval' ensures that arguments like 'Warp Core' are passed as a single string.
                eval redis-cli -p "$REDIS_PORT" RPUSH "$KEY" $COMPONENTS &>/dev/null
                
                # 3. Verify the RPUSH
                FINAL_LENGTH=$(redis-cli -p "$REDIS_PORT" LLEN "$KEY" 2>/dev/null)
                
                if [ "$FINAL_LENGTH" -eq "$EXPECTED_LENGTH" ]; then
                    echo -e "      [${GREEN}OK${NC}] Populated $KEY"
                else
                    echo -e "      [${RED}FAIL${NC}] Could not populate $KEY. Final length: $FINAL_LENGTH (Expected: $EXPECTED_LENGTH)"
                    POPULATION_FAILED=true
                fi
            done

            if [ "$POPULATION_FAILED" = true ]; then
                ALL_PASSED=false
                echo -e "   ❌ Redis Data Structure: ${RED}Auto-population failed for one or more keys.${NC}"
            else
                echo -e "   ✅ Redis Data Structure: ${GREEN}Validated after auto-population.${NC}"
            fi

        fi
    fi
fi


# ------------------------------------------------------------------------------
# Final Summary
# ------------------------------------------------------------------------------
echo -e "\n-------------------------------------------------------"
if [ "$ALL_PASSED" = true ]; then
    echo -e "🎉 ${GREEN}${BOLD}SYSTEMS ONLINE. READY FOR MISSION.${NC}"
else
    echo -e "🛑 ${RED}${BOLD}SYSTEM CHECKS FAILED.${NC} Please resolve the issues above."
fi