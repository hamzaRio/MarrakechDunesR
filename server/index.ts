import 'dotenv/config';
import path from "node:path";

// Environment validation helper
const required = (name: string, value?: string) => {
  if (!value || value.trim() === '') throw new Error(`Missing required env: ${name}`);
  return value;
};

// Environment validation helper for optional values (with fallback)
const optional = (name: string, value?: string, fallback?: string) => {
  if (!value || value.trim() === '') {
    if (fallback) {
      console.warn(`Missing env: ${name}, using fallback value`);
      return fallback;
    }
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
};

// Mongo is recommended for prod; allow fallback locally (NODE_ENV!=='production')
const MONGODB_URI = process.env.MONGODB_URI;
const useFallback = !MONGODB_URI && process.env.NODE_ENV !== 'production';

if (!MONGODB_URI && !useFallback) {
  throw new Error('MONGODB_URI is required in production');
}

if (useFallback) {
  console.warn('Running in fallback mode - MongoDB not configured, using in-memory data');
}

// In fallback mode, allow placeholder values for admin passwords
const ADMIN_PASSWORD = useFallback 
  ? optional('ADMIN_PASSWORD', process.env.ADMIN_PASSWORD, 'dev-admin-change-me')
  : required('ADMIN_PASSWORD', process.env.ADMIN_PASSWORD);

const SUPERADMIN_PASSWORD = useFallback
  ? optional('SUPERADMIN_PASSWORD', process.env.SUPERADMIN_PASSWORD, 'dev-superadmin-change-me')
  : required('SUPERADMIN_PASSWORD', process.env.SUPERADMIN_PASSWORD);

// Always require crypto secrets (even in fallback mode for security)
const JWT_SECRET = required('JWT_SECRET', process.env.JWT_SECRET);
const SESSION_SECRET = required('SESSION_SECRET', process.env.SESSION_SECRET);

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import http from "http";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import winston from 'winston';
import { registerRoutes } from "./routes";
import { corsOrigin, allowedOriginsList, cspConnectSrc } from "./src/utils/getAllowedOrigins";

// Initialize JSON logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'marrakechdunes-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Initialize application with MongoDB
if (process.env.NODE_ENV === 'development') {
  logger.info('Initializing MarrakechDunes with MongoDB Atlas...');
}

const app = express();

// Security headers with Helmet (enforced CSP)
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'connect-src': ["'self'", ...cspConnectSrc],
        'img-src': [
          "'self'",
          'data:',
          'blob:',
          'https://images.unsplash.com',
          'https://maps.googleapis.com',
          'https://maps.gstatic.com',
        ],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'script-src': [
          "'self'",
          'https://maps.googleapis.com',
          'https://maps.gstatic.com',
        ],
        'frame-src': ["'self'", 'https://www.google.com'],
      },
    },
  }),
);

// Report-To header for CSP violations
app.use((req, res, next) => {
  res.setHeader(
    "Report-To",
    JSON.stringify({ 
      group: "csp-endpoint", 
      max_age: 10886400, 
      endpoints: [{ url: "/api/csp-report" }] 
    })
  );
  next();
});

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Configure trust proxy for rate limiting  
app.set('trust proxy', 1);

// Rate limiting for auth and admin routes
const authLimiter = rateLimit({
  windowMs: 15*60*1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ 
      error: "rate_limited", 
      retryAfterSec: Math.ceil(15 * 60) 
    });
  }
});
app.use(['/api/auth', '/admin'], authLimiter);

// Rate limiting for CSP reports
const cspReportLimiter = rateLimit({
  windowMs: 60*1000, // 1 minute
  max: 60, // 60 reports per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ 
      error: "rate_limited", 
      retryAfterSec: Math.ceil(60) 
    });
  }
});

// CORS configuration for API routes only
app.use('/api', cors({ 
  origin: corsOrigin, 
  credentials: true, 
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], 
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'] 
}));

