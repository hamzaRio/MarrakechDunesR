// API URL configuration
const VITE_API_URL = import.meta.env.VITE_API_URL;

if (!VITE_API_URL) {
  throw new Error('VITE_API_URL environment variable is required');
}

export const API_URL = VITE_API_URL;
export const ASSETS_BASE =
  import.meta.env.VITE_ASSETS_BASE || `${API_URL}/attached_assets`;

export function asset(p: string) { 
  return `${ASSETS_BASE}/${String(p).replace(/^[\\/]/, "")}`; 
}