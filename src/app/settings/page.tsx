'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  Lock, 
  Bell, 
  Shield, 
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

interface UserSettings {
  name: string
  email: string
  bio?: string
  avatar?: string
  emailNotifications: boolean
  pushNotifications: boolean
  publicProfile: boolean
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    emailNotifications: true,
    pushNotifications: true,
    publicProfile: false
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Kullanıcı ayarlarını yükle
    loadUserSettings()
  }, [session, status, router])

  const loadUserSettings = async () => {
    try {
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Error loading user settings:', error)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success('Ayarlar başarıyla kaydedildi')
      } else {
        toast.error('Ayarlar kaydedilirken hata oluştu')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Ayarlar kaydedilirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      })

      if (response.ok) {
        toast.success('Şifre başarıyla değiştirildi')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Şifre değiştirilirken hata oluştu')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Şifre değiştirilirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ayarlar</h1>
        <p className="text-muted-foreground">
          Hesap ayarlarınızı ve tercihlerinizi yönetin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profil Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="Adınızı girin"
              />
            </div>

            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="E-posta adresinizi girin"
              />
            </div>

            <div>
              <Label htmlFor="bio">Hakkımda</Label>
              <Textarea
                id="bio"
                value={settings.bio}
                onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                placeholder="Kendiniz hakkında kısa bir açıklama yazın"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="avatar">Profil Resmi URL</Label>
              <Input
                id="avatar"
                value={settings.avatar}
                onChange={(e) => setSettings({ ...settings, avatar: e.target.value })}
                placeholder="Profil resmi URL'si"
              />
            </div>

            <Button onClick={handleSaveSettings} disabled={loading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Profil Bilgilerini Kaydet
            </Button>
          </CardContent>
        </Card>

        {/* Bildirim Ayarları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Bildirim Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">E-posta Bildirimleri</Label>
                <p className="text-sm text-muted-foreground">
                  Yeni makaleler ve güncellemeler için e-posta alın
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Anlık Bildirimler</Label>
                <p className="text-sm text-muted-foreground">
                  Tarayıcı bildirimlerini etkinleştirin
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, pushNotifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="public-profile">Herkese Açık Profil</Label>
                <p className="text-sm text-muted-foreground">
                  Profilinizi diğer kullanıcılara gösterin
                </p>
              </div>
              <Switch
                id="public-profile"
                checked={settings.publicProfile}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, publicProfile: checked })
                }
              />
            </div>

            <Button onClick={handleSaveSettings} disabled={loading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Bildirim Ayarlarını Kaydet
            </Button>
          </CardContent>
        </Card>

        {/* Şifre Değiştirme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Şifre Değiştir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="current-password">Mevcut Şifre</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
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

            <div>
              <Label htmlFor="new-password">Yeni Şifre</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Yeni şifrenizi girin"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Yeni Şifre Tekrar</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Yeni şifrenizi tekrar girin"
              />
            </div>

            <Button onClick={handlePasswordChange} disabled={loading} className="w-full">
              <Lock className="w-4 h-4 mr-2" />
              Şifreyi Değiştir
            </Button>
          </CardContent>
        </Card>

        {/* Hesap Güvenliği */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Hesap Güvenliği
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Hesap Durumu</h4>
              <p className="text-sm text-muted-foreground mb-2">
                E-posta: {session.user?.email}
              </p>
              <p className="text-sm text-muted-foreground">
                Rol: {session.user?.role || 'Kullanıcı'}
              </p>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                E-posta Doğrulama Gönder
              </Button>
              
              <Button variant="outline" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                İki Faktörlü Doğrulama
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
