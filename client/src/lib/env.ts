// API URL configuration
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const ASSETS = import.meta.env.VITE_ASSETS_BASE ?? '/attached_assets';

export const API_URL = API;
export const ASSETS_BASE = ASSETS;

export function asset(p: string) { 
  return `${ASSETS_BASE}/${String(p).replace(/^[\\/]/, "")}`; 
}