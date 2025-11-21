'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Geçersiz doğrulama linki');
      return;
    }

    verifyEmail(token, email);
  }, [searchParams]);

  const verifyEmail = async (token: string, email: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/verify-email/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setUser(data.user);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        if (data.error.includes('süresi dolmuş')) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
        setMessage(data.error);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Doğrulama sırasında bir hata oluştu');
    }
  };

  const resendVerification = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/resend-verification/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Doğrulama e-postası tekrar gönderildi');
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error('Resend error:', error);
      setMessage('E-posta gönderilemedi');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            E-posta Doğrulama
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {status === 'loading' && 'Doğrulanıyor...'}
              {status === 'success' && 'Doğrulama Başarılı!'}
              {status === 'error' && 'Doğrulama Hatası'}
              {status === 'expired' && 'Link Süresi Dolmuş'}
            </CardTitle>
            <CardDescription className="text-center">
              {status === 'loading' && 'E-posta adresiniz doğrulanıyor, lütfen bekleyin...'}
              {status === 'success' && 'E-posta adresiniz başarıyla doğrulandı'}
              {status === 'error' && 'Doğrulama işlemi başarısız oldu'}
              {status === 'expired' && 'Doğrulama linkinin süresi dolmuş'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'loading' && (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}

            {status === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {(status === 'error' || status === 'expired') && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {status === 'success' && (
              <div className="text-center text-sm text-gray-600">
                <p>3 saniye sonra giriş sayfasına yönlendirileceksiniz...</p>
              </div>
            )}

            {status === 'expired' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Doğrulama linkinin süresi dolmuş. Yeni bir doğrulama e-postası gönderebilirsiniz.
                </p>
                <Button 
                  onClick={resendVerification}
                  className="w-full"
                  variant="outline"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Yeni Doğrulama E-postası Gönder
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Doğrulama işlemi başarısız oldu. Lütfen tekrar deneyin.
                </p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="w-full"
                  variant="outline"
                >
                  Tekrar Dene
                </Button>
              </div>
            )}

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => router.push('/auth/login')}
                className="text-blue-600"
              >
                Giriş Sayfasına Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
