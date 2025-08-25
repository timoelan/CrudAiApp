#!/bin/bash
# Development Server Start Script

set -e  # Exit on any error

echo "🚀 Starting CrudAiApp Development Environment..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Change to project root (where .env is)
cd "$(dirname "$0")/.."

# Start services with Docker Compose
echo "📦 Starting containers with Docker Compose..."
docker-compose -f docker/docker-compose.yaml up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
docker-compose -f docker/docker-compose.yaml ps

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📋 Useful commands:"
echo "   View logs:    docker-compose -f docker/docker-compose.yaml logs -f"
echo "   Stop all:     docker-compose -f docker/docker-compose.yaml down"
echo "   Restart:      docker-compose -f docker/docker-compose.yaml restart"
echo ""
