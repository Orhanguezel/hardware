import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DJANGO_API_URL } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const article = searchParams.get('article')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('search')

    // Build query parameters for Django API
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.toString())
    
    if (status) queryParams.append('status', status)
    if (article) queryParams.append('article', article)
    if (search) queryParams.append('search', search)
    
    const ordering = sortOrder === 'desc' ? `-${sortBy}` : sortBy
    queryParams.append('ordering', ordering)

    const response = await fetch(`${DJANGO_API_URL}/comments/?${queryParams.toString()}`, {
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
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Transform frontend data to Django format
    const djangoData = {
      content: body.content,
      article: body.articleId, // articleId -> article
      parent: body.parent, // parent comment ID for replies
      author_name: body.authorName,
      author_email: body.authorEmail,
      ip_address: body.ipAddress || '127.0.0.1',
      status: 'PENDING' // Default status for new comments
    }
    
    console.log('Comment data being sent to Django:', JSON.stringify(djangoData, null, 2))
    
    const response = await fetch(`${DJANGO_API_URL}/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${(session as any).accessToken}`,
      },
      body: JSON.stringify(djangoData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log('Django API error response:', response.status, errorData)
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to create comment' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}