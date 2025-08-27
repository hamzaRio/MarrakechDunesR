#!/usr/bin/env bash
set -euo pipefail

# 1) Ensure git-filter-repo is installed
command -v git-filter-repo >/dev/null 2>&1 || {
  echo "Install git-filter-repo first: https://github.com/newren/git-filter-repo"; 
  exit 1;
}

# 2) Make a backup clone before rewriting history
git rev-parse --is-inside-work-tree >/dev/null || { 
  echo "Run inside the repo"; 
  exit 1; 
}

echo "⚠️  WARNING: This will rewrite git history!"
echo "Make sure you have a backup of this repository."
echo "Press Ctrl+C to cancel or any key to continue..."
read -n 1 -s

# 3) Define redaction patterns (do NOT paste real secrets)
cat > /tmp/redactions.txt <<'EOF'
regex:mongodb\+srv:\/\/[^\s'"]+
regex:JWT_SECRET\s*=\s*[A-Za-z0-9_\-\.]+
regex:SESSION_SECRET\s*=\s*[A-Za-z0-9_\-\.]+
regex:ADMIN_PASSWORD\s*=\s*.*$
regex:SUPERADMIN_PASSWORD\s*=\s*.*$
EOF

# 4) Rewrite history replacing matches
echo "Rewriting git history to remove secrets..."
git filter-repo --force --replace-text /tmp/redactions.txt

# Clean up
rm -f /tmp/redactions.txt

echo ""
echo "✅ History rewritten successfully!"
echo ""
echo "⚠️  IMPORTANT: Force push ALL branches and tags after reviewing:"
echo "  git push --force --all"
echo "  git push --force --tags"
echo ""
echo "🔒 Remember to rotate the actual secrets in your environment!"
