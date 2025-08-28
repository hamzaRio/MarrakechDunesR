# MarrakechDunesR Audit Report

## Executive Summary

This audit identifies and documents the root causes of several critical issues affecting the MarrakechDunesR application:

1. **GitHub Secret Scan Failures** - Gitleaks configuration issues
2. **Vercel Preview Unstyled** - CSS loading problems in preview deployments
3. **Client 401 Errors** - Unnecessary auth API calls on first load
4. **Node v20 Warnings** - TypeScript module configuration conflicts
5. **Cursor Environment Visibility** - Missing .env.example file

## Detailed Findings

### 1. GitHub Secret Scan (Gitleaks) Failures

**Root Cause**: The `.gitleaks.toml` configuration has conflicting rules and incomplete allowlist patterns.

**Issues Found**:
- **File**: `.gitleaks.toml` (lines 1-81)
- **Problem**: The allowlist regex patterns don't match the actual placeholder formats used in documentation
- **Specific Issues**:
  - Line 74: `'''JWT_SECRET=example-not-a-secret-[a-z-]+-[a-z-]+-[a-z-]+-[a-z-]+'''` doesn't match actual format
  - Line 75: `'''SESSION_SECRET=example-not-a-secret-[a-z-]+-[a-z-]+-[a-z-]+-[a-z-]+'''` doesn't match actual format
  - Missing allowlist for `Marrakech@2025` pattern found in docs
  - Inconsistent regex patterns between rules and allowlist

**Files with Placeholder Secrets**:
- `DEPLOY_CHECKS.md` (lines 7, 9-12)
- `CI-CD-README.md` (lines 78-79, 84-86)
- `docs/security/ROTATE_AND_SCRUB.md` (line 132)

### 2. Vercel Preview Unstyled (CSS Not Loading)

**Root Cause**: CSS is building correctly but may have path resolution issues in Vercel preview.

**Issues Found**:
- **File**: `client/vite.config.ts` (lines 1-14)
- **Status**: ✅ CSS builds successfully (147KB CSS file generated)
- **File**: `client/src/main.tsx` (lines 1-6)
- **Status**: ✅ CSS import present (`import "./index.css"`)
- **File**: `client/src/index.css` (lines 1-311)
- **Status**: ✅ Tailwind CSS properly configured

**Build Verification**:
```bash
cd client && npm run build
# Output: dist/assets/index-DcmvmVSj.css (147.42 kB)
```

**Potential Issues**:
- Vercel may need explicit base path configuration
- CSP headers in server might block CSS loading
- Missing environment variables for Vercel deployment

### 3. Client 401 Errors on /api/auth/user

**Root Cause**: The `useAuth` hook makes an API call on every page load without checking for existing authentication state.

**Issues Found**:
- **File**: `client/src/hooks/use-auth.ts` (lines 1-37)
- **Problem**: `fetchCurrentUser()` is called unconditionally on every component mount
- **Line 11**: `const res = await fetch(`${API_URL}/api/auth/user`, { credentials: "include" });`
- **Impact**: Creates unnecessary 401 errors in browser console for unauthenticated users

**Expected Behavior**: Should check for existing session/token before making API call.

### 4. Node v20 Loader/TSX Warnings

**Root Cause**: TypeScript module configuration conflicts between client and server.

**Issues Found**:
- **File**: `tsconfig.json` (lines 1-24)
  - `"module": "ESNext"` - Client-side ESM configuration
- **File**: `server/tsconfig.json` (lines 1-15)
  - `"module": "CommonJS"` - Server-side CommonJS configuration
- **File**: `package.json` (line 11)
  - `"dev:server": "cross-env NODE_ENV=development tsx server/index.ts"`
- **File**: `server/package.json` (line 5)
  - `"dev": "tsx index.ts"`

**Configuration Conflicts**:
- Root `tsconfig.json` uses ESNext modules
- Server `tsconfig.json` extends root but overrides with CommonJS
- This creates module resolution conflicts with Node v20 and tsx

### 5. Cursor Can't "See" .env.example

**Root Cause**: The `.env.example` file doesn't exist, but documentation references it.

