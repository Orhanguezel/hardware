// src/app/admin/settings/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Save,
  Settings,
  Mail,
  Shield,
  Palette,
  Database,
  Bell,
  Search,
  Link as LinkIcon,
  Trash2,
} from 'lucide-react'

/* ---------- Types ---------- */

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  logo: string
  favicon: string
  logoFile?: File | null
  faviconFile?: File | null
  primaryColor: string
  secondaryColor: string
  emailNotifications: boolean
  commentModeration: boolean
  userRegistration: boolean
  affiliateTracking: boolean
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  googleAnalytics: string
  facebookPixel: string
  customCss: string
  customJs: string

  // ✉️ Mail ayarları
  emailHost: string
  emailPort: string
  emailUseTls: boolean
  emailUseSsl: boolean
  emailUser: string
  emailPassword: string
  defaultFromEmail: string
}

// Tab id tipi
type TabId =
  | 'general'
  | 'appearance'
  | 'seo'
  | 'notifications'
  | 'email'
  | 'integrations'
  | 'advanced'

interface Tab {
  id: TabId
  label: string
  icon: typeof Settings
}

// Backend’ten dönebilecek settings grup tipi
interface SettingsGroup {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | { value?: string | number | boolean | null }
}

interface DjangoSettingsResponse {
  general?: SettingsGroup
  appearance?: SettingsGroup
  seo?: SettingsGroup
  notifications?: SettingsGroup
  integrations?: SettingsGroup
  advanced?: SettingsGroup
  email?: SettingsGroup
}

interface SettingsApiResponse {
  success: boolean
  data?: DjangoSettingsResponse
  error?: string
}

interface TestEmailApiResponse {
  success?: boolean
  error?: string
  detail?: string
  message?: string
  data?: unknown
}

// Session.user için minimal tip (any yerine)
interface SessionUser {
  id?: string
  role?: string
  email?: string | null
  name?: string | null
  [key: string]: unknown
}

/* ---------- Helpers ---------- */

// Django media base URL (dev/prod için env'den de gelebilir)
const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_DJANGO_MEDIA_URL ?? 'http://localhost:8000'

const resolveMediaUrl = (path?: string) => {
  if (!path || typeof path !== 'string') return ''
  return path.startsWith('/media/') ? `${MEDIA_BASE_URL}${path}` : path
}

/**
 * Backend’ten gelen settings object’inde
 * hem `{ key: "val" }` hem `{ key: { value: "val" } }` formatlarını normalize eder
 */
const getVal = (
  group: SettingsGroup | undefined,
  key: string,
  fallback: string
): string => {
  if (!group) return fallback
  const raw = group[key]
  if (raw === null || raw === undefined) return fallback

  if (typeof raw === 'object' && 'value' in raw) {
    const v = (raw as { value?: unknown }).value
    return v !== null && v !== undefined ? String(v) : fallback
  }

  return String(raw)
}

