// =============================================================
// FILE: src/app/auth/signin/page.tsx
// =============================================================

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Key,
} from "lucide-react";

import {
  useLoginMutation,
  useRequestPasswordResetMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
} from "@/integrations/hardware/rtk/endpoints/auth.endpoints";

import type {
  LoginRequest,
  RequestPasswordResetRequest,
  VerifyResetCodeRequest,
  ResetPasswordRequest,
} from "@/integrations/hardware/rtk/types/auth.types";

import apiClient from "@/lib/api";

interface RtkErrorPayload {
  message?: string;
  error?: string;
  email_verification_required?: boolean;
  email?: string;
  [key: string]: unknown;
}

interface RtkError {
  data?: RtkErrorPayload;
  status?: number;
  [key: string]: unknown;
}

export default function SignInPage() {
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1); // 1: email, 2: code, 3: new password

  const router = useRouter();

  // RTK hooks
  const [loginMutation] = useLoginMutation();
  const [requestPasswordReset, { isLoading: isRequestLoading }] =
    useRequestPasswordResetMutation();
  const [verifyResetCode, { isLoading: isVerifyLoading }] =
    useVerifyResetCodeMutation();
  const [resetPasswordMutation, { isLoading: isResetLoading }] =
    useResetPasswordMutation();

  const isResetFlowLoading =
    isRequestLoading || isVerifyLoading || isResetLoading;

  const extractRtkErrorMessage = (err: unknown, fallback: string): string => {
    if (
      err &&
      typeof err === "object" &&
      "data" in err &&
      (err as RtkError).data
    ) {
      const data = (err as RtkError).data;
      return data?.message || data?.error || fallback;
    }
    return fallback;
  };

  /* ------------------ Login submit (/auth/login/) ------------------ */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setError("");
    setMessage("");

    const payload: LoginRequest = { email, password };

    try {
      const data = await loginMutation(payload).unwrap();

      if (data.success && data.token) {
        // 🔹 ApiClient ile senkronize et (comments vs için)
        apiClient.setToken(data.token);

        // 🔹 localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem("auth_token", data.token);
          window.localStorage.setItem("user", JSON.stringify(data.user));
        }

        // 🔹 Cookie'ler (admin layout + diğer client kontrolleri)
        const maxAge = 60 * 60 * 24 * 7; // 7 gün
        document.cookie = `auth_token=${data.token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
        document.cookie = `user_role=${
          data.user.role ?? "USER"
        }; Path=/; Max-Age=${maxAge}; SameSite=Lax`;

        router.push("/");
        return;
      }

      // success=false edge case
      if (data.email_verification_required) {
        setError(
          data.message ||
            "E-posta adresiniz doğrulanmamış. Lütfen e-posta kutunuzu kontrol edin.",
        );
      } else {
        setError(
          data.message ||
            "Giriş bilgileri hatalı. Lütfen bilgilerinizi kontrol edin.",
        );
      }
    } catch (err) {
      const msg = extractRtkErrorMessage(
        err,
        "Bir hata oluştu. Lütfen tekrar deneyin.",
      );
      setError(msg);
    } finally {
      setIsLoginLoading(false);
    }
  };

  /* ------------------ Şifre reset: 1) Request ------------------ */

  const handleRequestReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload: RequestPasswordResetRequest = { email };

    try {
      const data = await requestPasswordReset(payload).unwrap();
      if (data.success) {
        setMessage(
          data.message ||
            "Şifre sıfırlama talebiniz alınmıştır. E-posta kutunuzu kontrol edin.",
        );
        setResetStep(2);
      } else {
        setError(data.message || "Bir hata oluştu");
      }
    } catch (err) {
      const msg = extractRtkErrorMessage(
        err,
        "Bağlantı hatası. Lütfen tekrar deneyin.",
      );
      setError(msg);
    }
  };

  /* ------------------ Şifre reset: 2) Code verify ------------------ */

  const handleVerifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload: VerifyResetCodeRequest = {
      email,
      code: resetCode,
    };

    try {
      const data = await verifyResetCode(payload).unwrap();
      if (data.success) {
        setMessage(
          data.message ||
            "Doğrulama kodu onaylandı. Şimdi yeni şifrenizi belirleyin.",
        );
        setResetStep(3);
      } else {
        setError(data.message || "Geçersiz kod");
      }
    } catch (err) {
      const msg = extractRtkErrorMessage(
        err,
        "Bağlantı hatası. Lütfen tekrar deneyin.",
      );
      setError(msg);
    }
  };

  /* ------------------ Şifre reset: 3) Yeni şifre ------------------ */

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    if (newPassword.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      return;
    }

    const payload: ResetPasswordRequest = {
      email,
      code: resetCode,
      new_password: newPassword,
      new_password2: confirmPassword,
    };

    try {
      const data = await resetPasswordMutation(payload).unwrap();
      if (data.success) {
        setMessage(
          data.message ||
            "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.",
        );
        setTimeout(() => {
          resetForgotPassword();
        }, 3000);
      } else {
        setError(data.message || "Şifre sıfırlama başarısız");
      }
    } catch (err) {
      const msg = extractRtkErrorMessage(
        err,
        "Bağlantı hatası. Lütfen tekrar deneyin.",
      );
      setError(msg);
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setResetStep(1);
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
  };

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
                  <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="text-green-600 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded">
                    {message}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Hesabınız yok mu?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-primary hover:underline"
                  >
                    Üye olun
                  </Link>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError("");
                    setMessage("");
                    setResetStep(1);
                  }}
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
                {resetStep === 1 && "Şifre Sıfırlama"}
                {resetStep === 2 && "Doğrulama Kodu"}
                {resetStep === 3 && "Yeni Şifre"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resetStep === 1 && (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    E-posta adresinizi girin, size şifre sıfırlama kodu
                    gönderelim.
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isResetFlowLoading}
                  >
                    {isResetFlowLoading ? "Gönderiliyor..." : "Kod Gönder"}
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
                        onChange={(e) =>
                          setResetCode(
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isResetFlowLoading || resetCode.length !== 6}
                  >
                    {isResetFlowLoading ? "Doğrulanıyor..." : "Kodu Doğrula"}
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
                    <label
                      htmlFor="new-password"
                      className="text-sm font-medium"
                    >
                      Yeni Şifre
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Yeni şifrenizi girin"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirm-password"
                      className="text-sm font-medium"
                    >
                      Şifre Tekrar
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Şifrenizi tekrar girin"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((prev) => !prev)
                        }
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isResetFlowLoading}
                  >
                    {isResetFlowLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <button
                  type="button"
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
      </div>
    </div>
  );
}
