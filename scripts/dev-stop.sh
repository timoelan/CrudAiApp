#!/bin/bash
# Development Environment Stop Script

set -e

echo "🛑 Stopping CrudAiApp Development Environment..."

cd "$(dirname "$0")/.."

# Stop and remove containers
docker-compose -f docker/docker-compose.yaml down

echo "✅ All containers stopped and removed."
echo ""
echo "📋 To start again, run:"
echo "   ./scripts/dev-start.sh"
echo ""
