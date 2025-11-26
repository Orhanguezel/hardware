// src/components/DynamicFavicon.tsx
"use client";

import { useEffect } from "react";
import { useGetPublicSettingsQuery } from "@/integrations/hardware/rtk/endpoints/settings.endpoints";

export function DynamicFavicon() {
  const { data } = useGetPublicSettingsQuery();

  const faviconValue = data?.data?.favicon?.value;

  useEffect(() => {
    if (!faviconValue || typeof faviconValue !== "string") {
      // API favicon dönmezse: mevcut <link rel="icon"> ne ise o kalır
      return;
    }

    let link = document.querySelector(
      "link[rel*='icon']"
    ) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    const base =
      process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "http://localhost:8000";

    const faviconUrl = faviconValue.startsWith("/media/")
      ? `${base}${faviconValue}`
      : faviconValue;

    link.href = faviconUrl;
  }, [faviconValue]);

  return null;
}
