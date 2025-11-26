// =============================================================
// FILE: src/app/admin/settings/settings.types.ts
// =============================================================

import type { ElementType } from "react";
import type { BulkSettingInfo } from "@/integrations/hardware/rtk/endpoints/settings.endpoints";

/* ---------- Role (isteğe göre başka yerde de kullanılabilir) ---------- */
export type Role = "ADMIN" | "SUPER_ADMIN" | "EDITOR" | "USER";

/* ---------- Site Settings tipi ---------- */

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  logoFile?: File | null;
  faviconFile?: File | null;
  primaryColor: string;
  secondaryColor: string;
  emailNotifications: boolean;
  commentModeration: boolean;
  userRegistration: boolean;
  affiliateTracking: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  googleAnalytics: string;
  facebookPixel: string;
  customCss: string;
  customJs: string;

  // ✉️ Mail ayarları
  emailHost: string;
  emailPort: string;
  emailUseTls: boolean;
  emailUseSsl: boolean;
  emailUser: string;
  emailPassword: string;
  defaultFromEmail: string;
}

/* ---------- Tabs ---------- */

export type TabId =
  | "general"
  | "appearance"
  | "seo"
  | "notifications"
  | "email"
  | "integrations"
  | "advanced";

export interface Tab {
  id: TabId;
  label: string;
  icon: ElementType;
}

/* ---------- Bulk settings normalize tipleri ---------- */

export type SettingsGroup = Record<string, BulkSettingInfo>;

export interface NormalizedSettingsData {
  general?: SettingsGroup;
  appearance?: SettingsGroup;
  seo?: SettingsGroup;
  notifications?: SettingsGroup;
  integrations?: SettingsGroup;
  advanced?: SettingsGroup;
  email?: SettingsGroup;
  [key: string]: SettingsGroup | undefined;
}

/* ---------- updateSetting fonksiyon tipi ---------- */

export type UpdateSettingFn = <K extends keyof SiteSettings>(
  key: K,
  value: SiteSettings[K],
) => void;
