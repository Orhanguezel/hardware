// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { DJANGO_API_URL } from '@/lib/api'

const djangoApiUrl = DJANGO_API_URL.replace(/\/+$/, '')

interface ExtendedSessionUser {
  email?: string | null
  role?: string | null
}

interface ExtendedSession {
  user?: ExtendedSessionUser | null
  accessToken?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const url = queryString
      ? `${djangoApiUrl}/categories/?${queryString}`
      : `${djangoApiUrl}/categories/`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Django API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: (data as { results?: unknown }).results ?? data,
    })
  } catch (error: unknown) {
    console.error(
      'Error fetching categories:',
      error instanceof Error ? error.message : error,
    )
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Dinamik import (edge sorunları yaşamamak için aynı şekilde bırakıyoruz)
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')

    const session = (await getServerSession(authOptions)) as ExtendedSession | null
    const accessToken = session?.accessToken

    console.log('=== CATEGORY CREATE DEBUG ===')
    console.log('Session exists:', session != null)
    console.log('Access token exists:', !!accessToken)
    console.log(
      'Session data:',
      session
        ? {
            user: session.user?.email ?? null,
            role: session.user?.role ?? null,
          }
        : 'No session',
    )

    if (!accessToken) {
      console.log('ERROR: No access token found')
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No access token' },
        { status: 401 },
      )
    }

    const url = `${djangoApiUrl}/categories/`
    console.log('Sending request to Django API:')
    console.log('URL:', url)
    console.log('Headers:', {
      'Content-Type': 'application/json',
      Authorization: `Token ${accessToken}`,
    })
    console.log('Body:', body)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${accessToken}`,
      },
      body: JSON.stringify(body),
    })

    console.log('Django API response status:', response.status)
    console.log(
      'Django API response headers:',
      Object.fromEntries(response.headers.entries()),
    )

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: string
        [key: string]: unknown
      }
      console.log('Django API error response:', errorData)
      return NextResponse.json(
        {
          success: false,
          error: errorData.error ?? 'Failed to create category',
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log('Django API success response:', data)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: unknown) {
    console.error(
      'Error creating category:',
      error instanceof Error ? error.message : error,
    )
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 },
    )
  }
}
