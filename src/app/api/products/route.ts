import { NextRequest, NextResponse } from 'next/server'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const url = queryString ? `${DJANGO_API_URL}/products/?${queryString}` : `${DJANGO_API_URL}/products/`

    console.log('Fetching products from Django API:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Django API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Django API error response:', errorText)
      throw new Error(`Django API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Django API response data:', data)
    
    // Wrap Django response in success object for consistency
    return NextResponse.json({
      success: true,
      data: data.results || data
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${DJANGO_API_URL}/products/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to create product' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
