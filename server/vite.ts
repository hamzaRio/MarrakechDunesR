// server/vite.ts
import path from "node:path";
import type express from "express";

/** Attach Vite middleware in development only */
export async function attachVite(app: express.Express) {
  // Dynamic import so prod build doesn't bundle vite
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    root: path.resolve(process.cwd(), "client"),
    server: { middlewareMode: true },
    appType: "custom",
  });
  app.use(vite.middlewares);
}
