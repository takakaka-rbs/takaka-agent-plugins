#!/bin/bash
# Hook: PostToolUse
# Triggered after a tool completes.
# Receives JSON via stdin with tool_name, tool_input, tool_response.

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Example: log all Bash executions
if [ "$TOOL_NAME" = "Bash" ]; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
  echo "[post-tool-use] Bash executed: $COMMAND" >> /tmp/claude-audit.log
fi

exit 0
