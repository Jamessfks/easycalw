#!/bin/bash
# PostToolUse lint hook — runs after every Write/Edit
# Validates syntax and catches common project-specific mistakes
# Outputs {"decision": "block", "reason": "..."} on failure to force fix

FILE="${TOOL_RESULT_FILE:-}"

# ── Python syntax check ──────────────────────────────────────────
if [[ "$FILE" == *.py ]]; then
  ERRORS=$(python3 -m py_compile "$FILE" 2>&1)
  if [ $? -ne 0 ]; then
    echo "{\"decision\": \"block\", \"reason\": \"Python syntax error in $FILE: $ERRORS\"}"
    exit 0
  fi

  # Block sync LLM calls in async handlers (must use asyncio.to_thread)
  if grep -qE '(client\.messages\.create|anthropic\.Anthropic\(\))' "$FILE" 2>/dev/null; then
    if grep -qE 'async def' "$FILE" 2>/dev/null; then
      if ! grep -q 'asyncio.to_thread\|AsyncAnthropic\|async_client' "$FILE" 2>/dev/null; then
        echo "{\"decision\": \"block\", \"reason\": \"Sync LLM call detected in async handler in $FILE. Use asyncio.to_thread() or AsyncAnthropic.\"}"
        exit 0
      fi
    fi
  fi

  # Block real API keys in output-related files
  if [[ "$FILE" == *guide_output* || "$FILE" == *setup_guide* ]]; then
    if grep -qE '(sk-ant-|AIzaSy|eyJhbGci|ghp_|gho_)' "$FILE" 2>/dev/null; then
      echo "{\"decision\": \"block\", \"reason\": \"Possible API key detected in output file $FILE. Use YOUR_<SERVICE>_API_KEY placeholders.\"}"
      exit 0
    fi
  fi
fi

# ── JS/JSX syntax check ──────────────────────────────────────────
if [[ "$FILE" == *.js || "$FILE" == *.jsx ]]; then
  if command -v node &>/dev/null; then
    ERRORS=$(node --check "$FILE" 2>&1)
    if [ $? -ne 0 ]; then
      echo "{\"decision\": \"block\", \"reason\": \"JS syntax error in $FILE: $ERRORS\"}"
      exit 0
    fi
  fi
fi

# ── Markdown output validation ────────────────────────────────────
if [[ "$FILE" == *.md ]]; then
  # Block real API keys in any markdown file
  if grep -qE '(sk-ant-api03|AIzaSy[A-Za-z0-9_-]{30,}|eyJhbGciOiJIUzI1NiIs)' "$FILE" 2>/dev/null; then
    echo "{\"decision\": \"block\", \"reason\": \"Real API key pattern detected in $FILE. Use placeholder format YOUR_<SERVICE>_API_KEY.\"}"
    exit 0
  fi
fi

exit 0
