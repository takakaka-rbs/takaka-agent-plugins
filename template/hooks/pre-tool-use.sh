#!/bin/bash
# Hook: PreToolUse
# Triggered before any tool is executed.
# Receives JSON via stdin. Exit 0 = allow, exit 2 = block + show message.

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
# TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // empty')

# Example: block dangerous Bash commands
if [ "$TOOL_NAME" = "Bash" ]; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
  if echo "$COMMAND" | grep -qE 'rm\s+-rf|DROP\s+TABLE|format\s+[A-Z]:'; then
    echo "Blocked: dangerous command detected" >&2
    exit 2
  fi
fi

exit 0
