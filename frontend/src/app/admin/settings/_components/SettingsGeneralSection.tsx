// =============================================================
// FILE: src/app/admin/settings/_components/SettingsGeneralSection.tsx
// =============================================================

"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

import type { SiteSettings, UpdateSettingFn } from "../settings.types";
import { resolveMediaUrl } from "../settings.helpers";

interface Props {
  settings: SiteSettings;
  updateSetting: UpdateSettingFn;
  onClearFileInput: (type: "logo" | "favicon") => void;
}

export function SettingsGeneralSection({
  settings,
  updateSetting,
  onClearFileInput,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Site Adı</label>
        <Input
          value={settings.siteName}
          onChange={(e) => updateSetting("siteName", e.target.value)}
          placeholder="Site adını girin..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Header ve footer&apos;da görüntülenecek site adı
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Site Açıklaması</label>
        <Textarea
          value={settings.siteDescription}
          onChange={(e) => updateSetting("siteDescription", e.target.value)}
          placeholder="Site açıklamasını girin..."
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Footer&apos;da görüntülenecek site açıklaması
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Site URL&apos;si
        </label>
        <Input
          value={settings.siteUrl}
          onChange={(e) => updateSetting("siteUrl", e.target.value)}
          placeholder="https://donanimpuani.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Logo */}
        <div>
          <label className="text-sm font-medium mb-2 block">Logo</label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                // Sadece state’e yazıyoruz, upload işini handleSave yapacak
                updateSetting("logoFile", file);
              }}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
            {settings.logo && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <Image
                    src={resolveMediaUrl(settings.logo)}
                    alt="Current logo"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                    unoptimized
                  />
                  <span className="text-xs text-muted-foreground">
                    Mevcut logo
                  </span>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    // Boş string gönderirsen backend eski dosyayı silip ayarı temizliyor
                    updateSetting("logo", "");
                    updateSetting("logoFile", null);
                    onClearFileInput("logo");
                  }}
                  className="text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Kaldır
                </Button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Header ve footer&apos;daki mavi karenin yerine geçecek logo
          </p>
        </div>

        {/* Favicon */}
        <div>
          <label className="text-sm font-medium mb-2 block">Favicon</label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/x-icon,image/png,image/jpeg,image/gif"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                updateSetting("faviconFile", file);
              }}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
            {settings.favicon && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <Image
                    src={resolveMediaUrl(settings.favicon)}
                    alt="Current favicon"
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain"
                    unoptimized
                  />
                  <span className="text-xs text-muted-foreground">
                    Mevcut favicon
                  </span>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    updateSetting("favicon", "");
                    updateSetting("faviconFile", null);
                    onClearFileInput("favicon");
                  }}
                  className="text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Kaldır
                </Button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sitenin favicon&apos;u (.ico, .png, .jpg)
          </p>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="userRegistration"
          checked={settings.userRegistration}
          onChange={(e) =>
            updateSetting("userRegistration", e.target.checked)
          }
        />
        <label htmlFor="userRegistration" className="text-sm font-medium">
          Kullanıcı kaydına izin ver
        </label>
      </div>
      <p className="text-xs text-muted-foreground ml-6">
        Bu seçenek kapalıysa /auth/signup sayfasına erişim engellenir
      </p>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="affiliateTracking"
          checked={settings.affiliateTracking}
          onChange={(e) =>
            updateSetting("affiliateTracking", e.target.checked)
          }
        />
        <label htmlFor="affiliateTracking" className="text-sm font-medium">
          Affiliate takibi aktif
        </label>
      </div>
      <p className="text-xs text-muted-foreground ml-6">
        Affiliate takibini yönetir
      </p>
    </div>
  );
}
