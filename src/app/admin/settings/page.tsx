'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Settings, 
  Globe, 
  Mail, 
  Shield,
  Palette,
  Database,
  Bell,
  Search,
  Link as LinkIcon,
  Trash2
} from 'lucide-react'

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  logo: string
  favicon: string
  logoFile?: File
  faviconFile?: File
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
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Check if user is SUPER_ADMIN
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'SUPER_ADMIN') {
      router.push('/admin')
      return
    }
  }, [session, status, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Yetki kontrolü yapılıyor...</p>
        </div>
      </div>
    )
  }

  // Redirect if not SUPER_ADMIN
  if (!session || (session.user as any)?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erişim Reddedildi</h1>
          <p className="text-muted-foreground mb-4">
            Bu sayfaya erişim yetkiniz bulunmuyor. Sadece Süper Admin erişebilir.
          </p>
        </div>
      </div>
    )
  }

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
    seoDescription: 'Router, modem ve ağ donanımları hakkında detaylı incelemeler ve rehberler.',
    seoKeywords: 'donanım, router, modem, wifi, inceleme',
    googleAnalytics: '',
    facebookPixel: '',
    customCss: '',
    customJs: ''
  })

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  // Helper function to clear file inputs
  const clearFileInput = (inputType: 'logo' | 'favicon') => {
    const fileInputs = document.querySelectorAll('input[type="file"]')
    fileInputs.forEach((input: any) => {
      if ((inputType === 'logo' && input.accept.includes('image/*')) ||
          (inputType === 'favicon' && input.accept.includes('image/x-icon'))) {
        input.value = ''
      }
    })
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      
      if (data.success && data.data) {
        const settingsData = data.data
        
        // Map Django settings to frontend format
        console.log('Settings data from API:', settingsData)
        console.log('General data:', settingsData.general)
        console.log('Site name data:', settingsData.general?.site_name)
        
        setSettings({
          siteName: settingsData.general?.site_name?.value || settingsData.general?.site_name || 'Hardware Review',
          siteDescription: settingsData.general?.site_description?.value || settingsData.general?.site_description || 'Donanım incelemeleri, karşılaştırmaları ve rehberleri ile en doğru seçimi yapın.',
          siteUrl: settingsData.general?.site_url?.value || settingsData.general?.site_url || 'https://donaniminceleme.com',
          logo: settingsData.general?.logo?.value || settingsData.general?.logo || '',
          favicon: settingsData.general?.favicon?.value || settingsData.general?.favicon || '',
          primaryColor: settingsData.appearance?.primary_color?.value || settingsData.appearance?.primary_color || '#3b82f6',
          secondaryColor: settingsData.appearance?.secondary_color?.value || settingsData.appearance?.secondary_color || '#64748b',
          emailNotifications: (settingsData.notifications?.email_notifications?.value || settingsData.notifications?.email_notifications) === 'true',
          commentModeration: (settingsData.notifications?.comment_moderation?.value || settingsData.notifications?.comment_moderation) === 'true',
          userRegistration: (settingsData.general?.user_registration?.value || settingsData.general?.user_registration) === 'true',
          affiliateTracking: (settingsData.general?.affiliate_tracking?.value || settingsData.general?.affiliate_tracking) === 'true',
          seoTitle: settingsData.seo?.seo_title?.value || settingsData.seo?.seo_title || 'Hardware Review - En İyi Donanım Rehberleri',
          seoDescription: settingsData.seo?.seo_description?.value || settingsData.seo?.seo_description || 'Router, modem ve ağ donanımları hakkında detaylı incelemeler ve rehberler.',
          seoKeywords: settingsData.seo?.seo_keywords?.value || settingsData.seo?.seo_keywords || 'donanım, router, modem, wifi, inceleme',
          googleAnalytics: settingsData.integrations?.google_analytics?.value || settingsData.integrations?.google_analytics || '',
          facebookPixel: settingsData.integrations?.facebook_pixel?.value || settingsData.integrations?.facebook_pixel || '',
          customCss: settingsData.advanced?.custom_css?.value || settingsData.advanced?.custom_css || '',
          customJs: settingsData.advanced?.custom_js?.value || settingsData.advanced?.custom_js || ''
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const updateSetting = (key: keyof SiteSettings, value: any) => {
    console.log(`Updating setting ${key} with value:`, value, typeof value)
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Create FormData for file uploads
      const formData = new FormData()
      
      // Transform frontend settings to Django format
      const settingsData = {
        general: {
          site_name: settings.siteName,
          site_description: settings.siteDescription,
          user_registration: settings.userRegistration.toString(),
          affiliate_tracking: settings.affiliateTracking.toString()
        },
        appearance: {
          primary_color: settings.primaryColor,
          secondary_color: settings.secondaryColor,
          custom_css: settings.customCss
        },
        seo: {
          seo_title: settings.seoTitle,
          seo_description: settings.seoDescription,
          seo_keywords: settings.seoKeywords
        },
        notifications: {
          email_notifications: settings.emailNotifications.toString(),
          comment_moderation: settings.commentModeration.toString()
        },
        integrations: {
          google_analytics: settings.googleAnalytics,
          facebook_pixel: settings.facebookPixel
        },
        advanced: {
          custom_js: settings.customJs
        }
      }

      // Add logo and favicon to general settings if no file is being uploaded
      if (!settings.logoFile) {
        settingsData.general.logo = settings.logo
      } else {
        settingsData.general.logo = '' // Will be set by backend after file upload
      }
      
      if (!settings.faviconFile) {
        settingsData.general.favicon = settings.favicon
      } else {
        settingsData.general.favicon = '' // Will be set by backend after file upload
      }

      // Add settings data to FormData
      formData.append('settings', JSON.stringify(settingsData))
      
      // Add file uploads if they exist
      if (settings.logoFile) {
        formData.append('logo_file', settings.logoFile)
      }
      if (settings.faviconFile) {
        formData.append('favicon_file', settings.faviconFile)
      }

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        body: formData // Don't set Content-Type header, let browser set it for FormData
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Ayarlar başarıyla kaydedildi!')
        // Refresh settings to get updated file URLs
        fetchSettings()
      } else {
        throw new Error(data.error || 'Ayarlar kaydedilemedi')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Ayarlar kaydedilirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'Genel', icon: Settings },
    { id: 'appearance', label: 'Görünüm', icon: Palette },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'integrations', label: 'Entegrasyonlar', icon: LinkIcon },
    { id: 'advanced', label: 'Gelişmiş', icon: Database }
  ]

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
                {tabs.map((tab) => {
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
                    <label className="text-sm font-medium mb-2 block">Site Adı</label>
                    <Input
                      value={typeof settings.siteName === 'string' ? settings.siteName : ''}
                      onChange={(e) => updateSetting('siteName', e.target.value)}
                      placeholder="Site adını girin..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Header ve footer'da görüntülenecek site adı
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Site Açıklaması</label>
                    <Textarea
                      value={typeof settings.siteDescription === 'string' ? settings.siteDescription : ''}
                      onChange={(e) => updateSetting('siteDescription', e.target.value)}
                      placeholder="Site açıklamasını girin..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Footer'da görüntülenecek site açıklaması
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Logo</label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              updateSetting('logoFile', file)
                            }
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                        {settings.logo && typeof settings.logo === 'string' && (
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center space-x-2">
                              <img 
                                src={settings.logo.startsWith('/media/') ? `http://localhost:8000${settings.logo}` : settings.logo} 
                                alt="Current logo" 
                                className="w-8 h-8 object-contain"
                              />
                              <span className="text-xs text-muted-foreground">Mevcut logo</span>
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
                        Header ve footer'daki mavi karenin yerine geçecek logo
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Favicon</label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/x-icon,image/png,image/jpeg,image/gif"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              updateSetting('faviconFile', file)
                            }
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                        {settings.favicon && typeof settings.favicon === 'string' && (
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center space-x-2">
                              <img 
                                src={settings.favicon.startsWith('/media/') ? `http://localhost:8000${settings.favicon}` : settings.favicon} 
                                alt="Current favicon" 
                                className="w-4 h-4 object-contain"
                              />
                              <span className="text-xs text-muted-foreground">Mevcut favicon</span>
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
                        Sitenin favicon'u (.ico, .png, .jpg)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="userRegistration"
                      checked={settings.userRegistration}
                      onChange={(e) => updateSetting('userRegistration', e.target.checked)}
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
                      onChange={(e) => updateSetting('affiliateTracking', e.target.checked)}
                    />
                    <label htmlFor="affiliateTracking" className="text-sm font-medium">
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
                      <label className="text-sm font-medium mb-2 block">Ana Renk</label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={typeof settings.primaryColor === 'string' ? settings.primaryColor : '#3b82f6'}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          value={typeof settings.primaryColor === 'string' ? settings.primaryColor : '#3b82f6'}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">İkincil Renk</label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={typeof settings.secondaryColor === 'string' ? settings.secondaryColor : '#64748b'}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          value={typeof settings.secondaryColor === 'string' ? settings.secondaryColor : '#64748b'}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          placeholder="#64748b"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Özel CSS</label>
                    <Textarea
                      value={typeof settings.customCss === 'string' ? settings.customCss : ''}
                      onChange={(e) => updateSetting('customCss', e.target.value)}
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
                    <label className="text-sm font-medium mb-2 block">SEO Başlığı</label>
                    <Input
                      value={typeof settings.seoTitle === 'string' ? settings.seoTitle : ''}
                      onChange={(e) => updateSetting('seoTitle', e.target.value)}
                      placeholder="SEO başlığı (60 karakter önerilen)"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {typeof settings.seoTitle === 'string' ? settings.seoTitle.length : 0}/60 karakter
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">SEO Açıklaması</label>
                    <Textarea
                      value={typeof settings.seoDescription === 'string' ? settings.seoDescription : ''}
                      onChange={(e) => updateSetting('seoDescription', e.target.value)}
                      placeholder="SEO açıklaması (160 karakter önerilen)"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {typeof settings.seoDescription === 'string' ? settings.seoDescription.length : 0}/160 karakter
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Anahtar Kelimeler</label>
                    <Input
                      value={typeof settings.seoKeywords === 'string' ? settings.seoKeywords : ''}
                      onChange={(e) => updateSetting('seoKeywords', e.target.value)}
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
                      onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                    />
                    <label htmlFor="emailNotifications" className="text-sm font-medium">
                      Email bildirimleri aktif
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="commentModeration"
                      checked={settings.commentModeration}
                      onChange={(e) => updateSetting('commentModeration', e.target.checked)}
                    />
                    <label htmlFor="commentModeration" className="text-sm font-medium">
                      Yorum moderasyonu aktif
                    </label>
                  </div>
                </div>
              )}

              {/* Integrations Settings */}
              {activeTab === 'integrations' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Google Analytics ID</label>
                    <Input
                      value={typeof settings.googleAnalytics === 'string' ? settings.googleAnalytics : ''}
                      onChange={(e) => updateSetting('googleAnalytics', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Facebook Pixel ID</label>
                    <Input
                      value={typeof settings.facebookPixel === 'string' ? settings.facebookPixel : ''}
                      onChange={(e) => updateSetting('facebookPixel', e.target.value)}
                      placeholder="123456789012345"
                    />
                  </div>
                </div>
              )}

              {/* Advanced Settings */}
              {activeTab === 'advanced' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Özel JavaScript</label>
                    <Textarea
                      value={typeof settings.customJs === 'string' ? settings.customJs : ''}
                      onChange={(e) => updateSetting('customJs', e.target.value)}
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
                      Gelişmiş ayarları değiştirirken dikkatli olun. Yanlış kodlar site işlevselliğini bozabilir.
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
