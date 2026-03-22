#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# path to config.json (one level up)
CONFIG_PATH="$SCRIPT_DIR/../config.json"

# --- Error Handling: Check if config.json exists ---
if [ ! -f "$CONFIG_PATH" ]; then
    echo "❌ Error: config.json not found at $CONFIG_PATH"
    echo "NOTE: If you are not in a live workshop, you can ignore this error."
    exit 1
fi

# --- Error Handling: Validate JSON content ---
read_config_output=$(python3 -c "
import json
import sys
import os

try:
    with open('$CONFIG_PATH') as f:
        file_content = f.read().strip()
        if not file_content:
            print('ERROR: config.json is empty.')
            sys.exit(1)
        config = json.loads(file_content)
except json.JSONDecodeError as e:
    print(f'ERROR: config.json is not valid JSON. ({e})')
    sys.exit(1)
except Exception as e:
    print(f'ERROR: Could not read config.json: {e}')
    sys.exit(1)

pid = config.get('participant_id')
base = config.get('api_base')
sx = config.get('starting_x')
sy = config.get('starting_y')

# Validate required fields
errors = []
if not pid:
    errors.append('participant_id is missing or empty')
if not base:
    errors.append('api_base is missing or empty')

# Default coordinates if missing
if sx is None: sx = 50
if sy is None: sy = 50

if errors:
    print('ERROR: ' + ', '.join(errors))
    sys.exit(1)

# Print values separated by space
print(f\"{pid} {base} {int(sx)} {int(sy)}\")
")

# Check if python script failed
ret_code=$?
if [ $ret_code -ne 0 ]; then
    echo "❌ Configuration Error:"
    echo "$read_config_output"
    echo ""
    echo "NOTE: If you are not in a live workshop, you can ignore this error."
    exit 1
fi

# Parse the output line
read PARTICIPANT_ID API_BASE STARTING_X STARTING_Y <<< "$read_config_output"

echo "✅ Configuration Loaded"
echo "   Participant: $PARTICIPANT_ID"
echo "   API Base: $API_BASE"
echo "   Start Loc: ($STARTING_X, $STARTING_Y)"

# 1. Check Current Status
echo -e "\n--- Current User Status (Before Update) ---"
status_output=$(curl -s "$API_BASE/participants/$PARTICIPANT_ID")

# Check if curl failed or returned 404/server error
if [[ -z "$status_output" ]] || [[ "$status_output" == *"not found"* ]] || [[ "$status_output" == *"404"* ]]; then
    echo "❌ Error: Participant not found on server or API error."
    echo "Response: $status_output"
    echo ""
    echo "NOTE: If you are not in a live workshop, you can ignore this error."
    exit 1
fi

echo "$status_output" | python3 -c "
import sys, json
try:
    data=json.load(sys.stdin)
    print(f\"   Current Loc: ({data.get('x')}, {data.get('y')}) | Lev2: {data.get('level_2_complete')}\")
except Exception:
    print('   (Could not parse API response)')
"

# 2. Calculate New Random Location (EXTREME Opposite)
read NEW_X NEW_Y <<< $(python3 -c "
import random
sx = int($STARTING_X)
sy = int($STARTING_Y)

# Jump to opposite quadrant logic (significant change)
# Map is 100x100.
if sx < 50:
    nx = random.randint(80, 95)
else:
    nx = random.randint(5, 20)

if sy < 50:
    ny = random.randint(80, 95)
else:
    ny = random.randint(5, 20)

print(f'{nx} {ny}')
")

echo -e "\n--- Applying Updates ---"
echo "Moving from ($STARTING_X, $STARTING_Y) to -> ($NEW_X, $NEW_Y)"

# 3. Update Level Status
echo "Setting Level 1 Complete & Progress 40%..."
curl -s -X PATCH "$API_BASE/participants/$PARTICIPANT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "level_1_complete": true,
    "level_2_complete": false,
    "completion_percentage": 40
  }' > /dev/null

# 4. Verify New Status
echo -e "\n--- Verification (After Update) ---"
verify_output=$(curl -s "$API_BASE/participants/$PARTICIPANT_ID")
echo "$verify_output" | python3 -c "
import sys, json
try:
    data=json.load(sys.stdin)
    print(f\" Lev2: {data.get('level_2_complete')}\")
except Exception:
    print('   (Could not verify update)')
"

echo -e "\nDONE."
