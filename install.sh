#!/bin/bash

##############################################################################
# Crypto Analysis Pro - Installation Script for macOS
#
# This script automates the installation and setup process
##############################################################################

set -e  # Exit on error

echo "=========================================="
echo "Crypto Analysis Pro - Installation Script"
echo "=========================================="
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "❌ Error: This application is designed for macOS"
  echo "   Your OS: $OSTYPE"
  exit 1
fi

echo "✓ macOS detected"

# Check Node.js installation
if ! command -v node &> /dev/null; then
  echo ""
  echo "❌ Node.js is not installed"
  echo ""
  echo "Please install Node.js 16.x or later from:"
  echo "https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node -v)
echo "✓ Node.js installed: $NODE_VERSION"

# Check npm installation
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed"
  exit 1
fi

NPM_VERSION=$(npm -v)
echo "✓ npm installed: $NPM_VERSION"

# Check minimum Node.js version (16.x)
REQUIRED_NODE_VERSION=16
CURRENT_NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$CURRENT_NODE_MAJOR" -lt "$REQUIRED_NODE_VERSION" ]; then
  echo ""
  echo "❌ Node.js version $REQUIRED_NODE_VERSION.x or higher is required"
  echo "   Current version: $NODE_VERSION"
  echo ""
  echo "Please upgrade Node.js from: https://nodejs.org/"
  exit 1
fi

echo "✓ Node.js version is compatible"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "   This may take a few minutes..."
echo ""

npm install

if [ $? -eq 0 ]; then
  echo ""
  echo "✓ Dependencies installed successfully"
else
  echo ""
  echo "❌ Failed to install dependencies"
  exit 1
fi

echo ""
echo "=========================================="
echo "Installation Complete! 🎉"
echo "=========================================="
echo ""
echo "To start the application, run:"
echo "  npm start"
echo ""
echo "For development mode with hot reload:"
echo "  npm run dev"
echo ""
echo "To create a production build:"
echo "  npm run build"
echo "  npm run package"
echo ""
echo "⚠️  IMPORTANT DISCLAIMER:"
echo "This application is for educational purposes only."
echo "It does not constitute financial advice."
echo "Cryptocurrency trading involves substantial risk."
echo "Only invest what you can afford to lose."
echo ""
echo "For more information, see:"
echo "  - CRYPTO_ANALYSIS_APP.md (User Guide)"
echo "  - DEVELOPER_GUIDE.md (Developer Documentation)"
echo ""
echo "=========================================="
