// =============================================================
// FILE: src/components/layout/Footer.tsx
// =============================================================
"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";

// RTK: Settings + Categories
import {
  useGetPublicSettingsQuery,
  type PublicSettings,
} from "@/integrations/hardware/rtk/endpoints/settings.endpoints";

import { useListCategoriesQuery } from "@/integrations/hardware/rtk/endpoints/categories.endpoints";

import type { Category } from "@/integrations/hardware/rtk/types/category.types";
import type { PaginatedResult } from "@/integrations/hardware/rtk/types/common.types";

// 🔹 Logo / medya path'ini çözmek için
import { resolveMediaUrl } from "@/app/admin/settings/settings.helpers";

/* ---------- categoriesResult normalizer ---------- */

function normalizeCategoriesResult(
  result: PaginatedResult<Category> | Category[],
): Category[] {
  if (Array.isArray(result)) return result;
  return result.results ?? [];
}

function FooterContent() {
  /* ---------- Settings (public) RTK ---------- */

  const { data: publicSettingsResponse } = useGetPublicSettingsQuery();
  const publicSettings: PublicSettings | undefined =
    publicSettingsResponse?.data;

  const logoSetting = publicSettings?.logo;
  const siteNameSetting = publicSettings?.site_name;
  const siteDescriptionSetting = publicSettings?.site_description;

  const logoValue = logoSetting?.value ?? "";
  const siteName = siteNameSetting?.value ?? "Hardware Review";
  const siteDescription =
    siteDescriptionSetting?.value ??
    "Donanım incelemeleri, karşılaştırmaları ve rehberleri ile en doğru seçimi yapın.";

  // 🔹 LOGO URL: /media/... veya tam URL → resolveMediaUrl hepsini çözer
  const logoUrl =
    logoValue && typeof logoValue === "string"
      ? resolveMediaUrl(logoValue)
      : null;

  /* ---------- Kategoriler (RTK) ---------- */

  const { data: categoriesResult } = useListCategoriesQuery(undefined);

  const footerCategories: Category[] = useMemo(() => {
    if (!categoriesResult) return [];

    const items: Category[] = normalizeCategoriesResult(categoriesResult);

    // Sadece parent'ı olmayan (üst seviye) kategoriler, ilk 4 tanesi
    return items.filter((c) => !c.parent).slice(0, 4);
  }, [categoriesResult]);

  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={siteName}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded object-contain"
                />
              ) : (
                <div className="h-8 w-8 rounded bg-primary" />
              )}
              <span className="text-xl font-bold">{siteName}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {siteDescription}
            </p>
          </div>

          {/* İçerikler */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">İçerikler</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/reviews"
                  className="text-muted-foreground hover:text-primary"
                >
                  İncelemeler
                </Link>
              </li>
              <li>
                <Link
                  href="/best"
                  className="text-muted-foreground hover:text-primary"
                >
                  En İyi Listeler
                </Link>
              </li>
              <li>
                <Link
                  href="/compare"
                  className="text-muted-foreground hover:text-primary"
                >
                  Karşılaştırmalar
                </Link>
              </li>
              <li>
                <Link
                  href="/guides"
                  className="text-muted-foreground hover:text-primary"
                >
                  Rehberler
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-muted-foreground hover:text-primary"
                >
                  Haberler
                </Link>
              </li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Kategoriler</h3>
            <ul className="space-y-2 text-sm">
              {footerCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              {footerCategories.length === 0 && (
                <li className="text-muted-foreground text-sm">
                  Henüz kategori bulunmuyor
                </li>
              )}
            </ul>
          </div>

          {/* Yasal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Yasal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary"
                >
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary"
                >
                  Kullanım Şartları
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-muted-foreground hover:text-primary"
                >
                  Çerez Politikası
                </Link>
              </li>
              <li>
                <Link
                  href="/affiliate"
                  className="text-muted-foreground hover:text-primary"
                >
                  Affiliate Açıklaması
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Donanım Puanı. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link
                href="/rss"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                RSS
              </Link>
              <Link
                href="/sitemap.xml"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  return <FooterContent />;
}
