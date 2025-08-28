#!/usr/bin/env bash
set -euo pipefail
if command -v gitleaks >/dev/null 2>&1; then
echo "Running local gitleaks scan…"
gitleaks detect --no-git --redact --config .gitleaks.toml || true
else
echo "gitleaks not installed; skipping local scan."
fi
