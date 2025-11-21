import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DJANGO_API_URL } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const response = await fetch(`${DJANGO_API_URL}/users/${session.user.id}/settings/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${session.accessToken || ''}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
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
    console.error('Error fetching user settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const bio = formData.get('bio') as string
    const avatar = formData.get('avatar') as File
    const email_notifications = formData.get('email_notifications') === 'true'
    const push_notifications = formData.get('push_notifications') === 'true'
    const marketing_emails = formData.get('marketing_emails') === 'true'
    const profile_visible = formData.get('profile_visible') === 'true'
    const email_visible = formData.get('email_visible') === 'true'
    const remove_avatar = formData.get('remove_avatar') === 'true'
    const theme = formData.get('theme') as string
    const language = formData.get('language') as string

    // Django'ya FormData gönder
    const djangoFormData = new FormData()
    djangoFormData.append('name', name)
    djangoFormData.append('email', email)
    djangoFormData.append('bio', bio)
    if (avatar && avatar.size > 0) {
      djangoFormData.append('avatar', avatar)
    }
    if (remove_avatar) {
      djangoFormData.append('remove_avatar', 'true')
    }
    djangoFormData.append('email_notifications', String(email_notifications))
    djangoFormData.append('push_notifications', String(push_notifications))
    djangoFormData.append('marketing_emails', String(marketing_emails))
    djangoFormData.append('profile_visible', String(profile_visible))
    djangoFormData.append('email_visible', String(email_visible))
    djangoFormData.append('theme', theme)
    djangoFormData.append('language', language)

    const response = await fetch(`${DJANGO_API_URL}/users/${session.user.id}/settings/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Token ${session.accessToken || ''}`,
      },
      body: djangoFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to update user settings' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user settings' },
      { status: 500 }
    )
  }
}