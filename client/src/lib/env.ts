export const API_URL = import.meta.env.VITE_API_URL;

// For production, assets should be served from the frontend
// For development, they can come from the API
const isDevelopment = import.meta.env.DEV;
export const ASSETS_BASE = isDevelopment 
  ? `${API_URL}/attached_assets`
  : '/attached_assets';

export function asset(p: string) { 
  return `${ASSETS_BASE}/${String(p).replace(/^[\\/]/, "")}`; 
}