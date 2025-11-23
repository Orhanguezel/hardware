// src/app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DJANGO_API_URL } from '@/lib/api'

// Env’den gelen base URL (sonundaki / işaretlerini temizleyelim)
const djangoApiUrl = DJANGO_API_URL.replace(/\/+$/, '')

type Role = 'ADMIN' | 'SUPER_ADMIN' | (string & {})

type AdminUser = {
  id?: string
  role?: Role
}

type AdminSession = {
  user?: AdminUser
  accessToken?: string
}

function isAdminSession(session: unknown): session is AdminSession {
  if (!session || typeof session !== 'object') return false
  const s = session as AdminSession
  const role = s.user?.role
  return Boolean(s.user?.id && (role === 'ADMIN' || role === 'SUPER_ADMIN'))
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!isAdminSession(session)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Super Admin access required' },
        { status: 403 },
      )
    }

    const accessToken = session.accessToken ?? ''

    const response = await fetch(`${djangoApiUrl}/settings/bulk/`, {
      headers: {
        Authorization: `Token ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Settings API response not OK:', response.status)

      // Eğer backend "settings yok" diye 404 dönüyorsa, boş obje döndür
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          data: {},
        })
      }

      throw new Error('Failed to fetch settings')
    }

    const data = (await response.json()) as { data?: unknown }

    return NextResponse.json({
      success: true,
      data: data.data ?? {},
    })
  } catch (error) {
    console.error(
      'Error fetching settings:',
      error instanceof Error ? error.message : error,
    )
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!isAdminSession(session)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Super Admin access required' },
        { status: 403 },
      )
    }

    const accessToken = session.accessToken ?? ''

    console.log('=== NEXT.JS API ROUTE DEBUG ===')
    console.log('Request method:', request.method)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))

    const formData = await request.formData()
    console.log('FormData keys:', Array.from(formData.keys()))

    const djangoFormData = new FormData()

    // JSON settings
    const settingsJson = formData.get('settings')
    console.log('Settings JSON:', settingsJson)

    if (typeof settingsJson === 'string') {
      djangoFormData.append('settings', settingsJson)
    }

    // Dosyalar
    const logoFile = formData.get('logo_file')
    if (logoFile instanceof File) {
      console.log('Logo file:', logoFile.name, logoFile.size)
      djangoFormData.append('logo_file', logoFile)
    }

    const faviconFile = formData.get('favicon_file')
    if (faviconFile instanceof File) {
      console.log('Favicon file:', faviconFile.name, faviconFile.size)
      djangoFormData.append('favicon_file', faviconFile)
    }

    console.log('Django FormData keys:', Array.from(djangoFormData.keys()))

    const response = await fetch(`${djangoApiUrl}/settings/bulk/`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${accessToken}`,
        // FormData gönderdiğimiz için Content-Type’ı fetch kendisi ayarlayacak
      },
      body: djangoFormData,
    })

    if (!response.ok) {
      console.error('Settings update API response not OK:', response.status)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error('Failed to update settings')
    }

    const data = (await response.json()) as { data?: unknown }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: data.data ?? {},
    })
  } catch (error) {
    console.error(
      'Error updating settings:',
      error instanceof Error ? error.message : error,
    )
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 },
    )
  }
}
