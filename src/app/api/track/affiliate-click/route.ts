import { NextRequest, NextResponse } from 'next/server'
import { DJANGO_API_URL } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, merchant } = body

    if (!product_id || !merchant) {
      return NextResponse.json(
        { success: false, error: 'Product ID and merchant are required' },
        { status: 400 }
      )
    }

    // Get client IP and user agent
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'
    
    const userAgent = request.headers.get('user-agent') || ''

    // Send to Django API
    const response = await fetch(`${DJANGO_API_URL}/outbound/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product: product_id,
        merchant: merchant,
        ip: ip,
        user_agent: userAgent
      })
    })

    if (!response.ok) {
      throw new Error(`Django API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error tracking affiliate click:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track affiliate click' },
      { status: 500 }
    )
  }
}
