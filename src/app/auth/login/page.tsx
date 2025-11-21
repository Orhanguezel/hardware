'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setEmailVerificationRequired(false);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Ana sayfaya yönlendir
        router.push('/');
      } else {
        if (data.email_verification_required) {
          setEmailVerificationRequired(true);
          setUserEmail(data.email);
          setError('E-posta adresiniz doğrulanmamış. Lütfen e-posta kutunuzu kontrol edin ve doğrulama linkine tıklayın.');
        } else {
          setError(data.error || 'Giriş bilgileri hatalı. Lütfen kontrol edin.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/auth/resend-verification/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setError('Doğrulama e-postası tekrar gönderildi. Lütfen e-posta kutunuzu kontrol edin.');
      } else {
        setError(data.error || 'E-posta gönderilemedi.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError('E-posta gönderilemedi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 rounded bg-primary"></div>
            <span className="text-2xl font-bold">Donanım Puanı</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Giriş Yap</h1>
          <p className="text-muted-foreground">
            Hesabınıza giriş yaparak tüm özelliklerden yararlanın
          </p>
        </div>

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
                <Alert className={emailVerificationRequired ? "border-orange-200 bg-orange-50" : "border-red-200 bg-red-50"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className={emailVerificationRequired ? "text-orange-800" : "text-red-800"}>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {emailVerificationRequired && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    E-posta adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirin.
                  </p>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={resendVerificationEmail}
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Doğrulama E-postasını Tekrar Gönder
                  </Button>
                  <div className="text-center">
                    <Link 
                      href="/verify-email" 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Doğrulama sayfasına git
                    </Link>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Hesabınız yok mu?{' '}
                <Link href="/auth/signup" className="text-primary hover:underline">
                  Üye olun
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
