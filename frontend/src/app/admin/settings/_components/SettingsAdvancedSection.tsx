// =============================================================
// FILE: src/app/admin/settings/_components/SettingsAdvancedSection.tsx
// =============================================================

"use client";

import { Textarea } from "@/components/ui/textarea";
import { Shield } from "lucide-react";
import type { SiteSettings, UpdateSettingFn } from "../settings.types";

interface Props {
  settings: SiteSettings;
  updateSetting: UpdateSettingFn;
}

export function SettingsAdvancedSection({ settings, updateSetting }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Özel JavaScript
        </label>
        <Textarea
          value={settings.customJs}
          onChange={(e) => updateSetting("customJs", e.target.value)}
          placeholder="// Özel JavaScript kodlarınızı buraya yazın"
          rows={8}
          className="font-mono text-sm"
        />
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-800">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Dikkat!</span>
        </div>
        <p className="text-sm text-yellow-700 mt-2">
          Gelişmiş ayarları değiştirirken dikkatli olun. Yanlış kodlar site
          işlevselliğini bozabilir.
        </p>
      </div>
    </div>
  );
}
