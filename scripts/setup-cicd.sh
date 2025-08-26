#!/bin/bash

# CI/CD Setup Script for MarrakechDunes
# This script helps you set up the required secrets and configurations for the CI/CD pipeline

set -e

echo "🚀 Setting up CI/CD Pipeline for MarrakechDunes"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed. Please install it first:"
    echo "  macOS: brew install gh"
    echo "  Ubuntu: sudo apt install gh"
    echo "  Windows: winget install GitHub.cli"
    exit 1
fi

# Check if user is authenticated with GitHub
if ! gh auth status &> /dev/null; then
    print_warning "You are not authenticated with GitHub CLI"
    echo "Please run: gh auth login"
    exit 1
fi

# Get repository information
REPO_OWNER=$(gh repo view --json owner --jq .owner.login)
REPO_NAME=$(gh repo view --json name --jq .name)
FULL_REPO="$REPO_OWNER/$REPO_NAME"

print_info "Repository: $FULL_REPO"

echo ""
print_info "Setting up required secrets..."

# Function to prompt for secret value
prompt_secret() {
    local secret_name=$1
    local description=$2
    local is_required=${3:-true}
    
    echo ""
    if [ "$is_required" = true ]; then
        echo -e "${YELLOW}Required:${NC} $description"
        read -s -p "Enter value for $secret_name: " secret_value
        echo ""
        
        if [ -z "$secret_value" ]; then
            print_error "Value cannot be empty for required secret: $secret_name"
            exit 1
        fi
    else
        echo -e "${BLUE}Optional:${NC} $description"
        read -s -p "Enter value for $secret_name (press Enter to skip): " secret_value
        echo ""
    fi
    
    if [ -n "$secret_value" ]; then
        gh secret set "$secret_name" --body "$secret_value" --repo "$FULL_REPO"
        print_status "Set secret: $secret_name"
    fi
}

# Required secrets
echo ""
print_info "=== Required Secrets ==="

prompt_secret "MONGODB_TEST_URI" "MongoDB connection string for test environment"
prompt_secret "MONGODB_PROD_URI" "MongoDB connection string for production environment"
prompt_secret "SESSION_SECRET" "Secure session secret key (generate with: openssl rand -hex 32)"
prompt_secret "SUPERADMIN_PASSWORD" "Super admin password for production"
prompt_secret "ADMIN_PASSWORD" "Admin password for production"
prompt_secret "WHATSAPP_RECEIVERS" "Comma-separated list of WhatsApp phone numbers for notifications"

echo ""
print_info "=== Render Secrets ==="
prompt_secret "RENDER_API_KEY" "Render API key (get from https://render.com/docs/api)"
prompt_secret "RENDER_TEST_SERVICE_ID" "Render service ID for test environment"
prompt_secret "RENDER_PROD_SERVICE_ID" "Render service ID for production environment"

echo ""
print_info "=== Vercel Secrets ==="
prompt_secret "VERCEL_TOKEN" "Vercel API token (get from https://vercel.com/account/tokens)"
prompt_secret "VERCEL_ORG_ID" "Vercel organization ID"
prompt_secret "VERCEL_TEST_PROJECT_ID" "Vercel project ID for test environment"
prompt_secret "VERCEL_PROD_PROJECT_ID" "Vercel project ID for production environment"

echo ""
print_info "=== Optional Monitoring Secrets ==="
prompt_secret "SLACK_WEBHOOK_URL" "Slack webhook URL for deployment notifications" false
prompt_secret "DEPLOYMENT_EMAILS" "Comma-separated list of email addresses for deployment notifications" false
prompt_secret "TEST_URL" "URL of your test environment for performance testing" false

echo ""
print_info "=== Branch Protection Setup ==="
echo "Setting up branch protection rules..."

# Set up branch protection for main branch
gh api repos/$FULL_REPO/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test","build","security"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null

print_status "Branch protection rules configured for main branch"

echo ""
print_info "=== Environment Setup ==="
echo "Creating GitHub environments..."

# Create test environment
gh api repos/$FULL_REPO/environments/test \
  --method PUT \
  --field protection_rules='[{"id":1,"node_id":"MDI6RW52aXJvbm1lbnRQcm90ZWN0aW9uUnVsZTE=","type":"required_reviewers","wait_timer":0}]'

# Create production environment
gh api repos/$FULL_REPO/environments/production \
  --method PUT \
  --field protection_rules='[{"id":1,"node_id":"MDI6RW52aXJvbm1lbnRQcm90ZWN0aW9uUnVsZTE=","type":"required_reviewers","wait_timer":0}]'

print_status "GitHub environments created"

echo ""
print_info "=== Next Steps ==="
echo "1. Create a 'develop' branch: git checkout -b develop && git push -u origin develop"
echo "2. Set up your test environment on Render and Vercel"
echo "3. Configure environment variables in your deployment platforms"
echo "4. Test the pipeline by pushing to the develop branch"
echo ""
echo "For detailed instructions, see: CI-CD-README.md"

echo ""
print_status "CI/CD setup completed! 🎉"
echo ""
print_warning "Remember to:"
echo "  - Change default passwords in production"
echo "  - Set up monitoring and alerting"
echo "  - Test the deployment pipeline"
echo "  - Review security settings"
