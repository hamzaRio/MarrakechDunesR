export const API_URL = (() => {
  const url = import.meta.env.VITE_API_URL as string | undefined;
  if (!url) throw new Error('VITE_API_URL is required');
  return url.replace(/\/+$/, '');
})();

export const ASSETS_BASE =
  (import.meta.env.VITE_ASSETS_BASE as string | undefined) || `${API_URL}/attached_assets`;

export function asset(p: string) { 
  return `${ASSETS_BASE}/${String(p).replace(/^[\\/]/, "")}`; 
}