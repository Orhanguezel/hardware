// src/app/dashboard/settings/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

import {
  User,
  Mail,
  Bell,
  Shield,
  Save,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

import {
  useGetUserSettingsQuery,
  useUpdateUserSettingsMutation,
  useChangeUserPasswordMutation,
} from '@/integrations/hardware/rtk/endpoints/users.endpoints';
import type {
  UserSettings as UserSettingsDto,
  UserRole,
} from '@/integrations/hardware/rtk/types/user.types';

/* ---------- Local form tipleri ---------- */

type UserSettingsForm = UserSettingsDto;

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

interface PasswordState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function DashboardSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const sessionUser = session?.user as unknown as {
    id?: number | string;
    role?: string;
  };
  const userId: number | undefined =
    typeof sessionUser?.id === 'number'
      ? sessionUser.id
      : sessionUser?.id
      ? Number(sessionUser.id)
      : undefined;

  const userRole: UserRole = (sessionUser?.role as UserRole) ?? 'USER';

  const shouldSkipSettings = !userId || status !== 'authenticated';

  const {
    data: userSettings,
    isLoading: settingsLoading,
    isError: settingsError,
  } = useGetUserSettingsQuery(userId ?? 0, {
    skip: shouldSkipSettings,
  });

  const [updateUserSettings, { isLoading: isSavingSettings }] =
    useUpdateUserSettingsMutation();

  const [changeUserPassword, { isLoading: isChangingPassword }] =
    useChangeUserPasswordMutation();

  /* ---------- Local state ---------- */

  const [settings, setSettings] = useState<UserSettingsForm>({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    profile_visible: true,
    email_visible: false,
    theme: 'light',
    language: 'tr',
  });

  const [passwordData, setPasswordData] = useState<PasswordState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  /* ---------- Auth kontrolü ---------- */

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  /* ---------- RTK verisini forma yansıt ---------- */

  useEffect(() => {
    if (!session) return;

    if (userSettings) {
      setSettings({
        ...userSettings,
        name: userSettings.name || session.user?.name || '',
        email: userSettings.email || session.user?.email || '',
        bio: userSettings.bio ?? '',
        avatar: userSettings.avatar ?? '',
        email_notifications: !!userSettings.email_notifications,
        push_notifications: !!userSettings.push_notifications,
        marketing_emails: !!userSettings.marketing_emails,
        profile_visible: !!userSettings.profile_visible,
        email_visible: !!userSettings.email_visible,
        theme: userSettings.theme || 'light',
        language: userSettings.language || 'tr',
      });
    } else if (settingsError) {
      // RTK hata verirse en azından session'dan doldur
      setSettings((prev) => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
      }));
    }
  }, [userSettings, settingsError, session]);

  /* ---------- Handlers ---------- */

  type TextFieldKeys = 'name' | 'email' | 'bio';

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const key = name as TextFieldKeys;
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNotificationChange = (
    key: keyof Pick<
      UserSettingsForm,
      'email_notifications' | 'push_notifications' | 'marketing_emails'
    >,
    value: boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePrivacyChange = (
    key: keyof Pick<UserSettingsForm, 'profile_visible' | 'email_visible'>,
    value: boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as PasswordField;
    setPasswordData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setSettings((prev) => ({
      ...prev,
      avatar: '',
    }));
  };

  const handleSaveSettings = async () => {
    if (!userId) {
      toast.error('Kullanıcı bilgisi bulunamadı.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', settings.name);
      formData.append('email', settings.email);
      formData.append('bio', settings.bio ?? '');
      formData.append(
        'email_notifications',
        settings.email_notifications ? 'true' : 'false',
      );
      formData.append(
        'push_notifications',
        settings.push_notifications ? 'true' : 'false',
      );
      formData.append(
        'marketing_emails',
        settings.marketing_emails ? 'true' : 'false',
      );
      formData.append(
        'profile_visible',
        settings.profile_visible ? 'true' : 'false',
      );
      formData.append(
        'email_visible',
        settings.email_visible ? 'true' : 'false',
      );
      formData.append('theme', settings.theme || 'light');
      formData.append('language', settings.language || 'tr');

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      // avatar yoksa / silindiyse backend'e bildir
      if (!settings.avatar && !avatarFile) {
        formData.append('remove_avatar', 'true');
      }

      const res = await updateUserSettings({
        userId,
        data: formData,
      }).unwrap();

      if (res.success) {
        toast.success('Ayarlar başarıyla kaydedildi');
        setAvatarFile(null);
        setAvatarPreview('');
      } else {
        toast.error('Ayarlar kaydedilirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Error saving settings via RTK:', err);
      // ❗ err burada unknown, önce güvenli cast yapıyoruz
      const e = err as {
        data?: { error?: string; message?: string; detail?: string };
      };
      const msg =
        e.data?.error ||
        e.data?.message ||
        e.data?.detail ||
        'Ayarlar kaydedilirken hata oluştu';
      toast.error(msg);
    }
  };

  const handleChangePassword = async () => {
    if (!userId) {
      toast.error('Kullanıcı bilgisi bulunamadı.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      const res = await changeUserPassword({
        userId,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();

      if (res.success) {
        toast.success(res.message || 'Şifre başarıyla değiştirildi');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(res.message || 'Şifre değiştirilirken hata oluştu');
      }
    } catch (err) {
      console.error('Error changing password via RTK:', err);
      const e = err as {
        data?: { error?: string; detail?: string; message?: string };
      };
      const msg =
        e.data?.error ||
        e.data?.detail ||
        e.data?.message ||
        'Şifre değiştirilirken hata oluştu';
      toast.error(msg);
    }
  };

  /* ---------- Loading state ---------- */

  const isInitialLoading =
    status === 'loading' ||
    (status === 'authenticated' && !userSettings && settingsLoading);

  if (isInitialLoading) {
    return (
      <div className="container py-8">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          <span>Ayarlar yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Hesap Ayarları</h1>
            <p className="text-muted-foreground">
              Profil bilgilerinizi ve tercihlerinizi yönetin
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* MAIN COLUMN */}
        <div className="space-y-6 lg:col-span-2">
          {/* PROFIL BILGILERI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                Profil Bilgileri
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Kişisel bilgilerinizi güncelleyin
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    name="name"
                    value={settings.name}
                    onChange={handleTextChange}
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={settings.email}
                    onChange={handleTextChange}
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Hakkımda</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={settings.bio ?? ''}
                  onChange={handleTextChange}
                  placeholder="Kendiniz hakkında kısa bir açıklama..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="avatar">Profil Resmi</Label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : settings.avatar ? (
                      <Image
                        src={`http://localhost:8000${settings.avatar}`}
                        alt="Current avatar"
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <Input
                        id="avatar"
                        name="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/80"
                      />
                      {(settings.avatar || avatarPreview) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveAvatar}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          Kaldır
                        </Button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      JPG, PNG veya GIF formatında, maksimum 5MB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ŞİFRE DEĞİŞTİR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-orange-500" />
                Şifre Değiştir
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Hesap güvenliğiniz için şifrenizi güncelleyin
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Mevcut şifrenizi girin"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Yeni şifrenizi girin"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Yeni şifrenizi tekrar girin"
                  />
                </div>
              </div>

              <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Değiştiriliyor...
                  </>
                ) : (
                  'Şifreyi Değiştir'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* BILDIRIM TERCIHLERI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                Bildirim Tercihleri
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Hangi bildirimleri almak istediğinizi seçin
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>E-posta Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Önemli güncellemeler için e-posta al
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) =>
                    handleNotificationChange('email_notifications', checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Tarayıcı bildirimlerini al
                  </p>
                </div>
                <Switch
                  checked={settings.push_notifications}
                  onCheckedChange={(checked) =>
                    handleNotificationChange('push_notifications', checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Pazarlama E-postaları</Label>
                  <p className="text-sm text-muted-foreground">
                    Özel teklifler ve güncellemeler için e-posta al
                  </p>
                </div>
                <Switch
                  checked={settings.marketing_emails}
                  onCheckedChange={(checked) =>
                    handleNotificationChange('marketing_emails', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* GIZLILIK */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Gizlilik Ayarları
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Profil ve e-posta görünürlüğünüzü kontrol edin
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Profil Görünürlüğü</Label>
                  <p className="text-sm text-muted-foreground">
                    Profilinizi diğer kullanıcılara göster
                  </p>
                </div>
                <Switch
                  checked={settings.profile_visible}
                  onCheckedChange={(checked) =>
                    handlePrivacyChange('profile_visible', checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>E-posta Görünürlüğü</Label>
                  <p className="text-sm text-muted-foreground">
                    E-posta adresinizi diğer kullanıcılara göster
                  </p>
                </div>
                <Switch
                  checked={settings.email_visible}
                  onCheckedChange={(checked) =>
                    handlePrivacyChange('email_visible', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* KAYDET */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              size="lg"
            >
              {isSavingSettings ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Ayarları Kaydet
                </>
              )}
            </Button>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* HESAP BILGILERI */}
          <Card>
            <CardHeader>
              <CardTitle>Hesap Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  ID: {userId !== undefined ? userId : 'N/A'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{session?.user?.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Rol: {userRole}</span>
              </div>
            </CardContent>
          </Card>

          {/* HIZLI ISLEMLER */}
          <Card>
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/dashboard">Dashboard&apos;a Dön</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/favorites">Favorilerim</Link>
              </Button>
              {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/admin">Admin Panel</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
