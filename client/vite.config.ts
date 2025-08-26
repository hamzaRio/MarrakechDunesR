import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { copy } from 'fs-extra';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, path.resolve(__dirname, ".."), "");
  Object.assign(process.env, rootEnv);
  
  return {
    plugins: [
      react(),
      {
        name: 'copy-assets',
        writeBundle() {
          // Copy assets to dist folder for production
          copy(path.resolve(__dirname, '../attached_assets'), path.resolve(__dirname, 'dist/attached_assets'))
            .catch(err => console.error('Error copying assets:', err));
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "../shared"),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            charts: ['recharts'],
          },
        },
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/attached_assets': {
          target: process.env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
  };
});