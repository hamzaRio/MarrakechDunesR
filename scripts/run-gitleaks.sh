#!/usr/bin/env bash
set -euo pipefail
CONFIG=".gitleaks.toml"

if command -v gitleaks >/dev/null 2>&1; then
  gitleaks detect --no-banner --redact -c "$CONFIG"
elif command -v docker >/dev/null 2>&1; then
  docker run --rm -v "$PWD:/repo" -w /repo zricethezav/gitleaks:latest \
    detect --no-banner --redact -c "$CONFIG"
else
  echo "gitleaks not found and Docker not installed. Skipping local secret scan."
  echo "CI still runs gitleaks via GitHub Actions."
fi
