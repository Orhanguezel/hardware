// src/app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { DJANGO_API_URL } from "@/lib/api";

export async function GET(request: NextRequest, context: any) {
  try {
    const userId = context.params?.id as string | undefined;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Django API'den kullanıcı bilgilerini al
    const response = await fetch(
      `${DJANGO_API_URL}/users/${userId}/profile/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: "Kullanıcı bulunamadı" },
          { status: 404 }
        );
      }
      throw new Error(`Django API error: ${response.status}`);
    }

    const userData = await response.json();

    // Kullanıcı istatistiklerini al
    const statsResponse = await fetch(
      `${DJANGO_API_URL}/users/${userId}/stats/public/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let stats = {
      articles_count: 0,
      comments_count: 0,
      reviews_count: 0,
      favorites_count: 0,
    };

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log("Stats data from Django:", statsData);

      // Django direkt data döndürüyor, success wrapper yok
      stats = {
        articles_count: statsData.authoredArticles || 0,
        comments_count: statsData.comments_count || 0,
        reviews_count: statsData.reviews_count || 0,
        favorites_count: statsData.favorites_count || 0,
      };
    }

    // Frontend formatına dönüştür
    const user = {
      id: userData.id.toString(),
      name:
        userData.name ||
        `${userData.first_name || ""} ${userData.last_name || ""}`.trim() ||
        userData.username,
      email: userData.email,
      bio: userData.bio || "",
      avatar: userData.avatar || "",
      role: userData.role || "USER",
      created_at: userData.created_at || userData.date_joined,
      email_visible: userData.privacy_settings?.email_visible || false,
      profile_visible:
        userData.privacy_settings?.profile_visible !== false, // Default true
      stats,
      recent_articles: userData.recent_articles || [],
      recent_comments: userData.recent_comments || [],
    };

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, error: "Kullanıcı bilgileri alınırken hata oluştu" },
      { status: 500 }
    );
  }
}
