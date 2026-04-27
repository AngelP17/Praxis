#!/bin/bash
# One-command demo launcher for Aether Sentinel
# Usage: ./scripts/demo/run_demo.sh

set -e

echo "=== Aether Sentinel One-Command Demo ==="
echo ""

# 1. Kill anything on our ports
echo "[1/5] Cleaning up old processes..."
for port in 8000 8001 8080 3000; do
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
done
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "next-dev" 2>/dev/null || true
sleep 2

# 2. Start backend services in background
echo "[2/5] Starting backend services..."
.venv/bin/uvicorn apps.api_gateway.main:app --host 0.0.0.0 --port 8000 > /tmp/aether-api.log 2>&1 &
API_PID=$!
.venv/bin/uvicorn services.platform-service.src.main:app --host 0.0.0.0 --port 8080 > /tmp/aether-platform.log 2>&1 &
PLATFORM_PID=$!
.venv/bin/uvicorn services.decision-service.main:app --host 0.0.0.0 --port 8001 > /tmp/aether-decision.log 2>&1 &
DECISION_PID=$!

# 3. Wait for API to be ready
echo "[3/5] Waiting for API gateway..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "    API ready!"
        break
    fi
    sleep 1
done

# 4. Start web app
echo "[4/5] Starting web app..."
cd apps/web
pnpm dev > /tmp/aether-web.log 2>&1 &
WEB_PID=$!
cd ../..

# 5. Seed scenario
echo "[5/5] Seeding Press Vibration Cascade scenario..."
.venv/bin/python scripts/demo/seed_scenario.py sample-data/scenarios/press-vibration-cascade.json

echo ""
echo "=== Aether Sentinel is running ==="
echo ""
echo "  Web App:        http://localhost:3000"
echo "  API Gateway:    http://localhost:8000"
echo "  Decision Svc:   http://localhost:8001"
echo "  Platform Svc:   http://localhost:8080"
echo ""
echo "  Login: operator / operator"
echo ""
echo "  PIDs: API=$API_PID Platform=$PLATFORM_PID Decision=$DECISION_PID Web=$WEB_PID"
echo ""
echo "  Logs: /tmp/aether-*.log"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep script running until Ctrl+C
trap 'echo ""; echo "Stopping services..."; kill $API_PID $PLATFORM_PID $DECISION_PID $WEB_PID 2>/dev/null; exit 0' INT
wait
