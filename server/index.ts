import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

// Initialize application with MongoDB
if (process.env.NODE_ENV === 'development') {
  console.log('Initializing MarrakechDunes with MongoDB Atlas...');
}

const app = express();
// Configure trust proxy for rate limiting  
app.set('trust proxy', 1);

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

// Static mounts BEFORE routes - serve assets with 7-day cache
app.use('/attached_assets',
  express.static(path.join(process.cwd(), 'attached_assets'), { maxAge: '7d' })
);
// Alias so frontend can always use /assets/<file>
app.use('/assets',
  express.static(path.join(process.cwd(), 'attached_assets'), { maxAge: '7d' })
);

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

  // Remove duplicate health endpoint - it's already defined in routes.ts with database check
  // app.get("/api/health", (_req, res) => res.status(200).json({ ok: true }));

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

  // Use PORT from environment or default to 5000
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || '5000');
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(`serving on port ${port}`);
  });
})();
