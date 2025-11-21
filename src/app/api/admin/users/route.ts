import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '@/lib/auth'
import { DJANGO_API_URL } from '@/lib/api'
import { withAuth } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build Django API URL with query parameters
    const djangoParams = new URLSearchParams()
    if (role) djangoParams.append('role', role)
    if (status) djangoParams.append('status', status)
    if (search) djangoParams.append('search', search)
    djangoParams.append('ordering', '-created_at')

    const url = `${DJANGO_API_URL}/users/?${djangoParams.toString()}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Django API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform Django response to match expected format
    const users = (Array.isArray(data) ? data : (data.results || [])).map((user: any) => {
      return {
        id: user.id?.toString() || '',
        name: user.name || user.first_name || user.username || 'İsimsiz',
        email: user.email || '',
        avatar: user.avatar || null,
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

    return NextResponse.json({
      success: true,
      data: users,
      meta: {
        page: 1,
        limit: users.length,
        total: data.count || users.length,
        totalPages: Math.ceil((data.count || users.length) / users.length)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, email, password, role = 'MEMBER' } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    // Prepare user data for Django
    const userData = {
      username: email, // Django uses username field
      email: email,
      password: password,
      first_name: name.split(' ')[0] || '',
      last_name: name.split(' ').slice(1).join(' ') || '',
      role: role,
      status: 'ACTIVE'
    }

    const response = await fetch(`${DJANGO_API_URL}/users/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to create user' },
        { status: response.status }
      )
    }

    const user = await response.json()

    return NextResponse.json({
      success: true,
      data: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      },
      message: 'User created successfully'
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
