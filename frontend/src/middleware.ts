// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN", "EDITOR"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sadece /admin yollarını koru
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // ---- 1) Token var mı? (Django JWT'yi cookie'den bekliyoruz) ----
  const token =
    request.cookies.get("auth_token")?.value ??
    request.cookies.get("token")?.value ??
    "";

  if (!token) {
    // Login değil -> login sayfasına at
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // ---- 2) Rol kontrolü (cookie'de user_role bekliyoruz) ----
  const userRole = request.cookies.get("user_role")?.value ?? "USER";

  if (!ALLOWED_ROLES.includes(userRole)) {
    // Yetkisiz -> ana sayfaya at
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Her şey tamamsa devam
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
