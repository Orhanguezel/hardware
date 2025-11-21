'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Save,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  X,
  Camera,
  Settings as SettingsIcon,
  Lock,
  Globe
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserSettings {
  name: string
  email: string
  bio?: string
  avatar?: string
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  profile_visible: boolean
  email_visible: boolean
}

export default function DashboardSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    profile_visible: true,
    email_visible: false
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchUserSettings()
  }, [session, status, router])

  const fetchUserSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/settings')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Django API'den gelen veriyi frontend formatına çevir
          const djangoSettings = data.data
          setSettings(prev => ({
            ...prev,
            name: djangoSettings.name || session?.user?.name || '',
            email: djangoSettings.email || session?.user?.email || '',
            bio: djangoSettings.bio || '',
            avatar: djangoSettings.avatar || '',
            email_notifications: djangoSettings.email_notifications !== undefined ? djangoSettings.email_notifications : true,
            push_notifications: djangoSettings.push_notifications !== undefined ? djangoSettings.push_notifications : true,
            marketing_emails: djangoSettings.marketing_emails !== undefined ? djangoSettings.marketing_emails : false,
            profile_visible: djangoSettings.profile_visible !== undefined ? djangoSettings.profile_visible : true,
            email_visible: djangoSettings.email_visible !== undefined ? djangoSettings.email_visible : false
          }))
        }
      } else {
        // Fallback to session data
        setSettings(prev => ({
          ...prev,
          name: session?.user?.name || '',
          email: session?.user?.email || ''
        }))
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
      // Fallback to session data
      setSettings(prev => ({
        ...prev,
        name: session?.user?.name || '',
        email: session?.user?.email || ''
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNotificationChange = (key: keyof Pick<UserSettings, 'email_notifications' | 'push_notifications' | 'marketing_emails'>, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handlePrivacyChange = (key: keyof Pick<UserSettings, 'profile_visible' | 'email_visible'>, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview('')
    setSettings(prev => ({
      ...prev,
      avatar: ''
    }))
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      
      // FormData oluştur
      const formData = new FormData()
      formData.append('name', settings.name)
      formData.append('email', settings.email)
      formData.append('bio', settings.bio || '')
      formData.append('email_notifications', String(settings.email_notifications))
      formData.append('push_notifications', String(settings.push_notifications))
      formData.append('marketing_emails', String(settings.marketing_emails))
      formData.append('profile_visible', String(settings.profile_visible))
      formData.append('email_visible', String(settings.email_visible))
      formData.append('theme', 'light')
      formData.append('language', 'tr')
      
      // Avatar dosyası varsa ekle
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }
      
      // Avatar kaldırma işlemi
      if (!settings.avatar && !avatarFile) {
        formData.append('remove_avatar', 'true')
      }
      
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Ayarlar başarıyla kaydedildi')
        // Avatar preview'ı temizle
        setAvatarFile(null)
        setAvatarPreview('')
        // Ayarları yeniden yükle
        await fetchUserSettings()
      } else {
        toast.error(data.error || 'Ayarlar kaydedilirken hata oluştu')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Ayarlar kaydedilirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır')
      return
    }

    try {
      setSaving(true)
      
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Şifre başarıyla değiştirildi')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(data.error || 'Şifre değiştirilirken hata oluştu')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Şifre değiştirilirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Ayarlar yükleniyor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Hesap Ayarları</h1>
            <p className="text-muted-foreground">
              Profil bilgilerinizi ve tercihlerinizi yönetin
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-500" />
                Profil Bilgileri
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Kişisel bilgilerinizi güncelleyin
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    name="name"
                    value={settings.name}
                    onChange={handleInputChange}
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={settings.email}
                    onChange={handleInputChange}
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Hakkımda</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={settings.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Kendiniz hakkında kısa bir açıklama..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="avatar">Profil Resmi</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : settings.avatar ? (
                      <img src={`http://localhost:8000${settings.avatar}`} alt="Current avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <Input
                        id="avatar"
                        name="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                      />
                      {(settings.avatar || avatarPreview) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveAvatar}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Kaldır
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG veya GIF formatında, maksimum 5MB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-500" />
                Şifre Değiştir
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Hesap güvenliğiniz için şifrenizi güncelleyin
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Mevcut şifrenizi girin"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Yeni şifrenizi girin"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Yeni şifrenizi tekrar girin"
                  />
                </div>
              </div>

              <Button onClick={handleChangePassword} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Değiştiriliyor...
                  </>
                ) : (
                  'Şifreyi Değiştir'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                Bildirim Tercihleri
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Hangi bildirimleri almak istediğinizi seçin
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>E-posta Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Önemli güncellemeler için e-posta al
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Tarayıcı bildirimlerini al
                  </p>
                </div>
                <Switch
                  checked={settings.push_notifications}
                  onCheckedChange={(checked) => handleNotificationChange('push_notifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Pazarlama E-postaları</Label>
                  <p className="text-sm text-muted-foreground">
                    Özel teklifler ve güncellemeler için e-posta al
                  </p>
                </div>
                <Switch
                  checked={settings.marketing_emails}
                  onCheckedChange={(checked) => handleNotificationChange('marketing_emails', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Gizlilik Ayarları
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Profil ve e-posta görünürlüğünüzü kontrol edin
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Profil Görünürlüğü</Label>
                  <p className="text-sm text-muted-foreground">
                    Profilinizi diğer kullanıcılara göster
                  </p>
                </div>
                <Switch
                  checked={settings.profile_visible}
                  onCheckedChange={(checked) => handlePrivacyChange('profile_visible', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>E-posta Görünürlüğü</Label>
                  <p className="text-sm text-muted-foreground">
                    E-posta adresinizi diğer kullanıcılara göster
                  </p>
                </div>
                <Switch
                  checked={settings.email_visible}
                  onCheckedChange={(checked) => handlePrivacyChange('email_visible', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Ayarları Kaydet
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Hesap Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">ID: {(session?.user as any)?.id || 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{session?.user?.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Rol: {(session?.user as any)?.role || 'USER'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard">
                  Dashboard'a Dön
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/favorites">
                  Favorilerim
                </Link>
              </Button>
              {(session?.user as any)?.role === 'ADMIN' && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin">
                    Admin Panel
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
