// =============================================================
// FILE: src/app/admin/settings/page.tsx
// =============================================================
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Save,
  Settings as SettingsIcon,
  Mail,
  Palette,
  Database,
  Bell,
  Search,
  Link as LinkIcon,
} from "lucide-react";

import {
  useGetBulkSettingsQuery,
  useBulkUpdateSettingsMutation,
  type BulkSettingsData,
  // Eğer burada BulkUpdate payload tipi tanımlıysa
  // onu da import edebilirsin, örn:
  // type BulkSettingsUpdatePayload,
} from "@/integrations/hardware/rtk/endpoints/settings.endpoints";

import {
  useSendTestEmailMutation,
} from "@/integrations/hardware/rtk/endpoints/misc.endpoints";

import {
  getVal,
  getCurrentUserRole,
} from "./settings.helpers";

import type {
  Role,
  SiteSettings,
  Tab,
  TabId,
  NormalizedSettingsData,
  UpdateSettingFn,
} from "./settings.types";

import { SettingsTabsSidebar } from "./_components/SettingsTabsSidebar";
import { SettingsGeneralSection } from "./_components/SettingsGeneralSection";
import { SettingsAppearanceSection } from "./_components/SettingsAppearanceSection";
import { SettingsSeoSection } from "./_components/SettingsSeoSection";
import { SettingsNotificationsSection } from "./_components/SettingsNotificationsSection";
import { SettingsEmailSection } from "./_components/SettingsEmailSection";
import { SettingsIntegrationsSection } from "./_components/SettingsIntegrationsSection";
import { SettingsAdvancedSection } from "./_components/SettingsAdvancedSection";

