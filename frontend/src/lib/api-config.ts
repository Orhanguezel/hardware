// =============================================================
// FILE: src/lib/api-config.ts
// =============================================================

const DEFAULT_API = "http://127.0.0.1:8001/api";

export const DJANGO_API_URL_SERVER = (
  process.env.DJANGO_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  DEFAULT_API
).replace(/\/+$/, "");

export const DJANGO_API_URL_BROWSER = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.DJANGO_API_URL ||
  DEFAULT_API
).replace(/\/+$/, "");


export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export function buildQueryString(params?: QueryParams | void): string {
  if (!params) return "";

  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      sp.append(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}