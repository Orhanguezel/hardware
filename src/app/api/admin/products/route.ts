// app/api/admin/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DJANGO_API_URL } from "@/lib/api";

// Env’den gelen base URL (sonundaki / işaretlerini temizleyelim)
const djangoApiUrl = DJANGO_API_URL.replace(/\/+$/, "");

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      !["ADMIN", "SUPER_ADMIN"].includes(
        (session.user as unknown as { role: string }).role,
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Admin or Super Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString
      ? `${djangoApiUrl}/products/?${queryString}`
      : `${djangoApiUrl}/products/`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${(session as unknown as { accessToken: string }).accessToken || ""}`,
      },
    });

    if (!response.ok) {
      console.error("Django API error:", response.status, response.statusText);
      throw new Error(`Django API error: ${response.status}`);
    }

    const data = await response.json();

    const transformedProducts = (data.results || data).map((product: any) => ({
      id: product.id.toString(),
      brand: product.brand,
      model: product.model,
      slug: product.slug,
      description: product.description,
      releaseYear: product.release_year,
      coverImage: product.cover_image,
      category: product.category
        ? {
            id: product.category.id.toString(),
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,
      product_tags: product.product_tags || [],
      affiliateLinks: product.affiliate_links || [],
      reviewCount: product.review_count || 0,
      averageRating: product.average_rating,
      specsCount: product.specs?.length || 0,
      affiliateLinksCount: product.affiliate_links?.length || 0,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          page: 1,
          limit: 20,
          total: data.count || transformedProducts.length,
          totalPages: Math.ceil(
            (data.count || transformedProducts.length) / 20,
          ),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      !["ADMIN", "SUPER_ADMIN"].includes(
        (session.user as unknown as { role: string }).role,
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Admin or Super Admin access required" },
        { status: 403 },
      );
    }

    const formData = await request.formData();

    console.log(
      "API Route - Received FormData:",
      Object.fromEntries(formData.entries()),
    );

    const response = await fetch(`${djangoApiUrl}/products/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${(session as unknown as { accessToken: string }).accessToken || ""}`,
        // FormData olduğundan Content-Type elle vermiyoruz
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: (errorData as unknown as { error: string }).error || "Failed to create product",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 },
    );
  }
}
