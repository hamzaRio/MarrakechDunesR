/**
 * CORS Origin Management Utility
 * Handles allowed origins from CLIENT_URL environment variable
 * Supports wildcard preview domains like https://marrakechdunes-*.vercel.app
 */

// Parse CLIENT_URL environment variable
const clientUrlString = process.env.CLIENT_URL || 'http://localhost:5173';

// Require CLIENT_URL in production
if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL) {
  throw new Error('CLIENT_URL environment variable is required in production');
}

const allowedOriginsList = clientUrlString.split(',').map(url => url.trim()).filter(Boolean);

// Preview domain regex patterns
const previewRegexes = [
  /^https:\/\/marrakechdunes-[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/.*--marrakechdunes.*\.vercel\.app$/, // Vercel preview URLs
];

// Build CSP connect-src list
const cspConnectSrc = [
  "'self'",
  ...allowedOriginsList,
  'https://marrakechdunes.vercel.app',
  'https://marrakechdunes-*.vercel.app'
].filter((url, index, arr) => arr.indexOf(url) === index); // Remove duplicates

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
