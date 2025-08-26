import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import http from "http";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import { registerRoutes } from "./routes";

// Initialize application with MongoDB
if (process.env.NODE_ENV === 'development') {
  console.log('Initializing MarrakechDunes with MongoDB Atlas...');
}

const app = express();

// Security headers with Helmet
app.use(helmet({ 
  crossOriginResourcePolicy: { policy: 'cross-origin' }, 
  contentSecurityPolicy: { 
    useDefaults: true, 
    directives: { 
      "default-src": ["'self'", "https://marrakechdunes.vercel.app"], 
      "img-src": ["'self'", "data:", "blob:", "https://marrakechdunesr.onrender.com"], 
      "connect-src": ["'self'", "https://marrakechdunesr.onrender.com"], 
      "script-src": ["'self'"], 
      "style-src": ["'self'", "'unsafe-inline'"] 
    }
  }
}));

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
  legacyHeaders: false 
});
app.use(['/api/auth', '/admin'], authLimiter);

// CORS configuration - must come before other middleware
const allowList = (process.env.CLIENT_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Only keep our two intended origins
const canonical = new Set([
  'http://localhost:5173',
  'https://marrakechdunes.vercel.app',
]);
const origins = [...canonical]; // ignore any others from env for safety

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow same-origin/SSR
    return cb(null, origins.includes(origin));
  },
  credentials: true,
}));

console.log('[CORS] Allowed origins:', origins);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health should be instant and not depend on DB
app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
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

// Static mounts with long-cache for images
app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets'), {
  immutable: true,
  maxAge: '365d',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// Alias so frontend can always use /assets/<file>
app.use('/assets', express.static(path.join(process.cwd(), 'attached_assets'), {
  immutable: true,
  maxAge: '365d',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// No-cache headers for API JSON responses only
app.use('/api', (_req, res, next) => {
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

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
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
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
    console.error('Server error:', {
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
    console.log(`[server] listening on ${port} (NODE_ENV=${process.env.NODE_ENV})`);
  });

  // Global error handlers to avoid silent crashes
  process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection]', reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('[uncaughtException]', err);
  });
})();
