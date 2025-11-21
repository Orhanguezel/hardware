import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const status = searchParams.get('status') || ''

    console.log('=== NEXT.JS API REVIEWS DEBUG ===')
    console.log('ID from params:', id)
    console.log('Page:', page, 'Limit:', limit, 'Status:', status)

    // Check if id is a number or slug
    const isNumeric = /^\d+$/.test(id)
    console.log('Is numeric ID:', isNumeric)
    
    let apiUrl: string
    if (isNumeric) {
      // If it's a number, treat it as ID
      apiUrl = `${DJANGO_API_URL}/products/${id}/reviews/?page=${page}&limit=${limit}`
    } else {
      // If it's not a number, treat it as slug
      apiUrl = `${DJANGO_API_URL}/products/slug/${id}/reviews/?page=${page}&limit=${limit}`
    }

    if (status) {
      apiUrl += `&status=${status}`
    }

    console.log('Django API URL:', apiUrl)

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
        { success: false, error: 'Failed to fetch reviews' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Django API success response:', data)
    return NextResponse.json({
      success: true,
      data: data.results || data,
      count: data.count || 0
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Check if id is a number or slug
    const isNumeric = /^\d+$/.test(id)
    
    let apiUrl: string
    if (isNumeric) {
      // If it's a number, treat it as ID
      apiUrl = `${DJANGO_API_URL}/products/${id}/reviews/`
    } else {
      // If it's not a number, treat it as slug
      apiUrl = `${DJANGO_API_URL}/products/slug/${id}/reviews/`
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${(session as any).accessToken || ''}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Django error response:', errorData)
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to create review' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
