#!/usr/bin/env bash
set -euo pipefail

FE="https://marrakechdunes.vercel.app"
BE="https://marrakechdunesr.onrender.com"

echo "== Frontend routes =="
for p in "/" "/activities" "/booking" "/admin/login"; do
  echo "--- $FE$p"
  curl -sS -o /dev/null -w "%{http_code} %{content_type}\n" "$FE$p"
done

echo "== Backend health =="
curl -sS -i "$BE/api/health" | sed -n '1,20p'

echo "== CORS preflight =="
curl -sS -i -X OPTIONS "$BE/api/auth/user" \
  -H "Origin: $FE" \
  -H "Access-Control-Request-Method: GET" | sed -n '1,40p'
