import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'

interface RouteParams {
  params: Promise<{
    id: string
    specId: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id, specId } = await params

    // Check if id is a number or slug
    const isNumeric = /^\d+$/.test(id)

    let apiUrl: string
    if (isNumeric) {
      // If it's a number, treat it as ID
      apiUrl = `${DJANGO_API_URL}/products/${id}/specs/${specId}/`
    } else {
      // If it's not a number, treat it as slug
      apiUrl = `${DJANGO_API_URL}/products/slug/${id}/specs/${specId}/`
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Django API error response:', errorText)
      return NextResponse.json(
        { success: false, error: 'Spec not found' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error fetching spec:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch spec' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Editor access required' },
        { status: 403 }
      )
    }

    const { id, specId } = await params
    const body = await request.json()

    // Check if id is a number or slug
    const isNumeric = /^\d+$/.test(id)

    let apiUrl: string
    if (isNumeric) {
      // If it's a number, treat it as ID
      apiUrl = `${DJANGO_API_URL}/products/${id}/specs/${specId}/`
    } else {
      // If it's not a number, treat it as slug
      apiUrl = `${DJANGO_API_URL}/products/slug/${id}/specs/${specId}/`
    }

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${(session as unknown as { accessToken: string }).accessToken || ''}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Django error response:', errorData)
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to update spec' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error updating spec:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update spec' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Editor access required' },
        { status: 403 }
      )
    }

    const { id, specId } = await params

    // Check if id is a number or slug
    const isNumeric = /^\d+$/.test(id)

    let apiUrl: string
    if (isNumeric) {
      // If it's a number, treat it as ID
      apiUrl = `${DJANGO_API_URL}/products/${id}/specs/${specId}/`
    } else {
      // If it's not a number, treat it as slug
      apiUrl = `${DJANGO_API_URL}/products/slug/${id}/specs/${specId}/`
    }

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${(session as unknown as { accessToken: string }).accessToken || ''}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Django error response:', errorData)
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to delete spec' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Spec deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting spec:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete spec' },
      { status: 500 }
    )
  }
}