export default function SettingsPage() {
  const router = useRouter();

  // Role & auth state
  const [userRole, setUserRole] = useState<Role>("USER");
  const [authChecked, setAuthChecked] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "Donanım İnceleme Sitesi",
    siteDescription: "En güncel donanım incelemeleri ve rehberleri",
    siteUrl: "https://donaniminceleme.com",
    logo: "",
    favicon: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#64748b",
    emailNotifications: true,
    commentModeration: true,
    userRegistration: true,
    affiliateTracking: true,
    seoTitle: "Donanım İnceleme Sitesi - En İyi Donanım Rehberleri",
    seoDescription:
      "Router, modem ve ağ donanımları hakkında detaylı incelemeler ve rehberler.",
    seoKeywords: "donanım, router, modem, wifi, inceleme",
    googleAnalytics: "",
    facebookPixel: "",
    customCss: "",
    customJs: "",
    logoFile: null,
    faviconFile: null,
    emailHost: "",
    emailPort: "587",
    emailUseTls: true,
    emailUseSsl: false,
    emailUser: "",
    emailPassword: "",
    defaultFromEmail: "",
  });

  const [activeTab, setActiveTab] = useState<TabId>("general");

  // ✉️ Test mail state
  const [testEmail, setTestEmail] = useState("");

  // RTK – bulk settings fetch
  const {
    data: bulkSettingsResp,
    isLoading: isSettingsLoading,
    error: bulkSettingsError,
  } = useGetBulkSettingsQuery();

  // RTK – bulk update mutation
  const [bulkUpdateSettings, { isLoading: isSavingSettings }] =
    useBulkUpdateSettingsMutation();

  // RTK – test email mutation
  const [sendTestEmail, { isLoading: isSendingTestEmail }] =
    useSendTestEmailMutation();

  /* ---------- Auth & role guard ---------- */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const role = getCurrentUserRole();
    setUserRole(role);
    setAuthChecked(true);

    if (role !== "SUPER_ADMIN") {
      router.replace("/admin");
    }
  }, [router]);

  /* ---------- Bulk settings normalize ---------- */

  useEffect(() => {
    if (!bulkSettingsResp?.data) return;

    const data = bulkSettingsResp.data as BulkSettingsData;
    const normalized = data as unknown as NormalizedSettingsData;

    setSettings((prev) => ({
      ...prev,
      siteName: getVal(normalized.general, "site_name", "Hardware Review"),
      siteDescription: getVal(
        normalized.general,
        "site_description",
        "Donanım incelemeleri, karşılaştırmaları ve rehberleri ile en doğru seçimi yapın.",
      ),
      siteUrl: getVal(
        normalized.general,
        "site_url",
        "https://donaniminceleme.com",
      ),
      logo: getVal(normalized.general, "logo", ""),
      favicon: getVal(normalized.general, "favicon", ""),
      primaryColor: getVal(
        normalized.appearance,
        "primary_color",
        "#3b82f6",
      ),
      secondaryColor: getVal(
        normalized.appearance,
        "secondary_color",
        "#64748b",
      ),
      emailNotifications:
        getVal(
          normalized.notifications,
          "email_notifications",
          "true",
        ) === "true",
      commentModeration:
        getVal(
          normalized.notifications,
          "comment_moderation",
          "true",
        ) === "true",
      userRegistration:
        getVal(normalized.general, "user_registration", "true") === "true",
      affiliateTracking:
        getVal(normalized.general, "affiliate_tracking", "true") === "true",
      seoTitle: getVal(
        normalized.seo,
        "seo_title",
        "Hardware Review - En İyi Donanım Rehberleri",
      ),
      seoDescription: getVal(
        normalized.seo,
        "seo_description",
        "Router, modem ve ağ donanımları hakkında detaylı incelemeler ve rehberler.",
      ),
      seoKeywords: getVal(
        normalized.seo,
        "seo_keywords",
        "donanım, router, modem, wifi, inceleme",
      ),
      googleAnalytics: getVal(
        normalized.integrations,
        "google_analytics",
        "",
      ),
      facebookPixel: getVal(
        normalized.integrations,
        "facebook_pixel",
        "",
      ),
      customCss: getVal(normalized.appearance, "custom_css", ""),
      customJs: getVal(normalized.advanced, "custom_js", ""),
      logoFile: null,
      faviconFile: null,
      emailHost: getVal(normalized.email, "host", ""),
      emailPort: getVal(normalized.email, "port", "587"),
      emailUseTls:
        getVal(normalized.email, "use_tls", "true").toString() === "true",
      emailUseSsl:
        getVal(normalized.email, "use_ssl", "false").toString() === "true",
      emailUser: getVal(normalized.email, "host_user", ""),
      emailPassword: "",
      defaultFromEmail: getVal(
        normalized.email,
        "default_from_email",
        "",
      ),
    }));
  }, [bulkSettingsResp]);

  /* ---------- Helpers ---------- */

  const updateSetting: UpdateSettingFn = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const settingsData = {
        general: {
          site_name: settings.siteName,
          site_description: settings.siteDescription,
          user_registration: settings.userRegistration,
          affiliate_tracking: settings.affiliateTracking,
          logo: settings.logo,     // string (mevcut url veya "")
          favicon: settings.favicon,
          site_url: settings.siteUrl,
        },
        appearance: {
          primary_color: settings.primaryColor,
          secondary_color: settings.secondaryColor,
          custom_css: settings.customCss,
        },
        seo: {
          seo_title: settings.seoTitle,
          seo_description: settings.seoDescription,
          seo_keywords: settings.seoKeywords,
        },
        notifications: {
          email_notifications: settings.emailNotifications,
          comment_moderation: settings.commentModeration,
        },
        integrations: {
          google_analytics: settings.googleAnalytics,
          facebook_pixel: settings.facebookPixel,
        },
        advanced: {
          custom_js: settings.customJs,
        },
        email: {
          host: settings.emailHost,
          port: settings.emailPort,
          use_tls: settings.emailUseTls,
          use_ssl: settings.emailUseSsl,
          host_user: settings.emailUser,
          host_password: settings.emailPassword,
          default_from_email: settings.defaultFromEmail,
        },
      };

      // Bulk endpoint backend’ine uygun payload
      const payload: {
        settings: typeof settingsData;
        logo_file?: File | null;
        favicon_file?: File | null;
      } = {
        settings: settingsData,
      };

      if (settings.logoFile) {
        payload.logo_file = settings.logoFile;
      }
      if (settings.faviconFile) {
        payload.favicon_file = settings.faviconFile;
      }

      await bulkUpdateSettings(payload as any).unwrap();

      // Kaydettikten sonra file state’i sıfırla
      setSettings((prev) => ({
        ...prev,
        logoFile: null,
        faviconFile: null,
      }));

      // eslint-disable-next-line no-alert
      alert(
        "Ayarlar başarıyla kaydedildi! (Test için önce kaydedin, sonra test butonunu kullanın.)",
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error saving settings:", error);
      // eslint-disable-next-line no-alert
      alert("Ayarlar kaydedilirken bir hata oluştu");
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      alert("Lütfen test için bir e-posta adresi girin.");
      return;
    }

    try {
      await sendTestEmail({ to: testEmail }).unwrap();
      alert("Test e-postası gönderildi. (Gelen kutunu kontrol et)");
    } catch (err: any) {
      console.error("Error testing email via RTK:", err);
      const msg =
        err?.data?.error ||
        err?.data?.detail ||
        err?.data?.message ||
        err?.error ||
        "Bilinmeyen hata";
      alert("Test e-postası gönderilemedi: " + msg);
    }
  };

  const clearFileInput = (inputType: "logo" | "favicon") => {
    const fileInputs =
      document.querySelectorAll<HTMLInputElement>('input[type="file"]');
    fileInputs.forEach((input) => {
      if (inputType === "logo" && input.accept.includes("image/*")) {
        input.value = "";
      }
      if (
        inputType === "favicon" &&
        input.accept.includes("image/x-icon")
      ) {
        input.value = "";
      }
    });
  };

  /* ---------- Auth guard UI ---------- */

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Yetki kontrolü yapılıyor...</p>
        </div>
      </div>
    );
  }

  if (userRole !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Erişim Reddedildi
          </h1>
          <p className="text-muted-foreground mb-4">
            Bu sayfaya erişim yetkiniz bulunmuyor. Sadece Süper Admin
            erişebilir.
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Tabs ---------- */

  const tabs: Tab[] = [
    { id: "general", label: "Genel", icon: SettingsIcon },
    { id: "appearance", label: "Görünüm", icon: Palette },
    { id: "seo", label: "SEO", icon: Search },
    { id: "notifications", label: "Bildirimler", icon: Bell },
    { id: "email", label: "E-posta", icon: Mail },
    { id: "integrations", label: "Entegrasyonlar", icon: LinkIcon },
    { id: "advanced", label: "Gelişmiş", icon: Database },
  ];

  /* ---------- Render ---------- */

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Site Ayarları</h1>
        <p className="text-muted-foreground">
          Site genelinde ayarları yönetin ve özelleştirin
        </p>
        {bulkSettingsError && (
          <p className="mt-2 text-sm text-red-600">
            Ayarlar yüklenirken bir hata oluştu. Varsayılan değerler
            gösteriliyor.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <SettingsTabsSidebar
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {tabs.find((tab) => tab.id === activeTab)?.label} Ayarları
              </CardTitle>
              {isSettingsLoading && (
                <p className="text-xs text-muted-foreground mt-1">
                  Ayarlar yükleniyor, varsayılan değerler gösteriliyor...
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {activeTab === "general" && (
                <SettingsGeneralSection
                  settings={settings}
                  updateSetting={updateSetting}
                  onClearFileInput={clearFileInput}
                />
              )}

              {activeTab === "appearance" && (
                <SettingsAppearanceSection
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}

              {activeTab === "seo" && (
                <SettingsSeoSection
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}

              {activeTab === "notifications" && (
                <SettingsNotificationsSection
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}

              {activeTab === "email" && (
                <SettingsEmailSection
                  settings={settings}
                  updateSetting={updateSetting}
                  testEmail={testEmail}
                  onChangeTestEmail={setTestEmail}
                  onSendTestEmail={handleTestEmail}
                  isSendingTestEmail={isSendingTestEmail}
                />
              )}

              {activeTab === "integrations" && (
                <SettingsIntegrationsSection
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}

              {activeTab === "advanced" && (
                <SettingsAdvancedSection
                  settings={settings}
                  updateSetting={updateSetting}
                />
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t">
                <Button onClick={handleSave} disabled={isSavingSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingSettings ? "Kaydediliyor..." : "Ayarları Kaydet"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
