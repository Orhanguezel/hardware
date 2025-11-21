import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'

// Get all article comments only
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
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    // Build Django API URL with filters
    const djangoParams = new URLSearchParams()
    if (search) djangoParams.append('search', search)
    if (status) djangoParams.append('status', status)
    djangoParams.append('ordering', '-created_at')
    djangoParams.append('admin', 'true') // Admin flag to show all comments

    // Fetch article comments only
    const commentsResponse = await fetch(`${DJANGO_API_URL}/comments/?${djangoParams.toString()}`, {
      cache: 'no-store',
      headers: {
        'Authorization': `Token ${(session as any).accessToken || ''}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (!commentsResponse.ok) {
      const errorText = await commentsResponse.text()
      console.error('Django API error response:', errorText)
      throw new Error(`Django API error: ${commentsResponse.status} - ${errorText}`)
    }

    const commentsData = await commentsResponse.json()
    const comments = commentsData.results || commentsData
    
    // Transform comments to match our interface
    const transformedComments = comments.map((comment: any) => {
      // Debug logging for each comment
      console.log('Raw comment data:', {
        id: comment.id,
        article: comment.article,
        article_detail: comment.article_detail,
        article_title: comment.article_title
      })
      
      // Use article_detail if available, otherwise fall back to article
      const articleData = comment.article_detail || comment.article
      
      return {
        id: comment.id,
        content: comment.content,
        status: comment.status,
        createdAt: comment.created_at,
        authorName: comment.author_name || 'Anonim',
        authorEmail: comment.author_email,
        ipAddress: comment.ip_address,
        article: {
          id: articleData?.id,
          title: comment.article_title || articleData?.title || 'Bilinmeyen Makale',
          slug: articleData?.slug || null,
          type: articleData?.type || 'REVIEW'
        },
        user: comment.user ? {
          id: comment.user.id,
          firstName: comment.user.first_name || '',
          lastName: comment.user.last_name || '',
          username: comment.user.username,
          email: comment.user.email,
          avatar: comment.user.avatar
        } : null
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedComments
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}