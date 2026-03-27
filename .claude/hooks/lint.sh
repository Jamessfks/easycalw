#!/bin/bash
# PostToolUse lint hook — runs after every Write/Edit
# Outputs {"decision": "block", "reason": "..."} on failure to force Claude to fix

FILE="${TOOL_RESULT_FILE:-}"

# Python syntax check for .py files
if [[ "$FILE" == *.py ]]; then
  ERRORS=$(python3 -m py_compile "$FILE" 2>&1)
  if [ $? -ne 0 ]; then
    echo "{\"decision\": \"block\", \"reason\": \"Python syntax error in $FILE: $ERRORS\"}"
    exit 0
  fi
fi

# JS/JSX basic check
if [[ "$FILE" == *.js || "$FILE" == *.jsx ]]; then
  if command -v node &>/dev/null; then
    ERRORS=$(node --check "$FILE" 2>&1)
    if [ $? -ne 0 ]; then
      echo "{\"decision\": \"block\", \"reason\": \"JS syntax error in $FILE: $ERRORS\"}"
      exit 0
    fi
  fi
fi

exit 0
