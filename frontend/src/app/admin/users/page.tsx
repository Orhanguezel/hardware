// src/app/admin/users/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

import type {
  UserListItem,
  UserRole,
  UserStatus,
} from "@/integrations/hardware/rtk/types/user.types";
import {
  useListUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/integrations/hardware/rtk/endpoints/users.endpoints";
import type { QueryParams } from "@/lib/api-config";

/* ---------- View model tipleri ---------- */

interface AdminUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  emailVerified: boolean;
  authoredArticles: number;
  comments: number;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface SessionUser {
  id?: number | string;
  role?: string;
  [key: string]: unknown;
}

/* ---------- DTO -> View Model helper ---------- */

const mapUserToAdminUser = (u: UserListItem): AdminUser => {
  const fullName = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
  const name = fullName || u.username || u.email;

  // createdAt: mümkünse date_joined, yoksa created_at
  const createdAt = u.date_joined ?? u.created_at ?? "";

  return {
    id: u.id,
    name,
    email: u.email,
    avatar: u.avatar ?? undefined,
    role: u.role,
    status: u.status ?? "ACTIVE",
    createdAt,
    emailVerified: Boolean(u.email_verified),
    authoredArticles: u.authoredArticles ?? 0,
    comments: u.comments_count ?? 0,
  };
};

export default function UsersPage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as SessionUser | undefined;
  const isSuperAdmin = sessionUser?.role === "SUPER_ADMIN";

  // Filtreler & arama
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");

  // Sayfalama
  const [page, setPage] = useState(1);
  const limit = 10;

  // Yeni kullanıcı dialog / form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    // "USER" bizim için "Üye"
    role: "USER",
  });

  const [error, setError] = useState<string | null>(null);

  // Arama inputu için debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1); // yeni aramada sayfayı 1'e çek
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Filtreler değişince sayfayı 1'e çek
  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter]);

  // --- RTK Query: user list ---
  const queryArgs: QueryParams = {
    page,
    page_size: limit,
    ...(searchTerm ? { search: searchTerm } : {}),
    ...(roleFilter !== "all" ? { role: roleFilter } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  };

  const {
    data: usersResult,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useListUsersQuery(queryArgs);

  const usersRaw: UserListItem[] = usersResult?.results ?? [];
  const users: AdminUser[] = usersRaw.map(mapUserToAdminUser);
  const total = usersResult?.count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

  // --- RTK Mutations ---
  const [createUserMutation, { isLoading: isCreating }] =
    useCreateUserMutation();
  const [updateUserMutation, { isLoading: isUpdating }] =
    useUpdateUserMutation();
  const [deleteUserMutation, { isLoading: isDeleting }] =
    useDeleteUserMutation();

  const globalError =
    error ||
    (queryError ? "Kullanıcılar yüklenirken bir hata oluştu." : null);

  // Stats
  const stats = {
    total,
    active: users.filter((u) => u.status === "ACTIVE").length,
    admins: users.filter(
      (u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN",
    ).length,
    editors: users.filter((u) => u.role === "EDITOR").length,
    verified: users.filter((u) => u.emailVerified).length,
  };

  const handleCreateUser = async () => {
    try {
      setError(null);
      await createUserMutation({
        name: createUserData.name,
        email: createUserData.email,
        password: createUserData.password,
        role: createUserData.role,
      }).unwrap();

      setIsCreateDialogOpen(false);
      setCreateUserData({
        name: "",
        email: "",
        password: "",
        role: "USER",
      });

      // Listeyi yenile
      await refetch();

      // eslint-disable-next-line no-alert
      alert("Kullanıcı başarıyla oluşturuldu");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error creating user:", err);
      setError("Kullanıcı oluşturulamadı");
      // eslint-disable-next-line no-alert
      alert("Kullanıcı oluşturulamadı");
    }
  };

  const handleStatusChange = async (userId: number, newStatus: UserStatus) => {
    try {
      setError(null);
      await updateUserMutation({
        id: userId,
        data: { status: newStatus },
      }).unwrap();
      await refetch();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error updating user status:", err);
      setError("Kullanıcı durumu güncellenemedi");
      // eslint-disable-next-line no-alert
      alert("Kullanıcı durumu güncellenemedi");
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      setError(null);
      await updateUserMutation({
        id: userId,
        data: { role: newRole },
      }).unwrap();
      await refetch();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error updating user role:", err);
      setError("Kullanıcı rolü güncellenemedi");
      // eslint-disable-next-line no-alert
      alert("Kullanıcı rolü güncellenemedi");
    }
  };

  const handleEmailVerification = async (
    userId: number,
    verified: boolean,
  ) => {
    try {
      setError(null);
      await updateUserMutation({
        id: userId,
        data: { email_verified: verified },
      }).unwrap();
      await refetch();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error updating email verification:", err);
      setError("Email doğrulama durumu güncellenemedi");
      // eslint-disable-next-line no-alert
      alert("Email doğrulama durumu güncellenemedi");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (
      !window.confirm(
        "Bu kullanıcıyı silmek istediğinizden emin misiniz?",
      )
    ) {
      return;
    }

    try {
      setError(null);
      await deleteUserMutation(userId).unwrap();
      await refetch();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error deleting user:", err);
      setError("Kullanıcı silinemedi");
      // eslint-disable-next-line no-alert
      alert("Kullanıcı silinemedi");
    }
  };

  const roleColors: Record<
    UserRole | "UNKNOWN",
    "destructive" | "secondary" | "default" | "outline"
  > = {
    SUPER_ADMIN: "destructive",
    ADMIN: "destructive",
    EDITOR: "default",
    USER: "secondary",
    UNKNOWN: "outline",
  };

  const roleLabels: Record<UserRole | "UNKNOWN", string> = {
    SUPER_ADMIN: "Süper Yönetici",
    ADMIN: "Yönetici",
    EDITOR: "Editör",
    USER: "Üye",
    UNKNOWN: "Bilinmeyen",
  };

  const statusColors: Record<
    UserStatus | "UNKNOWN",
    "destructive" | "secondary" | "default" | "outline"
  > = {
    ACTIVE: "default",
    INACTIVE: "secondary",
    BANNED: "destructive",
    UNKNOWN: "outline",
  };

  const statusLabels: Record<UserStatus | "UNKNOWN", string> = {
    ACTIVE: "Aktif",
    INACTIVE: "Pasif",
    BANNED: "Yasaklı",
    UNKNOWN: "Bilinmeyen",
  };

  const isBusy = isLoading || isFetching;

  if (isBusy && !usersResult) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>Kullanıcılar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  const startIndex =
    total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Kullanıcı Yönetimi</h1>
        <p className="text-muted-foreground">
          Tüm kullanıcıları yönetin ve rollerini düzenleyin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Toplam
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <UserIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Aktif
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Doğrulanmış
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.verified}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Yönetici
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.admins}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Editör
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.editors}
                </p>
              </div>
              <Edit className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {globalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <XCircle className="w-5 h-5" />
          <span>{globalError}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="İsim veya email ara..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(
                    e.target.value === "all"
                      ? "all"
                      : (e.target.value as UserRole),
                  )
                }
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tüm Roller</option>
                <option value="SUPER_ADMIN">Süper Yönetici</option>
                <option value="ADMIN">Yönetici</option>
                <option value="EDITOR">Editör</option>
                <option value="USER">Üye</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value === "all"
                      ? "all"
                      : (e.target.value as UserStatus),
                  )
                }
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Pasif</option>
                <option value="BANNED">Yasaklı</option>
              </select>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Kullanıcı Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">İsim</Label>
                      <Input
                        id="name"
                        value={createUserData.name}
                        onChange={(e) =>
                          setCreateUserData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Kullanıcı adı"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={createUserData.email}
                        onChange={(e) =>
                          setCreateUserData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Şifre</Label>
                      <Input
                        id="password"
                        type="password"
                        value={createUserData.password}
                        onChange={(e) =>
                          setCreateUserData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        placeholder="Şifre"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Rol</Label>
                      <select
                        id="role"
                        value={createUserData.role}
                        onChange={(e) =>
                          setCreateUserData((prev) => ({
                            ...prev,
                            role: e.target.value as UserRole,
                          }))
                        }
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="USER">Üye</option>
                        <option value="EDITOR">Editör</option>
                        <option value="ADMIN">Yönetici</option>
                      </select>
                    </div>
                    <Button
                      onClick={handleCreateUser}
                      className="w-full"
                      disabled={isCreating}
                    >
                      {isCreating ? "Kaydediliyor..." : "Kullanıcı Oluştur"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {users.map((user) => {
          const roleKey = (user.role ?? "UNKNOWN") as UserRole | "UNKNOWN";
          const statusKey = (user.status ?? "UNKNOWN") as
            | UserStatus
            | "UNKNOWN";

          return (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatar}
                          alt={user.name || "User"}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <UserIcon className="w-6 h-6" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium">
                        {user.name || "İsimsiz Kullanıcı"}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{user.email || "Email yok"}</span>
                        {user.emailVerified ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Kayıt:{" "}
                            {user.createdAt
                              ? new Date(
                                  user.createdAt,
                                ).toLocaleDateString("tr-TR")
                              : "Bilinmiyor"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {user.authoredArticles} makale, {user.comments} yorum
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={roleColors[roleKey] ?? "outline"}
                      >
                        {roleLabels[roleKey] ?? "Bilinmeyen"}
                      </Badge>
                      <Badge
                        variant={statusColors[statusKey] ?? "outline"}
                      >
                        {statusLabels[statusKey] ?? "Bilinmeyen"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Email Verification */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleEmailVerification(
                            user.id,
                            !user.emailVerified,
                          )
                        }
                        title={
                          user.emailVerified
                            ? "Email doğrulamasını kaldır"
                            : "Email doğrulamasını ekle"
                        }
                        disabled={isUpdating}
                      >
                        {user.emailVerified ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </Button>

                      {/* Status Change - SUPER_ADMIN'e dokunma */}
                      {user.role !== "SUPER_ADMIN" && (
                        <>
                          {user.status === "ACTIVE" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusChange(user.id, "BANNED")
                              }
                              disabled={isUpdating}
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Yasakla
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusChange(user.id, "ACTIVE")
                              }
                              disabled={isUpdating}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Aktifleştir
                            </Button>
                          )}
                        </>
                      )}

                      {/* Role Change - sadece SUPER_ADMIN rolü olan kullanıcı yetkili */}
                      {isSuperAdmin && user.role !== "SUPER_ADMIN" && (
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(
                              user.id,
                              e.target.value as UserRole,
                            )
                          }
                          className="px-2 py-1 text-sm border rounded bg-background"
                          disabled={isUpdating}
                        >
                          <option value="USER">Üye</option>
                          <option value="EDITOR">Editör</option>
                          <option value="ADMIN">Yönetici</option>
                        </select>
                      )}

                      {/* Delete - SUPER_ADMIN silinemez */}
                      {user.role !== "SUPER_ADMIN" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {users.length === 0 && !isBusy && (
        <Card className="mt-6">
          <CardContent className="py-12">
            <div className="text-center">
              <UserIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Kullanıcı Bulunamadı
              </h3>
              <p className="text-muted-foreground">
                Arama kriterlerinize uygun kullanıcı bulunamadı.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Toplam {total} kullanıcıdan {startIndex}-{endIndex} arası
                gösteriliyor
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                >
                  Önceki
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            page === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    },
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
