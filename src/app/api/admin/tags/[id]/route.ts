import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'

// Update tag
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = await params
    const response = await fetch(`${DJANGO_API_URL}/tags/id/${id}/`, {
      method: 'PUT',
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
        { success: false, error: errorData.error || 'Failed to update tag' },
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
    console.error('Error updating tag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update tag' },
      { status: 500 }
    )
  }
}

// Delete tag
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Super Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const response = await fetch(`${DJANGO_API_URL}/tags/id/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${(session as any).accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to delete tag' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete tag' },
      { status: 500 }
    )
  }
}