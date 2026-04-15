#!/usr/bin/env bash

set -euo pipefail

MODULE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$MODULE_DIR"

REQUIRED_RANGE_MSG=">=22.21.1 <23 or >=24"

version_gte() {
  # Compares semantic versions: version_gte 22.21.1 22.14.0 -> false
  local required=$1
  local current=$2

  IFS='.' read -r r1 r2 r3 <<<"$required"
  IFS='.' read -r c1 c2 c3 <<<"$current"

  r2=${r2:-0}
  r3=${r3:-0}
  c2=${c2:-0}
  c3=${c3:-0}

  if (( c1 > r1 )); then return 0; fi
  if (( c1 < r1 )); then return 1; fi

  if (( c2 > r2 )); then return 0; fi
  if (( c2 < r2 )); then return 1; fi

  if (( c3 >= r3 )); then return 0; fi
  return 1
}

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is not installed. Required: ${REQUIRED_RANGE_MSG}."
  exit 1
fi

NODE_VERSION_RAW="$(node -v)"
NODE_VERSION="${NODE_VERSION_RAW#v}"
NODE_MAJOR="${NODE_VERSION%%.*}"

is_supported=false
if [[ "$NODE_MAJOR" == "22" ]]; then
  if version_gte "22.21.1" "$NODE_VERSION"; then
    is_supported=true
  fi
elif (( NODE_MAJOR >= 24 )); then
  is_supported=true
fi

if [[ "$is_supported" != true ]]; then
  cat <<EOF
❌ Unsupported Node.js version: ${NODE_VERSION_RAW}
This module requires Node.js ${REQUIRED_RANGE_MSG}.
Please upgrade Node.js and run this script again.
EOF
  exit 1
fi

echo "✅ Node.js ${NODE_VERSION_RAW} is compatible."

echo "📦 Installing module dependencies..."
if [[ -f package-lock.json ]]; then
  npm install
else
  npm install
fi

if [[ ! -f "public/guest.gif" ]]; then
  cat <<EOF
⚠️  Warning: public/guest.gif was not found.
Please add a fallback guest image at:
  ${MODULE_DIR}/public/guest.gif
EOF
fi

echo "🔍 Running lint checks..."
npm run lint || {
  echo "⚠️ Linting reported issues. The module may still work, but review output above."
}

echo "✅ Installation complete."
echo "Next step: add this module to MagicMirror config/config.js and restart MagicMirror."
