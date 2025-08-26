#!/usr/bin/env bash
set -euo pipefail
URL="${1:?health url}"
for i in {1..18}; do  # ~90s total
  code=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || true)
  echo "Health probe attempt $i -> $code"
  if [ "$code" = "200" ]; then
    echo "Health OK"
    exit 0
  fi
  sleep 5
done
echo "Backend not healthy in time"
exit 1