**Issues Found**:
- **File**: `.cursorignore` (line 54)
  - Comment states: `# Note: .env.example is NOT excluded - it should be included in context`
- **File**: `README.md` (line 38)
  - References: `cp .env.example .env`
- **File**: `SECURITY_FIXES.md` (line 12)
  - Claims: `✅ Created .env.example`

**Status**: ❌ `.env.example` file is missing from the repository.

### 6. MongoDB Configuration Issues

**Root Cause**: Server requires MongoDB connection but doesn't handle fallback gracefully.

**Issues Found**:
- **File**: `server/index.ts` (lines 8-15)
- **Problem**: Server crashes if `MONGODB_URI` is not set, even in development
- **Lines 8-9**: `const ADMIN_PASSWORD = required('ADMIN_PASSWORD', process.env.ADMIN_PASSWORD);`
- **Lines 10-11**: `const SUPERADMIN_PASSWORD = required('SUPERADMIN_PASSWORD', process.env.SUPERADMIN_PASSWORD);`

**Impact**: Development setup requires all environment variables, even for fallback mode.

### 7. CORS Configuration

**Root Cause**: CORS configuration may not properly handle Vercel preview domains.

**Issues Found**:
- **File**: `server/src/utils/getAllowedOrigins.ts` (lines 1-63)
- **Status**: ✅ Preview domain patterns are configured
- **Potential Issue**: May need explicit Vercel preview domain handling

## Recommended Fixes

### A. Node 20 Compatibility
1. **Unify TypeScript Module Configuration**
   - Update server `tsconfig.json` to use ESNext modules
   - Ensure consistent module resolution across client/server

2. **Environment Loading Order**
   - ✅ Already correct: `import 'dotenv/config';` is first line in `server/index.ts`

### B. MongoDB + Fallback Mode
1. **Graceful Fallback Handling**
   - Allow server to start without MongoDB in development
   - Make admin passwords optional in fallback mode
   - Add warning logs for missing configuration

### C. CORS + Preview Domains
1. **Enhanced CORS Configuration**
   - Ensure Vercel preview domains are properly handled
   - Add explicit support for `https://marrakechdunes-*.vercel.app`

### D. Client CSS Loading
1. **Vercel Configuration**
   - Verify `vercel.json` base path settings
   - Ensure CSP headers don't block CSS loading

### E. Stop 401 Noise
1. **Conditional Auth API Calls**
   - Check for existing session/token before making API call
   - Implement proper auth state management

### F. Environment Variables
1. **Create .env.example**
   - Add missing `.env.example` file with placeholders
   - Include all required variables for development

### G. Secret Scanning
1. **Fix Gitleaks Configuration**
   - Update allowlist patterns to match actual placeholder formats
   - Add missing patterns for documentation files
   - Ensure consistent regex patterns

## Local Test Plan

### 1. Server Testing
```bash
# Test Node 20 compatibility
npx cross-env NODE_ENV=development tsx server/index.ts

# Test fallback mode (without MONGODB_URI)
npx cross-env NODE_ENV=development tsx server/index.ts
```

### 2. Client Testing
```bash
# Test CSS build
cd client && npm run build
# Verify: dist/assets/*.css exists and is >100KB

# Test development server
cd client && npm run dev
# Verify: CSS loads properly in browser
```

### 3. Secret Scan Testing
```bash
# Test gitleaks locally
gitleaks detect --redact --config .gitleaks.toml
# Verify: No false positives for placeholder values
```

### 4. Environment Testing
```bash
# Test .env.example visibility
# Verify: Cursor can read .env.example file

# Test environment variable loading
# Verify: Server starts with placeholder values
```

## Implementation Priority

1. **High Priority**: Fix Node 20 compatibility and MongoDB fallback
2. **Medium Priority**: Fix secret scanning and create .env.example
3. **Low Priority**: Optimize 401 noise and CORS configuration

## Files to Modify

1. `server/tsconfig.json` - Module configuration
2. `server/index.ts` - MongoDB fallback logic
3. `.gitleaks.toml` - Secret scanning rules
4. `.env.example` - Create new file
5. `client/src/hooks/use-auth.ts` - Conditional auth calls
6. `vercel.json` - Base path configuration
