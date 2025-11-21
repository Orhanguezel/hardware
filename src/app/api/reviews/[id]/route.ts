import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DJANGO_API_URL } from '@/lib/api'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Get single review
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    const response = await fetch(`${DJANGO_API_URL}/reviews/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Review not found' },
          { status: 404 }
        )
      }
      throw new Error(`Django API error: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

// Update review
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has access token
    if (!(session as any).accessToken) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated. Please login again.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { rating, title, content, pros, cons } = body

    if (!rating || !content) {
      return NextResponse.json(
        { success: false, error: 'Rating and content are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const response = await fetch(`${DJANGO_API_URL}/reviews/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${session.accessToken}`,
      },
      body: JSON.stringify({
        rating: parseInt(rating),
        title,
        content,
        pros: pros || [],
        cons: cons || [],
        status: 'PENDING' // Reset to PENDING when updating
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Handle review not found error
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Review not found' },
          { status: 404 }
        )
      }
      
      // Handle permission error
      if (response.status === 403) {
        return NextResponse.json(
          { success: false, error: 'You can only update your own reviews' },
          { status: 403 }
        )
      }
      
      throw new Error(`Django API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// Delete review
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has access token
    if (!(session as any).accessToken) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated. Please login again.' },
        { status: 401 }
      )
    }

    const response = await fetch(`${DJANGO_API_URL}/reviews/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Review not found' },
          { status: 404 }
        )
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          { success: false, error: 'You can only delete your own reviews' },
          { status: 403 }
        )
      }
      
      throw new Error(`Django API error: ${response.status}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
