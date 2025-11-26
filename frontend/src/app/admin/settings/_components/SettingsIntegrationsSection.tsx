// =============================================================
// FILE: src/app/admin/settings/_components/SettingsIntegrationsSection.tsx
// =============================================================

"use client";

import { Input } from "@/components/ui/input";
import type { SiteSettings, UpdateSettingFn } from "../settings.types";

interface Props {
  settings: SiteSettings;
  updateSetting: UpdateSettingFn;
}

export function SettingsIntegrationsSection({
  settings,
  updateSetting,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Google Analytics ID
        </label>
        <Input
          value={settings.googleAnalytics}
          onChange={(e) =>
            updateSetting("googleAnalytics", e.target.value)
          }
          placeholder="G-XXXXXXXXXX"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Facebook Pixel ID
        </label>
        <Input
          value={settings.facebookPixel}
          onChange={(e) =>
            updateSetting("facebookPixel", e.target.value)
          }
          placeholder="123456789012345"
        />
      </div>
    </div>
  );
}
