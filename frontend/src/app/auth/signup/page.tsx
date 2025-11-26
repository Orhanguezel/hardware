// src/app/auth/signup/page.tsx
"use client";

import {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Mail,
  User,
  ArrowRight,
  Check,
  XCircle,
} from "lucide-react";

import { useSettings } from "@/contexts/SettingsContext";
import { useRegisterMutation } from "@/integrations/hardware/rtk/endpoints/auth.endpoints";
import type { RegisterRequest } from "@/integrations/hardware/rtk/types/auth.types";

interface RtkErrorPayload {
  message?: string;
  error?: string;
  [key: string]: unknown;
}

interface RtkError {
  data?: RtkErrorPayload;
  status?: number;
  [key: string]: unknown;
}

export default function SignUpPage() {
  const { settings, loading } = useSettings();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [registerMutation, { isLoading: isRegisterLoading }] =
    useRegisterMutation();

  useEffect(() => {
    // şimdilik sadece settings state'ini bekliyoruz.
  }, [settings, loading]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (settings && settings.user_registration?.value !== "true") {
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
                  Şu anda yeni üye kaydı kabul edilmemektedir. Daha sonra tekrar
                  deneyiniz.
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
    );
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      return;
    }

    const trimmedName = formData.name.trim();
    const [firstName, ...restNameParts] = trimmedName.split(" ");
    const lastName = restNameParts.join(" ");

    const payload: RegisterRequest = {
      email: formData.email,
      password: formData.password,
      password2: formData.confirmPassword,
      username: formData.email,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
    };

    try {
      const result = await registerMutation(payload).unwrap();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          // 🔴 BURASI DÜZELTİLDİ: /auth/signin → /auth/login
          router.push("/auth/login");
        }, 3000);
      } else {
        setError(result.message || "Kayıt sırasında bir hata oluştu.");
      }
    } catch (err: unknown) {
      const msg = extractRtkErrorMessage(
        err,
        "Kayıt sırasında bir hata oluştu.",
      );
      setError(msg);
    }
  };

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
                  Hesabınız başarıyla oluşturuldu. E-posta adresinize gönderilen
                  doğrulama linkine tıklayarak hesabınızı aktifleştirin.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Doğrulama E-postası Gönderildi
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">
                        E-posta kutunuzu kontrol edin ve spam klasörünü de
                        kontrol etmeyi unutmayın.
                      </p>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full">
                  {/* 🔴 BURASI DA: /auth/signin → /auth/login */}
                  <Link href="/auth/login">
                    Giriş Yap
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
              {/* ... form alanları aynı ... */}

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

              {/* ... diğer inputlar aynı, kısaltıyorum ... */}

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isRegisterLoading}
              >
                {isRegisterLoading ? "Kayıt oluşturuluyor..." : "Üye Ol"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Zaten hesabınız var mı?{" "}
                {/* 🔴 BURASI DA DÜZELTİLDİ */}
                <Link
                  href="/auth/login"
                  className="text-primary hover:underline"
                >
                  Giriş yapın
                </Link>
              </p>
            </div>

            <div className="mt-6 text-xs text-muted-foreground text-center">
              Üye olarak{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Kullanım Şartları
              </Link>{" "}
              ve{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Gizlilik Politikası
              </Link>{" "}
              &apos;nı kabul etmiş olursunuz.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
