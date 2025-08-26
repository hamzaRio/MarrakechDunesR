// API URL configuration
const getApiUrl = () => {
  // In development, use localhost
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }
  
  // In production, use the Render backend
  return import.meta.env.VITE_API_URL || 'https://marrakechdunesr.onrender.com';
};

export const API_URL = getApiUrl();

// For production, assets should be served from the frontend
// For development, they can come from the API
const isDevelopment = import.meta.env.DEV;
export const ASSETS_BASE = isDevelopment 
  ? `${API_URL}/attached_assets`
  : '/attached_assets';

export function asset(p: string) { 
  return `${ASSETS_BASE}/${String(p).replace(/^[\\/]/, "")}`; 
}