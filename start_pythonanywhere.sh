#!/bin/bash
# PythonAnywhere Startup Script for Telegram LongChat Bot
# This script handles Node.js installation and bot startup

echo "🚀 Starting Telegram LongChat Bot deployment on PythonAnywhere..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Attempting to install..."
    
    # Try to install Node.js using nvm
    if ! command -v nvm &> /dev/null; then
        echo "Installing nvm..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    # Install Node.js 18
    nvm install 18
    nvm use 18
fi

# Verify Node.js installation
node --version
npm --version

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --omit=dev
else
    echo "📦 Dependencies already installed"
fi

# Set default environment variables if not set
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-8080}
export ALWAYS_START_SERVER=${ALWAYS_START_SERVER:-true}

echo "📊 Environment:"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo "   ALWAYS_START_SERVER: $ALWAYS_START_SERVER"

# Check for required environment variables
if [ -z "$BOT_TOKEN" ]; then
    echo "⚠️  WARNING: BOT_TOKEN environment variable not set"
    echo "   The bot will start but won't connect to Telegram"
fi

if [ -z "$LONGCHAT_API_KEY" ]; then
    echo "⚠️  WARNING: LONGCHAT_API_KEY environment variable not set"
    echo "   The bot will start but won't be able to use LongChat API"
fi

# Start the bot
echo "🤖 Starting Telegram Bot..."
exec node pythonanywhere_start.js