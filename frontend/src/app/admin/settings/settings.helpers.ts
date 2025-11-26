// =============================================================
// FILE: src/app/admin/settings/settings.helpers.ts
// =============================================================

import type { SettingsGroup } from "./settings.types";

// Django media base URL (dev/prod için env'den de gelebilir)
export const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_DJANGO_MEDIA_URL ?? "http://localhost:8000";

export const resolveMediaUrl = (path?: string) => {
  if (!path || typeof path !== "string") return "";

  // Eğer zaten absolute URL ise aynen bırak
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // /media/... geliyorsa Django origin ile birleştir
  if (path.startsWith("/media/")) {
    return `${MEDIA_BASE_URL}${path}`;
  }

  // Diğer durumlarda da best-effort backend origin ile birleştirmek istersen:
  return `${MEDIA_BASE_URL}${path}`;
};

/**
 * RTK bulk settings object’inde
 * { key: { value, description, is_file } } formatını normalize eder
 */
export const getVal = (
  group: SettingsGroup | undefined,
  key: string,
  fallback: string,
): string => {
  if (!group) return fallback;
  const raw = group[key];
  if (!raw) return fallback;

  if (typeof raw === "object" && "value" in raw) {
    const v = raw.value;
    return v !== null && v !== undefined ? String(v) : fallback;
  }

  return fallback;
};

/* ---------- Role helper (Dashboard ile aynı mantık) ---------- */

import type { Role } from "./settings.types";

export function getCurrentUserRole(): Role {
  if (typeof window === "undefined") return "USER";
  try {
    const raw = window.localStorage.getItem("user");
    if (!raw) return "USER";
    const user = JSON.parse(raw) as { role?: Role };
    return (user.role as Role) || "USER";
  } catch {
    return "USER";
  }
}
