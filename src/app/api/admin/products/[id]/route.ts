// src/app/api/admin/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DJANGO_API_URL } from '@/lib/api'

// Env’den gelen base URL (sonundaki / işaretlerini temizleyelim)
const djangoApiUrl = DJANGO_API_URL.replace(/\/+$/, '')

interface RouteContext {
  params: {
    id: string
  }
}

interface DjangoAffiliateLink {
  id: number
  merchant: string
  url_template: string
  active: boolean
}

// Get single product
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    const user = session?.user as { id?: string; role?: string } | undefined
    const role = user?.role ?? ''
    const accessToken =
      (session as { accessToken?: string } | null | undefined)?.accessToken ??
      ''

    if (!user?.id || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Super Admin access required' },
        { status: 403 },
      )
    }

    const { id } = params

    const response = await fetch(`${djangoApiUrl}/products/id/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${accessToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 },
        )
      }
      throw new Error(`Django API error: ${response.status}`)
    }

    const product = await response.json()

    const transformedProduct = {
      id: product.id.toString(),
      brand: product.brand,
      model: product.model,
      slug: product.slug,
      description: product.description,
      price: product.price,
      releaseYear: product.release_year,
      coverImage: product.cover_image,
      category: product.category
        ? {
            id: product.category.id.toString(),
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,
      productSpecs: product.specs || [],
      product_tags: product.product_tags || [],
      affiliateLinks: (product.affiliate_links || []).map(
        (link: DjangoAffiliateLink) => ({
          id: link.id,
          merchant: link.merchant,
          urlTemplate: link.url_template,
          active: link.active,
        }),
      ),
      userReviews: product.user_reviews || [],
      averageRating: product.average_rating,
      reviewCount: product.review_count || 0,
      specsCount: product.specs?.length || 0,
      affiliateLinksCount: product.affiliate_links?.length || 0,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }

    return NextResponse.json({
      success: true,
      data: transformedProduct,
    })
  } catch (error: unknown) {
    console.error(
      'Error fetching product:',
      error instanceof Error ? error.message : error,
    )
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 },
    )
  }
}

// Update product
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    const user = session?.user as { id?: string; role?: string } | undefined
    const role = user?.role ?? ''
    const accessToken =
      (session as { accessToken?: string } | null | undefined)?.accessToken ??
      ''

    if (!user?.id || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Super Admin access required' },
        { status: 403 },
      )
    }

    const { id } = params
    const formData = await request.formData()

    console.log(
      'API Route - Received FormData:',
      Object.fromEntries(formData.entries()),
    )

    const brand = formData.get('brand') as string | null
    const model = formData.get('model') as string | null
    const categoryId = formData.get('category_id') as string | null

    if (!brand || !model || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Brand, model, and category are required' },
        { status: 400 },
      )
    }

    const response = await fetch(`${djangoApiUrl}/products/id/${id}/`, {
      method: 'PUT',
      headers: {
        Authorization: `Token ${accessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 },
        )
      }
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || 'Failed to update product',
        },
        { status: response.status },
      )
    }

    const updatedProduct = await response.json()

    const transformedProduct = {
      id: updatedProduct.id.toString(),
      brand: updatedProduct.brand,
      model: updatedProduct.model,
      slug: updatedProduct.slug,
      description: updatedProduct.description,
      price: updatedProduct.price,
      releaseYear: updatedProduct.release_year,
      coverImage: updatedProduct.cover_image,
      category: updatedProduct.category
        ? {
            id: updatedProduct.category.id.toString(),
            name: updatedProduct.category.name,
            slug: updatedProduct.category.slug,
          }
        : null,
      productSpecs: updatedProduct.specs || [],
      product_tags: updatedProduct.product_tags || [],
      affiliateLinks: (updatedProduct.affiliate_links || []).map(
        (link: DjangoAffiliateLink) => ({
          id: link.id,
          merchant: link.merchant,
          urlTemplate: link.url_template,
          active: link.active,
        }),
      ),
      averageRating: updatedProduct.average_rating,
      reviewCount: updatedProduct.review_count || 0,
      specsCount: updatedProduct.specs?.length || 0,
      affiliateLinksCount: updatedProduct.affiliate_links?.length || 0,
      createdAt: updatedProduct.created_at,
      updatedAt: updatedProduct.updated_at,
    }

    return NextResponse.json({
      success: true,
      data: transformedProduct,
    })
  } catch (error: unknown) {
    console.error(
      'Error updating product:',
      error instanceof Error ? error.message : error,
    )
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 },
    )
  }
}

// Delete product
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const session = await getServerSession(authOptions)

    const user = session?.user as { id?: string; role?: string } | undefined
    const role = user?.role ?? ''
    const accessToken =
      (session as { accessToken?: string } | null | undefined)?.accessToken ??
      ''

    if (!user?.id || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Super Admin access required' },
        { status: 403 },
      )
    }

    const { id } = params

    const response = await fetch(`${djangoApiUrl}/products/id/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${accessToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 },
        )
      }
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || 'Failed to delete product',
        },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error: unknown) {
    console.error(
      'Error deleting product:',
      error instanceof Error ? error.message : error,
    )
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 },
    )
  }
}
