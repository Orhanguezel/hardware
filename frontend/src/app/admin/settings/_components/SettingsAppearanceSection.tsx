// =============================================================
// FILE: src/app/admin/settings/_components/SettingsAppearanceSection.tsx
// =============================================================

"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings, UpdateSettingFn } from "../settings.types";

interface Props {
  settings: SiteSettings;
  updateSetting: UpdateSettingFn;
}

export function SettingsAppearanceSection({ settings, updateSetting }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Ana Renk</label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => updateSetting("primaryColor", e.target.value)}
              className="w-16 h-10"
            />
            <Input
              value={settings.primaryColor}
              onChange={(e) => updateSetting("primaryColor", e.target.value)}
              placeholder="#3b82f6"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            İkincil Renk
          </label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={settings.secondaryColor}
              onChange={(e) =>
                updateSetting("secondaryColor", e.target.value)
              }
              className="w-16 h-10"
            />
            <Input
              value={settings.secondaryColor}
              onChange={(e) =>
                updateSetting("secondaryColor", e.target.value)
              }
              placeholder="#64748b"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Özel CSS</label>
        <Textarea
          value={settings.customCss}
          onChange={(e) => updateSetting("customCss", e.target.value)}
          placeholder="/* Özel CSS kodlarınızı buraya yazın */"
          rows={8}
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
}
