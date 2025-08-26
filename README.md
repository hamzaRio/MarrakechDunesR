# MarrakechDunes - Moroccan Adventure Booking Platform

A full-stack web application for booking authentic Moroccan desert adventures and experiences. Features a seamless customer booking journey, comprehensive admin dashboard, and bilingual support.

## Features

- **Customer Experience**: Browse activities, book experiences, receive WhatsApp confirmations
- **Admin Dashboard**: Manage bookings, activities, payments, and performance analytics
- **Bilingual Support**: English and French language support
- **WhatsApp Integration**: Automated notifications to admins and customers
- **Responsive Design**: Mobile-first approach with Moroccan-themed UI
- **Payment Management**: Cash payment tracking with deposit support
- **CI/CD Pipeline**: Automated testing, building, and deployment to test and production environments

## Tech Stack

- **Frontend**: React 18 + TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js + Express, MongoDB/Mongoose
- **State Management**: TanStack Query
- **Build Tools**: Vite, ESBuild
- **Deployment**: Docker, Vercel, Render support
- **CI/CD**: GitHub Actions with automated testing and deployment

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd marrakech-dunes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5000
   - Admin panel: http://localhost:5000/admin/login

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `MONGODB_URI`: MongoDB connection string
- `SESSION_SECRET`: Secure session secret key
- `ADMIN_PASSWORD` / `SUPERADMIN_PASSWORD`: Admin user passwords
- `CLIENT_URL`: Comma-separated list of frontend URLs for CORS (e.g., `http://localhost:5173,https://marrakechdunes.vercel.app`)
  - **Important**: Must list only front-end origins, not the backend URL and not old preview domains
- `PORT`: **On Render**: Remove any PORT env var. Render sets PORT automatically.
- `LOG_LEVEL`: Logging level (optional, default: info) - debug, info, warn, error

## Security & Monitoring

### Security Headers
- **Helmet**: Comprehensive security headers including CSP, HSTS, and XSS protection
- **Rate Limiting**: 300 requests per 15 minutes on `/api/auth/*` and `/admin/*` routes
- **CORS**: Hardened to only allow `localhost:5173` and `marrakechdunes.vercel.app`

### Content Security Policy (CSP)
The CSP is configured to allow:
- Frontend origin: `https://marrakechdunes.vercel.app`
- Backend assets: `https://marrakechdunesr.onrender.com`
- Inline styles for UI components

**To adjust CSP if domains change**: Edit the `contentSecurityPolicy` directives in `server/index.ts`

### Caching Strategy
- **Images**: Long-cache (365 days) with immutable flag for `/attached_assets/*`
- **JSON/API**: No-cache headers to ensure fresh data
- **HTML**: Standard browser caching

### Monitoring
- **Health Check**: `/api/health` - Instant response (no DB dependency)
- **Nightly Verification**: Automated checks run daily at 2:12 AM UTC
- **Error Logging**: Unhandled rejections and exceptions are logged

### Running Live Verification
```bash
# Run the verification script locally
bash scripts/verify-live.sh

# Or manually test endpoints
curl -i https://marrakechdunes.vercel.app/
curl -I https://marrakechdunesr.onrender.com/attached_assets/agafay-1.jpg
curl -i -X OPTIONS https://marrakechdunesr.onrender.com/api/auth/user \
  -H "Origin: https://marrakechdunes.vercel.app" \
  -H "Access-Control-Request-Method: GET"
```

## Operations

### Live Verification
The `scripts/verify-live.sh` script performs end-to-end health checks:
- Frontend routes (/, /activities, /booking, /admin/login)
- Backend health endpoint
- CORS preflight validation
- Asset serving verification

### CSP Reports
CSP violations are collected via report-only policy and logged to `/api/csp-report`:
- Reports are rate-limited to 60/minute per IP
- Logged as JSON with `level=warn, type=csp`
- No authentication required
- Never crashes on malformed payloads

**To monitor CSP violations:**
```bash
# Tail logs for CSP violations
tail -f logs/app.log | grep '"type":"csp"'

# Or check server logs in production
# CSP reports appear as warning-level JSON logs
```

### API Response Codes
- **401 Unauthorized**: `{ "error": "unauthorized" }` - Expected when not logged in
- **429 Rate Limited**: `{ "error": "rate_limited", "retryAfterSec": <n> }` - Too many requests
- **500 Internal Error**: `{ "message": "Internal Server Error" }` - Server error

## Monitoring

### E2E Testing
- **Workflow**: [E2E Production Tests](.github/workflows/e2e-prod.yml)
- **Schedule**: Daily at 3:07 AM UTC
- **Manual Trigger**: Available via GitHub Actions UI
- **Scope**: Production smoke tests only (read-only)

**To re-run E2E tests:**
1. Go to GitHub Actions → "E2E Production Tests"
2. Click "Run workflow" → "Run workflow"
3. Tests run against live production endpoints

### Logging
- **Format**: JSON structured logging via Winston
- **Level**: Configurable via `LOG_LEVEL` env var (default: info)
- **PII Protection**: Authorization headers and cookies are redacted
- **CSP Reports**: Warning-level logs for policy violations

### Health Checks
- **Endpoint**: `GET /api/health`
- **Response**: `{ "ok": true, "uptime": <seconds> }`
- **Performance**: < 200ms response time
- **Dependencies**: No database dependency (instant response)

## Admin Access

**For Development:**
- Default admin accounts are created automatically on first run
- Check the console output for initial credentials
- **⚠️ Always change default passwords in production!**

**For Production:**
- Set `ADMIN_PASSWORD` and `SUPERADMIN_PASSWORD` environment variables
- Use strong, unique passwords
- Enable two-factor authentication if available

## CI/CD Pipeline

This project includes a comprehensive CI/CD pipeline with:

### Environments
- **Test Environment**: Automatic deployment from `develop` branch
- **Production Environment**: Manual deployment from `main` branch

### Features
- Automated testing and type checking
- Security scanning with Trivy
- Performance testing with Lighthouse CI
- Docker image building and deployment
- Automatic rollback capabilities

### Setup
See [CI-CD-README.md](./CI-CD-README.md) for detailed setup instructions.

## Deployment

The project includes deployment configurations for:
- **Docker**: `Dockerfile` and `.dockerignore`
- **Vercel**: `vercel.json` (frontend)
- **Render**: `render.yaml` (backend)
- **GitHub Actions**: Automated CI/CD workflows

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript types
├── attached_assets/ # Static assets (images)
├── .github/         # GitHub Actions workflows
├── deploy configs   # Docker, Vercel, Render configs
└── CI-CD-README.md  # CI/CD documentation
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run test:e2e` - Run E2E smoke tests against production

## Security

- Environment-based configuration
- Rate limiting on API endpoints
- CSRF protection with secure sessions
- Input sanitization and validation
- Secure MongoDB connection handling
- Automated security scanning in CI/CD

## Contributing

1. Fork the repository
2. Create a feature branch from `develop`
3. Make your changes
4. Run tests: `npm test`
5. Create a Pull Request to `develop`
6. Ensure all CI checks pass
7. Get code review approval

## Recent Changes

- **Removed Arabic language support** - Simplified to English and French only
- **Added comprehensive CI/CD pipeline** - Automated testing, building, and deployment
- **Enhanced security** - Automated vulnerability scanning
- **Improved deployment process** - Separate test and production environments

## License

MIT License - see LICENSE file for details