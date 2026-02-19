#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Root: $ROOT_DIR"

# Ensure backend .env exists
ENV_EXAMPLE="$ROOT_DIR/backend/.env.example"
ENV_FILE="$ROOT_DIR/backend/.env"
if [[ ! -f "$ENV_FILE" && -f "$ENV_EXAMPLE" ]]; then
  echo "Creating backend/.env from .env.example"
  cp "$ENV_EXAMPLE" "$ENV_FILE"
fi

cd "$ROOT_DIR/infra"
echo "Starting docker-compose (infra) in background..."
docker-compose up --build -d

HEALTH_URL="http://localhost:4000/api/health"
echo "Waiting for backend to become healthy at $HEALTH_URL"
MAX=60
COUNT=0
until [[ $COUNT -ge $MAX ]] ; do
  if curl -s "$HEALTH_URL" | grep -q 'ok'; then
    echo "Backend healthy"
    break
  fi
  COUNT=$((COUNT+1))
  sleep 2
done
if [[ $COUNT -ge $MAX ]]; then
  echo "Backend did not become healthy in time (timeout). Check 'docker-compose logs backend'" >&2
  exit 1
fi

echo "Registering test user (may already exist)..."
REGISTER_RESP=$(curl -s -o /dev/stderr -w "%{http_code}" -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Dev Tester","email":"devtester@example.com","password":"Password123"}') || true
echo "Register response code: $REGISTER_RESP"

echo "Logging in to get token..."
LOGIN_JSON=$(curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"devtester@example.com","password":"Password123"}')

# Try to extract token using python if available, otherwise fallback to grep
TOKEN=""
if command -v python3 >/dev/null 2>&1; then
  TOKEN=$(echo "$LOGIN_JSON" | python3 -c "import sys, json
try:
  obj=json.load(sys.stdin)
  print(obj.get('token',''))
except:
  sys.exit(0)")
else
  TOKEN=$(echo "$LOGIN_JSON" | grep -Po '"token"\s*:\s*"\K[^"]+' || true)
fi

if [[ -z "$TOKEN" ]]; then
  echo "Failed to obtain token. Login response:" >&2
  echo "$LOGIN_JSON" >&2
  exit 1
fi

echo "Token obtained (length ${#TOKEN})"

echo "Creating a complaint via API"
CREATE_JSON=$(curl -s -X POST http://localhost:4000/api/complaints -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"title":"Test complaint from run-dev","description":"Auto-created complaint for smoke test."}') || true
echo "Create response: $CREATE_JSON"

echo "Listing complaints..."
curl -s http://localhost:4000/api/complaints | jq -C '.' || true

echo "Smoke tests complete. Tail backend logs with: docker-compose logs -f backend"
