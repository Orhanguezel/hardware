import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DJANGO_API_URL } from '@/lib/api'

// GET /api/favorites - Kullanıcının favorilerini getir
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
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'

    const response = await fetch(`${DJANGO_API_URL}/users/${session.user.id}/favorites/?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${session.accessToken || ''}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Django API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Favorites API Response:', data)
    return NextResponse.json({
      success: true,
      data: data || [],
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: data.length || 0,
        totalPages: Math.ceil((data.length || 0) / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch favorites'
      },
      { status: 500 }
    )
  }
}

// POST /api/favorites - Favori ekle/çıkar
export async function POST(request: NextRequest) {
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

    const { productId, action } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (action === 'add') {
      // Favori ekle
      const response = await fetch(`${DJANGO_API_URL}/favorites/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${session.accessToken || ''}`,
        },
        body: JSON.stringify({
          product_id: productId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 400 && errorData.error?.includes('already')) {
          return NextResponse.json({
            success: true,
            message: 'Product already in favorites',
            isFavorite: true
          })
        }
        if (response.status === 500 && errorData.detail?.includes('duplicate key')) {
          return NextResponse.json({
            success: true,
            message: 'Product already in favorites',
            isFavorite: true
          })
        }
        throw new Error(`Django API error: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json({
        success: true,
        message: 'Product added to favorites',
        isFavorite: true
      })
    } else if (action === 'remove') {
      // Favoriden çıkar - önce favoriyi bul
      console.log('Removing favorite for product:', productId)
      const favoritesResponse = await fetch(`${DJANGO_API_URL}/users/${session.user.id}/favorites/?product=${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${session.accessToken || ''}`,
        },
      })

      console.log('Favorites response status:', favoritesResponse.status)
      
      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json()
        console.log('Favorites data:', favoritesData)
        const favorite = favoritesData.find((fav: any) => fav.product.id == productId)
        console.log('Found favorite:', favorite)
        
        if (favorite) {
          console.log('Deleting favorite with ID:', favorite.id)
          const deleteResponse = await fetch(`${DJANGO_API_URL}/favorites/${favorite.id}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Token ${session.accessToken || ''}`,
            },
          })

          console.log('Delete response status:', deleteResponse.status)
          if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json().catch(() => ({}))
            console.log('Delete error:', errorData)
            throw new Error(`Django API error: ${deleteResponse.status}`)
          }
        } else {
          console.log('No favorite found to delete')
        }
      } else {
        const errorData = await favoritesResponse.json().catch(() => ({}))
        console.log('Favorites fetch error:', errorData)
        throw new Error(`Django API error: ${favoritesResponse.status}`)
      }
      
      return NextResponse.json({
        success: true,
        message: 'Product removed from favorites',
        isFavorite: false
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "add" or "remove"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error managing favorites:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to manage favorites'
      },
      { status: 500 }
    )
  }
}
