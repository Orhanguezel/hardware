import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { linkIds } = await request.json()

    if (!linkIds || !Array.isArray(linkIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid link IDs provided' },
        { status: 400 }
      )
    }

    const results = []

    for (const linkId of linkIds) {
      try {
        const affiliateLink = await db.affiliateLink.findUnique({
          where: { id: linkId },
          include: {
            product: {
              select: {
                brand: true,
                model: true
              }
            }
          }
        })

        if (!affiliateLink) {
          results.push({
            linkId,
            status: 'not_found',
            message: 'Link not found'
          })
          continue
        }

        // Simulate link validation (in real app, make HTTP request)
        const isValid = Math.random() > 0.1 // 90% success rate for demo

        if (!isValid) {
          results.push({
            linkId,
            status: 'broken',
            message: 'Link is broken or unreachable',
            url: affiliateLink.urlTemplate,
            product: `${affiliateLink.product.brand} ${affiliateLink.product.model}`,
            merchant: affiliateLink.merchant
          })
        } else {
          results.push({
            linkId,
            status: 'valid',
            message: 'Link is working correctly',
            url: affiliateLink.urlTemplate,
            product: `${affiliateLink.product.brand} ${affiliateLink.product.model}`,
            merchant: affiliateLink.merchant
          })
        }

        // Update link status in database
        await db.affiliateLink.update({
          where: { id: linkId },
          data: {
            active: isValid
          }
        })

      } catch (error) {
        results.push({
          linkId,
          status: 'error',
          message: 'Error validating link'
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      summary: {
        total: results.length,
        valid: results.filter(r => r.status === 'valid').length,
        broken: results.filter(r => r.status === 'broken').length,
        errors: results.filter(r => r.status === 'error').length
      }
    })
  } catch (error) {
    console.error('Error validating links:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate links' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const merchant = searchParams.get('merchant')
    const status = searchParams.get('status')

    const where: any = {}
    if (merchant) where.merchant = merchant
    if (status === 'active') where.active = true
    if (status === 'inactive') where.active = false

    const links = await db.affiliateLink.findMany({
      where,
      include: {
        product: {
          select: {
            brand: true,
            model: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: links
    })
  } catch (error) {
    console.error('Error fetching affiliate links:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch affiliate links' },
      { status: 500 }
    )
  }
}
