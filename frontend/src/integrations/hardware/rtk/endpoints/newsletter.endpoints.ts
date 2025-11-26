// =============================================================
// FILE: src/integrations/hardware/rtk/endpoints/newsletter.endpoints.ts
// Newsletter subscription API'leri için RTK endpointleri
// =============================================================

import { hardwareApi } from "../baseApi";
import type { ApiItemResponse, ApiListResponse } from "../baseApi";
import type {
  NewsletterSubscriptionDto,
  NewsletterSubscribePayload,
  NewsletterUnsubscribePayload,
} from "../types/newsletter.types";

export const newsletterApi = hardwareApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /newsletter/subscribers/
     * newsletter_subscribers_view
     * NewsletterSubscriptionSerializer listesi döner.
     */
    listNewsletterSubscribers: build.query<
      ApiListResponse<NewsletterSubscriptionDto>,
      void
    >({
      query: () => "/newsletter/subscribers/",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((sub) => ({
                type: "Newsletter" as const,
                id: sub.id,
              })),
              { type: "Newsletter" as const, id: "LIST" },
            ]
          : [{ type: "Newsletter" as const, id: "LIST" }],
    }),

    /**
     * POST /newsletter/subscribe/
     * newsletter_subscribe_view
     * Body: { email, source? }
     * Response: NewsletterSubscriptionSerializer + success vb. meta alanlar
     */
    subscribeNewsletter: build.mutation<
      ApiItemResponse<NewsletterSubscriptionDto>,
      NewsletterSubscribePayload
    >({
      query: (body) => ({
        url: "/newsletter/subscribe/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Newsletter" as const, id: "LIST" }],
    }),

    /**
     * POST /newsletter/unsubscribe/
     * newsletter_unsubscribe_view
     * Body: { email }
     * Response yine ilgili subscription serializer'ı (veya success+mesaj) dönecek.
     */
    unsubscribeNewsletter: build.mutation<
      ApiItemResponse<NewsletterSubscriptionDto>,
      NewsletterUnsubscribePayload
    >({
      query: (body) => ({
        url: "/newsletter/unsubscribe/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Newsletter" as const, id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListNewsletterSubscribersQuery,
  useSubscribeNewsletterMutation,
  useUnsubscribeNewsletterMutation,
} = newsletterApi;
