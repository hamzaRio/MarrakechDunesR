import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

// Initialize application with MongoDB
if (process.env.NODE_ENV === 'development') {
  console.log('Initializing MarrakechDunes with MongoDB Atlas...');
}

const app = express();
// Configure trust proxy for rate limiting  
app.set('trust proxy', 1);
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

  // Add health endpoint
  app.get("/api/health", (_req, res) => res.status(200).json({ ok: true }));

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
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