/* ---------- Component ---------- */

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Donanım İnceleme Sitesi',
    siteDescription: 'En güncel donanım incelemeleri ve rehberleri',
    siteUrl: 'https://donaniminceleme.com',
    logo: '',
    favicon: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    emailNotifications: true,
    commentModeration: true,
    userRegistration: true,
    affiliateTracking: true,
    seoTitle: 'Donanım İnceleme Sitesi - En İyi Donanım Rehberleri',
    seoDescription:
      'Router, modem ve ağ donanımları hakkında detaylı incelemeler ve rehberler.',
    seoKeywords: 'donanım, router, modem, wifi, inceleme',
    googleAnalytics: '',
    facebookPixel: '',
    customCss: '',
    customJs: '',
    logoFile: null,
    faviconFile: null,

    // ✉️ Mail defaults
    emailHost: '',
    emailPort: '587',
    emailUseTls: true,
    emailUseSsl: false,
    emailUser: '',
    emailPassword: '',
    defaultFromEmail: '',
  })

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('general')

  // ✉️ Test mail state
  const [testEmail, setTestEmail] = useState('')
  const [testingEmail, setTestingEmail] = useState(false)

  // Auth & role guard – hook, return'dan önce
  useEffect(() => {
    if (status === 'loading') return

    const sessionUser = session?.user as SessionUser | undefined

    if (!sessionUser?.id) {
      router.push('/auth/signin')
      return
    }

    if (sessionUser.role !== 'SUPER_ADMIN') {
      router.push('/admin')
    }
  }, [session, status, router])

  // Settings fetch
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        const json = (await response.json()) as SettingsApiResponse

        if (!json.success || !json.data) {
          // Hata varsa sessiz geçiyoruz; console.log yeterli
          // eslint-disable-next-line no-console
          console.error('Settings API error:', json.error)
          return
        }

        const settingsData = json.data

        setSettings(prev => ({
          ...prev,
          siteName: getVal(settingsData.general, 'site_name', 'Hardware Review'),
          siteDescription: getVal(
            settingsData.general,
            'site_description',
            'Donanım incelemeleri, karşılaştırmaları ve rehberleri ile en doğru seçimi yapın.'
          ),
          siteUrl: getVal(
            settingsData.general,
            'site_url',
            'https://donaniminceleme.com'
          ),
          logo: getVal(settingsData.general, 'logo', ''),
          favicon: getVal(settingsData.general, 'favicon', ''),
          primaryColor: getVal(
            settingsData.appearance,
            'primary_color',
            '#3b82f6'
          ),
          secondaryColor: getVal(
            settingsData.appearance,
            'secondary_color',
            '#64748b'
          ),
          emailNotifications:
            getVal(settingsData.notifications, 'email_notifications', 'true') ===
            'true',
          commentModeration:
            getVal(settingsData.notifications, 'comment_moderation', 'true') ===
            'true',
          userRegistration:
            getVal(settingsData.general, 'user_registration', 'true') === 'true',
          affiliateTracking:
            getVal(settingsData.general, 'affiliate_tracking', 'true') === 'true',
          seoTitle: getVal(
            settingsData.seo,
            'seo_title',
            'Hardware Review - En İyi Donanım Rehberleri'
          ),
          seoDescription: getVal(
            settingsData.seo,
            'seo_description',
            'Router, modem ve ağ donanımları hakkında detaylı incelemeler ve rehberler.'
          ),
          seoKeywords: getVal(
            settingsData.seo,
            'seo_keywords',
            'donanım, router, modem, wifi, inceleme'
          ),
          googleAnalytics: getVal(
            settingsData.integrations,
            'google_analytics',
            ''
          ),
          facebookPixel: getVal(
            settingsData.integrations,
            'facebook_pixel',
            ''
          ),
          customCss: getVal(settingsData.advanced, 'custom_css', ''),
          customJs: getVal(settingsData.advanced, 'custom_js', ''),
          logoFile: null,
          faviconFile: null,

          // ✉️ Mail grubu
          emailHost: getVal(settingsData.email, 'host', ''),
          emailPort: String(getVal(settingsData.email, 'port', '587')),
          emailUseTls:
            getVal(settingsData.email, 'use_tls', 'true').toString() === 'true',
          emailUseSsl:
            getVal(settingsData.email, 'use_ssl', 'false').toString() === 'true',
          emailUser: getVal(settingsData.email, 'host_user', ''),
          // Şifreyi API dönmese de biz boş bırakıyoruz
          emailPassword: '',
          defaultFromEmail: getVal(
            settingsData.email,
            'default_from_email',
            ''
          ),
        }))
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching settings:', error)
      }
    }

    void fetchSettings()
  }, [])

  const updateSetting = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const formData = new FormData()

      const settingsData = {
        general: {
          site_name: settings.siteName,
          site_description: settings.siteDescription,
          user_registration: settings.userRegistration.toString(),
          affiliate_tracking: settings.affiliateTracking.toString(),
          logo: settings.logoFile ? '' : settings.logo,
          favicon: settings.faviconFile ? '' : settings.favicon,
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
          email_notifications: settings.emailNotifications.toString(),
          comment_moderation: settings.commentModeration.toString(),
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
          use_tls: settings.emailUseTls.toString(),
          use_ssl: settings.emailUseSsl.toString(),
          host_user: settings.emailUser,
          host_password: settings.emailPassword,
          default_from_email: settings.defaultFromEmail,
        },
      }

      formData.append('settings', JSON.stringify(settingsData))

      if (settings.logoFile) {
        formData.append('logo_file', settings.logoFile)
      }
      if (settings.faviconFile) {
        formData.append('favicon_file', settings.faviconFile)
      }

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        body: formData,
      })

      const data = (await response.json()) as SettingsApiResponse

      if (data.success) {
        // eslint-disable-next-line no-alert
        alert(
          'Ayarlar başarıyla kaydedildi! (Test için önce kaydedin, sonra test butonunu kullanın.)'
        )
      } else {
        throw new Error(data.error || 'Ayarlar kaydedilemedi')
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving settings:', error)
      // eslint-disable-next-line no-alert
      alert('Ayarlar kaydedilirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // ✉️ Test mail handler
  const handleTestEmail = async () => {
    if (!testEmail) {
      // eslint-disable-next-line no-alert
      alert('Lütfen test için bir e-posta adresi girin.')
      return
    }

    setTestingEmail(true)
    try {
      const res = await fetch('/api/admin/email-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testEmail,
        }),
      })

      let data: TestEmailApiResponse | null = null
      try {
        data = (await res.json()) as TestEmailApiResponse
      } catch {
        data = null
      }

      if (res.ok && data?.success) {
        // eslint-disable-next-line no-alert
        alert('Test e-postası gönderildi. (Gelen kutunu kontrol et)')
      } else {
        const msg =
          data?.error ??
          data?.detail ??
          data?.message ??
          `HTTP ${res.status} hatası`
        // eslint-disable-next-line no-alert
        alert('Test e-postası gönderilemedi: ' + msg)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error testing email:', err)
      // eslint-disable-next-line no-alert
      alert('Test e-postası gönderilirken bir hata oluştu')
    } finally {
      setTestingEmail(false)
    }
  }

  // Hook’lardan SONRA durum kontrolü (rule-of-hooks için güvenli)
  const isLoading = status === 'loading'
  const sessionUser = session?.user as SessionUser | undefined
  const isNotSuperAdmin =
    !sessionUser || sessionUser.role !== 'SUPER_ADMIN'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Yetki kontrolü yapılıyor...</p>
        </div>
      </div>
    )
  }

  if (isNotSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Erişim Reddedildi
          </h1>
          <p className="text-muted-foreground mb-4">
            Bu sayfaya erişim yetkiniz bulunmuyor. Sadece Süper Admin erişebilir.
          </p>
        </div>
      </div>
    )
  }

  const tabs: Tab[] = [
    { id: 'general', label: 'Genel', icon: Settings },
    { id: 'appearance', label: 'Görünüm', icon: Palette },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'email', label: 'E-posta', icon: Mail },
    { id: 'integrations', label: 'Entegrasyonlar', icon: LinkIcon },
    { id: 'advanced', label: 'Gelişmiş', icon: Database },
  ]

  // Helper function to clear file inputs
  const clearFileInput = (inputType: 'logo' | 'favicon') => {
    const fileInputs =
      document.querySelectorAll<HTMLInputElement>('input[type="file"]')
    fileInputs.forEach(input => {
      if (inputType === 'logo' && input.accept.includes('image/*')) {
        // eslint-disable-next-line no-param-reassign
        input.value = ''
      }
      if (inputType === 'favicon' && input.accept.includes('image/x-icon')) {
        // eslint-disable-next-line no-param-reassign
        input.value = ''
      }
    })
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Site Ayarları</h1>
        <p className="text-muted-foreground">
          Site genelinde ayarları yönetin ve özelleştirin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {tabs.find(tab => tab.id === activeTab)?.label} Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Site Adı
                    </label>
                    <Input
                      value={settings.siteName}
                      onChange={e => updateSetting('siteName', e.target.value)}
                      placeholder="Site adını girin..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Header ve footer&apos;da görüntülenecek site adı
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Site Açıklaması
                    </label>
                    <Textarea
                      value={settings.siteDescription}
                      onChange={e =>
                        updateSetting('siteDescription', e.target.value)
                      }
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
                      onChange={e => updateSetting('siteUrl', e.target.value)}
                      placeholder="https://donanimpuani.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Logo
                      </label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0] ?? null
                            updateSetting('logoFile', file)
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
                                updateSetting('logo', '')
                                updateSetting('logoFile', null)
                                clearFileInput('logo')
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
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Favicon
                      </label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/x-icon,image/png,image/jpeg,image/gif"
                          onChange={e => {
                            const file = e.target.files?.[0] ?? null
                            updateSetting('faviconFile', file)
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
                                updateSetting('favicon', '')
                                updateSetting('faviconFile', null)
                                clearFileInput('favicon')
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

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="userRegistration"
                      checked={settings.userRegistration}
                      onChange={e =>
                        updateSetting('userRegistration', e.target.checked)
                      }
                    />
                    <label
                      htmlFor="userRegistration"
                      className="text-sm font-medium"
                    >
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
                      onChange={e =>
                        updateSetting('affiliateTracking', e.target.checked)
                      }
                    />
                    <label
                      htmlFor="affiliateTracking"
                      className="text-sm font-medium"
                    >
                      Affiliate takibi aktif
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Affiliate takibini yönetir
                  </p>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Ana Renk
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={settings.primaryColor}
                          onChange={e =>
                            updateSetting('primaryColor', e.target.value)
                          }
                          className="w-16 h-10"
                        />
                        <Input
                          value={settings.primaryColor}
                          onChange={e =>
                            updateSetting('primaryColor', e.target.value)
                          }
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
                          onChange={e =>
                            updateSetting('secondaryColor', e.target.value)
                          }
                          className="w-16 h-10"
                        />
                        <Input
                          value={settings.secondaryColor}
                          onChange={e =>
                            updateSetting('secondaryColor', e.target.value)
                          }
                          placeholder="#64748b"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Özel CSS
                    </label>
                    <Textarea
                      value={settings.customCss}
                      onChange={e => updateSetting('customCss', e.target.value)}
                      placeholder="/* Özel CSS kodlarınızı buraya yazın */"
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {/* SEO Settings */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      SEO Başlığı
                    </label>
                    <Input
                      value={settings.seoTitle}
                      onChange={e => updateSetting('seoTitle', e.target.value)}
                      placeholder="SEO başlığı (60 karakter önerilen)"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {settings.seoTitle.length}/60 karakter
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      SEO Açıklaması
                    </label>
                    <Textarea
                      value={settings.seoDescription}
                      onChange={e =>
                        updateSetting('seoDescription', e.target.value)
                      }
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
                      onChange={e =>
                        updateSetting('seoKeywords', e.target.value)
                      }
                      placeholder="donanım, router, modem, wifi, inceleme"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Virgülle ayırarak anahtar kelimeleri girin
                    </p>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={e =>
                        updateSetting('emailNotifications', e.target.checked)
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
                      onChange={e =>
                        updateSetting('commentModeration', e.target.checked)
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
              )}

              {/* ✉️ Email Settings */}
              {activeTab === 'email' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        SMTP Host
                      </label>
                      <Input
                        value={settings.emailHost}
                        onChange={e =>
                          updateSetting('emailHost', e.target.value)
                        }
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
                        onChange={e =>
                          updateSetting('emailPort', e.target.value)
                        }
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.emailUseTls}
                        onChange={e =>
                          updateSetting('emailUseTls', e.target.checked)
                        }
                      />
                      <span className="text-sm font-medium">TLS (STARTTLS)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.emailUseSsl}
                        onChange={e =>
                          updateSetting('emailUseSsl', e.target.checked)
                        }
                      />
                      <span className="text-sm font-medium">SSL (465)</span>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Genelde 587 + TLS veya 465 + SSL kullanılır. İkisini aynı anda
                    aktif yapmayın.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        SMTP Kullanıcı Adı
                      </label>
                      <Input
                        value={settings.emailUser}
                        onChange={e =>
                          updateSetting('emailUser', e.target.value)
                        }
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
                        onChange={e =>
                          updateSetting('emailPassword', e.target.value)
                        }
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Boş bırakırsanız backend mevcut şifreyi koruyabilir (o
                        şekilde implemente edebiliriz).
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Varsayılan Gönderen (From)
                    </label>
                    <Input
                      value={settings.defaultFromEmail}
                      onChange={e =>
                        updateSetting('defaultFromEmail', e.target.value)
                      }
                      placeholder='Donanım Puanı <info@...>'
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
                        onChange={e => setTestEmail(e.target.value)}
                        placeholder="ornek@mail.com"
                        className="md:flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestEmail}
                        disabled={testingEmail || !testEmail}
                      >
                        {testingEmail ? 'Test gönderiliyor...' : 'Test mail gönder'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations Settings */}
              {activeTab === 'integrations' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Google Analytics ID
                    </label>
                    <Input
                      value={settings.googleAnalytics}
                      onChange={e =>
                        updateSetting('googleAnalytics', e.target.value)
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
                      onChange={e =>
                        updateSetting('facebookPixel', e.target.value)
                      }
                      placeholder="123456789012345"
                    />
                  </div>
                </div>
              )}

              {/* Advanced Settings */}
              {activeTab === 'advanced' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Özel JavaScript
                    </label>
                    <Textarea
                      value={settings.customJs}
                      onChange={e => updateSetting('customJs', e.target.value)}
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
                      Gelişmiş ayarları değiştirirken dikkatli olun. Yanlış kodlar
                      site işlevselliğini bozabilir.
                    </p>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t">
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
