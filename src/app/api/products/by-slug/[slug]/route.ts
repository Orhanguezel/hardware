import { NextRequest, NextResponse } from 'next/server'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'

interface RouteParams {
  params: Promise<{
    slug: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    
    console.log('=== PRODUCT BY SLUG API DEBUG ===')
    console.log('Slug from params:', slug)
    console.log('Django API URL:', DJANGO_API_URL)
    
    // Check if slug is a number (ID) or string (slug)
    const isNumeric = /^\d+$/.test(slug)
    console.log('Is numeric slug:', isNumeric)
    
    let apiUrl: string
    if (isNumeric) {
      // If it's a number, treat it as ID
      apiUrl = `${DJANGO_API_URL}/products/id/${slug}/`
    } else {
      // If it's not a number, treat it as slug
      apiUrl = `${DJANGO_API_URL}/products/${slug}/`
    }
    
    console.log('Final API URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Django response status:', response.status)
    console.log('Django response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Django API error response:', errorText)
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Django API success response:', data)
    
    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
