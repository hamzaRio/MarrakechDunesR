# Deployment Verification Checks

## Environment Variables Required

### Render Backend
```bash
CLIENT_URL=http://localhost:5173,https://marrakechdunes.vercel.app,https://marrakechdunes-*.vercel.app
SESSION_SECRET=<generate-32-char-random-string>
NODE_ENV=production
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<generate-random-64-bytes>
SUPERADMIN_PASSWORD=<secure-password>
ADMIN_PASSWORD=<secure-password>
```

### Vercel Frontend
```bash
VITE_API_URL=https://marrakechdunesr.onrender.com
VITE_ASSETS_BASE=https://marrakechdunesr.onrender.com/attached_assets
```

**⚠️ CRITICAL:** These environment variables are required for the client to function properly. Without them, the app will fail to load styles and assets.

**📝 Note:** Production variables are set in Render and Vercel dashboards, not in local .env files.

## Curl Header Checks

### 1. CORS Preflight Check
```bash
curl -I -H "Origin: https://marrakechdunes.vercel.app" \
  https://marrakechdunesr.onrender.com/api/auth/user
```
**Expected:**
- `Access-Control-Allow-Origin: https://marrakechdunes.vercel.app`
- `Access-Control-Allow-Credentials: true`
- `Vary: Origin`

### 2. Preview Domain CORS Check
```bash
curl -I -H "Origin: https://marrakechdunes-test.vercel.app" \
  https://marrakechdunesr.onrender.com/api/auth/user
```
**Expected:**
- `Access-Control-Allow-Origin: https://marrakechdunes-test.vercel.app`
- `Access-Control-Allow-Credentials: true`

### 3. Wildcard Preview Domain CORS Check
```bash
curl -I -H "Origin: https://marrakechdunes-abc123.vercel.app" \
  https://marrakechdunesr.onrender.com/api/auth/user
```
**Expected:**
- `Access-Control-Allow-Origin: https://marrakechdunes-abc123.vercel.app`
- `Access-Control-Allow-Credentials: true`

### 4. Static Assets Check
```bash
curl -I https://marrakechdunesr.onrender.com/attached_assets/agafay-1.jpg
```
**Expected:**
- `Cache-Control: public, max-age=31536000, immutable`
- `Cross-Origin-Resource-Policy: cross-origin`
- No CORS errors

### 5. CSP Headers Check
```bash
curl -I https://marrakechdunesr.onrender.com/
```
**Expected:**
- `Content-Security-Policy` header present with:
  - `style-src-elem` including `https://fonts.googleapis.com`
  - `font-src` including `https://fonts.gstatic.com`
  - `frame-src` including `https://www.google.com`
- `Strict-Transport-Security` header present

### 6. Database Connectivity Check
```bash
curl -i https://marrakechdunesr.onrender.com/api/db-ping
```
**Expected:**
- Status: 200
- Response: `{"ok": 1, "message": "Database connected"}`

### 7. CSS Loading Check
```bash
curl -I https://marrakechdunes.vercel.app/assets/index-*.css
```
**Expected:**
- Status: 200
- Content-Type: text/css
- CSS file loads without CSP violations

## Browser Checks

### 1. Cookie Security
1. Open https://marrakechdunes.vercel.app
2. Open DevTools → Application → Cookies
3. Login to admin panel
4. Verify cookie has:
   - `Secure: true`
   - `SameSite: None`
   - `HttpOnly: true`

### 2. Google Maps Integration
1. Navigate to activities page
2. Check for Google Maps iframe
3. Verify no CSP errors in console
4. Map should load without blocking

### 3. Image Loading
1. Check activity images load properly
2. Verify no `ERR_BLOCKED_BY_RESPONSE.NotSameOrigin` errors
3. Images should load from `/attached_assets/`

### 4. Font Loading
1. Check Google Fonts load properly
2. Verify no CSP violations for `fonts.googleapis.com`
3. Text should render with correct fonts

## Common Issues & Solutions

### CORS Errors
- **Issue:** `Access-Control-Allow-Origin` missing
- **Solution:** Check `CLIENT_URL` environment variable includes correct domains

### Cookie Issues
- **Issue:** Cookies not sent with requests
- **Solution:** Verify `secure: true` and `sameSite: 'none'` in production

### CSP Violations
- **Issue:** Google Maps or fonts blocked
- **Solution:** Check CSP directives include required domains

### Static Asset 404s
- **Issue:** Images not loading
- **Solution:** Verify `VITE_ASSETS_BASE` points to correct backend URL

## Security Checklist

- [ ] `SESSION_SECRET` is 32+ characters and random
- [ ] `NODE_ENV=production` on Render
- [ ] HTTPS enforced on both Vercel and Render
- [ ] CSP headers present and not blocking legitimate resources
- [ ] Rate limiting active on auth endpoints
- [ ] No sensitive data in client-side code
- [ ] Database connection uses SSL/TLS
- [ ] `npm run scan:secrets` passes (no findings)
- [ ] All secrets rotated after any potential leak
