#!/bin/bash
# Hook: SessionStart
# Triggered when a Claude Code session begins.
# Use for initialization: loading env vars, printing context, etc.

echo "Session started at $(date)" >> /tmp/claude-session.log

exit 0
