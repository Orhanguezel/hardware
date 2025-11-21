import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, merchant, articleId, userId } = body

    // Get client IP and user agent
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Log the outbound click
    const outboundClick = await db.outboundClick.create({
      data: {
        productId: productId || null,
        merchant,
        articleId: articleId || null,
        userId: userId || null,
        ip,
        userAgent
      }
    })

    // Get affiliate link for redirect
    const affiliateLink = await db.affiliateLink.findFirst({
      where: {
        productId: productId || undefined,
        merchant,
        active: true
      }
    })

    if (affiliateLink) {
      // In a real implementation, you would redirect to the affiliate URL
      // For now, we'll return the URL
      return NextResponse.json({
        success: true,
        redirectUrl: affiliateLink.urlTemplate,
        clickId: outboundClick.id
      })
    }

    return NextResponse.json({
      success: false,
      error: 'No affiliate link found'
    })
  } catch (error) {
    console.error('Error tracking outbound click:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track click' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const merchant = searchParams.get('merchant')

    const affiliateLinks = await db.affiliateLink.findMany({
      where: {
        ...(productId && { productId }),
        ...(merchant && { merchant }),
        active: true
      },
      include: {
        product: {
          select: {
            id: true,
            brand: true,
            model: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: affiliateLinks
    })
  } catch (error) {
    console.error('Error fetching affiliate links:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch affiliate links' },
      { status: 500 }
    )
  }
}
