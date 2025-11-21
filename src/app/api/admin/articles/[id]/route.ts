import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DJANGO_API_URL } from '@/lib/api'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Get single article
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin, Super Admin, or Editor access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    console.log('Fetching article with ID:', id)
    console.log('Django API URL:', `${DJANGO_API_URL}/articles/id/${id}/`)

    const response = await fetch(`${DJANGO_API_URL}/articles/id/${id}/`, {
      headers: {
        'Authorization': `Token ${(session as any).accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Django API error response:', response.status, errorData)
      
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Article not found' },
          { status: 404 }
        )
      }
      throw new Error(`Django API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Article data received:', data)
    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

// Update article
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin, Super Admin, or Editor access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const contentType = request.headers.get('content-type')
    
    let response: Response
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData for file uploads
      const formData = await request.formData()
      console.log('API Route - Received FormData:', Object.fromEntries(formData.entries()))
      
      // Create FormData for Django
      const djangoFormData = new FormData()
      
      // Add all form fields
      const fields = ['title', 'subtitle', 'excerpt', 'content', 'type', 'category_id', 'status', 'meta_title', 'meta_description']
      fields.forEach(field => {
        const value = formData.get(field)
        if (value) {
          djangoFormData.append(field, value as string)
        }
      })
      
      // Generate slug from title
      const title = formData.get('title') as string
      if (title) {
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
          .trim()
        djangoFormData.append('slug', slug)
      }
      
      // Add tags
      const tags = formData.getAll('tags')
      console.log('Tags from FormData:', tags)
      // Always send tags field - empty string means remove all tags
      const tagsString = tags.length > 0 ? tags.join(',') : ''
      djangoFormData.append('tags', tagsString)
      
      // Add hero image file or URL or handle removal
      const heroImageFile = formData.get('hero_image_file') as File
      const heroImageUrl = formData.get('hero_image') as string
      
      if (heroImageFile && heroImageFile.size > 0) {
        // New file uploaded
        djangoFormData.append('hero_image_file', heroImageFile)
      } else if (heroImageUrl !== null) {
        // URL provided (for external images) or empty string (for removal)
        djangoFormData.append('hero_image', heroImageUrl)
      }
      // If heroImageUrl is null, don't send hero_image field (keep existing)
      
      response = await fetch(`${DJANGO_API_URL}/articles/id/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${(session as any).accessToken}`,
        },
        body: djangoFormData,
      })
    } else {
      // Handle JSON data
      const body = await request.json()
      
      response = await fetch(`${DJANGO_API_URL}/articles/id/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${(session as any).accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Django API error response:', response.status, errorData)
      return NextResponse.json(
        { success: false, error: errorData.error || errorData.detail || 'Failed to update article' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

// Update article status only
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin, Super Admin, or Editor access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid status is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${DJANGO_API_URL}/articles/id/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${(session as any).accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to update article status' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('Error updating article status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update article status' },
      { status: 500 }
    )
  }
}

// Delete article
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin, Super Admin, or Editor access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    const response = await fetch(`${DJANGO_API_URL}/articles/id/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${(session as any).accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Article not found' },
          { status: 404 }
        )
      }
      throw new Error(`Django API error: ${response.status}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}