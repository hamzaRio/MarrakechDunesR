/**
 * CORS Origin Management Utility
 * Handles allowed origins from CLIENT_URL environment variable
 * Supports wildcard preview domains via PREVIEW_DOMAIN environment variable
*/

// Parse CLIENT_URL environment variable as comma-separated list
const clientUrlString = process.env.CLIENT_URL || '';

// In production, CLIENT_URL must be set
if (process.env.NODE_ENV === 'production' && !clientUrlString.trim()) {
  throw new Error('CLIENT_URL environment variable is required in production');
}

const allowedOriginsList = clientUrlString
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

// Preview domain configuration
const previewDomain = process.env.PREVIEW_DOMAIN || '';
const previewRegexes = previewDomain
  ? [new RegExp(`^${previewDomain.replace('*', '[a-z0-9-]+').replace(/\./g, '\\.')}$`)]
  : [];

// Build CSP connect-src list
const cspConnectSrc = Array.from(
  new Set([...allowedOriginsList, previewDomain].filter(Boolean)),
);

/**
 * Check if an origin is allowed
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  
  // Check exact matches
  if (allowedOriginsList.includes(origin)) return true;
  
  // Check preview regex patterns
  return previewRegexes.some(regex => regex.test(origin));
}

/**
 * CORS origin callback function for express-cors
 */
export function corsOrigin(origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void): void {
  if (!origin) {
    // Allow requests with no origin (like mobile apps or curl requests)
    return cb(null, true);
  }
  
  if (isAllowedOrigin(origin)) {
    return cb(null, true);
  }
  
  return cb(new Error('Not allowed by CORS'));
}

// Export the lists for CSP configuration
export { allowedOriginsList, previewRegexes, cspConnectSrc };
