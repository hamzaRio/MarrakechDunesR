# Security: Credential Rotation and History Scrubbing

This document provides step-by-step instructions for rotating leaked credentials and scrubbing sensitive data from Git history.

## 🚨 Emergency Response

If credentials have been leaked:

1. **Immediate Actions:**
   - Rotate all affected credentials immediately
   - Update environment variables in production
   - Monitor for unauthorized access
   - Document the incident

2. **Communication:**
   - Notify team members
   - Update security documentation
   - Consider security audit

## 🔄 Credential Rotation

### MongoDB Atlas Rotation

1. **Access MongoDB Atlas:**
   - Log into [MongoDB Atlas](https://cloud.mongodb.com)
   - Navigate to your cluster

2. **Create New Database User:**
   - Go to Database Access
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Generate a strong password
   - Assign appropriate roles (readWrite for app user)
   - Save the new user

3. **Update Connection String:**
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the new connection string
   - Replace username and password with new credentials

4. **Update Environment Variables:**
   - **Render Dashboard:** Update `MONGODB_URI`
   - **Vercel Dashboard:** No MongoDB connection needed
   - **Local Development:** Update `.env` file

5. **Test Connection:**
   - Restart the application
   - Verify database connectivity
   - Check application logs for errors

6. **Remove Old User:**
   - Wait 24-48 hours to ensure no issues
   - Go back to Database Access
   - Delete the old database user

### Application Secrets Rotation

1. **Generate New Secrets:**
   ```bash
   # Session Secret (64 bytes)
   openssl rand -base64 64
   
   # JWT Secret (64 bytes)
   openssl rand -base64 64
   
   # Admin Passwords (use password generator)
   # Generate secure passwords for SUPERADMIN_PASSWORD and ADMIN_PASSWORD
   ```

2. **Update Environment Variables:**
   - **Render:** Update `SESSION_SECRET`, `JWT_SECRET`, `SUPERADMIN_PASSWORD`, `ADMIN_PASSWORD`
   - **Local:** Update `.env` file

3. **Test Authentication:**
   - Clear browser cookies/sessions
   - Test admin login with new passwords
   - Verify JWT tokens work correctly

## 🧹 Git History Scrubbing

### Using git filter-repo (Recommended)

1. **Install git filter-repo:**
   ```bash
   # macOS
   brew install git-filter-repo
   
   # Ubuntu/Debian
   sudo apt install git-filter-repo
   
   # Windows (with Git Bash)
   # Download from: https://github.com/newren/git-filter-repo
   ```

2. **Create Backup:**
   ```bash
   git clone --mirror https://github.com/your-org/your-repo.git repo-backup
   ```

3. **Create Redaction Rules:**
   ```bash
   cat > redactions.txt << 'EOF'
   regex:mongodb\+srv://[^\s'"]+
   regex:JWT_SECRET\s*=\s*[A-Za-z0-9_\-\.]+
   regex:SESSION_SECRET\s*=\s*[A-Za-z0-9_\-\.]+
   regex:ADMIN_PASSWORD\s*=\s*.*$
   regex:SUPERADMIN_PASSWORD\s*=\s*.*$
   EOF
   ```

4. **Run Filter-Repo:**
   ```bash
   git filter-repo --force --replace-text redactions.txt
   ```

5. **Force Push:**
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

### Using BFG Repo-Cleaner (Alternative)

1. **Install BFG:**
   ```bash
   # Download from: https://rtyley.github.io/bfg-repo-cleaner/
   ```

2. **Create Text File with Secrets:**
   ```bash
   cat > secrets.txt << 'EOF'
   mongodb+srv://olduser:oldpass@cluster.mongodb.net/db
   old-jwt-secret-here
   old-session-secret-here
   old-admin-password
   old-superadmin-password
   EOF
   ```

3. **Run BFG:**
   ```bash
   java -jar bfg.jar --replace-text secrets.txt
   ```

4. **Clean and Push:**
   ```bash
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

## 🔍 Verification Steps

### After Rotation

1. **Check Application Health:**
   ```bash
   curl -i https://your-app.onrender.com/api/health
   ```

2. **Test Authentication:**
   - Login with new admin credentials
   - Verify session persistence
   - Check JWT token generation

3. **Database Connectivity:**
   ```bash
   curl -i https://your-app.onrender.com/api/db-ping
   ```

### After History Scrubbing

1. **Verify Secrets Removed:**
   ```bash
   git log --all --full-history -- . | grep -i "mongodb\|jwt\|session\|password"
   ```

2. **Run Secret Scan:**
   ```bash
   gitleaks detect --no-banner --redact
   ```

3. **Check GitHub Security:**
   - Review Security tab in repository
   - Ensure no active secret alerts
   - Verify secret scanning results

## 🛡️ Prevention

### Pre-commit Hooks

1. **Install Husky:**
   ```bash
   npm install --save-dev husky lint-staged
   npx husky install
   ```

2. **Configure Pre-commit:**
   ```bash
   npx husky add .husky/pre-commit "npx lint-staged"
   ```

3. **Add to package.json:**
   ```json
   {
     "lint-staged": {
       "**/*": "gitleaks protect --staged"
     }
   }
   ```

### Environment Management

1. **Never Commit Secrets:**
   - Use `.env.example` with placeholders
   - Keep `.env` in `.gitignore`
   - Use environment variables in production

2. **Regular Audits:**
   - Monthly secret scanning
   - Quarterly credential rotation
   - Annual security review

3. **Access Control:**
   - Limit repository access
   - Use branch protection rules
   - Require PR reviews

## 📞 Emergency Contacts

- **MongoDB Atlas Support:** [Atlas Support](https://docs.atlas.mongodb.com/support/)
- **GitHub Security:** [GitHub Security](https://github.com/security)
- **Team Security Lead:** [Contact your security team]

## 📋 Checklist

### Rotation Checklist
- [ ] MongoDB Atlas user created
- [ ] Connection string updated
- [ ] Application secrets rotated
- [ ] Environment variables updated
- [ ] Application tested
- [ ] Old credentials removed
- [ ] Team notified

### Scrubbing Checklist
- [ ] Repository backed up
- [ ] git filter-repo installed
- [ ] Redaction rules created
- [ ] History scrubbed
- [ ] Force pushed to remote
- [ ] Secrets verified removed
- [ ] Security scan clean
- [ ] Team notified

### Prevention Checklist
- [ ] Pre-commit hooks installed
- [ ] .env.example updated
- [ ] .gitignore configured
- [ ] Branch protection enabled
- [ ] Regular scanning scheduled
- [ ] Documentation updated
