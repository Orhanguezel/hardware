import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '@/lib/auth'
import { DJANGO_API_URL } from '@/lib/api'
import { withAuth } from '@/lib/auth-middleware'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Update user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authError = await withAuth(request, ['ADMIN', 'SUPER_ADMIN'])
  if (authError) return authError

  try {
    // Get the access token from the session
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token?.accessToken) {
      return NextResponse.json(
        { success: false, error: 'No access token found' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { role, status, emailVerified } = body

    // Validate role
    if (role && !['MEMBER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Valid role is required' },
        { status: 400 }
      )
    }

    // Validate status
    if (status && !['ACTIVE', 'INACTIVE', 'BANNED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid status is required' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (role) updateData.role = role
    if (status) updateData.status = status
    if (emailVerified !== undefined) {
      updateData.email_verified = emailVerified ? new Date().toISOString() : null
    }


    const response = await fetch(`${DJANGO_API_URL}/users/${id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Token ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to update user' },
        { status: response.status }
      )
    }

    const user = await response.json()

    return NextResponse.json({ 
      success: true, 
      data: {
        id: user.id?.toString() || '',
        name: user.name || user.first_name || user.username || 'İsimsiz',
        email: user.email || '',
        role: user.role || 'VISITOR',
        status: user.status || 'ACTIVE',
        emailVerified: Boolean(user.email_verified),
        createdAt: user.created_at || user.date_joined || new Date().toISOString(),
        updatedAt: user.updated_at || new Date().toISOString(),
        _count: {
          authoredArticles: user.authored_articles_count || 0,
          comments: user.comments_count || 0
        }
      }
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// Delete user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authError = await withAuth(request, ['ADMIN', 'SUPER_ADMIN'])
  if (authError) return authError

  try {
    // Get the access token from the session
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token?.accessToken) {
      return NextResponse.json(
        { success: false, error: 'No access token found' },
        { status: 401 }
      )
    }

    const { id } = await params

    const response = await fetch(`${DJANGO_API_URL}/users/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to delete user' },
        { status: response.status }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}