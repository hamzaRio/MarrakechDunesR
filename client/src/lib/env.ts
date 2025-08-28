export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
export const ASSETS_BASE = (
  import.meta.env.VITE_ASSETS_BASE ?? (API_URL ? `${API_URL}/assets` : '')
).replace(/\/$/, '');

export const asset = (p: string) => {
  const clean = String(p || '').replace(/^\/+/, '');
  return ASSETS_BASE ? `${ASSETS_BASE}/${clean}` : `/${clean}`;
};