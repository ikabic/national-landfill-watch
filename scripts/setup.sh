#!/usr/bin/env bash
set -e

ROOT=$(cd "$(dirname "$0")/.." && pwd)
CLIENT_DIR="$ROOT/client"
SERVER_DIR="$ROOT/server"
SEED_FILE="$ROOT/scripts/seed.sql"

echo "== National Landfill Watch — setup script (bash) =="
echo "Root: $ROOT"

# 1) Check node & npm
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node not found. Install Node.js (https://nodejs.org/) then re-run."
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm not found. Install Node.js/npm then re-run."
  exit 1
fi

# 2) Check dotnet
if ! command -v dotnet >/dev/null 2>&1; then
  echo "ERROR: dotnet CLI not found. Install .NET SDK then re-run."
  exit 1
fi

# 3) Frontend: install deps
if [ -d "$CLIENT_DIR" ]; then
  echo "-> Installing frontend dependencies..."
  cd "$CLIENT_DIR"
  npm install
  echo "Frontend deps installed."
  cd "$ROOT"
else
  echo "WARN: client folder not found at $CLIENT_DIR"
fi

# 4) Backend: restore/build
if [ -d "$SERVER_DIR" ]; then
  echo "-> Restoring and building backend..."
  cd "$SERVER_DIR"
  dotnet restore
  dotnet build
  echo "Backend restored and built."
  cd "$ROOT"
else
  echo "WARN: server folder not found at $SERVER_DIR"
fi

# 5) Seed DB (optional) — use psql if available
if command -v psql >/dev/null 2>&1; then
  echo
  echo "Do you want to execute DB seed script to create landfill_db and insert stub data? (will prompt for postgres password) [Y/n]"
  read -r ANS
  if [[ "$ANS" == "y" || "$ANS" == "Y" || "$ANS" == "" ]]; then
    echo "Executing seed script via psql -U postgres -f $SEED_FILE"
    psql -U postgres -f "$SEED_FILE"
    echo "DB seeded."
  else
    echo "Skipping DB seed."
  fi
else
  echo "psql not found in PATH — skipping DB seed step. You can run scripts/seed.sql manually via psql or pgAdmin."
fi

echo
echo "Setup finished. Next steps:"
echo " - Start backend: cd server && dotnet run"
echo " - Start frontend: cd client && npm start"
echo
