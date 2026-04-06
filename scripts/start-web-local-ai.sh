#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-8088}"
HOST="${HOST:-0.0.0.0}"
OLLAMA_ENABLED="${OLLAMA_ENABLED:-1}"
OLLAMA_BASE_URL="${OLLAMA_BASE_URL:-http://127.0.0.1:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-llama3.2:1b}"

export PORT HOST OLLAMA_ENABLED OLLAMA_BASE_URL OLLAMA_MODEL

echo "────────────────────────────────────────────────────────"
echo "BUEPT Web + Local AI starter"
echo "Web/API URL      : http://127.0.0.1:${PORT}"
echo "OLLAMA_ENABLED   : ${OLLAMA_ENABLED}"
echo "OLLAMA_BASE_URL  : ${OLLAMA_BASE_URL}"
echo "OLLAMA_MODEL     : ${OLLAMA_MODEL}"
echo "Project root     : ${ROOT_DIR}"
echo "────────────────────────────────────────────────────────"

echo "Building react-native-web bundle..."
npm run web:rnw:build
echo "Web bundle ready: ${ROOT_DIR}/web-rnw/dist"

if command -v curl >/dev/null 2>&1; then
  if curl -fsS "${OLLAMA_BASE_URL%/}/api/tags" >/dev/null 2>&1; then
    echo "Ollama is reachable."
  else
    echo "Warning: Ollama is not reachable now. API will use fallback logic."
  fi
fi

if command -v open >/dev/null 2>&1; then
  (sleep 1 && open "http://127.0.0.1:${PORT}") >/dev/null 2>&1 || true
fi

node web-api-server.js
