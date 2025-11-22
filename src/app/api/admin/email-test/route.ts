// src/app/api/admin/email-test/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";

const DJANGO_API_URL =
  process.env.DJANGO_API_URL ?? "http://localhost:8000/api";

/* ---------- Types ---------- */

type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN" | string;

interface AppUser {
  id: string;
  role: UserRole;
  email?: string | null;
  name?: string | null;
}

/**
 * Projede zaten next-auth için module augmentation yapılı olduğunu varsayıyoruz.
 * Burada sadece accessToken ekliyoruz, Session’ın kendisini extend ETMİYORUZ.
 */
type SessionWithAccessToken = Session & {
  user: AppUser;
  accessToken?: string;
};

interface TestEmailRequestBody {
  to: string;
  subject?: string;
  message?: string;
}

/** Django test email endpoint’inin döndürebileceği muhtemel alanlar */
interface DjangoTestEmailResponse {
  success?: boolean;
  detail?: string;
  message?: string;
  error?: string;
}

/* ---------- Helpers ---------- */

function jsonError(
  message: string,
  status: number
): NextResponse<{ success: false; error: string }> {
  return NextResponse.json({ success: false, error: message }, { status });
}

/* ---------- POST /api/admin/email-test ---------- */
/**
 * Admin panelden mail ayarlarını girdikten sonra,
 * bu endpoint'e POST atarak test mail göndereceğiz.
 *
 * Body:
 * {
 *   "to": "test@ornek.com",
 *   "subject"?: "Opsiyonel konu",
 *   "message"?: "Opsiyonel gövde"
 * }
 *
 * Bu endpoint Django tarafındaki (örnek) /email/test/ endpoint’ine
 * Token ile istek atar ve sonucu döndürür.
 */
export async function POST(
  request: NextRequest
): Promise<
  NextResponse<{
    success: boolean;
    data?: DjangoTestEmailResponse;
    error?: string;
  }>
> {
  try {
    const session = (await getServerSession(
      authOptions
    )) as SessionWithAccessToken | null;

    if (!session) {
      return jsonError("Authentication required", 401);
    }

    const user = session.user;
    const role = user.role;

    if (!user.id || !role) {
      return jsonError("Authentication required", 401);
    }

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return jsonError("Admin or Super Admin access required", 403);
    }

    const accessToken = session.accessToken;
    if (!accessToken) {
      return jsonError(
        "Django access token missing from session (accessToken).",
        401
      );
    }

    const body = (await request.json()) as TestEmailRequestBody;

    if (!body.to) {
      return jsonError('"to" alanı zorunludur', 400);
    }

    const payload: TestEmailRequestBody = {
      to: body.to,
      subject: body.subject ?? "Donanım Puanı - Test E-postası",
      message:
        body.message ??
        "Merhaba,\n\nBu e-posta Django SMTP ayarlarının test edilmesi için gönderilmiştir.\n\nDonanım Puanı",
    };

    // ⬇ Django’da bunu karşılayacak endpoint:
    // örnek: POST /api/email/test/
    const djangoUrl = `${DJANGO_API_URL}/email/test/`;

    const response = await fetch(djangoUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Hata durumunda önce JSON dene, olmazsa text
      let errorMessage = `Django API error: ${response.status}`;

      try {
        const errorJson =
          (await response.json()) as DjangoTestEmailResponse;
        if (errorJson.error || errorJson.detail || errorJson.message) {
          errorMessage =
            errorJson.error ??
            errorJson.detail ??
            errorJson.message ??
            errorMessage;
        }
      } catch {
        const text = await response.text().catch(() => "");
        if (text) {
          errorMessage = `${errorMessage} - ${text}`;
        }
      }

      return jsonError(errorMessage, response.status);
    }

    const data =
      (await response.json()) as DjangoTestEmailResponse;

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending test email:", error);
    return jsonError("Failed to send test email", 500);
  }
}
