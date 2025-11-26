// =============================================================
// FILE: src/app/admin/settings/_components/SettingsEmailSection.tsx
// =============================================================

"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SiteSettings, UpdateSettingFn } from "../settings.types";

interface Props {
  settings: SiteSettings;
  updateSetting: UpdateSettingFn;
  testEmail: string;
  onChangeTestEmail: (value: string) => void;
  onSendTestEmail: () => void;
  isSendingTestEmail: boolean;
}

export function SettingsEmailSection({
  settings,
  updateSetting,
  testEmail,
  onChangeTestEmail,
  onSendTestEmail,
  isSendingTestEmail,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            SMTP Host
          </label>
          <Input
            value={settings.emailHost}
            onChange={(e) => updateSetting("emailHost", e.target.value)}
            placeholder="smtpout.secureserver.net"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            SMTP Port
          </label>
          <Input
            type="number"
            value={settings.emailPort}
            onChange={(e) => updateSetting("emailPort", e.target.value)}
            placeholder="587"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.emailUseTls}
            onChange={(e) =>
              updateSetting("emailUseTls", e.target.checked)
            }
          />
          <span className="text-sm font-medium">TLS (STARTTLS)</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.emailUseSsl}
            onChange={(e) =>
              updateSetting("emailUseSsl", e.target.checked)
            }
          />
          <span className="text-sm font-medium">SSL (465)</span>
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        Genelde 587 + TLS veya 465 + SSL kullanılır. İkisini aynı anda aktif
        yapmayın.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            SMTP Kullanıcı Adı
          </label>
          <Input
            value={settings.emailUser}
            onChange={(e) => updateSetting("emailUser", e.target.value)}
            placeholder="info@..."
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            SMTP Şifresi
          </label>
          <Input
            type="password"
            value={settings.emailPassword}
            onChange={(e) =>
              updateSetting("emailPassword", e.target.value)
            }
            placeholder="••••••••"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Boş bırakırsanız backend mevcut şifreyi koruyabilir (o şekilde
            implemente edebiliriz).
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Varsayılan Gönderen (From)
        </label>
        <Input
          value={settings.defaultFromEmail}
          onChange={(e) =>
            updateSetting("defaultFromEmail", e.target.value)
          }
          placeholder="Donanım Puanı <info@...>"
        />
      </div>

      {/* ✉️ Test Mail Alanı */}
      <div className="mt-6 border-t pt-4 space-y-3">
        <p className="text-sm font-medium">Test E-postası Gönder</p>
        <p className="text-xs text-muted-foreground">
          Aşağıya bir e-posta adresi girin ve güncel ayarlarla test maili
          gönderin. <strong>Öneri:</strong> Önce &quot;Ayarları Kaydet&quot;
          butonuna basın, ardından test yapın.
        </p>
        <div className="flex flex-col md:flex-row gap-2">
          <Input
            type="email"
            value={testEmail}
            onChange={(e) => onChangeTestEmail(e.target.value)}
            placeholder="ornek@mail.com"
            className="md:flex-1"
          />
          <Button
  type="button"
  variant="outline"
  onClick={onSendTestEmail}
  disabled={isSendingTestEmail || !testEmail}
>
  {isSendingTestEmail ? "Test gönderiliyor..." : "Test mail gönder"}
</Button>

        </div>
      </div>
    </div>
  );
}
