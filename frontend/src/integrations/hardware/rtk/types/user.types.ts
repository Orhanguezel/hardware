// =============================================================
// FILE: src/integrations/hardware/rtk/types/user.types.ts
// Django User + user ile ilgili tüm response tipleri
// =============================================================

export type UserRole = "ADMIN" | "SUPER_ADMIN" | "EDITOR" | "USER" | string;

// Admin tarafında kullanılan status alanı
export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED" | string;

export interface UserPrivacySettings {
  profile_visible: boolean;
  email_visible: boolean;
  [key: string]: boolean;
}

export interface UserNotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  [key: string]: boolean;
}

export interface UserSettingsObject {
  theme: string;
  language: string;
  [key: string]: string;
}

/**
 * UserSerializer(user).data çıktısı için temel tip
 */
export interface UserDto {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  bio?: string | null;
  avatar?: string | null;
  // Backend'de genelde doğrulama tarihi (string) ya da null
  email_verified?: string | null;
  date_joined?: string;
  privacy_settings?: UserPrivacySettings | null;
  notification_settings?: UserNotificationSettings | null;
  settings?: UserSettingsObject | null;
}

/** Admin user list için tip
 *  - UserDto alanları + admin list'in ek alanları
 */
export interface UserListItem extends UserDto {
  // Admin serializer’dan gelebilecek status
  status?: UserStatus;
  // Bazı serializer’lar created_at kullanabilir, fallback için
  created_at?: string;

  // Admin listte gösterilen sayısal istatistikler
  authoredArticles?: number;
  comments_count?: number;
}

/**
 * UserStatsView + UserPublicStatsView dönüş tipi
 */
export interface UserStats {
  favorites_count: number;
  reviews_count: number;
  comments_count: number;
  authoredArticles: number;
}

/**
 * UserSettingsView GET için tekil settings objesi
 */
export interface UserSettings {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  profile_visible: boolean;
  email_visible: boolean;
  theme: string;
  language: string;
}

/**
 * UserSettingsView PUT için payload (FormData ya da plain object ile doldurulabilir)
 */
export interface UserSettingsUpdatePayload {
  name?: string;
  email?: string;
  bio?: string;
  avatar?: File;
  remove_avatar?: "true" | "false";
  email_notifications?: "true" | "false";
  push_notifications?: "true" | "false";
  marketing_emails?: "true" | "false";
  profile_visible?: "true" | "false";
  email_visible?: "true" | "false";
  theme?: string;
  language?: string;
}

export interface UserSettingsUpdateResponse {
  success: boolean;
  settings: UserSettings;
}

/**
 * UserActivityView dönüş tipi
 */
export type UserActivityType = "favorite" | "review" | "comment";

export interface UserActivityItem {
  type: UserActivityType;
  action: string;
  item: string;
  date: string; // ISO datetime string
}

/**
 * UserProfileView içindeki recent_articles / recent_comments
 */
export interface UserRecentArticle {
  id: number;
  title: string;
  slug: string;
  type: string;
  published_at: string;
  category: {
    name: string;
    slug: string;
  };
}

export interface UserRecentComment {
  id: number;
  content: string;
  created_at: string;
  article: {
    title: string;
    slug: string;
    type: string;
  };
}

/**
 * UserProfileView GET response
 */
export interface UserPublicProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  role: UserRole;
  created_at: string;
  privacy_settings: UserPrivacySettings;
  notification_settings: UserNotificationSettings;
  recent_articles: UserRecentArticle[];
  recent_comments: UserRecentComment[];
}

/**
 * FavoriteSerializer için minimum model tipi (UserFavoritesView /favorites/)
 * id, user, product, created_at alanlarını biliyoruz.
 */
export interface FavoriteItem {
  id: number;
  user: number;
  product: number;
  created_at: string;
}

/* --------- Admin user create/update payload'ları --------- */

/** Admin panelden yeni kullanıcı oluşturma payload'u */
export interface AdminUserCreatePayload {
  name: string;
  email: string;
  password: string;
  // SUPER_ADMIN buradan oluşturulmayacak; UI tarafında kısıtlarız
  role?: UserRole;
}

/** Admin panelden kullanıcı güncelleme payload'u */
export interface AdminUserUpdatePayload {
  role?: UserRole;
  status?: UserStatus;
  // Email doğrulama boolean'ı – backend bu değeri tarih/null'a çevirebilir
  email_verified?: boolean;
}
