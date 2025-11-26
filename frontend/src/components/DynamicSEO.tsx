// src/components/DynamicSEO.tsx
"use client";

import { useEffect } from "react";
import { useGetPublicSettingsQuery } from "@/integrations/hardware/rtk/endpoints/settings.endpoints";

/**
 * Not:
 *  - API'den hiçbir şey gelmezse bile (error / offline),
 *    aşağıdaki fallback stringler default olarak kullanılacak.
 *  - API'den değer gelirse, onlar bu default'ların üstüne yazar.
 */
export function DynamicSEO() {
  // API: { success, data: PublicSettings }
  const { data } = useGetPublicSettingsQuery();

  // PublicSettings: Record<string, { value: string; is_file: boolean }>
  const settings = data?.data;

  useEffect(() => {
    // ---- RAW değerleri, önce settings'ten, yoksa default'tan al ----
    const seoTitleRaw =
      settings?.seo_title?.value ||
      settings?.site_name?.value ||
      "Hardware Review";

    const seoDescriptionRaw =
      settings?.seo_description?.value ||
      settings?.site_description?.value ||
      "Donanım incelemeleri, karşılaştırmaları ve rehberleri ile en doğru seçimi yapın.";

    const seoKeywordsRaw =
      settings?.seo_keywords?.value ||
      "donanım, router, modem, wifi, inceleme";

    const siteNameRaw =
      settings?.site_name?.value || "Hardware Review";

    // ---- Tip güvenliği + son fallback ----
    const seoTitle =
      typeof seoTitleRaw === "string" ? seoTitleRaw : "Hardware Review";

    const seoDescription =
      typeof seoDescriptionRaw === "string"
        ? seoDescriptionRaw
        : "Donanım incelemeleri, karşılaştırmaları ve rehberleri ile en doğru seçimi yapın.";

    const seoKeywords =
      typeof seoKeywordsRaw === "string"
        ? seoKeywordsRaw
        : "donanım, router, modem, wifi, inceleme";

    const siteName =
      typeof siteNameRaw === "string" ? siteNameRaw : "Hardware Review";

    // ---- <title> ----
    document.title = seoTitle;

    // ---- meta description ----
    let metaDescription = document.querySelector(
      "meta[name='description']"
    ) as HTMLMetaElement | null;
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", seoDescription);

    // ---- meta keywords ----
    let metaKeywords = document.querySelector(
      "meta[name='keywords']"
    ) as HTMLMetaElement | null;
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.setAttribute("name", "keywords");
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute("content", seoKeywords);

    // ---- Open Graph title & site_name ----
    let ogTitle = document.querySelector(
      "meta[property='og:title']"
    ) as HTMLMetaElement | null;
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", seoTitle || siteName);

    let ogSiteName = document.querySelector(
      "meta[property='og:site_name']"
    ) as HTMLMetaElement | null;
    if (!ogSiteName) {
      ogSiteName = document.createElement("meta");
      ogSiteName.setAttribute("property", "og:site_name");
      document.head.appendChild(ogSiteName);
    }
    ogSiteName.setAttribute("content", siteName);

    // ---- Open Graph description ----
    let ogDescription = document.querySelector(
      "meta[property='og:description']"
    ) as HTMLMetaElement | null;
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute("content", seoDescription);

    // ---- Twitter title ----
    let twitterTitle = document.querySelector(
      "meta[name='twitter:title']"
    ) as HTMLMetaElement | null;
    if (!twitterTitle) {
      twitterTitle = document.createElement("meta");
      twitterTitle.setAttribute("name", "twitter:title");
      document.head.appendChild(twitterTitle);
    }
    twitterTitle.setAttribute("content", seoTitle);

    // ---- Twitter description ----
    let twitterDescription = document.querySelector(
      "meta[name='twitter:description']"
    ) as HTMLMetaElement | null;
    if (!twitterDescription) {
      twitterDescription = document.createElement("meta");
      twitterDescription.setAttribute("name", "twitter:description");
      document.head.appendChild(twitterDescription);
    }
    twitterDescription.setAttribute("content", seoDescription);
  }, [settings]);

  return null; // render yok, sadece head manipülasyonu
}
