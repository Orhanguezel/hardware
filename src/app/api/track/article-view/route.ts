import { NextRequest, NextResponse } from 'next/server'
import { DJANGO_API_URL } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { article_id } = body

    if (!article_id) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 }
      )
    }

    // Get client IP and user agent
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'
    
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''

    // Send to Django API
    const response = await fetch(`${DJANGO_API_URL}/article-view/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        article: article_id,
        ip_address: ip,
        user_agent: userAgent,
        referer: referer
      })
    })

    if (!response.ok) {
      throw new Error(`Django API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error tracking article view:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track article view' },
      { status: 500 }
    )
  }
}
