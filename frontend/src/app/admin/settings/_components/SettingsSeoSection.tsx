// =============================================================
// FILE: src/app/admin/settings/_components/SettingsSeoSection.tsx
// =============================================================

"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings, UpdateSettingFn } from "../settings.types";

interface Props {
  settings: SiteSettings;
  updateSetting: UpdateSettingFn;
}

export function SettingsSeoSection({ settings, updateSetting }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">SEO Başlığı</label>
        <Input
          value={settings.seoTitle}
          onChange={(e) => updateSetting("seoTitle", e.target.value)}
          placeholder="SEO başlığı (60 karakter önerilen)"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {settings.seoTitle.length}/60 karakter
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">SEO Açıklaması</label>
        <Textarea
          value={settings.seoDescription}
          onChange={(e) => updateSetting("seoDescription", e.target.value)}
          placeholder="SEO açıklaması (160 karakter önerilen)"
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {settings.seoDescription.length}/160 karakter
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Anahtar Kelimeler
        </label>
        <Input
          value={settings.seoKeywords}
          onChange={(e) => updateSetting("seoKeywords", e.target.value)}
          placeholder="donanım, router, modem, wifi, inceleme"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Virgülle ayırarak anahtar kelimeleri girin
        </p>
      </div>
    </div>
  );
}
