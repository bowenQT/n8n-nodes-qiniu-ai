#!/bin/bash

# n8n Custom Node Testing Script
# This script builds and links the node for local n8n testing

set -e

echo "=== Building Node ==="
npm run build

echo ""
echo "=== Preparing custom node directory ==="

# Create a separate test directory outside project
TEST_DIR="$HOME/.n8n-nodes-test"
CUSTOM_DIR="$TEST_DIR/custom/node_modules/n8n-nodes-qiniu-ai"
mkdir -p "$CUSTOM_DIR"

# Copy only necessary files (avoid symlink recursion)
cp -r dist "$CUSTOM_DIR/"
cp package.json "$CUSTOM_DIR/"
mkdir -p "$CUSTOM_DIR/node_modules"
cp -r node_modules/@bowenqt "$CUSTOM_DIR/node_modules/"

echo ""
echo "=== Starting n8n with custom node ==="
echo "Access n8n at: http://localhost:5678"
echo ""
echo "To stop: Press Ctrl+C"
echo ""

# Run n8n with custom path
export N8N_CUSTOM_EXTENSIONS="$TEST_DIR/custom"
export N8N_USER_FOLDER="$TEST_DIR"

npx n8n start