// Explicit OPTIONS handler for API routes
app.options('/api/*', cors({ 
  origin: corsOrigin, 
  credentials: true 
}));

// Add Vary: Origin header for API routes
app.use('/api', (req, res, next) => {
  res.setHeader('Vary', 'Origin');
  next();
});

logger.info('CORS configured', {
  allowedOrigins: allowedOriginsList,
  previewPattern: process.env.PREVIEW_DOMAIN
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health should be instant and not depend on DB
app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

// Database connectivity check
app.get('/api/db-ping', async (_req, res) => {
  try {
    // Import mongoose dynamically to avoid circular imports
    const { default: mongoose } = await import('mongoose');
    if (!mongoose.connection.db) {
      throw new Error('Database not connected');
    }
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ ok: 1, message: 'Database connected' });
  } catch (error) {
    res.status(503).json({ 
      ok: 0, 
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// CSP Report endpoint
app.post('/api/csp-report', cspReportLimiter, (req, res) => {
  try {
    const report = req.body;
    logger.warn('CSP violation detected', {
      type: 'csp',
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      report: report
    });
    res.status(204).send();
  } catch (error) {
    // Never crash on bad payloads
    logger.error('Error processing CSP report', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(204).send();
  }
});

// Diagnostics endpoint (auth-protected)
app.get('/api/diag', async (req, res) => {
  // Require an authenticated session (adjust to your auth mechanism)
  if (!req.user) return res.status(401).json({ ok: false, error: 'unauthorized' });

  // Optional DB ping if you have a driver handy; keep it quick and safe
  return res.json({
    ok: true,
    time: new Date().toISOString()
  });
});

// Serve static attached assets with CORP header
app.use(
  '/attached_assets',
  express.static(path.join(process.cwd(), 'attached_assets'), {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  }),
);

// No-cache headers for API JSON responses only
app.use('/api', (_req, res, next) => {
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Morgan logging piped to winston
const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};
app.use(morgan('combined', { stream: morganStream }));

// Request logging middleware with PII masking
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Mask PII in logs
      const maskedHeaders = { ...req.headers };
      if (maskedHeaders.authorization) maskedHeaders.authorization = '[REDACTED]';
      if (maskedHeaders.cookie) maskedHeaders.cookie = '[REDACTED]';
      
      logger.info('API request', {
        method: req.method,
        path: path,
        statusCode: res.statusCode,
        duration: duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        headers: maskedHeaders,
        response: capturedJsonResponse
      });
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error for debugging (but don't expose details to client)
    logger.error('Server error', {
      status,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: _req.path,
      method: _req.method
    });

    res.status(status).json({ message });
    // REMOVED: throw err; - This was causing server crashes
  });

  // Attach Vite only in dev using a dynamic import (so production build doesn't pull vite)
  if (process.env.NODE_ENV !== "production") {
    const { attachVite } = await import("./vite");
    await attachVite(app);
  } else {
    // Serve static files in production
    const distPath = path.resolve(process.cwd(), "client/dist");
    app.use(express.static(distPath));
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  const port = Number(process.env.PORT) || 5000;
  const httpServer = http.createServer(app);

  // Harden timeouts for Render
  httpServer.keepAliveTimeout = 65_000;  // > 60s
  httpServer.headersTimeout = 66_000;  // keepAliveTimeout + 1s
  httpServer.requestTimeout = 60_000;

                httpServer.listen(port, '0.0.0.0', () => {
                logger.info(`Server listening on port ${port}`, { 
                  port, 
                  nodeEnv: process.env.NODE_ENV 
                });
              });

              // Global error handlers to avoid silent crashes
              process.on('unhandledRejection', (reason) => {
                logger.error('Unhandled promise rejection', { reason });
              });
              process.on('uncaughtException', (err) => {
                logger.error('Uncaught exception', { 
                  error: err.message, 
                  stack: err.stack 
                });
              });
})();
