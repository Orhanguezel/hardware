// =============================================================
// FILE: src/integrations/hardware/rtk/types/newsletter.types.ts
// Django NewsletterSubscription + serializer tipleri
// =============================================================

/**
 * NewsletterSubscriptionSerializer
 * fields = ["id", "email", "is_active", "subscribed_at", "unsubscribed_at", "source"]
 */
export interface NewsletterSubscriptionDto {
  id: number;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
  source: string | null;
}

/**
 * POST /newsletter/subscribe/
 * Backend büyük ihtimalle en az email + isteğe bağlı source bekliyor.
 */
export interface NewsletterSubscribePayload {
  email: string;
  source?: string;
}

/**
 * POST /newsletter/unsubscribe/
 * Çoğu senaryoda email yeterli.
 */
export interface NewsletterUnsubscribePayload {
  email: string;
}
