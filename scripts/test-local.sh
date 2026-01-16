#!/bin/bash

# n8n Custom Node Testing Script
# This script builds and links the node for local n8n testing

set -e

echo "=== Building Node ==="
npm run build

echo ""
echo "=== Starting n8n with custom node ==="
echo "Access n8n at: http://localhost:5678"
echo ""
echo "To stop: Press Ctrl+C"
echo ""

# Create temp custom nodes dir
CUSTOM_DIR="$(pwd)/.n8n-test/custom"
mkdir -p "$CUSTOM_DIR/node_modules"

# Link our package
ln -sf "$(pwd)" "$CUSTOM_DIR/node_modules/n8n-nodes-qiniu-ai"

# Run n8n with custom path
export N8N_CUSTOM_EXTENSIONS="$CUSTOM_DIR"
export N8N_USER_FOLDER="$(pwd)/.n8n-test"

npx n8n start
