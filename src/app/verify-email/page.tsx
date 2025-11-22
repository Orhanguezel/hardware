// app/verify-email/page.tsx

import { CheckCircle, XCircle, Mail } from "lucide-react";
import Link from "next/link";
import { DJANGO_API_URL } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Bu sayfa tamamen dinamik çalışsın, build sırasında pre-render denemesin
export const dynamic = "force-dynamic";

type VerifyStatus = "success" | "error" | "expired";

export default async function VerifyEmailPage({
  searchParams,
}: {
  // Next'in PageProps beklentisiyle uyumlu: searchParams bir Promise
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const resolved = await searchParams;
  const token = resolved.token;
  const email = resolved.email;

  let status: VerifyStatus;
  let message = "";
  let userEmail: string | null = null;

  if (!token || !email) {
    status = "error";
    message = "Geçersiz doğrulama linki";
  } else {
    try {
      const res = await fetch(`${DJANGO_API_URL}/auth/verify-email/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({ token, email }),
      });

      const data = await res.json();

      if (data.success) {
        status = "success";
        message = data.message || "E-posta adresiniz başarıyla doğrulandı.";
        if (data.user?.email && typeof data.user.email === "string") {
          userEmail = data.user.email;
        }
      } else {
        const errorMsg: string =
          data.error || "Doğrulama işlemi başarısız oldu";

        if (errorMsg.includes("süresi dolmuş")) {
          status = "expired";
        } else {
          status = "error";
        }

        message = errorMsg;
      }
    } catch (err) {
      console.error("Verification error:", err);
      status = "error";
      message = "Doğrulama sırasında bir hata oluştu";
    }
  }

  const title =
    status === "success"
      ? "Doğrulama Başarılı!"
      : status === "expired"
      ? "Link Süresi Dolmuş"
      : "Doğrulama Hatası";

  const description =
    status === "success"
      ? "E-posta adresiniz başarıyla doğrulandı"
      : status === "expired"
      ? "Doğrulama linkinin süresi dolmuş"
      : "Doğrulama işlemi başarısız oldu";

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
            {status === "success" && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {(status === "error" || status === "expired") && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {status === "expired" && userEmail && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Doğrulama linkinin süresi dolmuş. Yeni bir doğrulama
                  e-postası gönderebilirsiniz.
                </p>
                <p className="text-xs text-gray-500 text-center">
                  Hesap: <span className="font-mono">{userEmail}</span>
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
  );
}
