export const API_URL = import.meta.env.VITE_API_URL;
export const ASSETS_BASE =
  import.meta.env.VITE_ASSETS_BASE ||
  (API_URL ? `${API_URL.replace(/\/$/, "")}/assets` : "/assets");

export const asset = (p: string) =>
  `${ASSETS_BASE}/${p.replace(/^\/+/, "")}`;