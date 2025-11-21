import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DJANGO_API_URL } from '@/lib/api'

// made by byiyuel

// GET /api/favorites/check?productId=xxx - Belirli bir ürünün favori olup olmadığını kontrol et
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
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

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${DJANGO_API_URL}/users/${session.user.id}/favorites/?product=${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${(session as any).accessToken || ''}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Django API error: ${response.status}`)
    }

    const data = await response.json()
    const isFavorite = data && data.length > 0

    return NextResponse.json({
      success: true,
      isFavorite: isFavorite
    })
  } catch (error) {
    console.error('Error checking favorite status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check favorite status'
      },
      { status: 500 }
    )
  }
}
