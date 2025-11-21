'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, XCircle } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const { settings, loading } = useSettings()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Check if user registration is allowed
  useEffect(() => {
    if (!loading && settings) {
      const userRegistrationAllowed = settings.user_registration?.value === 'true'
      if (!userRegistrationAllowed) {
        router.push('/')
      }
    }
  }, [settings, loading, router])

  // Show loading while checking settings
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Show error if registration is disabled
  if (settings && settings.user_registration?.value !== 'true') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Kayıt Kapalı</h2>
                <p className="text-muted-foreground mb-6">
                  Şu anda yeni üye kaydı kabul edilmemektedir. Daha sonra tekrar deneyiniz.
                </p>
                <Button asChild className="w-full">
                  <Link href="/">
                    Ana Sayfaya Dön
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Basit validasyon
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        // 2 saniye sonra ana sayfaya yönlendir
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        setError(result.error || 'Kayıt sırasında bir hata oluştu.')
      }
    } catch (error) {
      setError('Kayıt sırasında bir hata oluştu.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Kayıt Başarılı!</h2>
                <p className="text-muted-foreground mb-6">
                  Hesabınız başarıyla oluşturuldu. E-posta adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirin.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Doğrulama E-postası Gönderildi
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">
                        E-posta kutunuzu kontrol edin ve spam klasörünü de kontrol etmeyi unutmayın.
                      </p>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/auth/signin">
                    Giriş Yap
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Üye Ol</h1>
          <p className="text-muted-foreground">
            Ücretsiz hesap oluşturun ve tüm özelliklerden yararlanın
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Hesap Oluşturun</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Ad Soyad
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Adınız ve soyadınız"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="En az 6 karakter"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Şifrenizi tekrar girin"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Kayıt oluşturuluyor...' : 'Üye Ol'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Zaten hesabınız var mı?{' '}
                <Link href="/auth/signin" className="text-primary hover:underline">
                  Giriş yapın
                </Link>
              </p>
            </div>

            <div className="mt-6 text-xs text-muted-foreground text-center">
              Üye olarak{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Kullanım Şartları
              </Link>{' '}
              ve{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Gizlilik Politikası
              </Link>{' '}
              'nı kabul etmiş olursunuz.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
