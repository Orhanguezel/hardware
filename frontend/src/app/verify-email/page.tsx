// app/verify-email/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Mail } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

import {
  useVerifyEmailMutation,
} from '@/integrations/hardware/rtk/endpoints/auth.endpoints'
import type { VerifyEmailResponse } from '@/integrations/hardware/rtk/types/auth.types'

// Bu sayfa tamamen dinamik çalışsın, build sırasında pre-render denemesin
export const dynamic = 'force-dynamic'

type VerifyStatus = 'success' | 'error' | 'expired' | 'idle'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [status, setStatus] = useState<VerifyStatus>('idle')
  const [message, setMessage] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation()

  useEffect(() => {
    // Query param yoksa direkt hata
    if (!token || !email) {
      setStatus('error')
      setMessage('Geçersiz doğrulama linki')
      setUserEmail(null)
      return
    }

    let isCancelled = false

    const runVerification = async () => {
      try {
        const res: VerifyEmailResponse = await verifyEmail({
          email,
          token,
        }).unwrap()

        if (isCancelled) return

        if (res.success) {
          setStatus('success')
          setMessage(
            res.message || 'E-posta adresiniz başarıyla doğrulandı.',
          )
          setUserEmail(res.user?.email ?? null)
        } else {
          const errorMsg =
            res.message || 'Doğrulama işlemi başarısız oldu'

          if (errorMsg.includes('süresi dolmuş')) {
            setStatus('expired')
          } else {
            setStatus('error')
          }

          setMessage(errorMsg)
          setUserEmail(null)
        }
      } catch (err: unknown) {
        if (isCancelled) return
        // RTK error objesini inceleyebiliriz ama şimdilik genel mesaj bırakıyoruz
        console.error('Verification error via RTK:', err)
        setStatus('error')
        setMessage('Doğrulama sırasında bir hata oluştu')
        setUserEmail(null)
      }
    }

    runVerification()

    return () => {
      isCancelled = true
    }
  }, [token, email, verifyEmail])

  const title =
    status === 'success'
      ? 'Doğrulama Başarılı!'
      : status === 'expired'
      ? 'Link Süresi Dolmuş'
      : status === 'error'
      ? 'Doğrulama Hatası'
      : 'Doğrulama Yapılıyor...'

  const description =
    status === 'success'
      ? 'E-posta adresiniz başarıyla doğrulandı'
      : status === 'expired'
      ? 'Doğrulama linkinin süresi dolmuş'
      : status === 'error'
      ? 'Doğrulama işlemi başarısız oldu'
      : 'Lütfen bekleyin, doğrulama işleminiz yapılıyor'

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
            <CardTitle className="text-center">{title}</CardTitle>
            <CardDescription className="text-center">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Yükleme durumu */}
            {isLoading && (
              <Alert>
                <AlertDescription>
                  Doğrulama işlemi devam ediyor...
                </AlertDescription>
              </Alert>
            )}

            {status === 'success' && !isLoading && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {(status === 'error' || status === 'expired') &&
              !isLoading && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

            {status === 'expired' && userEmail && !isLoading && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Doğrulama linkinin süresi dolmuş. Yeni bir doğrulama
                  e-postası gönderebilirsiniz.
                </p>
                <p className="text-xs text-gray-500 text-center">
                  Hesap:{' '}
                  <span className="font-mono">{userEmail}</span>
                </p>
              </div>
            )}

            <div className="text-center">
              <Button asChild className="w-full">
                <Link href="/auth/login">Giriş Sayfasına Dön</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
