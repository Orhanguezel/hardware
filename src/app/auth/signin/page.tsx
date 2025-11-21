'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, Key } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetStep, setResetStep] = useState(1) // 1: email, 2: code, 3: new password
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Giriş bilgileri hatalı. Lütfen kontrol edin.')
      } else if (result?.ok) {
        // Başarılı giriş - ana sayfaya yönlendir
        window.location.href = '/'
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('http://localhost:8000/api/auth/request-password-reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        setResetStep(2)
      } else {
        setError(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('http://localhost:8000/api/auth/verify-reset-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: resetCode }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        setResetStep(3)
      } else {
        setError(data.error || 'Geçersiz kod')
      }
    } catch (error) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          code: resetCode, 
          new_password: newPassword, 
          confirm_password: confirmPassword 
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        // Reset form and go back to login
        setTimeout(() => {
          setShowForgotPassword(false)
          setResetStep(1)
          setEmail('')
          setResetCode('')
          setNewPassword('')
          setConfirmPassword('')
          setMessage('')
        }, 3000)
      } else {
        setError(data.error || 'Şifre sıfırlama başarısız')
      }
    } catch (error) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForgotPassword = () => {
    setShowForgotPassword(false)
    setResetStep(1)
    setEmail('')
    setResetCode('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setMessage('')
  }

  const testAccounts = [
    { email: 'admin@gmail.com', password: 'T123456*', role: 'Admin' },
    { email: 'editor@gmail.com', password: 'T123456*', role: 'Editor' },
    { email: 'super-admin@gmail.com', password: 'T123456*', role: 'SUPER_ADMIN' }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Giriş Yap</h1>
          <p className="text-muted-foreground">
            Hesabınıza giriş yaparak tüm özelliklerden yararlanın
          </p>
        </div>

        {!showForgotPassword ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Hesabınıza Giriş Yapın</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Şifrenizi girin"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {error && (
                  <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Hesabınız yok mu?{' '}
                  <Link href="/auth/signup" className="text-primary hover:underline">
                    Üye olun
                  </Link>
                </p>
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Şifremi unuttum
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center gap-2">
                <Key className="w-5 h-5" />
                {resetStep === 1 && 'Şifre Sıfırlama'}
                {resetStep === 2 && 'Doğrulama Kodu'}
                {resetStep === 3 && 'Yeni Şifre'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resetStep === 1 && (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    E-posta adresinizi girin, size şifre sıfırlama kodu gönderelim.
                  </p>
                  
                  <div className="space-y-2">
                    <label htmlFor="reset-email" className="text-sm font-medium">
                      E-posta
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="ornek@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded">
                      {error}
                    </div>
                  )}

                  {message && (
                    <div className="text-green-600 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded">
                      {message}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Gönderiliyor...' : 'Kod Gönder'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              )}

              {resetStep === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {email} adresine gönderilen 6 haneli kodu girin.
                  </p>
                  
                  <div className="space-y-2">
                    <label htmlFor="reset-code" className="text-sm font-medium">
                      Doğrulama Kodu
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-code"
                        type="text"
                        placeholder="123456"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="pl-10 text-center text-lg tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded">
                      {error}
                    </div>
                  )}

                  {message && (
                    <div className="text-green-600 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded">
                      {message}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading || resetCode.length !== 6}>
                    {isLoading ? 'Doğrulanıyor...' : 'Kodu Doğrula'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              )}

              {resetStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Yeni şifrenizi belirleyin.
                  </p>
                  
                  <div className="space-y-2">
                    <label htmlFor="new-password" className="text-sm font-medium">
                      Yeni Şifre
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Yeni şifrenizi girin"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-sm font-medium">
                      Şifre Tekrar
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Şifrenizi tekrar girin"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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

                  {message && (
                    <div className="text-green-600 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded">
                      {message}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={resetForgotPassword}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Giriş sayfasına dön
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Accounts */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-center text-lg">Test Hesapları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testAccounts.map((account, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{account.role}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEmail(account.email)
                        setPassword(account.password)
                      }}
                    >
                      Kullan
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Email: {account.email}</div>
                    <div>Şifre: {account.password}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
