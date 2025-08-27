# Secret Rotation Runbook

## Overview
This document provides step-by-step instructions for rotating secrets after a potential leak or as part of regular security maintenance.

## Prerequisites
- Access to MongoDB Atlas dashboard
- Access to Render dashboard
- Access to Vercel dashboard
- Admin access to the application

## Step 1: MongoDB Atlas Rotation

### 1.1 Create New Database User
1. Log into [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to your cluster → Database Access
3. Click "Add New Database User"
4. Choose "Password" authentication
5. Generate a strong password (use a password manager)
6. Set privileges to "Read and write to any database"
7. Click "Add User"

### 1.2 Generate New Connection String
1. Go to your cluster → Connect
2. Choose "Connect your application"
3. Copy the new connection string
4. Replace `<password>` with the new user's password
5. Replace `<dbname>` with your database name

### 1.3 Optional: Restrict Network Access
1. Go to Network Access
2. Add your Render server IP to the IP Access List
3. Or use "Allow Access from Anywhere" (0.0.0.0/0) if needed

## Step 2: Application Secret Rotation

### 2.1 Generate New Session Secret
```bash
# Generate a new 64-byte random string
openssl rand -hex 32
```

### 2.2 Generate New Admin Passwords
```bash
# Generate secure passwords
openssl rand -base64 12
```

## Step 3: Update Environment Variables

### 3.1 Render (Backend)
1. Go to your Render service dashboard
2. Navigate to Environment
3. Update these variables:
   - `MONGODB_URI`: New connection string
   - `SESSION_SECRET`: New session secret
   - `SUPERADMIN_PASSWORD`: New superadmin password
   - `ADMIN_PASSWORD`: New admin password
4. Click "Save Changes"
5. Trigger a redeploy

### 3.2 Vercel (Frontend)
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Update any client-side secrets (if any)
4. Redeploy the application

## Step 4: Verify Rotation

### 4.1 Test Database Connection
```bash
# Test the new connection
curl -i https://your-render-app.onrender.com/api/db-ping
```

### 4.2 Test Admin Login
1. Visit your application
2. Try logging in with the new admin passwords
3. Verify all admin functions work

### 4.3 Check Application Logs
1. Monitor Render logs for connection errors
2. Verify no authentication issues
3. Check for any missing environment variables

## Step 5: Clean Up

### 5.1 Revoke Old Database User
1. Go back to MongoDB Atlas → Database Access
2. Find the old database user
3. Click "Edit" → "Delete User"
4. Confirm deletion

### 5.2 Update Documentation
1. Update any internal documentation
2. Notify team members of new credentials
3. Update any CI/CD secrets if applicable

## Step 6: Security Monitoring

### 6.1 Monitor for Unauthorized Access
1. Check MongoDB Atlas logs for failed connections
2. Monitor application logs for authentication failures
3. Set up alerts for unusual activity

### 6.2 Verify Secret Scanning
```bash
# Run secret scan to ensure no new leaks
npm run scan:secrets
```

## Emergency Procedures

### If Rotation Fails
1. **Immediate**: Revert to previous credentials if needed
2. **Investigate**: Check logs for specific error messages
3. **Fix**: Address the root cause
4. **Retry**: Attempt rotation again

### If Old Credentials Are Still Working
1. **Verify**: Ensure the new credentials are actually being used
2. **Check**: Look for hardcoded fallbacks in code
3. **Restart**: Force restart the application
4. **Monitor**: Watch for any remaining old connections

## Prevention

### Regular Rotation Schedule
- **Database passwords**: Every 90 days
- **Session secrets**: Every 180 days
- **Admin passwords**: Every 60 days

### Automated Monitoring
- Set up alerts for credential expiration
- Monitor for unusual access patterns
- Regular security audits

## Contact Information
- **MongoDB Atlas Support**: [Atlas Support](https://docs.atlas.mongodb.com/support/)
- **Render Support**: [Render Support](https://render.com/docs/help)
- **Vercel Support**: [Vercel Support](https://vercel.com/support)

## Notes
- Always test in a staging environment first
- Keep backups of working configurations
- Document all changes for audit purposes
- Consider using a secrets management service for production
