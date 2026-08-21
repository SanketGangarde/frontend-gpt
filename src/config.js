// Centralized API Configuration for Cloudflare Tunnel / AWS EC2 / Localhost
export const BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export const API_ENDPOINTS = {
  AUTH: `${BASE_URL}/api/auth`,
  CHAT: `${BASE_URL}/api/chat`,
  THREAD: `${BASE_URL}/api/thread`,
};
