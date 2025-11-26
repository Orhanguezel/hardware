// =============================================================
// FILE: src/app/admin/settings/_components/SettingsNotificationsSection.tsx
// =============================================================

"use client";

import type { SiteSettings, UpdateSettingFn } from "../settings.types";

interface Props {
  settings: SiteSettings;
  updateSetting: UpdateSettingFn;
}

export function SettingsNotificationsSection({
  settings,
  updateSetting,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="emailNotifications"
          checked={settings.emailNotifications}
          onChange={(e) =>
            updateSetting("emailNotifications", e.target.checked)
          }
        />
        <label
          htmlFor="emailNotifications"
          className="text-sm font-medium"
        >
          Email bildirimleri aktif
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="commentModeration"
          checked={settings.commentModeration}
          onChange={(e) =>
            updateSetting("commentModeration", e.target.checked)
          }
        />
        <label
          htmlFor="commentModeration"
          className="text-sm font-medium"
        >
          Yorum moderasyonu aktif
        </label>
      </div>
    </div>
  );
}
