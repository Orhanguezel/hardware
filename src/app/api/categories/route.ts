import { NextRequest, NextResponse } from 'next/server'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const url = queryString ? `${DJANGO_API_URL}/categories/?${queryString}` : `${DJANGO_API_URL}/categories/`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Django API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data.results || data
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get session for authentication
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)
    
    console.log('=== CATEGORY CREATE DEBUG ===')
    console.log('Session exists:', !!session)
    console.log('Access token exists:', !!session?.accessToken)
    console.log('Session data:', session ? { user: session.user?.email, role: session.user?.role } : 'No session')
    
    if (!session?.accessToken) {
      console.log('ERROR: No access token found')
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No access token' },
        { status: 401 }
      )
    }
    
    console.log('Sending request to Django API:')
    console.log('URL:', `${DJANGO_API_URL}/categories/`)
    console.log('Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Token ${session.accessToken}`,
    })
    console.log('Body:', body)
    
    const response = await fetch(`${DJANGO_API_URL}/categories/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    })
    
    console.log('Django API response status:', response.status)
    console.log('Django API response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log('Django API error response:', errorData)
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to create category' },
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
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
