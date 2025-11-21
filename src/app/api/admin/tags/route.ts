import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'

// Get all tags
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Super Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    // Build Django API URL with filters
    const djangoParams = new URLSearchParams()
    if (type) djangoParams.append('type', type)
    if (search) djangoParams.append('search', search)
    djangoParams.append('ordering', 'name')

    const url = `${DJANGO_API_URL}/tags/?${djangoParams.toString()}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${(session as any).accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Django API error response:', errorText)
      throw new Error(`Django API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const tags = data.results || data

    // Transform tags to match expected format
    const transformedTags = tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      type: tag.type,
      _count: {
        articleTags: tag.article_count || 0,
        productTags: tag.product_count || 0
      }
    }))

    return NextResponse.json({
      success: true,
      data: transformedTags
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

// Create new tag
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Super Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, slug, type } = body

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${DJANGO_API_URL}/tags/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${(session as any).accessToken}`,
      },
      body: JSON.stringify({
        name,
        slug,
        type: type || 'GENERAL'
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to create tag' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        _count: {
          articleTags: 0,
          productTags: 0
        }
      }
    })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}