// src/app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Package,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Home,
  FolderTree,
  Tag,
  Star,
  Database,
} from "lucide-react";

type Role = "ADMIN" | "SUPER_ADMIN" | "EDITOR" | "USER";

const ALLOWED_ROLES: Role[] = ["ADMIN", "SUPER_ADMIN", "EDITOR"];

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["ADMIN", "SUPER_ADMIN"] as Role[],
  },
  {
    name: "İçerikler",
    href: "/admin/articles",
    icon: FileText,
    roles: ["ADMIN", "SUPER_ADMIN", "EDITOR"] as Role[],
  },
  {
    name: "Ürünler",
    href: "/admin/products",
    icon: Package,
    roles: ["ADMIN", "SUPER_ADMIN"] as Role[],
  },
  {
    name: "Kategoriler",
    href: "/admin/categories",
    icon: FolderTree,
    roles: ["ADMIN", "SUPER_ADMIN"] as Role[],
  },
  {
    name: "Etiketler",
    href: "/admin/tags",
    icon: Tag,
    roles: ["ADMIN", "SUPER_ADMIN"] as Role[],
  },
  {
    name: "Kullanıcı Yorumları",
    href: "/admin/reviews",
    icon: Star,
    roles: ["ADMIN", "SUPER_ADMIN"] as Role[],
  },
  {
    name: "Yorumlar",
    href: "/admin/comments",
    icon: MessageSquare,
    roles: ["ADMIN", "SUPER_ADMIN"] as Role[],
  },
  {
    name: "Veritabanı",
    href: "/admin/database",
    icon: Database,
    roles: ["SUPER_ADMIN"] as Role[],
  },
  {
    name: "Analitikler",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["ADMIN", "SUPER_ADMIN"] as Role[],
  },
  {
    name: "Kullanıcılar",
    href: "/admin/users",
    icon: Users,
    roles: ["ADMIN", "SUPER_ADMIN"] as Role[],
  },
  {
    name: "Ayarlar",
    href: "/admin/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN"] as Role[],
  },
];

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)" + name + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[2]) : null;
}

function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as { name?: string; email?: string; role?: Role };
  } catch {
    return null;
  }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [userRole, setUserRole] = useState<Role>("USER");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = getCookie("auth_token") || getCookie("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    const roleFromCookie = (getCookie("user_role") as Role | null) ?? "USER";
    const user = getCurrentUser();

    if (!ALLOWED_ROLES.includes(roleFromCookie)) {
      router.push("/");
      return;
    }

    setUserRole(roleFromCookie);
    setUserName(user?.name || user?.email || "Admin");
    setIsChecking(false);
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("auth_token");
      window.localStorage.removeItem("user");
      document.cookie = "auth_token=; Path=/; Max-Age=0; SameSite=Lax";
      document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
      document.cookie = "user_role=; Path=/; Max-Age=0; SameSite=Lax";
    }
    router.push("/auth/login");
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p>Yetki kontrolü yapılıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* flex container’da da overflow-x’i kapatıyoruz */}
      <div className="flex min-h-screen overflow-x-hidden">
        {/* Sidebar */}
        <div className="min-h-screen w-64 border-r bg-background p-6">
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <span className="font-semibold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{userName}</p>
                <Badge variant="outline" className="text-xs">
                  {userRole}
                </Badge>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {navigation
              .filter((item) => item.roles.includes(userRole))
              .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
          </nav>

          <div className="mt-8 border-t pt-8">
            <div className="space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Home className="h-5 w-5" />
                Siteye Dön
              </Link>
              <Button
                variant="ghost"
                className="flex w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="w-full max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
