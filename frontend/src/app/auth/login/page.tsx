// hardware/src/app/auth/login/page.tsx

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import {
  useLoginMutation,
  useResendVerificationMutation,
} from "@/integrations/hardware/rtk/endpoints/auth.endpoints";
import type {
  LoginRequest,
  LoginSuccessResponse,
} from "@/integrations/hardware/rtk/types/auth.types";
import apiClient from "@/lib/api";

interface LoginErrorPayload {
  message?: string;
  error?: string;
  email_verification_required?: boolean;
  email?: string;
  [key: string]: unknown;
}

interface RtkError {
  data?: LoginErrorPayload;
  status?: number;
  [key: string]: unknown;
}

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [emailVerificationRequired, setEmailVerificationRequired] =
    useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const router = useRouter();

  const [loginMutation] = useLoginMutation();
  const [resendVerificationMutation] = useResendVerificationMutation();

  const extractErrorMessage = (
    err: unknown,
    fallback: string,
  ): LoginErrorPayload => {
    if (err && typeof err === "object" && "data" in err) {
      const data = (err as RtkError).data ?? {};
      return data;
    }
    return { message: fallback };
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setEmailVerificationRequired(false);

    const payload: LoginRequest = {
      email,
      password,
    };

    try {
      const data: LoginSuccessResponse = await loginMutation(
        payload,
      ).unwrap();

      // Başarılı login
      if (data.success && data.token) {
        // 🔹 ApiClient ile senkronize et
        apiClient.setToken(data.token);

        // 🔹 localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem("auth_token", data.token);
          window.localStorage.setItem(
            "user",
            JSON.stringify(data.user),
          );
        }

        // 🔹 Cookie'ler (admin layout + diğer client kontrolleri için)
        const maxAge = 60 * 60 * 24 * 7; // 7 gün
        document.cookie = `auth_token=${data.token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
        document.cookie = `user_role=${
          data.user.role ?? "USER"
        }; Path=/; Max-Age=${maxAge}; SameSite=Lax`;

        router.push("/");
        return;
      }

      // 200 dönüp success=false gelirse (edge case)
      if (data.email_verification_required) {
        setEmailVerificationRequired(true);
        setUserEmail(data.email ?? email);
        setError(
          data.message ||
            "E-posta adresiniz doğrulanmamış. Lütfen e-posta kutunuzu kontrol edin ve doğrulama linkine tıklayın.",
        );
      } else {
        setError(
          data.message ||
            "Giriş bilgileri hatalı. Lütfen kontrol edin.",
        );
      }
    } catch (err) {
      const data = extractErrorMessage(
        err,
        "Bir hata oluştu. Lütfen tekrar deneyin.",
      );

      if (data.email_verification_required) {
        setEmailVerificationRequired(true);
        setUserEmail(data.email ?? email);
        setError(
          data.message ||
            data.error ||
            "E-posta adresiniz doğrulanmamış. Lütfen e-posta kutunuzu kontrol edin ve doğrulama linkine tıklayın.",
        );
      } else {
        setError(
          data.message ||
            data.error ||
            "Giriş bilgileri hatalı. Lütfen kontrol edin.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    setError("");

    try {
      const data = await resendVerificationMutation().unwrap();

      if (data.success) {
        setError(
          "Doğrulama e-postası tekrar gönderildi. Lütfen e-posta kutunuzu kontrol edin.",
        );
      } else {
        setError(data.message || "E-posta gönderilemedi.");
      }
    } catch (err) {
      const data = extractErrorMessage(
        err,
        "E-posta gönderilemedi.",
      );
      setError(data.message || data.error || "E-posta gönderilemedi.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 mb-4"
          >
            <div className="h-8 w-8 rounded bg-primary" />
            <span className="text-2xl font-bold">Donanım Puanı</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Giriş Yap</h1>
          <p className="text-muted-foreground">
            Hesabınıza giriş yaparak tüm özelliklerden yararlanın
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Hesabınıza Giriş Yapın
            </CardTitle>
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Şifrenizi girin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert
                  className={
                    emailVerificationRequired
                      ? "border-orange-200 bg-orange-50"
                      : "border-red-200 bg-red-50"
                  }
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription
                    className={
                      emailVerificationRequired
                        ? "text-orange-800"
                        : "text-red-800"
                    }
                  >
                    {error}
                    {emailVerificationRequired && userEmail && (
                      <span className="block text-xs mt-1">
                        ({userEmail} adresini kontrol edin.)
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {emailVerificationRequired && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    E-posta adresinize gönderilen doğrulama linkine
                    tıklayarak hesabınızı aktifleştirin.
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
                {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Hesabınız yok mu?{" "}
                <Link
                  href="/auth/signup"
                  className="text-primary hover:underline"
                >
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
