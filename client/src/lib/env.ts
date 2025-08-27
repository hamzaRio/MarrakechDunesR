// API URL configuration
const API = import.meta.env.VITE_API_URL;
const ASSETS = import.meta.env.VITE_ASSETS_BASE?.trim();

if (!API && import.meta.env.PROD) {
  throw new Error('VITE_API_URL environment variable is required');
}

export const API_URL = API!;
export const ASSETS_BASE = ASSETS ?? `${API_URL}/attached_assets`;

export function asset(p: string) { 
  return `${ASSETS_BASE}/${String(p).replace(/^[\\/]/, "")}`; 
}