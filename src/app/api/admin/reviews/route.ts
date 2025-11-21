import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'

// Get all user reviews (product reviews) only
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
    const rating = searchParams.get('rating')

    // Build Django API URL with filters
    const djangoParams = new URLSearchParams()
    if (search) djangoParams.append('search', search)
    if (status) djangoParams.append('status', status)
    if (rating) djangoParams.append('rating', rating)
    djangoParams.append('ordering', '-created_at')
    djangoParams.append('admin', 'true') // Admin flag to show all reviews

    // Fetch user reviews only
    const reviewsResponse = await fetch(`${DJANGO_API_URL}/reviews/?${djangoParams.toString()}`, {
      cache: 'no-store',
      headers: {
        'Authorization': `Token ${(session as any).accessToken || ''}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (!reviewsResponse.ok) {
      const errorText = await reviewsResponse.text()
      console.error('Django API error response:', errorText)
      throw new Error(`Django API error: ${reviewsResponse.status} - ${errorText}`)
    }

    const reviewsData = await reviewsResponse.json()
    const reviews = reviewsData.results || reviewsData
    
    // Transform reviews to match our interface
    const transformedReviews = reviews.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      pros: review.pros || [],
      cons: review.cons || [],
      status: review.status,
      isVerified: review.is_verified,
      isHelpful: review.is_helpful,
      createdAt: review.created_at,
      product: {
        id: review.product?.id,
        brand: review.product?.brand,
        model: review.product?.model,
        slug: review.product?.slug
      },
      user: {
        id: review.user?.id,
        firstName: review.user?.first_name,
        lastName: review.user?.last_name,
        username: review.user?.username,
        email: review.user?.email,
        avatar: review.user?.avatar
      }
    }))

    return NextResponse.json({
      success: true,
      data: transformedReviews
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}