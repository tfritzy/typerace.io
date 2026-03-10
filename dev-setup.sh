#!/bin/bash

set -e

if ! command -v spacetime &> /dev/null; then
    echo "Installing SpacetimeDB CLI..."
    curl -sSf https://install.spacetimedb.com | bash
    export PATH="$HOME/.local/bin:$PATH"
fi

echo "Starting SpacetimeDB server..."
spacetime start &
STDB_PID=$!
sleep 3

echo "Publishing module..."
if spacetime publish --help 2>&1 | grep -q -- '--project-path'; then
    spacetime publish -c -y --project-path spacetimedb typerace -s local
else
    spacetime publish -c -y --module-path spacetimedb typerace -s local
fi

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Starting dev server..."
npm run dev &
VITE_PID=$!

echo ""
echo "============================================"
echo "  Local dev environment is running!"
echo "  Frontend: http://localhost:5173"
echo "  SpacetimeDB: ws://localhost:3000"
echo "  Auth: DevAuthProvider (no Firebase needed)"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $STDB_PID $VITE_PID 2>/dev/null; exit" INT TERM
wait
