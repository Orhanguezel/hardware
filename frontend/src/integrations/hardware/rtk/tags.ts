// =============================================================
// FILE: src/integrations/hardware/rtk/tags.ts
// Amaç: RTK Query tag tiplerini tek yerde toplamak
// =============================================================

export const hardwareTagTypes = [
  "Auth",
  "User",
  "UserStats",
  "UserSettings",
  "UserActivity",
  "Category",
  "Tag",
  "Product",
  "PriceHistory",
  "Article",
  "Comment",
  "Review",
  "Favorite",
  "Setting",
  "PublicSetting",
  "Analytics",
  "MonthlyAnalytics",
  "DatabaseStats",
  "AffiliateLink",
  "Newsletter",
  "PasswordReset",
  "AnalyticsOverview",
  "ArticleComment",
  "Dashboard"
] as const;

export type HardwareTagType = (typeof hardwareTagTypes)[number];

export type HardwareTag<TId = string | number | "LIST"> = {
  type: HardwareTagType;
  id?: TId;
};
