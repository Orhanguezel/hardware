import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DJANGO_API_URL } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin, Super Admin, or Editor access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build query parameters for Django API
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.toString())

    if (search) {
      queryParams.append('search', search)
    }
    if (status && status !== 'all') {
      queryParams.append('status', status.toUpperCase())
    }
    if (type && type !== 'all') {
      queryParams.append('type', type.toUpperCase())
    }
    if (sortBy) {
      const ordering = sortOrder === 'desc' ? `-${sortBy}` : sortBy
      queryParams.append('ordering', ordering)
    }

    // Get articles from Django API
    const response = await fetch(`${DJANGO_API_URL}/articles/?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Token ${(session as unknown as { accessToken: string }).accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Django API error: ${response.status}`)
    }

    const data = await response.json()
    const articles = data.results || []
    const total = data.count || 0

    return NextResponse.json({
      success: true,
      data: {
        articles,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin, Super Admin, or Editor access required' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const response = await fetch(`${DJANGO_API_URL}/articles/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${(session as unknown as { accessToken: string }).accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to create article' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    )
  }
}