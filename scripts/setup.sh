#!/bin/bash
# Project Setup Script

set -e

echo "⚙️  Setting up CrudAiApp Development Environment..."

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.9+ first."
    exit 1
fi
echo "✅ Python found: $(python3 --version)"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi
echo "✅ Docker found: $(docker --version)"

# Setup environment files if they don't exist
echo "📝 Setting up environment files..."

if [ ! -f server/config/.env ]; then
    cp server/config/.env.example server/config/.env
    echo "📄 Created server/config/.env - Please configure your Auth0 settings"
fi

if [ ! -f client/.env ]; then
    cp client/.env.example client/.env
    echo "📄 Created client/.env - Please configure your Auth0 settings"
fi

# Install Python dependencies (optional, for local development)
if [ -f server/src/requirements.txt ]; then
    echo "🐍 Installing Python dependencies..."
    cd server/src
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        echo "📦 Created Python virtual environment"
    fi
    source venv/bin/activate
    pip install -r requirements.txt
    echo "✅ Python dependencies installed"
    cd ../..
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd client
npm install
echo "✅ Node.js dependencies installed"
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure Auth0 settings in server/config/.env and client/.env"
echo "2. Install and start Ollama: https://ollama.ai"
echo "3. Run './scripts/dev-start.sh' to start the development environment"
echo ""
