// src/app/api/comments/[id]/helpful/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DJANGO_API_URL } from "@/lib/api";

export async function POST(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);

    const accessToken = (session as any)?.accessToken as string | undefined;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const commentId = context.params?.id as string;

    const response = await fetch(
      `${DJANGO_API_URL}/comments/${commentId}/helpful/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: (errorData as any).error || "Failed to vote",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error voting for comment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to vote for comment" },
      { status: 500 }
    );
  }
}
