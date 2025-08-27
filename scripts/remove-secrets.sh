#!/usr/bin/env bash
set -euo pipefail

echo "🚨 SECRET REMOVAL SCRIPT"
echo "This script will help remove secrets from Git history"
echo ""

# Check if git-filter-repo is installed
if ! command -v git-filter-repo &> /dev/null; then
    echo "❌ git-filter-repo is not installed"
    echo "Install it first:"
    echo "  macOS: brew install git-filter-repo"
    echo "  Ubuntu: sudo apt install git-filter-repo"
    echo "  Windows: Download from https://github.com/newren/git-filter-repo"
    exit 1
fi

# Create backup
echo "📦 Creating backup..."
git clone --mirror https://github.com/hamzaRio/MarrakechDunesR.git repo-backup

# Create redaction rules
echo "📝 Creating redaction rules..."
cat > /tmp/redactions.txt << 'EOF'
regex:mongodb\+srv://[^\s'"]+
regex:JWT_SECRET\s*=\s*[A-Za-z0-9_\-\.]+
regex:SESSION_SECRET\s*=\s*[A-Za-z0-9_\-\.]+
regex:ADMIN_PASSWORD\s*=\s*.*$
regex:SUPERADMIN_PASSWORD\s*=\s*.*$
EOF

echo "🧹 Running git-filter-repo..."
git filter-repo --force --replace-text /tmp/redactions.txt

echo "✅ Secrets removed from history"
echo ""
echo "📋 Next steps:"
echo "1. Force push to remote:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "2. Update environment variables in production"
echo "3. Rotate MongoDB Atlas credentials"
echo "4. Generate new JWT and session secrets"
echo ""
echo "⚠️  WARNING: This rewrites Git history!"
echo "   Make sure all collaborators are aware of this change."
