# CI/CD Pipeline Documentation

## Overview

This project implements a comprehensive CI/CD pipeline using GitHub Actions for automated testing, building, and deployment to both test and production environments.

## Architecture

### Environments

1. **Test Environment (Staging)**
   - Branch: `develop`
   - Auto-deploy: Enabled
   - URL: `https://marrakech-dunes-test.vercel.app`
   - Backend: `https://marrakech-dunes-test.onrender.com`

2. **Production Environment**
   - Branch: `main`
   - Auto-deploy: Disabled (requires manual approval)
   - URL: `https://marrakech-dunes.vercel.app`
   - Backend: `https://marrakechdunes.onrender.com`

## Workflow Files

### 1. `ci-cd.yml` - Main CI/CD Pipeline
Triggers on pushes to `main` and `develop` branches, and pull requests.

**Jobs:**
- **Test**: Type checking, unit tests, and build verification
- **Build**: Docker image building and pushing to GitHub Container Registry
- **Deploy Test**: Automatic deployment to test environment (develop branch)
- **Deploy Production**: Manual deployment to production environment (main branch)
- **Security Scan**: Vulnerability scanning with Trivy
- **Performance Test**: Lighthouse CI performance testing

### 2. `pr-checks.yml` - Pull Request Checks
Runs on pull requests to ensure code quality before merging.

**Jobs:**
- **Lint**: Type checking, ESLint, and Prettier validation
- **Test**: Unit tests and coverage reporting
- **Build**: Build verification and artifact upload
- **Security**: Security scanning and dependency audit
- **Dependencies**: Outdated dependency checking

## Setup Instructions

### 1. GitHub Repository Setup

1. **Enable GitHub Actions** in your repository settings
2. **Set up branch protection rules**:
   - Go to Settings > Branches
   - Add rule for `main` branch
   - Enable "Require pull request reviews before merging"
   - Set required reviewers to 2
   - Enable "Dismiss stale pull request approvals"

### 2. Required Secrets

Add the following secrets in your GitHub repository (Settings > Secrets and variables > Actions):

#### Backend Secrets (Render)
```
RENDER_API_KEY=your_render_api_key
RENDER_TEST_SERVICE_ID=your_test_service_id
RENDER_PROD_SERVICE_ID=your_production_service_id
```

#### Frontend Secrets (Vercel)
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_TEST_PROJECT_ID=your_test_project_id
VERCEL_PROD_PROJECT_ID=your_production_project_id
```

#### Database Secrets
```
MONGODB_TEST_URI=mongodb://your_test_db_uri
MONGODB_PROD_URI=mongodb://your_production_db_uri
```

#### Application Secrets
```
SESSION_SECRET=your_session_secret
SUPERADMIN_PASSWORD=your_superadmin_password
ADMIN_PASSWORD=your_admin_password
WHATSAPP_RECEIVERS=comma_separated_phone_numbers
```

#### Optional Monitoring Secrets
```
SLACK_WEBHOOK_URL=your_slack_webhook_url
DEPLOYMENT_EMAILS=email1@example.com,email2@example.com
TEST_URL=https://marrakech-dunes-test.vercel.app
```

### 3. Environment Setup

#### Test Environment
1. Create a new Vercel project for testing
2. Create a new Render service for testing
3. Set up separate MongoDB database for testing
4. Configure environment variables as specified in `deployment-config.yml`

#### Production Environment
1. Use existing Vercel project for production
2. Use existing Render service for production
3. Ensure production MongoDB database is properly configured
4. Configure environment variables as specified in `deployment-config.yml`

## Deployment Process

### Test Environment (Automatic)
1. Push code to `develop` branch
2. GitHub Actions automatically:
   - Runs tests and security scans
   - Builds Docker image
   - Deploys to test environment
   - Runs performance tests

### Production Environment (Manual)
1. Create pull request from `develop` to `main`
2. Ensure all checks pass
3. Get required approvals (2 reviewers)
4. Merge to `main` branch
5. GitHub Actions automatically:
   - Runs tests and security scans
   - Builds Docker image
   - Deploys to production environment

## Monitoring and Alerts

### Health Checks
- Test: `https://marrakech-dunes-test.onrender.com/api/health`
- Production: `https://marrakechdunes.onrender.com/api/health`

### Performance Monitoring
- Lighthouse CI runs on test deployments
- Performance thresholds:
  - Performance: 80%
  - Accessibility: 90%
  - Best Practices: 80%
  - SEO: 90%

### Security Scanning
- Trivy vulnerability scanner runs on every build
- npm audit checks for dependency vulnerabilities
- Results uploaded to GitHub Security tab

## Rollback Process

If a deployment fails or issues are detected:

1. **Automatic Rollback**: Configured for test environment
2. **Manual Rollback**: For production, use GitHub's deployment rollback feature
3. **Rollback Window**: 30 minutes after deployment
4. **Max Attempts**: 3 rollback attempts

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript compilation errors
   - Verify all dependencies are installed
   - Check for missing environment variables

2. **Deployment Failures**
   - Verify all required secrets are set
   - Check Render/Vercel service status
   - Review deployment logs in GitHub Actions

3. **Test Failures**
   - Run tests locally: `npm test`
   - Check for environment-specific issues
   - Verify test database connectivity

### Debug Commands

```bash
# Run tests locally
npm test

# Build locally
npm run build

# Type check
npm run check

# Security audit
npm audit

# Check outdated dependencies
npm outdated
```

## Best Practices

1. **Branch Strategy**
   - Use `develop` for feature development
   - Use `main` for production releases
   - Create feature branches from `develop`

2. **Code Quality**
   - All code must pass linting and type checking
   - Tests must pass before deployment
   - Security scans must not find high-severity issues

3. **Deployment Safety**
   - Test environment auto-deploys for quick feedback
   - Production requires manual approval
   - Use feature flags for gradual rollouts

4. **Monitoring**
   - Monitor application health after deployments
   - Set up alerts for performance degradation
   - Track error rates and response times

## Support

For issues with the CI/CD pipeline:
1. Check GitHub Actions logs
2. Review deployment configuration
3. Verify environment variables and secrets
4. Contact the development team

## Recent Changes

- **Removed Arabic language support** from the application
- **Added comprehensive CI/CD pipeline** with test and production environments
- **Implemented security scanning** with Trivy
- **Added performance monitoring** with Lighthouse CI
- **Configured automatic rollback** capabilities
