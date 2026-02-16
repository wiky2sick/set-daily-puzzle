import type { DailyPuzzleResponse, GuessResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

function getDeviceId(): string {
  const key = "set_daily_device_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const deviceId = getDeviceId();
  const headers = new Headers(options.headers || {});
  headers.set("X-Device-Id", deviceId);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const Api = {
  getDaily: () => apiFetch<DailyPuzzleResponse>("/api/puzzle/daily"),
  guessDaily: (cards: string[]) =>
    apiFetch<GuessResponse>("/api/puzzle/daily/guess", {
      method: "POST",
      body: JSON.stringify({ cards })
    })
};
