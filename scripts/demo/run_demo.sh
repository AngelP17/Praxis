#!/bin/bash
# One-command demo launcher for Aether Sentinel
# Usage: ./scripts/demo/run_demo.sh

set -e

echo "=== Aether Sentinel One-Command Demo ==="
echo ""

# 1. Kill anything on our ports (aggressive)
echo "[1/6] Cleaning up old processes..."
for port in 8000 8001 8080 3000; do
    pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
        echo "    Killing PID $pid on port $port"
        kill -9 $pid 2>/dev/null || true
    fi
done
# Also kill any leftover uvicorn/next processes
pkill -9 -f "uvicorn" 2>/dev/null || true
pkill -9 -f "next-dev" 2>/dev/null || true
pkill -9 -f "next server" 2>/dev/null || true
sleep 3

# 2. Clear Python cache to ensure fresh code loads
echo "[2/6] Clearing Python cache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true

# 3. Start backend services in background
echo "[3/6] Starting backend services..."
.venv/bin/uvicorn apps.api_gateway.main:app --host 0.0.0.0 --port 8000 > /tmp/aether-api.log 2>&1 &
API_PID=$!
.venv/bin/uvicorn services.platform-service.src.main:app --host 0.0.0.0 --port 8080 > /tmp/aether-platform.log 2>&1 &
PLATFORM_PID=$!
.venv/bin/uvicorn services.decision-service.main:app --host 0.0.0.0 --port 8001 > /tmp/aether-decision.log 2>&1 &
DECISION_PID=$!

# 4. Wait for API to be ready
echo "[4/6] Waiting for API gateway..."
for i in {1..30}; do
    if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
        echo "    API ready on port 8000!"
        break
    fi
    sleep 1
done

# 5. Start web app
echo "[5/6] Starting web app..."
cd apps/web
pnpm dev > /tmp/aether-web.log 2>&1 &
WEB_PID=$!
cd ../..

# 6. Seed scenario
echo "[6/6] Seeding Press Vibration Cascade scenario..."
.venv/bin/python scripts/demo/seed_scenario.py sample-data/scenarios/press-vibration-cascade.json

echo ""
echo "=== Aether Sentinel is running ==="
echo ""
echo "  Web App:        http://localhost:3000"
echo "  API Gateway:    http://localhost:8000"
echo "  Decision Svc:   http://localhost:8001"
echo "  Platform Svc:   http://localhost:8080"
echo ""
echo "  Open http://localhost:3000/command-center (no login needed)"
echo ""
echo "  PIDs: API=$API_PID Platform=$PLATFORM_PID Decision=$DECISION_PID Web=$WEB_PID"
echo ""
echo "  Logs: /tmp/aether-*.log"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep script running until Ctrl+C
trap 'echo ""; echo "Stopping services..."; kill $API_PID $PLATFORM_PID $DECISION_PID $WEB_PID 2>/dev/null; exit 0' INT
wait
